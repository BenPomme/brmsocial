import { prisma } from "./db";
import { isCerradoIntent } from "./fiche/recap";

export async function handleClientReply(opts: {
  clientId: string;
  avisId?: string | null;
  text: string;
  actor: string;
}) {
  const text = opts.text.trim();
  if (!text) throw new Error("empty reply");

  await prisma.messageWhatsapp.create({
    data: {
      clientId: opts.clientId,
      avisId: opts.avisId ?? null,
      direction: "in",
      body: text,
      providerMsgId: `sim:in:${opts.clientId}:${Date.now()}`,
    },
  });

  if (isCerradoIntent(text)) {
    const pending = await prisma.action.findMany({
      where: { clientId: opts.clientId, type: "holiday_hours" },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const hit = pending.find((a) => (a.payload as { status?: string }).status === "pending");
    if (hit) {
      const payload = hit.payload as { date?: string; name?: string };
      await prisma.action.create({
        data: {
          clientId: opts.clientId,
          type: "holiday_hours",
          actor: opts.actor,
          payload: { date: payload.date, name: payload.name, status: "owner_cerrado" },
          result: "ok",
        },
      });
      await prisma.messageWhatsapp.create({
        data: {
          clientId: opts.clientId,
          direction: "sim",
          body:
            "CERRADO recibido. Lo aplicaremos en Google cuando la API de escritura esté activa. " +
            "Mientras tanto, cámbielo usted en su perfil de empresa. Nosotros no tocamos el horario a mano.",
          providerMsgId: `sim:cerrado:${opts.clientId}:${payload.date ?? Date.now()}`,
        },
      });
      return { ok: true, mode: "cerrado", date: payload.date ?? null };
    }
  }

  let avis = opts.avisId
    ? await prisma.avis.findUnique({
        where: { id: opts.avisId },
        include: { reponses: { orderBy: { version: "desc" }, take: 1 } },
      })
    : null;

  if (!avis) {
    avis = await prisma.avis.findFirst({
      where: { clientId: opts.clientId, stars: { lte: 3 }, status: "attente_client" },
      include: { reponses: { orderBy: { version: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });
  }

  if (!avis) {
    return { ok: true, note: "message stored, no pending 1–3★" };
  }

  const isOk = /^(ok|oui|yes|d['’]?accord|vale|de acuerdo)\b/i.test(text);
  const latest = avis.reponses[0];
  const version = (latest?.version ?? 0) + 1;

  if (isOk) {
    await prisma.avis.update({ where: { id: avis.id }, data: { status: "pret" } });
    await prisma.action.create({
      data: {
        clientId: avis.clientId,
        avisId: avis.id,
        type: "owner_ok",
        actor: opts.actor,
        payload: { simulated: true, mode: "ok" },
        result: "ok",
      },
    });
    await prisma.messageWhatsapp.create({
      data: {
        clientId: avis.clientId,
        avisId: avis.id,
        direction: "sim",
        body: "OK reçu. L’opérateur pourra publier ce texte (toujours en dry-run tant que la fiche n’est pas à nous).",
        providerMsgId: `sim:ack:${avis.id}:${Date.now()}`,
      },
    });
    return { ok: true, avisId: avis.id, status: "pret", mode: "ok" };
  }

  await prisma.reponse.create({
    data: {
      avisId: avis.id,
      version,
      draftModel: latest?.draftModel,
      draftText: latest?.draftText,
      operatorText: latest?.operatorText,
      sentToOwnerText: text,
      actor: "owner",
    },
  });
  await prisma.avis.update({ where: { id: avis.id }, data: { status: "pret" } });
  await prisma.action.create({
    data: {
      clientId: avis.clientId,
      avisId: avis.id,
      type: "owner_ok",
      actor: opts.actor,
      payload: { simulated: true, mode: "text", text },
      result: "ok",
    },
  });
  await prisma.messageWhatsapp.create({
    data: {
      clientId: avis.clientId,
      avisId: avis.id,
      direction: "sim",
      body: "Texte reçu. C’est celui-ci qui partira si l’opérateur clique Publier.",
      providerMsgId: `sim:ack:${avis.id}:${Date.now()}`,
    },
  });
  return { ok: true, avisId: avis.id, status: "pret", mode: "text" };
}
