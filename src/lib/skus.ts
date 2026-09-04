/** BabyRock Social SKUs only. TTC. Factura = HT + IVA 21 %. France B2B = HT. */

import { isProductLive, type ProductId } from "./products";

export const IVA_PERCENT = 21;

export type SkuId = "avis_month" | "avis_year";
export type PayPlanId = "month" | "year" | "trial_santcugat";

export type Sku = {
  id: SkuId;
  productId: ProductId;
  lookupKey: string;
  ttc: number;
  label: string;
  description: string;
};

export const SKUS: Record<SkuId, Sku> = {
  avis_month: {
    id: "avis_month",
    productId: "social",
    lookupKey: "avis_month",
    ttc: 9900,
    label: "BabyRock Social — mes a mes",
    description: "99 € IVA incl. al mes. Respuestas a reseñas de Google.",
  },
  avis_year: {
    id: "avis_year",
    productId: "social",
    lookupKey: "avis_year",
    ttc: 79900,
    label: "BabyRock Social — doce meses",
    description: "799 € IVA incl. al año. Un tercio menos que pagar mes a mes.",
  },
};

export function splitTtc(ttcCents: number) {
  const ht = Math.round(ttcCents / (1 + IVA_PERCENT / 100));
  return { ttc: ttcCents, ht, iva: ttcCents - ht };
}

export function liveSkus(): Sku[] {
  return Object.values(SKUS).filter((sku) => isProductLive(sku.productId));
}

export function skuForPlan(plan: PayPlanId): Sku {
  const sku = plan === "year" ? SKUS.avis_year : SKUS.avis_month;
  if (!isProductLive(sku.productId)) {
    throw new Error(`SKU ${sku.id} is not on sale`);
  }
  return sku;
}

export function formatEur(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}
