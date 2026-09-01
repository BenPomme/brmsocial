"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function PayForm() {
  const params = useSearchParams();
  const [plan, setPlan] = useState(params.get("plan") === "year" ? "year" : "month");
  const [name, setName] = useState(params.get("name") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canceled = params.get("canceled") === "1";

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/pay/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, name, email, city }),
    });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      setPending(false);
      setError(data.error ?? "No se ha podido abrir el pago");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="font-display text-4xl mb-2">Babyrock</p>
        <p className="text-muted mb-6">
          Pago seguro con Stripe. Un mes: 89 € HT. Doce meses: 748 € HT. Sin IVA automático — lo fija
          el contable.
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted mb-4">Simulación · claves test</p>
        {canceled && (
          <p className="text-sm bg-sand border border-line rounded-xl px-4 py-3 mb-4">Pago cancelado. Puede reintentar.</p>
        )}
        <form onSubmit={onSubmit} className="bg-white/70 border border-line rounded-2xl p-6 shadow-card space-y-4">
          <label className="block text-sm">
            Comercio
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del negocio"
              required
            />
          </label>
          <label className="block text-sm">
            Correo
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Ciudad
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Sant Cugat"
            />
          </label>
          <label className="block text-sm">
            Plan
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="month">Mes a mes — 89 €</option>
              <option value="year">Doce meses — 748 €</option>
            </select>
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            disabled={pending}
            className="w-full rounded-lg bg-ink text-paper py-2.5 font-medium disabled:opacity-60"
          >
            {pending ? "Abriendo Stripe…" : "Pagar con Stripe"}
          </button>
          <p className="text-xs text-muted">
            Tarjeta de prueba: 4242 4242 4242 4242, fecha futura, CVC 123. No es un abono Stripe
            Billing: un pago, una vez.
          </p>
        </form>
      </div>
    </main>
  );
}

export default function PayPage() {
  return (
    <Suspense>
      <PayForm />
    </Suspense>
  );
}
