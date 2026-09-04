# Direct cobaye: Meta Tech Provider vs current Babyrock Social app

**Date:** 3 September 2026  
**Ticket:** `.scratch/social-direct-gtm/issues/01-meta-tech-provider.md`  
**Scope:** One shop’s WhatsApp number on BabyRock Direct — Embedded Signup, messages from the shop’s number, coexistence with the WhatsApp Business app. Do we need to become a Meta Tech Provider, or can the current **Babyrock Social** app (use case **Connect with customers through WhatsApp**, not Become a Partner) do a single cobaye?  
**Method:** Meta’s own docs only (`developers.facebook.com`, `developers.facebook.com/documentation/…`, `whatsappbusiness.com`, Help Center URLs Meta itself cites). Factory state from `10-whatsapp-service.md`. No BSP blogs as evidence.

Factory today (not a Meta claim): Meta app **Babyrock Social**, App ID `1032575959608719`, Business ID `1048266287813014`. Use case Connect with customers through WhatsApp only. Test number `+1 555 653 1464`. Production WABA blocked `#2593030`. Direct is not sold.

---

## Verdict

**You need to become a Tech Provider.** The current Direct-Developer path cannot do this cobaye as specified.

- **Connect with customers** is the Cloud API path for **your own** WABA and **your own** number (Fil Babyrock). Meta sends anyone who will serve **other** businesses to the partner docs instead.
- **Embedded Signup** and **coexistence** (Business app + Cloud API on the same shop number) both require you to **already be a Tech Provider or Solution Partner**.
- **Solution Partner / “Become a Partner” (Tech Partner)** is not required. Tech Provider is the minimum partner tier. The shop pays Meta for API usage; Babyrock bills the shop for Direct.
- A cobaye of one does **not** skip App Review. Accessing a WABA **not owned by Babyrock** without **Advanced access** returns Graph error `200`. That is the shop’s WABA, by design.
- Tempting shortcuts (put the shop number on Babyrock’s WABA; add the titulaire as Tester and stay in Dev mode; share the WABA in Business Suite without Advanced access) either drop coexistence, fail the API, or put the thread on a Babyrock-owned account. None of those is Fil commerce.

The existing Babyrock Social **app can be converted** in the dashboard (Tech Provider onboarding is a left-menu item **inside** Connect with customers). You do not have to create a second Meta app. Converting the same app mixes Fil Babyrock and Fil commerce onto one callback unless you set webhook overrides.

Even after Tech Provider, a cobaye can still die on **#2593030**, shop-side Business Verification, display name, payment method, Business-app eligibility, a dying public webhook URL, or the 24-hour coexistence sync window.

---

## 1. Two Meta paths (do not mix them)

### 1.1 Direct developer — “Connect with customers through WhatsApp”

Cloud API Get Started: create a Business app, select **Connect with customers through WhatsApp**, attach **your** business portfolio, add **your** phone number, send a test message, create a system user token, subscribe webhooks.

https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started

Access tokens: **direct developer** = only you or your business access **your own** data → **System User** token.

https://developers.facebook.com/documentation/business-messaging/whatsapp/access-tokens

App Review: Business apps get **Standard Access** automatically. *“If you are using the API for yourself as a Direct Developer, you do not need Advanced access or app review.”* Next sentence: *“If you are building an app that other businesses will be using, you must request Advanced access.”*

https://developers.facebook.com/docs/whatsapp/solution-providers/app-review

That is today’s Babyrock Social setup: Fil Babyrock on Babyrock’s test WABA.

### 1.2 Partner — Tech Provider / Tech Partner / Solution Partner

Partners page, first paragraph: the partner docs are for businesses that *“provide, or want to provide, WhatsApp messaging services to **other businesses**.”* If the app *“will not be used by other businesses”*, use Cloud API Get Started instead.

https://developers.facebook.com/docs/whatsapp/solution-providers/

