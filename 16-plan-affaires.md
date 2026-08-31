# Babyrock — plan d’affaires (coûts réels API + tokens)

Août 2026. Hypothèses explicites. Le PDF de pitch se fait à part.

Taux : **1 $ = 0,92 €**. Prix **HT**. Benjamin : premier opérateur, **salaire 0**. Un Philippin (8 h / j, 5 j / sem, 9 $/h) n’est chargé **que** lorsque la marge brute nette des coûts AI + API suffit à le payer.

---

## 1. Une fois le client signé : on poste comment

Places = découvrir. **GBP** = inbox + écriture, si `reviews@babyrock.ai` est **Gestionnaire** sur une fiche **vérifiée**.

| Action | Appel | Coût |
|---|---|---|
| Lister | `GET …/accounts/{id}/locations/{id}/reviews` | 0 € |
| Déjà répondu | champ `reviewReply` | 0 € |
| Poster | `PUT …/reviews/{id}/reply` `{ "comment": "…" }` | 0 € |
| Auth | OAuth `business.manage` | — |

Playwright = plan B. Rattrapage : **20** avis sans réponse max, puis le flux.

---

## 2. Funnel 1 000 prospects (inchangé)

Places Text Search Enterprise **sans** `reviews` : 50 appels × 35 $/1 000 = **1,75 $**.  
DataForSEO 80 avis × 600 contactables : **3,60 $**.  
1 000 scannés → ~420 mails → **4,2 clients** à 1 % → CAC API **~1,8 €**.

Détail §2 du fichier précédent : inchangé. Dépôt DFS 50 $ = ouverture de compte, pas le coût d’usage.

---

## 3. Avis reçus → avis à traiter (on n’invente pas un stock)

Places nous a donné un **stock** (188, 472, 3 269 avis…) pas une **vitesse**. Sans date d’ouverture de fiche, on ne déduit pas d’avis / jour. Donc **hypothèse de flux**, pas une mesure Sant Cugat.

Les avis tombent **7 jours / 7**. L’opérateur travaille **5 jours**. Le lundi absorbe vendredi soir + week-end.

| | Basse | **Base** | Haute |
|---|---|---|---|
| Avis **reçus** / client / **jour calendaire** | 0,25 | **0,40** | 0,80 |
| Soit / mois (× 30,44) | 7,6 | **12,2** | 24,4 |
| À **traiter** / client / **jour ouvré** (× 7/5) | 0,35 | **0,56** | 1,12 |

**Base = 0,40 / jour calendaire.** Ordre de grandeur d’un indépendant (un resto à ~500 avis sur 3–4 ans). Un LABARRA à 4 000 avis est hors v1.

Rattrapage d’onboarding (plafond dossier) : **+20 avis** une fois, étalés. Pas dans le flux journalier ci-dessus.

On ne traite pas les 1–3★ tant que le client n’a pas dit OK : ils **reviennent** dans la file plus tard. Le 0,56 / jour ouvré est le volume **à un moment** ; une partie est du wait. Pour dimensionner la file, on compte tout ce qui finit par un clic Publier / Éditer / Bloquer.

---

## 4. Rythme opérateur et capacité Philippin

Minutes par avis (Grok déjà rédigé, Publier = API) :

- 4–5★ facile 1,5 min (80 %) ; édité 4 min (20 %) → **2,0 min**
- 1–3★ une fois `pret` : 3 min ; mix 85 / 15 → **2,15 min**
- +15 % file / blocages → **2,5 min / avis**

**60 / 2,5 = 24 avis/h en pointe → on retient 18 avis/h soutenables.**

Philippin : **8 h × 5 j**. Mois = 52 / 12 × 5 = **21,67 j** × 8 = **173,3 h**.  
Coût : 173,3 × 9 $ = **1 560 $ ≈ 1 435 € / mois**. (Pas 160 h : 8 × 5, pas 8 × 4 semaines pile.)

Capacité **brute** (8 h pleines sur la file, 18 avis/h) :

`avis / jour ouvré = 8 × 18 = 144`  
`clients = 144 / 0,56 = 257` en base

Capacité **utile** (× **0,70** : lundi chargé, 1–3★ en attente, 10 % sample, fiche morte) :

`144 × 0,70 = 101 avis/j` → **101 / 0,56 ≈ 180 clients**

Le dossier visait 80–120 (Playwright). Avec l’API, **180** est le plafond théorique à 0,40 avis/j. On ne le promet pas au recrutement : **100–120** reste la cible d’embauche.

Benjamin (phase 1), **2 h de file / jour** (le reste = commercial / produit), 5 j :

`2 × 18 × 0,70 / 0,56 ≈ 45 clients` en régime.

---

## 5. Quand le coût Philippin s’allume

