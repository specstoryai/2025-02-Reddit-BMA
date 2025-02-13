export interface Dimensions {
  height: number;
  width: number;
  depth: number;
  dimensions_cm: {
    height: number;
    width: number;
    depth: number;
  };
}

export interface SingleCapacity {
  liters: number;
  gallons: number;
}

export interface RangeCapacity {
  liters: {
    min: number;
    max: number;
  };
  gallons: {
    min: number;
    max: number;
  };
}

export interface BackpackType {
  dimensions: Dimensions;
  capacity: SingleCapacity | RangeCapacity;
}

export interface BackpackData {
  backpack_types: {
    hydration: BackpackType;
    everyday: BackpackType;
    hiking: BackpackType;
  };
  capacity_based: {
    weekend: BackpackType;
    multiday: BackpackType;
    extended_trip: BackpackType;
  };
}

export interface ItemDimensions {
  height: number;
  width: number;
  depth: number;
  volume_liters: number;
}

export type Priority = 'high' | 'medium' | 'low';

export interface HikingItem {
  name: string;
  dimensions: ItemDimensions;
  priority: Priority;
  compressible?: boolean;
  stackable?: boolean;
}

export interface HikingItemsByCategory {
  categories: {
    [category: string]: {
      [itemId: string]: HikingItem;
    };
  };
}

export interface PackedItem extends HikingItem {
  id: string;
  category: string;
  position?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface PackingResult {
  success: boolean;
  items: PackedItem[];
  volumeUsed: number;
  volumeAvailable: number;
  suggestedUpgrade?: keyof BackpackData['backpack_types'] | keyof BackpackData['capacity_based'];
  packingStrategy?: {
    bottomLayer: PackedItem[];
    middleLayer: PackedItem[];
    topLayer: PackedItem[];
    pockets: PackedItem[];
  };
} 