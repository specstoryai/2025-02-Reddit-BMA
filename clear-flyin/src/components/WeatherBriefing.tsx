import { Box, Paper, Typography, Divider, Chip, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { RoutePoint } from '../utils/routeUtils';
import { Cloud, Wind, WxCode } from '../utils/weatherService';

interface WeatherBriefingProps {
  routePoints: RoutePoint[];
}

const getFlightRulesColor = (rules: string) => {
  switch (rules) {
    case 'VFR':
      return '#4caf50';  // Green
    case 'MVFR':
      return '#2196f3';  // Blue
    case 'IFR':
      return '#f44336';  // Red
    case 'LIFR':
      return '#9c27b0';  // Purple
    default:
      return '#757575';  // Grey
  }
};

const getWindString = (direction: Wind, speed: Wind, gust?: Wind) => {
  return `${direction.value}° at ${speed.value}kts${gust ? ` (gusting ${gust.value}kts)` : ''}`;
};

const getVisibilityString = (visibility: { value: number; repr: string }) => {
  return visibility.repr;
};

const getCloudString = (cloud: Cloud) => {
  return cloud.repr;
};

const getWeatherString = (code: WxCode) => {
  return code.repr;
};

const WeatherBriefing = ({ routePoints }: WeatherBriefingProps) => {
  // Find the worst flight rules along the route
  const worstConditions = routePoints.reduce((worst, point) => {
    if (!point.weather) return worst;
    const rules = ['VFR', 'MVFR', 'IFR', 'LIFR'];
    const currentIndex = rules.indexOf(point.weather.flight_rules);
    const worstIndex = rules.indexOf(worst);
    return currentIndex > worstIndex ? point.weather.flight_rules : worst;
  }, 'VFR');

  // Check for significant weather
  const significantWeather = routePoints.filter(point => 
    point.weather?.wx_codes.length || 
    point.weather?.wind_speed.value >= 15 ||
    (point.weather?.visibility.value || 0) <= 5
  );

  return (
    <Paper elevation={1} sx={{ mb: 2 }}>
      <Accordion defaultExpanded={false}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            '& .MuiAccordionSummary-content': {
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }
          }}
        >
          <Typography variant="h6" sx={{ color: 'primary.main' }}>
            Weather Briefing Summary
          </Typography>
          <Chip 
            size="small"
            label={worstConditions}
            sx={{ 
              bgcolor: getFlightRulesColor(worstConditions),
              color: 'white',
              fontWeight: 'bold'
            }}
          />
          {significantWeather.length > 0 && (
            <Chip
              size="small"
              label={`${significantWeather.length} Weather Alert${significantWeather.length > 1 ? 's' : ''}`}
              color="warning"
            />
          )}
        </AccordionSummary>
        
        <AccordionDetails sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Route Overview:
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {routePoints.map(point => point.code).join(' → ')}
            </Typography>
          </Box>

          {significantWeather.length > 0 && (
            <>
              <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
                Significant Weather:
              </Typography>
              {significantWeather.map(point => (
                <Box key={point.code} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {point.code}:
                  </Typography>
                  {point.weather && (
                    <Box sx={{ pl: 2 }}>
                      {point.weather.wx_codes.length > 0 && (
                        <Typography variant="body2">
                          • Weather: {point.weather.wx_codes.map(getWeatherString).join(', ')}
                        </Typography>
                      )}
                      {point.weather.wind_speed.value >= 15 && (
                        <Typography variant="body2">
                          • Strong Winds: {getWindString(
                            point.weather.wind_direction,
                            point.weather.wind_speed,
                            point.weather.wind_gust
                          )}
                        </Typography>
                      )}
                      {(point.weather.visibility.value || 0) <= 5 && (
                        <Typography variant="body2">
                          • Reduced Visibility: {getVisibilityString(point.weather.visibility)}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
            </>
          )}

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Station Details:
          </Typography>
          {routePoints.map((point, index) => (
            <Box key={point.code} sx={{ mb: index < routePoints.length - 1 ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {point.code}
                </Typography>
                {point.weather && (
                  <Chip 
                    size="small"
                    label={point.weather.flight_rules}
                    sx={{ 
                      bgcolor: getFlightRulesColor(point.weather.flight_rules),
                      color: 'white'
                    }}
                  />
                )}
              </Box>
              {point.weather ? (
                <Box sx={{ pl: 2 }}>
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
                  <Typography variant="body2">
                    Temperature: {point.weather.temperature.value}°{point.weather.units.temperature}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="error" sx={{ pl: 2 }}>
                  Weather data unavailable
                </Typography>
              )}
            </Box>
          ))}
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default WeatherBriefing; 