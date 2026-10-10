/**
 * Copy rules that a machine can check (brief section 3, D-037):
 *  - no em dashes anywhere (source, built pages, docs), and no spaced en dash used as one
 *  - no banned buzzwords or superlatives in visible copy
 *  - the product name written exactly "Selvion"
 *
 *   node scripts/copy-lint.mjs          (source and docs; plus dist/ if it exists)
 * Exits 1 on any problem.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const files = (dir, exts) => {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...files(full, exts));
    else if (exts.includes(extname(name))) out.push(full);
  }
  return out;
};
const visibleText = (html) =>
  html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;|&#x27;/g, "'")
    .replace(/&amp;/g, '&');

const DASHES = [
  [/\u2014|&mdash;|&#8212;|\\u2014/, 'em dash'],
  [/\s\u2013\s/, 'spaced en dash used as a dash'],
];
const WORDS = [
  [/\bsynerg(y|ies|istic)\b/i, 'buzzword "synergy"'],
  [/\bcutting[- ]edge\b/i, 'buzzword "cutting-edge"'],
  [/\bleverag(e|es|ed|ing)\b/i, 'buzzword "leverage"'],
  [/\bseamless(ly)?\b/i, 'buzzword "seamless"'],
  [/\brevolutionar(y|ise|ize)\b/i, 'buzzword "revolutionary"'],
  [/\bempower(s|ed|ing|ment)?\b/i, 'buzzword "empower"'],
  [/\bbest\b/i, 'superlative "best"'],
  [/\bleading\b/i, 'superlative "leading"'],
  [/\bNo\.\s?1\b|\bnumber one\b/i, 'superlative "No. 1"'],
  [/\bworld[- ]class\b/i, 'superlative "world-class"'],
  [/\bNigeria'?s top\b/i, 'superlative "Nigeria\'s top"'],
  [/Synovika Selvion|Selvion\s?(™|&trade;|\(TM\))|SELVION™/i, 'product name: write "Selvion" exactly'],
];

const problems = [];
const check = (file, text, rules) => {
  text.split('\n').forEach((line, i) => {
    for (const [re, label] of rules) if (re.test(line)) problems.push(`${file}:${i + 1}  ${label}: ${line.trim().slice(0, 110)}`);
  });
};

// Source: dashes everywhere; words only in copy (content, data, page templates).
for (const f of files('src', ['.astro', '.ts', '.md', '.yaml', '.css', '.json'])) {
  const text = readFileSync(f, 'utf8');
  check(f, text, DASHES);
  if (/src\/(content|data)\//.test(f)) check(f, text, WORDS);
}
// This file is skipped: its rules contain the very patterns they look for.
for (const f of [...files('scripts', ['.mjs', '.ts']).filter((f) => !f.endsWith('copy-lint.mjs')), ...files('functions', ['.ts']), ...files('docs', ['.md']).filter((f) => !f.endsWith('BRIEF.md')), 'CLAUDE.md', 'README.md'].filter(existsSync)) {
  check(f, readFileSync(f, 'utf8'), DASHES.slice(0, 1));
}
// Built pages: dashes and words in what a visitor reads, including titles and descriptions.
for (const f of files('dist', ['.html'])) {
  const html = readFileSync(f, 'utf8');
  const meta = [...html.matchAll(/<(?:title)>([^<]*)<|content="([^"]*)"/g)].map((m) => m[1] ?? m[2]).join('\n');
  check(f, visibleText(html) + '\n' + meta, [...DASHES, ...WORDS]);
}
for (const f of files('dist', ['.xml', '.txt', '.webmanifest'])) check(f, readFileSync(f, 'utf8'), DASHES);

if (problems.length) {
  console.log(problems.join('\n'));
  console.log(`\n${problems.length} copy problem(s).`);
  process.exit(1);
}
console.log('Copy rules: clean.');
