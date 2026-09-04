import { prisma } from "../db";
import { OUTBOUND_ENABLED } from "../env";
import { placeDetails } from "../places";
import { channelPlanFor, emailTrust, findSiteContacts } from "../site-contacts";
import { fillOutreach, formatDateEs, loadOutreachTemplate } from "../outreach-template";

export type InspectSample = {
  reviewId?: string;
  stars?: number;
  author?: string | null;
  at?: string | null;
  excerpt?: string;
};

function pickSample(samples: InspectSample[]) {
  const withText = samples.filter((s) => (s.excerpt ?? "").trim().length > 0);
  const low = withText.find((s) => (s.stars ?? 5) <= 3);
  return low ?? withText[0] ?? samples[0] ?? null;
}

function replyRate(lead: { inspectReviews6m: number | null; inspectReplied6m: number | null }) {
  const n = lead.inspectReviews6m ?? 0;
  if (n <= 0) return 1;
  return (lead.inspectReplied6m ?? 0) / n;
}

export async function runCarrier(
  payload: {
    city?: string;
    leadId?: string;
    maxLeads?: number;
    /** Compose only. Send is a different job and is refused in this proto. */
    send?: boolean;
  } = {},
) {
  if (payload.send) {
    return {
      dryRun: true,
      sent: 0,
      refused: true,
      reason: "OUTBOUND_ENABLED=false — Carrier composes, it does not send.",
    };
  }

  const template = loadOutreachTemplate();
  const maxLeads = payload.maxLeads ?? 1;
  const leads = await prisma.lead.findMany({
    where: {
      ...(payload.leadId ? { id: payload.leadId } : {}),
      ...(payload.city ? { city: payload.city } : {}),
    },
    orderBy: { inspectUnreplied6m: "desc" },
    take: 40,
  });

  const eligible = leads.filter((l) => {
    const n = l.userRatingCount ?? 0;
    if (n <= 50) return false;
    const verdict = l.inspectVerdict;
    if (verdict === "orphan") return true;
    if (verdict === "partial" && replyRate(l) < 0.15) return true;
    return false;
  });

  const targets = (payload.leadId ? leads : eligible).slice(0, maxLeads);
  const composed: Array<{
    leadId: string;
    name: string;
    to: string | null;
    from: string;
    subject: string;
    body: string;
    websiteUri: string | null;
    emailsFound: string[];
    whatsappFound: string[];
    emailTrust: ReturnType<typeof emailTrust> | null;
    skipped: string | null;
  }> = [];

  for (const lead of targets) {
    let websiteUri = lead.websiteUri;
    if (!websiteUri) {
      try {
        const details = await placeDetails(lead.placeId);
        websiteUri = details.websiteUri;
        if (websiteUri) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { websiteUri },
          });
        }
      } catch (e) {
        composed.push({
          leadId: lead.id,
          name: lead.name,
          to: null,
          from: template.from,
          subject: "",
          body: "",
          websiteUri: null,
          emailsFound: [],
          whatsappFound: [],
          emailTrust: emailTrust(null, null),
          skipped: `Places details: ${e instanceof Error ? e.message : String(e)}`,
        });
        continue;
      }
    }

    if (!websiteUri) {
      composed.push({
        leadId: lead.id,
        name: lead.name,
        to: null,
        from: template.from,
        subject: "",
        body: "",
        websiteUri: null,
        emailsFound: [],
        whatsappFound: [],
        emailTrust: emailTrust(null, null),
        skipped: "no website on the Maps listing — cannot take a Maps phone",
      });
      continue;
    }

    const contacts = await findSiteContacts(websiteUri);
    const email = contacts.emails[0] ?? null;
    const wa = contacts.whatsapp[0] ?? null;
    const trust = emailTrust(email, websiteUri);
    const plan = channelPlanFor(email, wa);

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        websiteUri,
        email,
        waSite: wa,
        channelPlan: plan,
      },
    });

    if (!email) {
      composed.push({
        leadId: lead.id,
        name: lead.name,
        to: null,
        from: template.from,
        subject: "",
        body: "",
        websiteUri,
        emailsFound: contacts.emails,
        whatsappFound: contacts.whatsapp,
        emailTrust: trust,
        skipped: `no email on site (${contacts.pagesVisited.length} pages)`,
      });
      continue;
    }

    const samples = (Array.isArray(lead.inspectSample) ? lead.inspectSample : []) as InspectSample[];
    const sample = pickSample(samples);
    if (!sample) {
      composed.push({
        leadId: lead.id,
        name: lead.name,
        to: email,
        from: template.from,
        subject: "",
        body: "",
        websiteUri,
        emailsFound: contacts.emails,
        whatsappFound: contacts.whatsapp,
        emailTrust: trust,
        skipped: "no inspect sample to quote",
      });
      continue;
    }

    const letter = fillOutreach(template, {
      restaurant: lead.name,
      author: sample.author?.trim() || "un cliente",
      date: formatDateEs(sample.at),
      stars: sample.stars ?? "",
      excerpt: (sample.excerpt ?? "").trim(),
      whatsapp: process.env.BABYROCK_WHATSAPP_DISPLAY?.trim() || "el WhatsApp de Babyrock (se lo confirmamos al responder)",
      city: lead.city,
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        outreachTo: email,
        outreachSubject: letter.subject,
        outreachBody: letter.body,
        outreachComposedAt: new Date(),
        outreachStatus: "composed",
      },
    });

    if (lead.clientId) {
      await prisma.action.create({
        data: {
          clientId: lead.clientId,
          type: "outreach_compose",
          actor: "carrier",
          payload: {
            templateId: template.id,
            from: letter.from,
            fromName: letter.fromName,
            to: email,
            subject: letter.subject,
            body: letter.body,
            emailTrust: trust,
            send: false,
            outboundEnabled: OUTBOUND_ENABLED,
          },
          result: "ok",
        },
      });
    }

    composed.push({
      leadId: lead.id,
      name: lead.name,
      to: email,
      from: letter.from,
      subject: letter.subject,
      body: letter.body,
      websiteUri,
      emailsFound: contacts.emails,
      whatsappFound: contacts.whatsapp,
      emailTrust: trust,
      skipped: null,
    });
  }

  return {
    dryRun: true,
    sent: 0,
    outboundEnabled: OUTBOUND_ENABLED,
    templateId: template.id,
    from: template.from,
    city: payload.city ?? null,
    eligible: eligible.length,
    attempted: targets.length,
    composed: composed.filter((c) => !c.skipped).length,
    rows: composed,
  };
}
