import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { enqueueAndRun } from "@/lib/jobs";
import { tickFicheWatch } from "@/lib/fiche/loop";

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json().catch(() => ({}))) as {
    clientId?: string;
    weekly?: boolean;
    all?: boolean;
  };
  if (body.all || !body.clientId) {
    const tick = await tickFicheWatch();
    return NextResponse.json(tick);
  }
  const run = await enqueueAndRun("fiche_watch", {
    clientId: body.clientId,
    weekly: body.weekly === true,
  });
  return NextResponse.json(run);
}
