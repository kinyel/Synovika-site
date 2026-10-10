/**
 * /lab behaviour: the chrome highlight slider, easing samples, the custom
 * cursor trial, and the 3D mark with its sliders. The mark's code (three.js)
 * loads only when its stage comes near the screen.
 */
import type { Look, Pose } from './three/mark';

export function initLab() {
  const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];

  // Chrome highlight.
  const demo = $('[data-chrome-demo]');
  $<HTMLInputElement>('[data-chrome-slider]')?.addEventListener('input', (e) => demo?.style.setProperty('--p', (e.target as HTMLInputElement).value));

  // Easing samples: show each duration, play on demand.
  const root = getComputedStyle(document.documentElement);
  for (const el of $$('[data-dur]')) el.textContent = root.getPropertyValue(`--${el.dataset.dur}`).trim();
  const eases = $('[data-eases]');
  $('[data-ease-play]')?.addEventListener('click', () => eases?.toggleAttribute('data-played'));

  // Custom cursor trial (fine pointers only, off by default).
  const cursor = $('[data-cursor]');
  $<HTMLInputElement>('[data-cursor-toggle]')?.addEventListener('change', (e) => {
    const on = (e.target as HTMLInputElement).checked && matchMedia('(pointer: fine)').matches;
    document.documentElement.toggleAttribute('data-cursor-on', on);
  });
  addEventListener(
    'pointermove',
    (e) => {
      if (!document.documentElement.hasAttribute('data-cursor-on') || !cursor) return;
      cursor.style.setProperty('--cx', `${e.clientX}px`);
      cursor.style.setProperty('--cy', `${e.clientY}px`);
    },
    { passive: true },
  );

  // The 3D mark.
  const stage = $('[data-stage]');
  const canvas = $<HTMLCanvasElement>('[data-mark-canvas]');
  const note = $('[data-stage-note]');
  if (!stage || !canvas) return;
  const io = new IntersectionObserver(
    async (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      const { Mark, DEFAULT_LOOK, REST_POSE } = await import('./three/mark');
      const mark = new Mark({ canvas, tier: 2, dpr: Math.min(devicePixelRatio || 1, 2), onContextLost: () => note && (note.textContent = 'WebGL context lost: the poster takes over here.') });
      const size = () => mark.resize(stage.clientWidth, stage.clientHeight);
      new ResizeObserver(size).observe(stage);
      size();
      if (note) note.hidden = true;

      const poseKeys: (keyof Pose)[] = ['yaw', 'pitch', 'dolly', 'orbit'];
      const controls = $$<HTMLInputElement | HTMLSelectElement>('[data-control]');
      const apply = (el: HTMLInputElement | HTMLSelectElement) => {
        const key = el.dataset.control!;
        const out = $(`[data-out="${key}"]`);
        if (out) out.textContent = el.value;
        if (key === 'tone') return mark.setLook({ tone: el.value as Look['tone'] });
        if (poseKeys.includes(key as keyof Pose)) mark.setPose({ [key]: Number(el.value) });
        else mark.setLook({ [key]: Number(el.value) });
      };
      for (const el of controls) el.addEventListener('input', () => apply(el));
      // The sliders start from the code's defaults, so the lab and the site can't drift apart.
      const reset = () => {
        const all: Record<string, number | string> = { ...DEFAULT_LOOK, ...REST_POSE };
        for (const el of controls) {
          el.value = String(all[el.dataset.control!]);
          apply(el);
        }
      };
      reset();
      $('[data-reset]')?.addEventListener('click', reset);
      $('[data-copy-look]')?.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement;
        try {
          await navigator.clipboard.writeText(JSON.stringify({ look: mark.look, pose: mark.pose }, null, 2));
          button.textContent = 'Copied';
          setTimeout(() => (button.textContent = 'Copy settings'), 1600);
        } catch {
          button.textContent = 'Copy blocked';
        }
      });

      // Draw only when something changed, and only while the stage is on screen.
      let visible = true;
      new IntersectionObserver((e) => (visible = e.some((x) => x.isIntersecting))).observe(stage);
      const loop = () => {
        if (visible && !document.hidden) mark.frame();
        requestAnimationFrame(loop);
      };
      loop();
      addEventListener('pagehide', () => mark.dispose(), { once: true });
    },
    { rootMargin: '400px 0px' },
  );
  io.observe(stage);
}
