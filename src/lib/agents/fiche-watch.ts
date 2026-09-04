import "server-only";
import { prisma } from "../db";
import { diffFiche, ratingDelta, vanishedIds } from "../fiche/diff";
import { holidaysInWindow, mapsOpenOnDate, regionForCity } from "../fiche/holidays";
import { PlacesError } from "../places";
import { readFicheLive } from "../fiche/live";
import {
  composeDailyBody,
  composeWeeklyBody,
  dailyFicheLines,
  weeklyFicheLines,
} from "../fiche/recap";
import type { FicheLive, SuggestedEdit } from "../fiche/types";

function hoursFromText(hoursText: string | null): FicheLive["hours"] {
  if (!hoursText) return null;
  const weekdayDescriptions = hoursText.split(" | ").map((s) => s.trim()).filter(Boolean);
  return weekdayDescriptions.length ? { weekdayDescriptions } : null;
}

function liveFromRow(row: {
  source: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  hoursText: string | null;
  businessStatus: string | null;
  rating: number | null;
  ratingCount: number | null;
  reviewIds: unknown;
  calls: number | null;
  directionRequests: number | null;
  suggestedEdits: unknown;
}): FicheLive {
  const reviewIds = Array.isArray(row.reviewIds)
    ? row.reviewIds.filter((x): x is string => typeof x === "string")
    : null;
  const suggestedEdits = Array.isArray(row.suggestedEdits)
    ? (row.suggestedEdits as SuggestedEdit[])
    : null;
  return {
    source: row.source === "gbp" ? "gbp" : "places",
    name: row.name,
    phone: row.phone,
    address: row.address,
    hours: hoursFromText(row.hoursText),
    businessStatus: row.businessStatus,
    rating: row.rating,
    ratingCount: row.ratingCount,
    reviewIds,
    calls: row.calls,
    directionRequests: row.directionRequests,
    suggestedEdits,
  };
}

