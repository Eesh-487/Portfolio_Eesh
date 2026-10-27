import React from 'react';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { network, clock, SECTIONS, sectionOf, HUB_IDS, LAYER_R, SectionId, POINT_SCALE } from './networkLayout';
import { useAppStore } from '../../store/useAppStore';

const BOKEH = 46;
const EMBED_CLUSTERS = 14;
const EMBED_POINTS = 4000;
const SECTION_IDS = Object.keys(SECTIONS) as SectionId[];

// Embedding space: clusters of tiny points around the network, like a UMAP plot of what the model
// has learned. Each cluster takes a section's colour and lights up while that section is in focus.
const embedVertex = /* glsl */ `
uniform float uTime, uHot;
attribute vec3 aColor;
attribute float aSection, aSeed;
varying vec3 vColor;
varying float vA;
void main(){
  float hot = 1.0 - step(0.5, abs(aSection - uHot));
  vec3 p = position + vec3(sin(uTime * 0.1 + aSeed * 6.28), cos(uTime * 0.08 + aSeed * 4.0), sin(uTime * 0.07 + aSeed * 2.0)) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vColor = aColor;
  vA = mix(0.45, 0.95, hot) * (0.5 + 0.5 * aSeed);
  gl_PointSize = min((1.6 + hot * 0.8) * (170.0 / -mv.z), 6.0) * ${POINT_SCALE};
  gl_Position = projectionMatrix * mv;
}
`;
const embedFragment = /* glsl */ `
varying vec3 vColor;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.1, d) * vA;
  gl_FragColor = vec4(vColor * a, a);
  #include <colorspace_fragment>
}
`;

// Out-of-focus cells far behind the network: soft discs with a faint rim, like a
// microscope's shallow depth of field. They drift slowly and parallax with the camera.
const bokehVertex = /* glsl */ `
uniform float uTime;
attribute float aSize, aSeed;
varying float vSeed;
void main(){
  vSeed = aSeed;
  vec3 p = position + vec3(sin(uTime * 0.05 + aSeed * 6.28), cos(uTime * 0.04 + aSeed * 4.0), 0.0) * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * (300.0 / -mv.z) * ${POINT_SCALE};
  gl_Position = projectionMatrix * mv;
}
`;
const bokehFragment = /* glsl */ `
varying float vSeed;
void main(){
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float disc = smoothstep(1.0, 0.75, d) * 0.55 + smoothstep(1.0, 0.9, d) * smoothstep(0.8, 0.95, d) * 0.45;
  float a = disc * (0.025 + 0.025 * vSeed);
  gl_FragColor = vec4(vec3(0.62, 0.78, 0.9) * a, a);
}
`;

// Very faint pools of section colour behind you and each section
const poolVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv * 2.0 - 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const poolFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uStrength;
varying vec2 vUv;
void main(){
  float d = length(vUv);
  float a = exp(-d * d * 3.5) * uStrength;
  gl_FragColor = vec4(uColor * a, a);
  #include <colorspace_fragment>
}
`;

// Barely-there spheres at the section and work layers: only their rims show, hinting at the layering
const shellVertex = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main(){
  vNormal = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`;
const shellFragment = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float a = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0) * 0.06;
  gl_FragColor = vec4(vec3(0.6, 0.8, 0.95) * a, a);
  #include <colorspace_fragment>
}
`;

const additive = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false };

export function Backdrop() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uHot: { value: -10 } }), []);

  const embedding = useMemo(() => {
    let seed = 97;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());
    // Cluster centres sit in a shell beyond the work layer, so they never crowd the labelled neurons
    const clusters = Array.from({ length: EMBED_CLUSTERS }, (_, i) => {
      const z = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.sqrt(1 - z * z) * Math.cos(a), Math.sqrt(1 - z * z) * Math.sin(a), z);
      const section = i % SECTION_IDS.length;
      return {
        center: dir.multiplyScalar(30 + rand() * 12),
        spread: 2.5 + rand() * 3,
        section,
        color: new THREE.Color(SECTIONS[SECTION_IDS[section]].color).lerp(new THREE.Color('#8aa0b8'), 0.45),
      };
    });
    const pos: number[] = [], color: number[] = [], sec: number[] = [], seeds: number[] = [];
    for (let i = 0; i < EMBED_POINTS; i++) {
      const c = clusters[i % EMBED_CLUSTERS];
      pos.push(c.center.x + gauss() * c.spread, c.center.y + gauss() * c.spread, c.center.z + gauss() * c.spread);
      color.push(c.color.r, c.color.g, c.color.b);
      sec.push(c.section);
      seeds.push(rand());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
    g.setAttribute('aSection', new THREE.Float32BufferAttribute(sec, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, []);

  const bokeh = useMemo(() => {
    let seed = 41;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const pos: number[] = [], size: number[] = [], seeds: number[] = [];
    for (let i = 0; i < BOKEH; i++) {
      pos.push((rand() - 0.5) * 110, (rand() - 0.5) * 70, -25 - rand() * 45);
      size.push(4 + rand() * 9);
      seeds.push(rand());
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    return g;
  }, []);

  const pools = useMemo(
    () =>
      ['about-me', ...HUB_IDS].map((id) => ({
        id,
        position: network.nodes.get(id)!.clone().add(new THREE.Vector3(0, 0, -6)),
        size: id === 'about-me' ? 26 : 22,
        uniforms: {
          uColor: { value: new THREE.Color(SECTIONS[sectionOf(id)].color) },
          uStrength: { value: id === 'about-me' ? 0.07 : 0.05 },
        },
      })),
    []
  );

  useFrame(() => {
    uniforms.uTime.value = clock.t;
    const { hoveredProjectId, selectedProject } = useAppStore.getState();
    const focus = hoveredProjectId ?? selectedProject?.id;
    uniforms.uHot.value = focus ? SECTION_IDS.indexOf(sectionOf(focus)) : -10;
  });

  return (
    <>
      <points geometry={bokeh} frustumCulled={false} raycast={() => null}>
        <shaderMaterial uniforms={uniforms} vertexShader={bokehVertex} fragmentShader={bokehFragment} {...additive} />
      </points>
      <points geometry={embedding} frustumCulled={false} raycast={() => null}>
        <shaderMaterial uniforms={uniforms} vertexShader={embedVertex} fragmentShader={embedFragment} {...additive} />
      </points>
      {[LAYER_R[2], LAYER_R[4]].map((r) => (
        <mesh key={r} raycast={() => null}>
          <sphereGeometry args={[r, 64, 48]} />
          <shaderMaterial vertexShader={shellVertex} fragmentShader={shellFragment} {...additive} />
        </mesh>
      ))}
      {pools.map(({ id, position, size, uniforms: u }) => (
        <Billboard key={id} position={position}>
          <mesh raycast={() => null}>
            <planeGeometry args={[size, size]} />
            <shaderMaterial uniforms={u} vertexShader={poolVertex} fragmentShader={poolFragment} {...additive} />
          </mesh>
        </Billboard>
      ))}
    </>
  );
}
