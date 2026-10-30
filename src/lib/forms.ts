import { LAND, NIGERIA } from './land';

/**
 * The shapes the hero's cloud of points takes (D-064): the Earth with Nigeria
 * lit, then one shape for each product, then the DNA that becomes the spine
 * of the services staircase. Each form is N points of x, y, z, w, in a
 * shuffled order, so the cloud swarms from one to the next instead of sliding.
 *
 * w is how bright a point is, 0 to about 1.2. From 2 up it means a point on
 * a moving signal: w - 2 is its place along the line (see the vertex shader
 * in src/scripts/signal.ts).
 *
 * Everything is drawn with lines, in units where the Earth has radius 1:
 * x right, y up, z towards the viewer.
 */
export type V3 = [number, number, number];
type Rand = () => number;
type LineOptions = { w?: number; density?: number; close?: boolean; dash?: number; signal?: boolean };
interface Line {
  pts: V3[];
  len: number;
  opts: LineOptions;
}

const rad = (d: number) => (d * Math.PI) / 180;
const TAU = Math.PI * 2;
const decode = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const bit = (mask: Uint8Array, i: number) => (mask[i >> 3]! >> (i & 7)) & 1;

function seeded(seed: number): Rand {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Pen {
  private lines: Line[] = [];
  private dots: number[] = [];
  constructor(
    private rand: Rand,
    private N: number,
  ) {}

  line(pts: V3[], opts: LineOptions = {}) {
    const all = opts.close ? [...pts, pts[0]!] : pts;
    let len = 0;
    for (let i = 1; i < all.length; i++) len += Math.hypot(all[i]![0] - all[i - 1]![0], all[i]![1] - all[i - 1]![1], all[i]![2] - all[i - 1]![2]);
    this.lines.push({ pts: all, len, opts });
  }
  /** A circle about a centre, in the plane of the two axes given. */
  circle(c: V3, r: number, u: V3, v: V3, opts: LineOptions = {}) {
    const pts: V3[] = [];
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * TAU;
      pts.push([c[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), c[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), c[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2])]);
    }
    this.line(pts, { ...opts, close: true });
  }
  /** The twelve edges of a box. */
  box(a: V3, b: V3, opts: LineOptions = {}) {
    const [x0, y0, z0] = a;
    const [x1, y1, z1] = b;
    for (const z of [z0, z1]) {
      this.line([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]], { ...opts, close: true });
    }
    for (const x of [x0, x1]) for (const y of [y0, y1]) this.line([[x, y, z0], [x, y, z1]], opts);
  }
  /** A filled patch in the plane of a corner and two sides. */
  fill(o: V3, u: V3, v: V3, n: number, w: number) {
    for (let i = 0; i < n; i++) {
      const s = this.rand();
      const t = this.rand();
      this.dots.push(o[0] + s * u[0] + t * v[0], o[1] + s * u[1] + t * v[1], o[2] + s * u[2] + t * v[2], w);
    }
  }
  /** A solid face: points on a jittered grid, so it reads as a surface, not a scatter. */
  solid(o: V3, u: V3, v: V3, w = 0.24, density = 1) {
    const lu = Math.hypot(u[0], u[1], u[2]);
    const lv = Math.hypot(v[0], v[1], v[2]);
    const n = lu * lv * this.N * 0.05 * density;
    const cols = Math.max(2, Math.round(Math.sqrt((n * lu) / lv)));
    const rows = Math.max(2, Math.round(n / cols));
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const s = (c + this.rand()) / cols;
        const t = (r + this.rand()) / rows;
        this.dots.push(o[0] + s * u[0] + t * v[0], o[1] + s * u[1] + t * v[1], o[2] + s * u[2] + t * v[2], w);
      }
    }
  }
  /** A solid triangle. */
  tri(a: V3, b: V3, c: V3, n: number, w: number) {
    for (let i = 0; i < n; i++) {
      let s = this.rand();
      let t = this.rand();
      if (s + t > 1) {
        s = 1 - s;
        t = 1 - t;
      }
      this.dots.push(a[0] + s * (b[0] - a[0]) + t * (c[0] - a[0]), a[1] + s * (b[1] - a[1]) + t * (c[1] - a[1]), a[2] + s * (b[2] - a[2]) + t * (c[2] - a[2]), w);
    }
  }
  /** A filled ring, or a disc when the inner radius is 0. */
  disc(c: V3, inner: number, outer: number, u: V3, v: V3, n: number, w: number) {
    for (let i = 0; i < n; i++) {
      const a = this.rand() * TAU;
      const r = Math.sqrt(inner * inner + this.rand() * (outer * outer - inner * inner));
      this.dots.push(c[0] + r * (Math.cos(a) * u[0] + Math.sin(a) * v[0]), c[1] + r * (Math.cos(a) * u[1] + Math.sin(a) * v[1]), c[2] + r * (Math.cos(a) * u[2] + Math.sin(a) * v[2]), w);
    }
  }
  dot(p: V3, w: number) {
    this.dots.push(p[0], p[1], p[2], w);
  }

  /** The finished form: points shared out along the lines by length, the rest as dust far out. */
  form(N: number, share = 0.86): Float32Array {
    const out = new Float32Array(N * 4);
    const fixed = Math.min(this.dots.length, N * 4);
    out.set(this.dots.slice(0, fixed));
    let at = fixed / 4;
    const budget = Math.max(0, Math.round(N * share) - at);
    const total = this.lines.reduce((s, l) => s + l.len * (l.opts.density ?? 1), 0) || 1;
    for (const l of this.lines) {
      const { w = 0.6, density = 1, dash = 0, signal = false } = l.opts;
      const n = Math.max(2, Math.round((budget * l.len * density) / total));
      let walked = 0;
      let seg = 1;
      let segLen = Math.hypot(l.pts[1]![0] - l.pts[0]![0], l.pts[1]![1] - l.pts[0]![1], l.pts[1]![2] - l.pts[0]![2]);
      for (let i = 0; i < n && at < N; i++) {
        const d = ((i + this.rand() * 0.6) / n) * l.len;
        while (d > walked + segLen && seg < l.pts.length - 1) {
          walked += segLen;
          seg++;
          segLen = Math.hypot(l.pts[seg]![0] - l.pts[seg - 1]![0], l.pts[seg]![1] - l.pts[seg - 1]![1], l.pts[seg]![2] - l.pts[seg - 1]![2]);
        }
        if (dash && (d / dash) % 1 > 0.55) continue;
        const a = l.pts[seg - 1]!;
        const b = l.pts[seg]!;
        const t = segLen ? (d - walked) / segLen : 0;
        const j = 0.0035;
        out[at * 4] = a[0] + (b[0] - a[0]) * t + (this.rand() - 0.5) * j;
        out[at * 4 + 1] = a[1] + (b[1] - a[1]) * t + (this.rand() - 0.5) * j;
        out[at * 4 + 2] = a[2] + (b[2] - a[2]) * t + (this.rand() - 0.5) * j;
        out[at * 4 + 3] = signal ? 2 + (d / l.len) * 0.998 : w;
        at++;
      }
    }
    // Whatever is left drifts far out, faint, so the cloud never has edges.
    for (; at < N; at++) {
      const a = this.rand() * TAU;
      const y = this.rand() * 2 - 1;
      const r = 1.9 + this.rand() * 1.5;
      const c = Math.sqrt(1 - y * y);
      out[at * 4] = Math.cos(a) * c * r;
      out[at * 4 + 1] = y * r;
      out[at * 4 + 2] = Math.sin(a) * c * r;
      out[at * 4 + 3] = 0.05 + this.rand() * 0.1;
    }
    // Shuffled, so a form's points don't all set off from the same place.
    for (let i = N - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      for (let k = 0; k < 4; k++) {
        const t = out[i * 4 + k]!;
        out[i * 4 + k] = out[j * 4 + k]!;
        out[j * 4 + k] = t;
      }
    }
    return out;
  }
}

