import React from 'react';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { network, clock, selection } from './networkLayout';

const ORIGIN = new THREE.Vector3();
const PANEL_WIDTH = 460; // desktop detail panel, keep the focused neuron left of it

// What to frame for a selection: a neuron with outgoing branches (you, a section) is framed
// together with what it leads to; a single output is framed on its own
function frameFor(id: string) {
  const children = id === 'about-me'
    ? network.links.filter(([a]) => a === id).map(([, b]) => b)
    : network.children.get(id) ?? [];
  const points = [id, ...children].map((c) => network.nodes.get(c)!);
  const center = points.reduce((m, v) => m.add(v), new THREE.Vector3()).divideScalar(points.length);
  const spread = Math.max(...points.map((v) => v.distanceTo(center)));
  return { center, distance: Math.max(13, spread * 2.2) };
}

// Orbit freely; selecting a neuron glides the camera to it, closing glides back out.
// Also owns the shared animation clock so the UI can pause motion.
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const selected = useAppStore((s) => s.selectedProject);
  const { camera, size } = useThree();
  const gliding = useRef(true);
  const offset = useRef(0);

  useEffect(() => {
    gliding.current = true;
    selection.at = performance.now();
  }, [selected]);

  useEffect(() => {
    const reset = () => {
      useAppStore.getState().setSelectedProject(null);
      gliding.current = true;
    };
    document.addEventListener('reset-view', reset);
    return () => document.removeEventListener('reset-view', reset);
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { motionPaused } = useAppStore.getState();
    if (!motionPaused) clock.t += dt;

    const k = 1 - Math.exp(-(motionPaused ? 12 : 2.5) * dt);
    const node = selected && network.nodes.get(selected.id);

    // Shift the rendered view left while the side panel is open
    const wantOffset = node && size.width >= 1024 ? PANEL_WIDTH / 2 : 0;
    offset.current = THREE.MathUtils.lerp(offset.current, wantOffset, k);
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(offset.current) > 0.5) cam.setViewOffset(size.width, size.height, offset.current, 0, size.width, size.height);
    else cam.clearViewOffset();

    const c = controls.current;
    if (!c || !gliding.current) return;
    const frame = node && selected ? frameFor(selected.id) : null;
    const target = frame?.center ?? ORIGIN;
    const distance = frame?.distance ?? 31;
    c.target.lerp(target, k);
    const want = target.clone().addScaledVector(camera.position.clone().sub(c.target).normalize(), distance);
    camera.position.lerp(want, k);
    if (c.target.distanceTo(target) < 0.05 && camera.position.distanceTo(want) < 0.1) gliding.current = false;
  });

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      rotateSpeed={0.5}
      minDistance={6}
      maxDistance={90}
      onStart={() => (gliding.current = false)}
    />
  );
}
