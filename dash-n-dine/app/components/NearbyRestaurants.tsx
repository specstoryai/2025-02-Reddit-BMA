'use client';

import { useEffect, useState } from 'react';
import { MapHandle } from './Map';

interface Restaurant {
  name: string;
  coordinates: [number, number];
  distance: number;
  postIndex: number;
}

interface StravaSegment {
  name: string;
  start_latlng: [number, number];
}

interface CachedLocation {
  name: string;
  coordinates: [number, number];
  postIndex: number;
}

interface CachedPost {
  text: string;
  createdAt: string;
  images: {
    url: string;
    alt: string;
  }[];
  location?: {
    name: string;
    coordinates: [number, number];
  };
}

interface CacheData {
  posts: CachedPost[];
  cursor: string | null;
  timestamp: number;
  locations: CachedLocation[];
}

interface NearbyRestaurantsProps {
  selectedSegment: StravaSegment | null;
  mapRef: React.RefObject<MapHandle | null>;
}

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

export default function NearbyRestaurants({ selectedSegment, mapRef }: NearbyRestaurantsProps) {
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [totalRestaurants, setTotalRestaurants] = useState<number>(0);

  useEffect(() => {
    if (!selectedSegment) {
      setNearbyRestaurants([]);
      setTotalRestaurants(0);
      return;
    }

    // Get cached restaurants
    const CACHE_KEY = 'bluesky-restaurants-cache';
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return;

    try {
      const cacheData = JSON.parse(cached) as CacheData;
      if (!cacheData.posts || !Array.isArray(cacheData.posts)) {
        console.error('Invalid cache data structure');
        return;
      }

      // Extract locations from posts
      const locations = cacheData.posts.reduce<CachedLocation[]>((acc, post, index) => {
        if (post.location) {
          acc.push({
            name: post.location.name,
            coordinates: post.location.coordinates,
            postIndex: index
          });
        }
        return acc;
      }, []);

      setTotalRestaurants(locations.length);
      
      // Calculate distances and sort
      const restaurantsWithDistance = locations.map((loc: CachedLocation) => ({
        name: loc.name,
        coordinates: loc.coordinates,
        postIndex: loc.postIndex,
        distance: calculateDistance(
          selectedSegment.start_latlng[0],
          selectedSegment.start_latlng[1],
          // Convert from [lng, lat] to [lat, lng] for calculation
          loc.coordinates[1],
          loc.coordinates[0]
        )
      }));

      // Sort by distance and take top 3
      const closest = restaurantsWithDistance
        .sort((a: Restaurant, b: Restaurant) => a.distance - b.distance)
        .slice(0, 3);

      setNearbyRestaurants(closest);
    } catch (err) {
      console.error('Error finding nearby restaurants:', err);
    }
  }, [selectedSegment]);

  function handleShowOnMap(coordinates: [number, number]) {
    if (!mapRef.current || !selectedSegment) return;
    
    // Center on the restaurant location
    mapRef.current.centerOnLocation(coordinates);
    
    // Draw a line from segment start to restaurant
    // Note: Convert from [lat, lng] to [lng, lat] for the segment start
    const segmentStartPoint: [number, number] = [
      selectedSegment.start_latlng[1],
      selectedSegment.start_latlng[0]
    ];
    mapRef.current.showConnectionLine(segmentStartPoint, coordinates);
  }

  if (!selectedSegment) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm">Select a route to see nearby restaurants</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex flex-col mb-4">
        <h2 className="text-xl font-semibold">Nearby Restaurants</h2>
        {totalRestaurants > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            Showing closest 3 of {totalRestaurants} restaurants
          </p>
        )}
      </div>
      <div className="space-y-4">
        {nearbyRestaurants.map((restaurant, index) => (
          <div key={index} className="border-b pb-3 last:border-b-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{restaurant.name}</h3>
                <p className="text-sm text-gray-500">
                  {restaurant.distance.toFixed(1)}km from start
                </p>
              </div>
              <button
                onClick={() => handleShowOnMap(restaurant.coordinates)}
                className="text-sm px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Show on Map
              </button>
            </div>
          </div>
        ))}
        {nearbyRestaurants.length === 0 && (
          <p className="text-sm text-gray-500 text-center">
            No restaurants found nearby
          </p>
        )}
      </div>
    </div>
  );
} 