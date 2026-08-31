/**
 * Emails and WhatsApp from the restaurant website only.
 * Never use the Google Maps phone number as a contact.
 */

const EMAIL_RE = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const MAILTO_RE = /mailto:([^"'?\s>]+)/gi;
const WA_RE = /(?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?(\+?\d{8,15})/gi;

const SKIP_EMAIL =
  /(?:noreply|no-reply|donotreply|privacy|webmaster|sentry|wixpress|cloudflare|example\.com|googleapis|gstatic|schema\.org|wordpress|w3\.org|sentry\.io|png|jpg|jpeg|gif|webp|svg)$/i;

const CONTACT_HINT =
  /contacto|contacte|contact|aviso|legal|privacidad|privacy|impressum|nosotros|about|qui-?som|reserv/i;

export type SiteContacts = {
  websiteUri: string;
  emails: string[];
  whatsapp: string[];
  pagesVisited: string[];
  errors: string[];
};

function normalizeEmail(raw: string) {
  return raw
    .trim()
    .replace(/^mailto:/i, "")
    .replace(/[>,;]+$/, "")
    .toLowerCase();
}

function emailOk(email: string, siteHost: string | null) {
  if (!email.includes("@")) return false;
  if (SKIP_EMAIL.test(email)) return false;
  if (/\.(png|jpe?g|gif|webp|svg|css|js)$/i.test(email)) return false;
  const host = email.split("@")[1] ?? "";
  if (host.length < 3) return false;
  if (siteHost && host.includes("facebook")) return false;
  return true;
}

function scoreEmail(email: string, siteHost: string | null) {
  const host = email.split("@")[1] ?? "";
  let n = 0;
  if (siteHost && (host === siteHost || host.endsWith(`.${siteHost}`))) n += 50;
  if (/^(info|hola|contacto|contacte|reservas|reserva|hello|mail)@/i.test(email)) n += 20;
  if (/@(gmail|hotmail|yahoo|outlook|icloud)\./i.test(email)) n -= 10;
  return n;
}

async function fetchText(url: string, timeoutMs = 12000): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "BabyrockSocial/0.1 (+https://babyrock.ai) contact discovery",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const ctype = res.headers.get("content-type") ?? "";
    if (ctype && !/text\/html|application\/xhtml|text\/plain/i.test(ctype)) {
      throw new Error(`not html (${ctype})`);
    }
    return await res.text();
  } finally {
    clearTimeout(t);
  }
}

function strip(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

function absUrl(href: string, base: string) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function sameSite(url: string, origin: string) {
  try {
    const u = new URL(url);
    const o = new URL(origin);
    return u.hostname === o.hostname || u.hostname.endsWith(`.${o.hostname}`);
  } catch {
    return false;
  }
}

function collectFromHtml(html: string, pageUrl: string, siteHost: string | null) {
  const text = strip(html);
  const emails = new Set<string>();
  for (const m of text.match(EMAIL_RE) ?? []) {
    const e = normalizeEmail(m);
    if (emailOk(e, siteHost)) emails.add(e);
  }
  MAILTO_RE.lastIndex = 0;
  let mm: RegExpExecArray | null;
  while ((mm = MAILTO_RE.exec(html))) {
    const e = normalizeEmail(decodeURIComponent(mm[1] ?? ""));
    if (emailOk(e, siteHost)) emails.add(e);
  }
  const whatsapp = new Set<string>();
  WA_RE.lastIndex = 0;
  while ((mm = WA_RE.exec(html))) {
    const n = (mm[1] ?? "").replace(/[^\d+]/g, "");
    if (n.length >= 8) whatsapp.add(n.startsWith("+") ? n : `+${n}`);
  }
  const links: string[] = [];
  const hrefRe = /href=["']([^"']+)["']/gi;
  while ((mm = hrefRe.exec(html))) {
    const abs = absUrl(mm[1] ?? "", pageUrl);
    if (abs) links.push(abs);
  }
  return { emails: [...emails], whatsapp: [...whatsapp], links };
}

export async function findSiteContacts(websiteUri: string): Promise<SiteContacts> {
  const errors: string[] = [];
  const pagesVisited: string[] = [];
  const emails = new Set<string>();
  const whatsapp = new Set<string>();

  let origin: string;
  let siteHost: string;
  try {
    const u = new URL(websiteUri);
    origin = u.origin;
    siteHost = u.hostname.replace(/^www\./, "");
  } catch {
    return { websiteUri, emails: [], whatsapp: [], pagesVisited, errors: ["invalid websiteUri"] };
  }

  const queue: string[] = [websiteUri];
  const seen = new Set<string>();

  while (queue.length && pagesVisited.length < 8) {
    const url = queue.shift()!;
    const key = url.split("#")[0] ?? url;
    if (seen.has(key)) continue;
    seen.add(key);
    let html: string;
    try {
      html = await fetchText(url);
    } catch (e) {
      errors.push(`${url}: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }
    pagesVisited.push(url);
    const found = collectFromHtml(html, url, siteHost);
    for (const e of found.emails) emails.add(e);
    for (const w of found.whatsapp) whatsapp.add(w);
    if (pagesVisited.length === 1) {
      for (const link of found.links) {
        if (!sameSite(link, origin)) continue;
        const path = (() => {
          try {
            return new URL(link).pathname;
          } catch {
            return "";
          }
        })();
        if (CONTACT_HINT.test(path) || CONTACT_HINT.test(link)) queue.push(link);
      }
      if (queue.length === 0) {
        for (const guess of ["/contacto", "/contact", "/contacte", "/aviso-legal", "/reservas"]) {
          queue.push(`${origin}${guess}`);
        }
      }
    }
  }

  const ranked = [...emails].sort((a, b) => scoreEmail(b, siteHost) - scoreEmail(a, siteHost));
  return {
    websiteUri,
    emails: ranked,
    whatsapp: [...whatsapp],
    pagesVisited,
    errors,
  };
}

export function channelPlanFor(email: string | null, wa: string | null): "email" | "email_wa" | "wa_only" | "skip" {
  if (email && wa) return "email_wa";
  if (email) return "email";
  if (wa) return "wa_only";
  return "skip";
}

export type EmailTrustLevel = "ok" | "uncertain" | "mismatch" | "missing";

export type EmailTrust = {
  level: EmailTrustLevel;
  warning: string | null;
};

function hostFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const PERSONAL_MAIL =
  /^(gmail|googlemail|hotmail|live|outlook|yahoo|icloud|me|protonmail|proton)\./i;

export function emailTrust(
  email: string | null | undefined,
  websiteUri: string | null | undefined,
): EmailTrust {
  if (!email) {
    return {
      level: "missing",
      warning: websiteUri
        ? "Pas d'email trouvé sur le site. On n'utilise pas le téléphone Maps."
        : "Pas de site, donc pas d'email d'entreprise. On n'utilise pas le téléphone Maps.",
    };
  }
  const site = hostFromUrl(websiteUri);
  const mailHost = (email.split("@")[1] ?? "").toLowerCase();
  if (site && (mailHost === site || mailHost.endsWith(`.${site}`))) {
    return { level: "ok", warning: null };
  }
  if (PERSONAL_MAIL.test(mailHost)) {
    return {
      level: "uncertain",
      warning: `Attention : on n'est pas sûrs de cet email (${email}). C'est une boîte perso, pas le domaine du restaurant${site ? ` (${site})` : ""}. Vérifier avant d'envoyer.`,
    };
  }
  return {
    level: "mismatch",
    warning: `Attention : on n'est pas sûrs de cet email (${email}). Le domaine ne correspond pas au site du restaurant${site ? ` (${site})` : ""}. Possible agence web, thème, ou autre commerce. Ne pas envoyer sans vérifier.`,
  };
}
