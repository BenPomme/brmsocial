# Opérateur

## Accès

Compte Babyrock (email + mot de passe ou magic link).
Pas de compte Google du resto.
Pas de liste de mots de passe / 2FA dans l’UI.

Session Google : navigateur isolé côté serveur, déjà connecté en **gestionnaire** Babyrock. L’opérateur ne voit que l’écran Babyrock.

## Écran : une file d’avis, pas une liste de « comptes »

Colonnes : client · note · langue · extrait avis · brouillon · actions.

Actions :

- 4★/5★ : `Publier` | `Éditer` puis `Publier` | `Bloquer`
- 1★–3★ : pas de `Publier` tant que `statut != pret` (OK client). Ensuite mêmes boutons. `Bloquer` toujours dispo.

Checklist obligatoire avant Publier (cases) :

1. Le détail repris est dans l’avis
2. Pas de nom de personne / employé
3. Pas de santé / intoxication / hygiène inventée
4. Pas de geste commercial inventé
5. Langue = langue de l’avis

Une case rouge → le bouton Publier refuse.

`Compte terminé` : marque l’heure et le compteur. Ne ping pas un humain.

## Charge

Début (Playwright encore instable) : 30–50 fiches actives / opérateur.
Cible : 80–120 quand Publier est fiable.
Au-delà : embaucher. Ne pas allonger le shift.

Horaires : chevauchement Europe. 5★ dans la journée Europe. 1★ peut attendre 12 h. WhatsApp client : 11–18 Europe, jamais 02 h Manille.

## Qualité

100 % des 1★–3★ et des `Bloquer` : lead, ou attente client tant qu’il n’y a pas de lead.
10 % des 5★ : lead le lendemain sur le journal.
Pas de second tour « agent vérifie chaque compte le soir ».

## Recrutement

Embauche directe (OnlineJobs.ph). Pas d’agence à 20 $/h.
Cible v1 : 1 confirmé **9 $/h** (~1 330 € / mois à 160 h).
Avant 30 clients : 20 h / semaine.
Espagnol = plus. Français rare : le modèle écrit, grille seulement.
Lead 12–18 $/h à partir de ~250 fiches ou 2+ opérateurs.

## Interdit opérateur

Appeler les restos.
Négocier le prix.
Ouvrir wp-admin.
Utiliser son WhatsApp perso.
Télécharger une session Google sur son PC.

## BabyRock Direct — pas staffé

Pas d’inbox Babyrock pour le WhatsApp des clients du commerce. L’appli WhatsApp du titulaire reste le filet. L’opérateur Social ne répond pas « c’est où le parking ».
