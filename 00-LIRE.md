# Babyrock — dossier de construction

Produit : **Babyrock Social**. Abo mensuel réponses aux avis Google (WhatsApp resto en v2).
Villes et types de commerces : réglages admin, pas du code. Seed démo seulement.
Produit v2 : WhatsApp (FAQ + créneaux Calendar), après que v1 tourne.

Fondateur : Benjamin Pommeraud. Temps fondateur = monter l’usine, pas la faire tourner.
Opérateurs payés : Philippines uniquement.
Domaine : babyrock.ai (boîtes mail + comptes Google gestionnaire).

**Deux dépôts, ne pas les mélanger.** Le site public marketing est [github.com/BenPomme/brmsocial](https://github.com/BenPomme/brmsocial) (un autre agent). Ce dossier / proto local = l’usine (admin, opérateur, inbox, agents, APIs). Pas de landing `babyrock.ai`, pas de pages marketing ici. Le webhook WhatsApp pourra pointer vers l’hôte public plus tard ; on ne recopie pas le site dans ce repo.

## Fichiers

| Fichier | Contenu |
|---|---|
| `00-LIRE.md` | Index, outil de code, ce que la prochaine session doit faire |
| `01-produit.md` | Offre, prix, ce qu’on ne vend pas |
| `02-marche-legal.md` | Cible villes, LSSI, RGPD |
| `03-parcours-client.md` | Du premier mail au jour normal, qui fait quoi |
| `04-ops-operateur.md` | Écran VA, checklist, rôles |
| `05-donnees.md` | Schéma Postgres, ce qu’on ne stocke pas |
| `06-architecture.md` | Processus, files, navigateurs isolés |
| `07-modeles-couts.md` | Quel modèle pour quelle tâche, plafonds |
| `08-demarchage.md` | Scout / mail / un WhatsApp |
| `09-publication-google.md` | Invitation gestionnaire, bouton Publier |
| `10-whatsapp-service.md` | Canal client + produit B plus tard |
| `11-ordre-de-build.md` | Semaines 1–8, critères de passage |
| `12-decisions-ouvertes.md` | Points à figer avant de coder plus loin |
| `13-interfaces.md` | Opérateur / admin / client + agent Scope |
| `14-agents.md` | Liste d’agents v1, figée |

## Comment reprendre ce dossier

Une autre session Grok (ou un humain) lit `00` puis `11`, ensuite le fichier de la brique qu’elle code.
Ne pas ré-ouvrir le débat produit. Les décisions déjà prises sont dans `12` (section « figées »).
Ne pas mettre de mots de passe Google dans l’app.
Ne pas publier un avis 1★–3★ sans OK du titulaire.
Ne pas utiliser une VM partagée pour les sessions Google des clients.
Ne pas ajouter d’agent hors `14-agents.md`.
Scope villes/catégories : console admin + agent Scope, jamais hardcodé.

## Où coder : Grok Build vs Grok Bot

**Coder le produit : Grok Build (desktop / CLI), pas Grok Bot.**

Grok Build est fait pour écrire et modifier des fichiers, lancer des tests, sortir du code. Tu restes maître du repo local. Un abo SuperGrok (~30 $/mois) + clé API xAI suffit pour générer et itérer. Pas besoin de SuperGrok Heavy (300 $) pour ça.

Grok Bot est un collègue sur **un** ordinateur cloud partagé : navigateur, terminal, routines. Tous tes bots voient les mêmes sessions. Inclus dans Cursor Pro+ (~60 $), SuperGrok Plus (~100 $), Ultra (~200 $), Heavy (~300 $). Usage hebdo inclus, ensuite facturé au token. Utile pour *essayer* Scout (ouvrir Maps, prendre des captures) à la main. Inutile et dangereux comme runtime de publication : 80 fiches Google sur une seule machine = mélange de cookies.

Donc :

- Repo + app + Postgres + UI opérateur + Playwright : **Grok Build** (ou Cursor / Claude Code si tu préfères, même principe).
- Expérience ponctuelle démarchage : un Bot, un realm, **zéro** login client.
- Prod publication : workers + profils Playwright isolés, pas le Bot.

Abonnement recommandé au départ : SuperGrok 30 $ **ou** clé API seule + Grok Build. Ajouter Cursor Pro+ seulement si tu veux le Bot pour Scout. Ne pas prendre Heavy avant d’avoir mesuré que le forfait hebdo sature.

## Repo cible

Nom proposé : `babyrock` sous `BenPomme` (ou org dédiée).
Langue de code : TypeScript (API + UI) + un worker Python ou TS pour Playwright.
Base : Postgres.
File : Postgres `jobs` ou Redis. Postgres seul au début.

## Première commande pour la session suivante

« Lis `/babyrock-spec/00-LIRE.md` et `11-ordre-de-build.md`. Implémente la semaine 1 : schéma Postgres + API brouillon d’avis + écran Publier/Éditer factice (pas encore Google). »
