import type { ConvoLang } from "./types";

const SHORT = /^(hola|hello|hi|hey|buenas|bon dia|salut|ok|vale|s[ií]|yes|no|gracias|gr[aà]cies|merci|thanks)[\s!.¿?]*$/i;

function score(t: string) {
  const s = { es: 0, ca: 0, en: 0, fr: 0 };
  const x = t.toLowerCase();
  if (/\b(the|you|please|what|how|price|english|don't|dont|want|need|hello|thanks|monthly|review|shop|have|cafe|much)\b/.test(x)) s.en += 2;
  if (/\b(què|com funciona|gràcies|negoci|resenya|ressenya|preu|si us plau|vull|tinc|això|aquí)\b/.test(x) || /[·]/.test(x)) s.ca += 3;
  if (/\b(je|vous|merci|comment|prix|bonjour|s'il|salut|oui)\b/.test(x) || /[œêâù]/.test(x)) s.fr += 2;
  if (/\b(qué|cómo|precio|gracias|hola|negocio|reseña|vale|dime|más|puedes|quiero|hablar|español|espanol)\b/.test(x) || /[ñ¿¡]/.test(x)) s.es += 2;
  return s;
}

export function explicitLangSwitch(text: string): ConvoLang | null {
  const x = text.toLowerCase();
  if (/\b(i don['’]?t speak|no speak|i no speak|no parlo|no hablo)\b/.test(x)) return null;
  if (/\b(en catal[aà]|parl(em|ar) catal[aà]|in catalan)\b/.test(x)) return "ca";
  if (/\b(in english|speak english|talk (here )?in english|english please)\b/.test(x)) return "en";
  if (/\b(en fran[cç]ais|parler fran[cç]ais|in french)\b/.test(x)) return "fr";
  if (/\b(en castellano|en espa[nñ]ol|hablar espa[nñ]ol|in spanish)\b/.test(x)) return "es";
  return null;
}

/** Lock after the first real sentence. `hola` / `ok` / `vale` do not switch. Explicit ask does. */
export function detectConvoLang(
  inbound: string,
  lastOut?: string | null,
  remembered?: ConvoLang | null,
): ConvoLang {
  const asked = explicitLangSwitch(inbound);
  if (asked) return asked;

  const trimmed = inbound.replace(/\s+/g, " ").trim();
  const weak = !trimmed || SHORT.test(trimmed) || trimmed.split(/\s+/).length <= 2;
  if (remembered && weak) return remembered;

  const cur = score(inbound);
  const best = (Object.entries(cur) as [ConvoLang, number][]).sort((a, b) => b[1] - a[1])[0];
  if (best[1] > 0) return best[0];
  if (remembered) return remembered;
  if (lastOut) {
    const prev = score(lastOut);
    const pb = (Object.entries(prev) as [ConvoLang, number][]).sort((a, b) => b[1] - a[1])[0];
    if (pb[1] > 0) return pb[0];
  }
  return "es";
}
