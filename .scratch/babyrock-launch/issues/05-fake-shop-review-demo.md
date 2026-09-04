# 05 — Simulate the full Social reply flow on a fake shop

Type: task
Status: resolved
Triage: ready-for-agent

## Question

Demo AI + operator replies without owning a Google listing and without publishing on someone else’s Maps page.

## Answer (approach)

We do not create a Google Business Profile. Publish is already dry-run unless `publish_live` and `GBP_LIVE_IMPLEMENTED` (neither is on). The missing piece was a shop in the database.

Seed now upserts **Cala Demo** (`placeId` `demo-cala-santcugat`): one 5★ and one 2★, template drafts, simulated WhatsApp ping. `npx prisma db seed`, then:

1. Login `ops@babyrock.local` / `proto-ops` → file → checklist → Publier on the 5★. Status `publie`, log dry-run, nothing on Google.
2. Login `client@babyrock.local` / `proto-client` → OK on the 2★ → `pret`.
3. Ops Publier on the 2★. Still dry-run.

Optional later: call `draftOneAvis` with `XAI_API_KEY` so the partner sees a model draft instead of the template. Not required for the click-through.

Replay: run seed again; it resets the two avis.

## Comments

Noted 2026-09-03 as today’s demo backlog. Fixture landed in `prisma/seed.ts`.
