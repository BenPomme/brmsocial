# Démarchage

## Entrée Scout

Source : Google Maps / Places, uniquement `scope_cities.active` × `scope_categories.active`.
Garder : fiche dans le scope, avec avis, au moins un avis sans réponse, contact entreprise (email et/ou WA site).
Jeter : hors scope, chaînes si règle admin un jour, fiches sans contact entreprise.

Contacts :

| Trouvé | `channel_plan` |
|---|---|
| email entreprise + WA sur le site | `email_wa` |
| email seulement | `email` |
| WA site seulement | `wa_only` |
| téléphone Maps seulement | `skip` |

## Filtre (ville × catégorie)

1. Tous les commerces de la catégorie (Places, pages suivantes).
2. Garder `userRatingCount > 50`.
3. Lire les **50 avis les plus récents**. Pitch si taux de réponse **< 15 %**.
4. Dans le mail : un extrait, pas le décompte exact.

## Template premier mail

Fichier : `content/outreach/rosalia.es.txt`  
De : Rosalia `<rosalia@babyrock.ai>`  
Sujet : `Las reseñas de Google de {{restaurant}}`  
Champs : `{{restaurant}}` `{{author}}` `{{date}}` `{{stars}}` `{{excerpt}}`  
Pas de PDF en pièce jointe. Contact = email / WA **du site**, jamais le téléphone Maps.

## Envoi : Zoho Mail API (EU)

Boîte : **Zoho Mail**, datacenter **EU** (`mail.zoho.eu`, OAuth `accounts.zoho.eu`).
Pas SMTP/IMAP. REST : `POST /api/accounts/{accountId}/messages`.

Code : `src/lib/zoho-mail.ts`. Test : `npx tsx scripts/zoho-test-send.ts`.

Le token OAuth est **par utilisateur**. Self Client + refresh token de **`rosalia@babyrock.ai`**, pas du super-admin. Sur l’org Babyrock, `acquisitions@` est le nom interne de la boîte Benjamin ; `bpommeraud@` est un alias. `rosalia@` est un **utilisateur** à part.

Allowlist : `OUTREACH_ALLOWLIST` (aujourd’hui `bpommeraud@babyrock.ai`). Toute adresse hors liste est refusée. Rien vers un resto tant que ça n’est pas élargi **et** validé à la main.

**Preuve (2026-08-31).** From `rosalia@babyrock.ai` → To `bpommeraud@babyrock.ai`, sujet `Test Babyrock — responde OK`. Reçu. `OUTBOUND_ENABLED` reste `false` pour SMTP / WA / SMS.

Lecture des réponses : **Admin → Inbox**. Bouton « Récupérer les mails Zoho ». Les prospects peuvent aussi **nous écrire sur notre WhatsApp** (numéro Babyrock, pas Maps). Tant que Meta n’est pas live : simuler un WhatsApp dans Inbox.

Scope OAuth Rosalia : `ZohoMail.messages.ALL,ZohoMail.accounts.READ,ZohoMail.folders.READ` (folders.READ pour lister Inbox).

Lots : **Admin → Lots** — valider / invalider / demander un changement. Envoi réel seulement allowlist.

## Sorties

Inspector : échantillon d’avis non répondus.
Press : une page PDF en lien, plus tard, pas au 1er mail.
Carrier : compose le mail. Envoi Zoho seulement si l’adresse est sur l’allowlist.

- 3 mails max par prospect
- `email_wa` : **un** WhatsApp le même jour, plus tard
- pas de 2e WA sans réponse

Volume bas par boîte. Si bounce / spam signal : pause la vague.

## Stack Scout

v0 : liste CSV manuelle (20 restos) pour tester le mail.
v1 : script Playwright + Places API si clé dispo.
Meerkat mob : seulement si le script simple ne suffit plus. Realm `outreach`, budget $ / job, modèle Fast. Aucune session gestionnaire dans ce realm.

## Après réponse

Tout le close sur WhatsApp Babyrock. Plus d’e-mail de suivi.
Agent gère le script. Opérateur si hors script.
