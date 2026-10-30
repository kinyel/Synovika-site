/**
 * The site in plain text, for AI assistants and answer engines
 * (https://llmstxt.org): /llms.txt is the map, /llms-full.txt the whole
 * thing. Built from the same content collections as the pages, with the
 * same draft rules, so they can never say more than the site does.
 */
import { getCollection, getEntry } from 'astro:content';
import { SITE } from '../data/site';
import { STATUS } from '../data/status';
import { faqs, featuresOf, home, industries, insights, products, services } from './content';
import { shown } from './drafts';

const url = (path: string) => `${SITE.url}${path}`;

/** The short guide: who we are, then every important page with one line each. */
export async function llmsIndex() {
  const [prod, svc, ind, posts] = await Promise.all([products(), services(), industries(), insights()]);
  return [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description} ${SITE.areaServed.sentence}`,
    '',
    `Synovika (${SITE.name}) is a software company in Nigeria with the tagline "${SITE.tagline}". It does two kinds of work: it makes its own software products, and it builds, fixes, tests and maintains software for other businesses. All of its products are in development; people can join a waitlist for each one.`,
    '',
    `- Website: ${url('/')}`,
    `- Registered name: ${SITE.legalName}, RC ${SITE.rc}, Nigeria`,
    `- Email: ${SITE.email}`,
    `- Phone and WhatsApp: ${SITE.phone.schema}`,
    `- Serves: ${SITE.areaServed.short}`,
    '',
    '## Products',
    '',
    ...prod.map((p) => `- [${p.data.name}](${url(`/products/${p.id}/`)}): ${p.data.summary} Status: ${STATUS[p.data.status].chip.toLowerCase()}.`),
    '',
    '## Services',
    '',
    ...svc.map((s) => `- [${s.data.name}](${url(`/services/${s.id}/`)}): ${s.data.summary}`),
    '',
    '## Industries',
    '',
    ...ind.map((i) => `- [${i.data.name}](${url(`/industries/${i.id}/`)}): ${i.data.note}`),
    '',
    '## Company',
    '',
    `- [About Synovika](${url('/about/')}): who we are, and the promises we keep on every project.`,
    `- [How we work](${url('/how-we-work/')}): the seven stages of every project, and what you get at each.`,
    `- [Pricing](${url('/pricing/')}): how we quote. A written quote in stages, before any work starts.`,
    `- [Contact](${url('/contact/')}): start a project, book a call or join a waitlist.`,
    '',
    '## Answers',
    '',
    `- [Questions and answers](${url('/faq/')}): pricing, timelines, fixing other people's code, support and our products.`,
    `- [Glossary](${url('/glossary/')}): plain definitions of software, fleet tracking, estate and website terms.`,
    ...posts.map((p) => `- [${p.data.title}](${url(`/insights/${p.id}/`)}): ${p.data.description}`),
    '',
    '## Optional',
    '',
    `- [The whole site as plain text](${url('/llms-full.txt')})`,
    `- [Sitemap](${url('/sitemap-index.xml')})`,
    '',
  ].join('\n');
}

/** Everything, in one document: the facts, each product, service and industry, the process, every answer, the glossary and the articles. */
export async function llmsFull() {
  const [prod, svc, ind, posts, questions, terms, h] = await Promise.all([products(), services(), industries(), insights(), faqs(), getCollection('glossary'), home()]);
  const about = await getEntry('pages', 'about');
  const out: string[] = [await llmsIndex(), '---', ''];

  out.push('# About Synovika', '', about?.data.lead ?? '', '', (about?.body ?? '').trim(), '');
  out.push('## The promises we keep', '', ...(h.why?.items ?? []).map((r) => `- **${r.title}.** ${r.body}`), '');

  out.push('# Products', '');
  for (const p of prod) {
    out.push(`## ${p.data.name}`, '', `URL: ${url(`/products/${p.id}/`)}`, `What it is: ${p.data.descriptor}.`, `Status: ${STATUS[p.data.status].chip}. ${STATUS[p.data.status].note}`, '', (p.body ?? '').trim(), '');
    const features = featuresOf(p);
    if (features.length) out.push('What it does:', '', ...features.map((f) => `- **${f.title}.** ${f.body}`), '');
    out.push('Who it is for:', '', ...p.data.audience.map((a) => `- ${a}`), '');
    const pq = p.data.faqs.filter(shown);
    if (pq.length) out.push('Questions:', '', ...pq.flatMap((f) => [`**${f.q}**`, f.a, '']));
  }

  out.push('# Services', '');
  for (const s of svc) {
    out.push(`## ${s.data.name}`, '', `URL: ${url(`/services/${s.id}/`)}`, '', s.data.summary, '', `The problem it solves, in a client's words: ${s.data.problem}`, '');
    out.push('What we do:', '', ...s.data.whatWeDo.map((w) => `- ${w}`), '', 'What you get:', '', ...s.data.deliverables.map((w) => `- ${w}`), '');
    const sq = s.data.faqs.filter(shown);
    if (sq.length) out.push('Questions:', '', ...sq.flatMap((f) => [`**${f.q}**`, f.a, '']));
  }

  out.push('# Industries we build for', '');
  for (const i of ind) {
    out.push(`## ${i.data.name}`, '', `URL: ${url(`/industries/${i.id}/`)}`, '', i.data.lead, '');
    if (i.data.problems.length) out.push('Problems we hear:', '', ...i.data.problems.map((p) => `- ${p}`), '');
    if (i.data.helps.length) out.push('What we would build:', '', ...i.data.helps.map((x) => `- **${x.title}.** ${x.body}`), '');
  }

  const steps = h.journey?.items ?? [];
  out.push('# How we work', '', `URL: ${url('/how-we-work/')}`, '', ...steps.flatMap((s, n) => [`${n + 1}. **${s.title}.** ${s.heading ?? ''} ${s.body}${s.caption ? ` You get: ${s.caption.toLowerCase()}.` : ''}`]), '');

  out.push('# Questions and answers', '', ...questions.flatMap((f) => [`**${f.data.q}**`, f.data.a, '']));

  out.push('# Glossary', '', ...terms.sort((a, b) => a.data.term.localeCompare(b.data.term, 'en-GB')).map((t) => `- **${t.data.term}:** ${t.data.definition}`), '');

  out.push('# Insights', '');
  for (const p of posts) {
    out.push(`## ${p.data.title}`, '', `URL: ${url(`/insights/${p.id}/`)}`, `Published: ${p.data.published.toISOString().slice(0, 10)}`, '');
    if (p.data.tldr) out.push(`Short answer: ${p.data.tldr}`, '');
    // Site-relative links become absolute, so they work outside the site.
    out.push((p.body ?? '').trim().replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${url(path)})`), '');
  }

  out.push('# Contact', '', `- Email: ${SITE.email}`, `- Phone and WhatsApp: ${SITE.phone.schema} (${SITE.whatsapp})`, `- Website: ${url('/contact/')}`, '');
  // Site-relative links in page bodies become absolute too.
  return out.join('\n').replace(/\]\((\/[^)]*)\)/g, (_, path: string) => `](${url(path)})`);
}
