'use client';

import { useState, useRef } from 'react';
import { BackpackData, PackedItem, HikingItemsByCategory, SingleCapacity, RangeCapacity } from '@/lib/types';
import hikingItems from '@/data/hiking-items.json';
import { packItems } from '@/lib/packing-algorithm';
import { ItemSelector } from './ItemSelector';
import { PackingList } from './PackingList';

type BackpackTypeMap = Record<string, BackpackData['backpack_types'][keyof BackpackData['backpack_types']]>;

interface BackpackVisualizerProps {
  data: BackpackData;
}

function getCapacityDisplay(capacity: SingleCapacity | RangeCapacity) {
  if (typeof capacity.liters === 'object') {
    return (
      <div className="text-center">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-400 text-transparent bg-clip-text">
          {(capacity.liters as RangeCapacity['liters']).min}-{(capacity.liters as RangeCapacity['liters']).max}L
        </span>
        <div className="text-xs text-emerald-600 font-medium mt-0.5 tracking-wide">
          ({(capacity.gallons as RangeCapacity['gallons']).min}-{(capacity.gallons as RangeCapacity['gallons']).max} gal)
        </div>
      </div>
    );
  }
  return (
    <div className="text-center">
      <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-sky-400 text-transparent bg-clip-text">
        {(capacity.liters as number)}L
      </span>
      <div className="text-xs text-emerald-600 font-medium mt-0.5 tracking-wide">
        ({(capacity.gallons as number)} gal)
      </div>
    </div>
  );
}

