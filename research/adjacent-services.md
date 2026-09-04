# Adjacent services for BabyRock Social

**Date:** 2 September 2026  
**Scope:** Independent shops in Spain / Europe first (restaurants, cafés, salons, clinics, florists, workshops). Not chains.  
**Operating model:** ~90% automation (AI draft / structured jobs) + ~10% human QC (Philippines operator). Owner interface is WhatsApp. Founder is not in production. Margin floor ≥ 30% before founder salary.  
**Entry product:** Google review replies, **€99 TTC / month**. WhatsApp to the owner is already included in v1.  
**Hard constraints:** no new owner app; no cold-messaging the shop’s customers without a legal basis (GDPR + LSSI); do not sell TripAdvisor / TheFork replies, paid ads, site redesign, photos-as-a-product, or founder sales calls in v1. V2 already sketched: WhatsApp FAQ + next 3 Calendar slots for the shop’s own customers, after ~40 review clients.

This report maps twelve candidate add-ons against competitors, typical price, API / legal feasibility, and whether the 90/10 factory actually holds. It then ranks eight services for the next SKU after v1 is live.

Sources are primary where they exist (Google Help, Meta developer docs, BOE, EUR-Lex, vendor pricing pages). Secondary vendor blogs are labelled as such.

---

## How to read the ranking

Each service is scored 1–5 on:

| Code | Criterion | Why it matters here |
|---|---|---|
| **A** | Same buyer as Google-review replies | Independent owner who already pays €99 and talks on WhatsApp |
| **B** | Same factory (draft → PH QC → publish) | Minutes, not a new ops line; PH English + ES grid |
| **C** | Commercial impact on the client relationship | Does it protect rating, bookings, or churn? |
| **D** | Legal / API risk (5 = low risk) | GDPR, LSSI, Google Fake Engagement, Meta opt-in, partner-gated APIs |
| **E** | Time-to-ship after v1 is live (5 = days–weeks) | Reuses `reviews@` manager role, Cloud API, draft worker |

**Weighted score** = `0.25A + 0.25B + 0.20C + 0.15D + 0.15E`.

**Price envelope for BabyRock add-ons.** v1 already has ~€89 HT of AI+API headroom at 0.40 reviews/day (`16-plan-affaires.md`). An add-on that adds **< 8 minutes of PH time / client / month** and **< €5 of Meta / Places cost** can sit at **€29–49 TTC** and still clear 30% once a PH is on payroll. Anything that needs a new Meta App Review, a partner contract, or POS integration is a later SKU, not a week-2 upsell.

---

## What Google and Meta forbid (read this before selling anything)

### Google — Fake Engagement, gating, incentives

