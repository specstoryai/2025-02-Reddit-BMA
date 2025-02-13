'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapProps {
  selectedSegment?: {
    name: string;
    start_latlng: [number, number];
    end_latlng: [number, number];
  } | null;
}

export default function Map({ selectedSegment }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerStart = useRef<mapboxgl.Marker | null>(null);
  const markerEnd = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (map.current) return;
    if (!mapContainer.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN as string;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-71.0589, 42.3601], // Boston coordinates
      zoom: 12
    });
  }, []);

  // Handle selected segment changes
  useEffect(() => {
    if (!map.current || !selectedSegment) {
      // Clear markers if no segment is selected
      markerStart.current?.remove();
      markerEnd.current?.remove();
      return;
    }

    // Remove existing markers
    markerStart.current?.remove();
    markerEnd.current?.remove();

    // Add start marker
    markerStart.current = new mapboxgl.Marker({ color: '#00ff00' })
      .setLngLat([selectedSegment.start_latlng[1], selectedSegment.start_latlng[0]])
      .setPopup(new mapboxgl.Popup().setHTML('Start: ' + selectedSegment.name))
      .addTo(map.current);

    // Add end marker
    markerEnd.current = new mapboxgl.Marker({ color: '#ff0000' })
      .setLngLat([selectedSegment.end_latlng[1], selectedSegment.end_latlng[0]])
      .setPopup(new mapboxgl.Popup().setHTML('End: ' + selectedSegment.name))
      .addTo(map.current);

    // Fit map to show both markers
    const bounds = new mapboxgl.LngLatBounds()
      .extend([selectedSegment.start_latlng[1], selectedSegment.start_latlng[0]])
      .extend([selectedSegment.end_latlng[1], selectedSegment.end_latlng[0]]);

    map.current.fitBounds(bounds, {
      padding: 100,
      duration: 1000
    });
  }, [selectedSegment]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-lg shadow-lg"
    />
  );
} 