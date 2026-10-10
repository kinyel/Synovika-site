/**
 * Drafts, TODO(hero) markers and unconfirmed features show in development and
 * in draft builds (PUBLIC_SHOW_DRAFTS=true), and never in production.
 */
export const SHOW_DRAFTS = import.meta.env.DEV || import.meta.env.PUBLIC_SHOW_DRAFTS === 'true';

/** True for an entry that may appear in this build. */
export const visible = <T extends { data: { draft?: boolean } }>(entry: T) => SHOW_DRAFTS || !entry.data.draft;

/** True for a feature (or anything with `confirmed`) that may appear in this build. */
export const shown = (item: { confirmed: boolean }) => SHOW_DRAFTS || item.confirmed;

/** True if a value is still a TODO(hero) placeholder. */
export const isTodo = (value: string) => value.startsWith('TODO(hero)');
