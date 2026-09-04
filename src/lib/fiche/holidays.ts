/** Public holidays. ES national + Catalunya extras when region is CT. No LLM. */

export type Holiday = { date: string; name: string; regions: Array<"ES" | "CT"> };

function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

function national(year: number): Holiday[] {
  const easter = easterSunday(year);
  return [
    { date: `${year}-01-01`, name: "Año Nuevo", regions: ["ES"] },
    { date: `${year}-01-06`, name: "Reyes", regions: ["ES"] },
    { date: iso(addDays(easter, -2)), name: "Viernes Santo", regions: ["ES"] },
    { date: `${year}-05-01`, name: "Fiesta del Trabajo", regions: ["ES"] },
    { date: `${year}-08-15`, name: "Asunción", regions: ["ES"] },
    { date: `${year}-10-12`, name: "Fiesta Nacional", regions: ["ES"] },
    { date: `${year}-11-01`, name: "Todos los Santos", regions: ["ES"] },
    { date: `${year}-12-06`, name: "Día de la Constitución", regions: ["ES"] },
    { date: `${year}-12-08`, name: "Inmaculada Concepción", regions: ["ES"] },
    { date: `${year}-12-25`, name: "Navidad", regions: ["ES"] },
  ];
}

function catalunya(year: number): Holiday[] {
  const easter = easterSunday(year);
  return [
    { date: iso(addDays(easter, 1)), name: "Lunes de Pascua", regions: ["CT"] },
    { date: `${year}-06-24`, name: "Sant Joan", regions: ["CT"] },
    { date: `${year}-09-11`, name: "Diada", regions: ["CT"] },
    { date: `${year}-12-26`, name: "Sant Esteve", regions: ["CT"] },
  ];
}

export function holidaysForYear(year: number, region: "ES" | "CT"): Holiday[] {
  const all = [...national(year), ...(region === "CT" ? catalunya(year) : [])];
  const seen = new Set<string>();
  return all.filter((h) => (seen.has(h.date) ? false : (seen.add(h.date), true)));
}

export function holidaysInWindow(opts: {
  from: Date;
  days: number;
  region: "ES" | "CT";
}): Holiday[] {
  const start = iso(opts.from);
  const endDate = addDays(opts.from, opts.days);
  const end = iso(endDate);
  const years = new Set([opts.from.getUTCFullYear(), endDate.getUTCFullYear()]);
  const out: Holiday[] = [];
  for (const y of years) {
    for (const h of holidaysForYear(y, opts.region)) {
      if (h.date >= start && h.date <= end) out.push(h);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export function regionForCity(city: string | null | undefined, country: string | null | undefined): "ES" | "CT" {
  if ((country ?? "ES").toUpperCase() !== "ES") return "ES";
  const c = (city ?? "").toLowerCase();
  if (
    c.includes("catal") ||
    c.includes("barcelona") ||
    c.includes("sant cugat") ||
    c.includes("girona") ||
    c.includes("tarragona") ||
    c.includes("lleida")
  ) {
    return "CT";
  }
  return "ES";
}

/** Places weekdayDescriptions use Sunday=index 0 in Google's periods.day (0=Sunday). */
export function weekdayIndexUtc(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

export function descriptionSaysClosed(line: string | undefined): boolean {
  if (!line) return true;
  return /cerrad|closed|tancat|ferm[ée]/i.test(line);
}

/** weekdayDescriptions is Monday-first. Returns null if we do not have hours. */
export function mapsOpenOnDate(
  weekdayDescriptions: string[] | null | undefined,
  isoDate: string,
): boolean | null {
  if (!weekdayDescriptions || weekdayDescriptions.length < 7) return null;
  const sun0 = weekdayIndexUtc(isoDate);
  const mondayFirst = sun0 === 0 ? 6 : sun0 - 1;
  const line = weekdayDescriptions[mondayFirst];
  if (!line) return null;
  if (descriptionSaysClosed(line)) return false;
  return true;
}
