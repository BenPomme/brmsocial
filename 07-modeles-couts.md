# Modèles et coûts

## Règle

Le modèle le moins cher qui fait la tâche. Pas de mob pour rédiger un 5★.
Pas de LLM quand Google fournit déjà la note.

## Table

| Tâche | Modèle | Notes |
|---|---|---|
| Note / id avis | Aucun | Données Google |
| Langue | Fast ou détecteur local | Fast si doute |
| Brouillon 4★/5★ | **Grok 4.1 Fast** 0,20 / 0,50 $ / M tokens | Volume |
| Brouillon 1★–3★ | Grok 4.3 (~1,25 / 2,50 $) | Plus de jugement |
| Mail / 1er WhatsApp démarchage | Fast | Template + 3 faits extraits |
| FAQ close | Fast + script | Hors script → pas un modèle frontier, un humain |
| Scout « est-ce un resto indépendant » | Règles d’abord (chaîne, hôtel) puis Fast |
| Computer use Maps | Bot ou Playwright **sans** Heavy | Budget job plafonné |

Ne pas utiliser Grok 4.6 (2 / 6 $) ni Heavy multi-agent pour la file quotidienne.

## Prompt brouillon (contraintes)

- Langue = langue de l’avis
- 400 caractères max Google
- Reprendre un détail concret de l’avis
- Pas d’excuse inventée, pas d’offre, pas de fait médical
- Insérer `tone_notes` du client s’il y en a
- Tutoiement / vouvoiement selon la langue et tone_notes (ES : usted par défaut sauf tone)

## Plafonds

- Par avis Fast : si tokens > 2k in + 400 out → log anomalie
- xAI mensuel : alerte à 200 €, stop jobs `draft` à 400 € (réglable)
- Scout : max N pages / jour / domaine mail

## Abo Grok vs API

Rédaction prod = **API** (facturation tokens, prévisible).
Grok Bot = option Scout, pas la facture principale.
SuperGrok 30 $ pour Build / chat.
Pas Heavy au lancement.

## Charges hors modèle (rappel)

Opérateur 9 $/h, navigateurs, mail, BSP, Stripe.
Voir plan d’affaires `Babyrock-plan-affaires.docx`.
Marge ≥ 30 % avant salaire fondateur. Seuil ~32 clients en temps plein VA.
