import React from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Project } from '../../types/project';
import { useAppStore } from '../../store/useAppStore';
import {
  HUB_IDS, network, waveX, clock, selection, branchDelay, SECTIONS, sectionOf, isRelated, introDelay, neuronRadius, axonOf,
} from './networkLayout';
import { growArbor } from './dendrites';

// Ashima 3D simplex noise + fbm
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float fbm(vec3 p){float f=0.0,a=0.5;for(int i=0;i<6;i++){f+=a*snoise(p);p*=2.02;a*=0.5;}return f;}
`;

// Soma: organic membrane (noise-displaced), bright rim, dim cytoplasm, glowing nucleus
const somaVertex = /* glsl */ `
uniform float uSeed;
uniform vec3 uAxon;
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vWorld;
${noise}
void main(){
  vec3 n = normalize(position);
  float bump = snoise(n * 1.3 + uSeed) * 0.14 + snoise(n * 3.2 + uSeed * 2.0) * 0.05;
  vec3 p = position * (1.0 + bump);
  // Pyramidal soma: draw the membrane out toward the axon hillock
  p += uAxon * pow(max(dot(n, uAxon), 0.0), 2.0) * length(position) * 0.45;
  vObj = p;
  vNormal = normalize(mat3(modelMatrix) * normal);
  vec4 w = modelMatrix * vec4(p, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;
const somaFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime, uSeed, uActive, uDim;
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vWorld;
${noise}
void main(){
  vec3 p = normalize(vObj);
  float grain = snoise(p * 4.0 + vec3(uTime * 0.05, 0.0, uSeed)) * 0.5 + 0.5;
  vec3 V = normalize(cameraPosition - vWorld);
  float mu = max(dot(normalize(vNormal), V), 0.0);
  // Brightest at the cell body, falling off toward the membrane
  float body = pow(mu, 1.4);
  float nucleus = smoothstep(0.82, 0.99, mu);
  vec3 col = uColor * (0.12 + 0.75 * body + 0.08 * grain) + mix(uColor, vec3(1.0), 0.55) * nucleus * 0.6;
  gl_FragColor = vec4(col * (0.85 + 0.65 * uActive) * mix(1.0, 0.3, uDim), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// Membrane: a faint translucent shell just outside the soma
const membraneFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uActive, uDim;
varying vec3 vNormal;
varying vec3 vWorld;
void main(){
  float mu = max(dot(normalize(vNormal), normalize(cameraPosition - vWorld)), 0.0);
  float i = pow(1.0 - mu, 3.0) * (0.14 + 0.12 * uActive) * mix(1.0, 0.3, uDim);
  gl_FragColor = vec4(uColor * i, i);
  #include <colorspace_fragment>
}
`;

// Dendrites and axon: translucent fibres, lit outward from the soma by uFront
const arborVertex = /* glsl */ `
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
const arborFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uFront, uActive, uDim, uTime, uSeed;
varying float vDist;
varying vec3 vNormal;
varying vec3 vView;
void main(){
  float lit = smoothstep(uFront, uFront - 0.6, vDist);
  float fres = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.5);
  float base = 0.32 + 0.06 * sin(uTime * 0.5 + uSeed);
  float i = (base + lit * (0.45 + 0.6 * uActive)) * (0.45 + fres) * (1.0 - vDist * 0.5) * mix(1.0, 0.25, uDim);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), lit * uActive * 0.25) * i, i);
  #include <colorspace_fragment>
}
`;

// Soft light scattering around the soma; restrained, no rings
const haloVertex = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv * 2.0 - 1.0;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const haloFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uActive, uDim, uAura;
varying vec2 vUv;
void main(){
  float d = length(vUv);
  if (d > 1.0) discard;
  float glow = pow(0.25 / max(d, 0.25), 2.2) * smoothstep(1.0, 0.4, d);
  float i = glow * (0.3 + 0.5 * uActive) * uAura * mix(1.0, 0.25, uDim);
  gl_FragColor = vec4(uColor * i, i);
  #include <colorspace_fragment>
}
`;

