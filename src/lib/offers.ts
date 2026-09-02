/** Offre locale Sant Cugat : 1er mois 0 €, rattrapage 3 mois d’avis, puis 99 € TTC. */

export const SANT_CUGAT_OFFER = {
  id: "santcugat_trial",
  trialDays: 30,
  catchupMonths: 3,
  thenSku: "avis_month" as const,
};

export function isSantCugat(city: string | null | undefined): boolean {
  const raw = (city ?? "").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const compact = raw.replace(/[^a-z]/g, "");
  return compact.includes("santcugat") || compact.includes("stcugat");
}
