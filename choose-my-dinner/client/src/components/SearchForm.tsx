import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { SearchParams } from '../types/search';

const PRICE_LEVELS = [
  { value: '1', label: '$ (Under $15)' },
  { value: '2', label: '$$ ($15-$30)' },
  { value: '3', label: '$$$ ($31-$60)' },
  { value: '4', label: '$$$$ (Over $60)' },
];

const CUISINES = [
  { value: 'italian', label: 'Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'indian', label: 'Indian' },
  { value: 'american', label: 'American' },
  { value: 'thai', label: 'Thai' },
];

const RADIUS_OPTIONS = [
  { value: '1000', label: '1 km' },
  { value: '2000', label: '2 km' },
  { value: '5000', label: '5 km' },
  { value: '10000', label: '10 km' },
];

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

export function SearchForm({ onSearch, isLoading = false }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    address: '',
    priceLevel: '',
    cuisine: '',
    radius: '2000', // Default to 2km
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium">
          Your Address
        </label>
        <Input
          id="address"
          placeholder="Enter your address"
          value={searchParams.address}
          onChange={(e) =>
            setSearchParams({ ...searchParams, address: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="price" className="text-sm font-medium">
          Price Range
        </label>
        <Select
          value={searchParams.priceLevel}
          onValueChange={(value) =>
            setSearchParams({ ...searchParams, priceLevel: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select price range" />
          </SelectTrigger>
          <SelectContent>
            {PRICE_LEVELS.map((price) => (
              <SelectItem key={price.value} value={price.value}>
                <div>
                  <div>{price.label}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="cuisine" className="text-sm font-medium">
          Cuisine Type
        </label>
        <Select
          value={searchParams.cuisine}
          onValueChange={(value) =>
            setSearchParams({ ...searchParams, cuisine: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select cuisine type" />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((cuisine) => (
              <SelectItem key={cuisine.value} value={cuisine.value}>
                {cuisine.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="radius" className="text-sm font-medium">
          Search Radius
        </label>
        <Select
          value={searchParams.radius}
          onValueChange={(value) =>
            setSearchParams({ ...searchParams, radius: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select search radius" />
          </SelectTrigger>
          <SelectContent>
            {RADIUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Find Restaurants'}
      </Button>
    </form>
  );
} 