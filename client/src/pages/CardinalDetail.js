import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  Paper,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardMedia,
  CardContent,
  Avatar
} from '@mui/material';
import {
  LocationOn,
  Today,
  Person,
  ArrowBack,
  Church,
  School,
  Language
} from '@mui/icons-material';
import { getCardinalById, searchCardinals } from '../services/api';

const defaultImage = 'https://via.placeholder.com/400x300?text=No+Image+Available';

function CardinalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cardinal, setCardinal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchCardinalDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try different approaches to find the cardinal
        let data = null;
        
        // First try: Direct ID lookup
        try {
          data = await getCardinalById(id);
        } catch (err) {
          console.log('Could not find by direct ID, trying alternative methods');
        }
        
        // Second try: By name with hyphens replaced by spaces
        if (!data) {
          try {
            const processedName = id.replace(/-/g, ' ');
            console.log('Searching by processed name:', processedName);
            const searchData = await searchCardinals(processedName);
            
            if (searchData.results && searchData.results.length > 0) {
              data = searchData.results[0];
              console.log('Found by name search:', data.name);
            }
          } catch (err) {
            console.error('Search by name failed:', err);
          }
        }
        
        // Third try: By partial name match
        if (!data) {
          try {
            // Split the ID into parts and search for the key parts
            const nameParts = id.split('-');
            if (nameParts.length > 1) {
              const keyName = nameParts[nameParts.length - 1]; // Last name often most unique
              console.log('Searching by key name part:', keyName);
              const searchData = await searchCardinals(keyName);
              
              if (searchData.results && searchData.results.length > 0) {
                data = searchData.results[0];
                console.log('Found by partial name match:', data.name);
              }
            }
          } catch (err) {
            console.error('Search by partial name failed:', err);
          }
        }
        
        if (data) {
          setCardinal(data);
        } else {
          setError('Cardinal not found. Please try a different search or return to the list.');
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load cardinal details');
        setLoading(false);
        console.error('Error fetching cardinal details:', err);
      }
    };
    
    fetchCardinalDetails();
  }, [id]);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error || !cardinal) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Cardinal information could not be loaded'}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBack />} 
          onClick={handleGoBack}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  // Extract data with fallbacks for missing information
  const {
    name = 'Unknown Name',
    country = 'Unknown Country',
    birth_date = 'Unknown Birth Date',
    appointing_pope = 'Unknown Pope',
    photo_url,
    biography_text = 'No biography available',
    biography_url,
    additional_info = {}
  } = cardinal;
  
  // Extract structured information from the additional_info if available
  const structuredBio = additional_info.structured_bio || {};
  const wikiInfo = additional_info.wikipedia || {};
  const newsInfo = additional_info.recent_news || { articles: [] };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        variant="outlined" 
        startIcon={<ArrowBack />} 
        onClick={handleGoBack}
        sx={{ mb: 4 }}
      >
        Back to Papal Contenders
      </Button>
      
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Grid container spacing={4}>
          {/* Cardinal Image */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                image={photo_url || wikiInfo.wikipedia_image || defaultImage}
                alt={name}
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  boxShadow: 3,
                  height: 'auto',
                  maxHeight: 600,
                  objectFit: 'contain',
                  bgcolor: '#f5f5f5'
                }}
              />
              <Box 
                sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  p: 2,
                  borderBottomLeftRadius: 2,
                  borderBottomRightRadius: 2,
                }}
              >
                <Typography variant="body2">
                  Potential Pope Material
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          {/* Cardinal Information */}
          <Grid item xs={12} md={8}>
            <Typography variant="h3" component="h1" gutterBottom>
              {name}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Chip 
                icon={<LocationOn />} 
                label={country} 
                color="primary"
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                icon={<Today />} 
                label={birth_date} 
                sx={{ mr: 1, mb: 1 }} 
              />
              <Chip 
                icon={<Person />} 
                label={`Appointed by ${appointing_pope}`} 
                sx={{ mb: 1 }} 
              />
              
              {structuredBio.birth_place && (
                <Chip 
                  icon={<LocationOn />} 
                  label={`Born in ${structuredBio.birth_place}`}
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              
              {structuredBio.ordination_date && (
                <Chip 
                  icon={<Church />} 
                  label={`Ordained on ${structuredBio.ordination_date}`}
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              
              {structuredBio.episcopal_consecration_date && (
                <Chip 
                  icon={<Church />} 
                  label={`Episcopal consecration on ${structuredBio.episcopal_consecration_date}`}
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              
              {structuredBio.cardinal_creation_date && (
                <Chip 
                  icon={<Church />} 
                  label={`Created cardinal on ${structuredBio.cardinal_creation_date}`}
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              
              {structuredBio.education && structuredBio.education.length > 0 && (
                <Chip 
                  icon={<School />} 
                  label={`Education: ${structuredBio.education.join(', ')}`}
                  variant="outlined" 
                  sx={{ mr: 1, mb: 1 }} 
                />
              )}
              
              {structuredBio.languages && structuredBio.languages.length > 0 && (
                <Chip 
                  icon={<Language />} 
                  label={`Languages: ${structuredBio.languages.join(', ')}`}
                  variant="outlined" 
                  sx={{ mb: 1 }} 
                />
              )}
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h5" gutterBottom>
              Biography
            </Typography>
            
            <Typography variant="body1" paragraph>
              {wikiInfo.wikipedia_summary || biography_text || 'No biography information available.'}
            </Typography>
            
            {wikiInfo.wikipedia_url && (
              <Button 
                variant="outlined" 
                color="primary" 
                href={wikiInfo.wikipedia_url} 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 3 }}
              >
                Read More on Wikipedia
              </Button>
            )}
            
            {biography_url && !wikiInfo.wikipedia_url && (
              <Button 
                variant="outlined" 
                color="primary" 
                href={biography_url} 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mb: 3 }}
              >
                Read Full Biography
              </Button>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent News Section */}
      {newsInfo.articles && newsInfo.articles.length > 0 && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
            Recent News
          </Typography>
          
          <Grid container spacing={3}>
            {newsInfo.articles.map((article, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {article.title}
                    </Typography>
                    {article.source && (
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Source: {article.source}
                        {article.date && ` • ${article.date}`}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        href={article.link} 
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                      >
                        Read Article
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* If we have Wikipedia infobox data, display it */}
      {wikiInfo.wikipedia_infobox && Object.keys(wikiInfo.wikipedia_infobox).length > 0 && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
            Additional Information
          </Typography>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {Object.entries(wikiInfo.wikipedia_infobox).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {key}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {value}
                  </Typography>
                  <Divider sx={{ mt: 1, mb: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Container>
  );
}

export default CardinalDetail; 