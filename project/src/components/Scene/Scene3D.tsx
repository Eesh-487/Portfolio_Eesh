import React from 'react';
import { Suspense, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Neuron } from './Neuron';
import { Synapses } from './Synapses';
import { Backdrop } from './Backdrop';
import { CameraRig } from './CameraRig';
import { Agents } from './Agents';
import { network, RENDER_DPR } from './networkLayout';
import { projects, matchesSearch } from '../../data/projects';
import { useAppStore } from '../../store/useAppStore';

interface Scene3DProps {
  onLoaded?: () => void;
}

function SceneContent() {
  const searchTerm = useAppStore((state) => state.searchTerm);
  const searching = searchTerm.length > 1;
  // Bloom costs a full-screen pass or two; keep it to larger screens
  const bloom = window.matchMedia('(min-width: 768px)').matches;

  return (
    <>
      <CameraRig />
      <Backdrop />
      <Synapses />
      <Agents />

      {projects.filter((p) => network.nodes.has(p.id)).map((project) => (
        <Neuron
          key={project.id}
          project={project}
          searching={searching}
          matched={searching && matchesSearch(project, searchTerm)}
        />
      ))}

      {bloom && (
        <EffectComposer>
          <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.45} luminanceSmoothing={0.3} />
        </EffectComposer>
      )}
    </>
  );
}

// Fine film grain (SVG turbulence) to keep the dark gradients from banding
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export function Scene3D({ onLoaded }: Scene3DProps) {
  const down = useRef({ x: 0, y: 0 });

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
    <div className="absolute inset-0 bg-[#040507]">
      {/* Static layers behind the canvas: vignette, a dot grid that fades toward the edges, fine grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_45%,#0f141b_0%,#080a0e_55%,#030405_100%)]" />
      <div
        className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black_20%,transparent_85%)]"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1.2px) 0 0 / 28px 28px' }}
      />
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      <Canvas
        dpr={RENDER_DPR}
        camera={{
          position: [-8, 9, 62],
          fov: 55,
          near: 0.1,
          far: 1000,
        }}
        onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
        // Clicking empty space closes the detail panel; finishing a drag does not
        onPointerMissed={(e) => {
          if (Math.hypot(e.clientX - down.current.x, e.clientY - down.current.y) < 5) {
            useAppStore.getState().setSelectedProject(null);
          }
        }}
      >
        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
