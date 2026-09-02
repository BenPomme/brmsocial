# WhatsApp — P0

Un seul numéro Business, affichage **Babyrock Social**. Pas le WhatsApp perso de Benjamin.

Deux usages, deux files dans le code. Ne pas les mélanger.

## A. Client déjà signé

Pings 1–3★ + brouillon, topo, invitation Google, fiche morte. Heures 11–18 Europe du resto.

## B. Démarchage — ils nous écrivent

Le premier mail Rosalia propose **trois** façons de répondre :

1. `OK` (ou un texte) en réponse au mail
2. Nous envoyer **leur** numéro
3. **Nous écrire sur notre WhatsApp** (`BABYROCK_WHATSAPP_DISPLAY`)

On ne cold-call pas le téléphone Maps. Un `wa.me` sur **leur** site reste utile, mais n’est plus obligatoire s’ils tapent notre numéro.

Le produit 119 € (FAQ mangeurs) reste plus tard.

## Technique

- Cloud API Meta. Webhook `POST/GET /api/webhooks/whatsapp`
- Inbound → `inbox_threads` / `inbox_messages` (même Inbox admin que Zoho)
- Outbound WhatsApp refusé tant que pas de token Meta + règle outbound

Jusqu’à ce que Meta soit live : admin Inbox → **Simuler un WhatsApp**.

## Marche à suivre Meta (toi)

