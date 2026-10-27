import * as THREE from 'three';
import { projects } from '../../data/projects';
import { Project } from '../../types/project';

// Radial in 3D: input (me) at the centre → sections → work on the outer shell, unlabeled hidden shells between
export const HUB_IDS = ['projects', 'research', 'experience', 'hackathons'];
export const LAYER_R = [0, 5.5, 11, 16.5, 22];
const HIDDEN_PER_LAYER = [10, 30, 45, 60, 70];
const EDGE_DENSITY = 0.5;
// Tetrahedron corners: four directions as far apart as possible in 3D. Turned so each sits at a
// different height, so two sections never line up behind each other while the view orbits around Y.
const HUB_DIRS = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map(([x, y, z]) =>
  new THREE.Vector3(x, y, z).normalize().applyAxisAngle(new THREE.Vector3(0, 0, 1), 1.117)
);

// One colour per section, used by neurons, links, hover cards, panels and navigation
export const SECTIONS = {
  about: { label: 'About', color: '#ffc677' },
  projects: { label: 'Projects', color: '#38d9ff' },
  research: { label: 'Research', color: '#b28cff' },
  experience: { label: 'Experience', color: '#9cc3ff' },
  hackathons: { label: 'Achievements', color: '#3dffb0' },
} as const;
export type SectionId = keyof typeof SECTIONS;

// Render resolution: on larger screens at least 2x (supersampled on standard displays, so thin fibres stay
// crisp) and up to 3x on dense ones; phones stay at native up to 2x for battery and frame rate
const DEVICE_DPR = Math.max(window.devicePixelRatio || 1, 1);
export const RENDER_DPR = window.matchMedia('(min-width: 768px)').matches
  ? Math.min(Math.max(DEVICE_DPR, 2), 3)
  : Math.min(DEVICE_DPR, 2);
// gl_PointSize is in device pixels; scale point sprites so they keep the size they were tuned at (native, up to 2x)
export const POINT_SCALE = (RENDER_DPR / Math.min(DEVICE_DPR, 2)).toFixed(3);

// Shared animation clock so motion can be paused from the UI
export const clock = { t: 0 };

// Intro: the input lights first, then sections, then outputs (~1.5s total)
export function introDelay(id: string) {
  if (id === 'about-me') return 0.2;
  return HUB_IDS.includes(id) ? 0.6 : 1.0;
}

// Depth fade: things beyond the orbit centre fade back so near and far sides read apart.
// 0 in front of the centre, up to 0.8 at the back of the network.
export const FOG_GLSL = /* glsl */ `
uniform float uCamDist;
float fogAt(float depth){ return 1.0 - 0.8 * smoothstep(uCamDist - 4.0, uCamDist + 22.0, depth); }
`;
export function fogAmount(depth: number, camDist: number) {
  return 0.8 * THREE.MathUtils.smoothstep(depth, camDist - 4, camDist + 22);
}

// Neurons an agent has just visited ("tool call"), by id → clock time of the visit
export const agentHits = new Map<string, number>();

// Forward-pass wave: a 4s outward sweep (by distance from centre) every 12s; far off the rest of the time
export function waveR(t: number) {
  const phase = (t + 8) % 12;
  return phase < 4 ? -3 + (phase / 4) * 31 : 999;
}

export function neuronRadius(p: Project) {
  if (p.id === 'about-me') return 1.6;
  if (HUB_IDS.includes(p.id)) return 1.05;
  return p.featured ? 0.85 : 0.6;
}

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

// `dir` tilted by `cone` radians toward angle `a` around it
function aroundDir(dir: THREE.Vector3, cone: number, a: number) {
  const u = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)).normalize();
  const v = new THREE.Vector3().crossVectors(dir, u);
  const side = u.multiplyScalar(Math.cos(a)).addScaledVector(v, Math.sin(a));
  return dir.clone().multiplyScalar(Math.cos(cone)).addScaledVector(side, Math.sin(cone));
}

