import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await requireRole(["client", "admin"]);
  if (isResponse(session)) return session;

  const where =
    session.role === "client" && session.clientId
      ? { id: session.clientId }
      : { status: { in: ["proto", "actif"] } };

  const clients = await prisma.client.findMany({
    where,
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      avis: {
        where: { stars: { lte: 3 }, status: { in: ["attente_client", "pret"] } },
        select: { id: true, stars: true, status: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const threads = clients
    .filter((c) => c.messages.length > 0 || c.avis.length > 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city,
      lastMessage: c.messages[0]?.body ?? null,
      lastAt: c.messages[0]?.createdAt ?? null,
      pendingLow: c.avis.filter((a) => a.status === "attente_client").length,
    }));

  return NextResponse.json({ threads });
}
