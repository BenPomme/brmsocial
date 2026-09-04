# Wayfinder map: Social live, Direct later

## Destination

BabyRock Social is launch-ready (a titulaire can pay, add the manager, and get replies published). The public site presents BabyRock Direct as coming soon. Direct is not sold.

## Notes

- Glossary: `CONTEXT.md`. Products: `01-produit.md`. Order: `18-roadmap-produit.md`. ADR: `docs/adr/0001-two-products-two-whatsapp.md`.
- Company is BabyRock. Social = Google review replies (live). Direct = the shop’s own WhatsApp (coming soon).
- Fil Babyrock ≠ Fil commerce. Pay rejects anything that is not a live Social SKU.
- Ponytail: one flow that works, not a platform. Do not staff a Direct inbox.
- Skills: `/domain-modeling`, `/research`. Tracker: `.scratch/` (see `docs/agents/issue-tracker.md`).
- Partner demo stays on Social. Direct work must not steal that.

## Decisions so far

- Product names: BabyRock Social and BabyRock Direct (locked in `CONTEXT.md`).
- Ask-after-visit lives in Direct, not Social (`02-marche-legal.md`).
- Cancellation: end of the paid period; published replies stay (`12-decisions-ouvertes.md`).
- [Paper Google QR inside Social, or only Direct?](issues/03-paper-qr-in-social.md): Social does not promise more reviews. QR and “how to get reviews” are public knowledge pages (roadmap priority 2, SEO), not a Social SKU.
- [Meta Tech Provider for one Direct cobaye](issues/01-meta-tech-provider.md): Tech Provider is required. Current Connect-with-customers app cannot run Direct as specified. Same app can be converted. Write-up: `research/direct-meta-tech-provider.md`.
- [WhatsApp app and Cloud API on the same shop number](issues/02-whatsapp-coexistence.md): Yes, coexistence on WhatsApp Business app ≥ 2.24.17 via a Tech Provider. Phone keeps 1:1 threads. Write-up: `research/direct-whatsapp-coexistence.md`.
- [Google Chat field vs SMS vs WhatsApp](issues/04-google-chat-field.md): Listing Chat is a launcher. If SMS and WhatsApp both set, customers see only SMS. Direct: WhatsApp only. Manager can set it. Write-up: `research/direct-google-chat-field.md`.

- Site subscribe: Checkout `/pay` and Rosalia in parallel (Q1 = C).

## Not yet specified

- Direct price (not 119 € until we decide).
- Exact shape of the fichier commerce.
- Calendar vs slots written in the fichier.
- When the first Direct cobaye is allowed (after N Social shops?).
- Pack SKU and Direct setup price.

## Out of scope

- Gating reviews. Cold lists typed at night. A Babyrock number that talks to the shop’s customers.
- TheFork, ads, site rebuilds, Elephant/Meerkat as CRM.
- Building Direct in production before Social is launch-ready.
- Selling “more reviews” as part of Social.
