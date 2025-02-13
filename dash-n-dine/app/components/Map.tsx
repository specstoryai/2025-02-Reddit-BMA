'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapProps {
  selectedSegment?: {
    name: string;
    start_latlng: [number, number];
    end_latlng: [number, number];
    path?: [number, number][];
  } | null;
}

export interface MapHandle {
  centerOnLocation: (coordinates: [number, number], zoom?: number) => void;
  showConnectionLine: (from: [number, number], to: [number, number]) => void;
}

const Map = forwardRef<MapHandle, MapProps>(({ selectedSegment }, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerStart = useRef<mapboxgl.Marker | null>(null);
  const markerEnd = useRef<mapboxgl.Marker | null>(null);
  const segmentLine = useRef<mapboxgl.GeoJSONSource | null>(null);
  const locationMarker = useRef<mapboxgl.Marker | null>(null);
  const connectionLine = useRef<mapboxgl.GeoJSONSource | null>(null);

  // Expose the centerOnLocation method
  useImperativeHandle(ref, () => ({
    centerOnLocation: (coordinates: [number, number], zoom: number = 15) => {
      if (!map.current) return;

      // Remove previous location marker if it exists
      locationMarker.current?.remove();

      // Add a new marker
      locationMarker.current = new mapboxgl.Marker({ color: '#4B5563' })
        .setLngLat(coordinates)
        .addTo(map.current);

      // Center the map on the coordinates
      map.current.flyTo({
        center: coordinates,
        zoom,
        duration: 1500
      });
    },
    showConnectionLine: (from: [number, number], to: [number, number]) => {
      if (!map.current || !connectionLine.current) return;

      // Update the connection line
      connectionLine.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: [from, to]
        }
      });

      // Fit the map to show both points
      const bounds = new mapboxgl.LngLatBounds()
        .extend(from)
        .extend(to);

      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1500
      });
    }
  }));

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

    // Add sources and layers for the segment path and connection line
    map.current.on('load', () => {
      map.current?.addSource('segment', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current?.addSource('connection', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.current?.addLayer({
        id: 'segment',
        type: 'line',
        source: 'segment',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#ff4444',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      map.current?.addLayer({
        id: 'connection',
        type: 'line',
        source: 'connection',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4B5563',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.6
        }
      });

      segmentLine.current = map.current?.getSource('segment') as mapboxgl.GeoJSONSource;
      connectionLine.current = map.current?.getSource('connection') as mapboxgl.GeoJSONSource;
    });
  }, []);

  // Handle selected segment changes
  useEffect(() => {
    if (!map.current || !segmentLine.current) return;

    // Clear markers
    markerStart.current?.remove();
    markerEnd.current?.remove();

    if (!selectedSegment) {
      // Clear the segment line
      segmentLine.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      });
      return;
    }

    // Update the segment line if path data is available
    if (selectedSegment.path) {
      const coordinates = selectedSegment.path.map(([lat, lng]) => [lng, lat]);
      segmentLine.current.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates
        }
      });
    }

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

    // Fit map to show the entire segment
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add path points to bounds if available
    if (selectedSegment.path) {
      selectedSegment.path.forEach(([lat, lng]) => {
        bounds.extend([lng, lat]);
      });
    } else {
      // Fallback to just start/end points if no path
      bounds.extend([selectedSegment.start_latlng[1], selectedSegment.start_latlng[0]])
            .extend([selectedSegment.end_latlng[1], selectedSegment.end_latlng[0]]);
    }

    map.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }, [selectedSegment]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[400px] rounded-lg shadow-lg"
    />
  );
});

Map.displayName = 'Map';

export default Map; 