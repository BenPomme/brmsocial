import { prisma } from "../db";
import { xaiFastText, xaiText } from "../xai";
import { xaiKey, xaiModel } from "../env";
import { clampReviewReply, detectLang, firstName, pickDetail } from "../language";
import { simDailyRecap, simPingLowStar } from "../sim-thread";

function templateDraft(opts: {
  stars: number;
  lang: string;
  author: string | null;
  body: string;
  toneNotes: string | null;
}) {
  const name = firstName(opts.author);
  const detail = pickDetail(opts.body);
  const lang = opts.lang;
  if (opts.stars >= 4) {
    if (lang === "es") {
      return `Gracias${name ? ` ${name}` : ""} por tu comentario. Nos alegra que menciones esto: ${detail}. Te esperamos de nuevo.`;
    }
    if (lang === "ca") {
      return `Gràcies${name ? ` ${name}` : ""} pel comentari. Ens alegra que en destaquessis: ${detail}. T’esperem de nou.`;
    }
    if (lang === "fr") {
      return `Merci${name ? ` ${name}` : ""} pour votre avis. Nous sommes contents que vous ayez noté : ${detail}. À bientôt.`;
    }
    return `Thank you${name ? ` ${name}` : ""} for the review. Glad you mentioned: ${detail}. We hope to see you again.`;
  }
  if (lang === "es") {
    return `Hola${name ? ` ${name}` : ""}. Gracias por escribirnos. Hemos leído tu comentario sobre: ${detail}. Queremos mejorar y te escuchamos.`;
  }
  if (lang === "ca") {
    return `Hola${name ? ` ${name}` : ""}. Gràcies per escriure. Hem llegit el teu comentari sobre: ${detail}. Volem millorar.`;
  }
  if (lang === "fr") {
    return `Bonjour${name ? ` ${name}` : ""}. Merci de nous avoir écrits. Nous avons lu votre retour sur : ${detail}. Nous voulons faire mieux.`;
  }
  return `Hello${name ? ` ${name}` : ""}. Thank you for writing. We read your note about: ${detail}. We want to do better.`;
}

const DRAFT_SYSTEM = `You write Google Business Profile review replies for independent shops.
Rules:
- Reply in the SAME language as the review (es, ca, fr, or en).
- 400 characters max.
- Reuse one concrete detail from the review. Do not invent facts.
- No employee names, no medical/hygiene claims, no invented discount or freebie.
- No apology that admits a specific incident unless the review stated it.
- Spanish: usted by default unless tone_notes say tutoiement / tú.
- Return only the reply text.`;

export async function draftOneAvis(avisId: string, opts?: { forceTemplate?: boolean }) {
  const avis = await prisma.avis.findUnique({
    where: { id: avisId },
    include: { client: true, reponses: { orderBy: { version: "desc" }, take: 1 } },
  });
  if (!avis) throw new Error("avis not found");
  if (avis.status === "publie" || avis.status === "bloque") return { skipped: true, reason: avis.status };

  const lang = detectLang(avis.body, avis.lang);
  let text: string | null = null;
  let model = "template";

  if (xaiKey() && !opts?.forceTemplate) {
    try {
      const prompt = `Business: ${avis.client.name}\nCity: ${avis.client.city}\nTone notes: ${avis.client.toneNotes || "(none)"}\nStars: ${avis.stars}\nLanguage hint: ${lang}\nAuthor: ${avis.authorPublicName || "anon"}\nReview:\n${avis.body}`;
      if (avis.stars >= 4) {
        text = await xaiFastText(DRAFT_SYSTEM, prompt);
        if (text) model = "fast";
      } else {
        text = await xaiText(DRAFT_SYSTEM, prompt, { maxTokens: 220, reasoning: "none" });
        if (text) model = xaiModel();
      }
    } catch (e) {
      console.warn("draft xAI failed, using template", e);
    }
  }
  if (!text) {
    text = templateDraft({
      stars: avis.stars,
      lang,
      author: avis.authorPublicName,
      body: avis.body,
      toneNotes: avis.client.toneNotes,
    });
  }
  text = clampReviewReply(text);

  const nextVersion = (avis.reponses[0]?.version ?? 0) + 1;
  await prisma.reponse.create({
    data: {
      avisId: avis.id,
      version: nextVersion,
      draftModel: model,
      draftText: text,
      actor: "agent",
    },
  });

  const low = avis.stars <= 3;
  await prisma.avis.update({
    where: { id: avis.id },
    data: {
      lang,
      status: low ? "attente_client" : "brouillon",
    },
  });

  await prisma.action.create({
    data: {
      clientId: avis.clientId,
      avisId: avis.id,
      type: "draft",
      actor: "draft",
      payload: { model, simulated: true },
      result: "ok",
    },
  });

  if (low) {
    await simPingLowStar({
      clientId: avis.clientId,
      avisId: avis.id,
      stars: avis.stars,
      lang,
      author: avis.authorPublicName,
      body: avis.body,
      draftText: text,
    });
  }

  return { avisId: avis.id, model, status: low ? "attente_client" : "brouillon" };
}

export async function draftMany(avisIds: string[]) {
  const useLlm = process.env.XAI_DRAFT_REVIEWS === "true";
  const results = [];
  for (let i = 0; i < avisIds.length; i++) {
    results.push(await draftOneAvis(avisIds[i], { forceTemplate: !useLlm || i >= 5 }));
  }
  const clientIds = [
    ...new Set(
      (
        await prisma.avis.findMany({
          where: { id: { in: avisIds } },
          select: { clientId: true },
        })
      ).map((a) => a.clientId),
    ),
  ];
  for (const clientId of clientIds) {
    await simDailyRecap(clientId);
  }
  return results;
}
