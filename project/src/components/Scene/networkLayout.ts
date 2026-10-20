import * as THREE from 'three';
import { projects } from '../../data/projects';
import { Project } from '../../types/project';

// Input (me) → hidden (sections) → output (work), with unlabeled hidden layers between
export const HUB_IDS = ['projects', 'research', 'experience', 'hackathons'];
export const LAYER_X = [-22, -11, 0, 11, 22];
const HIDDEN_PER_LAYER = [10, 22, 16, 22, 14];
const EDGE_DENSITY = 0.2;

// One colour per section, used by neurons, links, hover cards, panels and navigation
export const SECTIONS = {
  about: { label: 'About', color: '#ffc677' },
  projects: { label: 'Projects', color: '#38d9ff' },
  research: { label: 'Research', color: '#b28cff' },
  experience: { label: 'Experience', color: '#9cc3ff' },
  hackathons: { label: 'Achievements', color: '#3dffb0' },
} as const;
export type SectionId = keyof typeof SECTIONS;

// Shared animation clock so motion can be paused from the UI
export const clock = { t: 0 };

// Intro: the input lights first, then sections, then outputs (~1.5s total)
export function introDelay(id: string) {
  if (id === 'about-me') return 0.2;
  return HUB_IDS.includes(id) ? 0.6 : 1.0;
}

// Forward-pass wave: a 4s sweep every 12s; far off-screen the rest of the time
export function waveX(t: number) {
  const phase = (t + 8) % 12;
  return phase < 4 ? -28 + (phase / 4) * 56 : 999;
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

function onRing(x: number, r: number, a: number) {
  return new THREE.Vector3(x, Math.sin(a) * r, Math.cos(a) * r);
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

  nodes.set('about-me', new THREE.Vector3(LAYER_X[0], 0, 0));
  const placed = new Set(['about-me', ...HUB_IDS]);

  HUB_IDS.forEach((id, i) => {
    const a = (i / HUB_IDS.length) * Math.PI * 2 + Math.PI / 4;
    nodes.set(id, onRing(LAYER_X[2], 7.5, a));
    section.set(id, id as SectionId);
    links.push(['about-me', id]);
    const kids = (byId.get(id)?.connections ?? []).filter((c) => !placed.has(c) && byId.has(c));
    children.set(id, kids);
    kids.forEach((c, j) => {
      placed.add(c);
      section.set(c, id as SectionId);
      nodes.set(c, onRing(LAYER_X[4], 12.5, a + (j - (kids.length - 1) / 2) * 0.3));
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

  const layers: THREE.Vector3[][] = LAYER_X.map(() => []);
  for (const v of nodes.values()) layers[LAYER_X.indexOf(v.x)].push(v);
  const hidden: THREE.Vector3[] = [];
  LAYER_X.forEach((x, l) => {
    for (let k = 0; k < HIDDEN_PER_LAYER[l]; k++) {
      const v = onRing(x + (rand() - 0.5) * 1.5, 2 + rand() * (l === 4 ? 13 : 9), rand() * Math.PI * 2);
      layers[l].push(v);
      hidden.push(v);
    }
  });

  // Background pathways curve along the layer axis like fibre bundles
  const edges: Bezier[] = [];
  for (let l = 0; l < layers.length - 1; l++) {
    for (const a of layers[l]) for (const b of layers[l + 1]) {
      if (rand() >= EDGE_DENSITY) continue;
      const dx = (b.x - a.x) * 0.45;
      const jitter = () => new THREE.Vector3(0, (rand() - 0.5) * 1.6, (rand() - 0.5) * 1.6);
      edges.push([a, a.clone().add(new THREE.Vector3(dx, 0, 0)).add(jitter()), b.clone().add(new THREE.Vector3(-dx, 0, 0)).add(jitter()), b]);
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
  if (LAYER_OF(id) < 2) {
    const targets = network.links.filter(([a]) => a === id).map(([, b]) => network.nodes.get(b)!);
    const mean = targets.reduce((m, v) => m.add(v), new THREE.Vector3()).divideScalar(targets.length || 1);
    return { dir: mean.sub(pos).normalize(), length: r * 2.2 };
  }
  if (!p.featured) return null;
  return { dir: new THREE.Vector3(1, pos.y * 0.05, pos.z * 0.05).normalize(), length: r * 2.4 };
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
  const flow = new THREE.Vector3(1, 0, 0).lerp(dir, 0.5).normalize();
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
