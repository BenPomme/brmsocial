"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppHeader, OutboundBanner } from "@/components/Chrome";

type Thread = {
  id: string;
  name: string;
  city: string | null;
  lastMessage: string | null;
  lastAt: string | null;
  pendingLow: number;
};
type Message = {
  id: string;
  direction: string;
  body: string;
  avisId: string | null;
  createdAt: string;
};
type Pending = { id: string; stars: number; status: string };

export default function ClientPage() {
  const [email, setEmail] = useState("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pending, setPending] = useState<Pending[]>([]);
  const [shop, setShop] = useState<{ name: string; city: string | null } | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const loadInbox = useCallback(async () => {
    const [me, inbox] = await Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/client/inbox").then((r) => r.json()),
    ]);
    setEmail(me.session?.email ?? "");
    const list = inbox.threads ?? [];
    setThreads(list);
    if (!active && list[0]) setActive(list[0].id);
  }, [active]);

  const loadThread = useCallback(async (id: string) => {
    const res = await fetch(`/api/client/thread/${id}`);
    const data = await res.json();
    setShop(data.client ?? null);
    setMessages(data.messages ?? []);
    setPending(data.pending ?? []);
  }, []);

  useEffect(() => {
    loadInbox().catch(console.error);
  }, [loadInbox]);

  useEffect(() => {
    if (active) loadThread(active).catch(console.error);
  }, [active, loadThread]);

  async function send(value: string) {
    if (!active || !value.trim()) return;
    setBusy(true);
    await fetch(`/api/client/thread/${active}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: value,
        avisId: pending[0]?.id,
      }),
    });
    setText("");
    setBusy(false);
    await Promise.all([loadInbox(), loadThread(active)]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(text);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <OutboundBanner />
      <AppHeader role="client" email={email} />
      <div className="flex-1 grid md:grid-cols-[280px_1fr] min-h-0">
        <aside className="border-r border-line bg-white/50 overflow-auto">
          <p className="px-4 py-3 text-xs uppercase tracking-wide text-muted">Fils simulés (pas Meta)</p>
          {threads.length === 0 && (
            <p className="px-4 text-sm text-muted">
              Pas encore de ping. L’admin doit d’abord appliquer un scope Places.
            </p>
          )}
          {threads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`w-full text-left px-4 py-3 border-b border-line ${active === t.id ? "bg-sand" : ""}`}
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-sm">{t.name}</span>
                {t.pendingLow > 0 && (
                  <span className="text-[10px] bg-accent text-white rounded-full px-1.5">{t.pendingLow}</span>
                )}
              </div>
              <p className="text-xs text-muted line-clamp-2 mt-1">{t.lastMessage}</p>
            </button>
          ))}
        </aside>
        <section className="flex flex-col min-h-[70vh]">
          <div className="bg-wa-header text-white px-4 py-3">
            <p className="font-medium">{shop?.name ?? "WhatsApp Babyrock (simulé)"}</p>
            <p className="text-xs opacity-80">{shop?.city} · aucun numéro réel</p>
          </div>
          <div className="flex-1 wa-pattern overflow-auto p-4 space-y-2">
            {messages.map((m) => {
              const mine = m.direction === "in";
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap shadow-sm ${
                      mine ? "bg-wa-out" : "bg-white"
                    }`}
                  >
                    {m.body}
                    <div className="text-[10px] text-muted mt-1 text-right">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={onSubmit} className="bg-sand p-3 flex gap-2 items-end">
            <button
              type="button"
              disabled={busy || pending.length === 0}
              onClick={() => send("OK")}
              className="rounded-lg bg-wa text-white px-4 py-2 text-sm disabled:opacity-40"
            >
              OK
            </button>
            <textarea
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm min-h-12"
              placeholder="Coller un texte à publier, ou OK"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              disabled={busy || !text.trim()}
              className="rounded-lg bg-ink text-paper px-4 py-2 text-sm disabled:opacity-40"
            >
              Envoyer
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
