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

import { listZohoAccounts, outreachAllowlist, sendZohoMail, ZohoMailError } from "../src/lib/zoho-mail";

async function main() {
  const allow = outreachAllowlist();
  console.log("allowlist:", allow.join(", ") || "(empty)");
  console.log("1/2 refresh token + list accounts…");
  const { accounts } = await listZohoAccounts();
  console.log(
    "mailboxes:",
    accounts.map((a) => a.mailboxAddress ?? a.primaryEmailAddress ?? a.accountId).join(" | ") || "(none)",
  );
  const to = allow[0];
  if (!to) {
    console.error("OUTREACH_ALLOWLIST is empty");
    process.exitCode = 1;
    return;
  }
  console.log(`2/2 send test to ${to} only…`);
  const sent = await sendZohoMail({
    to,
    subject: "Test Babyrock — responde OK",
    mailFormat: "plaintext",
    content: [
      "Hola Benjamin,",
      "",
      "Ceci est le test d'envoi depuis rosalia@babyrock.ai (Zoho Mail API, EU).",
      "Réponds simplement OK à ce mail, pour qu'on teste la lecture automatique ensuite.",
      "",
      "Rien n'a été envoyé à un restaurant.",
      "",
      "Rosalia",
      "Babyrock Social",
    ].join("\n"),
  });
  console.log("from:", sent.from);
  console.log("to:", sent.to);
  console.log("mailbox:", sent.mailbox);
  console.log("messageId:", sent.messageId ?? "(none)");
  console.log("mailId:", sent.mailId ?? "(none)");
}

main().catch((e) => {
  if (e instanceof ZohoMailError) {
    console.error("ZohoMailError:", e.message);
    if (e.body) console.error("body:", e.body.slice(0, 500));
  } else {
    console.error(e);
  }
  process.exitCode = 1;
});
