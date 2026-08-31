import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { inspectMaxDepth, inspectWindowMonths } from "../env";
import {
  DataForSeoError,
  dfsLocationFor,
  getGoogleReviewsTask,
  googlePlaceId,
  listGoogleReviewsTasksReady,
  postGoogleReviewsTasks,
  reviewsDepth,
  waitForGoogleReviewsTasks,
  type DfsReview,
  type DfsReviewsResult,
} from "../dataforseo";

export type InspectVerdict = "orphan" | "partial" | "replies" | "no_recent" | "no_reviews" | "error";

export type InspectSample = {
  reviewId: string;
  stars: number;
  author: string | null;
  at: string | null;
  excerpt: string;
};

export type InspectLeadRow = {
  leadId: string;
  placeId: string;
  name: string;
  city: string;
  rating: number | null;
  userRatingCount: number | null;
  mapsUri: string | null;
  verdict: InspectVerdict;
  reviews6m: number;
  replied6m: number;
  unreplied6m: number;
  truncated: boolean;
  costUsd: number;
  error: string | null;
  sampleOrphans: InspectSample[];
};

function windowStart(months: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  return d;
}

function inWindow(review: DfsReview, since: Date) {
  if (!review.reviewedAt) return false;
  return review.reviewedAt >= since;
}

