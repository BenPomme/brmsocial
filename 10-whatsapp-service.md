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
