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

// More vivid base colors
const categoryColors: Record<string, string> = {
  ai: '#00E6FF',       // Vibrant cyan
  quantum: '#B077FF',  // Bright violet
  fullstack: '#00F5A8',// Neon emerald
  personal: '#FFC043', // Warm amber-gold
};

// Saturated outer glow hues (slightly deeper for contrast)
const categoryGlows: Record<string, string> = {
  ai: '#0096B3',
  quantum: '#8E3BFF',
  fullstack: '#00B777',
  personal: '#D97A00',
};

// Pre-compute highlight (lighter) variants for smooth hover transitions
const highlightColors: Record<string, THREE.Color> = Object.fromEntries(
  Object.entries(categoryColors).map(([k, v]) => {
    const base = new THREE.Color(v);
    const lighter = base.clone();
    const hsl = { h: 0, s: 0, l: 0 } as any;
    base.getHSL(hsl);
    lighter.setHSL(hsl.h, Math.min(1, hsl.s * 1.05), Math.min(1, hsl.l * 1.25));
    return [k, lighter];
  })
);

export function ProjectStar({ project }: ProjectStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const setHoveredProjectId = useAppStore(s => (s as any).setHoveredProjectId);
  const setCameraTarget = useAppStore((state) => state.setCameraTarget);
  const setSelectedProject = useAppStore((state) => state.setSelectedProject);

  // Increased sizes for better visibility
  const baseSize = project.size === 'large' ? 1.0 : project.size === 'medium' ? 0.65 : 0.4;
  const size = hovered ? baseSize * 1.5 : baseSize;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      // Pulsing scale
      const scale = size + Math.sin(t * 2 + project.position[0]) * 0.1;
      meshRef.current.scale.setScalar(scale);

      // Color & emissive pulse / hover brighten
      const mat = meshRef.current.material as THREE.MeshPhongMaterial | undefined;
      if (mat) {
        const base = new THREE.Color(categoryColors[project.category]);
        const target = hovered ? highlightColors[project.category] : base;
        // Smoothly interpolate
        mat.color.lerp(target, 0.08);
        // Emissive subtle breathing
        const emissiveStrength = 0.2 + (hovered ? 0.35 : 0.25) + Math.sin(t * 3) * 0.05;
        mat.emissive.copy(base).multiplyScalar(emissiveStrength);
        mat.needsUpdate = true;
      }
    }
    if (glowRef.current) {
      const scale = (size * 1.85) + Math.sin(t * 1.5 + project.position[0]) * 0.12;
      glowRef.current.scale.setScalar(scale);
      const gMat = glowRef.current.material as THREE.MeshBasicMaterial | undefined;
      if (gMat) {
        gMat.opacity = hovered ? 0.42 : 0.22;
      }
    }
  });

  return (
    <group position={project.position}>
      <mesh
        ref={meshRef}
        onPointerEnter={() => { setHovered(true); setHoveredProjectId(project.id); }}
        onPointerLeave={() => { setHovered(false); setHoveredProjectId(null); }}
        onClick={() => { setCameraTarget(project.position); setSelectedProject(project); }}
      >
        <sphereGeometry args={[size, 48, 48]} />
        <meshPhongMaterial
          color={categoryColors[project.category]}
          emissive={new THREE.Color(categoryColors[project.category]).multiplyScalar(0.3)}
          emissiveIntensity={1}
          shininess={95}
          specular={new THREE.Color('#e6faff')}
          transparent
          opacity={0.97}
        />
      </mesh>

      {/* Outline / halo */}
      {hovered && (
        <mesh>
          <sphereGeometry args={[size * 1.1, 40, 40]} />
          <meshBasicMaterial color={categoryColors[project.category]} transparent opacity={0.25} />
        </mesh>
      )}
      
      {/* Glow effect */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 1.95, 48, 48]} />
        <meshBasicMaterial
          color={categoryGlows[project.category]}
          transparent
          blending={THREE.AdditiveBlending}
          opacity={hovered ? 0.38 : 0.2}
          side={THREE.BackSide}
          depthWrite={false}
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
          className="bg-gray-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg border border-gray-700 text-sm sm:text-base whitespace-nowrap font-medium tracking-wide shadow-lg font-orbitron"
        >
          {project.title}
        </motion.div>
      </Html>
    </group>
  );
}