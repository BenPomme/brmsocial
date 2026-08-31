import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { proposeScope } from "@/lib/agents/scope";

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as { message?: string };
  const message = (body.message ?? "").trim();
  if (!message) return NextResponse.json({ error: "empty message" }, { status: 400 });
  const result = await proposeScope(message);
  return NextResponse.json(result);
}