**Marge brute nette AI+API** = CA − Grok − Places − DataForSEO − GBP(0).

Pas encore déduit : salaire PH, WhatsApp BSP, infra, Stripe, temps Benjamin.

Par client et par mois, en régime :

- CA : **89 €**
- Grok : 12,2 brouillons × 0,0013 € ≈ **0,016 €**
- GBP : **0**
- Places + DFS : acquisition, lissée sur 12,5 mois de vie (churn 8 %) : CAC 1,8 € / 12,5 ≈ **0,14 €**

**Marge brute nette AI+API ≈ 89 − 0,02 − 0,14 ≈ 88,8 € / client / mois.**

Un Philippin coûte **1 435 €**.  
Il est **finançable** dès que `88,8 × N ≥ 1 435` → **N ≥ 16,2** → **dès 17 clients**.

Il n’est **nécessaire** (file Benjamin) que vers **45 clients**.  
Donc : on **peut** l’embaucher à 17 ; on **doit** vers 45. Le coût n’entre dans le P&L **qu’au mois où on l’embauche**. Hypothèse de plan : **embauche au palier 17 seulement si tu quittes la file ; sinon on attend ~40–45.** Tableau ci-dessous : coût PH = 0 tant que N < 45, puis 1 435 €. Variante « on embauche dès 17 » en note.

---

## 6. Tableau (prix 89 € HT, 0,40 avis / jour calendaire, 18 avis/h)

Formules :

- Avis / jour ouvré à traiter = `N × 0,40 × 7/5 = N × 0,56`
- Heures de file = ces avis / 18
- CA = `N × 89`
- AI+API = `N × 0,16 €` (Grok + CAC lissé)
- MB net AI/API = CA − AI+API
- PH finançable si MB ≥ 1 435 €
- Coût PH dans le tableau = **0 € si N < 45**, **1 435 € si N ≥ 45** (toi sur la file jusque-là)
- Autres (infra 30 + WA 0,8 N + Stripe 1,5 % CA + 0,25 N)

| Clients | Avis reçus / j (cal.) | À traiter / j ouvré | Heures file / j | CA € | AI+API € | **MB net AI+API €** | PH finançable ? | Qui file | Coût PH € | Autres € | **Résultat €** | Marge / CA |
|---:|---:|---:|---:|---:|---:|---:|---|---|---:|---:|---:|---:|
| 5 | 2,0 | 2,8 | 0,2 | 445 | 1 | **444** | non | toi | 0 | 42 | **403** | 91 % |
| 10 | 4,0 | 5,6 | 0,3 | 890 | 2 | **888** | non | toi | 0 | 53 | **835** | 94 % |
| **17** | 6,8 | 9,5 | 0,5 | 1 513 | 3 | **1 510** | **oui (1 PH)** | toi | 0 | 69 | **1 441** | 95 % |
| 20 | 8,0 | 11,2 | 0,6 | 1 780 | 3 | **1 777** | oui | toi | 0 | 76 | **1 701** | 96 % |
| 30 | 12,0 | 16,8 | 0,9 | 2 670 | 5 | **2 665** | oui | toi | 0 | 99 | **2 566** | 96 % |
| 40 | 16,0 | 22,4 | 1,2 | 3 560 | 6 | **3 554** | oui | toi | 0 | 122 | **3 432** | 96 % |
| **45** | 18,0 | 25,2 | 1,4 | 4 005 | 7 | **3 998** | oui | **1 PH** | **1 435** | 134 | **2 429** | **61 %** |
| 50 | 20,0 | 28,0 | 1,6 | 4 450 | 8 | **4 442** | oui | 1 PH | 1 435 | 146 | **2 861** | 64 % |
| 80 | 32,0 | 44,8 | 2,5 | 7 120 | 13 | **7 107** | oui | 1 PH | 1 435 | 220 | **5 452** | 77 % |
| 100 | 40,0 | 56,0 | 3,1 | 8 900 | 16 | **8 884** | oui | 1 PH | 1 435 | 268 | **7 181** | 81 % |
| 120 | 48,0 | 67,2 | 3,7 | 10 680 | 19 | **10 661** | oui | 1 PH | 1 435 | 316 | **8 910** | 83 % |
| 180 | 72,0 | 100,8 | 5,6 | 16 020 | 29 | **15 991** | oui | 1 PH (plein) | 1 435 | 461 | **14 095** | 88 % |

Lecture :

