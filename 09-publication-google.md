# Publication Google

## Invitation gestionnaire

Le titulaire reste propriétaire.
Il ajoute `reviews@babyrock.ai` (ou `reviews+bcn1@…`) en rôle **Gestionnaire**.
Ce rôle peut répondre aux avis. Il ne peut pas voler la fiche.

Refus d’invitation = pas de produit (sauf s’il colle lui-même, hors scope).

Fin de contrat : il retire l’adresse. On arrête les jobs `publish`.

## Bouton Publier

L’opérateur ne copie pas.
`Publier` envoie `published_text` (opérateur ou texte owner) au worker.
Worker : profil isolé → UI Google Business ou API si disponible → réponse enregistrée.
Succès : `avis.status=publie`, ligne `actions`.
Échec : `publish_fail`, `fiche_morte` si login cassé, WhatsApp client.

## 1★–3★

Pas de bouton tant que pas d’OK.
Texte publié = texte validé par le titulaire, sauf `Bloquer` opérateur (alors WhatsApp « on n’a pas publié, raison courte »).

## Rattrapage

Max 20 avis anciens sans réponse à l’activation.
Pas 2019 en entier.

## Risques

Challenge 2FA compte Babyrock → infra, pas le VA.
Suspension fiche → stop immédiat ce client, message le jour même.
Ne jamais répondre depuis le compte personnel du VA.
