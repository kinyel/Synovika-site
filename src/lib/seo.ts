import { SITE } from '../data/site';

/** Absolute canonical URL for a site path (always with a trailing slash). */
export const absolute = (path: string) => new URL(path.endsWith('/') || path.includes('.') ? path : `${path}/`, `${SITE.url}/`).toString();

/** The share card generated for a page (src/pages/og/[...slug].png.ts). */
export const ogPath = (path: string) => `/og/${path === '/' ? 'home' : path.replace(/^\/|\/$/g, '')}.png`;
