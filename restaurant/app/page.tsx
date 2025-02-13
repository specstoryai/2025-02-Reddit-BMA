'use client';

import { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import RestaurantList from '@/components/RestaurantList';
import SearchResultsList from '@/components/SearchResultsList';
import { useRestaurants } from '@/hooks/useRestaurants';
import Image from 'next/image';

// Types for filters
type SortOption = 'rating' | 'price' | 'name';
type PriceLevel = '1' | '2' | '3' | '4' | 'all';
type RatingLevel = '3' | '3.5' | '4' | '4.5' | 'all';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
});

export default function Home() {
  const { restaurants, addRestaurant, removeRestaurant } = useRestaurants();
  const [selectedId, setSelectedId] = useState<string>();
  const [zipCode, setZipCode] = useState('');
  const [searchedZipCode, setSearchedZipCode] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [rating, setRating] = useState(5);
  const [activeTab, setActiveTab] = useState<'saved' | 'search'>('saved');
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);

  // Filter states
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [priceFilter, setPriceFilter] = useState<PriceLevel>('all');
  const [ratingFilter, setRatingFilter] = useState<RatingLevel>('all');
  const [openNowOnly, setOpenNowOnly] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareableLink, setShareableLink] = useState('');

  const handleSearch = () => {
    setSearchedZipCode(zipCode);
    setActiveTab('search');
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    setShowAddForm(true);
  };

  const handleAddRestaurant = () => {
    if (!selectedPlace?.geometry?.location) return;

    addRestaurant({
      name: selectedPlace.name || 'Unknown Restaurant',
      placeId: selectedPlace.place_id || '',
      location: {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      },
      notes,
      visitDate,
      rating
    });

    setShowAddForm(false);
    setSelectedPlace(null);
    setNotes('');
    setVisitDate(new Date().toISOString().split('T')[0]);
    setRating(5);
    setActiveTab('saved');
  };

  const handleShare = () => {
    // Mock generating a shareable link
    const mockLink = `https://restaurant-logger.app/shared/${crypto.randomUUID()}`;
    setShareableLink(mockLink);
    setShowShareModal(true);
  };

  // Convert filter values for map component
  const getMapFilters = () => ({
    minRating: ratingFilter === 'all' ? 0 : Number(ratingFilter),
    maxPrice: priceFilter === 'all' ? undefined : Number(priceFilter),
    openNowOnly: openNowOnly
  });

  return (
    <main className="flex min-h-screen flex-col md:flex-row">
      {/* Left side - Restaurant List */}
      <div className="w-full md:w-1/3 p-4 border-r">
        <div className="flex items-center gap-4 mb-6 px-2">
          <Image
            src="/rest-logger.svg"
            alt="Restaurant Logger"
            width={64}
            height={64}
            className="w-16 h-16"
            priority
          />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Restaurant Logger
          </h1>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter zip code"
              className="flex-1 px-4 py-2 border rounded-md"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button 
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              className={`px-4 py-2 ${
                activeTab === 'saved'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('saved')}
            >
              Saved Places
            </button>
            <button
              className={`px-4 py-2 ${
                activeTab === 'search'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('search')}
            >
              Search Results
            </button>
          </div>

          {showAddForm && selectedPlace && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-2">{selectedPlace.name}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Rating
                  </label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  >
                    {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1].map((value) => (
                      <option key={value} value={value}>
                        {value} Stars
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    placeholder="Add notes about your visit..."
                    className="w-full p-2 border rounded-md"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={handleAddRestaurant}
                >
                  Add to List
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  onClick={() => {
                    setShowAddForm(false);
                    setSelectedPlace(null);
                    setNotes('');
                    setVisitDate(new Date().toISOString().split('T')[0]);
                    setRating(5);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="h-[calc(100vh-300px)] overflow-y-auto">
            {activeTab === 'saved' ? (
              <div className="space-y-4">
                {restaurants.length > 0 && (
                  <button
                    onClick={handleShare}
                    className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <span>Share List</span>
                  </button>
                )}
                <RestaurantList
                  restaurants={restaurants}
                  selectedId={selectedId}
                  onSelect={(r) => setSelectedId(r.id)}
                  onDelete={removeRestaurant}
                />
              </div>
            ) : (
              <SearchResultsList
                results={searchResults}
                onSelect={handlePlaceSelect}
                sortBy={sortBy}
                onSortChange={setSortBy}
                priceFilter={priceFilter}
                onPriceChange={setPriceFilter}
                ratingFilter={ratingFilter}
                onRatingChange={setRatingFilter}
                openNowOnly={openNowOnly}
                onOpenNowChange={setOpenNowOnly}
              />
            )}
          </div>

          {/* Share Modal */}
          {showShareModal && (
            <>
              <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setShowShareModal(false)}
              />
              <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div 
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">Share Your List</h3>
                        <p className="text-sm text-gray-500 mt-1">Copy the link to share your restaurant list</p>
                      </div>
                      <button
                        onClick={() => setShowShareModal(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <code className="block flex-1 font-mono text-sm text-gray-800 break-all">
                          {shareableLink}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shareableLink);
                            alert('Link copied!');
                          }}
                          className="shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right side - Map */}
      <div className="w-full md:w-2/3 h-[50vh] md:h-screen">
        <Suspense fallback={<div className="h-full w-full bg-gray-100 animate-pulse" />}>
          <Map
            searchZipCode={searchedZipCode}
            savedRestaurants={restaurants}
            selectedId={selectedId}
            onPlaceSelect={handlePlaceSelect}
            onSearchResults={setSearchResults}
            {...getMapFilters()}
          />
        </Suspense>
      </div>
    </main>
  );
}