| | Tech Provider | Tech Partner | Solution Partner |
|---|---|---|---|
| Serve onboarded clients on Cloud API | Yes | Yes | Yes |
| Embedded Signup | Yes | Yes | Yes |
| Credit line / invoice Meta usage | No — shop adds a card, Meta bills the shop | No | Yes |
| Meta Business Partner badge | No | Yes (upgrade from TP) | Yes |

https://developers.facebook.com/docs/whatsapp/solution-providers/  
https://whatsappbusiness.com/partners/become-a-partner/

Public partner page: Third Party Developers → **Tech Provider** → Tech Partner. Solution Partner is a different track (credit line). *“If you don’t need a credit line and don’t need to invoice your clients for API usage directly, consider becoming a Tech Provider instead.”*

BabyRock Direct is **messaging services to other businesses** (the shop’s number, the shop’s customers). It is the partner path. It is **not** Solution Partner unless you want to resell Meta minutes.

“Become a Partner” on that marketing page is Tech Partner / Solution Partner. Factory note “pas Become a Partner” means the app stayed on Connect with customers and never started **Tech Provider onboarding**. That onboarding is a separate dashboard flow, not a different app type.

---

## 2. Why the current app cannot do the cobaye

The cobaye as specified needs three things at once:

1. **Embedded Signup** so the shop generates **its** WABA and grants Babyrock’s app access.
2. Messages **from the shop’s number** (Fil commerce), not from Babyrock Social’s 555.
3. **Coexistence** with the WhatsApp Business app (titulaire keeps the phone inbox).

Meta’s own gates:

**Embedded Signup implementation — before you start:** *“You must already be a Solution Partner or Tech Provider.”* Host on HTTPS. Subscribe to `account_update`. Facebook Login for Business configuration. App in Live mode only shows permissions that have **Advanced access**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation

**Hosted Embedded Signup:** *“You must have completed the steps to become a Solution Partner or Tech Provider.”*

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/hosted-es

**Onboard WhatsApp Business app users (coexistence):** *“You must already be a Solution Partner or Tech Provider.”* Business app **≥ 2.24.17**. Working webhook. Session logging.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

**App Review / permissions:** `whatsapp_business_management` on WABAs **not owned by your business** requires **Advanced access**. Without it, API calls return **error code `200`**. Same for the permission appearing in Embedded Signup once the app is Live.

https://developers.facebook.com/docs/whatsapp/solution-providers/app-review  
https://developers.facebook.com/docs/whatsapp/embedded-signup

**Access tokens:** Tech Provider uses **business tokens** (Business Integration System User), minted by exchanging the Embedded Signup code. Direct developers use a system token on **their** WABA. You cannot mint a customer-scoped business token without Embedded Signup.

https://developers.facebook.com/documentation/business-messaging/whatsapp/access-tokens

**Facebook Login for Business:** *“To serve businesses that you do not own or manage, your app must be approved for Advanced Access.”* Business Integration System User tokens: the tester of that flow must have a **role on the app** and **full control of the client business** — that is a test of the partner flow, not a production cobaye.

https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business

**Migrate an existing number:** consumer WhatsApp → delete Messenger first. Business app → *either* delete the account (history gone, no app) *or* onboard *“using a partner who supports business app number onboarding.”* Coexistence is partner-gated, not a dashboard toggle on Connect with customers.

https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account

Connect with customers can **add a production number to Babyrock’s own WABA** (API Setup). That is still Direct Developer. The WABA is Babyrock’s. The Business app must be deleted first if the number is already on WhatsApp. That is not coexistence and not shop-owned assets.

https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts  
https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers

---

## 3. Minimum Meta product, verification, webhook (Tech Provider, one cobaye)

Same checklist as industrialisation. Meta does not publish a “one client, skip review” track.

### 3.1 Product on the Meta app

Keep (or create) a **Business-type** app with the WhatsApp use case. Tech Provider onboarding lives under:

