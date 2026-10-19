# Le château animé (0.11)

Le château est une scène SVG **animée en CSS** (aucune bibliothèque, aucun serveur, hors ligne). Le site reste une application web statique : c'est ce qui permet de l'ouvrir sur la tablette par une simple adresse, sans installation ni boutique d'applications. Un moteur 3D ou une application native n'apporterait ici que de la complexité ; si un jour il faut aller plus loin, la scène est isolée dans `frontend/js/castle-scene.js`.

**Dynamique**
- Jour, soir et nuit selon l'heure de l'appareil (ciel, soleil / lune, étoiles, fenêtres éclairées, halos des lumières). La page du château propose aussi « Maintenant / Jour / Soir / Nuit » pour essayer.
- Nuages qui dérivent, bannières qui flottent, étoiles qui scintillent, jets de la fontaine, ailes de moulin, montgolfière, flammes de torches, lanternes qui palpitent.
- Le compagnon choisi se promène devant le château (page du château).
- « Animations douces » coupe tout (réglage de l'espace parent et préférence « réduire les animations » du système).

**Personnalisation** : 15 emplacements, une cinquantaine d'objets, tous achetés avec des pièces et essayables sans rien dépenser.
Toits (couleurs), **murs** (8 matières), **tours** (cône, créneaux, flèche, dôme), **porte** (6), **fenêtres** (5), bannières (4), **douves** (3), **chemin** (4), jardin, fontaine, **lumières** (3), **créatures** (dragon, Pégase, fée, oiseaux, papillons), **météo** (pétales, neige, pluie, lucioles, poussière d'étoiles), ciel, alentours.

**Sauvegarde** : neuf nouveaux emplacements facultatifs dans `rpg.castle` (`walls`, `towers`, `door`, `windows`, `moat`, `path`, `lights`, `weather`, `creature`) ; les anciennes sauvegardes restent valides (emplacement vide = château d'origine). Un objet non possédé ou posé sur le mauvais emplacement est refusé.

**Dessin** : source unique — l'icône de la boutique est un recadrage de la même scène (figée). Aucun identifiant SVG hors dégradés préfixés.

Limites : dessin fait à la main, non vérifié sur une vraie tablette ; la scène complète est redessinée à chaque changement (rapide, mais à surveiller sur une tablette très ancienne).

## Géométrie (v0.11.1)
Le château est dessiné de face et symétrique : salle centrale à créneaux, tour haute au centre, deux tours latérales, porte voûtée au milieu. Les cinq fenêtres sont des arcades placées sur les murs (liste `WSPOTS` dans `castle-scene.js`), identiques pour tous les styles de fenêtres. Douves, pont-levis, chemin et lumières sont alignés sur la porte.
