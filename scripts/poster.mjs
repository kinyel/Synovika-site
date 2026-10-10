/**
 * Pre-rendered posters of the 3D mark (brief section 10), made by the same
 * scene and camera the site uses (D-020), so the swap to the live canvas is
 * invisible. Needs a dev or draft server on URL.
 *
 *   node scripts/poster.mjs            (URL defaults to http://localhost:4331)
 *
 * Writes public/poster/mark-<name>.avif and mark-<name>@2x.avif, plus
 * mark-<name>.json with the sphere's position (for the hand-off to the DOM).
 */
import { chromium } from 'playwright';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.URL ?? 'http://localhost:4331';
/** Poster sizes in CSS pixels. Phase 2 adds the hero's phone and desktop sizes. */
const POSTERS = [{ name: 'lab', w: 800, h: 600 }];

await mkdir('public/poster', { recursive: true });
const browser = await chromium.launch({ args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const p of POSTERS) {
  for (const dpr of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: p.w, height: p.h }, deviceScaleFactor: dpr });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(`${BASE}/lab/poster/?w=${p.w}&h=${p.h}&dpr=${dpr}`);
    await page.waitForFunction(() => window.__poster?.ready, null, { timeout: 60000 });
    if (errors.length) throw new Error(errors.join('\n'));
    const png = await page.locator('canvas').screenshot({ omitBackground: true });
    const avif = await sharp(png).avif({ quality: 58, effort: 7 }).toBuffer();
    const file = `public/poster/mark-${p.name}${dpr === 2 ? '@2x' : ''}.avif`;
    await writeFile(file, avif);
    if (dpr === 1) await writeFile(`public/poster/mark-${p.name}.json`, JSON.stringify({ ...p, sphere: await page.evaluate(() => window.__poster.sphere) }, null, 2) + '\n');
    console.log(`${file}: ${(avif.length / 1024).toFixed(1)} KB`);
    await page.close();
  }
}
await browser.close();
