# Progress

## Now

**Phase 0 (Plan): done, waiting at the gate.** Hero answers the ten questions below, then Phase 1 starts.

## Done

### Phase 0, 10 October 2026
- Read the brief (Part B), synov-timer's README, `reference/AUDIT.md`, `references/NOTES.md`, and every file listed in brief section 6 (`../raleston-web`, see D-001).
- Checked every package version with `npm view` (the table in DECISIONS.md). Measured the font files: 50.9 KB for both variable fonts (Latin), against a budget of 80 KB.
- Read the Astro 7 upgrade guide, the Fonts API docs, and Cloudflare's guide to moving from Pages to Workers.
- Wrote `docs/BRIEF.md` (the brief, word for word), `docs/DECISIONS.md`, `docs/PLAN.md`, this file and `CLAUDE.md`.
- `git init -b main`; source logo copied to `brand/synovika-logo.png`.

## Next

Phase 1: foundation and brand lab (PLAN.md). It starts with the scaffold, then tokens and contrast, then the traced logo, because everything else depends on the mark.

## Questions for Hero (Phase 0 gate)

Each can be answered in a word. My recommended default is in brackets: if you skip a question, that is what I will do.

1. **Production domain?** (none: builds use `PUBLIC_SITE_URL`, which is a placeholder until you tell me)
2. **Public email address?** (`hello@` your domain)
3. **WhatsApp number, and may I show it as the phone number too?** (a `TODO(hero)` placeholder until given; yes, the same number)
4. **Area served: all of Nigeria, or a city or state first?** (all of Nigeria, working remotely)
5. **Product statuses: are all three still in development?** (yes: every CTA reads "Talk to us about it")
6. **Selvion: are ignition alerts, live map tracking, geofences, phone alerts and trip reports all confirmed features?** (no: unconfirmed stations stay out of production builds; see D-011)
7. **Estate system: are one-time six-digit codes, sending the code by message, the guard entering it, the entry log and notifying the resident all confirmed features?** (no, as above)
8. **Estate system: does it control the barrier?** (no: the guard opens the gate)
9. **May I draft Selvion's feature list from your SRS in `Synovika files/tracking-portal/`, with every item unconfirmed?** (yes)
10. **GitHub: will you create a private repo for this site and give me its URL?** (yes, named `synovika-website`)

Also: **Part A of the brief wasn't in your message.** Section 21 says your list of what you still owe me is at its end. If it holds anything beyond the list below, please paste it.

## Open `TODO(hero)` items

Until each one arrives, the site shows a `TODO(hero)` placeholder (dev and draft builds only) and the production guard fails on it.

**Facts and contacts**
- Production domain (Q1). Canonical host: bare domain unless you say otherwise (D-027).
- Public email (Q2), WhatsApp number and phone (Q3).
- Area served (Q4).
- CAC business name (BN) number, once registration completes.
- Social profiles to list in `sameAs` (only real ones).
- A privacy contact for the privacy notice (brief section 15).
- A public address, only if you want one shown (it switches the structured data to `ProfessionalService`).

**Products**
- Status of each product (Q5).
- Confirmation of each feature, per product (Q6 to Q8, and the full feature lists in Phase 5).
- Names for the estate and websites products, if and when they get names (one edit each in their content files).
- A Selvion logo, if one is made. Until then: a wordmark in the display face with "by Synovika".
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
- A Resend account with a verified sending domain, plus `CONTACT_TO` and `CONTACT_FROM`.
- AI training crawlers: allow (the default, D-028) or block.
- Google Search Console, Bing Webmaster Tools, Google Business Profile, Bing Places and Apple Business Connect: you create the profiles, I write the text.
- A lawyer's review of the privacy, cookies and terms pages.

## Section reviews

The three weakest things found in each round of the screenshot loop are recorded here, one section at a time.

## Performance report

Measured numbers against brief section 13, added from Phase 2 on.
