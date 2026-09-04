# WhatsApp Business app + Cloud API on the same shop number (coexistence)

**Date:** 3 September 2026  
**Ticket:** `.scratch/social-direct-gtm/issues/02-whatsapp-coexistence.md`  
**Scope:** Can a Titulaire keep WhatsApp Business on the phone and also have Cloud API on that same number, so Fil commerce stays visible in the app while BabyRock Direct answers when the fact is known? What Meta currently allows, what breaks, and what the cobaye would click.  
**Method:** Meta / WhatsApp official developer docs, Help Center, and Meta’s own pricing PDF only. No BSP blogs.

---

## Verdict (short)

**Yes, on a WhatsApp Business app number, via a partner.** Meta’s current name for this is *Onboard WhatsApp Business app users*. Support channels and partner docs call it **Coexistence**. After that flow, the shop number is both a Cloud API number (`platform_type: CLOUD_API`) and still on the phone (`is_on_biz_app: true`). 1:1 messages are mirrored both ways. The Titulaire keeps Fil commerce in the app. Direct can send on the same number.

It is **not** “put Cloud API on the consumer WhatsApp app.” It is **not** “register the number on Cloud API yourself, then also open the Business app.” Consumer WhatsApp numbers must be deleted first. Cloud-API-only numbers cannot be deregistered through the API if they later become coexistence numbers; coexistence is the *app → partner Embedded Signup* path.

Direct answering “when the fact is known” is allowed on 1:1 threads, with two hard Cloud API rules the phone does not share: (1) a free-form API reply needs an open **customer service window**, which only a *customer* message after onboarding opens, and which **app replies do not create or extend**; (2) templates are Cloud API only. Groups, labels, catalog, Status, and in-app calls stay on the phone and are **not** Cloud API features.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account/

---

## 1. Names Meta actually uses

Official developer title: **Onboard WhatsApp Business app users**.

> “This feature is sometimes referred to as ‘Coexistence’ in support channels and Partner documentation.”

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

**Companion** in Meta’s docs is two different things:

| Meta phrase | Meaning |
| --- | --- |
| Companion / linked device | WhatsApp Web, Desktop, iPad, etc. linked to the Business app (up to four). |
| Cloud API companion | The Cloud API registration sitting beside the Business app after coexistence. Device change **offboards** this companion. |

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users#linked-devices  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/reconnect-offboarded-coexistence-clients/  
https://faq.whatsapp.com/378279804439436/

Embedded Signup v4 still supports this flow through `featureType` / `feature_type` = `whatsapp_business_app_onboarding`.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/version-4  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/versions

---

## 2. What Meta currently allows

After a successful coexistence onboarding:

- The Titulaire **keeps sending and receiving 1:1 on the WhatsApp Business app**.
- The partner (BabyRock Direct) **sends and receives on Cloud API on the same number**.
- “WhatsApp keeps messaging history between both apps in sync” for those 1:1 threads.
- Success check on the phone-number node: `is_on_biz_app: true` and `platform_type: CLOUD_API`.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

Who may offer it:

- The partner **must already be a Solution Partner or Tech Provider**.
- The shop must be on **WhatsApp Business app 2.24.17 or higher** (not the consumer WhatsApp app).
- Embedded Signup must use **session logging**.
- Webhooks must digest `history`, `smb_app_state_sync`, `smb_message_echoes` (plus the usual `messages` / `account_update`).

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/docs/whatsapp/webhooks/

Two numbers, two apps — the fork Meta documents:

| Starting state | Path to Cloud API | App afterwards | History |
| --- | --- | --- | --- |
| **WhatsApp Business app** number | Partner who supports business-app onboarding (this flow) | App **and** partner app concurrently | Preserved (if the shop shares it) |
| **WhatsApp Business app** number | Delete the account, then register on Cloud API | **Cannot** use the Business app again unless you later deregister from Cloud API | Lost unless backed up first |
| **Consumer WhatsApp (Messenger) app** number | **Must delete** the WhatsApp account first | N/A — consumer numbers are not coexistence-eligible | Lost unless backed up first |

https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account/  
https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/manage-phone-numbers/

> “Phone numbers already in use with the WhatsApp app are not supported, but numbers in use with the WhatsApp Business app can be registered.”

https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/manage-phone-numbers/  
https://developers.facebook.com/docs/whatsapp/embedded-signup (same rule: Business-app numbers need the customized onboarding flow)

There is **no Meta page that lists EU/Spain as excluded** from this flow. Embedded Signup itself is localized in Spanish (Spain). Third-party “unavailable in the EU” claims are not in Meta’s docs.

https://developers.facebook.com/docs/whatsapp/embedded-signup

---

## 3. What the Titulaire still sees in the app (Fil commerce)

