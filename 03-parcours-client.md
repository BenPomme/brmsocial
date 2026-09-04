# Parcours client et responsable interne

Légende : **Agent** = logiciel. **Opérateur** = humain PH. **Lead** = humain PH senior (à partir de ~2 opérateurs). **Fondateur** = hors boucle sauf incident contrat.

## 1. Premier contact

Agent : Scout + captures + page PDF + mail.
Agent : un WhatsApp si `wa.me` / bouton sur le site.
Agent : relances mail j+3, j+7, stop.
Humain : personne.

## 2. Réponse du resto

Agent : unifie le fil sur WhatsApp Babyrock. Répond FAQ (prix, gestionnaire, pas d’appel obligatoire). Envoie lien Stripe / Bizum.
Opérateur : seulement question hors script.
Fondateur : non.

## 3. Paiement

Agent : crée `clients` statut `payé`, envoie la consigne gestionnaire : ajouter `reviews@babyrock.ai` (ou compte vague) rôle Gestionnaire. Répondre OK.

## 4. Invitation

Client clique dans Google.
Agent poll : rôle accepté → import avis sans réponse (max 20 récents) → brouillons → file `publish_queue` (4–5) et `wait_owner` (1–3).

## 5. Rattrapage

4–5★ : Opérateur Publier ou Éditer puis Publier.
1–3★ : Agent WhatsApp au titulaire. Opérateur publie après OK / texte client. Agent journalise.

## 6. Jour normal 4–5★

Agent : nouvel avis → brouillon → file.
Opérateur : Publier / Éditer+Publier.
Agent : WhatsApp « aujourd’hui » seulement si ≥1 publication, heures Europe (11–18 BCN/Paris). Sinon silence.

## 7. Jour 1–3★

Agent : brouillon + WhatsApp (heures Europe). Relance 24 h. Pas de publi auto.
Client : OK ou texte.
Opérateur : publie le texte validé. Bloquer si insulte / donnée perso / santé inventée.
Lead : tranche les blocages s’il existe.

## 8. Modification d’une réponse déjà en ligne

Agent relie le message à l’avis.
Opérateur édite et publie.
Agent confirme une ligne.

## 9. Lundi

Agent `fiche_watch` + `notify` : bloc semaine depuis la base **et** la fiche Google. Lignes seulement si on a le chiffre : note et volume (delta), avis disparus, appels et demandes d’itinéraire, propositions de modification Google encore ouvertes. Humain : personne.

## 9b. Bouclier fiche / festifs

Agent : si heures, nom, téléphone, adresse ou ouvert/fermé changent → WhatsApp le jour même. Si un festif local tombe sur un jour où la fiche dit ouvert → WhatsApp : répondez CERRADO (on patche par API) ou changez-le dans Google. L’opérateur ne touche pas aux heures.

## 10. Fiche morte

Agent détecte échec Google → WhatsApp jour même → file `fiche_morte`.
Opérateur n’insiste pas.
Après réparation : Agent réimporte, Opérateur reprend la file.

## 11. Facture

Agent : prélèvement, message J, relance, pause publication J+7 sans paiement.

## 12. Résiliation

Agent : accusé, stop publi, rappel retirer le gestionnaire.
Fin de période déjà payée. Les réponses publiées restent.

## BabyRock Direct — pas encore

Inscription, Fil commerce, rappel et demande d’avis : autre produit. Voir `18-roadmap-produit.md`. Ce parcours-ci est Social seulement.

## Ce que le client ne voit jamais

Opérateur, Manille, brouillons internes des 5★, retries Playwright.
