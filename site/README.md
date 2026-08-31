# Public website (babyrock.ai)

Static site for GitHub Pages. The words live in `content/` so they can be changed without touching the layout.

```
content/en.md es.md ca.md fr.md   ← copy
content/config.json               ← prices, WhatsApp number, formula
src/styles.css  src/site.js       ← look and simulator
build.mjs                         ← writes ../docs/
```

## Edit and rebuild

```bash
# change a sentence in content/es.md, then:
node site/build.mjs
```

GitHub Pages serves the `docs/` folder. Custom domain: `www.babyrock.ai` (see `docs/CNAME`).

## Preview locally

```bash
node site/build.mjs
npx --yes serve docs
```

## WhatsApp number

Put Rosalia’s number in `content/config.json` as `whatsapp`, digits only with country code (example `34612345678`). If it is empty, the WhatsApp buttons fall back to email.

## Portraits

`assets/portraits/rosalia.jpg` and `ben.jpg` use the same beige studio wall. Replace both files together if you change the background.
