import { classifyInbound, type InboundKind } from "./inbox";
import { prisma } from "./db";
import { xaiFastText } from "./xai";

const TEMPLATES: Record<Exclude<InboundKind, "text">, string> = {
  ok: `Hola, soy Rosalia de Babyrock Social.

Perfecto. Para empezar solo hacen falta dos cosas:
1. Darnos acceso de gestor a su ficha de Google (reviews@babyrock.ai).
2. El pago de 89 € al mes (le envío el enlace).

¿Prefiere que le explique primero cómo añadir el gestor, o el enlace de pago?`,
  stop: `Entendido, no le vuelvo a escribir. Si cambia de idea, aquí estoy.

Gracias y que le vaya muy bien.
Rosalia — Babyrock Social`,
  phone: `Gracias, le escribo por aquí para no mezclar con el correo.

El servicio son 89 € al mes: respondemos las reseñas de Google. Las de 4 y 5 estrellas las publicamos; las de 1 a 3, le mandamos un borrador y usted dice OK o cambia el texto.

¿Le envío el enlace de pago y los pasos para el acceso de gestor?`,
};

const FALLBACK_TEXT =
  "He recibido su mensaje. Se lo paso a un compañero y le respondo enseguida. — Rosalia";

function draftId(threadId: string) {
  return `draft-${threadId}`;
}

export async function proposeRosaliaReply(threadId: string) {
  const thread = await prisma.inboxThread.findUnique({
    where: { id: threadId },
    include: {
      lead: { select: { name: true, city: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });
  if (!thread) throw new Error("thread not found");

  const lastIn = [...thread.messages].reverse().find((m) => m.direction === "in");
  if (!lastIn) return { created: false as const, reason: "no inbound" };

  const kind = classifyInbound(lastIn.body);
  let source: "template" | "llm" | "off_script" = "template";
  let body = kind === "text" ? FALLBACK_TEXT : TEMPLATES[kind];
  let status = kind === "stop" ? "stop" : kind === "ok" ? "ok" : "needs_human";

  if (kind === "text") {
    const drafted = await draftFaqReply({
      inbound: lastIn.body,
      leadName: thread.lead?.name ?? null,
      history: thread.messages
        .filter((m) => m.direction !== "draft")
        .slice(-6)
        .map((m) => `${m.direction === "in" ? "ellos" : "rosalia"}: ${m.body}`)
        .join("\n"),
    });
    body = drafted.reply;
    source = drafted.onScript ? "llm" : "off_script";
    status = drafted.onScript ? "needs_human" : "needs_human";
  }

  const existing = await prisma.inboxMessage.findUnique({ where: { providerId: draftId(thread.id) } });
  const draft = existing
    ? await prisma.inboxMessage.update({
        where: { id: existing.id },
        data: { body, payload: { source, kind } },
      })
    : await prisma.inboxMessage.create({
        data: {
          threadId: thread.id,
          direction: "draft",
          body,
          providerId: draftId(thread.id),
          payload: { source, kind },
        },
      });

  await prisma.inboxThread.update({
    where: { id: thread.id },
    data: { status, lastMessageAt: new Date() },
  });

  return { created: true as const, draftId: draft.id, source, kind, body };
}

async function draftFaqReply(opts: {
  inbound: string;
  leadName: string | null;
  history: string;
}): Promise<{ onScript: boolean; reply: string }> {
  try {
    const raw = await xaiFastText(
      `Eres Rosalia, de Babyrock Social (Sant Cugat). Escribes por WhatsApp, en español, de usted, frases cortas (máx. 500 caracteres). No firmas con un párrafo largo.

El producto: 89 €/mes, responder reseñas de Google. 4–5★: redactamos y publicamos. 1–3★: enviamos borrador, el restaurante dice OK o cambia el texto. Acceso: nos añaden como gestor de la ficha (reviews@babyrock.ai). No pedimos la contraseña. No llamamos en frío. No hay compromiso de 3 meses (mes a mes, aún no fijeis si os preguntan: "de momento mes a mes"). El WhatsApp de clientes (FAQ comensales) es otro producto, 119 €, más adelante.

Script (on_script=true): precio, cómo funciona, gestor Google, pago, idiomas, horarios, OK para empezar, número de teléfono, "¿qué es Babyrock?".
off_script=true: amenazas legales, empleo, inversión, integraciones custom, temas médicos, insultos, o si no estás segura.

Devuelve SOLO JSON: {"on_script":boolean,"reply":"..."}.
Si off_script, reply = una línea: que se lo pasas a un compañero, sin inventar.`,
      `Restaurante: ${opts.leadName ?? "(desconocido)"}\nHistorial:\n${opts.history || "(vacío)"}\n\nÚltimo mensaje:\n${opts.inbound}`,
    );
    if (!raw) return { onScript: false, reply: FALLBACK_TEXT };
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { on_script?: boolean; reply?: string };
    const reply = (parsed.reply ?? "").trim().slice(0, 700);
    if (!reply) return { onScript: false, reply: FALLBACK_TEXT };
    return { onScript: Boolean(parsed.on_script), reply };
  } catch (e) {
    console.warn("rosalia faq draft", e);
    return { onScript: false, reply: FALLBACK_TEXT };
  }
}
