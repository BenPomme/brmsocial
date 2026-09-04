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

const NOT_A_PERSON_NAME = new Set([
  "hola",
  "hello",
  "hi",
  "hey",
  "buenas",
  "ok",
  "vale",
  "si",
  "sí",
  "yes",
  "no",
  "gracias",
  "thanks",
  "merci",
  "rosalia",
  "rosalía",
  "babyrock",
  "whatsapp",
  "google",
  "don",
  "sr",
  "sra",
  "mr",
  "mrs",
  "dr",
  "el",
  "la",
  "un",
  "una",
  "yo",
  "tu",
  "you",
  "me",
  "mi",
  "my",
  "bar",
  "restaurante",
  "restaurant",
  "cafe",
  "café",
  "hotel",
  "tienda",
  "shop",
]);

/** First token of a WhatsApp profile / “me llamo X”. Empty if it doesn’t look like a given name. */
export function personFirstName(raw: string | null | undefined) {
  if (!raw) return "";
  const token =
    raw
      .trim()
      .split(/\s+/)[0]
      ?.replace(/^[^A-Za-zÀ-ÿ]+|[^A-Za-zÀ-ÿ'’-]+$/g, "") ?? "";
  if (token.length < 2 || token.length > 24) return "";
  if (NOT_A_PERSON_NAME.has(token.toLowerCase())) return "";
  if (!/^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]*$/.test(token)) return "";
  return token.charAt(0).toUpperCase() + token.slice(1);
}

export function extractSpokenName(text: string) {
  const t = text ?? "";
  const named =
    t.match(
      /\b(?:me llamo|me dic|em dic|je m['’]appelle|my name is|i am called)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]{1,23})\b/i,
    ) ?? t.match(/^\s*hola[,.\s]+(?:soy|sóc|je suis)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’-]{1,23})\b/i);
  return personFirstName(named?.[1] ?? "");
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
