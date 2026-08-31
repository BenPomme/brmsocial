import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { CHECKLIST_KEYS, publishAvis, type Checklist } from "@/lib/agents/publish";
import { prisma } from "@/lib/db";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["operator", "admin"]);
  if (isResponse(session)) return session;
  const { id } = await ctx.params;
  const body = (await req.json()) as { checklist?: Partial<Checklist> };
  const checklist = {} as Checklist;
  for (const k of CHECKLIST_KEYS) {
    checklist[k] = body.checklist?.[k] === true;
  }
  try {
    const published = await publishAvis({
      avisId: id,
      actor: session.email,
      checklist,
    });
    await prisma.job.create({
      data: {
        kind: "publish",
        payload: {
          avisId: id,
          actor: session.email,
          checklist,
          dryRun: published.dryRun,
          reason: published.reason,
        },
        status: "done",
        result: published as object,
      },
    });
    return NextResponse.json(published);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
