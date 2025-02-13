import { useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Libraries } from '@react-google-maps/api';
import type { Restaurant } from '@/hooks/useRestaurants';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060 // New York City as default
};

interface MapProps {
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  savedRestaurants?: Restaurant[];
  selectedId?: string;
  searchZipCode?: string;
  onSearchResults?: (results: google.maps.places.PlaceResult[]) => void;
  minRating?: number;
  maxPrice?: number;
  openNowOnly?: boolean;
}

// Add helper functions for filtering
const isOpenNow = (place: google.maps.places.PlaceResult): boolean => {
  return !!place.opening_hours?.isOpen?.();
};

const getRating = (place: google.maps.places.PlaceResult): number => {
  return place.rating || 0;
};

const getPriceLevel = (place: google.maps.places.PlaceResult): number => {
  return place.price_level || 0;
};

const deduplicateResults = (
  results: google.maps.places.PlaceResult[],
  existingPlaces: Restaurant[] = []
): google.maps.places.PlaceResult[] => {
  const seen = new Set(existingPlaces.map(r => r.placeId));
  return results.filter(place => {
    if (!place.place_id || seen.has(place.place_id)) {
      return false;
    }
    seen.add(place.place_id);
    return true;
  });
};

const filterAndSortResults = (
  results: google.maps.places.PlaceResult[],
  options: {
    minRating?: number;
    maxPrice?: number;
    openNow?: boolean;
    cuisineTypes?: string[];
  }
): google.maps.places.PlaceResult[] => {
  return results.filter(place => {
    if (options.minRating && getRating(place) < options.minRating) {
      return false;
    }
    if (options.maxPrice && getPriceLevel(place) > options.maxPrice) {
      return false;
    }
    if (options.openNow && !isOpenNow(place)) {
      return false;
    }
    if (options.cuisineTypes?.length && !place.types?.some(type => 
      options.cuisineTypes?.includes(type.replace(/_/g, ' '))
    )) {
      return false;
    }
    return true;
  }).sort((a, b) => getRating(b) - getRating(a));
};

// Define libraries array as a static constant
const GOOGLE_MAPS_LIBRARIES: Libraries = ['places'];