- Jusqu’à ~40 clients, **0,3 à 1,2 h de file par jour** pour toi. Le commercial tient.
- À **17 clients**, un PH est **payé par la MB**. On ne l’embauche pas encore : tu n’as que **0,5 h** de file.
- À **45**, tu es vers **1,4 h** de file + le close : on embauche. La marge **passe de ~96 % à ~61 %** (c’est le coût 1 435 € qui apparaît). Encore **au-dessus de 40 %**.
- Un PH à 8 h n’est **rempli** qu’autour de **100–180** clients selon le 0,70. Entre 45 et 100 il est **sous-chargé** (1,4 à 3,1 h). C’est normal. On peut commencer **mi-temps** (20 h / sem ≈ 868 €) à 45 clients : résultat encore meilleur.

Si on embauchait le plein temps dès 17 clients : MB 1 510 − 1 435 = **75 €** avant autres charges → **marge ~0 %** ce mois-là. D’où : **finançable ≠ à embaucher**.

### Variante mi-temps PH à 45 clients (20 h / sem, 868 €)

CA 4 005 − AI+API 7 − PH 868 − autres 134 = **2 996 €** (75 % de marge). Mieux que le plein temps sous-chargé.

---

## 7. Prix minimum pour 40 % de marge

**Phase toi (N < 45)** : charges ≈ 30 + 0,8 N + Stripe. À 20 clients, ~81 € de coûts, CA 1 780 → le plancher 40 % serait **~5 €**. On **ne baisse pas** : 89 € est le prix de l’offre.

**Phase 1 PH plein (1 435 €)** :

`prix_min = (1435/N + 0,82 + 30/N + 0,25) / 0,585`

| N | Prix min 40 % | Marge à 89 € |
|---:|---:|---:|
| 45 | **56 €** | 61 % |
| 50 | **51 €** | 64 % |
| 80 | **33 €** | 77 % |
| 100 | **27 €** | 81 % |

89 € tient le 40 % **dès le premier mois avec PH**, à 45 clients. Il casserait si on mettait un plein temps sur **20** fiches (prix min ≈ **110 €**).

---

## 8. Sensibilité du 0,40 avis / jour

Même PH, 18 avis/h, ×0,70. Clients max utiles = `101 / (r × 1,4)`.

| Flux calendaire | Traiter / j ouvré / client | Clients « 8 h utiles » | Tes 2 h (×0,70) |
|---:|---:|---:|---:|
| 0,25 | 0,35 | **288** | **72** |
| **0,40** | **0,56** | **180** | **45** |
| 0,80 | 1,12 | **90** | **23** |

Si le médian est 0,80, tu embauches plus tôt (~23 clients) et un PH est plein vers 90. **À mesurer** sur les 20 premiers clients (avis GBP / jour, pas le stock Places).

---

## 9. Reco

1. **89 €**. Phase 1 (toi) : marge cash ~95 %. Phase 2 (PH à ~45) : ~61 % ≥ 40 %.
2. **Ne pas embaucher à 17** juste parce que c’est finançable : tu n’as pas la charge. Embaucher **mi-temps vers 40–45**, plein temps quand la file PH dépasse ~5 h/j (~120 clients à 0,40/j).
3. **Rampe** : 20 avis de rattrapage × N le même lundi cassent tes 2 h. Max 2–3 activations / jour.
4. Compter chaque jour : avis **reçus** (GBP) et **publiés**. Ça remplace l’hypothèse 0,40.
5. DataForSEO : 50 $ de compte pour le **taux d’orphelins** du pitch (12 × 80 avis ≈ 0,07 $ d’usage).

Grok Build ~30 $ : fabrication, pas une charge par client.

---

## 10. Si on facture 49,90 € HT / mois

Même flux (0,40 avis / jour calendaire), mêmes 18 avis/h, même PH 1 435 €, même règle : toi sur la file jusqu’à ~45 clients.

**MB nette AI+API ≈ 49,74 € / client** (49,90 − 0,16).  
PH **finançable** dès `1 435 / 49,74 ≈ 29 clients` — mais si on l’embauche à 29, le résultat après infra / WA / Stripe est **légèrement négatif**. Seuil pour ne pas perdre d’argent avec un PH plein : **~31 clients**.

Résultat (formule) : `47,94 × N − 30 − coût_PH`  
(47,94 = 49,90 − Grok/CAC − WA − Stripe). Coût PH = 0 si N < 45, sinon 1 435.

