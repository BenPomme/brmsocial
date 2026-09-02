/** Catalogue TTC. La factura sort HT + IVA 21 %. France B2B (autoliquidation) = HT seulement. */

export const IVA_PERCENT = 21;

export type SkuId = "avis_month" | "avis_year";
export type PayPlanId = "month" | "year" | "trial_santcugat";

export type Sku = {
  id: SkuId;
  lookupKey: string;
  ttc: number;
  label: string;
  description: string;
};

export const SKUS: Record<SkuId, Sku> = {
  avis_month: {
    id: "avis_month",
    lookupKey: "avis_month",
    ttc: 9900,
    label: "Babyrock Social — mes a mes",
    description: "99 € IVA incl. al mes. Respuestas a reseñas de Google.",
  },
  avis_year: {
    id: "avis_year",
    lookupKey: "avis_year",
    ttc: 79900,
    label: "Babyrock Social — doce meses",
    description: "799 € IVA incl. al año. Un tercio menos que pagar mes a mes.",
  },
};

export function splitTtc(ttcCents: number) {
  const ht = Math.round(ttcCents / (1 + IVA_PERCENT / 100));
  return { ttc: ttcCents, ht, iva: ttcCents - ht };
}

export function skuForPlan(plan: PayPlanId): Sku {
  return plan === "year" ? SKUS.avis_year : SKUS.avis_month;
}

export function formatEur(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
