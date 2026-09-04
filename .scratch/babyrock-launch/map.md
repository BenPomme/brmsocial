# Wayfinder map: Babyrock launch (demo Friday 4 Sep 2026)

## Destination

A partner demo that finds Sant Cugat restos exhaustively, reaches most of them (email or WhatsApp), and a Rosalia chat that answers in the prospect’s language without looping. WhatsApp inbound stays up on a **fixed** public URL.

## Notes

- Factory = `brmsocialbackend`. Site = `brmsocial`. Stripe = other agent.
- No new agent outside `14-agents.md` (extend `inbox_sync` / `scout` / `carrier`).
- 555 test number: allowlist only. Jean Guillaume: Ben adds `WHATSAPP_ALLOWLIST` himself.
- Skills: `00-LIRE.md`, `14-agents.md`, this map.

## Decisions so far

- Rosalia scripts-first, cheap LLM only for unmatched **product** questions.
- Docker is Postgres only. WhatsApp needs Next + a public URL.
- LaunchAgents on Desktop are blocked by macOS TCC.
- [03 scout Sant Cugat](issues/03-scout-santcugat-80.md): 92 leads after raising cap from 10→80.
- [04 email coverage](issues/04-email-coverage.md): 49% email, 86% Maps phone stored, 50% reachable without Maps phone.

- [Simulate the full Social reply flow on a fake shop](issues/05-fake-shop-review-demo.md): Cala Demo in seed; no Google listing; Publier stays dry-run.

## Not yet specified

- Hosting vendor for the factory (Fly vs Railway vs Vercel+Neon).
- How we store WhatsApp numbers found on resto sites vs email.
- CRM fiche (already backlog, after Friday).

## Out of scope

- Billing 0.7 %, WABA prod `#2593030`, Verifactu, publishing on a Maps listing we don’t own.
