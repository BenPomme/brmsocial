import assert from "node:assert/strict";
import { test } from "node:test";
import { holidaysForYear, regionForCity } from "./holidays";

test("Sant Cugat uses Catalunya extras including Diada", () => {
  assert.equal(regionForCity("Sant Cugat del Vallès", "ES"), "CT");
  const dates = holidaysForYear(2026, "CT").map((h) => h.date);
  assert.equal(dates.includes("2026-09-11"), true);
  assert.equal(dates.includes("2026-06-24"), true);
});

test("Madrid does not get Diada", () => {
  assert.equal(regionForCity("Madrid", "ES"), "ES");
  const dates = holidaysForYear(2026, "ES").map((h) => h.date);
  assert.equal(dates.includes("2026-09-11"), false);
  assert.equal(dates.includes("2026-01-01"), true);
});

test("mapsOpenOnDate is unknown without 7 weekday lines", async () => {
  const { mapsOpenOnDate } = await import("./holidays");
  assert.equal(mapsOpenOnDate(["Monday: 9–18"], "2026-09-11"), null);
  const week = [
    "Monday: Closed",
    "Tuesday: 9–18",
    "Wednesday: 9–18",
    "Thursday: 9–18",
    "Friday: 9–18",
    "Saturday: 9–14",
    "Sunday: Closed",
  ];
  assert.equal(mapsOpenOnDate(week, "2026-09-07"), false);
  assert.equal(mapsOpenOnDate(week, "2026-09-08"), true);
});
