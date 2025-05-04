import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import { LocationOn, Today, Person } from '@mui/icons-material';

const defaultImage = 'https://placehold.co/300x200/b71c1c/ffffff?text=Cardinal+Photo+Missing';

// Preload and validate image URLs
const useValidatedImage = (imageUrl) => {
  const [validatedUrl, setValidatedUrl] = useState(defaultImage);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Skip validation if it's already the default image
    if (imageUrl === defaultImage) {
      setValidatedUrl(defaultImage);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    // Check if the URL is a Vatican press URL that might fail
    const isVaticanUrl = imageUrl && imageUrl.includes('press.vatican.va');
    if (isVaticanUrl) {
      // For Vatican URLs, use our default image instead of attempting to load them
      console.warn('Skipping potentially problematic Vatican URL:', imageUrl);
      setValidatedUrl(defaultImage);
      setIsLoading(false);
      return;
    }
    
    // For other URLs, validate by preloading
    const img = new Image();
    img.onload = () => {
      setValidatedUrl(imageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      console.warn('Image failed to load:', imageUrl);
      setValidatedUrl(defaultImage);
      setIsLoading(false);
    };
    img.src = imageUrl || defaultImage;
    
    return () => {
      // Cancel image load if component unmounts
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);
  
  return { validatedUrl, isLoading };
};

// 3D Card Model component that will be rendered in the Canvas
const CardModel = ({ 
  rotateOnMouseMove = true, 
  mousePosition, 
  isHovered,
  imageUrl, 
  scale = 1.0
}) => {
  const meshRef = useRef();
  const targetRotation = useRef({ x: 0, y: 0 });
  const [textureError, setTextureError] = useState(false);
  
  // Use validated URL to ensure image loads
  const { validatedUrl } = useValidatedImage(imageUrl);
  
  // Load image as texture with error handling
  const texture = useTexture(
    validatedUrl, 
    (loadedTexture) => {
      console.log('Cardinal image loaded successfully');
      // Fix texture aspect ratio
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
      loadedTexture.minFilter = THREE.LinearFilter;
      loadedTexture.needsUpdate = true;
    }, 
    (error) => {
      console.error('Failed to load cardinal image:', error);
      setTextureError(true);
    }
  );
  
  // Fallback texture for errors
  const fallbackTexture = useTexture(
    defaultImage,
    (loadedTexture) => {
      loadedTexture.wrapS = THREE.ClampToEdgeWrapping;
      loadedTexture.wrapT = THREE.ClampToEdgeWrapping;
      loadedTexture.minFilter = THREE.LinearFilter;
      loadedTexture.needsUpdate = true;
    },
    (error) => console.error('Even fallback image failed to load:', error)
  );
  
  // Update rotation when mouse moves
  useEffect(() => {
    if (rotateOnMouseMove && mousePosition && isHovered) {
      // Convert mouse position to rotation (limited range)
      const rotX = (mousePosition.y * 0.1); // Up/down movement
      const rotY = -(mousePosition.x * 0.1); // Left/right movement
      
      targetRotation.current = { x: rotX, y: rotY };
    } else {
      targetRotation.current = { x: 0, y: 0 };
    }
  }, [mousePosition, rotateOnMouseMove, isHovered]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth rotation toward target
      meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.1;
      meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.1;
      
      // Hover effect
      if (isHovered) {
        // Scale up slightly and maintain height when hovered
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scale * 1.05, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scale * 1.05, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, scale * 1.05, 0.1);
        
        // Add a subtle floating animation when hovered
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        // Scale back to normal when not hovered
        meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, scale, 0.1);
        meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, scale, 0.1);
        meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, scale, 0.1);
        
        // Reset position
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1);
      }
    }
  });
  
  // Create UV coordinates that ensure the image is properly centered and scaled
  const createProperUvs = () => {
    const uvs = new Float32Array([
      0, 1, // bottom left
      1, 1, // bottom right
      0, 0, // top left
      1, 0, // top right
      
      0, 1, // right face - not shown
      1, 1,
      0, 0,
      1, 0,
      
      0, 1, // back face - not shown
      1, 1,
      0, 0,
      1, 0,
      
      0, 1, // left face - not shown
      1, 1,
      0, 0,
      1, 0,
      
      0, 1, // top face - not shown
      1, 1,
      0, 0,
      1, 0,
      
      0, 1, // bottom face - not shown
      1, 1,
      0, 0,
      1, 0,
    ]);
    
    return uvs;
  };
  
  return (
    <mesh ref={meshRef} scale={[scale, scale, scale]}>
      <boxGeometry args={[4, 5, 0.2]}>
        <bufferAttribute 
          attach="attributes-uv" 
          array={createProperUvs()} 
          count={24} 
          itemSize={2}
        />
      </boxGeometry>
      <meshStandardMaterial 
        map={textureError ? fallbackTexture : texture} 
        metalness={0.2}
        roughness={0.3}
        side={THREE.FrontSide}
        transparent={false}
        alphaTest={0.5}
      />
    </mesh>
  );
};

