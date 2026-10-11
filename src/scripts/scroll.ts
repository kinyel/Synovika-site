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
  // ── Services: the helix turns and climbs with scroll (after primetrack.rw's spiral, D-057) ──
  const stair = $('[data-stair-section]');
  if (stair && !reduced) whenNear(stair, () => {
    const ring = $('[data-stair-ring]', stair)!;
    const cards = $$('[data-stair-card]', stair).map((el) => ({ el, card: el.firstElementChild as HTMLElement }));
    const links = $$('[data-stair-link]', stair);
    const roll = $('[data-stair-count]', stair);
    const rail = $('[data-stair-rail]', stair);
    const N = cards.length;
    /** Degrees per card round the helix, and how much higher each card sits. */
    const TURN = 60;
    let progress = 0;
    let c = 0;
    let active = -1;
    const st = ScrollTrigger.create({ trigger: stair, start: 'top top', end: 'bottom bottom', onUpdate: (s) => (progress = s.progress) });
    links.forEach((link, k) =>
      link.addEventListener('click', () => {
        const y = st.start + (0.06 + (k / (N - 1)) * 0.88) * (st.end - st.start);
        lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo({ top: y, behavior: 'smooth' });
      }),
    );
    let rise = 150;
    onRefresh(() => (rise = parseFloat(getComputedStyle(stair).getPropertyValue('--rise')) || 150));
    const lastCard = new Map<HTMLElement, string>();
    gsap.ticker.add((time) => {
      const rect = rectOf(stair);
      if (rect.bottom < 0 || rect.top > viewport.height) return;
      // Hold briefly at both ends so the first and last cards get a beat of their own.
      const raw = gsap.utils.clamp(0, 1, (progress - 0.06) / 0.88) * (N - 1);
      // Each card rests at the front for the middle of its stretch, then the helix turns on.
      const seg = Math.min(N - 2, Math.floor(raw));
      const f = gsap.utils.clamp(0, 1, (raw - seg - 0.3) / 0.4);
      const target = seg + f * f * (3 - 2 * f);
      c += (target - c) * 0.1;
      if (Math.abs(target - c) < 1e-4) c = target;
      const sway = Math.sin(time * 0.5) * 2;
      setStyle(ring, 'transform', `translateY(${(c * rise).toFixed(1)}px) rotateY(${(-c * TURN + sway).toFixed(2)}deg)`);
      // The card at the front is lit and sharp; the others dim and blur with their distance round the turn.
      for (const [k, { el, card }] of cards.entries()) {
        const d = Math.abs(k - c);
        const g = gsap.utils.clamp(0, 1, (1.32 - d) / 1.1);
        const op = (0.26 + 0.74 * g).toFixed(3);
        const blur = g > 0.97 ? 'none' : `blur(${(2.2 * Math.pow(1 - g, 1.4)).toFixed(2)}px)`;
        const lit = g.toFixed(2);
        const key = op + blur + lit;
        if (lastCard.get(el) === key) continue;
        lastCard.set(el, key);
        card.style.opacity = op;
        card.style.filter = blur;
        card.style.setProperty('--g', lit);
        el.toggleAttribute('inert', g < 0.5);
      }
      const k = Math.round(c);
      if (k !== active) {
        active = k;
        if (roll) roll.style.transform = `translateY(${-k * 1.25}em)`;
        links.forEach((l, i) => l.setAttribute('aria-current', String(i === k)));
      }
      if (rail) setStyle(rail, 'transform', `scaleX(${(c / (N - 1)).toFixed(3)})`);
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