/* ── The Earth ─────────────────────────────────────────────────────────── */
/** Nigeria faces the viewer: its centre is the point (0, 0, 1). */
const FRONT = { lat: 9.2, lon: 8.2 };
function onSphere(lat: number, lon: number, r = 1): V3 {
  const a = rad(lon - FRONT.lon);
  const b = rad(lat);
  const t = rad(FRONT.lat);
  const x = Math.cos(b) * Math.sin(a);
  const y = Math.sin(b);
  const z = Math.cos(b) * Math.cos(a);
  return [x * r, (y * Math.cos(t) - z * Math.sin(t)) * r, (y * Math.sin(t) + z * Math.cos(t)) * r];
}

function earth(N: number, rand: Rand) {
  const p = new Pen(rand, N);
  const land = decode(LAND.bits);
  const ng = decode(NIGERIA.bits);
  const isLand = (lat: number, lon: number) => {
    const x = Math.min(LAND.w - 1, Math.floor(((lon + 180) / 360) * LAND.w));
    const y = Math.min(LAND.h - 1, Math.floor(((90 - lat) / 180) * LAND.h));
    return bit(land, y * LAND.w + x) === 1;
  };
  const isNigeria = (lat: number, lon: number) => {
    if (lat < NIGERIA.lat0 || lat >= NIGERIA.lat1 || lon < NIGERIA.lon0 || lon >= NIGERIA.lon1) return false;
    const x = Math.floor(((lon - NIGERIA.lon0) / (NIGERIA.lon1 - NIGERIA.lon0)) * NIGERIA.w);
    const y = Math.floor(((NIGERIA.lat1 - lat) / (NIGERIA.lat1 - NIGERIA.lat0)) * NIGERIA.h);
    return bit(ng, y * NIGERIA.w + x) === 1;
  };

  // The land, on an even spiral over the sphere, with a thin scatter of sea so it reads as a ball.
  // Most of the points go on the side that faces the viewer, so the continents read.
  const M = Math.round(N * 2.7);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < M; i++) {
    const y = 1 - (2 * (i + 0.5)) / M;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lon = ((((i * golden) % TAU) / TAU) * 360 + 360) % 360 - 180;
    if (isNigeria(lat, lon)) continue;
    const at = onSphere(lat, lon);
    if (at[2] < -0.05 && rand() > 0.14) continue;
    if (isLand(lat + (rand() - 0.5) * 0.9, lon + (rand() - 0.5) * 0.9)) p.dot(at, 0.56 + rand() * 0.22);
    else if (rand() < 0.1) p.dot(at, 0.13);
  }
  // Nigeria, lit.
  const lights = Math.round(N * 0.045);
  for (let n = 0; n < lights; ) {
    const lat = NIGERIA.lat0 + rand() * (NIGERIA.lat1 - NIGERIA.lat0);
    const lon = NIGERIA.lon0 + rand() * (NIGERIA.lon1 - NIGERIA.lon0);
    if (isNigeria(lat, lon)) {
      p.dot(onSphere(lat, lon, 1.004), 1.08);
      n++;
    }
  }
  // Signals leaving Nigeria over the curve of the Earth, and the logo's orbit around it all.
  const out: [number, number][] = [
    [52, 0],
    [40, -75],
    [-25, 28],
    [24, 55],
    [-14, -52],
    [60, 60],
    [1, 104],
  ];
  const from = [9.2, 8.2] as const;
  for (const [lat, lon] of out) {
    const a = onSphere(from[0], from[1]);
    const b = onSphere(lat, lon);
    const dot = Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]);
    const angle = Math.acos(dot);
    const pts: V3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const s = Math.sin(angle) || 1;
      const k0 = Math.sin((1 - t) * angle) / s;
      const k1 = Math.sin(t * angle) / s;
      const r = 1 + Math.sin(t * Math.PI) * (0.1 + angle * 0.14);
      pts.push([(a[0] * k0 + b[0] * k1) * r, (a[1] * k0 + b[1] * k1) * r, (a[2] * k0 + b[2] * k1) * r]);
    }
    p.line(pts, { signal: true });
  }
  const tilt = rad(68);
  const yaw = rad(-24);
  const ring: V3[] = [];
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * TAU;
    const x = Math.cos(a) * 1.42;
    const z0 = Math.sin(a) * 1.42;
    const y = -z0 * Math.cos(tilt);
    const z = z0 * Math.sin(tilt);
    ring.push([x * Math.cos(yaw) - y * Math.sin(yaw), x * Math.sin(yaw) + y * Math.cos(yaw), z]);
  }
  p.line(ring, { signal: true, density: 0.7, close: true });
  return p.form(N, 0.97);
}

