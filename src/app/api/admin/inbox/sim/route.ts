import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { ingestInbound } from "@/lib/inbox";

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as { channel?: string; from?: string; body?: string; subject?: string };
  const channel = body.channel === "email" ? "email" : "whatsapp";
  const from = (body.from ?? "").trim();
  const text = (body.body ?? "").trim();
  if (!from || !text) {
    return NextResponse.json({ error: "from et body requis" }, { status: 400 });
  }
  const ingested = await ingestInbound({
    channel,
    counterparty: from,
    body: text,
    subject: body.subject ?? null,
    providerId: `sim-${channel}-${Date.now()}`,
  });
  return NextResponse.json({ ok: true, ingested });
}
