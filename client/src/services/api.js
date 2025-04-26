import axios from 'axios';

// Hard-code the API URL to ensure it works on GitHub Pages
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://vibepope.onrender.com/api'  // Replace this with your actual Render URL
  : 'http://localhost:3001/api';

console.log('Using API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getCardinals = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/cardinals?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching cardinals:', error);
    throw error;
  }
};

export const getCardinalById = async (id) => {
  try {
    const response = await api.get(`/cardinals/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cardinal with id ${id}:`, error);
    throw error;
  }
};

export const searchCardinals = async (query) => {
  try {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching cardinals:', error);
    throw error;
  }
};

export default api; 