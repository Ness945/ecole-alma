# Le Grand Livre des Lucioles, jardin et compagnons — version 0.8

## Choisir sa mission

- L'enfant (ou le parent) choisit toujours : **Choisir ma mission** → matière → leçon. Une leçon dont les prérequis ne sont pas vus **s'ouvre quand même** : Luna conseille seulement de commencer par la notion préparatoire, avec un bouton facultatif. Plus de page bloquante (cas de la multiplication jamais vue).
- Le bouton d'accueil « Ma mission » devient **Laisser Luna choisir** : c'est le choix automatique, il n'est plus présenté comme la seule voie.
- Après une leçon, **S'entraîner davantage →** (sur la page de la leçon, une fois la notion ouverte) et **Encore des défis sur ce thème** (à la fin d'une mission ciblée) lancent 6 nouveaux défis sur la même notion, avec des exemples différents.

## Le Grand Livre (100 chapitres)

- 5 livres de 20 chapitres : la forêt des lucioles, le village des marchands, la montagne des étoiles, la bibliothèque flottante, l'île des saisons. Fil conducteur : les pages du Grand Livre se sont envolées ; chaque livre en retrouve une. Données dans `story-data.js`, logique dans `story.js`, écrans dans `story-ui.js`.
- Chaque chapitre est lié à un petit pouvoir existant (les 30 sont couverts). Il affiche l'histoire, la leçon de la notion et son animation, puis une mission de 6 défis (extensible jusqu'à 16 en cas d'erreurs, comme les autres missions).
- Les chapitres 1 à 3 sont les trois parties du pont (inchangées) ; la clairière reste accessible.
- **Choix libre** : le livre propose le premier chapitre non terminé, mais tous les chapitres non terminés sont ouvrables, dans n'importe quel livre. Ouvrir un chapitre ouvre sa notion (comme une découverte explicite).
- **Un chapitre terminé disparaît des listes** : il n'est plus proposé ni dans le livre ni sur l'accueil. Il reste seulement dans « Mon journal » (liste repliée) et dans le compteur. La validation se fait à la fin de la mission (récompense unique, comme le pont) : c'est de la participation, pas une preuve de maîtrise ; la maîtrise reste calculée séparément par notion.
- Sauvegarde : champ facultatif `session.chapter` (4 à 100), strictement validé avec l'identifiant `story:<n>:<uuid>` et la compétence du chapitre. Les chapitres terminés sont lus dans `completed` ; aucune migration.

## Jardin

- 8 parcelles au départ, puis +4 par agrandissement payé en pièces : 15, 25, 35, 50 (maximum 24). Les tailles valides sont 8, 12, 16, 20, 24.
- Une plante peut **fleurir** (10 pièces) puis devenir **magique** (20 pièces) : effet visuel, aucun avantage scolaire.
- 11 **plantes rares** (6 à 30 pièces) s'ajoutent aux 4 plantes à graines : les graines restent rares, les pièces servent enfin.
- Sauvegarde : `garden` de 8 à 24 cases, `gardenLevels` (facultatif, rempli à 0 pour les anciennes sauvegardes).

## Compagnons

- 5 compagnons à adopter (24 à 32 pièces) dans « Mon aventurière » : lapin, Épine le hérisson, Plume la chouette, Mousse la tortue, Brindille le castor (les personnages du Grand Livre). Le renard et le dragon restent des cadeaux de mission. Le compagnon suit l'aventurière (accueil, dressing) et se promène dans le jardin. Aperçu avant achat, comme les accessoires. Dessins SVG locaux dans `avatar-art.js`.

## Château

- Deux nouveaux emplacements : **Dans le ciel** (arc-en-ciel, montgolfière, aurore des lucioles) et **Autour du château** (moulin, petit village, tente de fête), et deux toits (dorés, émeraude). Prix de 28 à 55 pièces. Les dessins sont dans `castle-art.js` (source unique : l'icône de la boutique est un recadrage du fragment du royaume). `sky` et `ground` sont facultatifs dans la sauvegarde.

## Cache hors ligne

`castle-art.js`, `story-data.js`, `story.js` et `story-ui.js` sont dans le cache (`content-v11`). Aucune ressource réseau nouvelle.
