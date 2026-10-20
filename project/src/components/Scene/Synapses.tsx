import React from 'react';
import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as THREE from 'three';
import { network, fibers, waveX, clock, selection, branchDelay, axonCurve, SECTIONS, sectionOf, Bezier } from './networkLayout';
import { taperedTube } from './dendrites';
import { useAppStore } from '../../store/useAppStore';

const PULSES = 240;
const THORNS_PER_FIBER = 5;
const AXON_WIDTH = 0.095;
const FIBER_WIDTH = AXON_WIDTH * 0.85; // where a branch leaves its axon
const INTRO_START = 1.0; // background pathways fade in after the labelled neurons

// On the focused path: you, the focus's section, the focus and its direct neighbours
const onPath = (id: string, focus: string | null | undefined) => branchDelay(id, focus) !== null;

// Dim structural pathways that brighten as the forward-pass wave crosses them
const edgeVertex = /* glsl */ `
varying float vX;
void main(){
  vX = position.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const edgeFragment = /* glsl */ `
uniform float uWave, uIntro, uFocus;
varying float vX;
void main(){
  float a = (0.07 + 0.18 * exp(-pow((vX - uWave) / 3.0, 2.0))) * uIntro * mix(1.0, 0.2, uFocus);
  gl_FragColor = vec4(vec3(0.5, 0.8, 0.9) * a, a);
}
`;

// Labelled connections: tapered, translucent "thorn" fibres in the same language as the dendrites
const fiberVertex = /* glsl */ `
attribute float aDist;
varying float vDist;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vDist = aDist;
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const fiberFragment = /* glsl */ `
uniform vec3 uFrom, uTo;
uniform float uLit, uDim, uIntro, uTime, uFan, uSplit;
varying float vDist;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vec3 col = mix(uFrom, uTo, vDist);
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.5);
  // A slow shimmer runs along a lit path, source to target
  float shimmer = exp(-pow((vDist - fract(uTime * 0.45)) / 0.07, 2.0)) * 0.9 * uLit;
  float i = (mix(0.3, 1.15, uLit) * (0.45 + fres) + shimmer) * mix(1.0, 0.15, uDim) * uIntro;
  // Siblings share the axon segment exactly (up to uSplit); split its light between them
  i *= mix(1.0 / uFan, 1.0, smoothstep(uSplit, uSplit + 0.12, vDist));
  gl_FragColor = vec4(mix(col, vec3(1.0), uLit * 0.15) * i, i);
}
`;

// Unlabelled background neurons: small soft cells with a slow, irregular glow
const neuronVertex = /* glsl */ `
uniform float uTime, uWave, uIntro, uFocus;
attribute float aSeed;
varying float vI;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float fire = exp(-pow((position.x - uWave) / 2.5, 2.0));
  vI = (0.38 + 0.12 * sin(uTime * 0.7 + aSeed * 6.28) * sin(uTime * 0.43 + aSeed * 3.1) + fire * 0.7) * uIntro * mix(1.0, 0.3, uFocus);
  gl_PointSize = (2.2 + fire) * (220.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const neuronFragment = /* glsl */ `
