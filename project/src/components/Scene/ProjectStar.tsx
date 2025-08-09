import React from 'react';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { Project } from '../../types/project';
import { useAppStore } from '../../store/useAppStore';

interface ProjectStarProps {
  project: Project;
}

const categoryColors = {
  ai: '#06B6D4',
  quantum: '#8B5CF6',
  fullstack: '#14B8A6',
  personal: '#F59E0B',
};

const categoryGlows = {
  ai: '#0891B2',
  quantum: '#7C3AED',
  fullstack: '#0F766E',
  personal: '#D97706',
};

export function ProjectStar({ project }: ProjectStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setCameraTarget = useAppStore((state) => state.setCameraTarget);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);

  // Increased sizes for better visibility
  const baseSize = project.size === 'large' ? 1.0 : project.size === 'medium' ? 0.65 : 0.4;
  const size = hovered ? baseSize * 1.5 : baseSize;

  useFrame((state) => {
    if (meshRef.current) {
      // Enhanced pulsing animation
      const scale = size + Math.sin(state.clock.elapsedTime * 2 + project.position[0]) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      const scale = (size * 1.8) + Math.sin(state.clock.elapsedTime * 1.5 + project.position[0]) * 0.15;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={project.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onClick={() => {setCameraTarget(project.position); setSelectedProject(project);}} 
      >
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={categoryColors[project.category]}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.8, 24, 24]} />
        <meshBasicMaterial
          color={categoryGlows[project.category]}
          transparent
          opacity={hovered ? 0.4 : 0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Always visible label */}
      <Html
        position={[0, size + 1.1, 0]}
        center
        distanceFactor={15}
        className="pointer-events-none"
        zIndexRange={[0, 50]} // Set a lower z-index range so modal can appear above
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-700 text-sm sm:text-base whitespace-nowrap font-medium tracking-wide shadow-lg"
        >
          {project.title}
        </motion.div>
      </Html>
    </group>
  );
}