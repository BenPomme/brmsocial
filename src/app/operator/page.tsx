"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader, OutboundBanner, StatusBadge } from "@/components/Chrome";

const CHECKS = [
  { key: "detail_in_review", label: "Le détail repris est dans l’avis" },
  { key: "no_person_name", label: "Pas de nom de personne / employé" },
  { key: "no_health_invented", label: "Pas de santé / intoxication / hygiène inventée" },
  { key: "no_commercial_gesture", label: "Pas de geste commercial inventé" },
  { key: "language_matches", label: "Langue = langue de l’avis" },
] as const;

type AvisRow = {
  id: string;
  client: { id: string; name: string; city: string | null };
  stars: number;
  lang: string | null;
  authorPublicName: string | null;
  body: string;
  status: string;
  currentText: string;
  draftText: string | null;
  operatorText: string | null;
  sentToOwnerText: string | null;
  publishedText: string | null;
  draftModel: string | null;
};

type ChecklistState = Record<(typeof CHECKS)[number]["key"], boolean>;

function emptyChecks(): ChecklistState {
  return {
    detail_in_review: false,
    no_person_name: false,
    no_health_invented: false,
    no_commercial_gesture: false,
    language_matches: false,
  };
}

export default function OperatorPage() {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<AvisRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, ChecklistState>>({});
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<"all" | "45" | "13" | "pret">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [me, q] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/operator/queue").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    setRows(q.avis ?? []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setNotice(String(e)));
  }, [refresh]);

  const visible = useMemo(() => {
    return rows.filter((r) => {
      if (filter === "45") return r.stars >= 4;
      if (filter === "13") return r.stars <= 3;
      if (filter === "pret") return r.status === "pret";
      return true;
    });
  }, [rows, filter]);

  function checksFor(id: string) {
    return checks[id] ?? emptyChecks();
  }
  function allChecked(id: string) {
    const c = checksFor(id);
    return CHECKS.every((k) => c[k.key]);
  }

  async function publish(row: AvisRow) {
    if (!allChecked(row.id)) return;
    setBusy(row.id);
    setNotice(null);
    const res = await fetch(`/api/operator/avis/${row.id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checklist: checksFor(row.id) }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setNotice(data.error ?? "échec publish");
      return;
    }
    setNotice(`Publié en base. ${data.reason}`);
    await refresh();
  }

  async function saveEdit(row: AvisRow) {
    const text = (edits[row.id] ?? row.currentText).trim();
    setBusy(`edit-${row.id}`);
    const res = await fetch(`/api/operator/avis/${row.id}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) setNotice(data.error ?? "échec edit");
    await refresh();
  }

  async function block(row: AvisRow) {
    setBusy(`block-${row.id}`);
    const res = await fetch(`/api/operator/avis/${row.id}/block`, { method: "POST" });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) setNotice(data.error ?? "échec block");
    await refresh();
  }

  return (
    <div className="min-h-screen">
      <OutboundBanner />
      <AppHeader role="operator" email={email} />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between gap-4 mb-5">
          <div>
            <h1 className="font-display text-3xl">File d’avis</h1>
            <p className="text-sm text-muted">Pas de sélecteur de ville. Pas d’ajout de Barcelone ici.</p>
          </div>
          <div className="flex gap-2 text-xs">
            {(["all", "45", "13", "pret"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full ${filter === f ? "bg-ink text-paper" : "bg-sand"}`}
              >
                {f === "all" ? "Tous" : f === "45" ? "4–5★" : f === "13" ? "1–3★" : "Prêt"}
              </button>
            ))}
          </div>
        </div>
        {notice && <p className="mb-4 text-sm bg-white/70 border border-line rounded-xl px-4 py-3">{notice}</p>}
        {visible.length === 0 ? (
          <p className="text-muted text-sm">
            File vide. Connecte-toi admin, active une ville et une catégorie, Appliquer, puis reviens.
          </p>
        ) : (
          <div className="space-y-3">
            {visible.map((row) => {
              const open = openId === row.id;
              const canPublishStars = row.stars >= 4 || row.status === "pret";
              const publishReady = canPublishStars && allChecked(row.id) && row.status !== "publie" && row.status !== "bloque";
              return (
                <article key={row.id} className="bg-white/80 border border-line rounded-2xl p-4 shadow-card">
                  <button
                    type="button"
                    className="w-full text-left grid sm:grid-cols-[1fr_auto_auto_2fr] gap-3 items-start"
                    onClick={() => setOpenId(open ? null : row.id)}
                  >
                    <div>
                      <div className="font-medium">{row.client.name}</div>
                      <div className="text-xs text-muted">{row.client.city}</div>
                    </div>
                    <div className="text-lg font-display">{row.stars}★</div>
                    <StatusBadge status={row.status} />
                    <p className="text-sm text-muted line-clamp-2">{row.body}</p>
                  </button>
                  {open && (
                    <div className="mt-4 border-t border-line pt-4 grid lg:grid-cols-2 gap-5">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted mb-1">Avis</p>
                        <p className="text-sm whitespace-pre-wrap">
                          {row.authorPublicName ? `${row.authorPublicName} · ` : ""}
                          {row.lang}
                          {"\n"}
                          {row.body}
                        </p>
                        <p className="text-xs uppercase tracking-wide text-muted mt-4 mb-1">
                          Brouillon {row.draftModel ? `(${row.draftModel})` : ""}
                        </p>
                        <textarea
                          className="w-full min-h-28 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                          value={edits[row.id] ?? row.currentText}
                          onChange={(e) => setEdits((s) => ({ ...s, [row.id]: e.target.value }))}
                        />
                        <button
                          type="button"
                          className="mt-2 text-xs underline"
                          disabled={busy === `edit-${row.id}`}
                          onClick={() => saveEdit(row)}
                        >
                          Enregistrer l’édition
                        </button>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted mb-2">Checklist avant Publier</p>
                        <ul className="space-y-2">
                          {CHECKS.map((c) => (
                            <li key={c.key}>
                              <label className="flex items-start gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={checksFor(row.id)[c.key]}
                                  onChange={(e) =>
                                    setChecks((s) => ({
                                      ...s,
                                      [row.id]: { ...checksFor(row.id), [c.key]: e.target.checked },
                                    }))
                                  }
                                />
                                <span>{c.label}</span>
                              </label>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={!publishReady || busy === row.id}
                            onClick={() => publish(row)}
                            className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-40"
                          >
                            {busy === row.id ? "Publication…" : "Publier"}
                          </button>
                          <button
                            type="button"
                            onClick={() => block(row)}
                            className="rounded-lg border border-line px-4 py-2 text-sm"
                          >
                            Bloquer
                          </button>
                        </div>
                        {row.stars <= 3 && row.status !== "pret" && (
                          <p className="text-xs text-accent mt-2">
                            Pas de Publier sur 1–3★ tant que le client n’a pas répondu OK (statut pret).
                          </p>
                        )}
                        {!allChecked(row.id) && (
                          <p className="text-xs text-muted mt-2">Une case non cochée → Publier refuse.</p>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
