# Synovika Technologies website: brief

> **Source.** Part B of Hero's brief, pasted on 10 October 2026 and copied here word for word. Part A was not included in that message. Section 21 refers to "the list at the end of Part A"; until Part A arrives, the running list of what Hero owes lives in `docs/PROGRESS.md`.
>
> **Paths.** The brief's `../synov-timer` is the folder `../raleston-web` on this machine (its git remote is `kinyel/synov-timer`). See DECISIONS.md, D-001.

---

### 1. Your role and the goal

You are the lead designer and engineer for the Synovika Technologies website. I'm Hero, the founder. I've built websites for other companies; this one has to be clearly the best thing I've put my name on, because it is the first proof that we build excellent software.

The site must:

1. **Make people stop and look.** Extremely beautiful, aesthetic and modern, with animation, scroll effects and 3D that show exactly what Synovika does. Design quality is a requirement, not a nice-to-have.
2. **Make it obvious within five seconds what we do:** software engineering services, plus our products (Selvion, the Estate Entrance Security System, and Websites with an Admin Panel).
3. **Turn visitors into conversations:** "Start a project", WhatsApp, email.
4. **Be found:** the most complete technical and content SEO you can build, done honestly.
5. **Be fast on the phones Nigerians actually use.** About 84% of Nigerian mobile web traffic is Android (StatCounter, September 2026), and network speed varies a lot even though the median mobile download is around 45 Mbps (DataReportal, Digital 2026).

**Done means:**

- Every page in the site map (section 7) exists, with real content or `TODO(hero)` placeholders that only appear in non-production builds.
- Every budget in section 13 is met, measured by scripts in the repo, not by eye.
- WCAG 2.2 AA: axe is clean, and you have done a keyboard and screen-reader walkthrough.
- Every page works without JavaScript and with reduced motion, with the same content.
- I have approved `/lab` and the end of every phase.

### 2. How to work

- Read all of Part B. Then read `../synov-timer/README.md`, `../synov-timer/reference/AUDIT.md`, `../synov-timer/references/NOTES.md` and the files listed in section 6 before you plan anything.
- Work in the phases of section 20. Stop at each gate and wait for me to say go.
- Keep these files current:
  - `docs/DECISIONS.md`: every choice, why, and what you rejected.
  - `docs/PROGRESS.md`: what's done, what's next, and every open `TODO(hero)` item.
  - `CLAUDE.md`: short. The commands, the non-negotiables from section 3, the budgets, and "read docs/BRIEF.md and docs/DECISIONS.md first".
- Versions move fast. Before installing anything, check the current version with `npm view <package> version` and read its docs, then pin exact versions. My notes in section 16 were checked on 10 October 2026.
- Use the frontend-design skill for all design work.
- **Look at your own work.** After every section: build, take Playwright screenshots at 390 × 844 and 1440 × 900 (plus three mid-animation frames for each scroll scene), look at them, write down the three weakest things, fix them, and repeat until you can't find an obvious flaw. Then run the QA scripts. Only then call the section done.
- When this brief is ambiguous, pick the sensible default, write it in DECISIONS.md, and keep going. Ask me only when the answer changes what visitors are told about the business (facts, claims, prices, names).
- Small commits with clear messages. Use npm, as in my other repos.
- Never invent facts. Section 3 is the law of this project.

### 3. Synovika: facts and rules

**Facts you may use**

| | |
|---|---|
| Company | **Synovika Technologies** ("Synovika" for short), an early-stage software company in Nigeria. The business name registration with CAC is in progress: show the BN number only once I give it to you. |
| Tagline | **Built around reality** |
| Services | Software development (building new systems) · Fixing and debugging · Testing and QA · Requirements engineering · System architecture · Maintenance and support |
| Products | **Selvion**, our fleet tracking platform. **Estate Entrance Security System**, code-based visitor access for residential estates. **Websites with an Admin Panel**, business websites the client edits themselves (change the text, add pages). More products will follow. |
| Who we serve | Nigerian businesses: fleet and logistics operators, estates and facility managers, and companies that need software built, fixed, tested or looked after, or a website they can run themselves. |

**Product naming**

- **Selvion** is the fleet tracking product's name; **Synovika** is the company brand. Write it exactly "Selvion": no "Synovika Selvion", no ™ unless I say it is registered.
- On each page, the first mention says what it is: "Selvion, our fleet tracking platform" or "Selvion fleet tracking". After that, "Selvion" alone.
- Selvion has no logo yet. Set the name in the display typeface as a wordmark with a small "by Synovika" endorsement, and leave a slot for a real logo. Don't design a Selvion logo unless I ask.
- The other two products keep their descriptive names for now. If I name them later, the change must be a single edit in their content files.

**Non-negotiables**

1. No invented clients, client logos, testimonials, case studies, statistics, ratings, team members, years in business, awards or certifications.
2. No claims about licences, regulators or partnerships (for example the NCC). Don't name any partner company.
3. No superlatives: no "best", "leading", "No. 1", "world-class", "Nigeria's top".
4. **Features:** each product feature in the content files has `confirmed: boolean`. Unconfirmed features show in dev and draft builds with a "TO CONFIRM" badge and never reach production.
5. **Product status** (`live`, `pilot`, `in-development`) drives the call to action: live gets "Book a demo", pilot gets "Join the pilot", in development gets "Talk to us about it". Every product defaults to `in-development` until I confirm otherwise.
6. Demo data in scenes is labelled "Demo data" on screen and uses generic made-up names (Unit 07, Depot A, House 12), never real places, people or companies.
7. No stock photos and no AI-generated people. Use illustration, UI and 3D. Real photos only when I supply them.
8. Legal pages show a visible "Draft: to be reviewed by a lawyer" note until I remove it.
9. **Copy style:** British spelling, plain words, short sentences, no em dashes, no buzzwords ("synergy", "cutting-edge", "leverage", "seamless", "revolutionary", "empower"). Every headline has one plain sentence under it that explains it. synov-timer's audit found headlines that explained nothing.
10. Placeholders are written `TODO(hero): what's needed`. A `prod-guard` script fails the production build if `TODO(hero)`, `TO CONFIRM` or an unconfirmed feature appears in `dist/`.

### 4. Brand

#### 4.1 The logo

`brand/synovika-logo.png` is a 1774 × 887 PNG with a transparent background. It shows:

- a 3D "S" mark made from a folded ribbon with teal and brushed-silver faces;
- a thin silver orbit ring around the S, with a glossy teal sphere riding it;
- the chrome wordmark "ynovika" (the S mark doubles as the first letter), with the "i" dotted by a teal sphere;
- the tagline "Built around reality" underneath, thin and widely letter-spaced.

The teal runs from a deep `#003840`-ish shadow to a cyan `#00F0F8`-ish highlight, with the brand teal `#0D9488` in the midtones.

