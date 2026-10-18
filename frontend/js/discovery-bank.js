// Banque dédiée au parcours « À la découverte de tes pouvoirs ».
// Aucune dépendance. Chaque variante est écrite à la main ou calculée de façon déterministe ;
// tests/discovery.test.js recalcule les réponses, vérifie les distracteurs et l'absence de fuite dans les exemples.

export function hash(text) {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
export function shuffled(list, key) {
  const a = [...list];
  let h = hash(key);
  for (let i = a.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const plural = (n, word) => `${n} ${word}${n > 1 ? "s" : ""}`;
const near = (n) => [n, n + 1, n - 1].map(String);
const MINUS = "−";
export const READING_INSTRUCTION =
  "Lis le petit texte tout seul. Puis réponds à la question.";

const numberFamilies = [
  {
    id: "num-build",
    skill: "number",
    tier: 1,
    form: "blocks",
    match: "number",
    task: "composer un nombre avec des dizaines et des unités",
    example:
      "Exemple : pour fabriquer 15, on prend 1 barre de dix et 5 petits cubes, car 10 + 5 = 15.",
    variants: [23, 35, 41, 18, 52, 27, 36, 44, 29, 33, 46, 51].map((n) => ({
      prompt: `Construis ${n} avec les dizaines et les unités.`,
      answer: String(n),
      calc: { op: "compose", nums: [Math.floor(n / 10), n % 10] },
    })),
  },
  {
    id: "num-compare",
    skill: "number",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "comparer deux nombres",
    example:
      "Exemple : entre 25 et 31, on regarde d’abord les dizaines. 3 dizaines, c’est plus que 2 dizaines : 31 est le plus grand.",
    variants: [
      [47, 39, "grand"],
      [28, 31, "petit"],
      [65, 56, "grand"],
      [42, 24, "petit"],
      [73, 37, "grand"],
      [19, 21, "petit"],
      [58, 52, "grand"],
      [61, 68, "petit"],
      [34, 43, "grand"],
      [82, 28, "petit"],
      [57, 75, "grand"],
      [96, 69, "petit"],
    ].map(([a, b, w]) => ({
      prompt: `Quel nombre est le plus ${w} : ${a} ou ${b} ?`,
      answer: String(w === "grand" ? Math.max(a, b) : Math.min(a, b)),
      options: [String(a), String(b)],
      calc: { op: "compare", nums: [a, b], word: w },
    })),
  },
  {
    id: "num-write",
    skill: "number",
    tier: 2,
    form: "input",
    match: "number",
    task: "écrire un nombre à partir de dizaines et d’unités",
    example: "Exemple : 2 dizaines et 4 unités, c’est 20 + 4 = 24.",
    variants: [
      [3, 6],
      [5, 2],
      [2, 9],
      [4, 1],
      [6, 3],
      [1, 7],
      [3, 8],
      [2, 5],
      [4, 7],
      [1, 3],
      [5, 9],
      [6, 6],
    ].map(([t, u]) => ({
      prompt: `${plural(t, "dizaine")} et ${plural(u, "unité")} : quel nombre cela fait-il ?`,
      answer: String(t * 10 + u),
      calc: { op: "compose", nums: [t, u] },
    })),
  },
  {
    id: "num-order",
    skill: "number",
    tier: 1,
    form: "order",
    match: "exact",
    task: "ranger des nombres dans l’ordre",
    example:
      "Exemple : pour ranger 9, 2 et 5 du plus petit au plus grand, on met d’abord 2, puis 5, puis 9.",
    variants: [
      [[34, 12, 28], "up"],
      [[45, 23, 39], "up"],
      [[61, 16, 52], "up"],
      [[27, 72, 47], "up"],
      [[18, 81, 58], "up"],
      [[36, 63, 33], "up"],
      [[25, 52, 35], "down"],
      [[74, 47, 70], "down"],
    ].map(([nums, way]) => {
      const sorted = [...nums].sort((a, b) => (way === "up" ? a - b : b - a));
      return {
        prompt: `Touche les nombres dans l’ordre, ${way === "up" ? "du plus petit au plus grand" : "du plus grand au plus petit"}.`,
        items: sorted.map(String),
        answer: sorted.join(" "),
        options: nums.map(String),
      };
    }),
  },
];

const additionFamilies = [
  {
    id: "add-count",
    skill: "addition",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "additionner deux petits nombres",
    example:
      "Exemple : pour 2 + 3, on part de 2 et on avance de 3 : 3, 4, 5. Donc 2 + 3 = 5.",
    variants: [
      [3, 4],
      [5, 2],
      [6, 3],
      [4, 4],
      [2, 7],
      [5, 4],
      [7, 2],
      [3, 5],
      [6, 1],
      [8, 1],
      [4, 3],
      [2, 6],
    ].map(([a, b]) => ({
      prompt: `Combien font ${a} + ${b} ?`,
      answer: String(a + b),
      options: near(a + b),
      calc: { op: "+", nums: [a, b] },
    })),
  },
  {
    id: "add-groups",
    skill: "addition",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "réunir deux groupes d’objets",
    example:
      "Exemple : 🍎🍎 et 🍎🍎🍎. On compte tout : 1, 2, 3, 4, 5. Il y a 5 pommes.",
    variants: [
      [3, 4],
      [2, 5],
      [6, 2],
      [5, 3],
      [4, 4],
      [1, 7],
      [3, 6],
      [7, 2],
      [2, 4],
      [6, 3],
    ].map(([a, b]) => ({
      prompt: "Combien de pommes y a-t-il en tout ?",
      visual: `${"🍎".repeat(a)} + ${"🍎".repeat(b)}`,
      answer: String(a + b),
      options: near(a + b),
      calc: { op: "+", nums: [a, b] },
    })),
  },
  {
    id: "add-ten",
    skill: "addition",
    tier: 2,
    form: "input",
    match: "number",
    task: "additionner en passant la dizaine",
    example:
      "Exemple : pour 9 + 3, on fait 9 + 1 = 10, puis 10 + 2 = 12. Donc 9 + 3 = 12.",
    variants: [
      [8, 5],
      [7, 6],
      [9, 4],
      [6, 7],
      [8, 7],
      [9, 6],
      [9, 5],
      [7, 8],
      [6, 9],
      [8, 6],
      [9, 7],
      [8, 9],
    ].map(([a, b]) => ({
      prompt: `Combien font ${a} + ${b} ?`,
      answer: String(a + b),
      calc: { op: "+", nums: [a, b] },
    })),
  },
];

const subtractFamilies = [
  {
    id: "sub-count",
    skill: "subtract",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "soustraire un petit nombre",
    example: `Exemple : pour 6 ${MINUS} 2, on part de 6 et on recule de 2 : 5, 4. Donc 6 ${MINUS} 2 = 4.`,
    variants: [
      [7, 2],
      [9, 4],
      [8, 3],
      [6, 5],
      [10, 4],
      [9, 6],
      [8, 5],
      [9, 2],
      [7, 4],
      [10, 3],
      [6, 3],
      [8, 6],
    ].map(([a, b]) => ({
      prompt: `Combien font ${a} ${MINUS} ${b} ?`,
      answer: String(a - b),
      options: near(a - b),
      calc: { op: "-", nums: [a, b] },
    })),
  },
  {
    id: "sub-groups",
    skill: "subtract",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "enlever des objets d’un groupe",
    example: `Exemple : il y a 3 pommes, on en enlève 2 : il en reste 1, car 3 ${MINUS} 2 = 1.`,
    variants: [
      [7, 3],
      [8, 2],
      [6, 4],
      [9, 3],
      [5, 2],
      [8, 5],
      [6, 2],
      [9, 5],
      [7, 5],
      [10, 3],
      [8, 4],
      [6, 3],
    ].map(([a, b]) => ({
      prompt: `Il y a ${a} pommes. On en enlève ${b}. Combien en reste-t-il ?`,
      visual: "🍎".repeat(a),
      answer: String(a - b),
      options: near(a - b),
      calc: { op: "-", nums: [a, b] },
    })),
  },
  {
    id: "sub-ten",
    skill: "subtract",
    tier: 2,
    form: "input",
    match: "number",
    task: "soustraire en passant la dizaine",
    example: `Exemple : pour 12 ${MINUS} 3, on fait 12 ${MINUS} 2 = 10, puis 10 ${MINUS} 1 = 9. Donc 12 ${MINUS} 3 = 9.`,
    variants: [
      [12, 5],
      [13, 6],
      [15, 7],
      [14, 9],
      [11, 4],
      [16, 8],
      [12, 4],
      [14, 6],
      [13, 7],
      [15, 9],
      [17, 9],
      [11, 5],
    ].map(([a, b]) => ({
      prompt: `Combien font ${a} ${MINUS} ${b} ?`,
      answer: String(a - b),
      calc: { op: "-", nums: [a, b] },
    })),
  },
];

const problemFamilies = [
  {
    id: "prob-add-choice",
    skill: "problem",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "résoudre un petit problème (réunir)",
    example:
      "Exemple : Tom a 2 billes et il en gagne 1. Pour savoir combien il en a, on réunit : 2 + 1 = 3.",
    variants: [
      [
        "Luna a 3 graines. Le castor lui en donne 2. Combien de graines a-t-elle maintenant ?",
        3,
        2,
      ],
      [
        "Il y a 4 oiseaux sur la branche. 2 oiseaux arrivent. Combien d’oiseaux y a-t-il maintenant ?",
        4,
        2,
      ],
      [
        "Milo range 5 livres, puis 3 livres de plus. Combien de livres a-t-il rangés ?",
        5,
        3,
      ],
      [
        "Dans le panier, il y a 2 pommes rouges et 4 pommes vertes. Combien de pommes y a-t-il en tout ?",
        2,
        4,
      ],
      [
        "Nora dessine 3 étoiles le matin et 5 étoiles le soir. Combien d’étoiles a-t-elle dessinées ?",
        3,
        5,
      ],
      [
        "Le dragon a 4 fruits. Il en trouve 3 autres. Combien de fruits a-t-il maintenant ?",
        4,
        3,
      ],
      [
        "Lina cueille 5 fraises, puis 4 fraises de plus. Combien de fraises a-t-elle cueillies ?",
        5,
        4,
      ],
      [
        "Il y a 6 poissons dans le bocal. On en ajoute 2. Combien de poissons y a-t-il maintenant ?",
        6,
        2,
      ],
      [
        "Sam a 3 voitures rouges et 5 voitures bleues. Combien de voitures a-t-il en tout ?",
        3,
        5,
      ],
      [
        "Dans le pré, 7 moutons broutent. 2 moutons arrivent. Combien de moutons y a-t-il maintenant ?",
        7,
        2,
      ],
      [
        "Ava range 4 cahiers, puis 6 cahiers de plus. Combien de cahiers a-t-elle rangés ?",
        4,
        6,
      ],
      [
        "Le renard a 5 noix. Il en trouve 3 autres. Combien de noix a-t-il maintenant ?",
        5,
        3,
      ],
    ].map(([prompt, a, b]) => ({
      prompt,
      answer: String(a + b),
      options: near(a + b),
      calc: { op: "+", nums: [a, b] },
    })),
  },
  {
    id: "prob-add",
    skill: "problem",
    tier: 1,
    form: "input",
    match: "number",
    task: "résoudre un petit problème (réunir)",
    example:
      "Exemple : Léa a 4 cerises et en reçoit 3. On réunit : 4 + 3 = 7.",
    variants: [
      [
        "Luna a 6 graines. Le castor lui en donne 3. Combien de graines a-t-elle maintenant ?",
        6,
        3,
      ],
      [
        "Il y a 5 oiseaux sur la branche. 5 oiseaux arrivent. Combien d’oiseaux y a-t-il maintenant ?",
        5,
        5,
      ],
      [
        "Milo range 4 livres, puis 4 livres de plus. Combien de livres a-t-il rangés ?",
        4,
        4,
      ],
      [
        "Dans le panier, il y a 7 pommes rouges et 4 pommes vertes. Combien de pommes y a-t-il en tout ?",
        7,
        4,
      ],
      [
        "Nora dessine 5 étoiles le matin et 4 étoiles le soir. Combien d’étoiles a-t-elle dessinées ?",
        5,
        4,
      ],
      [
        "Le dragon a 6 fruits. Il en trouve 6 autres. Combien de fruits a-t-il maintenant ?",
        6,
        6,
      ],
      [
        "Lina a 8 fraises. Elle en cueille 3 de plus. Combien de fraises a-t-elle maintenant ?",
        8,
        3,
      ],
      [
        "Il y a 9 poissons dans le bassin. On en ajoute 4. Combien de poissons y a-t-il maintenant ?",
        9,
        4,
      ],
      [
        "Sam a 5 voitures rouges et 6 voitures bleues. Combien de voitures a-t-il en tout ?",
        5,
        6,
      ],
      [
        "Dans le pré, 10 moutons broutent. 5 moutons arrivent. Combien de moutons y a-t-il maintenant ?",
        10,
        5,
      ],
      [
        "Ava range 7 cahiers, puis 5 cahiers de plus. Combien de cahiers a-t-elle rangés ?",
        7,
        5,
      ],
      [
        "Le renard a 9 noix. Il en trouve 2 autres. Combien de noix a-t-il maintenant ?",
        9,
        2,
      ],
    ].map(([prompt, a, b]) => ({
      prompt,
      answer: String(a + b),
      calc: { op: "+", nums: [a, b] },
    })),
  },
  {
    id: "prob-sub",
    skill: "problem",
    tier: 2,
    form: "input",
    match: "number",
    task: "résoudre un petit problème (enlever)",
    example: `Exemple : Léa a 5 cerises et en mange 2. Il lui en reste 3, car 5 ${MINUS} 2 = 3.`,
    variants: [
      [
        "Le dragon a 9 fruits. Il en donne 4. Combien de fruits lui reste-t-il ?",
        9,
        4,
      ],
      [
        "Il y a 8 oiseaux sur le toit. 2 oiseaux s’envolent. Combien d’oiseaux restent sur le toit ?",
        8,
        2,
      ],
      [
        "Nora a 10 billes. Elle en perd 6. Combien de billes a-t-elle encore ?",
        10,
        6,
      ],
      [
        "Dans la boîte, il y a 12 crayons. Milo en prend 5. Combien de crayons restent dans la boîte ?",
        12,
        5,
      ],
      [
        "Luna cueille 11 fleurs. Elle en offre 4. Combien de fleurs garde-t-elle ?",
        11,
        4,
      ],
      [
        "Il y a 13 poissons dans le bassin. 6 poissons partent dans la rivière. Combien de poissons restent dans le bassin ?",
        13,
        6,
      ],
      [
        "Lina a 14 fraises. Elle en mange 5. Combien de fraises lui reste-t-il ?",
        14,
        5,
      ],
      [
        "Sam a 11 voitures. Il en prête 6. Combien de voitures lui reste-t-il ?",
        11,
        6,
      ],
      [
        "Dans le pré, il y a 15 moutons. 8 moutons rentrent à la bergerie. Combien de moutons restent dans le pré ?",
        15,
        8,
      ],
      [
        "Ava a 12 cahiers. Elle en donne 7. Combien de cahiers lui reste-t-il ?",
        12,
        7,
      ],
      [
        "Le renard a 10 noix. Il en cache 4. Combien de noix lui reste-t-il ?",
        10,
        4,
      ],
      [
        "Il y a 16 oiseaux sur le fil. 9 oiseaux s’envolent. Combien d’oiseaux restent sur le fil ?",
        16,
        9,
      ],
    ].map(([prompt, a, b]) => ({
      prompt,
      answer: String(a - b),
      calc: { op: "-", nums: [a, b] },
    })),
  },
];

const readingFamilies = [
  {
    id: "read-find",
    skill: "reading",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "trouver une information écrite dans un texte",
    example:
      "Exemple : « Tom range ses crayons. » Qui range ses crayons ? On cherche dans le texte : c’est Tom.",
    variants: [
      [
        "Le matin, Tom donne du pain aux canards. Les canards nagent sur la mare.",
        "Que donne Tom aux canards ?",
        "du pain",
        ["des graines", "du riz"],
      ],
      [
        "Mina a un chat gris. Il dort sur le canapé rouge.",
        "De quelle couleur est le chat ?",
        "gris",
        ["rouge", "blanc"],
      ],
      [
        "Papa prépare un gâteau. Il casse deux œufs et ajoute du sucre.",
        "Que casse papa ?",
        "deux œufs",
        ["du sucre", "un gâteau"],
      ],
      [
        "Sur la plage, Léo construit un château de sable. Sa sœur ramasse des coquillages.",
        "Que ramasse la sœur de Léo ?",
        "des coquillages",
        ["un château", "du sable"],
      ],
      [
        "Le facteur monte les escaliers. Il laisse une lettre devant la porte.",
        "Que laisse le facteur ?",
        "une lettre",
        ["un colis", "une clé"],
      ],
      [
        "Lila range sa chambre. Elle met ses jouets dans une grande boîte.",
        "Où Lila met-elle ses jouets ?",
        "dans une grande boîte",
        ["sous le lit", "dans l’armoire"],
      ],
      [
        "Dans la forêt, Emma voit un écureuil. Il grimpe vite dans un grand chêne.",
        "Où grimpe l’écureuil ?",
        "dans un grand chêne",
        ["sur un toit", "dans un buisson"],
      ],
      [
        "Hugo prend son vélo bleu. Il roule jusqu’à l’école avec Nina.",
        "Où Hugo roule-t-il ?",
        "jusqu’à l’école",
        ["jusqu’au marché", "jusqu’à la mer"],
      ],
      [
        "Grand-mère tricote une écharpe verte. Elle utilise de la laine douce.",
        "Que tricote grand-mère ?",
        "une écharpe",
        ["un bonnet", "des gants"],
      ],
      [
        "Le soir, le pêcheur rentre au port. Il rapporte trois gros poissons.",
        "Combien de poissons rapporte le pêcheur ?",
        "trois",
        ["deux", "quatre"],
      ],
    ].map(([passage, prompt, answer, wrong]) => ({
      passage,
      prompt,
      answer,
      options: [answer, ...wrong],
    })),
  },
  {
    id: "read-write",
    skill: "reading",
    tier: 2,
    form: "input",
    match: "loose",
    task: "répondre par écrit à une question sur un texte",
    example:
      "Exemple : « Tom range ses crayons. » Qui range ses crayons ? On écrit : Tom.",
    variants: [
      [
        "Zoé a un ballon jaune. Elle joue dans la cour avec Hugo.",
        "Avec qui Zoé joue-t-elle ?",
        "Hugo",
        ["avec Hugo"],
      ],
      [
        "Le boulanger sort les pains du four à sept heures. Ils sentent très bon.",
        "Qui sort les pains du four ?",
        "le boulanger",
        ["boulanger"],
      ],
      [
        "Samedi, Inès va au marché avec sa grand-mère. Elle achète des pommes.",
        "Qu’achète Inès ?",
        "des pommes",
        ["pommes", "elle achète des pommes"],
      ],
      [
        "Le petit lapin saute dans le jardin. Il mange une carotte.",
        "Que mange le petit lapin ?",
        "une carotte",
        ["carotte", "il mange une carotte"],
      ],
      [
        "Ce soir, Tess lit une histoire à son frère. Il s’endort vite.",
        "Qui lit une histoire ?",
        "Tess",
        ["tess lit une histoire"],
      ],
      [
        "Ben met ses bottes parce qu’il pleut. Puis il saute dans les flaques.",
        "Que fait Ben dans les flaques ?",
        "il saute",
        ["saute", "ben saute", "il saute dans les flaques"],
      ],
      [
        "Le vendredi, Anna apporte un livre à l’école. Elle le montre à la maîtresse.",
        "Que montre Anna à la maîtresse ?",
        "un livre",
        ["son livre", "elle montre un livre"],
      ],
      [
        "Dans le jardin, Théo arrose les fleurs. Un papillon se pose sur une rose.",
        "Qui arrose les fleurs ?",
        "Théo",
        ["théo arrose les fleurs"],
      ],
      [
        "Chaque soir, Clara donne à manger à son poisson rouge. Il nage dans un grand bocal.",
        "Où nage le poisson ?",
        "dans un grand bocal",
        ["dans un bocal", "bocal"],
      ],
      [
        "Les enfants font un gâteau au chocolat. Ils le mangent avec leur grand-père.",
        "Avec qui les enfants mangent-ils le gâteau ?",
        "avec leur grand-père",
        ["leur grand-père", "grand-père", "avec grand-père"],
      ],
    ].map(([passage, prompt, answer, accepted]) => ({
      passage,
      prompt,
      answer,
      accepted,
    })),
  },
  {
    id: "read-why",
    skill: "reading",
    tier: 2,
    form: "choice",
    match: "exact",
    task: "comprendre pourquoi quelqu’un agit",
    example:
      "Exemple : « Il fait nuit. Tom bâille. » Pourquoi Tom bâille-t-il ? Le texte donne un indice : il fait nuit, il a sommeil.",
    variants: [
      [
        "Il pleut. Mia prend son parapluie avant de sortir.",
        "Pourquoi Mia prend-elle son parapluie ?",
        "parce qu’il pleut",
        ["parce qu’il fait chaud", "parce qu’elle est fatiguée"],
      ],
      [
        "Paul a très soif. Il boit un grand verre d’eau.",
        "Pourquoi Paul boit-il de l’eau ?",
        "parce qu’il a soif",
        ["parce qu’il a froid", "parce qu’il est en retard"],
      ],
      [
        "Le chien aboie devant la porte. Il veut sortir se promener.",
        "Pourquoi le chien aboie-t-il ?",
        "il veut sortir",
        ["il a peur du chat", "il veut manger"],
      ],
      [
        "Il fait nuit. Sarah éteint la lumière et ferme les yeux.",
        "Que va faire Sarah ?",
        "dormir",
        ["jouer", "cuisiner"],
      ],
      [
        "Lola met son manteau et son bonnet. Dehors, il fait très froid.",
        "Pourquoi Lola met-elle un bonnet ?",
        "parce qu’il fait froid",
        ["parce qu’elle a faim", "parce qu’elle veut jouer"],
      ],
      [
        "Emma n’a plus de crayon. Elle en demande un à sa voisine.",
        "Pourquoi Emma demande-t-elle un crayon ?",
        "parce qu’elle n’a plus de crayon",
        ["parce qu’elle a faim", "parce qu’il pleut"],
      ],
      [
        "Tom est très fatigué. Il s’assoit sur le banc pour se reposer.",
        "Pourquoi Tom s’assoit-il sur le banc ?",
        "parce qu’il est fatigué",
        ["parce qu’il a chaud", "parce qu’il veut courir"],
      ],
      [
        "Le soleil brille fort. Anna met sa casquette avant de jouer dehors.",
        "Pourquoi Anna met-elle sa casquette ?",
        "parce que le soleil brille",
        ["parce qu’il neige", "parce qu’elle a faim"],
      ],
      [
        "Rémi a perdu son chat. Il le cherche partout dans le jardin.",
        "Pourquoi Rémi cherche-t-il dans le jardin ?",
        "il a perdu son chat",
        ["il veut jouer au ballon", "il a perdu ses clés"],
      ],
      [
        "La maîtresse sonne la cloche. Tous les élèves rentrent en classe.",
        "Pourquoi les élèves rentrent-ils en classe ?",
        "la cloche a sonné",
        ["il pleut", "c’est l’heure de manger"],
      ],
    ].map(([passage, prompt, answer, wrong]) => ({
      passage,
      prompt,
      answer,
      options: [answer, ...wrong],
    })),
  },
];

const groups = [
  ["le", "petit", "dragon"],
  ["la", "grande", "maison"],
  ["les", "gros", "livres"],
  ["une", "jolie", "fleur"],
  ["un", "vieux", "chapeau"],
  ["les", "petites", "souris"],
  ["la", "longue", "rivière"],
  ["les", "gentils", "chiens"],
  ["le", "joli", "ballon"],
  ["la", "petite", "étoile"],
  ["un", "gros", "gâteau"],
  ["les", "belles", "fleurs"],
];
const grammarFamilies = [
  {
    id: "noun-choice",
    skill: "noun",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "reconnaître le nom dans un groupe de mots",
    example:
      "Exemple : dans « la petite fenêtre », le nom est fenêtre : c’est le mot qui nomme la chose.",
    variants: groups.map(([d, a, n]) => ({
      prompt: `Dans « ${d} ${a} ${n} », quel est le nom ?`,
      answer: n,
      options: [d, a, n],
    })),
  },
  {
    id: "noun-tap",
    skill: "noun",
    tier: 1,
    form: "tap",
    match: "exact",
    task: "toucher le nom de l’animal dans une phrase",
    example:
      "Exemple : dans « La petite fourmi marche. », le nom de l’animal est fourmi.",
    variants: [
      ["La petite souris court vite.", "souris"],
      ["Le gros chat dort.", "chat"],
      ["Un joli oiseau chante.", "oiseau"],
      ["Les lapins sautent.", "lapins"],
      ["Le grand cheval galope.", "cheval"],
      ["La vache mange dans le pré.", "vache"],
      ["Le petit poisson nage.", "poisson"],
      ["Une grosse tortue avance.", "tortue"],
      ["Les canards nagent dans la mare.", "canards"],
      ["Le mouton broute l’herbe.", "mouton"],
    ].map(([sentence, answer]) => ({
      prompt: "Touche le nom de l’animal dans la phrase.",
      sentence,
      answer,
    })),
  },
  {
    id: "noun-write",
    skill: "noun",
    tier: 2,
    form: "input",
    match: "loose",
    task: "écrire le nom d’un groupe de mots",
    example:
      "Exemple : dans « la petite fenêtre », on écrit le nom : fenêtre.",
    variants: [...groups.slice(4), ...groups.slice(0, 4)].map(([d, a, n]) => ({
      prompt: `Écris le nom dans « ${d} ${a} ${n} ».`,
      answer: n,
    })),
  },
  {
    id: "det-choice",
    skill: "determiner",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "reconnaître le déterminant dans un groupe de mots",
    example:
      "Exemple : dans « la petite fenêtre », le déterminant est la : c’est le petit mot qui présente le nom.",
    variants: groups.map(([d, a, n]) => ({
      prompt: `Dans « ${d} ${a} ${n} », quel est le déterminant ?`,
      answer: d,
      options: [d, a, n],
    })),
  },
  {
    id: "det-tap",
    skill: "determiner",
    tier: 1,
    form: "tap",
    match: "exact",
    task: "toucher le déterminant dans une phrase",
    example:
      "Exemple : dans « Les poules picorent. », le petit mot qui présente le nom est Les.",
    variants: [
      ["Le gros chat dort.", "Le"],
      ["Une jolie fleur pousse.", "Une"],
      ["Les lapins sautent.", "Les"],
      ["Un oiseau chante.", "Un"],
      ["La petite fille rit.", "La"],
      ["Des enfants jouent.", "Des"],
      ["Le chien aboie.", "Le"],
      ["Une souris se cache.", "Une"],
      ["Les nuages passent.", "Les"],
      ["La lune brille.", "La"],
    ].map(([sentence, answer]) => ({
      prompt: "Touche le petit mot qui présente le nom.",
      sentence,
      answer,
    })),
  },
  {
    id: "det-write",
    skill: "determiner",
    tier: 2,
    form: "input",
    match: "exact",
    task: "écrire le déterminant d’un groupe de mots",
    example:
      "Exemple : dans « la petite fenêtre », on écrit le déterminant : la.",
    variants: [...groups.slice(3), ...groups.slice(0, 3)].map(([d, a, n]) => ({
      prompt: `Écris le déterminant de « ${d} ${a} ${n} ».`,
      answer: d,
    })),
  },
  {
    id: "verb-choice",
    skill: "verb",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "reconnaître le verbe dans une phrase courte",
    example:
      "Exemple : dans « Le chien court. », le verbe est court : il dit ce que fait le chien.",
    variants: [
      ["Le", "renard", "saute"],
      ["La", "fée", "chante"],
      ["Les", "lapins", "jouent"],
      ["Les", "enfants", "dessinent"],
      ["La", "princesse", "danse"],
      ["Le", "dragon", "regarde"],
      ["Les", "oiseaux", "volent"],
      ["Le", "castor", "travaille"],
      ["La", "souris", "grignote"],
      ["Les", "poules", "picorent"],
      ["Le", "pêcheur", "range"],
      ["Les", "élèves", "écoutent"],
    ].map(([d, n, v]) => ({
      prompt: `Dans « ${d} ${n} ${v}. », quel est le verbe ?`,
      answer: v,
      options: [d, n, v],
    })),
  },
  {
    id: "verb-tap",
    skill: "verb",
    tier: 1,
    form: "tap",
    match: "exact",
    task: "toucher le verbe dans une phrase",
    example: "Exemple : dans « Papa lit un livre. », le verbe est lit.",
    variants: [
      ["Le petit renard saute dans l’herbe.", "saute"],
      ["La fée chante au château.", "chante"],
      ["Les lapins mangent des carottes.", "mangent"],
      ["Le chat dort sur le canapé.", "dort"],
      ["Les enfants dessinent un dragon.", "dessinent"],
      ["L’oiseau vole vers le nid.", "vole"],
      ["La petite souris grignote du fromage.", "grignote"],
      ["Les poules picorent des graines.", "picorent"],
      ["Le facteur distribue le courrier.", "distribue"],
      ["Les élèves écoutent la maîtresse.", "écoutent"],
    ].map(([sentence, answer]) => ({
      prompt: "Touche le verbe : le mot qui dit ce que l’on fait.",
      sentence,
      answer,
    })),
  },
  {
    id: "verb-write",
    skill: "verb",
    tier: 2,
    form: "input",
    match: "loose",
    task: "écrire le verbe d’une phrase courte",
    example: "Exemple : dans « Le chien court. », on écrit le verbe : court.",
    variants: [
      ["La", "princesse", "danse"],
      ["Le", "dragon", "regarde"],
      ["Les", "oiseaux", "volent"],
      ["Le", "castor", "travaille"],
      ["La", "fée", "chante"],
      ["Les", "lapins", "jouent"],
      ["La", "souris", "grignote"],
      ["Les", "poules", "picorent"],
      ["Le", "pêcheur", "range"],
      ["Les", "élèves", "écoutent"],
    ].map(([d, n, v]) => ({
      prompt: `Écris le verbe : « ${d} ${n} ${v}. »`,
      answer: v,
    })),
  },
  {
    id: "subj-choice",
    skill: "subject",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "reconnaître le sujet entier d’une phrase",
    example:
      "Exemple : dans « Le chien court. », on demande « Qui court ? » : le chien. Le sujet est « Le chien ».",
    variants: [
      ["Le petit renard", "saute", "Le"],
      ["La petite fée", "chante", "La"],
      ["Les gentils lapins", "jouent", "Les"],
      ["Le jardinier", "travaille", "Le"],
      ["Les enfants", "dessinent", "Les"],
      ["La princesse", "danse", "La"],
      ["Le grand cheval", "galope", "Le"],
      ["Les petites souris", "grignotent", "Les"],
      ["La maîtresse", "écoute", "La"],
      ["Le gentil facteur", "distribue", "Le"],
    ].map(([s, v, first]) => ({
      prompt: `Dans « ${s} ${v}. », quel est le sujet entier ?`,
      answer: s,
      options: [s, v, first],
    })),
  },
  {
    id: "subj-who",
    skill: "subject",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "répondre à « Qui est-ce qui… ? » dans une phrase",
    example:
      "Exemple : dans « Papa lit un livre. », « Qui est-ce qui lit ? » : Papa.",
    variants: [
      ["Les enfants dessinent un dragon.", "Les enfants", "un dragon", "dessine"],
      ["Le chat boit du lait.", "Le chat", "du lait", "boit"],
      ["La fée prépare une potion.", "La fée", "une potion", "prépare"],
      ["Le castor construit un pont.", "Le castor", "un pont", "construit"],
      [
        "Les oiseaux cherchent des graines.",
        "Les oiseaux",
        "des graines",
        "cherche",
      ],
      ["La petite fille lit un livre.", "La petite fille", "un livre", "lit"],
      ["Le facteur distribue le courrier.", "Le facteur", "le courrier", "distribue"],
      ["Les poules picorent des graines.", "Les poules", "des graines", "picorent"],
      ["La maîtresse écoute les élèves.", "La maîtresse", "les élèves", "écoute"],
      ["Le pêcheur range ses filets.", "Le pêcheur", "ses filets", "range"],
    ].map(([sentence, s, o, q]) => ({
      prompt: `Dans « ${sentence} », quel groupe répond à la question « Qui est-ce qui ${q} ? »`,
      answer: s,
      options: [s, o, q],
    })),
  },
  {
    id: "subj-write",
    skill: "subject",
    tier: 2,
    form: "input",
    match: "loose",
    task: "écrire le sujet d’une phrase",
    example:
      "Exemple : dans « Le chien court. », le sujet est « Le chien ».",
    variants: [
      ["La princesse danse.", "La princesse"],
      ["Le dragon regarde.", "Le dragon"],
      ["Les oiseaux volent.", "Les oiseaux"],
      ["Le castor travaille.", "Le castor"],
      ["La fée chante.", "La fée"],
      ["Les lapins jouent.", "Les lapins"],
      ["La souris grignote.", "La souris"],
      ["Les poules picorent.", "Les poules"],
      ["Le pêcheur range.", "Le pêcheur"],
      ["Les élèves écoutent.", "Les élèves"],
    ].map(([sentence, answer]) => ({
      prompt: `Dans « ${sentence} », écris le sujet.`,
      answer,
    })),
  },
];

const DAYS = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const cyc = (list, i) => list[((i % list.length) + list.length) % list.length];
// En euros, les pièces valent 1 € ou 2 € ; à partir de 5 €, ce sont des billets.
const money = (n) => (n <= 2 ? `une pièce de ${n} €` : `un billet de ${n} €`);
const SHAPES = ["triangle", "carré", "cercle", "rectangle"];

const worldFamilies = [
  {
    id: "cal-choice",
    skill: "calendar",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "trouver le jour qui vient avant ou après",
    example:
      "Exemple : les jours se suivent : lundi, mardi, mercredi… Après lundi, c’est mardi.",
    variants: [
      ["après", 1], ["après", 2], ["après", 3], ["après", 4], ["après", 5], ["après", 6],
      ["avant", 6], ["avant", 4],
    ].map(([way, i]) => {
      const day = DAYS[i],
        answer = cyc(DAYS, way === "après" ? i + 1 : i - 1);
      return {
        prompt: `Quel jour vient ${way} ${day} ?`,
        answer,
        options: [answer, cyc(DAYS, i + (way === "après" ? 3 : -3)), cyc(DAYS, i + (way === "après" ? -1 : 1))],
      };
    }),
  },
  {
    id: "cal-month",
    skill: "calendar",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "trouver le mois qui vient après",
    example:
      "Exemple : les mois se suivent : janvier, février, mars, avril… Après mars, c’est avril.",
    variants: [9, 5, 7, 0, 4, 10, 8, 1].map((i) => {
      const answer = cyc(MONTHS, i + 1);
      return {
        prompt: `Quel mois vient après ${MONTHS[i]} ?`,
        answer,
        options: [answer, cyc(MONTHS, i - 1), cyc(MONTHS, i + 3)],
      };
    }),
  },
  {
    id: "cal-write",
    skill: "calendar",
    tier: 2,
    form: "input",
    match: "loose",
    task: "écrire le jour ou le mois qui manque",
    example:
      "Exemple : entre lundi et mercredi, il y a mardi.",
    variants: [
      ["mercredi", "vendredi", "jeudi"],
      ["jeudi", "samedi", "vendredi"],
      ["vendredi", "dimanche", "samedi"],
      ["mardi", "jeudi", "mercredi"],
      ["samedi", "lundi", "dimanche"],
      ["avril", "juin", "mai"],
      ["juillet", "septembre", "août"],
      ["novembre", "janvier", "décembre"],
      ["février", "avril", "mars"],
      ["mai", "juillet", "juin"],
    ].map(([a, b, answer]) => ({
      prompt: `Écris ce qui vient entre ${a} et ${b}.`,
      answer,
    })),
  },
  {
    id: "cal-order",
    skill: "calendar",
    tier: 2,
    form: "order",
    match: "exact",
    task: "remettre des jours ou des mois dans l’ordre",
    example:
      "Exemple : mardi, mercredi, jeudi. Mardi vient d’abord, puis mercredi, puis jeudi.",
    variants: [
      ["jeudi", "vendredi", "samedi"],
      ["vendredi", "samedi", "dimanche"],
      ["lundi", "mardi", "mercredi"],
      ["mars", "avril", "mai"],
      ["juin", "juillet", "août"],
      ["octobre", "novembre", "décembre"],
      ["mai", "juin", "juillet"],
      ["août", "septembre", "octobre"],
    ].map((items) => ({
      prompt: "Touche les mots dans l’ordre du calendrier.",
      items,
      answer: items.join(" "),
      options: items,
    })),
  },
  {
    id: "shape-choice",
    skill: "shapes",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "reconnaître une forme géométrique",
    example:
      "Exemple : 🔶 est un losange : il a 4 côtés égaux, mais ses coins ne sont pas droits.",
    variants: [
      { prompt: "Comment s’appelle cette forme ?", visual: "🔺", answer: "triangle" },
      { prompt: "Comment s’appelle cette forme ?", visual: "⬜", answer: "carré" },
      { prompt: "Comment s’appelle cette forme ?", visual: "🔵", answer: "cercle" },
      { prompt: "Comment s’appelle cette forme ?", visual: "▬", answer: "rectangle" },
      { prompt: "Quelle forme a 3 côtés et 3 coins ?", answer: "triangle" },
      { prompt: "Quelle forme a 4 côtés tous égaux et 4 coins droits ?", answer: "carré" },
      { prompt: "Quelle forme est toute ronde, sans coin ?", answer: "cercle" },
      { prompt: "Quelle forme a 4 côtés : 2 longs et 2 courts ?", answer: "rectangle" },
    ].map((v) => ({
      ...v,
      options: [v.answer, ...SHAPES.filter((x) => x !== v.answer).slice(0, 2)],
    })),
  },
  {
    id: "shape-tap",
    skill: "shapes",
    tier: 1,
    form: "tap",
    match: "exact",
    task: "trouver une forme parmi d’autres",
    example: "Exemple : parmi 🔵 🔶 🔺, le losange est 🔶.",
    variants: [
      ["Touche le triangle.", "🔵 ⬜ 🔺 ▬", "🔺"],
      ["Touche le carré.", "🔺 ⬜ 🔵 ▬", "⬜"],
      ["Touche le cercle.", "▬ 🔺 ⬜ 🔵", "🔵"],
      ["Touche le rectangle.", "🔵 🔺 ▬ ⬜", "▬"],
      ["Touche la forme ronde.", "⬜ 🔵 ▬ 🔺", "🔵"],
      ["Touche la forme à 3 côtés.", "⬜ ▬ 🔵 🔺", "🔺"],
    ].map(([prompt, sentence, answer]) => ({ prompt, sentence, answer })),
  },
  {
    id: "shape-write",
    skill: "shapes",
    tier: 2,
    form: "input",
    match: "number",
    task: "compter les côtés ou les coins d’une forme",
    example: "Exemple : un hexagone a 6 côtés.",
    variants: [
      ["Combien de côtés a un triangle ?", 3],
      ["Combien de côtés a un carré ?", 4],
      ["Combien de côtés a un rectangle ?", 4],
      ["Combien de coins a un triangle ?", 3],
      ["Combien de coins a un rectangle ?", 4],
      ["Combien de coins a un carré ?", 4],
      ["Un triangle et un carré : combien de côtés en tout ?", 7],
    ].map(([prompt, n]) => ({ prompt, answer: String(n) })),
  },
  {
    id: "clock-choice",
    skill: "clock",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "lire une heure ou une demi-heure",
    example:
      "Exemple : la petite aiguille est sur le 6 et la grande sur le 12 : il est 6 heures.",
    variants: [
      [2, false], [4, false], [7, false], [9, false], [10, false], [11, false], [3, true], [8, true],
    ].map(([h, half]) => {
      const answer = half ? `${h} heures et demie` : `${h} heures`;
      return {
        prompt: half
          ? `La petite aiguille est entre le ${h} et le ${h + 1}, la grande aiguille est sur le 6. Quelle heure est-il ?`
          : `La petite aiguille est sur le ${h}, la grande aiguille est sur le 12. Quelle heure est-il ?`,
        answer,
        options: [answer, half ? `${h} heures` : `${h} heures et demie`, `${h === 12 ? 1 : h + 1} heures`],
      };
    }),
  },
  {
    id: "clock-half",
    skill: "clock",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "placer la grande aiguille",
    example: "Exemple : à 6 heures pile, la grande aiguille est sur le 12.",
    variants: [
      [3, false], [5, true], [8, false], [10, true], [2, true], [11, false], [7, true], [9, false],
    ].map(([h, half]) => {
      const answer = half ? "sur le 6" : "sur le 12";
      return {
        prompt: `Il est ${h} heures${half ? " et demie" : ""}. Où est la grande aiguille ?`,
        answer,
        options: [answer, half ? "sur le 12" : "sur le 6", "sur le 3"],
      };
    }),
  },
  {
    id: "clock-write",
    skill: "clock",
    tier: 2,
    form: "input",
    match: "number",
    task: "calculer une heure plus tard",
    example: "Exemple : il est 5 heures. Dans 1 heure, il sera 6 heures.",
    variants: [
      [2, 3], [3, 4], [5, 3], [6, 2], [8, 2], [7, 3], [9, 2], [4, 5],
    ].map(([h, d]) => ({
      prompt: `Il est ${h} heures. Dans ${d} heure${d > 1 ? "s" : ""}, quelle heure sera-t-il ? (écris le nombre)`,
      answer: String(h + d),
      calc: { op: "+", nums: [h, d] },
    })),
  },
  {
    id: "money-choice",
    skill: "money",
    tier: 1,
    form: "choice",
    match: "exact",
    task: "additionner des pièces et des billets",
    example: "Exemple : une pièce de 2 € et une pièce de 1 € font 3 €.",
    variants: [
      [5, 2], [2, 2], [5, 5], [1, 5], [10, 5], [10, 2], [5, 1], [10, 10],
    ].map(([a, b]) => ({
      prompt: `Tu as ${money(a)} et ${money(b)}. Combien d’euros as-tu ?`,
      answer: `${a + b} €`,
      options: [`${a + b} €`, `${a + b + 1} €`, `${a + b - 1} €`],
      calc: { op: "+", nums: [a, b] },
    })),
  },
  {
    id: "money-change",
    skill: "money",
    tier: 2,
    form: "input",
    match: "number",
    task: "calculer la monnaie à rendre",
    example: "Exemple : un jouet coûte 3 €. Tu donnes 5 €. On te rend 2 €.",
    variants: [
      [10, 6], [10, 7], [10, 9], [20, 12], [20, 15], [20, 16], [20, 13],
    ].map(([given, price]) => ({
      prompt: `Un objet coûte ${price} €. Tu donnes ${given === 10 ? "un billet de 10 €" : "un billet de 20 €"}. Combien d’euros te rend-on ?`,
      answer: String(given - price),
      calc: { op: "-", nums: [given, price] },
    })),
  },
  {
    id: "money-enough",
    skill: "money",
    tier: 2,
    form: "choice",
    match: "exact",
    task: "savoir si l’on a assez d’argent",
    example: "Exemple : Tom a 4 €. Un livre coûte 3 €. Tom a assez : 4 est plus grand que 3.",
    variants: [
      [6, 8], [9, 7], [5, 5], [4, 9], [12, 10], [3, 6], [15, 20], [20, 18],
    ].map(([have, cost]) => ({
      prompt: `Léa a ${have} €. Le jouet coûte ${cost} €. Léa a-t-elle assez d’argent ?`,
      answer: have >= cost ? "oui" : "non",
      options: ["oui", "non"],
    })),
  },
];

export const FAMILIES = Object.fromEntries(
  [
    ...numberFamilies,
    ...additionFamilies,
    ...subtractFamilies,
    ...problemFamilies,
    ...readingFamilies,
    ...grammarFamilies,
    ...worldFamilies,
  ].map((f) => [f.id, f]),
);

// Pour chaque notion : familles d'un premier défi accessible (tier 1), puis d'un exemple différent pour confirmer (tier 2).
export const LADDER = {
  number: { tier1: ["num-build", "num-compare", "num-order"], tier2: ["num-write"] },
  addition: { tier1: ["add-count", "add-groups"], tier2: ["add-ten"] },
  subtract: { tier1: ["sub-count", "sub-groups"], tier2: ["sub-ten"] },
  problem: { tier1: ["prob-add-choice", "prob-add"], tier2: ["prob-sub"] },
  reading: { tier1: ["read-find"], tier2: ["read-write", "read-why"] },
  noun: { tier1: ["noun-choice", "noun-tap"], tier2: ["noun-write"] },
  determiner: { tier1: ["det-choice", "det-tap"], tier2: ["det-write"] },
  verb: { tier1: ["verb-choice", "verb-tap"], tier2: ["verb-write"] },
  subject: { tier1: ["subj-choice", "subj-who"], tier2: ["subj-write"] },
  calendar: { tier1: ["cal-choice", "cal-month"], tier2: ["cal-write", "cal-order"] },
  shapes: { tier1: ["shape-choice", "shape-tap"], tier2: ["shape-write"] },
  clock: { tier1: ["clock-choice", "clock-half"], tier2: ["clock-write"] },
  money: { tier1: ["money-choice"], tier2: ["money-change", "money-enough"] },
};

export const FORM_LABELS = {
  choice: "choix multiple",
  input: "réponse écrite courte",
  blocks: "manipulation",
  tap: "manipulation (toucher un mot)",
  order: "manipulation (remettre dans l’ordre)",
};

export function has(id) {
  return Object.hasOwn(FAMILIES, id);
}

// Options mélangées de façon déterministe. Pour « ordre », le mélange ne doit jamais déjà être la bonne réponse.
function arranged(form, v, key) {
  const list = shuffled(v.options, key);
  if (form === "order" && list.join(" ") === v.answer) list.push(list.shift());
  return list;
}

// Question prête à afficher. Pure : même (id, variante, graine) → même question, y compris après un rechargement.
export function make(id, variant, seed = 0) {
  const f = FAMILIES[id],
    v = f.variants[variant];
  const reading = f.skill === "reading";
  return {
    item: id,
    variant,
    skill: f.skill,
    tier: f.tier,
    form: f.form,
    task: f.task,
    match: f.match,
    example: f.example,
    prompt: v.prompt,
    passage: v.passage || "",
    sentence: v.sentence || "",
    visual: v.visual || "",
    answer: v.answer,
    accepted: v.accepted || [],
    options: v.options ? arranged(f.form, v, `${id}:${variant}:${seed}`) : [],
    tokens: v.sentence ? v.sentence.split(" ") : [],
    numeric: f.match === "number",
    // Lecture : la voix ne lit qu'une consigne générale, jamais le texte observé.
    speech: reading ? "instruction" : "prompt",
    instruction: reading ? READING_INSTRUCTION : "",
    fingerprint: `${id}:${variant}`,
  };
}

const strip = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:«»"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const dropArticle = (s) =>
  s.replace(/^(?:(?:les|le|la|une|un|des|du)\s+|l')/, "");
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(
        row[j] + 1,
        row[j - 1] + 1,
        prev + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      prev = tmp;
    }
  }
  return row[b.length];
}
export function looseEqual(expected, given) {
  const a = dropArticle(strip(expected)),
    b = dropArticle(strip(given));
  if (!b) return false;
  return a === b || (a.length >= 4 && distance(a, b) <= 1);
}
const exact = (s) =>
  String(s)
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[’]/g, "'")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
export function judge(q, value) {
  const v = String(value ?? "");
  if (q.match === "number") return /^\d{1,3}$/.test(v.trim()) && Number(v) === Number(q.answer);
  if (q.match === "loose")
    return [q.answer, ...q.accepted].some((a) => looseEqual(a, v));
  return exact(q.answer) === exact(v);
}
