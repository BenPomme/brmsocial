"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader, OutboundBanner, StatusBadge } from "@/components/Chrome";

type Lead = {
  id: string;
  name: string;
  city: string;
  outreachTo: string | null;
  outreachSubject: string | null;
  outreachBody: string | null;
  outreachStatus: string | null;
  outreachNote: string | null;
  websiteUri: string | null;
  emailTrust: { level: string; warning: string | null };
};

export default function AdminLotsPage() {
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [me, data] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/outreach").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    setLeads(data.leads ?? []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setNotice(String(e)));
  }, [refresh]);

  async function decide(leadId: string, decision: "approve" | "reject" | "change") {
    setBusy(leadId + decision);
    const note = decision === "change" ? window.prompt("Changement demandé ?") ?? "" : "";
    const res = await fetch("/api/admin/outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, decision, note }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) setNotice(data.error ?? "échec");
    await refresh();
  }

  const open = leads.find((l) => l.id === openId);

  return (
    <div className="min-h-screen">
      <OutboundBanner />
      <AppHeader role="admin" email={email} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl">Lots outreach</h1>
          <p className="text-sm text-muted mt-1">
            Tu valides ou tu jettes avant envoi. L’envoi réel ne part que vers l’allowlist (toi, pour
            l’instant). Un bandeau orange = on n’est pas sûrs de l’email.
          </p>
        </div>
        {notice && <p className="text-sm bg-white/70 border border-line rounded-xl px-4 py-3">{notice}</p>}
        <div className="overflow-auto border border-line rounded-2xl bg-white/70">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted bg-sand/60">
              <tr>
                <th className="px-3 py-2">Resto</th>
                <th className="px-3 py-2">To</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td className="px-3 py-4 text-muted" colSpan={4}>
                    Aucun mail composé. Lance Carrier sur une cible d’abord.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className={`border-t border-line ${l.emailTrust.level === "mismatch" ? "bg-red-50" : ""}`}
                >
                  <td className="px-3 py-2">
                    <button className="underline text-left" onClick={() => setOpenId(l.id)}>
                      {l.name}
                    </button>
                    <div className="text-xs text-muted">{l.city}</div>
                  </td>
                  <td className="px-3 py-2 break-all">
                    {l.outreachTo}
                    {l.emailTrust.warning && (
                      <p className="text-xs text-red-800 font-medium mt-1">{l.emailTrust.warning}</p>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatusBadge status={l.outreachStatus ?? "composed"} />
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      disabled={busy != null}
                      onClick={() => decide(l.id, "approve")}
                      className="text-xs underline mr-2"
                    >
                      Valider
                    </button>
                    <button
                      disabled={busy != null}
                      onClick={() => decide(l.id, "reject")}
                      className="text-xs underline mr-2"
                    >
                      Invalider
                    </button>
                    <button
                      disabled={busy != null}
                      onClick={() => decide(l.id, "change")}
                      className="text-xs underline"
                    >
                      Changer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {open && (
          <article className="bg-white/70 border border-line rounded-2xl p-5 text-sm">
            <h2 className="font-display text-2xl mb-2">{open.outreachSubject}</h2>
            <pre className="whitespace-pre-wrap font-sans text-sm">{open.outreachBody}</pre>
          </article>
        )}
      </main>
    </div>
  );
}
