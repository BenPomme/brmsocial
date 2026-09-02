# Décisions

## Figées

- **Offre lockée (démo vendredi, ne pas rouvrir) :** 99 € TTC/mois (81,82 HT + 17,18 IVA). 799 € TTC/an. Factura HT+IVA 21 % ES. Sant Cugat del Vallès : 1er mois 0 € + rattrapage 3 mois d’avis sans réponse, puis 99 € (2e mois = lien de paiement, pas Billing). WhatsApp titulaire (1–3★, topo) = v1, inclus. V2 WhatsApp *clients du resto* = pas vendu. France B2B n° TVA = HT seul.
- Humains PH seulement pour la prod
- Trois rôles : operator / admin / client (WhatsApp)
- Scope (villes, catégories, pays) : table + chat admin (agent `scope`). Pas en dur
- Agents v1 = table dans `14-agents.md` seulement
- 4–5★ : opérateur publie. 1–3★ : OK titulaire puis publie
- Invitation gestionnaire, jamais le mot de passe resto
- Bouton Publier, pas de copier-coller cible
- Mail + un WhatsApp si WA est sur le site. Pas de Maps-only. Pas de papier
- WhatsApp quotidien seulement s’il s’est passé quelque chose + lundi
- Mémoire client = Postgres. Pas Elephant
- Coder dans Grok Build. Bot ≠ runtime publication
- Marge ≥ 30 % avant salaire fondateur
- Fondateur hors file opérateur ; il a une console admin + agent Scope
- Paiement : Stripe (cartes EEE + SEPA Direct Debit). Bizum Stripe pour le 1er clic ES seulement, pas le récurrent. Pas de Billing 0,7 % tant que l’abo n’est pas dans le produit. Versement : IBAN Revolut de la SL. Site public (`brmsocial`) envoie vers `/pay` de l’usine (`brmsocialbackend`).

## À figer (1 ligne chacune, avant semaine 5)

1. Engagement : mois par mois après le 1er mois, ou 3 mois fermes ?
2. Résiliation : fin de période déjà payée, ou immédiat au BAJA ?
3. Compte Google : un `reviews@` global ou un par vague de villes ?
4. Plafond rattrapage **hors** Sant Cugat : 20 avis, ou 30 jours glissants ? (Sant Cugat = 3 mois, locké)
5. Délai silence 1★ : 24 h puis abandon, ou 48 h + 1 relance ?
6. ~~Paiement : Stripe seul, Bizum seul, les deux ?~~ figé ci-dessus
7. Template Meta premier contact : on tente, ou mail-only jusqu’à juriste ?
8. Nom d’affichage WhatsApp et adresse gestionnaire exacte

## Hors scope volontaire

- iMessage / Linq
- Instinct
- Meerkat comme base de l’app
- Publication TripAdvisor / TheFork en v1
- Appels fondateur
- Publicité payante
