import { NextResponse } from "next/server";
import { ingestInbound } from "@/lib/inbox";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (mode === "subscribe" && expected && token === expected && challenge) {
    console.log("whatsapp webhook verify: ok");
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  console.warn("whatsapp webhook verify: rejected");
  return new NextResponse("forbidden", { status: 403 });
}

type WaMessage = {
  id?: string;
  from?: string;
  from_user_id?: string;
  type?: string;
  text?: { body?: string };
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      object?: string;
      entry?: Array<{
        changes?: Array<{
          field?: string;
          value?: {
            messages?: WaMessage[];
            statuses?: unknown[];
            errors?: unknown[];
            contacts?: Array<{ wa_id?: string; profile?: { name?: string } }>;
          };
        }>;
      }>;
    };
    const changes = body.entry?.flatMap((e) => e.changes ?? []) ?? [];
    const messages = changes.flatMap((c) => c.value?.messages ?? []);
    const statuses = changes.flatMap((c) => c.value?.statuses ?? []);
    const errors = changes.flatMap((c) => c.value?.errors ?? []);
    const contacts = changes.flatMap((c) => c.value?.contacts ?? []);
    const waIds = contacts.map((x) => x.wa_id).filter(Boolean) as string[];
    const profileByWa = new Map(
      contacts
        .filter((c) => c.wa_id && c.profile?.name)
        .map((c) => [c.wa_id!.replace(/\D/g, ""), c.profile!.name!]),
    );
    console.log("whatsapp webhook POST", {
      object: body.object,
      fields: changes.map((c) => c.field),
      messages: messages.length,
      statuses: statuses.length,
      errors: errors.length,
      from: messages.map((m) => m.from ?? m.from_user_id ?? null),
      types: messages.map((m) => m.type),
    });
    for (const m of messages) {
      const from = (m.from ?? m.from_user_id ?? waIds[0] ?? "").trim();
      if (!m?.id || !from) {
        console.warn("whatsapp webhook skip", { id: m?.id, keys: m ? Object.keys(m) : [] });
        continue;
      }
      const mediaType = m.type && m.type !== "text" ? m.type : "text";
      const text = m.type === "text" ? m.text?.body ?? "" : `(${m.type ?? "message"})`;
      const profileName = profileByWa.get(from.replace(/\D/g, "")) ?? contacts[0]?.profile?.name ?? null;
      await ingestInbound({
        channel: "whatsapp",
        counterparty: from,
        body: text || "(vide)",
        providerId: `wa-${m.id}`,
        payload: { message: m, profileName, mediaType },
        profileName,
      });
    }
  } catch (e) {
    console.warn("whatsapp webhook", e);
  }
  return NextResponse.json({ ok: true });
}
