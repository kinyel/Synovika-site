/**
 * The services helix's cards are squares (D-059): at every size, in both
 * motion modes, each card is as tall as it is wide and holds all its words.
 *   npm run serve & npm run qa:squares
 */
import { chromium } from 'playwright';
import { BASE, LAUNCH } from './lib/site.mjs';

const SIZES = [
  [1440, 900],
  [1280, 800],
  [1024, 768],
  [390, 844],
  [360, 740],
];
const browser = await chromium.launch(LAUNCH);
const problems = [];
for (const reduce of [false, true]) {
  for (const [w, h] of SIZES) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const cards = await page.evaluate(() => [...document.querySelectorAll('.spiral-card')].map((c) => ({ w: c.offsetWidth, h: c.offsetHeight, fits: c.scrollHeight <= c.clientHeight + 1 })));
    if (!cards.length) problems.push(`${w}x${h}: no cards found`);
    cards.forEach((c, i) => {
      if (Math.abs(c.w - c.h) > 1 || !c.fits) problems.push(`${w}x${h}${reduce ? ' reduced' : ''}: card ${i + 1} is ${c.w}x${c.h}${c.fits ? '' : ', content overflows'}`);
    });
    await page.close();
  }
}
await browser.close();
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log(`Squares: every services card is square and holds its words, at ${SIZES.length} sizes in both motion modes.`);
