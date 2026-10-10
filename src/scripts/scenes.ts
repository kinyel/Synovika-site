/**
 * Drives every CSS 3D scene ([data-s3d]), ported from synov-timer (D-046):
 * --p is the scene's scroll progress (0 as it enters, 1 once it is in
 * place), smoothed; --tx and --ty tilt it a few degrees towards the pointer.
 * Scenes off screen are paused (is-off). With reduced motion nothing runs,
 * so --p stays 1: the finished model.
 *
 * Phase 2 moves the clock to GSAP's ticker and positions to the layout cache.
 *
 * Optional attributes on a scene:
 *   data-s3d-start / data-s3d-end   where progress starts and ends, as a share of the
 *                                   viewport height for the scene's top (defaults 0.92 and 0.5)
 *   data-s3d-tilt="0"               no pointer tilt
 */
interface Scene {
  el: HTMLElement;
  start: number;
  end: number;
  tilt: boolean;
  live: boolean;
  p: number;
  tx: number;
  ty: number;
  last: string;
}

export function initScenes() {
  const reduced = document.documentElement.classList.contains('reduced-motion');
  const els = [...document.querySelectorAll<HTMLElement>('[data-s3d]')];
  if (!els.length || reduced) return;

  const scenes: Scene[] = els.map((el) => ({
    el,
    start: Number(el.dataset.s3dStart ?? 0.92),
    end: Number(el.dataset.s3dEnd ?? 0.5),
    tilt: el.dataset.s3dTilt !== '0',
    live: false,
    p: 0,
    tx: 0,
    ty: 0,
    last: '',
  }));
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const s = scenes.find((x) => x.el === e.target);
        if (!s) continue;
        s.live = e.isIntersecting;
        s.el.classList.toggle('is-off', !s.live);
      }
      kick();
    },
    { rootMargin: '10% 0px' },
  );
  for (const s of scenes) {
    s.el.style.setProperty('--p', '0');
    s.el.classList.add('is-off');
    io.observe(s.el);
  }

  let mx = 0;
  let my = 0;
  if (matchMedia('(pointer: fine)').matches) {
    addEventListener(
      'pointermove',
      (e) => {
        mx = e.clientX / innerWidth - 0.5;
        my = e.clientY / innerHeight - 0.5;
        kick();
      },
      { passive: true },
    );
  }
  addEventListener('scroll', () => kick(), { passive: true });

  let running = false;
  const kick = () => {
    if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  };
  const frame = () => {
    let moving = false;
    // Read every position first, then write: no layout thrash.
    const targets = scenes.map((s) => {
      if (!s.live) return null;
      const top = s.el.getBoundingClientRect().top;
      const a = innerHeight * s.start;
      const b = innerHeight * s.end;
      return Math.min(1, Math.max(0, (a - top) / (a - b)));
    });
    scenes.forEach((s, i) => {
      const target = targets[i];
      if (target == null) return;
      s.p += (target - s.p) * 0.12;
      if (Math.abs(target - s.p) < 0.0005) s.p = target;
      else moving = true;
      if (s.tilt) {
        const tx = mx * 9;
        const ty = -my * 5;
        s.tx += (tx - s.tx) * 0.08;
        s.ty += (ty - s.ty) * 0.08;
        if (Math.abs(tx - s.tx) > 0.01 || Math.abs(ty - s.ty) > 0.01) moving = true;
      }
      const key = `${s.p.toFixed(3)}|${s.tx.toFixed(2)}|${s.ty.toFixed(2)}`;
      if (key === s.last) return;
      s.last = key;
      s.el.style.setProperty('--p', s.p.toFixed(3));
      s.el.style.setProperty('--tx', `${s.tx.toFixed(2)}deg`);
      s.el.style.setProperty('--ty', `${s.ty.toFixed(2)}deg`);
    });
    if (moving) requestAnimationFrame(frame);
    else running = false;
  };
  kick();
}
