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
import { getCardinals } from '../services/api';
import CardinalCard from '../components/CardinalCard';
import { 
  Person, 
  CheckCircle, 
  School, 
  InterestsOutlined,
  ChurchOutlined,
  TravelExploreOutlined
} from '@mui/icons-material';
import HeroBackground3D from '../components/HeroBackground3D';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

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

// Enhanced Feature Section with 3D Globe
const Globe3DSection = () => {
  return (
    <Box
      sx={{
        height: 400,
        width: '100%',
        position: 'relative',
        my: 6,
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]} // Improve rendering quality
      >
        <color attach="background" args={['#000']} />
        <fog attach="fog" args={['#000', 5, 25]} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Suspense fallback={null}>
          <Globe />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          autoRotate 
          autoRotateSpeed={0.5}
          enablePan={false}
          minPolarAngle={Math.PI/2 - 0.5}
          maxPolarAngle={Math.PI/2 + 0.5}
        />
      </Canvas>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 1,
          width: '100%',
          pointerEvents: 'none',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: '#fff',
            textShadow: '0 0 20px rgba(0,0,0,0.7)',
            fontWeight: 'bold',
          }}
        >
          Global Catholic Leadership
        </Typography>
      </Box>
    </Box>
  );
};

function Home() {
  const theme = useTheme();
  const [featuredCardinals, setFeaturedCardinals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedCardinals = async () => {
      try {
        setLoading(true);
        const data = await getCardinals(1, 3); // Get first 3 cardinals for featured section
        setFeaturedCardinals(data.cardinals);
        setLoading(false);
      } catch (err) {
        setError('Failed to load featured cardinals');
        setLoading(false);
        console.error('Error fetching featured cardinals:', err);
      }
    };

    fetchFeaturedCardinals();
  }, []);

  // Example match data for the preview
  const exampleMatch = {
    user: {
      name: "Maria",
      age: 35,
      country: "Italy",
      interests: ["Social Justice", "Education", "Church History"]
    },
    cardinal: featuredCardinals.length > 0 ? featuredCardinals[0] : {
      name: "Cardinal Example",
      country: "Italy",
      biography_text: "Known for work in social justice and education reforms..."
    },
    matchReason: "Cardinal's focus on educational initiatives and social justice work aligns perfectly with your interests. Their Italian background provides cultural connection to your home country."
  };

  return (
    <Box>
      {/* Hero Section - Enhanced with more dramatic 3D Background */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.900',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: `url('https://upload.wikimedia.org/wikipedia/commons/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg')`,
          height: { xs: '80vh', md: '90vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        {/* Enhanced 3D Background with more particles */}
        <HeroBackground3D color={theme.palette.primary.main} />
        
        {/* Darkened overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.75)',
            zIndex: 1
          }}
        />
        <Container maxWidth="md" sx={{ position: 'relative', textAlign: 'center', py: 6, zIndex: 2 }}>
          <Typography
            component="h1"
            variant="h2"
            color="inherit"
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              textShadow: '0 0 20px rgba(0,0,0,0.5)',
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              animation: 'fadeIn 2s ease-in-out'
            }}
          >
            Find Your Cardinal Match
          </Typography>
          <Typography 
            variant="h5" 
            color="inherit" 
            paragraph
            sx={{ 
              textShadow: '0 0 10px rgba(0,0,0,0.5)',
              maxWidth: '800px',
              mx: 'auto',
              animation: 'slideUp 1.5s ease-in-out'
            }}
          >
            Discover which cardinal best matches your personal profile, interests, and spiritual journey.
            Our personalized matching algorithm connects you with your spiritual guide.
          </Typography>
          <Button
            component={RouterLink}
            to="/match"
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
          >
            Find My Match
          </Button>
        </Container>
      </Paper>

      {/* 3D Globe Section */}
      <Container maxWidth="lg" sx={{ my: 6 }}>
        <Globe3DSection />
      </Container>

      {/* Feature Preview Section - Enhanced */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Typography variant="h3" align="center" gutterBottom>
          How Cardinal Matching Works
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph>
          Our sophisticated algorithm matches you with cardinals based on shared backgrounds, interests, and values
        </Typography>
        <Divider sx={{ mb: 6 }} />

        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: 10
                }
              }}
            >
              <Typography variant="h5" gutterBottom align="center" color="primary">
                Your Preferences
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon><Person color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Personal Background" 
                    secondary="Age, gender, country of origin"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><InterestsOutlined color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Spiritual Interests" 
                    secondary="Theology, social justice, history, philosophy"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon><School color="primary" /></ListItemIcon>
                  <ListItemText 
                    primary="Educational Focus" 
                    secondary="Academic background and scholarly interests"
                  />
                </ListItem>
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/match"
                  variant="contained"
                  color="primary"
                >
                  Start Matching
                </Button>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar sx={{ 
              bgcolor: 'secondary.main', 
              width: 60, 
              height: 60,
              display: { xs: 'none', md: 'flex' },
              animation: 'rotate 6s infinite linear'
            }}>
              <CheckCircle sx={{ fontSize: 30 }} />
            </Avatar>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Paper 
              elevation={6} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-10px)',
                  boxShadow: 10
                }
              }}
            >
              <Typography variant="h5" gutterBottom align="center" color="primary">
                Your Perfect Match
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : featuredCardinals.length > 0 ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    {exampleMatch.cardinal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Why this match works:</strong> {exampleMatch.matchReason}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button
                      component={RouterLink}
                      to="/match"
                      variant="outlined"
                      color="primary"
                    >
                      Get My Results
                    </Button>
                  </Box>
                </>
              ) : (
                <Typography>Example match loading...</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Featured Cardinals - Enhanced with 3D cards */}
      <Box
        sx={{
          py: 8,
          bgcolor: 'grey.100',
          borderRadius: '16px',
          mx: 2,
          mt: 6,
          mb: 8,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" align="center" gutterBottom>
            Featured Cardinals
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Explore our collection of distinguished cardinals from around the world
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
          ) : (
            <Grid container spacing={4}>
              {featuredCardinals.map((cardinal, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <Box
                    sx={{
                      height: '100%',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                      }
                    }}
                  >
                    <CardinalCard cardinal={cardinal} index={index} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={RouterLink}
              to="/cardinals"
              variant="contained"
              color="primary"
              size="large"
              endIcon={<TravelExploreOutlined />}
            >
              Explore All Cardinals
            </Button>
          </Box>
        </Container>
      </Box>

      {/* About Section - Enhanced */}
      <Container maxWidth="md" sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>
          About This Project
        </Typography>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            borderRadius: 4,
            background: 'linear-gradient(145deg, rgba(255,255,255,1) 0%, rgba(248,248,248,1) 100%)'
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box 
                component="img" 
                src="https://upload.wikimedia.org/wikipedia/commons/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg" 
                alt="Vatican City"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "https://upload.wikimedia.org/wikipedia/commons/d/d6/St_Peter%27s_Square%2C_Vatican_City_-_April_2007.jpg";
                }}
                sx={{ 
                  width: '100%', 
                  height: 'auto', 
                  borderRadius: 2,
                  boxShadow: 3 
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: 'left' }}>
              <Typography variant="h5" gutterBottom>
                <ChurchOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
                Cardinal Explorer
              </Typography>
              <Typography paragraph>
                This interactive platform helps you explore and connect with the College of Cardinals
                through personalized matching, detailed profiles, and educational resources.
              </Typography>
              <Typography paragraph>
                Learn about the important roles cardinals play in the Catholic Church
                and discover which cardinal's background and work resonates most with your
                interests and spiritual journey.
              </Typography>
              <Button 
                component={RouterLink} 
                to="/about" 
                variant="outlined" 
                color="primary"
                sx={{ mt: 2 }}
              >
                Learn More
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

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