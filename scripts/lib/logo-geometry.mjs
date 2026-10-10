/**
 * Reads brand/synovika-logo.png and works out its geometry: which pixels are
 * teal and which silver, the parts of the S, the orbit ring as a true
 * ellipse, and the two spheres as true circles. Used by scripts/trace-logo.mjs.
 *
 * Teal pixels follow the brief's rule: green and blue each more than 25
 * above red. Everything else that is opaque enough is silver.
 */
import sharp from 'sharp';
import { components, close, dilate } from './raster.mjs';
import { distance, fit, local, nearestT, at } from './ellipse.mjs';

export async function analyse(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, N = W * H;
  const alpha = new Float32Array(N);
  const lum = new Float32Array(N);
  const isTeal = new Uint8Array(N);
  const tealMask = new Uint8Array(N);
  const silverMask = new Uint8Array(N);
  for (let i = 0; i < N; i++) {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
    alpha[i] = a / 255;
    lum[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    isTeal[i] = g - r > 25 && b - r > 25 ? 1 : 0;
    if (a >= 128) (isTeal[i] ? tealMask : silverMask)[i] = 1;
  }

  const teal = components(tealMask, W, H).parts.filter((p) => p.size > 200);
  const silver = components(silverMask, W, H);
  const silverParts = silver.parts.filter((p) => p.size > 200);

  // Spheres: the two small round teal parts. The one further right dots the "i".
  const round = teal.filter((p) => p.size < 6000).sort((a, b) => a.box[0] - b.box[0]);
  const circleOf = (part) => {
    let sx = 0, sy = 0, sw = 0;
    const [x0, y0, x1, y1] = part.box;
    // Weight by alpha over the part's box (plus a margin), so soft edges count.
    for (let y = y0 - 3; y <= y1 + 3; y++)
      for (let x = x0 - 3; x <= x1 + 3; x++) {
        const i = y * W + x;
        if (!isTeal[i] && alpha[i] > 0.5) continue;
        sx += x * alpha[i];
        sy += y * alpha[i];
        sw += alpha[i];
      }
    return { cx: sx / sw + 0.5, cy: sy / sw + 0.5, r: Math.sqrt(sw / Math.PI) };
  };
  const ringSphere = circleOf(round[0]);
  const iDot = circleOf(round[1]);

  // The S: the two large teal faces and the silver parts left of the wordmark.
  const tealFaces = teal.filter((p) => p.size >= 6000).sort((a, b) => a.box[1] - b.box[1]);
  const markSilver = silverParts.filter((p) => p.box[2] < 720);
  const silverTop = markSilver.filter((p) => p.box[1] < 200).sort((a, b) => b.size - a.size)[0];
  const bowlAndRing = markSilver.sort((a, b) => b.size - a.size)[0];
  const ringArc = markSilver.find((p) => p !== silverTop && p !== bowlAndRing && p.box[3] - p.box[1] < 110 && p.box[2] - p.box[0] > 150);
  const tealLeft = Math.min(...tealFaces.map((p) => p.box[0]));

  // Points that are certainly ring: the loop left of the S and the arc at the
  // top right. Fit those first, then add silver pixels that cross a teal face
  // (teal just above and below) if they lie near that first fit.
  const leftPts = [];
  for (const p of bowlAndRing.pixels) {
    const x = p % W, y = (p / W) | 0;
    if (x < tealLeft - 2) leftPts.push([x + 0.5, y + 0.5]);
  }
  const arcPts = ringArc.pixels.map((p) => [(p % W) + 0.5, ((p / W) | 0) + 0.5]);
  const first = fit([...leftPts, ...arcPts], { cx: 435, cy: 455, a: 290, b: 70, theta: (-24 * Math.PI) / 180 });
  const crossing = [];
  for (const p of bowlAndRing.pixels) {
    const x = p % W, y = (p / W) | 0;
    if (x < tealLeft || x > 520) continue;
    let above = false, below = false;
    for (let d = 3; d <= 16; d++) {
      if (tealMask[(y - d) * W + x]) above = true;
      if (tealMask[(y + d) * W + x]) below = true;
    }
    if (above && below && Math.abs(distance(first, x + 0.5, y + 0.5)) < 9) crossing.push([x + 0.5, y + 0.5]);
  }
  const ringPoints = [...leftPts, ...arcPts, ...crossing];
  const ring = fit(ringPoints, first);
  if (ring.b > ring.a) [ring.a, ring.b, ring.theta] = [ring.b, ring.a, ring.theta + Math.PI / 2];

  // Thickness near each end of the major axis: the front loop (left) and the back arc (right).
  const spread = (pts) => {
    const d = pts.map(([x, y]) => distance(ring, x, y)).sort((a, b) => a - b);
    return d[Math.floor(d.length * 0.98)] - d[Math.floor(d.length * 0.02)];
  };
  const nearEnd = (pts, sign) => pts.filter(([x, y]) => sign * local(ring, x, y).u > 0.85 * ring.a);
  const front = spread(nearEnd(leftPts, -1));
  const back = spread(nearEnd(arcPts, 1).length > 50 ? nearEnd(arcPts, 1) : arcPts);

  // The ring is a flat band seen at an angle: wide at the ends of the major
  // axis, thin at the top and bottom. Find its real outer and inner edges by
  // walking along the normal from the centre line, wherever the band is
  // measurable (not where it lies on silver), and fit each edge as its own ellipse.
  const ringPixel = (x, y) => {
    const xi = Math.round(x - 0.5), yi = Math.round(y - 0.5);
    if (xi < 0 || yi < 0 || xi >= W || yi >= H) return false;
    const i = yi * W + xi;
    return alpha[i] >= 0.5 && !isTeal[i];
  };
  const tealNear = (x, y, r) => {
    for (let dy = -r; dy <= r; dy += 2) for (let dx = -r; dx <= r; dx += 2) {
      const xi = Math.round(x + dx), yi = Math.round(y + dy);
      if (tealMask[yi * W + xi]) return true;
    }
    return false;
  };
  const arcSet = new Set(ringArc.pixels);
  const outerPts = [], innerPts = [];
  for (let k = 0; k < 2400; k++) {
    const t = (k / 2400) * Math.PI * 2;
    const p = at(ring, t);
    const xi = Math.floor(p.x), yi = Math.floor(p.y);
    if (!ringPixel(p.x, p.y)) continue;
    const measurable = p.x < tealLeft - 2 || arcSet.has(yi * W + xi) || tealNear(p.x, p.y, 16);
    if (!measurable) continue;
    // Normal: gradient of the implicit ellipse at p, pointing outwards.
    const { u, v } = local(ring, p.x, p.y);
    const c = Math.cos(ring.theta), s = Math.sin(ring.theta);
    const gu = u / (ring.a * ring.a), gv = v / (ring.b * ring.b);
    const len = Math.hypot(gu, gv);
    const nx = (gu * c - gv * s) / len, ny = (gu * s + gv * c) / len;
    const walk = (dir) => {
      let d = 0;
      while (d < 30 && ringPixel(p.x + dir * nx * (d + 0.25), p.y + dir * ny * (d + 0.25))) d += 0.25;
      return d < 30 ? d : null;
    };
    const out = walk(1), inn = walk(-1);
    // Only accept edges that end on background or teal, never on more silver far away.
    if (out != null) outerPts.push([p.x + nx * out, p.y + ny * out]);
    if (inn != null) innerPts.push([p.x - nx * inn, p.y - ny * inn]);
  }
  ring.outer = fit(outerPts, { cx: ring.cx, cy: ring.cy, a: ring.a + 6, b: ring.b + 3, theta: ring.theta });
  ring.inner = fit(innerPts, { cx: ring.cx, cy: ring.cy, a: ring.a - 6, b: ring.b - 3, theta: ring.theta });
  ring.edgePoints = { outer: outerPts, inner: innerPts };

  // The sphere rides the ring: snap its centre onto the ellipse.
  const t = nearestT(ring, ringSphere.cx, ringSphere.cy);
  const onRing = at(ring, t);

  return {
    W, H, alpha, lum, isTeal, tealMask, silverMask,
    parts: { tealFaces, silverTop, bowlAndRing, ringArc },
    ring: { ...ring, front, back },
    ringPoints,
    ringSphere: { ...ringSphere, snapped: { cx: onRing.x, cy: onRing.y, t } },
    iDot,
    local: (x, y) => local(ring, x, y),
  };
}

/** A mask of every pixel within `pad` of the ring band. */
export function ringBand(g, pad) {
  const { W, H, ring } = g;
  const half = (ring.front + ring.back) / 4 + pad;
  const out = new Uint8Array(W * H);
  const [x0, x1, y0, y1] = [Math.max(0, Math.floor(ring.cx - ring.a - 40)), Math.min(W, Math.ceil(ring.cx + ring.a + 40)), Math.max(0, Math.floor(ring.cy - ring.a - 40)), Math.min(H, Math.ceil(ring.cy + ring.a + 40))];
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) {
      // Thicker at the front (left), thinner at the back (right), along the major axis.
      const { u } = local(ring, x + 0.5, y + 0.5);
      const k = Math.max(-1, Math.min(1, u / ring.a));
      const halfHere = half + ((ring.front - ring.back) / 4) * -k;
      if (Math.abs(distance(ring, x + 0.5, y + 0.5)) <= halfHere) out[y * W + x] = 1;
    }
  return out;
}

export { close, dilate };
