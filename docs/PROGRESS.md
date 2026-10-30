# Progress

## Now

**Ready to deploy (30 October 2026).** The site is built on raleston-web's engine and laid out like Hero's reference image (D-047). Latest round: white sections (D-062), a colour for each product with teal as the brand (D-063), a new hero where one cloud of points becomes the Earth, then each product, then a DNA helix that stays on as the spine of the services staircase (D-064), and the registered company details (D-065). Every QA script passes.

**Measured on the final build:**
- Lighthouse: mobile 99 on the home page (LCP 1.73 s, TBT 4 ms) and 100 on the inner pages tested; desktop 100 throughout. Accessibility, Best Practices and SEO 100.
- Home: initial JavaScript 1.6 KB, HTML 46.5 KB, 2,065 DOM nodes.
- Scrolling, p95: 16.7 ms on desktop; on a phone-sized view at 4x CPU throttle, 16.7 ms through the hero and the services, 33.3 ms through How we work (budget 34, met for the first time). The throttle slows the CPU only: the graphics chip was this Mac's, so check the hero on a real low-end Android phone after launch.

## Search (D-061)

The site side of search is done: one page per topic, search-style titles and questions, sixteen guides, a glossary, full structured data and AI-search files. The off-site half is Hero's checklist in `docs/SEO-PLAN.md`: Search Console, Bing, a Google Business Profile, directory listings, reviews and links.

## Questions for Hero

1. **The image's other product names** (FarmTrace, MeterGuard, ComplyRadar, SiteLedger, PatrolProof): are any of these real Synovika products? None are shown until you say so (D-049).
2. **"Who owns the code?"** The draft answer is "You do... the code lives in your own account". Confirm it, or tell me the real terms; it stays hidden until then.
3. **Articles:** they're credited to "the Synovika team". Would you like your name and a short bio on them? Named authors help search engines trust articles.
4. **The six industries** (logistics, estates, retail and SMEs, professional services, education, hospitality) are published as sectors we build for. Remove any you'd rather not name.
5. **Contact form:** it opens a ready-written email or WhatsApp message (D-051). Happy with that for launch, or do you want messages delivered to an inbox by the site? That needs an email provider account.

## Done

