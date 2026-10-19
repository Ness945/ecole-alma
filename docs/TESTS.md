# Vérification de la version initiale

## Mise à jour : bilan de départ enrichi (0.7)

`tests/discovery.test.js` passe à 43 tests (81 avec les existants) : forme « ordre » (le mélange n'est jamais la bonne réponse), exploration « repères et mesures » (jours/mois et formes toujours proposés, heure et euros conditionnés au parent), prérequis entre explorations, **sauvegarde de la première version** (trois explorations : valide, complétée, bilan récent rouvert, aucune nouvelle récompense, bilan résumé complété), évolution entre deux bilans et réponses en mission depuis le bilan, retours variés identiques pour réussite et erreur, exemples jamais identiques à une question. `tests/discovery-browser.mjs` couvre aussi le rangement (réussi, erroné, « recommencer »), l'impression (boutons masqués), l'export du bilan, l'évolution après un second bilan, le rituel de fin, la reprise d'une sauvegarde à trois explorations, et les quatre explorations aux trois formats d'écran. Les six autres parcours navigateur passent toujours. Le workflow GitHub Actions n'a pas été exécuté localement.

## Mise à jour : bilan de départ (0.6)

`tests/discovery.test.js` (37 tests, 75 au total avec les existants) : banque (≥ 3 familles par notion, ≥ 6 variantes, bonne réponse parmi des options distinctes, calculs recomputés, exemples sans fuite, empreintes uniques, texte de lecture jamais lu par la voix), tolérance de saisie, règles d’adaptation et d’arrêt (maximum par notion, séries d’échecs, fatigue, « non appris », verbes/sujets conditionnés au parent, notion « pas abordée » jamais proposée, exemples récents évités), distinction autonomie/aide/passage/« non appris », aucune conclusion après une seule réussite ni sur des QCM seuls, absence d’écriture dans les preuves de maîtrise, récompense unique (rechargement, nouveau bilan), idempotence des réponses, reprise exacte après aller-retour JSON, anciennes sauvegardes, nouveau bilan sans perte et compactage, recommandations respectant les prérequis, validation des imports (13 mutations refusées).

`tests/discovery-browser.mjs` : parcours de réussite complet avec récompense unique et rechargement, parcours avec aides/erreurs/passages, rapport parent (porte, statut modifiable, relance conservant l’historique), lancement d’une mission recommandée, interruption + rechargement + reprise de la même question, consigne vocale de lecture, trois formats (390×844, 768×1024, 1024×768 : pas de débordement ni de cible tactile minuscule) et hors ligne. `tests/pages-browser.mjs` ouvre aussi le bilan hors ligne sous `/ecole-alma/`. Les six parcours précédents passent toujours (Chromium via `PLAYWRIGHT_EXECUTABLE`, Edge par défaut).

## Mise à jour : marché du royaume (0.5)

38 tests unitaires. `tests/market-browser.mjs` couvre les quatre étapes, une erreur suivie d’un nouvel exemple, la reprise des manipulations, les formats 390/768/1024, les récompenses, l’équipement, la décoration et le hors ligne. Il accepte une URL en troisième argument pour vérifier la publication dans un profil isolé. Les cinq parcours précédents sont également exécutés avant publication.

## Mise à jour : contenu étendu (0.4)

33 tests automatiques passent, dont 30 000 exercices générés, calculs supplémentaires vérifiés à partir des consignes, conjugaisons, limites du calendrier, formats horaires, sélection sans répétition récente et enrichissement des sauvegardes v2 sans mutation de la source. Les quatre parcours navigateur passent dans Edge : classique, pont, RPG et `content-browser.mjs`. Ce dernier ouvre chacune des 15 nouvelles leçons, valide une réponse, vérifie le format mobile et la reprise d’une saisie sur l’horloge. Les profils de test sont isolés des sauvegardes utilisateur.

## Mise à jour : petit RPG (0.3)

28 tests automatiques, dont migration v1 → v2 avec copie de secours et protection contre un ancien onglet, achats sans double débit, équipement, aperçu sans mutation, corruption rejetée et 1 000 multiplications. Le test génératif général couvre désormais 15 000 exercices.

`tests/rpg-browser.mjs` vérifie les matières et sous-thèmes, une leçon interactive des déterminants, une mission ciblée, la leçon des paniers multiplicatifs, le dressing, les achats, l’atelier du château et la reprise hors ligne. L’accueil, la leçon, le dressing et l’atelier sont vérifiés dans les neuf formats existants. Les trois parcours (classique, pont, RPG) passent dans Edge avec profils séparés. Les tests n’utilisent pas les données du navigateur de l’enfant.

## Mise à jour : aventure du pont (0.2)

21 tests automatiques réussis. Le nouveau parcours navigateur vérifie les trois étapes complètes, le regroupement de cubes, le choix et le dépôt de mots, la reprise après rechargement, la rotation, les récompenses et la clairière hors ligne. Le parcours des anciennes missions reste également passant. La nouvelle manipulation ne déborde pas horizontalement sur les huit formats tablette et le petit écran 390×844. Les sauvegardes v1 et une ancienne mission en cours sont couvertes par un test de compatibilité.

## Automatique

`npm test` : statuts exclus des séances, prérequis, distinction aide/autonomie, calendrier des rappels, mémoire différée, impossibilité d’acquérir une compétence par QCM seuls, attribution unique des récompenses, solde et occupation du jardin, aller-retour JSON, imports invalides, graphe acyclique, ressources hors ligne présentes.

Tests génératifs : 10 000 groupes nominaux avec contrôle genre/nombre ; 14 000 exercices avec bonne réponse reconnue, distracteurs distincts et calculs vérifiés.

`npm run check` : syntaxe des modules principaux.

`tests/browser.mjs` : Edge avec Playwright, profil isolé ; découverte → réponse manipulée → rechargement → reprise → fin de mission → rechargement sans double récompense → plantation → accès parent → modification de statut et profil → rechargement → navigation et exercice hors ligne. Les erreurs JavaScript de page font échouer le parcours.

Formats vérifiés pour le débordement horizontal de l’accueil et de l’exercice de manipulation : 768×1024, 800×1280, 834×1194, 1024×1366 et les quatre paysages correspondants. L’accueil est également vérifié à 390×844. Capture de l’accueil conservée dans `test-results/royaume.png` (non versionnée). Le bouton « Je ne sais pas » est aussi vérifié dans le parcours hors ligne.

## Limites

Ces essais sont effectués dans Edge sur Windows. Safari/iPad, Android réel, lecteurs d’écran, clavier virtuel réel, synthèse vocale, installation sur écran d’accueil, impressions et mises à jour entre plusieurs versions ne sont pas encore vérifiés. La présence des ressources dans le cache et un vrai rechargement hors ligne sont vérifiés ; cela ne garantit pas les voix hors ligne.

La correction du contenu doit aussi être relue par un adulte avant un usage autonome durable. Les tests automatiques vérifient des invariants, pas la qualité d’une séquence d’enseignement complète.

## Grand Livre, jardin, compagnons (0.8)

`tests/story.test.js` (13 tests, 99 au total) : 100 chapitres en 5 livres de 20, tous liés à un petit pouvoir existant, titres uniques, chapitres 1 à 3 identiques aux trois parties du pont, défis valides à plusieurs niveaux pour chaque chapitre, ouverture libre sans prérequis (multiplication jamais vue), récompense et validation uniques, chapitres terminés absents des listes, suite proposée, livre terminé, sauvegarde de mission de chapitre incohérente refusée, jardin 8→24 parcelles payé en pièces, plantes rares, niveaux de plantes, sauvegardes antérieures valides, adoption de compagnons sans doublon ni cadeau automatique.
`tests/story-browser.mjs` : parcours réel (chapitre choisi sans prérequis, reprise après rechargement, fin de chapitre, chapitre masqué, entraînement « encore des défis », jardin 8→24, amélioration d'une plante, adoption d'un compagnon, décor de château, quatre formats sans débordement, hors ligne). Les sept parcours précédents passent toujours.
`tests/room.test.js` et `tests/room-browser.mjs` : chambre (48 objets, icône identique à la scène, achat/équipement/aperçu, anciennes sauvegardes, quatre formats sans débordement, hors ligne).
`tests/tablet-browser.mjs` : émulation tactile type Galaxy Tab S5e (800×1280 et 1280×800) : neuf écrans sans débordement, cartes de matières de hauteur normale.
`tests/extras.test.js` et `tests/extras-browser.mjs` : rappel de Luna, défi du jour unique, cadeau tous les 5 missions, album, bilan de la semaine, rappel de sauvegarde, réglages validés, plantes dessinées, chambre de nuit ; parcours réel (mission courte, texte plus grand, export, aucun débordement).
