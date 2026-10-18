# Le pont des petits pouvoirs — version 0.2

Depuis la version 0.3, les sauvegardes v1 décrites ici sont migrées en v2 et le royaume est redessiné. La progression du pont est conservée ; voir [RPG.md](RPG.md).

Depuis l’accueil, choisir **L’aventure du pont** ou toucher le pont sur la carte. Trois parties successives de sept activités :

1. **Les paquets du castor** : rassembler dix cubes en une dizaine, construire un nombre, reconnaître et produire son écriture, transférer aux boîtes de clous.
2. **Les étiquettes de la forêt** : sélectionner un nom et le déposer dans sa maison, reconnaître des noms, les écrire sans choix, retrouver un nom sur un panneau.
3. **Les petits mots du passage** : sélectionner le déterminant, le distinguer du nom, le produire et le retrouver dans une phrase.

La première activité de chaque partie est toujours enregistrée avec aide, même si l’enfant n’appuie pas sur « indice ». Les deux reconnaissances et les deux productions suivantes utilisent des exemples distincts. Les premiers essais ne suffisent pas à déclarer une maîtrise.

Le travail terminé pose une partie du pont. En cas de difficulté sur les noms, l’enfant conserve ses deux parties construites et revient à une préparation sur les noms avant d’aborder les déterminants. L’objectif narratif récompense la participation ; l’accès à une notion dépend des prérequis. Les erreurs peuvent ajouter de nouveaux exemples, dans la limite déjà fixée à 16 activités.

Le pont terminé ouvre **la clairière des histoires** avec une histoire du renard et un accès au jardin. C’est un lieu permanent, disponible hors ligne après mise en cache. Il ne s’agit pas d’un nouveau compagnon à acheter ni d’une récompense scolaire de maîtrise.

## Données et compatibilité

Aucune réinitialisation ni migration destructive. Le format reste v1 : les anciennes sauvegardes et missions ordinaires restent valides. Les nouvelles missions ont un champ facultatif `session.adventure` (0, 1 ou 2), strictement validé avec leur compétence et leur identifiant. Le pont est calculé à partir des identifiants de missions terminées `bridge:<étape>:<uuid>` ; répéter une préparation ne double pas les parties construites.

La sélection d’un mot et le regroupement des cubes utilisent les champs existants `order` et `draft`, sauvegardés à chaque action. Une rotation ou un rechargement conserve la manipulation. Un clic de validation accompagné ne devient pas une preuve autonome après reprise.

## Architecture

`adventure.js` décrit les étapes, leur progression, leurs exercices et le dessin du pont. `adventure.css` porte leurs styles. Les quatre vues du royaume sont dérivées du SVG original par `node tools/generate-worlds.mjs`. Elles reflètent les trois parties construites. Le cache inclut les nouveaux modules et illustrations.

## Tests

Six tests supplémentaires : compatibilité ancienne session, déroulement des trois parties, prérequis bloquant les déterminants, reprise et récompense unique, import incohérent refusé et diversité minimale des preuves sur 100 graines.

`node tests/bridge-browser.mjs CHEMIN_DU_MODULE_PLAYWRIGHT` parcourt les trois parties dans un profil isolé : regroupement, reprise, sélection de mots après rotation/rechargement, récompenses, pont sur la carte et clairière hors ligne. Ces essais ne modifient pas la progression du navigateur de l’utilisateur.
