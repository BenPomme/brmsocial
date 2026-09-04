import { onboardCopyId, SCRIPT_IDS } from "./copy";
import type { OnboardingStep, ThreadPhase } from "./types";

const NEXT: Record<string, string> = {
  maps: "onboard_people",
  people: "onboard_email",
  email: "onboard_role",
  role: "onboard_wait",
  wait_google: "onboard_wait",
};

/** If the model re-picks the step we just sent, bump forward unless they asked about that step. */
export function coerceRoute(route: string, step: OnboardingStep | null, inbound: string): string {
  if (!step || step === "done") return route;
  const next = NEXT[step] ?? "human";
  if (route !== "human" && !route.startsWith("onboard_")) return next;
  const cur = onboardCopyId(step);
  const askingThis =
    /\b(email|maps|people|password|reviews@|gestor|lápiz|pencil|invite)\b/i.test(inbound);
  if (route === cur && !askingThis) return next;
  return route;
}

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
If phase is onboarding, ONLY route onboard_* or human. Never hello/pay.
If they confirmed or want to continue (yes, ok, yes ok, ah ok, and?, next, done), route "${next}". NEVER route the current step unless they asked a question about it.
Gibberish → human.
BabyRock Social = Google review replies, ${opts.monthLabel}/month. Manager ${opts.managerEmail}. Direct/Instagram/SEO = off_catalog.
If you are not sure, route "human".
Valid routes: ${SCRIPT_IDS.join(", ")}, human
JSON only: {"route":"..."}`;
}
