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

**D-008. CI runs the production guard as a blocking step (revised in Phase 1).**
`TODO(hero)` markers, "TO CONFIRM" badges and unconfirmed content render only in dev and draft builds, so a production build is clean by construction. The guard catches leaks, and it blocks CI from the start.
Lighthouse in CI asserts only the hard floor for mobile performance (95), because shared runners are noisy. The 97 target and every other budget are asserted locally, and the numbers are recorded in PROGRESS.md each phase.
Rejected (first version): a non-blocking guard job, which was only needed while markers rendered in production.

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

**D-037. Copy must read as if a person wrote it. Em dashes are banned everywhere (Hero, 10 October 2026).**
- Voice: write the way Hero would explain it to a client across a table. Use contractions ("we'll", "you don't"), "we" and "you", and concrete nouns (drivers, gates, pages). Vary sentence length.
- Avoid the patterns that make text sound machine-written: no triplets for rhythm's sake ("fast, reliable and scalable"), no "not just X, it's Y", no rhetorical questions as openers, no "In today's world", no "Whether you're X or Y", and no stacked adjectives.
- No em dashes (U+2014) in any copy, code comment that reaches the page, alt text, metadata, structured data or docs. No spaced en dash used as a dash (" – ") either. Use a full stop, a comma, a colon or brackets instead.
- Enforced by `scripts/copy-lint.mjs` (`npm run qa:copy`). It scans `src/` and `dist/` for em dashes, spaced en dashes, the banned buzzwords and superlatives (brief section 3, rules 3 and 9), and wrong forms of the product name ("Synovika Selvion", "Selvion™"). It fails the build. It runs in CI, and the production guard runs it too.

**D-038. The www redirect is a Cloudflare Redirect Rule, not a `_redirects` line.**
Cloudflare's Pages docs list domain-level redirects as unsupported in `_redirects` (a source must be a path). The rule `www.synovika.com/*` to `https://synovika.com/${1}` (301, query string kept) goes in `docs/LAUNCH.md`. `_redirects` holds path redirects only.

**D-039. Headers per build.** `public/_headers` holds the production headers. On a draft build, a small integration in `astro.config.mjs` appends `X-Robots-Tag: noindex` for every path to `dist/_headers`, so a draft deployment can never be indexed, even on a custom domain. The `*.pages.dev` noindex rule is in the production file too, as the brief asks.

---

## Brand assets (Phase 1)

**D-040. (Superseded by D-044 for anything shown as the logo.) How the logo was vectorised (`scripts/trace-logo.mjs`).**
- **Masks.** Your rule (green and blue each more than 25 above red) splits teal from silver. Connected parts identify the four faces of the S (teal top, teal tail, silver top, silver bowl), the two spheres and the ring.
- **The ring is two fitted ellipses, not a trace.** It is a flat band seen at an angle: wide at the ends of its major axis, thin at the top and bottom. Its outer and inner edges were sampled along the centre line and each was fitted as a true ellipse (Nelder-Mead, Huber loss). Both fits are within about 1 px. The ring is drawn whole behind the S, then its front half again in front, with a 4 px gap cut into the S where it crosses, so it reads on any background.
- **The spheres are true circles** from their alpha-weighted area. The ring sphere is snapped onto the ring's centre line (parameter t = 0.761), so the 3D sphere can ride exactly that orbit.
- **Faces are traced with potrace at 4x.** The brief's settings are scaled to that size (turdSize 40 and optTolerance 0.4, both in the logo's own pixels), after an edge blur of 1.5 logo px for the S and 1 px for the wordmark. Every face is filled in under the ring, because the small mark and the 3D ring need whole faces.
- **Folds are drawn by hand (`scripts/lib/logo-folds.mjs`).** Thresholding the render's smooth shading gave lumpy blobs, so each fold line was placed from the original at 3x zoom as a smooth curve and clipped to its face. The rule: faces turned away from the light in the render take the darker step. That is the front face of the top curl and the tail's top band in teal-800, and the outer face of the bowl's D in neutral-500. Rejected: no folds (it flattens the ribbon), and threshold folds (they look accidental).
- **The tagline is set, not traced.** At about 2 px its strokes are too thin to trace (the counters filled in). It is Urbanist Light, turned into outlines with satori, with each word placed where it starts in the original. The fit is letter spacing 0.45em at 37 px, within 4.5 px of each word's width.
- **The wordmark is traced** (custom letterforms, as the brief says), with every traced path using the even-odd fill rule so the counters stay open.

