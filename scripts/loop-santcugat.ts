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

import { prisma } from "../src/lib/db";
import { runScout } from "../src/lib/agents/scout";
import { runInspect, type InspectVerdict } from "../src/lib/agents/inspect";

const CITY = "Sant Cugat del Vallès";
const COUNTRY = "ES" as const;

const VERDICT_LABEL: Record<InspectVerdict, string> = {
  orphan: "ne répond pas",
  partial: "répond en partie",
  replies: "répond",
  no_recent: "pas d'avis 6 mois",
  no_reviews: "aucun avis",
  error: "erreur",
};

async function ensureScope() {
  const city = await prisma.scopeCity.upsert({
    where: { name_country: { name: CITY, country: COUNTRY } },
    update: { active: true, source: "admin" },
    create: { name: CITY, country: COUNTRY, active: true, source: "admin" },
  });
  const category = await prisma.scopeCategory.upsert({
    where: { slug: "restaurant" },
    update: { active: true, label: "Restaurant", placesType: "restaurant" },
    create: {
      slug: "restaurant",
      label: "Restaurant",
      placesType: "restaurant",
      active: true,
      source: "admin",
    },
  });
  return { city, category };
}

function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function main() {
  const { city, category } = await ensureScope();
  console.log(`Scope on : ${city.name} (${city.country}) × ${category.slug}`);
  console.log("1/2 Scout Places — restaurants…");

  const scout = await runScout({
    cityId: city.id,
    categoryId: category.id,
    maxPlaces: 20,
    maxDetails: 20,
    skipDraft: true,
  });
  console.log(
    `   ${scout.places} fiches, ${scout.newAvis} extraits Places (ignorés pour Inspect). Erreurs: ${scout.errors.length}`,
  );
  if (scout.errors.length) {
    for (const e of scout.errors) console.log("   ", e);
  }
  for (const s of scout.sample) {
    console.log(`   · ${s.name}  (${s.reviews} extraits Places)`);
  }

  console.log("2/2 Inspect DataForSEO — avis 6 mois + owner_answer…");
  const inspect = await runInspect({ city: CITY, maxLeads: 20 });
  console.log(
    `   ${inspect.leads} leads, coût ${inspect.costUsd} $, fenêtre ${inspect.months} mois depuis ${inspect.since ?? "?"}`,
  );
  console.log(
    `   orphelins ${inspect.orphan} · partiels ${inspect.partial} · répondent ${inspect.replies} · sans avis récent ${inspect.no_recent}`,
  );
  if (inspect.errors.length) {
    console.log("   Erreurs Inspect :");
    for (const e of inspect.errors) console.log("   ", e);
  }

  console.log("");
  console.log(
    pad("verdict", 18) +
      pad("6m", 6) +
      pad("ok", 6) +
      pad("orphelins", 10) +
      pad("note", 6) +
      "nom",
  );
  for (const row of inspect.rows) {
    const v = VERDICT_LABEL[row.verdict] ?? row.verdict;
    const trunc = row.truncated ? "*" : " ";
    console.log(
      pad(v + trunc, 18) +
        pad(String(row.reviews6m), 6) +
        pad(String(row.replied6m), 6) +
        pad(String(row.unreplied6m), 10) +
        pad(row.rating != null ? String(row.rating) : "—", 6) +
        row.name,
    );
  }

  const pitch = inspect.rows.filter((r) => r.verdict === "orphan" || r.verdict === "partial");
  console.log("");
  console.log(`Cibles pitch (reçoivent des avis, laissent des orphelins) : ${pitch.length}`);
  for (const row of pitch) {
    const rate =
      row.reviews6m > 0 ? Math.round((row.replied6m / row.reviews6m) * 100) : 0;
    console.log(
      `— ${row.name}  ${row.reviews6m} avis / 6 mois, ${row.unreplied6m} sans réponse (répond à ${rate}%)`,
    );
    if (row.mapsUri) console.log(`  ${row.mapsUri}`);
    for (const s of row.sampleOrphans.slice(0, 3)) {
      const when = s.at ? s.at.slice(0, 10) : "?";
      console.log(`  · ${s.stars}★ ${when} ${s.author ?? ""} — ${s.excerpt || "(sans texte)"}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
