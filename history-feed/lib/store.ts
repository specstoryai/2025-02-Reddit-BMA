import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExtractedContent } from './content-extractor';
import { HistoryEntry } from './types';

interface FeedState {
  history: HistoryEntry[];
  cachedContent: Record<string, ExtractedContent>;
  lastSync: number;
  interests: string[];
  searchQuery: string;
  dateFilter: 'all' | 'today' | 'week' | 'month';
  sortBy: 'date' | 'visits';
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
  feedPreferences: {
    refreshInterval: number;
    contentTypes: string[];
    maxItems: number;
  };
}

interface FeedActions {
  setHistory: (history: HistoryEntry[]) => void;
  appendHistory: (history: HistoryEntry[]) => void;
  addCachedContent: (content: ExtractedContent) => void;
  updateLastSync: () => void;
  setInterests: (interests: string[]) => void;
  setSearchQuery: (query: string) => void;
  setDateFilter: (filter: FeedState['dateFilter']) => void;
  setSortBy: (sort: FeedState['sortBy']) => void;
  setCurrentPage: (page: number) => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  updateFeedPreferences: (preferences: Partial<FeedState['feedPreferences']>) => void;
  getFilteredHistory: () => HistoryEntry[];
  resetPagination: () => void;
}

export const useFeedStore = create<FeedState & FeedActions>()(
  persist(
    (set, get) => ({
      // Initial state
      history: [],
      cachedContent: {},
      lastSync: 0,
      interests: [],
      searchQuery: '',
      dateFilter: 'all',
      sortBy: 'date',
      currentPage: 1,
      hasMore: true,
      isLoading: false,
      feedPreferences: {
        refreshInterval: 3600,
        contentTypes: ['article', 'blog'],
        maxItems: 50
      },

      // Actions
      setHistory: (history) => set({ history }),
      appendHistory: (newHistory) => 
        set((state) => ({
          history: [...state.history, ...newHistory]
        })),
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
          if (state.sortBy === 'date') {
            return b.lastVisitTime - a.lastVisitTime;
          }
          return b.visitCount - a.visitCount;
        });

        return filtered;
      }
    }),
    {
      name: 'feed-storage'
    }
  )
); 