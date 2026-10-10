/**
 * Vectorises brand/synovika-logo.png (brief section 4.1).
 *
 *   node scripts/trace-logo.mjs
 *
 * 1. Splits the pixels into teal (green and blue each more than 25 above red)
 *    and silver, and finds the parts of the S, the ring and the spheres.
 * 2. Fits the orbit ring's outer and inner edges as true ellipses and the
 *    spheres as true circles (scripts/lib/logo-geometry.mjs).
 * 3. Traces each face of the S, the fold steps, the wordmark and the tagline
 *    with potrace (turdSize 40, optTolerance 0.4) at 4x, so curves are smooth.
 * 4. Writes brand/mark.svg, brand/wordmark.svg, brand/tagline.svg, every
 *    lockup (brand/logo-*.svg), brand/mark-geometry.json, and
 *    src/lib/brand-paths.json for the site's inline logo and the 3D mark.
 *
 * Colours come from src/styles/tokens.css.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import potrace from 'potrace';
import { optimize } from 'svgo';
import satori from 'satori';
import { analyse } from './lib/logo-geometry.mjs';
import { components, dilate, close, open, blur } from './lib/raster.mjs';
import { local, path as ellipsePath, distance } from './lib/ellipse.mjs';
import { FOLDS } from './lib/logo-folds.mjs';

const SRC = 'brand/synovika-logo.png';
const F = 4;
const css = await readFile('src/styles/tokens.css', 'utf8');
const token = (name) => {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'));
  if (!m) throw new Error(`token --color-${name} not found`);
  return m[1].toLowerCase();
};
const C = {
  teal: token('teal-600'),
  tealFold: token('teal-800'),
  silver: token('neutral-400'),
  silverFold: token('neutral-500'),
  ink: token('neutral-800'),
  inkFold: token('neutral-700'),
  black: token('neutral-900'),
  white: token('white'),
  chromeLow: '#8a8a8a',
};

const g = await analyse(SRC);
const { W, H, alpha, lum, isTeal } = g;
const N = W * H;
const round = (n, d = 2) => +n.toFixed(d);

/* ── Masks ────────────────────────────────────────────────────────────── */

// The ring band from the fitted edges, grown a little, for removing ring pixels.
const inBand = (x, y, grow = 0) => distance({ ...g.ring.outer, a: g.ring.outer.a + grow, b: g.ring.outer.b + grow }, x, y) <= 0 && distance({ ...g.ring.inner, a: g.ring.inner.a - grow, b: g.ring.inner.b - grow }, x, y) >= 0;
const front = (x, y) => local(g.ring, x, y).v > 0;
const tealLeft = Math.min(...g.parts.tealFaces.map((p) => p.box[0]));

const maskOf = (pixels) => {
  const m = new Uint8Array(N);
  for (const p of pixels) m[p] = 1;
  return m;
};
const faces = {
  'teal-top': maskOf(g.parts.tealFaces[0].pixels),
  'teal-tail': maskOf(g.parts.tealFaces[1].pixels),
  'silver-top': maskOf(g.parts.silverTop.pixels),
};
// The bowl: its part minus the ring where the ring is in front (or outside the S).
{
  const m = new Uint8Array(N);
  for (const p of g.parts.bowlAndRing.pixels) {
    const x = (p % W) + 0.5, y = ((p / W) | 0) + 0.5;
    if (inBand(x, y, 1.5) && (front(x, y) || x < tealLeft)) continue;
    m[p] = 1;
  }
  // Removing the ring can split the bowl in two (above and below it): keep every real part.
  const parts = components(m, W, H).parts.filter((p) => p.size > 1500);
  faces['silver-bowl'] = maskOf(parts.flatMap((p) => p.pixels));
}

/**
 * Each face made whole under the ring: the band is filled wherever the face
 * lies on both sides of it. The flat mark covers this with the front ring,
 * but the small mark has no ring and the 3D ring is a separate object.
 */
{
  const band = new Uint8Array(N);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (inBand(x + 0.5, y + 0.5, 2.5)) band[y * W + x] = 1;
  const R = 14;
  for (const [name, mask] of Object.entries(faces)) {
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let i = 0; i < N; i++) if (mask[i]) { const x = i % W, y = (i / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    x0 = Math.max(0, x0 - R - 2); y0 = Math.max(0, y0 - R - 2); x1 = Math.min(W - 1, x1 + R + 2); y1 = Math.min(H - 1, y1 + R + 2);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const crop = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) crop[y * w + x] = mask[(y + y0) * W + x + x0];
    const closed = close(crop, w, h, R);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y + y0) * W + x + x0; if (closed[y * w + x] && band[i]) mask[i] = 1; }
    faces[name] = mask;
  }
}

