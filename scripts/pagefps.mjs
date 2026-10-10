/**
 * Frame times while scrolling the home page (brief section 13): a slow,
 * steady scroll from top to bottom, every frame interval recorded and grouped
 * by the section in the middle of the screen. Local only (not in CI).
 *   npm run serve & npm run qa:fps                  desktop, 1440 x 900
 *   npm run serve & npm run qa:fps -- mobile        390 x 844, CPU 4x slower
 * Budgets: p95 at most 20 ms on desktop, 34 ms on the throttled phone.
 */
import { chromium } from 'playwright';
import { BASE, VIEWPORTS, LAUNCH } from './lib/site.mjs';

const mobile = process.argv.includes('mobile');
const seconds = Number(process.env.SECONDS ?? 20);
const budget = mobile ? 34 : 20;
const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage(mobile ? VIEWPORTS.mobile : VIEWPORTS.desktop);
if (mobile) await (await page.context().newCDPSession(page)).send('Emulation.setCPUThrottlingRate', { rate: 4 });
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);
const result = await page.evaluate(async (secs) => {
  const sections = [...document.querySelectorAll('main > section')];
  const nameOf = (s) => s.id || s.dataset.scene || s.className.split(' ')[0] || 'section';
  const at = () => {
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= innerHeight / 2 && r.bottom > innerHeight / 2) return nameOf(s);
    }
    return 'other';
  };
  const end = document.documentElement.scrollHeight - innerHeight;
  const gaps = {};
  let last = performance.now();
  const start = last;
  await new Promise((done) => {
    const tick = (t) => {
      const k = Math.min(1, (t - start) / (secs * 1000));
      scrollTo(0, k * end);
      (gaps[at()] ??= []).push(t - last);
      last = t;
      if (k < 1) requestAnimationFrame(tick);
      else done();
    };
    requestAnimationFrame(tick);
  });
  return Object.fromEntries(
    Object.entries(gaps).map(([id, g]) => {
      const s = g.slice(1).sort((a, b) => a - b);
      return [id, { frames: s.length, p50: s[Math.floor(s.length * 0.5)] ?? 0, p95: s[Math.floor(s.length * 0.95)] ?? 0 }];
    }),
  );
}, seconds);
await browser.close();
let fail = false;
console.log(mobile ? 'Phone, 390 x 844, CPU 4x slower' : 'Desktop, 1440 x 900');
for (const [id, r] of Object.entries(result)) {
  if (r.frames < 5) continue;
  const ok = r.p95 <= budget;
  fail ||= !ok;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(16)} frames ${String(r.frames).padStart(4)}  p50 ${r.p50.toFixed(1)} ms  p95 ${r.p95.toFixed(1)} ms  (budget ${budget})`);
}
process.exit(fail ? 1 : 0);
