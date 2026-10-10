# Plan

One plan per phase. Each phase ends at its gate: I stop, summarise what changed with screenshots, and wait for Hero's go. Within a phase, every section goes through the same loop before it is called done:

1. Build it.
2. Screenshot it at 390 × 844 and 1440 × 900, plus three mid-animation frames for each scroll scene.
3. Look at the screenshots and write down the three weakest things in PROGRESS.md.
4. Fix them, and repeat until there is no obvious flaw.
5. Run the QA scripts.

Commits are small, one idea each.

---

## Phase 1. Foundation and brand lab

Gate: Hero approves the look on `/lab`.

**1.1 Scaffold**
- Astro 7.3.8, static output, strict TypeScript (6.0.3), Tailwind 4.3.3 through `@tailwindcss/vite`.
- `astro.config.mjs`:
  - `site` from `PUBLIC_SITE_URL`;
  - `trailingSlash: 'always'` and `build.format: 'directory'`;
  - `build.inlineStylesheets: 'always'`, and `compressHTML` left at `'jsx'` (with `{" "}` where spaces matter);
  - the Fonts API with local Fontsource variable files;
  - the sitemap integration with its filter and `lastmod`.
- `.nvmrc`, `.gitignore`, `.env.example` (names only), `.dev.vars.example`.
- `public/_headers` (security headers, CSP as Report-Only, immutable `/_astro/*`, noindex on `*.pages.dev`) and `public/_redirects`.

**1.2 Tokens and contrast**
- `src/styles/tokens.css` is the single source:
  - every ramp from brief section 4.2, with Tailwind's palette removed;
  - semantic aliases redefined per register (`[data-theme=dark|paper|teal]`);
  - radii (6, 12, 20, full), motion durations and eases, pin lengths in `svh`, the 12- and 4-column grid, and the 4 px baseline.
- `src/lib/tokens.ts` parses that file with `?raw` for scripts and 3D.
- `scripts/contrast.mjs` is not a fixed list like synov-timer's. It collects every `color` and `background` pair the built CSS actually uses for each register and component, then checks AA (4.5, or 3 for large text and UI).

**1.3 Fonts**
- Urbanist and Geist Mono, Latin `wght`, through the Fonts API.
- Fallback metrics tuned, then a CLS check with fonts blocked versus loaded.
- A font-budget check added to the size script.

**1.4 Brand assets**
- `scripts/trace-logo.mjs`:
  - sharp splits the teal and silver masks by alpha, using the brief's rule (green and blue each more than 25 above red);
  - potrace traces each mask (`turdSize 40`, `optTolerance 0.4`);
  - svgo cleans the result;
  - then a hand-clean pass in code: smoothed curves, closed paths, the ring as a true ellipse, the sphere as a true circle, and the fold step in a darker teal and silver.
- Outputs:
  - `brand/mark.svg` and `brand/wordmark.svg` (traced, never retyped);
  - the `logo-*.svg` lockups: horizontal, with and without the tagline, chrome on dark, ink on white, mono white, mono black.
- `scripts/icons.mjs` (port) makes the favicons, the app icons, `site.webmanifest` and `logo-512.png`.
- The 16 px test: render it, look at it, and draw a small mark (S and sphere, no ring) if it does not read.

**1.5 The 3D mark, first version**
- `src/scripts/three/mark.ts`: the scene from the brief's section 10 (extruded paths, separate teal and silver meshes, the elliptical torus ring, the sphere, `MeshPhysicalMaterial`, RoomEnvironment through PMREM, one key light, AgX tone mapping), rendered on demand.
- `scripts/poster.mjs` renders the AVIF poster from the same module.
- In `/lab` for approval only; the home hero comes in Phase 2.

**1.6 `/lab`**
- Colours with their measured contrast.
- The type specimen: Urbanist with Geist Mono against Mona Sans, Unbounded with Instrument Sans, and Jost, set next to the wordmark.
- Buttons, links and form fields in all three registers.
- The chrome material, with its specular highlight following a slider standing in for `--p`.
- The noise texture and the hero vignette.
- Section mood swatches, and easing samples.
- The 3D mark with sliders (roughness, clearcoat, light angle, camera), the poster beside the live render, and the original raster logo for comparison.
- The custom cursor demo, off by default.

**1.7 Header and footer**
- Ported nav behaviours: the gliding hover, the morphing flyout (Services and Products, with status chips), the compacting dock with its progress line, the mobile sheet with the CTA and WhatsApp, and theme switching from `data-theme`.
- Footer: link groups, contacts, service area, the motion setting, and "Built around reality".