export async function runFicheWatch(opts: {
  clientId: string;
  weekly?: boolean;
  now?: Date;
}) {
  const now = opts.now ?? new Date();
  const client = await prisma.client.findUnique({ where: { id: opts.clientId } });
  if (!client) throw new Error("client not found");
  const clientId = client.id;
  const clientName = client.name;

  let live;
  try {
    live = await readFicheLive({ placeId: client.placeId });
  } catch (e) {
    if (e instanceof PlacesError) {
      return { skipped: true, reason: `places_${e.status}` as const };
    }
    throw e;
  }
  if (!live) {
    return { skipped: true, reason: "no_place_id_or_live" as const };
  }

  const prevRow = await prisma.ficheSnapshot.findFirst({
    where: { clientId: client.id },
    orderBy: { takenAt: "desc" },
  });
  const prev = prevRow ? liveFromRow(prevRow) : null;
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);
  const weekRow = await prisma.ficheSnapshot.findFirst({
    where: { clientId: client.id, takenAt: { lte: weekAgo } },
    orderBy: { takenAt: "desc" },
  });
  const weekPrev = weekRow ? liveFromRow(weekRow) : prev;

  const changes = diffFiche(prev, live);

  let vanishedCount: number | null = null;
  if (live.reviewIds) {
    const stored = await prisma.avis.findMany({
      where: { clientId: client.id, vanishedAt: null },
      select: { id: true, googleReviewId: true },
    });
    const gone = vanishedIds(
      stored.map((a) => a.googleReviewId),
      live.reviewIds,
    );
    if (gone) {
      vanishedCount = gone.length;
      if (gone.length) {
        await prisma.avis.updateMany({
          where: { clientId: client.id, googleReviewId: { in: gone }, vanishedAt: null },
          data: { vanishedAt: now },
        });
        await prisma.action.create({
          data: {
            clientId: client.id,
            type: "avis_vanished",
            actor: "fiche_watch",
            payload: { googleReviewIds: gone },
            result: "ok",
          },
        });
      }
    }
  }

  const region = regionForCity(client.city, client.country);
  const coming = holidaysInWindow({ from: now, days: 7, region });
  let upcomingHoliday: { date: string; name: string; mapsOpen: boolean } | null = null;
  const hoursLines = live.hours?.weekdayDescriptions ?? null;
  for (const h of coming) {
    const open = mapsOpenOnDate(hoursLines, h.date);
    if (open === true) {
      const holidayActions = await prisma.action.findMany({
        where: { clientId: client.id, type: "holiday_hours" },
        select: { payload: true },
      });
      const ownerClosed = holidayActions.some((a) => {
        const p = a.payload as { date?: string; status?: string };
        return p.date === h.date && p.status === "owner_cerrado";
      });
      if (ownerClosed) continue;
      upcomingHoliday = { date: h.date, name: h.name, mapsOpen: true };
      const already = holidayActions.some((a) => {
        const p = a.payload as { date?: string };
        return p.date === h.date;
      });
      if (!already) {
        await prisma.action.create({
          data: {
            clientId: client.id,
            type: "holiday_hours",
            actor: "fiche_watch",
            payload: { date: h.date, name: h.name, status: "pending" },
            result: "ok",
          },
        });
      }
      break;
    }
  }

  if (changes.length) {
    await prisma.action.create({
      data: {
        clientId: client.id,
        type: "fiche_change",
        actor: "fiche_watch",
        payload: { changes },
        result: "ok",
      },
    });
  }

  await prisma.ficheSnapshot.create({
    data: {
      clientId: client.id,
      takenAt: now,
      source: live.source,
      name: live.name,
      phone: live.phone,
      address: live.address,
      hoursText: live.hours?.weekdayDescriptions.join(" | ") ?? null,
      businessStatus: live.businessStatus,
      rating: live.rating,
      ratingCount: live.ratingCount,
      reviewIds: live.reviewIds ?? undefined,
      calls: live.calls,
      directionRequests: live.directionRequests,
      suggestedEdits: live.suggestedEdits ?? undefined,
      raw: { source: live.source },
    },
  });

  if (live.rating != null || live.ratingCount != null) {
    await prisma.client.update({
      where: { id: client.id },
      data: {
        rating: live.rating ?? client.rating,
        ratingCount: live.ratingCount ?? client.ratingCount,
      },
    });
  }

  const dailyLines = dailyFicheLines({
    changes,
    suggestedEdits: live.suggestedEdits,
    upcomingHoliday,
  });
  const dailyBody = composeDailyBody(client.name, dailyLines);

  let weeklyBody: string | null = null;
  if (opts.weekly) {
    const ficheLines = weeklyFicheLines({
      rating: live.rating,
      ratingCount: live.ratingCount,
      ratingDelta: ratingDelta(weekPrev?.rating ?? null, live.rating),
      ratingCountDelta:
        weekPrev?.ratingCount != null && live.ratingCount != null
          ? live.ratingCount - weekPrev.ratingCount
          : null,
      vanishedCount,
      calls: live.calls,
      directionRequests: live.directionRequests,
      suggestedEdits: live.suggestedEdits,
      changes,
      upcomingHoliday,
    });
    weeklyBody = composeWeeklyBody(clientName, [], ficheLines);
  }

  const day = now.toISOString().slice(0, 10);
  async function writeOnce(providerMsgId: string, body: string) {
    const exists = await prisma.messageWhatsapp.findFirst({ where: { providerMsgId } });
    if (exists) return false;
    await prisma.messageWhatsapp.create({
      data: {
        clientId,
        direction: "sim",
        body,
        providerMsgId,
      },
    });
    return true;
  }
  if (opts.weekly && weeklyBody) {
    const wrote = await writeOnce(`sim:recap-week:${clientId}:${day}`, weeklyBody);
    if (wrote) {
      const { emitRosaliaEvent } = await import("../rosalia-reply");
      await emitRosaliaEvent({ clientId, event: { type: "monday_recap", body: weeklyBody } });
    }
  } else if (!opts.weekly && dailyBody) {
    const wrote = await writeOnce(`sim:fiche:${clientId}:${day}`, dailyBody);
    if (wrote) {
      const { emitRosaliaEvent } = await import("../rosalia-reply");
      await emitRosaliaEvent({ clientId, event: { type: "fiche_alert", body: dailyBody } });
    }
  }

  return {
    skipped: false as const,
    source: live.source,
    changes: changes.length,
    vanishedCount,
    daily: Boolean(dailyBody),
    weekly: Boolean(weeklyBody),
  };
}