Google’s Business Profile **Prohibited & restricted content** policy is the binding text ([support.google.com/business/answer/7400114](https://support.google.com/business/answer/7400114)):

Merchants **may not**:

- Offer incentives (payment, discounts, free goods or services) in exchange for posting a review, **or** for revising / removing a negative review.
- Discourage or prohibit negative reviews, **or selectively solicit positive reviews**.
- When soliciting reviews: require or pressure users to leave ratings **while on the premises**; request that **specific content** be included (including naming a staff member); direct staff to hit a **quota** of reviews.

Merchants **may**:

- Solicit genuine reviews **without** incentives and **without** trying to influence the rating or the contents.

The same page treats **rating manipulation** (unusual volumes, conflicts of interest, paid / in-kind reviews) as Fake Engagement. Enforcement can unpublished existing reviews, freeze new reviews, and show a public warning ([support.google.com/business/answer/14114287](https://support.google.com/business/answer/14114287)).

Google **does** want shops to ask. Official how-to: share a **review link or QR** on receipts, thank-you emails, end of a chat, or printed in-store — and the same page restates the incentive ban ([support.google.com/business/answer/16816815](https://support.google.com/business/answer/16816815); also [Tips to get more reviews](https://support.google.com/business/answer/3474122)).

**Review gating** (internal 1–5 survey → only 4–5★ go to Google) is the “selectively solicit positive reviews” clause. Do not build it. Do not let a PH invent it.

**Third-party agency rules** (BabyRock is a 3P) ([support.google.com/business/answer/7353941](https://support.google.com/business/answer/7353941)):

- Claim / manage only with the owner’s **express** consent (written or a form tick). Verbal is not enough.
- To **reply to reviews on behalf of the merchant**, explicit approval is required.
- Owner stays Owner / Co-Owner; agency is Manager. BabyRock already does this (`reviews@babyrock.ai`).
- Offboard in **7 business days**. Disclose that Business Profile itself is free. Share the “Working with a third party” notice.
- Do not auto-revert Google’s suggested edits without asking the merchant.

### Meta — opt-in, 24h window, fake engagement, no cold DMs

**WhatsApp Business Messaging Policy** ([business.whatsapp.com/policy](https://business.whatsapp.com/policy); developer opt-in guide [Get opt-in for WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in), Nov 2024 update):

- You may contact people on WhatsApp only if (a) they gave their mobile number and (b) they opted in to subsequent messages / calls from **that business**.
- Opt-in must name the business and state that the person is opting in to receive communication. Method can be SMS, website, IVR, in person, or paper. Meta now allows a **general** communications opt-in (not WhatsApp-specific) **if local law is also met**. Spain’s LSSI is stricter than Meta for commercial WhatsApp (see legal section).
- Outside the 24-hour customer-service window, only **approved templates**. Marketing templates are always charged; utility templates outside the window are charged ([WhatsApp pricing](https://developers.facebook.com/docs/whatsapp/pricing)).

**Messenger / Instagram Messaging** ([Messenger Platform policy](https://developers.facebook.com/docs/messenger-platform/policy-overview); [Instagram Messaging overview](https://developers.facebook.com/docs/instagram-messaging/overview/)):

- 24-hour standard messaging window after user action. Private reply to a comment: generally **one** private reply, within **7 days**.
- Disclose automated chat when the law requires it.
- No official API to cold-DM people who never engaged. That is how accounts get disabled.

**Meta Community Standards — Spam** ([transparency.meta.com](https://transparency.meta.com/policies/community-standards/spam/)): buying / exchanging likes, follows, comments; giveaways of cash for engagement; requiring a like to see content — all banned. Do not sell “engagement”.

**WhatsApp catalogs** must follow Meta Commerce Policy; violating items are flagged at catalog level ([Catalogs overview](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sell-products-and-services)).

### Spain / EU — GDPR + LSSI (the actual cold-message ban)

Two layers, both apply. GDPR is *processing*; LSSI is *sending commercial electronic communications*.

**GDPR Art. 6** ([Regulation (EU) 2016/679](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)): processing needs a basis — typically (a) consent, (b) contract, or (f) legitimate interests. Marketing to a diner is **not** necessary to perform the meal contract (Art. 6(1)(b) is the wrong box). Health / allergy data is Art. 9 — out of scope for a review shop.

**ePrivacy Directive Art. 13** ([Directive 2002/58/EC](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219)): electronic mail for direct marketing needs **prior consent**, with a **soft opt-in** for *existing customers*, *similar products*, *easy opt-out at collection and in every message*.

**LSSI Art. 21** (Ley 34/2002, BOE-A-2002-13758, [consolidated text](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)):

1. Ban on advertising / promotional communications by email **or equivalent electronic means** that were not previously requested or expressly authorised.
2. Exception (soft opt-in): prior **contractual** relationship, data obtained lawfully, messages about **own similar** products/services, **simple free opt-out** at collection **and** in each message.

Spanish doctrine and AEPD practice treat **WhatsApp and SMS as “medios de comunicación electrónica equivalentes”** to email. A booking phone number is **not** marketing consent. Soft opt-in is more defensible for **email** than for WhatsApp; for WhatsApp, design for **express opt-in** (checkbox at booking / till / QR) plus Meta’s opt-in log. BabyRock’s own rule stands: *no writing cold to the resto’s customers without a legal basis* (`01-produit.md`, `02-marche-legal.md`).

BabyRock is **processor** for review replies; the shop is **controller**. Any product that touches diner phones needs a DPA addendum, a consent log the shop owns, and STOP / BAJA in every outbound.

---

## Factory fit (what “90/10” actually means here)

v1 already has: list Google reviews → Grok draft → PH click Publier / Éditer → 1–3★ WhatsApp to owner → journal. ~2.5 min/review, 18 reviews/h sustained (`16-plan-affaires.md`).

An adjacent service fits the factory if it is **one more job type** on the same queue:

| Job type | 90% | 10% |
|---|---|---|
| Reply (already v1) | Draft in review language, ≤400 chars | PH publish; owner OK on 1–3★ |
| Structured patch (hours, NAP, special hours) | Diff vs live GBP | PH or owner WhatsApp confirm before `locations.patch` |
| Recurring post | Draft from 5★ / menu / hours | PH publish Local Post |
| Inbound FAQ | Script table first, cheap LLM if miss | Human if off-script or complaint |
| Outbound template | Fill approved Meta template | PH sample 10%; owner never types |

It does **not** fit if the work is: shooting photos, running ads, claiming 80 directories, building a catalog, scraping competitors daily, or sitting in a live diner chat without scripts.

---

## Candidate services (all twelve)

### 1. Post-visit review request (WhatsApp / SMS / email, GDPR-clean)

**What it is.** After a real visit, send **every** guest the **same** Google review link / QR. No star-gate. No “leave 5★ for a dessert”.

**Competitors and price**

| Vendor | What they sell | Public price (2026) |
|---|---|---|
| [NiceJob](https://get.nicejob.com/pricing) | Automated email/SMS review requests + widgets | **Reviews $75/mo**, Pro $125/mo (USD), month-to-month |
| Grade.us | Email campaigns; SMS add-on | Solo historically **~$99–110/mo** / location; agency seats cheaper ([grade.us/home/plans](https://www.grade.us/home/plans/), Capterra) |
| Birdeye | Review requests inside a listings+inbox suite | Custom; triangulated **~$299–449/mo per location**, annual |
| Podium | SMS-first inbox + reviews | Custom; triangulated **~$399/mo** entry, annual |
| BrightLocal Grow | Review monitoring + campaigns on top of local SEO | **$65/mo** for 1 location ([BrightLocal Help](https://help.brightlocal.com/hc/en-us/articles/12623266931730-How-much-does-BrightLocal-cost)) |

US home-services tools are the wrong price architecture for a Sant Cugat café. The comparable *job* is “ask after the visit”, sold at **€40–90/mo** in SMB tools, bundled into €299+ suites.

**API / legal**

- Google: official QR / short link ([answer/16816815](https://support.google.com/business/answer/16816815)). **Allowed.** Incentives and gating: **forbidden** ([answer/7400114](https://support.google.com/business/answer/7400114)).
- Channel:
  - **Printed QR / receipt / table tent:** no personal data. Fastest legal path. Owner already has WhatsApp with BabyRock — send them the PNG + “print this”.
  - **Email to existing customers:** LSSI Art. 21.2 soft opt-in *if* they contracted, similar service, opt-out in the mail. Review-ask is closer to service than to a promo, but treat it as commercial and include BAJA.
  - **WhatsApp / SMS to diners:** Meta opt-in **and** LSSI. Do **not** blast the reservation list. Collect a till/booking checkbox: “Quiero que [Nombre del local] me escriba por WhatsApp (avisos de reserva y enlace para opinar en Google). BAJA = STOP.”
- SMS Spain: Twilio outbound **$0.0875 / segment** to Spain ([Twilio SMS Spain](https://www.twilio.com/en-us/sms/pricing/es)) — ~8× a WhatsApp utility template. WhatsApp is the default channel in ES; SMS is fallback for clinics that refuse WA.

**WhatsApp cost (official model).** Per-message pricing since 1 July 2025 ([developers.facebook.com/docs/whatsapp/pricing](https://developers.facebook.com/docs/whatsapp/pricing)). Non-template replies inside the 24h window are free. Utility templates inside the window are free; outside, billed. Marketing templates always billed. Spain’s **marketing** rate was raised on **1 July 2026** (same page, rate-card updates). Unofficial EUR cards circulating for Spain (e.g. marketing ~€0.0585, utility ~€0.0166) must be checked against Meta’s current EUR CSV before quoting a diner-volume SKU.

**90/10?** Yes, as a **structured job**, not as a live chat. One-time: generate link/QR, write 3 templates (ES/CA/FR), PH QC, owner WhatsApp “here is the QR”. Recurring: if the shop later has opt-in + a booking webhook, a utility template “gracias por tu visita + link” is a worker. PH samples 10%.

**BabyRock packaging.** `02-marche-legal.md` already says review-ask should enter the **base offer once the reply factory holds**, because churn eats MRR. Do not sell it as a €99 extra. Ship **QR + owner kit** free with v1; sell **automated send** later only with a consent log.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 4 | 5 | 3 | 4 | **4.25** |

---

### 2. Google Business Profile hygiene (hours, posts, Q&A, photos QC)

**What it is.** Keep hours true, post weekly, don’t let cover photos rot, answer questions.

**Competitors and price.** Bundled into Birdeye / Podium (~$299–399). BrightLocal **Manage** (listings sync + GBP post scheduling) **$54/mo** for 1 location; Grow $65. Yext PowerListings Emerging **$199/year** per location ([yext.com/pl/powerlistings/plans.html](https://www.yext.com/pl/powerlistings/plans.html)) — chain economics. Uberall is modular enterprise (no public SME price).

**API / legal**

- **Hours / NAP / special hours:** `locations.patch` on Business Information API, fields `regularHours`, `specialHours`, `phoneNumbers`, `storefrontAddress`, `websiteUri` ([REST Resource: locations](https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations)). Same `business.manage` scope as reviews. **Feasible now** with the existing Manager invite.
- **Local Posts:** `POST …/localPosts` ([create](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create)). Types STANDARD / EVENT / OFFER. Body ~**1,500 characters** (industry consensus; Google’s UI limit). CTA buttons. Media via `sourceUrl`. Some locations have `isLocalPostApiDisabled` / `canOperateLocalPost` — skip those.
- **Q&A: dead.** My Business Q&A API **discontinued 3 November 2025**. You can no longer read or post Q&A via API ([Q&A changelog](https://developers.google.com/my-business/content/qanda/change-log); [sunset dates](https://developers.google.com/my-business/content/sunset-dates)). Do not sell Q&A management. Influence “Ask Maps” by keeping hours, description, reviews, and site FAQs accurate.
- **Photos:** Media API exists (`accounts.locations.media.create`, min 250px short edge, ≥10 KB, [media resource](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media)). **Photos as a product are already deferred.** Allowed: QC existing cover/profile, flag broken images, ask owner via WhatsApp for one new JPEG. Not: a shoot.

**90/10?** Hours = structured diff + owner WhatsApp “confirm Sunday 13:00–16:00?”. Posts = same draft queue as 5★. Photos QC = checklist, not creation.

**Risk.** Google 3P policy: don’t auto-revert Google’s suggested hours without asking the merchant. Holiday hours are the actual money: a florist closed on 1 Nov with “open” on Maps generates 1★.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 5 | 4 | 4 | 5 | **4.65** |

---

### 3. Multi-platform review replies (Facebook, TripAdvisor, TheFork)

**What it is.** Same factory, more inboxes. Already **explicitly out of v1** (`12-decisions-ouvertes.md`).

**Competitors.** Birdeye “200+ sites”, Podium, ReviewTrackers, Solike (FR/ES restaurant reply copy). Price: the $299 suites; Solike-style tools often freemium drafts + paid publish.

**API / legal**

| Platform | Read | Write reply | Notes |
|---|---|---|---|
| **Facebook Page recommendations** | Official `GET /{page-id}/ratings`, permission `pages_read_user_content` ([Page Ratings](https://developers.facebook.com/docs/graph-api/reference/page/ratings/)) | **Not** on that edge (`Creating: You can't perform this operation`). Workaround used in the wild: `?fields=open_graph_story` then `POST /{story-id}/comments`. Fragile, App Review, Page token. |
| **Instagram** | No native star reviews comparable to Google. Comments/DMs are a different product (see §12). | — |
| **TripAdvisor** | Terra Content API is **read** (reviews include owner response if present) ([docs.terra.tripadvisor.com](https://docs.terra.tripadvisor.com/docs/overview.md)). JSON Partner API sunsetting 2026, migrate to Terra. | Management responses: **one per review**, via Management Center; **cannot edit**, only delete+resubmit; moderation up to 2 days ([TA Help](https://www.tripadvisorsupport.com/en-US/hc/owner/articles/347)). Review Express API is **collection**, not reply. Write path = hospitality partner, not a self-serve SME API. |
| **TheFork** | B2B `GET /manager/v1/reviews` (Auth0, restaurant-scoped) ([docs.thefork.io](https://docs.thefork.io/); spec on staging). Partner API still “available soon”. | **No public POST reply.** Official path: TheFork Manager UI; diner has 3 months to review, restaurant **3 months to reply**; automated moderation, up to 15 days if flagged ([TheFork Manager Help](https://support.theforkmanager.com/s/article/How-do-I-manage-diners-reviews-and-my-right-to-reply)). |

**90/10?** Draft layer is identical. Publish layer is **not**. Playwright-on-TheFork is how you get the account banned and is out of BabyRock’s “button Publier writes the API” rule.

**Do not bring this forward until Google v1 is boring.** Facebook ratings are the only one that might piggyback a future IG/FB SKU.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 4 | 3 | 3 | 2 | 2 | **2.95** |

---

### 4. Owner WhatsApp inbox for the shop’s customers (FAQ, booking, complaints)

**What it is.** BabyRock **V2**, already written: a WhatsApp button on the shop’s own surfaces; FAQ scripts; **next 3 Google Calendar slots**; not Rosalia↔owner. After ~40 review clients. Not on `/pay` today (`01-produit.md`). Internal note: “produit 119 € (FAQ mangeurs) reste plus tard” (`10-whatsapp-service.md`).

**Competitors and price**

| Vendor | Entry | Notes |
|---|---|---|
| Manychat | From **$15/mo** + Meta | WA on Pro; contact-based |
| Wati | From **~$59–99/mo** / 5 agents | Often ~20% markup on Meta |
| respond.io | Starter **~$79–99/mo**; Growth **~$199** | Real product starts at Growth (automation + AI) |
| 360dialog | From **€49/mo** | BSP access, you build the agent |

**API / legal**

- Cloud API: already in the stack. Inbound = 24h free-form (currently). Outbound after 24h = templates + opt-in.
- **Google Calendar** `freeBusy.query` and `events.list` ([Calendar freebusy](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)) — OAuth on the **shop’s** Calendar, not BabyRock’s. Perfect for “next 3 slots” without exposing other clients’ names if you only return busy/free.
- GDPR: shop = controller; BabyRock = processor for diner chats. Complaints and medical/clinic messages need a **human-only** path (already the 1–3★ pattern). Catalan: model writes, PH uses the grid.
- Do not mix Rosalia (sales) with diner FAQ in one thread (`10-whatsapp-service.md`).

**90/10?** This is the factory’s second product, not a bolt-on. Scripts first (`07-modeles-couts.md`). LLM cheap without reasoning on miss. Off-script → PH. Owner WhatsApp only for complaints / medical / refunds.

**Ship after 40 Google clients**, as already decided. Selling it at 10 clients will drown the PH in unscripted diner chat and break the 30% floor.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 4 | 5 | 3 | 3 | **4.10** |

---

### 5. Review-to-content (5★ → weekly Google Post / IG caption)

**What it is.** Take last week’s 5★ (already drafted and published) and turn one of them into a Local Post, optionally an IG caption the owner pastes or that the API publishes.

**Competitors.** Birdeye / NiceJob “automate social sharing of top reviews”. Many agencies charge €50–150/mo for “we’ll post on your GBP”. Semrush Local and BrightLocal Manage schedule GBP posts.

**API / legal**

- Google Local Posts: see §2. Quoting a **public** review is generally acceptable if you don’t impersonate the reviewer and you don’t add incentives. Do not attach a “leave a 5★” CTA (gating / solicitation of a rating). CTA = Book / Order / Learn more to the site.
- Instagram Content Publishing is a separate Graph product (Professional account, `instagram_content_publish`). Heavier App Review than comments. **Caption-only to owner WhatsApp** is the v1.5; auto-publish IG is v3.
- Review replies themselves are capped in Google’s UI around **4,096 characters**; BabyRock already drafts at **400**. Posts are 1,500 — enough for a quote + one sentence.

**90/10?** Best factory reuse in the list after hours. The 5★ draft already exists. Extra prompt: “make a 280-char post, first 100 chars = hook, no phone number in body (Google rejects those), attach last approved photo URL if any.” PH clicks Publier on the post job.

**Do not** make this a photography product.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 5 | 3 | 4 | 5 | **4.45** |

---

### 6. Competitive monitoring (nearby shops’ ratings)

**What it is.** Monday recap: “you 4.6 (212) vs three cafés in 400 m: 4.4 / 4.7 / 4.2.”

**Competitors.** BrightLocal Track **$41/mo** (1 location, rank + competitor insights). Birdeye Growth. Local Falcon geo-grids.

**API / legal**

- Places API (New) **Nearby Search**: ratings trigger **Enterprise** SKU (**$35 / 1,000** first band, 1,000 free/month); reviews trigger **Enterprise + Atmosphere $40 / 1,000** ([Maps pricing](https://developers.google.com/maps/billing-and-pricing/pricing); [Nearby Search (New)](https://developers.google.com/maps/documentation/places/web-service/nearby-search)). DataForSEO is already in the scout stack for acquisition, not a weekly client report.
- Public ratings of other businesses are not personal data. **Do not** scrape reviewers’ names into the client WhatsApp.
- Google 3P: do not compare one customer’s **Business Profile insights** with another’s.

**90/10?** **No.** This is a report, not draft→publish. Cheap to compute, easy to over-promise (“you’ll rank #1”). Owners of independent shops already know the café next door.

**Keep as a line in the Monday recap**, not a SKU. Cost cap: 4 Nearby Search Enterprise calls / client / month ≈ noise vs $35/1k.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 3 | 2 | 2 | 4 | 4 | **2.85** |

---

### 7. Win-back / recovery after 1–3★

**What it is.** Two different products people confuse:

1. **Public reply** to the 1–3★ (already v1, owner OK).
2. **Private recovery** of that person (table, refund, “please change your review”).

**Competitors.** NiceJob Pro, Grade.us “recover customers”, Birdeye surveys. Often the same tools that also *gate*.

**API / legal — this is the trap**

- Google **forbids** incentives to **revise or remove** a negative review ([answer/7400114](https://support.google.com/business/answer/7400114)). “We’ll give you a dessert if you edit the 2★” is how profiles get frozen ([answer/14114287](https://support.google.com/business/answer/14114287)).
- You usually **cannot** WhatsApp the Google reviewer: you don’t have their number, and harvesting it from a review is both ToS-hostile and GDPR-hostile.
- If the 1–3★ came from a **known booking** (TheFork / CoverManager) **and** they opted in, a **service** message “we’re sorry, can we make this right?” can be lawful as contract/service — **without** asking them to change the Google review.

**90/10?** Extend the existing 1–3★ owner ping: draft the public reply **and** a 3-line **owner checklist** (“call table 12, don’t offer to delete the review, don’t compensate for stars”). PH never messages the diner. That is a prompt change, not a SKU.

**Do not sell “we’ll get the 1★ taken down.”** Report it if it actually violates policy; Google decides.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 4 | 4 | 2 | 5 | **4.10** |

(Score assumes the **owner-coaching** version. The “message the reviewer / pay to edit” version scores D=1 and is rejected.)

---

### 8. Loyalty / repeat visit via WhatsApp (opt-in)

**What it is.** “It’s been 30 days, your usual Thursday table.” Broadcast to an opted-in list.

**Competitors.** Wati / Manychat / respond.io broadcasts; loyalty apps (Yotpo, Smile — e-com). Restaurant-specific: CoverManager / TheFork CRM, not a review vendor.

**API / legal**

- Meta: marketing **templates**, always billed, quality-rated. Spain marketing rate **up** 1 July 2026.
- LSSI Art. 21: this is the textbook commercial communication. **Express opt-in**, BAJA, similar products only if you try soft opt-in (weak on WhatsApp).
- Meta AI-provider pricing policy (Feb 2026) may extra-charge if you sell “an AI that messages consumers on WA” as the product — read [AI Providers](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/ai-providers) before packaging.

**90/10?** Templates are 90/10. List hygiene, frequency caps, and “don’t annoy the diner” are not. One bad broadcast tanks the WABA quality score for **all** BabyRock clients if you ever share a number — **never share a WABA across shops**. Each shop needs its own WABA or at least its own phone number; that is a Meta + ops cost the €99 plan does not include.

**Not a next SKU.** It is a module *inside* V2 once consent capture exists.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 4 | 3 | 4 | 2 | 2 | **3.15** |

---

### 9. WhatsApp catalog / simple social commerce

**What it is.** Menu / bouquet list / workshop SKUs inside chat; cart; order webhook.

**Competitors.** Shopify + WA, Wati catalogs, native WhatsApp Business app catalog (free, manual). Cloud API catalogs: [sell products](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sell-products-and-services).

**API / legal.** Catalog connected to the WABA; Commerce Manager; item-level policy review; cart is per-thread; order webhook. Multi-product templates are **marketing**. Photos of every SKU — **photos-as-product, deferred**. Meta Commerce Policy on prohibited goods.

**90/10?** Catalog maintenance is merchandising, not a reply factory. Florists might want it; restaurants already have TheFork / a PDF menu. Wrong ops muscle.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 3 | 2 | 3 | 3 | 2 | **2.60** |

---

### 10. Listing accuracy / NAP / local SEO

**What it is.** Name–Address–Phone consistent on Google, Apple, Bing, Facebook, 50 directories.

**Competitors.** Yext **$199–999/year** / location (self-serve PowerListings). BrightLocal Manage **$54/mo** + Citation Builder **from $2–3.20 per citation**. Uberall / Synup: multi-location, custom. Apple Business Connect **API is partner-gated** ([approved partners](https://support.apple.com/guide/apple-business-connect/abcb36ef9f27/web); [register as 3P](https://support.apple.com/guide/apple-business-connect/register-your-third-party-partner-or-agency-abcbec357512/web)). Apple Maps **does not host native reviews**; it leans on Yelp. Independent ES shops live or die on **Google**, then Instagram, then TheFork.

**API / legal.** GBP patch: yes (same as hygiene). Apple: not until BabyRock is an approved ABC partner. Bing Places: partner. Facebook location: Page. Directories: humans or BrightLocal-style vendors — low margin if you resell.

**90/10?** NAP on **Google** is hygiene (§2). “We syndicate to 80 sites” is a Yext clone for chains. Out of target.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 3 | 3 | 3 | 3 | 3 | **3.00** |

---

### 11. Invoice or booking follow-up

**What it is.** The **trigger** for §1: Holded / FacturaScripts / Square invoice paid, CoverManager / TheFork / Calendar marked seated, Treatwell / Clinic booking completed → wait 3 hours → send the same review link.

**Competitors.** NiceJob’s Jobber / Housecall Pro native triggers. Podium. CoverManager’s own guest CRM. TheFork already emails the diner to review **TheFork**, not Google — do not fight that email; add Google only with opt-in.

**API / legal**

- TheFork B2B: reservations + customers + **GET reviews**. Useful later for restaurants; partner approval; diner PII = controller is the restaurant.
- Google Calendar: easy for salons / clinics that already live in Calendar (V2).
- Holded / Stripe invoices: possible; still need the **phone/email + purpose**.
- Legal: the follow-up is lawful as **service** (Art. 6(1)(b) / utility template) if it is “thanks + receipt + review link”, not a promo. Still include opt-out. Still **no gating**.

**90/10?** The send is a worker. The **integration per POS** is not. Spain restaurant stack is fragmented (Ágora, Square, Last.app, TheFork Manager, paper). Do not sell “we connect to your caja” as v1.5.

**Product shape:** one Zapier/Make-quality webhook + Calendar; CoverManager/TheFork only when a restaurant actually asks and after 40 clients.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 3 | 5 | 3 | 2 | **3.70** |

---

### 12. Instagram / Facebook comment & DM reply

**What it is.** Same draft→QC→publish on the shop’s IG Professional comments and inbound DMs (and FB Page comments). Not growth-hacking, not comment-pods, not cold DMs.

**Competitors.** Manychat (this is their core), Later, Meta Business Suite “instant reply” (free, dumb). respond.io. Price: Manychat from $15; real WA+IG stacks €50–200.

**API / legal**

- IG comments: `GET /{ig-media-id}/comments`, `POST /{ig-comment-id}/replies` ([IG comment replies](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-comment/replies.md)); permissions `instagram_basic`, `instagram_manage_comments`.
- Private reply to a commenter: `POST /{ig-user-id}/messages` with `recipient.comment_id` ([private replies](https://developers.facebook.com/docs/instagram-platform/private-replies)).
- FB Page comments: `POST /{comment-id}` with `pages_manage_engagement` ([Pages comments](https://developers.facebook.com/documentation/pages-api/comments-mentions)).
- Webhooks: `comments`, `messages`. App Review. Professional account + linked Page.
- 24h window; one private reply per comment; disclose bots where required; **no** auto-commenting on *other people’s* posts (spam).
- Clinics: no medical advice in comments (same rule as review drafts: “pas de fait médical”).

**90/10?** Yes — it is the review factory with a different inbox. Volume can be **higher** than Google reviews (a Reel can drop 80 comments in an hour). Cap: script FAQ comments; PH only on complaints / 1–3-star-equivalent; owner WhatsApp on anything that looks like a crisis.

**Need:** a **second** Meta app use case (or expand BabyRock Social beyond “Connect with customers through WhatsApp”). That is the real time-to-ship, not the prompt.

| A | B | C | D | E | Weighted |
|---|---|---|---|---|---|
| 5 | 5 | 4 | 3 | 3 | **4.20** |

---

## Ranking table (all twelve)

| Rank | Service | A | B | C | D | E | Wtd | Verdict |
|---:|---|---:|---:|---:|---:|---:|---:|---|
| 1 | GBP hygiene: hours + weekly Local Post (not Q&A, not photos-as-product) | 5 | 5 | 4 | 4 | 5 | **4.65** | Ship as soon as review publish is live |
| 2 | Review-to-content (5★ → Google Post; IG caption via owner WA) | 5 | 5 | 3 | 4 | 5 | **4.45** | Same job as #1, extra prompt |
| 3 | Post-visit review request (QR kit now; automated send only with opt-in) | 5 | 4 | 5 | 3 | 4 | **4.25** | Put QR in the base offer; do not gate |
| 4 | IG / FB comment + inbound DM | 5 | 5 | 4 | 3 | 3 | **4.20** | After Meta App Review; cap volume |
| 5 | Win-back **coaching** on 1–3★ (owner WA, never pay-to-edit) | 5 | 4 | 4 | 2 | 5 | **4.10** | Prompt change, not a SKU |
| 5 | V2 WhatsApp FAQ + next 3 Calendar slots | 5 | 4 | 5 | 3 | 3 | **4.10** | Already the plan at ~40 clients |
| 7 | Invoice / booking follow-up (trigger for #3) | 5 | 3 | 5 | 3 | 2 | **3.70** | Calendar webhook first; POS later |
| 8 | Facebook Page recommendation replies | 4 | 3 | 3 | 2 | 2 | **2.95*** | Only with §12; write path unofficial |
| — | Loyalty WA broadcasts | 4 | 3 | 4 | 2 | 2 | 3.15 | Inside V2, never shared WABA |
| — | NAP / Apple / 80 directories | 3 | 3 | 3 | 3 | 3 | 3.00 | Chain product; Google NAP is #1 |
| — | Multi-platform TA / TheFork replies | 4 | 3 | 3 | 2 | 2 | 2.95 | Stay deferred |
| — | Competitive monitoring as a SKU | 3 | 2 | 2 | 4 | 4 | 2.85 | One line in Monday recap |
| — | WhatsApp catalog | 3 | 2 | 3 | 3 | 2 | 2.60 | Needs photos; wrong factory |

\*Facebook ratings sit with §12 in the shortlist rather than as a standalone SKU.

---

## Ranked shortlist of eight (why / why-not)

1. **GBP hours + weekly Google Post** — **Why:** same buyer, same Manager token, same queue, wrong hours are how 1★ happen, posts API is documented. **Why-not (narrow):** skip Q&A (API dead 3 Nov 2025); skip selling photo shoots.
2. **Review-to-content (5★ → Local Post)** — **Why:** the 5★ draft is already paid for; one extra job. **Why-not:** don’t auto-publish Instagram until Content Publishing App Review; send the caption on owner WhatsApp first.
3. **Post-visit review request (QR now, automated later)** — **Why:** Google’s own recommended behaviour; feeds the €99 machine; already named as churn insurance in `02-marche-legal.md`. **Why-not:** no gating, no “5★ for a coffee”, no blasting reservation phones.
4. **Instagram / Facebook comment + inbound DM** — **Why:** identical factory, Spain shops live on IG, Cloud API stack is related. **Why-not:** volume spikes, App Review, 24h rules; not before Google publish is stable.
5. **1–3★ recovery coaching (via owner WhatsApp)** — **Why:** already in v1; one prompt. **Why-not:** never incentivise a star change; never scrape the reviewer.
6. **V2 diner WhatsApp FAQ + 3 Calendar slots** — **Why:** already specified; highest relationship impact; scripts-first matches `07-modeles-couts.md`. **Why-not:** not before ~40 review clients; separate WABA per shop; not on `/pay` today.
7. **Booking / invoice follow-up as the trigger for #3** — **Why:** same legal object as a thank-you, not a promo, if templated as utility. **Why-not:** don’t promise TheFork/caja connectors in the first year; Calendar + a webhook is enough for salons/clinics.
8. **Facebook recommendation replies (with #4, not alone)** — **Why:** same owner already has a Page; GET is official. **Why-not:** POST-on-ratings is not a first-class API; TripAdvisor/TheFork write access is partner-gated — leave them deferred.

**Explicitly not in the eight:** loyalty blasts, catalogs, Yext-style NAP, competitor dashboards as a product, TheFork/TripAdvisor publish, Q&A, paid ads, site redesign, founder calls.

---

## Suggested packaging (margin ≥ 30%)

Do not reopen the €99 TTC lock. Add **included** vs **later SKU**:

| When | What the owner sees on WhatsApp | Economics |
|---|---|---|
| **v1.1** (days after live publish) | QR + short link + “print this”; holiday-hours ping; optional weekly Post drafted from a 5★ | Included. Minutes: ~5 setup + ~3/week post QC. Meta cost ≈ 0. |
| **v1.2** | 1–3★ ping includes “do not offer to delete the review” checklist | Included. Prompt only. |
| **v2** (~40 clients) | Shop’s own WA: FAQ scripts + next 3 Calendar slots | **€119 TTC** as already sketched. Own WABA/number. Service messages in-window currently free; budget utility templates for reminders. |
| **v2.1** | IG/FB comments, same QC | **+€39 TTC** or bundle into 119 if volume is low. |
| **Never as sold** | Gating, paid-for-stars, cold WA to diners, “we’ll remove the 1★”, TheFork/TA in the first year | Policy + partner APIs. |

PH load: a weekly Post + hours exceptions is **well under** one extra review’s 2.5 minutes. IG comments need a **hard cap** (e.g. 30 auto/scripted per day, rest wait) or the 18 reviews/h capacity dies.

---

## Implementation notes (so this doesn’t turn into a second company)

1. **Reuse the Manager invite.** Hours and Local Posts use the same `business.manage` scope as `PUT …/reviews/{id}/reply`. No new Google product to sell, no new password.
2. **One job table.** `draft` / `qc` / `publish` already exist. Add `kind = review_reply | local_post | hours_patch | ig_comment`.
3. **Consent is the shop’s, logged in Postgres.** If BabyRock ever sends a diner WhatsApp, store `opt_in_at`, `source`, `waba_id`, `STOP`. Processor DPA already required for PH + host (`02-marche-legal.md`).
4. **Never share one WABA across shops** if diner messages exist. Quality score is per phone number; one florist’s marketing blast must not sink a clinic.
5. **Disclose Google 3P notice** on babyrock.ai and on invoices (GBP is free; you pay for the replies). Offboard Manager access in 7 days.
6. **Measure** before selling V2: reviews **received** vs **published** per client per day (replace the 0.40 hypothesis). Review-ask only scales if the reply SLA holds.

---

## Source list (primary first)

**Google**

- [Prohibited & restricted content](https://support.google.com/business/answer/7400114) (Fake Engagement, incentives, selective solicitation, on-premises pressure)
- [Business Profile restrictions for policy violations](https://support.google.com/business/answer/14114287)
- [Create a link or QR to request reviews](https://support.google.com/business/answer/16816815)
- [Tips to get more reviews](https://support.google.com/business/answer/3474122)
- [Third-party policies](https://support.google.com/business/answer/7353941)
- [Work with review data (API)](https://developers.google.com/my-business/content/review-data)
- [locations resource (hours, NAP)](https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations)
- [localPosts.create](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create)
- [media resource](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media)
- [Q&A API changelog — discontinued 3 Nov 2025](https://developers.google.com/my-business/content/qanda/change-log)
- [GBP API sunset dates](https://developers.google.com/my-business/content/sunset-dates)
- [Nearby Search (New)](https://developers.google.com/maps/documentation/places/web-service/nearby-search)
- [Maps Platform core pricing](https://developers.google.com/maps/billing-and-pricing/pricing)
- [Calendar freebusy.query](https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query)

**Meta / WhatsApp / Instagram / Facebook**

- [WhatsApp Business Platform pricing](https://developers.facebook.com/docs/whatsapp/pricing) (per-message since 1 Jul 2025; Spain marketing rate up 1 Jul 2026)
- [WhatsApp Business Messaging Policy](https://business.whatsapp.com/policy)
- [Get opt-in for WhatsApp](https://developers.facebook.com/documentation/business-messaging/whatsapp/getting-opt-in)
- [Catalogs overview](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/sell-products-and-services)
- [Page Ratings (GET only)](https://developers.facebook.com/docs/graph-api/reference/page/ratings/)
- [Messenger Platform policy](https://developers.facebook.com/docs/messenger-platform/policy-overview)
- [Instagram Messaging overview](https://developers.facebook.com/docs/instagram-messaging/overview/)
- [IG comment replies](https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/ig-comment/replies.md)
- [IG private replies](https://developers.facebook.com/docs/instagram-platform/private-replies)
- [Meta Spam Community Standard](https://transparency.meta.com/policies/community-standards/spam/)

**Apple / TripAdvisor / TheFork**

- [Apple Business Connect — approved API partners](https://support.apple.com/guide/apple-business-connect/abcb36ef9f27/web)
- [Register as ABC Third-Party Partner](https://support.apple.com/guide/apple-business-connect/register-your-third-party-partner-or-agency-abcbec357512/web)
- [ABC location attributes](https://support.apple.com/guide/apple-business-connect/configure-location-attributes-abcbdc543423/web)
- [Tripadvisor Terra](https://docs.terra.tripadvisor.com/docs/overview.md); [Management responses](https://www.tripadvisorsupport.com/en-US/hc/owner/articles/347)
- [TheFork Developers Portal](https://docs.thefork.io/); [TheFork Manager — right to reply](https://support.theforkmanager.com/s/article/How-do-I-manage-diners-reviews-and-my-right-to-reply)

**Law**

- [GDPR Regulation (EU) 2016/679, Art. 6](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)
- [ePrivacy Directive 2002/58/EC, Art. 13](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:02002L0058-20091219)
- [Ley 34/2002 LSSI, Art. 21 (BOE consolidado)](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758)

**Vendor pricing (public pages)**

- [NiceJob pricing](https://get.nicejob.com/pricing) — $75 / $125
- [BrightLocal “How much does BrightLocal cost?”](https://help.brightlocal.com/hc/en-us/articles/12623266931730-How-much-does-BrightLocal-cost) — Track $41 / Manage $54 / Grow $65 (1 location)
- [Yext PowerListings plans](https://www.yext.com/pl/powerlistings/plans.html) — $199–$999 / year
- [Twilio SMS pricing Spain](https://www.twilio.com/en-us/sms/pricing/es) — $0.0875 outbound / segment

**Internal (BabyRock)**

- `01-produit.md` (v1 €99 TTC, V2 FAQ+Calendar after ~40)
- `02-marche-legal.md` (LSSI, processor, review-ask as churn insurance)
- `10-whatsapp-service.md` (€119 FAQ later; Cloud API)
- `12-decisions-ouvertes.md` (TA/TheFork out of v1)
- `16-plan-affaires.md` (margin, 2.5 min/review, PH economics)

---

*Not legal advice. Before any diner-facing WhatsApp, have Spanish counsel confirm the Art. 21 analysis for the exact template. Meta and Google policies change on a calendar; re-read the Fake Engagement page and the WA rate card at each SKU launch.*
