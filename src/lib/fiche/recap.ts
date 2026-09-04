import type { DailyFicheFacts, FicheChange, WeeklyFicheFacts } from "./types";

const FIELD_ES: Record<FicheChange["field"], string> = {
  hours: "horario",
  name: "nombre",
  phone: "teléfono",
  address: "dirección",
  status: "estado (abierto/cerrado)",
};

function fmtRating(n: number): string {
  return n.toFixed(2);
}

function deltaWord(n: number): string {
  if (n > 0) return `+${n}`;
  return String(n);
}

/** Monday recap lines. Omit any fact we do not have. Empty array = silence on fiche. */
export function weeklyFicheLines(facts: WeeklyFicheFacts): string[] {
  const lines: string[] = [];

  if (facts.rating != null && facts.ratingCount != null) {
    let line = `Nota Google: ${fmtRating(facts.rating)} (${facts.ratingCount} reseñas)`;
    const bits: string[] = [];
    if (facts.ratingDelta != null && facts.ratingDelta !== 0) {
      bits.push(`nota ${deltaWord(facts.ratingDelta)}`);
    }
    if (facts.ratingCountDelta != null && facts.ratingCountDelta !== 0) {
      bits.push(`${deltaWord(facts.ratingCountDelta)} reseñas`);
    }
    if (bits.length) line += ` — esta semana: ${bits.join(", ")}`;
    lines.push(line);
  } else if (facts.rating != null) {
    lines.push(`Nota Google: ${fmtRating(facts.rating)}`);
  } else if (facts.ratingCount != null) {
    lines.push(`Reseñas en Google: ${facts.ratingCount}`);
  }

  if (facts.vanishedCount != null && facts.vanishedCount > 0) {
    lines.push(
      facts.vanishedCount === 1
        ? "Google ha retirado 1 reseña de la ficha esta semana."
        : `Google ha retirado ${facts.vanishedCount} reseñas de la ficha esta semana.`,
    );
  }

  if (facts.calls != null || facts.directionRequests != null) {
    const bits: string[] = [];
    if (facts.calls != null) bits.push(`${facts.calls} llamadas desde la ficha`);
    if (facts.directionRequests != null) {
      bits.push(`${facts.directionRequests} peticiones de cómo llegar`);
    }
    lines.push(bits.join(", ") + ".");
  }

  if (facts.suggestedEdits != null && facts.suggestedEdits.length > 0) {
    const fields = facts.suggestedEdits.map((e) => e.field).join(", ");
    lines.push(
      `Google tiene una propuesta de cambio pendiente (${fields}). Ábrala en su perfil de empresa y acéptela o rechácela usted. Nosotros no la aplicamos.`,
    );
  }

  for (const c of facts.changes) {
    lines.push(changeLine(c));
  }

  if (facts.upcomingHoliday && facts.upcomingHoliday.mapsOpen) {
    lines.push(holidayLine(facts.upcomingHoliday.date, facts.upcomingHoliday.name));
  }

  return lines;
}

export function dailyFicheLines(facts: DailyFicheFacts): string[] {
  const lines: string[] = [];
  for (const c of facts.changes) lines.push(changeLine(c));
  if (facts.suggestedEdits != null && facts.suggestedEdits.length > 0) {
    const fields = facts.suggestedEdits.map((e) => e.field).join(", ");
    lines.push(
      `Google propone un cambio en la ficha (${fields}). Ábralo en su perfil de empresa. Nosotros no lo aplicamos.`,
    );
  }
  if (facts.upcomingHoliday && facts.upcomingHoliday.mapsOpen) {
    lines.push(holidayLine(facts.upcomingHoliday.date, facts.upcomingHoliday.name));
  }
  return lines;
}

function changeLine(c: FicheChange): string {
  const label = FIELD_ES[c.field];
  if (c.before && c.after) {
    return `La ficha ha cambiado (${label}): «${c.before}» → «${c.after}». Si no lo ha hecho usted, ábralo en Google.`;
  }
  if (c.after) return `La ficha ha cambiado (${label}): ahora «${c.after}».`;
  return `La ficha ha cambiado (${label}).`;
}

export function holidayLine(date: string, name: string): string {
  return (
    `${date} es ${name}. Maps sigue mostrando abierto. ` +
    `Responda CERRADO y lo cerramos en Google, o cámbielo usted en su perfil de empresa. ` +
    `Nosotros no tocamos el horario a mano.`
  );
}

export function isCerradoIntent(text: string): boolean {
  return /^(cerrado|cierra|tancat|tanca|ferm[ée]|closed)\b/i.test(text.trim());
}

export function composeWeeklyBody(shopName: string, replyLines: string[], ficheLines: string[]): string | null {
  const parts = [...replyLines, ...ficheLines].map((l) => l.trim()).filter(Boolean);
  if (parts.length === 0) return null;
  return [`Resumen — ${shopName}`, ...parts].join("\n");
}

export function composeDailyBody(shopName: string, ficheLines: string[]): string | null {
  if (ficheLines.length === 0) return null;
  return [`Ficha Google — ${shopName}`, ...ficheLines].join("\n");
}
