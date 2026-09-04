import { onboardCopyId, SCRIPT_IDS } from "./copy";
import type { OnboardingStep, ThreadPhase } from "./types";

const NEXT: Record<string, string> = {
  maps: "onboard_people",
  people: "onboard_email",
  email: "onboard_role",
  role: "onboard_wait",
  wait_google: "onboard_wait",
};

export function tooSimilar(a: string, b: string) {
  const na = a.replace(/\s+/g, " ").trim().toLowerCase();
  const nb = b.replace(/\s+/g, " ").trim().toLowerCase();
  if (!na || !nb) return false;
  if (na === nb) return true;
  const head = na.slice(0, 60);
  return head.length >= 40 && nb.includes(head);
}

export function repeats(body: string, outbound: string[]) {
  return outbound.slice(-4).some((b) => tooSimilar(body, b));
}

/** If the model re-picks the step we just sent, bump forward unless they asked about that step. */
export function coerceRoute(
  route: string,
  step: OnboardingStep | null,
  inbound: string,
  phase?: ThreadPhase,
): string {
  if (phase === "stopped") return "human";
  if (!step || step === "done") return route;
  if (route === "human" || route === "stop" || route === "fallback" || route === "baja_active") {
    return route;
  }
  if (!route.startsWith("onboard_")) return route;
  const next = NEXT[step] ?? "human";
  const cur = onboardCopyId(step);
  const askingThis =
    /\b(email|maps|people|password|reviews@|gestor|lápiz|pencil|invite)\b/i.test(inbound);
  if (route === cur && !askingThis) return next === cur ? "human" : next;
  return next === cur && route === cur ? "human" : route;
}

export function nextOnboard(step: OnboardingStep | null) {
  if (!step || step === "done") return "human";
  const next = NEXT[step] ?? "human";
  return next === onboardCopyId(step) ? "human" : next;
}

export function parseTurn(raw: string): { route: string; reply: string } | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { route?: string; reply?: string };
    const route = String(parsed.route ?? "").trim();
    if (!route) return null;
    return { route, reply: String(parsed.reply ?? "").trim() };
  } catch {
    return null;
  }
}

/** @deprecated use parseTurn */
export function parseRoute(raw: string) {
  const t = parseTurn(raw);
  return t ? { route: t.route } : null;
}

export function isRoutable(id: string) {
  return id === "human" || SCRIPT_IDS.includes(id);
}

export function talkPrompt(opts: {
  lang: string;
  phase: ThreadPhase;
  step: OnboardingStep | null;
  monthLabel: string;
  managerEmail: string;
  payUrl: string;
  lastOut: string | null;
}) {
  const next = opts.step ? NEXT[opts.step] : "onboard_maps";
  const langName = { es: "español (usted)", ca: "català (vostè)", en: "English", fr: "français (vous)" }[opts.lang] ?? opts.lang;
  return `You are Rosalia on WhatsApp for Babyrock Social (Sant Cugat). Talk like a person. 1–4 short sentences in ${langName}.
Facts only: we reply to Google reviews, ${opts.monthLabel}/month. Manager ${opts.managerEmail}, no password. Direct/Instagram/SEO not sold. Payment URL if needed: ${opts.payUrl}. Never invent a URL or a price.
Phase: ${opts.phase}. Gestor step: ${opts.step ?? "none"} (maps → people → email → role → wait). If they confirmed the current step, route "${next}".
Your last message (do not repeat or paraphrase):
${opts.lastOut || "(none)"}
JSON: {"route":"<script id or human>","reply":"<whatsapp text or empty>"}.
Empty reply = we send the canned script for route. human + empty reply = escalate, we send nothing.
If you are unsure, route human.`;
}
