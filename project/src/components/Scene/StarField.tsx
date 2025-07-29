import React from 'react';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null);

  // Spherical distribution for realistic cosmic starfield
  const positions = useMemo(() => {
    const count = 5000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Uniformly distribute stars on a spherical shell with some thickness
      const minRadius = 120;
      const maxRadius = 200;
      const radius = minRadius + Math.random() * (maxRadius - minRadius);
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);

      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);

  // Optional: slow rotation for cosmic effect
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0003;
      pointsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
      <bufferAttribute
        attach="attributes-position"
        args={[positions, 3]}
      />
    </bufferGeometry>
      <pointsMaterial
        transparent
        color="#ffffff"
        size={0.6}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </points>
  );
}
export default StarField;