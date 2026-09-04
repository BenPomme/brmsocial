import { SCRIPT_IDS } from "./copy";
import type { OnboardingStep, ThreadPhase } from "./types";

const NEXT: Record<string, string> = {
  maps: "onboard_people",
  people: "onboard_email",
  email: "onboard_role",
  role: "onboard_wait",
  wait_google: "onboard_wait",
};

export function parseRoute(raw: string): { route: string } | null {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as { route?: string };
    const route = String(parsed.route ?? "").trim();
    if (!route) return null;
    return { route };
  } catch {
    return null;
  }
}

export function isRoutable(id: string) {
  return id === "human" || SCRIPT_IDS.includes(id);
}

export function routePrompt(opts: {
  lang: string;
  phase: ThreadPhase;
  step: OnboardingStep | null;
  monthLabel: string;
  managerEmail: string;
}) {
  const next = opts.step ? NEXT[opts.step] : "onboard_maps";
  const langName = { es: "español", ca: "català", en: "English", fr: "français" }[opts.lang] ?? opts.lang;
  return `You route a WhatsApp to ONE canned script. Do not write the customer message.
Language they are speaking: ${langName}.
Phase: ${opts.phase}. Onboarding step: ${opts.step ?? "none"}.
If they confirmed they did the current step (yes, ok, yes ok, tes, vale, done, I did it, lo veo), route "${next}".
If they ask how to add us as Google manager, route "onboard_maps" unless already past maps — then stay on the current onboard_* script.
BabyRock Social = Google review replies, ${opts.monthLabel}/month. Manager email ${opts.managerEmail}. Direct/Instagram/SEO = off_catalog.
If you are not sure, route "human".
Valid routes: ${SCRIPT_IDS.join(", ")}, human
JSON only: {"route":"..."}`;
}
