# Progress

## Now

**Phase 1 (Foundation and brand lab): done, waiting at the gate.** Gate: Hero approves the look on `/lab` (in a draft build or `npx astro dev --background --port 4331`, then open /lab/).

## Done

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

## Next

Phase 2 (hero and motion system), after Hero approves `/lab`.

## Questions for Hero at the Phase 1 gate

1. **Header logo:** is the crop without the tagline line right for the header and footer? The tagline would be about 2 px tall there. The full lockup is used where it's large.
2. **The 3D object in the hero is built from your logo's shapes** (it turns, and its sphere orbits). It is never used as the logo. Keep it, or would you rather the hero use something else?

## Open `TODO(hero)` items

Until each one arrives, the site shows a `TODO(hero)` placeholder (dev and draft builds only) and the production guard fails on it. Part A of the brief, which has Hero's own list, has not been shared; this list is built from Part B and Hero's answers.

**Facts**
- CAC business name (BN) number, once registration completes.
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
- Every drafted headline and section copy, the FAQ answers, the principles, and the industries list (all marked TO CONFIRM).
- The eight Insights drafts (Phase 5).
- The author name to show on articles (Phase 5).
- Founder section on About: yes or no, and if yes a bio and a photo (Phase 5).
- Case studies: written permission from each client before any work is shown (brief 8.10).

**Accounts and settings (Phase 5 and 7)**
- Cloudflare account with the Pages project.
- Turnstile site and secret keys.
- A Resend account with `synovika.com` verified as a sending domain, plus `CONTACT_FROM` (for example `Synovika website <web@synovika.com>`).
- AI training crawlers: allow (the default, D-028) or block.
- Google Search Console, Bing Webmaster Tools, Google Business Profile, Bing Places and Apple Business Connect: you create the profiles, I write the text.
- A lawyer's review of the privacy, cookies and terms pages.

## Section reviews

The three weakest things found in each round of the screenshot loop, one section at a time.

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

Measured on the production build, 11 October 2026 (Phase 1: no hero 3D or scroll scenes on the home page yet).

| Budget | Measured | Limit |
|---|---|---|
| Initial JavaScript, home (gzip) | 1.9 KB | 65 KB |
| 3D chunk, lazy (gzip; in /lab for now) | 170.0 KB | 200 KB |
| Fonts | 49.7 KB, 1 preload | 80 KB, 2 preloads |
| Home HTML with inlined CSS (gzip) | 18.1 KB | 60 KB |
| DOM nodes, home | 464 | 1,500 |
| Contrast | 1,130 text elements, all AA | |
| Pages, links, HTML, JSON-LD, prod-guard, copy rules, parity | all clean | |
