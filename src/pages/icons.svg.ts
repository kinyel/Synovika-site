import type { APIRoute } from 'astro';
import { ICONS } from '../components/ui/icons';

/**
 * Every line icon as one cached SVG sprite. Icon.astro points a <use> at it,
 * so a page carries one tiny element per icon instead of every path inline.
 */
export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg">${Object.entries(ICONS)
      .map(([name, body]) => `<symbol id="${name}" viewBox="0 0 24 24">${body}</symbol>`)
      .join('')}</svg>`,
    { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } },
  );
