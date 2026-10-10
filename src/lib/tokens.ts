import css from '../styles/tokens.css?raw';

/**
 * Colour and motion tokens from src/styles/tokens.css, for code that can't
 * use CSS (the 3D mark, canvas drawing, GSAP). Parsed from the same file
 * Tailwind reads, so the DOM and the 3D can never drift apart.
 */
const colours = new Map([...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})\b/gi)].map((m) => [m[1]!, m[2]!.toLowerCase()]));

export function colour(name: string): string {
  const value = colours.get(name);
  if (!value) throw new Error(`Colour token --color-${name} is missing from src/styles/tokens.css`);
  return value;
}

/** A token as a 0xRRGGBB number, the form THREE.Color takes most cheaply. */
export const hex = (name: string) => Number.parseInt(colour(name).slice(1), 16);

/** Durations in seconds, for GSAP. */
const durations = Object.fromEntries([...css.matchAll(/--dur-(\d):\s*(\d+)ms/g)].map((m) => [Number(m[1]), Number(m[2]) / 1000]));
export const dur = (step: 1 | 2 | 3 | 4) => durations[step] ?? 0.24;