**App Dashboard → Use cases → Customize (WhatsApp) → Tech Provider onboarding**

https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-tech-providers  
https://developers.facebook.com/documentation/development/create-an-app/whatsapp-use-case

Required extra product: **Facebook Login for Business**, with a **WhatsApp Embedded Signup** configuration (template “WhatsApp Embedded Signup Configuration With 60 Expiration Token”, or custom with that login variation). Configuration ID is what `FB.login` sends as `config_id`.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation  
https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business

OAuth settings: Client OAuth, Web OAuth, Enforce HTTPS, Embedded Browser OAuth, Strict Mode, Login with JS SDK. Allowed domains + Valid OAuth redirect URIs must include the HTTPS origin that launches the popup.

Embedded Signup Integration Helper: **Business-type apps only**, **App Dashboard → WhatsApp → Embedded Signup Builder**.

https://developers.facebook.com/docs/whatsapp/embedded-signup

**v2 of Embedded Signup is deprecated 15 October 2026.** Implement **v4**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview

Onboard **without** a Solution Partner unless you want their credit line.

Not required: Tech Partner upgrade, Solution Partner, Multi-Partner Solution, credit line.

### 3.2 Verification (Babyrock, then the shop)

**Become a Tech Provider — Step 1: Verify your business.** Documents + contact. *“Your business must be verified before you can start the app review process.”*

https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-tech-providers  
https://www.facebook.com/business/help/2058515294227817

**Step 2: App Review** for **Advanced access**:

- `whatsapp_business_messaging` — send on behalf of clients. Video: message created in the app (or API Setup cURL to a test recipient) and received in WhatsApp.
- `whatsapp_business_management` — access clients’ WABAs. Video: create a template in the app or in WhatsApp Manager.

App settings first: icon, privacy policy URL, category. One video **per** permission. Average review ~24 hours (Meta’s figure; not a SLA).

https://developers.facebook.com/docs/whatsapp/solution-providers/app-review

**Access Verification** (separate from App Review): any business whose app is used by **other** businesses and that needs `whatsapp_business_management` (listed) must be verified as a Tech Provider. If the caller has **no role on the app**, endpoints reject with error `100` until this passes (~5 days). Business Verification is a prerequisite. Triggered when an admin requests Advanced Access for those permissions.

https://developers.facebook.com/documentation/development/release/access-verification  
https://developers.facebook.com/docs/development/release/tech-providers

**Shop-side (the cobaye):**

