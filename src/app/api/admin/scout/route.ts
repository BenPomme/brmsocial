import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { enqueueAndRun } from "@/lib/jobs";

export const maxDuration = 60;

export async function POST() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const scout = await enqueueAndRun("scout", { source: "manual" });
  return NextResponse.json({ ok: true, scout });
}
