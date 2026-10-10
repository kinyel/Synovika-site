import type { APIRoute } from 'astro';
import { SHOW_DRAFTS } from '../lib/drafts';

/** Production allows crawling and names the sitemap; a draft build asks not to be crawled at all. */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap-index.xml', site).toString();
  const body = SHOW_DRAFTS && import.meta.env.PROD ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
