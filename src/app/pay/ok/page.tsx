import Link from "next/link";
import { fulfillCheckoutSession, waitForInvoice } from "@/lib/pay";
import { stripeSecretKey } from "@/lib/env";
import { prisma } from "@/lib/db";
import { InvoiceLinks } from "../InvoiceLinks";

export default async function PayOkPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId || !stripeSecretKey()) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted">Falta session_id, o Stripe no está configurado.</p>
      </main>
    );
  }

  const waited = await waitForInvoice(sessionId);
  const result = await fulfillCheckoutSession(waited.session);
  const invoice = result.ok ? result.invoice : waited.invoice;
  const client =
    result.ok && result.clientId
      ? await prisma.client.findUnique({
          where: { id: result.clientId },
          select: {
            name: true,
            legalName: true,
            taxId: true,
            status: true,
            emailPublic: true,
            billingEmail: true,
            vatMode: true,
            stripeOrBizumRef: true,
          },
        })
      : null;

  const paid = result.ok;
  const pendingSepa = !paid && waited.session.payment_status !== "paid";
  const session = waited.session;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/70 border border-line rounded-2xl p-6 shadow-card">
        <p className="font-display text-3xl mb-2">{paid ? "Pago recibido" : pendingSepa ? "Pago en curso" : "Pago"}</p>
        {paid && (
          <p className="text-sm text-muted mb-4">
            {client?.legalName ?? client?.name ?? "El comercio"} queda en estado{" "}
            <span className="text-ink">{client?.status}</span>. Siguiente paso: añadir{" "}
            <strong>reviews@babyrock.ai</strong> como gestor de la ficha de Google.
          </p>
        )}
        {pendingSepa && (
          <p className="text-sm text-muted mb-4">
            SEPA tarda varios días laborables. Cuando Stripe confirme el cobro, el estado pasará a
            pagado y saldrá la factura.
          </p>
        )}
        <dl className="text-sm space-y-1 mb-6">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Importe</dt>
            <dd>{session.amount_total != null ? `${(session.amount_total / 100).toFixed(2)} €` : "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">NIF/CIF</dt>
            <dd>{client?.taxId ?? "—"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">IVA</dt>
            <dd>{client?.vatMode === "eu_reverse" ? "autoliquidación" : "21 % ES"}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted">Correo</dt>
            <dd className="truncate">{session.customer_details?.email ?? client?.billingEmail ?? "—"}</dd>
          </div>
        </dl>
        {paid ? (
          <InvoiceLinks
            sessionId={sessionId}
            initial={{ hosted: invoice.hosted, pdf: invoice.pdf }}
          />
        ) : null}
        <Link href="/admin" className="underline decoration-line underline-offset-4 text-sm">
          Volver al admin
        </Link>
      </div>
    </main>
  );
}
