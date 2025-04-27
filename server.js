const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS options based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://giolaq.github.io'] // Your GitHub Pages URL
    : 'http://localhost:3000',  // Your local React development server
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

// Enable CORS with options
app.use(cors(corsOptions));

// Also handle OPTIONS preflight requests
app.options('*', cors(corsOptions));

// Middleware to parse JSON
app.use(express.json());

// Load cardinals data
let cardinalsData = [];
try {
  const dataPath = path.join(__dirname, 'data', 'backup', 'cardinals.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  cardinalsData = JSON.parse(rawData);
  console.log(`Loaded ${cardinalsData.length} cardinals from data file`);
} catch (error) {
  console.error('Error loading cardinals data:', error.message);
  // Initialize with empty array if file not found
  cardinalsData = [];
}

// API endpoints
app.get('/api/cardinals', (req, res) => {
  // Implement pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedCardinals = cardinalsData.slice(startIndex, endIndex);
  
  res.json({
    total: cardinalsData.length,
    page,
    limit,
    cardinals: paginatedCardinals
  });
});

// Get a single cardinal by ID or index
app.get('/api/cardinals/:id', (req, res) => {
  const id = req.params.id;
  
  // If id is a number, treat it as an index
  if (!isNaN(id)) {
    const index = parseInt(id);
    if (index >= 0 && index < cardinalsData.length) {
      return res.json(cardinalsData[index]);
    }
  } 
  
  // Otherwise search by name
  const cardinal = cardinalsData.find(c => 
    c.name.toLowerCase().includes(id.toLowerCase())
  );
  
  if (cardinal) {
    return res.json(cardinal);
  }
  
  res.status(404).json({ error: 'Cardinal not found' });
});

// Search cardinals by any field
app.get('/api/search', (req, res) => {
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }
  
  const results = cardinalsData.filter(cardinal => {
    // Search in all string fields
    return Object.keys(cardinal).some(key => {
      if (typeof cardinal[key] === 'string') {
        return cardinal[key].toLowerCase().includes(query);
      }
      return false;
    });
  });
  
  res.json({
    query,
    count: results.length,
    results
  });
});

// Cardinal recommendation endpoint
app.post('/api/recommend', (req, res) => {
  try {
    const userPreferences = req.body;
    
    // Validate user preferences
    if (!userPreferences) {
      return res.status(400).json({ error: 'User preferences are required' });
    }
    
    // Check for required fields
    const requiredFields = ['gender', 'age', 'country', 'interests'];
    const missingFields = requiredFields.filter(field => !userPreferences[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required preferences', 
        missingFields 
      });
    }
    
    // Calculate scores for each cardinal
    const scoredCardinals = cardinalsData.map(cardinal => {
      const scores = calculateMatchScores(userPreferences, cardinal);
      const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
      
      return {
        cardinal,
        totalScore,
        scores
      };
    });
    
    // Sort by total score (highest first)
    scoredCardinals.sort((a, b) => b.totalScore - a.totalScore);
    
    // Select the top 3 matches
    const topMatches = scoredCardinals.slice(0, 3);
    
    // Generate match reasons for each
    const recommendations = topMatches.map(match => {
      return {
        cardinal: match.cardinal,
        score: match.totalScore,
        scores: match.scores,
        reason: generateMatchReason(userPreferences, match)
      };
    });
    
    // Return the recommendations
    res.json({
      preferences: userPreferences,
      recommendations
    });
  } catch (error) {
    console.error('Error in recommendation process:', error);
    res.status(500).json({ error: 'Failed to process recommendation request' });
  }
});

// Helper function to calculate match scores
function calculateMatchScores(userPreferences, cardinal) {
  const scores = {
    country: 0,       // 0-25 points
    ageGroup: 0,      // 0-20 points
    interests: 0,     // 0-35 points
    education: 0,     // 0-10 points
    gender: 0,        // 0-10 points
  };
  
  // 1. Country match (25 points)
  if (cardinal.country === userPreferences.country) {
    scores.country = 25;
  }
  
  // 2. Age group match (up to 20 points)
  const userAge = userPreferences.age;
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
  const interestMatches = findInterestMatches(userPreferences.interests, cardinal);
  const interestMatchCount = interestMatches.length;
  
  if (interestMatchCount > 0) {
    // Award points based on the number of interest matches (max 35)
    scores.interests = Math.min(interestMatchCount * 10, 35);
  }
  
  // 4. Education background (up to 10 points)
  const educationMatch = hasEducationMatch(userPreferences.interests, cardinal);
  if (educationMatch) {
    scores.education = 10;
  }
  
  // 5. Gender consideration (10 points)
  if (userPreferences.gender === 'male') {
    scores.gender = 10;
  } else {
    // For other genders, find cardinals with focus on inclusivity
    const hasSocialJusticeOrInclusion = checkForSocialJustice(cardinal);
    if (hasSocialJusticeOrInclusion) {
      scores.gender = 10;
    }
  }
  
  return scores;
}

// Helper function to get cardinal age
function getCardinalAge(cardinal) {
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
}

// Helper function to find interest matches
function findInterestMatches(userInterests, cardinal) {
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
}

// Helper function to check for education match
function hasEducationMatch(userInterests, cardinal) {
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
}

// Helper function to check for social justice themes
function checkForSocialJustice(cardinal) {
  const socialJusticeKeywords = [
    'justice', 'peace', 'rights', 'equality', 'diversity', 'inclusion', 
    'dialogue', 'poor', 'marginalized', 'vulnerable', 'dignity'
  ];
  
  const biographyText = cardinal.biography_text || '';
  
  return socialJusticeKeywords.some(keyword => 
    biographyText.toLowerCase().includes(keyword.toLowerCase())
  );
}

// Helper function to generate match reasons
function generateMatchReason(userPreferences, match) {
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
    const ageDifference = Math.abs(userPreferences.age - cardinalAge);
    if (ageDifference <= 10) {
      reasons.push(`At ${cardinalAge} years old, ${cardinal.name.split(' ')[0]} is close to your age group, bringing a similar generational perspective.`);
    }
  }
  
  // Interest matches
  const interestMatches = findInterestMatches(userPreferences.interests, cardinal);
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
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VibePope API is running' });
});

// Root route - just provide API information
app.get('/', (req, res) => {
  res.json({
    name: 'VibePope API',
    version: '1.0.0',
    description: 'API for VibePope application',
    frontend: 'https://giolaq.github.io/vibepope',
    endpoints: [
      '/api/health',
      '/api/cardinals',
      '/api/cardinals/:id',
      '/api/search?q=query',
      '/api/recommend'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 