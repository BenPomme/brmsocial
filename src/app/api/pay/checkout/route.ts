import { NextResponse } from "next/server";
import { stripeMode, stripeSecretKey } from "@/lib/env";
import { createCheckoutSession, parsePayPlan, payCorsHeaders } from "@/lib/pay";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: payCorsHeaders(req) });
}

export async function POST(req: Request) {
  const headers = payCorsHeaders(req);
  if (!stripeSecretKey()) {
    return NextResponse.json({ error: "Stripe n’est pas configuré" }, { status: 503, headers });
  }
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  try {
    const session = await createCheckoutSession({
      req,
      plan: parsePayPlan(body.plan),
      clientId: typeof body.clientId === "string" ? body.clientId : null,
      name: typeof body.name === "string" ? body.name : null,
      email: typeof body.email === "string" ? body.email : null,
      city: typeof body.city === "string" ? body.city : null,
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : null,
      mapsUri: typeof body.mapsUri === "string" ? body.mapsUri : null,
    });
    return NextResponse.json({ ...session, mode: stripeMode() }, { headers });
  } catch (e) {
    const message = e instanceof Error ? e.message : "échec checkout";
    return NextResponse.json({ error: message }, { status: 400, headers });
  }
}
