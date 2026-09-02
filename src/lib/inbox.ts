import { prisma } from "./db";

export type InboundKind = "ok" | "stop" | "phone" | "text";

export function classifyInbound(body: string): InboundKind {
  const t = body.replace(/\s+/g, " ").trim();
  if (!t) return "text";
  if (/\b(baja|stop|unsubscribe|no me interesa|no,?\s*gracias|no gracias)\b/i.test(t)) return "stop";
  if (
    /\b(pago|pagar|bizum|stripe|tarjeta|enlace|link|env[ií]a(?:\s*lo|\s*me)?|m[aá]nda(?:\s*me|\s*lo)?)\b/i.test(
      t,
    ) ||
    /\b(do it|send it|send the link)\b/i.test(t)
  ) {
    return "ok";
  }
  if (/^\s*(ok|vale|de acuerdo|sí|si|yes)\b/i.test(t)) return "ok";
  const digits = t.replace(/[^\d+]/g, "");
  if (/^\+?\d{9,15}$/.test(digits) && digits.replace(/\D/g, "").length >= 9) return "phone";
  return "text";
}

export async function ingestInbound(opts: {
  channel: "email" | "whatsapp";
  counterparty: string;
  body: string;
  subject?: string | null;
  providerId: string;
  payload?: unknown;
  direction?: "in" | "out";
}) {
  const counterparty = opts.counterparty.trim().toLowerCase();
  const direction = opts.direction ?? "in";
  const kind = classifyInbound(opts.body);
  const status = kind === "stop" ? "stop" : kind === "ok" ? "ok" : "needs_human";

  const lead = await prisma.lead.findFirst({
    where: {
      OR: [
        { email: { equals: counterparty, mode: "insensitive" } },
        { outreachTo: { equals: counterparty, mode: "insensitive" } },
        { waSite: { contains: counterparty.replace(/\D/g, "") } },
      ],
    },
  });

  const existing = await prisma.inboxMessage.findUnique({
    where: { providerId: opts.providerId },
  });
  if (existing) return { created: false, messageId: existing.id, threadId: existing.threadId, kind };

  const thread = await prisma.inboxThread.upsert({
    where: { channel_counterparty: { channel: opts.channel, counterparty } },
    create: {
      channel: opts.channel,
      kind: "outreach",
      counterparty,
      subject: opts.subject ?? null,
      status,
      leadId: lead?.id ?? null,
      lastMessageAt: new Date(),
    },
    update: {
      lastMessageAt: new Date(),
      ...(direction === "in" ? { status } : {}),
      leadId: lead?.id ?? undefined,
      subject: opts.subject ?? undefined,
    },
  });

  const message = await prisma.inboxMessage.create({
    data: {
      threadId: thread.id,
      direction,
      body: opts.body,
      providerId: opts.providerId,
      payload: opts.payload as object | undefined,
    },
  });

  if (createdInboundShouldDraft(opts.channel, direction)) {
    try {
      const { proposeAndMaybeSend } = await import("./rosalia-reply");
      await proposeAndMaybeSend(thread.id);
    } catch (e) {
      console.warn("rosalia propose", e);
    }
  }

  return { created: true, messageId: message.id, threadId: thread.id, kind, leadId: lead?.id ?? null };
}

function createdInboundShouldDraft(channel: string, direction: string) {
  return direction === "in" && (channel === "whatsapp" || channel === "email");
}
