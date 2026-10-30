import { gsap } from 'gsap';
import type Lenis from 'lenis';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { live } from '../lib/store';
import { onRefresh, rectOf, viewport, whenNear } from '../lib/layout';

/**
 * Home page choreography (raleston-web's scroll.ts): turns the services
 * helix, drifts the industries band, and the kinetic words behind "Why Synovika".
 */
export function initScroll(reduced: boolean, lenis: Lenis | null) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const $$ = <T extends HTMLElement = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

  /** Style writes that skip unchanged values, so a still page does no style work. */
  const written = new WeakMap<HTMLElement, Record<string, string>>();
  const setStyle = (el: HTMLElement | null, prop: string, value: string) => {
    if (!el) return;
    const rec = written.get(el) ?? {};
    if (rec[prop] === value) return;
    rec[prop] = value;
    written.set(el, rec);
    if (prop.startsWith('--')) el.style.setProperty(prop, value);
    else (el.style as unknown as Record<string, string>)[prop] = value;
  };
  // ── Services: the helix turns and climbs with scroll (built to feel like primetrack.rw's, D-060) ──
  const stair = $('[data-stair-section]');
  if (stair && !reduced) whenNear(stair, () => {
    const ring = $('[data-stair-ring]', stair)!;
    const cards = $$('[data-stair-card]', stair).map((el) => ({ el, card: el.firstElementChild as HTMLElement }));
    const links = $$('[data-stair-link]', stair);
    const roll = $('[data-stair-count]', stair);
    const rail = $('[data-stair-rail]', stair);
    const N = cards.length;
    /** Degrees per card round the helix. */
    const TURN = 60;
    /**
     * How lit a card is by its distance from the front, in cards (0, 0.25 ... 1.5):
     * primetrack's curve, measured on their site. Opacity runs from 0.26 to 1 with it.
     */
    const LIT = [1, 0.986, 0.797, 0.527, 0.27, 0.068, 0];
    const lit = (d: number) => {
      const x = Math.min(d, 1.5) * 4;
      const i = Math.floor(x);
      return i >= LIT.length - 1 ? 0 : LIT[i]! + (LIT[i + 1]! - LIT[i]!) * (x - i);
    };
    const smooth = (e0: number, e1: number, x: number) => {
      const t = gsap.utils.clamp(0, 1, (x - e0) / (e1 - e0));
      return t * t * (3 - 2 * t);
    };
    let progress = 0;
    let active = -1;
    // The first stretch holds still while the hero's points hand over to the section.
    const hold = () => Math.abs(parseFloat(getComputedStyle(stair).scrollMarginTop)) || 0;
    const st = ScrollTrigger.create({ trigger: stair, start: () => `top+=${hold()} top`, end: 'bottom bottom', onUpdate: (s) => (progress = s.progress) });
    links.forEach((link, k) =>
      link.addEventListener('click', () => {
        const y = st.start + (k / (N - 1)) * (st.end - st.start);
        lenis ? lenis.scrollTo(y, { duration: 1.2 }) : scrollTo({ top: y, behavior: 'smooth' });
      }),
    );
    let rise = 144;
    onRefresh(() => (rise = parseFloat(getComputedStyle(stair).getPropertyValue('--rise')) || 144));
    const lastCard = new Map<HTMLElement, string>();
    gsap.ticker.add(() => {
      const rect = rectOf(stair);
      if (rect.bottom < 0 || rect.top > viewport.height) return;
      // A steady turn, in step with the scroll: one card every fifth of the way, no pauses, no lag.
      const c = progress * (N - 1);
      live.turn = c;
      setStyle(ring, 'transform', `translateY(${(c * rise).toFixed(2)}px) rotateY(${(-c * TURN).toFixed(3)}deg)`);
      for (const [k, { el, card }] of cards.entries()) {
        const d = Math.abs(k - c);
        // Two cards at a time: the one at the front and the next one up. A card that has
        // passed fades as it turns away; the one after next fades in as it comes round.
        const show = k >= c ? 1 - smooth(1, 1.5, d) : 1 - smooth(0.3, 1, d);
        const op = ((0.26 + 0.74 * lit(d)) * show).toFixed(3);
        const angle = Math.min(d * TURN, 90) * (Math.PI / 180);
        const b = 2.2 * (1 - Math.cos(angle));
        const blur = b < 0.05 ? 'none' : `blur(${b.toFixed(2)}px)`;
        const g = lit(d).toFixed(2);
        const key = op + blur + g;
        if (lastCard.get(el) === key) continue;
        lastCard.set(el, key);
        card.style.opacity = op;
        card.style.filter = blur;
        card.style.setProperty('--g', g);
        el.style.visibility = +op < 0.01 ? 'hidden' : '';
        el.toggleAttribute('inert', d > 0.5);
      }
      const k = Math.round(c);
      if (k !== active) {
        active = k;
        if (roll) roll.style.transform = `translateY(${-k * 1.25}em)`;
        links.forEach((l, i) => l.setAttribute('aria-current', String(i === k)));
      }
      if (rail) setStyle(rail, 'transform', `scaleX(${progress.toFixed(4)})`);
    });
  });

  // ── The industries band: two rows drift in opposite directions and lean with speed ──
  const band = $('[data-band]');
  const rows = $$('[data-band-row]');
  if (band && rows.length && !reduced) whenNear(band, () => {
    let p = 0;
    ScrollTrigger.create({ trigger: band, start: 'top bottom', end: 'bottom top', onUpdate: (s) => (p = s.progress) });
    const skews = rows.map((r) => gsap.quickTo(r, 'skewX', { duration: 0.5, ease: 'power3.out' }));
    gsap.ticker.add(() => {
      const r = rectOf(band);
      if (r.bottom < 0 || r.top > viewport.height) return;
      const sk = gsap.utils.clamp(-8, 8, live.velocity * -0.25);
      rows.forEach((row, i) => {
        gsap.set(row, { xPercent: i ? -22 + p * 18 : -4 - p * 18 });
        skews[i]!(i ? -sk : sk);
      });
    });
  });

  // ── Why Synovika: the kinetic words drift with the section and skew with speed ──
  const kineticA = $('[data-kinetic-a]');
  const kineticB = $('[data-kinetic-b]');
  const why = $('#why');
  if (kineticA && kineticB && why && !reduced) whenNear(why, () => {
    let p = 0;
    ScrollTrigger.create({ trigger: why, start: 'top bottom', end: 'bottom top', onUpdate: (s) => (p = s.progress) });
    const skewA = gsap.quickTo(kineticA, 'skewX', { duration: 0.5, ease: 'power3.out' });
    const skewB = gsap.quickTo(kineticB, 'skewX', { duration: 0.5, ease: 'power3.out' });
    gsap.ticker.add(() => {
      const r = rectOf(why);
      if (r.bottom < 0 || r.top > viewport.height) return;
      gsap.set(kineticA, { xPercent: 8 - p * 40 });
      gsap.set(kineticB, { xPercent: -40 + p * 36 });
      const sk = gsap.utils.clamp(-10, 10, live.velocity * -0.3);
      skewA(sk);
      skewB(-sk);
    });
  });
}
