# Liste d’agents — Babyrock Social

Un « agent » = un worker avec un `job.kind`, éventuellement un appel modèle. Allumé ou éteint par un humain. **Allumé : boucle toute seule** (horaire, file Postgres). Éteint : rien. Pas une mob. Pas un super-agent.

## Production (clients déjà signés)

| Id | Nom | Fait, tout seul si ON | Humain |
|---|---|---|---|
| `draft` | Rédacteur | Nouvel avis → brouillon (langue de l’avis, ≤ 400 car.) | — |
| `notify` | Messager client | **Parle au resto déjà client** (pas à Google). Envoie l’avis 1–3★ + le brouillon ; topo du jour ; lundi ; fiche morte ; facture. Relance 24 h si silence sur un 1–3★. | Le resto répond OK ou un texte (`inbox`) |
| `inbox` | Inbox | Lit les réponses du resto (OK, texte, FAQ). Passe l’avis 1–3★ en `pret` si OK / texte. | Opérateur si hors script |
| `publish` | Publieur | Écrit la réponse **sur Google** (API GBP ; Playwright = secours) | **4–5★ : clic humain** (interrupteur pour auto plus tard). **1–3★ : clic humain après `pret`** |

### 1–3★ : qui fait quoi

1. `draft` écrit la suggestion.
2. **`notify` l’envoie au titulaire** (WhatsApp Babyrock Social, ou l’écran client tant que Meta n’est pas là) : texte de l’avis + brouillon. C’est **cet** agent-là. Pas `publish`.
3. `inbox` reçoit OK ou un texte collé.
4. `publish` n’écrit sur Google **qu’après** ça **et** un clic (opérateur, ou toi en phase 1).

`notify`, ce n’est pas « des notifs push ». C’est le **canal Babyrock Social → resto payant**.

### 4–5★

Aujourd’hui : `draft` puis **clic** puis `publish`.  
Plus tard : un flag `publish_4_5_auto` (off par défaut). Le code doit le permettre sans tout refaire. Tant que c’est off, pas de publi 4–5 sans clic.

## Démarchage

| Id | Nom | Fait, tout seul si ON | Humain |
|---|---|---|---|
| `scout` | Scout | Liste les fiches dans le **scope actif** (Places, pas de scraping Maps) | — |
| `inspect` | Inspecteur | Pour chaque fiche : **tous les avis des 6 derniers mois**, et si le titulaire a répondu (`owner_answer` vide ou non). Pas un plafond 50–80 : 6 mois, tout le flux de la période. | — |
| `press` | Press | One-pager / lien (pas de PDF collé au 1er mail) | — |
| `carrier` | Carrier | Prépare outreach + relances (j+3, j+7). **N’envoie rien** tant que le lot n’est pas validé. Journal : envoyé, ouvert si on l’a, réponse, relance, STOP/BAJA. | **Toi, par lots** (Admin → Lots). |
| `inbox_sync` | Inbox | Tire les mails Rosalia (Zoho) et les WhatsApp entrants (webhook). Classe OK / STOP / n° / texte. Propose une réponse Rosalia : **script sans LLM** si OK/STOP/n° ; **Grok cheap** si texte dans la FAQ (prix, gestionnaire, paiement). Hors script → humain. | Toi tu **envoies** (allowlist). Opérateur si hors script. |

Inspect : un resto à 12 avis / mois ≈ 70 avis sur 6 mois ; un gros flux, davantage. DataForSEO (ou équivalent) facture à l’avis. Le critère métier est **la fenêtre 6 mois**, pas un N magique.

## Pilotage

| Id | Nom | Fait, tout seul si ON | Humain |
|---|---|---|---|
| `scope` | Scope | Propose un diff villes / catégories | **Toi**, Appliquer / Refuser |
| `head_of_data` | Head of Data | Mesure les process, propose des reco (heure/jour d’envoi, forme, catégorie, prix ; plus tard réponses d’avis ; plus tard rythme client). N’envoie pas, ne publie pas. | **Toi**, tu valides ou tu refuses chaque reco |

Mémoire d’essais : Postgres d’abord. Goldfish / Elephant : optionnel plus tard.

## Explicitement non

- Publier un 1–3★ sans OK resto
- Publier un 4–5★ sans clic **tant que** `publish_4_5_auto` est off
- Élargir le scope tout seul
- Carrier qui envoie un lot non validé
- Head of Data qui applique ses recos tout seul
- Un id = Scout + Publier + Scope
- TripAdvisor / TheFork / iMessage en v1
- Sessions Google clients sur une machine partagée

## Ajout d’un agent

1. Ligne ici  
2. `job.kind` + plafond coût + interrupteur ON/OFF  
3. Qui valide quoi  
4. Tu confirmes dans l’admin
