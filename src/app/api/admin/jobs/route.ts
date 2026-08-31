import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const actions = await prisma.action.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      type: true,
      actor: true,
      result: true,
      payload: true,
      errorText: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ jobs, actions });
}
