# Synovika Technologies website

Read `docs/BRIEF.md` and `docs/DECISIONS.md` first. Then `docs/PLAN.md` and `docs/PROGRESS.md` for where things stand.

Hero dropped the phases on 11 October 2026: the site is built on raleston-web's engine (`../raleston-web`, also called synov-timer), laid out like Hero's reference image (D-047). Keep DECISIONS.md, PROGRESS.md and this file current. Pin exact versions, and run `npm view <pkg> version` before any install.

## Commands

```bash
npx astro dev --background --port 4331   # dev server (shows drafts); astro dev status | logs | stop
npm run build                            # production build
npm run build:drafts                     # draft build: noindex, drafts shown
npx astro preview --port 4330            # serve dist/ for the browser QA scripts (npx astro preview stop first)
npm run check                            # astro check + tsc
node scripts/logo-assets.mjs             # Hero's logo crops, icons, manifest (never redraw the logo: D-044)
npm run indexnow                         # after a production deploy: ping IndexNow (D-052)
npm run qa:copy | qa:prod-guard | qa:jsonld | qa:html | qa:links | qa:size        # on dist/
npm run qa:pages | qa:contrast | qa:widths | qa:a11y | qa:nojs | qa:motion | qa:squares | qa:screens | qa:lh   # need the server on 4330
npm run qa:fps                           # local only
```

Port 4322 on this machine runs synov-timer's preview: don't use it.

## Non-negotiables (BRIEF section 3)

1. Never invent clients, logos, testimonials, case studies, statistics, ratings, team members, years in business, awards or certifications.
2. No claims about licences, regulators or partnerships. Name no partner company.
3. No superlatives ("best", "leading", "No. 1", "world-class", "Nigeria's top").
4. Every feature has `confirmed`. Unconfirmed features show only in dev and draft builds, with a "TO CONFIRM" badge.
5. Product status sets the CTA: live gives "Book a demo", pilot gives "Join the pilot", in development gives "Join the waitlist" (Hero's change, D-032). The default is in development.
6. Demo data is labelled "Demo data" and uses made-up names (Unit 07, Depot A, House 12).
7. No stock photos and no AI-generated people.
8. Legal pages show "Draft: to be reviewed by a lawyer" until Hero removes it.
9. Copy: British spelling, plain words, short sentences, no buzzwords. Every headline has one plain sentence under it. It must sound like a person wrote it (D-037).
   **No em dashes anywhere, ever:** not in copy, alt text, metadata, structured data, comments or docs. No spaced en dash used as a dash either. `npm run qa:copy` enforces this.
10. Placeholders are written `TODO(hero): what's needed`. The production guard fails if `TODO(hero)`, `TO CONFIRM` or an unconfirmed feature reaches `dist/`.

Use Hero's logo file everywhere a logo appears; never redraw it (D-044). The colouring follows synov-timer's, in teal (D-045); raleston's colour token names are kept and mapped (D-047). There are two registers, a near-black night (D-055) and white paper (D-062): a section names its own with `data-theme`, and those names turn over on paper, so `--color-white` there means the foreground (real white on a button is `--color-on-action`). Teal is Synovika; each product has its own colour (Selvion amber, Estate wine, Websites blue), set with `data-accent` (D-063). Don't use a product's colour for anything else.

**How the motion fits together:** `src/scripts/main.ts` runs one GSAP ticker for Lenis and every scene. It loads one frame after the first paint (D-058), so first-screen motion is CSS. The hero is `hero.ts`: one cloud of points in plain WebGL (`signal.ts`), whose shapes are in `src/lib/forms.ts` and are built in a worker, and which ends by drawing the services section in place (D-064). The services helix (D-057), the band and the kinetic words are `scroll.ts`; the seven plates are `journey.ts`; the small 3D models are `scenes.ts`. Scenes below the first screen start only when they come near (`whenNear` in `src/lib/layout.ts`). Pinned stages are `100lvh` with their words inside `100svh`, and a height-only resize on a touch screen is the address bar, so it re-measures nothing (D-066). Every scene has a static version for no JavaScript and for reduced motion (`html:is(.reduced-motion, :not(.js))`), and the parity scripts check both carry the same text.

Write "Selvion" exactly. On each page, the first mention says what it is ("Selvion, our fleet tracking platform"). Copy lives in `src/content/`, never in components. Ask Hero only when an answer changes what visitors are told (facts, claims, prices, names); otherwise pick a sensible default and record it in DECISIONS.md.

## Budgets (BRIEF section 13)

| Metric | Budget |
|---|---|
| Lighthouse mobile Performance | 97 or more (hard floor 95) |
| Lighthouse desktop Performance | 100 |
| Lighthouse Accessibility, Best Practices, SEO | 100 |
| LCP | 2.0 s mobile, 0.8 s desktop |
| CLS | 0.02 |
| TBT, mobile | 150 ms |
| INP, real users, p75 | 150 ms |
| Initial JavaScript on home (gzip) | 65 KB |
| Fonts | 80 KB, at most two preloaded files |
| Home HTML with inlined CSS (gzip) | 60 KB |
| DOM nodes on home | 2,500 (D-050; the brief said 1,500) |
| Frame time p95 while scrolling | 20 ms desktop; 34 ms at 4x CPU throttle, 390 px |
| Horizontal overflow | none from 320 to 1920 px |

## Working loop

After every section: build, take screenshots at 390 × 844 and 1440 × 900 (plus three mid-animation frames per scroll scene), look at them, write down the three weakest things, fix them, and repeat. Then run QA. Make small commits.
