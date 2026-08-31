import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { editAvis } from "@/lib/agents/publish";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["operator", "admin"]);
  if (isResponse(session)) return session;
  const { id } = await ctx.params;
  const body = (await req.json()) as { text?: string };
  const text = (body.text ?? "").trim();
  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 });
  try {
    const result = await editAvis({ avisId: id, actor: session.email, text });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
