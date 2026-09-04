# 02 — WhatsApp app and Cloud API on the same shop number

Type: research
Status: resolved
Triage: ready-for-agent

## Question

Can a shop keep WhatsApp Business on the phone and also have Cloud API on that same number, so the Titulaire still sees Fil commerce in the app while Direct answers when the fact is known?

What does Meta currently allow (coexistence / companion mode), what breaks (history, groups, labels), and what is the setup the cobaye would click? Primary sources only.

## Answer

Yes — if the shop is on the **WhatsApp Business app** (v2.24.17+), not consumer WhatsApp, and BabyRock is a **Tech Provider or Solution Partner**. Meta’s name is *Onboard WhatsApp Business app users* (“Coexistence”). Same number stays on the phone and on Cloud API; 1:1 Fil commerce is mirrored both ways.

What breaks: groups and labels stay on the phone (not synced); broadcast lists are disabled; disappearing / view-once / live location off for 1:1; all linked devices are unlinked at connect (Windows/WearOS stay unsupported); history share is opt-in, 180 days of 1:1 only, no groups, media IDs only 14 days; Cloud API free-form still needs a customer-service window that **app replies do not open**; idle phone ~14 days offboards the API companion.

Cobaye clicks Embedded Signup with “connect existing WhatsApp Business account” → official Facebook Business message → Connect → Connect to the Business Platform → Confirm (history) → paste code. Full citations: `research/direct-whatsapp-coexistence.md`.
