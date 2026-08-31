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
import { enqueueAndRun } from "../src/lib/jobs";

const CITY = "Sant Cugat del Vallès";
const PREFER = process.argv.slice(2).join(" ").trim() || "Picuteig";

async function main() {
  const lead =
    (await prisma.lead.findFirst({
      where: { city: CITY, name: { contains: PREFER, mode: "insensitive" } },
    })) ??
    (await prisma.lead.findFirst({
      where: { city: CITY, inspectVerdict: "orphan", userRatingCount: { gt: 50 } },
      orderBy: { inspectUnreplied6m: "desc" },
    }));

  if (!lead) {
    console.error("No Sant Cugat lead found. Run scout + inspect first.");
    process.exitCode = 1;
    return;
  }

  console.log(`Cible : ${lead.name}`);
  console.log(`Avis Maps : ${lead.userRatingCount} · 6m sans réponse : ${lead.inspectUnreplied6m} · verdict : ${lead.inspectVerdict}`);
  console.log("Carrier compose (send=false, OUTBOUND_ENABLED=false)…");

  const run = await enqueueAndRun("carrier", {
    source: "manual",
    city: CITY,
    leadId: lead.id,
    maxLeads: 1,
    send: false,
  });

  if (run.error) {
    console.error("Job error:", run.error);
    process.exitCode = 1;
    return;
  }

  const result = run.result as {
    sent?: number;
    rows?: Array<{
      name: string;
      to: string | null;
      from: string;
      subject: string;
      body: string;
      websiteUri: string | null;
      emailsFound: string[];
      skipped: string | null;
    }>;
  };
  const row = result.rows?.[0];
  console.log(`job ${run.jobId}  sent=${result.sent ?? 0}`);
  if (!row) {
    console.log("Pas de ligne composée.");
    return;
  }
  if (row.skipped) {
    console.log(`SKIP : ${row.skipped}`);
    console.log(`Site : ${row.websiteUri ?? "—"}`);
    console.log(`Emails vus : ${row.emailsFound.join(", ") || "—"}`);
    return;
  }
  console.log("");
  console.log(`From: ${row.from}`);
  console.log(`To:   ${row.to}`);
  console.log(`Site: ${row.websiteUri}`);
  console.log(`Subject: ${row.subject}`);
  console.log("");
  console.log(row.body);
  console.log("");
  console.log("Rien n’a été envoyé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
