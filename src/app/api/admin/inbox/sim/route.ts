import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { ingestInbound } from "@/lib/inbox";
import { prisma } from "@/lib/db";
import { emitRosaliaEvent } from "@/lib/rosalia-reply";
import type { RosaliaEvent } from "@/lib/rosalia/types";

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as {
    channel?: string;
    from?: string;
    body?: string;
    subject?: string;
    type?: string;
    event?: string;
    city?: string;
  };
  const channel = body.channel === "email" ? "email" : "whatsapp";
  const from = (body.from ?? "").trim();
  if (!from) return NextResponse.json({ error: "from requis" }, { status: 400 });

  const mediaType = body.type && body.type !== "text" ? body.type : "text";
  const text = (body.body ?? "").trim();

  if (body.event) {
    const ingested = text
      ? await ingestInbound({
          channel,
          counterparty: from,
          body: text,
          subject: body.subject ?? null,
          providerId: `sim-${channel}-${Date.now()}`,
          payload: { mediaType: "text", simulated: true },
          skipDraft: true,
        })
      : await ingestInbound({
          channel,
          counterparty: from,
          body: `(event:${body.event})`,
          providerId: `sim-event-${channel}-${Date.now()}`,
          payload: { mediaType: "text", simulated: true, system: true },
          skipDraft: true,
        });
    if (body.city) await ensureSimCity(ingested.threadId, from, body.city);
    const event = await simEvent(body.event, ingested.threadId, from);
    if (!event) return NextResponse.json({ error: `événement ${body.event} inconnu` }, { status: 400 });
    const emitted = await emitRosaliaEvent({ threadId: ingested.threadId, event });
    return NextResponse.json({ ok: true, ingested, emitted });
  }

  if (!text && mediaType === "text") {
    return NextResponse.json({ error: "from et body requis" }, { status: 400 });
  }
  const ingested = await ingestInbound({
    channel,
    counterparty: from,
    body: text || `(${mediaType})`,
    subject: body.subject ?? null,
    providerId: `sim-${channel}-${Date.now()}`,
    payload: { mediaType, simulated: true },
  });
  if (body.city) await ensureSimCity(ingested.threadId, from, body.city);
  return NextResponse.json({ ok: true, ingested });
}

async function ensureSimCity(threadId: string, from: string, city: string) {
  const thread = await prisma.inboxThread.findUnique({ where: { id: threadId } });
  if (!thread) return;
  if (thread.clientId) {
    await prisma.client.update({ where: { id: thread.clientId }, data: { city } });
    return;
  }
  const client = await prisma.client.create({
    data: {
      name: `Sim ${from}`,
      city,
      country: "ES",
      status: "lead",
      whatsappOwner: from.replace(/\D/g, ""),
    },
  });
  await prisma.inboxThread.update({ where: { id: threadId }, data: { clientId: client.id } });
}

async function simEvent(name: string, threadId: string, from: string): Promise<RosaliaEvent | null> {
  if (name === "payment_confirmed") {
    await setSimStatus(threadId, from, { status: "paye" });
    return { type: "payment_confirmed", via: "stripe" };
  }
  if (name === "trial_started") {
    await setSimStatus(threadId, from, { status: "essai" });
    return { type: "payment_confirmed", via: "trial" };
  }
  if (name === "manager_connected") {
    await setSimStatus(threadId, from, { status: "actif", manager: "accepted" });
    return { type: "manager_connected" };
  }
  if (name === "low_star") {
    await setSimStatus(threadId, from, { status: "actif", manager: "accepted" });
    return {
      type: "low_star",
      avisId: `sim-avis-${Date.now()}`,
      stars: 2,
      author: "Marta",
      lang: "es",
      body: "Tardaron mucho.",
      draft: "Hola Marta. Gracias por escribirnos.",
    };
  }
  return null;
}

async function setSimStatus(
  threadId: string,
  from: string,
  opts: { status: string; manager?: string },
) {
  const thread = await prisma.inboxThread.findUnique({ where: { id: threadId } });
  if (thread?.clientId) {
    await prisma.client.update({
      where: { id: thread.clientId },
      data: {
        status: opts.status,
        ...(opts.manager ? { managerInviteStatus: opts.manager } : {}),
      },
    });
    return;
  }
  const client = await prisma.client.create({
    data: {
      name: `Sim ${from}`,
      city: "Sant Cugat del Vallès",
      country: "ES",
      status: opts.status,
      managerInviteStatus: opts.manager ?? "pending",
      whatsappOwner: from.replace(/\D/g, ""),
    },
  });
  await prisma.inboxThread.update({ where: { id: threadId }, data: { clientId: client.id } });
}
