import assert from "node:assert/strict";
import { test } from "node:test";
import { diffFiche, vanishedIds } from "./diff";
import type { FicheLive } from "./types";

function live(p: Partial<FicheLive>): FicheLive {
  return {
    source: "places",
    name: "Bar X",
    phone: "+34 600",
    address: "Carrer 1",
    hours: { weekdayDescriptions: ["Monday: 9–18"] },
    businessStatus: "OPERATIONAL",
    rating: 4.6,
    ratingCount: 10,
    reviewIds: null,
    calls: null,
    directionRequests: null,
    suggestedEdits: null,
    ...p,
  };
}

test("first snapshot is not a change", () => {
  assert.deepEqual(diffFiche(null, live({})), []);
});

test("hours change is a shield event; rating change is not", () => {
  const prev = live({});
  const next = live({
    hours: { weekdayDescriptions: ["Monday: 9–14"] },
    rating: 4.7,
    ratingCount: 12,
  });
  const d = diffFiche(prev, next);
  assert.deepEqual(
    d.map((x) => x.field),
    ["hours"],
  );
});

test("vanished ids stay unknown when the live list is incomplete", () => {
  assert.equal(vanishedIds(["a", "b"], null), null);
});

test("vanished ids are only those missing from a complete live list", () => {
  assert.deepEqual(vanishedIds(["a", "b", "c"], ["a", "c"]), ["b"]);
});
