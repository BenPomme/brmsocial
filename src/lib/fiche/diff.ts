import type { FicheChange, FicheLive } from "./types";

function norm(s: string | null | undefined): string | null {
  if (s == null) return null;
  const t = s.replace(/\s+/g, " ").trim();
  return t === "" ? null : t;
}

function hoursKey(live: FicheLive): string | null {
  if (!live.hours?.weekdayDescriptions.length) return null;
  return live.hours.weekdayDescriptions.map((l) => l.trim()).join(" | ");
}

export function diffFiche(prev: FicheLive | null, next: FicheLive): FicheChange[] {
  if (!prev) return [];
  const pairs: Array<[FicheChange["field"], string | null, string | null]> = [
    ["name", norm(prev.name), norm(next.name)],
    ["phone", norm(prev.phone), norm(next.phone)],
    ["address", norm(prev.address), norm(next.address)],
    ["hours", hoursKey(prev), hoursKey(next)],
    ["status", norm(prev.businessStatus), norm(next.businessStatus)],
  ];
  const out: FicheChange[] = [];
  for (const [field, before, after] of pairs) {
    if (before == null && after == null) continue;
    if (before === after) continue;
    out.push({ field, before, after });
  }
  return out;
}

export function ratingDelta(prev: number | null, next: number | null): number | null {
  if (prev == null || next == null) return null;
  const d = Math.round((next - prev) * 100) / 100;
  return d === 0 ? 0 : d;
}

export function vanishedIds(storedIds: string[], liveIds: string[] | null): string[] | null {
  if (liveIds == null) return null;
  const live = new Set(liveIds);
  return storedIds.filter((id) => !live.has(id));
}
