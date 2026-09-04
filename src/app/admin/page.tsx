"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppHeader, OutboundBanner, StatusBadge } from "@/components/Chrome";

type City = { id: string; name: string; country: string; active: boolean; source: string };
type Category = {
  id: string;
  slug: string;
  label: string;
  active: boolean;
  placesType: string;
  source: string;
};
type Change = {
  id: string;
  actor: string;
  rawMessage: string;
  reply: string | null;
  diff: unknown;
  status: string;
  createdAt: string;
};
type Place = {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  formattedAddress: string | null;
  mapsUri: string | null;
  rating: number | null;
  status: string;
  publishLive: boolean;
  category: { slug: string; label: string } | null;
  lead: {
    userRatingCount: number | null;
    inspectReviews6m: number | null;
    inspectReplied6m: number | null;
    inspectUnreplied6m: number | null;
    inspectVerdict: string | null;
    inspectTruncated: boolean | null;
    email: string | null;
    websiteUri: string | null;
    outreachTo: string | null;
    emailTrust: { level: "ok" | "uncertain" | "mismatch" | "missing"; warning: string | null } | null;
  } | null;
  _count: { avis: number };
};
type Job = {
  id: string;
  kind: string;
  status: string;
  errorText: string | null;
  result: unknown;
  createdAt: string;
};
type Scan = {
  id: string;
  areaName: string;
  country: string;
  categorySlug: string;
  scannedAt: string;
  actor: string;
};
type PaidClient = {
  id: string;
  name: string;
  city: string | null;
  status: string;
  plan: string;
  emailPublic: string | null;
  legalName: string | null;
  taxId: string | null;
  vatMode: string | null;
  stripeOrBizumRef: string | null;
  stripeInvoiceId: string | null;
  offer: string | null;
  trialEndsAt: string | null;
  catchupMonths: number | null;
};

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [placesOn, setPlacesOn] = useState(false);
  const [dfsOn, setDfsOn] = useState(false);
  const [xaiOn, setXaiOn] = useState(false);
  const [stripeOn, setStripeOn] = useState(false);
  const [stripeMode, setStripeMode] = useState<string>("off");
  const [paid, setPaid] = useState<PaidClient[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [message, setMessage] = useState("active Rubi, category restaurant");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [me, scope, pl, jb, bill] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/scope").then((r) => r.json()),
      fetch("/api/admin/places").then((r) => r.json()),
      fetch("/api/admin/jobs").then((r) => r.json()),
      fetch("/api/admin/billing").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    setPlacesOn(Boolean(me.flags?.placesKey));
    setDfsOn(Boolean(me.flags?.dataforseo));
    setXaiOn(Boolean(me.flags?.xaiKey));
    setStripeOn(Boolean(me.flags?.stripe));
    setStripeMode(typeof me.flags?.stripeMode === "string" ? me.flags.stripeMode : "off");
    setPaid(bill.clients ?? []);
    setCities(scope.cities ?? []);
    setCategories(scope.categories ?? []);
    setChanges(scope.changes ?? []);
    setScans(scope.scans ?? []);
    setPlaces(pl.clients ?? []);
    setJobs(jb.jobs ?? []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setNotice(String(e)));
  }, [refresh]);

  async function sendChat(e: FormEvent) {
    e.preventDefault();
    setBusy("chat");
    setNotice(null);
    const res = await fetch("/api/admin/scope/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setNotice(data.error ?? "échec chat");
      return;
    }
    setMessage("");
    await refresh();
  }

  async function decide(id: string, decision: "apply" | "reject") {
    setBusy(id);
    setNotice(null);
    const res = await fetch("/api/admin/scope/decision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, decision }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setNotice(data.error ?? "échec");
      return;
    }
    if (decision === "apply") {
      const waves = data.scan?.waves as Array<{ area?: string; skipped?: boolean; places?: number; error?: string }> | undefined;
      const skipped = waves?.filter((w) => w.skipped).length ?? 0;
      const ran = waves?.filter((w) => !w.skipped) ?? [];
      setNotice(
        data.scan?.reason
          ? String(data.scan.reason)
          : `Scope saved. First scan: ${ran.map((w) => `${w.area} (${w.places ?? 0})`).join(", ") || "none"}; already in Past scans: ${skipped}.`,
      );
    }
    await refresh();
  }

  async function toggle(kind: "city" | "category", id: string, active: boolean) {
    setBusy(id);
    const res = await fetch("/api/admin/scope/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id, active }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) setNotice(data.error ?? "échec toggle");
    else if (active && data.scout?.error) setNotice(String(data.scout.error));
    await refresh();
  }

  async function rescout(force?: { cityId?: string; categoryId?: string }) {
    setBusy("scout");
    const res = await fetch("/api/admin/scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(force ? { force: true, ...force } : {}),
    });
    const data = await res.json();
    setBusy(null);
    const waves = data.scan?.waves as Array<{ skipped?: boolean; area?: string }> | undefined;
    setNotice(
      data.scan?.reason
        ? String(data.scan.reason)
        : `Scan: ${waves?.filter((w) => !w.skipped).length ?? 0} new, ${waves?.filter((w) => w.skipped).length ?? 0} already in Past scans.`,
    );
    await refresh();
  }

  async function reinspect() {
    setBusy("inspect");
    const city = cities.find((c) => c.active)?.name;
    const res = await fetch("/api/admin/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(city ? { city } : {}),
    });
    const data = await res.json();
    setBusy(null);
    const r = data.inspect?.result;
    setNotice(
      data.inspect?.error
        ? String(data.inspect.error)
        : `Inspect 6 mois : ${r?.orphan ?? "?"} sans réponse, ${r?.partial ?? "?"} partiels, coût ${r?.costUsd ?? "?"} $`,
    );
    await refresh();
  }

  const proposed = changes.filter((c) => c.status === "proposed");
  const emailAlerts = places.filter((p) => {
    const level = p.lead?.emailTrust?.level;
    return level === "mismatch" || level === "uncertain";
  });

  return (
    <div className="min-h-screen">
      <OutboundBanner />
      <AppHeader role="admin" email={email} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-wrap gap-3 text-xs">
          <span className={`px-2 py-1 rounded-full ${placesOn ? "bg-emerald-100 text-ok" : "bg-red-100 text-accent-dark"}`}>
            Places {placesOn ? "clé présente" : "clé manquante"}
          </span>
          <span className={`px-2 py-1 rounded-full ${dfsOn ? "bg-emerald-100 text-ok" : "bg-sand text-muted"}`}>
            DataForSEO {dfsOn ? "on (Inspect avis + réponses proprio)" : "off"}
          </span>
          <span className={`px-2 py-1 rounded-full ${xaiOn ? "bg-emerald-100 text-ok" : "bg-sand text-muted"}`}>
            xAI {xaiOn ? "on (Scope + brouillons)" : "off — parser / templates"}
          </span>
          <span className={`px-2 py-1 rounded-full ${stripeOn ? "bg-emerald-100 text-ok" : "bg-red-100 text-accent-dark"}`}>
            Stripe {stripeOn ? stripeMode : "clé manquante"}
          </span>
        </div>
        {notice && (
          <p className="text-sm bg-white/70 border border-line rounded-xl px-4 py-3">{notice}</p>
        )}

        <section className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white/70 border border-line rounded-2xl p-5 shadow-card">
            <h2 className="font-display text-2xl mb-1">Chat scope</h2>
            <p className="text-sm text-muted mb-4">
              Une phrase, un diff. Rien ne part en Scout tant que tu n’as pas cliqué Appliquer. L’agent
              ne prospecte pas, ne maille pas, ne publie pas.
            </p>
            <form onSubmit={sendChat} className="space-y-3">
              <textarea
                className="w-full min-h-24 rounded-lg border border-line bg-paper px-3 py-2 text-sm"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="active Barcelone, catégorie restaurant"
              />
              <button
                disabled={busy === "chat"}
                className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-60"
              >
                {busy === "chat" ? "Lecture…" : "Envoyer"}
              </button>
            </form>
            <div className="mt-5 space-y-3 max-h-[420px] overflow-auto">
              {proposed.length === 0 && changes.length === 0 && (
                <p className="text-sm text-muted">Pas encore de message. Scope vide au départ, volontairement.</p>
              )}
              {changes.map((c) => (
                <article key={c.id} className="border border-line rounded-xl p-3 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-muted text-xs">{c.actor}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="font-medium">{c.rawMessage}</p>
                  {c.reply && <p className="mt-1 text-muted whitespace-pre-wrap">{c.reply}</p>}
                  {c.status === "proposed" && (
                    <div className="mt-3 flex gap-2">
                      <button
                        disabled={busy === c.id}
                        onClick={() => decide(c.id, "apply")}
                        className="rounded-lg bg-moss text-white px-3 py-1.5 text-xs"
                      >
                        {busy === c.id ? "First scan…" : "Add to scope"}
                      </button>
                      <button
                        disabled={busy === c.id}
                        onClick={() => decide(c.id, "reject")}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs"
                      >
                        Refuser
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 border border-line rounded-2xl p-5 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl">Villes</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => rescout()}
                    disabled={busy === "scout"}
                    className="text-xs underline decoration-line"
                  >
                    {busy === "scout" ? "Scan…" : "First scan"}
                  </button>
                  <button
                    onClick={reinspect}
                    disabled={busy === "inspect"}
                    className="text-xs underline decoration-line"
                  >
                    {busy === "inspect" ? "Inspect…" : "Inspect 6 mois"}
                  </button>
                </div>
              </div>
              {cities.length === 0 && <p className="text-sm text-muted">Aucune ville. Passe par le chat.</p>}
              <ul className="space-y-2">
                {cities.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span>
                      {c.name} <span className="text-muted">{c.country}</span>
                    </span>
                    <button
                      disabled={busy === c.id}
                      onClick={() => toggle("city", c.id, !c.active)}
                      className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-moss text-white" : "bg-sand text-muted"}`}
                    >
                      {c.active ? "on" : "off"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/70 border border-line rounded-2xl p-5 shadow-card">
              <h2 className="font-display text-2xl mb-3">Past scans</h2>
              {scans.length === 0 && <p className="text-sm text-muted">None yet. Add to scope runs a first scan once.</p>}
              <ul className="space-y-2">
                {scans.map((s) => (
                  <li key={s.id} className="flex items-center justify-between text-sm gap-2">
                    <span>
                      {s.areaName} × {s.categorySlug}{" "}
                      <span className="text-muted">{new Date(s.scannedAt).toLocaleString()}</span>
                    </span>
                    <button
                      className="text-xs underline"
                      disabled={busy === "scout"}
                      onClick={() => {
                        const city = cities.find((c) => c.name === s.areaName && c.country === s.country);
                        const cat = categories.find((c) => c.slug === s.categorySlug);
                        if (city && cat) rescout({ cityId: city.id, categoryId: cat.id });
                      }}
                    >
                      Scan again
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/70 border border-line rounded-2xl p-5 shadow-card">
              <h2 className="font-display text-2xl mb-3">Catégories</h2>
              {categories.length === 0 && (
                <p className="text-sm text-muted">Aucune catégorie. Ce n’est pas du code, c’est cette table.</p>
              )}
              <ul className="space-y-2">
                {categories.map((c) => (
                  <li key={c.id} className="flex items-center justify-between text-sm">
                    <span>
                      {c.label} <span className="text-muted">{c.placesType}</span>
                    </span>
                    <button
                      disabled={busy === c.id}
                      onClick={() => toggle("category", c.id, !c.active)}
                      className={`px-2 py-1 rounded-full text-xs ${c.active ? "bg-moss text-white" : "bg-sand text-muted"}`}
                    >
                      {c.active ? "on" : "off"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white/70 border border-line rounded-2xl p-5 shadow-card">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
            <h2 className="font-display text-2xl">Paiement Stripe</h2>
            <a href="/pay" className="text-sm underline decoration-line underline-offset-4">
              Ouvrir le checkout test
            </a>
          </div>
          <p className="text-sm text-muted mb-4">
            Catalogue TTC : 99 € / mes, 799 € / año. Sant Cugat : 1er mois 0 € + rattrapage 3 mois,
            puis 99 €. Factura HT + IVA 21 %. Pas Billing 0,7 %.
          </p>
          {paid.length === 0 ? (
            <p className="text-sm text-muted">Aucun paiement encore. La simu vendredi = un 4242 sur /pay.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {paid.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 border border-line rounded-xl px-3 py-2">
                  <span>
                    {c.legalName ?? c.name}
                    {c.taxId ? <span className="text-muted"> · {c.taxId}</span> : null}
                    {c.vatMode ? <span className="text-muted"> · {c.vatMode}</span> : null}
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-muted truncate max-w-[180px]">{c.stripeOrBizumRef ?? "—"}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Commerces Places dans le scope actif</h2>
          <div className="mb-4 rounded-xl border-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <p className="font-medium">Attention — emails de démarchage</p>
            <p className="mt-1">
              Les adresses viennent du <em>site</em> du restaurant, jamais du téléphone Google Maps.
              Si le domaine de l’email n’est pas celui du site (agence, thème, autre commerce, Gmail),
              on n’est <strong>pas sûrs</strong> que ça arrive au resto. Ne pas envoyer sans vérifier.
              Carrier compose seulement : rien ne part tant que le lot n’est pas validé.
            </p>
            {emailAlerts.length > 0 && (
              <p className="mt-2 font-medium">
                {emailAlerts.length} fiche{emailAlerts.length > 1 ? "s" : ""} avec un email pas sûr
                (bandeau orange dans le tableau).
              </p>
            )}
          </div>
          {places.length === 0 ? (
            <p className="text-sm text-muted">
              Liste vide tant que le scope n’est pas appliqué, ou si la clé Places manque.
            </p>
          ) : (
            <div className="overflow-auto border border-line rounded-2xl bg-white/70">
              <table className="min-w-full text-sm">
                <thead className="text-left text-muted bg-sand/60">
                  <tr>
                    <th className="px-3 py-2">Nom</th>
                    <th className="px-3 py-2">Ville</th>
                    <th className="px-3 py-2">Catégorie</th>
                    <th className="px-3 py-2">Note</th>
                    <th className="px-3 py-2">6 mois</th>
                    <th className="px-3 py-2">Sans réponse</th>
                    <th className="px-3 py-2">Inspect</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {places.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t border-line ${
                        p.lead?.emailTrust?.level === "mismatch"
                          ? "bg-red-50"
                          : p.lead?.emailTrust?.level === "uncertain"
                            ? "bg-amber-50"
                            : ""
                      }`}
                    >
                      <td className="px-3 py-2">
                        {p.mapsUri ? (
                          <a href={p.mapsUri} className="underline" target="_blank" rel="noreferrer">
                            {p.name}
                          </a>
                        ) : (
                          p.name
                        )}
                        <div className="text-xs text-muted">{p.formattedAddress}</div>
                      </td>
                      <td className="px-3 py-2">
                        {p.city} {p.country}
                      </td>
                      <td className="px-3 py-2">{p.category?.label ?? "—"}</td>
                      <td className="px-3 py-2">{p.rating ?? "—"}</td>
                      <td className="px-3 py-2">
                        {p.lead?.inspectReviews6m != null ? p.lead.inspectReviews6m : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {p.lead?.inspectUnreplied6m != null ? p.lead.inspectUnreplied6m : "—"}
                      </td>
                      <td className="px-3 py-2">
                        {p.lead?.inspectVerdict ? (
                          <span>
                            <StatusBadge status={p.lead.inspectVerdict} />
                            {p.lead.inspectTruncated ? (
                              <span className="text-xs text-muted"> (tronqué)</span>
                            ) : null}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 max-w-[280px]">
                        {p.lead?.email || p.lead?.outreachTo ? (
                          <div>
                            <div className="break-all">{p.lead.email || p.lead.outreachTo}</div>
                            {p.lead.emailTrust?.warning && (
                              <p
                                className={`mt-1 text-xs leading-snug ${
                                  p.lead.emailTrust.level === "mismatch"
                                    ? "text-red-800 font-medium"
                                    : "text-amber-900"
                                }`}
                              >
                                {p.lead.emailTrust.warning}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">
                            {p.lead?.emailTrust?.warning ?? "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl mb-3">Jobs (dry-run)</h2>
          {jobs.length === 0 ? (
            <p className="text-sm text-muted">Aucun job. Carrier / WA / SMTP ne démarrent pas.</p>
          ) : (
            <ul className="space-y-2">
              {jobs.map((j) => (
                <li key={j.id} className="bg-white/70 border border-line rounded-xl px-4 py-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{j.kind}</span>
                    <StatusBadge status={j.status} />
                    <span className="text-xs text-muted">{new Date(j.createdAt).toLocaleString()}</span>
                  </div>
                  {j.errorText && <p className="text-accent mt-1">{j.errorText}</p>}
                  {j.result != null && (
                    <pre className="mt-2 text-[11px] text-muted overflow-auto max-h-28">
                      {JSON.stringify(j.result, null, 2)}
                    </pre>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