/* ── Selvion: a van, its route, its geofence and its pin ───────────────── */
function van(p: Pen, at: V3, s: number, yaw: number) {
  const place = ([x, y, z]: V3): V3 => [at[0] + s * (x * Math.cos(yaw) + z * Math.sin(yaw)), at[1] + s * y, at[2] + s * (-x * Math.sin(yaw) + z * Math.cos(yaw))];
  const side: [number, number][] = [
    [-1, 0.08],
    [-1, 0.86],
    [0.26, 0.86],
    [0.62, 0.46],
    [0.98, 0.36],
    [1, 0.08],
  ];
  const W = 0.44;
  const face = (a: V3, b: V3, d: V3, w: number, density = 3.2) => {
    const o = place(a);
    const e = place(b);
    const f = place(d);
    p.solid(o, [e[0] - o[0], e[1] - o[1], e[2] - o[2]], [f[0] - o[0], f[1] - o[1], f[2] - o[2]], w, density);
  };
  for (const z of [-W, W]) {
    face([-1, 0.08, z], [0.26, 0.08, z], [-1, 0.86, z], 0.34);
    face([0.26, 0.08, z], [1, 0.08, z], [0.26, 0.38, z], 0.34);
  }
  face([-1, 0.86, -W], [0.26, 0.86, -W], [-1, 0.86, W], 0.4);
  face([-1, 0.08, -W], [-1, 0.08, W], [-1, 0.86, -W], 0.28);
  face([0.26, 0.86, -W], [0.62, 0.46, -W], [0.26, 0.86, W], 0.58);
  face([0.62, 0.46, -W], [0.98, 0.36, -W], [0.62, 0.46, W], 0.4);
  face([1, 0.08, -W], [1, 0.08, W], [1, 0.36, -W], 0.3);
  for (const z of [-W, W]) {
    p.line(side.map(([x, y]) => place([x, y, z])), { w: 1, density: 2.2, close: true });
    p.line(([[0.08, 0.76], [0.25, 0.76], [0.5, 0.48], [0.08, 0.48]] as [number, number][]).map(([x, y]) => place([x, y, z])), { w: 0.9, density: 2, close: true });
    p.line([place([-0.92, 0.42, z]), place([0.96, 0.42, z])], { w: 0.5, density: 1.2 });
    for (const x of [-0.62, 0.62]) {
      const c = place([x, 0.1, z]);
      const u = place([x + 1, 0.1, z]);
      const axis: V3 = [(u[0] - c[0]) / s, (u[1] - c[1]) / s, (u[2] - c[2]) / s];
      p.circle(c, s * 0.2, axis, [0, 1, 0], { w: 1.1, density: 4 });
      p.circle(c, s * 0.08, axis, [0, 1, 0], { w: 1, density: 4 });
      p.disc(c, s * 0.08, s * 0.2, axis, [0, 1, 0], 220, 0.72);
    }
  }
  for (const [x, y] of side) p.line([place([x, y, -W]), place([x, y, W])], { w: 0.9, density: 2 });
}