// Main component with both 3D and fallback versions
function CardinalCard3D({ cardinal, index }) {
  const navigate = useNavigate();
  const containerRef = useRef();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);
  const [componentLoading, setComponentLoading] = useState(true);
  
  // Handle missing data
  const {
    name = 'Unknown Name',
    country = 'Unknown Country',
    birth_date = 'Unknown Birth Date',
    appointing_pope = 'Unknown Pope',
    photo_url,
    biography_text = ''
  } = cardinal;

  // Use the validated image system to fix loading issues
  const { validatedUrl, isLoading: imageLoading } = useValidatedImage(photo_url);
  const actualPhotoUrl = validatedUrl;
  
  // Clear loading state after a delay to allow textures to load
  useEffect(() => {
    const timer = setTimeout(() => {
      setComponentLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Only enable 3D mode when image is fully loaded
  useEffect(() => {
    if (!imageLoading && !componentLoading) {
      // Add a small delay to ensure everything is ready
      const timer = setTimeout(() => {
        setIs3DReady(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [imageLoading, componentLoading]);
  
  // Track mouse position relative to card center
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const bounds = containerRef.current.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    
    // Calculate mouse position relative to center (-1 to 1 range)
    const x = (e.clientX - centerX) / (bounds.width / 2);
    const y = (e.clientY - centerY) / (bounds.height / 2);
    
    setMousePosition({ x, y });
  };
  
  // Navigation handler
  const handleViewDetails = () => {
    if (typeof index === 'number') {
      navigate(`/cardinals/${index}`);
    } else {
      const simpleName = name.split(' ').pop().toLowerCase();
      navigate(`/cardinals/${simpleName}`);
    }
  };
  
  // Get a short bio excerpt if available
  const bioExcerpt = biography_text 
    ? biography_text.substring(0, 120) + (biography_text.length > 120 ? '...' : '')
    : 'No biography available.';
  
  // Error handling for 3D rendering
  const handleError = () => {
    console.warn('3D rendering not supported, falling back to standard card');
    setFallbackMode(true);
  };
  
  // Use standard card if 3D is not ready, has an error, or for Vatican URLs that often fail
  const useStandardCard = fallbackMode || !is3DReady || imageLoading || componentLoading;
  
  // Fallback to standard card if 3D rendering fails or while loading
  if (useStandardCard) {
    return (
      <Card 
        className="cardinal-card"
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 6
          },
          position: 'relative'
        }}
      >
        {/* Loading overlay */}
        {(imageLoading || componentLoading) && (
          <Box 
            sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              bgcolor: 'rgba(255, 255, 255, 0.7)'
            }}
          >
            <CircularProgress size={40} color="primary" />
          </Box>
        )}
        
        <CardMedia
          component="img"
          height="250"
          image={actualPhotoUrl}
          alt={name}
          sx={{ 
            objectFit: 'contain', 
            bgcolor: '#f5f5f5',
            objectPosition: 'center'
          }}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            {name}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Chip 
              icon={<LocationOn />} 
              label={country} 
              size="small" 
              sx={{ mr: 1, mb: 1 }} 
            />
            <Chip 
              icon={<Today />} 
              label={birth_date} 
              size="small" 
              sx={{ mr: 1, mb: 1 }} 
            />
            <Chip 
              icon={<Person />} 
              label={`Appointed by ${appointing_pope}`} 
              size="small" 
              sx={{ mb: 1 }} 
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            {bioExcerpt}
          </Typography>
          
          <Box sx={{ mt: 'auto' }}>
            <Divider sx={{ my: 2 }} />
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleViewDetails}
              fullWidth
            >
              View Details
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  // 3D enhanced card - only shown when everything is ready
  return (
    <Card 
      className="cardinal-card-3d"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isHovered ? 6 : 1
      }}
    >
      {/* 3D Canvas for card image */}
      <Box sx={{ height: 200, position: 'relative', bgcolor: '#f5f5f5' }}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%',
            zIndex: 1
          }}
        >
          <Canvas
            camera={{ position: [0, 0, 5], fov: 45 }}
            onError={handleError}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <spotLight 
              position={[0, 5, 10]} 
              intensity={0.6}
              angle={0.3}
              penumbra={1}
            />
            <Suspense fallback={null}>
              <CardModel 
                imageUrl={actualPhotoUrl}
                mousePosition={mousePosition}
                isHovered={isHovered}
              />
            </Suspense>
          </Canvas>
        </Box>
      </Box>
      
      {/* Card content */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h5" component="h2" gutterBottom>
          {name}
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Chip 
            icon={<LocationOn />} 
            label={country} 
            size="small" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            icon={<Today />} 
            label={birth_date} 
            size="small" 
            sx={{ mr: 1, mb: 1 }} 
          />
          <Chip 
            icon={<Person />} 
            label={`Appointed by ${appointing_pope}`} 
            size="small" 
            sx={{ mb: 1 }} 
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          {bioExcerpt}
        </Typography>
        
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ my: 2 }} />
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={handleViewDetails}
            fullWidth
            sx={{
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transition: 'left 0.5s',
              },
              '&:hover::after': {
                left: '100%',
              }
            }}
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CardinalCard3D; 