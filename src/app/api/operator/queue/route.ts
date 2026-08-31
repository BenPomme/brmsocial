import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { publishTextFromLatest } from "@/lib/agents/publish";

export async function GET() {
  const session = await requireRole(["operator", "admin"]);
  if (isResponse(session)) return session;

  const avis = await prisma.avis.findMany({
    where: {
      client: {
        status: { in: ["proto", "actif", "paye"] },
      },
    },
    include: {
      client: { select: { id: true, name: true, city: true, country: true, publishLive: true, managerInviteStatus: true } },
      reponses: { orderBy: { version: "desc" }, take: 1 },
    },
    orderBy: [{ stars: "desc" }, { createdAt: "desc" }],
    take: 200,
  });

  return NextResponse.json({
    avis: avis.map((a) => {
      const latest = a.reponses[0] ?? null;
      return {
        id: a.id,
        client: a.client,
        stars: a.stars,
        lang: a.lang,
        authorPublicName: a.authorPublicName,
        body: a.body,
        reviewedAt: a.reviewedAt,
        status: a.status,
        draftText: latest?.draftText ?? null,
        operatorText: latest?.operatorText ?? null,
        sentToOwnerText: latest?.sentToOwnerText ?? null,
        publishedText: latest?.publishedText ?? null,
        currentText: latest ? publishTextFromLatest(latest) : "",
        draftModel: latest?.draftModel ?? null,
      };
    }),
  });
}