function selvion(N: number, rand: Rand) {
  const p = new Pen(rand, N);
  const g = -0.62;
  // The ground, so the streets lie on something.
  p.disc([0, g - 0.004, 0], 0, 2.3, [1, 0, 0], [0, 0, 1], Math.round(N * 0.1), 0.07);
  const across = (i: number, x: number) => i * 0.72 + Math.sin(x * 1.1 + i * 1.7) * 0.09;
  const along = (j: number, z: number) => j * 0.86 + Math.sin(z * 1.2 + j * 2.1) * 0.09;
  const X = 2.1;
  for (let i = -2; i <= 2; i++) {
    const pts: V3[] = [];
    for (let k = 0; k <= 30; k++) {
      const x = -X + (k / 30) * X * 2;
      pts.push([x, g, across(i, x)]);
    }
    p.line(pts, { w: 0.16, density: 0.34 });
  }
  for (let j = -2; j <= 2; j++) {
    const pts: V3[] = [];
    for (let k = 0; k <= 24; k++) {
      const z = -1.6 + (k / 24) * 3.2;
      pts.push([along(j, z), g, z]);
    }
    p.line(pts, { w: 0.16, density: 0.34 });
  }
  // The depot, inside its geofence.
  const depot: V3 = [along(-1, across(1, -0.86)) - 0.12, g, across(1, -0.86)];
  p.box([depot[0] - 0.3, g, depot[2] - 0.2], [depot[0] + 0.3, g + 0.26, depot[2] + 0.2], { w: 0.72, density: 1.4 });
  p.solid([depot[0] - 0.3, g + 0.26, depot[2] - 0.2], [0.6, 0, 0], [0, 0, 0.4], 0.34, 1.2);
  p.solid([depot[0] - 0.3, g, depot[2] + 0.2], [0.6, 0, 0], [0, 0.26, 0], 0.3, 1.2);
  p.solid([depot[0] + 0.3, g, depot[2] - 0.2], [0, 0, 0.4], [0, 0.26, 0], 0.22, 1.2);
  p.circle(depot, 0.72, [1, 0, 0], [0, 0, 1], { w: 0.95, density: 2.4, dash: 0.1 });
  // The route: out of the depot, through the streets, past the van.
  const route: V3[] = [];
  for (let k = 0; k <= 16; k++) {
    const x = depot[0] + (k / 16) * (along(1, across(1, 0.86)) - depot[0]);
    route.push([x, g + 0.01, across(1, x)]);
  }
  for (let k = 1; k <= 12; k++) {
    const z = across(1, 0.86) + (k / 12) * (across(-1, 0.86) - across(1, 0.86));
    route.push([along(1, z), g + 0.01, z]);
  }
  for (let k = 1; k <= 8; k++) {
    const x = along(1, across(-1, 0.86)) + (k / 8) * 1;
    route.push([x, g + 0.01, across(-1, x)]);
  }
  p.line(route, { signal: true, density: 2.4 });
  van(p, [0.05, g, across(1, 0.05) - 0.02], 0.62, 0.1);
  // Its pin, with the signal rings under it.
  const pin: V3 = [0.05, 0.46, across(1, 0.05)];
  const r = 0.2;
  for (const z of [-0.012, 0.012]) {
    const pts: V3[] = [];
    for (let i = 0; i <= 28; i++) {
      const a = rad(-40 + (i / 28) * 260);
      pts.push([pin[0] + Math.cos(a) * r, pin[1] + r * 1.3 + Math.sin(a) * r, pin[2] + z]);
    }
    p.line([[pin[0], pin[1] - r * 0.6, pin[2] + z], ...pts], { w: 1.15, density: 3.4, close: true });
    p.circle([pin[0], pin[1] + r * 1.3, pin[2] + z], r * 0.4, [1, 0, 0], [0, 1, 0], { w: 1.2, density: 5 });
  }
  p.disc([pin[0], pin[1] + r * 1.3, pin[2]], r * 0.44, r, [1, 0, 0], [0, 1, 0], Math.round(N * 0.035), 0.86);
  p.tri([pin[0], pin[1] - r * 0.6, pin[2]], [pin[0] - r * 0.76, pin[1] + r * 0.66, pin[2]], [pin[0] + r * 0.76, pin[1] + r * 0.66, pin[2]], Math.round(N * 0.02), 0.86);
  for (const k of [0.3, 0.46, 0.62]) p.circle([0.05, g + 0.005, across(1, 0.05)], k * 1.6, [1, 0, 0], [0, 0, 1], { w: 0.3, density: 0.5 });
  return p.form(N);
}

