/**
 * Every pinned part of the home page fits on every screen, and a phone's
 * address bar sets nothing off. For each size: the hero, each product's
 * note, the services and How we work are checked for words under the nav or
 * off the screen. Then the height is changed back and forth mid-scroll, as
 * the address bar does when the scroll changes direction: that must wipe no
 * canvas and move nothing (D-066).
 *   npm run serve & npm run qa:screens
 */
import { chromium } from 'playwright';
import { BASE, LAUNCH } from './lib/site.mjs';

const SIZES = [
  [320, 568], [360, 640], [375, 667], [390, 844], [412, 915], [430, 932],
  [568, 320], [667, 375], [844, 390],
  [768, 1024], [820, 1180], [1024, 768], [1180, 820],
  [1280, 720], [1366, 768], [1440, 900], [1920, 1080], [2560, 1440],
];
const browser = await chromium.launch(LAUNCH);
const problems = [];

for (const [width, height] of SIZES) {
  const touch = width < 1024 || height > width;
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: touch ? 2 : 1, isMobile: touch, hasTouch: touch });
  page.on('pageerror', (e) => problems.push(`${width}x${height}: ${e}`));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  const g = await page.evaluate(() => {
    const top = (e) => e.getBoundingClientRect().top + scrollY;
    const t = document.querySelector('[data-tour]');
    const j = document.querySelector('[data-journey]');
    const css = (n) => parseFloat(getComputedStyle(t).getPropertyValue(n));
    return { tour: t.offsetHeight - document.querySelector('[data-tour] [data-stage]').offsetHeight, a: css('--len-intro'), b: css('--len-products'), c: css('--len-close'), stair: top(document.querySelector('[data-stair-section]')), jTop: top(j), jLen: j.offsetHeight - innerHeight };
  });
  const to = async (y) => {
    await page.evaluate((v) => {
      const l = window.__synovika?.lenis;
      if (l && matchMedia('(pointer: fine)').matches) l.scrollTo(v, { immediate: true });
      else scrollTo(0, v);
    }, Math.round(y));
    await page.waitForTimeout(1200);
  };
  const fits = async (name, selector) => {
    const r = await page.evaluate((sel) => {
      const nav = document.querySelector('.nav-dock').getBoundingClientRect().bottom;
      const seen = { top: Infinity, bottom: -Infinity };
      for (const root of document.querySelectorAll(sel)) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          // The rolling counter holds its other numbers out of sight, on purpose.
          if (el.closest('.spiral-counter-slot')) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
          const b = el.getBoundingClientRect();
          if (!b.width) continue;
          seen.top = Math.min(seen.top, b.top);
          seen.bottom = Math.max(seen.bottom, b.bottom);
        }
      }
      return { ...seen, nav, height: innerHeight };
    }, selector);
    if (r.top === Infinity) problems.push(`${width}x${height} ${name}: nothing showing`);
    else if (r.top < r.nav - 1) problems.push(`${width}x${height} ${name}: ${Math.round(r.nav - r.top)} px under the nav`);
    else if (r.bottom > r.height + 1) problems.push(`${width}x${height} ${name}: ${Math.round(r.bottom - r.height)} px off the screen`);
  };

  await to(0);
  await fits('hero', '#hero [data-intro]');
  const total = g.a + g.b + g.c;
  for (const i of [0, 1, 2]) {
    await to((g.tour * (g.a + (g.b * (i + 0.28)) / 3)) / total);
    await fits(`product ${i + 1}`, '.tour-note.is-active');
  }
  await to(g.stair + height * 0.3 + 4);
  await fits('services', '.spiral-menu');
  await fits('front card', '[data-stair-card="0"] .spiral-card');
  await to(g.jTop + 1);
  await fits('how we work', '[data-journey] [data-intro]');
  await to(g.jTop + g.jLen * 0.42);
  await fits('how we work note', '[data-journey] [data-note].is-active');
  await page.close();
}

// The address bar.
const ctx = await browser.newContext({ viewport: { width: 390, height: 788 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await ctx.addInitScript(() => {
  window.__wipes = 0;
  const d = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'width');
  Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
    get() {
      return d.get.call(this);
    },
    set(v) {
      window.__wipes++;
      d.set.call(this, v);
    },
  });
});
const page = await ctx.newPage();
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
await page.evaluate(() => scrollTo(0, 2000));
await page.waitForTimeout(500);
const before = await page.evaluate(() => ({ wipes: window.__wipes, y: scrollY }));
for (let i = 0; i < 6; i++) {
  await page.setViewportSize({ width: 390, height: i % 2 ? 788 : 844 });
  await page.waitForTimeout(240);
}
const after = await page.evaluate(() => ({ wipes: window.__wipes, y: scrollY }));
if (after.wipes !== before.wipes) problems.push(`address bar: ${after.wipes - before.wipes} canvas wipes`);
if (after.y !== before.y) problems.push(`address bar: the page moved ${after.y - before.y} px`);

await browser.close();
for (const p of problems) console.log('FAIL ' + p);
console.log(problems.length ? `${problems.length} problem(s).` : `Screens: everything fits on ${SIZES.length} screen sizes, and the address bar sets nothing off.`);
process.exit(problems.length ? 1 : 0);
