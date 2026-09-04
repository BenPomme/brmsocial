# Google Business Profile Chat field — WhatsApp vs SMS vs old Google Chat

**Date:** 3 September 2026  
**Ticket:** `.scratch/social-direct-gtm/issues/04-google-chat-field.md`  
**Question:** When BabyRock Direct later puts a `wa.me` on the shop’s Google listing, what does Google actually show (Chat, SMS, WhatsApp)? The catalogue (`18-roadmap-produit.md` §8) says if Google shows SMS and WhatsApp it shows only SMS, so WhatsApp-only for now. What can a **manager** (not owner) set?  
**Method:** Current Google Business Profile Help and Business Profile APIs. WhatsApp Help for the click-to-chat URL. Archived Google Business Messages shutdown notice (the live GBM URL now redirects to RCS for Business). Community threads are labelled as such and are not treated as policy.

---

## Verdict

The catalogue note is still correct.

The field on the listing is called **Chat**. It is **not** an in-Google inbox. It is a launcher: either a WhatsApp click-to-chat URL (`https://wa.me/<E164>`) or an SMS number. If **both** are stored, Google’s Help says customers see **only the text-message option**. For Direct, set **WhatsApp only**, and clear SMS on Chat if it is already there.

A **manager** can do this. Owner/manager capabilities give managers “Edit all URLs”, “Edit attributes”, “Edit phone number”, and “Manage Business Profile directly on Search and Maps”. The Business Profile API stores the two Chat destinations as attributes `url_whatsapp` and `url_text_messaging`. Agency rules still apply: stay Manager, Titulaire stays Owner, written consent, no silent feature changes.

Do **not** confuse this Chat field with **Google Business Messages** (in-Maps/Search chat + partner API), which Google discontinued on **31 July 2024**. That API is dead. The Chat field that replaced it is a deep link out to WhatsApp or the phone’s SMS app. RCS for Business is a third, partner-gated product and is not the listing field.

Spain is not in the February 2025 exclusion list (PH, VN, TH, TW, JP, KR). Help still says Chat is only for “select regions” and may be missing on a given profile. Treat public WhatsApp as **if Google shows Chat**, same wording as the roadmap.

---

## 1. Two different products named “chat”

| | Old: Google Business Messages / Business Profile Chat | Current: Chat field on the listing |
|---|---|---|
| What it was | In-Google conversation. Customer tapped Chat/Message on Search or Maps; the thread lived in Google Maps / Android Messages. Partners had a Business Messages API. | Contact attribute. Customer is sent **out** of Google to WhatsApp or to SMS. |
| Status | Discontinued **31 July 2024**. New chats stopped 15 July 2024. GBM API endpoints started returning errors after 31 July 2024. Partner console revoked. | Live. Documented as “Chat” under Edit profile → Contact. |
| Inbox | Google hosted it. | Google does not host it. WhatsApp or the device SMS/RCS app does. |
| Direct implication | Do not build, quote, or wait on a Google-hosted diner inbox. | Put the shop’s `wa.me` here, WhatsApp-only. |