### The rebuild, 11 October 2026 (D-047 to D-054)
- **Engine:** raleston-web's main script, nav, scroll choreography, scenes and layout cache, ported with the colours mapped to teal, blue and amber.
- **Home, in the image's order:**
  - the night city (hero; the camera visits each product's district) (D-056, replacing the laptop of D-048);
  - the services helix, after primetrack.rw (D-057);
  - the industries band, where the image has client logos (D-049);
  - Why Synovika with the cube, four promises and the plain facts;
  - what we build (the capabilities board);
  - how we work (seven glass plates);
  - inside Selvion (the packet flow);
  - your data, put to work (the layered model);
  - the industries ring;
  - from the notebook (the latest articles);
  - questions;
  - "Ready to build around reality?" with the drifting waves.
- **Inner pages:** products (with each app's demo screen), services (with a diagram each), six industry pages, pricing, how we work, about, FAQ, glossary, insights, contact, legal, 404. Each has raleston's plate-stack header.
- **Content:** industries written in full; eight Insights articles written and published, each answer-first; legal pages drafted to match the site; the glossary (21 terms).
- **Search and AI search** (D-052): `llms.txt`, `llms-full.txt`, AI crawlers welcomed by name, richer structured data, IndexNow.
- **Removed:** three.js and the WebGL mark, `/lab`, the poster and trace tooling, the old header, the thanks page.

### Phase 0, 10 October 2026
- Read the brief (Part B), synov-timer's README, `reference/AUDIT.md`, `references/NOTES.md`, and every file listed in brief section 6 (`../raleston-web`, see D-001).
- Checked every package version with `npm view` (the table in DECISIONS.md). Measured the font files: 50.9 KB for both variable fonts (Latin), against a budget of 80 KB.
- Read the Astro 7 upgrade guide, the Fonts API docs, and Cloudflare's guide to moving from Pages to Workers.
- Wrote `docs/BRIEF.md`, `docs/DECISIONS.md`, `docs/PLAN.md`, this file and `CLAUDE.md`.
- Hero answered the questions on the same day (D-031 to D-036). The answers that change the site:
  - In-development products get "Join the waitlist" (D-032).
  - Selvion's five story features and remote immobilisation are confirmed.
  - The estate system's flow is not designed yet (D-035).

### Phase 1, 10 to 11 October 2026
- **Scaffold:** Astro 7.3.8, Tailwind 4.3.3, strict TypeScript 6.0.3, every dependency pinned. Headers, a CSP in Report-Only, and noindex on `*.pages.dev` and on draft builds (D-039).
- **Tokens:**
  - every ramp from the brief, Tailwind's palette switched off;
  - semantic aliases per register;
  - motion, radius, grid and pin tokens;
  - the teal-black night (D-045).
- **Fonts:** Urbanist and Geist Mono, variable, Latin, self-hosted through the Fonts API (49.7 KB, one preload).
- **Logo:** Hero's own file everywhere (D-044), cropped by `scripts/logo-assets.mjs` into the full lockup, a crop without the tagline line, and the mark; icons and the manifest come from the same file. The traced shapes (D-040) are kept only for the 3D object.
- **3D mark:** three.js r186, built from the traced shapes. The orbit is a true circle tilted to match the logo and the sphere rides it. Neutral tone mapping, room light, one key point light. It draws on demand. The poster is rendered by the same code (D-020); the lazy chunk is 170 KB gzip.
- **Colouring and 3D language** follow synov-timer, in teal (D-045, D-046): glows, drafting grids, glass, lit emphasis, pills, badges, and the CSS 3D glass primitives (boards, blocks, lines of light, plates) with pointer tilt.
- **Header and footer:**
  - the flyout morphing between Services and Products;
  - the gliding hover;
  - the dock that draws in on scroll, with a progress line;
  - colours that follow the section;
  - a `<details>` phone menu that works without JavaScript;
  - the footer motion setting.
- **SEO plumbing:**
  - titles and descriptions from content;
  - canonical URLs;
  - Open Graph and Twitter tags;
  - a share card for every page (satori);
  - a typed JSON-LD graph;
  - the sitemap with `lastmod`;
  - robots per environment;
  - prefetch with Speculation Rules.
- **Content:** collections with draft copy for the three products, six services, the home sections, the FAQ, industries, pages and eight Insights stubs. Unconfirmed items are marked.
- **Every route** in the site map exists. `/lab` is built only in draft builds.
- **QA scripts:** copy, prod-guard, pages, contrast, widths, tour, a11y, lh, jsonld, links, html, nojs, motion, size and fps.
- **CI workflow:** `.github/workflows/ci.yml`. It runs once Hero pushes.

## Open `TODO(hero)` items

Until each one arrives, the site shows a `TODO(hero)` placeholder (dev and draft builds only) and the production guard fails on it. Part A of the brief, which has Hero's own list, has not been shared; this list is built from Part B and Hero's answers.

**Facts**
- Social profiles to list in `sameAs` (only real ones).
- A privacy contact for the privacy notice (brief section 15). It could be `hero@synovika.com`; Hero to confirm.
- A public address, only if you want one shown (it switches the structured data to `ProfessionalService`).

**Products**
- The estate system's flow, then confirmation of each of its features (D-035).
- Selvion's other features, drafted from the SRS in Phase 5 for you to confirm.
- The websites product's feature list beyond "change the text, add pages" (Phase 5).
- Names for the estate and websites products, if and when they get names (one edit each in their content files).
- A Selvion logo, if one is made. Until then: a wordmark in the display face with "by Synovika".
- The waitlist wording (drafted as "Join the waitlist" and "Be one of the first to use it when it launches.").
- Prices or durations: none are shown unless you give them.

**Content to review**
- Every headline and section, the FAQ answers, the four promises and the six industries (D-053).
- The eight published Insights articles, and the author name to show on them.
- Founder section on About: yes or no, and if yes a bio and a photo.
- Case studies: written permission from each client before any work is shown (brief 8.10).

**Accounts and settings**
- Cloudflare account with the Pages project, and the www to bare-domain Redirect Rule (D-038).
- After each deploy: `npm run indexnow` (D-052).
- Google Search Console, Bing Webmaster Tools, Google Business Profile, Bing Places and Apple Business Connect: you create the profiles, I write the text.
- If you want the site itself to deliver contact messages: an email provider account and Turnstile keys (D-051).
- A lawyer's review of the privacy, cookies and terms pages.

## Section reviews

The three weakest things found in each round of the screenshot loop, one section at a time.

**The helix, made to move like primetrack's (11 October 2026, D-060):**
1. It rested on each card, then eased and lagged behind the scroll, so it never felt attached to your finger. Fixed: a steady, linear turn locked to the scroll, measured against primetrack.rw at 21 positions.
2. Three or more cards showed at once. Fixed: two, the one at the front and the next one up, with primetrack's fade and blur curves.
3. "How we work" re-read its tilt from the page's styles every frame while closing, forcing style recalculations (p95 200 ms on a 4x slower phone). Fixed: read once per measure (p95 50 ms; 16.7 ms on desktop). The services helix holds 16.7 ms on both.

**The services helix, fixed (11 October 2026, D-059):**
1. The front card drifted sideways at every step, up to a full card width, and swung over the list. Fixed: the cards turn about the spine, not their own centres.
2. Square cards on the old radius cut through each other (the next card's corner came round in front). Fixed: the radius is at least 0.87 × the card's width.
3. At 1024 × 768 the heading sat under the navigation. Fixed: a compact menu, like primetrack's, starting below the navigation.

**The night city and the spiral (11 October 2026):**
1. The city's glass panels lived inside the 3D model, so passing cars and buildings cut through them. Fixed: they float in a flat layer above the city, placed by projecting their anchors through the camera.
2. On phones the panels rose under the navigation bar. Fixed: they never go above it; if the anchor is too high, the panel slides down over its own beam.
3. The spiral's small list numbers were too faint on the darker night (3.0:1). Fixed: grey-400.

**The rebuild (11 October 2026):**
1. The laptop's floor shadow, reaching behind the lid, made Chrome draw it over the lid's lower bezel. Fixed: the shadow starts at the hinge.
2. With six services on the staircase, the fifth card (a full turn round) showed above the first. Fixed: cards fade with their distance round the stair, not only with the way they face.
3. Without motion, the staircase cards floated out of the page flow and over the products. Fixed: the stair's tilt wrapper and Tailwind 4's `translate` utilities are reset too. (raleston-web has the same two gaps.)
4. The ring's centre cube showed through the front industry panel, because opacity on a 3D face upsets Chrome's sorting. Fixed: panels dim with a veil instead.
5. The hero headline gained a line when the web font arrived (layout shift 0.13). Fixed: each line stays on one line, sized to fit (D-054).

**Logo trace (Phase 1, superseded by D-044):**
1. The bowl's top was missing (removing the ring split the bowl in two). Fixed: every part of the bowl is kept.
2. The fold shapes were lumpy, because thresholding the render's gradients gave blobs. Fixed: the folds are hand-drawn curves (D-040).
3. Counters were filled in (no even-odd fill rule) and the tagline was too thin to trace. Fixed: even-odd everywhere, and the tagline set in Urbanist Light. All of this is now used only for the 3D shapes.

**3D mark:**
1. The teal was washed out to mint under AgX. Fixed: Neutral tone mapping, and less room light on the teal.
2. The chrome read as matte grey. Fixed: the room turned to 140 degrees, more room light on the chrome, and a point key light for a sheen across the flat faces.
3. The mark touched the top edge of the frame. Fixed: a larger margin in the camera fit.

**Lab, first version:**
1. The ramps wrapped onto two rows. Fixed: a smaller minimum width.
2. The primary button vanished on the teal flood. Fixed: white with teal-900 text there.
3. The live canvas and the poster weren't side by side. Fixed: they sit together, with the sliders below.

**Home and inner pages in the new colouring (D-045):**
1. Sections showed seams where one glow met the next. Fixed: the base fades to night at both edges.
2. The pill eyebrow wrapped to two lines on phones. Fixed: tighter tracking under 30rem. It still wraps at 390 px, which is acceptable for now; Phase 2 revisits it.
3. The telemetry line lost its separator when it was split for wrapping. Fixed.

## Performance report

Measured on the production build, 11 October 2026, after the night city, the darker palette, the new spiral and the engine loading after first paint (D-058).

| Budget | Measured | Limit |
|---|---|---|
| Lighthouse mobile Performance, home | 98 | 97 |
| Lighthouse mobile Performance, inner pages | 100 | 97 |
| Lighthouse desktop Performance | 100 | 100 |
| Accessibility, Best Practices, SEO | 100 | 100 |
| LCP mobile, home (lab) | 2.24 s (D-058) | 2.0 s |
| LCP mobile, inner pages (lab) | 1.50 to 1.58 s | 2.0 s |
| LCP desktop | 0.38 to 0.52 s | 0.8 s |
| CLS | 0.000 | 0.02 |
| TBT mobile | 0 ms | 150 ms |
| Initial JavaScript, home (gzip) | 1.6 KB (the engine follows the first paint) | 65 KB |
| Fonts | 49.7 KB, 1 preload | 80 KB, 2 preloads |
| Home HTML with inlined CSS (gzip) | 48.9 KB | 60 KB |
| DOM nodes, home | 2,236 | 2,500 (D-050) |
| Contrast | 2,911 text elements, all AA | |
| axe | no violations, both motion modes, desktop and phone | |
| Widths | no overflow, 38 pages, 320 to 1920 px | |
| Pages, links, HTML, JSON-LD, prod-guard, copy rules, no-JS and reduced-motion parity | all clean | |
