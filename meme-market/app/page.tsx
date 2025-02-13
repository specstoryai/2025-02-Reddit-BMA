'use client';

import { MemeData, Meme } from './types/meme';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Home() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMemes = async () => {
    try {
      const response = await fetch('/api/memes');
      if (!response.ok) throw new Error('Failed to fetch memes');
      const data = await response.json() as MemeData;
      setMemes(data.memes);
    } catch (error) {
      console.error('Error fetching memes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  const getGoogleImageSearchUrl = (query: string) => {
    return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
  };

  const setMainImage = async (memeName: string, newMainImageUrl: string) => {
    try {
      const response = await fetch('/api/update-main-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memeName, newMainImageUrl }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update main image');
      }

      // Fetch fresh data after update
      await fetchMemes();
    } catch (error) {
      console.error('Error updating main image:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  const deleteMeme = async (memeName: string) => {
    if (!confirm(`Are you sure you want to delete "${memeName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/delete-meme', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ memeName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete meme');
      }

      // Fetch fresh data after deletion
      await fetchMemes();
    } catch (error) {
      console.error('Error deleting meme:', error);
      alert('Failed to delete meme. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">Loading memes...</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Meme Gallery</h1>
      <div className="space-y-12">
        {memes.map((meme) => (
          <section key={meme.name} className="border rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <a 
                  href={getGoogleImageSearchUrl(meme.name)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-2xl font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {meme.name}
                </a>
                <button
                  onClick={() => deleteMeme(meme.name)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-600 hover:border-red-800 rounded-full"
                >
                  Delete
                </button>
              </div>
              <div className="text-sm text-gray-500">
                Current main image: {meme.main_image_url.split('/').pop()}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meme.image_urls.map((imageUrl, index) => {
                const isMainImage = imageUrl === meme.main_image_url;
                return (
                  <div 
                    key={imageUrl} 
                    className={`relative aspect-square group ${
                      isMainImage ? 'ring-4 ring-blue-500 rounded-lg' : ''
                    }`}
                  >
                    <Image
                      src={`/data/${imageUrl}`}
                      alt={`${meme.name} variant ${index + 1}`}
                      fill
                      className="object-contain rounded-lg cursor-pointer"
                    />
                    {isMainImage && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
                        Current
                      </div>
                    )}
                    <button
                      onClick={() => setMainImage(meme.name, imageUrl)}
                      className={`absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-sm font-medium ${
                        isMainImage ? 'bg-blue-500/50 group-hover:bg-blue-500/70' : ''
                      }`}
                    >
                      {isMainImage ? 'Currently Selected' : 'Set as Main Image'}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
