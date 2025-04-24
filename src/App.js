// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import Navbar from './components/Navbar';
import EducationPage from './pages/EducationPage';
import EmploymentPage from './pages/EmploymentPage';
import { DataProvider } from './context/DataContext';

function App() {
  return (
    <Router basename={process.env.PUBLIC_URL}>
      <DataProvider>
        <CssBaseline />
        <Navbar />
        <Container maxWidth={false} sx={{ mt: 4, px: 2 }}>
          <Routes>
            {/* Redirect root to education */}
            <Route path="/" element={<Navigate to="/education" replace />} />
            
            {/* Education route */}
            <Route path="/education" element={<EducationPage />} />
            
            {/* Employment route */}
            <Route path="/employment" element={<EmploymentPage />} />
            
            {/* Catch all redirect to education */}
            <Route path="*" element={<Navigate to="/education" replace />} />
          </Routes>
        </Container>
      </DataProvider>
    </Router>
  );
}

export default App;
