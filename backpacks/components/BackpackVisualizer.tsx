'use client';

import { useState, useEffect, useRef } from 'react';
import { BackpackData, PackedItem, HikingItemsByCategory, SingleCapacity, RangeCapacity } from '@/lib/types';
import hikingItems from '@/data/hiking-items.json';
import { packItems } from '@/lib/packing-algorithm';
import { ItemSelector } from './ItemSelector';
import { PackingList } from './PackingList';

type ViewMode = 'dimensions' | 'capacity';
type BackpackType = keyof BackpackData['backpack_types'] | keyof BackpackData['capacity_based'];

interface BackpackVisualizerProps {
  data: BackpackData;
}

function PackedItemVisual({ item, style }: { item: PackedItem; style?: React.CSSProperties }) {
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    borderRadius: '0.5rem',
    transition: 'all 0.3s ease',
    ...style,
  };

  const getItemColor = () => {
    if (item.compressible) return 'rgba(59, 130, 246, 0.3)'; // blue
    if (item.stackable) return 'rgba(16, 185, 129, 0.3)'; // green
    return 'rgba(107, 114, 128, 0.3)'; // gray
  };

  return (
    <div
      style={baseStyle}
      className="flex items-center justify-center p-1 text-xs font-medium border border-gray-200 shadow-sm"
    >
      <div
        className="w-full h-full rounded"
        style={{ backgroundColor: getItemColor() }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-center p-1">
          <span className="text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
            {item.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function PackedItemsVisualizer({ 
  items, 
  containerWidth, 
  containerHeight 
}: { 
  items: PackedItem[]; 
  containerWidth: number;
  containerHeight: number;
}) {
  const LAYER_HEIGHTS = {
    bottomLayer: { start: 0.6, end: 1.0 },
    middleLayer: { start: 0.3, end: 0.6 },
    topLayer: { start: 0.1, end: 0.3 },
    pockets: { start: 0, end: 0.1 }
  } as const;

  type LayerType = keyof typeof LAYER_HEIGHTS;
  type ItemGroups = Record<LayerType, PackedItem[]>;

  // Group items by their layer
  const itemsByLayer = items.reduce<ItemGroups>((acc, item) => {
    const layer = Object.entries(acc).find(([layerName]) => 
      item.category === layerName
    )?.[0] as LayerType || 'middleLayer';
    
    return {
      ...acc,
      [layer]: [...acc[layer], item]
    };
  }, {
    bottomLayer: [],
    middleLayer: [],
    topLayer: [],
    pockets: []
  });

  const calculateItemSize = (item: PackedItem) => {
    // Base the item size on its actual dimensions relative to container
    const itemWidth = (item.dimensions.width / item.dimensions.depth) * containerWidth * 0.15;
    const itemHeight = (item.dimensions.height / item.dimensions.depth) * containerHeight * 0.15;

    // Apply compression if applicable
    const compressionFactor = item.compressible ? 0.6 : 1;
    
    return {
      width: itemWidth * compressionFactor,
      height: itemHeight * compressionFactor
    };
  };

  const findBestPosition = (
    item: PackedItem,
    itemSize: { width: number; height: number },
    layerItems: PackedItem[],
    layer: LayerType
  ) => {
    const layerBounds = LAYER_HEIGHTS[layer];
    const layerStartY = layerBounds.start * containerHeight;
    const layerEndY = layerBounds.end * containerHeight;

    // Get positions of existing items in the layer
    const existingPositions = layerItems.slice(0, layerItems.indexOf(item)).map(existingItem => {
      const style = calculateItemDimensions(existingItem, layerItems, layerItems.indexOf(existingItem), layer);
      return {
        x: parseFloat(style.transform.split('(')[1].split('px')[0]),
        y: parseFloat(style.transform.split(',')[1].split('px')[0]),
        width: parseFloat(style.width),
        height: parseFloat(style.height)
      };
    });

    // Grid-based placement to avoid overlaps
    const gridSize = Math.min(itemSize.width, itemSize.height) / 2;
    
    // Find first non-overlapping position
    for (let y = layerStartY; y <= layerEndY - itemSize.height; y += gridSize) {
      for (let x = 0; x <= containerWidth - itemSize.width; x += gridSize) {
        let hasOverlap = false;

        // Check if this position overlaps with any existing item
        for (const pos of existingPositions) {
          const xOverlap = x < pos.x + pos.width && x + itemSize.width > pos.x;
          const yOverlap = y < pos.y + pos.height && y + itemSize.height > pos.y;
          
          if (xOverlap && yOverlap) {
            hasOverlap = true;
            break;
          }
        }

        // If we found a position with no overlap, use it
        if (!hasOverlap) {
          return { x, y };
        }
      }
    }

    // If no non-overlapping position found, place at the end of the layer
    const maxY = Math.max(...existingPositions.map(p => p.y + p.height), layerStartY);
    return {
      x: 0,
      y: maxY + 5 // Add small gap
    };
  };

  const calculateItemDimensions = (item: PackedItem, layerItems: PackedItem[], itemIndex: number, layer: LayerType) => {
    const itemSize = calculateItemSize(item);
    const position = findBestPosition(item, itemSize, layerItems, layer);

    return {
      width: `${itemSize.width}px`,
      height: `${itemSize.height}px`,
      transform: `translate(${position.x}px, ${position.y}px)`,
    };
  };

  return (
    <>
      {(Object.entries(itemsByLayer) as [LayerType, PackedItem[]][]).map(([layer, layerItems]) => (
        layerItems.map((item, index) => (
          <PackedItemVisual
            key={item.id}
            item={item}
            style={calculateItemDimensions(item, layerItems, index, layer)}
          />
        ))
      ))}
    </>
  );
}

function getCapacityDisplay(capacity: SingleCapacity | RangeCapacity) {
  if (typeof capacity.liters === 'object') {
    return (
      <div className="text-center">
        <span className="text-3xl font-bold text-blue-600">
          {(capacity.liters as RangeCapacity['liters']).min}-{(capacity.liters as RangeCapacity['liters']).max}L
        </span>
        <div className="text-gray-500 text-sm mt-1">
          ({(capacity.gallons as RangeCapacity['gallons']).min}-{(capacity.gallons as RangeCapacity['gallons']).max} gal)
        </div>
      </div>
    );
  }
  return (
    <div className="text-center">
      <span className="text-3xl font-bold text-blue-600">
        {(capacity.liters as number)}L
      </span>
      <div className="text-gray-500 text-sm mt-1">
        ({(capacity.gallons as number)} gal)
      </div>
    </div>
  );
}

export function BackpackVisualizer({ data }: BackpackVisualizerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('dimensions');
  const [selectedType, setSelectedType] = useState<BackpackType>('everyday');
  const [packedItems, setPackedItems] = useState<PackedItem[]>([]);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const backpackTypes = {
    ...data.backpack_types,
    ...data.capacity_based
  };

  const currentBackpack = backpackTypes[selectedType];
  const packingResult = packItems(packedItems, currentBackpack, backpackTypes);

  const handleAddItem = (item: PackedItem) => {
    setPackedItems([...packedItems, item]);
  };

  const handleRemoveItem = (itemId: string) => {
    setPackedItems(packedItems.filter(item => item.id !== itemId));
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setContainerDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Backpack Visualizer</h1>
          <p className="mt-2 text-gray-600 text-center">Choose your backpack type and start packing</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div className="space-x-2">
                  <button
                    onClick={() => setViewMode('dimensions')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      viewMode === 'dimensions'
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Dimensions
                  </button>
                  <button
                    onClick={() => setViewMode('capacity')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      viewMode === 'capacity'
                        ? 'bg-blue-500 text-white shadow-md transform scale-105'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Capacity
                  </button>
                </div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as BackpackType)}
                  className="px-4 py-2 rounded-full text-sm bg-gray-100 border-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(backpackTypes).map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div 
                ref={containerRef}
                className="relative aspect-square w-full max-w-md mx-auto"
              >
                {viewMode === 'dimensions' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="relative bg-blue-100 rounded-xl shadow-inner transition-all duration-300"
                      style={{
                        width: `${(currentBackpack.dimensions.width / 30) * 100}%`,
                        height: `${(currentBackpack.dimensions.height / 30) * 100}%`,
                      }}
                    >
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
                        {currentBackpack.dimensions.height}&quot; ({currentBackpack.dimensions.dimensions_cm.height}cm)
                      </div>
                      <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-600">
                        {currentBackpack.dimensions.width}&quot; ({currentBackpack.dimensions.dimensions_cm.width}cm)
                      </div>
                      <div className="absolute top-1/2 -right-16 transform -translate-y-1/2 text-sm font-medium text-gray-600">
                        Depth: {currentBackpack.dimensions.depth}&quot; ({currentBackpack.dimensions.dimensions_cm.depth}cm)
                      </div>
                      {packingResult.packingStrategy && containerDimensions.width > 0 && (
                        <PackedItemsVisualizer
                          items={packedItems}
                          containerWidth={containerDimensions.width * (currentBackpack.dimensions.width / 30)}
                          containerHeight={containerDimensions.height * (currentBackpack.dimensions.height / 30)}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">Capacity</h3>
                      {getCapacityDisplay(currentBackpack.capacity)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <ItemSelector
              items={hikingItems as HikingItemsByCategory}
              onItemAdd={handleAddItem}
              currentVolume={packingResult.volumeUsed}
              maxVolume={packingResult.volumeAvailable}
            />
          </div>

          <div className="lg:w-1/2">
            <PackingList
              packingResult={packingResult}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 