/**
 * JSON-LD, one @graph per page with stable @ids (brief section 11). Every
 * node describes only what the page shows.
 */
import type { BlogPosting, BreadcrumbList, DefinedTermSet, FAQPage, ItemList, Organization, Service, SoftwareApplication, Thing, WebPage, WebSite, WithContext } from 'schema-dts';
import { SITE } from '../data/site';
import { absolute, ogPath } from './seo';

const ORG = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
type Node = Exclude<Thing, string>;
/** schema-dts types also allow a bare string; every node here is an object. */
type Obj<T> = Exclude<T, string>;

const areaServed: Obj<Organization>['areaServed'] = [{ '@type': 'Country', name: 'Nigeria' }, 'Worldwide'];

/** What the organisation offers: its services and its products, by name and page. */
export interface Catalogue {
  services: { name: string; path: string; description: string }[];
  products: { name: string; path: string; description: string }[];
}

/**
 * The organisation, the node every other one points at. It carries what
 * search engines and AI assistants need to describe Synovika correctly: what
 * it is, where it works, how to reach it, and what it offers.
 */
export function organization(knowsAbout: string[], catalogue?: Catalogue): Obj<Organization> {
  return {
    '@type': 'Organization',
    '@id': ORG,
    name: SITE.name,
    alternateName: SITE.shortName,
    legalName: SITE.name,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: `${SITE.url}/logo-512.png`, width: '512', height: '512', caption: SITE.name },
    image: `${SITE.url}/logo-512.png`,
    slogan: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone.schema,
    address: { '@type': 'PostalAddress', addressCountry: 'NG' },
    areaServed,
    knowsAbout,
    knowsLanguage: 'en',
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'sales', email: SITE.email, telephone: SITE.phone.schema, areaServed: ['NG', 'Worldwide'], availableLanguage: ['English'] },
      { '@type': 'ContactPoint', contactType: 'customer support', email: SITE.email, telephone: SITE.phone.schema, areaServed: ['NG', 'Worldwide'], availableLanguage: ['English'] },
    ],
    ...(catalogue
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Software services and products',
            itemListElement: [
              {
                '@type': 'OfferCatalog',
                name: 'Services',
                itemListElement: catalogue.services.map((s) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s.name, description: s.description, url: absolute(s.path) } })),
              },
              {
                '@type': 'OfferCatalog',
                name: 'Products',
                itemListElement: catalogue.products.map((p) => ({ '@type': 'Offer', itemOffered: { '@type': 'SoftwareApplication', name: p.name, description: p.description, url: absolute(p.path), applicationCategory: 'BusinessApplication' } })),
              },
            ],
          },
        }
      : {}),
    ...(SITE.socials.length ? { sameAs: SITE.socials.map((s) => s.href) } : {}),
  } as Obj<Organization>;
}

export function website(): Obj<WebSite> {
  return { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE.url}/`, name: SITE.shortName, alternateName: SITE.name, description: SITE.description, inLanguage: 'en-NG', publisher: { '@id': ORG } };
}

export function webPage(path: string, name: string, description: string, type: 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' = 'WebPage', withCrumbs = true): Obj<WebPage> {
  const url = absolute(path);
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: 'en-NG',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': ORG },
    primaryImageOfPage: { '@type': 'ImageObject', url: absolute(ogPath(path)), width: '1200', height: '630' },
    // The page's title and its answer-first summary are the parts worth reading aloud.
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['h1', '[data-speakable]'] },
    ...(withCrumbs && path !== '/' ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
  } as Obj<WebPage>;
}

export function breadcrumbs(path: string, crumbs: { name: string; href: string }[]): Obj<BreadcrumbList> {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(path)}#breadcrumb`,
    itemListElement: [{ name: 'Home', href: '/' }, ...crumbs].map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(c.href) })),
  };
}

export function service(path: string, name: string, description: string): Obj<Service> {
  return { '@type': 'Service', '@id': `${absolute(path)}#service`, name, serviceType: name, description, provider: { '@id': ORG }, areaServed, url: absolute(path) };
}

export function softwareApplication(path: string, name: string, description: string, features: string[]): Obj<SoftwareApplication> {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${absolute(path)}#software`,
    name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description,
    publisher: { '@id': ORG },
    url: absolute(path),
    ...(features.length ? { featureList: features } : {}),
  };
}

export function faqPage(path: string, items: { q: string; a: string }[]): Obj<FAQPage> {
  return {
    '@type': 'FAQPage',
    '@id': `${absolute(path)}#faq`,
    mainEntity: items.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
}

export function blogPosting(path: string, p: { title: string; description: string; author: string; published: Date; updated?: Date; tags?: string[]; words?: number }): Obj<BlogPosting> {
  const url = absolute(path);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: p.title,
    description: p.description,
    image: absolute(ogPath(path)),
    author: p.author === SITE.shortName ? { '@id': ORG } : { '@type': 'Person', name: p.author, worksFor: { '@id': ORG } },
    ...(p.tags?.length ? { keywords: p.tags.join(', '), articleSection: p.tags[0] } : {}),
    ...(p.words ? { wordCount: p.words } : {}),
    datePublished: p.published.toISOString(),
    dateModified: (p.updated ?? p.published).toISOString(),
    publisher: { '@id': ORG },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    inLanguage: 'en-NG',
  };
}

export const graph = (nodes: Node[]): WithContext<Thing> & { '@graph': Node[] } => ({ '@context': 'https://schema.org', '@graph': nodes }) as never;

/** A list of things on a page (products, services, industries), in order, each with its own page. */
export function itemList(path: string, key: string, name: string, items: { name: string; path: string }[]): Obj<ItemList> {
  return {
    '@type': 'ItemList',
    '@id': `${absolute(path)}#${key}`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: absolute(it.path) })),
  };
}

/** The glossary: each term with its definition, so answers can quote it exactly. */
export function glossary(path: string, terms: { id: string; term: string; definition: string }[]): Obj<DefinedTermSet> {
  const url = absolute(path);
  return {
    '@type': 'DefinedTermSet',
    '@id': `${url}#terms`,
    name: 'Synovika glossary',
    url,
    hasDefinedTerm: terms.map((t) => ({ '@type': 'DefinedTerm', '@id': `${url}#${t.id}`, name: t.term, description: t.definition, url: `${url}#${t.id}`, inDefinedTermSet: { '@id': `${url}#terms` } })),
  } as Obj<DefinedTermSet>;
}
