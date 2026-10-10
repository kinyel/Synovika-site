# Synovika Technologies website

Read `docs/BRIEF.md` and `docs/DECISIONS.md` first. Then `docs/PLAN.md` and `docs/PROGRESS.md` for where things stand.

Work in the phases of BRIEF section 20, and stop at every gate until Hero says go. Keep DECISIONS.md, PROGRESS.md and this file current. Pin exact versions, and run `npm view <pkg> version` before any install. synov-timer, the reference build, is `../raleston-web`.

## Commands

The scaffold lands in Phase 1; the commands below are the plan until then.

```bash
npm run dev                       # astro dev (drafts and /lab visible)
npx astro dev --background        # then: astro dev status | logs | stop
npm run build                     # production build
PUBLIC_SHOW_DRAFTS=true npm run build   # draft build: noindex, /lab included
npm run check                     # astro check + tsc
npm run qa:contrast | qa:pages | qa:widths | qa:tour | qa:a11y | qa:lh | qa:jsonld
npm run qa:links | qa:html | qa:nojs | qa:motion | qa:size | qa:prod-guard
npm run qa:fps                    # local only
```

## Non-negotiables (BRIEF section 3)

1. Never invent clients, logos, testimonials, case studies, statistics, ratings, team members, years in business, awards or certifications.
2. No claims about licences, regulators or partnerships. Name no partner company.
3. No superlatives ("best", "leading", "No. 1", "world-class", "Nigeria's top").
4. Every feature has `confirmed`. Unconfirmed features show only in dev and draft builds, with a "TO CONFIRM" badge.
5. Product status sets the CTA: live gives "Book a demo", pilot gives "Join the pilot", in development gives "Talk to us about it". The default is in development.
6. Demo data is labelled "Demo data" and uses made-up names (Unit 07, Depot A, House 12).
7. No stock photos and no AI-generated people.
8. Legal pages show "Draft: to be reviewed by a lawyer" until Hero removes it.
9. Copy: British spelling, plain words, short sentences, no em dashes, no buzzwords. Every headline has one plain sentence under it.
10. Placeholders are written `TODO(hero): what's needed`. The production guard fails if `TODO(hero)`, `TO CONFIRM` or an unconfirmed feature reaches `dist/`.

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
| Lazy 3D chunk (gzip) | 200 KB |
| Fonts | 80 KB, at most two preloaded files |
| Home HTML with inlined CSS (gzip) | 60 KB |
| DOM nodes on home | 1,500 |
| Hero poster on phones (AVIF) | 60 KB |
| Frame time p95 while scrolling | 20 ms desktop; 34 ms at 4x CPU throttle, 390 px |
| Horizontal overflow | none from 320 to 1920 px |

## Working loop

After every section: build, take screenshots at 390 × 844 and 1440 × 900 (plus three mid-animation frames per scroll scene), look at them, write down the three weakest things, fix them, and repeat. Then run QA. Make small commits.
