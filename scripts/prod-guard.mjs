/**
 * The production guard (brief section 3, rule 10). Run on a production build:
 *
 *   npm run build && npm run qa:prod-guard
 *
 * Fails if dist/ contains a TODO(hero) marker, a TO CONFIRM badge, any
 * unconfirmed feature, FAQ answer or industry, a draft article, the /lab
 * pages, or noindex on a page that should be indexed. Then runs the copy rules.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const html = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full);
    else if (/\.(html|xml|txt|json|webmanifest)$/.test(name)) html.push(full);
  }
};
if (!existsSync('dist')) throw new Error('No dist/: run `npm run build` first.');
walk('dist');
const text = (s) => s.replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const problems = [];

// Unconfirmed content, read from the content files.
const frontmatter = (file) => readFileSync(file, 'utf8').split(/^---$/m)[1] ?? readFileSync(file, 'utf8');
const unconfirmed = [];
const dir = (d) => (existsSync(d) ? readdirSync(d).map((f) => join(d, f)) : []);
for (const f of [...dir('src/content/products'), ...dir('src/content/services')]) {
  // Each list item with confirmed: false: take its body or answer as the fingerprint.
  const blocks = frontmatter(f).split(/\n\s*- /);
  for (const b of blocks) {
    if (!/confirmed:\s*false/.test(b)) continue;
    const m = b.match(/(?:body|a):\s*(.+)/);
    if (m) unconfirmed.push({ file: f, text: m[1].trim().replace(/^['"]|['"]$/g, '') });
  }
}
for (const f of [...dir('src/content/faq'), ...dir('src/content/industries')]) {
  const y = readFileSync(f, 'utf8');
  if (!/confirmed:\s*false/.test(y)) continue;
  const m = y.match(/^(?:a|note):\s*(.+)$/m);
  if (m) unconfirmed.push({ file: f, text: m[1].trim() });
}
const drafts = dir('src/content/insights')
  .filter((f) => /draft:\s*true/.test(frontmatter(f)))
  .map((f) => f.split('/').pop().replace(/\.md$/, ''));

for (const f of html) {
  const raw = readFileSync(f, 'utf8');
  const t = text(raw);
  if (raw.includes('TODO(hero)')) problems.push(`${f}: contains TODO(hero)`);
  if (/TO CONFIRM|class="to-confirm"/.test(raw)) problems.push(`${f}: contains a TO CONFIRM badge`);
  for (const u of unconfirmed) if (t.includes(u.text.slice(0, 60))) problems.push(`${f}: shows unconfirmed content from ${u.file}: "${u.text.slice(0, 60)}"`);
  if (f.endsWith('.html') && /name="robots" content="noindex/.test(raw) && !/dist\/(404\.html|contact\/thanks\/)/.test(f)) problems.push(`${f}: is noindex in a production build`);
}
if (existsSync('dist/lab')) problems.push('dist/lab exists: /lab must not be built for production');
for (const d of drafts) if (existsSync(`dist/insights/${d}`)) problems.push(`dist/insights/${d}: a draft article was built`);

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} production problem(s).`);
  process.exit(1);
}
console.log(`Production guard: clean (${html.length} files, ${unconfirmed.length} unconfirmed items and ${drafts.length} drafts checked).`);
execFileSync('node', ['scripts/copy-lint.mjs'], { stdio: 'inherit' });
