#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync, cpSync, existsSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const contentDir = join(root, "content");
const srcDir = join(root, "src");
const assetDir = join(root, "assets");
const outDir = join(root, "..", "docs");

const LOCALES = {
  es: {
    name: "ES",
    html: "es",
    slugs: {
      home: "",
      simulator: "simulador",
      how: "como-funciona",
      research: "investigacion",
      about: "nosotros",
      subscribe: "suscribirse",
      account: "cuenta",
      privacy: "privacidad",
      terms: "condiciones",
    },
  },
  ca: {
    name: "CA",
    html: "ca",
    slugs: {
      home: "",
      simulator: "simulador",
      how: "com-funciona",
      research: "recerca",
      about: "nosaltres",
      subscribe: "subscriure",
      account: "compte",
      privacy: "privadesa",
      terms: "condicions",
    },
  },
  fr: {
    name: "FR",
    html: "fr",
    slugs: {
      home: "",
      simulator: "simulateur",
      how: "comment-ca-marche",
      research: "recherche",
      about: "a-propos",
      subscribe: "s-abonner",
      account: "compte",
      privacy: "confidentialite",
      terms: "conditions",
    },
  },
  en: {
    name: "EN",
    html: "en",
    slugs: {
      home: "",
      simulator: "simulator",
      how: "how-it-works",
      research: "research",
      about: "about",
      subscribe: "subscribe",
      account: "account",
      privacy: "privacy",
      terms: "terms",
    },
  },
};

function parseMd(text) {
  const map = {};
  let key = null;
  const buf = [];
  for (const line of text.split(/\n/)) {
    const m = line.match(/^##\s+(\S+)\s*$/);
    if (m) {
      if (key) map[key] = buf.join("\n").trim();
      key = m[1];
      buf.length = 0;
    } else buf.push(line);
  }
  if (key) map[key] = buf.join("\n").trim();
  return map;
}

function esc(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function paras(s) {
  return String(s || "")
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replaceAll("\n", "<br>")}</p>`)
    .join("\n");
}

function t(copy, key) {
  return copy[key] ?? "";
}

function splitStepTitle(raw) {
  const s = String(raw || "").trim();
  const m = s.match(/^(\d+)\.\s*(.+)$/);
  if (m) return { n: m[1], title: m[2] };
  return { n: "", title: s };
}

const SITE = "https://www.babyrock.ai";

function href(locale, page, depth) {
  const slug = LOCALES[locale].slugs[page];
  const prefix = "../".repeat(depth);
  return slug ? `${prefix}${locale}/${slug}/` : `${prefix}${locale}/`;
}

function absUrl(locale, page) {
  const slug = LOCALES[locale].slugs[page];
  return slug ? `${SITE}/${locale}/${slug}/` : `${SITE}/${locale}/`;
}

function hreflangLinks(page) {
  const tags = Object.keys(LOCALES).map(
    (code) => `  <link rel="alternate" hreflang="${LOCALES[code].html}" href="${absUrl(code, page)}">`
  );
  tags.push(`  <link rel="alternate" hreflang="x-default" href="${absUrl("en", page)}">`);
  return tags.join("\n");
}

function jsonLd(locale, page, copy, config) {
  const org = {
    "@type": ["Organization", "LocalBusiness"],
    name: "BabyRock Social",
    url: SITE + "/",
    email: config.email,
    image: `${SITE}/assets/og.jpg`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Sant Cugat del Vallès",
      addressCountry: "ES",
    },
  };
  const graph = [org];
  if (page === "home") {
    graph.push({
      "@type": "Service",
      name: "BabyRock Social",
      description: t(copy, "meta.description"),
      provider: { "@id": SITE + "/#org" },
      areaServed: ["ES", "FR"],
      offers: [
        { "@type": "Offer", price: String(config.priceMonth), priceCurrency: "EUR", unitText: "MONTH" },
        { "@type": "Offer", price: String(config.priceYear), priceCurrency: "EUR", unitText: "YEAR" },
      ],
    });
    graph.push({
      "@type": "FAQPage",
      mainEntity: [1, 2, 3, 4, 5, 6].map((i) => ({
        "@type": "Question",
        name: t(copy, `home.faq_${i}_q`),
        acceptedAnswer: { "@type": "Answer", text: t(copy, `home.faq_${i}_a`) },
      })),
    });
  }
  if (page === "subscribe") {
    graph.push({
      "@type": "Offer",
      name: "BabyRock Social",
      price: String(config.priceMonth),
      priceCurrency: "EUR",
      url: absUrl(locale, "subscribe"),
    });
  }
  return `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  })}</script>`;
}

function langSwitcher(locale, page, depth) {
  return Object.keys(LOCALES)
    .map((code) => {
      const current = code === locale ? ' aria-current="true"' : "";
      return `<a href="${href(code, page, depth)}"${current}>${LOCALES[code].name}</a>`;
    })
    .join("");
}

function nav(locale, page, copy, depth, config) {
  const item = (key, slugKey) => {
    const current = page === slugKey ? ' aria-current="page"' : "";
    return `<a href="${href(locale, slugKey, depth)}"${current}>${esc(t(copy, key))}</a>`;
  };
  return `
    ${item("nav.simulator", "simulator")}
    ${item("nav.how", "how")}
    ${item("nav.research", "research")}
    ${item("nav.about", "about")}
    ${item("nav.account", "account")}
  `;
}

function waLink(config, text) {
  const msg = encodeURIComponent(text || "Hola Rosalia");
  const digits = String(config.whatsapp || "").replace(/\D/g, "");
  if (digits) return `https://wa.me/${digits}?text=${msg}`;
  return `mailto:${config.email}?subject=${encodeURIComponent("BabyRock Social")}&body=${msg}`;
}

function waIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
}

function asset(depth, path) {
  return `${"../".repeat(depth)}assets/${path}`;
}

function cssJs(depth) {
  const p = "../".repeat(depth);
  return {
    css: `${p}css/site.css`,
    js: `${p}js/site.js`,
  };
}

function shell({ locale, page, copy, config, depth, title, description, body }) {
  const { css, js } = cssJs(depth);
  const navHtml = nav(locale, page, copy, depth, config);
  const wa = waLink(config, t(copy, "wa.prefill"));
  const canonical = absUrl(locale, page);
  const ogImage = `${SITE}/assets/og.jpg`;
  const robots = "index,follow";
  return `<!doctype html>
<html lang="${LOCALES[locale].html}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${canonical}">
${hreflangLinks(page)}
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="BabyRock Social">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:locale" content="${locale === "en" ? "en_GB" : locale === "ca" ? "ca_ES" : locale === "fr" ? "fr_FR" : "es_ES"}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,600;6..72,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${css}">
  ${jsonLd(locale, page, copy, config)}
</head>
<body>
  <a class="skip" href="#main">Skip</a>
  <header class="site-header">
    <div class="wrap header-inner">
      <a class="logo" href="${href(locale, "home", depth)}">BabyRock <span>Social</span></a>
      <nav class="nav-links">${navHtml}</nav>
      <div class="header-actions">
        <div class="lang">${langSwitcher(locale, page, depth)}</div>
        <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">${waIcon()} ${esc(t(copy, "nav.whatsapp"))}</a>
        <a class="btn btn-coral" href="${href(locale, "subscribe", depth)}">${esc(t(copy, "nav.subscribe"))}</a>
        <button class="menu-toggle" type="button" data-menu aria-expanded="false" aria-label="${esc(t(copy, "nav.menu"))}"><span></span><span></span><span></span></button>
      </div>
    </div>
    <nav class="mobile-nav wrap" data-mobile-nav>
      ${navHtml}
      <a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener">${waIcon()} ${esc(t(copy, "nav.whatsapp"))}</a>
    </nav>
  </header>
  <main id="main">${body}</main>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <p class="logo">BabyRock <span>Social</span></p>
        ${paras(t(copy, "footer.tagline"))}
        <p>${esc(t(copy, "footer.city"))}</p>
      </div>
      <div>
        <p><a href="${href(locale, "simulator", depth)}">${esc(t(copy, "nav.simulator"))}</a></p>
        <p><a href="${href(locale, "how", depth)}">${esc(t(copy, "nav.how"))}</a></p>
        <p><a href="${href(locale, "research", depth)}">${esc(t(copy, "nav.research"))}</a></p>
        <p><a href="${href(locale, "about", depth)}">${esc(t(copy, "nav.about"))}</a></p>
      </div>
      <div>
        <p><a href="${href(locale, "subscribe", depth)}">${esc(t(copy, "nav.subscribe"))}</a></p>
        <p><a href="${href(locale, "account", depth)}">${esc(t(copy, "nav.account"))}</a></p>
        <p><a href="${href(locale, "privacy", depth)}">${esc(t(copy, "footer.privacy"))}</a></p>
        <p><a href="${href(locale, "terms", depth)}">${esc(t(copy, "footer.terms"))}</a></p>
        <p><a href="${wa}" target="_blank" rel="noopener">${esc(t(copy, "nav.whatsapp"))} · Rosalia</a></p>
        <p><a href="mailto:${esc(config.email)}">${esc(config.email)}</a></p>
      </div>
    </div>
  </footer>
  <a class="wa-fab" href="${wa}" target="_blank" rel="noopener" aria-label="${esc(t(copy, "nav.whatsapp"))} Rosalia">
    ${waIcon()}
  </a>
  <script>window.BR_CONFIG = ${JSON.stringify(config)};</script>
  <script src="${js}"></script>
</body>
</html>`;
}