**1.8 Base layout and SEO plumbing**
- `Base.astro`: title and description from frontmatter, canonical URL, Open Graph and Twitter tags, the speculation rules, the motion inline script, the skip link and `lang="en-NG"`.
- `src/lib/schema.ts` builds a typed `@graph` (Organization, WebSite, WebPage, BreadcrumbList).
- `og.ts` (port) makes the satori cards.
- `robots.txt.ts` (port) and the sitemap.
- A build-time check that titles and descriptions are within length and unique.

**1.9 Content collections with draft content**
- Schemas for `products`, `services`, `insights`, `faq`, `industries`, `pages` and `home`.
- Draft files for the three products, the six services, the home sections and the FAQ, all with `confirmed: false` where it applies.
- Stub pages for every route in the site map, so links resolve.

**1.10 QA harness and CI**
- Ported: `pages`, `pagefps`, `widths`, `tour`, `icons`.
- New: `a11y` (axe, both motion modes), `lh` (D-003), `jsonld`, `links` (linkinator), `html` (html-validate), `nojs`, `motion` (parity), `prod-guard`, and `size` (JavaScript, HTML, fonts, DOM nodes and poster against section 13).
- GitHub Actions: install, check, a draft build, every QA script except `qa:fps`, the screenshots uploaded as an artifact, and the production guard as a non-blocking job (D-008).

Risk: the traced mark may need several clean-up passes before it holds up at 512 px. I budget time for that, because everything downstream (icons, 3D, OG) depends on it.

---

> **Direction since the first lab build (D-044 to D-046):** Hero's own logo everywhere; synov-timer's colouring in teal (teal-black night, glows, grids, glass, lit emphasis); synov-timer's CSS 3D glass language for the scenes. The phases below already follow it.

## Phase 2. Hero and motion system

Gate: Hero approves the hero on their phone.

**Engine**
- `main.ts`, `scroll.ts`, `layout.ts`, `store.ts` and `reveal.ts` ported. One GSAP ticker drives Lenis, with the settings from the brief.
- The motion setting.
- Reveals below the first screen only, hidden only once JavaScript has confirmed it will animate them.
- Magnetic primary buttons (at most 6 px, fine pointers only).
- View transitions.

**Hero**
- Static HTML first: the pill eyebrow, H1, lead, buttons, the telemetry line labelled "Demo data", and the poster with explicit size.
- synov-timer's stage around the mark: teal and blue glows, a drafting grid strongest around the mark, a floor glow under it and drifting dust in the light (canvas 2D, paused off screen, still with reduced motion).
- The 3D chunk loads on intent or after 5 seconds of idle, then crossfades in. The tiers come from detect-gpu (self-hosted) plus `saveData`, `effectiveType`, `deviceMemory` and reduced motion.
- The pointer tilt (at most 8°), and the sphere's orbit that comes to rest.
- The short pin (50svh on desktop, 45svh on phones). Context loss falls back to the poster, and everything is disposed on `pagehide`.

**Statement section**
- The outlined "REALITY" and the SplitText line reveal (headlines only).

**Measurement**
- Every section 13 budget measured and written into PROGRESS.md.
- LCP element confirmed: if the poster wins, it is preloaded.
- The OffscreenCanvas worker tried, and kept only if TBT drops.
- The hand-off from the 3D sphere to the DOM sphere prototyped (D-019).

Risk: the three.js chunk size. `WebGLRenderer` with `MeshPhysicalMaterial`, PMREM and `ExtrudeGeometry` should land between 140 and 170 KB gzip, under the 200 KB budget. The size script measures it on every build.

---

## Phase 3. Product stories

Gate: Hero approves.

**The pinned-stage engine**
A generic version of synov-timer's `hero.ts`:
- stations that dwell, then travel, with lengths in `svh`;
- a segmented meter with a "0X / 0N" label that adapts to the number of confirmed stations;
- leader lines;
- on phones, the stage on top and the note at the bottom;
- `is-off` pausing when the stage is off screen;
- the DOM order is an ordered list of real text.

**Selvion**
- A night map built from the glass primitives (D-046) and the D-022 guard: an isometric glass board with road blocks, blue water, the depot zone as a glass plate, and the route as lines of light along the roads.
- Five stations, each tied to a feature.
- The "Demo data" label on screen.
- A trip report that counts once and always finishes.
- The CTA from Selvion's status.

