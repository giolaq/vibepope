const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS options based on environment
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://giolaq.github.io'] // Replace with your actual GitHub Pages URL
    : '*',  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Enable CORS with options
app.use(cors(corsOptions));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VibePope API is running' });
});

// Serve static React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 