/** Alpha coverage of a mask, including its soft edge (pixels of the same colour within 2 px). */
function coverage(mask, teal) {
  const near = dilate(mask, W, H, 2);
  const out = new Float32Array(N);
  for (let i = 0; i < N; i++) if (near[i] && (mask[i] || isTeal[i] === (teal ? 1 : 0))) out[i] = mask[i] ? Math.max(alpha[i], 0.5) : alpha[i];
  return out;
}

/* ── Tracing ──────────────────────────────────────────────────────────── */

function boxOf(field) {
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let i = 0; i < N; i++)
    if (field[i] > 0.02) {
      const x = i % W, y = (i / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  const m = 8;
  return [Math.max(0, x0 - m), Math.max(0, y0 - m), Math.min(W, x1 + m + 1), Math.min(H, y1 + m + 1)];
}

/** Trace a coverage field (0..1) to an SVG path in logo pixel coordinates. */
async function trace(field, { scale = F, turd = 40, sigma = 3 } = {}) {
  const [x0, y0, x1, y1] = boxOf(field);
  const w = x1 - x0, h = y1 - y0;
  const gray = Buffer.alloc(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) gray[y * w + x] = 255 - Math.round(255 * Math.min(1, field[(y + y0) * W + x + x0]));
  const png = await sharp(gray, { raw: { width: w, height: h, channels: 1 } })
    .resize(w * scale, h * scale, { kernel: 'lanczos3' })
    .blur(sigma * scale * 0.5)
    .threshold(128)
    .png()
    .toBuffer();
  // The brief's settings are in the logo's own pixels: scale them to the traced size.
  const tracer = new potrace.Potrace({ turdSize: turd * scale * scale, optTolerance: 0.4 * scale, threshold: 128, blackOnWhite: true });
  await new Promise((res, rej) => tracer.loadImage(png, (err) => (err ? rej(err) : res())));
  const tag = tracer.getPathTag('#000');
  const d = tag.match(/ d="([^"]*)"/)[1];
  let k = 0;
  const mapped = d.replace(/-?\d+(?:\.\d+)?/g, (n) => {
    const v = Number(n) / scale + (k++ % 2 === 0 ? x0 : y0);
    return String(round(v, 2));
  });
  // Close every subpath explicitly.
  return mapped.replace(/\s*M/g, (m, i) => (i === 0 ? 'M' : 'Z M')).trim() + ' Z';
}

const P = {};
for (const [name, mask] of Object.entries(faces)) P[name] = await trace(coverage(mask, name.startsWith('teal')));
// The fold steps are drawn by hand (scripts/lib/logo-folds.mjs) and clipped to their faces.
P['teal-fold-top'] = FOLDS.tealTop;
P['teal-fold-tail'] = FOLDS.tealTail;
P['silver-fold'] = FOLDS.silver;

// Wordmark: silver to the right of the mark, above the tagline. Tagline: below it.
const wordField = new Float32Array(N);
const tagField = new Float32Array(N);
for (let i = 0; i < N; i++) {
  if (isTeal[i] || alpha[i] < 0.02) continue;
  const x = i % W, y = (i / W) | 0;
  if (y >= 606 && x >= 940) tagField[i] = alpha[i];
  else if (x >= 680 && (x >= 720 || y >= 400)) wordField[i] = alpha[i];
}
P.wordmark = await trace(wordField, { sigma: 2 });
P.tagline = await setTagline(tagField);

/**
 * The tagline is too thin to trace (about 2 px strokes: the counters fill
 * in). It is a light geometric sans, so each word is set in Urbanist Light,
 * turned into outlines by satori, and placed where that word starts in the
 * original. One letter spacing and one scale are chosen so every word's
 * width and the line's height match the original.
 */
