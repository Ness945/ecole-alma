# Atelier des mots — v0.20

Accessible depuis l’accueil et le choix des missions de français. Quatre jeux : mots à trous (12), infinitifs (12, dont verbes en -er, -ir et irréguliers), adjectifs qualificatifs (12, avant ou après le nom, au singulier ou au pluriel), mots fléchés (trois grilles de trois mots avec définitions dans les cases et croisements réels).

Les exercices se répartissent en trois séries de quatre mots par thème. Une courte leçon reste accessible pendant le jeu. Pour les mots à trous, l’enfant écrit le mot entier. Pour l’adjectif, il recopie la forme présente dans la phrase. La casse est tolérée, mais les accents font partie de la réponse. Dans les grilles uniquement, les accents sont retirés et les lettres mises en capitales.

Une définition sélectionne le mot ; l’enfant le saisit dans le champ et les lettres apparaissent dans la grille. Les lettres d’un mot validé ne peuvent pas être effacées par un autre mot. Un indice donne une lettre et marque comme aidés les mots qui partagent cette case. Une correction suivie d’une nouvelle tentative n’est pas une réussite autonome. Le bilan de fin distingue ces essais.

La progression du jeu en cours est enregistrée dans `wordGame`, donnée facultative validée à l’import. Les anciennes sauvegardes restent compatibles. Quitter l’écran ne perd rien ; commencer un autre jeu avant la fin demande confirmation. Les observations du jeu courant restent dans l’atelier et ne modifient pas les preuves de maîtrise scolaire. Les résultats détaillés sont remplacés au démarrage d’une nouvelle série ; les séries terminées restent marquées.

Chaque série ou grille rapporte une seule fois les récompenses de mission (10 pièces, deux graines et autant d’étoiles que de mots). Les identifiants `words:mode:numero` empêchent les doubles récompenses lors d’une reprise ou d’une nouvelle partie.

Tests : contenu, croisements, limites de grille, accents, reprise, verrouillage, validation, récompenses. Le parcours `tests/word-workshop-browser.mjs` joue les 36 exercices et les trois grilles, puis rejoue une grille hors ligne sans nouvelle récompense. Profils de navigateur isolés, largeur mobile de 390 pixels. Une URL de site peut être fournie en troisième argument pour tester la publication.

## Grilles renouvelées — 0.20.1

503 grilles : les trois originales, conservées pour les sauvegardes, et 500 combinaisons déterministes de trois mots différents, issues d’un dictionnaire préparé. Chaque combinaison de mots est unique ; les mêmes mots peuvent revenir dans différentes grilles. Ce n’est pas une génération infinie. Six grilles non terminées sont proposées, les anciennes sont rangées dans un volet fermé. Le bouton « Une nouvelle grille » enchaîne sur une grille restante. Les identifiants et les récompenses restent stables hors ligne. Tous les croisements et toutes les solutions sont testés automatiquement.
