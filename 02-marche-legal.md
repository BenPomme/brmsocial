# Marché et cadre

## Cible

Le périmètre n’est pas du code. Villes et catégories actives : tables `scope_*`, pilotées par l’admin (écran + agent Scope).
Seed de démo seulement, pour développer.
Une verticale absente de `scope_categories` n’est pas prospectée.

Ordre de grandeur (contexte, pas une contrainte logicielle) : une grande ville ES peut avoir des milliers de commerces avec fiche Google. Taux e-mail froid utile observé ailleurs : 0,5–2 %.
Taux e-mail froid utile : 0,5–2 %.
Objectif interne churn : < 8 % / mois après le 3e mois.
Demande d’avis après visite : dans l’offre de base dès que le flux réponses tient (sinon le churn mange le MRR).

## Marge

Marge = (CA − charges hors rémunération fondateur) / CA.
Plancher visé : **≥ 30 %** avant de se payer.
Seuil approximatif : ~32 clients si 1 opérateur temps plein + outils (~2 180 € de plancher).
Avant 30 clients : opérateur mi-temps.

## Contact commercial

Quand e-mail d’entreprise **et** WhatsApp publié **sur le site** : les deux le même jour.
- Mail à info@ / contacto@ + PDF
- Un seul WhatsApp, même fond, lien, mot STOP / BAJA
- Relances mail j+3 et j+7. Pas de 2e WhatsApp sans réponse

WhatsApp du site seulement. Pas le portable Maps s’il n’est pas affiché comme canal d’entreprise.
Fiche téléphone Maps seul : **hors liste**. Pas de courrier, pas de visite.

LSSI / comms électroniques ES (et équivalent FR) : mail et WhatsApp sont dans la même famille. Le mail `info@` reste le moins exposé. Le premier WhatsApp est un risque d’entreprise assumé (amende possible, numéro possible à perdre). Volume bas. Numéro Business Babyrock, pas le mobile d’un VA.

API WhatsApp : texte libre hors 24h = modèles pré-approuvés + logique d’opt-in côté Meta. Si le template « avis sans réponse » est refusé, le 1er WhatsApp ne scale pas par l’API.

## Données

RGPD : le resto est responsable de sa fiche. Babyrock est sous-traitant pour les réponses.
Contrat + DPA avec l’opérateur PH et l’hébergeur.
Pas de mot de passe titulaire.
Conservation : journal des réponses le temps comptable / litige, puis politique de purge à écrire (proposition : 24 mois après fin de contrat).

## Langues

Avis : répondre dans la langue de l’avis.
Opérateur PH : anglais de travail. Espagnol utile. Catalan : le modèle écrit, l’opérateur contrôle la grille, pas le style.
Fondateur : pas dans la production quotidienne.
