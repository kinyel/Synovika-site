/**
 * Content parity (brief section 14): a page must carry the same text in a
 * second mode (no JavaScript, or reduced motion) as in its default render.
 * Text that only JavaScript adds for convenience (for example "Copied")
 * can be marked data-parity-ignore.
 */
import { chromium } from 'playwright';
import { BASE, pages, VIEWPORTS, LAUNCH } from './site.mjs';

const textOf = (page) =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll('[data-parity-ignore], script, style, noscript')) el.remove();
    // Open every <details> so collapsed answers count too.
    for (const d of document.querySelectorAll('details')) d.open = true;
    return document.body.innerText
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  });

export async function parity(label, second) {
  const browser = await chromium.launch(LAUNCH);
  let problems = 0;
  for (const path of pages()) {
    const a = await browser.newContext(VIEWPORTS.desktop);
    const b = await browser.newContext({ ...VIEWPORTS.desktop, ...second });
    const pa = await a.newPage();
    const pb = await b.newPage();
    await pa.goto(BASE + path, { waitUntil: 'networkidle' });
    await pb.goto(BASE + path, { waitUntil: 'networkidle' });
    const [ta, tb] = [await textOf(pa), await textOf(pb)];
    const setB = new Set(tb);
    const setA = new Set(ta);
    const missing = ta.filter((l) => !setB.has(l));
    const extra = tb.filter((l) => !setA.has(l));
    if (missing.length || extra.length) {
      problems++;
      console.log(`FAIL ${path}`);
      for (const l of missing.slice(0, 6)) console.log(`       only with the default: ${l.slice(0, 90)}`);
      for (const l of extra.slice(0, 6)) console.log(`       only ${label}: ${l.slice(0, 90)}`);
    }
    await a.close();
    await b.close();
  }
  await browser.close();
  if (problems) {
    console.log(`\n${problems} page(s) differ ${label}.`);
    process.exit(1);
  }
  console.log(`Parity: every page carries the same text ${label}.`);
}
