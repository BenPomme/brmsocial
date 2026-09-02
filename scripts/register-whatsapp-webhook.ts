import { readFileSync, existsSync } from "node:fs";
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

function publicBase(): string {
  const fromArg = process.argv[2]?.trim();
  if (fromArg) return fromArg.replace(/\/$/, "");
  if (process.env.PAY_PUBLIC_URL?.trim()) return process.env.PAY_PUBLIC_URL.trim().replace(/\/$/, "").replace(/\/pay$/i, "");
  const tunnelFile = resolve(process.cwd(), ".tunnel-url");
  if (existsSync(tunnelFile)) {
    const t = readFileSync(tunnelFile, "utf8").trim().replace(/\/$/, "");
    if (t.startsWith("https://")) return t;
  }
  throw new Error("No public URL. Pass it: npx tsx scripts/register-whatsapp-webhook.ts https://YOUR-HOST");
}

async function main() {
  const token = process.env.WHATSAPP_TOKEN?.trim();
  const waba = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID?.trim();
  const verify = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (!token || !waba || !verify) {
    throw new Error("WHATSAPP_TOKEN / WHATSAPP_BUSINESS_ACCOUNT_ID / WHATSAPP_VERIFY_TOKEN missing");
  }
  const base = publicBase();
  const callback = `${base}/api/webhooks/whatsapp`;

  const verifyRes = await fetch(
    `${callback}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verify)}&hub.challenge=boot-check`,
  );
  const verifyBody = await verifyRes.text();
  if (!verifyRes.ok || verifyBody.trim() !== "boot-check") {
    throw new Error(`Webhook GET verify failed ${verifyRes.status}: ${verifyBody.slice(0, 200)}`);
  }

  const graph = `https://graph.facebook.com/v21.0/${waba}/subscribed_apps`;
  const res = await fetch(graph, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      override_callback_uri: callback,
      verify_token: verify,
    }),
  });
  const json = (await res.json()) as { success?: boolean; error?: { message?: string } };
  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Graph subscribed_apps ${res.status}`);
  }
  console.log("whatsapp webhook registered:", callback);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
