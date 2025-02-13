import { Box, AppBar, Toolbar, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100vw',
      bgcolor: '#f5f5f5',
      overflow: 'hidden'
    }}>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Typography variant="h5" component="div">
            Aviation Weather Route Planner
          </Typography>
        </Toolbar>
      </AppBar>
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1,
          overflow: 'hidden',
          width: '100%'
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 