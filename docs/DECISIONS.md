# Decisions

Every choice, why it was made, and what was rejected. Newest decisions are added at the end of their section. "Provisional" means the choice will be confirmed or changed by a measurement in the phase named.

---

## Versions (checked 10 October 2026 with `npm view <package> version`)

All pinned exactly in `package.json` (no `^` or `~`). Re-check before each install.

| Package | Version | Role | Note |
|---|---|---|---|
| astro | 7.3.8 | framework | Needs Node 22.12 or newer. Local Node is 24.19.0. |
| tailwindcss, @tailwindcss/vite | 4.3.3 | CSS | |
| gsap | 3.15.0 | motion | ScrollTrigger, SplitText (free since 3.13) |
| lenis | 1.3.26 | smooth wheel scroll | |
| three | 0.186.1 | the 3D mark | `WebGLRenderer` only |
| @types/three | 0.186.0 | types | |
| detect-gpu | 5.0.70 | device tiers | benchmarks self-hosted |
| satori | 0.47.1 | OG images | |
| sharp | 0.35.5 | OG images, icons, poster AVIF, logo masks | |
| schema-dts | 2.1.0 | typed JSON-LD | |
| @astrojs/sitemap | 3.7.4 | sitemap | |
| @astrojs/check | 0.9.10 | type checking | peer: TypeScript 5 or 6 |
| typescript | **6.0.3** | | 7.0.2 is out but `@astrojs/check` 0.9.10 does not support it (D-004) |
| playwright | 1.64.0 | QA | Chromium 1243 and WebKit already cached locally |
| @axe-core/playwright | 4.13.0 | accessibility | |
| lighthouse | **13.5.0** | performance | instead of @lhci/cli (D-003) |
| html-validate | 11.16.2 | HTML validity | |
| linkinator | 8.1.0 | links | |
| wrangler | 4.149.0 | local Pages Functions | |
| potrace | 2.1.8 | logo tracing | pure JavaScript port; no system binary needed |
| svgo | 4.1.0 | SVG clean-up | |
| @fontsource-variable/urbanist | 5.3.0 | display and interface | Latin `wght` woff2: 27.8 KB |
| @fontsource-variable/geist-mono | 5.3.0 | mono | Latin `wght` woff2: 23.1 KB |
| @fontsource/urbanist, @fontsource/geist-mono | 5.3.0 | OG images only | static `.woff` files, which satori can read (D-016) |
| @fontsource-variable/mona-sans, unbounded, instrument-sans, jost | 5.3.0 | `/lab` type comparison only | never loaded outside `/lab` |

Not installed: `@lhci/cli` (D-003), `nanostores` (D-012), `@astrojs/markdown-remark` (D-013), `@astrojs/mdx` (D-013), any React or UI kit (brief, section 16).

---

## Project and tooling

**D-001. synov-timer lives at `../raleston-web`.**
The brief's `../synov-timer/...` paths do not exist on this machine. `../raleston-web` has git remote `kinyel/synov-timer.git` and matches the brief (README, `reference/AUDIT.md`, `references/NOTES.md`, every file listed in section 6). All references to synov-timer mean that folder.
Note: synov-timer's current build (v4) has no WebGL at all; its audit's "too many 3D scenes" finding is about the earlier WebGL version. Its pinned hero (`hero.ts`) is CSS 3D plus SVG, which is the engine we port.

**D-002. Hosting: Cloudflare Pages, with a Pages Function for `/api/contact`.**
Why: the site is static plus one small function, which is exactly what Pages does natively (file-based `functions/`, `_headers`, `_redirects`, branch previews on `*.pages.dev`). synov-timer proved the setup, and the brief's `https://:project.pages.dev/*` noindex rule is Pages syntax. Pages also works when the domain's DNS is not on Cloudflare, which we do not know yet.
Rejected: Workers with static assets. Cloudflare's docs (page dated 10 October 2026) present it as the broader platform, but on Workers the `functions/` folder is only partly supported (it must be compiled with `wrangler pages functions build`), preview URLs need extra config, and custom domains must use Cloudflare nameservers. Cloudflare has deprecated Workers Sites, not Pages. If we later need Durable Objects, cron or queues, we migrate then.

