import { placesKey } from "./env";

const PLACES_BASE = "https://places.googleapis.com/v1";

export class PlacesError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "PlacesError";
  }
}

export type PlaceHit = {
  id: string;
  name: string;
  formattedAddress: string | null;
  mapsUri: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  primaryType: string | null;
  businessStatus: string | null;
  types: string[];
};

export type PlaceReview = {
  name: string;
  rating: number;
  text: string;
  languageCode: string | null;
  author: string | null;
  publishTime: string | null;
};

function requireKey() {
  const key = placesKey();
  if (!key) {
    throw new PlacesError(
      "GOOGLE_PLACES_API_KEY is missing. Scout cannot call Places.",
      0,
      "",
    );
  }
  return key;
}

async function placesFetch(url: string, init: RequestInit, fieldMask: string) {
  const key = requireKey();
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": fieldMask,
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new PlacesError(`Places API ${res.status}`, res.status, text.slice(0, 800));
  }
  return text ? JSON.parse(text) : {};
}

export async function searchText(opts: {
  textQuery: string;
  includedType?: string;
  regionCode?: string;
  languageCode?: string;
  pageSize?: number;
}): Promise<PlaceHit[]> {
  const pageSize = Math.min(Math.max(opts.pageSize ?? 10, 1), 20);
  const body: Record<string, unknown> = {
    textQuery: opts.textQuery,
    pageSize,
    strictTypeFiltering: Boolean(opts.includedType),
  };
  if (opts.includedType) body.includedType = opts.includedType;
  if (opts.regionCode) body.regionCode = opts.regionCode.toLowerCase();
  if (opts.languageCode) body.languageCode = opts.languageCode;

  const data = await placesFetch(
    `${PLACES_BASE}/places:searchText`,
    { method: "POST", body: JSON.stringify(body) },
    [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.googleMapsUri",
      "places.websiteUri",
      "places.rating",
      "places.userRatingCount",
      "places.primaryType",
      "places.businessStatus",
      "places.types",
    ].join(","),
  );

  const places = (data.places ?? []) as Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    primaryType?: string;
    businessStatus?: string;
    types?: string[];
  }>;

  return places
    .filter((p) => p.id)
    .map((p) => ({
      id: p.id as string,
      name: p.displayName?.text ?? p.id ?? "unknown",
      formattedAddress: p.formattedAddress ?? null,
      mapsUri: p.googleMapsUri ?? null,
      websiteUri: p.websiteUri ?? null,
      rating: typeof p.rating === "number" ? p.rating : null,
      userRatingCount: typeof p.userRatingCount === "number" ? p.userRatingCount : null,
      primaryType: p.primaryType ?? null,
      businessStatus: p.businessStatus ?? null,
      types: p.types ?? [],
    }));
}

export async function placeDetails(placeId: string): Promise<{
  id: string;
  name: string;
  formattedAddress: string | null;
  mapsUri: string | null;
  websiteUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  businessStatus: string | null;
  primaryType: string | null;
  reviews: PlaceReview[];
}> {
  const data = await placesFetch(
    `${PLACES_BASE}/places/${encodeURIComponent(placeId)}`,
    { method: "GET" },
    "id,displayName,formattedAddress,googleMapsUri,websiteUri,rating,userRatingCount,businessStatus,primaryType,reviews",
  );

  const reviewsRaw = (data.reviews ?? []) as Array<{
    name?: string;
    rating?: number;
    text?: { text?: string; languageCode?: string };
    originalText?: { text?: string; languageCode?: string };
    authorAttribution?: { displayName?: string };
    publishTime?: string;
  }>;

  const reviews: PlaceReview[] = reviewsRaw
    .map((r, i) => {
      const text = r.originalText?.text || r.text?.text || "";
      const languageCode = r.originalText?.languageCode || r.text?.languageCode || null;
      const rating = typeof r.rating === "number" ? Math.round(r.rating) : 0;
      if (!text || rating < 1) return null;
      return {
        name: r.name ?? `${placeId}/reviews/anon-${i}`,
        rating,
        text,
        languageCode,
        author: r.authorAttribution?.displayName ?? null,
        publishTime: r.publishTime ?? null,
      };
    })
    .filter((x): x is PlaceReview => x !== null);

  return {
    id: data.id ?? placeId,
    name: data.displayName?.text ?? placeId,
    formattedAddress: data.formattedAddress ?? null,
    mapsUri: data.googleMapsUri ?? null,
    websiteUri: data.websiteUri ?? null,
    rating: typeof data.rating === "number" ? data.rating : null,
    userRatingCount: typeof data.userRatingCount === "number" ? data.userRatingCount : null,
    businessStatus: data.businessStatus ?? null,
    primaryType: data.primaryType ?? null,
    reviews,
  };
}
