# Contenu étendu — version 0.4

30 notions réparties en quatre matières. Chaque nouvel ajout possède une leçon, un exemple à révéler et des exercices : centaines, comparaisons, compléments à 10/20, doubles, moitiés, monnaie, heures/demi-heures, formes ; verbe, sujet, présent régulier en -er, être, avoir ; jours/mois ; nombres anglais de 1 à 10.

La compréhension propose 24 textes courts avec questions factuelles, de cause ou de chronologie. Les problèmes disposent de six modèles à valeurs variables. Douze phrases servent à la reconstruction et au repérage du sujet/verbe. Le générateur de groupes nominaux comprend 21 noms réguliers et conserve l’accord de l’adjectif « petit ».

La sélection consulte les 20 derniers exemples de la notion et cherche une variante différente. Si une petite banque est épuisée, les exemples peuvent revenir. La graine choisie reste sauvegardée pour conserver la question et la saisie au rechargement.

Les sauvegardes v2 sont enrichies avec les nouvelles notions au statut « À vérifier ». Les résultats, pièces et équipements restent conservés. Une mission classique déjà commencée utilise le générateur précédent jusqu’à sa fin ; les nouvelles missions utilisent le contenu enrichi. Aucun transfert de données ni compte requis.

Cette version enrichit le jeu sans couvrir tout le programme CE1 : géométrie limitée aux formes élémentaires, monnaie en euros entiers, lecture de l’heure entière/demi-heure, conjugaisons limitées au présent proposé. La reconnaissance orale anglaise dépend des voix système ; elle ne mesure pas la prononciation. Les leçons restent courtes et ne remplacent pas les explications de classe.

## Saisons et calendrier (v0.16)
Constat sur une vraie sauvegarde : l'ordre était souvent connu, mais les réponses à écrire étaient marquées fausses pour l'orthographe (« Ivér », « Vandredi »), et les saisons ne comptaient que 4 questions répétées.
- Saisons : 16 variantes (après, avant, entre, repères dans la nature) ; leçon avec le cycle illustré et l'écriture par syllabes.
- Calendrier : mois avant/après, indice limité aux mois voisins.
- Réponses écrites : une faute proche est acceptée (`nearCheck`, distance d'édition bornée, jamais si un autre mot proposé est plus proche, jamais en choix multiple) ; la bonne écriture est affichée.

## Programme CE1 élargi (v0.18.0)

58 petits pouvoirs ajoutés (88 au total), écrits à partir des attendus officiels du cycle 2 (Éduscol). Les textes sont originaux ; aucun contenu d'un site tiers n'est copié.

- Mathématiques (18) : `curriculum-maths.js` — comptage par bonds, voisins, ordre, pair/impair, calcul mental ±10/100, addition avec retenue, soustraction avec échange, tables, partage, problèmes en deux étapes, longueurs, masses et contenances, durées, lignes et angles droits, symétrie, quadrillage, solides, pictogrammes.
- Français (15) : `curriculum-french.js` — types de phrases, pronoms, féminin, pluriel, homophones, synonymes, contraires, familles de mots, syllabes, sons, noms propres, futur, passé composé, verbes irréguliers, alphabet.
- Questionner le monde (15), Vivre ensemble / EMC (5) et Anglais (5) : `curriculum-world.js`.
- Définitions et leçons illustrées (visuel, titre, explication en deux temps) : `curriculum-skills.js`.
- Grand Livre : livres 6 à 8 (60 chapitres, `story-more.js`), soit 160 chapitres.

Les banques de questions (format `question|bonne réponse|faux 1|faux 2|explication`) contiennent 9 à 12 questions par thème ; les thèmes calculés (maths, conjugaison, alphabet) en génèrent beaucoup plus.
