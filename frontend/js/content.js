import { extraSkills } from "./expansion.js";
export const skills = [
  {
    id: "number",
    subject: "Mathématiques",
    name: "Dizaines et unités",
    pre: [],
    lesson:
      "Une dizaine, c’est un groupe de 10. Dans 24, il y a 2 dizaines et 4 unités. 20 + 4 = 24.",
    icon: "🧱",
  },
  {
    id: "addition",
    subject: "Mathématiques",
    name: "Additionner",
    pre: ["number"],
    lesson:
      "Luna a 3 pommes et en reçoit 2. On réunit les deux groupes : 3 + 2 = 5.",
    icon: "🍎",
  },
  {
    id: "subtract",
    subject: "Mathématiques",
    name: "Soustraire",
    pre: ["addition"],
    lesson: "Sur 7 pommes, le dragon en mange 2. Il en reste 5 : 7 − 2 = 5.",
    icon: "🐉",
  },
  {
    id: "multiplication",
    subject: "Mathématiques",
    name: "La multiplication",
    pre: ["addition"],
    lesson:
      "Trois paniers contiennent chacun deux pommes. Il y a 2 + 2 + 2 pommes. On peut écrire 3 × 2 = 6 : trois groupes de deux. Le signe × veut dire « fois ».",
    icon: "🧺",
  },
  {
    id: "problem",
    subject: "Mathématiques",
    name: "Résoudre un problème",
    pre: ["addition", "subtract"],
    lesson:
      "Raconte ce qui se passe. On réunit des objets ? On additionne. On en enlève ? On soustrait. Dessine les objets pour vérifier.",
    icon: "🧺",
  },
  {
    id: "noun",
    subject: "Français",
    name: "Reconnaître le nom",
    pre: [],
    lesson:
      "Un nom désigne une personne, un animal ou une chose. Dans « le petit chat », chat est le nom.",
    icon: "🌱",
  },
  {
    id: "determiner",
    subject: "Français",
    name: "Trouver le déterminant",
    pre: ["noun"],
    lesson:
      "Le déterminant présente le nom. Dans « les petits chats », le déterminant est les. On cherche seulement ce petit mot.",
    icon: "🛡️",
  },
  {
    id: "adjective",
    subject: "Français",
    name: "Trouver l’adjectif",
    pre: ["determiner"],
    lesson:
      "L’adjectif donne une précision sur le nom. Dans « la petite cabane », petite nous dit comment est la cabane.",
    icon: "🎨",
  },
  {
    id: "agreement",
    subject: "Français",
    name: "Accorder le groupe nominal",
    pre: ["adjective"],
    lesson:
      "Les mots du groupe s’accordent. Un petit chat devient des petits chats. Une petite cabane devient des petites cabanes.",
    icon: "🌿",
  },
  {
    id: "sentence",
    subject: "Français",
    name: "Construire une phrase",
    pre: ["noun"],
    lesson:
      "Une phrase raconte quelque chose. Elle commence par une majuscule et se termine par un point. « Le chat dort. »",
    icon: "📚",
  },
  {
    id: "reading",
    subject: "Français",
    name: "Comprendre une histoire",
    pre: [],
    lesson:
      "Lis une petite histoire. Pour répondre, cherche dans le texte les mots qui donnent un indice. Tu peux relire autant que nécessaire.",
    icon: "📖",
  },
  {
    id: "living",
    subject: "Questionner le monde",
    name: "Vivant et non-vivant",
    pre: [],
    lesson:
      "Un être vivant naît, grandit, se nourrit et peut se reproduire. Un arbre est vivant, même s’il ne marche pas. Une pierre n’est pas vivante.",
    icon: "🌳",
  },
  {
    id: "seasons",
    subject: "Questionner le monde",
    name: "Les saisons",
    pre: [],
    lesson:
      "En France, les saisons se suivent : printemps, été, automne, hiver. Puis le printemps revient.",
    icon: "🍂",
  },
  {
    id: "colors",
    subject: "Anglais",
    name: "Les couleurs à l’oral",
    pre: [],
    lesson:
      "Écoute les couleurs en anglais. Red : rouge. Blue : bleu. Green : vert. Yellow : jaune.",
    icon: "🎨",
  },
  {
    id: "animals",
    subject: "Anglais",
    name: "Les animaux à l’oral",
    pre: [],
    lesson:
      "Écoute les noms en anglais. Cat : chat. Dog : chien. Rabbit : lapin. Bird : oiseau.",
    icon: "🐱",
  },
];
skills.push(...extraSkills);
export const chapters = [
  [
    "Bienvenue au royaume",
    "Réveiller le jardin",
    "Quelques graines attendent tes premières découvertes.",
    "🌱",
  ],
  [
    "Le jardin enchanté",
    "Retrouver les couleurs",
    "Aide Luna à rendre ses couleurs au jardin.",
    "🌸",
  ],
  [
    "Au-delà de la rivière",
    "Réparer le petit pont",
    "Rassemble les planches pour rejoindre la forêt.",
    "🌉",
  ],
  [
    "Des histoires à partager",
    "Rouvrir la bibliothèque",
    "Retrouve les mots des histoires envolées.",
    "📚",
  ],
  [
    "Un nouvel ami",
    "Retrouver le dragon",
    "Suis les indices jusqu’à son petit refuge.",
    "🐉",
  ],
  [
    "Un royaume qui grandit",
    "Illuminer le château",
    "Chaque découverte éclaire un peu plus le château.",
    "🏰",
  ],
  [
    "La tête dans les étoiles",
    "Ouvrir l’observatoire",
    "Prépare une nouvelle fenêtre sur le monde.",
    "🔭",
  ],
  [
    "La vallée magique",
    "Explorer la vallée",
    "De nouvelles aventures commencent avec toi.",
    "🌈",
  ],
];
export const items = [
  {
    id: "flower",
    name: "Fleurs des lucioles",
    icon: "🌷",
    kind: "garden",
    cost: 1,
  },
  {
    id: "tree",
    name: "Arbre à histoires",
    icon: "🌳",
    kind: "garden",
    cost: 2,
  },
  {
    id: "mushroom",
    name: "Champignon étoilé",
    icon: "🍄",
    kind: "garden",
    cost: 1,
  },
  {
    id: "fountain",
    name: "Fontaine de lune",
    icon: "⛲",
    kind: "garden",
    cost: 3,
  },
  // Plantes rares : elles s'achètent avec des pièces (les graines restent rares).
  { id: "sunflower", name: "Tournesol du soleil", icon: "🌻", kind: "garden", cost: 0, coins: 6 },
  { id: "rose", name: "Rose enchantée", icon: "🌹", kind: "garden", cost: 0, coins: 6 },
  { id: "pumpkin", name: "Citrouille de lune", icon: "🎃", kind: "garden", cost: 0, coins: 8 },
  { id: "lantern", name: "Lanterne des lucioles", icon: "🏮", kind: "garden", cost: 0, coins: 10 },
  { id: "cherry", name: "Cerisier rose", icon: "🌸", kind: "garden", cost: 0, coins: 12 },
  { id: "hibiscus", name: "Hibiscus des îles", icon: "🌺", kind: "garden", cost: 0, coins: 12 },
  { id: "apple", name: "Pommier doré", icon: "🍏", kind: "garden", cost: 0, coins: 14 },
  { id: "hive", name: "Ruche dorée", icon: "🐝", kind: "garden", cost: 0, coins: 16 },
  { id: "butterfly", name: "Papillons de feu", icon: "🦋", kind: "garden", cost: 0, coins: 18 },
  { id: "crystal", name: "Cristal d’étoile", icon: "💎", kind: "garden", cost: 0, coins: 25 },
  { id: "rainbow", name: "Arc-en-ciel de poche", icon: "🌈", kind: "garden", cost: 0, coins: 30 },
  { id: "hat", name: "Chapeau de voyage", icon: "🧙", kind: "outfit", cost: 0 },
  {
    id: "crown",
    name: "Couronne des bois",
    icon: "👑",
    kind: "outfit",
    cost: 0,
  },
  { id: "fox", name: "Renard des bois", icon: "🦊", kind: "pet", cost: 0 },
  { id: "dragon", name: "Petit dragon", icon: "🐉", kind: "pet", cost: 0 },
  // Compagnons à adopter avec des pièces (les deux premiers sont des cadeaux de mission).
  { id: "bunny", name: "Lapin des prés", icon: "🐰", kind: "pet", cost: 0, price: 24 },
  { id: "hedgehog", name: "Épine le hérisson", icon: "🦔", kind: "pet", cost: 0, price: 28 },
  { id: "owl", name: "Plume la chouette", icon: "🦉", kind: "pet", cost: 0, price: 28 },
  { id: "turtle", name: "Mousse la tortue", icon: "🐢", kind: "pet", cost: 0, price: 32 },
  { id: "beaver", name: "Brindille le castor", icon: "🦫", kind: "pet", cost: 0, price: 32 },
];
