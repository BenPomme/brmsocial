import assert from "node:assert/strict";
import { test } from "node:test";
import { formatTtcSpeech, quoteFor } from "./catalog";
import { PRODUCTS } from "./products";
import { SKUS } from "./skus";

test("speech labels follow SKU cents", () => {
  const q = quoteFor({});
  assert.equal(q.monthTtc, SKUS.avis_month.ttc);
  assert.equal(q.yearTtc, SKUS.avis_year.ttc);
  assert.equal(q.monthLabel, formatTtcSpeech(SKUS.avis_month.ttc));
  assert.equal(q.yearLabel, formatTtcSpeech(SKUS.avis_year.ttc));
  assert.match(SKUS.avis_month.description, new RegExp(q.monthLabel.replace(" €", "\\s*€")));
  assert.match(SKUS.avis_year.description, new RegExp(q.yearLabel.replace(" €", "\\s*€")));
});

test("unknown city is 99 €, not the Sant Cugat free month", () => {
  const q = quoteFor({ city: "Barcelona" });
  assert.equal(q.offer, null);
  assert.equal(q.monthLabel, "99 €");
  assert.match(q.cityHintLines.es, /Sant Cugat/);
  assert.equal(q.offerLines.es, "");
});

test("Sant Cugat from city or inbound unlocks 0 € first month", () => {
  const byCity = quoteFor({ city: "Sant Cugat del Vallès" });
  assert.equal(byCity.offer?.id, "santcugat_trial");
  assert.match(byCity.offerLines.ca, /0 €/);
  const byChat = quoteFor({ inbound: "Tinc una floristeria a Sant Cugat" });
  assert.ok(byChat.offer);
});

test("Direct and Pack are coming soon, not live SKUs", () => {
  const q = quoteFor({});
  assert.equal(PRODUCTS.direct.status, "coming_soon");
  assert.ok(q.comingSoon.some((p) => p.id === "direct"));
  assert.equal(q.productId, "social");
});
