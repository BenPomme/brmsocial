import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const threads = await prisma.inboxThread.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 80,
    include: {
      lead: { select: { id: true, name: true, city: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 40 },
    },
  });
  return NextResponse.json({ threads });
}
