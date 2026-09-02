import { readFileSync } from "node:fs";
import { classifyInbound, ingestInbound, type InboundKind } from "./inbox";
import { prisma } from "./db";
import { xaiFastModel, xaiText } from "./xai";
import { isWhatsappAllowlisted, sendWhatsappText } from "./whatsapp-send";
import { isAllowlisted, sendZohoMail } from "./zoho-mail";

function isLocalHost(url: string) {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function payUrl() {
  let tunnel = "";
  try {
    tunnel = readFileSync(".tunnel-url", "utf8").trim();
  } catch {
    tunnel = "";
  }
  const candidates = [
    process.env.PAY_PUBLIC_URL,
    tunnel,
    process.env.APP_URL,
    process.env.SITE_URL,
    "http://localhost:3001",
  ]
    .map((u) => (u ?? "").trim().replace(/\/$/, ""))
    .filter(Boolean);
  const base = candidates.find((u) => !isLocalHost(u)) ?? candidates[0];
  return `${base.replace(/\/pay$/i, "")}/pay`;
}

function norm(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function wantsPayLink(text: string) {
  return (
    /\b(pago|pagar|bizum|stripe|tarjeta|sepa|factura|invoice|iban|enlace|link|env[ií]a(?:\s*lo|\s*me)?|m[aá]nda(?:\s*me|\s*lo)?|send(?: it)?|do it)\b/i.test(
      text,
    )
  );
}

function lastOutAsksPay(lastOut: string | null | undefined) {
  if (!lastOut) return false;
  return /enlace de pago|le env[ií]o (ahora )?el enlace|¿le env[ií]o/i.test(lastOut);
}

function alreadyPitched(outbound: string[]) {
  return outbound.some((b) => /89\s*€|reviews@babyrock\.ai|reseñ/i.test(b));
}

function alreadySentPayLink(outbound: string[]) {
  const url = payUrl();
  return outbound.some((b) => b.includes(url) || /\/pay\b/.test(b));
}

function templateOk() {
  return `Perfecto. Para empezar:
1. Pago 89 €/mes: ${payUrl()}
2. Nos añade como gestor en Google (reviews@babyrock.ai), sin contraseña.

Cuando pague, le guío el clic a clic del gestor.`;
}

function templatePay() {
  return `Aquí tiene el enlace de pago (89 €/mes):
${payUrl()}

Tarjeta o SEPA. En España el primer mes puede ser Bizum.`;
}

function templatePhone() {
  return `Gracias, seguimos por aquí.

${templateOk()}`;
}

const TEMPLATES: Record<Exclude<InboundKind, "text">, string> = {
  get ok() {
    return templateOk();
  },
  stop: `Entendido, no le vuelvo a escribir. Si cambia de idea, aquí estoy.

Gracias y que le vaya muy bien.
Rosalia — Babyrock Social`,
  get phone() {
    return templatePhone();
  },
};

const FAQ: { id: string; re: RegExp; reply: string }[] = [
  {
    id: "pay",
    re: /\b(pago|pagar|bizum|stripe|tarjeta|sepa|factura|invoice|iban|enlace|link|env[ií]a(?:\s*lo|\s*me)?|m[aá]nda(?:\s*me|\s*lo)?|do it|send(?: it)?)\b/i,
    reply: `PAY`,
  },
  {
    id: "hello",
    re: /^(hola|hello|hi|hey|buenas|bon dia|buenos d[ií]as|salut)(\s+\S+){0,4}[\s!.¿?]*$/i,
    reply: `Hola, soy Rosalia de Babyrock Social. Respondemos las reseñas de Google de su negocio por 89 € al mes.

Si le interesa, responda OK y le mando el enlace de pago.`,
  },
  {
    id: "interest",
    re: /\b(interesad[oa]|quiero (probar|el servicio|contratar)|tengo un[ae]? (bar|restaurante|negocio|local|cafeter[ií]a)|un bar en)\b/i,
    reply: `Hola, perfecto. El servicio cuesta 89 €/mes. Redactamos y publicamos las 4–5★. Las 1–3★ le llegan por WhatsApp para que diga OK o cambie el texto.

Le añadimos como gestor (reviews@babyrock.ai), sin contraseña.

PAY`,
  },
  {
    id: "value",
    re: /\b(bueno para|vale la pena|worth|mi (bar|negocio|business|restaurante)|para mi negocio|funciona para)\b/i,
    reply: `Sí: quien busca un bar en Google mira las reseñas primero. Si el local no responde, parece abandonado. Por 89 €/mes una persona de Babyrock responde todas, cada mes.

PAY`,
  },
  {
    id: "price",
    re: /\b(precio|preu|price|cuesta|coste|cost|tarif|89|euros?|€)\b/i,
    reply: `89 € al mes, mes a mes (sin permanencia de 3 meses). 4–5★ las publicamos; 1–3★ usted dice OK o cambia el texto.

PAY`,
  },
  {
    id: "manager",
    re: /\b(gestor|manager|invitaci[oó]n|acceso|contrase[nñ]a|password|google my business|perfil de empresa|c[oó]mo (te |os |le )?a[nñ]ad|how do i add|add you)\b/i,
    reply: `No pedimos su contraseña. En Google: añadir reviews@babyrock.ai como gestor. Le guío el clic a clic. El pago es el otro paso: PAY`,
  },
  {
    id: "how",
    re: /\b(c[oó]mo funciona|com funciona|how (does )?it work|qu[eé] hac[eé]is|que ofrec[eé]n)\b/i,
    reply: `Usted nos da acceso de gestor a la ficha Google (sin contraseña). Nosotros redactamos; una persona publica. Usted no escribe cada día. 4–5★: publicamos. 1–3★: valida por WhatsApp.

Si quiere empezar: PAY`,
  },
  {
    id: "lang_en",
    re: /\b(speak english|in english|i don'?t speak spanish|can you speak)\b/i,
    reply: `Yes — we can talk here in English. We also reply to each Google review in its own language (Spanish, Catalan, French, English).

PAY`,
  },
  {
    id: "price_en",
    re: /\b(what('?s| is) the price|how much (does it )?(cost|is it))\b/i,
    reply: `89 € per month, month to month (no 3-month lock-in). We publish 4–5★; 1–3★ you say OK or edit the text.

PAY`,
  },
  {
    id: "lang",
    re: /\b(idioma|llengua|catal[aà]|catalán|franc[eé]s|en qu[eé] idioma)\b/i,
    reply: `Respondemos en el idioma de cada reseña (castellano, catalán, francés, inglés…).`,
  },
  {
    id: "what",
    re: /\b(qu[eé] es babyrock|who are you|qui[eé]n sois|qui [eé]s)\b/i,
    reply: `Babyrock Social (Sant Cugat). Ayudamos a comercios a responder sus reseñas de Google, todos los meses, sin que el dueño tenga que hacerlo.`,
  },
  {
    id: "hours",
    re: /\b(horario|horari|hours|cu[aá]ndo|quand)\b/i,
    reply: `Publicamos en horario razonable del negocio. Los 1–3★ le llegan por WhatsApp para que valide.`,
  },
  {
    id: "trial",
    re: /\b(prueba|trial|gratis|gratuit|demo)\b/i,
    reply: `No hay mes gratis. Si quiere, le enseño con una reseña de ejemplo cómo quedaría, sin publicar nada.`,
  },
  {
    id: "thanks",
    re: /^(gracias|gr[aà]cies|merci|thanks)[\s!.,]*$/i,
    reply: `A usted. Cuando quiera, OK y seguimos.`,
  },
  {
    id: "who_writes",
    re: /\b(inteligencia|ia\b|ai\b|robot|bot|chatgpt|humano|persona|qui[eé]n (escribe|redacta|publica)|who writes)\b/i,
    reply: `Una persona de Babyrock redacta y publica. No es un bot que suelta texto solo en su ficha.

PAY`,
  },
  {
    id: "cancel",
    re: /\b(cancelar|baja del servicio|permanencia|compromiso|mes a mes|sin permanencia|cancel)\b/i,
    reply: `Mes a mes, sin permanencia de 3 meses. Avisa y paramos.

PAY`,
  },
  {
    id: "after_pay",
    re: /\b(despu[eé]s de pagar|qu[eé] pasa (luego|despu[eé]s)|cu[aá]ndo empez|how long|tarda|onboarding)\b/i,
    reply: `El mismo día: le guío el clic a clic del gestor Google. Al mes siguiente (o en cuanto haya reseñas) respondemos.

PAY`,
  },
];

function fillPay(reply: string, outbound: string[] = []) {
  const pay = alreadySentPayLink(outbound) ? "El enlace de pago está arriba." : templatePay();
  return reply.replace(/\bPAY\b/g, pay).trim();
}

function matchFaq(text: string, outbound: string[] = []): { id: string; reply: string } | null {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return null;
  for (const row of FAQ) {
    if (row.re.test(t)) return { id: row.id, reply: fillPay(row.reply, outbound) };
  }
  return null;
}

const FAQ_ALREADY: Record<string, RegExp> = {
  hello: /soy Rosalia de Babyrock Social/,
  interest: /El servicio cuesta 89 €\/mes/,
  value: /quien busca un bar en Google/,
  price: /sin permanencia de 3 meses/,
  manager: /añadir reviews@babyrock\.ai como gestor/,
  how: /Usted nos da acceso de gestor|Se lo resumo: nos añade como gestor|Muy simple: nos da acceso de gestor/,
  lang_en: /we can talk here in English/,
  price_en: /89 € per month, month to month/,
};

function alreadySentFaq(id: string | undefined, outbound: string[]) {
  if (!id) return false;
  const re = FAQ_ALREADY[id];
  return Boolean(re && outbound.some((b) => re.test(b)));
}

const FALLBACK_TEXT =
  "He recibido su mensaje. Se lo paso a un compañero y le respondo enseguida. — Rosalia";

export type RosaliaDecision = {
  kind: InboundKind;
  source: "template" | "off_script";
  faqId?: string;
  body: string;
  status: string;
};

/** Scripts first. Unmatched product questions go to the cheap LLM in proposeRosaliaReply. */
export function decideRosaliaReply(opts: {
  inbound: string;
  outboundBodies: string[];
}): RosaliaDecision {
  const inbound = opts.inbound;
  const outbound = opts.outboundBodies;
  const lastOut = outbound.at(-1) ?? null;
  const kind = classifyInbound(inbound);
  const status = kind === "stop" ? "stop" : kind === "ok" || wantsPayLink(inbound) ? "ok" : "needs_human";

  if (kind === "stop") {
    return { kind, source: "template", faqId: "stop", body: TEMPLATES.stop, status };
  }

  if (wantsPayLink(inbound) || (kind === "ok" && lastOutAsksPay(lastOut))) {
    return { kind: "ok", source: "template", faqId: "pay", body: templatePay(), status: "ok" };
  }

  if (kind === "phone") {
    return { kind, source: "template", faqId: "phone", body: TEMPLATES.phone, status };
  }

  if (kind === "ok") {
    return { kind, source: "template", faqId: "ok", body: templateOk(), status };
  }

  const hit = matchFaq(inbound, outbound);
  let faqId = hit?.id;
  let body = hit?.reply ?? FALLBACK_TEXT;
  let source: "template" | "off_script" = hit ? "template" : "off_script";

  if (faqId === "hello" && alreadyPitched(outbound)) {
    body = alreadySentPayLink(outbound)
      ? `Hola de nuevo. El enlace de pago está arriba. Si no le llega:\n${payUrl()}`
      : `Hola de nuevo. Si quiere, seguimos:\n${templatePay()}`;
    faqId = "pay";
  } else if (alreadySentFaq(faqId, outbound)) {
    body = alreadySentPayLink(outbound)
      ? "Se lo acabo de contar. El enlace de pago está arriba. ¿Otra duda, o pagamos?"
      : templatePay();
    faqId = alreadySentPayLink(outbound) ? "repeat" : "pay";
  }

  if (source === "off_script") {
    body = FALLBACK_TEXT;
  }

  if (outbound.some((b) => norm(b) === norm(body)) && norm(body) !== norm(templatePay())) {
    body = templatePay();
    faqId = "pay";
    source = "template";
  }

  return { kind, source, faqId, body, status };
}

function lockPayUrls(text: string) {
  const url = payUrl();
  return text.replace(/https?:\/\/[^\s)]+/gi, (u) => (/pay|pago|checkout|stripe/i.test(u) ? url : u));
}

function tooSimilar(a: string, b: string) {
  const na = norm(a).toLowerCase();
  const nb = norm(b).toLowerCase();
  if (!na || !nb) return false;
  if (na === nb) return true;
  const head = na.slice(0, 70);
  return head.length >= 40 && nb.includes(head);
}

function sanitizeLlmReply(reply: string, outbound: string[]) {
  let body = lockPayUrls(reply).trim();
  if (!body) return FALLBACK_TEXT;
  if (outbound.some((b) => tooSimilar(body, b))) {
    return alreadySentPayLink(outbound)
      ? "Buena pregunta. El enlace de pago está arriba; si quiere otra cosa, dígamelo en una frase."
      : templatePay();
  }
  if (/\b(pago|pagar|enlace)\b/i.test(body) && !/https?:\/\//i.test(body) && !alreadySentPayLink(outbound)) {
    body = `${body}\n${payUrl()}`;
  }
  return body.slice(0, 700);
}

function draftId(threadId: string) {
  return `draft-${threadId}`;
}

export async function proposeRosaliaReply(threadId: string) {
  const thread = await prisma.inboxThread.findUnique({
    where: { id: threadId },
    include: {
      lead: { select: { name: true, city: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 40 },
    },
  });
  if (!thread) throw new Error("thread not found");

  const lastIn = [...thread.messages].reverse().find((m) => m.direction === "in");
  if (!lastIn) return { created: false as const, reason: "no inbound" };
  const lastOut = [...thread.messages].reverse().find((m) => m.direction === "out");
  const outboundBodies = thread.messages.filter((m) => m.direction === "out").map((m) => m.body);

  const decided = decideRosaliaReply({ inbound: lastIn.body, outboundBodies });
  let { body, source, kind, faqId, status } = decided;
  let replySource: "template" | "llm" | "off_script" = source;

  if (source === "off_script" && process.env.ROSALIA_LLM !== "false") {
    const drafted = await draftProductReply({
      inbound: lastIn.body,
      leadName: thread.lead?.name ?? null,
      lastOut: lastOut?.body ?? null,
      history: thread.messages
        .filter((m) => m.direction !== "draft")
        .slice(-8)
        .map((m) => `${m.direction === "in" ? "ellos" : "rosalia"}: ${m.body}`)
        .join("\n"),
    });
    if (drafted.onProduct) {
      body = sanitizeLlmReply(drafted.reply, outboundBodies);
      replySource = "llm";
      faqId = "llm_product";
      status = "ok";
    } else {
      body = FALLBACK_TEXT;
      replySource = "off_script";
      faqId = "off_product";
    }
  }

  const existing = await prisma.inboxMessage.findUnique({ where: { providerId: draftId(thread.id) } });
  const draft = existing
    ? await prisma.inboxMessage.update({
        where: { id: existing.id },
        data: { body, payload: { source: replySource, kind, faqId } },
      })
    : await prisma.inboxMessage.create({
        data: {
          threadId: thread.id,
          direction: "draft",
          body,
          providerId: draftId(thread.id),
          payload: { source: replySource, kind, faqId },
        },
      });

  await prisma.inboxThread.update({
    where: { id: thread.id },
    data: { status, lastMessageAt: new Date() },
  });

  return { created: true as const, draftId: draft.id, source: replySource, kind, body };
}

const SKIP_AUTO = new Set(["16315551181", "34600000001", "15555551234"]);

export async function deliverRosaliaDraft(threadId: string, textOverride?: string) {
  const thread = await prisma.inboxThread.findUnique({
    where: { id: threadId },
    include: { messages: { where: { direction: "draft" }, take: 1 } },
  });
  if (!thread) throw new Error("thread not found");
  const draft = thread.messages[0];
  const text = (textOverride ?? draft?.body ?? "").trim();
  if (!text) throw new Error("rien à envoyer");

  if (thread.channel === "whatsapp") {
    const sent = await sendWhatsappText(thread.counterparty, text);
    await ingestInbound({
      channel: "whatsapp",
      counterparty: thread.counterparty,
      body: text,
      providerId: `wa-out-${sent.providerId}`,
      direction: "out",
    });
    if (draft) await prisma.inboxMessage.delete({ where: { id: draft.id } }).catch(() => null);
    return { channel: "whatsapp" as const, providerId: sent.providerId };
  }

  if (thread.channel === "email") {
    const sent = await sendZohoMail({
      to: thread.counterparty,
      subject: thread.subject ? `Re: ${thread.subject.replace(/^re:\s*/i, "")}` : "Babyrock Social",
      content: text,
    });
    await ingestInbound({
      channel: "email",
      counterparty: thread.counterparty,
      body: text,
      subject: thread.subject,
      providerId: `zoho-out-${sent.messageId ?? sent.mailId ?? Date.now()}`,
      direction: "out",
    });
    if (draft) await prisma.inboxMessage.delete({ where: { id: draft.id } }).catch(() => null);
    return { channel: "email" as const, providerId: String(sent.messageId ?? sent.mailId ?? "") };
  }

  throw new Error(`canal ${thread.channel} non géré`);
}

export async function proposeAndMaybeSend(threadId: string) {
  const proposed = await proposeRosaliaReply(threadId);
  if (!proposed.created) return { ...proposed, sent: false as const };

  const thread = await prisma.inboxThread.findUnique({ where: { id: threadId } });
  if (!thread) return { ...proposed, sent: false as const };

  const digits = thread.counterparty.replace(/\D/g, "");
  if (SKIP_AUTO.has(digits) || proposed.source === "off_script") {
    return { ...proposed, sent: false as const };
  }

  const allowed =
    (thread.channel === "whatsapp" && isWhatsappAllowlisted(thread.counterparty)) ||
    (thread.channel === "email" && isAllowlisted(thread.counterparty));
  if (!allowed) return { ...proposed, sent: false as const };

  try {
    const sent = await deliverRosaliaDraft(threadId);
    return { ...proposed, sent: true as const, delivered: sent };
  } catch (e) {
    console.warn("rosalia auto-send", e);
    return { ...proposed, sent: false as const, sendError: e instanceof Error ? e.message : String(e) };
  }
}

async function draftProductReply(opts: {
  inbound: string;
  leadName: string | null;
  lastOut: string | null;
  history: string;
}): Promise<{ onProduct: boolean; reply: string }> {
  try {
    const raw = await xaiText(
      `Eres Rosalia, de Babyrock Social (Sant Cugat). WhatsApp B2B, de usted, 1–4 frases (máx. 400 caracteres).
Producto (solo esto): respondemos reseñas Google de comercios, 89 €/mes, mes a mes. 4–5★: una persona publica. 1–3★: el dueño valida por WhatsApp. Gestor: reviews@babyrock.ai, sin contraseña. No hacemos SEO, ads, Instagram ni community.
Responde SIEMPRE a la pregunta nueva. NUNCA copies ni parafrasees tu mensaje anterior.
NUNCA inventes una URL. El único enlace de pago es ${payUrl()}.
Idioma = idioma del último mensaje de ellos (es/ca/en/fr).
on_product=true: la pregunta va sobre ESTE producto (precio, cómo, valor para un bar, gestor, pago, idiomas, horarios, prueba, quién escribe, cancelar, onboarding, qué negocios, qué pasa después de pagar).
on_product=false: legal, empleo, inversión, insultos, política, o un servicio que no vendemos.
JSON only: {"on_product":boolean,"reply":"..."}.`,
      `Restaurante: ${opts.leadName ?? "(desconocido)"}\nTu último mensaje (PROHIBIDO copiar):\n${opts.lastOut || "(ninguno)"}\nHistorial:\n${opts.history || "(vacío)"}\n\nPregunta nueva:\n${opts.inbound}`,
      { model: xaiFastModel(), maxTokens: 280, temperature: 0.2, reasoning: "none" },
    );
    if (!raw) return { onProduct: false, reply: FALLBACK_TEXT };
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(cleaned) as { on_product?: boolean; on_script?: boolean; reply?: string };
    const onProduct = Boolean(parsed.on_product ?? parsed.on_script);
    const reply = (parsed.reply ?? "").trim().slice(0, 700);
    if (!onProduct) return { onProduct: false, reply: FALLBACK_TEXT };
    if (!reply) return { onProduct: false, reply: FALLBACK_TEXT };
    return { onProduct: true, reply };
  } catch (e) {
    console.warn("rosalia product draft", e);
    return { onProduct: false, reply: FALLBACK_TEXT };
  }
}