export type Bezier = [THREE.Vector3, THREE.Vector3, THREE.Vector3, THREE.Vector3];

export function bezierPoint([p0, c1, c2, p3]: Bezier, t: number) {
  const u = 1 - t;
  return p0.clone().multiplyScalar(u * u * u)
    .addScaledVector(c1, 3 * u * u * t)
    .addScaledVector(c2, 3 * u * t * t)
    .addScaledVector(p3, t * t * t);
}

function build() {
  const rand = seeded(7);
  const byId = new Map(projects.map((p) => [p.id, p]));
  const nodes = new Map<string, THREE.Vector3>();
  const section = new Map<string, SectionId>([['about-me', 'about']]);
  const children = new Map<string, string[]>();
  const links: [string, string][] = [];
  const linked = (a: string, b: string) => links.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

  nodes.set('about-me', new THREE.Vector3());
  const layerOf = new Map<THREE.Vector3, number>([[nodes.get('about-me')!, 0]]);
  const placed = new Set(['about-me', ...HUB_IDS]);

  HUB_IDS.forEach((id, i) => {
    const dir = HUB_DIRS[i];
    nodes.set(id, dir.clone().multiplyScalar(LAYER_R[2]));
    layerOf.set(nodes.get(id)!, 2);
    section.set(id, id as SectionId);
    links.push(['about-me', id]);
    const kids = (byId.get(id)?.connections ?? []).filter((c) => !placed.has(c) && byId.has(c));
    children.set(id, kids);
    kids.forEach((c, j) => {
      placed.add(c);
      section.set(c, id as SectionId);
      // Outputs fan out in a cone around their section's direction
      const cone = kids.length > 1 ? 0.4 : 0;
      nodes.set(c, aroundDir(dir, cone, (j / kids.length) * Math.PI * 2).multiplyScalar(LAYER_R[4]));
      layerOf.set(nodes.get(c)!, 4);
      links.push([id, c]);
    });
  });

  // Cross links between outputs that share real work, e.g. LumberFi ↔ Dell
  for (const p of projects) {
    for (const c of p.connections ?? []) {
      const outputs = ![p.id, c].some((id) => id === 'about-me' || HUB_IDS.includes(id));
      if (outputs && nodes.has(p.id) && nodes.has(c) && !linked(p.id, c)) links.push([p.id, c]);
    }
  }

  const layers: THREE.Vector3[][] = LAYER_R.map(() => []);
  for (const v of nodes.values()) layers[layerOf.get(v)!].push(v);
  const hidden: THREE.Vector3[] = [];
  LAYER_R.forEach((r, l) => {
    for (let k = 0; k < HIDDEN_PER_LAYER[l]; k++) {
      // Uniform random direction on the sphere
      const z = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const dir = new THREE.Vector3(Math.sqrt(1 - z * z) * Math.cos(a), Math.sqrt(1 - z * z) * Math.sin(a), z);
      const v = dir.multiplyScalar(Math.max(r, 3) + (rand() - 0.5) * 3);
      layers[l].push(v);
      hidden.push(v);
    }
  });

  // Background pathways radiate outward like fibre bundles; only between neighbouring directions
  const edges: Bezier[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) for (const b of layers[l + 1]) {
      if (a.length() > 1 && a.clone().normalize().dot(b.clone().normalize()) < 0.85) continue;
      if (rand() >= EDGE_DENSITY) continue;
      const d = b.clone().sub(a).multiplyScalar(0.35);
      const jitter = () => new THREE.Vector3((rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6);
      edges.push([a, a.clone().add(d).add(jitter()), b.clone().sub(d).add(jitter()), b]);
    }
  }

  return { nodes, links, hidden, edges, section, children };
}

export const network = build();

export function sectionOf(id: string): SectionId {
  return network.section.get(id) ?? 'about';
}

