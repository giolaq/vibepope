import React, { useState, useEffect, Suspense } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { 
  HowToVote, 
  Groups, 
  EventNote, 
  Church,
  EmojiEvents
} from '@mui/icons-material';
import HeroBackground3D from '../components/HeroBackground3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import Game from '../game/Game';
import { GameProvider } from '../game/GameState';

// SafeTexture wrapper for better error handling
const SafeTexture = ({ textureUrl, children, fallbackColor = "#1e88e5" }) => {
  const [hasError, setHasError] = useState(false);
  
  // Load texture with error handling
  const texture = useTexture(
    textureUrl,
    (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
      loadedTexture.minFilter = THREE.LinearFilter;
      loadedTexture.needsUpdate = true;
    },
    () => setHasError(true)
  );
  
  // If error occurred, create a dummy solid color texture
  if (hasError) {
    const color = new THREE.Color(fallbackColor);
    const size = 128;
    const data = new Uint8Array(3 * size * size);
    
    for (let i = 0; i < size * size; i++) {
      const stride = i * 3;
      data[stride] = Math.floor(color.r * 255);
      data[stride + 1] = Math.floor(color.g * 255);
      data[stride + 2] = Math.floor(color.b * 255);
    }
    
    const fallbackTexture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
    fallbackTexture.needsUpdate = true;
    
    // Clone the children and pass the fallback texture
    return React.cloneElement(children, { map: fallbackTexture });
  }
  
  // If texture loaded properly, clone the children and pass the loaded texture
  return React.cloneElement(children, { map: texture });
};

// 3D Globe Component with improved error handling
const Globe = ({ scale = 2 }) => {
  return (
    <Sphere args={[1, 64, 32]} scale={scale}>
      <SafeTexture textureUrl="https://unpkg.com/three-globe@2.27.1/example/img/earth-blue-marble.jpg">
        <meshStandardMaterial 
          roughness={0.7}
          metalness={0.2}
          alphaTest={0.5}
          transparent={false}
        />
      </SafeTexture>
    </Sphere>
  );
};

function Home() {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Hero Section with Background */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 6,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          height: '60vh',
          minHeight: '400px',
          overflow: 'hidden'
        }}
      >
        <HeroBackground3D />
        <Container
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        >
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Cinzel", serif',
            }}
          >
            Conclave: The Papal Election
          </Typography>
          <Typography 
            variant="h5" 
            color="inherit" 
            paragraph
            sx={{
              maxWidth: '800px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            Participate in the sacred tradition of electing a new Pope. 
            Form alliances, cast your votes, and navigate the politics of the Vatican.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ 
              mt: 4, 
              px: 4, 
              py: 1.5, 
              fontSize: '1.1rem',
              boxShadow: '0 4px 20px rgba(183, 28, 28, 0.5)',
              animation: 'pulse 2s infinite',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 6px 25px rgba(183, 28, 28, 0.7)',
              }
            }}
            onClick={() => {
              // Scroll to game section
              document.getElementById('game-section').scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Enter the Conclave
          </Button>
        </Container>
      </Paper>

      {/* Game Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Experience the Sacred Election
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" paragraph>
          Immerse yourself in the politics, tradition, and intrigue of the papal election
        </Typography>
        
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <HowToVote color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Strategic Voting
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cast your vote for the next Pope, or even campaign to become Pope yourself.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <Groups color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Form Alliances
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Build relationships with other cardinals to increase your influence in the conclave.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <EventNote color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Dynamic Events
              </Typography>
              <Typography variant="body2" color="text.secondary">
                React to unexpected events that may shift alliances or change the direction of the conclave.
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ 
              p: 3, 
              textAlign: 'center',
              height: '100%',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-10px)',
                boxShadow: 6
              }
            }}>
              <EmojiEvents color="primary" sx={{ fontSize: 50, mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Multiple Victories
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Win by becoming Pope yourself or by supporting the successful candidate from the beginning.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Game Section */}
      <Container maxWidth="lg" sx={{ my: 8 }} id="game-section">
        <Typography variant="h3" align="center" gutterBottom>
          Enter the Conclave
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Experience the strategy and intrigue of a papal election
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}>
          <GameProvider>
            <Game />
          </GameProvider>
        </Suspense>
      </Container>

      {/* Historical Context */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mt: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            <Church color="primary" sx={{ mr: 1, verticalAlign: 'bottom' }} />
            The History of the Conclave
          </Typography>
          <Typography variant="body1" paragraph>
            The papal conclave is the meeting of the College of Cardinals convened to elect a new Bishop of Rome, 
            who becomes the Pope. The word "conclave" comes from the Latin cum clave, meaning "with a key," 
            referring to the tradition of locking the cardinals within the Sistine Chapel until they 
            reach a decision.
          </Typography>
          <Typography variant="body1" paragraph>
            The tradition dates back to the 13th century when, after a papal election in Viterbo, Italy 
            had gone on for nearly three years, the local population removed the roof from the building 
            where the cardinals were meeting and restricted their food to bread and water to encourage 
            a faster decision.
          </Typography>
          <Typography variant="body1">
            Today, the conclave is a highly secretive and ceremonial process, with cardinals taking an 
            oath of secrecy and being completely sequestered from the outside world. The famous white 
            smoke rising from the Sistine Chapel chimney signals to the world that a new Pope has been elected.
          </Typography>
        </Container>
      </Box>

      {/* Add animation keyframes */}
      <Box
        sx={{
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          },
          '@keyframes slideUp': {
            '0%': { opacity: 0, transform: 'translateY(20px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' }
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
      />
    </Box>
  );
}

export default Home; 