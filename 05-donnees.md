# Données

Postgres. Tout est rattaché à `client_id`.
UUID en PK. Timestamps `timestamptz`.

## clients

- id, name, city, country (`ES`|`FR`)
- google_location_id, google_account_email_manager
- manager_invite_status (`pending`|`accepted`|`revoked`|`dead`)
- email_public, whatsapp_site (nullable), whatsapp_owner
- plan (`avis_month`|`avis_year`), status (`lead`|`essai`|`paye`|`actif`|`pause`|`resilie`)
- offer (`santcugat_trial`|null), trial_ends_at, catchup_months (3 pour Sant Cugat, sinon rattrapage 20 avis)
- stripe_or_bizum_ref
- **Facturation B2B** (collectée sur `/pay`, copiée sur le Customer Stripe) :
  - `legal_name` (razón social, pas l’enseigne)
  - `tax_id` (NIF/CIF ES, ou n° TVA intra-UE)
  - `billing_email`
  - `billing_line1`, `billing_postcode`, `billing_city`, `billing_country`
  - `vat_mode` (`es_iva`|`eu_reverse`|`unknown`) — ES 21 % sur 99 TTC (81,82 HT) ; FR B2B avec n° TVA = autoliquidation
- category_id (FK scope_categories)
- operator_id nullable
- tone_notes (texte libre du titulaire : tutoiement, etc.)
- rating, rating_count (dernière lecture Places/GBP, pas un chiffre inventé)
- created_at

## fiche_snapshots

Une photo de la fiche Google, pas un graphe.

- id, client_id, taken_at, source (`places`|`gbp`)
- name, phone, address, hours_text, business_status
- rating, rating_count
- review_ids jsonb (liste complète **ou** null = on ne sait pas, donc pas d’avis disparu)
- calls, direction_requests (null = inconnu, on n’écrit pas la ligne)
- suggested_edits jsonb (null = inconnu)
- raw jsonb

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
- vanished_at (avis disparu de la fiche ; on ne le republie pas)

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
- type (`draft`|`edit`|`ping_wa`|`owner_ok`|`publish`|`publish_fail`|`block`|`invite_ok`|`fiche_morte`|`billing`|`fiche_change`|`avis_vanished`|`holiday_hours`|`suggested_edit`)
- actor, payload jsonb, result (`ok`|`fail`), error_text
- created_at

## messages_whatsapp

- id, client_id, avis_id nullable
- direction (`in`|`out`), body, provider_msg_id
- created_at

## jobs

- id, kind (`draft`|`publish`|`wa_out`|`outreach_mail`|`scout`|`fiche_watch`)
- payload jsonb, status (`queued`|`run`|`done`|`fail`)
- attempts, run_after, locked_at

## CRM (backlog — important)

Aujourd’hui : `leads` + `clients` + `inbox_threads` (un fil par `channel` × `counterparty`). Ce n’est **pas** encore un CRM.

À avoir :

- **Fiche unique** (prospect ou client) : enseigne, ville, catégorie, contacts (email site, email perso, WA), fiscal (NIF, razón social), Google (`location_id`, gestor), statut, plan, opérateur.
- **Historique des interactions par canal**, pas un seul blob : chaque événement a `channel` (`email` | `whatsapp` | `sms` | `admin`) + `direction` + `at` + `script_id` / sujet. Un WhatsApp ne devient pas un mail. Si les deux existent, deux timelines, une fiche.
- Admin : page **Fiche** = identité + les fils côte à côte (ou onglets Mail / WhatsApp). Pas seulement Inbox à plat.

Relié à `rosalia_turns` (apprentissage scripts) : la tour pointe vers la fiche + le canal.

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
