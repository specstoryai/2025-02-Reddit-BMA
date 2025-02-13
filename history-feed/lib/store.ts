import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ExtractedContent } from './content-extractor';
import { HistoryEntry } from './types';

interface FeedState {
  history: HistoryEntry[];
  selectedEntryUrls: string[];  // Store URLs as array instead of Set
  cachedContent: Record<string, ExtractedContent>;
  lastSync: number;
  interests: string[];
  searchQuery: string;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'visits' | 'relevance';
  domainFilter: string[];
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  exaResults: ExaResult[] | null;
  feedPreferences: {
    refreshInterval: number;
    contentTypes: string[];
    maxItems: number;
  };
}

interface ExaResult {
  score: number;
  title: string;
  id: string;
  url: string;
  publishedDate?: string;
  author?: string | null;
}

interface FeedActions {
  setHistory: (history: HistoryEntry[]) => void;
  appendHistory: (history: HistoryEntry[]) => void;
  toggleEntrySelection: (url: string) => void;
  selectAllVisible: () => void;
  clearSelection: () => void;
  addCachedContent: (content: ExtractedContent) => void;
  updateLastSync: () => void;
  setInterests: (interests: string[]) => void;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: FeedState['dateFilter']) => void;
  setSortBy: (sort: FeedState['sortBy']) => void;
  setDomainFilter: (domains: string[]) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateFeedPreferences: (preferences: Partial<FeedState['feedPreferences']>) => void;
  getFilteredHistory: () => HistoryEntry[];
  getSelectedEntries: () => HistoryEntry[];
  isSelected: (url: string) => boolean;
  getDomainStats: () => Array<{ domain: string; count: number; lastVisit: number }>;
  resetPagination: () => void;
  setExaResults: (results: ExaResult[] | null) => void;
  resetStore: () => void;
}

function getDomainFromUrl(url: string): string {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export const useFeedStore = create<FeedState & FeedActions>()(
  persist(
    (set, get) => {
      const initialState: FeedState = {
        history: [],
        selectedEntryUrls: [],
        cachedContent: {},
        lastSync: 0,
        interests: [],
        searchQuery: '',
        dateFilter: 'week',
        sortBy: 'date',
        domainFilter: [],
        currentPage: 1,
        hasMore: true,
        isLoading: false,
        exaResults: null,
        feedPreferences: {
          refreshInterval: 3600,
          contentTypes: ['article', 'blog'],
          maxItems: 50
        }
      };

      return {
        ...initialState,

        // Actions
        resetStore: () => set(initialState),
        setHistory: (history) => set({ history }),
        appendHistory: (newHistory) => 
          set((state) => ({
            history: [...state.history, ...newHistory]
          })),
        toggleEntrySelection: (url) =>
          set((state) => {
            const index = state.selectedEntryUrls.indexOf(url);
            if (index === -1) {
              return { selectedEntryUrls: [...state.selectedEntryUrls, url] };
            }
            const newUrls = [...state.selectedEntryUrls];
            newUrls.splice(index, 1);
            return { selectedEntryUrls: newUrls };
          }),
        selectAllVisible: () =>
          set((state) => {
            const filtered = state.getFilteredHistory();
            return { selectedEntryUrls: filtered.map(entry => entry.url) };
          }),
        clearSelection: () =>
          set({ selectedEntryUrls: [] }),
        addCachedContent: (content) => 
          set((state) => ({
            cachedContent: {
              ...state.cachedContent,
              [content.url]: content
            }
          })),
        updateLastSync: () => set({ lastSync: Date.now() }),
        setInterests: (interests) => set({ interests }),
        setSearchQuery: (query) => set({ searchQuery: query }),
        setDateFilter: (filter) => set({ dateFilter: filter }),
        setSortBy: (sort) => set({ sortBy: sort }),
        setDomainFilter: (domains) => set({ domainFilter: domains }),
        setCurrentPage: (page) => set({ currentPage: page }),
        setHasMore: (hasMore) => set({ hasMore }),
        setIsLoading: (isLoading) => set({ isLoading }),
        updateFeedPreferences: (preferences) =>
          set((state) => ({
            feedPreferences: {
              ...state.feedPreferences,
              ...preferences
            }
          })),
        resetPagination: () => set({ currentPage: 1, hasMore: true }),
        setExaResults: (results) => set({ exaResults: results }),
        
        // Computed
        getFilteredHistory: () => {
          const state = get();
          let filtered = [...state.history];

          // Apply search filter
          if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(
              entry => 
                entry.title.toLowerCase().includes(query) ||
                entry.url.toLowerCase().includes(query)
            );
          }

          // Apply domain filter
          if (state.domainFilter.length > 0) {
            filtered = filtered.filter(entry => 
              state.domainFilter.includes(getDomainFromUrl(entry.url))
            );
          }

          // Apply date filter
          const now = Date.now();
          const DAY = 86400000; // 24 hours in milliseconds
          switch (state.dateFilter) {
            case 'today':
              filtered = filtered.filter(
                entry => (now - entry.lastVisitTime) < DAY
              );
              break;
            case 'week':
              filtered = filtered.filter(
                entry => (now - entry.lastVisitTime) < DAY * 7
              );
              break;
            case 'month':
              filtered = filtered.filter(
                entry => (now - entry.lastVisitTime) < DAY * 30
              );
              break;
          }

          // Apply sorting
          filtered.sort((a, b) => {
            switch (state.sortBy) {
              case 'date':
                return b.lastVisitTime - a.lastVisitTime;
              case 'visits':
                return b.visitCount - a.visitCount;
              default:
                return 0;
            }
          });

          return filtered;
        },

        getSelectedEntries: () => {
          const state = get();
          return state.history.filter(entry => state.selectedEntryUrls.includes(entry.url));
        },

        isSelected: (url: string) => {
          const state = get();
          return state.selectedEntryUrls.includes(url);
        },

        getDomainStats: () => {
          const state = get();
          const domainMap = new Map<string, { count: number; lastVisit: number }>();
          
          // Use filtered history instead of all history
          const filtered = state.getFilteredHistory();

          // Count each entry as one visit within the filtered time period
          filtered.forEach(entry => {
            const domain = getDomainFromUrl(entry.url);
            const current = domainMap.get(domain) || { count: 0, lastVisit: 0 };
            domainMap.set(domain, {
              // Count each entry as 1 visit instead of using entry.visitCount
              count: current.count + 1,
              lastVisit: Math.max(current.lastVisit, entry.lastVisitTime)
            });
          });

          return Array.from(domainMap.entries())
            .map(([domain, stats]) => ({
              domain,
              count: stats.count,
              lastVisit: stats.lastVisit
            }))
            .sort((a, b) => b.count - a.count);
        }
      };
    },
    {
      name: 'feed-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
); 