/* ── The estate: a gate, its keypad, and the homes behind it ───────────── */
function house(p: Pen, x: number, z: number, g: number, w: number, h: number) {
  const d = w * 0.8;
  const opts = { w: 0.5, density: 0.9 };
  p.box([x - w, g, z - d], [x + w, g + h, z + d], opts);
  p.solid([x - w, g, z + d], [w * 2, 0, 0], [0, h, 0], 0.26, 1.2);
  p.solid([x + w, g, z - d], [0, 0, d * 2], [0, h, 0], 0.18, 1.2);
  p.solid([x, g + h + w * 0.72, z - d], [0, 0, d * 2], [w * 1.12, -w * 0.72, 0], 0.32, 1.3);
  p.solid([x, g + h + w * 0.72, z - d], [0, 0, d * 2], [-w * 1.12, -w * 0.72, 0], 0.22, 1.3);
  p.tri([x - w * 1.12, g + h, z + d], [x + w * 1.12, g + h, z + d], [x, g + h + w * 0.72, z + d], Math.round(w * w * 900), 0.3);
  for (const s of [z - d, z + d]) p.line([[x - w * 1.12, g + h, s], [x, g + h + w * 0.72, s], [x + w * 1.12, g + h, s]], opts);
  p.line([[x, g + h + w * 0.72, z - d], [x, g + h + w * 0.72, z + d]], opts);
  p.box([x - w * 0.2, g, z + d], [x + w * 0.2, g + h * 0.62, z + d], { w: 0.7, density: 1.2 });
  for (const wx of [-0.62, 0.62]) p.box([x + w * wx - w * 0.16, g + h * 0.42, z + d], [x + w * wx + w * 0.16, g + h * 0.72, z + d], { w: 0.85, density: 1.4 });
}

