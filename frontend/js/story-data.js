// Le Grand Livre des Lucioles : 5 livres de 20 chapitres.
// Chaque chapitre est lié à un petit pouvoir (compétence) ; l'enfant peut ouvrir
// n'importe quel chapitre non terminé, le livre propose seulement la suite logique.
// Les chapitres 1 à 3 sont les trois parties du pont (adventure.js).
export const books = [
  {
    id: 1,
    title: "La forêt des lucioles",
    icon: "🌲",
    intro:
      "Le Grand Livre des Lucioles s’est ouvert dans la tempête : ses pages se sont envolées aux quatre coins du royaume. Luna et toi commencez par la forêt, où Brindille le castor et Safran le renard t’attendent.",
    end: "La première page du Grand Livre brille dans tes mains. Les lucioles dessinent un chemin vers le village des marchands.",
  },
  {
    id: 2,
    title: "Le village des marchands",
    icon: "🏘️",
    intro:
      "Épine le hérisson tient la boutique du village. Ici, on compte les pièces, on lit l’heure et on réfléchit aux histoires de la place du marché.",
    end: "Le sceau du village est à toi ! Au loin, la montagne des étoiles t’appelle.",
  },
  {
    id: 3,
    title: "La montagne des étoiles",
    icon: "🏔️",
    intro:
      "Braise, le petit dragon, garde la montagne. On y grimpe avec les grands nombres, les doubles, les moitiés et les paniers en groupes égaux.",
    end: "Tout en haut, la troisième page se pose dans ta main. Une bibliothèque flotte dans le ciel, juste en dessous.",
  },
  {
    id: 4,
    title: "La bibliothèque flottante",
    icon: "📚",
    intro:
      "La Chouette Plume veille sur des milliers de livres qui flottent dans les airs. Ici, les mots bougent, agissent et s’accordent entre eux.",
    end: "Plume ferme la bibliothèque avec un sourire : la quatrième page est retrouvée. Il ne reste qu’une île à rejoindre.",
  },
  {
    id: 5,
    title: "L’île des saisons",
    icon: "🏝️",
    intro:
      "La tortue Mousse t’accueille sur l’île où les saisons se suivent. On y apprend le vivant, le temps qui passe et quelques mots d’anglais.",
    end: "Le Grand Livre des Lucioles est complet ! Sa dernière page raconte ton voyage : tu y es l’héroïne.",
  },
];
// [compétence, titre, texte]
const raw = [
  // Livre 1 — La forêt des lucioles (1-20)
  [
    "number",
    "Les paquets du castor",
    "Le castor prépare les clous du pont. Pour les compter facilement, il fait des paquets de dix.",
  ],
  [
    "noun",
    "Les étiquettes de la forêt",
    "Le vent a mélangé les étiquettes du castor. Retrouvons les mots qui nomment les choses et les animaux.",
  ],
  [
    "determiner",
    "Les petits mots du passage",
    "Les noms ont retrouvé leur place. Il leur manque maintenant les petits mots qui les accompagnent pour terminer le panneau du pont.",
  ],
  [
    "reading",
    "La lettre du renard",
    "Un papier plié attend de l’autre côté du pont. C’est une lettre de Safran le renard : il faut la lire pour savoir où se cache la deuxième page du Grand Livre.",
  ],
  [
    "addition",
    "Les glands de Brindille",
    "Le castor a rangé ses glands dans deux paniers. Pour savoir combien il en a pour l’hiver, Luna les réunit.",
  ],
  [
    "sentence",
    "La phrase du panneau",
    "Le vent a mélangé les mots du panneau de la clairière. Remets-les dans l’ordre pour que les promeneurs comprennent.",
  ],
  [
    "living",
    "Qui est vivant dans la clairière ?",
    "La tortue Mousse veut savoir ce qui grandit, mange et respire autour de la mare. Trie le vivant et le non-vivant avec Luna.",
  ],
  [
    "number",
    "Les lucioles du soir",
    "Des lucioles s’allument par groupes dans les arbres. Compte les dizaines et les unités pour savoir combien éclairent la forêt.",
  ],
  [
    "colors",
    "L’arc-en-ciel des feuilles",
    "Chaque feuille tombée a une couleur. En anglais, Luna les nomme : red, blue, green… et toi ?",
  ],
  [
    "noun",
    "Le coffre des noms",
    "Dans le coffre de Brindille, chaque objet a un nom. Retrouve celui qui désigne une chose, un animal ou une personne.",
  ],
  [
    "addition",
    "Le goûter des écureuils",
    "Trois écureuils arrivent, puis deux autres. Combien de noisettes faut-il pour que personne ne reste le ventre vide ?",
  ],
  [
    "english_numbers",
    "Compter avec Safran",
    "Safran aime compter en anglais : one, two, three… Les trois chemins de la forêt portent chacun un nombre.",
  ],
  [
    "determiner",
    "Les petits mots perdus",
    "Un, une, le, la… Les petits mots se sont cachés dans les buissons. Remets-les devant leurs noms.",
  ],
  [
    "reading",
    "Le journal de la mare",
    "Un petit journal raconte la vie des grenouilles. Lis-le, puis réponds aux questions de Mousse.",
  ],
  [
    "shapes",
    "Le château de brindilles",
    "Brindille construit un château de branches avec des carrés, des triangles et des cercles. Reconnais chaque forme.",
  ],
  [
    "animals",
    "Les animaux de la forêt",
    "Cat, dog, rabbit, bird… Un petit zoo de cartes attend d’être complété avec les noms anglais.",
  ],
  [
    "sentence",
    "Le conte du soir",
    "Pour s’endormir, les petits oiseaux veulent une phrase complète, avec une majuscule et un point.",
  ],
  [
    "living",
    "Le jardin de Mousse",
    "La tortue plante des graines. Une graine est-elle vivante ? Observe comment les plantes grandissent.",
  ],
  [
    "calendar",
    "Le calendrier des lucioles",
    "Les lucioles reviennent chaque mois. Retrouve les jours de la semaine et les mois pour préparer la fête.",
  ],
  [
    "addition",
    "La première page retrouvée",
    "Toutes les lucioles se rassemblent : la première page du Grand Livre brille ! Un dernier calcul ouvre la porte du village des marchands.",
  ],
  // Livre 2 — Le village des marchands (21-40)
  [
    "subtract",
    "Le panier troué",
    "Chez Épine le hérisson, un panier percé a perdu des pommes en chemin. Combien en reste-t-il ?",
  ],
  [
    "money",
    "La boutique d’Épine",
    "Épine vend des plumes et des bonbons. Compte les pièces et les billets pour payer sans te tromper.",
  ],
  [
    "clock",
    "L’horloge du village",
    "La grande horloge s’est arrêtée à l’heure du marché. Lis les heures et les demi-heures pour la remettre en marche.",
  ],
  [
    "complements",
    "Les paquets de dix",
    "Pour faire des paquets de dix ou de vingt, il manque toujours quelques objets. Trouve combien.",
  ],
  [
    "problem",
    "Le problème du marchand",
    "Épine ne sait pas s’il faut ajouter ou enlever. Raconte l’histoire avant de calculer.",
  ],
  [
    "subtract",
    "Les cerises de la fête",
    "Les enfants du village mangent des cerises. Combien en reste-t-il à la fin du jeu ?",
  ],
  [
    "money",
    "Le prix des ballons",
    "Un ballon coûte quelques euros. Combien faut-il de pièces pour en acheter deux ?",
  ],
  [
    "hundreds",
    "La caravane des centaines",
    "La caravane transporte des centaines de sacs. Apprends à lire les centaines, les dizaines et les unités.",
  ],
  [
    "clock",
    "Le départ de la diligence",
    "La diligence part à l’heure précise. Lis l’horloge pour ne pas la manquer.",
  ],
  [
    "complements",
    "Le jeu du vingt",
    "Le jeu de la place consiste à compléter jusqu’à 20. Luna joue contre toi.",
  ],
  [
    "problem",
    "La recette du boulanger",
    "Pour faire des pains, il faut des sacs de farine. Lis l’histoire, puis choisis la bonne opération.",
  ],
  [
    "calendar",
    "Le marché du samedi",
    "Le grand marché a lieu un jour précis. Cherche le jour et le mois sur l’affiche.",
  ],
  [
    "number",
    "La pile de caisses",
    "Les caisses sont rangées par dizaines. Dis combien il y en a en tout.",
  ],
  [
    "addition",
    "La balance d’Épine",
    "Deux plateaux, deux sacs. Pour savoir ce qu’ils pèsent ensemble, additionne.",
  ],
  [
    "money",
    "Le coffre du village",
    "Le coffre contient des pièces. Compte-les pour savoir combien le village a économisé.",
  ],
  [
    "problem",
    "L’énigme du sac percé",
    "Un sac laisse tomber des graines le long du chemin. Raconte et calcule pour savoir combien il en reste.",
  ],
  [
    "subtract",
    "La monnaie rendue",
    "Quand on paie avec un grand billet, le marchand rend la monnaie. Calcule ce qui reste.",
  ],
  [
    "clock",
    "Le spectacle du soir",
    "Le spectacle commence à une demi-heure précise. Lis les heures pour guider les spectateurs.",
  ],
  [
    "english_numbers",
    "Les étals en anglais",
    "Un marchand venu de loin affiche ses prix : one, two, five… Aide-le à les lire.",
  ],
  [
    "problem",
    "La fête du village",
    "La fête commence ! Pour distribuer les gâteaux, il faut réfléchir à chaque histoire. Le sceau du village est à toi.",
  ],
  // Livre 3 — La montagne des étoiles (41-60)
  [
    "hundreds",
    "Les marches de la montagne",
    "Cent marches, deux cents, trois cents… Comptons les centaines pour grimper jusqu’aux étoiles.",
  ],
  [
    "compare",
    "Plus grand, plus petit",
    "Deux sentiers, deux nombres. Choisis le plus grand pour rejoindre le refuge.",
  ],
  [
    "doubles",
    "Les étoiles jumelles",
    "Chaque étoile a une jumelle. Double le nombre pour retrouver sa sœur.",
  ],
  [
    "multiplication",
    "Les paniers du dragon",
    "Braise, le petit dragon, a trois paniers avec deux pommes chacun. Découvrons ensemble le signe ×.",
  ],
  [
    "halves",
    "Partager une galette",
    "Braise veut partager sa galette en deux parts égales. Trouve la moitié.",
  ],
  [
    "shapes",
    "Les cristaux de la grotte",
    "Les cristaux brillent de toutes les formes. Reconnais les figures cachées dans la roche.",
  ],
  [
    "multiplication",
    "Les rangées de lanternes",
    "Des lanternes sont alignées en rangées de même taille. Combien y en a-t-il en tout ?",
  ],
  [
    "compare",
    "L’échelle des sommets",
    "Range les sommets du plus petit au plus grand pour trouver le bon chemin.",
  ],
  [
    "doubles",
    "Le double du dragon",
    "Braise adore compter double : deux fois plus de flammes, deux fois plus de lumière !",
  ],
  [
    "halves",
    "La moitié du trésor",
    "Le trésor de la montagne doit être partagé en deux. Combien pour chacun ?",
  ],
  [
    "multiplication",
    "Les œufs de la falaise",
    "Dans chaque nid, il y a le même nombre d’œufs. Calcule pour savoir combien il y en a en tout.",
  ],
  [
    "hundreds",
    "Le coffre des centaines",
    "Le coffre s’ouvre avec un nombre à trois chiffres. Décompose-le en centaines, dizaines et unités.",
  ],
  [
    "shapes",
    "Le pont des figures",
    "Chaque pierre du pont a la forme d’une figure. Retrouve le triangle, le carré, le rectangle.",
  ],
  [
    "complements",
    "Les étoiles à compléter",
    "Il manque quelques étoiles pour faire 10, puis 20. Aide le ciel à se compléter.",
  ],
  [
    "multiplication",
    "Les tables de Luna",
    "Luna range ses pommes en rangées égales. Chaque rangée est une petite multiplication.",
  ],
  [
    "compare",
    "Le sommet du jeu",
    "Compare les nombres des deux équipes pour savoir qui est monté le plus haut.",
  ],
  [
    "doubles",
    "L’écho de la montagne",
    "Quand tu cries un nombre, l’écho le double. Devine ce que la montagne répond.",
  ],
  [
    "problem",
    "Le sac de Braise",
    "Braise a plusieurs paniers de pommes. Choisis la bonne opération pour savoir combien il en a.",
  ],
  [
    "multiplication",
    "La constellation des groupes",
    "Les étoiles brillent en groupes égaux. Compte-les avec une multiplication.",
  ],
  [
    "hundreds",
    "Le sommet des étoiles",
    "Tout en haut, la troisième page du Grand Livre brille entre deux étoiles. Un grand nombre ouvre le dernier verrou.",
  ],
  // Livre 4 — La bibliothèque flottante (61-80)
  [
    "verb",
    "Les mots qui bougent",
    "À la bibliothèque, la Chouette Plume cherche les mots qui disent ce que l’on fait : courir, lire, voler.",
  ],
  [
    "subject",
    "Qui fait l’action ?",
    "Dans chaque phrase, quelqu’un agit. Retrouve le sujet pour aider Plume à ranger les phrases.",
  ],
  [
    "present_er",
    "Le chœur des verbes en -er",
    "Je chante, tu chantes, il chante… Les verbes en -er changent de fin selon qui parle.",
  ],
  [
    "etre",
    "Le verbe être",
    "Je suis, tu es, il est… Plume te présente le petit mot qui dit comment on est.",
  ],
  [
    "avoir",
    "Le verbe avoir",
    "J’ai, tu as, il a… Avec lui, on possède des livres, des plumes et des idées.",
  ],
  [
    "adjective",
    "Les mots qui décrivent",
    "Un petit livre, un grand livre… Les adjectifs disent comment sont les choses.",
  ],
  [
    "agreement",
    "Des livres bien accordés",
    "Un petit livre, des petits livres… Accorde les mots du groupe nominal pour que tout s’accorde.",
  ],
  [
    "verb",
    "Les verbes du vent",
    "Le vent tourne les pages, emporte les feuilles, ouvre les fenêtres. Retrouve les verbes.",
  ],
  [
    "subject",
    "Le sujet caché",
    "Qui lit ? Qui écrit ? Un sujet se cache dans chaque phrase de Plume.",
  ],
  [
    "present_er",
    "Le conte en -er",
    "Un conte raconte ce que font les lecteurs. Conjugue les verbes en -er pour le terminer.",
  ],
  [
    "sentence",
    "La phrase en désordre",
    "Les mots d’un conte se sont mélangés. Remets-les dans l’ordre pour retrouver la belle phrase.",
  ],
  [
    "etre",
    "Où sont les livres ?",
    "Les livres sont sur l’étagère, la tour est haute, Plume est contente. Complète avec le verbe être.",
  ],
  [
    "avoir",
    "Avoir des idées",
    "Alma a une idée, Luna a un plan. Complète avec le verbe avoir.",
  ],
  [
    "adjective",
    "La description de la tour",
    "Une tour haute, des étagères longues. Choisis les adjectifs qui décrivent la bibliothèque.",
  ],
  [
    "agreement",
    "Le rayon des accords",
    "Le rayon des accords est en désordre. Accorde chaque groupe nominal.",
  ],
  [
    "reading",
    "L’histoire de la page envolée",
    "Un conte raconte comment une page s’est envolée. Lis-le attentivement pour répondre.",
  ],
  [
    "present_er",
    "La chorale de la bibliothèque",
    "Nous chantons, vous chantez, ils chantent… Les verbes aiment chanter ensemble.",
  ],
  [
    "subject",
    "La page du bon sujet",
    "Pour comprendre une phrase, retrouve qui fait l’action. Plume te donne des indices.",
  ],
  [
    "agreement",
    "Le dernier accord",
    "Chaque mot du groupe nominal doit s’accorder pour tourner la dernière page.",
  ],
  [
    "reading",
    "La page du Grand Livre",
    "La quatrième page flotte au-dessus des étagères. Lis le texte doré pour comprendre où elle veut aller.",
  ],
  // Livre 5 — L’île des saisons (81-100)
  [
    "seasons",
    "Le printemps de Mousse",
    "La tortue Mousse t’emmène sur l’île où les saisons se suivent. Commence par le printemps, qui fait pousser les fleurs.",
  ],
  [
    "living",
    "Les habitants de l’île",
    "Sur l’île, certains êtres sont vivants, d’autres non. Observe-les un à un.",
  ],
  [
    "calendar",
    "Les mois de l’île",
    "L’île a un calendrier de coquillages. Place les mois dans l’ordre.",
  ],
  [
    "colors",
    "Les couleurs de l’été",
    "Yellow sun, blue sea, green leaves… Luna décrit l’été en anglais.",
  ],
  [
    "animals",
    "Les animaux de la plage",
    "Fish, bird, crab… Les animaux de la plage ont des noms anglais à découvrir.",
  ],
  [
    "english_numbers",
    "Les vagues en anglais",
    "One wave, two waves, three waves… Compte les vagues en anglais.",
  ],
  [
    "seasons",
    "L’automne des feuilles",
    "Les feuilles tombent. Retrouve ce qui change en automne.",
  ],
  [
    "living",
    "Qui dort tout l’hiver ?",
    "Certains animaux dorment tout l’hiver. Vivant ou non-vivant ? Observe attentivement.",
  ],
  [
    "clock",
    "L’heure de la marée",
    "La marée monte à des heures précises. Lis l’horloge de la plage.",
  ],
  [
    "calendar",
    "Le jour des saisons",
    "Quel jour, quel mois ? Le grand calendrier de l’île attend ses étiquettes.",
  ],
  [
    "colors",
    "Le coucher de soleil",
    "Orange, pink, purple… Les couleurs du soir ont des noms anglais.",
  ],
  [
    "animals",
    "Le zoo de l’île",
    "Un petit zoo de cartes s’ouvre. Retrouve les animaux en anglais.",
  ],
  [
    "english_numbers",
    "Les coquillages numérotés",
    "Chaque coquillage porte un nombre anglais. Remets-les dans l’ordre.",
  ],
  [
    "seasons",
    "L’hiver et le retour du printemps",
    "Après l’hiver, le printemps revient. Le cycle des saisons recommence.",
  ],
  [
    "reading",
    "La légende de l’île",
    "Mousse raconte la légende des quatre saisons. Écoute bien et réponds.",
  ],
  [
    "number",
    "Le trésor des dizaines",
    "Un coffre s’ouvre avec des dizaines et des unités. Tu les connais bien !",
  ],
  [
    "addition",
    "Le total des étoiles",
    "Réunis toutes les étoiles de ton voyage pour en connaître le total.",
  ],
  [
    "noun",
    "Le nom de l’île",
    "Pour écrire la dernière page, il faut trouver le nom des choses que tu as vues en chemin.",
  ],
  [
    "present_er",
    "La chanson du retour",
    "Nous rentrons chez nous en chantant. Complète les verbes de la chanson.",
  ],
  [
    "reading",
    "La dernière page",
    "Le Grand Livre est complet. Lis la dernière page écrite pour toi : ton voyage devient histoire.",
  ],
];
export const chapters = raw.map(([skill, title, text], i) => ({
  n: i + 1,
  book: Math.floor(i / 20) + 1,
  skill,
  title,
  text,
}));
export const CHAPTER_COUNT = chapters.length;
export const BRIDGE_CHAPTERS = 3;
export const chapterById = (n) =>
  Number.isInteger(n) ? chapters[n - 1] || null : null;
// Contrôle de sauvegarde : un chapitre n'a que des défis de sa compétence.
export function validChapterSession(s) {
  if (s.chapter === undefined) return true;
  const c = chapterById(s.chapter);
  return (
    Boolean(c) &&
    s.chapter > BRIDGE_CHAPTERS &&
    s.id.startsWith(`story:${s.chapter}:`) &&
    Array.isArray(s.queue) &&
    s.queue.every((id) => id === c.skill)
  );
}
