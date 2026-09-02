import { prisma } from "../db";
import {
  categoryBySlug,
  categoryFromWord,
  cityFromWord,
  fold,
  type CategoryDef,
} from "../categories";
import { xaiJson } from "../xai";
import { xaiKey } from "../env";

export type ScopeDiffItemCity = {
  op: "upsert";
  name: string;
  country: "ES" | "FR";
  active: boolean;
};

export type ScopeDiffItemCategory = {
  op: "upsert";
  slug: string;
  label: string;
  placesType: string;
  active: boolean;
};

export type ScopeDiff = {
  cities: ScopeDiffItemCity[];
  categories: ScopeDiffItemCategory[];
};

export type ScopeProposal = {
  clarification: string | null;
  summary: string;
  diff: ScopeDiff;
};

const AMBIGUOUS = new Set([
  "sud",
  "nord",
  "est",
  "ouest",
  "south",
  "north",
  "cote",
  "côte",
  "costa",
  "region",
  "région",
  "alrededores",
  "alentours",
]);

function emptyDiff(): ScopeDiff {
  return { cities: [], categories: [] };
}

function parseWithRegex(message: string): ScopeProposal {
  const raw = message.trim();
  const folded = fold(raw);

  if (!raw) {
    return { clarification: "Écris une ville ou une catégorie.", summary: "", diff: emptyDiff() };
  }

  const tokens = folded.split(/[^a-zàâçéèêëîïôùûüÿœñ0-9]+/i).filter(Boolean);
  if (tokens.some((t) => AMBIGUOUS.has(t)) && !tokens.some((t) => cityFromWord(t))) {
    return {
      clarification:
        "Trop vague (« le sud », une région). Donne des villes nommées, par ex. Barcelone, Valence, Girona.",
      summary: "",
      diff: emptyDiff(),
    };
  }

  const wantsOff = /\b(off|coupe|couper|desactive|désactive|ferme|fermer|disable|sauf|pas|without|excepto)\b/i.test(
    raw,
  );
  const countryHint: "ES" | "FR" | null = /\b(france|français|francais)\b/i.test(raw)
    ? "FR"
    : /\b(espagne|spain|españa|espanol|español)\b/i.test(raw)
      ? "ES"
      : null;

  const cities: ScopeDiffItemCity[] = [];
  const categories: ScopeDiffItemCategory[] = [];
  const seenCity = new Set<string>();
  const seenCat = new Set<string>();

  for (const tok of tokens) {
    const city = cityFromWord(tok);
    if (city && !seenCity.has(`${city.name}|${city.country}`)) {
      seenCity.add(`${city.name}|${city.country}`);
      const tokenOff = new RegExp(
        `(?:coupe|off|désactive|desactive|ferme)\\s+[^.]{0,20}${tok}|${tok}\\s*(?:off|out)`,
        "i",
      );
      const active = tokenOff.test(raw) ? false : !wantsOff || /active|ouvre|on\b/i.test(raw);
      cities.push({
        op: "upsert",
        name: city.name,
        country: countryHint ?? city.country,
        active: wantsOff && !/active|ouvre/i.test(raw) ? false : active,
      });
    }
    const cat = categoryFromWord(tok);
    if (cat && !seenCat.has(cat.slug)) {
      seenCat.add(cat.slug);
      const negated = new RegExp(`(?:pas les|sauf|without|excepto|pas de)\\s+[^.]{0,12}${tok}`, "i").test(
        folded,
      );
      categories.push({
        op: "upsert",
        slug: cat.slug,
        label: cat.label,
        placesType: cat.placesType,
        active: negated ? false : !wantsOff,
      });
    }
  }

  // "pas les hôtels" even if hotel wasn't in the positive list
  if (/\bpas les h[oô]tels?\b/i.test(raw) || /\bsauf h[oô]tels?\b/i.test(raw)) {
    const hotel = categoryBySlug("hotel") as CategoryDef;
    if (!seenCat.has("hotel")) {
      categories.push({
        op: "upsert",
        slug: hotel.slug,
        label: hotel.label,
        placesType: hotel.placesType,
        active: false,
      });
    }
  }

  if (cities.length === 0 && categories.length === 0) {
    return {
      clarification:
        "Je n’ai pas reconnu de ville ou de catégorie. Exemple : « active Barcelone, catégorie restaurant ».",
      summary: "",
      diff: emptyDiff(),
    };
  }

  const summaryParts = [
    ...cities.map((c) => `${c.name} (${c.country}) → ${c.active ? "on" : "off"}`),
    ...categories.map((c) => `${c.label} → ${c.active ? "on" : "off"}`),
  ];

  return {
    clarification: null,
    summary: summaryParts.join(" · "),
    diff: { cities, categories },
  };
}

type LlmOut = {
  clarification?: string | null;
  summary?: string;
  cities?: { name: string; country: string; active: boolean }[];
  categories?: { slug: string; label?: string; placesType?: string; active: boolean }[];
};