| Clients | Heures file / j | CA € | MB net AI+API | PH finançable | Qui | Coût PH | Résultat € | **Marge** |
|---:|---:|---:|---:|---|---|---:|---:|---:|
| 10 | 0,3 | 499 | 497 | non | toi | 0 | 449 | **90 %** |
| 20 | 0,6 | 998 | 995 | non | toi | 0 | 929 | **93 %** |
| **29** | 0,9 | 1 447 | **1 442** | **oui, tout juste** | toi | 0 | 1 360 | **94 %** |
| 40 | 1,2 | 1 996 | 1 990 | oui | toi | 0 | 1 888 | **95 %** |
| **45** | 1,4 | 2 246 | 2 238 | oui | **1 PH** | 1 435 | **692** | **31 %** |
| 50 | 1,6 | 2 495 | 2 487 | oui | 1 PH | 1 435 | 932 | **37 %** |
| **53** | 1,6 | 2 645 | 2 636 | oui | 1 PH | 1 435 | 1 063 | **40 %** |
| 80 | 2,5 | 3 992 | 3 979 | oui | 1 PH | 1 435 | 2 370 | **59 %** |
| 100 | 3,1 | 4 990 | 4 974 | oui | 1 PH | 1 435 | 3 329 | **67 %** |

À **49,90 €**, le 40 % **n’est plus tenu le mois où tu embauches un plein temps** (31 % à 45 clients). Il revient à 40 % vers **53 clients**. À 89 €, le même palier 45 était déjà à **61 %**.

Écart de CA vs 89 € : **39,10 € × N / mois**. À 45 clients : **1 760 € / mois** de moins. C’est plus que le salaire PH.

LTV (churn 8 %, 12,5 mois) : 49,90 × 12,5 = **624 €** (vs 1 113 € à 89). CAC ~2 €. LTV/CAC encore énorme. Le manque n’est pas le ROI d’acquisition, c’est la **marge après le premier salarié**.

Mi-temps PH (868 €) à 45 clients / 49,90 € : résultat ≈ 2 246 − 7 − 868 − 134 ≈ **1 237 €** (**55 %**). Ça recouvre le 40 %.

**Lecture :** 49,90 € marche tant que tu es seul. Le jour du premier PH plein, 89 € reste confortable et 49,90 € est juste jusqu’à ~53 fiches. Si le prix catalogue est 49,90, embaucher **mi-temps** d’abord.

---

## 11. Simulation 10 000 clients

Même flux : **0,40 avis / jour calendaire / client** (hypothèse, pas une mesure). File 5 j / 7. **18 avis/h**. PH : **8 h × 5 j**, 1 435 € / mois.

Avis à traiter par **jour ouvré** : `10 000 × 0,40 × 7/5 = 5 600`.  
Heures de file : `5 600 / 18 = 311 h / jour`.  
PH bruts (8 h) : `311 / 8 = 39`.  
PH **utiles** (× 0,70 slack) : `311 / (8 × 0,70) = 56`.

**56 Philippins** sur la file. Plus l’encadrement dossier (lead dès ~2 opérateurs, 12–18 $/h) : **1 lead / 8 file** → **7 leads**. 1 responsable ops Europe (forfait, pas chiffré ici comme PH).

| | 49,90 € / mois | 89 € / mois |
|---|---:|---:|
| Clients | 10 000 | 10 000 |
| **ARR HT** | **6,0 M€** (10 000 × 49,90 × 12) | **10,7 M€** (10 000 × 89 × 12) |
| CA / mois | 499 000 € | 890 000 € |
| File PH | **56** | **56** |
| Leads PH (~15 $/h, 7 pers.) | ~16 700 € | ~16 700 € |
| File PH (56 × 1 435 €) | 80 360 € | 80 360 € |
| **Masse PH + leads / mois** | **~97 000 €** | **~97 000 €** |
| Grok | ~160 € | ~160 € |
| Places + DFS (churn 8 % → ~800 signés/mois) | ~1 000 € | ~1 000 € |
| WhatsApp BSP (0,8 € × 10 000) | 8 000 € | 8 000 € |
| Stripe 1,5 % + 0,25 € | 10 000 € | 15 800 € |
| Infra (ordre : workers, PG, EU) | ~5 000 € | ~5 000 € |
| **Charges (hors fondateur, hors leads Europe)** | **~121 000 €** | **~127 000 €** |
| **Résultat / mois** | **~378 000 €** | **~763 000 €** |
| **Marge** | **76 %** | **86 %** |

À 10 000 fiches, le prix 49,90 € **redevient largement au-dessus de 40 %** : le PH est plein (~5,6 h de file utile / personne à 56 têtes). Le trou de marge à 45 clients était de la **sous-charge**, pas du 49,90 en soi.

Pour *arriver* à 10 000 avec 8 % de churn : stock × 0,08 = **800 nouveaux / mois** ≈ 190 000 fiches scannées / mois (base 4,2 clients / 1 000). Les APIs restent ~1 k€. Le goulot est le **recrutement PH** (56 personnes), pas DataForSEO.

Cible dossier 100–120 fiches / VA au lieu de 180 théoriques : **10 000 / 110 ≈ 91 Philippins file** (+ ~11 leads). Masse ~130 k€ + leads. Marge 49,90 € encore ~70 %. Plus prudent tant que la file n’est pas chronométrée.
