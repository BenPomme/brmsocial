import "server-only";
import { prisma } from "../db";
import { runFicheWatch } from "../agents/fiche-watch";
import { isGooglePlaceId } from "./live";

const HOUR_MS = 60 * 60 * 1000;

function madridNow(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    weekday: "short",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  return { weekday, hour };
}

export function isMondayWeeklyWindow(d = new Date()) {
  const { weekday, hour } = madridNow(d);
  return weekday === "Mon" && hour >= 10 && hour < 18;
}

let started = false;
let ticking = false;

export function startFicheWatchLoop() {
  if (started) return;
  started = true;
  const first = Number(process.env.FICHE_WATCH_FIRST_MS ?? 20_000);
  const every = Number(process.env.FICHE_WATCH_EVERY_MS ?? HOUR_MS);
  setTimeout(() => {
    void tickFicheWatch();
    setInterval(() => void tickFicheWatch(), every);
  }, first);
  console.log(`fiche_watch loop: first in ${first}ms, then every ${every}ms`);
}

export async function tickFicheWatch(now = new Date()) {
  if (ticking) return { skipped: true as const, reason: "in_flight" };
  ticking = true;
  try {
    const weekly = isMondayWeeklyWindow(now);
    const clients = await prisma.client.findMany({
      where: {
        placeId: { not: null },
        status: { notIn: ["dead"] },
      },
      select: { id: true, name: true, status: true, placeId: true },
    });
    const watchable = clients.filter((c) => isGooglePlaceId(c.placeId));
    const results: Array<{ id: string; name: string; ok: boolean; error?: string }> = [];
    for (const c of watchable) {
      try {
        await runFicheWatch({ clientId: c.id, weekly, now });
        results.push({ id: c.id, name: c.name, ok: true });
      } catch (e) {
        const error = e instanceof Error ? e.message : String(e);
        console.error(`fiche_watch failed for ${c.name}: ${error}`);
        results.push({ id: c.id, name: c.name, ok: false, error });
      }
    }
    console.log(
      `fiche_watch tick weekly=${weekly} listed=${clients.length} watchable=${watchable.length} ok=${results.filter((r) => r.ok).length}`,
    );
    return { skipped: false as const, weekly, results };
  } finally {
    ticking = false;
  }
}
