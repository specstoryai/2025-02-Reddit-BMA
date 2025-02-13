'use client';

import { PackingResult, PackedItem } from '@/lib/types';

interface PackingListProps {
  packingResult: PackingResult;
  onRemoveItem: (itemId: string) => void;
}

function PackingSection({ title, items, onRemoveItem }: { 
  title: string; 
  items: PackedItem[];
  onRemoveItem: (itemId: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-lg text-gray-800 mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <div>
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="text-sm text-gray-500 ml-2">
                  ({item.dimensions.volume_liters}L)
                </span>
                {item.compressible && (
                  <span className="ml-2 text-xs text-blue-600">
                    Compressible
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PackingList({ packingResult, onRemoveItem }: PackingListProps) {
  const { packingStrategy } = packingResult;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      {packingStrategy && (
        <div className="space-y-4">
          <PackingSection
            title="Bottom Layer (Heavy & Compressible Items)"
            items={packingStrategy.bottomLayer}
            onRemoveItem={onRemoveItem}
          />
          <PackingSection
            title="Middle Layer (Medium Priority Items)"
            items={packingStrategy.middleLayer}
            onRemoveItem={onRemoveItem}
          />
          <PackingSection
            title="Top Layer (Light & Frequently Accessed Items)"
            items={packingStrategy.topLayer}
            onRemoveItem={onRemoveItem}
          />
          <PackingSection
            title="Pocket Items (Small Essentials)"
            items={packingStrategy.pockets}
            onRemoveItem={onRemoveItem}
          />
        </div>
      )}
    </div>
  );
} 