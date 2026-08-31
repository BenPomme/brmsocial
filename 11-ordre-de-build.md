# Ordre de build

Outil : **Grok Build desktop / CLI** sur le repo. Pas Grok Bot pour écrire l’app.

## Semaine 1 — dossier mort sans Google

- Schema Postgres (`05-donnees.md`) y compris `users`, `scope_*`
- Seed : 1 admin, 1 opérateur, 2 villes dont 1 inactive, 2 catégories, 3 clients, 10 avis (5★ et 2★)
- Auth par rôle. `/admin` interdit à l’opérateur
- UI opérateur : file + checklist + Publier / Éditer
- UI admin minimale : liste villes/catégories on-off (pas encore le chat Scope)
- Publier **factice** : `avis=publie` + `reponses` + `actions`. Pas Google, pas WhatsApp

Critère : l’opérateur publie un 5★ en base. L’admin coupe une ville. L’opérateur n’accède pas à `/admin`.

## Semaine 2 — vrais brouillons

- Worker `draft` → xAI Fast
- Split modèle si stars≤3
- Prompt + `tone_notes`
- Log tokens / coût

Critère : 20 avis réels collés à la main dans la base sortent des brouillons utilisables ES/FR/CA.

## Semaine 3 — Google

- Compte gestionnaire babyrock.ai
- Invitation sur 2–3 fiches test (restos amis)
- Worker Playwright isolé
- `fiche_morte` + retry

Critère : Publier depuis l’UI apparaît sur Maps. Deux clients, zéro mélange de session.

## Semaine 4 — WhatsApp canal A

- BSP + numéro
- Pings 1–3★, topo si activité, lundi
- Webhook inbound OK / texte libre

Critère : un 2★ fictif envoie le ping ; OK publie ; silence 24 h ne publie pas.

## Semaine 5 — paiement + onboarding + chat Scope

- Stripe ou Bizum
- Parcours payé → consigne invitation → import 20 avis
- Admin : chat agent `scope` → diff proposé → Appliquer / Refuser (`13-interfaces.md`)

Critère : un paiement test ouvre la file. Un message admin « active telle ville » écrit un `scope_changes` proposed puis applied.

## Semaine 6 — démarchage v0

- CSV 50 fiches dans les villes `scope_cities.active`
- Mail + PDF
- `email_wa` : 1 WA si template accepté

Critère : 50 envois, mesure réponses. Pas de scale.

## Semaine 7–8 — ops

- Compte opérateur PH
- Journal 10 % sample
- Pause impayé J+7
- Résiliation retire les jobs

Critère : 10 fiches test ou amies sans toi dans Slack/WhatsApp prod.

## Interdit tant que la semaine N n’est pas verte

N+1. Surtout pas Instinct, pas Elephant, pas le produit 119 €, pas Heavy.
