/**
 * Every built page, on desktop and phone: the right status code, no console
 * errors or failed requests, one H1, a canonical URL, a working share image,
 * alt text on images, and a title and description that are present, the
 * right length and unique across the site. Unknown URLs must return 404.
 *   npm run serve & npm run qa:pages
 */
import { chromium } from 'playwright';
import { BASE, pages, VIEWPORTS, LAUNCH } from './lib/site.mjs';

const list = pages();
const browser = await chromium.launch(LAUNCH);
const problems = [];
const titles = new Map();
const descriptions = new Map();
for (const path of list) {
  for (const [name, opts] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('response', (r) => r.status() >= 400 && !r.url().endsWith('/404.html') && errors.push(`${r.status()} ${r.url()}`));
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
    const issues = [...errors];
    if (path !== '/404.html' && res?.status() !== 200) issues.push(`status ${res?.status()}`);
    if (name === 'desktop') {
      const info = await page.evaluate(() => ({
        h1: document.querySelectorAll('h1').length,
        title: document.title,
        description: document.querySelector('meta[name=description]')?.getAttribute('content') ?? '',
        canonical: document.querySelector('link[rel=canonical]')?.getAttribute('href') ?? '',
        og: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
        noAlt: [...document.querySelectorAll('img:not([alt])')].map((i) => i.getAttribute('src')),
      }));
      if (info.h1 !== 1) issues.push(`${info.h1} H1 elements`);
      if (!info.title || info.title.length > 70) issues.push(`title is ${info.title.length} characters`);
      if (info.description.length < 70 || info.description.length > 170) issues.push(`description is ${info.description.length} characters`);
      if (!/^https?:\/\//.test(info.canonical)) issues.push('no absolute canonical URL');
      if (info.noAlt.length) issues.push(`images without alt: ${info.noAlt.join(', ')}`);
      const og = new URL(info.og);
      const r = await page.request.get(BASE + og.pathname);
      if (!r.ok()) issues.push(`share image ${og.pathname}: ${r.status()}`);
      if (path !== '/404.html') {
        titles.set(info.title, [...(titles.get(info.title) ?? []), path]);
        descriptions.set(info.description, [...(descriptions.get(info.description) ?? []), path]);
      }
    }
    console.log(`${issues.length ? 'FAIL' : 'ok  '} ${name.padEnd(7)} ${path}${issues.length ? '\n       ' + issues.join('\n       ') : ''}`);
    if (issues.length) problems.push(path);
    await ctx.close();
  }
}
for (const [t, ps] of titles) if (ps.length > 1) (problems.push(t), console.log(`FAIL duplicate title "${t}": ${ps.join(', ')}`));
for (const [d, ps] of descriptions) if (ps.length > 1) (problems.push(d), console.log(`FAIL duplicate description on ${ps.join(', ')}`));
const missing = await (await browser.newContext()).request.get(`${BASE}/this-page-does-not-exist/`);
if (missing.status() !== 404) (problems.push('404'), console.log(`FAIL unknown URL returned ${missing.status()}, not 404`));
await browser.close();
console.log(problems.length ? `\n${problems.length} problem(s).` : `\nAll ${list.length} pages clean.`);
process.exit(problems.length ? 1 : 0);
