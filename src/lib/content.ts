/**
 * Content queries with the draft rules applied: drafts, unconfirmed
 * features, FAQ answers and industries show only in dev and draft builds.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { SHOW_DRAFTS, shown, visible } from './drafts';
import { STATUS } from '../data/status';

export type Product = CollectionEntry<'products'>;
export type Service = CollectionEntry<'services'>;
type Ordered = { data: { order: number } };
const byOrder = (a: Ordered, b: Ordered) => a.data.order - b.data.order;

export const products = async () => (await getCollection('products', visible)).sort(byOrder);
export const services = async () => (await getCollection('services')).sort(byOrder);
export const insights = async () =>
  (await getCollection('insights', visible)).sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());
export const faqs = async () => (await getCollection('faqs')).filter((f) => shown(f.data)).sort(byOrder);
export const industries = async () => (await getCollection('industries')).filter((i) => shown(i.data)).sort(byOrder);
export const home = async () => Object.fromEntries((await getCollection('home')).map((e) => [e.id.replace(/^\d+-/, ''), e.data]));

/** Features that may appear in this build. */
export const featuresOf = (p: Product) => p.data.features.filter(shown);
/** Story stations whose feature may appear in this build. */
export const stationsOf = (p: Product) =>
  p.data.stations.filter((s) => {
    const f = p.data.features.find((x) => x.id === s.feature);
    return f ? shown(f) : false;
  });
/** True if a station's feature is still unconfirmed (only reachable in drafts). */
export const unconfirmed = (p: Product, featureId: string) => !p.data.features.find((x) => x.id === featureId)?.confirmed;

/** The status button for a product: label, line under it, and where it goes. */
export const ctaOf = (p: Product) => {
  const s = STATUS[p.data.status];
  return { label: s.cta, note: s.note, chip: s.chip, href: `/contact/?${s.intent}=${p.id}` };
};

export { SHOW_DRAFTS };
