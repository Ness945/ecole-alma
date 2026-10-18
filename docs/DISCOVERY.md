# « À la découverte de tes pouvoirs » — le bilan de départ (0.6, enrichi en 0.7)

Un petit voyage de découverte proposé depuis l’accueil, pour aider à choisir les premières missions. **Ce n’est ni un examen, ni un diagnostic scolaire ou clinique.** Il ne mesure pas le programme de CE1 : il propose quelques notions de l’application et en tire des pistes prudentes. Aucun alignement officiel avec les programmes n’est revendiqué ; les textes parlent de « notions de l’application ».

## Lancer le bilan

- **Alma** : bouton de l’accueil (carte « À la découverte de tes pouvoirs »), puis quatre explorations indépendantes — nombres et calcul, lecture, mots et phrases, repères et mesures. Chacune peut être faite plus tard, mise en pause (« ← Faire une pause ») ou reprise. Rien n’est bloqué dans le reste du jeu.
- **Parent** : Espace parent (protection 7 × 8 = 56) → « Ouvrir le bilan et le contexte scolaire ». On y règle d’abord le **contexte scolaire** avec les statuts existants (« À vérifier », « Déjà travaillé », « Pas encore abordé »). Un statut inconnu n’est pas une difficulté.

## Déroulement et règles d’arrêt

| Règle | Valeur |
|---|---|
| Défis maximum par notion | 3 |
| Fin d’une notion | 2 réussites autonomes indépendantes, 2 non-réussites consécutives, « Je ne l’ai pas appris », ou 3 défis |
| Limite par étape | 10 (nombres), 4 (lecture), 10 (mots), 8 (repères et mesures) |
| Pause conseillée | 3 non-réussites consécutives dans l’étape (« fatigue ») |
| Observations minimales avant une piste ferme | 2 |
| Premier défi, puis confirmation | un exemple accessible, puis une **autre famille** d’exercice (autre forme si possible) |
| Exemples déjà vus | les exemples du bilan en cours et des 2 derniers bilans sont évités ; si la banque est épuisée, l’exemple est marqué « déjà rencontré » |
| Nouveau bilan conseillé | au moins 3 jours après le précédent (simple avertissement) |

Pas de compte à rebours, pas de note affichée, et aucune correction n’est donnée pendant le bilan : le retour est un message chaleureux **choisi uniquement selon le numéro du défi** (cinq formulations différentes), donc identique pour une réussite et une erreur. Les formes de réponse : choix, saisie courte, manipulation de dizaines/unités, toucher un mot ou une forme, et **remettre dans l’ordre** (nombres, jours, mois).

Notions échantillonnées : nombres, addition, soustraction, problèmes, lecture, noms, déterminants, verbes, sujets, jours et mois, formes, heures, euros. **Verbes, sujets, heures et euros ne sont proposés que si le parent les a marqués « déjà travaillés »** (jours/mois et formes sont toujours proposés) et que la notion préalable a au moins une réussite autonome. Une notion « Pas encore abordée » n’est jamais proposée à l’enfant. Si une notion prérequise de la même exploration n’est pas confirmée ou « pas apprise », la suivante n’est pas proposée. Un prérequis d’une autre exploration pas encore faite ne bloque pas (on ne sait simplement pas) ; une fois faite et non confirmée, il bloque.

## Ce que l’on distingue

Chaque réponse est classée : **réussite autonome**, **réussite accompagnée** (exemple demandé, aide d’un adulte, voix), **réponse incorrecte**, **question passée** (« Je ne sais pas encore »), **notion déclarée non apprise** ; une notion jamais proposée est **non évaluée**.

- « Je ne l’ai pas appris » est une observation de l’enfant : elle ne modifie **jamais** le statut renseigné par le parent. En cas de désaccord, la piste est « À confirmer ».
- Lecture : la voix ne lit qu’une consigne générale, pas le texte observé. Si le texte est écouté ou lu par un adulte, la réussite est « accompagnée » et signalée « lecture non autonome ».
- Après un exemple montré, la réussite suivante sur la même notion n’est pas comptée comme preuve indépendante. Une variante déjà rencontrée non plus.
- Une réussite à choix multiple seule ne suffit jamais : il faut au moins une réponse écrite ou une manipulation réussie pour conclure « À approfondir ».

## Lire le rapport

Quatre pistes, toujours **provisoires** :

| Piste | Quand |
|---|---|
| À approfondir | ≥ 2 réussites autonomes indépendantes, dont une écrite ou manipulée, sans incorrect ni passage |
| À entraîner avec un exemple | des réussites accompagnées ou des difficultés sans réussite autonome |
| À explorer | « pas appris » sans contexte parent contraire, ou notion marquée « Pas encore abordée » |
| À confirmer | moins de 2 observations, résultats contradictoires, ou « pas appris » alors que le parent indique « travaillé » |

