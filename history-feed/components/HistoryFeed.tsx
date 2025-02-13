'use client';

import { useEffect, useCallback } from 'react';
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

function FilterControls() {
  const { dateFilter, setDateFilter, sortBy, setSortBy, resetPagination } = useFeedStore();
  
  const handleFilterChange = (filter: DateFilter) => {
    setDateFilter(filter);
    resetPagination();
  };

  const handleSortChange = (sort: SortBy) => {
    setSortBy(sort);
    resetPagination();
  };
  
  return (
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
  );
}

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  return (
    <div className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
      <h3 className="font-medium mb-1 line-clamp-1">{entry.title}</h3>
      <a href={entry.url} className="text-sm text-blue-500 hover:underline break-all line-clamp-1" target="_blank" rel="noopener noreferrer">
        {entry.url}
      </a>
      <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
        <span title={formatDate(entry.lastVisitTime)}>
          {formatRelativeTime(entry.lastVisitTime)}
        </span>
        <span>{entry.visitCount} visit{entry.visitCount === 1 ? '' : 's'}</span>
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
    setIsLoading
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
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Browsing History</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover insights from your recent web activity
        </p>
        
        <div className="space-y-4">
          <SearchBar />
          <FilterControls />
        </div>
      </header>

      <main className="max-w-3xl mx-auto">
        <div className="space-y-4">
          {history.length === 0 && isLoading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
    </div>
  );
} 