async function parseWithXai(message: string): Promise<ScopeProposal | null> {
  if (!xaiKey()) return null;
  const [cities, categories] = await Promise.all([
    prisma.scopeCity.findMany({ orderBy: { name: "asc" } }),
    prisma.scopeCategory.findMany({ orderBy: { slug: "asc" } }),
  ]);

  const known = CATEGORY_HINT();
  const out = await xaiJson<LlmOut>(
    `You are the Babyrock Scope agent. You only propose a diff for cities and business categories.
Never prospect, mail, publish, or invent a long list of cities.
If the admin is vague ("the south", "the coast"), ask for named cities in clarification and leave arrays empty.
Countries are ES or FR only.
Category slugs must be from this list when possible: ${known}.
Return JSON: { "clarification": string|null, "summary": string, "cities": [{name, country, active}], "categories": [{slug, label, placesType, active}] }.`,
    `Current cities: ${JSON.stringify(cities)}\nCurrent categories: ${JSON.stringify(categories)}\nAdmin message: ${message}`,
  );
  if (!out) return null;

  const clarification = out.clarification?.trim() || null;
  const diff: ScopeDiff = { cities: [], categories: [] };
  for (const c of out.cities ?? []) {
    const country = c.country === "FR" ? "FR" : "ES";
    const name = (c.name || "").trim();
    if (!name) continue;
    diff.cities.push({ op: "upsert", name, country, active: Boolean(c.active) });
  }
  for (const c of out.categories ?? []) {
    const knownCat = categoryBySlug(c.slug) ?? categoryFromWord(c.slug);
    const slug = (knownCat?.slug || c.slug || "").trim();
    if (!slug) continue;
    diff.categories.push({
      op: "upsert",
      slug,
      label: c.label || knownCat?.label || slug,
      placesType: c.placesType || knownCat?.placesType || slug,
      active: Boolean(c.active),
    });
  }

  if (clarification && diff.cities.length === 0 && diff.categories.length === 0) {
    return { clarification, summary: "", diff };
  }
  const summary =
    out.summary ||
    [
      ...diff.cities.map((c) => `${c.name} → ${c.active ? "on" : "off"}`),
      ...diff.categories.map((c) => `${c.slug} → ${c.active ? "on" : "off"}`),
    ].join(" · ");
  return { clarification: null, summary, diff };
}

function CATEGORY_HINT() {
  return "restaurant, cafe, bakery, bar, florist, hair_salon, beauty_salon, hotel";
}

export async function proposeScope(rawMessage: string): Promise<{
  changeId: string;
  proposal: ScopeProposal;
  usedModel: string;
}> {
  let proposal: ScopeProposal | null = parseWithRegex(rawMessage);
  let usedModel = "regex";
  const regexEmpty =
    proposal.diff.cities.length === 0 &&
    proposal.diff.categories.length === 0 &&
    !proposal.clarification;
  if (process.env.XAI_SCOPE === "true" && regexEmpty) {
    try {
      const llm = await parseWithXai(rawMessage);
      if (llm) {
        proposal = llm;
        usedModel = "xai";
      }
    } catch (e) {
      console.warn("scope xAI failed, keeping regex", e);
    }
  }

  const status = proposal.clarification && proposal.diff.cities.length + proposal.diff.categories.length === 0
    ? "proposed"
    : "proposed";

  const change = await prisma.scopeChange.create({
    data: {
      actor: usedModel === "xai" ? "scope_agent" : "scope_agent",
      rawMessage,
      reply: proposal.clarification
        ? proposal.clarification
        : proposal.summary,
      diff: JSON.parse(JSON.stringify(proposal)),
      status,
    },
  });

  return { changeId: change.id, proposal, usedModel };
}

function asDiff(raw: unknown): ScopeDiff {
  if (!raw || typeof raw !== "object") return { cities: [], categories: [] };
  const o = raw as Record<string, unknown>;
  const inner = o.diff && typeof o.diff === "object" ? (o.diff as Record<string, unknown>) : o;
  return {
    cities: Array.isArray(inner.cities) ? (inner.cities as ScopeDiff["cities"]) : [],
    categories: Array.isArray(inner.categories) ? (inner.categories as ScopeDiff["categories"]) : [],
  };
}

export async function applyScopeChange(changeId: string, actor: string) {
  const change = await prisma.scopeChange.findUnique({ where: { id: changeId } });
  if (!change) throw new Error("scope change not found");
  if (change.status !== "proposed") throw new Error(`already ${change.status}`);

  const diff = asDiff(change.diff);
  const cities = diff.cities;
  const categories = diff.categories;

  for (const c of cities) {
    await prisma.scopeCity.upsert({
      where: { name_country: { name: c.name, country: c.country } },
      update: { active: c.active, source: "scope_agent" },
      create: {
        name: c.name,
        country: c.country,
        active: c.active,
        source: "scope_agent",
      },
    });
  }
  for (const c of categories) {
    await prisma.scopeCategory.upsert({
      where: { slug: c.slug },
      update: {
        active: c.active,
        label: c.label,
        placesType: c.placesType,
        source: "scope_agent",
      },
      create: {
        slug: c.slug,
        label: c.label,
        placesType: c.placesType,
        active: c.active,
        source: "scope_agent",
      },
    });
  }

  await prisma.scopeChange.update({
    where: { id: changeId },
    data: {
      status: "applied",
      actor,
    },
  });

  return { cities: cities.length, categories: categories.length };
}

export async function rejectScopeChange(changeId: string, actor: string) {
  const change = await prisma.scopeChange.findUnique({ where: { id: changeId } });
  if (!change) throw new Error("scope change not found");
  if (change.status !== "proposed") throw new Error(`already ${change.status}`);
  await prisma.scopeChange.update({
    where: { id: changeId },
    data: { status: "rejected", actor },
  });
}

export async function toggleCity(id: string, active: boolean) {
  return prisma.scopeCity.update({
    where: { id },
    data: { active, source: "admin" },
  });
}

export async function toggleCategory(id: string, active: boolean) {
  return prisma.scopeCategory.update({
    where: { id },
    data: { active, source: "admin" },
  });
}

export async function maybeAskXaiHealth() {
  return Boolean(xaiKey());
}
