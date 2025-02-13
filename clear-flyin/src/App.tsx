import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import { useState } from 'react';
import RouteInput from './components/RouteInput';
import WeatherDisplay from './components/WeatherDisplay';
import Layout from './components/Layout';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
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