const additive = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false };

function hash(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
  return h;
}

const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

interface NeuronProps {
  project: Project;
  matched: boolean;
  searching: boolean;
}

export function Neuron({ project, matched, searching }: NeuronProps) {
  const groupRef = useRef<THREE.Group>(null);
  const hoveredId = useAppStore((s) => s.hoveredProjectId);
  const selectedId = useAppStore((s) => s.selectedProject?.id);
  const setHoveredProjectId = useAppStore((s) => s.setHoveredProjectId);
  const setSelectedProject = useAppStore((s) => s.setSelectedProject);

  const position = network.nodes.get(project.id)!;
  const radius = neuronRadius(project);
  const section = sectionOf(project.id);
  const color = SECTIONS[section].color;
  const seed = hash(project.id);
  const delay = introDelay(project.id);
  const hovered = hoveredId === project.id;
  // Dim when filtered out by search, or when something else is in focus and this is off its path
  const focus = hoveredId ?? selectedId;
  const dim = (searching && !matched) || (!!focus && branchDelay(project.id, focus) === null);
  const isHub = HUB_IDS.includes(project.id);
  const isRoot = project.id === 'about-me';

  // Rank sets complexity: you > flagship work ≈ sections > supporting work
  const arbor = useMemo(() => {
    const spec = isRoot
      ? { branches: 8, depth: 3, reach: radius * 2.7 }
      : isHub
        ? { branches: 6, depth: 2, reach: radius * 2.3 }
        : project.featured
          ? { branches: 5, depth: 2, reach: radius * 2.3 }
          : { branches: 3, depth: 2, reach: radius * 2 };
    return growArbor({ ...spec, radius, seed, axon: axonOf(project.id) });
  }, [project.id, project.featured, isRoot, isHub, radius, seed]);
  useEffect(() => () => arbor.dispose(), [arbor]);

  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uSeed: { value: (seed % 100) * 0.37 },
      uTime: { value: 0 },
      uActive: { value: 0 },
      uDim: { value: 0 },
      uFront: { value: 0.35 },
      uAura: { value: isRoot ? 1.3 : 0.8 },
      uAxon: { value: axonOf(project.id)?.dir.clone() ?? new THREE.Vector3() },
    }),
    [color, seed, isRoot, project.id]
  );

  useFrame(() => {
    const t = clock.t;
    const { selectedProject, hoveredProjectId, motionPaused } = useAppStore.getState();
    const elapsed = motionPaused ? Infinity : (performance.now() - selection.at) / 1000;
    const fire = Math.exp(-(((position.x - waveX(t)) / 2.5) ** 2)) * 0.5;
    const idle = 0.12 + 0.08 * Math.sin(t * 0.5 + seed) * Math.sin(t * 0.31 + seed * 0.5);
    const d = branchDelay(project.id, selectedProject?.id);
    const branch = d !== null && elapsed >= d ? (project.id === selectedProject?.id ? 1 : 0.75) : 0;
    const hover = hoveredProjectId === project.id ? 1 : isRelated(project.id, hoveredProjectId) ? 0.45 : 0;
    const target = Math.max(idle, fire, branch, hover, matched && searching ? 1 : 0);
    uniforms.uTime.value = t;
    uniforms.uActive.value = THREE.MathUtils.lerp(uniforms.uActive.value, target, 0.1);
    uniforms.uDim.value = THREE.MathUtils.lerp(uniforms.uDim.value, dim ? 1 : 0, 0.1);
    // Dendrites light outward from the soma when the neuron activates
    uniforms.uFront.value = THREE.MathUtils.lerp(uniforms.uFront.value, target > 0.4 ? 1.2 : 0.35, motionPaused ? 1 : 0.05);
    const appear = motionPaused ? 1 : easeOutBack(THREE.MathUtils.clamp((t - delay) / 0.6, 0, 1));
    groupRef.current?.scale.setScalar(Math.max(appear, 0.0001) * (1 + (hoveredProjectId === project.id ? 0.08 : 0)));
  });

  const kicker = isRoot
    ? 'INPUT LAYER'
    : isHub
      ? `${SECTIONS[section].label.toUpperCase()} / ${String(network.children.get(project.id)?.length ?? 0).padStart(2, '0')}`
      : SECTIONS[section].label.toUpperCase();

  return (
    <group position={position}>
      <group ref={groupRef} scale={0.0001}>
        {/* Generous invisible hit target so thin structures never block selection */}
        <mesh
          onPointerEnter={(e) => { e.stopPropagation(); setHoveredProjectId(project.id); document.body.style.cursor = 'pointer'; }}
          onPointerLeave={() => { setHoveredProjectId(null); document.body.style.cursor = ''; }}
          onClick={(e) => { e.stopPropagation(); setSelectedProject(project); }}
        >
          <sphereGeometry args={[radius * 1.6, 16, 16]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <mesh raycast={() => null}>
          <icosahedronGeometry args={[radius, 5]} />
          <shaderMaterial uniforms={uniforms} vertexShader={somaVertex} fragmentShader={somaFragment} />
        </mesh>

        <mesh raycast={() => null} scale={1.05}>
          <icosahedronGeometry args={[radius, 4]} />
          <shaderMaterial uniforms={uniforms} vertexShader={somaVertex} fragmentShader={membraneFragment} {...additive} />
        </mesh>

        <mesh geometry={arbor} raycast={() => null}>
          <shaderMaterial uniforms={uniforms} vertexShader={arborVertex} fragmentShader={arborFragment} {...additive} />
        </mesh>

        <Billboard>
          <mesh raycast={() => null}>
            <planeGeometry args={[radius * 5, radius * 5]} />
            <shaderMaterial uniforms={uniforms} vertexShader={haloVertex} fragmentShader={haloFragment} {...additive} />
          </mesh>
        </Billboard>
      </group>

      <Html
        position={[0, radius + (isRoot ? 1.9 : 1.3), 0]}
        center
        className="pointer-events-none"
        zIndexRange={[0, 50]} // Set a lower z-index range so modal can appear above
      >
        <div
          className={`neuron-label whitespace-nowrap text-center transition-opacity duration-300 [text-shadow:0_1px_8px_rgba(0,0,0,0.9)] ${dim ? 'opacity-25' : 'opacity-100'}`}
          style={{ animationDelay: `${delay + 0.2}s` }}
        >
          {/* Fixed pixel sizes: labels stay readable at any zoom */}
          <div className={`flex items-center justify-center gap-1.5 rounded-md bg-[#050608]/45 px-1.5 ${isRoot ? 'text-[18px]' : isHub ? 'text-[17px]' : 'text-[14px]'} font-semibold tracking-tight text-white`}>
            {!isRoot && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />}
            {project.title}
          </div>
          {isRoot && (
            <div className="mt-0.5 text-[12px] font-medium uppercase tracking-[0.14em]" style={{ color }}>
              AI Engineer · ML · Agentic Systems
            </div>
          )}
        </div>
      </Html>

      {hovered && (
        <Html position={[radius + 0.8, 0, 0]} zIndexRange={[60, 70]} className="pointer-events-none">
          <div className="glass w-64 -translate-y-1/2 rounded-2xl p-3.5 text-left">
            <div className="text-[11px] font-semibold tracking-[0.14em]" style={{ color }}>{kicker}</div>
            <div className="mt-0.5 text-[15px] font-semibold text-white">{project.title}</div>
            {project.tagline && <div className="mt-1 text-[13px] leading-snug text-white/70">{project.tagline}</div>}
            {!isHub && !isRoot && project.technologies && (
              <div className="mt-2 flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80">{t}</span>
                ))}
              </div>
            )}
            <div className="mt-2 text-[12px] font-medium" style={{ color }}>
              {isHub ? 'Explore section →' : 'Open details →'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
