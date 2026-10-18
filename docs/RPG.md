# Version 0.3 — choisir, apprendre et personnaliser

## Parcours enfant

**Choisir ma mission → matière → notion → leçon à manipuler → cinq défis.** Les quatre matières sont accessibles depuis l’accueil. Quinze notions sont jouables ; le catalogue est explicitement partiel. Les notions déjà abordées restent accessibles pour s’entraîner. Une découverte nouvelle présentant un prérequis manquant affiche le nom de la destination et un chemin de préparation, sans remplacer silencieusement la notion choisie.

La multiplication est ajoutée : groupes égaux de deux à cinq objets, reconnaissance, écriture du produit et transfert dans un problème. La leçon fait ajouter un, deux puis trois paniers de deux pommes : addition répétée et écriture multiplicative sont affichées ensemble. Les autres leçons ont une représentation manipulable ou un exemple révélé : nom/déterminant/adjectif, dizaines, ajout/retrait, compréhension, saisons, vivant, vocabulaire anglais. Les manipulations de leçon ne sont ni notées ni comptabilisées comme une preuve autonome.

Une mission en cours reste reprenable. « Ranger cette mission » libère le choix d’une nouvelle séance et conserve les réponses déjà enregistrées ; cette mission inachevée ne distribue pas de récompense de fin.

## Royaume et apparence

Le château et l’avatar sont des SVG composés en JavaScript, avec perspective, faces ombrées et ombres portées. Aucun moteur 3D, téléchargement d’illustration, framework ou CDN. Les variantes restent nettes et fonctionnent sans réseau.

L’avatar représente une petite aventurière : quatre teints et quatre couleurs de cheveux gratuits, puis objets équipables par emplacement (tête, cape, tenue, main). Le château propose les toits, bannières, bosquet et fontaine. Les pièces déjà accessibles, le jardin, les compagnons et les cadeaux des missions précédentes sont conservés.

La boutique montre un **aperçu** sans modifier la progression. Acheter acquiert définitivement l’objet ; équiper l’applique. Un seul objet par emplacement, les autres restent possédés. Revenir à l’apparence initiale retire les équipements sans retirer les objets et sans dépenser de pièces.

## Économie

Trois ressources, rôles distincts :

- Étoiles : historique de participation, jamais dépensées.
- Graines : jardin existant.
- Pièces : dix par mission terminée, pour des accessoires et décorations à prix fixes.

Pas d’argent réel, d’achat externe, d’aléatoire payant, de temps limité ni de bonus scolaire acheté. Les objets coûtent de 8 à 30 pièces. Les acquisitions contrôlent possession et solde ; un second achat du même objet est refusé sans débit. Les récompenses utilisent toujours l’identifiant unique de mission. Le chapeau et la couronne précédemment obtenus comme cadeaux restent possédés et équipables sur le nouvel avatar.

## Sauvegarde v2

La clé principale est maintenant `academie.save.v2`. En l’absence de v2, `load()` lit l’ancienne clé `academie.save.v1`, valide et transforme une copie. Il ajoute :

- la compétence multiplication avec statut `unknown` ;
- `rpg.coins`, initialisé au nombre d’étoiles déjà gagnées ;
- `rpg.owned`, `rpg.look`, `rpg.equipped`, `rpg.castle` ;
- les équivalents du chapeau et de la couronne déjà possédés.

Les étoiles, graines, preuves, statuts, réponses en cours, parties de pont, inventaire et jardin sont préservés. Le document source v1 reste à sa clé initiale et une copie brute supplémentaire est conservée sous `academie.save.v2.backup-before-v2`. Le nouvel état est écrit dans la clé v2. Une v2 existante est prioritaire : un ancien onglet qui sauvegarde encore en v1 ne peut pas écraser les nouveaux achats. Les onglets de la nouvelle version réagissent aux changements de stockage.

Les imports v1 sont acceptés et migrés ; les imports v2 sont validés strictement, y compris solde, apparence, types d’objets et cohérence entre possession et équipement. Les versions futures inconnues restent refusées.

## Modules

- `rpg.js` : catalogue, transactions, apparence, dessins SVG du personnage, du château et des objets.
- `rpg-ui.js` : accueil, catalogue des matières/notions, dressing et atelier.
- `lessons.js` : univers des matières et activités de leçon.
- `rpg.css` : nouvelle direction visuelle, variantes tablette et mobile.

L’application reste en modules ES natifs ; Node sert les fichiers. Cette architecture est compatible avec un dépôt GitHub sans conversion de langage. Aucun dépôt distant n’a été créé ni aucune donnée enfant publiée.

## Validation

Tests de domaine : migration réelle avec sauvegarde ancienne et session, original préservé, achats sans double débit, soldes insuffisants, équipement possédé seulement, aperçu sans mutation, récompense unique, corruption rejetée et 1 000 multiplications vérifiées.

Trois parcours navigateur passent : anciennes missions, pont et RPG. Le parcours RPG vérifie matière/notion, prérequis, leçon des déterminants, cinq défis ciblés, leçon de multiplication, migration, boutique, château, recharge, persistance et hors ligne. Accueil, leçon, dressing et château sont vérifiés sans débordement dans neuf dimensions d’écran. Les essais sont sous Edge sur Windows, pas encore sur iPad/Android physiques.

## Graphisme et cohérence (0.7)

- `frontend/js/avatar-art.js` est la **source unique** des dessins du personnage : chaque objet à porter y est un fragment SVG ; l'icône de la boutique est un recadrage (`VIEW`) de ce même fragment, donc ce que l'on achète est exactement ce que l'on voit sur l'aventurière. Aucun identifiant SVG (plusieurs dessins cohabitent dans une page).
- 4 coiffures (longs, queue de cheval, tresses, chignon) en plus des 4 teints et 4 couleurs de cheveux.
- Nouveaux objets : couronne de fleurs, robe soleil, bottes de sentier, chaussons étoilés (nouvel emplacement « Chaussures »), lanterne lumineuse.
- Les compagnons (renard, dragon) et les tenues de mission (chapeau, couronne) sont dessinés en SVG partout : accueil, dressing, page « objets » ; l'état « équipé » vient de `rpg.equipped`.
- Boutique groupée par emplacement ; bouton « Retirer cet objet » (l'objet reste dans la collection).
- Compatibilité : `look.style` et `equipped.feet` sont facultatifs ; les anciennes sauvegardes restent valides, rien n'est perdu. Aucune ressource réseau nouvelle ; `avatar-art.js` est dans le cache hors ligne (`content-v10`).

## Lisibilité sur tablette

Sur écran tactile de 651 à 1400 px de large (tablettes), toute l'interface est agrandie de 25 % (`zoom: 1.25`, `app.css`) et l'en-tête passe sur deux lignes si besoin (`rpg.css`). Les téléphones et les ordinateurs ne changent pas. Vérifié sans défilement horizontal en 768×1024, 1024×768, 820×1180, 1180×820 et 1366×1024.
