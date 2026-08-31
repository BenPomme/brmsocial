import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export type OutreachTemplate = {
  id: string;
  from: string;
  fromName: string;
  lang: string;
  subject: string;
  body: string;
  path: string;
};

const DEFAULT_PATH = resolve(process.cwd(), "content/outreach/rosalia.es.txt");

const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function formatDateEs(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return `${d.getUTCDate()} de ${MONTHS_ES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
}

export function loadOutreachTemplate(path = DEFAULT_PATH): OutreachTemplate {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error(`outreach template missing frontmatter: ${path}`);
  }
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const eq = line.indexOf(":");
    if (eq < 0) continue;
    meta[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  return {
    id: meta.id ?? "rosalia-es-v1",
    from: meta.from ?? "rosalia@babyrock.ai",
    fromName: meta.from_name ?? "Rosalia",
    lang: meta.lang ?? "es",
    subject: meta.subject ?? "Las reseñas de Google de {{restaurant}}",
    body: match[2].replace(/\n$/, ""),
    path,
  };
}

export function fillOutreach(
  template: OutreachTemplate,
  vars: {
    restaurant: string;
    author: string;
    date: string;
    stars: string | number;
    excerpt: string;
    whatsapp?: string;
  },
) {
  const map: Record<string, string> = {
    restaurant: vars.restaurant,
    author: vars.author,
    date: vars.date,
    stars: String(vars.stars),
    excerpt: vars.excerpt,
    whatsapp: vars.whatsapp ?? "",
  };
  const apply = (s: string) => s.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, k) => map[k] ?? "");
  return {
    from: template.from,
    fromName: template.fromName,
    subject: apply(template.subject),
    body: apply(template.body),
  };
}