Mirrored 1:1:

- Customer messages arrive in the Business app **and** as Cloud API `messages` webhooks.
- Direct’s Cloud API sends appear in the Business app.
- Titulaire replies from the phone (or a supported linked device) fire `smb_message_echoes` so the partner can show the same thread.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/smb_message_echoes/

Unchanged **on the phone**, **not** available on Cloud API (Meta’s feature table):

| App feature after onboarding | On the phone | On Cloud API |
| --- | --- | --- |
| 1:1 chats | Mirrored. Edit/revoke now supported. | Supported. Last **6 months** can be synchronized. |
| Contacts | No change | Supported (full WhatsApp-number contact sync) |
| **Group chats** | No change | **Not supported. Groups are not synchronized.** |
| Disappearing messages | **Turned off** for all 1:1 | Not supported |
| View-once | **Disabled** for all 1:1 | Not supported |
| Live location | **Disabled** for all 1:1 | Not supported |
| **Broadcast lists** | **Disabled.** Cannot create new. Existing become read-only. | Not supported |
| Voice and video calls | No change (still in the app) | Not supported |
| Catalog, orders, Status | No change | Not supported |
| **Labels**, greeting/away, quick replies, in-app marketing messages | No change | **Not supported** |
| Business profile | No change | Not supported |
| Channels | No change | Not supported |

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

So: the Titulaire still **sees** Fil commerce 1:1, still **calls** from the phone, still **labels** threads in the app, still runs **groups** in the app. Direct does not see groups or labels.

---

## 4. What breaks or is capped

### History (partner-side backfill)

- Sharing is **opt-in** in the Business app (`Confirm` during connect). Decline → history webhook error **2593109**.
- If shared: **180 days** of 1:1 messages from onboarding time (feature table says “most recent 6 months”; history webhook says 180 days).
- **Group messages are omitted.**
- Media in history: placeholder first; **media asset IDs only for media sent within 14 days** of onboarding.
- Partner has **24 hours** after onboarding to call `POST /{phone-number-id}/smb_app_data` (`smb_app_state_sync` then `history`). Miss the window → shop must **offboard and redo Embedded Signup**. Each sync type is **once**; to retry, offboard and start over.
- Advise the Titulaire to **keep the Business app open** during sync.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/history/

### Groups

- App groups: stay on the phone, **not** synced to Cloud API.
- Cloud API Groups API: **not available** for WhatsApp Business app phone numbers (OBA-only, and explicitly excluded for this onboarding class).

https://developers.facebook.com/docs/whatsapp/cloud-api/groups/

### Labels

- Labels remain a Business-app messaging tool. **Not a Cloud API feature** after coexistence. Direct cannot read or write the Titulaire’s labels.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

### Linked devices (“companion mode” on the phone)

- Up to **four** linked devices.
- **On onboarding, all companion apps are unlinked.** Supported ones may be re-linked.
- **Not supported:** WhatsApp for Windows, WhatsApp for WearOS.
- Incoming from an unsupported companion: **no `messages` webhook** (Direct is blind). Error **131060** is expected; tell the Titulaire to look at the phone.
- Outgoing viewed on an unsupported companion: **placeholder text**, “view on the primary device.”

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users#linked-devices

### Throughput

- Coexistence numbers are fixed at **20 messages per second** (vs 80 default / 1,000 upgraded on Cloud-API-only numbers). Irrelevant for one shop; it is a hard cap.

https://developers.facebook.com/docs/whatsapp/throughput  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

### Official Business Account (blue tick)

> “We do not grant OBA status to business employees, test accounts, and **WhatsApp Business app phone numbers**.”

https://developers.facebook.com/docs/whatsapp/official-business-accounts/

### Calling API

- In-app voice/video: **unchanged** on the phone; **not** on Cloud API.
- Cloud API Calling prerequisite: “Your business number is in use with Cloud API **(not the WhatsApp Business app)**.”

https://developers.facebook.com/documentation/business-messaging/whatsapp/calling

### Templates

Meta’s own PDF: template messages are **not** supported via the WhatsApp Business app interface; only via the Cloud API instance.

https://developers.facebook.com/resources/API-solutions-for-WhatsApp-Business-App-users.pdf

### Cannot API-deregister

You **cannot** `POST /{phone-number-id}/deregister` a number that is in use with **both** Cloud API and the Business app. The shop disconnects from the phone: **Settings → Account → Business Platform → Disconnect Account**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

### Local storage (documentation gap, relevant for ES)

Local storage is enabled only on an **unregistered** number, then you **register** it (`data_localization_region`, e.g. `DE` for EU). Coexistence onboarding **skips register** (“the number is already registered”). The deregister endpoint **refuses** coexistence numbers. Meta does **not** document another way to turn local storage on for this class of number.

