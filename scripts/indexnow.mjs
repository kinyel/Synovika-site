/**
 * Tells Bing, Yandex and the other IndexNow search engines that pages have
 * changed, so they recrawl them quickly. Run it after each production deploy:
 *
 *   node scripts/indexnow.mjs            every page in the built sitemap
 *   node scripts/indexnow.mjs /pricing/  just the paths given
 *
 * The key is public by design: IndexNow checks that the same key is served at
 * https://synovika.com/2f4ba19ec35f252408af9a1562ffb69d.txt (public/2f4ba19ec35f252408af9a1562ffb69d.txt) to prove we own the site.
 */
import { readFileSync, readdirSync } from 'node:fs';

const KEY = '2f4ba19ec35f252408af9a1562ffb69d';
const HOST = 'synovika.com';
const SITE = `https://${HOST}`;

const fromSitemap = () =>
  readdirSync('dist')
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .flatMap((f) => [...readFileSync(`dist/${f}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));

const args = process.argv.slice(2);
const urlList = args.length ? args.map((p) => new URL(p, SITE).toString()) : fromSitemap();
if (!urlList.length) {
  console.error('No URLs: build the site first (npm run build), or pass paths.');
  process.exit(1);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${SITE}/${KEY}.txt`, urlList }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URL(s)`);
if (!res.ok && res.status !== 202) process.exit(1);