function shops(copy, depth) {
  const items = [
    ["shop-restaurant.jpg", "home.shop_restaurant"],
    ["shop-bakery.jpg", "home.shop_bakery"],
    ["shop-salon.jpg", "home.shop_salon"],
    ["shop-florist.jpg", "home.shop_florist"],
    ["shop-cafe.jpg", "home.shop_cafe"],
    ["shop-workshop.jpg", "home.shop_workshop"],
    ["shop-clinic.jpg", "home.shop_clinic"],
    ["shop-physio.jpg", "home.shop_physio"],
    ["shop-club.jpg", "home.shop_club"],
  ];
  return items
    .map(
      ([img, key]) => `<figure class="photo-card"><img src="${asset(depth, "illustrations/" + img)}" alt="${esc(t(copy, key))}"><figcaption>${esc(t(copy, key))}</figcaption></figure>`
    )
    .join("");
}

function compactSim(copy) {
  return `<form class="sim-card" data-sim>
    <h2>${esc(t(copy, "home.sim_title"))}</h2>
    ${paras(t(copy, "home.sim_lead"))}
    <label for="rev">${esc(t(copy, "home.sim_label"))}</label>
    <input id="rev" name="revenue" inputmode="numeric" placeholder="${esc(t(copy, "home.sim_placeholder"))}">
    <input type="hidden" name="reply" value="0.1">
    <div class="sim-result" data-compact-result>
      <span>${esc(t(copy, "home.sim_result_before"))}</span>
      <strong data-compact-amount>—</strong>
    </div>
  </form>`;
}

