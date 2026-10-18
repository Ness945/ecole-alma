# Architecture et décisions

## Organisation

Application statique en modules ES natifs, sans framework ni build. Node fournit seulement les fichiers autorisés ; les règles fonctionnent intégralement dans le navigateur.

| Fichier | Rôle |
| --- | --- |
| `frontend/js/content.js` | Compétences, prérequis, leçons, chapitres, catalogue d’objets |
| `frontend/js/exercises.js` | Génération déterministe, métadonnées grammaticales, correction et premiers diagnostics |
| `frontend/js/core.js` | État initial, preuves, planification, prérequis, récompenses, jardin, validation/persistance |
| `frontend/js/rpg.js`, `rpg-ui.js`, `lessons.js` | Transactions, dessins composables, écrans RPG, catalogue et activités de leçon |
| `frontend/js/app.js` | Navigation et écrans, événements tactiles/clavier, lecture vocale, import/export |
| `frontend/assets/` | Illustration originale SVG et icône, sans dépendance distante |
| `frontend/sw.js` | Cache des ressources pour le mode hors ligne |
| `server/server.js` | Serveur statique à racine limitée ; aucune exécution d’entrée utilisateur |
| `tests/` | Tests déterministes, génératifs et parcours navigateur |

Les modules de domaine sont importables dans Node sans DOM : la correction et la sauvegarde se testent indépendamment de l’interface. À mesure que les écrans s’étoffent, extraire les vues et contrôleurs de `app.js` en modules distincts ; éviter une abstraction prématurée.

## Progression

`status` vaut `unknown`, `not_seen` ou `seen`. Les séances de consolidation ne prennent que `seen`. Une découverte est un choix explicite ; elle vérifie les prérequis et propose le premier prérequis manquant. Le mini-bilan parent est volontaire et marque la notion « déjà travaillée » afin d’observer les résultats. Il ne certifie pas une maîtrise.

Chaque preuve conserve dimension, réussite, aide, abandon volontaire, date, confiance, empreinte de question et catégorie d’erreur. Une réponse aidée n’est pas une production autonome. Deux réussites distinctes récentes en reconnaissance et production autorisent la suite du graphe. La maîtrise complète exige au moins deux exemples distincts dans chacune des cinq dimensions et des réussites réparties sur trois jours. Ces seuils sont une règle initiale prudente, pas une mesure psychométrique validée.

Un rappel à plus de trois jours, produit sans aide sur un autre exemple, ajoute une preuve mémoire. Les intervalles sont 1, 3, 7, 14 puis 30 jours ; plusieurs réponses dans la même séance ne font pas artificiellement sauter ces intervalles. Une erreur ou aide ramène le prochain rappel à un jour ; « Je ne sais pas » conserve l’intervalle et prépare un nouvel essai dans la séance. Les questions ratées reviennent en fin de file dans la limite de 16 défis. Si une compétence est au tout début de la découverte, elle est travaillée seule avant mélange.

## Récompenses

Trois ressources : étoiles de participation, graines pour le jardin et pièces pour la boutique. Une mission terminée rapporte dix pièces. Pas de lien entre étoiles et note scolaire. Une mission validée est identifiée par UUID ; son identifiant figure dans `completed` pour empêcher les doubles attributions. Le cadeau est le premier objet non possédé dans une liste déterministe : aucun hasard de casino. Une plantation vérifie la parcelle libre et le solde avant toute mutation. Les plantes ne meurent pas.

## Sauvegarde v2

Clé locale : `academie.save.v2` ; reprise de `academie.save.v1` si la v2 n’existe pas. Champs : `version`, `name`, `settings`, `skills`, `stars`, `seeds`, `inventory`, `garden`, `outfit`, `pet`, `completed`, `history`, `session` et `rpg` (pièces, apparence, objets possédés et équipés).

La session conserve une graine de génération, la file et l’index, la saisie, les mots choisis, l’aide, le retour et l’état de validation. Une rotation n’affecte pas l’état. Une réponse validée ne peut être enregistrée deux fois dans la même étape. Les données sont sérialisées en une écriture localStorage ; les erreurs de stockage sont signalées. Les textes importés sont échappés avant insertion HTML.

Au démarrage, une sauvegarde illisible bloque l’application au lieu d’être écrasée ; son export brut reste disponible. Les imports sont limités à 2 Mo et validés avant mutation. Les versions inconnues sont refusées. La migration v1 → v2 est implémentée sur une copie, testée avec une mission en cours et décrite dans [RPG.md](RPG.md). L’ancienne clé reste intacte, une copie brute de secours est conservée et la v2 utilise sa propre clé pour éviter un écrasement par un ancien onglet.

L’historique est limité aux 1 000 dernières réponses et 200 preuves par compétence. Les objets et missions terminées persistent, mais un historique scolaire pluriannuel nécessitera des agrégats durables et probablement IndexedDB.

## Audio, accessibilité et confidentialité

Boutons natifs, focus visible, textes associés aux icônes, commandes sans glisser obligatoire, zones tactiles de 54 px ou plus en général, animations désactivables et respect de `prefers-reduced-motion`. Les consignes mathématiques ne prononcent pas de réponse calculée ; la lecture de compréhension peut être écoutée car elle mesure ici la compréhension, pas la fluence autonome. Les voix anglaises utilisent `en-GB`. Les jeux de données et polices sont locaux.

L’espace parent est protégé contre le clic accidentel, sans prétendre être une authentification. Le serveur se lie au réseau local pour permettre un essai tablette ; aucune API de données ni accès arbitraire au disque. Ne pas l’exposer directement sur Internet comme service de production.

## IA future

Pas d’appel IA dans cette version. Pour l’intégrer : endpoint serveur dédié, clé uniquement dans l’environnement, consentement parent, budget et délais plafonnés, schéma strict, validation mathématique/grammaticale puis fallback local. Ne jamais transmettre la sauvegarde entière ni laisser l’IA modifier récompenses, statuts ou prérequis. Le frontend ne doit jamais recevoir de clé.
