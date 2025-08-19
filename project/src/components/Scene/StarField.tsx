import React from 'react';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simple custom shader material for subtle twinkle
const vertexShader = `
  uniform float uTime;
  attribute float aScale;
  varying float vScale;
  void main() {
    vScale = aScale;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = (vScale + (sin(uTime * 0.6 + position.x * 0.05) * 0.5 + 0.5) * 1.5) * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;
const fragmentShader = `
  varying float vScale;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float intensity = 1.0 - smoothstep(0.0, 0.5, d);
    gl_FragColor = vec4(vec3(0.8,0.9,1.0) * intensity, intensity);
  }
`;

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  // Spherical distribution for realistic cosmic starfield
  const { positions, scales } = useMemo(() => {
    const count = 3500;
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Uniformly distribute stars on a spherical shell with some thickness
      const minRadius = 120;
      const maxRadius = 200;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      scales[i] = Math.random() * 2 + 0.5;
    }
    return { positions, scales };
  }, []);

  // Optional: slow rotation for cosmic effect
  const start = useRef(performance.now());
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00025;
      pointsRef.current.rotation.x += 0.00008;
      const material: any = pointsRef.current.material;
      if (material.uniforms) {
        material.uniforms.uTime.value = (performance.now() - start.current) / 1000;
      }
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        uniforms={{ uTime: { value: 0 } }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
}
export default StarField;