**Estate**
- An isometric gate on a glass board, the code's journey on glass plates (created, sent, checked, logged), the phone and message as glass cards, and the split-flap code.
- A "Try a wrong code" button that is keyboard-accessible, showing the denied path in wine with a word and an icon.
- The log row and the resident's notification.
- A barrier only if it is confirmed.

**Websites demo**
- A working admin panel and an "Example site" preview, updated with `textContent`.
- "Add page" with a view transition.
- "Publish" with its teal pulse.
- One automatic example edit if the visitor hasn't touched it.
- Full keyboard and screen-reader use.

**Reduced motion and no JavaScript**
- Every story becomes numbered still frames with the same text.

**Measurement**
- Frame times through every station on desktop and on a 4× throttled phone.

---

## Phase 4. Rest of the home page

Gate: Hero approves.

**Services**
- Six cards, each with its micro-visual. They play once on entry and again on hover or focus, then stop. Pure CSS and SVG where possible.

**How we work**
- A seven-stage pipeline in synov-timer's manner: glass cards climbing a beam of light, styled like a CI run, with queued, running and passed chips.
- The beam fill is scrubbed, not pinned, and the status chips change at thresholds.

**Principles**
- The teal flood.

**Industries**
- A ring of glass cards (synov-timer's industries ring, our own content), turned by scroll only. On phones and with reduced motion, a list.
- A horizontal band driven by scroll only, if the ring doesn't read on phones. CSS scroll-driven animation where the browser supports it, GSAP otherwise, and a wrapped list with reduced motion.
- Every item marked TO CONFIRM.

**FAQ**
- Native `<details>`, plus `FAQPage` structured data.

**Closing CTA**
- The canvas moves into the CTA slot (D-018), and the sphere settles back into its orbit.

**Footer polish and 404**
- The 404 page: "Signal lost", with the sphere drifting off its orbit.

**DOM budget**
- Checked against 1,500 nodes after this phase, since this is where most of the nodes land.

---

## Phase 5. Inner pages

Gate: Hero approves.

**Service pages**
- Six pages from one template: the large micro-visual, the problem in the client's words, what we do, deliverables, a link to how we work, related products and articles, FAQ, CTA and breadcrumbs.
- `Service` structured data.

**Product pages**
- Three pages from one template: an H1 with what the product is, who it is for, a lighter version of the story, confirmed features only, the status chip and CTA, FAQ and CTA.
- `SoftwareApplication` structured data.
- The card to hero view transition.

**Other pages**
- How we work, and About (plain facts; no founder section unless Hero says yes).

**Insights**
- The index, the article template (reading time, author, dates, table of contents, related links), and the eight draft articles, every source cited.

**Contact**
- The form, with consent wording from brief section 15. Without JavaScript it says it needs JavaScript and offers email and WhatsApp instead.
- `functions/api/contact.ts` ported: validation, honeypot, Turnstile, then Resend with reply-to set to the sender. Nothing is stored.
- `/contact/thanks/`.

**Legal**
- Privacy, cookies and terms, each with the "Draft: to be reviewed by a lawyer" note.

**SEO**
- `docs/SEO.md`: the keyword map, one primary topic per page.

---

## Phase 6. Audit

Gate: everything green.

- Every section 13 budget met, measured by the scripts, with the numbers in a performance report in PROGRESS.md.
- axe clean on every page in both motion modes.
- A full keyboard walkthrough, and a screen-reader walkthrough with VoiceOver on macOS and iOS.
- 200% zoom, 320 px wide, and forced colours.
- Cross-browser testing in Chrome, Safari on macOS and iOS, Firefox and Samsung Internet, and on a mid-range Android phone. Hero's own phone is part of this.
- The CSP tightened in Report-Only mode until it reports nothing.

---

## Phase 7. Launch prep

Gate: Hero launches.

**`docs/LAUNCH.md`**
- Domain and DNS, and the www redirect.
- Cloudflare settings: AI crawlers as Hero decides, Crawler Hints with IndexNow, Web Analytics, and a rate-limit rule on `/api/contact`.
- Environment variables and secrets.
- Search Console as a domain property, Bing Webmaster Tools, and IndexNow.
- The exact text to paste into Google Business Profile, Bing Places and Apple Business Connect.

**Before launch**
- The CSP enforced.
- Draft flags removed.
- The production guard made blocking in CI.
- A final content review with Hero.
