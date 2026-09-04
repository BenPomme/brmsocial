# Catalogue — prices, SKUs, offers

One module: `src/lib/catalog.ts` (`quoteFor`). `/pay`, Stripe checkout, outreach letters, and Rosalia (Fil Babyrock) read it. They do not invent euros.

Stripe charges what `skus.ts` says. Rosalia speaks `quoteFor()`. If those diverge, the titulaire was lied to.

## When you add a SKU

1. Add the row on `SKUS` in `src/lib/skus.ts` (`ttc` in cents, `productId` from `products.ts`).
2. If it is not Social, set `PRODUCTS.*.status` — `live` only if `/pay` should sell it. Direct / Pack / Direct setup stay `coming_soon` until the product doc says otherwise.
3. Point `skuForPlan` / `PayPlanId` at it if `/pay` must offer a new plan.
4. Run `npm run stripe:skus` so Stripe lookup keys match.
5. Done when: `quoteFor()` returns the new cents, `/pay` shows that plan, `src/lib/catalog.test.ts` passes, and a Rosalia price turn in `src/lib/rosalia/decide.test.ts` speaks the new label. No leftover hardcoded euros in `src/lib/rosalia/`, `content/outreach/`, or `src/app/pay/`.

## When you change a price

1. Change `ttc` on the SKU. Rewrite that SKU’s `description` so it still contains `formatTtcSpeech(ttc)` (the catalog test checks this).
2. Do not edit Rosalia templates, `/pay` copy, or the outreach letter with a raw `99 €` / `89 €`. They interpolate `{{PRICE_MONTH}}` / `quote.monthLabel`.
3. Run `npm run stripe:skus` and `npm test`.
4. Done when: `catalog.test.ts` and `rosalia/decide.test.ts` pass, and `/pay` + a WhatsApp price turn quote the same number.

## When you add or change a local offer

1. Edit `src/lib/offers.ts` (today: Sant Cugat 1er mes 0 € + 3 months catch-up).
2. `quoteFor({ city })` is how Rosalia knows. Unknown city → full price, plus a one-line hint that Sant Cugat has the free month. Never grant 0 € without a city match or the titulaire naming Sant Cugat in the thread.
3. `/pay` trial (`trial_santcugat`) must keep using `isSantCugat` + `SANT_CUGAT_OFFER`, not a parallel constant.
4. Done when: a Sant Cugat quote includes 0 €, a Barcelona quote does not, and the decide tests for those two cities still pass.

## When you toggle a product live / coming soon

1. Flip `status` on `PRODUCTS` in `src/lib/products.ts`.
2. `liveSkus()` hides SKUs whose product is not live. Rosalia’s off-catalog script lists `quote.comingSoon`.
3. Do not teach Rosalia to sell Direct while `direct.status !== "live"`.
4. Done when: `/pay` refuses a coming-soon SKU, and an Instagram / “WhatsApp for my customers” turn still says coming soon.

## Touchpoints that must call `quoteFor` (or `SKUS` / `PRODUCTS` / `offers`)

| Surface | File |
|---|---|
| Speech + pay link | `src/lib/rosalia/copy.ts`, `src/lib/rosalia/decide.ts` |
| Checkout amounts | `src/lib/pay.ts` via `skuForPlan` |
| `/pay` labels | `src/app/pay/page.tsx` |
| Outreach letter | `content/outreach/rosalia.es.txt` (`{{price_month}}`, `{{offer_line}}`) + `fillOutreach` |
| Stripe catalog | `scripts/stripe-sync-skus.ts` |
| Public site | `website` remote (`BenPomme/brmsocial`) — not this factory. Same cents; other repo. |

If you add a new titulaire-facing sentence with a euro amount, it goes through `quoteFor`. A literal `89 €` or `99 €` in Rosalia copy is a bug.
