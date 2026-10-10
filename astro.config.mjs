// @ts-check
import { appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig, fontProviders } from 'astro/config';
import { loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { lastModified } from './scripts/lib/lastmod.mjs';

const env = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), '');
const SITE = (env.PUBLIC_SITE_URL || 'https://synovika.com').replace(/\/$/, '');
const SHOW_DRAFTS = env.PUBLIC_SHOW_DRAFTS === 'true';

/** A Latin-subset variable font file from a @fontsource-variable package. */
const variable = (/** @type {string} */ pkg, /** @type {string} */ file) => `./node_modules/@fontsource-variable/${pkg}/files/${file}`;

/** Pages that are not for search engines. */
const unlisted = ['/lab/', '/contact/thanks/', '/404/', '/og/'];

/**
 * On a draft build, every response carries X-Robots-Tag: noindex, on any
 * host (docs/DECISIONS.md, D-039).
 * @returns {import('astro').AstroIntegration}
 */
const draftHeaders = () => ({
  name: 'synovika:draft-headers',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      if (!SHOW_DRAFTS) return;
      await appendFile(fileURLToPath(new URL('_headers', dir)), '\n/*\n  X-Robots-Tag: noindex\n');
    },
  },
});

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'always',
  // Inline every stylesheet: no render-blocking CSS request on a slow first visit.
  build: { format: 'directory', inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) => !unlisted.some((path) => new URL(page).pathname.startsWith(path)),
      serialize: (item) => {
        const date = lastModified(new URL(item.url).pathname);
        return date ? { ...item, lastmod: date } : item;
      },
    }),
    draftHeaders(),
  ],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Urbanist',
      cssVariable: '--font-urbanist',
      fallbacks: ['Arial', 'sans-serif'],
      options: {
        variants: [{ weight: '100 900', style: 'normal', src: [variable('urbanist', 'urbanist-latin-wght-normal.woff2')] }],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Geist Mono',
      cssVariable: '--font-geist-mono',
      fallbacks: ['Menlo', 'Consolas', 'monospace'],
      options: {
        variants: [{ weight: '100 900', style: 'normal', src: [variable('geist-mono', 'geist-mono-latin-wght-normal.woff2')] }],
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
    // Never inline assets as data: URIs, so the CSP can stay strict about img-src.
    build: { assetsInlineLimit: 0 },
  },
});