- Own **Meta Business portfolio**, distinct from Babyrock’s. Embedded Signup cannot grant the portfolio that **owns the app**. Existing WABAs **created via the developer app** cannot be selected in the flow.
- Complete Embedded Signup (authenticate, accept Cloud API / WhatsApp / Meta terms, create or pick WABA, verify number or connect Business app).
- **Display name** that passes [display name guidelines](https://www.facebook.com/business/help/757569725593362). Rejection is a flow error (“Your verified name violates WhatsApp guidelines”).
- **Payment method on the shop’s WABA** before they can send. Tech Provider does not share a credit line. Help Center Meta cites: https://www.facebook.com/business/help/488291839463771  
  Troubleshooting: no card (TP) / no credit line (SP) → **cannot send template messages**.

https://developers.facebook.com/docs/whatsapp/embedded-signup  
https://developers.facebook.com/docs/whatsapp/embedded-signup/migrating-customer-assets

Shop **business verification** is for higher messaging limits, more phone numbers, Official Business Account — not for the first Cloud API send. Unverified portfolios are limited (e.g. how many WABAs they can create). Error `2388098` / copy: limited WABAs until verification completes.

https://developers.facebook.com/docs/whatsapp/solution-providers/  
https://developers.facebook.com/docs/whatsapp/embedded-signup/errors/

Default Embedded Signup cap: **10 new business customers / rolling 7 days**. Business Verification + App Review + Access Verification raises it to **200**. One cobaye fits the default **after** those three exist.

### 3.3 Webhooks (app + per-shop WABA)

**App callback (dashboard)**  
Connect with customers apps: **Use cases → Customize → Configuration** (not the old WhatsApp → Configuration path). Public HTTPS, valid TLS, **no self-signed cert**. GET must echo `hub.challenge` when `hub.verify_token` matches. POST: HTTP 200, HMAC-SHA256 of body with **app secret** vs `X-Hub-Signature-256`. Meta retries failed delivery up to 7 days.

https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint  
https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview

Factory gap (`10-whatsapp-service.md`): `WHATSAPP_APP_SECRET` empty → no signature check. Tunnel URL dies with the session. Meta needs a **stable** HTTPS URL.

**Subscribe fields**

| Field | Why |
|---|---|
| `messages` | Inbound + send statuses. Needs `whatsapp_business_messaging`. |
| `account_update` | ES complete (`PARTNER_ADDED`); coexistence disconnect (`PARTNER_REMOVED`, e.g. `PRIMARY_INACTIVITY` ~14 days); `ACCOUNT_OFFBOARDED` / `ACCOUNT_RECONNECTED`. **No callback override** — always the app default URL. |
| `history` | Coexistence chat history (up to 180 days). |
| `smb_app_state_sync` | Business-app contacts. |
| `smb_message_echoes` | Messages the titulaire sends from the Business app / linked devices. |
| `phone_number_name_update` | Display-name review. |
| `account_review_update` | Policy review of the WABA. |
| `account_alerts` / `phone_number_quality_update` / `business_capability_update` | Limits, quality, OBA. |

https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

**Per-customer WABA (after ES)**  
`POST /{WABA_ID}/subscribed_apps` with the **shop’s business token**. Optional `override_callback_uri` + `verify_token` so Fil commerce does not land in the Fil Babyrock inbox. Overrides work for `messages`, `smb_message_echoes`, `smb_app_state_sync`, `history`. They do **not** work for `account_update` or template webhooks.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider  
https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/override

**Dev vs Live:** *“Make sure your app is in Live mode; some webhooks will not be sent if your app is in Dev mode.”* Live/Publish needs icon, privacy policy, data-deletion URL, EU DPO contact if applicable.

https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview  
https://developers.facebook.com/documentation/development/create-an-app/whatsapp-use-case

### 3.4 After the shop finishes Embedded Signup

Server-side only (code TTL **30 seconds**):

1. `GET /oauth/access_token` — exchange `code` for business token (`client_id`, `client_secret`, `code`).
2. `POST /{WABA_ID}/subscribed_apps` — subscribe webhooks.
3. `POST /{PHONE_NUMBER_ID}/register` with a 6-digit PIN — **skip this for coexistence** (number already registered).
4. Coexistence: within **24 hours**, `POST /{PHONE_NUMBER_ID}/smb_app_data` twice (`sync_type`: `smb_app_state_sync`, then `history`). Miss the window → offboard and redo ES. Titulaire should keep the Business app open.
5. Tell the shop to add a payment method in WhatsApp Manager.
6. Optional: `GET /{PHONE_NUMBER_ID}?fields=is_on_biz_app,platform_type` → expect `is_on_biz_app: true`, `platform_type: CLOUD_API`.

Session event for coexistence: `FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING`.

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation

### 3.5 Same Meta app vs a second app

Tech Provider onboarding is **on the existing Connect with customers app**. One App Review. Default webhook is one URL for every WABA.

If Babyrock Social and Direct share App ID `1032575959608719`, use **WABA or phone webhook override** so diner messages are not ingested as Fil Babyrock. `account_update` still hits the default URL — the handler must branch on `entry[].id` (WABA id).

A second Meta app isolates products and App Review videos, at the cost of a second review and a second Login configuration. Meta does not require it.

---

## 4. What still blocks a cobaye if we never industrialise

Tech Provider is necessary, not sufficient.

### 4.1 Already true for Babyrock

**Error `2593030`:** Embedded Signup / WABA creation system error: *“Your account couldn't be created. Try again later or visit Business Support Home to file a case.”* Factory: production WABA blocked on this code. Until Business Support Home clears it, **Babyrock cannot create a production WABA on this portfolio**, and a shop going through ES **under a sick Babyrock-linked user/portfolio** can hit the same wall. A shop on a **clean, separate** portfolio may still succeed; that is an empirical test, not a documented exception.

https://developers.facebook.com/docs/whatsapp/embedded-signup/errors/

**Unstable webhook URL.** Meta delivers to whatever callback is registered. A Cloudflare quick tunnel that dies with the laptop is enough to miss coexistence history (24h) and inbound diner messages. Endpoint must stay up and return 200.

**Missing app secret.** Signature verification is required for a production webhook. Factory: `WHATSAPP_APP_SECRET` still empty.

**Test 555 is not a cobaye.** 555 numbers: US +1, auto-verified, **cannot be migrated to another WABA**, cannot be used outside the platform, display name must be approved before send. Sandbox ES accounts: **cannot send or receive**.

https://developers.facebook.com/docs/whatsapp/embedded-signup

### 4.2 Shop-side (one titulaire is enough to fail)

| Block | Meta text / code |
|---|---|
| Number on **consumer** WhatsApp, not Business app | Must delete Messenger. No coexistence. |
| Business app **&lt; 2.24.17** | Coexistence requirement. Error `4563015` if outdated. |
| Quiet Business app | `3441045` — *“isn't eligible… More activity on the WhatsApp Business App is needed.”* |
| Number already on Cloud API / another partner | `3441049` / `2655094` / `2655093` — disconnect in **Settings → Account → Business Platform**, wait ~15 minutes. |
| Number region | `3441042` — *“unavailable for phone numbers from this region.”* Meta does not publish a country list in the coexistence guide; the error is the source of truth at signup time. |
| Select Babyrock’s portfolio in ES | Portfolio that **owns the app** is not selectable. Shop must use/create **their** portfolio. |
| Display name | Flow error if it fails guidelines. |
| IVR / inbound-only / pager | OTP may never arrive. |
| 2FA / new-device challenge on the Facebook user | `2859009`, `2859043`, `4612001`. |
| Unverified shop creating extra WABAs | `2388098`. |
| No payment method | Templates blocked; Meta also says attach a method before messaging. |
| Policy-restricted WABA | `2655089` / `3441040`. |
| Primary device idle ~14 days after coexistence | `account_update` `PARTNER_REMOVED` / `PRIMARY_INACTIVITY`. API companion drops until they reconnect. |

https://developers.facebook.com/docs/whatsapp/embedded-signup/errors/  
https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users

Coexistence also: unlinks companion devices (must re-link; Windows / WearOS unsupported); disables broadcast lists, disappearing / view-once / live location on 1:1; groups do not sync to Cloud API; throughput fixed at **20 mps**; Cloud API customer-service window **does not** open from Business-app replies.

### 4.3 After “connected”

- **24-hour history/contact sync** or redo ES.
- Titulaire must **opt in to share history** or you get `2593109` (sync off). Direct can still run on live `messages` + `smb_message_echoes`.
- Utility/reminder templates need **template approval** (`whatsapp_business_management`) and a **category** that matches use (booking reminder = typically utility). Marketing templates are a different policy surface.
- Quality rating is **per phone number**. One shop’s spam does not sink Babyrock Social’s 555 — unless you wrongly put both numbers on one WABA.

---

## 5. Shortcuts that look like a cobaye and are not

### 5.1 Put the shop number on Babyrock’s WABA (API Setup)

Allowed for Direct Developers: add a production number, which **creates a WABA associated with that number under your business**.

https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts

If the number is already on WhatsApp: *“disconnect it from the existing account”* (up to 3 minutes). That **deletes** the Business app account. History gone. No coexistence.

https://developers.facebook.com/docs/whatsapp/embedded-signup/errors/  
https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account

WABA owner = Babyrock, not the shop. Display name / quality / policy sit on Babyrock. Product rule (Fil commerce = shop’s number **and** shop-owned thread) is missed. Production create is already **#2593030**.

### 5.2 Add the titulaire as Tester / Developer, stay in Dev mode

Standard Access: permissions only for people **with a role on the app**. ES in Dev shows WhatsApp permissions to admin/developer/tester. Access Verification **skips** if the person has an app role.

https://developers.facebook.com/docs/graph-api/overview/access-levels  
https://developers.facebook.com/documentation/development/release/access-verification

Still:

- Coexistence and ES implementation require **Tech Provider or Solution Partner**.
- `whatsapp_business_management` on a WABA **Babyrock does not own** → error **`200`** without Advanced access.
- Some webhooks **do not fire in Dev**.
- Switch to Live **without** Advanced access: those permissions **disappear** from ES.
- The titulaire would be a **developer of Babyrock’s Meta app** — not a shop onboarding.

Useful to **test the popup with Benjamin’s credentials** after TP onboarding starts. Not a production cobaye.

### 5.3 Share WABA in Meta Business Suite, skip Embedded Signup

“Other partners” who **don’t need API access**: verified portfolio + shop assigns the WABA in Business Suite. That is **WhatsApp Manager UI**, not Cloud API.

API on a shared WABA: partner app needs **Advanced access** to `whatsapp_business_management` or error `200`. Same App Review as Tech Provider.

https://developers.facebook.com/docs/whatsapp/solution-providers/  
https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts

Cap: share with **up to two** partners. Does not enable coexistence by itself.

### 5.4 Shop as Direct Developer on their own Meta app

The shop creates Connect with customers, adds **their** production number, generates a system token, hands it to Babyrock. No Tech Provider for Babyrock. No Embedded Signup. No coexistence unless **they** later use a partner. Token and app are the shop’s ops problem. Not BabyRock Direct. Still needs a production number (OTP, display name) and a public webhook.

### 5.5 App-only install

Cannot onboard WhatsApp Business app users (no coexistence).

https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/app-only-install/

---

## 6. Mapping to factory objects

| Factory | Meta |
|---|---|
| Fil Babyrock (Social) | Direct developer. Babyrock WABA + Babyrock number. System user token. Current app. |
| Fil commerce (Direct) | Tech Provider. Shop WABA + shop number. Business token from ES. Coexistence if the number is already on Business app. |
| Direct setup (number does not exist yet) | ES Cloud API flow: new number, OTP, `register`. Still TP. |
| Pack / many shops | Same TP. ES cap 10/week until Access Verification. Not needed for one cobaye. |
| `#2593030` | ES error: account couldn’t be created. Support Home. Blocks production WABA on the affected account. |
| `/api/webhooks/whatsapp` | App (or override) callback. Today: `messages` only, no signature, tunnel. Direct needs extra fields + stable HTTPS + `subscribed_apps` on the **shop** WABA. |

ADR `docs/adr/0001-two-products-two-whatsapp.md` is consistent with Meta: two identities, two WABAs. Social must not wait on Tech Provider; Direct cannot ship on Social’s Direct-Developer app alone.

---

## 7. Minimum sequence (one cobaye, no scale)

1. **App Dashboard → WhatsApp use case → Tech Provider onboarding → Onboard without a partner.** Accept Tech Provider terms.
2. **Business Verification** of Babyrock (documents). Wait.
3. App icon, privacy policy, data-deletion URL. Add **Facebook Login for Business**. Create WhatsApp Embedded Signup configuration. Allowlist the HTTPS domain.
4. **App Review** videos (send message + create template). Request Advanced access for `whatsapp_business_messaging` and `whatsapp_business_management`.
5. Complete **Access Verification** when Meta emails it.
6. Production webhook: stable HTTPS, GET verify, POST 200, `X-Hub-Signature-256`, fields in §3.3. Put `WHATSAPP_APP_SECRET` in env. Subscribe the **app** to those fields.
7. Implement ES **v4** (JS SDK + session logging + 30s code exchange) **or** Hosted ES. For coexistence, confirm the flow shows “connect existing WhatsApp Business account”.
8. Pick a cobaye whose number is on **WhatsApp Business app ≥ 2.24.17** (not consumer), who will create **their own** Business portfolio, and who will add a **card** on the WABA.
9. Titulaire completes ES. Backend: token exchange → `subscribed_apps` (override URI if sharing the Social app) → **skip** `register` if coexistence → `smb_app_data` within 24h.
10. Confirm `is_on_biz_app` + inbound `messages` + an `smb_message_echoes` when they reply from the phone. Then send one in-window Cloud API text.

If step 2 or 9 dies on **#2593030**, stop and file Business Support Home. Do not industrialise. Do not put the shop number on the 555 WABA.

---

## Sources (primary)

- Partners / Tech Provider vs Solution Partner: https://developers.facebook.com/docs/whatsapp/solution-providers/
- Become a Tech Provider: https://developers.facebook.com/docs/whatsapp/solution-providers/get-started-for-tech-providers  
  Canonical duplicate: https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/get-started-for-tech-providers
- Partner marketing / feature matrix: https://whatsappbusiness.com/partners/become-a-partner/
- Connect with customers / Get Started: https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started
- Customize use case (TP onboarding in the same app): https://developers.facebook.com/documentation/development/create-an-app/whatsapp-use-case
- App Review (Direct Developer vs other businesses; error 200): https://developers.facebook.com/docs/whatsapp/solution-providers/app-review
- Access levels: https://developers.facebook.com/docs/graph-api/overview/access-levels
- Access Verification / Tech Providers (platform): https://developers.facebook.com/documentation/development/release/access-verification  
  https://developers.facebook.com/docs/development/release/tech-providers
- Access tokens: https://developers.facebook.com/documentation/business-messaging/whatsapp/access-tokens
- Embedded Signup overview: https://developers.facebook.com/docs/whatsapp/embedded-signup  
  https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/overview
- ES implementation (must already be TP/SP; 30s code; Live permissions): https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/implementation
- Hosted ES: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/hosted-es
- Coexistence: https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-business-app-users
- Onboard as Tech Provider (token, subscribed_apps, register, card): https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/onboarding-customers-as-a-tech-provider
- ES errors including **2593030**: https://developers.facebook.com/docs/whatsapp/embedded-signup/errors/
- Migrate existing number: https://developers.facebook.com/documentation/business-messaging/whatsapp/solution-providers/migrate-existing-whatsapp-number-to-a-business-account
- WABAs / share with partner: https://developers.facebook.com/documentation/business-messaging/whatsapp/whatsapp-business-accounts
- Phone numbers: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/phone-numbers
- Display names: https://developers.facebook.com/documentation/business-messaging/whatsapp/display-names  
  Guidelines: https://www.facebook.com/business/help/757569725593362
- Webhooks overview / create / override:  
  https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview  
  https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/create-webhook-endpoint  
  https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/override
- Facebook Login for Business: https://developers.facebook.com/documentation/facebook-login/facebook-login-for-business
- Business Verification (Help Center, cited by Meta): https://www.facebook.com/business/help/2058515294227817
- Add a card (Help Center, cited by Meta): https://www.facebook.com/business/help/488291839463771
- App-only install (no coexistence): https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/app-only-install/
- Custom flows (coexistence as an ES option): https://developers.facebook.com/documentation/business-messaging/whatsapp/embedded-signup/custom-flows

Factory context (not Meta): `10-whatsapp-service.md`, `18-roadmap-produit.md` §4, `docs/adr/0001-two-products-two-whatsapp.md`.
