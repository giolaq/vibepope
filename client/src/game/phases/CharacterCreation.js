import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Button,
  Chip,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import { LocationOn, Refresh } from '@mui/icons-material';
import { useGame } from '../GameState';

// Default image if cardinal photo is missing
const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image+Available';

// Number of cardinals to display for selection
const CARDINALS_TO_DISPLAY = 9;

function CharacterCreation() {
  const { cardinals, selectPlayerCardinal, loading, error } = useGame();
  const [selectedCardinal, setSelectedCardinal] = useState(null);
  const [randomCardinals, setRandomCardinals] = useState([]);

  // Select random cardinals when component mounts or when refresh is clicked
  useEffect(() => {
    if (cardinals.length > 0) {
      selectRandomCardinals();
    }
  }, [cardinals]);

  // Function to randomly select cardinals
  const selectRandomCardinals = () => {
    // Make a copy of the cardinals array to avoid modifying the original
    const shuffled = [...cardinals];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Select the first CARDINALS_TO_DISPLAY cardinals
    setRandomCardinals(shuffled.slice(0, CARDINALS_TO_DISPLAY));
    
    // Clear any previously selected cardinal
    setSelectedCardinal(null);
  };

  // Handle cardinal selection
  const handleSelectCardinal = (cardinal) => {
    setSelectedCardinal(cardinal);
    
    // Dispatch custom event with selected cardinal
    const customEvent = new CustomEvent('cardinalSelected', { 
      detail: { cardinal },
      bubbles: true 
    });
    window.dispatchEvent(customEvent);
  };

  // Confirm selection and proceed to next phase
  const handleConfirmSelection = () => {
    if (selectedCardinal) {
      selectPlayerCardinal(selectedCardinal);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading cardinals...</Typography>
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          textAlign: 'center',
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Error Loading Cardinals
        </Typography>
        <Typography>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Select Your Cardinal
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<Refresh />} 
          onClick={selectRandomCardinals}
          size="small"
        >
          Refresh Candidates
        </Button>
      </Box>
      
      <Typography variant="body1" paragraph align="center">
        Choose the cardinal you will play as during the conclave. Each cardinal has unique
        attributes that will affect your strategy and chances of success.
      </Typography>
      
      <Divider sx={{ mb: 4 }} />
      
      {/* Cardinal selection grid */}
      <Grid container spacing={3}>
        {randomCardinals.map((cardinal, index) => (
          <Grid item key={index} xs={12} sm={6} md={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                border: selectedCardinal?.id === cardinal.id ? '2px solid' : 'none',
                borderColor: 'primary.main',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 6
                }
              }}
              onClick={() => handleSelectCardinal(cardinal)}
            >
              <CardMedia
                component="img"
                height="180"
                image={cardinal.photo_url || defaultImage}
                alt={cardinal.name}
                sx={{ 
                  objectFit: 'contain', 
                  bgcolor: '#f5f5f5',
                  objectPosition: 'center' 
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {cardinal.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn color="action" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {cardinal.country}
                  </Typography>
                </Box>
                
                {cardinal.traits && (
                  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cardinal.traits.map((trait, i) => (
                      <Chip 
                        key={i}
                        label={trait}
                        size="small"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </Box>
                )}
                
                <Divider sx={{ my: 1.5 }} />
                
                <Typography variant="body2">
                  Piety: {cardinal.piety} | Influence: {cardinal.influence} | 
                  Diplomacy: {cardinal.diplomacy}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Confirmation section */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          onClick={handleConfirmSelection}
          disabled={!selectedCardinal}
          sx={{ mt: 2, px: 4 }}
        >
          {selectedCardinal 
            ? `Confirm Selection: ${selectedCardinal.name}` 
            : 'Select a Cardinal First'}
        </Button>
      </Box>
    </Box>
  );
}

export default CharacterCreation; 