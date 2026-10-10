/**
 * Shared by the QA scripts: where the site is served, which pages exist
 * (every index.html in dist/, plus the 404 page), and the browser settings.
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Serve dist/ with `npm run serve` (port 4330) before running a browser script, or set URL. */
export const BASE = (process.env.URL ?? 'http://localhost:4330').replace(/\/$/, '');

/** Every built page path, from dist/. Pass { lab: true } to include /lab/. */
export function pages({ lab = false } = {}) {
  if (!existsSync('dist')) throw new Error('No dist/ folder: run a build first.');
  const out = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (name === 'index.html') out.push('/' + full.slice('dist/'.length, -'index.html'.length));
    }
  };
  walk('dist');
  const list = out.filter((p) => lab || !p.startsWith('/lab/')).sort();
  if (existsSync('dist/404.html')) list.push('/404.html');
  return list;
}

export const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

/** Chromium with the GPU on where there is one, so WebGL renders as it would for a visitor (Metal on macOS; CI on Linux uses software GL). */
export const LAUNCH = { args: process.platform === 'darwin' ? ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] : ['--ignore-gpu-blocklist'] };

/** A short file-safe name for a page path. */
export const slug = (p) => (p === '/' ? 'home' : p.replace(/^\/|\/$/g, '').replace(/[/.?=&]/g, '_'));
