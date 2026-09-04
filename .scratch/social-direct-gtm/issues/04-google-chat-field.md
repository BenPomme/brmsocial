# 04 — Google Chat field vs SMS vs WhatsApp

Type: research
Status: resolved
Triage: ready-for-agent

## Question

When we later put a `wa.me` on the shop’s Google listing for Direct, what does Google actually show (Chat, SMS, WhatsApp)? The catalogue says if Google shows SMS and WhatsApp it shows only SMS, so WhatsApp-only for now.

Confirm against Google’s current Business Profile / messaging docs. What can we set as a manager without owning the listing?

## Answer

Catalogue §8 is still right. The listing field is **Chat** (Edit profile → Contact). It is a launcher, not a Google inbox: WhatsApp (`https://wa.me/<E164>`) or SMS. If both are stored, Help says customers see **only SMS**. For Direct: WhatsApp only, and delete Chat SMS if it is already there. Do not put `wa.me` in Website or Social.

A **manager** can set it (edit URLs, attributes, phone, profile on Search/Maps). Stay Manager; Titulaire stays Owner; written consent. API: `attributes/url_whatsapp` and `attributes/url_text_messaging` on the Business Profile API (updated 2026-08-28).

Do not confuse this with **Google Business Messages**, shut down 31 July 2024 (in-Maps chat + partner API). That is dead. The Chat field replaced it. RCS for Business is a third product, not the listing field.

Spain is not in the Feb 2025 exclusion list (PH, VN, TH, TW, JP, KR), but Help still says “select regions.” Public-check on Spanish mobile Search; a PH IP is a bad test.

Full write-up: `research/direct-google-chat-field.md`.
