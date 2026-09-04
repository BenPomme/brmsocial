import { placeDetails } from "../places";
import type { FicheLive } from "./types";

/**
 * Read the public fiche. GBP Insights / suggested edits / full review ids
 * stay null until the manager token can fetch them. Never invent.
 */
export function isGooglePlaceId(placeId: string | null | undefined): placeId is string {
  if (!placeId) return false;
  if (/^demo[-_]/i.test(placeId)) return false;
  return /^(places\/)?ChIJ/.test(placeId) || placeId.length >= 20;
}

export async function readFicheLive(opts: {
  placeId: string | null;
}): Promise<FicheLive | null> {
  if (!isGooglePlaceId(opts.placeId)) return null;
  const p = await placeDetails(opts.placeId);
  return {
    source: "places",
    name: p.name,
    phone: p.internationalPhone || p.nationalPhone,
    address: p.formattedAddress,
    hours: p.hours,
    businessStatus: p.businessStatus,
    rating: p.rating,
    ratingCount: p.userRatingCount,
    reviewIds: null,
    calls: null,
    directionRequests: null,
    suggestedEdits: null,
  };
}