Sources: [Changes to Google Business Profile chat and call history](https://support.google.com/business/answer/14919056) (as of 31 July 2024 the in-profile chat and call-history features are gone; eligible accounts can instead be contacted “through text messages or WhatsApp”); [Update on Google Business Messages](https://web.archive.org/web/20240718032127/https://developers.google.com/business-communications/business-messages/resources/release-notes/update-on-gbm) (GBM discontinued 31 July 2024; after that date “developers can't use GBM to let users engage with brands through any of the Google entry points or third-party channels”). The live GBM URL now 302s to [RCS for Business](https://developers.google.com/business-communications/rcs-business-messaging) — a partner-gated successor, not the listing Chat field.

The sunset FAQ also said you **could not** point the old GBP chat button at a third-party chat channel. That sentence applied to GBM. The replacement Chat field *is* a third-party launcher (WhatsApp or SMS). Do not reuse the 2024 “no 3P chat” line against `wa.me`.

---

## 2. What the Chat field is today

Official Help, current:

> Businesses with a claimed and verified Business Profile can add a WhatsApp or text messaging option to their contact info.

Setup (same on the how-to and on the “manage contact info” lesson):

1. Business Profile → **Edit profile** → **Contact**.
2. Next to **Chat**, Edit.
3. Dropdown: **WhatsApp** or **Text message**.
4. WhatsApp: paste the click-to-chat **URL**. Text: a phone number that can receive texts.
5. Save.

**Tips on the same page:**

- If you add **both** options, **only the text message option will be shown to customers**.
- Different Business Profiles can use the **same** WhatsApp link.
- Check chat performance metrics.

Identical rule, shorter wording, on the contact-info lesson: “If you add both WhatsApp and text messaging, only the text message option is visible to customers.” Spanish Help matches: “Si añades ambas opciones, solo se mostrará la opción de mensaje de texto a los clientes.”

Sources: [Chat with customers from your Business Profile](https://support.google.com/business/answer/15013580); [2. Add text & WhatsApp messaging options](https://support.google.com/business/answer/16751381); [Chatea con los clientes…](https://support.google.com/business/answer/15013580?hl=es); [Edit your Business Profile — Chat](https://support.google.com/business/answer/3039617).

WhatsApp’s own Help describes the customer side:

> You can add your WhatsApp Business phone number to your Google Business Profile to let customers start a chat with you in one click. […] When customers click the button, they're sent to WhatsApp where they can start a chat with your business.

Steps: Edit profile → Contact → Chat → **WhatsApp** → paste click-to-chat URL → Save.

Source: [How to create a link to your WhatsApp from your Google Business Profile](https://faq.whatsapp.com/712818078160617).

URL format Google points at (WhatsApp Help):

- Use `https://wa.me/<number>` with the full international number.
- Omit zeroes, brackets, dashes, and the plus sign.
- Use: `https://wa.me/1XXXXXXXXXX`. Don’t use: `https://wa.me/+001-(XXX)XXXXXXX`.
- Optional pre-filled text: `https://wa.me/<number>?text=urlencodedtext`.

Source: [How to use click to chat](https://faq.whatsapp.com/5913398998672934) (the URL Google’s Chat article links as “WhatsApp URL guidelines”).

The GBP API example is the same shape: `uri: "https://wa.me/55555555"` for WhatsApp, `uri: "sms:5555555555"` for text.

---

## 3. What the customer actually sees

Google does **not** publish a pixel-level spec of the public button. What the first-party pages do say:

| Stored on Chat | What Help says customers get | Where the tap goes |
|---|---|---|
| WhatsApp only | A WhatsApp option / “WhatsApp click to chat button” (WhatsApp Help) | WhatsApp (`wa.me`) |
| Text message only | Text message option | Device SMS composer (`sms:` URI in the API) |
| **Both** | **Only text message** | SMS, not WhatsApp |
| Neither / Chat not offered | No Chat control | Call / website / social as usual |

The **merchant** UI label is **Chat**. The **public** control is not a Google-hosted chat. It is WhatsApp or SMS. The February 2025 What’s New post titles the feature “Add WhatsApp & text messages” and shows it as a customer-facing contact action on **mobile Search**.

Call, website, and Chat are separate. Adding `wa.me` on Chat does not replace the Call number. Social profiles are a different Contact block and **do not include WhatsApp** (Facebook, Instagram, LinkedIn, Pinterest, TikTok, X, YouTube only).

Sources: [answer/15013580](https://support.google.com/business/answer/15013580); [answer/16751381](https://support.google.com/business/answer/16751381); [What’s new… February 2025](https://support.google.com/business/answer/15934070); [Manage your social media links](https://support.google.com/business/answer/13580646); [faq.whatsapp.com/712818078160617](https://faq.whatsapp.com/712818078160617).

**Not in official Help (do not treat as policy):**

- Community reports that Google sometimes **auto-adds SMS** from the listing phone, then WhatsApp stays in the backend and never shows (e.g. [thread 439064615](https://support.google.com/business/thread/439064615), Jun 2026). Official docs only cover the case **you** add both.
- Community reports that the WhatsApp button is “almost exclusively” mobile Maps, or category-gated. Official Feb 2025 text is **mobile Search worldwide** minus six countries; the Chat how-to does not restrict Maps vs Search or category.

Ops implication still holds: before going live, open the public listing on a **Spanish mobile Search** session (not a PH IP — see §5) and confirm the control that appears. If SMS is showing, remove `url_text_messaging` / the Text message Chat option, leave WhatsApp only.

---

## 4. Where **not** to put `wa.me`

| Field | Put `wa.me` here? | Why |
|---|---|---|
| **Chat → WhatsApp** | **Yes.** This is the documented field. | [answer/15013580](https://support.google.com/business/answer/15013580) |
| Website | **No.** Website must represent the location. Guidelines forbid URLs that “redirect or refer users to landing pages or phone numbers other than those of the actual business, including pages created on social media sites.” Description forbids any links. | [Guidelines for representing your business — Website & phone](https://support.google.com/business/answer/3038177); [Business description](https://support.google.com/business/answer/3039617) |
| Social profiles | **No.** WhatsApp is not a listed platform. | [answer/13580646](https://support.google.com/business/answer/13580646) |
| Business name, Q&A, review replies, posts | **No.** Name must not include phone numbers or URLs. Description must not display links. | [answer/3038177](https://support.google.com/business/answer/3038177) |
| Place Actions / “business links” (order, book, menu) | **No.** Those links need a dedicated landing page for the location, crawler access, and transaction-type rules. A `wa.me` is not a menu/order landing page. | [Business links policies](https://support.google.com/business/answer/13769188) |

Edits are reviewed before they go live ([answer/3039617](https://support.google.com/business/answer/3039617)). A `wa.me` stuffed into Website is the usual rejection path in the Product Expert forum; that is consistent with the website guideline, even though the forum is not policy.

The Call phone and the WhatsApp URL are **separate** fields. Help does not require them to be the same number. Direct can use the shop’s WhatsApp (Fil commerce) on Chat while Call stays the landline.

---

## 5. Availability (Spain, mobile, Philippines)

Two official availability lines, both still current:

1. Chat how-to: “Chat options are currently available for **select regions** and might not be available for your Business Profile.” Claimed **and verified** required. ([answer/15013580](https://support.google.com/business/answer/15013580), [answer/3039617](https://support.google.com/business/answer/3039617))
2. February 2025 What’s New: “This is available on **mobile search worldwide** with the exception of the Philippines (PH), Vietnam (VN), Thailand (TH), Taiwan (TW), Japan (JP), and Korea (KR).” ([answer/15934070](https://support.google.com/business/answer/15934070))

Spain / France are **not** in that exclusion list. That is not a guarantee every Sant Cugat restaurant will see the Chat editor — Help still hedges with “select regions” and “might not be available for your Business Profile.” The roadmap line “Champ Chat de la fiche **si Google le montre**” is the right product posture.

The PH exclusion is about **where the customer searches**, not where the manager sits. A Philippines operator editing `reviews@` can still set Chat on a Spanish listing. Checking the public button from a PH mobile network may show nothing even when Spanish Search would show WhatsApp. Verify from ES (or a VPN to ES) on a phone.

---

## 6. What a manager (not owner) can set

[Manage your Business Profile owners & managers](https://support.google.com/business/answer/3403100): managers have “mostly the same access… The only exception is they can’t add or remove users or remove the profile.”

Capabilities that cover Chat (all **Manager = yes**):

- Edit all URLs
- Edit attributes
- Edit phone number
- Edit main business info (hours, address)
- Manage Business Profile directly on Search and Maps
- Use Messaging *(table still uses the old GBM name; see below)*

Capabilities managers **cannot** do: add/remove users, remove the profile, transfer primary ownership.

New managers wait **7 days** only before delete/undelete, removing other users, or transferring primary ownership. Contact edits, including Chat, are not in that wait list.

The Chat values are **attributes** in the API (`url_whatsapp`, `url_text_messaging`) and a **URL** in the UI. That is why “Edit attributes” + “Edit all URLs” is the binding pair, not the leftover “Use Messaging” row (written for in-Google chat). Nothing in the current Help restricts Chat to primary owner.

**Agency (BabyRock is a 3P)** — [Business Profile third-party policies](https://support.google.com/business/answer/7353941):

- Claim/manage only with the owner’s **express** consent (written or a form tick). Verbal is not enough.
- End customer **retains ownership or co-ownership**. After a profile is created, “make the business owner the owner… and make yourself the **manager**.” If they already have a profile, “ask them to invite you as a **manager, not as an owner**.” This matches `09-publication-google.md` (`reviews@babyrock.ai` as Gestionnaire).
- “Changes or disablement of profile features without the business owner’s consent is prohibited.” Turning Chat on, swapping SMS for WhatsApp, or pointing Chat at a BabyRock-controlled number all need the Titulaire’s yes.
- Offboard in **7 business days**. Disclose that Business Profile itself is free. Share the “Working with a third party” notice.

Do not put a Direct `wa.me` on Chat as a silent side effect of Social. Direct setup is a separate, consented job.

---

## 7. Business Profile API (not GBM)

[Add WhatsApp and Text URLs](https://developers.google.com/my-business/content/whatsapp-text) (Business Profile APIs, last updated **2026-08-28**):

WhatsApp:

```
PATCH https://mybusinessbusinessinformation.googleapis.com/v1/locations/{locationId}/attributes?attributeMask=attributes/url_whatsapp
```

Body `uriValues`: `{ "uri": "https://wa.me/<international-number>" }`.

SMS:

```
PATCH …/attributes?attributeMask=attributes/url_text_messaging
```

Body `uriValues`: `{ "uri": "sms:<number>" }`.

Delete either or both with `DELETE` and `attributeMask=attributes/url_whatsapp,attributes/url_text_messaging` and empty `uriValues`. That is the API way to clear SMS so WhatsApp can show.

Prerequisites: a GBP account and location, plus “the necessary authorization credentials to make changes.” A manager OAuth token with `business.manage` is the normal agency path. Attributes are category- and country-dynamic (`attributes.list`); if `url_whatsapp` is not in the list for that location, the Chat UI is probably missing too.

This is **`mybusinessbusinessinformation.googleapis.com`**, the same stack Social already cares about for location info. It is not the dead Business Messages API.

---

## 8. Metrics

Help still lists a **Messages** performance metric: “The number of different conversations through messages.” The Chat how-to says to check “chat performance metrics.” ([Understand your Business Profile performance](https://support.google.com/business/answer/9918094); [answer/15013580](https://support.google.com/business/answer/15013580).)

The GBM sunset FAQ said the Performance API metric **`BUSINESS_CONVERSATIONS` is no longer available**. The Performance API proto still *enumerates* `BUSINESS_CONVERSATIONS` (“The number of message conversations received on the business profile”) as of the reference page last updated **2024-10-16**. Do not plan Direct KPIs on that enum until a live pull on a listing with Chat enabled returns data. WhatsApp remains the system of record for Fil commerce.

---

## 9. What this means for BabyRock Direct

Catalogue §8 (“Chat Google + QR”, `18-roadmap-produit.md`) stands:

1. **WhatsApp only on Chat.** If SMS is also set, Google shows SMS and the diner never opens Fil commerce.
2. **Clear existing SMS on Chat** before saving WhatsApp (UI: remove Text message; API: DELETE `url_text_messaging`).
3. **`https://wa.me/<E164>`** with digits only, no `+`, spaces, or dashes. That is the shop’s Direct number (Fil commerce), not Fil Babyrock, not the 555 test number.
4. **Do it as Manager** on a claimed, verified listing, after express consent. Titulaire stays Owner. Same `reviews@` invitation already required for Social.
5. **Do not** put `wa.me` in Website, Social, description, or Place Actions.
6. **Do not** wait for Google Business Messages or RCS for Business. GBM is gone. RCS is a partner programme, not the listing field.
7. **Public check on Spanish mobile Search.** Chat may be absent on a given profile; PH search is a bad test.
8. Same `wa.me` **may** be reused across several of the shop’s locations (official tip). That is a product choice (one Fil commerce number vs per-site numbers), not a Google block.
9. Google does not carry the thread. Direct’s inbox is WhatsApp Cloud API on the shop number, not a Google webhook.

SMS as a Direct channel stays “plus tard”, exactly as the catalogue has it: turning SMS on Chat would hide WhatsApp.

---

## 10. Open / not verified from docs alone

- Exact public button chrome (icon, label “WhatsApp” vs “Chat” vs “Message”) on Maps vs mobile Search vs desktop. First-party text is “text message or WhatsApp”, not a screenshot contract.
- Whether Google ever auto-writes `url_text_messaging` from the Call number. Official: only “if you add both.” Community: sometimes SMS appears and cannot be marked primary. Confirm on the cobaye listing.
- Whether every ES restaurant category gets the Chat editor. Help: select regions, might not be available.
- Whether the UI **Messages** metric counts WhatsApp/SMS launches after GBM’s death.
- Whether a pre-filled `?text=` on `wa.me` is accepted in the Chat URL field. WhatsApp documents it; Google’s API example is the bare `wa.me` number.

---

## Sources (primary)

Google Business Profile Help

- https://support.google.com/business/answer/15013580 — Chat with customers (WhatsApp or text; both → SMS only)
- https://support.google.com/business/answer/16751381 — Add text & WhatsApp messaging options (same SMS-wins tip)
- https://support.google.com/business/answer/15013580?hl=es — Spanish: “solo se mostrará la opción de mensaje de texto”
- https://support.google.com/business/answer/3039617 — Edit profile, Chat section
- https://support.google.com/business/answer/15934070 — Feb 2025 What’s New: mobile Search worldwide except PH, VN, TH, TW, JP, KR
- https://support.google.com/business/answer/14919056 — In-profile chat + call history ended 31 July 2024; points to WhatsApp/SMS Chat
- https://support.google.com/business/answer/3403100 — Owner vs manager capabilities
- https://support.google.com/business/answer/7353941 — Third-party / agency policies
- https://support.google.com/business/answer/9918094 — Performance, including Messages
- https://support.google.com/business/answer/13580646 — Social profiles (no WhatsApp)
- https://support.google.com/business/answer/3038177 — Representing your business (website & phone, no redirect URLs, no links in description)
- https://support.google.com/business/answer/13769188 — Business links (Place Actions) policies

Google Business Profile APIs

- https://developers.google.com/my-business/content/whatsapp-text — `url_whatsapp` / `url_text_messaging` (updated 2026-08-28)
- https://developers.google.com/my-business/content/attributes — attributes.list / updateAttributes
- https://developers.google.com/my-business/reference/performance/rpc/google.mybusiness.performance.v1 — `BUSINESS_CONVERSATIONS` enum still listed (page updated 2024-10-16)

Google Business Messages (dead) vs RCS

- https://web.archive.org/web/20240718032127/https://developers.google.com/business-communications/business-messages/resources/release-notes/update-on-gbm — GBM discontinued 31 July 2024
- Live `…/update-on-gbm` now redirects to https://developers.google.com/business-communications/rcs-business-messaging — not the listing Chat field

WhatsApp Help (format Google cites)

- https://faq.whatsapp.com/5913398998672934 — click-to-chat `wa.me` format
- https://faq.whatsapp.com/712818078160617 — adding that URL on GBP Chat; customer is sent to WhatsApp

Repo

- `18-roadmap-produit.md` §8 — “Si Google affiche SMS et WhatsApp, il n’affiche que le SMS”
- `09-publication-google.md` — manager invitation, Titulaire stays owner
- `CONTEXT.md` — Fil commerce vs Fil Babyrock; Direct vs Social
