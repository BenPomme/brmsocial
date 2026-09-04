/**
 * Walks operator + client gates against the running app.
 * Uses one throwaway proto client; deletes it at the end.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const BASE = process.env.BASE_URL ?? "http://localhost:3001";

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const setCookie = res.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];
  const json = await res.json();
  if (!res.ok) throw new Error(`login ${email}: ${JSON.stringify(json)}`);
  return cookie;
}

async function api(cookie: string, path: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      cookie,
      "Content-Type": "application/json",
    },
  });
  const text = await res.text();
  let json: unknown = text;
  try {
    json = JSON.parse(text);
  } catch {
    /* html */
  }
  return { status: res.status, json };
}

const fullChecklist = {
  detail_in_review: true,
  no_person_name: true,
  no_health_invented: true,
  no_commercial_gesture: true,
  language_matches: true,
};

async function main() {
  const admin = await login("admin@babyrock.local", "proto-admin");
  const ops = await login("ops@babyrock.local", "proto-ops");
  const client = await login("client@babyrock.local", "proto-client");

  const forbidden = await api(ops, "/api/admin/scope");
  if (forbidden.status !== 403) throw new Error(`ops admin api expected 403, got ${forbidden.status}`);

  const html403 = await api(ops, "/admin");
  if (html403.status !== 403) {
    console.warn(`ops /admin HTTP ${html403.status} (want 403)`);
  }

  const cat = await prisma.scopeCategory.upsert({
    where: { slug: "restaurant" },
    update: {},
    create: { slug: "restaurant", label: "Restaurant", placesType: "restaurant", active: true, source: "admin" },
  });
  const shop = await prisma.client.create({
    data: {
      name: "Casa Verify (proto)",
      city: "Barcelona",
      country: "ES",
      status: "proto",
      categoryId: cat.id,
      publishLive: false,
      placeId: `verify-${Date.now()}`,
    },
  });
  const five = await prisma.avis.create({
    data: {
      clientId: shop.id,
      googleReviewId: `verify-5-${Date.now()}`,
      stars: 5,
      lang: "es",
      authorPublicName: "Marta",
      body: "La paella estaba excelente y el servicio muy atento.",
      status: "brouillon",
    },
  });
  await prisma.reponse.create({
    data: {
      avisId: five.id,
      version: 1,
      draftModel: "template",
      draftText: "Gracias Marta por tu comentario. Nos alegra que menciones la paella.",
      actor: "agent",
    },
  });
  const two = await prisma.avis.create({
    data: {
      clientId: shop.id,
      googleReviewId: `verify-2-${Date.now()}`,
      stars: 2,
      lang: "es",
      authorPublicName: "Pau",
      body: "La espera fue eterna y el pescado frío.",
      status: "attente_client",
    },
  });
  await prisma.reponse.create({
    data: {
      avisId: two.id,
      version: 1,
      draftModel: "template",
      draftText: "Hola Pau. Hemos leído tu comentario sobre la espera.",
      actor: "agent",
    },
  });
  await prisma.messageWhatsapp.create({
    data: {
      clientId: shop.id,
      avisId: two.id,
      direction: "sim",
      body: "Avis 2★ de Pau\n«La espera fue eterna.»\nRépondez OK ou envoyez le texte.",
      providerMsgId: `sim:ping:${two.id}`,
    },
  });

  const noCheck = await api(ops, `/api/operator/avis/${five.id}/publish`, {
    method: "POST",
    body: JSON.stringify({ checklist: {} }),
  });
  if (noCheck.status !== 400) throw new Error(`publish without checklist should 400, got ${noCheck.status} ${JSON.stringify(noCheck.json)}`);

  const low = await api(ops, `/api/operator/avis/${two.id}/publish`, {
    method: "POST",
    body: JSON.stringify({ checklist: fullChecklist }),
  });
  if (low.status !== 400) throw new Error(`1-3 publish before OK should 400, got ${low.status}`);

  const ok = await api(client, `/api/client/thread/${shop.id}`, {
    method: "POST",
    body: JSON.stringify({ text: "OK", avisId: two.id }),
  });
  if (ok.status !== 200) throw new Error(`client OK failed ${ok.status} ${JSON.stringify(ok.json)}`);

  const twoAfter = await prisma.avis.findUnique({ where: { id: two.id } });
  if (twoAfter?.status !== "pret") throw new Error(`expected pret, got ${twoAfter?.status}`);

  const pub5 = await api(ops, `/api/operator/avis/${five.id}/publish`, {
    method: "POST",
    body: JSON.stringify({ checklist: fullChecklist }),
  });
  if (pub5.status !== 200) throw new Error(`5★ publish failed ${pub5.status} ${JSON.stringify(pub5.json)}`);
  const fiveAfter = await prisma.avis.findUnique({ where: { id: five.id } });
  if (fiveAfter?.status !== "publie") throw new Error(`expected publie, got ${fiveAfter?.status}`);
  const payload = (pub5.json as { reason?: string; dryRun?: boolean }).reason;
  if (!payload || !/dry-run|not_implemented/i.test(payload)) {
    console.log("publish payload", pub5.json);
  }

  const pub2 = await api(ops, `/api/operator/avis/${two.id}/publish`, {
    method: "POST",
    body: JSON.stringify({ checklist: fullChecklist }),
  });
  if (pub2.status !== 200) throw new Error(`2★ after OK should publish, got ${pub2.status} ${JSON.stringify(pub2.json)}`);

  const { refuseOutbound } = await import("../src/lib/outbound");
  let outboundError = "";
  try {
    refuseOutbound("wa_out");
  } catch (e) {
    outboundError = e instanceof Error ? e.message : String(e);
  }
  if (!outboundError.includes("OUTBOUND_ENABLED=false")) {
    throw new Error(`expected outbound refuse, got ${outboundError}`);
  }

  await prisma.client.delete({ where: { id: shop.id } });

  const q = await api(ops, "/api/operator/queue");
  const inbox = await api(client, "/api/client/inbox");
  console.log("verify ok", {
    adminCookie: Boolean(admin),
    queue: Array.isArray((q.json as { avis?: unknown[] }).avis)
      ? (q.json as { avis: unknown[] }).avis.length
      : q.status,
    inbox: inbox.status,
    outboundError,
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
