# SEO du site BabyRock Social (notre marque)

Pas le SEO des fiches clients. Ici : que **www.babyrock.ai** soit trouvable et citable.

Repo : [BenPomme/brmsocial](https://github.com/BenPomme/brmsocial). Pages dans `docs/` (GitHub Pages). Copy dans `site/content/{es,ca,fr,en}.md`. Rebuild : `node site/build.mjs`.

L’usine (inbox, webhook, Stripe plus tard) est [BenPomme/brmsocialbackend](https://github.com/BenPomme/brmsocialbackend). Le site ne duplique pas l’admin. Il **pointe** : `wa.me` WhatsApp Babyrock, liens s’abonner / compte vers l’usine.

**À faire dans brmsocial (pas ici)** : bouton WhatsApp **actif** sur toutes les langues (header ou sticky). `https://wa.me/<E164_PROD>` (chiffres seuls, sans +). Texte du type « Escríbenos ». **Pas** le numéro test Meta `+1 555…`. Tant que le WABA de prod n’existe pas, le bouton reste en attente — on ne colle pas le 555 sur www.babyrock.ai.

État actuel (lu dans le repo) : titres et meta description existent ; FAQ en `<details>` ; 4 langues. **Absent** : `robots.txt`, `sitemap.xml`, canonical, hreflang, Open Graph, JSON-LD, alt sur le hero, apex `babyrock.ai` → www. La racine `docs/index.html` redirige en JavaScript : Google voit une coquille vide.

On n’achète pas de PDF AEO, pas de CrowdReply, pas de paquets de backlinks.

## Intention de recherche (peu de pages, les bonnes)

Une URL = une intention. Pas 50 villes × services.

| Intention | URL (ES, les autres langues suivent) |
|---|---|
| Marque | `/es/` |
| Comment ça marche | `/es/como-funciona/` |
| Prix / s’abonner | `/es/suscribirse/` |
| Preuve | `/es/investigacion/` |
| Simulateur | `/es/simulador/` |
| Qui | `/es/nosotros/` |
| Compte / après vente | `/es/cuenta/` (noindex si c’est un login) |
| Légal | privacidad, condiciones |

Plus tard, **une** page argent par couple réel, seulement si le scope admin l’a ouvert :

`/es/responder-resenas-google-restaurantes-barcelona/`

Pas de grille 400 pages. Une page = un métier + une ville où on vend vraiment. Texte unique (prix, langue, process 1–3★). Sinon Google les tasse.

Requêtes à viser, dans cet ordre :  
`BabyRock Social` · `responder reseñas Google` + métier/ville · `gestionar opiniones Google negocio` · équivalents CA/FR.

## Technique (à faire dans `site/build.mjs`, pas à la main dans docs/)

1. **Canonical** sur chaque page : `https://www.babyrock.ai/{lang}/{path}/`
2. **hreflang** : es, ca, fr, en + `x-default` → es
3. **`babyrock.ai` → `www.babyrock.ai`** (DNS + Pages / Cloudflare). Une seule host canonique.
4. Racine `/` : redirection **HTTP 302/301** vers `/es/` (ou langue Accept-Language côté edge). Plus de `location.replace` seul.
5. `docs/robots.txt` : allow `/` ; sitemap URL.
6. `docs/sitemap.xml` : toutes les URLs indexables, 4 langues. Exclure compte si login.
7. Search Console + Bing : propriété domaine `babyrock.ai`.
8. Open Graph + Twitter : title, description, image 1200×630 (une vraie photo, pas un stock).
9. JSON-LD :
   - `Organization` + `LocalBusiness` (Sant Cugat, email Rosalia)
   - `SoftwareApplication` ou `Service` : répondre aux avis, 89 € / 748 €
   - `FAQPage` sur les homepages (les 6 questions déjà là)
   - `Offer` sur s’abonner
10. Images : `alt` réel ; hero compressé (WebP, width). Lighthouse mobile > 90.
11. Fonts : self-host Inter/Newsreader ou `font-display: swap` + subset. Moins de round-trips fonts.googleapis.
12. Trailing slash cohérent partout (déjà le cas).
13. Pas de `noindex` accidentel sur investigacion / como-funciona.

## Contenu (déjà presque bon)

Garder le ton actuel : phrase claire, prix visible, pas de « boostez votre SEO ».

À ajouter, pas à réécrire le site :

- H1 = promesse + « reseñas Google » / « avis Google » / « ressenyes Google ». C’est déjà le cas en ES.
- FAQ = extraits pour Google et pour les chats. Une question = une réponse courte, faits (pas de mot de passe, 1–3★, 89 €).
- Page recherche : sources nommées (Harvard, etc.) + date. C’est la page que les modèles peuvent citer. La tenir à jour, pas la gonfler.
- `nosotros` : entité (Benjamin, Rosalia, Sant Cugat). NAP identique partout (site, fiche Google BabyRock si elle existe, mail).
- Interne : chaque homepage → como-funciona, investigacion, suscribirse. Footer déjà ok.

## Entité / confiance

- Fiche Google **BabyRock Social** (entreprise de services, Sant Cugat). Catégorie réelle. Photos. Même email.
- `rosalia@` et `reviews@` sur le site, visibles.
- Profils : LinkedIn Benjamin, éventuellement une page entreprise. Un seul nom de marque : **BabyRock Social** (casse cohérente).
- Pas de citations achetées. Un article réel (presse locale, newsletter resto) le jour où ça arrive.

## Mesure

Search Console : requêtes, pages, couverture, hreflang.
Pas de KPI « mentions ChatGPT » tant qu’on n’a pas 3 mois de Search Console.

## Roadmap (branche site, parallèle à l’usine)

Ordre dans `site/build.mjs` + DNS, pas dans le worker avis.

1. Canonical + hreflang + robots + sitemap + redirect apex/www + redirect `/` sans JS.
2. OG + JSON-LD Organization/Service/FAQ.
3. Images alt + compression + fonts.
4. Search Console.
5. Fiche GBP BabyRock Social.
6. Seulement ensuite : 1–3 pages métier×ville du scope actif.

Critère du point 1 : `https://www.babyrock.ai/sitemap.xml` liste les 4 homepages ; l’inspection d’URL GSC montre le canonical www ; `babyrock.ai` redirige.
