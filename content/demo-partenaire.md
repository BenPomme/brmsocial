# Script démo partenaire — 20 min (vendredi 4 sept. 2026)

Écran partagé. Compte **admin** : `admin@babyrock.local` / `proto-admin`.  
Opérateur : `ops@babyrock.local` / `proto-ops`.  
Client : `client@babyrock.local` / `proto-client`.  
App : `http://localhost:3001`. Site : `https://www.babyrock.ai`.

**Ne pas montrer :** 555 dans un mail resto, KYC Stripe live, Billing 0,7 %, publier sur une fiche Maps qui n’est pas à nous, `.env`.

## 0. Si ça casse (30 s)

- Next mort → `npm run dev -- -p 3001`
- Postgres mort → `docker compose up -d`
- WhatsApp silencieux → Inbox → Simuler un WhatsApp (pas Meta)
- `/pay` cassé → skip : « encaissement test, autre agent ; on montre la file avis »

## 1. Offre (2 min)

Ouvrir www.babyrock.ai (ES). 89 €/mois. Bouton WhatsApp du header = encore **mail** tant que pas de numéro ES (pas le 555).

## 2. Prospect → Rosalia (4 min)

Téléphone (toi ou partenaire, allowlist) → fil **Test Number**.  
Dire : « Hola, tengo un bar, ¿cómo funciona? » puis « vale, pago ».  
On doit voir : réponse dans **WhatsApp** (pas un mail), puis **lien `/pay`**.  
Admin → Inbox : le même fil.

## 3. Payer (3 min) — seulement si Stripe test répond

Ouvrir le lien `/pay`. Carte `4242`.  
Si factura NIF pas prête : le dire, ne pas improvisar Verifactu.

## 4. Usine : on trouve qui ne répond pas (4 min)

Admin → Scope : Sant Cugat + restaurant on.  
Scout (Places réel).  
Inspect si DataForSEO est dans `.env` : orphelins / &lt;15 %.  
Lots : un mail Rosalia **composé** à l’écran. **Pas d’envoi resto.**

## 5. Produit : on répond aux avis (5 min)

Opérateur → File avis. Un **5★** → Publier (dry-run, log « pas Google »).  
Client → ping **2★** → OK → avis `pret`. Toujours pas Google live.

## 6. Close (1 min)

« Semaine prochaine : fiche à nous en live + numéro ES sur le site. Pas de spam resto. »
