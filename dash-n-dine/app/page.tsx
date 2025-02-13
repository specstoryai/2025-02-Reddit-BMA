'use client';

import { useState } from 'react';
import Map from './components/Map';
import StravaSegments from './components/StravaSegments';

interface StravaSegment {
  name: string;
  distance: number;
  avg_grade: number;
  elev_difference: number;
  climb_category: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
}

export default function Home() {
  const [selectedSegment, setSelectedSegment] = useState<StravaSegment | null>(null);

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold">Welcome to Dash-N-Dine</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Map selectedSegment={selectedSegment} />
          <StravaSegments 
            selectedSegment={selectedSegment}
            onSegmentSelect={setSelectedSegment}
          />
        </div>
      </main>
    </div>
  );
}
