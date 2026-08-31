import { placeDetails, searchText, type PlaceReview } from "../places";

export type TargetVerdict = "keep" | "maybe" | "skip";

export type ScoutTarget = {
  placeId: string;
  name: string;
  address: string | null;
  mapsUri: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  businessStatus: string | null;
  reviewExcerpts: number;
  lowStarExcerpts: number;
  verdict: TargetVerdict;
  reasons: string[];
};

const CHAIN_MARKERS = [
  "mcdonald",
  "burger king",
  "kfc",
  "starbucks",
  "pizza hut",
  "domino",
  "telepizza",
  "subway",
  "five guys",
  "goiko",
  "vips",
  "foster's hollywood",
  "foster hollywood",
  "100 montaditos",
  "la tagliatella",
  "ginos",
  "tgb",
  "pans & company",
  "pans and company",
  "rodilla",
  "kiko",
  "nando's",
  "hard rock cafe",
];

function isChain(name: string) {
  const n = name.toLowerCase();
  return CHAIN_MARKERS.some((m) => n.includes(m));
}

function inCity(address: string | null, city: string) {
  if (!address) return false;
  const fold = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .toLowerCase();
  const a = fold(address);
  const c = fold(city);
  if (a.includes(c)) return true;
  if (c.includes("sant cugat") && a.includes("sant cugat")) return true;
  return false;
}

function judge(opts: {
  name: string;
  city: string;
  address: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  businessStatus: string | null;
  primaryType: string | null;
  reviews: PlaceReview[];
}): { verdict: TargetVerdict; reasons: string[] } {
  const reasons: string[] = [];
  let skip = false;
  let maybe = false;

  if (opts.businessStatus && opts.businessStatus !== "OPERATIONAL") {
    reasons.push(`Fiche ${opts.businessStatus} — on ne démarcherait pas une fiche fermée.`);
    skip = true;
  }

  if (!inCity(opts.address, opts.city)) {
    reasons.push(
      `Adresse hors ${opts.city} (ou ambiguë) : ${opts.address ?? "sans adresse"}. Places a pu élargir autour.`,
    );
    maybe = true;
  } else {
    reasons.push(`Dans ${opts.city} (adresse Places).`);
  }

  if (opts.primaryType && opts.primaryType !== "restaurant") {
    reasons.push(`Type principal « ${opts.primaryType} », pas restaurant stricto sensu.`);
    maybe = true;
  }

  const count = opts.userRatingCount ?? 0;
  if (count <= 0 && opts.reviews.length === 0) {
    reasons.push("Aucun avis Places. Rien à répondre, donc hors offre.");
    skip = true;
  } else if (count < 15) {
    reasons.push(`${count} avis au total — volume un peu bas, mais assez pour un premier test.`);
    maybe = true;
  } else {
    reasons.push(`${count} avis au total — assez de flux pour un abo réponses.`);
  }

  const low = opts.reviews.filter((r) => r.rating <= 3).length;
  const high = opts.reviews.filter((r) => r.rating >= 4).length;
  if (opts.reviews.length > 0) {
    reasons.push(
      `${opts.reviews.length} extraits Places (max 5) : ${high}×4–5★, ${low}×1–3★. L’historique complet n’est pas dans Places, seulement ces extraits.`,
    );
    if (low > 0) {
      reasons.push("Il y a au moins un 1–3★ dans les extraits : le parcours OK titulaire est testable.");
    } else {
      reasons.push("Extraits seulement 4–5★ : l’opérateur peut publier, le fil client 1–3★ peut rester vide sur cette fiche.");
    }
  }

  if (isChain(opts.name)) {
    reasons.push("Nom qui ressemble à une chaîne. En v1 on visait l’indépendant — à confirmer à la main.");
    maybe = true;
  } else {
    reasons.push("Pas une chaîne évidente sur le nom (heuristique courte, pas une vérité).");
  }

  if (opts.websiteUri) {
    reasons.push(`Site : ${opts.websiteUri} — plus tard on y chercherait un email / WA d’entreprise. Pas maintenant, et pas le tel Maps.`);
  } else {
    reasons.push("Pas de site dans Places. Pour le démarchage mail/WA ce serait skip ; pour le proto avis, on peut quand même s’en servir.");
    maybe = true;
  }

  reasons.push(
    "Avis sans réponse : Places ne le dit pas. Ça, c’est l’API Business Profile (fiche dont on est gestionnaire) ou un inspecteur plus tard.",
  );

  if (skip) return { verdict: "skip", reasons };
  if (maybe) return { verdict: "maybe", reasons };
  return { verdict: "keep", reasons };
}

export async function scoutCityTargets(opts: {
  city: string;
  country?: "ES" | "FR";
  categoryLabel?: string;
  includedType?: string;
  pageSize?: number;
  maxDetails?: number;
}) {
  const city = opts.city;
  const country = opts.country ?? "ES";
  const categoryLabel = opts.categoryLabel ?? "Restaurant";
  const includedType = opts.includedType ?? "restaurant";
  const pageSize = opts.pageSize ?? 12;
  const maxDetails = opts.maxDetails ?? 12;

  const hits = await searchText({
    textQuery: `${categoryLabel} in ${city}`,
    includedType,
    regionCode: country,
    languageCode: country === "ES" ? "ca" : "fr",
    pageSize,
  });

  const targets: ScoutTarget[] = [];
  const errors: string[] = [];

  for (const hit of hits.slice(0, maxDetails)) {
    try {
      const details = await placeDetails(hit.id);
      const judged = judge({
        name: details.name,
        city,
        address: details.formattedAddress ?? hit.formattedAddress,
        websiteUri: details.websiteUri ?? hit.websiteUri,
        rating: details.rating ?? hit.rating,
        userRatingCount: details.userRatingCount ?? hit.userRatingCount,
        businessStatus: details.businessStatus ?? hit.businessStatus,
        primaryType: details.primaryType ?? hit.primaryType,
        reviews: details.reviews,
      });
      targets.push({
        placeId: hit.id,
        name: details.name,
        address: details.formattedAddress ?? hit.formattedAddress,
        mapsUri: details.mapsUri ?? hit.mapsUri,
        websiteUri: details.websiteUri ?? hit.websiteUri,
        rating: details.rating ?? hit.rating,
        userRatingCount: details.userRatingCount ?? hit.userRatingCount,
        primaryType: details.primaryType ?? hit.primaryType,
        businessStatus: details.businessStatus ?? hit.businessStatus,
        reviewExcerpts: details.reviews.length,
        lowStarExcerpts: details.reviews.filter((r) => r.rating <= 3).length,
        verdict: judged.verdict,
        reasons: judged.reasons,
      });
    } catch (e) {
      errors.push(`${hit.name}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  const keep = targets.filter((t) => t.verdict === "keep");
  const maybe = targets.filter((t) => t.verdict === "maybe");
  const skip = targets.filter((t) => t.verdict === "skip");

  return {
    city,
    country,
    category: includedType,
    queried: hits.length,
    detailed: targets.length,
    keep: keep.length,
    maybe: maybe.length,
    skip: skip.length,
    targets,
    errors,
    notes: [
      "Lecture Places API (New) seulement. Pas de scraping Maps, pas d’email, pas de WhatsApp.",
      "Places Details donne au plus 5 extraits d’avis, pas l’inbox complète.",
      "« keep » = indépendant plausible, dans la ville, avec assez d’avis pour un test.",
      "« maybe » = à regarder (chaîne, hors ville, peu d’avis, pas de site).",
    ],
  };
}
