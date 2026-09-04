import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { applyScopeChange, rejectScopeChange } from "@/lib/agents/scope";
import { firstScan } from "@/lib/first-scan";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as { id?: string; decision?: string };
  if (!body.id || (body.decision !== "apply" && body.decision !== "reject")) {
    return NextResponse.json({ error: "id and decision required" }, { status: 400 });
  }
  if (body.decision === "reject") {
    await rejectScopeChange(body.id, session.email);
    return NextResponse.json({ ok: true, status: "rejected" });
  }
  const applied = await applyScopeChange(body.id, session.email);
  const scan = await firstScan({ actor: session.email });
  return NextResponse.json({ ok: true, status: "applied", applied, scan });
}
