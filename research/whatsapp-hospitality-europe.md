# WhatsApp hospitality, Europe / Spain — supplement

**Date:** 2 September 2026  
**Scope:** Would Spanish (esp. Sant Cugat) independents take food orders on WhatsApp? Is a WhatsApp-catalog / TikTok Shop playbook a bad fit?  
**Method:** Additional primary sources only. Does not restate the briefing pack except to pin a URL.

---

## Verdict (short)

Spanish customers *will* chat about food on WhatsApp. They will not, today, complete a native in-chat checkout the way Indian/Brazilian merchants do. A catalog + TikTok Shop playbook is a **bad fit** for independent restaurants: no EU Payments API rail, allergen disclosure before purchase, prepared meals banned on TikTok Shop EU, and Glovo already owns Catalan delivery demand. The local hospitality pattern is WhatsApp (or SMS) for **reservations and confirmations**, not carts.

---

## 1. Meta: no official EU in-chat payments country list

There is **no** Meta “supported countries” page for WhatsApp business in-chat payments. Docs are country-siloed:

| Market | Official docs | Rail |
| --- | --- | --- |
| India | [Payments API — India](https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-in) | UPI Intent + PG deep integration (Razorpay, PayU, Billdesk, Zaakpay) |
| Brazil | [Payments API — Brazil](https://developers.facebook.com/docs/whatsapp/cloud-api/payments-api/payments-br/) | Pix, payment links, Boleto, one-click (BR businesses / BR customers only) |
| Spain / EU | `…/payments-api/payments-es` → **HTTP 404** (checked 2 Sep 2026). Parent `…/payments-api/` **301s to UPI**. | — |

Just Eat Takeaway’s own Europe-first WhatsApp flow still **cannot** take money in chat: discovery/selection in WhatsApp, “Just Eat Takeaway.com app used only for the final, secure payment step”; pilot NL + Spain Q2 2026. Meta’s Benelux country director, quoted on the same release, describes WhatsApp as “check travel plans, **make a reservation or browse a catalogue**” — not pay.  
https://newsroom.justeattakeaway.com/en-WW/265881-just-eat-takeaway-com-sets-new-industry-standard-as-first-to-introduce-whatsapp-food-and-retail-ordering-option-in-europe/

Demand for the *channel* is real: CNMC Panel Hogares Q4 2025, **94.6 %** of Spanish internet users use WhatsApp for messaging (83.8 % of smartphone users send messages several times a day).  
https://www.cnmc.es/prensa/panel-hogares-ott-internet-20260522

---

## 2. Allergens: chat order = distance selling

Regulation (EU) **1169/2011** Art. 2(2)(u): distance communication = any means concluding a contract without simultaneous physical presence. Art. 14 + preamble (27): mandatory food information **before the purchase is concluded**. For **non-prepacked** food (restaurant meals), that is **allergen information** (Art. 44), again before purchase **and** at delivery. Commission explainer:  
https://food.ec.europa.eu/food-safety/labelling-and-nutrition/food-information-consumers-legislation/distance-selling_en  
Consolidated text: https://eur-lex.europa.eu/eli/reg/2011/1169/2018-01-01

Spain implements this in **RD 126/2015** Art. 9: for non-prepacked food sold at a distance, obligatory particulars of Arts. 4–5 must be available per 1169/2011 Art. 14(1) **before** purchase (origin may wait); **all** of them at delivery. AESAN: “La información sobre alérgenos siempre se facilitará antes de realizar la compra y … en el momento de su entrega en el domicilio.” Oral allergen info is allowed **in-store** under extra conditions (Art. 6.5); that carve-out does not replace the distance-selling duty.  
https://www.boe.es/eli/es/rd/2015/02/27/126/con  
https://aesan.gob.es/seguridad-alimentaria/informacion-alimentaria/etiquetado-general

A free-text WhatsApp cart (“dos menús del día”) without a written allergen surface before the customer pays is non-compliant. A Glovo/Just Eat menu, or a restaurant’s own web/QR carta, can hold that surface. Chat cannot, unless the operator sends the allergen list first.

---

## 3. Aggregator commissions (Spain)

Neither platform publishes a single signed rate. Official partner pages:

- **Glovo Partners ES** pricing: https://sell.glovoapp.com/es/es/services/pricing/ — four models (Glovo riders, self-delivery, pickup, on-demand logistics). Live HTML is JS-rendered (retrieved 2 Sep 2026); rates not in static markup. Search-indexed copy of **that same URL**: **30 %** “comisión de servicio” (Glovo delivery), **15 %** pickup, “pueden variar según la ciudad.” Partner explainer (no %): https://sell.glovoapp.com/es/es/resources/news/como-funciona-glovo-para-restaurantes-todo-lo-que-necesitas-saber/
- **Just Eat ES partner FAQ** (JS signup, search-indexed): **15 % + €0.30** management if the restaurant delivers itself. Live page requires JS: https://www.just-eat.es/partner/registrate/  
  Do not confuse with the **affiliate** programme (9 % / 2 % for websites sending traffic): https://www.just-eat.es/promo/afiliacion

**ACCO ES 34/2025** (Catalonia, Oct 2023 data, published Dec 2025): order-management market is an oligopoly; Glovo **[60–80 %]** of orders and GMV in the 21 largest municipalities; Uber Eats and Just Eat each **[0–20 %]**. Direct restaurant web/app is a separate, smaller face of the consumer market.  
https://acco.gencat.cat/ca/detall/article/20251210-estudi-acco-food-delivery  
PDF: https://acco.gencat.cat/web/.content/80_acco/documents/arxius/actuacions/20251202-estudi-34-2025-food-delivery-esp.pdf

---

## 4. CoverManager / Last.app: WhatsApp is the reminder, not the till

CoverManager (36k+ restaurants) sells **direct reservations**: branded web widget, Google Reserve, Instagram Reserve; reconfirmation by **SMS and email**; card-hold / deposit via Stripe–Adyen. Channels listed: web, Google, Instagram, phone. Not a WhatsApp cart. Waitlist pings are SMS.  
https://www.covermanager.com/es/solucion/sistema-de-reservas

Last.app (Spanish POS/reservations): “página de reservas integrada con Google y **WhatsApp**”; Core plan = “**Confirmaciones por WhatsApp**”; reminders “SMS, Email o WhatsApp”. Product is table bookings, not dish checkout.  
https://www.last.app/producto/bookings

---

## 5. TikTok Shop Spain is not restaurant delivery

Launch (10 Dec 2024) is products + LIVE + shipping, Spanish-established sellers:  
https://newsroom.tiktok.com/tiktok-shop-llega-a-espana?lang=es

EU **Prohibited Products** (applies to Spain): **§3.13 Chilled, Fresh and Frozen Food = Unsupported**, including “prepared meals”. Alcohol unsupported.  
https://seller-es.tiktok.com/university/essay?identity=1&knowledge_id=748151570286357

EU **Restricted Products** §4.1: food & beverage is **by-application**, and only shelf-stable packed lines (snacks, oil, pasta, jam, …). Listings must show FIC mandatory info (ingredients, allergens) **before purchase**. Not a Saturday-night menu.

---

## Implication for Sant Cugat independents

| Play | Transfer? |
| --- | --- |
| WhatsApp as the inbox (hours, allergens FAQ, table, “we got your review”) | Yes. Matches CNMC penetration + CoverManager/Last.app. |
| WhatsApp catalog + in-chat UPI/Pix checkout | No. Payments API is IN/BR; Just Eat still hops out to its app. |
| TikTok Shop LIVE for tonight’s tapas | No. Prepared meals unsupported. |
| Bypass Glovo with a chat cart | Weak. Glovo is the demand aggregator (ACCO 60–80 %). Chat still owes 1169/2011 allergen-before-pay. |

WhatsApp v2 for this product remains **owner inbox** (reviews, FAQ, slots), not a shop.