function excerpt(text: string, n = 140) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1).trim()}…`;
}

function verdictFor(reviews6m: number, replied: number, unreplied: number): InspectVerdict {
  if (reviews6m <= 0) return "no_recent";
  if (replied === 0 && unreplied > 0) return "orphan";
  if (unreplied > 0) return "partial";
  return "replies";
}

function scoreResult(result: DfsReviewsResult, since: Date, depth: number) {
  const windowed = result.reviews.filter((r) => inWindow(r, since));
  const replied = windowed.filter((r) => r.ownerAnswer).length;
  const unreplied = windowed.length - replied;
  const oldestFetched = result.reviews
    .map((r) => r.reviewedAt)
    .filter((d): d is Date => d != null)
    .sort((a, b) => a.getTime() - b.getTime())[0];
  const truncated =
    result.itemsCount >= depth &&
    oldestFetched != null &&
    oldestFetched >= since &&
    (result.reviewsCount ?? 0) > result.itemsCount;
  let verdict: InspectVerdict;
  if ((result.reviewsCount ?? 0) === 0 && windowed.length === 0) verdict = "no_reviews";
  else verdict = verdictFor(windowed.length, replied, unreplied);
  const sampleOrphans: InspectSample[] = windowed
    .filter((r) => !r.ownerAnswer)
    .slice(0, 8)
    .map((r) => ({
      reviewId: r.reviewId,
      stars: r.stars,
      author: r.author,
      at: r.reviewedAt?.toISOString() ?? null,
      excerpt: excerpt(r.text),
    }));
  return {
    reviews6m: windowed.length,
    replied6m: replied,
    unreplied6m: unreplied,
    truncated,
    verdict,
    sampleOrphans,
    costUsd: result.cost,
  };
}

export async function runInspect(
  payload: { city?: string; leadIds?: string[]; maxLeads?: number } = {},
) {
  const months = inspectWindowMonths();
  const since = windowStart(months);
  const maxDepth = inspectMaxDepth();
  const maxLeads = payload.maxLeads ?? 20;

  const leads = await prisma.lead.findMany({
    where: {
      ...(payload.leadIds?.length ? { id: { in: payload.leadIds } } : {}),
      ...(payload.city ? { city: payload.city } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: maxLeads,
  });

  const empty = {
    dryRun: true as const,
    carrier: "not run" as const,
    city: payload.city ?? null as string | null,
    months,
    since: since.toISOString(),
    leads: 0,
    costUsd: 0,
    orphan: 0,
    partial: 0,
    replies: 0,
    no_recent: 0,
    errors: [] as string[],
    rows: [] as InspectLeadRow[],
  };

  if (leads.length === 0) {
    return { ...empty, skipped: true, reason: "no leads to inspect (run scout first)" };
  }

  const locByCountry = new Map<string, ReturnType<typeof dfsLocationFor>>();
  const tasks = leads.map((lead) => {
    const country = lead.country ?? "ES";
    if (!locByCountry.has(country + lead.city)) {
      locByCountry.set(country + lead.city, dfsLocationFor(lead.city, country));
    }
    const loc = locByCountry.get(country + lead.city)!;
    return {
      place_id: lead.placeId,
      language_code: loc.language_code,
      depth: reviewsDepth(lead.userRatingCount, maxDepth),
      tag: lead.id,
      location_code: loc.location_code,
      location_name: loc.location_name,
    };
  });

  let posted;
  try {
    posted = await postGoogleReviewsTasks(tasks);
  } catch (e) {
    const message = e instanceof DataForSeoError ? e.message : e instanceof Error ? e.message : String(e);
    return {
      ...empty,
      skipped: false,
      reason: message,
      city: payload.city ?? leads[0]?.city ?? null,
      leads: leads.length,
      errors: [message],
    };
  }

  const idByLead = new Map<string, string>();
  const postCostByLead = new Map<string, number>();
  const postErrors: string[] = [];
  for (const p of posted) {
    const lead = leads.find((l) => l.id === p.tag) ?? null;
    if (!lead) {
      postErrors.push(`task tag=${p.tag ?? "?"} unmatched`);
      continue;
    }
    if (p.error || !p.id) {
      postErrors.push(`${lead.name}: ${p.error ?? "no task id"}`);
      continue;
    }
    idByLead.set(lead.id, p.id);
    postCostByLead.set(lead.id, p.cost);
  }

  const fetched = await waitForGoogleReviewsTasks([...idByLead.values()], {
    timeoutMs: 150_000,
    intervalMs: 2500,
  });

  const rows: InspectLeadRow[] = [];
  let costUsd = 0;

  for (const lead of leads) {
    const taskId = idByLead.get(lead.id);
    const postCost = postCostByLead.get(lead.id) ?? 0;
    if (!taskId) {
      const error = `task_post failed`;
      await persistInspect(lead.id, lead.clientId, {
        verdict: "error",
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: 0,
        error,
        sample: [],
      });
      rows.push({
        leadId: lead.id,
        placeId: lead.placeId,
        name: lead.name,
        city: lead.city,
        rating: lead.rating,
        userRatingCount: lead.userRatingCount,
        mapsUri: lead.mapsUri,
        verdict: "error",
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: 0,
        error,
        sampleOrphans: [],
      });
      continue;
    }

    const got = fetched.get(taskId);
    if (!got || !got.ready) {
      const error = "DataForSEO still pending";
      await persistInspect(lead.id, lead.clientId, {
        verdict: "error",
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: postCost,
        error,
        sample: [],
      });
      costUsd += postCost;
      rows.push({
        leadId: lead.id,
        placeId: lead.placeId,
        name: lead.name,
        city: lead.city,
        rating: lead.rating,
        userRatingCount: lead.userRatingCount,
        mapsUri: lead.mapsUri,
        verdict: "error",
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: postCost,
        error,
        sampleOrphans: [],
      });
      continue;
    }
    if (!got.ok) {
      const error = `${got.status} ${got.message}`;
      const c = got.cost || postCost;
      costUsd += c;
      const verdict: InspectVerdict =
        lead.userRatingCount && lead.userRatingCount > 0 ? "error" : "no_reviews";
      await persistInspect(lead.id, lead.clientId, {
        verdict,
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: c,
        error,
        sample: [],
      });
      rows.push({
        leadId: lead.id,
        placeId: lead.placeId,
        name: lead.name,
        city: lead.city,
        rating: lead.rating,
        userRatingCount: lead.userRatingCount,
        mapsUri: lead.mapsUri,
        verdict,
        reviews6m: 0,
        replied6m: 0,
        unreplied6m: 0,
        truncated: false,
        costUsd: c,
        error,
        sampleOrphans: [],
      });
      continue;
    }

    const result = got.result;
    const scored = scoreResult(result, since, tasks.find((t) => t.tag === lead.id)?.depth ?? maxDepth);
    const c = scored.costUsd || postCost;
    costUsd += c;
    await persistInspect(lead.id, lead.clientId, {
      verdict: scored.verdict,
      reviews6m: scored.reviews6m,
      replied6m: scored.replied6m,
      unreplied6m: scored.unreplied6m,
      truncated: scored.truncated,
      costUsd: c,
      error: null,
      sample: scored.sampleOrphans,
    });
    rows.push({
      leadId: lead.id,
      placeId: lead.placeId,
      name: lead.name,
      city: lead.city,
      rating: lead.rating,
      userRatingCount: lead.userRatingCount,
      mapsUri: lead.mapsUri,
      verdict: scored.verdict,
      reviews6m: scored.reviews6m,
      replied6m: scored.replied6m,
      unreplied6m: scored.unreplied6m,
      truncated: scored.truncated,
      costUsd: c,
      error: null,
      sampleOrphans: scored.sampleOrphans,
    });
  }

  const orphans = rows.filter((r) => r.verdict === "orphan");
  const partial = rows.filter((r) => r.verdict === "partial");

  return {
    dryRun: true,
    carrier: "not run",
    city: payload.city ?? leads[0]?.city ?? null,
    months,
    since: since.toISOString(),
    leads: leads.length,
    costUsd: Number(costUsd.toFixed(6)),
    orphan: orphans.length,
    partial: partial.length,
    replies: rows.filter((r) => r.verdict === "replies").length,
    no_recent: rows.filter((r) => r.verdict === "no_recent" || r.verdict === "no_reviews").length,
    errors: [...postErrors, ...rows.filter((r) => r.error).map((r) => `${r.name}: ${r.error}`)],
    rows: rows.sort((a, b) => b.unreplied6m - a.unreplied6m || b.reviews6m - a.reviews6m),
  };
}

/** Pull already-paid tasks (tasks_ready) so a failed poll does not charge twice. */
export async function collectInspectReady(payload: { city?: string } = {}) {
  const months = inspectWindowMonths();
  const since = windowStart(months);
  const maxDepth = inspectMaxDepth();
  const ids = await listGoogleReviewsTasksReady();
  const leads = await prisma.lead.findMany({
    where: payload.city ? { city: payload.city } : {},
  });
  const byId = new Map(leads.map((l) => [l.id, l]));
  const byPlace = new Map(leads.map((l) => [googlePlaceId(l.placeId), l]));

  const rows: InspectLeadRow[] = [];
  const errors: string[] = [];
  let costUsd = 0;

  for (const id of ids) {
    const got = await getGoogleReviewsTask(id);
    if (!got.ready) continue;
    if (!got.ok) {
      errors.push(`${id}: ${got.status} ${got.message}`);
      continue;
    }
    const result = got.result;
    const lead =
      (result.tag ? byId.get(result.tag) : undefined) ??
      (result.placeId ? byPlace.get(googlePlaceId(result.placeId)) : undefined);
    if (!lead) {
      errors.push(`${id}: unmatched tag=${result.tag} place=${result.placeId}`);
      continue;
    }
    const scored = scoreResult(result, since, reviewsDepth(lead.userRatingCount, maxDepth));
    const c = scored.costUsd;
    costUsd += c;
    await persistInspect(lead.id, lead.clientId, {
      verdict: scored.verdict,
      reviews6m: scored.reviews6m,
      replied6m: scored.replied6m,
      unreplied6m: scored.unreplied6m,
      truncated: scored.truncated,
      costUsd: c,
      error: null,
      sample: scored.sampleOrphans,
    });
    rows.push({
      leadId: lead.id,
      placeId: lead.placeId,
      name: lead.name,
      city: lead.city,
      rating: lead.rating,
      userRatingCount: lead.userRatingCount,
      mapsUri: lead.mapsUri,
      verdict: scored.verdict,
      reviews6m: scored.reviews6m,
      replied6m: scored.replied6m,
      unreplied6m: scored.unreplied6m,
      truncated: scored.truncated,
      costUsd: c,
      error: null,
      sampleOrphans: scored.sampleOrphans,
    });
  }

  return {
    dryRun: true,
    carrier: "not run",
    city: payload.city ?? null,
    months,
    since: since.toISOString(),
    leads: rows.length,
    readyIds: ids.length,
    costUsd: Number(costUsd.toFixed(6)),
    orphan: rows.filter((r) => r.verdict === "orphan").length,
    partial: rows.filter((r) => r.verdict === "partial").length,
    replies: rows.filter((r) => r.verdict === "replies").length,
    no_recent: rows.filter((r) => r.verdict === "no_recent" || r.verdict === "no_reviews").length,
    errors,
    rows: rows.sort((a, b) => b.unreplied6m - a.unreplied6m || b.reviews6m - a.reviews6m),
  };
}

async function persistInspect(
  leadId: string,
  clientId: string | null,
  data: {
    verdict: InspectVerdict;
    reviews6m: number;
    replied6m: number;
    unreplied6m: number;
    truncated: boolean;
    costUsd: number;
    error: string | null;
    sample: InspectSample[];
  },
) {
  await prisma.lead.update({
    where: { id: leadId },
    data: {
      inspectAt: new Date(),
      inspectReviews6m: data.reviews6m,
      inspectReplied6m: data.replied6m,
      inspectUnreplied6m: data.unreplied6m,
      inspectVerdict: data.verdict,
      inspectTruncated: data.truncated,
      inspectCostUsd: data.costUsd,
      inspectError: data.error,
      inspectSample: data.sample as unknown as Prisma.InputJsonValue,
    },
  });
  if (clientId) {
    await prisma.action.create({
      data: {
        clientId,
        type: "inspect",
        actor: "inspect",
        payload: {
          verdict: data.verdict,
          reviews6m: data.reviews6m,
          replied6m: data.replied6m,
          unreplied6m: data.unreplied6m,
          truncated: data.truncated,
          costUsd: data.costUsd,
        },
        result: data.error ? "fail" : "ok",
        errorText: data.error,
      },
    });
  }
}