function homePage(locale, copy, config, depth) {
  return `
  <section class="hero-stage">
    <img class="hero-bg" src="${asset(depth, "illustrations/hero.jpg")}" alt="${esc(t(copy, "home.headline"))}">
    <div class="hero-panel">
      <p class="kicker">${esc(t(copy, "home.kicker"))}</p>
      <h1>${esc(t(copy, "home.headline"))}</h1>
      <div class="lead">${paras(t(copy, "home.lead"))}</div>
      <div class="cta-row">
        <a class="btn btn-wa" href="${waLink(config, t(copy, "wa.prefill"))}" target="_blank" rel="noopener">${waIcon()} ${esc(t(copy, "nav.whatsapp"))}</a>
        <a class="btn btn-coral" href="${href(locale, "subscribe", depth)}">${esc(t(copy, "home.cta_sub"))}</a>
        <a class="btn btn-ghost" href="${href(locale, "simulator", depth)}">${esc(t(copy, "home.cta_sim"))}</a>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="wrap">
      <h2>${esc(t(copy, "home.for_whom_title"))}</h2>
      ${paras(t(copy, "home.for_whom_lead"))}
      <div class="shops">${shops(copy, depth)}</div>
    </div>
  </section>
  <section class="section section-alt">
    <div class="wrap">${compactSim(copy)}
      <p style="margin-top:1rem"><a href="${href(locale, "simulator", depth)}">${esc(t(copy, "home.sim_link"))}</a></p>
    </div>
  </section>
  <section class="section">
    <div class="wrap value-grid">
      <article class="value-card"><h3>${esc(t(copy, "home.value_time_title"))}</h3>${paras(t(copy, "home.value_time"))}</article>
      <article class="value-card"><h3>${esc(t(copy, "home.value_trust_title"))}</h3>${paras(t(copy, "home.value_trust"))}</article>
      <article class="value-card"><h3>${esc(t(copy, "home.value_rating_title"))}</h3>${paras(t(copy, "home.value_rating"))}</article>
    </div>
  </section>
  <section class="section">
    <div class="wrap human">
      <figure class="portrait"><img src="${asset(depth, "portraits/rosalia.jpg")}" alt="Rosalia"></figure>
      <div>
        <h2>${esc(t(copy, "home.human_title"))}</h2>
        ${paras(t(copy, "home.human"))}
        ${paras(t(copy, "home.whatsapp_line"))}
      </div>
    </div>
  </section>
  <section class="section section-alt">
    <div class="wrap">
      <h2>${esc(t(copy, "home.price_title"))}</h2>
      <div class="price-grid">
        <article class="price-card">
          <h3>${esc(t(copy, "home.price_month_name"))}</h3>
          <p class="amount">${esc(config.priceMonth)} €</p>
          ${paras(t(copy, "home.price_month_detail"))}
        </article>
        <article class="price-card featured">
          <h3>${esc(t(copy, "home.price_year_name"))} <span class="save">${esc(t(copy, "home.price_year_save"))}</span></h3>
          <p class="amount">${esc(config.priceYear)} €</p>
          ${paras(t(copy, "home.price_year_detail"))}
        </article>
      </div>
      ${paras(t(copy, "home.price_setup"))}
    </div>
  </section>
  <section class="section">
    <div class="wrap faq">
      <h2>${esc(t(copy, "home.faq_title"))}</h2>
      ${[1, 2, 3, 4, 5, 6]
        .map(
          (i) => `<details><summary>${esc(t(copy, "home.faq_" + i + "_q"))}</summary>${paras(t(copy, "home.faq_" + i + "_a"))}</details>`
        )
        .join("")}
    </div>
  </section>`;
}

