import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ThreeProvider from './components/ThreeContext';

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#b71c1c', // Vatican red
    },
    secondary: {
      main: '#ffd700', // Vatican gold
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Gentium Book Basic", "Roboto", "Helvetica", "Arial", serif',
    h1: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    h2: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    h3: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"IM Fell English SC", serif',
      fontWeight: 500,
    },
    button: {
      fontFamily: '"IM Fell English SC", serif',
    },
    body1: {
      fontFamily: '"Gentium Book Basic", serif',
    },
    body2: {
      fontFamily: '"Gentium Book Basic", serif',
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ThreeProvider>
          <App />
        </ThreeProvider>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
); 