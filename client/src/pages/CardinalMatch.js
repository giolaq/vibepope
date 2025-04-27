import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  AlertTitle,
  Fade,
  Divider,
  Grid,
  Card,
  CardContent 
} from '@mui/material';
import CardinalPreferenceForm from '../components/CardinalPreferenceForm';
import CardinalCard from '../components/CardinalCard';
import { getCardinals, getCardinalRecommendations } from '../services/api';

function CardinalMatch() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [matchedCardinal, setMatchedCardinal] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [matchReason, setMatchReason] = useState('');
  
  useEffect(() => {
    // Load country data when component mounts
    fetchCountries();
  }, []);
  
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const data = await getCardinals(1, 100); // Get a batch of cardinals to extract countries
      
      // Extract unique countries and sort them
      const uniqueCountries = Array.from(
        new Set(data.cardinals.map(cardinal => cardinal.country).filter(Boolean))
      ).sort();
      
      setCountries(uniqueCountries);
      setLoading(false);
    } catch (err) {
      setError('Failed to load country data');
      setLoading(false);
      console.error('Error fetching countries:', err);
    }
  };
  
  const findCardinalMatch = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Use the server API for recommendations if available
      try {
        // Call the recommendation API
        const recommendationData = await getCardinalRecommendations(userData);
        setRecommendations(recommendationData.recommendations);
        
        // Set the top match as the primary match
        if (recommendationData.recommendations && recommendationData.recommendations.length > 0) {
          const topMatch = recommendationData.recommendations[0];
          setMatchedCardinal(topMatch.cardinal);
          setMatchReason(topMatch.reason);
          setFormSubmitted(true);
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('API recommendation failed, falling back to client-side matching:', apiError);
        // If API call fails, fall back to client-side matching
      }
      
      // Fallback: Client-side matching if API call fails
      const data = await getCardinals(1, 1000);
      
      if (!data || !data.cardinals || data.cardinals.length === 0) {
        throw new Error('No cardinal data available');
      }
      
      // Enhanced matching algorithm
      const match = performEnhancedMatching(userData, data.cardinals);
      
      setMatchedCardinal(match.cardinal);
      setMatchReason(match.reason);
      setFormSubmitted(true);
      setLoading(false);
    } catch (err) {
      setError('Failed to find a matching cardinal');
      setLoading(false);
      console.error('Error in matching process:', err);
    }
  };
  
  const performEnhancedMatching = (userData, cardinals) => {
    // Advanced matching algorithm that ranks cardinals by relevance score
    const scoredCardinals = cardinals.map(cardinal => {
      const scores = calculateMatchScores(userData, cardinal);
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      return {
        cardinal,
        totalScore,
        scores,
      };
    });
    
    // Sort by total score (highest first)
    scoredCardinals.sort((a, b) => b.totalScore - a.totalScore);
    
    // Select the highest scoring cardinal
    const topMatch = scoredCardinals[0];
    
    // Generate personalized match reason based on the highest scoring attributes
    const reason = generateMatchReason(userData, topMatch);
    
    console.log('Match scores:', topMatch.scores);
    console.log('Selected cardinal:', topMatch.cardinal.name);
    
    return {
      cardinal: topMatch.cardinal,
      reason: reason
    };
  };
  
  const calculateMatchScores = (userData, cardinal) => {
    const scores = {
      country: 0,       // 0-25 points
      ageGroup: 0,      // 0-20 points
      interests: 0,     // 0-35 points
      education: 0,     // 0-10 points
      gender: 0,        // 0-10 points
    };
    
    // 1. Country match (25 points)
    if (cardinal.country === userData.country) {
      scores.country = 25;
    }
    
    // 2. Age group match (up to 20 points)
    const userAge = userData.age;
    const cardinalAge = getCardinalAge(cardinal);
    
    if (cardinalAge) {
      // Calculate age difference score
      const ageDifference = Math.abs(userAge - cardinalAge);
      
      if (ageDifference <= 5) {
        scores.ageGroup = 20; // Very close in age
      } else if (ageDifference <= 10) {
        scores.ageGroup = 15; // Fairly close in age
      } else if (ageDifference <= 20) {
        scores.ageGroup = 10; // Somewhat close in age
      } else if (ageDifference <= 30) {
        scores.ageGroup = 5;  // Different generation
      }
    }
    
    // 3. Interests match (up to 35 points)
    const interestMatches = findInterestMatches(userData.interests, cardinal);
    const interestMatchCount = interestMatches.length;
    
    if (interestMatchCount > 0) {
      // Award points based on the number of interest matches (max 35)
      scores.interests = Math.min(interestMatchCount * 10, 35);
    }
    
    // 4. Education background (up to 10 points)
    const educationMatch = hasEducationMatch(userData.interests, cardinal);
    if (educationMatch) {
      scores.education = 10;
    }
    
    // 5. Gender consideration (10 points) - mostly symbolic since all cardinals are male
    if (userData.gender === 'male') {
      scores.gender = 10;
    } else {
      // For other genders, find cardinals with focus on inclusivity
      const hasSocialJusticeOrInclusion = checkForSocialJustice(cardinal);
      if (hasSocialJusticeOrInclusion) {
        scores.gender = 10;
      }
    }
    
    return scores;
  };
  
  const getCardinalAge = (cardinal) => {
    if (!cardinal.birth_date) {
      return null;
    }
    
    // Try to parse birth date
    try {
      // Handle various date formats
      const datePattern = /(\d{1,2})[.-](\d{1,2})[.-](\d{4})/;
      const match = cardinal.birth_date.match(datePattern);
      
      if (match) {
        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; // JS months are 0-indexed
        const year = parseInt(match[3], 10);
        
        const birthDate = new Date(year, month, day);
        const today = new Date();
        
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();
        
        // Adjust age if birthday hasn't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        return age;
      }
    } catch (error) {
      console.error('Error calculating cardinal age:', error);
    }
    
    return null;
  };
  
  const findInterestMatches = (userInterests, cardinal) => {
    // Define interest-related keywords for matching with biography text
    const interestKeywords = {
      'Theology': ['theology', 'theological', 'doctrine', 'faith', 'biblical', 'scripture'],
      'Social Justice': ['justice', 'peace', 'social', 'human rights', 'rights', 'poverty', 'equality'],
      'Church History': ['history', 'historical', 'tradition', 'council', 'synod'],
      'Philosophy': ['philosophy', 'philosophical', 'ethics', 'moral'],
      'Ecumenism': ['ecumenism', 'ecumenical', 'dialogue', 'unity', 'interfaith'],
      'Missionary Work': ['mission', 'missionary', 'evangelize', 'evangelization'],
      'Education': ['education', 'teaching', 'academic', 'university', 'school', 'college', 'seminary', 'professor'],
      'Interfaith Dialogue': ['interfaith', 'interreligious', 'dialogue', 'religious leaders'],
      'Scripture Studies': ['scripture', 'biblical', 'bible', 'exegesis'],
      'Liturgy': ['liturgy', 'liturgical', 'worship', 'rite', 'sacrament'],
      'Music': ['music', 'musical', 'choir', 'sing'],
      'Art': ['art', 'artistic', 'cultural'],
      'Architecture': ['architecture', 'building', 'construction'],
      'Environmental Issues': ['environment', 'environmental', 'ecology', 'climate', 'conservation'],
      'Youth Ministry': ['youth', 'young', 'adolescent', 'children'],
      'Media & Communications': ['media', 'communication', 'digital', 'internet', 'press'],
      'Monastic Life': ['monastic', 'monastery', 'monk', 'contemplative', 'prayer'],
      'Healthcare': ['health', 'medical', 'hospital', 'care', 'healing', 'sick'],
      'Technology': ['technology', 'technological', 'innovation', 'digital']
    };
    
    const matches = [];
    const biographyText = cardinal.biography_text || '';
    const educationInfo = cardinal.additional_info?.structured_bio?.education || [];
    const combinedText = biographyText + ' ' + educationInfo.join(' ');
    
    // Check each user interest for matches in the cardinal's information
    userInterests.forEach(interest => {
      // Check if keywords related to this interest appear in the biography
      const keywords = interestKeywords[interest] || [];
      const hasMatch = keywords.some(keyword => 
        combinedText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (hasMatch) {
        matches.push(interest);
      }
    });
    
    return matches;
  };
  
  const hasEducationMatch = (userInterests, cardinal) => {
    const educationKeywords = [
      'education', 'university', 'degree', 'doctorate', 'phd', 'licentiate', 
      'academy', 'institute', 'college', 'seminary', 'study', 'studies'
    ];
    
    // Check if cardinal has structured education info
    const educationInfo = cardinal.additional_info?.structured_bio?.education || [];
    
    // Check cardinal's biography text for education references
    const biographyText = cardinal.biography_text || '';
    
    // Check if user has education-related interests
    const hasEducationInterest = userInterests.some(interest => 
      ['Education', 'Philosophy', 'Theology', 'Scripture Studies'].includes(interest)
    );
    
    if (hasEducationInterest) {
      // Check if education keywords appear in the biography
      return educationKeywords.some(keyword => 
        biographyText.toLowerCase().includes(keyword.toLowerCase())
      ) || educationInfo.length > 0;
    }
    
    return false;
  };
  
  const checkForSocialJustice = (cardinal) => {
    const socialJusticeKeywords = [
      'justice', 'peace', 'rights', 'equality', 'diversity', 'inclusion', 
      'dialogue', 'poor', 'marginalized', 'vulnerable', 'dignity'
    ];
    
    const biographyText = cardinal.biography_text || '';
    
    return socialJusticeKeywords.some(keyword => 
      biographyText.toLowerCase().includes(keyword.toLowerCase())
    );
  };
  
  const generateMatchReason = (userData, match) => {
    const { cardinal, scores } = match;
    let reasons = [];
    
    // Add strongest matching factors to the reason text
    // Country match
    if (scores.country > 0) {
      reasons.push(`Cardinal ${cardinal.name} is from ${cardinal.country}, matching your country of origin.`);
    }
    
    // Age match
    const cardinalAge = getCardinalAge(cardinal);
    if (cardinalAge && scores.ageGroup > 10) {
      const ageDifference = Math.abs(userData.age - cardinalAge);
      if (ageDifference <= 10) {
        reasons.push(`At ${cardinalAge} years old, ${cardinal.name.split(' ')[0]} is close to your age group, bringing a similar generational perspective.`);
      }
    }
    
    // Interest matches
    const interestMatches = findInterestMatches(userData.interests, cardinal);
    if (interestMatches.length > 0) {
      if (interestMatches.length === 1) {
        reasons.push(`Your interest in ${interestMatches[0]} aligns well with ${cardinal.name.split(' ')[0]}'s background.`);
      } else if (interestMatches.length > 1) {
        const formatted = interestMatches.slice(0, 2).join(' and ');
        reasons.push(`Your interests in ${formatted} are reflected in ${cardinal.name.split(' ')[0]}'s work and ministry.`);
      }
    }
    
    // Education
    if (scores.education > 0) {
      const educationInfo = cardinal.additional_info?.structured_bio?.education || [];
      if (educationInfo.length > 0) {
        reasons.push(`With education in ${educationInfo[0]}, ${cardinal.name.split(' ')[0]} brings academic depth to areas you care about.`);
      } else {
        reasons.push(`${cardinal.name.split(' ')[0]}'s scholarly background complements your intellectual interests.`);
      }
    }
    
    // Add general information about the cardinal
    if (cardinal.appointing_pope) {
      reasons.push(`Appointed by Pope ${cardinal.appointing_pope}, ${cardinal.name.split(' ')[0]} represents a voice in the modern church.`);
    }
    
    // Random inspirational message if we don't have enough reasons
    if (reasons.length < 2) {
      const inspirationalMessages = [
        `${cardinal.name.split(' ')[0]}'s spiritual journey offers guidance for your own path.`,
        `The wisdom and leadership of ${cardinal.name.split(' ')[0]} reflect values that resonate with your profile.`,
        `${cardinal.name.split(' ')[0]}'s dedication to the Church mirrors the commitment you show in your interests.`
      ];
      
      reasons.push(inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)]);
    }
    
    return reasons.join(' ');
  };
  
  const handleReset = () => {
    setFormSubmitted(false);
    setMatchedCardinal(null);
    setMatchReason('');
    setRecommendations([]);
  };
  
  const viewAlternativeMatch = (index) => {
    if (recommendations && recommendations.length > index) {
      const alternativeMatch = recommendations[index];
      setMatchedCardinal(alternativeMatch.cardinal);
      setMatchReason(alternativeMatch.reason);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          Cardinal Match
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover which cardinal best matches your personal profile
        </Typography>
        <Divider sx={{ my: 3 }} />
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {!formSubmitted ? (
            <CardinalPreferenceForm 
              onSubmit={findCardinalMatch} 
              countries={countries} 
            />
          ) : (
            <Fade in={formSubmitted}>
              <Box>
                <Typography variant="h4" component="h2" gutterBottom align="center" sx={{ mb: 4 }}>
                  Your Cardinal Match
                </Typography>
                
                {matchedCardinal && (
                  <>
                    <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
                      <Alert severity="success" sx={{ mb: 3 }}>
                        <AlertTitle>Perfect Match!</AlertTitle>
                        {matchReason}
                      </Alert>
                      
                      <CardinalCard cardinal={matchedCardinal} />
                    </Box>
                    
                    {/* Alternative matches if available from API */}
                    {recommendations.length > 1 && (
                      <Box sx={{ mt: 5, mb: 3 }}>
                        <Typography variant="h5" gutterBottom align="center">
                          Alternative Matches
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                          Not feeling the connection? Consider these alternative matches.
                        </Typography>
                        
                        <Grid container spacing={3} justifyContent="center">
                          {recommendations.slice(1).map((rec, index) => (
                            <Grid item key={index} xs={12} sm={6} md={4}>
                              <Card 
                                sx={{ 
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s',
                                  '&:hover': { transform: 'scale(1.03)' }
                                }}
                                onClick={() => viewAlternativeMatch(index + 1)}
                              >
                                <CardContent>
                                  <Typography variant="h6" gutterBottom>
                                    {rec.cardinal.name.split(' ').slice(0, 2).join(' ')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {rec.cardinal.country}
                                  </Typography>
                                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                                    <Button 
                                      size="small" 
                                      variant="outlined"
                                    >
                                      View Match
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleReset}
                        sx={{ px: 4, py: 1.5 }}
                      >
                        Find Another Match
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          )}
        </>
      )}
    </Container>
  );
}

export default CardinalMatch; 