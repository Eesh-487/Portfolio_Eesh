import React from 'react';
import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { network, clock, SECTIONS, sectionOf, HUB_IDS } from './networkLayout';

const BOKEH = 46;

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
  gl_PointSize = aSize * (300.0 / -mv.z);
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

const additive = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false };

export function Backdrop() {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

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
  });

  return (
    <>
      <points geometry={bokeh} frustumCulled={false} raycast={() => null}>
        <shaderMaterial uniforms={uniforms} vertexShader={bokehVertex} fragmentShader={bokehFragment} {...additive} />
      </points>
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
