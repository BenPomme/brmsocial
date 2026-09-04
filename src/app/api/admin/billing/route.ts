import { NextResponse } from "next/server";
import { isResponse, requireRole } from "@/lib/api-guard";
import { prisma } from "@/lib/db";
import { stripeMode } from "@/lib/env";

export async function GET() {
  const session = await requireRole(["admin"]);
  if (isResponse(session)) return session;
  const clients = await prisma.client.findMany({
    where: {
      OR: [
        { stripeOrBizumRef: { not: null } },
        { status: { in: ["lead", "paye", "paid", "actif", "essai"] } },
        { billingEmail: { not: null } },
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 80,
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
      plan: true,
      emailPublic: true,
      billingEmail: true,
      whatsappOwner: true,
      legalName: true,
      taxId: true,
      vatMode: true,
      stripeOrBizumRef: true,
      stripeInvoiceId: true,
      offer: true,
      trialEndsAt: true,
      catchupMonths: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ mode: stripeMode(), clients });
}