https://developers.facebook.com/documentation/business-messaging/whatsapp/local-storage  
https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

### First-time / unsupported-companion glitch

Unsupported `messages` webhook, error **131060**, for first-time customer messages (common on click-to-WhatsApp ads) and unsupported companion devices. Usually clears in seconds; otherwise the message is only on the phone.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

---

## 5. Customer service window — the Direct-specific trap

Quoted from the onboarding page:

> WhatsApp opens a customer service window **only when a WhatsApp user messages a business customer who is already onboarded onto Cloud API**.
>
> The 24-hour customer service window restriction **applies to messages sent via Cloud API**. Messages sent from the WhatsApp Business app **are not subject to the customer service window and do not create, extend, or affect Cloud API conversation windows or Cloud API pricing**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages#customer-service-windows  
https://developers.facebook.com/resources/API-solutions-for-WhatsApp-Business-App-users.pdf

Consequences for “Direct answers when the fact is known”:

1. If the last **customer** message was **before** coexistence onboarding, Direct **cannot** free-form; it needs a **template**.
2. If the Titulaire has been chatting in the app for hours, that **does not** keep Direct’s window open.
3. The Titulaire can always free-form from the phone, even with no Cloud API window.
4. Direct must digest `smb_message_echoes` so it does not also answer a thread the Titulaire already handled.
5. Review-ask / reminder after a known visit, if outside the 24h window, is a **utility/marketing template** on Cloud API, not a free-form app message.

Meta’s PDF, same model: app 1:1 is free and **does not** count toward Cloud API integrity caps; Cloud API 1:1 is billed and **does** go through API enforcement.

https://developers.facebook.com/resources/API-solutions-for-WhatsApp-Business-App-users.pdf  
https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing

---

## 6. What the cobaye clicks

Partner launches Embedded Signup with coexistence enabled. Meta’s documented extras (still cited from the onboarding page; v4 also keeps `feature_type`):

```js
FB.login(fbLoginCallback, {
  config_id: "<CONFIGURATION_ID>",
  response_type: "code",
  override_default_response_type: true,
  extras: {
    setup: {},
    featureType: "whatsapp_business_app_onboarding",
    sessionInfoVersion: "3"
  }
});
```

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/version-4

**Preflight (not a Meta screen, but required or the flow fails):**

1. Phone runs **WhatsApp Business** (green icon), version **≥ 2.24.17** — not consumer WhatsApp.
2. The shop number is **that** Business-app number.
3. Titulaire can receive a WhatsApp from the **official Facebook Business Account**.
4. If they already use WhatsApp Web / Desktop: expect **all linked devices to drop**; re-link after, except Windows and WearOS.

**Clicks Meta documents, in order:**

1. Open BabyRock’s button (Facebook Login / Embedded Signup).
2. **Authentication** with Facebook or Meta Business credentials.
3. **Authorization** of what the app may access.
4. Instead of the usual WABA picker: a screen offering to **connect the existing WhatsApp Business account**.
5. Enter the **Business app phone number**.
6. WhatsApp shows a **verification code**.
7. On the phone, message from the **official Facebook Business Account** → tap **Connect**.
8. Tap **Connect to the Business Platform**.
9. Tap **Confirm** (this is the **share chat history** choice).
10. **Paste the verification code** back in the browser flow.
11. Finish the rest of Embedded Signup (TOS, portfolio / WABA, display name, permissions). Default Cloud API screens: authentication, authorization, assets, phone, verification, permissions, success.
12. Browser event `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING` (not plain `FINISH`).
13. After BabyRock finishes **onboarding** (token exchange, subscribe webhooks on the WABA, **skip `/register`**): the Business app **auto-refreshes** and shows the number is **connected to the API**.
14. Keep the app **open** while contacts + history sync (minutes).
15. Re-link WhatsApp Web / Desktop if needed.
16. If BabyRock is a **Tech Provider** (not a Solution Partner with a shared credit line): Titulaire adds a **payment method** in WhatsApp Manager before Cloud API sending works.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/default-flow  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider  
https://www.facebook.com/business/help/488291839463771

**To leave later:** phone **Settings → Account → Business Platform → Disconnect Account**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

---

## 7. What BabyRock must do (not cobaye clicks)

