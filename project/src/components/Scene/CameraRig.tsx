import React from 'react';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useAppStore } from '../../store/useAppStore';
import { network, clock, selection, LAYER_R } from './networkLayout';

// Resting view: whole network in frame, nudged down to clear the identity panel at the top
const REST = new THREE.Vector3(0, 3, 0);
const REST_DISTANCE = 54;
const PANEL_WIDTH = 460; // desktop detail panel, keep the focused neuron left of it
const IDLE_BEFORE_ROTATE = 4000; // ms after the last drag before the slow orbit resumes
const HALF_FOV = Math.tan(THREE.MathUtils.degToRad(55 / 2));

// Distance that keeps the whole network on screen; narrow screens are bound by width
function overviewDistance(aspect: number) {
  return Math.max(REST_DISTANCE, (LAYER_R[4] * 1.1) / (HALF_FOV * Math.min(aspect, 1)));
}

// What to frame for a selection: a neuron with outgoing branches (you, a section) is framed
// together with what it leads to; a single output is framed on its own
function frameFor(id: string, aspect: number) {
  const children = id === 'about-me'
    ? network.links.filter(([a]) => a === id).map(([, b]) => b)
    : network.children.get(id) ?? [];
  const points = [id, ...children].map((c) => network.nodes.get(c)!.clone());
  const center = points.reduce((m, v) => m.add(v), new THREE.Vector3()).divideScalar(points.length);
  const spread = Math.max(...points.map((v) => v.distanceTo(center)));
  // Narrow screens are bound by width, not height
  const fitWidth = (spread * 1.15) / (HALF_FOV * Math.min(aspect, 1));
  return { center, distance: Math.max(13, spread * 2.2, fitWidth) };
}

// Orbit freely; selecting a neuron glides the camera to it, closing glides back out.
// Also owns the shared animation clock so the UI can pause motion.
export function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const selected = useAppStore((s) => s.selectedProject);
  const { camera, size } = useThree();
  const gliding = useRef(true);
  const offset = useRef(0);
  const lift = useRef(0);
  const dragging = useRef(false);
  const lastDrag = useRef(-Infinity);

  useEffect(() => {
    gliding.current = true;
    selection.at = performance.now();
  }, [selected]);

  // Re-frame when the device turns between portrait and landscape
  const portrait = size.width < size.height;
  useEffect(() => {
    gliding.current = true;
  }, [portrait]);

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

    // Shift the rendered view left while the side panel is open, or up above the bottom sheet on phones
    const wantOffset = node && size.width >= 1024 ? PANEL_WIDTH / 2 : 0;
    const wantLift = node && size.width < 640 ? size.height * 0.27 : 0;
    offset.current = THREE.MathUtils.lerp(offset.current, wantOffset, k);
    lift.current = THREE.MathUtils.lerp(lift.current, wantLift, k);
    const cam = camera as THREE.PerspectiveCamera;
    if (Math.abs(offset.current) > 0.5 || Math.abs(lift.current) > 0.5) {
      cam.setViewOffset(size.width, size.height, offset.current, lift.current, size.width, size.height);
    } else cam.clearViewOffset();

    const c = controls.current;
    if (!c) return;
    // Slow orbit while idle: off when something is in focus, while dragging, and when motion is paused
    c.autoRotate = !selected && !motionPaused && !dragging.current && !useAppStore.getState().hoveredProjectId
      && performance.now() - lastDrag.current > IDLE_BEFORE_ROTATE;
    if (!gliding.current) return;
    const aspect = size.width / size.height;
    const frame = node && selected ? frameFor(selected.id, aspect) : null;
    const target = frame?.center ?? REST;
    const distance = frame?.distance ?? overviewDistance(aspect);
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
      maxDistance={120}
      autoRotateSpeed={0.4}
      onStart={() => { gliding.current = false; dragging.current = true; }}
      onEnd={() => { dragging.current = false; lastDrag.current = performance.now(); }}
    />
  );
}
