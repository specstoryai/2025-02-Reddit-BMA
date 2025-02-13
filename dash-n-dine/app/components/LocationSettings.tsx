'use client';

import { useState, useEffect } from 'react';

const LOCATION_STORAGE_KEY = 'default-location';
const DEFAULT_BOSTON_COORDS = {
  lat: 42.3601,
  lng: -71.0589
};

interface LocationSettingsProps {
  onLocationChange: (coords: { lat: number; lng: number }) => void;
}

export function getDefaultLocation(): { lat: number; lng: number } {
  if (typeof window === 'undefined') return DEFAULT_BOSTON_COORDS;
  
  const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!stored) return DEFAULT_BOSTON_COORDS;
  
  try {
    return JSON.parse(stored);
  } catch (err) {
    console.error('Error parsing stored location:', err);
    return DEFAULT_BOSTON_COORDS;
  }
}

export default function LocationSettings({ onLocationChange }: LocationSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultLocation = getDefaultLocation();
    setLat(defaultLocation.lat.toString());
    setLng(defaultLocation.lng.toString());
  }, []);

  function handleSave() {
    const newLat = parseFloat(lat);
    const newLng = parseFloat(lng);

    if (isNaN(newLat) || isNaN(newLng)) {
      setError('Please enter valid numbers for latitude and longitude');
      return;
    }

    if (newLat < -90 || newLat > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (newLng < -180 || newLng > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    const newLocation = { lat: newLat, lng: newLng };
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
    onLocationChange(newLocation);
    setIsEditing(false);
    setError(null);
  }

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">
          Default location: {lat}, {lng}
        </span>
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div>
          <label htmlFor="lat" className="block text-xs text-gray-500">Latitude</label>
          <input
            id="lat"
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="block w-32 px-2 py-1 text-sm border rounded"
            placeholder="42.3601"
          />
        </div>
        <div>
          <label htmlFor="lng" className="block text-xs text-gray-500">Longitude</label>
          <input
            id="lng"
            type="text"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            className="block w-32 px-2 py-1 text-sm border rounded"
            placeholder="-71.0589"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setError(null);
              const defaultLocation = getDefaultLocation();
              setLat(defaultLocation.lat.toString());
              setLng(defaultLocation.lng.toString());
            }}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 