**D-003. Lighthouse 13.5.0 run directly by `scripts/lh.mjs`, not `@lhci/cli`.**
Why: `@lhci/cli` 0.15.1 (the latest) bundles Lighthouse 12.6.1. synov-timer's numbers, which we must beat, were measured with Lighthouse 13. Comparing a Lighthouse 12 score with a Lighthouse 13 score is not a fair test. The script does what the brief asks of `qa:lh`: mobile and desktop, three runs each, the median by performance score, and assertions against every section 13 budget. It exits non-zero on failure.
Rejected: `@lhci/cli` (old engine; its server and upload features are unused here).

**D-004. TypeScript 6.0.3.**
`@astrojs/check` 0.9.10 declares `typescript: ^5.0.0 || ^6.0.0`. TypeScript 7 waits until it is supported.

**D-005. npm, Node 24, git on `main`.**
npm as in Hero's other repos. `.nvmrc` holds `24`; CI uses Node 24. The repository was created with `git init -b main` on 10 October 2026. Hero creates the GitHub repository and pushes the code themselves (D-036), so no remote is configured here.

**D-006. The frontend-design skill is not available in this session.**
The brief asks for it, but the skill is not installed here. Design work follows the brief's sections 4, 5 and 12 directly, plus the look-at-your-own-work loop in section 2 (screenshots at 390 × 844 and 1440 × 900, three mid-animation frames per scene, the three weakest things fixed each round). If the skill becomes available, it is used from then on.

**D-007. Three build modes.**
- `npm run dev`: drafts, `TODO(hero)` markers, "TO CONFIRM" badges and unconfirmed features all visible. `/lab` is available.
- Draft build (`PUBLIC_SHOW_DRAFTS=true npm run build`): the same content as dev, every page `noindex`, `robots.txt` disallows everything, `/lab` built. Used for Cloudflare preview branches and for Hero's reviews on a phone.
- Production build (`npm run build`): drafts, markers and unconfirmed features removed, `/lab` not built at all. `qa:prod-guard` fails if any marker reaches `dist/`.

**D-008. CI runs a draft build for QA, and the production guard as a separate job that may fail until Phase 7.**
Why: every `TODO(hero)` (domain, email, WhatsApp, BN number and so on) makes the production guard fail by design, so until Hero supplies those facts a blocking production job would keep CI red and hide real regressions. The guard job reports what is still missing on every run, and becomes blocking in Phase 7.
Lighthouse in CI asserts the hard floor (mobile 95) because shared runners are noisy; the 97 target and every other budget are asserted locally and recorded in PROGRESS.md each phase.

**D-009. Source material outside the brief.**
`../Synovika files/` holds earlier design samples (2 October 2026), a theme colours sample, the official logo (byte-identical to `../synovika-logo.png`, now `brand/synovika-logo.png`), and in `tracking-portal/` the Fleet Tracking Platform SRS, system architecture, and a cost and income plan. The brief supersedes the design samples, so they are not used. Only the SRS outline has been read. It covers ignition events, live tracking, geofences, alerts and trip reports, and also anti-theft remote commands and immobilisation, which the site must not mention unless Hero confirms them. Using the SRS to draft Selvion's features is question 9. The CAC receipt in that folder has not been opened: the BN number is shown only once Hero gives it.

---

## Content and facts

**D-010. Copy lives in content collections, never in components.**
- `products/*.md`, `services/*.md`, `insights/*.md`, `pages/*.md` (About, legal) as in brief section 17.
- `faq/*.yaml` and `industries/*.yaml`.
- `home/*.yaml`: one file per home section (hero, statement, selvion, estate, websites, services, pipeline, principles, industries, faq, closing). Hero edits one short file per section.
- `src/data/site.ts`: name, contacts, service area, socials, navigation. Contacts not yet given are `TODO(hero)` values.

**D-011. Features gate the stories.**
Each product file lists `features` (`id`, `title`, `body`, `confirmed`) and `stations` (each pointing at a feature `id`). A station is built only if its feature is confirmed, except in dev and draft builds, where it shows with a "TO CONFIRM" badge.
Consequence: while nothing is confirmed, the production home page shows each product's heading, summary and status CTA, but no story stations. If fewer than five stations are confirmed, the story runs with the confirmed ones and the meter reads "01 / 03", for example. Questions 6, 7 and 8.

**D-012. No nanostores.**
synov-timer uses nanostores for four values. `src/lib/store.ts` will hold a 15-line typed signal (get, set, subscribe) instead: one fewer dependency, and nothing shipped that we can write in a few lines.

