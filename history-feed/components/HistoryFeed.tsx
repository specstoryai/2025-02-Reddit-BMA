'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import { useFeedStore } from '@/lib/store';
import { HistoryEntry } from '@/lib/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type SortBy = 'date' | 'visits';

function SearchBar() {
  const { searchQuery, setSearchQuery, resetPagination } = useFeedStore();
  
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    resetPagination();
  };
  
  return (
    <input
      type="text"
      placeholder="Search history..."
      value={searchQuery}
      onChange={(e) => handleSearch(e.target.value)}
      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 
                 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  );
}

function DomainFilter() {
  const { getDomainStats, domainFilter, setDomainFilter, resetPagination, dateFilter } = useFeedStore();
  const [showAll, setShowAll] = useState(false);
  
  // Force recalculation when dateFilter changes
  const domains = useMemo(() => {
    const allDomains = getDomainStats();
    return showAll ? allDomains : allDomains.slice(0, 20);
  }, [getDomainStats, showAll]);

  const handleDomainToggle = useCallback((domain: string) => {
    const newFilter = domainFilter.includes(domain)
      ? domainFilter.filter(d => d !== domain)
      : [...domainFilter, domain];
    setDomainFilter(newFilter);
    resetPagination();
  }, [domainFilter, setDomainFilter, resetPagination]);

  if (domains.length === 0) {
    return null;
  }

  const timeframeLabel = {
    all: 'all time',
    today: 'today',
    week: 'this week',
    month: 'this month'
  }[dateFilter];

  const totalDomains = getDomainStats().length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Top domains ({timeframeLabel})
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {domains.reduce((sum, { count }) => sum + count, 0)} total visits
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {domains.map(({ domain, count, lastVisit }) => {
          const percentage = Math.round((count / domains[0].count) * 100);
          return (
            <button
              key={domain}
              onClick={() => handleDomainToggle(domain)}
              title={`Last visited ${formatRelativeTime(lastVisit)}`}
              className={`group relative px-3 py-1 rounded-full text-sm transition-all ${
                domainFilter.includes(domain)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <span className="relative z-10">{domain} ({count})</span>
              {!domainFilter.includes(domain) && (
                <div 
                  className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </button>
          );
        })}
      </div>
      {totalDomains > 20 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-sm text-blue-500 hover:underline mt-2"
        >
          {showAll ? 'Show less' : `Show ${totalDomains - 20} more domains`}
        </button>
      )}
    </div>
  );
}

function FilterControls() {
  const { dateFilter, setDateFilter, sortBy, setSortBy, resetPagination, setDomainFilter } = useFeedStore();
  
  const handleFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    // Clear domain filters when changing time period
    setDomainFilter([]);
    resetPagination();
  };

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort);
    resetPagination();
  };
  
  return (
    <div className="space-y-4">
      <div className="flex gap-4 flex-wrap">
        <select
          value={dateFilter}
          onChange={(e) => handleFilterChange(e.target.value as DateFilter)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 
                     bg-white dark:bg-gray-900 text-sm"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">This month</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortBy)}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 
                     bg-white dark:bg-gray-900 text-sm"
        >
          <option value="date">Sort by date</option>
          <option value="visits">Sort by visits</option>
        </select>
      </div>
      <DomainFilter />
    </div>
  );
}

function ExaFeed() {
  const { exaResults } = useFeedStore();
  console.log('📊 ExaFeed render - current results:', exaResults);

  if (!exaResults) {
    console.log('ℹ️ ExaFeed: No results yet');
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select URLs from your history to generate recommendations
      </div>
    );
  }

  if (exaResults.length === 0) {
    console.log('⚠️ ExaFeed: Empty results array');
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        No recommendations found for the selected URLs
      </div>
    );
  }

  console.log('✅ ExaFeed: Rendering', exaResults.length, 'results');
  return (
    <div className="space-y-4 h-full overflow-auto">
      {exaResults.map((result, index) => {
        console.log(`  Result ${index}:`, result);
        return (
          <a
            key={`${result.url}-${index}`}
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
          >
            <h3 className="font-medium mb-2 line-clamp-2">{result.title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                Score: {(result.score * 100).toFixed(0)}%
              </span>
              {result.publishedDate && (
                <span>{new Date(result.publishedDate).toLocaleDateString()}</span>
              )}
              {result.author && <span>by {result.author}</span>}
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                Result #{index + 1}
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}

function SelectionControls() {
  const { selectedEntryUrls, clearSelection, selectAllVisible, setExaResults } = useFeedStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    console.log('🚀 Submitting URLs:', selectedEntryUrls);
    try {
      setIsSubmitting(true);
      setError(null);
      setExaResults(null);
      
      const response = await fetch('/api/exa/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls: selectedEntryUrls,
          options: {
            numResults: 10
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API error:', errorData);
        throw new Error(errorData.error || 'Failed to create Exa feed');
      }
      
      const { data } = await response.json();
      console.log('✅ API response:', data);
      
      if (!data?.results || !Array.isArray(data.results)) {
        console.error('❌ Invalid results format:', data);
        throw new Error('Invalid response format from API');
      }
      
      setExaResults(data.results);
      console.log('✅ Results set in store:', data.results);
      clearSelection();
    } catch (err) {
      console.error('❌ Submit error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Exa feed');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (selectedEntryUrls.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 z-50">
      <div className="max-w-[1800px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedEntryUrls.length} URL{selectedEntryUrls.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-4">
            <button
              onClick={selectAllVisible}
              className="text-sm text-blue-500 hover:underline"
              disabled={isSubmitting}
            >
              Select all visible
            </button>
            <button
              onClick={clearSelection}
              className="text-sm text-blue-500 hover:underline"
              disabled={isSubmitting}
            >
              Clear selection
            </button>
          </div>
          {error && (
            <span className="text-sm text-red-500">
              {error}
            </span>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Curation...
            </>
          ) : (
            <>
              Create Curation
              <span className="text-sm opacity-75">
                from {selectedEntryUrls.length} URL{selectedEntryUrls.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const { isSelected, toggleEntrySelection } = useFeedStore();
  const selected = isSelected(entry.url);

  return (
    <div 
      className={`p-4 border rounded-lg transition-colors cursor-pointer ${
        selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900'
      }`}
      onClick={() => toggleEntrySelection(entry.url)}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded border transition-colors flex-shrink-0 ${
          selected 
            ? 'bg-blue-500 border-blue-500' 
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          {selected && (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-medium mb-1 line-clamp-1">{entry.title}</h3>
          <a 
            href={entry.url} 
            className="text-sm text-blue-500 hover:underline break-all line-clamp-1" 
            target="_blank" 
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            {entry.url}
          </a>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <span title={formatDate(entry.lastVisitTime)}>
              {formatRelativeTime(entry.lastVisitTime)}
            </span>
            <span>{entry.visitCount} visit{entry.visitCount === 1 ? '' : 's'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HistoryFeed() {
  const { 
    history, 
    setHistory, 
    appendHistory,
    getFilteredHistory, 
    currentPage,
    setCurrentPage,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    resetStore
  } = useFeedStore();

  const fetchHistory = useCallback(async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/history?page=${page}&pageSize=100`);
      const data = await response.json();
      
      if (data.history) {
        if (page === 1) {
          setHistory(data.history);
        } else {
          appendHistory(data.history);
        }
        setHasMore(data.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoading(false);
    }
  }, [setHistory, appendHistory, setHasMore, setCurrentPage, setIsLoading]);

  const handleRefresh = useCallback(() => {
    resetStore();
    fetchHistory(1);
  }, [resetStore, fetchHistory]);

  // Initial load
  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (isLoading || !hasMore) return;

      const scrolledToBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000;

      if (scrolledToBottom) {
        fetchHistory(currentPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchHistory, currentPage, hasMore, isLoading]);

  const filteredHistory = getFilteredHistory();

  return (
    <div className="min-h-screen p-8 pb-24">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Digital Time Machine
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Turn your browsing history into a curated feed of fascinating content
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Select pages from your history to discover similar articles, blogs, and interesting reads
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
              bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 
              shadow-sm hover:shadow transition-all ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <svg 
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            Refresh History
          </button>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto grid grid-cols-[220px_minmax(400px,_1fr)_600px] gap-6">
        {/* Left sidebar with filters */}
        <aside className="space-y-4">
          <div className="sticky top-8 space-y-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters & Search
              </h2>
              <div className="space-y-4">
                <SearchBar />
                <FilterControls />
              </div>
            </div>
          </div>
        </aside>

        {/* Middle section with history items */}
        <main className="min-w-0">
          <div className="space-y-3">
            {history.length === 0 && isLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading your history...
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : (
              <>
                {filteredHistory.map((entry) => (
                  <HistoryItem key={entry.url + entry.lastVisitTime} entry={entry} />
                ))}
                {isLoading && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Loading more...
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* Right sidebar for rendered feed */}
        <aside className="space-y-4">
          <div className="sticky top-8 space-y-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm h-[calc(100vh-8rem)]">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" />
                </svg>
                Curated Discoveries
              </h2>
              <ExaFeed />
            </div>
          </div>
        </aside>
      </div>

      <SelectionControls />
    </div>
  );
} 