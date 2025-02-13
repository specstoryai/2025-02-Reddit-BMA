import { useState, useMemo } from 'react';

interface SearchResultsListProps {
  results: google.maps.places.PlaceResult[];
  onSelect: (place: google.maps.places.PlaceResult) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  priceFilter: PriceLevel;
  onPriceChange: (price: PriceLevel) => void;
  ratingFilter: RatingLevel;
  onRatingChange: (rating: RatingLevel) => void;
  openNowOnly: boolean;
  onOpenNowChange: (open: boolean) => void;
}

type SortOption = 'rating' | 'price' | 'name';
type PriceLevel = '1' | '2' | '3' | '4' | 'all';
type RatingLevel = '3' | '3.5' | '4' | '4.5' | 'all';

export default function SearchResultsList({ 
  results, 
  onSelect,
  sortBy,
  onSortChange,
  priceFilter,
  onPriceChange,
  ratingFilter,
  onRatingChange,
  openNowOnly,
  onOpenNowChange
}: SearchResultsListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedResults = useMemo(() => {
    return results
      .filter(place => {
        // Text search
        const matchesSearch = !searchTerm || 
          place.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.vicinity?.toLowerCase().includes(searchTerm.toLowerCase());

        // Price level
        const matchesPrice = priceFilter === 'all' || 
          place.price_level === Number(priceFilter);

        // Rating
        const matchesRating = ratingFilter === 'all' || 
          (place.rating && place.rating >= Number(ratingFilter));

        // Open now
        const matchesOpenNow = !openNowOnly || 
          place.opening_hours?.isOpen?.();

        return matchesSearch && matchesPrice && matchesRating && matchesOpenNow;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'price':
            return (a.price_level || 0) - (b.price_level || 0);
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          default:
            return 0;
        }
      });
  }, [results, searchTerm, sortBy, priceFilter, ratingFilter, openNowOnly]);

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search restaurants..."
          className="w-full px-4 py-2 border rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="grid grid-cols-2 gap-2">
          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
          >
            <option value="rating">Sort by Rating</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={priceFilter}
            onChange={(e) => onPriceChange(e.target.value as PriceLevel)}
          >
            <option value="all">Any Price</option>
            <option value="1">$</option>
            <option value="2">$$</option>
            <option value="3">$$$</option>
            <option value="4">$$$$</option>
          </select>

          <select
            className="px-3 py-2 border rounded-md text-sm"
            value={ratingFilter}
            onChange={(e) => onRatingChange(e.target.value as RatingLevel)}
          >
            <option value="all">Any Rating</option>
            <option value="3">3+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="4.5">4.5+ Stars</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={openNowOnly}
            onChange={(e) => onOpenNowChange(e.target.checked)}
            className="rounded"
          />
          Open Now Only
        </label>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {filteredAndSortedResults.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No restaurants match your criteria
          </div>
        ) : (
          filteredAndSortedResults.map((place) => (
            <div
              key={place.place_id}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => onSelect(place)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{place.name}</h3>
                  {place.vicinity && (
                    <p className="text-sm text-gray-600 mt-1">{place.vicinity}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {place.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{place.rating}</span>
                      <span className="text-yellow-400">★</span>
                      {place.user_ratings_total && (
                        <span className="text-xs text-gray-500">
                          ({place.user_ratings_total})
                        </span>
                      )}
                    </div>
                  )}
                  {place.price_level && (
                    <span className="text-sm text-green-600">
                      {'$'.repeat(place.price_level)}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {place.opening_hours?.isOpen?.() && (
                  <span className="px-2 py-1 bg-blue-100 text-xs rounded-full">
                    Open Now
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(place);
                }}
                className="mt-3 px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
              >
                Add to List
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 