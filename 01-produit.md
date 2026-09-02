# Produit

## V1 (à construire maintenant)

Abonnement mensuel : on répond aux avis Google du commerce.

Prix **TTC** (ce que le resto paie). Factura = HT + IVA 21 % ES.

- Avis Google : **99 € TTC / mois** (81,82 € HT + 17,18 € IVA)
- Douze mois : **799 € TTC / an** (660,33 € HT + 138,67 € IVA) — ~33 % vs 12 × 99
- **Sant Cugat del Vallès** : 1er mois **0 €**, on rattrape les avis sans réponse des **3 mois** précédents, puis 99 € TTC / mois. Pas un abonnement Stripe auto : le 2e mois = lien de paiement.
- Mise en service : **0 €** si le client ajoute le gestionnaire Google lui-même

France B2B avec n° TVA : autoliquidation, le client paie le HT (81,82 / 660,33).

WhatsApp **vers le titulaire** (brouillons 1–3★, topo du jour) est déjà dans cette offre. Ce n’est pas un produit à part.

Inclus v1 :

- Import des avis sans réponse (plafond : 20 plus récents au onboarding, ensuite le flux)
- Brouillon dans la langue de l’avis (ES, CA, FR, EN)
- Publication 4★ et 5★ après clic opérateur (Publier ou Éditer puis Publier)
- 1★, 2★, 3★ : WhatsApp au titulaire avec brouillon ; publication seulement après OK ou texte renvoyé
- WhatsApp au client s’il s’est passé quelque chose dans la journée
- Récap lundi
- Journal de tout ce qui a été proposé / publié

Non inclus :

- Publicité
- Refonte de site
- Photos
- TheFork / caisse
- Appel du fondateur
- Copier-coller manuel par le VA comme process cible (le bouton Publier écrit dans Google)

## V2 (plus tard, pas vendu maintenant)

**Autre produit.** Un bouton WhatsApp sur la fiche du resto pour *ses clients* (horaires, menu, 3 prochains créneaux Calendar). Pas le WhatsApp Rosalia ↔ titulaire, déjà en v1.
Après ~40 clients avis. Pas d’écriture à froid vers les clients du resto sans base légale. Pas de SKU sur `/pay`.

## Promesse dite au resto

« On répond à vos avis Google. Les notes 4 et 5 partent après relecture. Les notes 1 à 3, vous validez le texte. Vous n’envoyez pas votre mot de passe. Vous ajoutez une adresse en gestionnaire. »

## Ce qui n’est pas le produit

Instinct / iMessage comme canal principal : non (Espagne = WhatsApp).
Agent « tout automatique sans humain » : non. L’humain est là pour l’authenticité et le frein 1★.
Meerkat / Elephant comme base de données client : non. Postgres.