async function setTagline(field) {
  // Words in the original: runs of columns with ink, split at the two widest gaps.
  const [bx0, by0, bx1, by1] = boxOf(field);
  const cols = [];
  for (let x = bx0; x < bx1; x++) {
    let ink = 0;
    for (let y = by0; y < by1; y++) ink += field[y * W + x];
    cols.push(ink > 0.3);
  }
  const runs = [];
  let startX = null;
  cols.forEach((on, i) => {
    if (on && startX === null) startX = i;
    if (!on && startX !== null) (runs.push([bx0 + startX, bx0 + i]), (startX = null));
  });
  if (startX !== null) runs.push([bx0 + startX, bx1]);
  const gaps = runs.slice(1).map((r, i) => ({ i, size: r[0] - runs[i][1] })).sort((a, b) => b.size - a.size).slice(0, 2).map((g) => g.i).sort((a, b) => a - b);
  const words = [
    [runs[0][0], runs[gaps[0]][1]],
    [runs[gaps[0] + 1][0], runs[gaps[1]][1]],
    [runs[gaps[1] + 1][0], runs[runs.length - 1][1]],
  ];
  let top = H, bottom = 0;
  for (let i = 0; i < N; i++) if (field[i] > 0.3) { const y = (i / W) | 0; if (y < top) top = y; if (y > bottom) bottom = y + 1; }
  const target = { h: bottom - top, y: top };

  const font = await readFile('node_modules/@fontsource/urbanist/files/urbanist-latin-300-normal.woff');
  const render = async (text, em) => {
    const svgText = await satori(
      { type: 'div', props: { style: { display: 'flex', fontFamily: 'U', fontSize: 100, letterSpacing: `${em}em`, color: '#000' }, children: text } },
      { width: 1600, height: 160, fonts: [{ name: 'U', data: font, weight: 300, style: 'normal' }] },
    );
    const ds = [...svgText.matchAll(/<path[^>]* d="([^"]+)"/g)].map((m) => m[1]);
    const nums = ds.join(' ').match(/-?\d+(?:\.\d+)?/g).map(Number);
    const xs = nums.filter((_, i) => i % 2 === 0), ys = nums.filter((_, i) => i % 2 === 1);
    return { ds, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  };
  const texts = ['Built', 'around', 'reality'];
  let best = null;
  for (let em = 0.2; em <= 0.7; em += 0.01) {
    const set = await Promise.all(texts.map((t) => render(t, em)));
    const y0 = Math.min(...set.map((s) => s.y0)), y1 = Math.max(...set.map((s) => s.y1));
    const k = target.h / (y1 - y0);
    const err = set.reduce((sum, s, i) => sum + ((s.x1 - s.x0) * k - (words[i][1] - words[i][0])) ** 2, 0);
    if (!best || err < best.err) best = { err, em, set, k, y0 };
  }
  const { set, k, y0 } = best;
  const d = set
    .map((s, w) =>
      s.ds
        .map((path) => {
          let i = 0;
          return path.replace(/-?\d+(?:\.\d+)?/g, (n) => String(round(i++ % 2 === 0 ? words[w][0] + (Number(n) - s.x0) * k : target.y + (Number(n) - y0) * k)));
        })
        .join(' '),
    )
    .join(' ');
  console.log(`tagline: Urbanist 300, letter-spacing ${best.em.toFixed(2)}em, size ${(100 * k).toFixed(1)} px, width error ${Math.sqrt(best.err / 3).toFixed(2)} px per word`);
  return d;
}

/* ── Geometry ─────────────────────────────────────────────────────────── */

const e = (x) => ({ cx: round(x.cx), cy: round(x.cy), a: round(x.a), b: round(x.b), theta: round(x.theta, 5) });
const ring = { centre: e(g.ring), outer: e(g.ring.outer), inner: e(g.ring.inner) };
const sphere = { cx: round(g.ringSphere.snapped.cx), cy: round(g.ringSphere.snapped.cy), r: round(g.ringSphere.r), t: round(g.ringSphere.snapped.t, 5) };
const iDot = { cx: round(g.iDot.cx), cy: round(g.iDot.cy), r: round(g.iDot.r) };
P.ring = `${ellipsePath(g.ring.outer)} ${ellipsePath(g.ring.inner)}`;

// The front half of the ring: below the centre line's major axis, as a clip polygon.
const halfPlane = (() => {
  const c = Math.cos(g.ring.theta), s = Math.sin(g.ring.theta);
  const pt = (u, v) => [g.ring.cx + u * c - v * s, g.ring.cy + u * s + v * c].map((n) => round(n));
  const big = 900;
  return `M${pt(-big, 0)}L${pt(big, 0)}L${pt(big, big)}L${pt(-big, big)}Z`.replace(/,/g, ' ');
})();

// Boxes: the mark (S, ring, sphere) and the full lockup.
const markBox = (() => {
  const o = g.ring.outer;
  // Extent of the rotated outer ellipse.
  const ex = Math.sqrt((o.a * Math.cos(o.theta)) ** 2 + (o.b * Math.sin(o.theta)) ** 2);
  const ey = Math.sqrt((o.a * Math.sin(o.theta)) ** 2 + (o.b * Math.cos(o.theta)) ** 2);
  const xs = [o.cx - ex, o.cx + ex, sphere.cx + sphere.r, ...g.parts.tealFaces.flatMap((p) => [p.box[0], p.box[2] + 1]), g.parts.silverTop.box[2] + 1];
  const ys = [o.cy - ey, o.cy + ey, ...g.parts.tealFaces.flatMap((p) => [p.box[1], p.box[3] + 1]), g.parts.silverTop.box[1]];
  const x0 = Math.floor(Math.min(...xs)) - 1, y0 = Math.floor(Math.min(...ys)) - 1;
  return [x0, y0, Math.ceil(Math.max(...xs)) + 1 - x0, Math.ceil(Math.max(...ys)) + 1 - y0];
})();
const boxFrom = (field) => {
  const [x0, y0, x1, y1] = boxOf(field);
  return [x0 + 7, y0 + 7, x1 - x0 - 14, y1 - y0 - 14];
};
const wordBox = boxFrom(wordField);
const tagBox = boxFrom(tagField);
const union = (...bs) => {
  const x0 = Math.min(...bs.map((b) => b[0])), y0 = Math.min(...bs.map((b) => b[1]));
  const x1 = Math.max(...bs.map((b) => b[0] + b[2])), y1 = Math.max(...bs.map((b) => b[1] + b[3]));
  return [x0, y0, x1 - x0, y1 - y0];
};
const lockBox = union(markBox, wordBox, [iDot.cx - iDot.r, iDot.cy - iDot.r, iDot.r * 2, iDot.r * 2]);
const lockTagBox = union(lockBox, tagBox);
// The gap cut into the S where the ring passes in front, in logo pixels.
const GAP = 4;

/* ── SVG assembly ─────────────────────────────────────────────────────── */

/**
 * The mark's markup in a palette. `mono` draws one colour, with a hairline
 * gap between teal and silver faces so the S keeps its folds.
 */
function markBody(p, id, mono = false) {
  const gapStroke = GAP * 2;
  return `<defs>
<clipPath id="${id}-front"><path d="${halfPlane}"/></clipPath>
<clipPath id="${id}-teal-top"><path d="${P['teal-top']}"/></clipPath>
<clipPath id="${id}-teal-tail"><path d="${P['teal-tail']}"/></clipPath>
<clipPath id="${id}-silver"><path d="${P['silver-bowl']}"/></clipPath>
<mask id="${id}-gap" maskUnits="userSpaceOnUse" x="${markBox[0] - 10}" y="${markBox[1] - 10}" width="${markBox[2] + 20}" height="${markBox[3] + 20}">
<rect x="${markBox[0] - 10}" y="${markBox[1] - 10}" width="${markBox[2] + 20}" height="${markBox[3] + 20}" fill="#fff"/>
<path d="${P.ring}" fill="#000" fill-rule="evenodd" stroke="#000" stroke-width="${gapStroke}" clip-path="url(#${id}-front)"/>
${mono ? `<path d="${P['teal-top']} ${P['teal-tail']}" fill="none" stroke="#000" stroke-width="3"/>` : ''}
</mask>
</defs>
<path class="ring-back" d="${P.ring}" fill="${p.ring}" fill-rule="evenodd"/>
<g mask="url(#${id}-gap)">
<path id="silver-top" fill-rule="evenodd" d="${P['silver-top']}" fill="${p.silver}" stroke="${p.silver}" stroke-width="${mono ? 0 : 1.2}" stroke-linejoin="round"/>
<path id="silver-bowl" fill-rule="evenodd" d="${P['silver-bowl']}" fill="${p.silver}" stroke="${p.silver}" stroke-width="${mono ? 0 : 1.2}" stroke-linejoin="round"/>
${mono ? '' : `<path id="silver-fold" d="${P['silver-fold']}" fill="${p.silverFold}" clip-path="url(#${id}-silver)"/>`}
<path id="teal-top" fill-rule="evenodd" d="${P['teal-top']}" fill="${p.teal}"/>
<path id="teal-tail" fill-rule="evenodd" d="${P['teal-tail']}" fill="${p.teal}"/>
${mono ? '' : `<path id="teal-fold-top" d="${P['teal-fold-top']}" fill="${p.tealFold}" clip-path="url(#${id}-teal-top)"/>
<path id="teal-fold-tail" d="${P['teal-fold-tail']}" fill="${p.tealFold}" clip-path="url(#${id}-teal-tail)"/>`}
</g>
<path class="ring-front" d="${P.ring}" fill="${p.ring}" fill-rule="evenodd" clip-path="url(#${id}-front)"/>
<circle id="sphere" cx="${sphere.cx}" cy="${sphere.cy}" r="${sphere.r}" fill="${p.sphere}"/>`;
}

const wordBody = (fill, dot) => `<path id="wordmark" fill-rule="evenodd" d="${P.wordmark}" fill="${fill}"/>
<circle id="i-dot" cx="${iDot.cx}" cy="${iDot.cy}" r="${iDot.r}" fill="${dot}"/>`;
const tagBody = (fill) => `<path id="tagline" d="${P.tagline}" fill="${fill}"/>`;

const chromeDef = (id, box) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" y1="${box[1]}" x2="0" y2="${box[1] + box[3]}">
<stop offset="0.08" stop-color="${C.white}"/><stop offset="0.58" stop-color="${C.silver}"/><stop offset="0.96" stop-color="${C.chromeLow}"/></linearGradient>`;

const svg = (box, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.map((n) => round(n)).join(' ')}" role="img"><title>${title}</title>${body}</svg>`;

const palettes = {
  flat: { ring: C.silver, silver: C.silver, silverFold: C.silverFold, teal: C.teal, tealFold: C.tealFold, sphere: C.teal },
  dark: { ring: 'url(#chrome-mark)', silver: 'url(#chrome-mark)', silverFold: C.silverFold, teal: C.teal, tealFold: C.tealFold, sphere: C.teal },
  paper: { ring: C.inkFold, silver: C.inkFold, silverFold: C.ink, teal: C.teal, tealFold: C.tealFold, sphere: C.teal },
  white: { ring: C.white, silver: C.white, teal: C.white, sphere: C.white },
  black: { ring: C.black, silver: C.black, teal: C.black, sphere: C.black },
};

const files = {
  'brand/mark.svg': svg(markBox, markBody(palettes.flat, 'm'), 'Synovika'),
  'brand/wordmark.svg': svg(union(wordBox, [iDot.cx - iDot.r, iDot.cy - iDot.r, iDot.r * 2, iDot.r * 2]), wordBody(C.silver, C.teal), 'Synovika'),
  'brand/tagline.svg': svg(tagBox, tagBody(C.silver), 'Built around reality'),
};
for (const tagline of [false, true]) {
  const box = tagline ? lockTagBox : lockBox;
  const suffix = tagline ? '-tagline' : '';
  const title = tagline ? 'Synovika: Built around reality' : 'Synovika';
  files[`brand/logo-dark${suffix}.svg`] = svg(
    box,
    `<defs>${chromeDef('chrome-mark', markBox)}${chromeDef('chrome-word', wordBox)}</defs>${markBody(palettes.dark, 'd')}${wordBody('url(#chrome-word)', C.teal)}${tagline ? tagBody(C.silver) : ''}`,
    title,
  );
  files[`brand/logo-paper${suffix}.svg`] = svg(box, `${markBody(palettes.paper, 'p')}${wordBody(C.ink, C.teal)}${tagline ? tagBody(C.inkFold) : ''}`, title);
  files[`brand/logo-mono-white${suffix}.svg`] = svg(box, `${markBody(palettes.white, 'w', true)}${wordBody(C.white, C.white)}${tagline ? tagBody(C.white) : ''}`, title);
  files[`brand/logo-mono-black${suffix}.svg`] = svg(box, `${markBody(palettes.black, 'b', true)}${wordBody(C.black, C.black)}${tagline ? tagBody(C.black) : ''}`, title);
}

const keep = (svgText) =>
  optimize(svgText, {
    multipass: true,
    floatPrecision: 2,
    plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false, removeUnknownsAndDefaults: false, convertShapeToPath: false, mergePaths: false } } }],
  }).data;

await mkdir('brand', { recursive: true });
for (const [file, text] of Object.entries(files)) await writeFile(file, keep(text) + '\n');

const geometry = {
  note: 'Logo geometry in pixels of brand/synovika-logo.png (1774 x 887). Written by scripts/trace-logo.mjs.',
  ring,
  ringGap: GAP,
  sphere,
  iDot,
  boxes: { mark: markBox, wordmark: wordBox, tagline: tagBox, lockup: lockBox, lockupTagline: lockTagBox },
};
await writeFile('brand/mark-geometry.json', JSON.stringify(geometry, null, 2) + '\n');
await writeFile(
  'src/lib/brand-paths.json',
  JSON.stringify({ ...geometry, halfPlane, paths: Object.fromEntries(Object.entries(P).map(([k, v]) => [k, v])) }) + '\n',
);
console.log('ring', ring);
console.log('sphere', sphere, 'iDot', iDot);
console.log('boxes', geometry.boxes);
console.log('wrote', Object.keys(files).join(', '), 'brand/mark-geometry.json, src/lib/brand-paths.json');
