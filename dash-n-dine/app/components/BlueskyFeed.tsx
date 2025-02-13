'use client';

import { useEffect, useState } from 'react';

interface BlueskyPost {
  text: string;
  createdAt: string;
  images: {
    url: string;
    alt: string;
  }[];
}

export default function BlueskyFeed() {
  const [posts, setPosts] = useState<BlueskyPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/bluesky/posts');
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        setPosts(data.posts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      }
    }

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

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!posts.length) {
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
            <div className="text-xs text-gray-500 mt-2">
              {formatDate(post.createdAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 