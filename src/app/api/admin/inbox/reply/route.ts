import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { ingestInbound } from "@/lib/inbox";
import { proposeRosaliaReply } from "@/lib/rosalia-reply";
import { prisma } from "@/lib/db";
import { sendWhatsappText, WhatsappSendError } from "@/lib/whatsapp-send";

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;

  const body = (await req.json()) as {
    threadId?: string;
    action?: "propose" | "send";
    text?: string;
  };
  const threadId = (body.threadId ?? "").trim();
  const action = body.action === "send" ? "send" : "propose";
  if (!threadId) return NextResponse.json({ error: "threadId requis" }, { status: 400 });

  if (action === "propose") {
    const proposed = await proposeRosaliaReply(threadId);
    return NextResponse.json({ ok: true, proposed });
  }

  const thread = await prisma.inboxThread.findUnique({
    where: { id: threadId },
    include: { messages: { where: { direction: "draft" }, take: 1 } },
  });
  if (!thread) return NextResponse.json({ error: "fil introuvable" }, { status: 404 });
  if (thread.channel !== "whatsapp") {
    return NextResponse.json({ error: "envoi WhatsApp seulement (mail = Zoho, pas encore)" }, { status: 400 });
  }

  const draft = thread.messages[0];
  const text = (body.text ?? draft?.body ?? "").trim();
  if (!text) return NextResponse.json({ error: "rien à envoyer" }, { status: 400 });

  try {
    const sent = await sendWhatsappText(thread.counterparty, text);
    await ingestInbound({
      channel: "whatsapp",
      counterparty: thread.counterparty,
      body: text,
      providerId: `wa-out-${sent.providerId}`,
      direction: "out",
    });
    if (draft) await prisma.inboxMessage.delete({ where: { id: draft.id } }).catch(() => null);
    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    const msg = e instanceof WhatsappSendError ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
