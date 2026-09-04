/** Live Social prices, offers, and coming-soon products. The only euro amounts Rosalia and /pay may speak. */

import { isSantCugat, SANT_CUGAT_OFFER } from "./offers";
import { PRODUCTS, type ProductId } from "./products";
import { SKUS } from "./skus";

export const MANAGER_EMAIL = "reviews@babyrock.ai";

export type SpeechLang = "es" | "ca" | "en" | "fr";

export type CatalogOffer = {
  id: string;
  trialDays: number;
  catchupMonths: number;
  thenSku: "avis_month";
};

export type CatalogQuote = {
  productId: "social";
  productName: string;
  monthTtc: number;
  yearTtc: number;
  monthLabel: string;
  yearLabel: string;
  offer: CatalogOffer | null;
  offerLines: Record<SpeechLang, string>;
  cityHintLines: Record<SpeechLang, string>;
  comingSoon: { id: ProductId; name: string }[];
  managerEmail: string;
};

/** Whole euros → "99 €". Cents → "99,50 €". */
export function formatTtcSpeech(cents: number) {
  if (cents % 100 === 0) return `${cents / 100} €`;
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export function cityLooksSantCugat(text: string | null | undefined) {
  return isSantCugat(text);
}

/** Prefer a known lead/client city; if the titulaire names Sant Cugat in chat, that counts. */
export function resolveQuoteCity(opts: { city?: string | null; inbound?: string | null }) {
  if (isSantCugat(opts.city)) return opts.city!.trim();
  if (isSantCugat(opts.inbound)) return "Sant Cugat del Vallès";
  return (opts.city ?? "").trim() || null;
}

export function quoteFor(opts: { city?: string | null; inbound?: string | null } = {}): CatalogQuote {
  const city = resolveQuoteCity(opts);
  const month = SKUS.avis_month;
  const year = SKUS.avis_year;
  const monthLabel = formatTtcSpeech(month.ttc);
  const yearLabel = formatTtcSpeech(year.ttc);
  const offer = isSantCugat(city)
    ? {
        id: SANT_CUGAT_OFFER.id,
        trialDays: SANT_CUGAT_OFFER.trialDays,
        catchupMonths: SANT_CUGAT_OFFER.catchupMonths,
        thenSku: SANT_CUGAT_OFFER.thenSku,
      }
    : null;

  const offerLines: Record<SpeechLang, string> = offer
    ? {
        es: `En Sant Cugat del Vallès el primer mes es 0 € y ponemos al día las reseñas de los ${offer.catchupMonths} meses anteriores; luego ${monthLabel}/mes.`,
        ca: `A Sant Cugat del Vallès el primer mes és 0 € i posem al dia les ressenyes dels ${offer.catchupMonths} mesos anteriors; després ${monthLabel}/mes.`,
        en: `In Sant Cugat del Vallès the first month is 0 € and we catch up unanswered reviews from the last ${offer.catchupMonths} months; then ${monthLabel}/month.`,
        fr: `À Sant Cugat del Vallès le premier mois est à 0 € et nous rattrapons les avis des ${offer.catchupMonths} mois précédents ; ensuite ${monthLabel}/mois.`,
      }
    : { es: "", ca: "", en: "", fr: "" };

  const cityHintLines: Record<SpeechLang, string> = offer
    ? { es: "", ca: "", en: "", fr: "" }
    : {
        es: `Si su comercio está en Sant Cugat del Vallès, el primer mes es 0 €.`,
        ca: `Si el seu comerç és a Sant Cugat del Vallès, el primer mes és 0 €.`,
        en: `If the shop is in Sant Cugat del Vallès, the first month is 0 €.`,
        fr: `Si le commerce est à Sant Cugat del Vallès, le premier mois est à 0 €.`,
      };

  return {
    productId: "social",
    productName: PRODUCTS.social.name,
    monthTtc: month.ttc,
    yearTtc: year.ttc,
    monthLabel,
    yearLabel,
    offer,
    offerLines,
    cityHintLines,
    comingSoon: (Object.values(PRODUCTS) as { id: ProductId; name: string; status: string }[])
      .filter((p) => p.status === "coming_soon")
      .map((p) => ({ id: p.id, name: p.name })),
    managerEmail: MANAGER_EMAIL,
  };
}

export const COMMERCIAL_OK = new Set(["paye", "essai", "actif"]);

export function isCommercialOk(status: string | null | undefined) {
  return Boolean(status && COMMERCIAL_OK.has(status));
}
