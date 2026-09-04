# Online reputation and Google review management for SMBs

**Market research for BabyRock Social / BRM Social**  
**Date of research:** 2 September 2026  
**Scope:** US and EU vendors of review-reply and reputation tools aimed at small and multi-location local businesses; Google Business Profile (GBP) official policy and APIs; academic and first-party evidence that reviews, ratings, and replies affect demand; published 2024–2026 pricing; product-adjacent upsells; and the gap between dashboards and a managed service for independent Spanish shops.

**Method.** Primary sources only: vendor pricing and product pages, Google Help / Search Central / GBP API docs, peer-reviewed or working papers, vendor-run surveys that publish methodology, EU Official Journal / FTC rule texts. Blog roundups, Capterra/G2 “starting from” figures, and competitor comparison posts are **not** used as the source of truth for prices. Where a vendor does not publish a price, this report says so.

**How to read prices.** “Published” means a dollar or euro figure appears on a page the vendor controls. “Quote-only” means the vendor’s own site requires sales contact. All USD figures are as published; they are not converted. BabyRock’s €99 TTC/month is about €82 HT at Spanish 21% IVA, which is the relevant comparison band for a single independent location.

---

## 1. Findings in brief

1. The US/EU “reputation” category is dominated by **self-serve SaaS dashboards**, not by managed reply services. The closest managed analogues are Widewail (human writers, auto dealers, US), Reputation.com’s optional Managed Services add-on, and hotel-centric platforms (Customer Alliance, TrustYou). Independent restaurants, salons, and clinics in Spain are not the design customer of Podium, Birdeye, or Reputation.com.
2. **Published SMB prices that actually appear on vendor sites** cluster in three bands: local-SEO/review-generation tools at roughly **$40–$125/month** (BrightLocal, NiceJob, GatherUp); mid-market per-location reputation suites at **$80–$150/location/month** (Reputation.com published tiers); restaurant growth stacks at **$249–$499/month** (Owner.com); Trustpilot from **$99–$799/domain/month billed annually**; hotel review software from **€108/month** (Customer Alliance). Podium and Birdeye, the two names most often cited as “the market,” **do not publish a usable price list** on the pages fetched for this report.
3. Google officially **encourages replies, review-request links/QR codes, and Posts**; **prohibits incentives, review gating, and selective solicitation of only positive reviews**; **requires written, explicit consent** before a third party replies on a merchant’s behalf; and **forbids automating review replies without the user’s prior specific and express consent**. Reply text is capped at **4,096 bytes**. Replies are **moderated** (usually minutes, up to 30 days). Google Business Messages as an API was **shut down 31 July 2024**. WhatsApp can still be listed as a GBP contact option.
4. Causal evidence that **ratings move restaurant revenue** is strong and old: Luca (HBS working paper 12-016) finds a **5–9% revenue lift per Yelp star**, concentrated in **independents, not chains**. Anderson & Magruder (Economic Journal, 2012) find an extra **half-star raises sell-out probability by 19 percentage points**. Causal evidence that **management replies** improve ratings is also peer-reviewed: Proserpio & Zervas (Marketing Science, 2017) find **+0.12 stars and +12% review volume** for hotels that start responding. There is **no equivalent Google-owned causal study** of Google review replies on Spanish SMB revenue. BrightLocal’s annual consumer surveys (US panels, ~1,000 adults, SurveyMonkey, methodology published) show large stated-preference effects for replies, recency, and 4.0–4.5★ floors.
5. After review replies, the same vendors sell **review generation (SMS/email), listings syndication, surveys/NPS, webchat/SMS inbox, payments, websites, social posting, and (for restaurants) first-party ordering**. That is the product path BabyRock’s V2 (WhatsApp FAQ + booking) already points toward. The **white space** is not another dashboard. It is a **managed, WhatsApp-native, Spanish-language reply service at ~€99 TTC** that does not require the owner to log into software, connect a POS, or sit through a sales demo — provided Google’s third-party consent and no-auto-publish rules are followed in writing.

---

## 2. Who sells review reply / reputation to SMBs

Vendors are grouped by how they actually go to market. “Software” means the merchant (or their staff) logs into a dashboard. “Managed” means a vendor team writes or publishes replies. Many products mix AI drafts with a human still required to click.

### 2.1 US platforms most often named as category leaders

#### Podium (Lehi, Utah) — software, sales-led, local services

