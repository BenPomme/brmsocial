import { prisma } from "../db";
import { envChecklist } from "../env";
import { placeDetails, searchText, type PlaceHit } from "../places";
import { detectLang } from "../language";
import { draftMany } from "./draft";

const COUNTRY_LANG: Record<string, string> = { ES: "es", FR: "fr" };

export async function runScout(
  payload: {
    cityId?: string;
    categoryId?: string;
    maxPlaces?: number;
    maxDetails?: number;
    skipDraft?: boolean;
  } = {},
) {
  const limits = envChecklist();
  const maxPlaces = payload.maxPlaces ?? limits.SCOUT_MAX_PLACES;
  const maxDetails = payload.maxDetails ?? limits.SCOUT_MAX_DETAILS;
  const maxAvis = 20;

  const cities = await prisma.scopeCity.findMany({
    where: {
      active: true,
      ...(payload.cityId ? { id: payload.cityId } : {}),
    },
  });
  const categories = await prisma.scopeCategory.findMany({
    where: {
      active: true,
      ...(payload.categoryId ? { id: payload.categoryId } : {}),
    },
  });

  if (cities.length === 0 || categories.length === 0) {
    return {
      dryRun: true,
      skipped: true,
      reason: "no active city × category in scope_*",
      cities: cities.map((c) => c.name),
      categories: categories.map((c) => c.slug),
    };
  }

  const operator = await prisma.user.findFirst({ where: { role: "operator", active: true } });
  const newAvisIds: string[] = [];
  const placeSummaries: Array<{
    placeId: string;
    name: string;
    city: string;
    category: string;
    reviews: number;
  }> = [];
  let detailsUsed = 0;
  const errors: string[] = [];

  for (const city of cities) {
    for (const category of categories) {
      const remainingPlaces = maxPlaces - placeSummaries.length;
      if (remainingPlaces <= 0) break;
      const query = `${category.label} in ${city.name}`;
      let hits: PlaceHit[] = [];
      try {
        hits = await searchText({
          textQuery: query,
          includedType: category.placesType,
          regionCode: city.country,
          languageCode: COUNTRY_LANG[city.country] ?? "es",
          pageSize: Math.min(remainingPlaces, maxPlaces),
        });
      } catch (e) {
        errors.push(`search ${query}: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }

      for (const hit of hits) {
        if (detailsUsed >= maxDetails) break;

        const lead = await prisma.lead.upsert({
          where: { placeId: hit.id },
          update: {
            name: hit.name,
            city: city.name,
            country: city.country,
            categorySlug: category.slug,
            formattedAddress: hit.formattedAddress,
            mapsUri: hit.mapsUri,
            websiteUri: hit.websiteUri,
            rating: hit.rating,
            userRatingCount: hit.userRatingCount,
            channelPlan: "skip",
          },
          create: {
            placeId: hit.id,
            name: hit.name,
            city: city.name,
            country: city.country,
            categorySlug: category.slug,
            formattedAddress: hit.formattedAddress,
            mapsUri: hit.mapsUri,
            websiteUri: hit.websiteUri,
            rating: hit.rating,
            userRatingCount: hit.userRatingCount,
            channelPlan: "skip",
            status: "new",
          },
        });

        const client = await prisma.client.upsert({
          where: { placeId: hit.id },
          update: {
            name: hit.name,
            city: city.name,
            country: city.country,
            formattedAddress: hit.formattedAddress,
            mapsUri: hit.mapsUri,
            rating: hit.rating,
            categoryId: category.id,
            operatorId: operator?.id ?? undefined,
          },
          create: {
            name: hit.name,
            city: city.name,
            country: city.country,
            placeId: hit.id,
            googleLocationId: hit.id,
            formattedAddress: hit.formattedAddress,
            mapsUri: hit.mapsUri,
            rating: hit.rating,
            categoryId: category.id,
            operatorId: operator?.id ?? null,
            status: "proto",
            plan: "avis_89",
            managerInviteStatus: "pending",
            publishLive: false,
          },
        });

        if (!lead.clientId) {
          await prisma.lead.update({
            where: { id: lead.id },
            data: { clientId: client.id },
          });
        }

        let imported = 0;
        try {
          const details = await placeDetails(hit.id);
          detailsUsed += 1;
          for (const review of details.reviews) {
            if (newAvisIds.length >= maxAvis) break;
            const existing = await prisma.avis.findUnique({
              where: { googleReviewId: review.name },
            });
            if (existing) continue;
            const created = await prisma.avis.create({
              data: {
                clientId: client.id,
                googleReviewId: review.name,
                stars: review.rating,
                lang: detectLang(review.text, review.languageCode),
                authorPublicName: review.author,
                body: review.text,
                reviewedAt: review.publishTime ? new Date(review.publishTime) : null,
                status: "nouveau",
              },
            });
            newAvisIds.push(created.id);
            imported += 1;
          }
        } catch (e) {
          errors.push(`details ${hit.id}: ${e instanceof Error ? e.message : String(e)}`);
        }

        placeSummaries.push({
          placeId: hit.id,
          name: hit.name,
          city: city.name,
          category: category.slug,
          reviews: imported,
        });
      }
    }
  }

  let drafts = 0;
  if (!payload.skipDraft && newAvisIds.length > 0) {
    const drafted = await draftMany(newAvisIds);
    drafts = drafted.length;
  }

  return {
    dryRun: true,
    carrier: "not run",
    cities: cities.map((c) => `${c.name} (${c.country})`),
    categories: categories.map((c) => c.slug),
    places: placeSummaries.length,
    newAvis: newAvisIds.length,
    drafts,
    detailsUsed,
    errors,
    sample: placeSummaries.slice(0, 8),
  };
}
