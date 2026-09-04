import { prisma } from "./db";
import { runScout } from "./agents/scout";
import { runInspect } from "./agents/inspect";
import { runCarrier } from "./agents/carrier";
import { REVIEW_FLOOR } from "./pipeline";

export async function firstScan(opts: {
  actor: string;
  force?: boolean;
  cityId?: string;
  categoryId?: string;
}) {
  const cities = await prisma.scopeCity.findMany({
    where: { active: true, ...(opts.cityId ? { id: opts.cityId } : {}) },
  });
  const categories = await prisma.scopeCategory.findMany({
    where: { active: true, ...(opts.categoryId ? { id: opts.categoryId } : {}) },
  });
  const waves: Array<{
    area: string;
    category: string;
    skipped: boolean;
    places?: number;
    inspected?: number;
    composed?: number;
    error?: string;
  }> = [];

  if (cities.length === 0 || categories.length === 0) {
    return { waves, reason: "no active area × category" };
  }

  for (const city of cities) {
    for (const category of categories) {
      const existing = await prisma.scopeScan.findUnique({
        where: {
          areaName_country_categorySlug: {
            areaName: city.name,
            country: city.country,
            categorySlug: category.slug,
          },
        },
      });
      if (existing && !opts.force) {
        waves.push({ area: city.name, category: category.slug, skipped: true });
        continue;
      }

      if (opts.force) {
        await prisma.lead.updateMany({
          where: { city: city.name, categorySlug: category.slug },
          data: { inspectAt: null },
        });
      }

      const scout = await runScout({
        cityId: city.id,
        categoryId: category.id,
        skipDraft: true,
        skipExisting: !opts.force,
      });
      if ("skipped" in scout && scout.skipped) {
        waves.push({
          area: city.name,
          category: category.slug,
          skipped: true,
          error: "reason" in scout ? String(scout.reason) : "scout skipped",
        });
        continue;
      }

      const fresh = await prisma.lead.findMany({
        where: {
          city: city.name,
          categorySlug: category.slug,
          userRatingCount: { gte: REVIEW_FLOOR },
          inspectAt: null,
        },
        select: { id: true },
      });
      let inspected = 0;
      if (fresh.length) {
        const inspect = await runInspect({ leadIds: fresh.map((l) => l.id), maxLeads: fresh.length });
        inspected = inspect.leads ?? 0;
      }

      const toCompose = await prisma.lead.findMany({
        where: {
          city: city.name,
          categorySlug: category.slug,
          userRatingCount: { gte: REVIEW_FLOOR },
          OR: [{ email: { not: null } }, { outreachTo: { not: null } }],
          outreachBody: null,
        },
        select: { id: true },
        take: 40,
      });
      let composed = 0;
      for (const row of toCompose) {
        const out = await runCarrier({ leadId: row.id, maxLeads: 1, send: false });
        composed += out.composed ?? 0;
      }

      await prisma.scopeScan.upsert({
        where: {
          areaName_country_categorySlug: {
            areaName: city.name,
            country: city.country,
            categorySlug: category.slug,
          },
        },
        create: {
          areaName: city.name,
          country: city.country,
          categorySlug: category.slug,
          actor: opts.actor,
        },
        update: { scannedAt: new Date(), actor: opts.actor },
      });

      waves.push({
        area: city.name,
        category: category.slug,
        skipped: false,
        places: "places" in scout ? scout.places : undefined,
        inspected,
        composed,
      });
    }
  }

  return { waves };
}
