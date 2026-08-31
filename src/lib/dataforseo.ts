import { dataforseoLogin, dataforseoPassword } from "./env";

const DFS_BASE = "https://api.dataforseo.com";

export class DataForSeoError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "DataForSeoError";
  }
}

export type DfsReview = {
  reviewId: string;
  stars: number;
  text: string;
  lang: string | null;
  author: string | null;
  reviewedAt: Date | null;
  ownerAnswer: string | null;
  ownerAnsweredAt: Date | null;
};

export type DfsReviewsResult = {
  taskId: string;
  cost: number;
  tag: string | null;
  title: string | null;
  placeId: string | null;
  cid: string | null;
  reviewsCount: number | null;
  itemsCount: number;
  reviews: DfsReview[];
  checkUrl: string | null;
};

type DfsTaskEnvelope = {
  status_code?: number;
  status_message?: string;
  cost?: number;
  id?: string;
  data?: { tag?: string; place_id?: string };
  result?: Array<{
    title?: string | null;
    place_id?: string | null;
    cid?: string | null;
    reviews_count?: number | null;
    items_count?: number | null;
    check_url?: string | null;
    items?: Array<{
      review_id?: string | null;
      review_text?: string | null;
      original_review_text?: string | null;
      original_language?: string | null;
      timestamp?: string | null;
      profile_name?: string | null;
      owner_answer?: string | null;
      original_owner_answer?: string | null;
      owner_timestamp?: string | null;
      rating?: { value?: number | null } | null;
    }> | null;
  }> | null;
};

function basicAuth() {
  const login = dataforseoLogin();
  const password = dataforseoPassword();
  if (!login || !password) {
    throw new DataForSeoError(
      "DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing. Inspect cannot call Google Reviews.",
      0,
      "",
    );
  }
  return Buffer.from(`${login}:${password}`).toString("base64");
}

