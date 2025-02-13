import { useState } from 'react';
import { Paper, TextField, Button, Box, Typography } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

interface RouteInputProps {
  onRouteSubmit: (route: string) => void;
}

const RouteInput = ({ onRouteSubmit }: RouteInputProps) => {
  const [route, setRoute] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRouteSubmit(route);
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2,
        borderRadius: 1
      }}
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}>
          <Box sx={{ 
            minWidth: { md: '200px' },
            display: { xs: 'none', md: 'block' }
          }}>
            <Typography variant="h6" sx={{ color: 'primary.main' }}>
              Enter Flight Route
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Route"
            variant="outlined"
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="Enter waypoints (e.g., KBOS KORD KDEN)"
            size="small"
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<FlightTakeoffIcon />}
            sx={{ 
              minWidth: '120px',
              whiteSpace: 'nowrap'
            }}
          >
            Check Weather
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default RouteInput; 