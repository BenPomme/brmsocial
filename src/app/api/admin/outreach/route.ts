import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { emailTrust } from "@/lib/site-contacts";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const leads = await prisma.lead.findMany({
    where: { outreachComposedAt: { not: null } },
    orderBy: { outreachComposedAt: "desc" },
    take: 80,
  });
  return NextResponse.json({
    leads: leads.map((l) => ({
      ...l,
      emailTrust: emailTrust(l.outreachTo ?? l.email, l.websiteUri),
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as { leadId?: string; decision?: string; note?: string };
  const map: Record<string, string> = {
    approve: "approved",
    reject: "rejected",
    change: "change_requested",
  };
  const status = body.decision ? map[body.decision] : null;
  if (!body.leadId || !status) {
    return NextResponse.json({ error: "leadId et decision (approve|reject|change) requis" }, { status: 400 });
  }
  const lead = await prisma.lead.update({
    where: { id: body.leadId },
    data: { outreachStatus: status, outreachNote: body.note?.trim() || null },
  });
  return NextResponse.json({ ok: true, lead: { id: lead.id, outreachStatus: lead.outreachStatus } });
}
