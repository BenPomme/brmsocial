"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { quoteFor } from "@/lib/catalog";

const DEMO = {
  name: "Cala Sant Cugat",
  legalName: "Cala Sant Cugat S.L.",
  taxId: "B64959740",
  email: "bpommeraud@babyrock.ai",
  billingLine1: "Carrer de la Plaça 1",
  billingPostcode: "08172",
  billingCity: "Sant Cugat del Vallès",
  billingCountry: "ES",
};

function PayForm() {
  const params = useSearchParams();
  const [plan, setPlan] = useState(
    params.get("plan") === "year" ? "year" : params.get("plan") === "trial_santcugat" ? "trial_santcugat" : "month",
  );
  const [name, setName] = useState(params.get("name") ?? "");
  const [legalName, setLegalName] = useState(params.get("legalName") ?? "");
  const [taxId, setTaxId] = useState(params.get("taxId") ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [billingLine1, setBillingLine1] = useState(params.get("line1") ?? "");
  const [billingPostcode, setBillingPostcode] = useState(params.get("cp") ?? "");
  const [billingCity, setBillingCity] = useState(params.get("city") ?? "");
  const [billingCountry, setBillingCountry] = useState(params.get("country") ?? "ES");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canceled = params.get("canceled") === "1";
  const wa = params.get("wa") ?? "";
  const quote = quoteFor({ city: billingCity });
  const santCugat = Boolean(quote.offer);
  const trial = plan === "trial_santcugat";

  function fillDemo() {
    setName(DEMO.name);
    setLegalName(DEMO.legalName);
    setTaxId(DEMO.taxId);
    setEmail(DEMO.email);
    setBillingLine1(DEMO.billingLine1);
    setBillingPostcode(DEMO.billingPostcode);
    setBillingCity(DEMO.billingCity);
    setBillingCountry(DEMO.billingCountry);
    setPlan("trial_santcugat");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const payload = {
      plan,
      name,
      legalName,
      taxId,
      email,
      billingEmail: email,
      billingLine1,
      billingPostcode,
      billingCity,
      billingCountry,
      city: billingCity,
      whatsapp: wa || undefined,
    };
    if (trial) {
      const res = await fetch("/api/pay/trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { clientId?: string; error?: string };
      if (!res.ok || !data.clientId) {
        setPending(false);
        setError(data.error ?? "No se ha podido abrir el mes gratis");
        return;
      }
      window.location.href = `/pay/essai?client=${data.clientId}`;
      return;
    }
    const res = await fetch("/api/pay/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
      <div className="w-full max-w-lg">
        <p className="font-display text-4xl mb-2">BabyRock Social</p>
        <p className="text-muted mb-4">
          Respuestas a reseñas de Google. Precios <strong>IVA incluido</strong>. Mes:{" "}
          <strong>{quote.monthLabel}</strong>. Año: <strong>{quote.yearLabel}</strong>. En la factura sale la base + el IVA 21 %,
          para deducir. {quote.offerLines.es || quote.cityHintLines.es} BabyRock Direct (WhatsApp del
          comercio) no se vende aquí.
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted mb-4">Simulación · claves test</p>
        {canceled && (
          <p className="text-sm bg-sand border border-line rounded-xl px-4 py-3 mb-4">Pago cancelado. Puede reintentar.</p>
        )}
        <form onSubmit={onSubmit} className="bg-white/70 border border-line rounded-2xl p-6 shadow-card space-y-4">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-medium">Datos para la factura</p>
            <button type="button" className="text-xs underline decoration-line" onClick={fillDemo}>
              Rellenar ejemplo SL
            </button>
          </div>
          <label className="block text-sm">
            Enseña / comercio
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Razón social
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={legalName}
              onChange={(e) => setLegalName(e.target.value)}
              placeholder="Cala Sant Cugat S.L."
              required
            />
          </label>
          <label className="block text-sm">
            NIF / CIF
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="B12345678"
              required
            />
          </label>
          <label className="block text-sm">
            Correo de facturación
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            Dirección fiscal
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={billingLine1}
              onChange={(e) => setBillingLine1(e.target.value)}
              required
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block text-sm col-span-1">
              CP
              <input
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
                value={billingPostcode}
                onChange={(e) => setBillingPostcode(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm col-span-2">
              Ciudad
              <input
                className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
                value={billingCity}
                onChange={(e) => setBillingCity(e.target.value)}
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            País
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={billingCountry}
              onChange={(e) => setBillingCountry(e.target.value)}
            >
              <option value="ES">España — IVA 21 %</option>
              <option value="FR">Francia — autoliquidación si hay n° TVA</option>
            </select>
          </label>
          <label className="block text-sm">
            Plan
            <select
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              {santCugat || trial ? (
                <option value="trial_santcugat">
                  Sant Cugat — 1.er mes gratis, luego {quote.monthLabel}
                </option>
              ) : null}
              <option value="month">Mes a mes — {quote.monthLabel} IVA incl.</option>
              <option value="year">Doce meses — {quote.yearLabel} IVA incl.</option>
            </select>
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            disabled={pending}
            className="w-full rounded-lg bg-ink text-paper py-2.5 font-medium disabled:opacity-60"
          >
            {pending ? "Enviando…" : trial ? "Empezar mes gratis" : "Pagar y pedir factura"}
          </button>
          <p className="text-xs text-muted">
            Tarjeta de prueba: 4242 4242 4242 4242, fecha futura, CVC 123. Después del pago, Stripe
            genera un PDF con razón social y NIF.
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
