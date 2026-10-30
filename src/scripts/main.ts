import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { $introDone, $progress, $reducedMotion, live } from '../lib/store';
import { whenIdle, whenNear } from '../lib/layout';
import { initNav } from './nav';
import { initScroll } from './scroll';
import { initHero } from './hero';
import { initJourney } from './journey';
import { initScenes } from './scenes';

/**
 * Every page's motion (raleston-web's engine): one GSAP ticker drives Lenis
 * and every scene, so nothing runs its own animation loop. With reduced
 * motion there is no smooth scrolling, nothing is split or revealed, and
 * every scene starts in its finished state.
 */
gsap.registerPlugin(ScrollTrigger);
// Mobile address bars resize the viewport while scrolling; re-measuring every
// trigger then would shift pinned content mid-gesture.
ScrollTrigger.config({ ignoreMobileResize: true });

const html = document.documentElement;
const reduced = html.classList.contains('reduced-motion');
$reducedMotion.set(reduced);
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/* ── Smooth scroll (native touch scrolling kept on phones) ─────────────── */
let lenis: Lenis | null = null;
if (!reduced) {
  // A light touch: close to the browser's own scroll, just smoothed (D-060). Phones keep native scrolling.
  lenis = new Lenis({ lerp: 0.1, syncTouch: false, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}
const { closeMenu } = initNav(lenis, reduced);
for (const a of $$<HTMLAnchorElement>('a[href^="#"]:not([data-nav-jump]), a[href^="/#"]:not([data-nav-jump])')) {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href')!;
    if (href === '#' || (href.startsWith('/#') && location.pathname !== '/')) return;
    const target = $(href.replace(/^\//, ''));
    if (!target) return;
    e.preventDefault();
    closeMenu();
    // A negative scroll margin lands past the start of the section (the services' handover).
    const offset = Math.max(0, -parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else target.scrollIntoView();
    // Keyboard focus follows the jump (skip links, "Skip the product tour").
    if (!target.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  });
}

/* ── Scroll velocity, for skew and flow effects ────────────────────────── */
let lastY = scrollY;
gsap.ticker.add(() => {
  const v = scrollY - lastY;
  lastY = scrollY;
  live.velocity = v;
  const target = Math.min(1, Math.abs(v) / 45);
  live.speed += (target - live.speed) * (target > live.speed ? 0.25 : 0.06);
});

/* ── Hero entrance ───────────────────────────────────────────────────── */
// Played in CSS (Hero.astro), so it starts with the first paint and never waits
// for this script, which loads just after that paint (Base.astro).
$introDone.set(true);

/* ── Scroll choreography ───────────────────────────────────────────────── */
// The hero starts at once; everything further down starts as it comes near.
initHero(reduced);
initScroll(reduced, lenis);
whenNear(document.querySelector('[data-journey]'), () => initJourney(reduced));
whenIdle(() => initScenes(reduced));
ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => $progress.set(s.progress), onRefresh: (s) => $progress.set(s.progress) });

/* ── Copy to clipboard (email, phone) ──────────────────────────────────── */
for (const btn of $$<HTMLButtonElement>('button[data-copy]')) {
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy ?? '');
      btn.dataset.copied = '';
      const label = btn.getAttribute('aria-label') ?? '';
      btn.setAttribute('aria-label', 'Copied');
      setTimeout(() => {
        delete btn.dataset.copied;
        btn.setAttribute('aria-label', label);
      }, 1600);
    } catch {
      /* Clipboard blocked: the visible link still works. */
    }
  });
}

/* ── Reveals: content rises in as it enters ────────────────────────────── */
// Only below the first screen, so nothing visible on load waits for script.
if (!reduced) whenIdle(() => {
  const items = $$('[data-reveal]').filter((el) => el.getBoundingClientRect().top > innerHeight);
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, overwrite: true }),
  });
});

/* ── Image parallax: pictures drift a little inside their frames ───────── */
if (!reduced) {
  for (const el of $$('[data-parallax]')) {
    const amount = Number(el.dataset.parallax) || 0.1;
    gsap.fromTo(
      el,
      { yPercent: -amount * 100 },
      { yPercent: amount * 100, ease: 'none', scrollTrigger: { trigger: el.parentElement ?? el, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  }
}

/* ── The closing band's waves: they drift for five seconds once in view, then hold still (WCAG 2.2.2) ── */
if (!reduced) {
  for (const band of $$('.cta-band')) {
    let timer = 0;
    ScrollTrigger.create({
      trigger: band,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        band.classList.add('is-playing');
        timer = window.setTimeout(() => band.classList.remove('is-playing'), 5000);
      },
    });
    addEventListener('pagehide', () => clearTimeout(timer));
  }
}

/* ── Custom cursor (fine pointers, only where the page includes one) ───── */
const dot = $('[data-cursor-dot]');
const ring = $('[data-cursor-ring]');
if (!reduced && matchMedia('(pointer: fine)').matches && dot && ring) {
  html.classList.add('has-cursor');
  gsap.set([dot, ring], { opacity: 0 });
  addEventListener('pointermove', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }), { once: true });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.08 });
  const dy = gsap.quickTo(dot, 'y', { duration: 0.08 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'expo.out' });
  const ry = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'expo.out' });
  addEventListener('pointermove', (e) => (dx(e.clientX), dy(e.clientY), rx(e.clientX), ry(e.clientY)));
  document.addEventListener('pointerover', (e) => {
    const target = e.target as Element;
    const quiet = target.closest('[data-cursor="none"], [data-nav]');
    const over = !quiet && target.closest('a, button, [data-magnetic]');
    gsap.to(ring, { scale: quiet ? 0 : over ? 1.9 : 1, backgroundColor: over ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)', duration: 0.45, ease: 'expo.out' });
    gsap.to(dot, { scale: over || quiet ? 0 : 1, duration: 0.3 });
  });
  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));
  document.addEventListener('mouseenter', () => gsap.to([dot, ring], { opacity: 1, duration: 0.3 }));
}

/* ── Magnetic buttons ──────────────────────────────────────────────────── */
if (!reduced && matchMedia('(pointer: fine)').matches) {
  for (const el of $$('[data-magnetic]')) {
    const x = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    const y = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.35);
      y((e.clientY - (r.top + r.height / 2)) * 0.45);
    });
    el.addEventListener('pointerleave', () => (x(0), y(0)));
  }
}

/* ── Hooks for the QA scripts (scripts/*.mjs) ──────────────────────────── */
declare global {
  interface Window {
    __synovika?: { live: typeof live; lenis: Lenis | null; introDone: () => boolean };
  }
}
window.__synovika = { live, lenis, introDone: () => $introDone.get() };
