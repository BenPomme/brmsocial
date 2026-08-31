import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { blockAvis } from "@/lib/agents/publish";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["operator", "admin"]);
  if (isResponse(session)) return session;
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { reason?: string };
  try {
    await blockAvis({ avisId: id, actor: session.email, reason: body.reason });
    return NextResponse.json({ ok: true, status: "bloque" });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
