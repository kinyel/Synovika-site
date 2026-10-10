/**
 * The sitemap's <lastmod> for a page, read from the `updated` (or else
 * `published`) date in the content file behind it. Pages with no dated
 * content file get no <lastmod> rather than a made-up one.
 */
import { existsSync, readFileSync } from 'node:fs';

/** Content folders whose files map one-to-one onto a URL prefix. */
const ROUTES = [
  ['/services/', 'src/content/services/'],
  ['/products/', 'src/content/products/'],
  ['/insights/', 'src/content/insights/'],
  ['/', 'src/content/pages/'],
];

/** @param {string} pathname e.g. "/services/testing-and-qa/" */
export function lastModified(pathname) {
  const slug = pathname.replace(/^\/|\/$/g, '');
  for (const [prefix, dir] of ROUTES) {
    if (!pathname.startsWith(prefix)) continue;
    const name = slug.slice(prefix.length - 1);
    if (!name || name.includes('/')) continue;
    const file = `${dir}${name}.md`;
    if (!existsSync(file)) continue;
    const head = readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '';
    const date = head.match(/^updated:\s*['"]?([\d-]+)/m)?.[1] ?? head.match(/^published:\s*['"]?([\d-]+)/m)?.[1];
    if (date) return new Date(date).toISOString();
  }
  return undefined;
}