function estate(N: number, rand: Rand) {
  const p = new Pen(rand, N);
  const g = -0.72;
  p.solid([-0.42, g, -0.42], [0.84, 0, 0], [0, 0, 2.12], 0.1, 0.8);
  // The road through the gate.
  for (const x of [-0.42, 0.42]) p.line([[x, g, 1.7], [x, g, -0.1]], { w: 0.2, density: 0.5 });
  p.line([[0, g, 1.7], [0, g, 0.1]], { w: 0.22, density: 0.5, dash: 0.16 });
  for (const x of [-0.42, 0.42]) p.line([[x, g, -0.1], [x, g, -0.42]], { w: 0.18, density: 0.5 });
  // The pillars, with caps.
  for (const x of [-0.72, 0.72]) {
    p.box([x - 0.13, g, -0.13], [x + 0.13, g + 1.22, 0.13], { w: 1, density: 1.8 });
    p.box([x - 0.17, g + 1.22, -0.17], [x + 0.17, g + 1.28, 0.17], { w: 1.05, density: 2 });
    p.solid([x - 0.13, g, 0.13], [0.26, 0, 0], [0, 1.22, 0], 0.4, 2.4);
    p.solid([x + 0.13, g, -0.13], [0, 0, 0.26], [0, 1.22, 0], 0.26, 2.4);
    p.solid([x - 0.17, g + 1.28, -0.17], [0.34, 0, 0], [0, 0, 0.34], 0.6, 3);
    for (let k = 1; k < 5; k++) p.line([[x - 0.13, g + k * 0.24, 0.13], [x + 0.13, g + k * 0.24, 0.13]], { w: 0.5, density: 1 });
  }
  // The two leaves of the gate: bars under a rail that rises to the middle.
  const top = (x: number) => g + 0.92 + 0.22 * (1 - (x / 0.59) ** 2);
  const rail: V3[] = [];
  for (let k = 0; k <= 24; k++) {
    const x = -0.59 + (k / 24) * 1.18;
    rail.push([x, top(x), 0]);
  }
  p.line(rail, { w: 1.1, density: 2.4 });
  p.line([[-0.59, g + 0.12, 0], [0.59, g + 0.12, 0]], { w: 1, density: 2 });
  p.line([[-0.59, g + 0.52, 0], [0.59, g + 0.52, 0]], { w: 0.8, density: 1.6 });
  p.solid([-0.59, g + 0.12, 0], [1.18, 0, 0], [0, 0.4, 0], 0.32, 1.8);
  for (let k = 0; k <= 14; k++) {
    const x = -0.56 + (k / 14) * 1.12;
    p.line([[x, g + 0.12, 0], [x, top(x) + 0.05, 0]], { w: 0.95, density: 1.5 });
  }
  // The arch over the gate.
  const arch: V3[] = [];
  for (let k = 0; k <= 30; k++) {
    const a = Math.PI - (k / 30) * Math.PI;
    arch.push([Math.cos(a) * 0.72, g + 1.3 + Math.sin(a) * 0.38, 0]);
  }
  p.line(arch, { signal: true, density: 2.2 });
  // The walls running off to each side.
  for (const s of [-1, 1]) {
    p.line([[s * 0.85, g + 0.6, 0], [s * 2.1, g + 0.6, 0]], { w: 0.6, density: 1 });
    p.line([[s * 0.85, g + 0.7, 0], [s * 2.1, g + 0.7, 0]], { w: 0.6, density: 1 });
    p.line([[s * 0.85, g, 0], [s * 2.1, g, 0]], { w: 0.28, density: 0.7 });
    p.solid([s * 0.85, g, 0], [s * 1.25, 0, 0], [0, 0.7, 0], 0.2, 1);
    for (let k = 0; k <= 5; k++) p.line([[s * (0.98 + k * 0.22), g, 0], [s * (0.98 + k * 0.22), g + 0.7, 0]], { w: 0.34, density: 0.7 });
  }
  // The keypad at the gate, showing a code.
  p.box([1.08, g, 0.72], [1.14, g + 0.62, 0.78], { w: 0.75, density: 1.4 });
  p.box([0.96, g + 0.62, 0.72], [1.26, g + 1, 0.78], { w: 1.05, density: 2.4 });
  p.solid([0.96, g + 0.62, 0.78], [0.3, 0, 0], [0, 0.38, 0], 0.3, 3);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) p.fill([1.01 + x * 0.075, g + 0.68 + y * 0.09, 0.78], [0.045, 0, 0], [0, 0.05, 0], 40, 1.15);
  // The homes behind it.
  house(p, -1.1, -1.2, g, 0.42, 0.42);
  house(p, 0, -1.55, g, 0.48, 0.5);
  house(p, 1.1, -1.2, g, 0.42, 0.42);
  return p.form(N);
}

/* ── Websites: the page, the admin panel behind it, and a phone in front ─ */
function rounded(x0: number, y0: number, x1: number, y1: number, z: number, r: number): V3[] {
  const pts: V3[] = [];
  const corner = (cx: number, cy: number, from: number) => {
    for (let i = 0; i <= 6; i++) {
      const a = from + (i / 6) * (Math.PI / 2);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]);
    }
  };
  corner(x1 - r, y0 + r, -Math.PI / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  return pts;
}

