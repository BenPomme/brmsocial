import { NextResponse } from "next/server";
import { ingestInbound } from "@/lib/inbox";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return new NextResponse("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{ id?: string; from?: string; type?: string; text?: { body?: string } }>;
          };
        }>;
      }>;
    };
    const messages =
      body.entry?.flatMap((e) => e.changes ?? []).flatMap((c) => c.value?.messages ?? []) ?? [];
    for (const m of messages) {
      if (!m?.id || !m.from) continue;
      const text = m.type === "text" ? m.text?.body ?? "" : `(${m.type ?? "message"})`;
      await ingestInbound({
        channel: "whatsapp",
        counterparty: m.from,
        body: text || "(vide)",
        providerId: `wa-${m.id}`,
        payload: m,
      });
    }
  } catch (e) {
    console.warn("whatsapp webhook", e);
  }
  return NextResponse.json({ ok: true });
}
