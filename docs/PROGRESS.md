# Progress

## Now

**Phase 1 (Foundation and brand lab): in progress.** Gate: Hero approves the look on `/lab`.

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

## Next

Phase 1, in order: scaffold; tokens and contrast; fonts; the traced logo and icons; the 3D mark and poster; `/lab`; header and footer; Base layout and SEO; content collections; QA scripts and CI.

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

The three weakest things found in each round of the screenshot loop are recorded here, one section at a time.

## Performance report

Measured numbers against brief section 13, added from Phase 2 on.
