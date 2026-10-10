/**
 * Structured data test (brief section 11), on the built HTML in dist/:
 * every page has one JSON-LD @graph that parses; every node has a @type;
 * @ids are unique; every {"@id"} reference resolves inside the page; and
 * the names it gives match what the page shows (title, H1, breadcrumbs,
 * questions, product and service names).
 *   npm run build && npm run qa:jsonld
 */
import { readFileSync } from 'node:fs';
import { pages } from './lib/site.mjs';

const text = (html) => html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const problems = [];
for (const path of pages()) {
  const file = path === '/404.html' ? 'dist/404.html' : `dist${path}index.html`;
  const html = readFileSync(file, 'utf8');
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const issue = (m) => problems.push(`${path}: ${m}`);
  if (blocks.length !== 1) {
    issue(`${blocks.length} JSON-LD blocks (expected 1)`);
    continue;
  }
  let data;
  try {
    data = JSON.parse(blocks[0][1]);
  } catch (e) {
    issue(`JSON-LD does not parse: ${e.message}`);
    continue;
  }
  if (data['@context'] !== 'https://schema.org' || !Array.isArray(data['@graph'])) issue('needs @context https://schema.org and an @graph array');
  const nodes = data['@graph'] ?? [];
  const ids = new Map();
  for (const n of nodes) {
    if (!n['@type']) issue(`a node has no @type`);
    if (n['@id']) {
      if (ids.has(n['@id'])) issue(`duplicate @id ${n['@id']}`);
      ids.set(n['@id'], n);
    }
  }
  const refs = [];
  const visit = (v) => {
    if (Array.isArray(v)) return v.forEach(visit);
    if (v && typeof v === 'object') {
      const keys = Object.keys(v);
      if (keys.length === 1 && keys[0] === '@id') refs.push(v['@id']);
      else Object.values(v).forEach(visit);
    }
  };
  nodes.forEach((n) => Object.entries(n).forEach(([k, v]) => k !== '@id' && visit(v)));
  for (const r of refs) if (!ids.has(r)) issue(`reference ${r} does not resolve`);
  const visible = text(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  for (const n of nodes) {
    const type = n['@type'];
    const name = n.name ?? n.headline;
    const shows = (s) => visible.includes(s) || title.includes(s);
    if (['Service', 'SoftwareApplication', 'BlogPosting', 'Organization'].includes(type) && name && !shows(name)) issue(`${type} name "${name}" is not on the page`);
    if (/Page$/.test(type) && type !== 'FAQPage' && name && !shows(name)) issue(`${type} name "${name}" is not on the page`);
    if (type === 'FAQPage') for (const q of n.mainEntity ?? []) if (!visible.includes(q.name)) issue(`FAQ question "${q.name}" is not on the page`);
    if (type === 'BreadcrumbList') for (const c of n.itemListElement ?? []) if (!visible.includes(c.name)) issue(`breadcrumb "${c.name}" is not on the page`);
    if (type === 'SoftwareApplication') for (const f of n.featureList ?? []) if (!visible.includes(f)) issue(`feature "${f}" is not on the page`);
  }
}
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log(`Structured data: ${pages().length} pages, every graph valid and matching the page.`);
