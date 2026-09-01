import type Stripe from "stripe";
import { prisma } from "./db";
import { appUrl, siteUrl } from "./env";
import { getStripe } from "./stripe";

export type PayPlanId = "month" | "year";

export const PAY_PLANS: Record<
  PayPlanId,
  { id: PayPlanId; amount: number; label: string; description: string }
> = {
  month: {
    id: "month",
    amount: 8900,
    label: "Babyrock Social — mes a mes",
    description: "89 € HT. Respuestas a reseñas de Google, un mes.",
  },
  year: {
    id: "year",
    amount: 74800,
    label: "Babyrock Social — doce meses",
    description: "748 € HT. Respuestas a reseñas de Google, doce meses.",
  },
};

export function parsePayPlan(raw: unknown): PayPlanId {
  return raw === "year" ? "year" : "month";
}

export function originFromRequest(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const proto = (req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "")).replace(/:$/, "");
  if (host) return `${proto}://${host}`;
  const configured = appUrl();
  if (configured) return configured.replace(/\/$/, "");
  return url.origin;
}

export function payCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") ?? "";
  const allowed = new Set(
    [siteUrl(), appUrl(), "http://localhost:3000", "http://localhost:3001", "https://www.babyrock.ai", "https://babyrock.ai"]
      .filter(Boolean)
      .map((u) => u!.replace(/\/$/, "")),
  );
  const allow = allowed.has(origin) ? origin : siteUrl().replace(/\/$/, "");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function resolvePayClient(input: {
  clientId?: string | null;
  name?: string | null;
  email?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  mapsUri?: string | null;
}) {
  if (input.clientId) {
    const c = await prisma.client.findUnique({ where: { id: input.clientId } });
    if (!c) throw new Error("client introuvable");
    return c;
  }
  const email = input.email?.trim().toLowerCase();
  if (email) {
    const existing = await prisma.client.findFirst({
      where: { emailPublic: { equals: email, mode: "insensitive" } },
    });
    if (existing) return existing;
  }
  return prisma.client.create({
    data: {
      name: (input.name ?? "").trim() || "Simu Stripe",
      city: input.city?.trim() || null,
      country: "ES",
      emailPublic: email || null,
      whatsappOwner: input.whatsapp?.trim() || null,
      mapsUri: input.mapsUri?.trim() || null,
      plan: "avis_89",
      status: "lead",
    },
  });
}

function sessionIdFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const id = (payload as { sessionId?: unknown }).sessionId;
  return typeof id === "string" ? id : null;
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") {
    return { ok: false as const, reason: "not_paid" as const, paymentStatus: session.payment_status };
  }
  const clientId = session.client_reference_id || session.metadata?.clientId || null;
  if (!clientId) return { ok: false as const, reason: "no_client" as const };

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { ok: false as const, reason: "client_missing" as const };

  const already = await prisma.action.findFirst({
    where: { clientId: client.id, type: "billing", result: "ok" },
    orderBy: { createdAt: "desc" },
  });
  if (already && sessionIdFromPayload(already.payload) === session.id) {
    return { ok: true as const, clientId: client.id, already: true as const };
  }

  const nextStatus = client.status === "lead" ? "paye" : client.status;
  const email = session.customer_details?.email ?? client.emailPublic;

  await prisma.$transaction(async (tx) => {
    await tx.client.update({
      where: { id: client.id },
      data: {
        status: nextStatus,
        stripeOrBizumRef: session.id,
        emailPublic: email,
      },
    });
    await tx.lead.updateMany({
      where: { clientId: client.id },
      data: { status: "paid" },
    });
    await tx.action.create({
      data: {
        clientId: client.id,
        type: "billing",
        actor: "stripe",
        result: "ok",
        payload: {
          event: "checkout_paid",
          sessionId: session.id,
          plan: session.metadata?.plan ?? "month",
          amount: session.amount_total,
          currency: session.currency,
          livemode: session.livemode,
          paymentStatus: session.payment_status,
        },
      },
    });
  });

  return { ok: true as const, clientId: client.id, already: false as const };
}

export async function createCheckoutSession(opts: {
  req: Request;
  plan: PayPlanId;
  clientId?: string | null;
  name?: string | null;
  email?: string | null;
  city?: string | null;
  whatsapp?: string | null;
  mapsUri?: string | null;
}) {
  const plan = PAY_PLANS[opts.plan];
  const client = await resolvePayClient(opts);
  const origin = originFromRequest(opts.req);
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "es",
    customer_email: opts.email?.trim() || client.emailPublic || undefined,
    client_reference_id: client.id,
    metadata: {
      clientId: client.id,
      plan: plan.id,
      source: "factory",
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: plan.amount,
          product_data: {
            name: plan.label,
            description: plan.description,
          },
        },
      },
    ],
    success_url: `${origin}/pay/ok?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pay?canceled=1`,
  });

  await prisma.action.create({
    data: {
      clientId: client.id,
      type: "billing",
      actor: "stripe",
      result: "ok",
      payload: {
        event: "checkout_created",
        sessionId: session.id,
        plan: plan.id,
        amount: plan.amount,
      },
    },
  });

  if (!session.url) throw new Error("Stripe n’a pas renvoyé d’URL Checkout");
  return { url: session.url, sessionId: session.id, clientId: client.id };
}
