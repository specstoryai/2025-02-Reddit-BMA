'use client';

import { useState } from 'react';
import { HikingItem, HikingItemsByCategory, PackedItem } from '@/lib/types';

interface ItemSelectorProps {
  items: HikingItemsByCategory;
  onItemAdd: (item: PackedItem) => void;
  currentVolume: number;
  maxVolume: number;
}

export function ItemSelector({ items, onItemAdd, currentVolume, maxVolume }: ItemSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(items.categories)[0]);

  const addItem = (itemId: string, item: HikingItem, category: string) => {
    const packedItem: PackedItem = {
      ...item,
      id: `${itemId}-${Date.now()}`,
      category
    };
    onItemAdd(packedItem);
  };

  const volumePercentage = (currentVolume / maxVolume) * 100;
  const volumeColor = volumePercentage > 90 ? 'bg-red-500' : 
                     volumePercentage > 75 ? 'bg-yellow-500' : 
                     'bg-green-500';

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6">
      {/* Volume Indicator */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Pack Volume</span>
          <span>{currentVolume.toFixed(1)}L / {maxVolume.toFixed(1)}L</span>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${volumeColor} transition-all duration-300 rounded-full`}
            style={{ width: `${Math.min(volumePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.keys(items.categories).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-blue-500 text-white shadow-md transform scale-105'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(items.categories[selectedCategory]).map(([itemId, item]) => (
          <div
            key={itemId}
            className="relative bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <div className="space-y-1 mt-1">
                  <p className="text-sm text-gray-600">
                    Volume: {item.dimensions.volume_liters}L
                  </p>
                  <div className="flex gap-2">
                    {item.compressible && (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Compressible
                      </span>
                    )}
                    {item.stackable && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        Stackable
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => addItem(itemId, item, selectedCategory)}
                className="ml-4 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm hover:shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 