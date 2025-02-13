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

interface BlueskyFeedProps {
  mapRef: React.RefObject<MapHandle | null>;
}

export default function BlueskyFeed({ mapRef }: BlueskyFeedProps) {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  async function fetchPosts(cursor?: string) {
    try {
      setIsLoading(true);
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
      
      if (cursor) {
        // Append new posts
        setPosts(currentPosts => [...currentPosts, ...data.posts]);
      } else {
        // Replace posts for initial load
        setPosts(data.posts);
      }
      setNextCursor(data.cursor || null);
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
      <h2 className="text-xl font-semibold mb-4">Recent Restaurant Reviews</h2>
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