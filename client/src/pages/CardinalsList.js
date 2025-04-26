import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  Chip,
  Stack
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { getCardinals, searchCardinals } from '../services/api';
import CardinalCard from '../components/CardinalCard';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function CardinalsList() {
  const query = useQuery();
  const searchParam = query.get('search');
  
  const [cardinals, setCardinals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [sortBy, setSortBy] = useState('name');
  const [filterCountry, setFilterCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [applyingFilters, setApplyingFilters] = useState(false);
  
  const limit = 12; // Cards per page
  
  useEffect(() => {
    if (searchParam) {
      handleSearch(searchParam);
    } else {
      fetchCardinals();
    }
  }, [searchParam, page]);
  
  const fetchCardinals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getCardinals(page, limit);
      setCardinals(data.cardinals);
      setTotalPages(Math.ceil(data.total / limit));
      
      // Extract unique countries for the filter
      if (countries.length === 0) {
        const uniqueCountries = Array.from(
          new Set(data.cardinals.map(cardinal => cardinal.country).filter(Boolean))
        ).sort();
        setCountries(uniqueCountries);
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load cardinals data');
      setLoading(false);
      console.error('Error fetching cardinals:', err);
    }
  };
  
  const handleSearch = async (query) => {
    if (!query) {
      fetchCardinals();
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const data = await searchCardinals(query);
      setCardinals(data.results);
      setTotalPages(1); // Search results on a single page
      setLoading(false);
    } catch (err) {
      setError('Search failed');
      setLoading(false);
      console.error('Error searching cardinals:', err);
    }
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };
  
  const handleClearSearch = () => {
    setSearchQuery('');
    fetchCardinals();
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    
    // Sort the current cardinals list
    const sortedCardinals = [...cardinals].sort((a, b) => {
      if (event.target.value === 'name') {
        return a.name.localeCompare(b.name);
      } else if (event.target.value === 'country') {
        return a.country.localeCompare(b.country);
      } else if (event.target.value === 'birth_date') {
        // This is a simple sort - in a real app you'd parse the dates properly
        return a.birth_date.localeCompare(b.birth_date);
      }
      return 0;
    });
    
    setCardinals(sortedCardinals);
  };
  
  const handleCountryFilterChange = (event) => {
    setFilterCountry(event.target.value);
    setApplyingFilters(true);
    
    if (event.target.value === '') {
      // If filter cleared, refresh the list
      fetchCardinals();
    } else {
      // Filter the cardinals list by country
      setCardinals(prev => 
        prev.filter(cardinal => 
          cardinal.country === event.target.value
        )
      );
    }
    
    setApplyingFilters(false);
  };
  
  // Apply additional filtering and sorting to the cardinals list
  const displayedCardinals = cardinals
    // Sortable only visible in UI when not already handled by API
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'country') {
        return a.country.localeCompare(b.country);
      } else if (sortBy === 'birth_date') {
        return a.birth_date.localeCompare(b.birth_date);
      }
      return 0;
    });
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Papal Contender Power Rankings
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        {/* Search and Filters */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box component="form" onSubmit={handleSearchSubmit}>
              <TextField
                fullWidth
                label="Search Cardinals"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClearSearch} edge="end">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="sort-label">Sort By</InputLabel>
              <Select
                labelId="sort-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="name">Name</MenuItem>
                <MenuItem value="country">Country</MenuItem>
                <MenuItem value="birth_date">Birth Date</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="country-filter-label">Filter by Country</InputLabel>
              <Select
                labelId="country-filter-label"
                value={filterCountry}
                label="Filter by Country"
                onChange={handleCountryFilterChange}
              >
                <MenuItem value="">All Countries</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {/* Active filters display */}
        {(searchQuery || filterCountry) && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1}>
              {searchQuery && (
                <Chip 
                  label={`Search: ${searchQuery}`} 
                  onDelete={handleClearSearch}
                  color="primary" 
                  variant="outlined"
                />
              )}
              {filterCountry && (
                <Chip 
                  label={`Country: ${filterCountry}`} 
                  onDelete={() => setFilterCountry('')}
                  color="primary" 
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>
      
      {/* Cardinals List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      ) : displayedCardinals.length === 0 ? (
        <Alert severity="info" sx={{ my: 2 }}>
          No cardinals found matching your search criteria.
        </Alert>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1">
              Showing {displayedCardinals.length} cardinals
              {searchQuery && ` matching "${searchQuery}"`}
              {filterCountry && ` from ${filterCountry}`}
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {displayedCardinals.map((cardinal, index) => (
              <Grid item key={cardinal.name} xs={12} sm={6} md={4} lg={3}>
                <CardinalCard cardinal={cardinal} index={index} />
              </Grid>
            ))}
          </Grid>
          
          {/* Only show pagination when not filtering or searching */}
          {!searchQuery && !filterCountry && totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}

export default CardinalsList; 