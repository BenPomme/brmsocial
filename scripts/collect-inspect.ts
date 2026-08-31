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
import { collectInspectReady, type InspectVerdict } from "../src/lib/agents/inspect";

const CITY = "Sant Cugat del Vallès";
const VERDICT_LABEL: Record<InspectVerdict, string> = {
  orphan: "ne répond pas",
  partial: "répond en partie",
  replies: "répond",
  no_recent: "pas d'avis 6 mois",
  no_reviews: "aucun avis",
  error: "erreur",
};

function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function main() {
  let lastReady = 0;
  let report = await collectInspectReady({ city: CITY });
  console.log(`tasks_ready=${report.readyIds} matched=${report.leads}`);

  for (let i = 0; i < 12 && report.leads < 20; i++) {
    lastReady = report.readyIds;
    console.log(`  wait 8s (try ${i + 1}/12) ready=${report.readyIds} saved=${report.leads}`);
    await sleep(8000);
    report = await collectInspectReady({ city: CITY });
    if (report.leads > 0 && report.readyIds === 0 && lastReady === 0) {
      // already drained; check DB
      break;
    }
  }

  const leads = await prisma.lead.findMany({
    where: { city: CITY },
    orderBy: { inspectUnreplied6m: "desc" },
  });
  console.log("");
  console.log(
    pad("verdict", 18) + pad("6m", 6) + pad("ok", 6) + pad("orphelins", 10) + pad("note", 6) + "nom",
  );
  for (const lead of leads) {
    const v = (lead.inspectVerdict as InspectVerdict | null) ?? "error";
    const label = VERDICT_LABEL[v] ?? v;
    console.log(
      pad(label, 18) +
        pad(String(lead.inspectReviews6m ?? "—"), 6) +
        pad(String(lead.inspectReplied6m ?? "—"), 6) +
        pad(String(lead.inspectUnreplied6m ?? "—"), 10) +
        pad(lead.rating != null ? String(lead.rating) : "—", 6) +
        lead.name,
    );
  }

  const pitch = leads.filter(
    (l) => l.inspectVerdict === "orphan" || l.inspectVerdict === "partial",
  );
  console.log("");
  console.log(`Cibles pitch : ${pitch.length}  (collect errors ${report.errors.length})`);
  for (const e of report.errors.slice(0, 20)) console.log("  ", e);
  for (const row of pitch) {
    const reviews = row.inspectReviews6m ?? 0;
    const replied = row.inspectReplied6m ?? 0;
    const unreplied = row.inspectUnreplied6m ?? 0;
    const rate = reviews > 0 ? Math.round((replied / reviews) * 100) : 0;
    console.log(
      `— ${row.name}  ${reviews} avis / 6 mois, ${unreplied} sans réponse (répond à ${rate}%)`,
    );
    if (row.mapsUri) console.log(`  ${row.mapsUri}`);
    const sample = Array.isArray(row.inspectSample) ? row.inspectSample : [];
    for (const s of sample.slice(0, 3) as Array<{
      stars?: number;
      at?: string | null;
      author?: string | null;
      excerpt?: string;
    }>) {
      const when = s.at ? String(s.at).slice(0, 10) : "?";
      console.log(`  · ${s.stars ?? "?"}★ ${when} ${s.author ?? ""} — ${s.excerpt || "(sans texte)"}`);
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
