import Link from "next/link";
import { prisma } from "@/lib/db";
import { SANT_CUGAT_OFFER } from "@/lib/offers";
import { SKUS, splitTtc, formatEur } from "@/lib/skus";

export default async function TrialOkPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: clientId } = await searchParams;
  const row = clientId
    ? await prisma.client.findUnique({
        where: { id: clientId },
        select: {
          name: true,
          legalName: true,
          taxId: true,
          status: true,
          trialEndsAt: true,
          catchupMonths: true,
          billingCity: true,
          city: true,
        },
      })
    : null;

  const then = splitTtc(SKUS.avis_month.ttc);
  const until = row?.trialEndsAt
    ? row.trialEndsAt.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/70 border border-line rounded-2xl p-6 shadow-card">
        <p className="font-display text-3xl mb-2">Mes gratis — Sant Cugat</p>
        <p className="text-sm text-muted mb-4">
          {row?.legalName ?? row?.name ?? "El comercio"} queda en estado{" "}
          <span className="text-ink">{row?.status ?? "essai"}</span>. Primer mes 0 €. Rattrapage: avisos
          sin respuesta de los últimos {row?.catchupMonths ?? SANT_CUGAT_OFFER.catchupMonths} meses.
          A partir del {until ?? "día 31"}: {formatEur(then.ttc)} IVA incl. ({formatEur(then.ht)} + IVA).
        </p>
        <p className="text-sm text-muted mb-6">
          Siguiente paso: añadir <strong>reviews@babyrock.ai</strong> como gestor de la ficha de Google.
          El cobro del 2.º mes se hace con un enlace de pago (aún no es un abono Stripe automático).
        </p>
        <Link href="/admin" className="underline decoration-line underline-offset-4 text-sm">
          Volver al admin
        </Link>
      </div>
    </main>
  );
}
