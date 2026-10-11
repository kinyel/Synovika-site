/**
 * WCAG AA for every text and background pair the site actually shows
 * (brief section 4.2). For each element with its own text, it reads the
 * computed colour, finds the background behind it (first solid ancestor
 * background, blending translucent layers), allows for opacity, and checks
 * 4.5:1, or 3:1 for large text (24 px, or 18.66 px bold). Chrome text is
 * checked at its darkest stop. Decorative layers (aria-hidden) are skipped.
 *   npm run serve & npm run qa:contrast
 */
import { chromium } from 'playwright';
import { BASE, pages, LAUNCH, VIEWPORTS } from './lib/site.mjs';

const browser = await chromium.launch(LAUNCH);
const failures = [];
let checked = 0;
for (const path of pages()) {
  const page = await browser.newPage(VIEWPORTS.desktop);
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  // The home headline plays its entrance on first paint: measure once it has finished.
  if (path === '/') await page.waitForTimeout(2600);
  const result = await page.evaluate(() => {
    const parse = (c) => {
      const m = c.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
      return { r, g, b, a };
    };
    const over = (top, bottom) => ({ r: top.r * top.a + bottom.r * (1 - top.a), g: top.g * top.a + bottom.g * (1 - top.a), b: top.b * top.a + bottom.b * (1 - top.a), a: 1 });
    const lum = ({ r, g, b }) => [r, g, b].map((v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const ratio = (a, b) => {
      const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
      return (x + 0.05) / (y + 0.05);
    };
    const backgroundOf = (el) => {
      const layers = [];
      for (let n = el; n; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) {
          layers.push(c);
          if (c.a >= 1) break;
        }
      }
      let bg = { r: 255, g: 255, b: 255, a: 1 };
      for (const l of layers.reverse()) bg = over(l, bg);
      return bg;
    };
    const out = { checked: 0, fails: [] };
    for (const el of document.querySelectorAll('body *')) {
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
      if (!own || el.closest('[aria-hidden="true"], .sr-only, script, style, option')) continue;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (cs.visibility === 'hidden' || cs.display === 'none' || rect.width === 0 || rect.height === 0) continue;
      let opacity = 1;
      for (let n = el; n; n = n.parentElement) opacity *= Number(getComputedStyle(n).opacity);
      if (opacity < 0.05) continue;
      const transparentText = cs.webkitTextFillColor && parse(cs.webkitTextFillColor)?.a === 0;
      let fg = transparentText ? parse(getComputedStyle(document.documentElement).getPropertyValue('--chrome-low').trim().replace(/^#(..)(..)(..)$/, (m, r, g, b) => `rgb(${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)})`)) : parse(cs.color);
      if (!fg) continue;
      const bg = backgroundOf(el);
      fg = over({ ...fg, a: fg.a * opacity }, bg);
      const size = parseFloat(cs.fontSize);
      const bold = Number(cs.fontWeight) >= 700;
      const large = size >= 24 || (bold && size >= 18.66);
      const r = ratio(fg, bg);
      out.checked++;
      const min = large ? 3 : 4.5;
      if (r < min) out.fails.push({ text: el.textContent.trim().slice(0, 50), ratio: r.toFixed(2), min, color: cs.color, size });
    }
    return out;
  });
  checked += result.checked;
  for (const f of result.fails) failures.push(`${path}  ${f.ratio}:1 (needs ${f.min}) ${f.size}px "${f.text}" ${f.color}`);
  await page.close();
}
await browser.close();
if (failures.length) {
  console.log(failures.join('\n'));
  console.log(`\n${failures.length} text pair(s) below AA, of ${checked} checked.`);
  process.exit(1);
}
console.log(`Contrast: all ${checked} text elements pass WCAG AA.`);