function simulatorPage(locale, copy, depth) {
  return `
  <section class="wrap section">
    <h1>${esc(t(copy, "sim.headline"))}</h1>
    <div class="lead">${paras(t(copy, "sim.lead"))}</div>
    <form class="sim-card" data-sim>
      <label>${esc(t(copy, "sim.revenue"))}
        <input name="revenue" inputmode="numeric" placeholder="${esc(t(copy, "home.sim_placeholder"))}">
      </label>
      <div class="columns-2">
        <label>${esc(t(copy, "sim.kind"))}
          <select name="kind">
            <option value="any">${esc(t(copy, "sim.kind_any"))}</option>
            <option value="restaurant">${esc(t(copy, "sim.kind_restaurant"))}</option>
            <option value="bakery">${esc(t(copy, "sim.kind_bakery"))}</option>
            <option value="salon">${esc(t(copy, "sim.kind_salon"))}</option>
            <option value="florist">${esc(t(copy, "sim.kind_florist"))}</option>
            <option value="cafe">${esc(t(copy, "sim.kind_cafe"))}</option>
            <option value="workshop">${esc(t(copy, "sim.kind_workshop"))}</option>
            <option value="clinic">${esc(t(copy, "sim.kind_clinic"))}</option>
            <option value="physio">${esc(t(copy, "sim.kind_physio"))}</option>
            <option value="club">${esc(t(copy, "sim.kind_club"))}</option>
          </select>
        </label>
        <label>${esc(t(copy, "sim.reply"))}
          <select name="reply">
            <option value="0.1">${esc(t(copy, "sim.reply_never"))}</option>
            <option value="0.4">${esc(t(copy, "sim.reply_some"))}</option>
            <option value="0.75">${esc(t(copy, "sim.reply_most"))}</option>
            <option value="1">${esc(t(copy, "sim.reply_all"))}</option>
          </select>
        </label>
      </div>
      <p class="tiny" data-already hidden>${esc(t(copy, "sim.already_replying"))}</p>
      <div class="sim-cols">
        <article class="sim-col">
          <h3>${esc(t(copy, "sim.expected_label"))}</h3>
          ${paras(t(copy, "sim.expected_explain"))}
          <p class="big" data-expected-gross>—</p>
          <p class="tiny">${esc(t(copy, "sim.per_month"))}</p>
          <p>${esc(t(copy, "sim.after_month"))}</p>
          <p class="big" data-expected-month>—</p>
          <p>${esc(t(copy, "sim.after_year"))}</p>
          <p class="big" data-expected-year>—</p>
          <p>${esc(t(copy, "sim.roi_month"))}: <span data-expected-roi-month>—</span></p>
          <p>${esc(t(copy, "sim.roi_year"))}: <span data-expected-roi-year>—</span></p>
        </article>
        <article class="sim-col fullstar">
          <h3>${esc(t(copy, "sim.fullstar_label"))}</h3>
          ${paras(t(copy, "sim.fullstar_explain"))}
          <p class="big" data-full-gross>—</p>
          <p class="tiny">${esc(t(copy, "sim.per_month"))}</p>
          <p>${esc(t(copy, "sim.after_month"))}</p>
          <p class="big" data-full-month>—</p>
          <p>${esc(t(copy, "sim.after_year"))}</p>
          <p class="big" data-full-year>—</p>
        </article>
      </div>
      ${paras(t(copy, "sim.time_line"))}
      <div class="cta-row">
        <a class="btn btn-coral" href="${href(locale, "subscribe", depth)}">${esc(t(copy, "sim.cta"))}</a>
        <a class="btn btn-ghost" href="${href(locale, "research", depth)}">${esc(t(copy, "sim.research_link"))}</a>
      </div>
    </form>
  </section>`;
}

function howPage(copy, depth) {
  const steps = [
    ["step-whatsapp.jpg", "how.step1_title", "how.step1"],
    ["step-manager.jpg", "how.step2_title", "how.step2"],
    ["step-write.jpg", "how.step3_title", "how.step3"],
    ["step-recap.jpg", "how.step4_title", "how.step4"],
  ];
  return `
  <section class="wrap section">
    <h1>${esc(t(copy, "how.headline"))}</h1>
    <div class="lead">${paras(t(copy, "how.lead"))}</div>
    <div class="step-grid">
      ${steps
        .map(([img, titleKey, body], i) => {
          const { n, title } = splitStepTitle(t(copy, titleKey));
          const num = n || String(i + 1);
          return `<article class="story-card">
        <div class="story-media">
          <img src="${asset(depth, "illustrations/" + img)}" alt="${esc(title)}">
        </div>
        <div class="story-copy">
          <p class="story-num">${esc(num)}</p>
          <h3>${esc(title)}</h3>
          ${paras(t(copy, body))}
        </div>
      </article>`;
        })
        .join("")}
    </div>
    <div class="note" style="margin-top:1.5rem">${paras(t(copy, "how.ai_box"))}${paras(t(copy, "how.whatsapp"))}</div>
  </section>`;
}

function researchPage(copy) {
  return `
  <section class="wrap section research prose">
    <h1>${esc(t(copy, "research.headline"))}</h1>
    <div class="lead">${paras(t(copy, "research.lead"))}</div>
    <article><h2>${esc(t(copy, "research.luca_title"))}</h2>${paras(t(copy, "research.luca"))}</article>
    <article><h2>${esc(t(copy, "research.womply_title"))}</h2>${paras(t(copy, "research.womply"))}</article>
    <article><h2>${esc(t(copy, "research.bright_title"))}</h2>${paras(t(copy, "research.bright"))}</article>
    <article><h2>${esc(t(copy, "research.formula_title"))}</h2>${paras(t(copy, "research.formula"))}</article>
    <article>${paras(t(copy, "research.what_we_use"))}</article>
  </section>`;
}

