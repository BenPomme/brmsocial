import { NextResponse } from "next/server";
import { stripeSecretKey } from "@/lib/env";
import { fulfillCheckoutSession } from "@/lib/pay";
import { getStripe } from "@/lib/stripe";

export async function GET(req: Request) {
  if (!stripeSecretKey()) {
    return NextResponse.json({ error: "Stripe n’est pas configuré" }, { status: 503 });
  }
  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!sessionId) return NextResponse.json({ error: "session_id manquant" }, { status: 400 });

  const session = await getStripe().checkout.sessions.retrieve(sessionId);
  const result = await fulfillCheckoutSession(session);
  return NextResponse.json({
    paymentStatus: session.payment_status,
    status: session.status,
    amountTotal: session.amount_total,
    currency: session.currency,
    customerEmail: session.customer_details?.email ?? null,
    livemode: session.livemode,
    ...result,
  });
}
