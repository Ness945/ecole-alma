# Le château animé (0.11)

Le château est une **vraie scène 3D** (Three.js 0.170, licence MIT, embarqué dans `frontend/vendor/`, aucun serveur, aucune donnée envoyée, fonctionne hors ligne) : on la fait tourner du doigt ou avec les flèches du clavier. Si WebGL n'est pas disponible (ou en cas d'erreur), le dessin SVG de face reste affiché automatiquement. Le site reste une application web statique, ouvrable sur la tablette par une simple adresse.

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

## 3D (v0.12)
- `frontend/js/castle-3d.js` construit la scène à partir du même état `rpg.castle` : salle à créneaux, tour centrale, quatre tours d'angle, porte voûtée, 9 fenêtres posées sur les murs, douves et pont-levis, chemin, lanternes / torches / guirlande, jardin, fontaine, alentours (moulin, village, tente), ciel (arc-en-ciel, montgolfière, aurore), créatures (dragon, Pégase, fée, oiseaux, papillons) et météo.
- Jour / soir / nuit : ciel, lumière, étoiles et lune, fenêtres et lumières allumées.
- Un seul contexte WebGL est partagé ; l'écran est monté par `app.js` (`upgradeCastles`) après chaque affichage et le dessin SVG sert de secours (`.castle3d` contient le SVG).
- « Animations douces » coupées ou `prefers-reduced-motion` : la scène est immobile (image fixe, rotation manuelle possible).
- Appareil lent ou sans carte graphique : allègement automatique (sans ombres, image plus petite, moins d'images par seconde).
- Les icônes de la boutique restent des recadrages du dessin SVG (`castle-scene.js`).
