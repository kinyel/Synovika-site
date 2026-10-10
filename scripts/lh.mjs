/**
 * Lighthouse 13 against the section 13 budgets (D-003): mobile and desktop,
 * three runs each, the median by performance score.
 *   npm run serve & npm run qa:lh              key pages
 *   npm run serve & npm run qa:lh -- --all     every page
 *   FLOOR=1 npm run qa:lh                      CI: only the hard floor for mobile performance (95)
 */
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { BASE, pages } from './lib/site.mjs';

const KEY = ['/', '/services/', '/services/software-development/', '/products/', '/products/selvion/', '/contact/', '/about/'];
const list = process.argv.includes('--all') ? pages().filter((p) => !p.endsWith('.html')) : KEY;
const RUNS = Number(process.env.RUNS ?? 3);
const floor = !!process.env.FLOOR;
const BUDGET = {
  mobile: { performance: floor ? 95 : 97, accessibility: 100, 'best-practices': 100, seo: 100, lcp: 2000, cls: 0.02, tbt: 150 },
  desktop: { performance: 100, accessibility: 100, 'best-practices': 100, seo: 100, lcp: 800, cls: 0.02, tbt: Infinity },
};

const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
let failures = 0;
for (const path of list) {
  for (const form of ['mobile', 'desktop']) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const result = await lighthouse(BASE + path, { port: chrome.port, output: 'json', logLevel: 'error' }, form === 'desktop' ? desktopConfig : undefined);
      const lhr = result.lhr;
      runs.push({
        performance: Math.round(lhr.categories.performance.score * 100),
        accessibility: Math.round(lhr.categories.accessibility.score * 100),
        'best-practices': Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        lcp: lhr.audits['largest-contentful-paint'].numericValue,
        cls: lhr.audits['cumulative-layout-shift'].numericValue,
        tbt: lhr.audits['total-blocking-time'].numericValue,
      });
    }
    runs.sort((a, b) => a.performance - b.performance);
    const m = runs[Math.floor(runs.length / 2)];
    const b = BUDGET[form];
    const misses = Object.entries(b).filter(([k, v]) => (['lcp', 'cls', 'tbt'].includes(k) ? m[k] > v : m[k] < v)).map(([k]) => k);
    if (misses.length) failures++;
    console.log(
      `${misses.length ? 'FAIL' : 'ok  '} ${form.padEnd(7)} ${path.padEnd(34)} perf ${m.performance}  a11y ${m.accessibility}  bp ${m['best-practices']}  seo ${m.seo}  LCP ${(m.lcp / 1000).toFixed(2)}s  CLS ${m.cls.toFixed(3)}  TBT ${Math.round(m.tbt)}ms${misses.length ? '  over: ' + misses.join(', ') : ''}`,
    );
  }
}
await chrome.kill();
process.exit(failures ? 1 : 0);
