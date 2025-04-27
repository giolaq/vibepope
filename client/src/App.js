import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CardinalsList from './pages/CardinalsList';
import CardinalDetail from './pages/CardinalDetail';
import CardinalMatch from './pages/CardinalMatch';
import About from './pages/About';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cardinals" element={<CardinalsList />} />
          <Route path="/cardinals/:id" element={<CardinalDetail />} />
          <Route path="/match" element={<CardinalMatch />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.grey[100],
          textAlign: 'center'
        }}
      >
        <span>© {new Date().getFullYear()} VibePope - May the Holy Vibes Be With You!</span>
      </Box>
    </Box>
  );
}

export default App; 