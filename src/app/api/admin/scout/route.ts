import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { firstScan } from "@/lib/first-scan";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json().catch(() => ({}))) as {
    force?: boolean;
    cityId?: string;
    categoryId?: string;
  };
  const scan = await firstScan({
    actor: session.email,
    force: body.force === true,
    cityId: body.cityId,
    categoryId: body.categoryId,
  });
  return NextResponse.json({ ok: true, scan });
}