export default function Map({ 
  onPlaceSelect, 
  savedRestaurants = [], 
  selectedId, 
  searchZipCode, 
  onSearchResults,
  minRating,
  maxPrice,
  openNowOnly
}: MapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || '',
    libraries: GOOGLE_MAPS_LIBRARIES
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [zoom, setZoom] = useState(11);
  const [isSearching, setIsSearching] = useState(false);

  const searchNearby = useCallback(async (zipCode: string) => {
    if (!map || !zipCode) return;

    const geocoder = new google.maps.Geocoder();
    const placesService = new google.maps.places.PlacesService(map);

    try {
      // First, geocode the zip code to get coordinates
      const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        geocoder.geocode({ 
          address: zipCode,
          componentRestrictions: { country: 'US' } // Ensure US zip codes
        }, (results, status) => {
          if (status === 'OK' && results) {
            resolve(results);
          } else {
            reject(`Geocoding failed: ${status}`);
          }
        });
      });

      const location = result[0].geometry.location;
      map.setCenter(location);
      map.setZoom(14);

      // Then search for restaurants near that location
      const searchOptions: google.maps.places.PlaceSearchRequest = {
        location,
        radius: 2000,
        type: 'restaurant',
        keyword: 'restaurant'
      };

      const getAllResults = async (
        request: google.maps.places.PlaceSearchRequest
      ): Promise<google.maps.places.PlaceResult[]> => {
        return new Promise((resolve, reject) => {
          placesService.nearbySearch(request, (results, status) => {
            if (status === 'OK' && results) {
              // Apply filters and deduplication
              const filteredResults = filterAndSortResults(
                deduplicateResults(results, savedRestaurants),
                {
                  minRating: minRating || 0,
                  maxPrice: maxPrice,
                  openNow: openNowOnly
                }
              );
              resolve(filteredResults);
            } else if (status === 'ZERO_RESULTS') {
              resolve([]);
            } else {
              reject(`Search failed: ${status}`);
            }
          });
        });
      };

      try {
        const places = await getAllResults(searchOptions);
        
        if (places.length === 0) {
          // Try broader search with different parameters
          const broadSearch: google.maps.places.PlaceSearchRequest = {
            ...searchOptions,
            radius: 5000,
            type: 'establishment',
            keyword: 'food'
          };
          const broadResults = await getAllResults(broadSearch);
          
          if (broadResults.length === 0) {
            console.warn('No restaurants found in this area');
          } else {
            setSearchResults(broadResults);
            onSearchResults?.(broadResults);
          }
        } else {
          setSearchResults(places);
          onSearchResults?.(places);
        }
      } catch (searchError) {
        console.error('Error during place search:', searchError);
        throw searchError;
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onSearchResults?.([]);
    }
  }, [map, onSearchResults, savedRestaurants, minRating, maxPrice, openNowOnly]);

  const searchAtCurrentLocation = useCallback(async () => {
    if (!map) return;
    
    setIsSearching(true);
    const center = map.getCenter();
    if (!center) return;

    const placesService = new google.maps.places.PlacesService(map);

    try {
      const searchOptions: google.maps.places.PlaceSearchRequest = {
        location: center,
        radius: 2000,
        type: 'restaurant',
        keyword: 'restaurant'
      };

      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
        placesService.nearbySearch(searchOptions, (results, status) => {
          if (status === 'OK' && results) {
            const filteredResults = filterAndSortResults(
              deduplicateResults(results, savedRestaurants),
              {
                minRating: minRating || 0,
                maxPrice,
                openNow: openNowOnly
              }
            );
            resolve(filteredResults);
          } else if (status === 'ZERO_RESULTS') {
            resolve([]);
          } else {
            reject(`Search failed: ${status}`);
          }
        });
      });

      setSearchResults(results);
      onSearchResults?.(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, [map, onSearchResults, savedRestaurants, minRating, maxPrice, openNowOnly]);

  // Update search when zip code changes
  useEffect(() => {
    if (searchZipCode) {
      searchNearby(searchZipCode);
    }
  }, [searchZipCode, searchNearby]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    
    // Add zoom listener
    map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() || 11);
    });
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMarkerClick = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
  };

  if (loadError) {
    return <div className="p-4 text-red-500">Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={defaultCenter}
        zoom={11}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Show search results */}
        {searchResults.map((place) => place.geometry?.location && (
          <Marker
            key={place.place_id}
            position={place.geometry.location}
            title={place.name}
            onClick={() => handleMarkerClick(place)}
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
            }}
          />
        ))}

        {/* Show saved restaurants */}
        {savedRestaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={restaurant.location}
            title={restaurant.name}
            icon={{
              url: selectedId === restaurant.id
                ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          />
        ))}

        {/* Info Window for selected place */}
        {selectedPlace && selectedPlace.geometry?.location && (
          <InfoWindow
            position={selectedPlace.geometry.location}
            onCloseClick={() => setSelectedPlace(null)}
          >
            <div className="p-2">
              <h3 className="font-medium">{selectedPlace.name}</h3>
              {selectedPlace.vicinity && (
                <p className="text-sm text-gray-600">{selectedPlace.vicinity}</p>
              )}
              <button
                onClick={() => {
                  onPlaceSelect?.(selectedPlace);
                  setSelectedPlace(null);
                }}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
              >
                Add to List
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Refresh button - only show when zoomed in */}
      {zoom > 12 && (
        <button
          onClick={searchAtCurrentLocation}
          disabled={isSearching}
          className="absolute top-4 right-4 px-4 py-2 bg-white rounded-md shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <svg 
            className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          {isSearching ? 'Searching...' : 'Search This Area'}
        </button>
      )}
    </div>
  );
} 