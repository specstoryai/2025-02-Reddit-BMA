import { PackedItem, HikingItem, PackingResult, BackpackType, BackpackData } from './types';

function calculateCompressedVolume(item: HikingItem): number {
  return item.compressible 
    ? item.dimensions.volume_liters * 0.6  // Compressed items take up 60% of original volume
    : item.dimensions.volume_liters;
}

function getBackpackVolume(backpack: BackpackType): number {
  if (typeof backpack.capacity.liters === 'object') {
    return backpack.capacity.liters.max;
  }
  return backpack.capacity.liters;
}

function organizeByPriority(items: PackedItem[]): PackingResult['packingStrategy'] {
  let remainingItems = [...items];
  
  // First, identify pocket items (small essentials)
  const pockets = remainingItems.filter(item => 
    item.dimensions.volume_liters < 1 && !item.stackable
  );
  remainingItems = remainingItems.filter(item => !pockets.includes(item));

  // Then, identify bottom layer items (heavy and compressible high-priority)
  const bottomLayer = remainingItems.filter(item => 
    item.priority === 'high' && (item.compressible || item.dimensions.volume_liters > 5)
  );
  remainingItems = remainingItems.filter(item => !bottomLayer.includes(item));
  
  // Next, identify top layer items (stackable and low priority)
  const topLayer = remainingItems.filter(item => 
    item.priority === 'low' || item.stackable
  );
  remainingItems = remainingItems.filter(item => !topLayer.includes(item));
  
  // Everything else goes in the middle layer
  const middleLayer = remainingItems;

  return { bottomLayer, middleLayer, topLayer, pockets };
}

type ValidBackpackType = keyof BackpackData['backpack_types'] | keyof BackpackData['capacity_based'];

function suggestUpgrade(
  currentBackpack: BackpackType,
  totalVolume: number,
  backpackTypes: Record<string, BackpackType>
): ValidBackpackType | undefined {
  const currentVolume = getBackpackVolume(currentBackpack);
  if (totalVolume <= currentVolume) return undefined;

  const nextSize = Object.entries(backpackTypes)
    .find(([, pack]) => getBackpackVolume(pack) >= totalVolume * 1.2)?.[0];
    
  return nextSize as ValidBackpackType | undefined;
}

export function packItems(
  items: PackedItem[],
  backpack: BackpackType,
  allBackpackTypes: Record<string, BackpackType>
): PackingResult {
  const totalVolume = items.reduce((acc, item) => 
    acc + calculateCompressedVolume(item), 0
  );
  
  const backpackVolume = getBackpackVolume(backpack);
  const success = totalVolume <= backpackVolume;

  const packingStrategy = organizeByPriority(items);
  
  return {
    success,
    items,
    volumeUsed: totalVolume,
    volumeAvailable: backpackVolume,
    suggestedUpgrade: suggestUpgrade(backpack, totalVolume, allBackpackTypes),
    packingStrategy
  };
}