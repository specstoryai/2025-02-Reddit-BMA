import { fetchAirportWeather, WeatherInfo } from './weatherService';

export interface RoutePoint {
  code: string;
  coordinates: [number, number];
  weather: WeatherInfo | null;
}

async function getAirportCoordinates(code: string): Promise<[number, number] | null> {
  try {
    const response = await fetch(`http://localhost:3001/api/airport/${code}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.coordinates;
  } catch (error) {
    console.error('Error fetching airport coordinates:', error);
    return null;
  }
}

export async function parseRoute(routeString: string): Promise<RoutePoint[]> {
  const waypoints = routeString.trim().toUpperCase().split(/\s+/);
  
  const results = await Promise.all(
    waypoints.map(async (code) => {
      const coordinates = await getAirportCoordinates(code);
      if (coordinates) {
        const weather = await fetchAirportWeather(code);
        return { code, coordinates, weather };
      }
      return null;
    })
  );

  return results.filter((point): point is RoutePoint => point !== null);
}

export function getBoundsFromRoute(route: RoutePoint[]): [[number, number], [number, number]] | null {
  if (route.length === 0) return null;

  const lats = route.map(point => point.coordinates[0]);
  const lngs = route.map(point => point.coordinates[1]);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add padding to the bounds
  const latPadding = (maxLat - minLat) * 0.1;
  const lngPadding = (maxLng - minLng) * 0.1;

  return [
    [minLat - latPadding, minLng - lngPadding],
    [maxLat + latPadding, maxLng + lngPadding]
  ];
} 