import React, { createContext, useContext, useState, useEffect } from 'react';
import * as THREE from 'three';

// Create context
const ThreeContext = createContext();

// Hook to use the Three.js context
export const useThree = () => useContext(ThreeContext);

// Helper function to detect WebGL support
const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Provider component
export const ThreeProvider = ({ children }) => {
  const [renderer, setRenderer] = useState(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [camera, setCamera] = useState(null);
  const [scene, setScene] = useState(null);

  // Initialize Three.js on mount
  useEffect(() => {
    try {
      // Check WebGL support
      if (!isWebGLAvailable()) {
        setHasWebGL(false);
        console.warn('WebGL is not available in your browser. 3D effects disabled.');
        return;
      }

      // Initialize the scene, camera, and renderer
      const newScene = new THREE.Scene();
      const newCamera = new THREE.PerspectiveCamera(
        75, // field of view
        window.innerWidth / window.innerHeight, // aspect ratio
        0.1, // near clipping plane
        1000 // far clipping plane
      );
      newCamera.position.z = 5;

      const newRenderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true // transparent background
      });
      newRenderer.setSize(window.innerWidth, window.innerHeight);
      newRenderer.setPixelRatio(window.devicePixelRatio);
      
      // Set state
      setScene(newScene);
      setCamera(newCamera);
      setRenderer(newRenderer);

      // Handle window resize
      const handleResize = () => {
        if (newCamera && newRenderer) {
          newCamera.aspect = window.innerWidth / window.innerHeight;
          newCamera.updateProjectionMatrix();
          newRenderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Clean up
      return () => {
        window.removeEventListener('resize', handleResize);
        if (newRenderer) {
          newRenderer.dispose();
        }
      };
    } catch (error) {
      console.error('Error initializing Three.js:', error);
      setHasWebGL(false);
    }
  }, []);

  // Value to be provided to consumers
  const contextValue = {
    renderer,
    camera,
    scene,
    hasWebGL,
    // Helper methods
    createParticleSystem: (count = 1000, size = 0.05, color = 0xffffff) => {
      if (!scene) return null;
      
      const particles = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      
      for (let i = 0; i < count * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i + 1] = (Math.random() - 0.5) * 10;
        positions[i + 2] = (Math.random() - 0.5) * 10;
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      
      const material = new THREE.PointsMaterial({
        color,
        size,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      });
      
      const particleSystem = new THREE.Points(particles, material);
      scene.add(particleSystem);
      
      return particleSystem;
    },
    animate: (callback) => {
      if (!renderer || !scene || !camera) return null;
      
      const animate = () => {
        const id = requestAnimationFrame(animate);
        if (callback) callback();
        renderer.render(scene, camera);
        return id;
      };
      
      const animationId = animate();
      return () => cancelAnimationFrame(animationId);
    }
  };

  return (
    <ThreeContext.Provider value={contextValue}>
      {children}
    </ThreeContext.Provider>
  );
};

export default ThreeProvider; 