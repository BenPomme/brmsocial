import { readFileSync } from "node:fs";
import { resolve } from "node:path";

for (const line of readFileSync(resolve(process.cwd(), ".env"), "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq < 0) continue;
  const k = trimmed.slice(0, eq).trim();
  let v = trimmed.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (!process.env[k]) process.env[k] = v;
}

import { scoutCityTargets } from "../src/lib/agents/scout-targets";
import { PlacesError } from "../src/lib/places";

const city = process.argv.slice(2).join(" ").trim() || "Sant Cugat del Vallès";

function printReport(report: Awaited<ReturnType<typeof scoutCityTargets>>) {
  console.log("");
  console.log(`Scout Places — ${report.city} / ${report.category}`);
  console.log(`Fiches renvoyées par Text Search : ${report.queried}. Détails lus : ${report.detailed}.`);
  console.log(`keep ${report.keep} · maybe ${report.maybe} · skip ${report.skip}`);
  console.log("");
  for (const t of report.targets) {
    const stars = t.rating != null ? `${t.rating}★` : "n/a";
    const n = t.userRatingCount != null ? `${t.userRatingCount} avis` : "? avis";
    console.log(`— ${t.verdict.toUpperCase()}  ${t.name}  (${stars}, ${n})`);
    if (t.address) console.log(`  ${t.address}`);
    if (t.mapsUri) console.log(`  ${t.mapsUri}`);
    for (const r of t.reasons) console.log(`  · ${r}`);
    console.log("");
  }
  if (report.errors.length) {
    console.log("Erreurs :");
    for (const e of report.errors) console.log("  ", e);
  }
}

async function main() {
  try {
    const report = await scoutCityTargets({
      city,
      country: "ES",
      categoryLabel: "Restaurant",
      includedType: "restaurant",
      pageSize: 12,
      maxDetails: 12,
    });
    printReport(report);
  } catch (e) {
    if (e instanceof PlacesError) {
      console.error("Places a refusé l’appel.");
      console.error(e.message);
      if (e.body.includes("SERVICE_DISABLED") || e.body.includes("has not been used")) {
        console.error("");
        console.error("La clé est bonne. Places API (New) n’est pas activée sur le projet de cette clé.");
        console.error("Clique Enable, attends 1–2 min, relance :");
        console.error("  https://console.developers.google.com/apis/api/places.googleapis.com/overview?project=961719338050");
      }
      process.exit(1);
    }
    throw e;
  }
}

main();
