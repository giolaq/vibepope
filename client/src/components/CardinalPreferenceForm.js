import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Paper,
  Grid,
  Container,
  Autocomplete,
  Alert
} from '@mui/material';

const cardinalInterests = [
  'Theology',
  'Social Justice',
  'Church History',
  'Philosophy',
  'Ecumenism',
  'Missionary Work',
  'Education',
  'Interfaith Dialogue',
  'Scripture Studies',
  'Liturgy',
  'Music',
  'Art',
  'Architecture',
  'Environmental Issues',
  'Youth Ministry',
  'Media & Communications',
  'Monastic Life',
  'Healthcare',
  'Technology'
];

const CardinalPreferenceForm = ({ onSubmit, countries }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    age: 30,
    country: '',
    interests: []
  });
  
  const [errors, setErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
    }
    
    if (!formData.country) {
      newErrors.country = 'Country selection is required';
    }
    
    if (formData.interests.length === 0) {
      newErrors.interests = 'Please select at least one interest';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is filled
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };
  
  const handleAgeChange = (e, newValue) => {
    setFormData({ ...formData, age: newValue });
  };
  
  const handleInterestsChange = (event, newValue) => {
    setFormData({ ...formData, interests: newValue });
    
    // Clear error when field is filled
    if (errors.interests && newValue.length > 0) {
      setErrors({ ...errors, interests: null });
    }
  };
  
  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Find Your Cardinal Match
        </Typography>
        
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
          Tell us about yourself and we'll match you with a cardinal that aligns with your personal attributes and interests.
        </Typography>
        
        {submitAttempted && Object.keys(errors).length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Please correct the errors in the form before submitting.
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || ''}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl component="fieldset" error={!!errors.gender} required fullWidth>
                <FormLabel component="legend">Gender</FormLabel>
                <RadioGroup
                  row
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <FormControlLabel value="female" control={<Radio />} label="Female" />
                  <FormControlLabel value="male" control={<Radio />} label="Male" />
                  <FormControlLabel value="other" control={<Radio />} label="Other" />
                  <FormControlLabel value="prefer_not_to_say" control={<Radio />} label="Prefer not to say" />
                </RadioGroup>
                {errors.gender && <Typography color="error" variant="caption">{errors.gender}</Typography>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography id="age-slider-label" gutterBottom>
                Age: {formData.age}
              </Typography>
              <Slider
                value={formData.age}
                onChange={handleAgeChange}
                aria-labelledby="age-slider-label"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={18}
                max={100}
                name="age"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.country} required>
                <InputLabel id="country-select-label">Country</InputLabel>
                <Select
                  labelId="country-select-label"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  label="Country"
                >
                  <MenuItem value="">
                    <em>Select your country</em>
                  </MenuItem>
                  {countries && countries.map((country) => (
                    <MenuItem key={country} value={country}>
                      {country}
                    </MenuItem>
                  ))}
                </Select>
                {errors.country && <Typography color="error" variant="caption">{errors.country}</Typography>}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth error={!!errors.interests} required>
                <Autocomplete
                  multiple
                  id="interests-tags"
                  options={cardinalInterests}
                  value={formData.interests}
                  onChange={handleInterestsChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Interests"
                      placeholder="Select your interests"
                      error={!!errors.interests}
                      helperText={errors.interests || ''}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option}
                        {...getTagProps({ index })}
                        color="primary"
                        variant="outlined"
                      />
                    ))
                  }
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Find My Cardinal Match
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default CardinalPreferenceForm; 