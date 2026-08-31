function read(name: string): string | undefined {
  const v = process.env[name];
  if (v == null || v.trim() === "") return undefined;
  return v.trim();
}

/** Proto hard rule: outbound is off, even if someone puts true in .env. */
export const OUTBOUND_ENABLED = false;

export function envChecklist() {
  const triedOutbound = (process.env.OUTBOUND_ENABLED ?? "false").toLowerCase();
  return {
    DATABASE_URL: Boolean(read("DATABASE_URL")),
    GOOGLE_PLACES_API_KEY: Boolean(read("GOOGLE_PLACES_API_KEY")),
    XAI_API_KEY: Boolean(read("XAI_API_KEY")),
    SESSION_SECRET: Boolean(read("SESSION_SECRET")),
    OUTBOUND_ENABLED,
    outboundEnvTried: triedOutbound,
    XAI_MODEL: read("XAI_MODEL") ?? "grok-4.3",
    SCOUT_MAX_PLACES: Number(read("SCOUT_MAX_PLACES") ?? 10),
    SCOUT_MAX_DETAILS: Number(read("SCOUT_MAX_DETAILS") ?? 12),
    DATAFORSEO_LOGIN: Boolean(read("DATAFORSEO_LOGIN")),
    DATAFORSEO_PASSWORD: Boolean(read("DATAFORSEO_PASSWORD")),
    ZOHO_REFRESH_TOKEN: Boolean(read("ZOHO_REFRESH_TOKEN")),
    INSPECT_MAX_DEPTH: Number(read("INSPECT_MAX_DEPTH") ?? 150),
    INSPECT_WINDOW_MONTHS: Number(read("INSPECT_WINDOW_MONTHS") ?? 6),
  };
}

export function databaseUrl() {
  const url = read("DATABASE_URL");
  if (!url) throw new Error("DATABASE_URL is missing");
  return url;
}

export function sessionSecret() {
  const s = read("SESSION_SECRET");
  if (!s || s.length < 24) {
    throw new Error("SESSION_SECRET is missing or too short (24+ chars)");
  }
  return s;
}

export function placesKey() {
  return read("GOOGLE_PLACES_API_KEY");
}

export function xaiKey() {
  return read("XAI_API_KEY");
}

export function xaiModel() {
  return read("XAI_MODEL") ?? "grok-4.3";
}

export function dataforseoLogin() {
  return read("DATAFORSEO_LOGIN");
}

export function dataforseoPassword() {
  return read("DATAFORSEO_PASSWORD");
}

export function inspectMaxDepth() {
  const n = Number(read("INSPECT_MAX_DEPTH") ?? 150);
  if (!Number.isFinite(n) || n < 10) return 150;
  return Math.min(Math.floor(n), 4490);
}

export function babyrockWhatsappDisplay() {
  return read("BABYROCK_WHATSAPP_DISPLAY") ?? read("BABYROCK_WHATSAPP_E164");
}

export function inspectWindowMonths() {
  const n = Number(read("INSPECT_WINDOW_MONTHS") ?? 6);
  if (!Number.isFinite(n) || n < 1) return 6;
  return Math.floor(n);
}