Le rapport de chaque notion indique le nombre et la nature des observations, la part d’autonomie et d’aide. Le bilan le plus récent de chaque notion fait foi ; les précédents restent consultables. Les recommandations ouvrent les leçons ou missions existantes en respectant les prérequis (comme la page de leçon) ; une mission n’est proposée que pour une notion « Déjà travaillée ». Pour Alma : une seule « prochaine aventure », jamais une notion « Pas encore abordée », présentée par un petit rituel (Luna « ouvre son carnet de voyage » puis annonce son choix ; sans animation si le système demande de réduire les animations).

**Évolution et missions.** Quand il existe un bilan précédent, chaque notion indique, à titre indicatif, le passage d’une piste à l’autre (ou « reste »). Elle indique aussi le nombre de réponses données en mission depuis le bilan dont les réussites autonomes : un simple constat qui complète le bilan sans le modifier ni toucher aux seuils de maîtrise.

**Imprimer et exporter.** Dans l’espace parent : « Imprimer ou enregistrer en PDF » (mise en page d’impression sans boutons, avec la mention « ni diagnostic ni évaluation officielle ») et « Exporter le bilan (fichier) », un JSON en lecture seule contenant le contexte scolaire et les observations (pas la sauvegarde entière ; il ne se réimporte pas).

**Le bilan ne modifie pas la maîtrise.** Il n’écrit ni dans `skills[].evidence`, ni dans les statuts, ni dans les succès `completed`, et les seuils « prêt / maîtrisé » du moteur ne changent pas. Les recommandations ne sont pas des preuves.

## Récompense

Une participation modeste, **indépendante des réponses** : 5 pièces et 1 graine, **une seule fois** (drapeau `rewardGranted`), accordée dès qu’au moins un défi a été traité. Un rechargement ou un nouveau bilan ne la redonnent pas.

## Reprise et nouveau bilan

L’état est enregistré après chaque action : étape, question choisie (variante figée), saisie ou manipulation en cours, aides demandées, réponses. Un rechargement ne change ni la question ni les compteurs. « Relancer un bilan » (parent, avec confirmation) crée un nouveau bilan : l’ancien, s’il est ouvert, est marqué « interrompu » et conservé. Au-delà de 8 bilans détaillés, les plus anciens sont résumés (compteurs par notion), jamais supprimés. Un enfant ne peut pas relancer seul un bilan.

## Données

`state.discovery` dans la sauvegarde v2 (`academie.save.v2`, champ optionnel) : `{ v, rewardGranted, rewardAt, current, runs[] }`. Les anciennes sauvegardes (v1 migrée, v2 sans bilan) restent valides sans modification. Un bilan enregistré avec la première version (trois explorations) reste valide : au chargement, la quatrième exploration est ajoutée. Le bilan le plus récent, s’il était terminé, est rouvert pour que l’exploration reste accessible à Alma (aucune nouvelle récompense) ; les plus anciens reçoivent une étape vide « terminée ». L’import valide strictement ce champ (variantes existantes, issues connues, un seul bilan ouvert, tailles bornées). Tout reste dans le navigateur : aucun serveur, aucun service payant, aucune donnée de l’enfant transmise.

## Fichiers

`frontend/js/discovery-bank.js` (banque : 41 familles d’exercices, 412 variantes — de 6 à 12 par famille —, vérifiées par les tests), `discovery-model.js` (modèle, règles, validation), `discovery.js` (moteur pur), `discovery-ui.js` (écrans), `frontend/css/discovery.css`. `app.js` ne fait que déléguer.

## Limites

Échantillon réduit de notions, banque de 6 à 12 variantes par famille (des répétitions peuvent apparaître après plusieurs bilans ; elles sont alors signalées « exemple déjà vu » et ne comptent pas comme preuve indépendante), pas de test sur vrai iPad ni lecteur d’écran, voix de synthèse variables selon l’appareil. Les phrases d’interprétation sont volontairement prudentes ; elles ne remplacent ni l’avis de l’enseignant ni un accompagnement professionnel.

## Relecture des questions

`docs/QUESTIONS.md` liste toutes les questions avec leurs choix et la réponse attendue, pour relecture par un adulte (ambiguïtés, niveau, formulation). Il est généré par `node tools/export-questions.mjs` à partir de la banque : à régénérer après toute modification de `discovery-bank.js`.

## Intégration continue

`.github/workflows/tests.yml` exécute `npm test` et `npm run check` à chaque pull request, puis les sept parcours navigateur dans Chromium. Ce workflow n’a pas pu être exécuté depuis l’environnement de développement : à vérifier lors de la première pull request.
