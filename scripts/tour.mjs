/**
 * Full-page screenshots of every page at 390 and 1440 px, into qa/shots/tour/
 * (brief section 19). Scene stations are added as the scenes are built.
 *   npm run serve & npm run qa:tour
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { BASE, pages, VIEWPORTS, LAUNCH, slug } from './lib/site.mjs';

mkdirSync('qa/shots/tour', { recursive: true });
const browser = await chromium.launch(LAUNCH);
for (const [name, opts] of Object.entries(VIEWPORTS)) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  for (const path of pages({ lab: true })) {
    await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // Walk down the page so lazy content loads and reveals run.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) await page.evaluate((y) => scrollTo(0, y), y);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.screenshot({ path: `qa/shots/tour/${slug(path)}-${name === 'desktop' ? 1440 : 390}.png`, fullPage: true });
  }
  await ctx.close();
}
await browser.close();
console.log('Tour: screenshots in qa/shots/tour/');
