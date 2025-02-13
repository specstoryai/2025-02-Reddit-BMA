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
  const { success, volumeUsed, volumeAvailable, suggestedUpgrade, packingStrategy } = packingResult;

  return (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Packing Summary</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {volumeUsed.toFixed(1)}L / {volumeAvailable.toFixed(1)}L
          </div>
        </div>
        {!success && suggestedUpgrade && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Consider upgrading to a {suggestedUpgrade.replace('_', ' ')} backpack for better fit
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

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