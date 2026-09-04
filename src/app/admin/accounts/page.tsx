"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader, OutboundBanner, StatusBadge } from "@/components/Chrome";

type Row = {
  id: string;
  name: string;
  city: string | null;
  status: string;
  plan: string;
  emailPublic: string | null;
  billingEmail: string | null;
  whatsappOwner: string | null;
  legalName: string | null;
  taxId: string | null;
  stripeInvoiceId: string | null;
  createdAt: string;
};

export default function AccountsPage() {
  const [email, setEmail] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [me, bill] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/admin/billing").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    setRows(bill.clients ?? []);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setNotice(String(e)));
  }, [refresh]);

  return (
    <div className="min-h-screen">
      <OutboundBanner />
      <AppHeader role="admin" email={email} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <h1 className="font-display text-3xl">Paid accounts</h1>
        <p className="text-sm text-muted">
          One subscription = one shop. Checkout for shops is{" "}
          <a className="underline" href="https://pay.babyrock.ai/pay">
            pay.babyrock.ai/pay
          </a>
          .
        </p>
        {notice && <p className="text-sm bg-white/70 border border-line rounded-xl px-4 py-3">{notice}</p>}
        <div className="overflow-auto border border-line rounded-2xl bg-white/70">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted bg-sand/60">
              <tr>
                <th className="px-3 py-2">Shop</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">WhatsApp</th>
                <th className="px-3 py-2">Plan</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Invoice</th>
                <th className="px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={7}>
                    None yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    {r.name}
                    {r.city ? <div className="text-xs text-muted">{r.city}</div> : null}
                  </td>
                  <td className="px-3 py-2">{r.billingEmail ?? r.emailPublic ?? "—"}</td>
                  <td className="px-3 py-2">{r.whatsappOwner ?? "—"}</td>
                  <td className="px-3 py-2">{r.plan}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2">
                    {r.taxId ? `NIF ${r.taxId}` : "No NIF"}
                    {r.stripeInvoiceId ? <div className="text-xs text-muted">{r.stripeInvoiceId}</div> : null}
                  </td>
                  <td className="px-3 py-2 text-muted">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
