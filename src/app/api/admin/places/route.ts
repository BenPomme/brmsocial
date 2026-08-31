import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { listPlacesInActiveScope } from "@/lib/scope-query";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const data = await listPlacesInActiveScope();
  return NextResponse.json(data);
}
