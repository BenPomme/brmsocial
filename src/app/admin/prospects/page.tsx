"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader, OutboundBanner, StatusBadge } from "@/components/Chrome";

type Row = {
  id: string;
  name: string;
  city: string;
  categorySlug: string | null;
  source: string;
  mapsUri: string | null;
  rating: number | null;
  userRatingCount: number | null;
  inspectReviews6m: number | null;
  inspectUnreplied6m: number | null;
  inspectVerdict: string | null;
  replyPct: number | null;
  email: string | null;
  outreachTo: string | null;
  waSite: string | null;
  mapsPhone: string | null;
  websiteUri: string | null;
  outreachSubject: string | null;
  outreachBody: string | null;
  outreachStatus: string | null;
  pipeline: string;
  emailTrust: { level: string; warning: string | null };
  lastInbox: string | null;
  lastInboxStatus: string | null;
  paid: boolean;
};

export default function ProspectsPage() {
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"all" | "scout" | "inbound" | "paid">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, boolean>>({});

  const refresh = useCallback(async () => {
    const [me, data] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/prospects").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    setLeads(data.leads ?? []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setNotice(String(e)));
  }, [refresh]);

  const shown = useMemo(() => {
    return leads.filter((l) => {
      if (filter === "paid") return l.paid;
      if (filter === "inbound") return l.source === "inbound";
      if (filter === "scout") return l.source !== "inbound" && !l.paid;
      return true;
    });
  }, [leads, filter]);

  async function act(action: string, extra: Record<string, unknown>) {
    setBusy(action + String(extra.leadId ?? ""));
    setNotice(null);
    const res = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) setNotice(data.error ?? "failed");
    else if (data.delivery?.reason) setNotice(String(data.delivery.reason));
    else if (data.skipped?.length) setNotice(data.skipped.join("; "));
    await refresh();
  }

  const open = leads.find((l) => l.id === openId);

  return (
    <div className="min-h-screen">
      <OutboundBanner />
      <AppHeader role="admin" email={email} />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl">Prospects</h1>
            <p className="text-sm text-muted mt-1">
              ≥50 reviews and under 15% owner replies. Maps phone is visible, never sent. Approve needs a
              To:. Delivery stays off until you send a lot.
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            {(["all", "scout", "inbound", "paid"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full ${filter === f ? "bg-ink text-paper" : "bg-sand"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {notice && <p className="text-sm bg-white/70 border border-line rounded-xl px-4 py-3">{notice}</p>}
        <div className="flex gap-2">
          <button
            className="rounded-lg bg-ink text-paper px-3 py-1.5 text-sm"
            disabled={!!busy}
            onClick={() =>
              act("send_lot", { leadIds: Object.keys(picked).filter((id) => picked[id]) })
            }
          >
            Send this lot
          </button>
        </div>
        <div className="overflow-auto border border-line rounded-2xl bg-white/70">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted bg-sand/60">
              <tr>
                <th className="px-2 py-2"></th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Area</th>
                <th className="px-3 py-2">Reviews</th>
                <th className="px-3 py-2">Owner replies</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">WA</th>
                <th className="px-3 py-2">Maps phone</th>
                <th className="px-3 py-2">Us</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={10}>
                    Empty. Add an area on Scope, then Add to scope (first scan once).
                  </td>
                </tr>
              )}
              {shown.map((l) => (
                <tr
                  key={l.id}
                  className={`border-t border-line ${l.paid ? "bg-moss/15" : l.source === "inbound" ? "bg-sky-50" : ""}`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={!!picked[l.id]}
                      onChange={(e) => setPicked((p) => ({ ...p, [l.id]: e.target.checked }))}
                      disabled={l.pipeline !== "approved"}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button className="underline text-left" onClick={() => setOpenId(l.id)}>
                      {l.name}
                    </button>
                    <div className="text-xs text-muted">{l.source}</div>
                  </td>
                  <td className="px-3 py-2">{l.city}</td>
                  <td className="px-3 py-2">{l.userRatingCount ?? "—"}</td>
                  <td className="px-3 py-2">
                    {l.replyPct == null ? "—" : `${l.replyPct}%`}
                    {l.inspectUnreplied6m != null ? (
                      <span className="text-muted text-xs"> ({l.inspectUnreplied6m} unanswered)</span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{l.outreachTo ?? l.email ?? "—"}</td>
                  <td className="px-3 py-2">{l.waSite ?? "—"}</td>
                  <td className="px-3 py-2 text-muted">{l.mapsPhone ?? "—"}</td>
                  <td className="px-3 py-2">{l.lastInboxStatus ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={l.pipeline} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {open && (
          <section className="bg-white/70 border border-line rounded-2xl p-5 space-y-3">
            <div className="flex justify-between">
              <h2 className="font-display text-2xl">{open.name}</h2>
              <button className="text-sm underline" onClick={() => setOpenId(null)}>
                Close
              </button>
            </div>
            <p className="text-sm text-muted">
              {open.websiteUri ?? "no site"} · Maps phone {open.mapsPhone ?? "none"} (never sent)
            </p>
            <form
              className="flex flex-wrap gap-2 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                act("contact", {
                  leadId: open.id,
                  email: String(fd.get("email") ?? ""),
                  wa: String(fd.get("wa") ?? ""),
                });
              }}
            >
              <input
                name="email"
                defaultValue={open.outreachTo ?? open.email ?? ""}
                placeholder="email To:"
                className="border border-line rounded-lg px-2 py-1"
              />
              <input
                name="wa"
                defaultValue={open.waSite ?? ""}
                placeholder="WhatsApp"
                className="border border-line rounded-lg px-2 py-1"
              />
              <button className="underline" disabled={!!busy}>
                Save contact
              </button>
            </form>
            <textarea
              className="w-full min-h-40 border border-line rounded-xl p-3 text-sm"
              defaultValue={open.outreachBody ?? ""}
              key={open.id + (open.outreachBody ?? "")}
              onBlur={(e) => {
                if (e.target.value !== (open.outreachBody ?? "")) {
                  act("save_draft", { leadId: open.id, outreachBody: e.target.value });
                }
              }}
            />
            <div className="flex gap-2">
              <button className="text-sm underline" onClick={() => act("compose", { leadId: open.id })}>
                Write draft
              </button>
              <button className="text-sm underline" onClick={() => act("approve", { leadId: open.id })}>
                Approve
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
