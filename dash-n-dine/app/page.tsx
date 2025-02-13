'use client';

import { useState, useRef } from 'react';
import Map, { MapHandle } from './components/Map';
import StravaSegments from './components/StravaSegments';
import BlueskyFeed from './components/BlueskyFeed';
import NearbyRestaurants from './components/NearbyRestaurants';

interface StravaSegment {
  name: string;
  distance: number;
  avg_grade: number;
  elev_difference: number;
  climb_category: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
  path?: [number, number][];
}

export default function Home() {
  const [selectedSegment, setSelectedSegment] = useState<StravaSegment | null>(null);
  const mapRef = useRef<MapHandle>(null);

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Welcome to Dash-N-Dine</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Map ref={mapRef} selectedSegment={selectedSegment} />
            <div className="mt-8">
              <StravaSegments 
                selectedSegment={selectedSegment}
                onSegmentSelect={setSelectedSegment}
              />
            </div>
          </div>
          <div className="space-y-8">
            <NearbyRestaurants
              selectedSegment={selectedSegment}
              mapRef={mapRef}
            />
            <BlueskyFeed mapRef={mapRef} />
          </div>
        </div>
      </main>
    </div>
  );
}
