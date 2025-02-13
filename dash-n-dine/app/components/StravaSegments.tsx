'use client';

import { useEffect, useState } from 'react';

interface StravaSegment {
  name: string;
  distance: number;
  avg_grade: number;
  elev_difference: number;
  climb_category: number;
  start_latlng: [number, number];
  end_latlng: [number, number];
}

interface StravaSegmentsProps {
  onSegmentSelect: (segment: StravaSegment | null) => void;
  selectedSegment: StravaSegment | null;
}

export default function StravaSegments({ onSegmentSelect, selectedSegment }: StravaSegmentsProps) {
  const [segments, setSegments] = useState<StravaSegment[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSegments() {
      try {
        const response = await fetch('/api/strava/segments');
        if (!response.ok) {
          throw new Error('Failed to fetch segments');
        }
        const data = await response.json();
        setSegments(data.segments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load segments');
      }
    }

    fetchSegments();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!segments.length) {
    return <div>Loading nearby segments...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Popular Routes Nearby</h2>
      <div className="space-y-4">
        {segments.map((segment, index) => (
          <div 
            key={index} 
            className={`border-b pb-3 last:border-b-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors ${
              selectedSegment === segment ? 'bg-blue-50 hover:bg-blue-100' : ''
            }`}
            onClick={() => onSegmentSelect(selectedSegment === segment ? null : segment)}
          >
            <h3 className="font-medium">{segment.name}</h3>
            <div className="text-sm text-gray-600 mt-1">
              <p>Distance: {(segment.distance / 1000).toFixed(1)}km</p>
              <p>Grade: {segment.avg_grade?.toFixed(1) || 'N/A'}%</p>
              <p>Elevation gain: {segment.elev_difference?.toFixed(0) || 'N/A'}m</p>
              <p>Category: {segment.climb_category || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 