import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { loadScopeState } from "@/lib/scope-query";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const state = await loadScopeState();
  return NextResponse.json(state);
}