function aboutPage(copy, depth) {
  return `
  <section class="wrap section">
    <h1>${esc(t(copy, "about.headline"))}</h1>
    <div class="lead">${paras(t(copy, "about.lead"))}</div>
    <div class="team-grid">
      <article>
        <figure class="portrait"><img src="${asset(depth, "portraits/rosalia.jpg")}" alt="Rosalia"></figure>
        <h2>${esc(t(copy, "about.rosalia_role"))}</h2>
        ${paras(t(copy, "about.rosalia"))}
      </article>
      <article>
        <figure class="portrait"><img src="${asset(depth, "portraits/ben.jpg")}" alt="Benjamin Pommeraud"></figure>
        <h2>${esc(t(copy, "about.ben_role"))}</h2>
        ${paras(t(copy, "about.ben"))}
      </article>
    </div>
    <div class="note" style="margin-top:2rem">
      <h2>${esc(t(copy, "about.human_title"))}</h2>
      ${paras(t(copy, "about.human"))}
      ${paras(t(copy, "about.whatsapp"))}
    </div>
  </section>`;
}

function subscribePage(locale, copy, config, depth) {
  return `
  <section class="wrap section">
    <h1>${esc(t(copy, "sub.headline"))}</h1>
    <div class="lead">${paras(t(copy, "sub.lead"))}</div>
    <div class="price-grid">
      <article class="price-card"><h3>${esc(t(copy, "home.price_month_name"))}</h3><p class="amount">${esc(config.priceMonth)} €</p><p>${esc(t(copy, "sub.month"))}</p></article>
      <article class="price-card featured"><h3>${esc(t(copy, "home.price_year_name"))}</h3><p class="amount">${esc(config.priceYear)} €</p><p>${esc(t(copy, "sub.year"))}</p></article>
    </div>
    <p class="cta-row" style="margin:1.25rem 0 0">
      <a class="btn btn-wa" href="${waLink(config, t(copy, "wa.prefill"))}" target="_blank" rel="noopener">${waIcon()} ${esc(t(copy, "sub.cta_wa"))}</a>
    </p>
    <form class="sim-card form-grid" data-interest-form data-wa="" data-mail="${esc(config.email)}" style="margin-top:1.5rem">
      <label>${esc(t(copy, "sub.form_name"))}<input name="business" required></label>
      <label>${esc(t(copy, "sub.form_city"))}<input name="city"></label>
      <label>${esc(t(copy, "sub.form_listing"))}<input name="listing"></label>
      <label>${esc(t(copy, "sub.form_email"))}<input name="email" type="email" required></label>
      <label>${esc(t(copy, "sub.form_wa"))}<input name="whatsapp"></label>
      <label>${esc(t(copy, "sub.form_revenue"))}<input name="revenue" inputmode="numeric"></label>
      <label>${esc(t(copy, "sub.form_plan"))}
        <select name="plan">
          <option value="month">${esc(t(copy, "sub.plan_month"))}</option>
          <option value="year">${esc(t(copy, "sub.plan_year"))}</option>
        </select>
      </label>
      <div class="cta-row">
        <button class="btn btn-ghost" name="channel" value="email" type="submit">${esc(t(copy, "sub.cta_email"))}</button>
      </div>
    </form>
    ${paras(t(copy, "sub.after"))}
  </section>`;
}

function accountPage(locale, copy, config, depth) {
  const wa = waLink(config, "BAJA");
  return `
  <section class="wrap section prose">
    <h1>${esc(t(copy, "account.headline"))}</h1>
    <div class="lead">${paras(t(copy, "account.lead"))}</div>
    <h2>${esc(t(copy, "account.contacts_title"))}</h2>
    ${paras(t(copy, "account.contacts"))}
    <h2>${esc(t(copy, "account.invoices_title"))}</h2>
    ${paras(t(copy, "account.invoices"))}
    <h2>${esc(t(copy, "account.pay_title"))}</h2>
    ${paras(t(copy, "account.pay"))}
    <h2>${esc(t(copy, "account.cancel_title"))}</h2>
    ${paras(t(copy, "account.cancel"))}
    <h2>${esc(t(copy, "account.listing_title"))}</h2>
    ${paras(t(copy, "account.listing"))}
    <p><a class="btn btn-coral" href="${wa}">${esc(t(copy, "account.cta_cancel"))}</a></p>
  </section>`;
}

