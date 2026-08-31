import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { enqueueAndRun } from "@/lib/jobs";

export const maxDuration = 60;

export async function POST() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const sync = await enqueueAndRun("inbox_sync", { source: "manual" });
  return NextResponse.json({ ok: true, sync });
}
