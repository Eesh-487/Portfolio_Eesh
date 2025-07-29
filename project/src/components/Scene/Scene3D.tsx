
import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { StarField } from './StarField';
import { ProjectStar } from './ProjectStar';
import { ConstellationLines } from './ConstellationLines';
import { ParticleSystem } from './ParticleSystem';
import { CameraControls } from './CameraControls';
import { projects } from '../../data/projects';
import { useAppStore } from '../../store/useAppStore';
// import { getConstellationLayout } from '../../data/constellationLayout';

interface Scene3DProps {
  onLoaded?: () => void;
}

function SceneContent() {
  // Remove: const centerNodeId = useAppStore((state) => state.centerNodeId);
  const activeFilters = useAppStore((state) => state.activeFilters);
  const searchTerm = useAppStore((state) => state.searchTerm);

  // Use static projects
  const filteredProjects = projects.filter((project) => {
    const matchesFilter = activeFilters.includes(project.category);
    const matchesSearch =
      searchTerm === '' ||
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <CameraControls />
      <StarField />
      <ParticleSystem />
      <ConstellationLines />

      {filteredProjects.map((project) => (
        <ProjectStar key={project.id} project={project} />
      ))}

      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
    </>
  );
}

export function Scene3D({ onLoaded }: Scene3DProps) {
  useEffect(() => {
    if (onLoaded) {
      // Simulate loading delay or call after assets are loaded
      const timeout = setTimeout(() => {
        onLoaded();
      }, 500); // Adjust delay as needed or remove if not needed
      return () => clearTimeout(timeout);
    }
  }, [onLoaded]);

  return (
    <Canvas
      camera={{
        position: [0, 0, 20],
        fov: 60,
        near: 0.1,
        far: 1000,
      }}
      style={{
        background:
          'radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      }}
    >
      <Suspense fallback={null}>
        <SceneContent />
      </Suspense>
    </Canvas>
  );
}