It is a raster render. Build these in Phase 1:

| Asset | How |
|---|---|
| `brand/mark.svg` (flat S, ring, sphere) | Vectorise. Separate the teal pixels (green and blue each more than 25 above red) from the silver ones by alpha, trace each mask with potrace (`turdSize 40`, `optTolerance 0.4`), then clean by hand in code: smooth curves, close paths, make the ring a true ellipse and the sphere a true circle. Flat fills: teal `#0D9488` and silver `#C0C0C0`, plus one darker step of each for the fold. I tested this recipe on the logo and it works. |
| `brand/wordmark.svg` | Trace it the same way. Don't retype it in a font: the letterforms are custom. |
| Lockups (`logo-*.svg`) | Mark plus wordmark, horizontal, with and without the tagline. On dark: chrome gradient fill. On white: neutral-800 wordmark with the teal mark. Mono white and mono black versions. |
| Favicons and app icons | From `mark.svg` with a script like synov-timer's `scripts/icons.mjs` (sharp): `favicon.svg`, `favicon.ico` (32), `apple-touch-icon.png` (180), `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` and `site.webmanifest`. Check the mark reads at 16 px; if it doesn't, draw a simplified small mark (S and sphere, no ring). |
| `logo-512.png` | Square, for schema.org `logo` and social profiles. |
| OG image template | 1200 × 630, for satori (section 11). |
| The 3D mark | Built in Three.js from the cleaned SVG paths (section 10). |

Usage rules: clear space around the mark is at least twice the sphere's diameter. Minimum size is 24 px for the mark and 120 px wide for the full lockup. Never recolour outside the palette, never stretch, and never add effects other than the chrome material. The original raster logo appears only in `/lab` for comparison.

#### 4.2 Colour

My brand colours:

| Name | Hex | Role |
|---|---|---|
| Teal | `#0D9488` | Primary brand colour |
| Silver | `#C0C0C0` | Metallic accents |
| Grey | `#808080` | Secondary elements |
| Black | `#171717` | Premium dark backgrounds |
| White | `#FFFFFF` | Paper sections, text on dark |
| Wine | `#722F37` | Rich contrasting accents |
| Blue | `#2563EB` | Technology and interface accents |

**Colour carries meaning.** Use it the same way in every scene:

- **Teal:** live, healthy, verified, the primary action.
- **Blue:** data, interface, links, information.
- **Wine:** alert, denied, a security event.
- **Silver:** structure, hardware, chrome, borders.
- **Grey:** secondary text and inactive states.

**Measured contrast** (WCAG 2.x, text on background), so you don't have to guess:

| Pair | Ratio | Rule |
|---|---|---|
| White on teal `#0D9488` | 3.74 | Fails for normal text. Large text only (24 px, or 19 px bold). |
| `#171717` on teal | 4.79 | Passes. |
| Teal on `#171717` | 4.79 | Passes, but looks thin when small. For small teal text on dark use teal-400 `#2DD4BF` (9.63). |
| White on teal-700 `#0F766E` | 5.47 | Use for primary buttons with white text. |
| Grey `#808080` on `#171717` | 4.54 | A bare pass: 16 px and up only. For secondary text on dark prefer `#A3A3A3` (7.11). |
| Grey `#808080` on white | 3.95 | Fails. On white use `#5C5C5C` (6.69). `#767676` is the lightest grey that passes on white. |
| Silver on `#171717` | 9.85 | Fine. |
| Silver on white | 1.82 | Never use for text or meaningful lines on white. |
| Wine on `#171717` | 1.86 | Never use for text or hairlines on dark. On dark, use wine-300 `#F4A5AA` (9.23) or wine-400 `#D2868B` (6.42) for text, and wine as a fill behind white text. |
| White on wine | 9.65 | Excellent: alert banners and the "denied" state. |
| Blue on `#171717` | 3.47 | Large text and UI only. For small text on dark use blue-400 `#60A5FA` (7.05). |
| Blue on white, white on blue | 5.17 | Links on white, buttons. |
| White on teal-900 `#134E4A` | 9.48 | The teal-flood section. |

The first version of this brief said grey on black fails AA. It passes (4.54), but only just, so treat it as a minimum.