export function BackpackVisualizer({ data }: BackpackVisualizerProps) {
  const [selectedType, setSelectedType] = useState<string>('everyday');
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sort backpack types by capacity
  const sortedBackpackTypes = Object.entries({
    ...data.backpack_types,
    ...data.capacity_based
  })
    .sort(([, a], [, b]) => {
      const aCapacity = typeof a.capacity.liters === 'object' 
        ? a.capacity.liters.max 
        : a.capacity.liters;
      const bCapacity = typeof b.capacity.liters === 'object'
        ? b.capacity.liters.max
        : b.capacity.liters;
      return aCapacity - bCapacity;
    })
    .reduce<BackpackTypeMap>((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  const currentBackpack = sortedBackpackTypes[selectedType];
  const packingResult = packItems(packedItems, currentBackpack, sortedBackpackTypes);

  const handleAddItem = (item: PackedItem) => {
    setPackedItems([...packedItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setPackedItems(packedItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-sky-50 py-4 tracking-tight">
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #60a5fa;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3b82f6;
        }
      `}</style>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-3 text-center relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <img
                  src="/backpack.svg"
                  alt="Backpack Icon"
                  className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-lg opacity-90"
                  style={{
                    filter: 'drop-shadow(0 4px 6px rgba(16, 185, 129, 0.2))'
                  }}
                />
                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-sky-400 rounded-full shadow-sm shadow-sky-400/50 animate-pulse"></div>
              </div>
              <div className="flex items-baseline gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-sky-500 text-transparent bg-clip-text tracking-tight">
                  Backpack Buddy
                </h1>
                <span className="text-xs text-emerald-700 font-medium tracking-wide">Plan your next adventure with confidence!</span>
              </div>
            </div>
            <button
              onClick={() => {
                setPackedItems([]);
                setSelectedType('everyday');
                window.location.reload();
              }}
              className="px-2 py-1 rounded-lg text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md font-medium tracking-wide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Reset
            </button>
          </div>
        </div>

        {/* Step 1: Choose Backpack */}
        <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-300">
          <div className="relative">
            {/* Volume Indicator and Warning - Absolute Top Right */}
            <div className="absolute top-0 right-0 w-[200px] flex flex-col items-end gap-2 -mt-1">
              <div className="w-full">
                <div className="flex justify-between text-xs text-emerald-700 font-medium mb-1.5">
                  <span>Pack Volume</span>
                  <span>{packingResult.volumeUsed.toFixed(1)}L / {packingResult.volumeAvailable.toFixed(1)}L</span>
                </div>
                <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      packingResult.volumeUsed / packingResult.volumeAvailable > 0.9
                        ? 'bg-rose-500'
                        : packingResult.volumeUsed / packingResult.volumeAvailable > 0.75
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((packingResult.volumeUsed / packingResult.volumeAvailable) * 100, 100)}%` }}
                  />
                </div>
              </div>
              {!packingResult.success && packingResult.suggestedUpgrade && (
                <div className="w-full bg-amber-50 border-l-4 border-amber-500 p-2 rounded-lg shadow-md mt-2">
                  <div className="flex items-start gap-1.5">
                    <svg className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-amber-800 font-medium">
                      Consider upgrading to a {packingResult.suggestedUpgrade.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} backpack for better fit
                    </p>
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center tracking-tight">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs mr-2 shadow-md font-bold">1</span>
              Choose Your Backpack
            </h2>
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm bg-emerald-50 border-none focus:ring-2 focus:ring-emerald-500 shadow-sm font-medium text-emerald-800"
              >
                {Object.entries(sortedBackpackTypes).map(([type, backpack]) => {
                  const capacity = typeof backpack.capacity.liters === 'object'
                    ? `${backpack.capacity.liters.min}-${backpack.capacity.liters.max}L`
                    : `${backpack.capacity.liters}L`;
                  return (
                    <option key={type} value={type} className="font-medium">
                      {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')} ({capacity})
                    </option>
                  );
                })}
              </select>
            </div>

            <div 
              ref={containerRef}
              className="relative aspect-square w-full max-w-xs mx-auto mt-4"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="relative bg-gradient-to-br from-sky-100 to-emerald-100 rounded-lg shadow-inner transition-all duration-300"
                  style={{
                    width: `${(currentBackpack.dimensions.width / 40) * 100}%`,
                    height: `${(currentBackpack.dimensions.height / 40) * 100}%`,
                  }}
                >
                  {/* Height label - top */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-emerald-700 whitespace-nowrap tracking-wide">
                    Height: {currentBackpack.dimensions.height}&quot; ({currentBackpack.dimensions.dimensions_cm.height}cm)
                  </div>

                  {/* Width label - left */}
                  <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-emerald-700 whitespace-nowrap tracking-wide">
                    Width: {currentBackpack.dimensions.width}&quot; ({currentBackpack.dimensions.dimensions_cm.width}cm)
                  </div>

                  {/* Depth label - bottom */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-emerald-700 whitespace-nowrap tracking-wide">
                    Depth: {currentBackpack.dimensions.depth}&quot; ({currentBackpack.dimensions.dimensions_cm.depth}cm)
                  </div>

                  {/* Dimension lines */}
                  <div className="absolute -left-1.5 top-0 h-full border-l border-emerald-400"></div>
                  <div className="absolute left-0 -top-1.5 w-full border-t border-emerald-400"></div>
                  <div className="absolute left-0 -bottom-1.5 w-full border-b border-emerald-400"></div>

                  {/* Capacity display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getCapacityDisplay(currentBackpack.capacity)}
                  </div>

                  {/* Visual Volume Indicator */}
                  <div 
                    className={`absolute inset-0 bg-gradient-to-t transition-all duration-300 rounded-lg ${
                      packingResult.volumeUsed / packingResult.volumeAvailable > 0.9
                        ? 'from-rose-500/20 to-transparent'
                        : packingResult.volumeUsed / packingResult.volumeAvailable > 0.75
                        ? 'from-amber-500/20 to-transparent'
                        : 'from-emerald-500/20 to-transparent'
                    }`}
                    style={{ 
                      height: `${Math.min((packingResult.volumeUsed / packingResult.volumeAvailable) * 100, 100)}%`,
                      bottom: 0 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Step 2: Add Items */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 h-[500px] flex flex-col hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center tracking-tight">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs mr-2 shadow-md font-bold">2</span>
                Add Your Items
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <ItemSelector
                  items={hikingItems as HikingItemsByCategory}
                  onItemAdd={handleAddItem}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Review Packing Strategy */}
          <div>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-4 h-[500px] flex flex-col hover:shadow-xl transition-shadow duration-300">
              <h2 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center tracking-tight">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs mr-2 shadow-md font-bold">3</span>
                Review Packing Strategy
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <PackingList
                  packingResult={packingResult}
                  onRemoveItem={handleRemoveItem}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 