varying float vI;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float soma = smoothstep(0.22, 0.12, d);
  float halo = smoothstep(0.5, 0.0, d) * 0.35;
  float a = (soma + halo) * vI;
  gl_FragColor = vec4(mix(vec3(0.5, 0.8, 0.9), vec3(1.0), soma * 0.5) * a, a);
}
`;

// Signals travelling along the curved fibres (cubic bezier evaluated per vertex)
const pulseVertex = /* glsl */ `
uniform float uTime, uWave, uIntro, uFocus;
attribute vec3 aC1, aC2, aP3;
attribute float aOffset, aSpeed;
varying float vI;
void main(){
  float t = fract(uTime * aSpeed + aOffset);
  float u = 1.0 - t;
  vec3 p = u*u*u*position + 3.0*u*u*t*aC1 + 3.0*u*t*t*aC2 + t*t*t*aP3;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float fire = exp(-pow((p.x - uWave) / 3.0, 2.0));
  vI = pow(sin(3.14159 * t), 2.0) * (0.4 + fire) * uIntro * mix(1.0, 0.35, uFocus);
  gl_PointSize = (0.9 + fire * 0.8) * (180.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;
const pulseFragment = /* glsl */ `
varying float vI;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vI;
  gl_FragColor = vec4(vec3(0.85, 0.97, 1.0) * a, a);
}
`;

const additive = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false };

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

// One continuous tube: (axon →) branch, narrowing toward the target, with a few short spines.
// Along the shared axon the width depends only on arc length, so sibling branches coincide there.
function thornFiber(curve: Bezier, trunk: Bezier | null, rand: () => number) {
  const branch = new THREE.CubicBezierCurve3(...curve);
  const path = new THREE.CurvePath<THREE.Vector3>();
  if (trunk) path.add(new THREE.CubicBezierCurve3(...trunk));
  path.add(branch);
  const split = trunk ? (path.curves[0].getLength() / path.getLength()) : 0;
  const width = (t: number) =>
    t < split
      ? 1 - 0.15 * (t / split)
      : (trunk ? 0.85 : 1) * (1 - 0.55 * ((t - split) / (1 - split)));

  const parts = [taperedTube(path, AXON_WIDTH, width, 0, 1, trunk ? 56 : 40, 6)];
  for (let k = 0; k < THORNS_PER_FIBER; k++) {
    const t = 0.12 + rand() * 0.76;
    const base = branch.getPointAt(t);
    const tangent = branch.getTangentAt(t);
    const out = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).cross(tangent).normalize();
    const tip = base.clone().addScaledVector(out, 0.25 + rand() * 0.3).addScaledVector(tangent, 0.15);
    const bend = base.clone().addScaledVector(out, 0.1).addScaledVector(tangent, 0.1);
    const d = split + t * (1 - split);
    parts.push(taperedTube(new THREE.QuadraticBezierCurve3(base, bend, tip), 0.035, 0.95, d, d, 4, 4));
  }
  const geometry = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return { geometry, split };
}

