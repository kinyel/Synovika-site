/**
 * No horizontal overflow from 320 to 1920 px (brief section 13), on every page.
 *   npm run serve & npm run qa:widths
 */
import { chromium } from 'playwright';
import { BASE, pages, LAUNCH } from './lib/site.mjs';

const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920];
const browser = await chromium.launch(LAUNCH);
const problems = [];
for (const w of WIDTHS) {
  const mobile = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 800 : 900 }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await ctx.newPage();
  for (const path of pages()) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const r = await page.evaluate(() => {
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          if (b.right <= innerWidth + 1 || el.closest('[aria-hidden="true"], [data-overflow-ok], details:not([open]) > :not(summary)')) return false;
          // Anything inside a fixed layer (the header, the phone sheet) scrolls with the viewport, not the page.
          for (let n = el; n; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return false;
          // Clipped on purpose: inside a box that hides its overflow and itself fits (3D stages, drifting bands).
          for (let n = el.parentElement; n && n !== document.body; n = n.parentElement) {
            const o = getComputedStyle(n).overflowX;
            if ((o === 'hidden' || o === 'clip') && n.getBoundingClientRect().right <= innerWidth + 1) return false;
          }
          return true;
        })
        .slice(0, 4)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).split(' ')[0]}`);
      return { doc: document.documentElement.scrollWidth, win: innerWidth, offenders };
    });
    if (r.doc > r.win || r.offenders.length) problems.push(`${w}px ${path}: page ${r.doc}px wide; ${r.offenders.join(', ')}`);
  }
  await ctx.close();
}
await browser.close();
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log(`Widths: no horizontal overflow on ${pages().length} pages at ${WIDTHS.join(', ')} px.`);