**D-041. (Superseded by D-044 for anything shown as the logo.) Lockup colours.**
- **On dark:** the flat teal mark, with the chrome gradient (white, #C0C0C0, #8A8A8A) on the silver faces, the ring and the wordmark.
- **On white:** the teal faces stay teal; the silver faces become neutral-700 with a neutral-800 fold (silver on white is 1.82:1); the wordmark is neutral-800.
- **Mono white and mono black:** one colour, with a 1.5 px hairline between the teal and silver faces so the S keeps its structure.
All of these are for Hero to approve on `/lab`.

**D-042. (Superseded by D-044 for anything shown as the logo.) A small mark for the favicon.** The full mark does not read at 16 px (the ring turns to noise). `favicon.svg` and `favicon.ico` use the S and a larger sphere, with no ring, on a neutral-900 rounded tile, so it reads on light and dark tab bars. The apple-touch icon, the app icons, the maskable icon and `logo-512.png` use the full mark on neutral-900.

**D-043. (Superseded by D-044 for anything shown as the logo.) The header loads the logo as an `<img>` from `/brand/`, not inline SVG.** Web copies of the lockups are 13 to 20 KB (coarser precision, svgo). Inline on every page they would eat into the 60 KB home HTML budget, while as a file they are cached once for the whole site.

---

## Hero's direction after the first lab build (11 October 2026)

**D-044. The official logo, unchanged, everywhere a logo appears (Hero: "use the official logo that I gave you... do not remake it").** This supersedes D-040 to D-043 for anything shown as the logo.
- **Header, footer, share cards, structured data, app icons and favicons** all use `brand/synovika-logo.png`, Hero's file. It is only cropped, resized and re-encoded (AVIF and WebP with transparency, PNG for icons) by `scripts/logo-assets.mjs`.
- **Three crops of the same pixels:**
  - the full lockup, with the tagline;
  - the lockup without the tagline line, for small sizes like the header, where the tagline would be about 2 px tall;
  - the S mark alone (its ring and sphere included, the wordmark's "y" removed), for icons.
- **The traced SVGs are no longer a logo.** They move to `brand/trace/` and are used for one thing only: the shapes of the 3D object in the hero (brief section 10). The 3D object is never used as the logo.
- **Favicons are the official mark scaled down.** At 16 px it loses detail; that is accepted rather than redrawing it.

**D-045. The colouring follows synov-timer, in teal (Hero: "adopt that same coloring style but with my colors... synov-timer is mostly blue, mine is teal").** This replaces the neutral-black stage and the white-paper sections of brief section 5.
- **The site is dark throughout:** a teal-black night (`--color-night`, #031514) with a deep teal base (teal-950).
- **Big soft glows:** teal (teal-600 and teal-500) and blue (blue-600 and blue-700) take the places of synov-timer's iris, violet and azure.
- **Drafting grids** are masked to fade out, and **floor glows** sit under 3D objects.
- **Glass cards:** a faint white sheen over deep teal, with a hairline edge that lights teal on hover.
- **The primary button** runs from teal-700 into blue-700 with a teal glow, like synov-timer's iris into azure. White text passes on both ends (5.47:1 and 6.70:1).
- **Emphasis in headlines** is "lit" teal-300 with a soft glow, as synov-timer's iris-soft is. The hero keeps "reality." in chrome.
- **Eyebrows** take a double rule, and the hero's is a pill with a live signal dot. The dot pings three times and stops (WCAG 2.2.2).
- **synov-timer's gold, its "lit" accent,** becomes the signal: teal-300 with a white core, the logo's glowing sphere. Wine stays for alerts, blue for data, silver and chrome for structure.
- **The footer** is the brand black (#171717), as synov-timer's footer is black.
- **The white "paper" register is kept only inside mock-ups,** such as the example site in the websites demo. The teal flood stays for the principles.
- **Rejected:** keeping the brief's black, white and teal registers. Hero asked for synov-timer's style.

**D-046. The 3D language follows synov-timer's, made our own.**
- **Ported in teal:** the CSS 3D primitives (glass plates with layered edges and a sweep of light, glass blocks, lines of light lying on the ground, isometric grid boards, pointer tilt, `--p` scroll progress).
- **Each product scene** uses them to show a real fact, in synov-timer's manner:
  - **Selvion:** an isometric night map on a glass board: road blocks, a teal route of light, a lit depot zone.
  - **Estate:** an isometric gate on a glass board, with the code on glass plates.
  - **How we work:** a climbing stair of glass cards around a beam of light.
  - **Industries:** a ring of glass cards.
  - **Services:** small glass models.
- **The hero:** synov-timer has no WebGL; we keep the brief's single WebGL mark, set on a glowing grid floor with drifting dust, as synov-timer's plates are.
- **No scene copies synov-timer's content or layout one-for-one.**

---

## Hero's direction: the reference image, on raleston-web's engine (11 October 2026)

Hero: "use raleston-web exactly how it is but just change colors and text... the attached image is exactly how I want the site to look... but enhance it... forget phases... do everything right now... incorporate every single 3D effect and engine that is present in raleston-web... high advanced SEO and AI search optimization... I am giving you full autonomy."

**D-047. The site is rebuilt on raleston-web's engine, laid out like Hero's reference image.** This supersedes the phase plan (brief section 20), the WebGL hero mark (D-046's hero) and `/lab`.
- **Engine, ported as it is:** one GSAP ticker drives Lenis and every scene; ScrollTrigger with `ignoreMobileResize`; the layout cache (`track`, `rectOf`); style writes skipped when unchanged; CSS sticky stages; the nav dock with its morphing flyout and phone sheet; magnetic buttons; copy buttons; reveals; the motion setting.
- **Every 3D scene, given a Synovika job:** the spiral staircase (services), the kinetic words and the 27-block cube (Why Synovika), the capabilities board (what we build), the exploded glass plates with the spark, the leader line and the datum marks (how we work, 7 stages), the packet flow (inside Selvion), the layered model (your data, put to work), the industries ring, the sealed files (from the notebook), the plate stack (inner-page headers) and the dust canvas.
- **Colour aliases:** raleston's token names are kept so its CSS ports as it is, mapped to Synovika's palette: iris is teal-600, iris-soft teal-300, azure and violet are blues, gold is amber (#f59e0b, the image's warm glow), navy and indigo are deep teals, night is #031514.
- **Removed:** three.js, the WebGL mark, the poster and logo-trace tooling, and `/lab`. raleston-web has no WebGL, and the laptop is now the hero's 3D object.

**D-048. The hero is a laptop that opens, shows each product, and closes (Hero's brief for the 3D).**
- **Screen one:** the image's layout. Headline left; on the right, a CSS 3D laptop, half closed at an angle, with Selvion still visible on its screen.
- **On scroll** (one pinned stage, `src/scripts/tour.ts`): the lid opens as the laptop turns to face you and comes down to fill the view. Its screen then shows Selvion, the Estate Entrance Security System and Websites with an Admin Panel in turn, with each product's note on the screen's left (under it on phones) and a dock showing which app is open. Then the lid closes smoothly, showing the Synovika mark on its back, as the services come up.
- **The screen is real HTML** laid out at its full-screen size (`--sw`) and scaled down elsewhere, so it is sharp when it fills the view. The apps carry "Demo data" and made-up names (Unit 07, Depot A, House 12, Example Bakery).
- **Without JavaScript or with reduced motion:** an open laptop beside the headline, and the three products as cards.
- **A "Skip the product tour" link** appears on keyboard focus.

**D-049. Honest replacements for the image's trust signals, and its other details.**
- **Client logo wall:** Synovika has no clients to show yet, so the band names the six sectors we build for, each linking to its page.
- **Stats band and "Impact" numbers:** replaced by plain facts that are true today (6 services, 3 products in development, 7 stages, Nigeria and worldwide).
- **Testimonial:** none. The products' demo screens and the notebook (real articles) take its place.
- **"Book a demo"** becomes "Book a call": nothing is live yet (D-032).
- **No light/dark toggle:** the site is dark by design (D-045), and one theme keeps contrast checked and the 3D lit consistently.
- **"Tracking Portal"** in the image stays "Selvion", the product's real name. The image's other product names (FarmTrace, MeterGuard, ComplyRadar, SiteLedger, PatrolProof) are not used: Hero hasn't confirmed them. Question for Hero.
- **"Measurable results"** becomes "Results you can see": we have no measurements to show.
- **Pricing** (in the image's nav) is a page that explains how we quote, with no figures.

**D-050. DOM budget on home: 2,500 nodes, not 1,500.** Every raleston scene on one page takes about 2,400 elements (raleston-web's own home is about 1,660 with fewer sections). Icons moved to a cached sprite (`/icons.svg`) to save what could be saved. Lighthouse stays the performance gate.

**D-051. The contact form needs no server, for now.** It writes the message and opens it in the visitor's own email app or WhatsApp, pre-filled from links (`?waitlist=`, `?service=`, `?industry=`, `?topic=call`). Nothing is stored on the site. Without JavaScript it falls back to a `mailto:` form. A real form (Pages Function, Turnstile, an email provider) can come later; the `/contact/thanks/` page is removed until then.

**D-052. Search and AI search.**
- **AI assistants:** `/llms.txt` (the map) and `/llms-full.txt` (the whole site as plain text), both built from the content collections with the same draft rules, so they never say more than the pages. robots.txt welcomes every crawler and names the AI search, assistant and training crawlers one by one (D-028's default of allow).
- **Structured data:** an Organization with contact points, area served and, on the home page, an offer catalogue of every service and product; ItemLists for products, services, industries and articles; FAQPage wherever answers show; a DefinedTermSet for the glossary; BlogPosting with keywords and word count; `speakable` on the H1 and the answer-first summaries.
- **New pages that answer real searches:** six industry pages, pricing, FAQ, a glossary of 21 terms, and eight published articles, each opening with "The short answer".
- **Signals:** `hreflang` en-NG and x-default, geo meta for Nigeria, `max-image-preview:large`, article dates, a share card for every page.
- **IndexNow:** a key file and `npm run indexnow` to ping Bing and Yandex after each deploy.

**D-053. Content confirmed under Hero's full autonomy (each listed for Hero's review in PROGRESS.md).**
- **The six industries** are shown, written as what we build for, never as past clients.
- **Six FAQ answers** grounded in the brief are confirmed. "Who owns the code?" stays unconfirmed.
- **The eight articles are published,** credited to "the Synovika team" until Hero names an author. No statistics are used in them.
- **Legal pages** are drafted to match how the site really works, and still say "Draft: to be reviewed by a lawyer".

**D-054. Performance trade-offs on the home page.**
- **Scenes below the first screen start only when they come near** (`whenNear`), and the reveals wait for an idle moment, so the first load does little work: mobile TBT fell from about 1.6 s to under 50 ms.
- **The headline keeps each line on one line,** sized to fit, so its line count can't change when the web font arrives (layout shift fell from 0.13 to 0).
- **On phones the headline isn't split into words or masked,** because new word elements reset the LCP.
- **Mobile LCP in the lab is 2.3 to 2.4 s** (the brief's budget is 2.0 s; Google's "good" is under 2.5 s). In a real browser it paints on the first frame (about 0.16 s); the lab figure comes from the home page's larger HTML, which carries every scene's CSS. Every other page measures about 1.95 s. Mobile Performance is 97, desktop 100.

---

## Hero's next round (11 October 2026)

Hero: "remove the 3D laptop and replace with something better... think out of the box... be very creative... and secondly make the site darker... and then change the 3D spiral staircase design feel and look to the one used in primetrack.rw."

**D-055. The site is darker.** Night is now #010706 (from #031514), the deep teals #041513 and #08221f, the footer #020404. Every section's background glow is turned down to about 60% (the 3D scenes' own pools to 80%). Contrast only improves on a darker ground; all text still passes AA.

**D-056. The hero is a night city, not a laptop (supersedes D-048): "reality, in miniature".** The tagline is "built around reality", so the hero shows the reality: a small isometric city at night, built from raleston's CSS 3D blocks, with a depot and its geofence, a gated estate, a high street, towers (the tallest carries the official mark on its roof, used as it is), traffic on a ring road, amber street lights and a teal scan line sweeping the streets.
- **Screen one:** the headline left; the city on the right, turning slowly with the pointer.
- **On scroll** (`src/scripts/city.ts`), the camera flies to each product's district and the software acts on the real world: Unit 07 drives out of Depot A and the geofence alert goes out (Selvion); a visitor's code checks out, the barrier lifts and the car drives in (Estate Entrance Security System); the bakery's opening hours change on its website (Websites with an Admin Panel). Each product's note carries the words. Then the camera pulls back and the lights dim as the services come up.
- **The glass panels** sit in a flat layer above the city, placed each frame by projecting their anchor through the same camera, so nothing in the model can cut through them and their text stays crisp.
- **Every scene uses demo data** and is marked so ("Demo data", "Example site"). The barrier lifting shows a gate letting a visitor in, not a feature claim; the estate's features stay unconfirmed (D-035).
- **Without JavaScript or with reduced motion:** the city stands still beside the headline, and the products are cards.
- The product pages keep each app's demo screen in a glass frame; only the hero's laptop is gone.

**D-057. The services spiral follows primetrack.rw's, in Synovika's teal (supersedes the raleston staircase for services).** Six glass cards on a helix, 60° apart and a step higher each, around one thin spine of light with a soft glow. The card at the front is sharp and lit (teal edge and glow); the others dim to about a quarter and blur with their distance round the turn. Beside it, a rolling counter, a progress rail and the list of services. No stair treads or rails. Its look and behaviour were studied on primetrack.rw; no code or content was copied.

**D-058. The motion engine loads just after the first paint (supersedes part of D-054).**
- **A tiny loader** imports `src/scripts/main.ts` one frame after the page first paints, so about 60 KB of JavaScript no longer competes with the page for the network (initial JavaScript on the home page: 1.6 KB).
- **The hero's entrance is pure CSS,** so it plays from the first paint. The city and its glow stay hidden until the engine places them, then rise in; if the engine never arrives, they show after four seconds anyway.
- **Result:** Lighthouse mobile 100 on every inner page (LCP about 1.5 s, from about 1.95 s), 98 on the home page (LCP 2.24 s, under Google's 2.5 s "good" line but still over the brief's 2.0 s, because the home page's HTML carries every scene). Desktop 100 everywhere.
