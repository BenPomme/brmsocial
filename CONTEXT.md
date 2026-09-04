# Babyrock

Company that sells two products to independent local shops: BabyRock Social now, BabyRock Direct later.

## Language

**Prospect**:
Someone we might sell Social to: a Google listing in scope, or an inbound WhatsApp/email that is not already a Paid Account. Not paying yet.
_Avoid_: lead as a product word, resto, client, Titulaire, putting Paid Account day-to-day pings on the Prospects page

**Paid Account**:
The person or legal entity that registered and pays. One subscription = one shop. Email, WhatsApp, and card may be the same on two Paid Accounts; they are not unique keys.
_Avoid_: Titulaire, client (alone), resto, treating the listing as the payer, unique-indexing email or phone

**Contact details**:
The Paid Account's (or Prospect's) email and/or WhatsApp. Those two, not a staff directory.
_Avoid_: employee lists, Maps phone as a contact we write to

**CRM**:
The commercial record of a Prospect or Paid Account: contact details, subscription history, and activity split by channel (mail ≠ WhatsApp ≠ later SMS). Not the Fichier commerce.
_Avoid_: Elephant, Meerkat, stuffing Google-listing facts into the CRM, merging channels into one transcript

**Past scan**:
A finished first scan for one area × one category: Google listings, then 6-month reply % on listings with ≥50 reviews. That pair is not scanned again unless a human asks from Past scans.
_Avoid_: silently re-scouting on every refresh, scanning the same place_id twice without being asked

**Client du commerce**:
A person who leaves a Google review or writes to the shop.
_Avoid_: end user, diner, user

**BabyRock Social**:
The live product: we draft and publish replies to the shop's Google reviews. Code id `social`. Also called A.
_Avoid_: V1, Replies as a product name, review management, reputation suite, e-réputation

**BabyRock Direct**:
A later product: we run the shop's own WhatsApp number for its customers (booking, reminder, review ask after a known visit). Code id `direct`. Also called B. Not sold yet.
_Avoid_: V2, Shop WhatsApp as a product name, FAQ mangeurs, 119 €, Rosalia (Rosalia is Fil Babyrock)

**Pack**:
BabyRock Social and BabyRock Direct sold together. Not sold yet.
_Avoid_: treating Pack as a third factory

**Direct setup**:
A one-time job to open the shop's Business number and Meta account so BabyRock Direct can exist. Not a subscription. Not sold yet.
_Avoid_: calling this an add-on of Social

**Fil Babyrock**:
WhatsApp thread between Babyrock and a Paid Account (Social 1–3★ drafts, recap, billing). Display name Babyrock Social.
_Avoid_: the shop's customer WhatsApp, Rosalia talking to diners

**Fil commerce**:
WhatsApp thread on the shop's number, with a Client du commerce. This is BabyRock Direct.
_Avoid_: mixing with Fil Babyrock; a Babyrock-branded number that speaks to the shop's customers

**Fichier commerce**:
The shop facts the Paid Account has validated (hours, rules, slots). Nothing is true until they say yes. Needed for Direct; also makes Social replies better.
_Avoid_: knowledge graph, Elephant, calling this the CRM, second agenda

**Avis**:
A Google review on the shop's listing, and the work of replying to it. Belongs to Social.
_Avoid_: rating (the star score), feedback (private)

**Guide**:
A public article on babyrock.ai (how to get more reviews, QR, Google’s rules). SEO. Not a Social SKU. Not Direct.
_Avoid_: selling “more reviews” as Social, review booster

**Opérateur**:
The person in the Philippines who publishes or blocks a Social reply. Authenticity and brake, not copy-paste. Not a Direct inbox for parking questions.
_Avoid_: VA as the process, 24/7 support

**Bouclier fiche**:
A same-day Fil Babyrock ping when the shop's Google listing changes (hours, name, phone, address, open/closed). Included in Social. Code `fiche_watch`.
_Avoid_: listing shield as a SKU, Escudo as a product name

**Avis disparu**:
A Google avis that was in our journal and is no longer on the fiche. We report it. We do not republish it.
_Avoid_: reposición, restoring bought reviews

**Local Post**:
A short update Google shows on the fiche (Maps / Search), written by the business. Not a Social SKU. Not the Monday recap.
_Avoid_: calling the recap a post, selling “the fiche looks alive” as a third product

**Catalogue**:
Live Social SKUs, TTC prices, and local offers. `src/lib/catalog.ts` (`quoteFor`) is what Rosalia, `/pay`, and outreach letters read. Stripe charges `skus.ts`. Changing a price is one SKU row plus `docs/agents/catalog.md`.
_Avoid_: a second euro amount in WhatsApp copy, Stripe as the catalogue, teaching Rosalia a coming-soon product as if it were sold