**D-013. Markdown with Sätteri (Astro 7's default), no MDX, no remark or rehype plugins.**
Reading time is computed from the article body, and the table of contents comes from the `headings` that `render()` returns, so no plugins are needed. MDX is added only if an article needs a component; that would be recorded here.

---

## Front end

**D-014. Prefetch with Speculation Rules (prefetch only, `moderate` eagerness), not Astro's prefetch.**
Why: zero JavaScript (an inline `<script type="speculationrules">`), and it covers Chrome and Samsung Internet on Android, which is most of our traffic. Other browsers simply navigate normally, as with view transitions. Rules are limited to same-origin links and exclude `/api/*`, `/contact/thanks/` and file downloads. We prefetch only: prerender would run the home page's scripts, including WebGL, in the background.
Rejected: Astro's `prefetch` (adds a script to every page). CSP note: the rules block needs a hash or `'inline-speculation-rules'` in `script-src`, handled in Phase 6.

**D-015. Fonts: the local provider pointing at the Fontsource variable files, Latin `wght` woff2 only.**
Total 50.9 KB, against an 80 KB budget. Urbanist is preloaded (it is the H1, so it is the LCP text). Geist Mono's preload is decided by measurement in Phase 2: the hero eyebrow and telemetry line are mono and above the fold, so preloading it may be cheaper than a late swap. Either way it stays within the two-file preload limit. Fallback metrics come from Astro's `optimizedFallbacks` and are then checked for shift; if they are not good enough, `size-adjust`, `ascent-override` and `descent-override` are tuned by hand against Arial and recorded here. Provisional (Phase 2).

**D-016. OG images: satori 0.47.1 with static Urbanist and Geist Mono `.woff` files.**
Satori reads neither woff2 nor variable fonts, so the static Fontsource packages are dev dependencies used only at build time.

**D-017. Native cross-document view transitions; no ClientRouter.** As the brief says. Named elements: the logo, the page title, and product card to product hero.

**D-018. One WebGL canvas, moved between two slots.**
The 3D chunk creates one `<canvas>` and places it in the hero's slot. As the closing CTA approaches (IntersectionObserver), the same element is moved into the CTA's slot (moving a canvas in the DOM keeps its WebGL context), and the camera takes the CTA pose. No second renderer, context or scene. Provisional (Phase 2 for the hero, Phase 4 for the bookend).

**D-019. The sphere hand-off: projection first, a clean cut if it is not seamless.**
At the end of the hero pin, the sphere's position is projected to the screen, a fixed DOM sphere replaces it at that exact point, and the DOM sphere travels down through the statement section (behind the outlined "REALITY") into the Selvion map, where it becomes the vehicle. On tier 0 (poster only), the start point is the sphere's position in the poster, saved by the poster script. With reduced motion there is no travel; each scene shows its own still sphere. If the swap shows a jump or drops below 60 fps on a 4× throttled phone, we use a clean cut and record it here. Provisional (Phases 2 and 3).

**D-020. The poster is rendered by the same scene code.**
`scripts/poster.mjs` loads the real mark module in headless Chromium through Playwright, at the hero camera's resting pose, and saves the canvas. sharp encodes AVIF at 1x and 2x. Because it is the same module and camera, the crossfade from poster to live canvas lines up exactly. No system tools are needed (no ffmpeg or avifenc).

**D-021. detect-gpu benchmarks are copied from `node_modules` into `public/gpu/` by a build step, and `benchmarksURL` is `/gpu`.**
They are fetched only inside the lazy 3D chunk, after the visitor shows intent, so they never compete with LCP. They are never fetched from a CDN.

**D-022. Selvion's story must look clearly different from primetrack.rw (design guard).**
primetrack.rw shows one glowing orange S-curve drawing itself on an empty dark field, with a tilted "drum" list beside it. Selvion's story will:
- show a real-looking night street map: a road grid, blocks, a river in blue, depot and zone shapes;
- route along the roads with right-angle turns, not a free curve, with no glow trail and no fading gradient tail;
- carry live readouts on the vehicle itself (speed, time, status);
- change scene with each station (geofence, phone, report card) instead of only drawing a line;
- use a flat stepped note list, not a drum.
Every Phase 3 review checks the story against `../raleston-web/reference/primetrack/` screenshots side by side.

**D-023. Motion setting.** Stored in localStorage as `synovika:motion` (`full` or `reduced`). An inline script in `<head>` adds `html.reduced-motion` before first paint; the system's `prefers-reduced-motion` is the default when nothing is stored. Changing it reloads the page, so no live scene has to tear itself down mid-scroll.

**D-024. Icons are hand-drawn inline SVG at a 1.5 px stroke; no icon library.** One stroke width, as the brief asks, and nothing shipped that the site does not use.

**D-025. `/lab` exists only in dev and draft builds.**
It is a dynamic route whose `getStaticPaths` returns nothing in production, so the page is never built, rather than built and hidden. It is also `noindex` and left out of the sitemap in draft builds.

**D-026. `/work/` is not built until a case study has `permission: true`.** The same mechanism as D-025. Neither candidate client is named anywhere in the repository's content until then.

---

## Defaults chosen without asking (they do not change what visitors are told)

**D-027. Canonical host: the bare domain.** `www` redirects to it with a 301 in `_redirects`. Hero can reverse this at launch.

**D-028. AI training crawlers: allowed (the brief's default)**, until Hero decides otherwise in Phase 7. Search crawlers and user-triggered fetchers are always allowed.

**D-029. The credit link on client sites is `rel="nofollow"`** (the brief's default).

**D-030. The site language is `en-NG`.** British spelling throughout, including in these docs. No em dashes anywhere, docs included.

---

## Hero's answers to the Phase 0 questions (10 October 2026)

**D-031. Facts confirmed by Hero.**
- Domain: `synovika.com`, so `PUBLIC_SITE_URL=https://synovika.com`.
- Public email: `hero@synovika.com`. This is also the default `CONTACT_TO`.
- WhatsApp: `07062319781`. Hero did not object to the default, so it is also the public phone number (D-033).
- Area served: all of Nigeria, and worldwide (D-034).
- Products: all three are in development. Hero has more products in development, which are not shown until Hero names them.
- Selvion features confirmed: ignition alerts, live map tracking, geofences, phone alerts, trip reports, and remote immobilisation.
- Estate Entrance Security System: the system flow is not designed yet, so none of its features are confirmed (D-035).
- The SRS may be used to draft Selvion's feature list. Every item drafted from it is unconfirmed until Hero confirms it, apart from the six above.
- GitHub: Hero creates the repository and pushes.

**D-032. In-development products get a waitlist, not "Talk to us about it" (Hero's decision; changes brief section 3, rule 5).**
- `in-development`: the button reads **"Join the waitlist"**, with the line "Be one of the first to use it when it launches." under it. Hero edits the exact words in the content files.
- `pilot` and `live` keep "Join the pilot" and "Book a demo".
- How it works: the button opens the contact page in waitlist mode (`/contact/?waitlist=<product>`). The form is short (name, email, optional phone and company, consent) and goes through the same Pages Function as the contact form. The function forwards it to `CONTACT_TO` by email, marked as a waitlist sign-up, and stores nothing, as brief section 15 requires.
- Rejected: a list kept at the email provider (Resend contacts). It would store personal data with a third party and need more in the privacy notice. We can add it later if Hero wants a managed list.
- Copy rule: product copy says what the product does, and the "In development" status chip sits beside every CTA, so no page suggests the product can be bought today.

**D-033. Phone and WhatsApp formats.**
- Shown as `+234 706 231 9781`, the international form, because we serve clients abroad.
- Links: `tel:+2347062319781` and `https://wa.me/2347062319781`.
- In structured data: `telephone: "+234-706-231-9781"`.

**D-034. Area served: Nigeria first, worldwide too.**
- Titles, keywords and the hero copy still lead with Nigeria (brief section 11).
- The footer, the FAQ ("Do you work outside Nigeria?") and About say "across Nigeria and worldwide".
- Structured data: `areaServed` is `[{ "@type": "Country", "name": "Nigeria" }, "Worldwide"]`.
- We say nothing about how we work abroad (remote, on site) until Hero says.

**D-035. The estate story is data-driven and stays out of production for now.**
The five stations from brief 8.4 are built as drafted, each tied to an unconfirmed feature in `products/estate-entrance-security.md`. When Hero designs the flow, the stations change in that file only: headings, order, and which visual each step uses. Until then, production shows the product's summary, status chip and waitlist CTA, without the story.

**D-036. CI is written but runs only once Hero pushes.** `.github/workflows/ci.yml` is part of Phase 1 as planned. The QA scripts also run locally, so nothing waits for the repository.
