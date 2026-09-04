import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { emailTrust } from "@/lib/site-contacts";
import { hasTo, pipelineStatus } from "@/lib/pipeline";
import { runCarrier } from "@/lib/agents/carrier";

export const maxDuration = 120;

export async function GET() {
  const session = await requireRole(["admin", "operator"]);
  if (isResponse(session)) return session;
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 400,
    include: {
      client: { select: { id: true, status: true, stripeCustomerId: true } },
      inboxThreads: {
        orderBy: { lastMessageAt: "desc" },
        take: 1,
        select: { status: true, channel: true, lastMessageAt: true },
      },
    },
  });
  return NextResponse.json({
    leads: leads.map((l) => {
      const thread = l.inboxThreads[0];
      const pipe = pipelineStatus(l, l.client, thread?.status);
      const rate =
        l.inspectReviews6m && l.inspectReviews6m > 0
          ? Math.round((100 * (l.inspectReplied6m ?? 0)) / l.inspectReviews6m)
          : null;
      return {
        id: l.id,
        name: l.name,
        city: l.city,
        categorySlug: l.categorySlug,
        source: l.source,
        mapsUri: l.mapsUri,
        rating: l.rating,
        userRatingCount: l.userRatingCount,
        inspectReviews6m: l.inspectReviews6m,
        inspectUnreplied6m: l.inspectUnreplied6m,
        inspectVerdict: l.inspectVerdict,
        replyPct: rate,
        email: l.email,
        outreachTo: l.outreachTo,
        waSite: l.waSite,
        mapsPhone: l.mapsPhone,
        websiteUri: l.websiteUri,
        outreachSubject: l.outreachSubject,
        outreachBody: l.outreachBody,
        outreachStatus: l.outreachStatus,
        contactSource: l.contactSource,
        pipeline: pipe,
        emailTrust: emailTrust(l.outreachTo ?? l.email, l.websiteUri),
        lastInbox: thread?.channel ?? null,
        lastInboxStatus: thread?.status ?? null,
        paid: pipe === "paid",
      };
    }),
  });
}

export async function POST(req: Request) {
  const session = await requireRole(["admin", "operator"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as {
    action?: string;
    leadId?: string;
    leadIds?: string[];
    email?: string;
    wa?: string;
    outreachBody?: string;
  };
  if (!body.action) return NextResponse.json({ error: "action required" }, { status: 400 });

  if (body.action === "contact") {
    if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
    const email = body.email?.trim() || null;
    const wa = body.wa?.trim() || null;
    if (!email && !wa) return NextResponse.json({ error: "email or WhatsApp required" }, { status: 400 });
    const lead = await prisma.lead.update({
      where: { id: body.leadId },
      data: {
        email: email ?? undefined,
        outreachTo: email ?? undefined,
        waSite: wa ?? undefined,
        contactSource: "manual",
        contactActor: session.email,
      },
    });
    return NextResponse.json({ ok: true, leadId: lead.id });
  }

  if (body.action === "save_draft") {
    if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
    await prisma.lead.update({
      where: { id: body.leadId },
      data: { outreachBody: body.outreachBody ?? "", outreachStatus: "composed" },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "compose") {
    if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
    const result = await runCarrier({ leadId: body.leadId, maxLeads: 1, send: false });
    return NextResponse.json({ ok: true, result });
  }

  if (body.action === "approve") {
    if (!body.leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
    const lead = await prisma.lead.findUnique({ where: { id: body.leadId } });
    if (!lead) return NextResponse.json({ error: "not found" }, { status: 404 });
    if (!hasTo(lead)) return NextResponse.json({ error: "Approve needs a To: (email or WhatsApp)" }, { status: 400 });
    if (lead.outreachStatus === "sent") {
      return NextResponse.json({ error: "already sent" }, { status: 400 });
    }
    await prisma.lead.update({
      where: { id: lead.id },
      data: { outreachStatus: "approved" },
    });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "send_lot") {
    const ids = body.leadIds ?? (body.leadId ? [body.leadId] : []);
    const leads = await prisma.lead.findMany({ where: { id: { in: ids } } });
    const skipped: string[] = [];
    const queued: string[] = [];
    for (const lead of leads) {
      if (lead.outreachStatus === "sent") {
        skipped.push(`${lead.name}: already sent`);
        continue;
      }
      if (lead.outreachStatus !== "approved") {
        skipped.push(`${lead.name}: not approved`);
        continue;
      }
      if (!hasTo(lead)) {
        skipped.push(`${lead.name}: no To:`);
        continue;
      }
      queued.push(lead.id);
    }
    const send = queued.length
      ? await runCarrier({ leadId: queued[0], send: true })
      : { refused: true, reason: "nothing to send" };
    return NextResponse.json({
      ok: true,
      queued: queued.length,
      skipped,
      delivery: send,
    });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
