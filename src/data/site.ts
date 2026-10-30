/**
 * Facts about Synovika used across the site. This is the single source: the
 * header, footer, contact page, structured data and share cards all read it.
 * Values Hero hasn't given yet are TODO(hero) markers, which the production
 * guard refuses to ship.
 */
export const SITE = {
  name: 'Synovika Technologies',
  /** The company's registered name and number, from its CAC certificate of 29 October 2026 (D-065). */
  legalName: 'Synovika Technologies Ltd',
  rc: '9972328',
  incorporated: '2026-10-29',
  shortName: 'Synovika',
  tagline: 'Built around reality',
  url: (import.meta.env.PUBLIC_SITE_URL || 'https://synovika.com').replace(/\/$/, ''),
  description:
    'Synovika is a Nigerian software company. We build, fix, test and maintain software for businesses, and we make products for fleets, estates and growing companies.',
  email: 'hero@synovika.com',
  /** Shown in international form because we serve clients abroad (D-033). */
  phone: { display: '+234\u00a0706\u00a0231\u00a09781', tel: '+2347062319781', schema: '+234-706-231-9781' },
  whatsapp: 'https://wa.me/2347062319781',
  /** D-034: Nigeria first, worldwide too. */
  areaServed: { short: 'Nigeria and worldwide', sentence: 'We work with clients across Nigeria and worldwide.' },
  /** Real profiles only (structured data sameAs and the footer). */
  socials: [] as { label: string; href: string }[],
} as const;
