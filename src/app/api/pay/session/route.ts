import { NextResponse } from "next/server";
import { stripeSecretKey } from "@/lib/env";
import { fulfillCheckoutSession, resolveInvoice, retrieveCheckout } from "@/lib/pay";

export async function GET(req: Request) {
  if (!stripeSecretKey()) {
    return NextResponse.json({ error: "Stripe n’est pas configuré" }, { status: 503 });
  }
  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!sessionId) return NextResponse.json({ error: "session_id manquant" }, { status: 400 });

  try {
    const session = await retrieveCheckout(sessionId);
    const result = await fulfillCheckoutSession(session);
    const invoice = result.ok ? result.invoice : await resolveInvoice(session);
    return NextResponse.json({
      ok: result.ok,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
      invoice: { id: invoice.id, pdf: invoice.pdf, hosted: invoice.hosted },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "session";
    console.warn("pay session", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
