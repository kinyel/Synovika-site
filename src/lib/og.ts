/**
 * Every page's share card (1200 x 630, /og/<page path>.png), drawn at build
 * time with satori and sharp. Base.astro points og:image at it, so every
 * route needs an entry in ogPages().
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { getEntry } from 'astro:content';
import { industries, insights, products, services } from './content';

export interface OgPage {
  /** Page path without slashes at either end; "home" for /. */
  slug: string;
  eyebrow: string;
  title: string;
}

export async function ogPages(): Promise<OgPage[]> {
  const page = async (id: string) => (await getEntry('pages', id))!.data;
  const simple = await Promise.all(
    [
      ['services', 'Services'],
      ['products', 'Products'],
      ['how-we-work', 'How we work'],
      ['about', 'About'],
      ['insights', 'Insights'],
      ['contact', 'Contact'],
      ['industries', 'Industries'],
      ['pricing', 'Pricing'],
      ['faq', 'Questions and answers'],
      ['glossary', 'Glossary'],
      ['privacy', 'Legal'],
      ['cookies', 'Legal'],
      ['terms', 'Legal'],
    ].map(async ([id, eyebrow]) => ({ slug: id!, eyebrow: eyebrow!, title: (await page(id!)).title })),
  );
  return [
    { slug: 'home', eyebrow: 'Software products that solve real problems', title: 'Built around reality. Engineered for impact.' },
    ...simple,
    ...(await industries()).map((i) => ({ slug: `industries/${i.id}`, eyebrow: 'Industries', title: `Software for ${i.data.name.toLowerCase()}` })),
    ...(await services()).map((s) => ({ slug: `services/${s.id}`, eyebrow: 'Service', title: s.data.name })),
    ...(await products()).map((p) => ({ slug: `products/${p.id}`, eyebrow: `Product · ${p.data.descriptor}`, title: p.data.name })),
    ...(await insights()).map((p) => ({ slug: `insights/${p.id}`, eyebrow: 'Insights', title: p.data.title })),
  ];
}

type El = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): El => ({ type, props: { style, children, ...extra } });

const C = { black: '#171717', deep: '#0d0d0d', white: '#ffffff', silver: '#c0c0c0', grey: '#a3a3a3', teal400: '#2dd4bf', line: 'rgba(255,255,255,0.12)' };

let assets: Promise<{ fonts: { name: string; data: Buffer; weight: 400 | 500 | 600; style: 'normal' }[]; logo: string; mark: string }> | undefined;
const load = () =>
  (assets ??= (async () => {
    const file = (p: string) => readFile(join(process.cwd(), p));
    const [regular, semibold, mono, logo, mark] = await Promise.all([
      file('node_modules/@fontsource/urbanist/files/urbanist-latin-400-normal.woff'),
      file('node_modules/@fontsource/urbanist/files/urbanist-latin-600-normal.woff'),
      file('node_modules/@fontsource/geist-mono/files/geist-mono-latin-500-normal.woff'),
      file('src/assets/brand/logo-compact.png'),
      file('src/assets/brand/mark.png'),
    ]);
    return {
      fonts: [
        { name: 'Urbanist', data: regular, weight: 400, style: 'normal' },
        { name: 'Urbanist', data: semibold, weight: 600, style: 'normal' },
        { name: 'Geist Mono', data: mono, weight: 500, style: 'normal' },
      ],
      // Hero's own logo (D-044), as PNG.
      logo: `data:image/png;base64,${logo.toString('base64')}`,
      mark: `data:image/png;base64,${mark.toString('base64')}`,
    };
  })());

export async function renderCard(page: OgPage): Promise<Buffer> {
  const { fonts, logo, mark } = await load();
  const len = page.title.length;
  const size = len > 70 ? 52 : len > 44 ? 62 : 76;
  const tree = h(
    'div',
    {
      position: 'relative',
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 72px 56px',
      backgroundColor: C.black,
      backgroundImage: `radial-gradient(90% 120% at 85% 40%, #1f1f1f 0%, ${C.black} 55%, ${C.deep} 100%)`,
      color: C.white,
      fontFamily: 'Urbanist',
    },
    [
      // The mark, large and cropped on the right: the bookend of every card.
      h('img', { position: 'absolute', right: -90, top: 70, width: 560, height: 529, opacity: 0.95 }, undefined, { src: mark, width: 560, height: 529 }),
      h('img', { width: 199, height: 70 }, undefined, { src: logo, width: 199, height: 70 }),
      h('div', { display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 700 }, [
        h('div', { display: 'flex', fontFamily: 'Geist Mono', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: C.teal400 }, page.eyebrow),
        h('div', { display: 'flex', fontSize: size, fontWeight: 600, lineHeight: 1.02, letterSpacing: -2 }, page.title),
      ]),
      h('div', { display: 'flex', alignItems: 'center', gap: 24, fontSize: 22, color: C.grey }, [
        h('span', { color: C.silver, fontWeight: 600 }, 'synovika.com'),
        h('span', { display: 'flex', width: 1, height: 22, backgroundColor: C.line }),
        h('span', { fontFamily: 'Geist Mono', fontSize: 18, letterSpacing: 6, textTransform: 'uppercase' }, 'Built around reality'),
      ]),
    ],
  );
  const svg = await satori(tree as unknown as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts });
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
