import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Education & Employment Dashboard
        </Typography>
        <Button 
          color="inherit" 
          component={Link} 
          to="/education"
          sx={{ 
            backgroundColor: location.pathname === '/education' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          EDUCATION OVERVIEW
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/employment"
          sx={{ 
            backgroundColor: location.pathname === '/employment' ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
          }}
        >
          EMPLOYMENT INSIGHTS
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
