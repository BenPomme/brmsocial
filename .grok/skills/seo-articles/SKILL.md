---
name: seo-articles
description: >
  Research keywords, cluster by live SERP, then write or rewrite BabyRock
  public DIY guides. Use when the user runs /SEOARTICLES or /seo-articles,
  asks for keyword research plus a blog post, wants most-searched terms,
  topic clusters, SEO keywords for a guide, or a new how-to on Google
  reviews / Maps / local search. Combines Grok-native keyword research
  with diy-thought-leadership. Do not invent search volumes.
argument-hint: seed, market, goal
---

# SEO articles (BabyRock public guides)

Write a shop-owner article that can rank. Research first. Then write.
Do not skip the SERP. Do not invent Ahrefs or GSC numbers.

Also load `diy-thought-leadership` and follow it for audience, job of the
piece, voice, forbidden lines, facts, freeze names, and ES/CA/FR. This
file owns research, clustering, keyword placement, and the files on disk.
If `write-as-ben` is also on, that file owns sentence shape; default for
these guides is **you**, not we.

Public copy lives in `site/` + `docs/`. Do not mix factory `src/` into a
guide. Deploy is `git push website main` only. Never push `origin` unless
the user says so.

## Inputs

Need a seed, a market, and a goal. If missing, ask once.

- Seed: the query a tired owner types (`how to remove a google review`)
- Market: `hl` + `gl` (EN/US for research; ES/ES, CA/ES, FR/FR when the
  piece is for that language)
- Goal: usually `habit` (teach this week). `leads` is allowed; still do
  not sell in the body
- Site: www.babyrock.ai, four languages, English is the source

Example kickoff: `Research keywords for [topic] in [country/language], goal = habit, then write the guide.`

## 1. Demand (typed queries)

Run `scripts/suggest.py` from this skill directory:

```bash
python3 scripts/suggest.py --seed "SEED" --hl en --gl us
```

Fan-out is a–z plus question prefixes. Hit counts are a **Proxy** for
typed demand, not official monthly volume. Label every volume as
Measured (pasted GSC or tool export), Proxy (autocomplete hits), or
Unknown. Default is Unknown plus Proxy. Never fabricate a number.

Add, with `web_search` / page fetch, not guesswork:

- People Also Ask
- Related searches
- Reddit / X only if they change the cluster (owner vs customer intent)

## 2. Live SERP (difficulty)

Search the seed and the top 3–5 variants. Read the live top 10. Note
intent of each result (owner how-to, customer how-to, vendor listicle,
Google Help). Difficulty is the SERP, not a KD score.

If Google Help or a dedicated official page owns position 1, we still
write: we win as the shop-owner page that answers the PAA in the first
screen, not as a 30-template dump.

## 3. Intent and clusters

Classify each query: informational / commercial / transactional /
navigational, plus funnel (habit this week vs compare tools).

Cluster by **shared SERP**, not shared words. If two queries show largely
the same URLs, they are one URL. If they split (customer-delete vs
owner-report; templates vs sequence; Maps vs organic), keep two URLs and
cross-link.

Before adding a URL, read `site/content/guides.json`. Do not create a
sixth page that cannibalizes an existing slug. Merge or cross-link.

One primary query per URL. Secondaries are H2s, FAQs, and internal-link
anchors.

## 4. Placement

See `references/scoring-and-placement.md`. Put the primary in:

- `## title` (this is the H1)
- slug in `guides.json`
- first 100 words of `## body`
- `## dek` (this is the meta description)

Secondaries: `##` H2s in the body (questions when they match PAA), plus
the examples ↔ negative style of internal links (`[label]([[id]])`).
Link research ranges with `[label]([[page:research]])`, never paste the
calculator.

## 5. Write (English source)

Follow `diy-thought-leadership` structure: title, dek, open, do this,
do not, why it matters (one named source), sources.

File: `site/content/guides/{en,es,ca,fr}/<id>.md`

```
## title
## dek
## impact_label
## impact
## body
## sources
## wa_prefill
```

H2s live inside `## body` as markdown headings, each in its own block
(blank line after the heading). The builder turns `## heading` into
`<h2>`. Keys must stay single tokens (`title`, `dek`, `body`, …).

Body rules that are SEO-specific:

- First paragraph contains the primary phrase, in a real sentence
- H2s are the PAA / secondary queries
- Specific names in examples (Marta, Pau), not `[Name]` / `[service]`
- `wa_prefill` is one line: `Hi Rosalia, I read …`

Then adapt, do not calque: ES usted, CA vostè, FR vous. Same sources,
same steps, same H2 intent. Slug stays in `guides.json` (do not invent
a parallel URL per language beyond the existing `slugs` map).

New guide: add `id`, `img`, and four `slugs` to `guides.json`. Reuse an
existing `guide-*.jpg` unless the user supplies a photo. Do not generate
a new hero.

## 6. Build, QA, ship

```bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; nvm use 22
node site/build.mjs
```

QA each language of the new/changed URLs:

- H1 = title, dek centered, H2s rendered
- primary in first body `<p>`
- internal links resolved (no leftover `[[…]]`)
- no em dash, no BabyRock Direct, no SKU, no calculator formula
- `og:type` article; Article JSON-LD; FAQPage when H2s are questions

Commit only `site/` + `docs/` (and this skill if you edited it). Then
`git push website main`. Do not `git add docs` if that would sweep
`docs/agents/`. Do not push `origin`.

## Report back

A short table: seed, unique autocomplete, top Proxy queries, cluster
decision (one URL vs split), primary, secondaries, slugs shipped. Say
Unknown where volume is Unknown.
