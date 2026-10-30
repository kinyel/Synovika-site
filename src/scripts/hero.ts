import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onRefresh, rectOf, viewport } from '../lib/layout';
import { live } from '../lib/store';
import type { Spine } from '../lib/forms';
import { createSignal, PERSPECTIVE, rotation } from './signal';

/**
 * The hero and product tour: one signal, many forms (markup and styles in
 * src/components/sections/Hero.astro, D-064).
 *
 * One pinned stage, driven by how far the section has scrolled:
 *   intro      the headline moves away; the Earth, with Nigeria lit, breaks
 *              up and gathers into the first product
 *   products   the same points become each product in turn, in its colour;
 *              the root's data-scene names the one in view, and CSS plays
 *              its moment in the glass panel beside it
 *   close      the points wind into a DNA helix, which slims down and glides
 *              into place as the spine of the services staircase, with the
 *              front card coming out of it in points. The real section fades
 *              up, words and all; the DNA stays, as the staircase's spine,
 *              turning with it (a second canvas in that section)
 *
 * The points are drawn by src/scripts/signal.ts. Everything here is uniforms
 * and a few style writes, each skipped when unchanged.
 */
type Spot = { x: number; y: number; s: number; rx: number; ry: number };

/** Each form's colour: Synovika's teal, then the products, then teal (D-063). */
const COLOURS: Record<string, readonly number[]> = {
  brand: [0.17, 0.83, 0.75],
  selvion: [0.98, 0.62, 0.06],
  estate: [0.95, 0.36, 0.45],
  websites: [0.3, 0.56, 1],
};