// A node is related to the focus if it is the focus or directly linked to it
export function isRelated(id: string, focus: string | null | undefined) {
  if (!focus) return false;
  return id === focus || network.links.some(([a, b]) => (a === focus && b === id) || (b === focus && a === id));
}

const byId = new Map(projects.map((p) => [p.id, p]));
const LAYER_OF = (id: string) => (id === 'about-me' ? 0 : HUB_IDS.includes(id) ? 1 : 2);

// Source neurons (you, sections, flagship work) grow an axon; fibres leave from its tip
export function axonOf(id: string): { dir: THREE.Vector3; length: number } | null {
  const p = byId.get(id);
  const pos = network.nodes.get(id);
  if (!p || !pos) return null;
  const r = neuronRadius(p);
  if (id === 'about-me') return null; // radiates to every side from the soma itself
  if (LAYER_OF(id) < 2) {
    const targets = network.links.filter(([a]) => a === id).map(([, b]) => network.nodes.get(b)!);
    const mean = targets.reduce((m, v) => m.add(v), new THREE.Vector3()).divideScalar(targets.length || 1);
    return { dir: mean.sub(pos).normalize(), length: r * 2.2 };
  }
  if (!p.featured) return null;
  return { dir: pos.clone().normalize(), length: r * 2.4 };
}

// The axon itself: soma membrane → tip, ending tangent to `dir` so fibres continue it smoothly
export function axonCurve(id: string): Bezier | null {
  const ax = axonOf(id);
  if (!ax) return null;
  const pos = network.nodes.get(id)!;
  const r = neuronRadius(byId.get(id)!);
  const side = new THREE.Vector3().crossVectors(ax.dir, new THREE.Vector3(0, 1, 0.3)).normalize().multiplyScalar(r * 0.2);
  const start = pos.clone().addScaledVector(ax.dir, r * 0.85);
  const tip = pos.clone().addScaledVector(ax.dir, r + ax.length);
  return [start, start.clone().addScaledVector(ax.dir, ax.length * 0.35).add(side), tip.clone().addScaledVector(ax.dir, -ax.length * 0.35), tip];
}

export function axonTip(id: string) {
  const ax = axonOf(id);
  const pos = network.nodes.get(id)!;
  const r = neuronRadius(byId.get(id)!);
  return ax ? pos.clone().addScaledVector(ax.dir, r + ax.length) : null;
}

// Labelled fibres: from the source's axon tip (or soma surface) to the target's soma surface
export const fibers: { a: string; b: string; curve: Bezier; trunk: Bezier | null }[] = network.links.map(([a, b]) => {
  const pa = network.nodes.get(a)!;
  const pb = network.nodes.get(b)!;
  const dir = pb.clone().sub(pa).normalize();
  const tip = LAYER_OF(b) > LAYER_OF(a) ? axonTip(a) : null;
  const start = tip ?? pa.clone().addScaledVector(dir, neuronRadius(byId.get(a)!) * 1.05);
  const end = pb.clone().addScaledVector(dir, -neuronRadius(byId.get(b)!) * 1.05);
  const len = start.distanceTo(end);
  const flow = pb.clone().normalize().lerp(dir, 0.5).normalize();
  // Leaving an axon, the fibre continues the axon's direction so branches split smoothly
  const leave = tip ? axonOf(a)!.dir : flow;
  return {
    a,
    b,
    curve: [start, start.clone().addScaledVector(leave, len * 0.4), end.clone().addScaledVector(flow, -len * 0.4), end],
    trunk: tip ? axonCurve(a) : null,
  };
});

// Selecting a node activates its branch in order: you → section → the node and its neighbours
export const selection = { at: 0 };

export function branchDelay(id: string, selectedId: string | null | undefined): number | null {
  if (!selectedId) return null;
  const hub = sectionOf(selectedId);
  const inBranch = id === 'about-me' || id === selectedId || id === hub || isRelated(id, selectedId);
  return inBranch ? LAYER_OF(id) * 0.28 : null;
}