function websites(N: number, rand: Rand) {
  const p = new Pen(rand, N);
  const row = (x0: number, x1: number, y: number, z: number, w: number, density = 1.4) => p.line([[x0, y, z], [x1, y, z]], { w, density });

  // Back: the admin panel.
  const az = -0.62;
  const ax = 0.42;
  const ay = 0.34;
  p.line(rounded(-1.3 + ax, -0.82 + ay, 1.1 + ax, 0.82 + ay, az, 0.06), { w: 0.62, density: 1.2, close: true });
  p.solid([-1.3 + ax, -0.82 + ay, az], [2.4, 0, 0], [0, 1.64, 0], 0.12, 0.7);
  p.solid([-1.3 + ax, -0.82 + ay, az], [0.58, 0, 0], [0, 1.64, 0], 0.2, 1);
  p.line([[-0.72 + ax, -0.82 + ay, az], [-0.72 + ax, 0.82 + ay, az]], { w: 0.5, density: 1 });
  for (let i = 0; i < 5; i++) row(-1.2 + ax, -0.84 + ax, 0.62 - i * 0.2 + ay, az, 0.58, 1.3);
  for (let i = 0; i < 7; i++) {
    const y = 0.64 - i * 0.22 + ay;
    row(-0.6 + ax, 0.62 + ax, y, az, 0.42, 1);
    p.circle([0.92 + ax, y, az], 0.05, [1, 0, 0], [0, 1, 0], { w: 0.75, density: 2.4 });
  }

  // Middle: the website.
  const z = 0;
  p.line(rounded(-1.3, -0.82, 1.02, 0.82, z, 0.07), { w: 1.05, density: 1.8, close: true });
  p.solid([-1.3, -0.82, z], [2.32, 0, 0], [0, 1.64, 0], 0.14, 0.9);
  p.solid([-1.3, 0.62, z], [2.32, 0, 0], [0, 0.2, 0], 0.34, 1.6);
  row(-1.3, 1.02, 0.62, z, 0.9, 1.5);
  for (const i of [0, 1, 2]) p.circle([-1.2 + i * 0.1, 0.72, z], 0.026, [1, 0, 0], [0, 1, 0], { w: 1.15, density: 5 });
  p.line(rounded(-0.72, 0.68, 0.74, 0.76, z, 0.03), { w: 0.55, density: 1.2, close: true });
  p.solid([-1.18, -0.06, z], [1.12, 0, 0], [0, 0.58, 0], 0.5, 4);
  for (let i = 0; i < 4; i++) row(0.08, i === 3 ? 0.5 : 0.9, 0.44 - i * 0.14, z, 0.9, 1.5);
  for (let i = 0; i < 3; i++) {
    const x = -1.18 + i * 0.75;
    p.line(rounded(x, -0.7, x + 0.66, -0.18, z, 0.04), { w: 0.82, density: 1.5, close: true });
    p.solid([x, -0.7, z], [0.66, 0, 0], [0, 0.52, 0], 0.26, 1.6);
    row(x + 0.08, x + 0.46, -0.3, z, 0.8, 1.4);
    row(x + 0.08, x + 0.58, -0.42, z, 0.5, 1);
    row(x + 0.08, x + 0.5, -0.52, z, 0.5, 1);
  }

  // Front: the same site on a phone.
  const fz = 0.62;
  p.line(rounded(0.62, -1.02, 1.28, 0.24, fz, 0.1), { w: 1.15, density: 2.4, close: true });
  p.solid([0.64, -1, fz], [0.62, 0, 0], [0, 1.22, 0], 0.2, 2);
  row(0.86, 1.04, 0.15, fz, 1, 3);
  p.solid([0.7, -0.26, fz], [0.5, 0, 0], [0, 0.34, 0], 0.55, 5);
  for (let i = 0; i < 4; i++) row(0.7, i === 3 ? 1 : 1.2, -0.38 - i * 0.12, fz, 0.9, 2);

  // A change in the panel reaches the site and the phone.
  for (const [x, y] of [[-0.2, 0.3], [0.5, -0.1], [-0.4, -0.42]] as [number, number][]) {
    p.line([[x + ax * 0.6, y + ay * 0.6, az], [x, y, z]], { signal: true, density: 2 });
  }
  p.line([[0.72, -0.1, z], [0.86, -0.3, fz]], { signal: true, density: 2 });

  // The cursor, on the page.
  const cx = -0.34;
  const cy = 0.14;
  const cursor: V3[] = ([[0, 0], [0, -0.3], [0.08, -0.22], [0.14, -0.34], [0.19, -0.31], [0.13, -0.2], [0.23, -0.2]] as [number, number][]).map(([x, y]) => [cx + x, cy + y, 0.1]);
  p.line(cursor, { w: 1.2, density: 5, close: true });
  return p.form(N);
}

/* ── The DNA, and the spine it becomes ─────────────────────────────────── */
/** The services helix, in the cloud's units, measured from the page (hero.ts). */
export interface Spine {
  R: number;
  rise: number;
  card: number;
  /** How far the helix sits below the centre of the view. */
  drop: number;
  /** Half the spine's height, and its radius. */
  height: number;
  radius: number;
}

