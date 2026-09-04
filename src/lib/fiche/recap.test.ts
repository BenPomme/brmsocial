import assert from "node:assert/strict";
import { test } from "node:test";
import { composeWeeklyBody, dailyFicheLines, isCerradoIntent, weeklyFicheLines } from "./recap";

test("weekly recap omits calls and vanished when unknown", () => {
  const lines = weeklyFicheLines({
    rating: 4.6,
    ratingCount: 212,
    ratingDelta: 0.02,
    ratingCountDelta: 3,
    vanishedCount: null,
    calls: null,
    directionRequests: null,
    suggestedEdits: null,
    changes: [],
    upcomingHoliday: null,
  });
  assert.deepEqual(lines, ["Nota Google: 4.60 (212 reseñas) — esta semana: nota +0.02, +3 reseñas"]);
  assert.equal(lines.some((l) => /llamad/i.test(l)), false);
  assert.equal(lines.some((l) => /retirado/i.test(l)), false);
});

test("weekly recap omits everything when Google gave nothing", () => {
  const lines = weeklyFicheLines({
    rating: null,
    ratingCount: null,
    ratingDelta: null,
    ratingCountDelta: null,
    vanishedCount: null,
    calls: null,
    directionRequests: null,
    suggestedEdits: null,
    changes: [],
    upcomingHoliday: null,
  });
  assert.deepEqual(lines, []);
  assert.equal(composeWeeklyBody("Bar X", [], lines), null);
});

test("calls line only when both-or-one actually measured", () => {
  const onlyCalls = weeklyFicheLines({
    rating: null,
    ratingCount: null,
    ratingDelta: null,
    ratingCountDelta: null,
    vanishedCount: null,
    calls: 32,
    directionRequests: null,
    suggestedEdits: null,
    changes: [],
    upcomingHoliday: null,
  });
  assert.deepEqual(onlyCalls, ["32 llamadas desde la ficha."]);
});

test("vanished count 0 is silent", () => {
  const lines = weeklyFicheLines({
    rating: null,
    ratingCount: null,
    ratingDelta: null,
    ratingCountDelta: null,
    vanishedCount: 0,
    calls: null,
    directionRequests: null,
    suggestedEdits: null,
    changes: [],
    upcomingHoliday: null,
  });
  assert.deepEqual(lines, []);
});

test("daily shield pings hours change and holiday, not a fake insights line", () => {
  const lines = dailyFicheLines({
    changes: [{ field: "hours", before: "lunes 9–18", after: "lunes 9–14" }],
    suggestedEdits: null,
    upcomingHoliday: { date: "2026-09-11", name: "Diada", mapsOpen: true },
  });
  assert.equal(lines[0].includes("horario"), true);
  assert.equal(lines[1].includes("CERRADO"), true);
  assert.equal(lines.some((l) => /llamad/i.test(l)), false);
});

test("CERRADO intent does not look like a 1–3★ reply", () => {
  assert.equal(isCerradoIntent("CERRADO"), true);
  assert.equal(isCerradoIntent("cerrado el lunes"), true);
  assert.equal(isCerradoIntent("OK"), false);
  assert.equal(isCerradoIntent("El camarero fue grosero"), false);
});
