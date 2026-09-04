import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { toggleCategory, toggleCity } from "@/lib/agents/scope";
import { firstScan } from "@/lib/first-scan";
import { prisma } from "@/lib/db";

export const maxDuration = 300;

export async function POST(req: Request) {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const body = (await req.json()) as {
    kind?: "city" | "category";
    id?: string;
    active?: boolean;
  };
  if (!body.id || (body.kind !== "city" && body.kind !== "category") || typeof body.active !== "boolean") {
    return NextResponse.json({ error: "kind, id, active required" }, { status: 400 });
  }

  if (body.kind === "city") {
    const row = await toggleCity(body.id, body.active);
    await prisma.scopeChange.create({
      data: {
        actor: "admin",
        rawMessage: `toggle city ${row.name} → ${body.active ? "on" : "off"}`,
        reply: null,
        diff: { cities: [{ name: row.name, country: row.country, active: body.active }] },
        status: "applied",
      },
    });
  } else {
    const row = await toggleCategory(body.id, body.active);
    await prisma.scopeChange.create({
      data: {
        actor: "admin",
        rawMessage: `toggle category ${row.slug} → ${body.active ? "on" : "off"}`,
        reply: null,
        diff: { categories: [{ slug: row.slug, active: body.active }] },
        status: "applied",
      },
    });
  }

  let scan = null;
  if (body.active) {
    scan = await firstScan({
      actor: session.email,
      cityId: body.kind === "city" ? body.id : undefined,
      categoryId: body.kind === "category" ? body.id : undefined,
    });
  }
  return NextResponse.json({ ok: true, scan });
}
