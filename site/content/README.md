# How to change the words on the site

The pages are built from the markdown files in this folder. Edit the file for the language you care about, then rebuild.

| File | Language |
|---|---|
| `en.md` | English |
| `es.md` | Spanish (default on the site) |
| `ca.md` | Catalan |
| `fr.md` | French |
| `config.json` | Prices, emails, WhatsApp number, research formula |

## Edit copy

Each block starts with a heading of the form `## key.name`.

The text under the heading is what appears on the site, until the next `##`. Use full sentences. A blank line starts a new paragraph.

Do not invent new keys unless you also change `site/build.mjs`. If you only want to change what we say, stay inside the existing keys.

Two products: **BabyRock Social** (live, review replies) and **BabyRock Direct** (coming soon, shop WhatsApp). Checkout copy and prices are Social only.

## Edit numbers

In `config.json`:

- `priceMonth` / `priceYear` / `yearDiscountPct` — what the pricing cards show, and what the simulator subtracts
- `whatsapp` — digits with country code, no `+` (example: `34612345678`). If this is empty, the WhatsApp buttons fall back to email. **Never** the Meta test number `+1 555…`. Production WABA only. Inbound is handled by [brmsocialbackend](https://github.com/BenPomme/brmsocialbackend) (`/api/webhooks/whatsapp`).
- `email` — Rosalia
- `reviewsManager` — the Google manager address we ask owners to add
- `formula` — the simulator. Change this only if the research page is also updated, because we show the same numbers in both places

## Rebuild

From the repo root:

```bash
node site/build.mjs
```

That writes the static site into `docs/`, which GitHub Pages serves.

## Portraits

Rosalia: `site/assets/portraits/rosalia.jpg`
Benjamin: `site/assets/portraits/ben.jpg`

They should keep the same beige studio background. Replace the files, keep the names, rebuild.
