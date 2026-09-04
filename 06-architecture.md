# Architecture

## Morceaux

1. API HTTP (TypeScript, Fastify ou équivalent) — auth opérateur + webhooks Stripe / WhatsApp / Google
2. UI opérateur (page unique file d’avis)
3. Worker jobs
4. Worker publish : Playwright, **un contexte / client_id**
5. Appels xAI (OpenAI-compatible `https://api.x.ai/v1`)
6. Postgres
7. Option plus tard : process Meerkat **uniquement** pour Scout, realm séparé, aucun login client

## Navigateur isolé

Définition : un profil Playwright (userDataDir) par `client_id`. Cookies A invisibles pour B.
Le VA ne pilote pas Chrome sur son PC.
`POST /avis/:id/publish` → job `publish` → worker ouvre le profil du client → trouve l’avis par `google_review_id` → écrit `published_text` → confirme le DOM → `actions` + statut `publie`.

Si Google offre l’écriture d’avis via API pour le rôle gestionnaire, préférer l’API. Playwright = plan A v1 parce que l’API avis entreprise est souvent incomplète / gated.

Jamais : Grok Bot / Meerkat computer partagé pour ces profils.

## Auth Google

Un (ou quelques) comptes `reviews+vagueN@babyrock.ai`.
Le resto invite ce compte en Gestionnaire.
Le worker se connecte à **ce** compte, pas au Gmail du resto.
2FA du compte Babyrock : secret chez le fondateur / gestionnaire infra, pas dans l’écran VA. Si challenge : job `fiche_morte` + WhatsApp client.

## Files

- `draft` : texte avis → xAI Fast (ou 4.3 si stars≤3) → `reponses` + statut
- `publish` : Playwright
- `wa_out` : BSP WhatsApp
- `outreach_mail` : envoi SMTP babyrock.ai
- `scout` : plus tard
- `fiche_watch` : snapshot fiche (Places ; GBP Insights plus tard). Diff → ping. Pas d’écriture d’heures par l’opérateur.

Idempotence : un `google_review_id` n’est drafté qu’une fois sauf `re-draft` explicite.

## Meerkat / Mobkit / Elephant

Meerkat : harness Rust, OpenAI-compatible, budgets, mobs. Utile pour orchestrer Scout si on en a besoin. Défauts du catalogue = modèles frontier → **forcer Fast**.
Mobkit : console de mob. Pas pour v1 avis.
Elephant : **pas un repo public**. Mémoire profonde prévue, non branchée. Config `backend=elephant` = JSON local déprécié. Ne pas attendre Elephant pour la mémoire client.

## Observabilité

Chaque job : durée, tokens in/out, modèle, coût estimé, succès publish.
Dashboard interne minimal : file size, fail rate Google, coût xAI jour.

## Hébergement

Un petit VPS EU (RGPD) au début. Postgres managé EU.
Playwright sur la même machine tant que < 80 profils. Ensuite workers dédiés.
