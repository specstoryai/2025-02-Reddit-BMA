import { useEffect, useState } from 'react';
import { Paper, Typography, CircularProgress, Box, Divider } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { parseRoute, getBoundsFromRoute, RoutePoint } from '../utils/routeUtils';
import { Cloud, Wind, WxCode } from '../utils/weatherService';
import WindArrow from './WindArrow';
import WeatherBriefing from './WeatherBriefing';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface WeatherDisplayProps {
  route: string;
}

// Component to handle map bounds
const MapBounds: React.FC<{ routePoints: RoutePoint[] }> = ({ routePoints }) => {
  const map = useMap();
  
  useEffect(() => {
    const bounds = getBoundsFromRoute(routePoints);
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, routePoints]);

  return null;
};

function getWindString(direction: Wind, speed: Wind, gust?: Wind) {
  return `${direction.value}° at ${speed.value}kts${gust ? ` (gusting ${gust.value}kts)` : ''}`;
}

function getVisibilityString(visibility: { value: number; repr: string }) {
  return visibility.repr;
}

function getCloudString(cloud: Cloud) {
  return cloud.repr;
}

function getWeatherString(code: WxCode) {
  return code.repr;
}

const WeatherDisplay = ({ route }: WeatherDisplayProps) => {
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!route) {
      setRoutePoints([]);
      return;
    }

    const loadRoute = async () => {
      setLoading(true);
      setError(null);
      try {
        const points = await parseRoute(route);
        if (points.length === 0) {
          setError('No valid airports found in route');
        }
        setRoutePoints(points);
      } catch (err) {
        setError('Error parsing route');
        console.error('Route parsing error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRoute();
  }, [route]);

  if (!route) {
    return null;
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ flex: 1 }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        sx={{ flex: 1 }}
      >
        <Typography 
          color="error" 
          variant="h6"
          textAlign="center"
        >
          {error}
        </Typography>
      </Box>
    );
  }

  const polylinePositions = routePoints.map(point => point.coordinates);

  return (
    <Box 
      sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        gap: 2,
        p: 2
      }}
    >
      <WeatherBriefing routePoints={routePoints} />
      
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          borderRadius: 1
        }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapBounds routePoints={routePoints} />
            <Polyline 
              positions={polylinePositions}
              color="#1976d2"
              weight={3}
              opacity={0.8}
            />
            {routePoints.map((point, index) => (
              <Box key={`${point.code}-${index}`}>
                <Marker 
                  position={point.coordinates}
                >
                  <Popup>
                    <Box sx={{ minWidth: '200px' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {point.code}
                      </Typography>
                      {point.weather ? (
                        <>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Flight Rules: {point.weather.flight_rules}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Wind: {getWindString(
                              point.weather.wind_direction,
                              point.weather.wind_speed,
                              point.weather.wind_gust
                            )}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Visibility: {getVisibilityString(point.weather.visibility)}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Temperature: {point.weather.temperature.value}°{point.weather.units.temperature}
                          </Typography>
                          {point.weather.clouds.length > 0 && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Clouds: {point.weather.clouds.map(getCloudString).join(', ')}
                            </Typography>
                          )}
                          {point.weather.wx_codes.length > 0 && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Weather: {point.weather.wx_codes.map(getWeatherString).join(', ')}
                            </Typography>
                          )}
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {point.weather.raw}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="error">
                          Weather data unavailable
                        </Typography>
                      )}
                    </Box>
                  </Popup>
                </Marker>
                {point.weather && (
                  <WindArrow
                    position={[
                      point.coordinates[0],      // Same latitude as airport
                      point.coordinates[1]       // Same longitude as airport
                    ]}
                    windDirection={point.weather.wind_direction}
                    windSpeed={point.weather.wind_speed}
                  />
                )}
              </Box>
            ))}
          </MapContainer>
        </Box>
        
        <Paper 
          elevation={1}
          sx={{ 
            width: '300px',
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            gap: 2,
            p: 2,
            borderRadius: 0,
            overflow: 'auto'
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
              Route Details
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {routePoints.map(point => point.code).join(' → ')}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 'medium' }}>
              Weather Summary
            </Typography>
            
            {routePoints.map((point, index) => (
              <Box key={point.code}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                  {point.code}
                </Typography>
                {point.weather ? (
                  <>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {point.weather.flight_rules} conditions
                    </Typography>
                    <Typography variant="body2">
                      Wind: {getWindString(
                        point.weather.wind_direction,
                        point.weather.wind_speed,
                        point.weather.wind_gust
                      )}
                    </Typography>
                    <Typography variant="body2">
                      Visibility: {getVisibilityString(point.weather.visibility)}
                    </Typography>
                    {point.weather.clouds.length > 0 && (
                      <Typography variant="body2">
                        Clouds: {point.weather.clouds.map(getCloudString).join(', ')}
                      </Typography>
                    )}
                    {point.weather.wx_codes.length > 0 && (
                      <Typography variant="body2">
                        Weather: {point.weather.wx_codes.map(getWeatherString).join(', ')}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      Altimeter: {point.weather.altimeter.repr}
                    </Typography>
                    <Typography variant="body2">
                      Dewpoint: {point.weather.dewpoint.value}°{point.weather.units.temperature}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" color="error">
                    Weather data unavailable
                  </Typography>
                )}
                {index < routePoints.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default WeatherDisplay; 