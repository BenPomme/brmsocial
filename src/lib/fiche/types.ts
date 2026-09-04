/** Live Google fiche as we actually read it. null/undefined = unknown. Never invent. */

export type FicheHours = {
  weekdayDescriptions: string[];
};

export type SuggestedEdit = {
  field: string;
  googleValue: string;
};

export type FicheLive = {
  source: "places" | "gbp";
  name: string | null;
  phone: string | null;
  address: string | null;
  hours: FicheHours | null;
  businessStatus: string | null;
  rating: number | null;
  ratingCount: number | null;
  /** Full set of Google review ids on the fiche. null = list is incomplete (Places only returns a handful). */
  reviewIds: string[] | null;
  calls: number | null;
  directionRequests: number | null;
  suggestedEdits: SuggestedEdit[] | null;
};

export type FicheChange = {
  field: "hours" | "name" | "phone" | "address" | "status";
  before: string | null;
  after: string | null;
};

export type WeeklyFicheFacts = {
  rating: number | null;
  ratingCount: number | null;
  ratingDelta: number | null;
  ratingCountDelta: number | null;
  vanishedCount: number | null;
  calls: number | null;
  directionRequests: number | null;
  suggestedEdits: SuggestedEdit[] | null;
  changes: FicheChange[];
  upcomingHoliday: { date: string; name: string; mapsOpen: boolean } | null;
};

export type DailyFicheFacts = {
  changes: FicheChange[];
  suggestedEdits: SuggestedEdit[] | null;
  upcomingHoliday: { date: string; name: string; mapsOpen: boolean } | null;
};
