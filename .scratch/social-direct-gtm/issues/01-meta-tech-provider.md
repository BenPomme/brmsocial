# 01 — Meta Tech Provider for one Direct cobaye

Type: research
Status: resolved
Triage: ready-for-agent

## Question

To connect one shop’s WhatsApp number to BabyRock Direct (Embedded Signup, messages from the shop’s number, coexistence with the Business app), do we need to become a Meta Tech Provider, or can the current Babyrock Social app (Connect with customers, not Become a Partner) do a single cobaye?

What is the minimum Meta product, verification, and webhook setup, cited from Meta’s own docs? What would block a cobaye even if we never industrialise?

## Answer

**Yes — Tech Provider is required. The current Babyrock Social app (Connect with customers, Direct Developer) cannot do this cobaye as specified.**

Embedded Signup and coexistence (Business app + Cloud API on the shop’s number) both say you must already be a Tech Provider or Solution Partner. Accessing a WABA Babyrock does not own without Advanced access returns Graph error `200`. Solution Partner / “Become a Partner” (Tech Partner) is not required: Tech Provider is the minimum; the shop adds a card and Meta bills them.

The same Meta app can be converted (Tech Provider onboarding is a menu inside Connect with customers). A cobaye of one does not skip Business Verification, App Review (two videos), or Access Verification.

Even then, a cobaye can still die on production WABA `#2593030`, the shop using consumer WhatsApp instead of Business app ≥ 2.24.17, error `3441045` (quiet number), selecting Babyrock’s portfolio in ES, a dying webhook URL, missing payment method, or missing the 24h coexistence sync.

Do not put the shop number on Babyrock’s 555 WABA: that drops coexistence and is not shop-owned Fil commerce.

Full write-up with Meta URLs: `research/direct-meta-tech-provider.md`.
