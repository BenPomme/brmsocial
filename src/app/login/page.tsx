"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const HINTS = [
  { role: "Admin", email: "admin@babyrock.local", password: "proto-admin" },
  { role: "Opérateur", email: "ops@babyrock.local", password: "proto-ops" },
  { role: "Client", email: "client@babyrock.local", password: "proto-client" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("admin@babyrock.local");
  const [password, setPassword] = useState("proto-admin");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error ?? "échec");
      return;
    }
    const next = params.get("next");
    router.push(next || data.home || "/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <p className="font-display text-4xl mb-2">Babyrock</p>
        <p className="text-muted mb-8">
          Proto local. Trois rôles, données Google Places, rien n’est envoyé à un commerce.
        </p>
        <form onSubmit={onSubmit} className="bg-white/70 border border-line rounded-2xl p-6 shadow-card space-y-4">
          <label className="block text-sm">
            Email
            <input
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </label>
          <label className="block text-sm">
            Mot de passe
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button
            disabled={pending}
            className="w-full rounded-lg bg-ink text-paper py-2.5 font-medium disabled:opacity-60"
          >
            {pending ? "Connexion…" : "Entrer"}
          </button>
        </form>
        <ul className="mt-6 space-y-2 text-sm text-muted">
          {HINTS.map((h) => (
            <li key={h.email}>
              <button
                type="button"
                className="underline decoration-line underline-offset-4"
                onClick={() => {
                  setEmail(h.email);
                  setPassword(h.password);
                }}
              >
                {h.role}
              </button>
              <span>
                {" "}
                — {h.email} / {h.password}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
