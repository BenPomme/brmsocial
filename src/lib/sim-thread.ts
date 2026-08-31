import { prisma } from "./db";

/**
 * Simulated WhatsApp thread. Writes to messages_whatsapp only.
 * Never calls Meta / SMS / SMTP.
 */
export async function simPingLowStar(opts: {
  clientId: string;
  avisId: string;
  stars: number;
  lang: string | null;
  author: string | null;
  body: string;
  draftText: string;
}) {
  const existing = await prisma.messageWhatsapp.findFirst({
    where: { avisId: opts.avisId, providerMsgId: `sim:ping:${opts.avisId}` },
  });
  if (existing) return existing;

  const body = [
    `Avis ${opts.stars}★ de ${opts.author || "un client"} (${opts.lang || "?"})`,
    `«${opts.body}»`,
    "",
    "Brouillon proposé :",
    opts.draftText,
    "",
    "Répondez OK pour valider, ou envoyez le texte à publier.",
  ].join("\n");

  const msg = await prisma.messageWhatsapp.create({
    data: {
      clientId: opts.clientId,
      avisId: opts.avisId,
      direction: "sim",
      body,
      providerMsgId: `sim:ping:${opts.avisId}`,
    },
  });

  await prisma.action.create({
    data: {
      clientId: opts.clientId,
      avisId: opts.avisId,
      type: "ping_wa",
      actor: "notify",
      payload: { simulated: true, channel: "sim" },
      result: "ok",
    },
  });

  return msg;
}

export async function simDailyRecap(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const avis = await prisma.avis.findMany({
    where: { clientId, createdAt: { gte: start } },
  });
  if (avis.length === 0) return;

  const counts: Record<number, number> = {};
  for (const a of avis) counts[a.stars] = (counts[a.stars] ?? 0) + 1;
  const starLine = Object.keys(counts)
    .sort((a, b) => Number(b) - Number(a))
    .map((s) => `${counts[Number(s)]}×${s}★`)
    .join(", ");
  const low = avis.filter((a) => a.stars <= 3).length;

  const body = [
    `Topo du jour — ${client.name}`,
    `Nouveaux avis (extraits Places) : ${starLine}.`,
    low > 0
      ? `${low} avis 1–3★ en attente de votre OK.`
      : "Rien à valider de votre côté aujourd’hui (seulement 4–5★, lus par l’opérateur).",
  ].join("\n");

  const already = await prisma.messageWhatsapp.findFirst({
    where: {
      clientId,
      providerMsgId: { startsWith: `sim:recap:${clientId}:` },
      createdAt: { gte: start },
    },
  });
  if (already) return already;

  return prisma.messageWhatsapp.create({
    data: {
      clientId,
      direction: "sim",
      body,
      providerMsgId: `sim:recap:${clientId}:${start.toISOString().slice(0, 10)}`,
    },
  });
}
