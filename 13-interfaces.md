# Trois interfaces

Une app, trois rôles. Pas le même écran.

## Rôles

| Rôle | Qui | Surface |
|---|---|---|
| `operator` | PH | File d’avis uniquement |
| `admin` | Benjamin | Console + chat scope |
| `client` | resto | WhatsApp (page web plus tard, lecture seule + OK) |

`/admin` en `operator` → 403.
L’opérateur ne voit pas les leads, les villes ouvertes, les factures, le chat scope.
Le client ne voit pas l’usine.

## 1. Opérateur

Voir `04-ops-operateur.md`.
File filtrée : uniquement les `client_id` assignés (ou tous les clients `actif` tant qu’il n’y a qu’un VA).
Pas de sélecteur de ville. Pas de « ajouter Barcelone ».

## 2. Client

Canal v1 : WhatsApp Babyrock.
Pas de compte web obligatoire.
Plus tard : lien magique `babyrock.ai/c/{token}` = liste avis + OK / texte sur 1★–3★. Pas d’admin.

## 3. Super-admin

Écrans :

- **Scope** : villes on/off, catégories on/off, pays. C’est la source que Scout lit. Rien n’est en dur dans le code (« restaurant » / « Barcelona » = seed démo seulement).
- **Chat scope** : tu écris en français à un **agent Scope**. Il propose un diff (`Valencia on`, `category=florist on`, `Girona off`). Rien ne part en Scout tant que tu n’as pas cliqué **Appliquer**. L’agent ne prospecte pas, ne maille pas, ne publie pas.
- **Clients** : statut, plan, fiche Google, opérateur assigné.
- **CRM (backlog)** : une fiche par prospect/client + historique **par canal** (mail / WhatsApp séparés). Voir `05-donnees.md`.
- **File globale** : backlog, `fiche_morte`, coût xAI jour.
- **Leads / campagnes** : ce que Scout a sorti dans le scope actuel.
- **Ops** : comptes opérateurs, charge.
- **Billing** : impayés, pause J+7.

## Agent Scope (admin seulement)

Entrée : message admin (« ouvre Valence, restos et fleuristes, pas les hôtels »).
Sortie : lignes `scope_cities` / `scope_categories` en statut `proposed`.
Humain admin : Appliquer ou Refuser.
Journal : qui a dit quoi, quel diff, appliqué à quelle heure.

Modèle : Fast suffit. Si le message est ambigu (« le sud ») → l’agent demande une liste, il n’invente pas 40 villes.

## Données scope

`scope_cities` : id, name, country, active, source (`seed`|`admin`|`scope_agent`)
`scope_categories` : id, slug, label, active
`scope_changes` : id, actor (`admin`|`scope_agent`), raw_message, diff jsonb, status (`proposed`|`applied`|`rejected`)

Scout : `WHERE city.active AND category.active` uniquement.
