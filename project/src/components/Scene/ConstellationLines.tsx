import { useMemo } from 'react';
import * as THREE from 'three';
import { projects } from '../../data/projects';

export function ConstellationLines() {
  const lines = useMemo(() => {
    const lineData: Array<{ points: [number, number, number][]; color: string }> = [];
    
    projects.forEach((project) => {
      if (project.connections) {
        project.connections.forEach((connectionId) => {
          const connectedProject = projects.find(p => p.id === connectionId);
          if (connectedProject) {
            lineData.push({
              points: [project.position, connectedProject.position],
              color: '#4A5568'
            });
          }
        });
      }
    });
    
    return lineData;
  }, []);

  return (
    <>
      {lines.map((line, index) => {
        const points = line.points.map(point => new THREE.Vector3(...point));
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        return (
          <line key={index}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              attach="material"
              color={line.color}
              transparent
              opacity={0.3}
            />
          </line>
        );
      })}
    </>
  );
}