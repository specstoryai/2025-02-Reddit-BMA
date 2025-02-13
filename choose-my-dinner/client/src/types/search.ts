export interface SearchParams {
  address: string;
  priceLevel: string;
  cuisine: string;
  radius: string;
}

export interface Restaurant {
  name: string;
  address: string;
  rating: number;
  priceLevel: number;
  photos?: string[];
  types: string[];
} 