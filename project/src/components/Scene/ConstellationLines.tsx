import React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { projects } from '../../data/projects';
import { useAppStore } from '../../store/useAppStore';

export function ConstellationLines() {
  const hoveredProjectId = useAppStore((s: any) => s.hoveredProjectId);
  const lines = useMemo(() => {
    const lineData: Array<{ points: [number, number, number][]; color: string; opacity: number }> = [];
    
    projects.forEach((project) => {
      if (project.connections) {
        project.connections.forEach((connectionId) => {
          const connectedProject = projects.find(p => p.id === connectionId);
          if (connectedProject) {
            // Vary opacity based on project importance
            const opacity = project.size === 'large' ? 0.4 : project.size === 'medium' ? 0.3 : 0.2;
            lineData.push({
              points: [project.position, connectedProject.position],
              color: '#4A5568',
              opacity: opacity
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
        const isHighlighted = !!hoveredProjectId && (() => {
          const [aPos, bPos] = line.points;
          const a = projects.find(pr => JSON.stringify(pr.position) === JSON.stringify(aPos));
            const b = projects.find(pr => JSON.stringify(pr.position) === JSON.stringify(bPos));
          if (!a || !b) return false;
          return a.id === hoveredProjectId || b.id === hoveredProjectId;
        })();
        
        return (
          <line key={index}>
            <bufferGeometry attach="geometry" {...geometry} />
            <lineBasicMaterial
              attach="material"
              color={isHighlighted ? '#4cc9f0' : line.color}
              transparent
              opacity={isHighlighted ? 0.7 : line.opacity}
            />
          </line>
        );
      })}
    </>
  );
}