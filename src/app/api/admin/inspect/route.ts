import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { enqueueAndRun } from "@/lib/jobs";

export const maxDuration = 180;

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  let city: string | undefined;
  try {
    const body = (await req.json()) as { city?: string };
    if (typeof body.city === "string" && body.city.trim()) city = body.city.trim();
  } catch {
    city = undefined;
  }
  const inspect = await enqueueAndRun("inspect", {
    source: "manual",
    ...(city ? { city } : {}),
    maxLeads: 20,
  });
  return NextResponse.json({ ok: true, inspect });
}
