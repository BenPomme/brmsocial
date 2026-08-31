# Données

Postgres. Tout est rattaché à `client_id`.
UUID en PK. Timestamps `timestamptz`.

## clients

- id, name, city, country (`ES`|`FR`)
- google_location_id, google_account_email_manager
- manager_invite_status (`pending`|`accepted`|`revoked`|`dead`)
- email_public, whatsapp_site (nullable), whatsapp_owner
- plan (`avis_89`|`avis_wa_119`), status (`lead`|`paye`|`actif`|`pause`|`resilie`)
- stripe_or_bizum_ref
- category_id (FK scope_categories)
- operator_id nullable
- tone_notes (texte libre du titulaire : tutoiement, etc.)
- created_at

## users

- id, email, role (`operator`|`admin`), password_hash, active

## scope_cities

- id, name, country, active, source (`seed`|`admin`|`scope_agent`)

## scope_categories

- id, slug, label, active

## scope_changes

- id, actor (`admin`|`scope_agent`), raw_message, diff jsonb
- status (`proposed`|`applied`|`rejected`), created_at

## avis

- id, client_id
- google_review_id (unique)
- stars (1–5), lang, author_public_name
- body, reviewed_at
- status (`nouveau`|`brouillon`|`attente_client`|`pret`|`publie`|`bloque`)

## reponses

- id, avis_id, version (int)
- draft_model, draft_text
- operator_text (après édition)
- sent_to_owner_text
- published_text
- actor (`agent`|`operator`|`owner`|`lead`)
- created_at

## actions

- id, client_id, avis_id nullable
- type (`draft`|`edit`|`ping_wa`|`owner_ok`|`publish`|`publish_fail`|`block`|`invite_ok`|`fiche_morte`|`billing`)
- actor, payload jsonb, result (`ok`|`fail`), error_text
- created_at

## messages_whatsapp

- id, client_id, avis_id nullable
- direction (`in`|`out`), body, provider_msg_id
- created_at

## jobs

- id, kind (`draft`|`publish`|`wa_out`|`outreach_mail`|`scout`)
- payload jsonb, status (`queued`|`run`|`done`|`fail`)
- attempts, run_after, locked_at

## leads (démarchage)

- id, place_id, name, city
- email, wa_site, maps_phone
- channel_plan (`email`|`email_wa`|`wa_only`|`skip`)
- status (`new`|`sent`|`replied`|`paid`|`dead`)
- last_touch_at

## Interdit en base

Mots de passe Google du titulaire.
Codes 2FA.
Dump de cookies du titulaire.
Numéros Maps utilisés comme WhatsApp s’ils ne sont pas sur le site.

Sessions Playwright : fichiers hors Postgres, disque chiffré, un répertoire `/sessions/{client_id}/`. Rotation. Pas dans les backups applicatifs texte.

## Preuve

Pour un client X on doit pouvoir sortir : tous les avis, toutes les versions, qui a validé, texte en ligne, tous les WhatsApp.
C’est la défense si « vous avez publié ça tout seuls ».
