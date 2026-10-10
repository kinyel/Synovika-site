/**
 * axe on every page, with full motion and with reduced motion (brief section 14).
 * WCAG 2.0, 2.1 and 2.2, levels A and AA.
 *   npm run serve & npm run qa:a11y
 */
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { BASE, pages, VIEWPORTS, LAUNCH } from './lib/site.mjs';

const browser = await chromium.launch(LAUNCH);
let total = 0;
for (const motion of ['no-preference', 'reduce']) {
  for (const [vp, opts] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ ...opts, reducedMotion: motion });
    for (const path of pages({ lab: true })) {
      const page = await ctx.newPage();
      await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      for (const v of violations) {
        total++;
        console.log(`FAIL ${motion === 'reduce' ? 'reduced' : 'full   '} ${vp.padEnd(7)} ${path}  ${v.id}: ${v.help}`);
        for (const n of v.nodes.slice(0, 3)) console.log(`       ${n.target.join(' ')}`);
      }
      await page.close();
    }
    await ctx.close();
  }
}
await browser.close();
if (total) {
  console.log(`\n${total} violation(s).`);
  process.exit(1);
}
console.log('Accessibility: axe reports no violations, in both motion modes, on desktop and phone.');
