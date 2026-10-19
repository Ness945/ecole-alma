# L’Académie des Aventuriers

Une première version jouable d’un royaume éducatif pour le CE1. Projet créé de zéro le 18 octobre 2026 : il n’existait ni application ni sauvegarde à migrer.

## Lancer sous Windows

1. Installer Node.js 20 ou une version plus récente si nécessaire.
2. Double-cliquer sur **Lancer-Academie.bat**.
3. Ouvrir **http://localhost:4173**. Garder la fenêtre du serveur ouverte.

Aucune installation npm, aucun compte et aucune clé API nécessaires. Alternative : `npm start`.

## Première visite

Choisir **Choisir ma mission**, une matière puis une notion. Luna présente la notion avant les premiers essais. Ou ouvrir **Espace parent** (réponse à la protection anti-clic : 56) et indiquer les notions déjà travaillées en classe. Toutes les notions commencent à « À vérifier » : aucune faiblesse n’est supposée.

Une mission terminée apporte des étoiles de participation, deux graines, dix pièces et un objet inédit tant que des objets restent à découvrir. Dans **Mon jardin**, choisir une plante puis une parcelle. Dans **Mon aventurière**, essayer, acheter et équiper les accessoires avec les pièces gagnées. Dans **Mon château**, personnaliser les toits et les décorations. Une pause ne retire rien.

## Fonctionnalités présentes

**Nouveau — le Grand Livre des Lucioles (0.8) :** une histoire de 100 chapitres en 5 livres, chapitres au choix (même pour une notion jamais vue) et masqués une fois terminés, entraînement « encore des défis » après une leçon, jardin extensible jusqu'à 24 parcelles avec plantes à faire fleurir, 5 compagnons à adopter et nouveaux décors de château. Voir [le détail](docs/STORY.md).

**Nouveau — « À la découverte de tes pouvoirs » (0.6, enrichi en 0.7) :** un bilan de départ ludique en quatre petites explorations (nombres et calcul, lecture, mots et phrases, repères et mesures), avec aides, « Je ne sais pas encore » / « Je ne l’ai pas appris », reprise exacte, récompense de participation unique et rapport parent prudent avec recommandations vers les leçons et missions, impression/export et évolution entre deux bilans. Ce n’est pas un diagnostic et il ne modifie pas la maîtrise. Voir [le fonctionnement du bilan](docs/DISCOVERY.md).

**Nouveau — le marché du royaume (0.5) :** une quête en quatre étapes avec lecture de commandes, paniers à remplir, pièces à composer et horloge à régler. Difficulté adaptée aux essais, étal personnalisable, sac à gagner et suivi parent enrichi. Voir [le fonctionnement du marché](docs/MARKET.md).

**Nouveau — un petit RPG :** choix matière/notion, leçons interactives dont la multiplication, aventurière dessinée avec accessoires et château en perspective personnalisable. Les achats utilisent uniquement les pièces gagnées en mission. Voir [les nouveautés et la migration](docs/RPG.md).

**L’aventure du pont :** trois séquences jouables pour manipuler les dizaines, reconnaître les noms et trouver les déterminants. Le pont se reconstruit sur la carte et ouvre une clairière. Les sauvegardes précédentes sont conservées. Voir [le détail de l’aventure](docs/ADVENTURE.md).

- Royaume en perspective et avatar en SVG local, Luna, aventure du pont et quatre pièces accessibles progressivement.
- Missions de 12 défis, mini-missions/découvertes de 5 défis, prolongées au besoin dans une limite de 16 défis ; durée variable, aucun chronomètre imposé.
- 30 notions avec leçons : ajout des centaines, comparaisons, compléments, doubles/moitiés, monnaie, heures/demi-heures, formes, verbe, sujet, présent des verbes réguliers en -er, être, avoir, jours/mois et nombres anglais.
- Compréhension : 24 courts textes ; problèmes : six modèles à valeurs variables ; phrases : 12 exemples. Les nouvelles missions évitent les 20 derniers exemples de la notion lorsque la banque le permet. Voir [le contenu et ses limites](docs/CONTENT.md).
- Choix, saisie courte, manipulation des dizaines/unités et reconstruction de phrases au toucher ou au clavier.
- Consignes vocales, indices, « Je ne sais pas », confiance facultative, corrections expliquées et proposition de pause.
- Statut scolaire indépendant des preuves ; reconnaissance, manipulation, production, transfert et mémoire séparés.
- Prérequis, priorité aux rappels anciens, découverte sans mélange précoce et intervalles de révision progressifs.
- Jardin à huit parcelles, garde-robe et compagnons simples, boutique en pièces de jeu, sans paiement réel ni mécanique punitive.
- Sauvegarde après chaque action, reprise de mission et de saisie, export/import JSON validé.
- Ressources locales mises en cache par un service worker ; manifest PWA.

## Tablette et hors ligne

Sur le PC, le service worker fonctionne à `localhost`. Sur une tablette du même réseau, le serveur est accessible à `http://ADRESSE_DU_PC:4173` si le pare-feu le permet. **Une adresse réseau en HTTP ne permet généralement pas l’installation PWA ni le service worker** : utiliser un hébergement HTTPS pour le mode installé et hors ligne sur tablette. Le serveur n’a aucune route d’accès aux fichiers en dehors de `frontend/`.

Après un premier chargement réussi et l’activation du service worker, les missions locales fonctionnent sans réseau. Les voix de synthèse dépendent du navigateur et des voix installées ; leur fonctionnement hors ligne n’est pas garanti. Un mode aide adulte est prévu pour les mots anglais, avec marquage « avec aide ».

Les sauvegardes sont propres au navigateur, au profil et à l’adresse complète, port inclus. Elles ne sont pas synchronisées. Exporter régulièrement, notamment avant un changement d’appareil ou d’adresse. L’import valide le fichier avant remplacement et télécharge une copie de la progression actuelle. Ne pas vider les données du navigateur sans export.

## Vérifier

```sh
npm test
npm run check
```

Le test navigateur facultatif nécessite Playwright et Microsoft Edge : démarrer le serveur, puis `node tests/browser.mjs CHEMIN_DU_MODULE_PLAYWRIGHT` (et de même `tests/discovery-browser.mjs` pour le bilan de départ, `tests/story-browser.mjs` pour le Grand Livre). Avec un autre Chromium : `PLAYWRIGHT_EXECUTABLE=/chemin/chrome`. Aucune dépendance Playwright n’est nécessaire pour utiliser l’application.

## Périmètre de cette version

C’est un MVP fonctionnel, **pas encore la totalité du programme CE1**. Les nombres restent petits ; les fractions, mesures, conjugaisons, dictées, vraie production libre, boss, difficulté fine et variantes de contenu restent à développer. Les chambres et les chapitres offrent une première progression, pas encore huit campagnes distinctes. L’avatar et le château disposent de couches graphiques personnalisables ; la collection continuera à s’enrichir.

Le moteur conserve une définition prudente de la maîtrise. Une compétence dont le contenu ne couvre pas encore toutes les dimensions ne reçoit pas artificiellement le statut « maîtrisée ». Les dates de rappel guident l’ordre des séances, sans obligation de revenir à une date donnée. Aucun diagnostic médical ou psychologique.

L’IA n’est pas connectée. `.env.example` réserve uniquement l’emplacement d’une future configuration serveur. Aucune clé ni donnée personnelle ne part sur Internet.

Voir [l’architecture et les règles](docs/ARCHITECTURE.md), [la feuille de route](docs/ROADMAP.md), [le contenu pédagogique](docs/CURRICULUM.md) et [les vérifications](docs/TESTS.md).
