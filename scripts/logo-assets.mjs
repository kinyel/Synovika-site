/**
 * Every logo file the site uses, made from Hero's own logo,
 * brand/synovika-logo.png (D-044). Nothing is redrawn: the pixels are only
 * cropped, resized and re-encoded.
 *
 *   node scripts/logo-assets.mjs
 *
 * Writes:
 *   src/assets/brand/logo.png          the full lockup, with the tagline
 *   src/assets/brand/logo-compact.png  the lockup without the tagline line, for small sizes
 *   src/assets/brand/mark.png          the S mark alone (ring and sphere included)
 *   public/favicon.ico (16 and 32), apple-touch-icon.png, icon-192.png,
 *   icon-512.png, icon-maskable-512.png, logo-512.png, site.webmanifest
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const SRC = 'brand/synovika-logo.png';
const css = await readFile('src/styles/tokens.css', 'utf8');
const token = (name) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`, 'i'))[1];
const NIGHT = token('night');

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

/** A copy of the logo's pixels with some of them made transparent. */
const without = (drop) => {
  const out = Buffer.from(data);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (drop(x, y)) out[(y * W + x) * 4 + 3] = 0;
  return out;
};
/** The box around every visible pixel, with a little air. */
const box = (px, pad = 6) => {
  let x0 = W, y0 = H, x1 = 0, y1 = 0;
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++)
      if (px[(y * W + x) * 4 + 3] > 6) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  return { left, top, width: Math.min(W, x1 + pad + 1) - left, height: Math.min(H, y1 + pad + 1) - top };
};
const png = (px, region) => sharp(px, { raw: { width: W, height: H, channels: 4 } }).extract(region).png({ compressionLevel: 9 }).toBuffer();

// The tagline is the only artwork right of x 940 and below y 600 (see brand/trace/mark-geometry.json).
const isTagline = (x, y) => x >= 940 && y >= 600;
// The wordmark starts with the "y" at x 680, below y 400; the ring's tip above it stays.
const isWordmark = (x, y) => x >= 680 && (y >= 400 || x >= 720);

const full = data;
const compact = without(isTagline);
const mark = without((x, y) => isWordmark(x, y) || isTagline(x, y));
const fullBox = box(full);
// Same box for both lockups, so swapping one for the other never shifts anything.
const files = {
  'src/assets/brand/logo.png': await png(full, fullBox),
  'src/assets/brand/logo-compact.png': await png(compact, fullBox),
  'src/assets/brand/mark.png': await png(mark, box(mark)),
};
await mkdir('src/assets/brand', { recursive: true });
for (const [f, buf] of Object.entries(files)) await writeFile(f, buf);

/** The mark, square and centred, at `size` px with `margin` (0 to 0.5) each side, on a background or transparent. */
const icon = async (size, margin, background) => {
  const inner = Math.round(size * (1 - 2 * margin));
  const m = await sharp(files['src/assets/brand/mark.png']).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 }, kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: m, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
};
const hex = (h) => ({ r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16), alpha: 1 });
const night = hex(NIGHT);
const icons = {
  'apple-touch-icon.png': await icon(180, 0.1, night),
  'icon-192.png': await icon(192, 0.1, night),
  'icon-512.png': await icon(512, 0.1, night),
  // Maskable: the mark inside the 80% safe zone.
  'icon-maskable-512.png': await icon(512, 0.2, night),
  // schema.org logo and social profiles: the mark on white, as the logo was made.
  'logo-512.png': await icon(512, 0.08, hex('#ffffff')),
};
for (const [name, buf] of Object.entries(icons)) await writeFile(`public/${name}`, buf);

// favicon.ico with 16 and 32 px images (PNG inside ICO), transparent like the logo.
const sizes = [16, 32];
const pngs = await Promise.all(sizes.map((s) => icon(s, 0.02)));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt8(0, e + 2);
  header.writeUInt8(0, e + 3);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...pngs]));

await writeFile(
  'public/site.webmanifest',
  JSON.stringify(
    {
      name: 'Synovika Technologies',
      short_name: 'Synovika',
      description: 'Software built around reality. Software engineering and products from Nigeria.',
      start_url: '/',
      display: 'standalone',
      background_color: NIGHT,
      theme_color: NIGHT,
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
for (const [f, buf] of Object.entries(files)) {
  const m = await sharp(buf).metadata();
  console.log(`${f}: ${m.width} x ${m.height}`);
}
console.log('wrote public/favicon.ico, apple-touch-icon.png, icon-192/512, icon-maskable-512, logo-512.png, site.webmanifest');
