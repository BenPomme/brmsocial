# Babyrock — dossier de construction

Produit : **Babyrock Social**. Abo mensuel réponses aux avis Google (WhatsApp resto en v2).
Villes et types de commerces : réglages admin, pas du code. Seed démo seulement.
Produit v2 : WhatsApp (FAQ + créneaux Calendar), après que v1 tourne.

Fondateur : Benjamin Pommeraud. Temps fondateur = monter l’usine, pas la faire tourner.
Opérateurs payés : Philippines uniquement.
Domaine : babyrock.ai (boîtes mail + comptes Google gestionnaire).

**Deux dépôts, ne pas les mélanger — ils devront se parler.**

| Dépôt | Rôle |
|---|---|
| [BenPomme/brmsocial](https://github.com/BenPomme/brmsocial) | Site public marketing `www.babyrock.ai` (Pages). Un autre agent. |
| [BenPomme/brmsocialbackend](https://github.com/BenPomme/brmsocialbackend) | Usine : admin, opérateur, inbox, agents, APIs, webhook WhatsApp. |

Ce dossier local = l’usine. Pas de landing marketing ici. Le `git remote origin` de ce clone pointe encore vers **brmsocial** (le site) — à recabler vers **brmsocialbackend** avant tout push, sans y coller `docs/` / `site/`.

Lien entre les deux, à brancher :
- WhatsApp du site (`wa.me` vers le numéro Babyrock **de prod**, pas le 555 test) → Meta → webhook usine `/api/webhooks/whatsapp`.
- S’abonner : le site pointe vers `/pay` sur l’usine (Checkout Stripe one-off). L’usine marque `clients.status = paye`. Le site n’encaisse pas.

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
| `15-prototype.md` | Proto 3 interfaces (s’il est dans ce clone) |
| `16-plan-affaires.md` | Plan d’affaires |
| `17-seo-site-brm.md` | SEO / indexation de www.babyrock.ai |

## Aujourd’hui (1er sept. 2026)

1. WhatsApp usine — inbound réel OK, token System User, paiement Meta débloqué. **Inbox Rosalia** : brouillon script (OK/STOP/n°) sans LLM ; texte libre = Grok cheap ; envoi allowlist. Détail : `10-whatsapp-service.md`.
2. **Site public** (`brmsocial`, pas ici) : bouton WhatsApp **actif** (`wa.me` vers le numéro Babyrock de prod — **pas** le 555 test). Tant que le WABA prod est bloqué `#2593030`, ne pas coller le 555 sur www.babyrock.ai.
3. Recabler git : origin de l’usine → `brmsocialbackend` ; le site reste `brmsocial`. Les deux se parlent (bouton → webhook).
4. Feedback copy mail Rosalia (`content/outreach/rosalia.es.txt`) — encore ouvert.
5. Paiement : décision 6 figée. Clés Stripe **test** dans `.env`. Simuler : `/pay`, carte `4242`. Compte ES SL, KYC live encore ouvert. Versement = IBAN Revolut de la SL. Pas de Billing 0,7 %.

## Comment reprendre ce dossier

Une autre session Grok (ou un humain) lit `00` puis `11`, ensuite le fichier de la brique qu’elle code.
Ne pas ré-ouvrir le débat produit. Les décisions déjà prises sont dans `12` (section « figées »).
Ne pas mettre de mots de passe Google dans l’app.
Ne pas publier un avis 1★–3★ sans OK du titulaire.
Ne pas utiliser une VM partagée pour les sessions Google des clients.
Ne pas ajouter d’agent hors `14-agents.md`.
Scope villes/catégories : console admin + agent Scope, jamais hardcodé.
SEO du site public : `17-seo-site-brm.md`, dans `site/build.mjs`, pas dans les workers avis.
