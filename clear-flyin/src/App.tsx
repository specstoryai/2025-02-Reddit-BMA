import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { useState } from 'react';
import RouteInput from './components/RouteInput';
import WeatherDisplay from './components/WeatherDisplay';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#146B3A',  // Christmas green
      dark: '#0B4121',
      light: '#1B8C4C'
    },
    secondary: {
      main: '#BB2528',  // Christmas red
      dark: '#8B1D1F',
      light: '#D4383B'
    },
    warning: {
      main: '#F8B229',  // Gold for alerts
      dark: '#C78E21',
      light: '#FFC547'
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#1C1C1C',
      secondary: '#666666'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#146B3A',  // Christmas green
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#0B4121',  // Darker green on hover
          }
        }
      }
    }
  }
});

function App() {
  const [route, setRoute] = useState<string>('');

  const handleRouteSubmit = (newRoute: string) => {
    setRoute(newRoute);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <RouteInput onRouteSubmit={handleRouteSubmit} />
        <WeatherDisplay route={route} />
      </Layout>
    </ThemeProvider>
  );
}

export default App;
