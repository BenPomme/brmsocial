# Prototype — première livraison

Un seul objectif : Benjamin clique les trois interfaces avec de **vraies** fiches / avis Google, **sans** écrire à un commerce et **sans** publier sur une fiche qui n’est pas à nous.

Pas de découpage « semaine 1 ». Le proto sort d’un trait. Ce qui n’est pas listé ici n’est pas dans le proto.

## Ce que le proto doit permettre

**Admin.** Parler à l’agent Scope (« active Barcelone, catégorie restaurant »). Appliquer le diff. Voir une liste de commerces **réels** tirés de Google Places dans ce scope. Activer / couper une ville ou une catégorie. Voir les jobs en dry-run (rien n’est parti).

**Opérateur.** File d’avis **réels** (textes et notes Google) rattachés à ces fiches. Publier / Éditer sur 4–5★. Pas de Publier sur 1–3★. Checklist. Clic Publier = écrit en base + log « dry-run, pas envoyé à Google » sauf si la fiche est une fiche de test dont on est gestionnaire (flag `clients.publish_live=false` par défaut).

**Client.** Pas WhatsApp Meta. Un écran `client` qui imite le fil : topo du jour, ping 1–3★, champ OK / texte. Derrière : les mêmes tables `messages_whatsapp` en `direction=sim`. Aucun numéro réel n’est appelé.

## Interdit dans le proto

- SMTP vers un `info@` trouvé
- WhatsApp / SMS / RCS vers un commerce
- Publication Google sur une fiche dont on n’est pas gestionnaire
- Scraping Maps hors API (ToS + ban)
- Nouvel agent hors `14-agents.md`

## Comptes et clés à créer **avant** de lancer Build

Sans ça le proto n’a pas de données réelles. Créer dans cet ordre.

### 1. Google Cloud

1. Console Google Cloud → projet `babyrock-proto` (nom libre).
2. Facturation activée (Places est payant ; quota gratuit limité).
3. APIs à activer :
   - **Places API (New)** — recherche + détails + extraits d’avis
   - **Geocoding API** — optionnel, si on résout une ville → lat/lng
   - **Google Business Profile API** — seulement pour *tes* fiches de test
4. Compte de service ou clé API restreinte HTTP, référents = localhost + ton domaine dev.
5. Plafond budget Cloud : mets une alerte (ex. 20 €) pour ne pas te faire surprendre.

Places Details renvoie en général **cinq extraits d’avis**, pas l’historique complet. C’est suffisant pour le proto. L’API Business Profile, elle, liste les avis d’une fiche **uniquement** si le compte OAuth est owner/manager.

### 2. Compte Google Babyrock

1. Boîte `reviews@babyrock.ai` (ou Gmail provisoire si le domaine n’est pas encore branché).
2. 2FA allumé. Les codes restent chez toi, pas dans l’app opérateur.
3. Plus tard (pas bloquant pour le proto read-only) : cette boîte sera invitée gestionnaire sur 1–2 fiches à toi (un commerce réel que tu contrôles, ou une fiche test).

### 3. OAuth Business Profile (optionnel proto, obligatoire dès qu’on veut l’inbox avis complète)

1. Écran consentement OAuth, type External, test users = ton Gmail.
2. Scopes GBP : ceux documentés pour `businessprofile` / reviews (la session de code lira la doc live `developers.google.com/my-business`).
3. Client OAuth Web : redirect `http://localhost:<port>/auth/google/callback`.

Sans OAuth GBP : on nourrit la file avec les extraits Places. Avec OAuth sur **tes** fiches : avis plus complets, bouton Publier peut être branché en live **uniquement** si `publish_live=true` sur ce client.

### 4. Pas nécessaire pour le proto

- Meta / 360dialog / WhatsApp Business
- Stripe / Bizum
- Domaine d’envoi mail (AgentMail, Postmark…)
- Compte xAI : **si** tu veux des brouillons réels dans le proto. Sinon brouillon = template déterministe pour avancer sans clé.
- Grok Bot, Cursor Ultra, Heavy

### 5. xAI (recommandé dans le proto, pas bloquant)

Clé API xAI pour `draft` et `scope`.
Modèle : Fast.
Sans clé : Scope parse des commandes simples au regex ; draft = phrase type.

## Données

Seed : 1 admin, 1 opérateur, 1 user `client` démo.
Scope vide au départ sauf ce que tu tapes dans le chat admin.
Après Appliquer : `scout` dry-run appelle Places (Text Search + Details) dans la ville + type. Écrit `leads` + `clients` statut `proto` + `avis` depuis les extraits. `carrier` ne s’exécute pas.

Flag global `OUTBOUND_ENABLED=false`. Hard fail si un worker tente SMTP/WA.

## Critère « proto fini »

Tu te connectes admin → tu actives une ville et une catégorie → tu vois des commerces Maps réels.
Tu te connectes opérateur → tu vois de vrais textes d’avis → tu publies un 5★ → la ligne passe `publie` et le log dit dry-run.
Tu ouvres l’écran client → tu vois le ping d’un 2★ → tu réponds OK → l’avis passe `pret` (publication toujours dry-run).
Aucun mail / WA n’a quitté la machine. Vérifiable : table `actions` sans type d’envoi réel, et `OUTBOUND_ENABLED=false`.
