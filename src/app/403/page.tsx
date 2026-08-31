import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md">
        <p className="font-display text-4xl mb-3">403</p>
        <p className="text-muted mb-6">
          Cet écran n’est pas pour ce rôle. L’opérateur n’ouvre pas l’admin. Le client ne voit pas
          l’usine.
        </p>
        <Link href="/login" className="underline">
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
