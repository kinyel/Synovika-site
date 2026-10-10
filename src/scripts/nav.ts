/**
 * Header behaviour (markup and styles in src/components/layout/Header.astro).
 * Ported from synov-timer's nav.ts without GSAP: CSS transitions do the
 * motion, this file only measures and sets state.
 *
 *  - the gliding hover highlight
 *  - one flyout that morphs between the Services and Products panes
 *  - the dock drawing in on scroll, with a page-progress line
 *  - colours that follow the section under the header (data-theme)
 *  - the phone sheet: Escape closes it, links close it, the page stops scrolling
 */
export function initNav() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  if (!header) return;
  const html = document.documentElement;
  const nav = header.querySelector<HTMLElement>('[data-nav]')!;
  const hover = header.querySelector<HTMLElement>('[data-hover]')!;
  const flyout = header.querySelector<HTMLElement>('[data-flyout]')!;
  const clip = header.querySelector<HTMLElement>('[data-clip]')!;
  const panes = new Map([...header.querySelectorAll<HTMLElement>('[data-pane]')].map((p) => [p.dataset.pane!, p]));
  const toggles = [...header.querySelectorAll<HTMLButtonElement>('[data-toggle]')];
  const items = [...header.querySelectorAll<HTMLElement>('.hdr-item')];

  // ── Gliding hover highlight ──────────────────────────────────────────
  const moveHover = (item: HTMLElement | null) => {
    if (!item) return void hover.style.setProperty('--o', '0');
    const n = nav.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    hover.style.setProperty('--x', `${(r.left - n.left).toFixed(1)}px`);
    hover.style.setProperty('--w', `${r.width.toFixed(1)}px`);
    hover.style.setProperty('--o', '1');
  };

  // ── Morphing flyout ──────────────────────────────────────────────────
  let open: string | null = null;
  let openTimer = 0;
  let closeTimer = 0;
  const show = (id: string, focusFirst = false) => {
    const pane = panes.get(id);
    const item = items.find((i) => i.dataset.item === id);
    if (!pane || !item) return;
    clearTimeout(closeTimer);
    if (open === id) return;
    const prev = open ? panes.get(open) : null;
    open = id;
    for (const t of toggles) t.setAttribute('aria-expanded', String(t.dataset.toggle === id));
    pane.hidden = false;
    // Measure before showing, then let CSS animate the clip from the old size to the new one.
    const w = pane.offsetWidth;
    const h = pane.offsetHeight;
    const n = nav.getBoundingClientRect();
    const r = item.getBoundingClientRect();
    const centre = r.left + r.width / 2;
    const left = Math.min(Math.max(16, centre - w / 2), innerWidth - 16 - w) - n.left;
    flyout.style.setProperty('--fx', `${left.toFixed(1)}px`);
    clip.style.setProperty('--fw', `${w}px`);
    clip.style.setProperty('--fh', `${h}px`);
    if (prev && prev !== pane) {
      delete prev.dataset.shown;
      setTimeout(() => open !== prev.dataset.pane && (prev.hidden = true), 240);
    }
    requestAnimationFrame(() => (pane.dataset.shown = ''));
    flyout.toggleAttribute('data-open', true);
    moveHover(item);
    if (focusFirst) pane.querySelector<HTMLElement>('a')?.focus();
  };
  const hide = (now = false) => {
    clearTimeout(openTimer);
    clearTimeout(closeTimer);
    const run = () => {
      if (!open) return;
      const pane = panes.get(open);
      if (pane) {
        delete pane.dataset.shown;
        setTimeout(() => !open && (pane.hidden = true), 240);
      }
      open = null;
      flyout.removeAttribute('data-open');
      for (const t of toggles) t.setAttribute('aria-expanded', 'false');
      moveHover(null);
    };
    if (now) run();
    else closeTimer = window.setTimeout(run, 180);
  };

  for (const item of items) {
    const id = item.dataset.item;
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      moveHover(item);
      clearTimeout(openTimer);
      if (id) openTimer = window.setTimeout(() => show(id), open ? 0 : 80);
      else hide(true), moveHover(item);
    });
  }
  for (const t of toggles) {
    t.addEventListener('click', () => (open === t.dataset.toggle ? hide(true) : show(t.dataset.toggle!)));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        show(t.dataset.toggle!, true);
      }
    });
  }
  nav.addEventListener('pointerleave', () => hide());
  nav.addEventListener('pointerenter', () => clearTimeout(closeTimer));
  nav.addEventListener('focusout', (e) => {
    if (!nav.contains(e.relatedTarget as Node)) hide(true);
  });
  document.addEventListener('pointerdown', (e) => open && !nav.contains(e.target as Node) && hide(true));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (open) {
      const toggle = toggles.find((t) => t.dataset.toggle === open);
      hide(true);
      toggle?.focus();
    }
    if (sheet?.open) {
      sheet.open = false;
      sheet.querySelector('summary')?.focus();
    }
  });

  // ── Dock draws in on scroll; page progress along its foot ────────────
  const progress = header.querySelector<HTMLElement>('[data-progress]');
  let condensed = false;
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    // Hysteresis, so it never flickers at the threshold.
    const next = condensed ? y > 24 : y > 80;
    if (next !== condensed) header.toggleAttribute('data-condensed', (condensed = next));
    const max = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : '0');
  };
  addEventListener('scroll', () => !ticking && ((ticking = true), requestAnimationFrame(onScroll)), { passive: true });
  onScroll();

  // ── Colours follow the section under the header ──────────────────────
  // A one-pixel line at the header's middle: whichever section crosses it sets the theme.
  const sections = [...document.querySelectorAll<HTMLElement>('main [data-theme], footer[data-theme]')];
  if (sections.length && 'IntersectionObserver' in window) {
    let io: IntersectionObserver;
    const watch = () => {
      io?.disconnect();
      const line = header.offsetHeight / 2;
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const theme = (e.target as HTMLElement).dataset.theme!;
            if (html.dataset.navTheme !== theme) html.dataset.navTheme = theme;
          }
        },
        { rootMargin: `-${line}px 0px -${Math.max(0, innerHeight - line - 1)}px 0px` },
      );
      for (const s of sections) io.observe(s);
    };
    watch();
    let t = 0;
    addEventListener('resize', () => (clearTimeout(t), (t = window.setTimeout(watch, 150))));
  }

  // ── Phone sheet ──────────────────────────────────────────────────────
  const sheet = header.querySelector<HTMLDetailsElement>('[data-sheet]');
  if (sheet) {
    sheet.addEventListener('toggle', () => {
      html.toggleAttribute('data-menu-open', sheet.open);
      sheet.querySelector('summary')?.setAttribute('aria-label', sheet.open ? 'Close menu' : 'Menu');
    });
    for (const a of sheet.querySelectorAll('a')) a.addEventListener('click', () => (sheet.open = false));
    // Close the sheet if the window grows past the breakpoint.
    matchMedia('(min-width: 64rem)').addEventListener('change', (e) => e.matches && (sheet.open = false));
  }
}
