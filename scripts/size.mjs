/**
 * Size budgets from brief section 13, measured on the built site:
 * initial JavaScript on the home page, the lazy 3D chunk, fonts and font
 * preloads, home HTML with its inlined CSS, home DOM nodes, and the phone
 * poster. All JavaScript and HTML sizes are gzip.
 *   npm run build && npm run qa:size     (DOM nodes need a server: npm run serve)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { BASE } from './lib/site.mjs';

const KB = (n) => n / 1024;
const gz = (buf) => gzipSync(buf, { level: 9 }).length;
const file = (url) => `dist${url.split('?')[0]}`;
const home = readFileSync('dist/index.html', 'utf8');
const rows = [];
const row = (name, value, budget, unit = 'KB', note = '') => rows.push({ name, value, budget, unit, ok: value <= budget, note });

/** A script and every module it imports statically (dynamic import() is lazy, so it's left out). */
const closure = (urls) => {
  const seen = new Set();
  const visit = (url) => {
    if (seen.has(url) || !existsSync(file(url))) return;
    seen.add(url);
    const code = readFileSync(file(url), 'utf8');
    const statics = [...code.matchAll(/(?:^|[;}\n])\s*import\s*(?:[\w*{}\s,$]+from\s*)?["']([^"']+)["']/g)].map((m) => m[1]);
    for (const s of statics) visit(new URL(s, `http://x${url}`).pathname);
  };
  urls.forEach(visit);
  return [...seen];
};
const entry = [...home.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const inline = [...home.matchAll(/<script(?![^>]*src=)(?![^>]*type="application\/ld\+json")(?![^>]*type="speculationrules")[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n');
const homeJs = closure(entry);
const homeJsBytes = homeJs.reduce((s, u) => s + gz(readFileSync(file(u))), 0) + gz(Buffer.from(inline));
row('Initial JavaScript, home (gzip)', KB(homeJsBytes), 65, 'KB', `${homeJs.length} file(s) + inline`);

// The 3D chunk: the module with three.js's renderer, plus what it imports.
const astro = readdirSync('dist/_astro').filter((f) => f.endsWith('.js'));
const three = astro.filter((f) => readFileSync(`dist/_astro/${f}`, 'utf8').includes('WebGLRenderer')).map((f) => `/_astro/${f}`);
if (three.length) {
  const set = closure(three).filter((u) => !homeJs.includes(u));
  row('3D chunk, lazy (gzip)', KB(set.reduce((s, u) => s + gz(readFileSync(file(u))), 0)), 200);
}

// Fonts: every font file the home page can load, and how many are preloaded.
const fontUrls = [...new Set([...home.matchAll(/url\(["']?([^"')]+\.woff2)["']?\)/g)].map((m) => m[1]))];
row('Fonts (woff2, total)', KB(fontUrls.reduce((s, u) => s + (existsSync(file(u)) ? statSync(file(u)).size : 0), 0)), 80, 'KB', `${fontUrls.length} file(s)`);
row('Font preloads', (home.match(/<link[^>]+rel="preload"[^>]+as="font"/g) ?? []).length, 2, 'files');
row('Home HTML with inlined CSS (gzip)', KB(gz(Buffer.from(home))), 60);

// Phone poster(s).
const posters = existsSync('dist/poster') ? readdirSync('dist/poster').filter((f) => /phone.*\.avif$/.test(f)) : [];
for (const p of posters) row(`Poster ${p}`, KB(statSync(`dist/poster/${p}`).size), 60);

// DOM nodes, if a server is running.
try {
  const { chromium } = await import('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 15000 });
  row('DOM nodes, home', await page.evaluate(() => document.getElementsByTagName('*').length), 1500, 'nodes');
  await browser.close();
} catch {
  rows.push({ name: 'DOM nodes, home', value: NaN, budget: 1500, unit: 'nodes', ok: true, note: 'skipped: no server on ' + BASE });
}

for (const r of rows) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name.padEnd(36)} ${Number.isNaN(r.value) ? '   n/a' : r.value.toFixed(r.unit === 'KB' ? 1 : 0).padStart(6)} / ${String(r.budget).padStart(4)} ${r.unit}  ${r.note}`);
process.exit(rows.every((r) => r.ok) ? 0 : 1);
