# « À la découverte de tes pouvoirs » — le bilan de départ (0.6)

Un petit voyage de découverte proposé depuis l’accueil, pour aider à choisir les premières missions. **Ce n’est ni un examen, ni un diagnostic scolaire ou clinique.** Il ne mesure pas le programme de CE1 : il propose quelques notions de l’application et en tire des pistes prudentes. Aucun alignement officiel avec les programmes n’est revendiqué ; les textes parlent de « notions de l’application ».

## Lancer le bilan

- **Alma** : bouton de l’accueil (carte « À la découverte de tes pouvoirs »), puis trois explorations indépendantes — nombres et calcul, lecture, mots et phrases. Chacune peut être faite plus tard, mise en pause (« ← Faire une pause ») ou reprise. Rien n’est bloqué dans le reste du jeu.
- **Parent** : Espace parent (protection 7 × 8 = 56) → « Ouvrir le bilan et le contexte scolaire ». On y règle d’abord le **contexte scolaire** avec les statuts existants (« À vérifier », « Déjà travaillé », « Pas encore abordé »). Un statut inconnu n’est pas une difficulté.

## Déroulement et règles d’arrêt

| Règle | Valeur |
|---|---|
| Défis maximum par notion | 3 |
| Fin d’une notion | 2 réussites autonomes indépendantes, 2 non-réussites consécutives, « Je ne l’ai pas appris », ou 3 défis |
| Limite par étape | 10 (nombres), 4 (lecture), 10 (mots) |
| Pause conseillée | 3 non-réussites consécutives dans l’étape (« fatigue ») |
| Observations minimales avant une piste ferme | 2 |
| Premier défi, puis confirmation | un exemple accessible, puis une **autre famille** d’exercice (autre forme si possible) |
| Exemples déjà vus | les exemples du bilan en cours et des 2 derniers bilans sont évités ; si la banque est épuisée, l’exemple est marqué « déjà rencontré » |
| Nouveau bilan conseillé | au moins 3 jours après le précédent (simple avertissement) |

Pas de compte à rebours, pas de note affichée, et aucune correction n’est donnée pendant le bilan : le retour est le même chaleureux message quelle que soit la réponse.

Notions échantillonnées : nombres, addition, soustraction, problèmes, lecture, noms, déterminants, verbes, sujets. **Verbes et sujets ne sont proposés que si le parent les a marqués « déjà travaillés »** et que la notion préalable a au moins une réussite autonome. Une notion « Pas encore abordée » n’est jamais proposée à l’enfant. Si une notion prérequise n’est pas confirmée ou « pas apprise », la suivante n’est pas proposée.

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

Le rapport de chaque notion indique le nombre et la nature des observations, la part d’autonomie et d’aide. Le bilan le plus récent de chaque notion fait foi ; les précédents restent consultables. Les recommandations ouvrent les leçons ou missions existantes en respectant les prérequis (comme la page de leçon) ; une mission n’est proposée que pour une notion « Déjà travaillée ». Pour Alma : une seule « prochaine aventure », jamais une notion « Pas encore abordée ».

**Le bilan ne modifie pas la maîtrise.** Il n’écrit ni dans `skills[].evidence`, ni dans les statuts, ni dans les succès `completed`, et les seuils « prêt / maîtrisé » du moteur ne changent pas. Les recommandations ne sont pas des preuves.

## Récompense

Une participation modeste, **indépendante des réponses** : 5 pièces et 1 graine, **une seule fois** (drapeau `rewardGranted`), accordée dès qu’au moins un défi a été traité. Un rechargement ou un nouveau bilan ne la redonnent pas.

## Reprise et nouveau bilan

L’état est enregistré après chaque action : étape, question choisie (variante figée), saisie ou manipulation en cours, aides demandées, réponses. Un rechargement ne change ni la question ni les compteurs. « Relancer un bilan » (parent, avec confirmation) crée un nouveau bilan : l’ancien, s’il est ouvert, est marqué « interrompu » et conservé. Au-delà de 8 bilans détaillés, les plus anciens sont résumés (compteurs par notion), jamais supprimés. Un enfant ne peut pas relancer seul un bilan.

## Données

`state.discovery` dans la sauvegarde v2 (`academie.save.v2`, champ optionnel) : `{ v, rewardGranted, rewardAt, current, runs[] }`. Les anciennes sauvegardes (v1 migrée, v2 sans bilan) restent valides sans modification. L’import valide strictement ce champ (variantes existantes, issues connues, un seul bilan ouvert, tailles bornées). Tout reste dans le navigateur : aucun serveur, aucun service payant, aucune donnée de l’enfant transmise.

## Fichiers

`frontend/js/discovery-bank.js` (banque : 27 familles d’exercices à ≥ 6 variantes, vérifiées par les tests), `discovery-model.js` (modèle, règles, validation), `discovery.js` (moteur pur), `discovery-ui.js` (écrans), `frontend/css/discovery.css`. `app.js` ne fait que déléguer.

## Limites

Échantillon réduit de notions, banque de 6 à 8 variantes par famille (des répétitions peuvent apparaître après plusieurs bilans), pas de test sur vrai iPad ni lecteur d’écran, voix de synthèse variables selon l’appareil. Les phrases d’interprétation sont volontairement prudentes ; elles ne remplacent ni l’avis de l’enseignant ni un accompagnement professionnel.
