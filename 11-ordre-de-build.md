# Ordre de build

Outil : **Grok Build desktop / CLI** sur le repo.

## Site public (parallèle à l’usine)

Voir `17-seo-site-brm.md`. À faire dans `site/build.mjs` + DNS, pas dans le worker avis.

1. Canonical, hreflang, robots.txt, sitemap.xml, redirect `babyrock.ai` → `www`, redirect `/` HTTP (plus seulement JS).
2. Open Graph + JSON-LD Organization / Service / FAQ.
3. Alt + compression images + fonts.
4. Search Console sur le domaine `babyrock.ai`.
5. Fiche Google Business Profile BabyRock Social (Sant Cugat).
6. Ensuite seulement : 1–3 pages métier × ville du scope actif.

Critère 1 : `https://www.babyrock.ai/sitemap.xml` liste les 4 homepages ; GSC voit le canonical www.

## Après proto — usine

- Schema Postgres (`05-donnees.md`) y compris `users`, `scope_*`
- Seed : 1 admin, 1 opérateur, 2 villes dont 1 inactive, 2 catégories, 3 clients, 10 avis (5★ et 2★)
- Auth par rôle. `/admin` interdit à l’opérateur
- UI opérateur : file + checklist + Publier / Éditer
- UI admin minimale : liste villes/catégories on-off (pas encore le chat Scope)
- Publier **factice** : `avis=publie` + `reponses` + `actions`. Pas Google, pas WhatsApp

Critère : l’opérateur publie un 5★ en base. L’admin coupe une ville. L’opérateur n’accède pas à `/admin`.

## Brouillons

- Worker `draft` → xAI Fast
- Split modèle si stars≤3
- Prompt + `tone_notes`
- Log tokens / coût

Critère : 20 avis réels collés à la main dans la base sortent des brouillons utilisables ES/FR/CA.

## Google

- Compte gestionnaire babyrock.ai
- Invitation sur 2–3 fiches test
- Worker Playwright isolé
- `fiche_morte` + retry

Critère : Publier depuis l’UI apparaît sur Maps. Deux clients, zéro mélange de session.

## WhatsApp canal A

- BSP + numéro
- Pings 1–3★, topo si activité, lundi
- Veille fiche : bouclier (heures/nom/tel/adresse/statut), récap note+volume, avis disparus / appels / itinéraire / propositions Google **si l’API les donne**, festifs CERRADO. Jamais inventer. Pas de competitor spy, NAP, attributs, Local Post.
- Webhook inbound OK / texte libre

Critère : un 2★ fictif envoie le ping ; OK publie ; silence 24 h ne publie pas.

## Paiement + onboarding + chat Scope

- Stripe ou Bizum
- Parcours payé → consigne invitation → import 20 avis
- Admin : chat agent `scope` → diff proposé → Appliquer / Refuser (`13-interfaces.md`)

Critère : un paiement test ouvre la file. Un message admin « active telle ville » écrit un `scope_changes` proposed puis applied.

## Démarchage v0

- CSV 50 fiches dans les villes `scope_cities.active`
- Mail + PDF
- `email_wa` : 1 WA si template accepté

Critère : 50 envois, mesure réponses. Pas de scale.

## Ops

- Compte opérateur PH
- Journal 10 % sample
- Pause impayé J+7
- Résiliation retire les jobs

Critère : 10 fiches test ou amies sans toi dans Slack/WhatsApp prod.

## Interdit tant que le socle n’est pas vert

Instinct, Elephant, BabyRock Direct en production, produit 119 €, Heavy, usine à pages ville×service, CrowdReply.