- **Product.** All-in-one “lead conversion” platform: unified inbox (SMS, webchat, calls, email, social), review collection and AI replies, text marketing, payments, phones, automations, optional “AI Employee.” Reviews product page: AI Reputation Specialist “intelligently crafts review invites and replies”; automations for invites; one inbox across review sites. ([podium.com/product/reviews](https://www.podium.com/product/reviews/))
- **Who they sell to.** Local businesses that live on inbound calls and SMS: home services, auto, retail, aesthetics, furniture. Homepage claims “Over 100K businesses.” Customer stories on the pricing page are Budget Blinds, HVAC, mattress retail, spa, jewelry, auto dealer — not independent tapas bars. ([podium.com/pricing](https://www.podium.com/pricing))
- **Software vs managed.** Self-serve software plus onboarding/CSM. AI drafts; the merchant still owns the inbox. Not a done-for-you reply agency.
- **Price.** **Not published as a stable public list.** The official pricing page fetched 2 September 2026 is “Plans designed to fit your specific business needs, talk to our sales team,” with Core / Pro / Signature comparison and an FAQ that says monthly cost “may vary” and that “We’ve outlined the base costs of our different plans above.” The HTML returned by that fetch **did not include dollar amounts**. A web-index snapshot of the same URL has previously shown **Core $399/month and Pro $599/month USD**. Treat $399 / $599 as **unverified against live HTML** until a screenshot or contract is in hand. HVAC is called out as custom. ([podium.com/pricing](https://www.podium.com/pricing))

#### Birdeye (Palo Alto) — software, enterprise / multi-location first

- **Product.** Positions as an “agentic marketing platform for multi-location brands”: reviews, listings, social, messaging/webchat, surveys, ticketing, insights. Named AI “coworkers” cover marketing (reviews, listings, social), ops (messaging, chatbot), and CX (surveys). Logo wall is Aspen Dental, Cracker Barrel, Extra Space Storage, Smile Brands, Black Bear Diner, Jiffy Lube, Six Flags — chains. ([birdeye.com](https://birdeye.com/))
- **Who they sell to.** Multi-location healthcare, dental, restaurants, auto, retail, storage, legal, finance. Pricing page is segmented 1–3 / 4–9 / 10–39 / 40–249 / 250–999 / 1000+ locations and leads to a form. ([birdeye.com/pricing](https://birdeye.com/pricing/))
- **Software vs managed.** Software. Agents “act autonomously, or with your approval.”
- **Price.** **Quote only.** Official page: “GET PRICING.” No dollar figure on the vendor pricing page. Third-party blogs repeatedly cite ~$299/location; that is **not a Birdeye-published price** and is not used here.

#### Reputation.com (Reputation) — software + optional managed services, now with published per-location list prices

- **Product.** Reviews management (collection, requesting, AI responding), listings & SEO, insights, surveys, social suite, ticketing, competitive insights. Explicit **Managed Services** line: “Let our team manage your review responding, listings, or social engagement.” ([reputation.com/pricing](https://reputation.com/pricing))
- **Who they sell to.** Multi-location brands (property, healthcare, auto, restaurants). Enterprise tier is “125+ locations.”
- **Software vs managed.** Core product is software. Managed Services is an add-on (price of the add-on **not published**).
- **Price (published).**  
  - Rep Core: **$80 / location / month** — reviews + listings & SEO  
  - Rep Core + Pulse: **$115 / location / month** — adds insights, AI Reputation Manager, Pulse analytics, basic surveys  
  - Rep Core + Surveys: **$150 / location / month**  
  - Enterprise: custom  
  ([reputation.com/pricing](https://reputation.com/pricing))

#### NiceJob (Canada) — self-serve software for trades / home services

- **Product.** Review requests (email/SMS), monitoring, website widgets, social sharing of reviews, AI-generated replies. Pro adds booking reminders, referral campaigns, gifting, competitor insights, **automated AI review replies**, NPS. Separate **Sites** product: managed website at **$99/month + $199 setup**, with a “10% more website sales or it’s free” guarantee. ([get.nicejob.com/pricing](https://get.nicejob.com/pricing))
- **Who they sell to.** Small service businesses (contractors, cleaners, home services). Claims 50,000+ businesses. Franchise/multi-location is custom.
- **Software vs managed.** Software, 14-day trial, **no contract**. Sites is closer to managed (they build and update the site).
- **Price (published, USD).** Reviews **$75/month**; Pro **$125/month**. FAQ: prices in USD; no lock-in. ([get.nicejob.com/pricing](https://get.nicejob.com/pricing))

#### Grade.us / GatherUp (now Insight Integrity Group) — self-serve + agency white-label

- **Product.** Review funnel (happy customers routed to public sites, unhappy to private form), email/SMS campaigns, monitoring 100+ sites, AI-crafted replies, widgets, NPS. Listings Hub add-on. Grade.us demo page now redirects interest to “the next generation… powered by GatherUp.” GatherUp and Grade.us were acquired by Insight Integrity (announced on GatherUp’s blog, 3 December 2025). ([gatherup.com/pricing](https://gatherup.com/pricing/); [grade.us demo](https://www.grade.us/home/request-a-demo/))
- **Who they sell to.** Single-location SMBs, multi-location, and **agencies** (white label).
- **Software vs managed.** Software. Agencies resell it as a “managed” service to their clients; GatherUp itself is not the labor.
- **Price (published).** Small Business (1 location) **$99/month**; Multi-location **$60/month per location** (2–10 locations shown; higher location bands on the same page). Annual **20% off**. All plans: up to 300 SMS + 3,000 email credits per location per month. Listings Hub add-on **$40/month per location**. ([gatherup.com/pricing](https://gatherup.com/pricing/))  
  An older Grade.us plans page still lists Small Business **$99/month** and multi-location **$60/month per location**. ([grade.us/home/plans](https://www.grade.us/home/plans/))

#### ReviewTrackers — software, location-based, quote-led

- **Product.** Monitor 100+ sources, alerts, review requests, responding, competitor insights, data/API. Claims 175,000+ business locations on the demo page. ([reviewtrackers.com/request-demo](https://www.reviewtrackers.com/request-demo/?gated_content_name=enterprise))
- **Who they sell to.** Multi-location brands and resellers, not a typical one-shop café.
- **Software vs managed.** Software. Unlimited users advertised.
- **Price.** **Not a public dollar figure.** Official plans page: “Our pricing is location-based,” “Plans start at $ ___ per location per month paid annually” with the number filled by a JS calculator, then “Book time to get custom pricing.” ([reviewtrackers.com/plans](https://www.reviewtrackers.com/plans/)) Do not invent a starting price.

#### BrightLocal (UK, sells globally) — local SEO software; reviews only on the top plan

- **Product.** Track (rank tracking, GBP audit), Manage (listings sync, GBP posting), Grow (adds **Monitor / Get / Showcase Reviews**). Separate **Managed SEO Services** from **$1,299/month**. Citation Builder is pay-as-you-go. ([help.brightlocal.com plan matrix](https://help.brightlocal.com/hc/en-us/articles/12664657783826-What-is-included-in-my-subscription-plan); [brightlocal.com/solutions](https://www.brightlocal.com/solutions/))
- **Who they sell to.** Agencies and SMBs doing local SEO. Reputation is a module, not the whole company.
- **Software vs managed.** Software. Managed SEO is a separate high-ticket service.
- **Price (published, help center).** “Prices start from just $39 per month.” 1-location monthly: Track **$41**, Manage **$54**, Grow **$65**. Annual ~25% off (1-location annual Track $369, Manage $485, Grow $584). Prices are **per plan for a location band, not per extra location**. ([help.brightlocal.com/…How-much-does-BrightLocal-cost](https://help.brightlocal.com/hc/en-us/articles/12623266931730-How-much-does-BrightLocal-cost))

#### Trustpilot (Copenhagen, listed) — open review platform, not a GBP reply tool

- **Product.** Trustpilot-hosted reviews, invitation automation, widgets, ads assets, AI-assisted replies on higher plans. **Free plan**: claim profile, reply, 50 invitations/month. Paid plans buy more invitations and marketing tools. Location reviews are an **add-on**. This is **not** Google review management. ([business.trustpilot.com/pricing](https://business.trustpilot.com/pricing); [support: do businesses pay](https://support.trustpilot.com/hc/en-us/articles/4421461660946-Do-businesses-pay-to-use-Trustpilot))
- **Who they sell to.** Ecommerce and consumer brands; 1.17M+ businesses with Trustpilot reviews, per the pricing page.
- **Software vs managed.** Software. 12-month commitment on paid plans.
- **Price (published, USD, per domain, billed annually).** Starter **from $99/mo** (new SMBs up to $5M revenue, 100 invitations); Plus **from $319/mo** (300 invitations); Premium **from $799/mo** (1,000 invitations); Enterprise custom. EU sites list Starter **from €79**, Plus **from €189**, Premium **from €479** (e.g. [es.business.trustpilot.com/pricing](https://es.business.trustpilot.com/pricing)). Each extra domain is priced separately.

#### Yelp — free public replies; paid ads / AI receptionist; partner API for replies

- **Product.** Claiming a Yelp Business Page is free. Public comments, direct messages, and a one-click “Thank” on 4–5★ reviews are native and free. ([biz.yelp.com support: respond](https://www.biz.yelp.com/support-center/article?articleNumber=000006832&l=en-US)) Yelp **prohibits asking for reviews and offering incentives**. ([business.yelp.com: how to get reviews without asking](https://business.yelp.com/resources/articles/how-to-get-yelp-reviews-without-asking/?domain=local-business)) Paid: Yelp Ads (budget-based); **Yelp Host** for table-service restaurants “starting at $149 per month ($99 per month for Yelp Guest Manager customers)”; **Yelp Receptionist** “starts at $99 per month.” ([Yelp blog, 21 Oct 2025](https://blog.yelp.com/news/yelp-host-yelp-receptionist-launch/))
- **API constraint relevant to agencies.** Official partner FAQ: public responses via Respond-to-Reviews API; **private responses not in the API**; **cap of 20 public responses per day per location**; no discounts or email-list asks in replies. R2R is for mutual enterprise customers (10+ locations with branded/enhanced profiles or CPC ads) or Insights + Listing Management customers. ([docs.developer.yelp.com/docs/faqs](https://docs.developer.yelp.com/docs/faqs))
- **Software vs managed.** Native Yelp is self-serve. Host/Receptionist are paid AI coverage, not review-writing.

#### Owner.com — restaurant growth system; reviews are a module, not the SKU

- **Product.** AI website, first-party online ordering, branded app, SEO pages, email/SMS, loyalty, listings, **Reviews Engine** (automated post-order Google review requests; dashboard to view/respond). Owner’s own FAQ: “Responding to reviews is always a good idea… That said, the most important thing is generating a steady volume of new reviews, which Owner handles for you automatically.” ([owner.com/reviews-engine](https://www.owner.com/reviews-engine))
- **Who they sell to.** Independent US restaurants. Not EU-primary.
- **Software vs managed.** Software + white-glove setup. Not a reply agency.
- **Price (published).** Flexible **$249/month + 5% restaurant fee per order**; Flat Rate **$499/month**, no restaurant fee, “best for restaurants at $5k+/mo in online sales.” Month-to-month, no long-term contract. Guests pay a 5% order-support fee on both plans. ([owner.com/pricing](https://www.owner.com/pricing))

#### Widewail — the closest **managed** US analogue

- **Product.** Review generation (Invite) plus **Engage: human-written review responses**. Official response page: positives go out immediately; negatives get a suggested response that the store must approve; “100% response rate… in 24 hours, often within minutes”; spam/slander reporting. ([widewail.com/solutions/response/review-response](https://www.widewail.com/solutions/response/review-response))
- **Who they sell to.** US auto dealers first; some property. Not Spanish independents.
- **Software vs managed.** **Managed labor** on Pro/Engage. Core is self-service in a dashboard.
- **Price.** Main pricing page is package comparison **without dollars** (“All pricing is monthly per location”). ([widewail.com/pricing](https://www.widewail.com/pricing)) A **Widewail-hosted Subaru co-op page** does publish: Invite **$350/month** (50% co-op eligible), Engage **$250/month** (50% co-op eligible), Engage Plus **$250/month**. ([widewail.com/sdc](https://www.widewail.com/sdc)) Treat $250/$350 as **published on a vendor co-op page**, likely dealer-specific, not a universal SMB list price.

#### Yext (NYSE: YEXT) — listings intelligence; reviews as a license

- **Product.** Knowledge Graph + listings syndication to Google/Apple/Bing/Yelp/etc., plus Reviews (monitor, respond, generate), Pages, Social. Help Center: Reviews has three capabilities (monitoring, generation, first-party display) sold as **separate packages**. ([help.yext.com Reviews Overview](https://help.yext.com/hc/en-us/articles/360001275683-Reviews-Overview))
- **Who they sell to.** Enterprise and mid-size directly; SMBs via resellers. Yext’s own FAQ: “Yext is built for large multi-location enterprises; smaller businesses are better served by our reseller partners.” Pricing is custom, annual, by solution and location count. ([yext.com/knowledge-center/yext-faq](https://www.yext.com/knowledge-center/yext-faq))
- **Legacy SMB list.** An older PowerListings self-serve page still lists Emerging **$199 annually**, Essential **$449 annually**, Complete **$499 annually**, Premium **$999 annually** (quoted as weekly rates billed annually). Yext’s current FAQ describes PowerListings as the “older self-serve listings product.” Do not treat those as 2026 enterprise prices. ([yext.com/pl/powerlistings/plans.html](https://www.yext.com/pl/powerlistings/plans.html))

### 2.2 Europe (including Spain-relevant)

#### Partoo (France; strong Spain presence) — the local-listings incumbent for Spanish chains

- **Product.** Presence Management (GBP + directories), Review Management (Google, Facebook, Tripadvisor; AI replies and templates), Review Booster (SMS review requests), Feedback Management, Messages / webchat / AI chatbot (“Jim”). Spanish help center documents GBP verification, services, additional URLs, and a unified review inbox. ([partoo.co/es/tarifas](https://www.partoo.co/es/tarifas/); [help.partoo.co review management](https://help.partoo.co/es/articles/3606462-las-principales-funcionalidades-del-review-management-de-partoo))
- **Who they sell to.** Multi-location Spanish and European brands (banks, food retail, fashion, restaurants, beauty, auto). 2026 barometer: **22,911 points of sale, 123 Spanish clients**, all using Partoo Presence + Review Management. ([partoo.co/es/blog/barometer-2026](https://www.partoo.co/es/blog/barometer-2026/) — note the 2024 URL redirected here)
- **Software vs managed.** Software with AI assistant. Not a human-QC WhatsApp service for a single shop.
- **Price.** **Quote only.** Spanish and English pricing pages: “Solicitar un presupuesto” / “Request a quote.” No euro figure.

#### Customer Alliance (Berlin) — hotel guest-feedback software, published euros

- **Product.** Centralize OTAs + Google reviews, AI replies in the language of the review (133 languages claimed), surveys (CSAT/NPS), widgets. GDPR, servers in Germany. ([customer-alliance.com pricing](https://www.customer-alliance.com/en/pricing-and-packaging))
- **Who they sell to.** Hotels, not independent retail/F&B on the high street — but the **price and AI-reply UX** are the closest EU published analogue to “pay monthly, AI drafts, you publish.”
- **Price (published).** Core **from €108/month** for one location (+ €29/month per extra business unit on the EN page). Growth from **€217/month** EN / **€178/month** on an older ES page (figures moved; use the EN page as current). Pro from **€257/month** EN. Speak-to-sales, not fully self-checkout.

#### Trusted Shops (Cologne) — ecommerce trustmark + reviews, Spain is a listed market

- **Product.** Trustmark, buyer protection, eTrusted review platform, widgets, optional Google Shopping stars, Smart Review Assistant. Not GBP-native for a restaurant.
- **Price (example from official booking flow, NL).** Membership base around **€80–€99/month** depending on turnover band, plus add-ons (Smart Review Assistant listed at **€80/month**, Google integration **€30/month** on that booking page). ([booking.trustedshops.com](https://booking.trustedshops.com/?registeredOffice=nl-NL)) Treat as **ecommerce**, not local-shop GBP.

#### Skeepers / Avis Vérifiés (France) — verified reviews for retail/ecommerce

- Official site and Google Merchant Center list “Echte Bewertungen by Skeepers / verified-reviews.com” as a product-review feed partner. **No public SMB GBP price found on a Skeepers page during this research.** Relevant in France/Spain for ecommerce, not as a restaurant reply service.

#### Other EU names (status)

| Vendor | What they are | Published price | Notes |
| --- | --- | --- | --- |
| TrustYou | Hotel CX / reputation | **Not found on a TrustYou pricing page in this pass** | HotelTechReport comparison pages quote “from $100/mo”; that is **not** a TrustYou URL |
| Guest Suite (France) | Hotel/restaurant review software | **Not found on vendor pricing page in this pass** | Often listed in French roundups; skip until a vendor URL exists |
| eKomi | Verified reviews / Google Shopping partner | **Not found** | Google Merchant Center partner list only |
| Reviewshake | Agency white-label review software | **Not independently fetched** | Omit price |
| SOCi | Multi-location social + listings + reviews | **Quote-only in practice** | Franchise/enterprise, not a Sant Cugat salon |

### 2.3 Platforms that are not competitors but shape the job

- **Google** is the review site that matters for Spanish local discovery (see §4 BrightLocal; Partoo’s Spanish barometer is built entirely on Google). Replying is free in GBP. The paid layer is Google Ads / local ads, not a Google-sold “reply product.”
- **WhatsApp** is the client channel BabyRock already uses. GBP Help documents adding WhatsApp or SMS as a **Chat contact** on the profile (select countries). If both WhatsApp and SMS are added, **only SMS is shown to customers**. ([support.google.com/business/answer/16751381](https://support.google.com/business/answer/16751381))
- **TripAdvisor / TheFork / Doctoralia / Booksy** sit beside Google for restaurants, clinics, and salons in Spain. None of the US suites above are built around those as the primary inbox. That is a localization gap, not researched in depth here (no primary product+price pages pulled for TheFork business tools).

### 2.4 How BabyRock sits on this map

BabyRock is **not** another NiceJob. It is closer to **Widewail Engage** (human QC, positives auto-ish, negatives need owner context) plus **WhatsApp as the only merchant UI**, at a **GatherUp/NiceJob price point** (€99 TTC), for **independent Spanish shops**. No vendor in the table above sells that combination on a public page.

---

## 3. What Google officially says

### 3.1 Review replies (Help Center)

Must be **verified**. Flow: Business Profile → Read reviews → Reply. ([support.google.com/business/answer/3474050](https://support.google.com/business/answer/3474050); step-by-step [answer/16334827](https://support.google.com/business/answer/16334827))

**What happens after you click Reply** (same Help article):

- Google **reviews your replies** against content policy. If not approved, you are asked to edit. “Replies usually take up to 10 minutes to review, but sometimes a review can take up to 30 days.”
- If approved, the reply is public as **the business**, not the personal name of the staffer.
- The reviewer is **notified**. They can still edit their review; the review date then updates to the edit.

**How Google tells merchants to write** ([answer/3474122](https://support.google.com/business/answer/3474122)):

- Professional, short, not a copy-paste “thank you” on every review.
- “Be conversational, **not promotional**. … avoid using your response to offer deals or promotions.”
- On negatives: no private info, no personal attacks; move complex issues to phone/email; apologize when appropriate; personalize; respond promptly.
- Google’s own “value all reviews” line: a mix of positive and negative “often feels more trustworthy.”

### 3.2 Review generation (asking)

Officially allowed: share a **Google review link or QR code** (receipts, thank-you emails, end of chat, in-store print). The same page also lists sending requests via **email, WhatsApp, or Facebook**. ([answer/16816815](https://support.google.com/business/answer/16816815))

Officially **forbidden** — stated on that page and in Prohibited content:

> Offering incentives, like free or discounted goods or services, to customers in exchange for reviews is considered fake engagement and is strictly prohibited. This includes posting reviews, changing reviews, or removing negative reviews.

Policy page in full: [Prohibited & restricted content](https://support.google.com/business/answer/7400114) (also mirrored at [contributionpolicy/answer/7400114](https://support.google.com/contributionpolicy/answer/7400114)).

**Gating / selective solicitation — this is the operational landmine for “review funnels.”** Under **Rating Manipulation**, Google does **not** allow merchants to:

- Offer incentives for posting **any** review, or for revising/removing a negative one.
- “**Discourage or prohibit negative reviews, or selectively solicit positive reviews from customers.**”
- “When soliciting reviews, merchants should not require or pressure users to leave ratings or write reviews **while on the premises**, nor should they request that **specific content** be included” (including quotas for staff, or asking that a staff member be named).

Google **does** allow: solicit genuine-experience reviews **without** incentives and **without** attempting to influence rating or content.

**Enforcement.** Fake Engagement violations can get: no new reviews for a period; existing reviews unpublished; a public warning that fake reviews were removed. ([answer/14114287](https://support.google.com/business/answer/14114287))

**EU law is aligned, and broader than Google’s TOS.** Directive (EU) 2019/2161 (Omnibus) amended the Unfair Commercial Practices Directive. Annex I point 23c prohibits submitting or commissioning fake reviews or **misrepresenting** reviews (including publishing only positives and deleting negatives). Point 23b prohibits claiming reviews are from real purchasers without reasonable verification steps. Applied from **28 May 2022**. ([EUR-Lex Directive 2019/2161](https://eur-lex.europa.eu/eli/dir/2019/2161/oj?locale=en); Commission guidance [C/2021/9320](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021XC1229(05)))

**US FTC Consumer Review Rule** (16 CFR Part 465), effective **21 October 2024**, bans fake reviews, insider reviews without disclosure, and **incentives conditioned on a particular sentiment**. Civil penalties (FTC 2025 warning-letter post) up to **$53,088 per violation**. Not Spanish law, but it is why US tools talk about “no gating.” ([FTC press, 14 Aug 2024](https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials); [FTC Q&A](https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers); [FTC warning letters, 22 Dec 2025](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-warns-10-companies-about-possible-violations-agencys-new-consumer-review-rule))

**Implication for BabyRock and for Grade.us-style funnels:** a landing page that sends 4–5★ to Google and 1–3★ to a private form is **exactly** “selectively solicit positive reviews,” which Google forbids and which EU UCPD treats as misrepresenting reviews if the public profile is thereby skewed. BabyRock’s current product (reply to reviews that already exist, owner OK on 1–3★) does **not** require gating. A V2 “get more reviews” module must be **ungated**: same Google link for everyone, no star filter, no discount-for-stars.

### 3.3 Google Posts

Merchants can publish **Updates, Offers, Events** (text, photo, video, CTA buttons: book/order/shop/learn more/etc.). Posts older than **6 months** are archived unless a date range is set. Phone numbers in the post body may be rejected. Google moderates against the posts content policy (Live / Pending / Not approved). Tips include: avoid “auto-generated or distracting content.” Featured posts that replace reviews on mobile GBP are limited to **English, single-location food & drink, US/UK/CA/AU/NZ**. ([answer/7390603](https://support.google.com/business/answer/7390603); posts policy [answer/7213077](https://support.google.com/business/answer/7213077))

**API:** Local Posts create/edit/delete. Event, call-to-action, offer. **Product posts cannot be created via the API.** ([developers.google.com/my-business/content/posts-data](https://developers.google.com/my-business/content/posts-data))

### 3.4 Q&A

GBP API still documents a Q&A API (`mybusinessqanda.googleapis.com`) for create/list/patch/delete of questions and answers. ([developers.google.com/my-business/reference/qanda/rest](https://developers.google.com/my-business/reference/qanda/rest)) API **policies** say if you post or answer on behalf of a client you need their authorization first. ([developers.google.com/my-business/content/policies](https://developers.google.com/my-business/content/policies))

**Caveat:** multiple industry posts in late 2025 claimed Google was sunsetting consumer Q&A in favour of “Ask about this place” AI. **No Google Help article confirming a full Q&A kill-switch was found in this pass.** Treat Q&A as **policy-constrained and possibly product-unstable**; do not build a product line on seeding fake owner questions without a current Google Help citation.

### 3.5 Messaging

- **Google Business Messages API: discontinued 31 July 2024.** ([developers.google.com/business-communications/…/update-on-gbm](https://developers.google.com/business-communications/business-messages/resources/release-notes/update-on-gbm))
- GBP Help still lets merchants add **WhatsApp or SMS** as Chat on the profile (country-limited). ([answer/16751381](https://support.google.com/business/answer/16751381))
- Google may **call/text/WhatsApp the business** to confirm hours and then **post on the merchant’s behalf**; merchants can opt out. ([answer/7690269](https://support.google.com/business/answer/7690269))
- A Partoo blog (5 August 2026) claims Google reintroduced a native GBP message button with an AI agent. **That is a vendor blog, not a Google Help article.** Do not treat it as official until Google documents it.

**Implication for V2:** do not bet on Google’s own inbox. WhatsApp as the merchant’s customer channel is the durable Google-approved contact method.

### 3.6 Third-party / agency rules (this is BabyRock’s legal box)

[Business Profile third-party policies](https://support.google.com/business/answer/7353941):

- Claim/manage only with the owner’s **express consent** (written or a positive action such as a checkbox). **“To respond to reviews on behalf of the end customer, you must have an explicit approval. Verbal consent isn't sufficient.”** Keep written/digital proof.
- Business must **retain ownership or co-ownership** at all times. Agency should be **Manager, not Owner**, if the client already has a profile.
- Tell the client, in writing, that **GBP itself is free** and that your fee is a management fee; disclose it on invoices.
- Share Google’s [“Working with a third party” notice](https://support.google.com/business/answer/7163406); link it on the website.
- Client can quit: within **7 business days** you must let them disassociate and regain exclusive control.
- No password sharing; no holding the profile hostage; no impersonating Google; no auto-reverting Google’s suggested edits without consulting the merchant (that one can reduce **API quota**).

[GBP API policies](https://developers.google.com/my-business/content/policies) add a sentence that should be in every BabyRock runbook:

> “you must not automate or trigger review replies, Q&As, listing creations, listing edits, or other actions **without the user's prior specific and express consent**.”

Also: if you reply on behalf of a client, authorization first; all replies must follow prohibited-content policy. Cache of API content is limited to **30 days**. Do not use `GoogleLocations` for lead gen.

BabyRock’s model — **AI draft → human operator click to publish 4–5★; 1–3★ wait for owner WhatsApp OK** — is **compatible** with these rules **if**:

1. The contract + checkbox grant **explicit permission to reply**, including a standing instruction for 4–5★.
2. 1–3★ really do wait for **specific** owner consent (or a documented standing playbook the owner signed).
3. The operator click is a real human approval, not an unattended cron job.
4. The merchant remains **owner** of the GBP; BabyRock is manager.
5. Replies are not promotional, not incentivizing, not asking to change the star rating.

### 3.7 API mechanics and quotas

- **Reviews API (v4, still documented):** `list`, `get`, `batchGetReviews` (up to 50 locations), `updateReply` (PUT, creates if missing, **verified locations only**), `deleteReply`. OAuth scopes `business.manage` / `plus.business.manage`. ([review-data guide](https://developers.google.com/my-business/content/review-data); [updateReply](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply))
- **Reply length:** `ReviewReply.comment` maximum **4096 bytes**. ([REST Resource: reviews](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews))
- **Moderation state on replies:** `reviewReplyState` including REJECTED, with `policyViolation` populated when rejected. Google announced the ability to see **why** a reply was rejected in the Reviews API ([latest-updates banner on API docs](https://developers.google.com/my-business/content/review-data)).
- **Default quotas** published for Business Information, Account Management, Performance, Verifications, Lodging, Place Actions, Notifications: typically **300 QPM**, plus some QPD caps. **The quota table does not list a separate Reviews API line.** Access starts at 0 until you apply. Quota increase requires past usage (requests denied if average use &lt; 50–70% of current cap, depending on the page). ([quota limits](https://developers.google.com/my-business/content/limits); [FAQ](https://developers.google.com/my-business/content/faq))
- **There is no published “N review replies per location per day” Google quota** analogous to Yelp’s 20/day. Practical limits are QPM/QPD, verification, and content moderation — plus the policy ban on unattended auto-reply.

Basic API access is application-gated ([Application For Basic API Access](https://support.google.com/business/contact/api_default)). A PH operator farm publishing via the merchant’s Google login in a browser is a different (fragile) path; the API path is the one Google designed for agencies, and it is the one that carries the consent/audit duties above.

---

## 4. Evidence that replies, volume, and stars affect revenue

### 4.1 Causal, peer-reviewed / working papers (use these, not blog infographics)

**Michael Luca, “Reviews, Reputation, and Revenue: The Case of Yelp.com,” Harvard Business School Working Paper 12-016, revised March 2016.**  
[HBS item](https://www.hbs.edu/faculty/Pages/item.aspx?num=41233) · [PDF via HBS](https://www.hbs.edu/ris/download.aspx?name=12-016.pdf) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1928601)

- Data: Yelp + **Washington State Department of Revenue** restaurant tax data.
- Identification: regression discontinuity on Yelp’s **rounding** of average rating to half-stars.
- Findings, quoted from the abstract: “(1) a one-star increase in Yelp rating leads to a **5-9 percent increase in revenue**, (2) this effect is driven by **independent restaurants; ratings do not affect restaurants with chain affiliation**, and (3) chain restaurants have declined in market share as Yelp penetration has increased.”
- Also: consumers respond more when the rating is based on **more reviews** and more Elite reviewers.

**This is the single best citation for BabyRock’s ICP (independent restaurants).** It is Yelp, not Google, and it is Seattle-area historical data — say that out loud. The mechanism (star display → demand for independents who lack brand reputation) is the one that should transfer to Google Maps in Spain.

**Michael Anderson & Jeremy Magruder, “Learning from the Crowd,” *The Economic Journal* 122(563), 2012, pp. 957–989.**  
DOI [10.1111/j.1468-0297.2012.02512.x](https://doi.org/10.1111/j.1468-0297.2012.02512.x) · [Wiley](https://onlinelibrary.wiley.com/doi/10.1111/j.1468-0297.2012.02512.x)

- 328 San Francisco restaurants, 148,000 Yelp reviews, reservation availability as outcome.
- Abstract: “An extra **half-star** rating causes restaurants to **sell out 19 percentage points (49%) more frequently**, with larger impacts when alternate information is more scarce.”
- UC Berkeley news write-up (same authors): moving 3 → 3.5★ raises prime-time sell-out chance from **13% to 34%**; another +19 pp from 3.5 → 4★. Effect **not significant** for Michelin / Chronicle Top 100 restaurants. ([vcresearch.berkeley.edu](https://vcresearch.berkeley.edu/news/crowd-sourced-online-reviews-help-fill-restaurant-seats-study-finds))

**Davide Proserpio & Georgios Zervas, “Online Reputation Management: Estimating the Impact of Management Responses on Consumer Reviews,” *Marketing Science* 36(5), 2017, pp. 645–665.**  
DOI [10.1287/mksc.2017.1043](https://doi.org/10.1287/mksc.2017.1043) · [SSRN](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2521190) · [BU open manuscript](https://open.bu.edu/items/9b759580-53d3-44ff-975e-c17d5641abcc)

- Hotels, not restaurants. Identification: hotels respond at different rates across platforms; variation in whether a later reviewer would have seen a management response.
- Abstract findings: hotels start responding after a **negative shock**; they respond to positive, negative, and neutral at **roughly the same rate**; responding is associated with a **0.12-star increase** and a **12% increase in review volume**. After they start, they get **fewer but longer negative reviews** (authors’ interpretation: unsatisfied guests become less likely to leave short, indefensible attacks if they expect a public reply).
- **This is the best causal paper on “replying changes the rating,”** which is BabyRock’s actual job. External validity to Spanish restaurants/salons is an assumption, not a result.

**Luca, Nagaraj & Subramani, “Getting on the Map,” HBS NOM working paper, Dec 2022.**  
[SSRN 4300552](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4300552)  
Establishing an online listing presence leads to a **5% revenue increase**; ~18% of restaurants in the sample still had no presence by end-2017. Supports “be findable,” not “reply.”

**Luca & Zervas, “Fake It Till You Make It,” *Management Science* 62(12), 2016.**  
[HBS item](https://www.hbs.edu/faculty/Pages/item.aspx?num=49389)  
~**16%** of restaurant reviews on Yelp filtered as suspicious; fraud more likely when reputation is weak (few reviews, recent negatives); **chains less likely to fake**. Useful for sales conversations about why gaming is a trap, especially for independents.

No Google-authored **causal** paper equivalent to Luca on Google review replies was found. Do not cite “Google says replies increase revenue by X%” unless a Google URL is attached; none was in this pass.

### 4.2 First-party surveys with published methodology (stated preference, US consumers)

**BrightLocal Local Consumer Review Survey — methodology is public.** US adult panels via SurveyMonkey.

| Edition | n | URL |
| --- | --- | --- |
| 2024 | 1,141 US consumers | [brightlocal.com/research/local-consumer-review-survey-2024](https://www.brightlocal.com/research/local-consumer-review-survey-2024/) |
| 2025 | 1,026 US adults | […/local-consumer-review-survey-2025](https://www.brightlocal.com/research/local-consumer-review-survey-2025/) |
| 2026 | 1,002 US adults | […/local-consumer-review-survey](https://www.brightlocal.com/research/local-consumer-review-survey/) |

These are **not** revenue effects. They are what Americans *say*. Still the most transparent recurring industry survey.

**2024 (use for “replies matter”):**

- **88%** would use a business that replies to **all** reviews vs **47%** for a business that replies to none. (41 pp gap.)
- **93%** expect a business to respond; **34%** expect a reply within 2–3 days; **87%** within two weeks.
- Blind test: **58%** preferred an AI-written reply over a real owner reply (they were not told which was which).
- **71%** would not consider a business below 3★; majority still want **4.0–5.0**.
- **59%** want **20–99 reviews** before they trust the average.
- Food & drink: **24%** expect a review *ask* the same day; **48%** within 2–3 days.
- **Limitation:** US only; BrightLocal sells reputation software.

**2026 (use for “speed, recency, 4.5★ floor”):**

- **97%** read reviews; **41%** “always” (up from 29%).
- Google still #1 place to **read** reviews but share **71%** (from 83% in 2025); ChatGPT/AI tools **45%** for local recommendations (from 6%).
- **47%** will not use a business with **&lt;20 reviews**.
- **74%** only care about reviews from the **last three months**.
- **31%** will only use **4.5★+** (from 17%); **68%** want **4.0+** (from 55%).
- **80%** likely to use a business that replies to every review; **42%** unlikely if it never replies.
- **89%** expect a response; **19%** same day (from 6%); **32%** by next day (from 18%); **81%** within a week.
- **50%** put off by **generic/templated** replies.
- Owner response is the **#5** factor in review usefulness (**37%**).
- **94%** open to writing reviews; **69%** did in the last year; positives (**60%**) more than negatives (**29%**).
- **78%** were asked; **83%** of those asked left a review (text says 65% in one bullet and 83% later — the body figure is **83% of people asked went on to leave one**).
- Incentives: **11%** offered a reward **to write a positive review** (illegal under FTC rule / against Google policy).

**Partoo Barómetro (Spain, first-party but client-selected).** 2026 edition uses **2025 data from 22,911 POS / 123 Spanish Partoo customers** — i.e. brands **already paying for review management**, not a random sample of independents. The public landing page is a gated download; the 2024 public recap (same program) reported, for *their* clients: reviews per POS **234.74 → 261.81**, average rating **4.09 → 4.13**, response rate **71% → 80%**, Google review volume **+22%** YoY. ([2024 recap](https://www.partoo.co/es/blog/barometro-2024-resenas-google-espana/) now redirects to the 2026 hub.) **Do not treat 80% response rate as the Spanish independent-shop baseline**; it is the rate among Partoo-managed chains.

**Yelp** (first-party, survey not fully methodologized on the page): “According to a 2023 survey, **70%** of respondents who read reviews say they’re more likely to write a review for a business if they see the business owner responds.” ([business.yelp.com](https://business.yelp.com/resources/articles/how-to-get-yelp-reviews-without-asking/?domain=local-business)) Weaker than BrightLocal (no n, no method).

### 4.3 What is *not* in the evidence

- No paper found that isolates **Google** (vs Yelp) star effects on **Spanish** restaurant or salon revenue.
- No paper found that isolates **AI-drafted** replies vs human replies on conversion (BrightLocal 2024 is a preference test, not a field experiment).
- Vendor case studies (Podium “24× reviews,” Owner “+$104,500 online sales”) are **marketing**, not research.

---

## 5. What they upsell after review replies

Almost nobody sells “replies” as a standalone SKU except Widewail Engage and BabyRock. The category’s expansion path is remarkably consistent:

| After replies, they sell | Who, with a primary URL |
| --- | --- |
| **Review generation** (SMS/email/QR after a job or order) | Podium Reviews ([product/reviews](https://www.podium.com/product/reviews/)); NiceJob ([pricing](https://get.nicejob.com/pricing)); GatherUp ([pricing](https://gatherup.com/pricing/)); Owner Reviews Engine ([reviews-engine](https://www.owner.com/reviews-engine)); BrightLocal Grow “Get Reviews”; Reputation.com requesting; Partoo Review Booster |
| **Listings / NAP syndication** | Reputation.com Core includes listings; GatherUp Listings Hub **$40/loc/mo**; BrightLocal Manage/Active Sync; Yext Listings; Partoo Presence Management; Owner Listings Management |
| **Surveys / NPS / private feedback** | Reputation.com +Surveys **$150/loc**; NiceJob Pro NPS; GatherUp NPS; Customer Alliance Growth; Birdeye Surveys |
| **Messaging / webchat / SMS inbox** | Podium Inbox, Webchat, Phones, Text marketing; Birdeye Messaging + Chatbot; Partoo Messages / Chat / AI chatbot; Owner email & SMS |
| **Payments** | Podium Payments |
| **Website** | NiceJob Sites **$99/mo + $199 setup**; Owner AI website (bundled in $249/$499) |
| **Social publishing** | Birdeye Social; Reputation.com Social Suite add-on; NiceJob auto-share of top reviews; Partoo social |
| **Booking / ordering** | Owner online ordering (core SKU); NiceJob Pro booking reminders; Podium AI Employee “sells, schedules”; Yelp Host |
| **Competitive intel** | Reputation.com Competitive Insights add-on; NiceJob Pro competitor SEO; Partoo Competitive Intelligence |
| **Managed labor on top of software** | Reputation.com Managed Services; Widewail Engage; BrightLocal Managed SEO **$1,299/mo**; NiceJob Sites (they write the pages) |

**BabyRock V2 (WhatsApp FAQ + booking for the shop’s own customers)** maps onto the **messaging + booking** column, which is where Podium and Owner make their real money. It is the standard land-and-expand. Difference: those firms land with a **dashboard and a demo**; BabyRock would land with a **WhatsApp thread the owner already lives in**.

---

## 6. Published pricing bands, 2024–2026

Only figures that appear on a vendor-controlled page (or official help center) are in this table. Gaps are explicit.

### 6.1 Self-serve software, published

| Vendor | Published price | Billing notes | URL |
| --- | --- | --- | --- |
| BrightLocal Track / Manage / Grow | $41 / $54 / $65 per month at 1 location | Annual ~25% off; Grow is the plan that includes review tools | [help.brightlocal.com](https://help.brightlocal.com/hc/en-us/articles/12623266931730-How-much-does-BrightLocal-cost) |
| NiceJob Reviews / Pro | **$75 / $125** per month | USD, no contract, 14-day trial | [get.nicejob.com/pricing](https://get.nicejob.com/pricing) |
| NiceJob Sites | **$99/mo + $199 setup** | Managed website | same |
| GatherUp / Grade.us | **$99/mo** (1 loc); **$60/loc/mo** (2–10) | 20% off annual; 300 SMS + 3,000 email credits/loc | [gatherup.com/pricing](https://gatherup.com/pricing/) |
| GatherUp Listings Hub | **$40/loc/mo** | Add-on | same |
| Reputation.com | **$80 / $115 / $150** per location / month | Enterprise custom (125+ loc) | [reputation.com/pricing](https://reputation.com/pricing) |
| Trustpilot (US) | **from $99 / $319 / $799** per domain / month | **12-month** prepaid; Free = $0 with 50 invites | [business.trustpilot.com/pricing](https://business.trustpilot.com/pricing) |
| Trustpilot (ES/FR) | **from €79 / €189 / €479** per domain / month | Annual | [es.business.trustpilot.com/pricing](https://es.business.trustpilot.com/pricing) |
| Owner.com | **$249/mo + 5%** or **$499/mo flat** | Month-to-month; guest 5% fee extra; restaurant suite, not a reply SKU | [owner.com/pricing](https://www.owner.com/pricing) |
| Customer Alliance | **from €108/mo** (Core, 1 location) | Hotel software; extras per business unit | [customer-alliance.com/en/pricing-and-packaging](https://www.customer-alliance.com/en/pricing-and-packaging) |
| Yelp Host / Receptionist | **from $149 / $99** per month | AI phone coverage, not reviews | [Yelp blog 2025-10-21](https://blog.yelp.com/news/yelp-host-yelp-receptionist-launch/) |
| Yext PowerListings (legacy SMB) | **$199–$999 per year** | Older self-serve listings; current Yext is custom | [yext.com/pl/powerlistings/plans.html](https://www.yext.com/pl/powerlistings/plans.html) |

### 6.2 Quote-only (do not invent)

Podium, Birdeye, ReviewTrackers, Partoo, Yext (current), SOCi, TrustYou, Skeepers. Podium’s live page did not return dollar HTML on 2 Sep 2026; indexed snapshots have shown $399 / $599 — **unconfirmed**.

### 6.3 Managed reply labor, published or co-op

| Vendor | Published | What you get | URL |
| --- | --- | --- | --- |
| Widewail Engage (Subaru co-op page) | **$250/month** per location | Human-written replies; negatives need dealer input | [widewail.com/sdc](https://www.widewail.com/sdc) |
| Widewail Invite | **$350/month** | SMS/email review asks | same |
| Reputation.com Managed Services | **not priced** | “Let our team manage your review responding…” | [reputation.com/pricing](https://reputation.com/pricing) |
| BrightLocal Managed SEO | **$1,299/month** | Broader than replies | [brightlocal.com/solutions](https://www.brightlocal.com/solutions/) |
| **BabyRock Social** | **€99 TTC/month** | AI draft + PH operator QC; 4–5★ after operator click; 1–3★ after owner WhatsApp OK | company context (not a third-party source) |

### 6.4 Banding (only from the published rows)

- **€40–€120 / $40–$125 per month:** DIY local-SEO or review-request software (BrightLocal Grow, NiceJob, GatherUp). Merchant still writes or clicks every reply.
- **~$80–$150 per location per month:** Mid-market reputation suite with AI responding (Reputation.com list prices). Still a dashboard.
- **€99 TTC managed replies (BabyRock):** In the *software* band, with *managed* labor. That is the pricing anomaly — and the pitch.
- **$249–$499 per month:** Restaurant operating systems (Owner) where reviews are a side effect of ordering.
- **$250–$350 per location:** Human reply/ask managed service in US auto (Widewail co-op).
- **$399+ (unverified) / quote:** Podium/Birdeye sales motion. Even if the $399 snapshot is real, it is **4× BabyRock** and sold as inbox + SMS + payments, not as “we handle Google for you in Spanish.”
- **€108+ hotel AI-reply software** (Customer Alliance): same job, hospitality ICP, still self-serve-ish.

---

## 7. Gaps: what these tools require that a busy independent in Spain will not do

This is the product section. Every “requirement” below is visible on the vendors’ own onboarding/pricing/product pages.

### 7.1 They require a merchant who behaves like a marketing manager

| Requirement | Who imposes it | Why a Sant Cugat salon / restaurant owner will not |
| --- | --- | --- |
| **Book a demo / talk to sales** to see the price | Podium, Birdeye, Partoo, ReviewTrackers, Yext, Reputation.com (despite list prices, CTA is still “Talk to Sales”) | Owner will not sit on a Zoom in English or even Spanish sales-speak for a €99 problem |
| **Annual contract** | Trustpilot (12 months prepaid); typical enterprise reputation deals; Birdeye is widely described as annual though **Birdeye’s own page does not say so** | Independents want month-to-month (Owner and NiceJob do; most “reputation” suites do not advertise it) |
| **Connect POS / CRM / DMS / PMS** so review asks fire automatically | Podium integrations, Owner POS, Widewail DMS, Birdeye “connects to your POS,” GatherUp “one click integrations” | Many Spanish independents have **no** modern POS, or have one that is not in the US integration marketplace |
| **Log into a dashboard weekly** to approve AI drafts, close tickets, post GBP Updates, answer Q&A | Every SaaS in §2 | The owner is on the pass, the chair, or the stove. They already ignore Google’s own app |
| **English-first product and US review graph** (Yelp, Facebook, Google) | Podium, Birdeye, NiceJob, Owner | The graph that matters is **Google + WhatsApp + (TheFork / Instagram / Doctoralia)**. Yelp is weak in Spain |
| **Staff seats, roles, SLAs, brand-voice style guides** | Multi-location suites | There is one owner and maybe a manager. There is no “reputation lead” |
| **Review gating / star-filter landing pages** | Grade.us/GatherUp historically productized a “review funnel” | Illegal/against Google policy if used to hide negatives (§3.2). Independents who want “only good reviews” must be told no |
| **SMS review asks to customer mobile numbers** | Podium, NiceJob, GatherUp (300 SMS/loc), Partoo Review Booster, Owner post-order | Requires lawful collection of numbers (GDPR/LSSI), consent, and a customer list. A restaurant that takes walk-ins has no list |
| **Pay $249–$499 for a website + ordering stack** to get review asks “for free” | Owner.com | Wrong job: they already have a full book or they take reservations on WhatsApp. They will not migrate ordering to a US vendor |

### 7.2 They require work on **negatives** that software cannot safely automate

Google: no auto-reply without **specific express consent**. Proserpio & Zervas: negatives get **longer** when you reply. BrightLocal 2026: generic templates **hurt**. Widewail’s own managed design matches BabyRock: **positives flow, negatives wait for the store.**

A dashboard that “auto-publishes AI on 1★” is both a **policy risk** and a **brand risk**. A busy owner who is asked to “just approve in the app” will not. WhatsApp ping with the draft and two buttons (OK / edit) is the only approval path that has a chance of happening during service.

### 7.3 Where a 90% automation / 10% human QC service fits

**Do this (the gap is real):**

1. **Inbox-zero Google replies in the owner’s language**, without a login. AI draft → PH operator QC → publish 4–5★; 1–3★ via WhatsApp. This is Widewail’s Engage logic at NiceJob’s price, in Spanish, on WhatsApp. Nobody in §2 sells it that way on a public page.
2. **Written GBP third-party consent baked into checkout** (checkbox + PDF + manager invite, never password sharing). Most cheap AI-reply browser extensions skip this and will get merchants suspended.
3. **Ungated review-request QR + WhatsApp message** using Google’s official link, no star filter, no discount. BrightLocal 2026: asking works (83% of those asked left a review); Google Help explicitly lists WhatsApp as a request channel.
4. **Same-day SLA.** BrightLocal 2026: 19% expect same day, 81% within a week. Independents currently reply in days or never (Partoo’s 80% is **chains on Partoo**, not the street).
5. **Human tone, not template.** BrightLocal 2024: 58% preferred an AI draft in a blind test — so AI is fine as a **draft**. BrightLocal 2026: 50% reject generic replies — so the 10% QC is the product.

**Do not pretend to be:**

- Podium (SMS lead inbox + payments). Different budget, different buyer.
- Owner.com (first-party ordering). Different country, different job.
- Partoo (listings for 100-shop brands). Different buyer (marketing director).
- Grade.us funnel. Policy-incompatible if used as a gate.

**V2 (WhatsApp FAQ + booking)** is the natural upsell **after** replies are on autopilot, matching the category’s own expansion path (§5), using the channel the owner and their customers already use, rather than installing webchat.

### 7.4 Risks that are specific to a managed Spanish service

- **Google API access is gated**; browser publishing as the merchant is against Google’s password and third-party rules if you share logins. Build to Manager access + Reviews API, or accept a manual operator in the merchant’s Google session **without** holding the password (still messy).
- **Reply moderation** can take up to 30 days; have a “rejected — rewrite” loop.
- **4,096-byte cap**; keep replies short anyway (Google’s own advice).
- **Do not auto-publish 1–3★.** Policy + Proserpio mechanism both say the owner must be in that loop.
- **Do not sell “we will get you to 5.0.”** Luca’s result is about **displayed stars**, which move with **honest volume**, not with deleted negatives (illegal).
- **PH operators writing as a Spanish shop:** language, tú/usted, Catalan vs Spanish, named dishes, named staff. This is the 10%, and it is why Widewail still uses humans for dealers.
- **Founder not in daily production** is viable only if QC rubrics (banned phrases, no incentives, no “please change your review,” no medical/legal admissions) are in the operator tool, not in the founder’s head.

---

## 8. Implications for BabyRock / BRM Social

1. **Category narrative.** Do not sell “AI reputation software.” Sell **“your Google replies are handled”** — the sentence Widewail uses for dealers and that independents in Spain do not currently hear at €99.
2. **Price is a feature.** €99 TTC sits on the **self-serve software** shelf and delivers **managed** labor. That only works if delivery cost (PH QC minutes per review × review volume of a typical independent) stays well below ~€50. A busy restaurant with 80 reviews/month is a different unit-economics animal than a salon with 8. **Cap or tier on volume** is how Widewail and Customer Alliance avoid this; BabyRock should not pretend unlimited human QC is in the €99.
3. **Compliance is a moat.** Written reply authorization, manager-not-owner, no gating, no incentives, no unattended auto-publish. Cheap Chrome-extension “AI reply” tools will get clients banned; BabyRock can be the safe option.
4. **Evidence to use in sales (with the caveats in §4):** Luca 5–9% independent restaurant revenue per star (Yelp, US); Proserpio +0.12★ / +12% volume from responding (hotels); BrightLocal 88%/80% “would use a business that replies to all reviews”; 50% put off by templates; 4.5★ floor rising. Do not claim Google-causal Spanish restaurant ROI.
5. **Expansion.** Listings, Posts, and review *asks* are the adjacent modules every US vendor attaches. For this ICP, **WhatsApp FAQ + booking** is more native than webchat or a new website. Owner.com proves restaurants will pay $249–$499 when the job is “more direct orders”; that is a different product and a later conversation.

---

## 9. Source index

### Google

- Manage reviews: https://support.google.com/business/answer/3474050  
- Reply steps: https://support.google.com/business/answer/16334827  
- Tips / get more reviews: https://support.google.com/business/answer/3474122  
- Review link / QR: https://support.google.com/business/answer/16816815  
- Prohibited content (gating, incentives): https://support.google.com/business/answer/7400114  
- Fake-engagement restrictions: https://support.google.com/business/answer/14114287  
- Third-party policies: https://support.google.com/business/answer/7353941  
- Working with a third party notice: https://support.google.com/business/answer/7163406  
- Posts: https://support.google.com/business/answer/7390603  
- Posts content policy: https://support.google.com/business/answer/7213077  
- WhatsApp/SMS on profile: https://support.google.com/business/answer/16751381  
- Google automated calls/texts: https://support.google.com/business/answer/7690269  
- Reviews API guide: https://developers.google.com/my-business/content/review-data  
- updateReply: https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply  
- Review resource (4096 bytes): https://developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews  
- API policies (no auto-reply without consent): https://developers.google.com/my-business/content/policies  
- Quotas: https://developers.google.com/my-business/content/limits  
- Posts API: https://developers.google.com/my-business/content/posts-data  
- Q&A API: https://developers.google.com/my-business/reference/qanda/rest  
- Business Messages sunset: https://developers.google.com/business-communications/business-messages/resources/release-notes/update-on-gbm  

### Academic / official law

- Luca 12-016: https://www.hbs.edu/faculty/Pages/item.aspx?num=41233 · https://www.hbs.edu/ris/download.aspx?name=12-016.pdf · https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1928601  
- Anderson & Magruder 2012: https://doi.org/10.1111/j.1468-0297.2012.02512.x  
- Proserpio & Zervas 2017: https://doi.org/10.1287/mksc.2017.1043 · https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2521190  
- Luca, Nagaraj, Subramani 2022: https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4300552  
- Luca & Zervas fake reviews: https://www.hbs.edu/faculty/Pages/item.aspx?num=49389  
- Directive (EU) 2019/2161: https://eur-lex.europa.eu/eli/dir/2019/2161/oj?locale=en  
- Commission UCPD guidance (reviews): https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021XC1229(05)  
- FTC Consumer Review Rule: https://www.ftc.gov/news-events/news/press-releases/2024/08/federal-trade-commission-announces-final-rule-banning-fake-reviews-testimonials  
- FTC rule Q&A: https://www.ftc.gov/business-guidance/resources/consumer-reviews-testimonials-rule-questions-answers  

### Surveys

- BrightLocal 2024: https://www.brightlocal.com/research/local-consumer-review-survey-2024/  
- BrightLocal 2025: https://www.brightlocal.com/research/local-consumer-review-survey-2025/  
- BrightLocal 2026: https://www.brightlocal.com/research/local-consumer-review-survey/  
- Partoo Spain barometer hub: https://www.partoo.co/es/blog/barometer-2026/  

### Vendors (product / price)

- Podium pricing: https://www.podium.com/pricing  
- Podium Reviews: https://www.podium.com/product/reviews/  
- Birdeye: https://birdeye.com/ · https://birdeye.com/pricing/  
- Reputation.com pricing: https://reputation.com/pricing  
- NiceJob pricing: https://get.nicejob.com/pricing  
- GatherUp pricing: https://gatherup.com/pricing/  
- Grade.us plans: https://www.grade.us/home/plans/  
- ReviewTrackers plans: https://www.reviewtrackers.com/plans/  
- BrightLocal cost: https://help.brightlocal.com/hc/en-us/articles/12623266931730-How-much-does-BrightLocal-cost  
- Trustpilot pricing: https://business.trustpilot.com/pricing  
- Owner pricing: https://www.owner.com/pricing · Reviews Engine: https://www.owner.com/reviews-engine  
- Widewail response: https://www.widewail.com/solutions/response/review-response · co-op prices: https://www.widewail.com/sdc  
- Yelp respond: https://www.biz.yelp.com/support-center/article?articleNumber=000006832&l=en-US  
- Yelp R2R FAQ: https://docs.developer.yelp.com/docs/faqs  
- Yext FAQ: https://www.yext.com/knowledge-center/yext-faq  
- Partoo ES pricing: https://www.partoo.co/es/tarifas/  
- Customer Alliance pricing: https://www.customer-alliance.com/en/pricing-and-packaging  

### Explicitly not used as price sources

ITQlick, G2 user-reported averages, Capterra “starting at,” WiserReview, RepliFast, RevioReputation, Nuxa, FeedbackRobot, and other competitor blogs. Several of those pages quote Birdeye at $299 and Podium at $399; those quotes were **not** confirmed on the vendors’ own live pages in this pass.

---

*End of report. Re-fetch vendor pricing pages before any fundraising or pricing decision; list prices in this category move without notice.*
