import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { LocationOn, Today, Person } from '@mui/icons-material';

const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

function CardinalCard({ cardinal, index }) {
  const navigate = useNavigate();
  
  // Handle missing data
  const {
    name = 'Unknown Name',
    country = 'Unknown Country',
    birth_date = 'Unknown Birth Date',
    appointing_pope = 'Unknown Pope',
    photo_url,
    biography_text = ''
  } = cardinal;

  const handleViewDetails = () => {
    // Use the index if available, otherwise use the name as a fallback
    if (typeof index === 'number') {
      navigate(`/cardinals/${index}`);
    } else {
      // Create a simple slug - for more reliable navigation
      const simpleName = name.split(' ').pop().toLowerCase();
      navigate(`/cardinals/${simpleName}`);
    }
  };

  // Get a short bio excerpt if available
  const bioExcerpt = biography_text 
    ? biography_text.substring(0, 120) + (biography_text.length > 120 ? '...' : '')
    : 'No biography available.';

  return (
    <Card 
      className="cardinal-card"
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 6
        }
      }}
    >
      <CardMedia
        component="img"
        height="250"
        image={photo_url || defaultImage}
        alt={name}
        sx={{ 
          objectFit: 'contain', 
          bgcolor: '#f5f5f5',
          objectPosition: 'center'
        }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {name}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            icon={<LocationOn />} 
            label={country} 
            size="small" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            icon={<Today />} 
            label={birth_date} 
            size="small" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            icon={<Person />} 
            label={`Appointed by ${appointing_pope}`} 
            size="small" 
            sx={{ mb: 1 }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {bioExcerpt}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ my: 2 }} />
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleViewDetails}
            fullWidth
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CardinalCard; 