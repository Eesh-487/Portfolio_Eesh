import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface ArborSpec {
  radius: number;          // soma radius
  branches: number;        // primary dendrites
  depth: number;           // branching levels (1 = no offshoots)
  reach: number;           // primary dendrite length
  seed: number;
  axon?: { dir: THREE.Vector3; length: number } | null;
}

const TUBULAR = 12;
const RADIAL = 5;

function seeded(seed: number) {
  let s = (seed % 2147483646) + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

// Tube that narrows along its length (taper 0 = constant, 1 = to a point), or follows a width
// profile (t → scale). `aDist` runs d0 → d1 along the tube for shaders that light it progressively.
export function taperedTube(
  curve: THREE.Curve<THREE.Vector3>, thickness: number, taper: number | ((t: number) => number), d0: number, d1: number,
  tubular = TUBULAR, radial = RADIAL,
) {
  const tube = new THREE.TubeGeometry(curve, tubular, thickness, radial, false);
  const pos = tube.attributes.position as THREE.BufferAttribute;
  const dist = new Float32Array(pos.count);
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    const t = Math.floor(i / (radial + 1)) / tubular;
    const center = curve.getPointAt(t);
    const scale = typeof taper === 'number' ? 1 - t * taper : taper(t);
    v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(scale).add(center);
    pos.setXYZ(i, v.x, v.y, v.z);
    dist[i] = d0 + (d1 - d0) * t;
  }
  tube.setAttribute('aDist', new THREE.BufferAttribute(dist, 1));
  return tube;
}

// Dendrites (tapered, branching), merged into one geometry. The axon is drawn with the fibres;
// here it only steers dendrites to the opposite side.
// `aDist` (0 at the soma → 1 at the tips) lets the shader light branches outward.
export function growArbor({ radius, branches, depth, reach, seed, axon }: ArborSpec) {
  const rand = seeded(seed);
  const parts: THREE.BufferGeometry[] = [];
  const wobble = (v: THREE.Vector3, amount: number) =>
    v.add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(amount)).normalize();

  function addTube(curve: THREE.CatmullRomCurve3, thickness: number, d0: number, d1: number, taper: number) {
    parts.push(taperedTube(curve, thickness, taper, d0, d1));
  }

  function grow(start: THREE.Vector3, dir: THREE.Vector3, len: number, thick: number, level: number, d0: number) {
    const pts = [start.clone()];
    let p = start.clone();
    let d = dir.clone();
    for (let k = 0; k < 3; k++) {
      d = wobble(d.clone(), 0.55);
      p = p.clone().addScaledVector(d, len / 3);
      pts.push(p);
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    addTube(curve, thick, d0, d0 + len, 0.6);
    if (level <= 1) return;
    for (let j = 0; j < 2; j++) {
      const t = 0.4 + rand() * 0.5;
      grow(curve.getPointAt(t), wobble(curve.getTangentAt(t).clone(), 1.3), len * 0.55, thick * (1 - t * 0.6) * 0.8, level - 1, d0 + len * t);
    }
  }

  // Primary dendrites spread evenly (Fibonacci sphere), steering away from the axon
  for (let i = 0; i < branches; i++) {
    const y = 1 - ((i + 0.5) / branches) * 2;
    const ring = Math.sqrt(1 - y * y);
    const phi = i * 2.399963 + seed;
    const dir = wobble(new THREE.Vector3(Math.cos(phi) * ring, y, Math.sin(phi) * ring), 0.4);
    if (axon && dir.dot(axon.dir) > 0.6) dir.addScaledVector(axon.dir, -1.2).normalize();
    grow(dir.clone().multiplyScalar(radius * 0.85), dir, reach * (0.75 + rand() * 0.5), radius * 0.11, depth, 0);
  }


  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  const dist = merged.attributes.aDist as THREE.BufferAttribute;
  let max = 0;
  for (let i = 0; i < dist.count; i++) max = Math.max(max, dist.getX(i));
  for (let i = 0; i < dist.count; i++) dist.setX(i, dist.getX(i) / max);
  return merged;
}
