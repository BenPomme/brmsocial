import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deliverInvoiceEmail, fulfillCheckoutSession, retrieveCheckout, str } from "@/lib/pay";
import { stripeSecretKey } from "@/lib/env";

export async function POST(req: Request) {
  if (!stripeSecretKey()) {
    return NextResponse.json({ error: "Stripe n’est pas configuré" }, { status: 503 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  const sessionId = str(body.sessionId) ?? str(body.session_id);
  if (!sessionId) return NextResponse.json({ error: "session_id manquant" }, { status: 400 });

  try {
    const session = await retrieveCheckout(sessionId);
    const result = await fulfillCheckoutSession(session);
    if (!result.ok) {
      return NextResponse.json({ error: "paiement pas encore confirmé", paymentStatus: result.paymentStatus }, { status: 409 });
    }
    const client = await prisma.client.findUnique({ where: { id: result.clientId } });
    const mailed = await deliverInvoiceEmail({
      to: client?.billingEmail ?? client?.emailPublic ?? session.customer_details?.email ?? null,
      legalName: client?.legalName ?? client?.name ?? "Cliente",
      taxId: client?.taxId ?? null,
      amount: session.amount_total,
      invoice: result.invoice,
      livemode: session.livemode,
    });
    return NextResponse.json({ ok: true, mailed });
  } catch (e) {
    const message = e instanceof Error ? e.message : "resend";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