1. Ouvre [Meta Business Suite](https://business.facebook.com/) et crée (ou réutilise) un **Business Manager** au nom Babyrock Social.
2. [developers.facebook.com](https://developers.facebook.com/) → **Créer une appli** → type **Business**.
3. Dans l’app : ajouter le produit **WhatsApp**.
4. WhatsApp → **Configuration de l’API**. Note :
   - Phone number ID
   - WhatsApp Business Account ID
5. Ajoute un **numéro** : SIM neuve, ou numéro acheté dans Meta. Évite ton perso.
6. Vérifie l’entreprise si Meta le demande (ça peut prendre des jours). Le test peut commencer avec le numéro de test Meta (5 destinataires max).
7. Token : d’abord le temporaire, puis un **System User** + token permanent (Business settings → Users → System users).
8. Webhooks : URL publique `https://TON_DOMAINE/api/webhooks/whatsapp`. En local, un tunnel (ngrok / Cloudflare) vers `http://localhost:3001/api/webhooks/whatsapp`.
   - Verify token = la même valeur que `WHATSAPP_VERIFY_TOKEN` dans `.env`
   - Champ : `messages`
9. Dans `.env` :

```
WHATSAPP_VERIFY_TOKEN=...
WHATSAPP_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
BABYROCK_WHATSAPP_E164=+34...
BABYROCK_WHATSAPP_DISPLAY=+34 6xx xxx xxx
```

10. Relance l’app. Le mail Rosalia affichera le numéro. Un message test vers ce numéro doit apparaître dans **Admin → Inbox**.

Sans URL publique, le webhook Meta ne peut pas appeler localhost. La simu Inbox suffit pour voir le flux avant ça.

## État 1er sept. 2026

Fait :

- Appli Meta **Babyrock Social** (App ID `1032575959608719`), Business ID `1048266287813014`.
- Use case : **Connect with customers through WhatsApp** seulement (pas Become a Partner).
- Numéro **test Meta** `+1 555 653 1464` (Phone number ID `1208872582320300`, WABA `1761169211880501`). Pas le numéro client. Ne pas le mettre dans les mails resto.
- `hello_world` reçu sur le téléphone perso de Benjamin (allowlist test, 5 destinataires max).
- Route proto `GET/POST /api/webhooks/whatsapp` → `inbox_threads` / `inbox_messages`.
- WABA abonnée à l’appli Babyrock Social (`POST .../subscribed_apps` = success).
- Token Graph = **System User**, sans expiration (1er sept. 2026). Pas le jeton temporaire du dashboard.

**Inbound réel OK (1er sept. 2026 ~16 h Madrid).** Un texto du perso de Benjamin vers le 555 de test est arrivé dans Admin → Inbox (`inbox_threads` / `inbox_messages`, `wamid.…`). Le bouton Test dashboard n’est pas un vrai WhatsApp.

Le toggle UI `messages` = Unsubscribe peut mentir. Source de vérité : `GET /{WABA-ID}?fields=health_status` → entity APP. Tant que `additional_info` contient « not subscribed to the message webhook », les vrais messages ne partent pas. Après correction, ce champ est vide.

Reste :

- Ne pas mettre le 555 dans les mails resto **ni sur le site public**.
- WABA production toujours bloqué `#2593030`. Rester sur le numéro test en interne.
- `WHATSAPP_APP_SECRET` encore vide : pas de signature `X-Hub-Signature-256`. Avant expo publique.
- Tunnel Cloudflare local : meurt avec la session. En prod, URL fixe sur **brmsocialbackend**.
- **Site** (`brmsocial`) : bouton WhatsApp actif `wa.me` vers le numéro de prod, pas le 555. Branche le clic vers le même WABA que l’usine.

## Réponses Rosalia (démarchage)

Règle coût (`07-modeles-couts.md`) : pas de LLM si un script suffit.

| Message du prospect | Réponse | Modèle |
|---|---|---|
| OK / vale / sí | Script : prochaines étapes (gestionnaire + 89 €) | aucun |
| STOP / baja | Script : on arrête | aucun |
| Un numéro | Script : on continue ici | aucun |
| FAQ (prix, gestionnaire, paiement) | Brouillon court, vous | Grok cheap (`XAI_FAST_MODEL`, cap tokens) |
| Hors script | « Je passe à un collègue » | humain |

Admin → Inbox : brouillon éditable, **Régénérer**, **Envoyer WhatsApp**. Envoi Cloud API seulement si le numéro est dans `WHATSAPP_ALLOWLIST` (même idée que Zoho). `OUTBOUND_ENABLED` reste false pour les workers.

## Apprendre sur les conversations (plan)

Aujourd’hui on **stocke** les messages (`inbox_messages`) mais on **n’apprend pas**. Les scripts sont des regex ES en dur. Langue mal gérée.

Constat 1er sept. 2026 (fil WhatsApp de Benjamin) : le LLM recopiait le bloc « cómo funciona » à chaque tour et **n’envoyait jamais** `/pay`, même après « Vale pago » / « Pago » / « Do it ». Règle maintenant : scripts d’abord ; intention de payer → lien tout de suite ; un script déjà envoyé n’est pas recollé. Hors script **mais produit** → Grok cheap (`XAI_FAST_MODEL`), JSON `on_product`, sans recopier le message précédent. Hors produit (legal, emploi, instagram…) → humain. `ROSALIA_LLM=false` coupe le LLM.

Pas de nouvel agent. C’est `inbox_sync` qui écrit la trace, `head_of_data` qui propose des recos. Toi tu valides. Mémoire = Postgres, pas Elephant.

### Ce qu’on mesure (un événement par tour)

Table `rosalia_turns` (une ligne par message **in** + la réponse **out** associée) :

| Champ | Pourquoi |
|---|---|
| `thread_id`, `channel` | fil WhatsApp / mail |
| `lang` | langue **détectée** du prospect (es/ca/fr/en), pas celle du script |
| `intent` | `ok` / `stop` / `phone` / `hello` / `price` / `pay` / `manager` / `how` / `llm` / `off_script` / … |
| `script_id` | quel texte on a envoyé (`pay.es`, `ok.ca`, …) ou `llm` / `human` |
| `source` | `template` / `llm` / `human` |
| `ms_to_reply` | latence jusqu’à l’envoi |
| `outcome` | `replied` / `asked_again` / `sent_pay_link` / `stopped` / `paid` / `ghost` |

Le corps du message reste dans `inbox_messages`. Pas de PII extra.

### Scripts = données, pas du code

Table `rosalia_scripts` : `id`, `intent`, `lang`, `body`, `active`, `priority`.

Matching : d’abord intent (règles, **zéro token**), puis script **dans la langue du prospect**. Si pas de script dans cette langue → fallback ES **et** on log `lang_miss`. LLM cheap **sans raisonnement** seulement si aucun intent. Hors script → humain.

### Écran admin « Scripts Rosalia »

- Liste des intents, **occurrences** (7 j / 30 j), % du trafic, % qui ont abouti à `sent_pay_link` / `paid`.
- Temps médian jusqu’au lien de paiement (ton grief actuel).
- Taux `lang_miss` (ton autre grief).
- Exemples de tours (anonymisés : 40 premiers caractères).
- Bouton : éditer le texte, dupliquer en CA/FR, désactiver. Head of Data peut proposer un diff ; toi tu Appliques.

### Ordre de build (après la démo vendredi, ou jeudi soir si le script démo tient)

1. **Trace** : écrire `rosalia_turns` à chaque envoi auto / manuel. Détecteur de langue local (déjà `language.ts`).
2. **Pay plus tôt** : si intent `ok` ou `pay` → coller l’URL `/pay` **dans le même message**, pas « je l’envoie plus tard ».
3. **Packs de langue** : mêmes intents en es / ca / fr / en. Répondre dans `lang` détectée.
4. **Tableau d’occurrence** dans Admin (pas de LLM pour classer : c’est du SQL `GROUP BY script_id`).
5. **Head of Data** : une reco par semaine max (« le script `how.es` est trop long, 40 % redemandent le prix »). Jamais d’écriture auto dans les scripts.

Interdit : fine-tuner un modèle sur les conversations ; appeler grok-4.3/4.6 pour « apprendre » ; envoyer un resto hors allowlist.

OpenAPI Meta (`facebook/openapi` → `business-messaging-api_v23.0.yaml`) : `POST /{WABA-ID}/subscribed_apps`, `webhook_configuration.override_callback_uri`, payload `WebhookPayload`. Ça confirme le câblage, ça n’ajoute pas de troisième abonnement.