async function dfsFetch(path: string, init: RequestInit = {}): Promise<{
  status_code?: number;
  status_message?: string;
  cost?: number;
  tasks?: DfsTaskEnvelope[];
}> {
  const res = await fetch(`${DFS_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${basicAuth()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: {
    status_code?: number;
    status_message?: string;
    cost?: number;
    tasks?: DfsTaskEnvelope[];
  };
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    throw new DataForSeoError(`DataForSEO non-JSON ${res.status}`, res.status, text.slice(0, 800));
  }
  if (!res.ok) {
    throw new DataForSeoError(
      `DataForSEO HTTP ${res.status}: ${json.status_message ?? res.statusText}`,
      res.status,
      text.slice(0, 800),
    );
  }
  return json;
}

function parseTs(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value.replace(" +00:00", "Z").replace(" ", "T"));
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseReview(item: NonNullable<NonNullable<DfsTaskEnvelope["result"]>[0]["items"]>[0], index: number): DfsReview {
  const text = (item.original_review_text || item.review_text || "").trim();
  const owner = (item.original_owner_answer || item.owner_answer || "").trim();
  const starsRaw = item.rating?.value;
  const stars = typeof starsRaw === "number" && starsRaw >= 1 ? Math.round(starsRaw) : 0;
  return {
    reviewId: item.review_id || `dfs-anon-${index}`,
    stars,
    text,
    lang: item.original_language ?? null,
    author: item.profile_name ?? null,
    reviewedAt: parseTs(item.timestamp),
    ownerAnswer: owner.length > 0 ? owner : null,
    ownerAnsweredAt: parseTs(item.owner_timestamp),
  };
}

function unwrapResult(task: DfsTaskEnvelope, fallbackCost: number): DfsReviewsResult {
  const row = task.result?.[0];
  const items = row?.items ?? [];
  return {
    taskId: task.id ?? "",
    cost: typeof task.cost === "number" ? task.cost : fallbackCost,
    tag: task.data?.tag ?? null,
    title: row?.title ?? null,
    placeId: row?.place_id ?? task.data?.place_id ?? null,
    cid: row?.cid ?? null,
    reviewsCount: typeof row?.reviews_count === "number" ? row.reviews_count : null,
    itemsCount: items.length,
    reviews: items.map((it, i) => parseReview(it, i)),
    checkUrl: row?.check_url ?? null,
  };
}

export function googlePlaceId(placeId: string) {
  return placeId.replace(/^places\//, "");
}

/** Named codes we already checked in the official locations CSV (2026-08-06). */
const CITY_LOCATION_CODES: Record<string, number> = {
  "sant cugat del valles": 1005435,
  "sant cugat del vallès": 1005435,
  barcelona: 1005424,
  madrid: 2724,
};

export function dfsLocationFor(city: string, country: string): {
  location_code?: number;
  location_name?: string;
  language_code: string;
} {
  const folded = city
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
  const language_code = country === "FR" ? "fr" : "es";
  const known = CITY_LOCATION_CODES[folded];
  if (known) return { location_code: known, language_code };
  if (folded.includes("sant cugat")) return { location_code: 1005435, language_code };
  if (country === "ES") return { location_code: 2724, language_code };
  if (country === "FR") return { location_code: 2250, language_code };
  return { location_name: city, language_code };
}

export function reviewsDepth(userRatingCount: number | null | undefined, maxDepth: number) {
  const cap = Math.min(Math.max(maxDepth, 10), 4490);
  const n = userRatingCount && userRatingCount > 0 ? userRatingCount : 40;
  const rounded = Math.ceil(n / 10) * 10;
  return Math.min(Math.max(rounded, 10), cap);
}

export async function postGoogleReviewsTasks(
  tasks: Array<{
    place_id: string;
    location_code?: number;
    location_name?: string;
    language_code: string;
    depth: number;
    tag?: string;
  }>,
): Promise<Array<{ id: string; cost: number; tag: string | null; error: string | null }>> {
  if (tasks.length === 0) return [];
  const body = tasks.map((t) => ({
    place_id: googlePlaceId(t.place_id),
    language_code: t.language_code,
    depth: t.depth,
    sort_by: "newest",
    tag: t.tag ?? t.place_id,
    ...(t.location_code ? { location_code: t.location_code } : { location_name: t.location_name }),
  }));
  const json = await dfsFetch("/v3/business_data/google/reviews/task_post", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (json.status_code && json.status_code !== 20000) {
    throw new DataForSeoError(
      `DataForSEO task_post ${json.status_code}: ${json.status_message ?? "error"}`,
      json.status_code,
      JSON.stringify(json).slice(0, 800),
    );
  }
  return (json.tasks ?? []).map((t, i) => {
    const created = t.status_code === 20100 || t.status_code === 20000;
    return {
      id: t.id ?? "",
      cost: typeof t.cost === "number" ? t.cost : 0,
      tag: t.data?.tag ?? tasks[i]?.tag ?? null,
      error: created ? null : `${t.status_code ?? "?"} ${t.status_message ?? "task not created"}`,
    };
  });
}

/** 20100/40601/40602 = still running. Everything else is terminal. */
function taskPending(code: number | undefined) {
  if (code == null) return true;
  return code === 20100 || code === 40601 || code === 40602;
}

export async function getGoogleReviewsTask(id: string): Promise<
  | { ready: false; status: number; message: string }
  | { ready: true; ok: true; result: DfsReviewsResult }
  | { ready: true; ok: false; status: number; message: string; cost: number }
> {
  const json = await dfsFetch(`/v3/business_data/google/reviews/task_get/${id}`);
  const task = json.tasks?.[0];
  const code = task?.status_code ?? json.status_code;
  const message = task?.status_message ?? json.status_message ?? "unknown";
  if (taskPending(code)) {
    return { ready: false, status: code ?? 0, message };
  }
  if (code !== 20000 || !task?.result) {
    return {
      ready: true,
      ok: false,
      status: code ?? 0,
      message,
      cost: typeof task?.cost === "number" ? task.cost : 0,
    };
  }
  return { ready: true, ok: true, result: unwrapResult(task, json.cost ?? 0) };
}

export async function waitForGoogleReviewsTasks(
  ids: string[],
  opts: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<Map<string, Awaited<ReturnType<typeof getGoogleReviewsTask>>>> {
  const timeoutMs = opts.timeoutMs ?? 120_000;
  const intervalMs = opts.intervalMs ?? 2500;
  const pending = new Set(ids.filter(Boolean));
  const out = new Map<string, Awaited<ReturnType<typeof getGoogleReviewsTask>>>();
  const deadline = Date.now() + timeoutMs;

  while (pending.size > 0 && Date.now() < deadline) {
    for (const id of [...pending]) {
      const got = await getGoogleReviewsTask(id);
      if (!got.ready) continue;
      out.set(id, got);
      pending.delete(id);
    }
    if (pending.size > 0) await new Promise((r) => setTimeout(r, intervalMs));
  }

  for (const id of pending) {
    out.set(id, {
      ready: true,
      ok: false,
      status: 40800,
      message: "timeout waiting for DataForSEO Google Reviews task",
      cost: 0,
    });
  }
  return out;
}

export async function listGoogleReviewsTasksReady(): Promise<string[]> {
  const json = await dfsFetch("/v3/business_data/google/reviews/tasks_ready");
  const ids: string[] = [];
  for (const task of json.tasks ?? []) {
    const rows = (task.result ?? []) as Array<{ id?: string } | null>;
    for (const row of rows) {
      if (row?.id) ids.push(row.id);
    }
  }
  return ids;
}
