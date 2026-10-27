import React from 'react';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { network, clock, agentHits, neuronRadius, bezierPoint, Bezier } from './networkLayout';
import { projects } from '../../data/projects';
import { useAppStore } from '../../store/useAppStore';

const AGENTS = 4;
const ORBIT = 27; // just outside the work layer
const LEG = 1.6; // seconds to fly to a neuron or back
const DWELL = 0.5; // seconds spent "calling the tool"

type Mode = 'orbit' | 'out' | 'dwell' | 'back';

// Small autonomous agents orbiting the network. Every few seconds one flies to a neuron,
// lights it up (a tool call), then rejoins its orbit. Idle while something is in focus.
function Agent({ index }: { index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const state = useMemo(() => {
    let seed = 101 + index * 37;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    return {
      rand,
      ring: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI)),
      speed: (0.12 + rand() * 0.08) * (index % 2 ? 1 : -1),
      phase: rand() * Math.PI * 2,
      mode: 'orbit' as Mode,
      leg: null as Bezier | null,
      start: 0,
      next: 2 + index * 2.5 + rand() * 2,
      target: '',
    };
  }, [index]);
  const ids = useMemo(() => projects.filter((p) => network.nodes.has(p.id)).map((p) => p.id), []);

  const orbitAt = (t: number) => {
    const a = state.phase + state.speed * t;
    return new THREE.Vector3(Math.cos(a) * ORBIT, 0, Math.sin(a) * ORBIT).applyQuaternion(state.ring);
  };
  // Curved flight, bowing outward so it never cuts straight through the network
  const flight = (from: THREE.Vector3, to: THREE.Vector3): Bezier => {
    const bow = from.clone().add(to).multiplyScalar(0.5).normalize().multiplyScalar(from.distanceTo(to) * 0.35);
    return [from, from.clone().lerp(to, 0.33).add(bow), from.clone().lerp(to, 0.66).add(bow), to];
  };

  useFrame(() => {
    const t = clock.t;
    const s = state;
    const focused = !!(useAppStore.getState().hoveredProjectId ?? useAppStore.getState().selectedProject);
    let pos: THREE.Vector3;
    if (s.mode === 'orbit') {
      pos = orbitAt(t);
      if (t >= s.next && !focused) {
        s.target = ids[Math.floor(s.rand() * ids.length)];
        const node = network.nodes.get(s.target)!;
        const project = projects.find((p) => p.id === s.target)!;
        // Stop at the soma surface on the agent's side
        const stop = node.clone().addScaledVector(pos.clone().sub(node).normalize(), neuronRadius(project) + 0.8);
        s.leg = flight(pos, stop);
        s.start = t;
        s.mode = 'out';
      }
    } else if (s.mode === 'out') {
      const u = Math.min((t - s.start) / LEG, 1);
      pos = bezierPoint(s.leg!, u * u * (3 - 2 * u));
      if (u >= 1) {
        agentHits.set(s.target, t);
        s.mode = 'dwell';
        s.start = t;
      }
    } else if (s.mode === 'dwell') {
      pos = s.leg![3].clone();
      if (t - s.start >= DWELL) {
        // Fly back to where the orbit will be on arrival
        s.leg = flight(pos, orbitAt(t + LEG));
        s.start = t;
        s.mode = 'back';
      }
    } else {
      const u = Math.min((t - s.start) / LEG, 1);
      pos = bezierPoint(s.leg!, u * u * (3 - 2 * u));
      if (u >= 1) {
        s.mode = 'orbit';
        s.next = t + 4 + s.rand() * 6;
      }
    }
    ref.current?.position.copy(pos);
  });

  return (
    <Trail width={1.6} length={8} color="#ffd9a0" attenuation={(w) => w * w}>
      <mesh ref={ref} raycast={() => null}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshBasicMaterial color="#fff2d6" toneMapped={false} />
      </mesh>
    </Trail>
  );
}

export function Agents() {
  return (
    <>
      {Array.from({ length: AGENTS }, (_, i) => (
        <Agent key={i} index={i} />
      ))}
    </>
  );
}