/**
 * Two forms of the same points, in the same order, so the DNA glides into
 * place as the staircase's spine instead of breaking up. Its twist is three
 * steps of the staircase, which locks the two together as they turn (scroll
 * in hero.ts). The first `count` points are the DNA; the rest are spare
 * thickness in the big form, and become the front card in the spine form,
 * so the one card seems to come out of the DNA. Not shuffled, for the same
 * reason.
 */
export function dna(N: number, g: Spine) {
  const rand = seeded(55);
  const big = new Float32Array(N * 4);
  const spine = new Float32Array(N * 4);
  const strands = Math.round(N * 0.62);
  const rungs = Math.round(N * 0.2);
  const count = strands + rungs;
  const pitch = g.rise * 3;
  const TURNS = 3;
  const RADIUS = 0.72;
  const put = (i: number, a: V3, aw: number, b: V3, bw: number) => {
    big.set([a[0], a[1], a[2], aw], i * 4);
    spine.set([b[0], b[1], b[2], bw], i * 4);
  };
  const along = (t: number) => -g.height + t * 2 * g.height;
  /** Fades the spine out towards its ends. */
  const taper = (t: number) => Math.min(1, Math.min(t, 1 - t) / 0.08);
  const strandPoint = (t: number, side: number, band: number): [V3, V3] => {
    const a = t * TURNS * TAU + side;
    const y = along(t);
    const s = (TAU * y) / pitch + side;
    return [
      [Math.cos(a) * RADIUS, -1.5 + 3 * t + band, Math.sin(a) * RADIUS],
      [Math.cos(s) * g.radius, y + g.drop + (band * g.radius) / RADIUS, Math.sin(s) * g.radius],
    ];
  };
  for (let i = 0; i < strands; i++) {
    const t = rand();
    const [a, b] = strandPoint(t, i % 2 ? Math.PI : 0, (rand() - 0.5) * 0.1);
    const w = rand() < 0.34 ? 2 + t * 0.998 : 0.52;
    put(i, a, w, b, taper(t) < 1 ? 0.52 * taper(t) : w);
  }
  for (let i = strands; i < count; i++) {
    const t = (Math.floor(rand() * 30) + 0.5) / 30;
    const u = rand() * 2 - 1;
    const a = t * TURNS * TAU;
    const y = along(t);
    const s = (TAU * y) / pitch;
    put(i, [Math.cos(a) * RADIUS * u, -1.5 + 3 * t, Math.sin(a) * RADIUS * u], 0.34, [Math.cos(s) * g.radius * u, y + g.drop, Math.sin(s) * g.radius * u], 0.3 * taper(t));
  }
  // The one card, at the front of the helix: same place and size as .spiral-item 0.
  const pen = new Pen(rand, N - count);
  const h = g.card / 2;
  const at = (x: number, y: number): V3 => [x, g.drop + y, g.R];
  pen.line(rounded(-h, -h, h, h, g.R, g.card * 0.068).map(([x, y, z]) => [x, y + g.drop, z]), { w: 1.05, density: 2.4, close: true });
  pen.solid(at(-h, -h), [h * 2, 0, 0], [0, h * 2, 0], 0.2, 2);
  pen.circle(at(-h + g.card * 0.165, h - g.card * 0.165), g.card * 0.075, [1, 0, 0], [0, 1, 0], { w: 0.9, density: 3 });
  const lines: [number, number, number, number][] = [
    [0.09, 0.46, 0.68, 0.05],
    [0.09, 0.57, 0.8, 0.028],
    [0.09, 0.63, 0.6, 0.028],
    [0.09, 0.86, 0.2, 0.034],
  ];
  for (const [x, y, wide, tall] of lines) pen.solid(at(-h + g.card * x, h - g.card * y - g.card * tall), [g.card * wide, 0, 0], [0, g.card * tall, 0], 0.72, 8);
  const card = pen.form(N - count, 1);
  for (let i = count; i < N; i++) {
    const j = (i - count) * 4;
    const [a] = strandPoint(rand(), i % 2 ? Math.PI : 0, (rand() - 0.5) * 0.1);
    put(i, a, 0.5, [card[j]!, card[j + 1]!, card[j + 2]!], card[j + 3]!);
  }
  return { big, spine, count };
}

/** One builder per form, in order, so each can run in its own task. The DNA comes last, once the staircase has been measured. */
export const FORMS: ((N: number) => Float32Array)[] = [
  (N) => earth(N, seeded(11)),
  (N) => selvion(N, seeded(22)),
  (N) => estate(N, seeded(33)),
  (N) => websites(N, seeded(44)),
];
