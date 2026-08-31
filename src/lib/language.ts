export function detectLang(text: string, fallback?: string | null): string {
  const t = text ?? "";
  if (/[ñ¿¡]/i.test(t) || /\b(el|la|los|las|una|gracias|muy|pero)\b/i.test(t)) return "es";
  if (/\b(el|la|els|les|amb|perquè|molt)\b/i.test(t) || /[·]/.test(t)) return "ca";
  if (/[àâçéèêëîïôùûœ]/i.test(t) || /\b(le|la|les|une|merci|très)\b/i.test(t)) return "fr";
  if (fallback && /^[a-z]{2}/i.test(fallback)) return fallback.slice(0, 2).toLowerCase();
  return "en";
}

export function firstName(author: string | null | undefined) {
  if (!author) return "";
  const cleaned = author.replace(/\s+\./g, "").trim();
  return cleaned.split(/\s+/)[0] ?? "";
}

export function pickDetail(body: string) {
  const compact = body.replace(/\s+/g, " ").trim();
  if (!compact) return "votre visite";
  const cut = compact.split(/[.!?]/)[0] ?? compact;
  const words = cut.split(" ").slice(0, 8).join(" ");
  return words.length > 80 ? `${words.slice(0, 77)}…` : words;
}

export function clampReviewReply(text: string, max = 400) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}
