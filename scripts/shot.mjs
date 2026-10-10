/**
 * Screenshots for the look-at-your-own-work loop (brief section 2).
 *   node scripts/shot.mjs <path> [more paths] [--full] [--y=px]
 * Saves qa/shots/<name>-d.png (1440 x 900) and -m.png (390 x 844).
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.URL ?? 'http://localhost:4322';
const args = process.argv.slice(2);
const full = args.includes('--full');
const y = Number(args.find((a) => a.startsWith('--y='))?.slice(4) ?? 0);
const paths = args.filter((a) => !a.startsWith('--'));
const sizes = {
  d: { viewport: { width: 1440, height: 900 } },
  m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
mkdirSync('qa/shots', { recursive: true });
const name = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[/.?=&]/g, '_'));
const browser = await chromium.launch();
for (const path of paths) {
  for (const [key, opts] of Object.entries(sizes)) {
    const page = await browser.newPage({ ...opts, reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference' });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    if (y) await page.evaluate((y) => scrollTo(0, y), y);
    await page.waitForTimeout(600);
    const file = `qa/shots/${name(path)}${y ? `-y${y}` : ''}-${key}.png`;
    await page.screenshot({ path: file, fullPage: full });
    console.log(file, errors.length ? errors : '');
    await page.close();
  }
}
await browser.close();
