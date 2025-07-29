import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { useAppStore } from '../../store/useAppStore';
import * as THREE from 'three';

export function CameraControls() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const cameraTarget = useAppStore((state) => state.cameraTarget);
  const setCameraTarget = useAppStore((state) => state.setCameraTarget);
  const centerNodeId = useAppStore((state) => state.centerNodeId);

  // Animate camera to new center when centerNodeId changes
  useEffect(() => {
    if (!controlsRef.current) return;
    // Target position for camera (keep distance, look at [0,0,0])
    const controls = controlsRef.current;
    const currentPos = camera.position.clone();
    const targetPos = new THREE.Vector3(0, 0, currentPos.length()); // Keep distance from center

    let progress = 0;
    const duration = 0.8; // seconds
    let animationFrame: number;

    function animateCamera() {
      progress += 1 / 60 / duration;
      // Lerp camera position
      camera.position.lerp(targetPos, Math.min(progress, 1));
      // Lerp controls.target to [0,0,0]
      controls.target.lerp(new THREE.Vector3(0, 0, 0), Math.min(progress, 1));
      controls.update();

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animateCamera);
      }
    }

    animateCamera();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerNodeId]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!controlsRef.current) return;

      const speed = 2;
      const controls = controlsRef.current;

      switch (event.code) {
        case 'ArrowUp':
          controls.object.position.y += speed;
          break;
        case 'ArrowDown':
          controls.object.position.y -= speed;
          break;
        case 'ArrowLeft':
          controls.object.position.x -= speed;
          break;
        case 'ArrowRight':
          controls.object.position.x += speed;
          break;
        case 'Space':
          event.preventDefault();
          controls.reset();
          break;
        case 'Equal':
        case 'NumpadAdd':
          if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const persp = camera as THREE.PerspectiveCamera;
            persp.fov = Math.max(persp.fov - 5, 10);
            persp.updateProjectionMatrix();
          }
          break;
        case 'Minus':
        case 'NumpadSubtract':
          if ((camera as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const persp = camera as THREE.PerspectiveCamera;
            persp.fov = Math.min(persp.fov + 5, 120);
            persp.updateProjectionMatrix();
          }
          break;
      }

      controls.update();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [camera]);

  useFrame(() => {
    if (cameraTarget && controlsRef.current) {
      const controls = controlsRef.current;
      const targetPosition = new THREE.Vector3(...cameraTarget);

      // Smooth camera movement to target
      controls.target.lerp(targetPosition, 0.05);
      controls.update();

      // Clear target when close enough
      if (controls.target.distanceTo(targetPosition) < 0.1) {
        setCameraTarget(null);
      }
    }
  });

  return (
    <DreiOrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      zoomSpeed={0.6}
      panSpeed={0.8}
      rotateSpeed={0.4}
      minDistance={5}
      maxDistance={100}
      enableDamping={true}
      dampingFactor={0.05}
    />
  );
}