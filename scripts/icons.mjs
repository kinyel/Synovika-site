/**
 * Favicons, app icons, the web manifest and logo-512.png, from the traced
 * mark (src/lib/brand-paths.json). Run after scripts/trace-logo.mjs.
 *
 *   node scripts/icons.mjs
 *
 * The full mark does not read at 16 px (the ring turns to noise), so the
 * favicon uses a small mark: the S and the sphere, no ring, on a dark tile.
 * Icons from 180 px up use the full mark.
 */
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import sharp from 'sharp';
import { optimize } from 'svgo';

const B = JSON.parse(await readFile('src/lib/brand-paths.json', 'utf8'));
const css = await readFile('src/styles/tokens.css', 'utf8');
const token = (name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1].toLowerCase();
const C = { teal: token('teal-600'), tealFold: token('teal-800'), silver: token('neutral-400'), silverFold: token('neutral-500'), tile: token('neutral-900') };
const P = B.paths;
const sphere = B.sphere;

/** The S without its ring, plus the sphere (made larger so it survives at 16 px). */
const SMALL_BOX = [228, 176, 470, 560];
const small = (tile) => {
  const [x, y, w, h] = SMALL_BOX;
  const side = Math.max(w, h);
  const vx = x - (side - w) / 2, vy = y - (side - h) / 2;
  const pad = side * 0.12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx - pad} ${vy - pad} ${side + 2 * pad} ${side + 2 * pad}">
<defs><clipPath id="tt"><path d="${P['teal-top']}"/></clipPath><clipPath id="tl"><path d="${P['teal-tail']}"/></clipPath><clipPath id="sb"><path d="${P['silver-bowl']}"/></clipPath></defs>
${tile ? `<rect x="${vx - pad}" y="${vy - pad}" width="${side + 2 * pad}" height="${side + 2 * pad}" rx="${(side + 2 * pad) * 0.22}" fill="${C.tile}"/>` : ''}
<path fill-rule="evenodd" d="${P['silver-top']}" fill="${C.silver}"/>
<path fill-rule="evenodd" d="${P['silver-bowl']}" fill="${C.silver}"/>
<path d="${P['silver-fold']}" fill="${C.silverFold}" clip-path="url(#sb)"/>
<path fill-rule="evenodd" d="${P['teal-top']}" fill="${C.teal}"/>
<path fill-rule="evenodd" d="${P['teal-tail']}" fill="${C.teal}"/>
<path d="${P['teal-fold-top']}" fill="${C.tealFold}" clip-path="url(#tt)"/>
<path d="${P['teal-fold-tail']}" fill="${C.tealFold}" clip-path="url(#tl)"/>
<circle cx="${sphere.cx + 4}" cy="${sphere.cy - 6}" r="${sphere.r * 1.7}" fill="${C.teal}" stroke="${C.tile}" stroke-width="10"/>
</svg>`;
};

/** The full mark, centred in a square with `margin` (0..0.5) on each side. */
const full = async (size, margin, background) => {
  const mark = await readFile('brand/mark.svg');
  const inner = Math.round(size * (1 - 2 * margin));
  const png = await sharp(mark, { density: 600 }).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: png, gravity: 'center' }]).png({ compressionLevel: 9 }).toBuffer();
};
const fromSvg = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

const tile = { r: 23, g: 23, b: 23, alpha: 1 };
const out = {
  'favicon-32.png': await fromSvg(small(true), 32),
  'apple-touch-icon.png': await full(180, 0.12, tile),
  'icon-192.png': await full(192, 0.12, tile),
  'icon-512.png': await full(512, 0.12, tile),
  // Maskable: the mark inside the 80% safe zone, on a full-bleed tile.
  'icon-maskable-512.png': await full(512, 0.2, tile),
  // Square logo for schema.org and social profiles.
  'logo-512.png': await full(512, 0.1, tile),
};
await mkdir('public/brand', { recursive: true });
const svgo = (s) => optimize(s, { multipass: true, floatPrecision: 1, plugins: [{ name: 'preset-default', params: { overrides: { cleanupIds: false } } }] }).data;
await writeFile('public/favicon.svg', svgo(small(true)) + '\n');
for (const [name, buf] of Object.entries(out)) await writeFile(`public/${name}`, buf);

// favicon.ico: one 32 x 32 PNG inside an ICO container.
const png = out['favicon-32.png'];
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0);
head.writeUInt16LE(1, 2);
head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6);
head.writeUInt8(32, 7);
head.writeUInt8(0, 8);
head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10);
head.writeUInt16LE(32, 12);
head.writeUInt32LE(png.length, 14);
head.writeUInt32LE(22, 18);
await writeFile('public/favicon.ico', Buffer.concat([head, png]));

// Web copies of the lockups and the small mark (coarser precision: they are shown small).
for (const name of ['mark', 'logo-dark', 'logo-paper', 'logo-dark-tagline', 'logo-paper-tagline', 'logo-mono-white', 'logo-mono-black']) {
  await writeFile(`public/brand/${name}.svg`, svgo(await readFile(`brand/${name}.svg`, 'utf8')) + '\n');
}
await writeFile('brand/mark-small.svg', svgo(small(false)) + '\n');
await copyFile('public/logo-512.png', 'brand/logo-512.png');

await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Synovika Technologies',
      short_name: 'Synovika',
      description: 'Software built around reality. Software engineering and products from Nigeria.',
      start_url: '/',
      display: 'standalone',
      background_color: C.tile,
      theme_color: C.tile,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    null,
    2,
  ) + '\n',
);
console.log('wrote public/favicon.svg, favicon.ico, favicon-32.png, apple-touch-icon.png, icon-192/512, icon-maskable-512, logo-512.png, site.webmanifest, public/brand/*.svg, brand/mark-small.svg');
