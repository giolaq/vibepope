import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress
} from '@mui/material';
import { getCardinals } from '../services/api';
import CardinalCard from '../components/CardinalCard';

function Home() {
  const [featuredCardinals, setFeaturedCardinals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCardinals = async () => {
      try {
        setLoading(true);
        const data = await getCardinals(1, 4); // Get first 4 cardinals for featured section
        setFeaturedCardinals(data.cardinals);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured cardinals');
        setLoading(false);
        console.error('Error fetching featured cardinals:', err);
      }
    };

    fetchFeaturedCardinals();
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg')`,
          height: { xs: '60vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.6)',
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', py: 6 }}>
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            VibePope
          </Typography>
          <Typography variant="h5" color="inherit" paragraph>
            Find your favorite future pope and check their holy vibes!
            Who's got the right stuff for the big hat? Let's find out!
          </Typography>
          <Button
            component={RouterLink}
            to="/cardinals"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 4 }}
          >
            Rate Some Cardinals
          </Button>
        </Container>
      </Paper>

      {/* Featured Cardinals Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          Holy Hotshots
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          These cardinals are bringing the sacred vibes! Check out who might be rocking the papal throne next
        </Typography>
        <Divider sx={{ mb: 6 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredCardinals.map((cardinal, index) => (
              <Grid item key={cardinal.name} xs={12} sm={6} md={3}>
                <CardinalCard cardinal={cardinal} index={index} />
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button 
            component={RouterLink} 
            to="/cardinals" 
            variant="outlined" 
            color="primary"
            size="large"
          >
            See All Papal Contenders
          </Button>
        </Box>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h3" align="center" gutterBottom>
            What's This All About?
          </Typography>
          <Typography variant="body1" paragraph align="center">
            VibePope helps you explore the world of cardinals with a smile! We've gathered data on these holy men
            who might one day don the fancy white robes. Browse their bios, check their credentials, and decide
            who you'd like to see waving from the balcony of St. Peter's! 
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/about"
              variant="contained"
              color="secondary"
            >
              The Sacred Details
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 