1. Be a **Tech Provider or Solution Partner**. The coexistence page states this as a requirement. Ticket `01-meta-tech-provider` is the companion question.
2. App Review **advanced access** for `whatsapp_business_management` and `whatsapp_business_messaging` before live customers can complete Embedded Signup.
3. Subscribe app webhooks: `messages`, `account_update`, **`history`**, **`smb_app_state_sync`**, **`smb_message_echoes`**.
4. Launch Embedded Signup with `featureType: "whatsapp_business_app_onboarding"`. Confirm: WABA selection replaced by “connect existing WhatsApp Business account.”
5. On `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING`: exchange the 30-second code for a business token; `POST /{waba-id}/subscribed_apps`; **do not register the number**.
6. Within **24 hours**: `smb_app_data` contacts, then history. Tell the shop the app must stay open.
7. Mirror live app sends via `smb_message_echoes` (including `edit` / `revoke`).
8. Optional check: `GET /{phone-number-id}?fields=is_on_biz_app,platform_type`.
9. Do **not** staff this as a BabyRock inbox. Direct answers when the fichier commerce has the fact; otherwise the Titulaire answers on the phone.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider  
https://developers.facebook.com/docs/whatsapp/embedded-signup  
https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-solution-partners

Default Embedded Signup onboarding cap: **10 new customers / 7 days** until Business Verification + App Review + Access Verification (**200 / 7 days**). A single cobaye fits; a pack rollout does not, until those are done.

https://developers.facebook.com/docs/whatsapp/embedded-signup

---

## 8. Device change, idle phone, and silent death of Direct

If the Titulaire **changes phones, reinstalls, or re-registers**:

1. Cloud API companion is **automatically offboarded** → `ACCOUNT_OFFBOARDED`.
2. Cloud API send/receive is **suspended** until reconnection.
3. On the new device’s profile step, previously connected Cloud API products appear **pre-checked**. If they do not opt out, reonboarding runs in the background (minutes) → `ACCOUNT_RECONNECTED`.
4. WhatsApp Web is **not** auto re-linked.
5. Eligibility is cleared if **another partner** onboards the WABA in that window.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/reconnect-offboarded-coexistence-clients/

`PARTNER_REMOVED` + `disconnection_info.reason` for coexistence numbers:

| Reason | Meaning |
| --- | --- |
| `PRIMARY_INACTIVITY` | Primary device idle **~14 days** (system). Direct dies if the shop phone is in a drawer. |
| `COMPANION_INACTIVITY` | Linked device idle **~30 days**. |
| `USER_RE_REGISTERED` | New device. |
| `CHANGE_NUMBER` | They changed the number. |
| `BUSINESS_DOWNGRADE` | They registered the number on **consumer** WhatsApp. |
| `ACCOUNT_DISCONNECTED` | Deleted account or enforcement. |

https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_update

---

## 9. Mapping onto BabyRock Direct

| Direct intent | Meta fact |
| --- | --- |
| Titulaire still sees Fil commerce on the phone | Yes, 1:1 mirrored. |
| Direct answers on the same number when the fact is known | Yes, via Cloud API, if a customer-service window is open or via a template. |
| Titulaire answers the rest on the phone | Yes. App free-form is always allowed; echo via `smb_message_echoes`. |
| One shop number, no Babyrock-branded diner line | Yes — that is this flow. |
| Groups / staff labels as Direct state | No. Stay on the phone only. |
| History in Direct on day one | Only if they Confirm sharing; 180 days 1:1; no groups; media IDs 14 days. |
| Cobaye already on consumer WhatsApp | Must switch to **WhatsApp Business** first (or delete consumer account). Coexistence will not attach to the consumer app. |
| Phone unused for two weeks | System offboards Cloud API (`PRIMARY_INACTIVITY`). |

Product already names this setup: Direct setup = “numéro commerce et compte Meta, coexistence appli + API” (`01-produit.md`). This note is the Meta evidence for that line.

---

## Sources (all Meta / WhatsApp)

- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/reconnect-offboarded-coexistence-clients/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/manage-phone-numbers/
- https://developers.facebook.com/docs/whatsapp/embedded-signup
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/default-flow
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/version-4
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/versions
- https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider
- https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-solution-partners
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/history/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/smb_message_echoes/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/reference/account_update
- https://developers.facebook.com/docs/whatsapp/webhooks/
- https://developers.facebook.com/docs/whatsapp/throughput
- https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/registration
- https://developers.facebook.com/documentation/business-messaging/whatsapp/local-storage
- https://developers.facebook.com/docs/whatsapp/official-business-accounts/
- https://developers.facebook.com/docs/whatsapp/cloud-api/groups/
- https://developers.facebook.com/documentation/business-messaging/whatsapp/calling
- https://developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
- https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- https://developers.facebook.com/resources/API-solutions-for-WhatsApp-Business-App-users.pdf
- https://developers.facebook.com/documentation/business-messaging/whatsapp/account-model-evolution/ (coexistence WABAs are included in the account-model migration)
- https://faq.whatsapp.com/378279804439436/
- https://www.facebook.com/business/help/488291839463771
- https://business.whatsapp.com/products/business-app