function legalPage(copy, headKey, bodyKey) {
  return `<section class="wrap section prose"><h1>${esc(t(copy, headKey))}</h1>${paras(t(copy, bodyKey))}</section>`;
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function pagePath(locale, page) {
  const slug = LOCALES[locale].slugs[page];
  return slug ? join(outDir, locale, slug, "index.html") : join(outDir, locale, "index.html");
}

const config = JSON.parse(readFileSync(join(contentDir, "config.json"), "utf8"));
const css = readFileSync(join(srcDir, "styles.css"), "utf8");
const js = readFileSync(join(srcDir, "site.js"), "utf8");

mkdirSync(join(outDir, "css"), { recursive: true });
mkdirSync(join(outDir, "js"), { recursive: true });
writeFileSync(join(outDir, "css", "site.css"), css);
writeFileSync(join(outDir, "js", "site.js"), js);
if (existsSync(assetDir)) {
  cpSync(assetDir, join(outDir, "assets"), { recursive: true });
  for (const extra of ["portraits/rosalia-source.jpg", "portraits/ben-source.png"]) {
    const p = join(outDir, "assets", extra);
    try {
      unlinkSync(p);
    } catch {}
  }
}
writeFileSync(join(outDir, "CNAME"), "www.babyrock.ai\n");
writeFileSync(join(outDir, ".nojekyll"), "");
writeFileSync(
  join(outDir, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`
);
const indexable = ["home", "simulator", "how", "research", "about", "subscribe", "privacy", "terms"];
const sitemapUrls = Object.keys(LOCALES).flatMap((locale) =>
  indexable.map((page) => `  <url><loc>${absUrl(locale, page)}</loc></url>`)
);
writeFileSync(
  join(outDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`
);

for (const locale of Object.keys(LOCALES)) {
  const copy = parseMd(readFileSync(join(contentDir, `${locale}.md`), "utf8"));
  const pages = {
    home: { depth: 1, body: homePage(locale, copy, config, 1) },
    simulator: { depth: 2, body: simulatorPage(locale, copy, 2) },
    how: { depth: 2, body: howPage(copy, 2) },
    research: { depth: 2, body: researchPage(copy) },
    about: { depth: 2, body: aboutPage(copy, 2) },
    subscribe: { depth: 2, body: subscribePage(locale, copy, config, 2) },
    account: { depth: 2, body: accountPage(locale, copy, config, 2) },
    privacy: { depth: 2, body: legalPage(copy, "privacy.headline", "privacy.body") },
    terms: { depth: 2, body: legalPage(copy, "terms.headline", "terms.body") },
  };
  for (const [page, meta] of Object.entries(pages)) {
    write(
      pagePath(locale, page),
      shell({
        locale,
        page,
        copy,
        config,
        depth: meta.depth,
        title: t(copy, "meta.title"),
        description: t(copy, "meta.description"),
        body: meta.body,
      })
    );
  }
}

write(
  join(outDir, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>BabyRock Social</title>
  <meta name="description" content="Thoughtful Google review replies for small businesses. From €89/month.">
  <link rel="canonical" href="${SITE}/en/">
  <link rel="alternate" hreflang="en" href="${SITE}/en/">
  <link rel="alternate" hreflang="es" href="${SITE}/es/">
  <link rel="alternate" hreflang="ca" href="${SITE}/ca/">
  <link rel="alternate" hreflang="fr" href="${SITE}/fr/">
  <link rel="alternate" hreflang="x-default" href="${SITE}/en/">
  <meta http-equiv="refresh" content="0;url=/en/">
</head>
<body>
  <p><a href="/en/">English</a> · <a href="/es/">Español</a> · <a href="/ca/">Català</a> · <a href="/fr/">Français</a></p>
<script>
const map = {es:"es",ca:"ca",fr:"fr",en:"en"};
const lang = (navigator.languages || [navigator.language || "en"]).map(l => l.slice(0,2).toLowerCase());
const hit = lang.find(l => map[l]) || "en";
location.replace("./" + hit + "/");
</script>
</body>
</html>`
);

console.log("Built static site into docs/");
