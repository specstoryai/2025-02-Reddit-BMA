'use client';

import { useEffect, useState } from 'react';
import { MapHandle } from './Map';

interface BlueskyPost {
  text: string;
  createdAt: string;
  images: {
    url: string;
    alt: string;
  }[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

interface CacheData {
  posts: BlueskyPost[];
  cursor: string | null;
  timestamp: number;
  locations: Array<{
    name: string;
    coordinates: [number, number];
    postIndex: number;
  }>;
}

interface BlueskyFeedProps {
  mapRef: React.RefObject<MapHandle | null>;
}

const CACHE_KEY = 'bluesky-restaurants-cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds

function getCache(): CacheData | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CacheData = JSON.parse(cached);
    const age = Date.now() - data.timestamp;
    
    // Return null if cache is too old
    if (age > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Error reading cache:', err);
    return null;
  }
}

function updateCache(posts: BlueskyPost[], cursor: string | null) {
  try {
    // Extract location data for quick geospatial access
    const locations = posts.reduce<CacheData['locations']>((acc, post, index) => {
      if (post.location) {
        acc.push({
          name: post.location.name,
          coordinates: post.location.coordinates,
          postIndex: index
        });
      }
      return acc;
    }, []);

    const cacheData: CacheData = {
      posts,
      cursor,
      timestamp: Date.now(),
      locations
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (err) {
    console.error('Error updating cache:', err);
  }
}

export default function BlueskyFeed({ mapRef }: BlueskyFeedProps) {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isShowingCached, setIsShowingCached] = useState(false);
  const [cacheAge, setCacheAge] = useState<string>('');

  async function fetchPosts(cursor?: string) {
    try {
      setIsLoading(true);
      setIsShowingCached(false);

      // If no cursor (initial load), check cache first
      if (!cursor) {
        const cached = getCache();
        if (cached) {
          console.log('Using cached data');
          setPosts(cached.posts);
          setNextCursor(cached.cursor);
          setIsLoading(false);
          setIsShowingCached(true);
          
          // Calculate how long ago the cache was created
          const ageInMinutes = Math.floor((Date.now() - cached.timestamp) / (1000 * 60));
          if (ageInMinutes < 60) {
            setCacheAge(`${ageInMinutes}m ago`);
          } else {
            const hours = Math.floor(ageInMinutes / 60);
            const minutes = ageInMinutes % 60;
            setCacheAge(`${hours}h ${minutes}m ago`);
          }
          return;
        }
      }

      const url = new URL('/api/bluesky/posts', window.location.origin);
      url.searchParams.set('limit', '100');
      if (cursor) {
        url.searchParams.set('cursor', cursor);
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }
      const data = await response.json();
      
      let newPosts: BlueskyPost[];
      if (cursor) {
        // Append new posts
        newPosts = [...posts, ...data.posts];
        setPosts(newPosts);
      } else {
        // Replace posts for initial load
        newPosts = data.posts;
        setPosts(newPosts);
      }
      
      setNextCursor(data.cursor || null);

      // Update cache on initial load or when getting a fresh set of posts
      if (!cursor) {
        updateCache(newPosts, data.cursor || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function handleShowOnMap(coordinates: [number, number]) {
    mapRef.current?.centerOnLocation(coordinates);
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!posts.length && isLoading) {
    return <div>Loading restaurant posts...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Recent Restaurant Reviews</h2>
          <button
            onClick={() => {
              localStorage.removeItem(CACHE_KEY);
              fetchPosts();
            }}
            className="text-xs px-2 py-1 text-blue-500 hover:text-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
        {isShowingCached && (
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Showing cached data from {cacheAge} • </span>
            <button 
              onClick={() => {
                localStorage.removeItem(CACHE_KEY);
                fetchPosts();
              }}
              className="ml-1 text-blue-500 hover:text-blue-600 transition-colors"
            >
              Update now
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {posts.map((post, index) => (
          <div 
            key={index}
            className="border-b pb-4 last:border-b-0"
          >
            <p className="text-sm mb-2">{post.text}</p>
            {post.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {post.images.map((image, imgIndex) => (
                  <img
                    key={imgIndex}
                    src={image.url}
                    alt={image.alt || 'Restaurant photo'}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            )}
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                {formatDate(post.createdAt)}
              </div>
              {post.location && (
                <button
                  onClick={() => handleShowOnMap(post.location!.coordinates)}
                  className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Show on Map
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {nextCursor && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchPosts(nextCursor)}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium rounded-md text-white 
              ${isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} 
              transition-colors`}
          >
            {isLoading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
} 