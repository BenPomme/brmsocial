import { prisma } from "./db";
import { emailTrust } from "./site-contacts";

export async function loadScopeState() {
  const [cities, categories, changes, scans] = await Promise.all([
    prisma.scopeCity.findMany({ orderBy: [{ country: "asc" }, { name: "asc" }] }),
    prisma.scopeCategory.findMany({ orderBy: { label: "asc" } }),
    prisma.scopeChange.findMany({ orderBy: { createdAt: "desc" }, take: 40 }),
    prisma.scopeScan.findMany({ orderBy: { scannedAt: "desc" } }),
  ]);
  return { cities, categories, changes, scans };
}

export async function listPlacesInActiveScope() {
  const [cities, categories] = await Promise.all([
    prisma.scopeCity.findMany({ where: { active: true } }),
    prisma.scopeCategory.findMany({ where: { active: true } }),
  ]);
  const cityNames = cities.map((c) => c.name);
  const catIds = categories.map((c) => c.id);
  if (cityNames.length === 0 || catIds.length === 0) {
    return { cities, categories, clients: [] as Awaited<ReturnType<typeof prisma.client.findMany>> };
  }
  const clients = await prisma.client.findMany({
    where: {
      city: { in: cityNames },
      categoryId: { in: catIds },
    },
    include: {
      category: true,
      lead: {
        select: {
          userRatingCount: true,
          inspectAt: true,
          inspectReviews6m: true,
          inspectReplied6m: true,
          inspectUnreplied6m: true,
          inspectVerdict: true,
          inspectTruncated: true,
          inspectCostUsd: true,
          inspectError: true,
          email: true,
          websiteUri: true,
          outreachTo: true,
          outreachSubject: true,
        },
      },
      _count: { select: { avis: true } },
    },
    orderBy: { name: "asc" },
  });
  return {
    cities,
    categories,
    clients: clients.map((c) => ({
      ...c,
      lead: c.lead
        ? {
            ...c.lead,
            emailTrust: emailTrust(c.lead.email ?? c.lead.outreachTo, c.lead.websiteUri),
          }
        : null,
    })),
  };
}
