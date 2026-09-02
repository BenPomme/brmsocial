"use client";

import { useEffect, useState } from "react";

type Links = { pdf: string | null; hosted: string | null };

export function InvoiceLinks(props: { sessionId: string; initial: Links }) {
  const [links, setLinks] = useState<Links>(props.initial);
  const [tries, setTries] = useState(0);
  const [mail, setMail] = useState<string | null>(null);
  const [mailing, setMailing] = useState(false);
  const ready = Boolean(links.hosted || links.pdf);

  async function resend() {
    setMailing(true);
    setMail(null);
    try {
      const res = await fetch("/api/pay/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: props.sessionId }),
      });
      const data = (await res.json()) as { mailed?: { zoho?: boolean; stripe?: boolean; reason?: string }; error?: string };
      if (!res.ok) {
        setMail(data.error ?? "No se ha podido enviar");
      } else if (data.mailed?.zoho) {
        setMail("Enviado a su correo (Rosalia / allowlist).");
      } else if (data.mailed?.reason === "not_allowlisted") {
        setMail("Modo test: Stripe no manda emails. El correo no está en la allowlist Zoho.");
      } else {
        setMail("Stripe ha intentado enviar. En test a menudo no llega: use Ver factura.");
      }
    } catch (e) {
      setMail(e instanceof Error ? e.message : "error");
    } finally {
      setMailing(false);
    }
  }

  useEffect(() => {
    if (ready || tries > 15) return;
    const t = window.setTimeout(async () => {
      const res = await fetch(`/api/pay/session?session_id=${encodeURIComponent(props.sessionId)}`);
      const data = (await res.json()) as { invoice?: Links };
      if (data.invoice?.hosted || data.invoice?.pdf) {
        setLinks({ hosted: data.invoice.hosted ?? null, pdf: data.invoice.pdf ?? null });
      }
      setTries((n) => n + 1);
    }, 1500);
    return () => window.clearTimeout(t);
  }, [props.sessionId, ready, tries]);

  if (ready) {
    return (
      <div className="flex flex-col gap-2 mb-5">
        {links.hosted ? (
          <a
            href={links.hosted}
            target="_blank"
            rel="noreferrer"
            className="block text-center rounded-lg bg-ink text-paper py-2.5 text-sm font-medium"
          >
            Ver factura
          </a>
        ) : null}
        {links.pdf ? (
          <a
            href={links.pdf}
            target="_blank"
            rel="noreferrer"
            className="block text-center rounded-lg border border-line py-2.5 text-sm"
          >
            Descargar PDF
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => void resend()}
          disabled={mailing}
          className="block w-full text-center rounded-lg border border-line py-2.5 text-sm disabled:opacity-60"
        >
          {mailing ? "Enviando…" : "Reenviar factura por correo"}
        </button>
        {mail ? <p className="text-xs text-muted">{mail}</p> : (
          <p className="text-xs text-muted">
            Stripe no envía correos en modo test. En live sí, si «Successful payments» está activo en el
            Dashboard. Aquí Rosalia puede reenviar a la allowlist.
          </p>
        )}
      </div>
    );
  }

  return (
    <p className="text-sm text-muted mb-5">
      {tries > 15
        ? "La factura no ha aparecido todavía. Mire el correo de facturación o recargue esta página."
        : "Generando factura… unos segundos."}
    </p>
  );
}