export function Synapses() {
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uWave: { value: 999 }, uIntro: { value: 0 }, uFocus: { value: 0 } }),
    []
  );
  const edgeGeometry = useMemo(() => {
    const parts = network.edges.map((c) => taperedTube(new THREE.CubicBezierCurve3(...c), 0.022, 0.4, 0, 1, 10, 3));
    const merged = mergeGeometries(parts)!;
    parts.forEach((g) => g.dispose());
    return merged;
  }, []);

  const hiddenGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(network.hidden);
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(network.hidden.map((_, i) => (i * 0.618) % 1), 1));
    return g;
  }, []);

  const fiberShapes = useMemo(() => {
    const rand = seeded(31);
    return fibers.map(({ a, b, curve, trunk }) => {
      const { geometry, split } = thornFiber(curve, trunk, rand);
      const fan = trunk ? fibers.filter((f) => f.a === a && f.trunk).length : 1;
      return {
        key: `${a}-${b}`,
        a,
        b,
        geometry,
        uniforms: {
          uFrom: { value: new THREE.Color(SECTIONS[sectionOf(a)].color) },
          uTo: { value: new THREE.Color(SECTIONS[sectionOf(b)].color) },
          uLit: { value: 0 },
          uDim: { value: 0 },
          uIntro: { value: 0 },
          uTime: uniforms.uTime,
          uFan: { value: fan },
          uSplit: { value: split },
        },
      };
    });
  }, [uniforms]);
  // Axon trunks share the fibre material, so the axon and its branches read as one structure
  const axonShapes = useMemo(
    () =>
      [...network.nodes.keys()]
        .filter((id) => axonCurve(id) && !fibers.some((f) => f.a === id && f.trunk))
        .map((id) => {
          const color = new THREE.Color(SECTIONS[sectionOf(id)].color);
          return {
            id,
            geometry: taperedTube(new THREE.CubicBezierCurve3(...axonCurve(id)!), FIBER_WIDTH, 0.7, 0, 1, 24, 6),
            uniforms: {
              uFrom: { value: color },
              uTo: { value: color },
              uLit: { value: 0 },
              uDim: { value: 0 },
              uIntro: { value: 0 },
              uTime: uniforms.uTime,
              uFan: { value: 1 },
              uSplit: { value: 0 },
            },
          };
        }),
    [uniforms]
  );

  useEffect(() => () => {
    edgeGeometry.dispose();
    fiberShapes.forEach((f) => f.geometry.dispose());
    axonShapes.forEach((a) => a.geometry.dispose());
  }, [edgeGeometry, fiberShapes, axonShapes]);

  const pulseGeometry = useMemo(() => {
    // Labelled fibres carry more traffic than the background pathways
    const paths: Bezier[] = [...network.edges, ...fibers.flatMap((f) => Array(5).fill(f.curve))];
    const attrs = { position: [] as number[], aC1: [] as number[], aC2: [] as number[], aP3: [] as number[] };
    const offset: number[] = [], speed: number[] = [];
    for (let i = 0; i < PULSES; i++) {
      const [p0, c1, c2, p3] = paths[(i * 7919) % paths.length];
      attrs.position.push(p0.x, p0.y, p0.z);
      attrs.aC1.push(c1.x, c1.y, c1.z);
      attrs.aC2.push(c2.x, c2.y, c2.z);
      attrs.aP3.push(p3.x, p3.y, p3.z);
      offset.push((i * 0.137) % 1);
      speed.push(0.05 + ((i * 0.31) % 1) * 0.1);
    }
    const g = new THREE.BufferGeometry();
    for (const [name, data] of Object.entries(attrs)) g.setAttribute(name, new THREE.Float32BufferAttribute(data, 3));
    g.setAttribute('aOffset', new THREE.Float32BufferAttribute(offset, 1));
    g.setAttribute('aSpeed', new THREE.Float32BufferAttribute(speed, 1));
    return g;
  }, []);

  useFrame(() => {
    const t = clock.t;
    const { hoveredProjectId, selectedProject, motionPaused } = useAppStore.getState();
    const focus = hoveredProjectId ?? selectedProject?.id ?? null;
    const elapsed = motionPaused ? Infinity : (performance.now() - selection.at) / 1000;

    uniforms.uTime.value = t;
    uniforms.uWave.value = waveX(t);
    uniforms.uIntro.value = motionPaused ? 1 : THREE.MathUtils.clamp((t - INTRO_START) / 1.0, 0, 1);
    uniforms.uFocus.value = THREE.MathUtils.lerp(uniforms.uFocus.value, focus ? 1 : 0, 0.1);

    const intro = motionPaused ? 1 : THREE.MathUtils.clamp((t - 0.5) / 0.8, 0, 1);
    for (const { a, b, uniforms: u } of fiberShapes) {
      // Hover lights the whole path at once; selection lights it step by step
      let lit: boolean;
      if (hoveredProjectId) {
        lit = onPath(a, hoveredProjectId) && onPath(b, hoveredProjectId);
      } else {
        const da = branchDelay(a, selectedProject?.id);
        const db = branchDelay(b, selectedProject?.id);
        lit = da !== null && db !== null && elapsed >= Math.max(da, db);
      }
      u.uLit.value = THREE.MathUtils.lerp(u.uLit.value, lit ? 1 : 0, 0.12);
      u.uDim.value = THREE.MathUtils.lerp(u.uDim.value, focus && !lit ? 1 : 0, 0.1);
      u.uIntro.value = intro;
    }
    // An axon is lit while its neuron is the focus or any branch leaving it is lit
    for (const { id, uniforms: u } of axonShapes) {
      const lit = focus === id || fiberShapes.some((f) => f.a === id && f.uniforms.uLit.value > 0.5);
      u.uLit.value = THREE.MathUtils.lerp(u.uLit.value, lit ? 1 : 0, 0.12);
      u.uDim.value = THREE.MathUtils.lerp(u.uDim.value, focus && !lit ? 1 : 0, 0.1);
      u.uIntro.value = intro;
    }
  });

  return (
    <>
      <mesh geometry={edgeGeometry} raycast={() => null}>
        <shaderMaterial uniforms={uniforms} vertexShader={edgeVertex} fragmentShader={edgeFragment} {...additive} />
      </mesh>

      {axonShapes.map(({ id, geometry, uniforms: u }) => (
        <mesh key={id} geometry={geometry} raycast={() => null}>
          <shaderMaterial uniforms={u} vertexShader={fiberVertex} fragmentShader={fiberFragment} {...additive} />
        </mesh>
      ))}

      {fiberShapes.map(({ key, geometry, uniforms: u }) => (
        <mesh key={key} geometry={geometry} raycast={() => null}>
          <shaderMaterial uniforms={u} vertexShader={fiberVertex} fragmentShader={fiberFragment} {...additive} />
        </mesh>
      ))}

      <points geometry={hiddenGeometry} frustumCulled={false}>
        <shaderMaterial uniforms={uniforms} vertexShader={neuronVertex} fragmentShader={neuronFragment} {...additive} />
      </points>

      <points geometry={pulseGeometry} frustumCulled={false}>
        <shaderMaterial uniforms={uniforms} vertexShader={pulseVertex} fragmentShader={pulseFragment} {...additive} />
      </points>
    </>
  );
}
