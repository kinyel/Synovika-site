/**
 * JSON-LD, one @graph per page with stable @ids (brief section 11). Every
 * node describes only what the page shows.
 */
import type { BlogPosting, BreadcrumbList, FAQPage, Organization, Service, SoftwareApplication, Thing, WebPage, WebSite, WithContext } from 'schema-dts';
import { SITE } from '../data/site';
import { absolute } from './seo';

const ORG = `${SITE.url}/#organization`;
const SITE_ID = `${SITE.url}/#website`;
type Node = Exclude<Thing, string>;
/** schema-dts types also allow a bare string; every node here is an object. */
type Obj<T> = Exclude<T, string>;

const areaServed: Obj<Organization>['areaServed'] = [{ '@type': 'Country', name: 'Nigeria' }, 'Worldwide'];

export function organization(knowsAbout: string[]): Obj<Organization> {
  return {
    '@type': 'Organization',
    '@id': ORG,
    name: SITE.name,
    alternateName: SITE.shortName,
    url: `${SITE.url}/`,
    logo: { '@type': 'ImageObject', url: `${SITE.url}/logo-512.png`, width: '512', height: '512' },
    slogan: SITE.tagline,
    description: SITE.description,
    email: SITE.email,
    telephone: SITE.phone.schema,
    areaServed,
    knowsAbout,
    ...(SITE.socials.length ? { sameAs: SITE.socials.map((s) => s.href) } : {}),
  };
}

export function website(): Obj<WebSite> {
  return { '@type': 'WebSite', '@id': SITE_ID, url: `${SITE.url}/`, name: SITE.shortName, alternateName: SITE.name, inLanguage: 'en-NG', publisher: { '@id': ORG } };
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

export function blogPosting(path: string, p: { title: string; description: string; author: string; published: Date; updated?: Date }): Obj<BlogPosting> {
  const url = absolute(path);
  return {
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: p.title,
    description: p.description,
    author: { '@type': 'Person', name: p.author },
    datePublished: p.published.toISOString(),
    dateModified: (p.updated ?? p.published).toISOString(),
    publisher: { '@id': ORG },
    mainEntityOfPage: { '@id': `${url}#webpage` },
    inLanguage: 'en-NG',
  };
}

export const graph = (nodes: Node[]): WithContext<Thing> & { '@graph': Node[] } => ({ '@context': 'https://schema.org', '@graph': nodes }) as never;
