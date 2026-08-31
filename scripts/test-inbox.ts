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

import { ingestInbound } from "../src/lib/inbox";
import { syncZohoInbox } from "../src/lib/zoho-inbox";
import { prisma } from "../src/lib/db";

async function main() {
  const sim = await ingestInbound({
    channel: "whatsapp",
    counterparty: "34600111222",
    body: "OK",
    providerId: "sim-test-ok-1",
  });
  console.log("sim", sim);
  try {
    const z = await syncZohoInbox();
    console.log("zoho", z);
  } catch (e) {
    console.log("zoho_err", e instanceof Error ? e.message : e);
  }
  console.log("threads", await prisma.inboxThread.count());
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