**Ramps** (put them in `tokens.css`, and check them with a contrast script like synov-timer's `scripts/contrast.mjs`, which must test every text and background pair the CSS actually uses):

- **Teal:** 50 `#F0FDFA` · 100 `#CCFBF1` · 200 `#99F6E4` · 300 `#5EEAD4` · 400 `#2DD4BF` · 500 `#14B8A6` · 600 `#0D9488` (brand) · 700 `#0F766E` · 800 `#115E59` · 900 `#134E4A` · 950 `#042F2E`
- **Blue:** 400 `#60A5FA` · 500 `#3B82F6` · 600 `#2563EB` (brand) · 700 `#1D4ED8` · 900 `#1E3A8A` · 950 `#172554`
- **Wine** (OKLCH, hue 15): 50 `#FFF1F2` · 100 `#FBE3E4` · 200 `#FBC9CB` · 300 `#F4A5AA` · 400 `#D2868B` · 500 `#B6656C` · 600 `#9C4D55` · 700 `#853942` · 800 `#722F37` (brand) · 900 `#4E1920` · 950 `#37030E`
- **Neutral** (pure grey, containing silver, grey and black): 50 `#FAFAFA` · 100 `#F4F4F4` · 200 `#E6E6E6` · 300 `#D4D4D4` · 400 `#C0C0C0` (silver) · 500 `#A3A3A3` · 600 `#808080` (grey) · 700 `#5C5C5C` · 800 `#2E2E2E` · 850 `#222222` · 900 `#171717` (black) · 950 `#0D0D0D`

**Don't look like a template.** Teal `#0D9488`, blue `#2563EB` and black `#171717` are exactly Tailwind's old default teal-600, blue-600 and neutral-900. Used the default way, they look like every Tailwind starter. So:

- Remove Tailwind's default palette (`--color-*: initial;` inside `@theme`) and expose only our ramps plus semantic aliases (`--color-live`, `--color-data`, `--color-alert`, `--color-structure`, `--color-surface`, `--color-ink`, `--color-ink-muted`). The aliases change per section register.
- Get distinctiveness from material (chrome, glass, light), typography, composition and motion, not from hue.

**Chrome material (CSS).** A vertical gradient from white through `#C0C0C0` to `#8A8A8A`, for text and 1 px borders on dark, with an optional specular highlight whose position follows scroll progress (`--p`). Use at most one chrome word per headline, for example "reality." in the hero.

**Texture.** A static 2 to 3% noise overlay on dark sections (inline SVG under 2 KB) to stop gradient banding. A soft vignette on the hero only.

#### 4.3 Typography

- **Urbanist** (variable) for display and interface. Its single-storey "a" and round "o" match the wordmark.
- **Geist Mono** (variable) for data, telemetry, codes, labels and step counters ("01 / 05").
- Body text: weight at least 450 on dark backgrounds, line-height 1.6, 17 px on phones and 18 px on desktop, 60 to 68 characters per line.
- Display: tracking about −0.035em, line-height 0.95, fluid sizes with `clamp()`.
- Labels echo the tagline: uppercase, tracked +0.2em to +0.5em. Giant background words are outlined with `-webkit-text-stroke`.
- Self-host with the Astro 7 Fonts API (top-level `fonts` in `astro.config`, local provider, files from Fontsource): Latin subset, woff2, and `<Font cssVariable=... preload>` only for the hero weight. Tune fallback metrics so the font swap causes no layout shift.
- In `/lab`, set Urbanist with Geist Mono next to the wordmark, against three alternatives: Mona Sans; Unbounded for display with Instrument Sans for text; and Jost. Urbanist with Geist Mono is the default. `docs/type-test.png`, if present, is my quick test of it.

### 5. Design direction: "Chrome & Signal"

**The bar.** Extremely beautiful, aesthetic and modern is a core requirement. A section that works but isn't beautiful is unfinished. In practice:

- **Restraint:** one idea per screen, generous space, a strict grid (12 columns on desktop, 4 on phones, 4 px baseline), and obsessive alignment.
- **Material:** the chrome and teal of the logo, lit like real objects.
- **Type as image:** large, confident headlines, and huge outlined words behind objects for depth.
- **Motion with meaning:** every animation shows something we actually do. If it explains nothing, cut it.
- **Contrasting registers:** black stages, white paper, a teal flood. synov-timer's weakness was sameness (every section was the same navy glass); ours changes mood on purpose.
- **Detail:** 1 px hairlines at about 12% alpha, a small radius scale (6, 12, 20, full), one icon stroke width (1.5 px), crisp focus rings, nothing blurry, nothing misaligned at 320 px.
- **A quiet DOM:** few elements, each doing work.

**The concept: one signal, many states.** The teal sphere from the logo is the hero of the whole site. It is "the signal": proof that something real is happening.

1. **Hero:** the 3D S mark in chrome and teal, with the sphere riding its orbit.
2. **Selvion:** as you scroll, the sphere leaves the orbit and drops into the Selvion map, where it becomes the vehicle.
3. **Estate:** it becomes the gate's status light, teal for verified and wine for denied.
4. **Websites:** it becomes the blinking caret and the pulse on "Publish".
5. **Services and process:** it is the status dot, running then passed.
6. **Closing CTA:** it returns to its orbit around the S. The page ends where it began.

**Section moods (colour as architecture)**

| Section | Register |
|---|---|
| Hero | Black stage, chrome and teal light |
| Statement | Black, a giant outlined "REALITY" |
| Selvion story | Night map: silver roads, blue water, a teal route, wine alerts |
| Estate story | Night gate: wine and teal lights |
| Website demo, services, FAQ | White paper, neutral ink, teal and blue accents |
| How we work | Dark pipeline |
| Principles | Teal flood (teal-900 or teal-950 with white text) |
| Closing CTA, footer | Black, the mark returns |

There is no light/dark toggle: the registers are the design. Each section declares `data-theme="dark|paper|teal"` and the header adapts, as synov-timer's nav does.

**Principles from my synov-timer notes** (`../synov-timer/references/NOTES.md`): one object, many states; colour as architecture; type behind objects; an x-ray view (we use it for debugging); explode, then reassemble (we use it for architecture); a living camera (a subtle drift, never static, never seasick); a quiet DOM.

**Don't**

- Generic SaaS styling: gradient blobs, purple "AI" glows, glassmorphism everywhere, bento grids of made-up metrics, logo walls, fake dashboards full of lorem ipsum.
- Preloaders, "scroll down" mouse icons, cursor trails, scroll-jacking that fights the user, loops that never stop.
- Number counters tied to scroll position. synov-timer's stopped at 58% when you stopped scrolling. Ours start when seen and always finish.
- More than one WebGL scene. synov-timer's audit found too many 3D scenes. We have one 3D object, the mark, used as bookends.
- Metaphors with no information. Every scene must teach the visitor a fact about the product or service.
- Anything that looks like a default Tailwind or template site.
- Anything resembling primetrack.rw. Its fleet hero is an orange route drawing itself on a dark map; Selvion's story must look clearly different.

### 6. synov-timer: what to take and what to beat

`../synov-timer` is my build for Raleston Consulting (live at synov-timer.pages.dev). Its engine is good. Port these, adapting rather than copying blindly, and reuse none of its copy, colours or Raleston content:

| Where | What to take |
|---|---|
| `src/scripts/main.ts`, `scroll.ts` | One GSAP ticker drives Lenis (`lerp: 0.085`, `syncTouch: false`, `wheelMultiplier: 0.9`), `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.lagSmoothing(0)`, `ScrollTrigger.config({ ignoreMobileResize: true })`. |
| `src/lib/layout.ts`, `store.ts` | The layout cache (`track` / `rectOf`): no `getBoundingClientRect` per frame, and style writes skipped when the value hasn't changed. |
| `src/scripts/hero.ts`, `scenes.ts` | The pinned stage: stations that dwell then travel, lengths in `svh`, a segmented progress meter with a "0X / 05" label, leader lines, the phone layout (stage on top, note at the bottom), and pausing off screen with IntersectionObserver (`is-off`). |
| `src/styles/global.css` | The CSS 3D primitives (`.s3d`, `.s3d-world`, `.blk`, `.s3d-line`) driven by `--p`, `--tx` and `--ty`. Reveals only below the first screen (`ScrollTrigger.batch`, once). |
| `src/scripts/nav.ts` | The gliding hover highlight, the morphing flyout, the dock that compacts on scroll with a page-progress line, deep links into pinned sections, the mobile sheet, and theme switching from `data-theme`. |
| `src/styles/tokens.css`, `src/lib/tokens.ts` | `tokens.css` as the single source of truth, parsed with `?raw` for JavaScript and 3D. |
| `src/lib/schema.ts`, `og.ts`, `drafts.ts`, `src/pages/robots.txt.ts` | The JSON-LD graph, satori and sharp OG images, and `PUBLIC_SHOW_DRAFTS` builds that are noindexed. |
| `functions/api/contact.ts` | The Pages Function: verify Turnstile, then send. We use Resend. |
| `scripts/*.mjs` | `pages`, `pagefps`, `contrast`, `widths`, `tour`, `icons`: port all of them. |
| `astro.config.mjs`, `public/_headers` | `build.inlineStylesheets: 'always'` and immutable caching on `/_astro/*`. |

**Beat it.** My lab run on 7 October 2026 measured synov-timer at Lighthouse mobile 97 to 99 (LCP 2.0 to 2.3 s, CLS under 0.02) and desktop 100 (LCP 0.5 s), with about 162 KB of uncompressed JavaScript and 1,661 DOM nodes. Ours must be faster (section 13). It must also fix every finding in synov-timer's audit: headlines with no explanation, metaphors with no information, too many 3D scenes, a scroll-tied counter, and a one-page site with anchors instead of real pages. Ours has a real page for every service and product.

### 7. Site map and navigation

```
/                                     home
/services/                            overview of all six
/services/software-development/
/services/fixing-and-debugging/
/services/testing-and-qa/
/services/requirements-engineering/
/services/system-architecture/
/services/maintenance-and-support/
/products/                            overview
/products/selvion/                    Selvion fleet tracking
/products/estate-entrance-security/
/products/websites-with-admin-panel/
/how-we-work/
/about/
/work/                                only once there is permitted work (8.10)
/insights/   /insights/<slug>/
/contact/    /contact/thanks/
/privacy/    /cookies/    /terms/
/404
/lab/                                 design lab: noindex, out of the sitemap, dev and draft builds only
```

Adding a product or a service means adding one content file (and, optionally, a scene). The header, footer, sitemap, structured data and overview pages update themselves.

**Header:** the vector logo; Services (a flyout listing all six); Products (a flyout with Selvion, the Estate Entrance Security System and Websites with an Admin Panel, each with a one-line description and its status chip); How we work; About; Insights; and the primary button "Start a project". Port synov-timer's nav behaviours. On phones: a full-height sheet with large type, the CTA and WhatsApp.

**Footer:** services, products, company and legal links; email, WhatsApp and the area we serve; the BN number once I give it; the motion setting (Full / Reduced); and "Built around reality".

### 8. Home page, section by section

Every section needs a purpose, real copy (you draft it, I edit it), a visual, motion, a phone layout, and a reduced-motion and no-JavaScript version that carries the same information. Copy lives in content files, not inside components.

#### 8.1 Hero (black stage, 3D)

- Eyebrow (Geist Mono, teal-400): "Software engineering · Products · Nigeria"
- H1: **"Software built around reality."** with "reality." in chrome.
- Lead: "We build, fix, test and maintain software for Nigerian businesses, and we make products for fleets, estates and growing companies."
- Buttons: "Start a project" (primary), "See our products" (secondary), and a WhatsApp link.
- Under the buttons, a mono telemetry line that hints at the products, labelled as demo data, for example `UNIT 07 ON ROUTE · GATE CODE 482 913 · STATUS VERIFIED`.
- The 3D mark sits on the right on desktop, and behind and below the text on phones. Poster first (section 10). On fine pointers it tilts slightly toward the pointer (up to 8°). The sphere orbits for a few seconds on load and after interaction, then rests.
- A short pin (about 50svh on desktop, 45svh on phones): scrolling turns the mark and moves the camera in, and near the end the sphere leaves its orbit.
- **The hand-off:** project the sphere's screen position, swap in a DOM sphere at exactly that point, and let the DOM sphere travel down into the Selvion map. If this isn't seamless at 60 fps on a mid-range phone, use a clean cut instead and record that in DECISIONS.md.
- The LCP element must be the H1 (or the poster, if the poster wins, in which case preload it). Nothing above the fold waits for JavaScript.

#### 8.2 Statement (black)

A giant outlined "REALITY" sits behind, and the lines reveal through masked SplitText. Draft copy:

> Software should fit the way your business really works: the roads your drivers take, the gate your guard opens, the page your team needs to change tonight. We start from that, and build around it.

#### 8.3 Selvion story (night map, pinned, five stations)

Heading (draft): "Selvion: know where every vehicle is, and what it's doing." One plain sentence under it.

Each station has a short heading and one plain sentence. A station renders only if the feature behind it is `confirmed` in the Selvion content file.

1. **Ignition on.** The vehicle's status light turns teal. Mono readout: `UNIT 07 · IGNITION ON · 06:42`.
2. **Live on the map.** The route draws in teal along silver roads, and the signal moves along it with speed and time.
3. **Out of zone.** The dashed silver geofence flashes wine as the vehicle crosses it.
4. **Alert.** A phone slides in with the alert, wine accent: "Unit 07 left Depot A at 07:18".
5. **Trip report.** The map pulls back into a report card (distance, time, stops, top speed). The numbers count once and finish.

Visual: a stylised vector map in SVG (no map tiles, no Google Maps embed), a segmented 01 / 05 meter, and a visible "Demo data" label. Phones: stage on top, note at the bottom. Reduced motion: the five stations as a numbered list of still frames. Under the story, the call to action that matches Selvion's status ("Talk to us about it" until I confirm otherwise) and a link to `/products/selvion/`.

#### 8.4 Estate Entrance Security System story (night gate, pinned, five stations)

1. A resident creates a one-time visitor code on their phone: six digits, valid until a set time.
2. The visitor receives it in a message (a generic chat bubble, no WhatsApp branding).
3. The visitor arrives at the gate.
4. The guard enters the code. Split-flap mono digits settle, the light turns teal and reads "VERIFIED". A keyboard-accessible "Try a wrong code" button shows the denied path in wine.
5. The entry is logged and the resident is notified. A log row appears ("14:06 · Visitor for House 12 · Verified") and the resident's phone shows "Your visitor has arrived". Show a barrier lifting only if barrier control is a confirmed feature; otherwise the guard opens the gate.

The same rules as 8.3 apply: confirmed features only, "Demo data" label, phone layout, reduced-motion still frames, CTA from status, link to the product page.

#### 8.5 Websites with an Admin Panel (white paper, interactive)

A real, working mini demo, not a video.

- **Left:** a simplified admin panel with a page list, a headline field, a text field, "Add page" and "Publish".
- **Right:** a live preview of a fictional business site, labelled "Example site".
- Typing in a field updates the preview instantly (use `textContent`; nothing is stored or sent).
- "Add page" adds a page to the preview's menu with a view transition. "Publish" pulses teal and shows "Published".
- If the visitor hasn't touched it when it scrolls into view, it types one example edit by itself, once.
- Fully usable by keyboard and screen reader.
- Copy says what the client can do without a developer. No prices unless I give them.

#### 8.6 Services (white paper)

Six cards. Each has a small SVG or CSS micro-visual that plays once when it enters the screen and again on hover or focus, and each links to its service page.

| Service | Micro-visual |
|---|---|
| Software development | Blocks stacking into a structure |
| Fixing and debugging | An x-ray lens passes over a UI card and reveals its wiring; a wine node turns teal |
| Testing and QA | Test lines ticking green; one fails in wine, then passes |
| Requirements engineering | Scattered notes snap into a numbered spec |
| System architecture | A diagram explodes into parts and reassembles, its connections drawing in |
| Maintenance and support | An uptime heartbeat line over a row of weekly bars |

#### 8.7 How we work (dark pipeline)

A pipeline styled like a CI run, with seven stages: Discover, Requirements, Architecture, Build, Test, Launch, Maintain. Each stage is a node with a status chip (queued, running, passed) and one line on what the client gets from it. The line fills as you scroll: scrubbed, not pinned. No durations unless I give them.

#### 8.8 Principles (teal flood)

Three or four short principles, drafted for me to edit. For example: "We start from how you actually work." "Plain language, no surprises." "Tested on the phones your customers use." "We stay after launch."

#### 8.9 Industries

The sectors we serve, in a horizontal band that moves with scroll (never on its own). Draft list, every item marked TO CONFIRM: logistics and transport; residential estates and facility management; retail and SMEs; professional services; education; hospitality.

#### 8.10 Work (hidden for now)

This section renders only when at least one case study has `permission: true`. Candidates are the Raleston Consulting site (synov-timer) and the PrimeTrack Rwanda site, but only once each client agrees in writing. Until then, neither name appears anywhere on the site.

#### 8.11 FAQ (white paper)

Six to eight real questions with answers drafted for me to confirm: how pricing works (we quote after a call), how long projects take, whether we fix software someone else built, who owns the code, maintenance after launch, whether we work across Nigeria, and product availability (driven by status). Use native `<details>` so it works without JavaScript.

#### 8.12 Closing CTA (black, the bookend)

The 3D mark returns (the same canvas and WebGL context, moved, not a second one) and the sphere settles back into its orbit. Draft headline: "Tell us how your business really works." Buttons as in the hero, plus email. A giant outlined "REALITY" behind.

#### 8.13 Footer and 404

The footer is described in section 7. The 404 page: "Signal lost." The sphere drifts off its orbit, with links to the home page, products and contact.

### 9. Inner pages

- **Service page:** a hero with the service's micro-visual at large size; the problem in the client's words; what we do; what you get (deliverables); how it works (linking to `/how-we-work/`); related products and articles; FAQ; CTA; breadcrumbs.
- **Product page:** an H1 with the product's name and what it is (for example "Selvion fleet tracking for Nigerian businesses"); who it's for; how it works (a shorter, lighter version of the home story, not a copy); confirmed features only; the status chip and status CTA; FAQ; CTA. The product card on the home and overview pages morphs into the product page hero (a named view transition).
- **How we work:** the full pipeline, what we need from the client at each stage, how we communicate, and what happens after launch.
- **About:** why Synovika exists, what "Built around reality" means, how we work, where we are. A founder section only if I say yes and give you a bio and photo.
- **Insights:** an index and an article template (reading time, author, dates, table of contents, related links). The author is me unless I say otherwise.
- **Contact:** a form (name, email, optional phone, optional company, what you need as a choice of services and products, message, consent checkbox), plus WhatsApp and email. Consent wording is in section 15.
- **Legal:** privacy, cookies and terms (section 15).

### 10. 3D engineering

One WebGL canvas for the whole site, on the home page only, used for the mark in the hero and again in the closing CTA.

- **Library:** three r186 with `WebGLRenderer` (not WebGPU, for reach). Import only what you use; addons from `three/addons/`.
- **Poster first, live on intent.** Ship a pre-rendered AVIF poster of the mark (1x and 2x, under 60 KB on phones, with explicit width and height), rendered by a script from the same scene and camera so the swap is invisible. Load the 3D chunk on the first pointer move, scroll or touch, or after 5 seconds of main-thread idle (`requestIdleCallback`), then crossfade from the poster. This protects LCP and TBT.
- **Device tiers:** use `detect-gpu` with self-hosted benchmark files (set `benchmarksURL`; never fetch them from a CDN), plus `navigator.connection.saveData`, `effectiveType`, `deviceMemory` and `prefers-reduced-motion`.
  - Tier 0, no WebGL, Save-Data or reduced motion: the poster only, which must still look beautiful.
  - Tier 1: live, at DPR 1 with simpler geometry.
  - Tier 2 and up: full quality. DPR caps at 1.5 on phones and 2 on desktop.
- **Geometry:** from the cleaned `mark.svg` paths via `SVGLoader` and `ExtrudeGeometry` with a small bevel. The teal and silver faces are separate meshes with slight depth offsets to recreate the fold. The orbit ring is a thin torus scaled into an ellipse and tilted as in the logo. The sphere has enough segments to stay round at 2x.
- **Materials and light:** `MeshPhysicalMaterial`. Chrome: metalness 1, roughness about 0.18 to 0.22. Teal faces and the sphere: teal base, clearcoat 1, low clearcoat roughness. Environment lighting from `RoomEnvironment` through `PMREMGenerator` (no HDR downloads), plus one key light for speculars. AgX or Neutral tone mapping, sRGB output. No real-time shadows; a soft baked contact shadow if it needs one.
- **Colours** come from `tokens.css` via `tokens.ts`, never hard-coded.
- **Render on demand:** draw only when something changed (scroll, pointer, an active tween), and stop when idle, off screen (IntersectionObserver) or when the tab is hidden. Use GSAP's ticker, not a second loop.
- **Robustness:** handle `webglcontextlost` by falling back to the poster, and dispose geometry, materials and textures on `pagehide`.
- **Worker:** try OffscreenCanvas in a worker only if it measurably lowers TBT, and record the result.
- **Product scenes** use SVG, DOM and CSS 3D (the synov-timer primitives), not WebGL.
- **In `/lab`:** a mark page with sliders for roughness, clearcoat, light angle and camera, so I can approve the look.

### 11. SEO

The goal is the most complete technical SEO we can do, honest content that answers real questions, and pages that search engines and AI assistants understand easily.

**Technical**

- Static HTML for every page. `site` comes from `PUBLIC_SITE_URL`. `trailingSlash: 'always'`, `build.format: 'directory'`, absolute canonical URLs.
- `<html lang="en-NG">`. One language, so no hreflang.
- A unique `<title>` (aim for under 60 characters) and meta description (about 150) on every page, from content frontmatter, checked at build for length and uniqueness:
  - Home: "Synovika | Software development company in Nigeria"
  - Services: "{Service} in Nigeria | Synovika", for example "Software testing and QA in Nigeria | Synovika"
  - Selvion: "Selvion: fleet tracking software for Nigeria | Synovika"
  - Estate: "Estate Entrance Security System | Synovika"
  - Websites: "Websites with an admin panel for Nigerian businesses | Synovika"
- One H1 per page, headings in order, descriptive link text.
- `@astrojs/sitemap` with `lastmod` from content dates, excluding `/lab/`, drafts, `/contact/thanks/` and 404.
- `robots.txt` generated per environment (port `robots.txt.ts`). Production allows crawling and points to the sitemap. Draft and preview builds disallow everything and send `X-Robots-Tag: noindex`. In `_headers`, `https://:project.pages.dev/*` gets `X-Robots-Tag: noindex`, so only the real domain is indexed.
- Images through `astro:assets`: AVIF or WebP, width and height set, lazy below the fold, real alt text.
- Open Graph and Twitter tags on every page, with a per-page OG image generated by satori and sharp (port `og.ts`) in the brand style.
- Prefetch internal links on hover (Astro's prefetch or Speculation Rules; pick one).
- The 404 page returns status 404. Redirects (www to the bare domain, or the reverse, as I choose) go in `_redirects`.

**Structured data**

One JSON-LD `@graph` per page with stable `@id`s, typed with `schema-dts` and built in `src/lib/schema.ts`. It only describes what is visible on the page.

- `Organization` (`#organization`): name "Synovika Technologies", alternateName "Synovika", url, logo (`logo-512.png`), slogan "Built around reality", description, email, areaServed Nigeria, knowsAbout (our services), and sameAs with real profiles only. Switch to `ProfessionalService` with an address only once there is a real address I want public. Add `founder` only if I agree.
- `WebSite` (`#website`): name and alternateName, which help Google show the right site name. No SearchAction.
- `WebPage` on every page, and `BreadcrumbList` on inner pages.
- `Service` on each service page: provider pointing to the organization, serviceType, areaServed.
- `SoftwareApplication` on product pages: name "Selvion" (and the other product names on their pages), applicationCategory "BusinessApplication", operatingSystem "Web", publisher pointing to the organization, description, and featureList from confirmed features only. No ratings, offers or prices: we have none to show, and we don't fake them.
- `FAQPage` only where the FAQ is visible. Google stopped showing FAQ rich results for all sites on 7 May 2026, so this is for understanding, not for stars in results.
- `BlogPosting` on articles, with a real author (`Person`), datePublished and dateModified.
- A test (`scripts/jsonld.mjs`) parses every page's JSON-LD and checks that it is valid, that every `@id` reference resolves, and that names match the visible text. I'll also run Google's Rich Results Test before launch.

**AI search and answer engines**

- Google says AI Overviews and AI Mode need no special optimisation: pages must be crawlable and indexable, with helpful text and structured data that matches what's on the page. Do that well. Every key fact is in HTML text, not in images and not only in JavaScript.
- Bing's index feeds Copilot and is one of the sources behind ChatGPT search, so set up Bing Webmaster Tools and IndexNow (Cloudflare's Crawler Hints can send IndexNow pings automatically).
- `llms.txt` is optional and low priority, since Google doesn't use it. Add a short one only if it's cheap.
- **Cloudflare bot settings:** Cloudflare's managed robots.txt can prepend Disallow rules for AI crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended, Applebot-Extended, Bytespider, Amazonbot, meta-externalagent), and its AI crawler defaults changed during 2026. Search crawlers and user-triggered fetchers must always be allowed. Whether to allow AI training crawlers is my decision; the default is to allow them, because a new brand gains from being known. Record the decision in DECISIONS.md and set Cloudflare to match. After any bot setting change, run a live URL test in Google Search Console and Bing Webmaster Tools to confirm Googlebot and Bingbot still get a 200, because some blocking options catch them too.

**Local presence and entity**

- The same name, email, phone and service area everywhere: the site, Google Business Profile (as a service-area business with the address hidden), Bing Places and Apple Business Connect. I'll create the profiles; you write the exact text to paste into each, in `docs/LAUNCH.md`.
- The About page states who we are in plain facts, which helps search engines connect the Synovika entity across the web.

**Content**

- A keyword map in `docs/SEO.md`: one primary topic per page, and no two pages competing for the same one. Seeds to validate with real Search Console data after launch:
  - software development company in Nigeria; custom software development Nigeria
  - software maintenance and support Nigeria; software testing services Nigeria; software bug fixing; requirements engineering; system architecture consulting
  - Selvion; fleet tracking software Nigeria; vehicle tracking system for businesses; geofence alerts
  - estate access control Nigeria; estate visitor management system; visitor access code app
  - website with admin panel Nigeria; business website design Nigeria
- Insights: eight article ideas, drafted for my review, marked draft, with no invented statistics and every source cited:
  1. How to choose a fleet tracking system for a Nigerian business
  2. Geofences explained: what zone alerts can and can't tell you
  3. Estate visitor codes versus paper logbooks: how one-time codes work
  4. What a website admin panel should let you do without a developer
  5. Write down what you need before you pay for software: requirements for small businesses
  6. Inheriting software from a developer who left: a rescue checklist
  7. Testing on the phones your customers actually use
  8. Privacy notices, cookies and contact forms: NDPA basics for small business websites (general information, not legal advice)
- Credit link on client sites we build: "Site by Synovika", with the brand name as the anchor text. Google's link spam policy treats widely distributed footer links as a risk, so add `rel="nofollow"` unless I decide otherwise.

**Measurement:** Cloudflare Web Analytics (cookieless, and it reports real-user Core Web Vitals), Google Search Console (a domain property verified through DNS), and Bing Webmaster Tools. No Google Analytics and no ad pixels: they would need a consent banner (section 15).

### 12. Motion system

- The engine is described in section 6: GSAP with ScrollTrigger and SplitText (all GSAP plugins have been free since 3.13), and Lenis for smooth wheel scrolling, with native scrolling on touch.
- **Motion tokens** in `tokens.css`: durations (120, 240, 480, 800 ms) and eases (`--ease-out: cubic-bezier(.22, 1, .36, 1)`, an in-out ease, and a gentle spring for magnetic buttons). Use them everywhere.
- **Pins:** lengths in `svh`, stored as tokens. Stations dwell, then travel. The meter and labels update per station, not per pixel.
- **Reveals** only below the first screen. Content is visible by default and is hidden only once JavaScript has confirmed it will animate it, so nothing stays invisible if a script fails.
- **Text:** SplitText with masks and its `aria` handling, for headline line reveals only. Never split body copy.
- **CSS scroll-driven animations** (`animation-timeline`) are allowed as extras only. Chrome and Edge 115+ and Safari 26+ support them; Firefox stable doesn't (as of version 152). Everything must still work without them.
- **Page transitions:** native cross-document view transitions (`@view-transition { navigation: auto; }`) with named elements: the logo, the page title, and product card to product hero. Don't use Astro's ClientRouter; it would complicate the GSAP, Lenis and WebGL lifecycles. Browsers without support simply navigate normally.
- **Pointer:** magnetic primary buttons (`gsap.quickTo`, at most 6 px, fine pointers only). A custom cursor only if `/lab` convinces me; it is off by default.
- **Motion setting:** "Full" or "Reduced" in the footer, stored in localStorage, applied by an inline script in `<head>` before first paint, defaulting to the system's `prefers-reduced-motion`. Reduced means no pins, no smooth scrolling, no parallax and nothing that plays by itself; scenes become still frames in order, with the same content.
- Nothing moves on its own for more than five seconds (WCAG 2.2.2).
- **Responsiveness (INP):** input handlers stay light. No layout reads inside them, passive listeners, and visual work batched onto the ticker.

### 13. Budgets

Measured by scripts and enforced in CI.

| Metric | Budget | synov-timer |
|---|---|---|
| Lighthouse mobile Performance | 97 or more (95 is the hard floor) | 97 to 99 |
| Lighthouse Accessibility, Best Practices, SEO | 100 | |
| Lighthouse desktop Performance | 100 | 100 |
| LCP, Lighthouse mobile | 2.0 s or less | 2.0 to 2.3 s |
| LCP, desktop | 0.8 s or less | 0.5 s |
| CLS | 0.02 or less | under 0.02 |
| TBT, mobile | 150 ms or less | |
| INP, real users (p75, Cloudflare Web Analytics) | 150 ms or less | |
| Initial JavaScript on the home page (gzip) | 65 KB or less | about 162 KB uncompressed |
| 3D chunk, lazy-loaded (gzip) | 200 KB or less | |
| Fonts | 80 KB or less, with at most two preloaded files | 39 KB |
| Home page HTML including inlined CSS (gzip) | 60 KB or less | |
| DOM nodes on the home page | 1,500 or fewer | 1,661 |
| Hero poster on phones | 60 KB or less (AVIF) | |
| Frame time p95 while scrolling every scene | 20 ms or less on desktop; 34 ms or less at 4x CPU throttle at 390 px | 60 fps on desktop |
| Horizontal overflow | none from 320 to 1920 px | |

Google's "good" Core Web Vitals thresholds are unchanged (LCP 2.5 s, INP 200 ms, CLS 0.1). Our budgets are deliberately tighter.

### 14. Accessibility

WCAG 2.2 AA throughout.

- axe reports zero violations on every page, in both motion modes.
- **Keyboard:** every control is reachable and usable, including the demos and the "Try a wrong code" button. Visible focus ring: 2 px with a 2 px offset, teal-400 on dark and blue-600 on white, at least 3:1. Focus is never hidden under the sticky header (`scroll-padding-top`). A skip link, and a logical tab order.
- Touch targets at least 24 × 24 px, and 44 px wherever the layout allows.
- Pinned stories are ordered lists in the DOM, with all five stations as real text, so screen readers get every step. Decorative SVG and the canvas are `aria-hidden`; the hero copy carries the meaning.
- Colour is never the only signal: verified and denied also have a word and an icon.
- Works at 200% zoom and at 320 px wide, and respects forced-colours mode.
- **Forms:** real labels, errors announced through `aria-live`, no placeholder-only fields.
- **Content parity:** `scripts/nojs.mjs` and `scripts/motion-parity.mjs` compare every page's text content without JavaScript and with reduced motion against the default render.

### 15. Privacy and compliance (Nigeria)

This is general information to build from, not legal advice. The legal pages stay marked as drafts until a lawyer reviews them.

- **The law:** the Nigeria Data Protection Act 2023 and the General Application and Implementation Directive (GAID) 2025, issued 20 March 2025 and in force since 19 September 2025.
  - Publish clear privacy and cookie notices (GAID Article 7).
  - Non-essential cookies need consent first, with a prominent banner visible without scrolling and equally clear "Accept" and "Reject" choices (GAID Article 19).
- **Design so no banner is needed:** cookieless analytics (Cloudflare Web Analytics), no ad pixels, no third-party embeds (no YouTube or Google Maps iframes; use a click-to-load placeholder if one is ever needed), self-hosted fonts. Turnstile is a security measure on the form; describe it in the cookie notice. If we ever add tracking, a GAID-compliant consent banner comes first.
- **Privacy notice** covers: who we are (Synovika Technologies, the BN number once available, contact details); what we collect (form fields, and messages sent by WhatsApp or email); why; the lawful basis; how long we keep it; who processes it for us (Cloudflare, Resend); transfers outside Nigeria; people's rights (access, correction, deletion, withdrawing consent, and complaining to the Nigeria Data Protection Commission); and a privacy contact (`TODO(hero)` until I name one).
- **Contact form consent:** a required, unticked checkbox linking to the privacy notice, saying the message is processed by our email provider outside Nigeria so that we can reply.
- The site itself stores no personal data: the function forwards the message by email and keeps nothing.

### 16. Stack and versions

Checked on 10 October 2026. Re-check before installing and pin exact versions.

| Package | Version noted | Notes |
|---|---|---|
| astro | 7.3.x | Vite 8 with Rolldown, Rust compiler |
| tailwindcss with @tailwindcss/vite | 4.3.x | CSS-first configuration with `@theme` |
| gsap | 3.15.x | ScrollTrigger, SplitText, Flip if useful |
| lenis | 1.3.x | |
| three | 0.186.x | |
| detect-gpu | 5.0.x | self-host its benchmarks |
| satori, sharp | 0.47.x, 0.35.x | OG images and icons |
| schema-dts | 2.1.x | typed JSON-LD |
| @astrojs/sitemap, @astrojs/check | the versions for Astro 7 | |
| typescript | whichever version @astrojs/check supports | TypeScript 7 is out; don't jump to it unless it's supported |
| playwright, @axe-core/playwright | 1.64.x, 4.13.x | |
| @lhci/cli | 0.15.x | Lighthouse CI |
| html-validate, linkinator | 11.x, 8.x | |
| wrangler | 4.x | local Pages Functions and secrets |
| potrace, svgo | 2.1.x, 4.x | logo vectorising, dev only |

No React and no UI kit. Use vanilla TypeScript modules for interactivity and Astro components for markup.

**Astro 7 changes that will bite** (read the official v7 upgrade guide too):

- The compiler is stricter: unclosed tags are errors and invalid nesting is no longer fixed for you.
- `compressHTML` defaults to `'jsx'`, which removes whitespace between inline elements. Write `{" "}` where a space matters.
- Markdown renders with Sätteri by default. remark and rehype plugins need `@astrojs/markdown-remark` with `processor: unified()`.
- `src/fetch.ts` is a reserved filename, `@astrojs/db` has been removed, and the `astro:transitions` event-name constants are gone (we don't use ClientRouter anyway).
- The Fonts API lives under the top-level `fonts` key.
- `astro dev --background` with `astro dev status`, `logs` and `stop` keeps a dev server running while you work. Use it.

### 17. Project structure and content model

```
brand/                         source logo and traced SVGs
docs/                          BRIEF.md, DECISIONS.md, PROGRESS.md, SEO.md, LAUNCH.md
functions/api/contact.ts       Pages Function
public/                        favicons, webmanifest, _headers, _redirects, gpu benchmarks, posters
scripts/                       icons, trace-logo, poster, contrast, pages, pagefps, widths, tour,
                               jsonld, nojs, motion-parity, prod-guard (.mjs)
src/content.config.ts
src/content/                   services/, products/, insights/, faq/, industries/, pages/
src/data/site.ts               name, contacts, service area, socials, nav: the single source
src/styles/                    tokens.css, global.css
src/lib/                       tokens, layout, store, schema, seo, og, drafts, gpu (.ts)
src/scripts/                   main, scroll, nav, reveal, motion-pref (.ts)
src/scripts/scenes/            selvion, estate, admin-demo, services, pipeline (.ts)
src/scripts/three/             mark, poster-swap, tiers (.ts)
src/components/                ui/, sections/, scenes/, seo/, brand/
src/layouts/                   Base.astro, Page.astro, Article.astro
src/pages/
```

**Content collections** (validated schemas):

- `products`: name, slug, descriptor, summary, status (`live`, `pilot`, `in-development`), audience, story stations (each tied to a feature), features (`title`, `body`, `confirmed`), faqs, seo (`title`, `description`), order, and an optional logo. The first file is `products/selvion.md`: name "Selvion", descriptor "fleet tracking platform".
- `services`: name, slug, summary, problem, deliverables, micro-visual, faqs, seo, order.
- `insights`: title, description, author, published, updated, draft, tags.
- `faq`, `industries` (with `confirmed`), and `pages` for the About and legal copy.

### 18. Deploy and security

- **Hosting:** Cloudflare Pages, with a static build and a Pages Function for `/api/contact`, as in synov-timer. Workers with static assets is the alternative Cloudflare now recommends for new projects. Pick one and record why in DECISIONS.md.
- Preview deployments on `*.pages.dev` are noindexed (section 11). Production runs on my domain.
- **Contact function:** server-side validation, a honeypot field, Turnstile verification, rate limiting (a Cloudflare rule), then send with Resend to `CONTACT_TO` with reply-to set to the sender. Nothing is stored. Without JavaScript, the form says it needs JavaScript and offers email and WhatsApp instead.
- **Secrets** live only in Cloudflare (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`). `.env.example` lists the names only. Public variables: `PUBLIC_SITE_URL`, `PUBLIC_TURNSTILE_SITE_KEY`, `PUBLIC_SHOW_DRAFTS`.
- **`_headers`:**
  - HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
  - `Permissions-Policy` with camera, microphone and geolocation off.
  - `frame-ancestors 'none'`, and COOP `same-origin`.
  - A Content-Security-Policy that starts as `Report-Only` and is enforced before launch. Hash the inline scripts, and allow Turnstile and Cloudflare Web Analytics.
  - `Cache-Control: public, max-age=31536000, immutable` on `/_astro/*`.

### 19. QA harness and CI

npm scripts, ported from synov-timer where they exist:

| Script | Checks |
|---|---|
| `check` | `astro check` and TypeScript |
| `qa:contrast` | every text and background pair in use: at least 4.5 (3 for large text and UI) |
| `qa:pages` | every page builds and loads with no console errors, the right status code, and a present, unique title and description |
| `qa:fps` | frame times through every pinned scene, on desktop and on a 4x-throttled phone (local only, not in CI) |
| `qa:widths` | no horizontal overflow at 320, 360, 390, 414, 768, 1024, 1280, 1440 and 1920 px |
| `qa:tour` | screenshots of every page and scene station at 390 and 1440, saved to `qa/shots/` |
| `qa:a11y` | axe on every page, in both motion modes |
| `qa:lh` | Lighthouse CI on mobile and desktop, median of three runs, against the section 13 budgets |
| `qa:jsonld` | the structured data test from section 11 |
| `qa:links` | linkinator: no broken links |
| `qa:html` | html-validate |
| `qa:nojs`, `qa:motion` | content parity |
| `qa:prod-guard` | no `TODO(hero)`, no `TO CONFIRM`, no unconfirmed features in the production output |

GitHub Actions on every push and pull request: install, check, build, then every QA script except `qa:fps`, uploading the screenshots as an artifact.

Before the Phase 6 sign-off, also test in real Chrome, Safari (macOS and iOS), Firefox and Samsung Internet, and on a mid-range Android phone.

### 20. Phases and gates

At the end of each phase, stop, summarise what changed with screenshots, and wait for me to say go.

| Phase | What you deliver | Gate |
|---|---|---|
| **0. Plan** | DECISIONS.md (versions checked, every choice with its reason), a plan for each phase, CLAUDE.md, and at most ten questions for me, each answerable in a word, with your recommended default. | I answer the questions |
| **1. Foundation and brand lab** | Scaffold; tokens and the contrast script; fonts; the vector logo, favicons and icons; `/lab` (colours with their contrast, the type specimen with alternatives, buttons, links and forms in every register, the chrome material, the noise texture, section moods, easing samples, and the 3D mark with its sliders and poster); header and footer; the Base layout with all SEO plumbing (meta tags, JSON-LD graph, sitemap, robots, OG images); content collections with draft content; QA scripts ported and passing; CI. | I approve the look on `/lab` |
| **2. Hero and motion system** | The scroll engine, motion setting, reveals and view transitions; the hero with 3D, poster and device tiers; the statement section. Budgets measured. | I approve the hero on my phone |
| **3. Product stories** | The Selvion story, the estate story and the website admin demo. | I approve |
| **4. Rest of the home page** | Services, how we work, principles, industries, FAQ, the closing CTA bookend, the footer and the 404 page. | I approve |
| **5. Inner pages** | Service pages, product pages, how we work, about, insights (with the eight drafts), contact with its function, and the legal drafts. | I approve |
| **6. Audit** | Every budget in section 13 met, the accessibility walkthrough, cross-browser and real-device testing, fixes, and a performance report in PROGRESS.md. | Everything green |
| **7. Launch prep** | `docs/LAUNCH.md`: domain and DNS; Cloudflare settings (bots, Crawler Hints, Web Analytics, rate limiting); environment variables and secrets; Search Console, Bing and IndexNow; Business Profile text; enforce the CSP; remove draft flags; a final content review. | I launch |

### 21. What I still owe you

The list at the end of Part A. Until each item arrives, use `TODO(hero)` placeholders and keep a running list in PROGRESS.md.
