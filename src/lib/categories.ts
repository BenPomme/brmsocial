/**
 * Parser helpers only. Active cities/categories live in scope_* tables.
 * This map exists so "fleuriste" / "resto" can become a Places type when you
 * type in the admin chat. It is not the source of truth for what we scout.
 */

export type CategoryDef = {
  slug: string;
  label: string;
  placesType: string;
};

export const CATEGORY_DEFS: CategoryDef[] = [
  { slug: "restaurant", label: "Restaurant", placesType: "restaurant" },
  { slug: "cafe", label: "Café", placesType: "cafe" },
  { slug: "bakery", label: "Boulangerie", placesType: "bakery" },
  { slug: "bar", label: "Bar", placesType: "bar" },
  { slug: "florist", label: "Fleuriste", placesType: "florist" },
  { slug: "hair_salon", label: "Coiffeur", placesType: "hair_salon" },
  { slug: "beauty_salon", label: "Institut", placesType: "beauty_salon" },
  { slug: "hotel", label: "Hôtel", placesType: "hotel" },
];

const ALIASES: Record<string, string> = {
  restaurant: "restaurant",
  resto: "restaurant",
  restos: "restaurant",
  restaurants: "restaurant",
  restauration: "restaurant",
  tapas: "restaurant",
  cafe: "cafe",
  café: "cafe",
  cafes: "cafe",
  cafés: "cafe",
  coffee: "cafe",
  bakery: "bakery",
  boulangerie: "bakery",
  boulangeries: "bakery",
  panaderia: "bakery",
  panadería: "bakery",
  bar: "bar",
  bars: "bar",
  florist: "florist",
  fleuriste: "florist",
  fleuristes: "florist",
  fleurs: "florist",
  floristeria: "florist",
  hair: "hair_salon",
  coiffeur: "hair_salon",
  coiffeurs: "hair_salon",
  peluqueria: "hair_salon",
  peluquería: "hair_salon",
  beauty: "beauty_salon",
  institut: "beauty_salon",
  hotel: "hotel",
  hotels: "hotel",
  hôtel: "hotel",
  hôtels: "hotel",
};

export function categoryFromWord(word: string): CategoryDef | null {
  const slug = ALIASES[fold(word)];
  if (!slug) return null;
  return CATEGORY_DEFS.find((c) => c.slug === slug) ?? null;
}

export function categoryBySlug(slug: string): CategoryDef | null {
  return CATEGORY_DEFS.find((c) => c.slug === slug) ?? null;
}

export function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export const CITY_ALIASES: Record<string, { name: string; country: "ES" | "FR" }> = {
  barcelone: { name: "Barcelona", country: "ES" },
  barcelona: { name: "Barcelona", country: "ES" },
  valence: { name: "Valencia", country: "ES" },
  valencia: { name: "Valencia", country: "ES" },
  girona: { name: "Girona", country: "ES" },
  gerone: { name: "Girona", country: "ES" },
  madrid: { name: "Madrid", country: "ES" },
  seville: { name: "Sevilla", country: "ES" },
  sevilla: { name: "Sevilla", country: "ES" },
  malaga: { name: "Málaga", country: "ES" },
  málaga: { name: "Málaga", country: "ES" },
  bilbao: { name: "Bilbao", country: "ES" },
  palma: { name: "Palma", country: "ES" },
  ibiza: { name: "Ibiza", country: "ES" },
  eivissa: { name: "Ibiza", country: "ES" },
  paris: { name: "Paris", country: "FR" },
  lyon: { name: "Lyon", country: "FR" },
  marseille: { name: "Marseille", country: "FR" },
  nice: { name: "Nice", country: "FR" },
  toulouse: { name: "Toulouse", country: "FR" },
  bordeaux: { name: "Bordeaux", country: "FR" },
  lille: { name: "Lille", country: "FR" },
  nantes: { name: "Nantes", country: "FR" },
  "sant cugat": { name: "Sant Cugat del Vallès", country: "ES" },
  "sant cugat del valles": { name: "Sant Cugat del Vallès", country: "ES" },
  "sant cugat del vallès": { name: "Sant Cugat del Vallès", country: "ES" },
};

export function cityFromWord(word: string): { name: string; country: "ES" | "FR" } | null {
  return CITY_ALIASES[fold(word)] ?? null;
}

const SCOPE_STOP = new Set([
  "active",
  "ouvre",
  "ouvrir",
  "on",
  "off",
  "coupe",
  "couper",
  "desactive",
  "disable",
  "categorie",
  "category",
  "ville",
  "city",
  "et",
  "and",
  "the",
  "les",
  "la",
  "le",
  "de",
  "du",
  "en",
  "in",
  "pour",
  "for",
]);

function titleCaseName(s: string) {
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Named cities/areas from a Scope chat, including names not in CITY_ALIASES (Rubí). */
export function citiesFromScopeTokens(
  tokens: string[],
  countryHint: "ES" | "FR" | null,
): { name: string; country: "ES" | "FR" }[] {
  const found: { name: string; country: "ES" | "FR" }[] = [];
  const seen = new Set<string>();
  const used = new Set<number>();
  const country = countryHint ?? "ES";

  for (let i = 0; i < tokens.length; i++) {
    if (used.has(i)) continue;
    const two = i + 1 < tokens.length ? `${tokens[i]} ${tokens[i + 1]}` : "";
    const hit = (two && cityFromWord(two)) || cityFromWord(tokens[i]);
    if (hit) {
      const key = `${hit.name}|${hit.country}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({ name: hit.name, country: countryHint ?? hit.country });
      }
      used.add(i);
      if (two && cityFromWord(two)) used.add(i + 1);
    }
  }

  if (found.length > 0) return found;

  const leftover = tokens.filter(
    (t, i) => !used.has(i) && !SCOPE_STOP.has(fold(t)) && !categoryFromWord(t) && t.length > 2,
  );
  if (leftover.length === 0) return [];
  const name = titleCaseName(leftover.join(" "));
  return [{ name, country }];
}
