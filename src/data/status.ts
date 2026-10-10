/**
 * What each product status means on the site (D-032). The button and the
 * line under it come from here, so changing the wording is one edit.
 */
export type Status = 'live' | 'pilot' | 'in-development';

export const STATUS: Record<Status, { chip: string; cta: string; note: string; intent: string }> = {
  live: { chip: 'Live', cta: 'Book a demo', note: 'See it working with your own data.', intent: 'demo' },
  pilot: { chip: 'Pilot', cta: 'Join the pilot', note: 'Use it early and help shape it.', intent: 'pilot' },
  'in-development': {
    chip: 'In development',
    cta: 'Join the waitlist',
    note: 'Be one of the first to use it when it launches.',
    intent: 'waitlist',
  },
};
