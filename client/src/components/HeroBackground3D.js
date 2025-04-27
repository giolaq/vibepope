import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Suspense } from 'react';

// Dove model component
const Dove = ({ position, rotation, scale = 1, color = '#ffffff' }) => {
  const group = useRef();
  
  // Animation parameters
  const speed = useMemo(() => Math.random() * 0.2 + 0.1, []);
  const wingSpeed = useMemo(() => Math.random() * 1 + 2, []);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);
  const flyDirection = useMemo(() => new THREE.Vector3(
    (Math.random() - 0.5) * 0.2,
    (Math.random() - 0.5) * 0.1,
    (Math.random() - 0.5) * 0.2
  ), []);
  
  // Animation with defensive checks
  useFrame((state) => {
    if (!group.current) return;
    
    try {
      // Move in a specific direction
      group.current.position.x += flyDirection.x * speed;
      group.current.position.y += flyDirection.y * speed;
      group.current.position.z += flyDirection.z * speed;
      
      // Flap wings - with checks to make sure children exist
      const leftWing = group.current.children && group.current.children[1];
      const rightWing = group.current.children && group.current.children[2];
      
      if (leftWing) {
        leftWing.rotation.z = Math.sin(state.clock.elapsedTime * wingSpeed + phase) * 0.3 - 0.2;
      }
      
      if (rightWing) {
        rightWing.rotation.z = -Math.sin(state.clock.elapsedTime * wingSpeed + phase) * 0.3 + 0.2;
      }
      
      // Rotate to face direction of movement
      if (flyDirection.length() > 0) {
        const targetRotation = Math.atan2(flyDirection.x, flyDirection.z);
        group.current.rotation.y = targetRotation;
      }
      
      // Reset position if dove flies too far away
      const distance = group.current.position.length();
      if (distance > 15) {
        // Reset to opposite side
        group.current.position.x = -group.current.position.x * 0.9;
        group.current.position.z = -group.current.position.z * 0.9;
      }
    } catch (error) {
      console.error("Error animating dove:", error);
    }
  });
  
  return (
    <group ref={group} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      {/* Body */}
      <mesh>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Left Wing */}
      <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.3, 0.05, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Right Wing */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.3, 0.05, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.15, 0.15]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Tail */}
      <mesh position={[0, -0.05, -0.25]} rotation={[0.2, 0, 0]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// Flock of doves component
const DovesFlock = ({ count = 15, color = '#ffffff' }) => {
  // Generate initial positions and rotations
  const doves = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5 + 2, // Keep doves higher in the scene
        (Math.random() - 0.5) * 10
      ],
      rotation: [0, Math.random() * Math.PI * 2, 0],
      scale: Math.random() * 0.3 + 0.7,
    }));
  }, [count]);
  
  return (
    <>
      {doves.map((dove, index) => (
        <Dove
          key={index}
          position={dove.position}
          rotation={dove.rotation}
          scale={dove.scale}
          color={color}
        />
      ))}
    </>
  );
};

// Connection lines (we'll keep this as it looks nice with the doves)
const ConnectionLines = ({ count = 25, color = '#b71c1c', opacity = 0.15 }) => {
  const linesRef = useRef();
  
  // Initialize lines - use useEffect with proper cleanup
  useEffect(() => {
    if (!linesRef.current) return;
    
    const geometry = linesRef.current.geometry;
    const positions = new Float32Array(count * 6); // 2 points per line, 3 values (x,y,z) per point
    
    for (let i = 0; i < count; i++) {
      const i6 = i * 6;
      // First point
      positions[i6] = (Math.random() - 0.5) * 10;
      positions[i6 + 1] = (Math.random() - 0.5) * 10;
      positions[i6 + 2] = (Math.random() - 0.5) * 10;
      
      // Second point
      positions[i6 + 3] = (Math.random() - 0.5) * 10;
      positions[i6 + 4] = (Math.random() - 0.5) * 10;
      positions[i6 + 5] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Store original positions for animation reference
    const originalPositions = positions.slice();
    geometry.userData = { originalPositions };
    
    // Cleanup function
    return () => {
      if (geometry.attributes.position) {
        geometry.attributes.position.array = null;
        geometry.attributes.position = null;
      }
      if (geometry.userData) {
        geometry.userData = null;
      }
    };
  }, [count]);
  
  // Animation with defensive checks
  useFrame((state, delta) => {
    if (!linesRef.current) return;
    
    // Gentle rotation
    linesRef.current.rotation.x += delta * 0.03;
    linesRef.current.rotation.y += delta * 0.04;
    
    // Make sure the geometry and position attribute exist
    const geometry = linesRef.current.geometry;
    if (!geometry || !geometry.attributes || !geometry.attributes.position) return;
    
    const positions = geometry.attributes.position;
    if (!positions || !positions.array || positions.count === undefined) return;
    
    // Animate line positions for flowing effect
    for (let i = 0; i < positions.count; i++) {
      const idx = i * 3;
      if (idx + 2 >= positions.array.length) continue; // Avoid out of bounds
      
      const time = state.clock.elapsedTime;
      
      // Add subtle movement to points
      if (i % 2 === 0) { // Only move one end of each line
        positions.array[idx] += Math.sin(time + i) * 0.003;
        positions.array[idx + 1] += Math.cos(time + i) * 0.003;
        positions.array[idx + 2] += Math.sin(time + i) * 0.003;
      }
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </lineSegments>
  );
};

// Enhanced error handling wrapper
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  // Handle errors in the 3D scene
  useEffect(() => {
    const handleError = (event) => {
      console.error("Three.js error caught:", event.error);
      setHasError(true);
      // Prevent the error from bubbling up
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  if (hasError) {
    return null; // Return empty component if error occurred
  }
  
  return children;
};

// Main component
const HeroBackground3D = ({ color = '#b71c1c' }) => {
  const [renderError, setRenderError] = useState(false);
  
  // Handle render errors
  const handleRenderError = useCallback((error) => {
    console.error("Render error in HeroBackground3D:", error);
    setRenderError(true);
  }, []);
  
  // Don't render anything if we've had a render error
  if (renderError) {
    return null;
  }
  
  return (
    <div style={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%',
      zIndex: 0,
      opacity: 0.8,
      pointerEvents: 'none' // Allow clicking through to elements beneath
    }}>
      <ErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'transparent' }}
          dpr={[1, 2]} // Higher resolution on retina displays
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance'
          }}
          onError={handleRenderError}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={0.5} />
            <fog attach="fog" args={['#000', 8, 30]} />
            <DovesFlock count={15} color="#ffffff" />
            <ConnectionLines color={color} count={30} />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  );
};

export default HeroBackground3D; 