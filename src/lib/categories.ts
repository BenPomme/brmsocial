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
