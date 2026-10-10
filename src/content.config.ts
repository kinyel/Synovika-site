/**
 * Content collections. All copy lives here, never in components.
 *
 * Anything with `confirmed: false` (features, FAQ answers, industries) shows
 * in dev and draft builds with a "TO CONFIRM" badge and is left out of
 * production. Entries with `draft: true` are left out of production entirely.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const seo = z.object({
  title: z.string().max(70),
  description: z.string().min(70).max(170),
});

const faq = z.object({
  q: z.string(),
  a: z.string(),
  confirmed: z.boolean().default(false),
});

const products = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    /** The product page's H1: the name and what it is. */
    headline: z.string(),
    /** What it is, for the first mention on a page: "fleet tracking platform". */
    descriptor: z.string(),
    /** One line for flyouts and cards. */
    summary: z.string(),
    status: z.enum(['live', 'pilot', 'in-development']).default('in-development'),
    audience: z.array(z.string()),
    order: z.number(),
    /** A real product logo, once there is one (public path). */
    logo: z.string().optional(),
    features: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        body: z.string(),
        confirmed: z.boolean().default(false),
      }),
    ),
    /** The home page story: each station shows only if its feature is confirmed. */
    stations: z
      .array(
        z.object({
          feature: z.string(),
          heading: z.string(),
          body: z.string(),
          readout: z.string().optional(),
        }),
      )
      .default([]),
    faqs: z.array(faq).default([]),
    seo,
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/services' }),
  schema: z.object({
    name: z.string(),
    /** A few words for the navigation flyout. */
    blurb: z.string().max(48),
    summary: z.string(),
    /** The problem, in the client's words. */
    problem: z.string(),
    whatWeDo: z.array(z.string()),
    deliverables: z.array(z.string()),
    visual: z.enum(['stack', 'xray', 'tests', 'spec', 'explode', 'heartbeat']),
    relatedProducts: z.array(z.string()).default([]),
    faqs: z.array(faq).default([]),
    order: z.number(),
    seo,
    updated: z.coerce.date().optional(),
  }),
});

const insights = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/insights' }),
  schema: z.object({
    title: z.string(),
    description: z.string().min(70).max(170),
    author: z.string().default('Hero'),
    published: z.coerce.date(),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
    sources: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/faq' }),
  schema: faq.extend({ order: z.number() }),
});

const industries = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/industries' }),
  schema: z.object({
    name: z.string(),
    note: z.string(),
    confirmed: z.boolean().default(false),
    order: z.number(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
    seo,
    /** Legal pages: show "Draft: to be reviewed by a lawyer" until Hero removes it. */
    legalDraft: z.boolean().default(false),
    updated: z.coerce.date().optional(),
  }),
});

const cta = z.object({ label: z.string(), href: z.string() });

/** Home page copy, one file per section. Fields vary by section, so most are optional. */
const home = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/home' }),
  schema: z.object({
    order: z.number(),
    eyebrow: z.string().optional(),
    heading: z.string(),
    /** The word in the heading set in chrome (at most one). */
    chrome: z.string().optional(),
    /** Words of the heading lit in teal, synov-timer's emphasis (D-045). */
    lit: z.string().optional(),
    /** One plain sentence under the heading. */
    lead: z.string(),
    body: z.string().optional(),
    ctas: z.array(cta).default([]),
    telemetry: z.string().optional(),
    items: z.array(z.object({ title: z.string(), body: z.string() })).default([]),
  }),
});

export const collections = { products, services, insights, faqs, industries, pages, home };
