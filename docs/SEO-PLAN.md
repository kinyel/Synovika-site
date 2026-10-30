# SEO plan: being found in Nigeria

Hero's goal: when someone in Nigeria searches for software engineering, requirements engineering, software projects, fleet or vehicle tracking, estate entrance security or visitor management, or business websites (including affordable ones and websites to buy), Synovika should come first.

## The honest part

Nobody can promise first place on Google. Google decides, and a new domain has to earn trust over months. Rankings come from three things together:

1. **The site:** fast, clear, useful pages that answer what people search. This is the part we control completely, and it's done (below).
2. **Signals from elsewhere:** links from other trustworthy sites, a Google Business Profile, consistent listings, real reviews. Only Hero can do most of these (the checklist below).
3. **Time:** expect the first movement in weeks, and steady gains over three to six months for competitive searches. Low-competition searches, like requirements engineering and estate visitor management, can move faster.

## Keyword map: one strong page per topic

One page per topic, so our own pages don't compete with each other.

| Searches in Nigeria | The page that should rank | Supporting guides |
|---|---|---|
| software company, software engineering company in Nigeria | Home | |
| custom software development company in Nigeria, software developers | `/services/software-development/` | custom software cost; choosing a software company |
| requirements engineering, software requirements specification, SRS | `/services/requirements-engineering/` | SRS guide; writing down what you need |
| software project planning, software project cost | `/how-we-work/` | planning a software project; custom software cost |
| software testing, QA services | `/services/testing-and-qa/` | testing on real phones |
| software bug fixing, rescuing software | `/services/fixing-and-debugging/` | rescue checklist |
| fleet management software, vehicle tracking platform, GPS fleet tracking | `/products/selvion/` | car tracker vs fleet platform; choosing fleet tracking; geofences |
| estate visitor management system, estate gate access, estate security app | `/products/estate-entrance-security/` | estate visitor management systems; codes vs logbooks |
| business website, website with admin panel, websites to buy, affordable websites | `/products/websites-with-admin-panel/` | affordable websites; buying a website; admin panel checklist |
| sector searches (software for logistics, estates, schools, retail...) | `/industries/<sector>/` | |

What we found in the results (October 2026):
- **Requirements engineering in Nigeria:** almost no real competition (lecture notes and academic papers). A strong opportunity.
- **Estate visitor management in Nigeria:** mostly app store listings, few real web pages. A strong opportunity.
- **Fleet and vehicle tracking:** vendor sites, news and directories. Winnable with the product page, guides and links.
- **Website costs and affordable websites:** agency blogs with price guides. We compete with honest guides; we don't publish prices we can't stand behind.
- **Custom software development company:** directories (Clutch, TechBehemoths) lead. We need listings there as well as our own page.

## Done on the site

- Titles, descriptions and H1s written the way people search, with "Nigeria" where it's true.
- Questions on every product and service page that match Google's "People also ask", in FAQPage structured data.
- Sixteen Insights guides, each opening with a short answer, linked to and from the pages they support ("Guides worth reading").
- A glossary of 27 terms as a DefinedTermSet.
- Structured data on every page: Organization (with contact points, area served, what we know about, and an offer catalogue), WebSite, WebPage with speakable, BreadcrumbList, Service, SoftwareApplication, ItemList, FAQPage, BlogPosting.
- `llms.txt` and `llms-full.txt` for AI assistants; robots.txt names the AI search crawlers and allows them.
- `hreflang` en-NG, geo meta for Nigeria, a share card for every page, a sitemap with dates, IndexNow.
- Speed: Lighthouse 98 to 100 on phones; passes Core Web Vitals in the lab.

## Hero's checklist

### At launch (week 1)

- [ ] Deploy to synovika.com on Cloudflare Pages, with the www redirect (D-038).
- [ ] **Google Search Console:** add the domain (a DNS TXT record in Cloudflare), submit `https://synovika.com/sitemap-index.xml`, and request indexing for the home page, the three products and the six services.
- [ ] **Bing Webmaster Tools:** import the site from Search Console, submit the sitemap. Bing also feeds ChatGPT search and Copilot.
- [ ] Run `npm run indexnow` after each deploy.
- [ ] **Google Business Profile:** create it as a *service-area business* (no public address needed), category "Software company", service area Nigeria. Add the products and services, website, phone, WhatsApp and hours. Add real photos (logo, team, work; no stock photos). Verify it.
- [ ] **Bing Places** and **Apple Business Connect:** the same details.
- [x] **CAC registration:** Synovika Technologies Ltd, RC 9972328, is in the footer and the structured data (D-065).

### In the first month

- [ ] **Directory listings with links** (keep the name, phone and website identical everywhere: Synovika Technologies Ltd, +234 706 231 9781, hero@synovika.com, https://synovika.com):
  - software: Clutch, GoodFirms, TechBehemoths, DesignRush;
  - Nigerian: VConnect, ConnectNigeria, BusinessList.ng, Finelib.
- [ ] **Social profiles:** LinkedIn company page, X, Instagram, Facebook. Send me the links; I'll add them to the structured data (`sameAs`) and the footer.
- [ ] **Reviews:** ask every client who is genuinely happy to leave a Google review. Never buy or invent one.

### Every month

- [ ] Publish two new guides on questions customers actually ask you. Topics ready to write: GPS tracker installation in Nigeria; stopping fuel theft in a fleet; school bus tracking; estate security for facility managers; what a software maintenance contract should include; website hosting in Nigeria.
- [ ] **Earn links:** pitch launch stories to TechCabal, Techpoint Africa and BusinessDay when each product launches; write guest articles; partner with tracker suppliers, estate associations and facility managers; speak at local tech and business events.
- [ ] **Check Search Console:** which searches show us, where we rank, which pages get clicks. Adjust titles and add guides where we're close to the first page.
- [ ] When a product launches: a launch page update, demo videos, app store listings, and (with written permission) a case study.

## What we won't do, and why

- **Buy links, stuff keywords or publish fake reviews.** Google penalises all three, and a penalty is far harder to undo than slow progress.
- **Copy-and-paste city pages** ("Software company in Lagos", "...in Abuja", "...in Kano") with the same text. Google treats these as doorway pages. If we ever have something genuinely different to say about a city, such as a client there, a page for it can come then.
- **Publish prices or statistics we can't stand behind.** It breaks the brief, and it's the quickest way to lose trust.
