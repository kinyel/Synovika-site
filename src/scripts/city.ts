import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onRefresh } from '../lib/layout';

/**
 * The hero and product tour: "reality, in miniature" (markup and styles in
 * src/components/sections/City.astro, D-056).
 *
 * One pinned stage, driven by how far the section has scrolled:
 *   intro      the headline moves away; the camera leaves the slowly turning
 *              city on the right and flies down to the first district
 *   products   the camera visits each district in turn (it rests on one, then
 *              travels to the next); the root's data-scene names the one in
 *              view, and CSS plays its moment (Unit 07 leaving the depot, the
 *              barrier lifting, the bakery's hours changing)
 *   close      the camera pulls back and turns, and the city's lights dim
 *
 * The camera is one transform on the world: move to the screen point, scale,
 * tilt (rx) and turn (rz) about the focus point on the ground. The glass
 * panels live in a flat layer above the city (so nothing in the model can
 * cut through them): each frame, the same transform and the perspective
 * project each panel's anchor in the city onto the screen.
 * Per-frame writes are plain inline transforms, each skipped when unchanged.
 */
type Pose = { x: number; y: number; s: number; rx: number; rz: number; fx: number; fy: number };

export function initCity(reduced: boolean) {
  const root = document.querySelector<HTMLElement>('[data-tour]');
  if (!root || reduced) return;
  const one = <T extends Element>(sel: string) => root.querySelector<T>(sel)!;
  const all = <T extends Element>(sel: string) => [...root.querySelectorAll<T>(sel)];

  const stage = one<HTMLElement>('[data-stage]');
  const intro = one<HTMLElement>('[data-intro]');
  const city = one<HTMLElement>('[data-city]');
  const world = one<HTMLElement>('[data-city-world]');
  const dim = one<HTMLElement>('[data-city-dim]');
  const holos = all<HTMLElement>('[data-holo]');
  const beams = all<HTMLElement>('[data-beam]');
  const notesBox = one<HTMLElement>('[data-notes]');
  const notes = all<HTMLElement>('[data-note]');
  const steps = all<HTMLElement>('[data-progress-steps] i');
  const glow = one<HTMLElement>('[data-glow]');
  const floor = one<HTMLElement>('[data-floor]');
  const dust = one<HTMLCanvasElement>('[data-dust]');
  const scenes = (root.dataset.scenes ?? '').split(' ');
  const N = notes.length;
  /** Each panel's anchor: a point on the ground and a height. */
  const anchors = holos.map((h) => (h.dataset.at ?? '0,0,0').split(',').map(Number) as [number, number, number]);
  /** Each panel's height, read when it's shown (never per frame). */
  const heights = holos.map(() => 0);

  const clamp = gsap.utils.clamp(0, 1);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const mix = (a: Pose, b: Pose, t: number): Pose => ({
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    s: lerp(a.s, b.s, t),
    rx: lerp(a.rx, b.rx, t),
    rz: lerp(a.rz, b.rz, t),
    fx: lerp(a.fx, b.fx, t),
    fy: lerp(a.fy, b.fy, t),
  });
  const inOut = gsap.parseEase('power2.inOut');
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

  // ── Camera poses, measured on load and resize ─────────────────────────
  let vw = 0;
  let vh = 0;
  /** The perspective on the city, and its origin (px in the stage). */
  let D = 2600;
  let OX = 0;
  let OY = 0;
  let A = 0;
  let B = 0;
  let hero: Pose;
  let shut: Pose;
  let focus: Pose[] = [];
  /** Where each district sits on the ground, and the turn that shows it best. */
  const DISTRICT: Record<string, { fx: number; fy: number; rz: number; rx: number }> = {
    selvion: { fx: 200, fy: -180, rz: 28, rx: 52 },
    estate: { fx: -190, fy: 200, rz: 62, rx: 50 },
    websites: { fx: 190, fy: 250, rz: 36, rx: 50 },
  };

  const measure = () => {
    vw = stage.clientWidth;
    vh = stage.clientHeight;
    const cs = getComputedStyle(city);
    D = parseFloat(cs.perspective) || 2600;
    const [ox, oy] = cs.perspectiveOrigin.split(' ').map(parseFloat);
    OX = ox ?? vw / 2;
    OY = oy ?? vh * 0.3;
    if (phone()) {
      const s = Math.min(vw / 1040, 0.5) * 1.25;
      hero = { x: 0, y: vh / 2 - 40, s, rx: 58, rz: 45, fx: 0, fy: 0 };
      const fs = Math.min(vw / 520, 1.1);
      focus = scenes.map((k) => ({ x: 0, y: -vh * 0.2, s: fs, ...(DISTRICT[k] ?? { fx: 0, fy: 0, rz: 45, rx: 56 }) }));
      shut = { x: 0, y: -vh * 0.02, s: s * 0.8, rx: 64, rz: 140, fx: 0, fy: 0 };
    } else {
      const s = Math.min((vw * 0.5) / 1470, (vh * 0.9) / 1000);
      hero = { x: vw * 0.24, y: vh * 0.08, s, rx: 58, rz: 45, fx: 0, fy: 0 };
      const fs = Math.min(vw / 1150, vh / 640);
      focus = scenes.map((k) => ({ x: vw * 0.17, y: vh * 0.16, s: fs, ...(DISTRICT[k] ?? { fx: 0, fy: 0, rz: 45, rx: 56 }) }));
      shut = { x: 0, y: vh * 0.04, s: s * 0.92, rx: 64, rz: 140, fx: 0, fy: 0 };
    }

    // The notes: on the left (desktop) or under the city (phones).
    if (phone()) {
      const y = vh * 0.5;
      set(notesBox, '--ov-left', '16px');
      set(notesBox, '--ov-top', `${y.toFixed(1)}px`);
      set(notesBox, '--ov-width', `${(vw - 32).toFixed(1)}px`);
      set(notesBox, '--ov-height', `${(vh - y - 16).toFixed(1)}px`);
    } else {
      const left = Math.max(16, Math.min(vw * 0.05, 72));
      set(notesBox, '--ov-left', `${left.toFixed(1)}px`);
      set(notesBox, '--ov-top', `${(vh * 0.14).toFixed(1)}px`);
      set(notesBox, '--ov-width', `${Math.min(480, vw * 0.34).toFixed(1)}px`);
      set(notesBox, '--ov-height', `${(vh * 0.8).toFixed(1)}px`);
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

  // ── State ─────────────────────────────────────────────────────────────
  let p = 0;
  let pose: Pose;
  /** 1 while a district is in view, 0 in the hero and at the close: the idle turn and pointer tilt fade with it. */
  let held = 0;
  let active = -2;
  const tiltTo = { x: 0, y: 0 };
  const tiltNow = { x: 0, y: 0 };
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      tiltTo.x = (e.clientX / innerWidth - 0.5) * 2;
      tiltTo.y = (e.clientY / innerHeight - 0.5) * 2;
    });
  }

  const setActive = (k: number) => {
    if (k === active) return;
    active = k;
    notes.forEach((n, i) => n.classList.toggle('is-active', i === k));
    holos.forEach((h, i) => h.classList.toggle('is-on', i === k));
    if (k >= 0 && holos[k]) heights[k] = holos[k]!.offsetHeight;
    beams.forEach((b, i) => b.classList.toggle('is-on', i === k));
    notesBox.classList.toggle('is-on', k >= 0);
    if (k >= 0 && scenes[k]) root.dataset.scene = scenes[k];
    else delete root.dataset.scene;
  };

  const render = () => {
    if (!hero) return;
    const tIntro = clamp(p / A);
    const q = clamp((p - A) / (B - A)) * N;
    const c = clamp((p - B) / (1 - B));

    // The camera: hero → first district; rest on each district, then travel; then pull back.
    if (c > 0) {
      pose = mix(focus[N - 1]!, shut, inOut(c));
    } else if (tIntro < 1) {
      pose = mix(hero, focus[0]!, inOut(tIntro));
    } else {
      const k = Math.min(N - 1, Math.floor(q));
      const f = q - k;
      pose = k < N - 1 && f > 0.55 ? mix(focus[k]!, focus[k + 1]!, smooth((f - 0.55) / 0.45)) : focus[k]!;
    }
    held = c > 0 ? 1 - clamp(c * 2.5) : clamp((tIntro - 0.5) / 0.5);

    // Screen one: the headline moves up and away.
    set(intro, 'opacity', clamp(1 - tIntro * 1.9).toFixed(3));
    set(intro, 'transform', `translate3d(0, ${(-tIntro * vh * 0.32).toFixed(1)}px, 0)`);
    set(intro, 'visibility', tIntro >= 0.6 ? 'hidden' : '');

    // The notes: in once the camera has arrived, out as it pulls back.
    const notesOn = clamp((tIntro - 0.82) / 0.18) * (1 - clamp(c / 0.12));
    set(notesBox, 'opacity', notesOn.toFixed(3));
    // A district's moment plays once the camera has settled on it.
    const k = notesOn > 0.05 ? Math.min(N - 1, Math.floor(q)) : -1;
    setActive(k);
    steps.forEach((seg, i) => set(seg, '--f', (c > 0 ? 1 : clamp(q - i)).toFixed(3)));

    // The city's lights dim as the camera pulls back.
    set(dim, 'opacity', (clamp((c - 0.2) / 0.6) * 0.6).toFixed(3));
    write(performance.now() / 1000);
  };

  /** Where a point in the city (x, y on the ground, z up) lands on the screen, through the camera and the perspective. */
  const project = (ax: number, ay: number, az: number, rx: number, rz: number, y: number): [number, number] => {
    const r = Math.PI / 180;
    const gx = ax - pose.fx;
    const gy = ay - pose.fy;
    const x1 = gx * Math.cos(rz * r) - gy * Math.sin(rz * r);
    const y1 = gx * Math.sin(rz * r) + gy * Math.cos(rz * r);
    const y2 = y1 * Math.cos(rx * r) - az * Math.sin(rx * r);
    const z2 = y1 * Math.sin(rx * r) + az * Math.cos(rx * r);
    const X = vw / 2 + pose.x + x1 * pose.s;
    const Y = vh / 2 + y + y2 * pose.s;
    const k = D / (D - z2 * pose.s);
    return [OX + (X - OX) * k, OY + (Y - OY) * k];
  };

  /** Writes the camera, with the idle turn and the pointer tilt added, and places the panels over their districts. */
  const write = (time: number) => {
    if (!pose) return;
    const free = 1 - held;
    const rz = pose.rz + (Math.sin(time * 0.22) * 7 + tiltNow.x * 6) * free;
    const rx = pose.rx - tiltNow.y * 3 * free;
    const float = Math.sin(time * 0.8) * 4 * free;
    const s = pose.s.toFixed(4);
    set(
      world,
      'transform',
      `translate3d(${pose.x.toFixed(1)}px, ${(pose.y + float).toFixed(1)}px, 0) scale3d(${s}, ${s}, ${s}) rotateX(${rx.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) translate3d(${(-pose.fx).toFixed(1)}px, ${(-pose.fy).toFixed(1)}px, 0)`,
    );
    holos.forEach((h, i) => {
      if (i !== active) return;
      const [hx, py] = project(...anchors[i]!, rx, rz, pose.y + float);
      // Never under the navigation: if the anchor is too high, the panel slides down over its beam.
      const hy = Math.max(py, 92 + heights[i]! + 8);
      set(h, 'transform', `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0) translate(-50%, calc(-100% - 8px))`);
    });
    // The light follows the city: an amber glow behind it and teal light under it.
    const gs = 0.5 + pose.s * 0.6;
    set(glow, 'transform', `translate3d(${pose.x.toFixed(0)}px, ${(pose.y - 120 * pose.s).toFixed(0)}px, 0) scale(${gs.toFixed(3)})`);
    set(floor, 'transform', `translate3d(${pose.x.toFixed(0)}px, ${(pose.y + 260 * pose.s).toFixed(0)}px, 0) scale(${(gs * 1.6).toFixed(3)})`);
  };

  let visible = true;
  const tick = (time: number) => {
    if (!visible) return;
    tiltNow.x += (tiltTo.x - tiltNow.x) * 0.05;
    tiltNow.y += (tiltTo.y - tiltNow.y) * 0.05;
    write(time);
  };
  gsap.ticker.add(tick);

  // ── Dust in the light (teal, with a few warm motes from the street lights) ─
  const ctx = dust.getContext('2d');
  type Mote = { x: number; y: number; r: number; a: number; vx: number; vy: number; t: number; warm: boolean };
  let motes: Mote[] = [];
  let dw = 0;
  let dh = 0;
  let dpr = 1;
  const centre = () => (pose ? 0.5 + pose.x / Math.max(1, dw) : phone() ? 0.5 : 0.74);
  const sizeDust = () => {
    dpr = Math.min(1.5, devicePixelRatio || 1);
    dw = dust.clientWidth;
    dh = dust.clientHeight;
    dust.width = Math.round(dw * dpr);
    dust.height = Math.round(dh * dpr);
    const cx = centre();
    motes = Array.from({ length: phone() ? 28 : 56 }, () => {
      const y = Math.random();
      const spread = 0.12 + y * 0.3;
      return {
        x: (cx + (Math.random() - 0.5) * 2 * spread) * dw,
        y: y * dh,
        r: Math.random() < 0.12 ? 2.5 + Math.random() * 5 : 0.5 + Math.random() * 1.3,
        a: 0.1 + Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -(0.05 + Math.random() * 0.16),
        t: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.3,
      };
    });
  };
  const drawDust = () => {
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dw, dh);
    ctx.globalCompositeOperation = 'lighter';
    // The dust thins out while a district is in view, so nothing sits over the words.
    const fade = 1 - held * 0.7;
    for (const m of motes) {
      m.t += 0.012;
      m.x += m.vx + Math.sin(m.t) * 0.06;
      m.y += m.vy;
      if (m.y < -10) {
        m.y = dh + 10;
        m.x = centre() * dw + (Math.random() - 0.5) * dw * 0.5;
      }
      const tw = 0.6 + 0.4 * Math.sin(m.t * 2.3);
      const alpha = m.a * tw * (m.r > 2 ? 0.18 : 1) * fade;
      ctx.fillStyle = m.warm ? `rgba(252, 211, 77, ${alpha.toFixed(3)})` : `rgba(153, 246, 228, ${(alpha * 0.85).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  let dusting = false;
  const startDust = () => {
    if (dusting || !ctx) return;
    dusting = true;
    gsap.ticker.add(drawDust);
  };
  const stopDust = () => {
    dusting = false;
    gsap.ticker.remove(drawDust);
  };

  // Created last: a page reloaded part-way down fires these at once, so everything they use must exist.
  measure();
  sizeDust();
  onRefresh(() => {
    measure();
    sizeDust();
  });
  ScrollTrigger.create({
    trigger: root,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (st) => {
      p = st.progress;
      render();
    },
    onToggle: (st) => {
      visible = st.isActive || st.progress === 0;
      root.classList.toggle('is-paused', !visible);
      if (visible) startDust();
      else stopDust();
    },
    onRefresh: (st) => {
      p = st.progress;
      active = -2;
      render();
    },
  });
  render();
  startDust();

  // ── Arrival: the city rises into place, now that the camera is set ────
  // Until is-ready, CSS keeps the city and its light hidden (City.astro).
  if (scrollY < innerHeight * 0.4) {
    gsap.from(city, { y: 70, opacity: 0, duration: 1.8, ease: 'expo.out', delay: 0.1, clearProps: 'transform,opacity' });
    gsap.from([glow, floor], { opacity: 0, duration: 1.6, ease: 'power2.out', delay: 0.1, clearProps: 'opacity' });
  }
  root.classList.add('is-ready');
}