export function initHero(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-tour]');
  if (!root || reduced) return;
  const one = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const all = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];

  const canvas = one<HTMLCanvasElement>('[data-signal]');
  const intro = one<HTMLElement>('[data-intro]');
  const holos = all<HTMLElement>('[data-holo]');
  const notesBox = one<HTMLElement>('[data-notes]');
  const notes = all<HTMLElement>('[data-note]');
  const steps = all<HTMLElement>('[data-progress-steps] i');
  const label = one<HTMLElement>('[data-globe-label]');
  const backdrop = one<HTMLElement>('[data-stage-light]');
  const stage = one<HTMLElement>('[data-stage]');
  const probe = one<HTMLElement>('[data-probe]');
  // The next section, which the last form hands over to.
  const stair = document.querySelector<HTMLElement>('[data-stair-section]');
  const view = stair?.querySelector<HTMLElement>('[data-stair-view]') ?? null;
  const stairStage = stair?.querySelector<HTMLElement>('[data-stair-stage]') ?? null;
  const dnaCanvas = stair?.querySelector<HTMLCanvasElement>('[data-stair-dna]') ?? null;
  const title = one<HTMLElement>('[data-hero-title]');
  const scenes = (root.dataset.scenes ?? '').split(' ');
  const N = notes.length;
  // Earth, the products, the DNA, the spine.
  const colours = [COLOURS.brand!, ...scenes.map((k) => COLOURS[k] ?? COLOURS.brand!), COLOURS.brand!, COLOURS.brand!];

  const clamp = gsap.utils.clamp(0, 1);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const phone = () => innerWidth < 1024;

  /** Style writes that skip unchanged values. */
  const last = new WeakMap<HTMLElement, Record<string, string>>();
  const set = (el: HTMLElement, prop: string, value: string) => {
    const rec = last.get(el) ?? {};
    if (rec[prop] === value) return;
    rec[prop] = value;
    last.set(el, rec);
    if (prop.startsWith('--')) el.style.setProperty(prop, value);
    else (el.style as unknown as Record<string, string>)[prop] = value;
  };

  const small = phone();
  const POINTS = small ? 18000 : 38000;
  const signal = createSignal(canvas, POINTS, small);
  if (!signal) root.classList.add('no-gl');
  const spine = signal && dnaCanvas ? createSignal(dnaCanvas, POINTS, small) : null;
  let spineCount = 0;

  // ── Where each form sits, measured on load and resize ─────────────────
  let vw = 0;
  let vh = 0;
  let A = 0;
  let B = 0;
  let spots: Spot[] = [];
  const NO_MASK = [1, 0, 0, 1];
  let maskEarth: readonly number[] = NO_MASK;
  let maskNotes: readonly number[] = NO_MASK;
  /** Forms above their words (phones and tablets upright), or beside them. */
  let stacked = false;

  const measure = () => {
    vw = canvas.clientWidth;
    vh = canvas.clientHeight;
    signal?.resize();
    stacked = phone() && innerWidth <= innerHeight * 1.3;
    // The stage fills the large viewport; what has to be seen is placed in the small one, the bar never covers it.
    const sv = Math.min(vh, probe.offsetHeight || vh);
    const Y = (px: number) => vh / 2 - px;
    if (stacked) {
      // A planet rising from the foot of the screen, with Nigeria near its crest.
      const r = Math.max(vw * 0.98, 340);
      // Lower on short screens, so it stays under the words.
      const sink = 0.42 + Math.max(0, 760 - sv) / 620;
      const globe: Spot = { x: 0, y: Y(sv + r * sink), s: r, rx: -0.72, ry: 0 };
      // As big as fits between the panel at the top and the note below: bigger on tablets.
      const s = Math.min(vw * 0.26, Math.max(sv * 0.125, (sv * 0.52 - 170) / 2.3));
      const formY = Y(sv * (sv < 700 ? 0.365 : 0.33));
      spots = [globe, ...scenes.map(() => ({ x: 0, y: formY, s, rx: 0.42, ry: -0.5 }))];
      const w = scenes.indexOf('websites');
      if (w >= 0) spots[w + 1] = { ...spots[w + 1]!, rx: 0.2, ry: -0.5, s: s * 0.96, y: formY - sv * 0.015 };
      spots[N + 1] = { x: 0, y: Y(sv * 0.46), s: s * 1.4, rx: 0.3, ry: 0 };
      // Clear of the note under the form.
      const noteTop = Y(sv * 0.52);
      maskEarth = maskNotes = [0, 1, noteTop - 8, noteTop + 44];
    } else {
      const r = Math.min(vw * 0.29, vh * 0.49);
      const globe: Spot = { x: vw * 0.3, y: -vh * 0.035, s: r, rx: 0.06, ry: 0 };
      const s = Math.min(vw * 0.2, vh * 0.34);
      spots = [globe, ...scenes.map(() => ({ x: vw * 0.2, y: -vh * 0.02, s, rx: 0.42, ry: -0.52 }))];
      // The website's layers read better a little more from the front.
      const w = scenes.indexOf('websites');
      if (w >= 0) spots[w + 1] = { ...spots[w + 1]!, rx: 0.2, ry: -0.58, s: s * 0.92, y: vh * 0.03 };
      spots[N + 1] = { x: vw * 0.1, y: 0, s: s * 1.05, rx: 0.3, ry: 0 };
      // Clear of the headline, then of the notes.
      const range = document.createRange();
      range.selectNodeContents(title);
      const right = range.getBoundingClientRect().right - vw / 2;
      maskEarth = [1, 0, right - 70, right + 20];
      const edge = Math.max(16, Math.min(vw * 0.05, 72)) + Math.min(480, vw * (phone() ? 0.42 : 0.34)) - vw / 2;
      maskNotes = [1, 0, edge - 30, edge + 70];
    }

    measureHandover();

    // The notes: on the left (desktop) or under the form (phones).
    if (stacked) {
      const y = sv * 0.52;
      set(notesBox, '--ov-left', '16px');
      set(notesBox, '--ov-top', `${y.toFixed(1)}px`);
      set(notesBox, '--ov-width', `${(vw - 32).toFixed(1)}px`);
      set(notesBox, '--ov-height', `${(sv - y - 16).toFixed(1)}px`);
    } else {
      const left = Math.max(16, Math.min(vw * 0.05, 72));
      const top = Math.max(sv * 0.14, 72);
      set(notesBox, '--ov-left', `${left.toFixed(1)}px`);
      set(notesBox, '--ov-top', `${top.toFixed(1)}px`);
      set(notesBox, '--ov-width', `${Math.min(480, vw * (phone() ? 0.42 : 0.34)).toFixed(1)}px`);
      set(notesBox, '--ov-height', `${(sv - top - 12).toFixed(1)}px`);
    }

    // Stage lengths from the CSS (all in svh, so the ratios are what count).
    const len = (name: string) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0;
    const a = len('--len-intro');
    const b = len('--len-products');
    const c = len('--len-close');
    const total = a + b + c || 1;
    A = a / total;
    B = (a + b) / total;
  };

  /** The staircase, measured from the page, in the cloud's units. */
  let shape: Spine = { R: 0.76, rise: 0.46, card: 0.84, drop: 0, height: 1.3, radius: 0.15 };
  let shapeKey = '';
  let built = false;
  /** Where the spine sits on its own canvas. */
  let spineAt = { x: 0, y: 0, s: 314 };
  // The forms are built in a worker: the Earth first, then the rest one at a time.
  const worker = signal ? new Worker(new URL('./forms.worker.ts', import.meta.url), { type: 'module' }) : null;
  const build = (id: number) => worker?.postMessage({ id, N: POINTS, shape: id === N + 1 ? shape : undefined });
  const measureHandover = () => {
    if (!stair || !view || !stairStage) {
      spots[N + 2] = spots[N + 1]!;
      return;
    }
    const num = (name: string) => parseFloat(getComputedStyle(stair).getPropertyValue(name)) || 0;
    const v = view.getBoundingClientRect();
    const st = stairStage.getBoundingClientRect();
    const [ox = st.width / 2, oy = st.height / 2] = getComputedStyle(stairStage).perspectiveOrigin.split(' ').map(parseFloat);
    // Points project about the same place the helix does: its perspective origin.
    const cx = st.left - v.left + ox;
    const cy = st.top - v.top + oy;
    const s = (num('--persp') || 1320) / PERSPECTIVE;
    const R = num('--R') / s;
    shape = { R, rise: num('--rise') / s, card: num('--card') / s, drop: (oy - st.height / 2) / s, height: st.height / 2 / s, radius: R * 0.2 };
    spots[N + 2] = { x: cx - vw / 2, y: vh / 2 - cy, s, rx: 0, ry: 0 };
    spineAt = { x: ox - st.width / 2, y: st.height / 2 - oy, s };
    spine?.resize();
    const key = JSON.stringify(shape);
    if (key !== shapeKey) {
      shapeKey = key;
      if (built) build(N + 1);
    }
  };

  // ── State ─────────────────────────────────────────────────────────────
  let p = 0;
  let active = -2;
  let from = 0;
  let to = 0;
  let morph = 0;
  let fade = 1;
  let swarm = 1;
  let closing = 0;
  const state = { arrive: 0 };
  const tiltTo = { x: 0, y: 0 };
  const tiltNow = { x: 0, y: 0 };
  const mouse = { x: 9999, y: 9999 };
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      tiltTo.x = (e.clientX / innerWidth - 0.5) * 2;
      tiltTo.y = (e.clientY / innerHeight - 0.5) * 2;
      mouse.x = e.clientX - vw / 2;
      mouse.y = vh / 2 - e.clientY;
    });
  }

  const setActive = (k: number) => {
    if (k === active) return;
    active = k;
    notes.forEach((n, i) => n.classList.toggle('is-active', i === k));
    holos.forEach((h, i) => h.classList.toggle('is-on', i === k));
    notesBox.classList.toggle('is-on', k >= 0);
    if (k >= 0 && scenes[k]) root.dataset.scene = scenes[k];
    else delete root.dataset.scene;
  };

  const render = () => {
    if (!spots.length) return;
    const tIntro = clamp(p / A);
    const q = clamp((p - A) / (B - A)) * N;
    const c = clamp((p - B) / (1 - B));

    closing = c;
    swarm = 1;

    // Earth → first product; rest on each, then re-form; then the DNA, which glides into place as the spine.
    if (c > 0) {
      from = c < 0.42 ? N : N + 1;
      to = from + 1;
      morph = c < 0.42 ? clamp(c / 0.3) : clamp((c - 0.42) / 0.3);
      swarm = c < 0.42 ? 1 : 0;
      fade = 1 - smooth(clamp((c - 0.86) / 0.14));
    } else if (tIntro < 1) {
      from = 0;
      to = 1;
      morph = clamp((tIntro - 0.2) / 0.8);
      fade = 1;
    } else {
      const k = Math.min(N - 1, Math.floor(q));
      const f = q - k;
      from = k + 1;
      to = k < N - 1 ? k + 2 : k + 1;
      morph = k < N - 1 && f > 0.56 ? (f - 0.56) / 0.44 : 0;
      fade = 1;
    }

    // The handover: this stage's light goes out (its lines stay: the next section has the same ones), and the real section fades up.
    set(backdrop, 'opacity', (1 - smooth(clamp((c - 0.2) / 0.4))).toFixed(3));
    if (view) {
      const arrived = smooth(clamp((c - 0.82) / 0.13));
      set(view, 'opacity', arrived.toFixed(3));
      set(view, 'pointerEvents', arrived > 0.5 ? '' : 'none');
    }

    // Screen one: the headline moves up and away.
    set(intro, 'opacity', clamp(1 - tIntro * 1.9).toFixed(3));
    set(intro, 'transform', `translate3d(0, ${(-tIntro * vh * 0.32).toFixed(1)}px, 0)`);
    set(intro, 'visibility', tIntro >= 0.6 ? 'hidden' : '');
    set(label, 'opacity', clamp(1 - tIntro * 3).toFixed(3));

    // The notes: in once the first product has formed, out as the helix winds up.
    const notesOn = clamp((tIntro - 0.82) / 0.18) * (1 - clamp(c / 0.12));
    set(notesBox, 'opacity', notesOn.toFixed(3));
    // The words change at the middle of a morph, so a name is never beside the wrong shape.
    const k = notesOn > 0.05 ? Math.min(N - 1, Math.floor(q + 0.22)) : -1;
    setActive(k);
    steps.forEach((seg, i) => set(seg, '--f', (c > 0 ? 1 : clamp(q - i)).toFixed(3)));
    draw(performance.now() / 1000);
  };

  const draw = (time: number) => {
    if (!signal || !spots.length || !signal.has(from) || !signal.has(to)) return;
    const a = spots[from]!;
    const b = spots[to]!;
    const t = smooth(clamp(morph));
    const onEarth = from === 0;
    const sway = onEarth ? 0.2 : 0.3;
    // Landing on the staircase, all the drifting stops, so the spine sits exactly where it will stay.
    const calm = from === N + 1 ? 1 - t : 1;
    // The DNA turns with the scroll, and comes to rest with no turn left.
    const twist = -Math.PI * 3 * (1 - clamp(closing / 0.72));
    const ry = lerp(a.ry, b.ry, t) + (Math.sin(time * 0.24) * sway + tiltNow.x * 0.16) * calm + (from === N ? t * twist : from === N + 1 ? twist : 0);
    const rx = lerp(a.rx, b.rx, t) + (Math.sin(time * 0.17) * 0.04 + tiltNow.y * 0.1) * calm;
    const x = lerp(a.x, b.x, t);
    const bob = Math.sin(time * 0.7) * 4 * calm;
    const y = lerp(a.y, b.y, t) + bob;
    const s = lerp(a.s, b.s, t);
    signal.draw({
      from,
      to,
      mix: morph,
      time,
      arrive: state.arrive,
      x,
      y,
      scale: s,
      rx,
      ry,
      // Only the Earth hides its far side.
      depth: onEarth ? 1 - t : 0.28,
      fade,
      colourA: colours[from]!,
      colourB: colours[to]!,
      mouseX: closing > 0.4 ? 9999 : mouse.x,
      mouseY: closing > 0.4 ? 9999 : mouse.y,
      swarm,
      mask: onEarth ? maskEarth.map((v, i) => lerp(v, maskNotes[i]!, t)) : maskNotes,
      maskOn: (onEarth && stacked ? t : 1) * (1 - clamp(closing / 0.2)),
      // A phone that can't keep up draws fewer points. The DNA keeps them all: its order matters.
      count: to <= N ? Math.round(POINTS * quality) : undefined,
    });
    // The label stays on Nigeria, which is the point (0, 0, 1) of the Earth.
    if (onEarth && morph < 0.2) {
      const m = rotation(rx, ry);
      const qz = m[8]!;
      const k = PERSPECTIVE / (PERSPECTIVE - qz);
      const px = vw / 2 + x + m[6]! * k * s;
      const py = vh / 2 - y - m[7]! * k * s - s * 0.12;
      set(label, 'transform', `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`);
    }
  };

  let visible = true;
  let quality = 1;
  let frames = 0;
  let slow = 0;
  const tick = (time: number, delta: number) => {
    if (!visible) return;
    // Drops only: a steady picture matters more than the last few thousand points.
    if (delta > 30) slow++;
    if (++frames === 90) {
      if (slow > 30 && quality > 0.5) quality *= 0.8;
      frames = 0;
      slow = 0;
    }
    tiltNow.x += (tiltTo.x - tiltNow.x) * 0.05;
    tiltNow.y += (tiltTo.y - tiltNow.y) * 0.05;
    draw(time);
  };
  gsap.ticker.add(tick);

  // The DNA stays on as the staircase's spine, locked to its turn: one twist of the DNA is three steps.
  gsap.ticker.add((time: number) => {
    if (!spine || !spineCount || !stair) return;
    const r = rectOf(stair);
    if (r.bottom < 0 || r.top > viewport.height) return;
    spine.draw({
      from: 0,
      to: 0,
      mix: 0,
      time,
      arrive: 1,
      x: spineAt.x,
      y: spineAt.y,
      scale: spineAt.s,
      rx: 0,
      ry: (-live.turn * Math.PI * 2) / 3,
      depth: 0.28,
      fade: 1,
      colourA: COLOURS.brand!,
      colourB: COLOURS.brand!,
      mouseX: 9999,
      mouseY: 9999,
      swarm: 0,
      mask: NO_MASK,
      maskOn: 0,
      count: spineCount,
    });
  });

  // Created last: a page reloaded part-way down fires these at once, so everything they use must exist.
  measure();
  onRefresh(measure);
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: () => `bottom ${stage.offsetHeight}px`,
    onUpdate: (st) => {
      p = st.progress;
      render();
    },
    onToggle: (st) => {
      visible = st.isActive || st.progress === 0;
      root.classList.toggle('is-paused', !visible);
    },
    onRefresh: (st) => {
      p = st.progress;
      active = -2;
      render();
    },
  });
  render();

  if (signal && worker) {
    worker.onmessage = ({ data: m }: MessageEvent<{ id: number; data?: Float32Array; big?: Float32Array; spine?: Float32Array; count?: number }>) => {
      if (m.big && m.spine) {
        signal.setForm(N + 1, m.big);
        signal.setForm(N + 2, m.spine);
        spine?.setForm(0, m.spine);
        spineCount = m.count ?? 0;
        stair?.classList.add('has-dna');
        built = true;
        return;
      }
      signal.setForm(m.id, m.data!);
      if (m.id === 0) {
        // Until the first product is ready, the morph has the Earth to fall back on.
        signal.setForm(1, m.data!);
        render();
        if (scrollY < innerHeight * 0.4) gsap.to(state, { arrive: 1, duration: 2.6, ease: 'expo.out', delay: 0.05 });
        else state.arrive = 1;
      }
      build(m.id + 1);
    };
    worker.onerror = () => root.classList.add('no-gl');
    build(0);
  }
  root.classList.add('is-ready');
}
