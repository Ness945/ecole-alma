import { curriculumSkills, curriculumDemos, curriculumExercise, curriculumNumeric } from "./curriculum-skills.js";
export const extraSkills = [
...[
  [
    "hundreds",
    "Mathématiques",
    "Les nombres jusqu’à 1 000",
    ["number"],
    "Une centaine contient dix dizaines, soit cent unités. Dans 243, il y a 2 centaines, 4 dizaines et 3 unités : 200 + 40 + 3.",
    "🧱",
  ],
  [
    "compare",
    "Mathématiques",
    "Comparer les nombres",
    ["hundreds"],
    "Compare d’abord les centaines, puis les dizaines, puis les unités. 342 est plus grand que 329 : même centaine, mais 4 dizaines au lieu de 2.",
    "⚖️",
  ],
  [
    "complements",
    "Mathématiques",
    "Les compléments à 10 et 20",
    ["addition"],
    "Pour aller de 7 à 10, il manque 3. Pense aux cases vides dans une boîte de dix : 7 + 3 = 10.",
    "🔟",
  ],
  [
    "doubles",
    "Mathématiques",
    "Les doubles",
    ["addition"],
    "Le double, c’est deux fois la même quantité. Le double de 6 est 6 + 6, donc 12.",
    "🍒",
  ],
  [
    "halves",
    "Mathématiques",
    "Les moitiés",
    ["doubles"],
    "Trouver la moitié, c’est partager en deux groupes égaux. Avec 12 billes, chaque groupe reçoit 6 billes.",
    "🍊",
  ],
  [
    "money",
    "Mathématiques",
    "La monnaie en euros",
    ["addition", "subtract"],
    "Additionne la valeur des pièces, pas leur nombre. Une pièce de 2 euros et une pièce de 1 euro valent 3 euros. Pour rendre la monnaie, on cherche la différence.",
    "💰",
  ],
  [
    "clock",
    "Mathématiques",
    "Lire les heures et demi-heures",
    ["number"],
    "La petite aiguille indique les heures. À 3 heures, la grande aiguille est sur 12. À 3 heures et demie, elle est sur 6 et la petite est entre 3 et 4.",
    "🕒",
  ],
  [
    "shapes",
    "Mathématiques",
    "Les formes géométriques",
    [],
    "Un triangle a trois côtés et trois sommets. Un carré a quatre côtés de même longueur et quatre angles droits. Un rectangle a quatre angles droits.",
    "🔺",
  ],
  [
    "verb",
    "Français",
    "Repérer le verbe",
    ["noun"],
    "Le verbe peut dire ce que fait quelqu’un. Dans « Le renard saute », saute est le verbe. On peut changer le temps : hier, le renard sautait.",
    "⚡",
  ],
  [
    "subject",
    "Français",
    "Trouver le sujet",
    ["verb"],
    "Cherche le verbe, puis demande « Qui est-ce qui… ? ». Dans « Le petit renard saute », qui saute ? Le petit renard : c’est le sujet entier.",
    "👑",
  ],
  [
    "present_er",
    "Français",
    "Les verbes en -er au présent",
    ["subject"],
    "Pour chanter au présent : je chante, tu chantes, il chante, nous chantons, vous chantez, elles chantent. Le sujet aide à choisir la terminaison.",
    "🎵",
  ],
  [
    "etre",
    "Français",
    "Être au présent",
    ["subject"],
    "Je suis, tu es, elle est, nous sommes, vous êtes, ils sont. Ces formes se mémorisent. « Vous êtes dans le jardin. »",
    "✨",
  ],
  [
    "avoir",
    "Français",
    "Avoir au présent",
    ["subject"],
    "J’ai, tu as, il a, nous avons, vous avez, elles ont. « Nous avons un livre. » Le verbe change avec son sujet.",
    "🎒",
  ],
  [
    "calendar",
    "Questionner le monde",
    "Les jours et les mois",
    [],
    "Les jours se suivent : lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche, puis lundi. Une semaine compte sept jours. Une année compte douze mois.",
    "📅",
  ],
  [
    "english_numbers",
    "Anglais",
    "Les nombres de 1 à 10",
    [],
    "Écoute : one, two, three, four, five, six, seven, eight, nine, ten. On peut montrer la quantité avec ses doigts.",
    "🎧",
  ],
].map(([id, subject, name, pre, lesson, icon]) => ({
  id,
  subject,
  name,
  pre,
  lesson,
  icon,
})),
...curriculumSkills,
];
export const sentences = [
  ["Le renard", "saute", "sauter"],
  ["La petite fée", "chante", "chanter"],
  ["Les lapins", "jouent", "jouer"],
  ["Le jardinier", "plante", "planter"],
  ["Les enfants", "dessinent", "dessiner"],
  ["La princesse", "danse", "danser"],
  ["Le dragon", "regarde", "regarder"],
  ["Les oiseaux", "volent", "voler"],
  ["La petite fille", "marche", "marcher"],
  ["Les chats", "rêvent", "rêver"],
  ["Le castor", "travaille", "travailler"],
  ["Les aventurières", "parlent", "parler"],
];
export const stories = [
  [
    "Lina cache une clé sous un pot. Puis elle appelle Luna.",
    "Que cache Lina ?",
    "une clé",
    ["un livre", "une pomme"],
    "clé",
  ],
  [
    "Milo porte un panier. Dans le panier, un chat dort.",
    "Quel animal dort dans le panier ?",
    "un chat",
    ["un chien", "un lapin"],
    "chat",
  ],
  [
    "La fée pose une fleur près du pont. Puis elle rentre au château.",
    "Que pose la fée ?",
    "une fleur",
    ["une pierre", "une clé"],
    "fleur",
  ],
  [
    "Le renard a froid. Alma lui apporte une couverture et il se blottit dessous.",
    "Pourquoi Alma apporte-t-elle une couverture ?",
    "il a froid",
    ["il a faim", "il veut courir"],
    "parce qu’il a froid",
  ],
  [
    "Nora plante une graine lundi. Mardi, elle arrose la terre.",
    "Que fait Nora mardi ?",
    "elle arrose",
    ["elle plante", "elle cueille"],
    "elle arrose la terre",
  ],
  [
    "Le dragon cherche son ballon. Il le retrouve derrière le banc.",
    "Où est le ballon ?",
    "derrière le banc",
    ["dans la cabane", "sous la table"],
    "derrière un banc",
  ],
  [
    "Luna prend un livre bleu et un livre vert. Elle donne le livre vert au castor.",
    "Quel livre Luna garde-t-elle ?",
    "le livre bleu",
    ["le livre vert", "le livre rouge"],
    "bleu",
  ],
  [
    "Il pleut dans le jardin. Les enfants rentrent dans la cabane pour rester au sec.",
    "Pourquoi les enfants rentrent-ils ?",
    "pour rester au sec",
    ["pour nager", "pour planter"],
    "parce qu’il pleut",
  ],
  [
    "Une cloche sonne. Le jardinier ferme sa boîte et va manger.",
    "Que fait le jardinier après avoir fermé sa boîte ?",
    "il va manger",
    ["il dort", "il plante"],
    "manger",
  ],
  [
    "Le hibou trouve une plume près de la fontaine. Il la glisse dans son sac.",
    "Où le hibou met-il la plume ?",
    "dans son sac",
    ["dans un arbre", "sur le pont"],
    "son sac",
  ],
  [
    "La princesse prépare une soupe. Elle lave les carottes avant de les couper.",
    "Que fait-elle avant de couper les carottes ?",
    "elle les lave",
    ["elle les mange", "elle les plante"],
    "laver les carottes",
  ],
  [
    "Au matin, le pont est mouillé. Il a plu pendant la nuit.",
    "Quand a-t-il plu ?",
    "pendant la nuit",
    ["à midi", "demain"],
    "la nuit",
  ],
  [
    "Sami veut dessiner un arbre. Son crayon est cassé. Il prend un autre crayon.",
    "Pourquoi Sami prend-il un autre crayon ?",
    "son crayon est cassé",
    ["il a fini", "il veut dormir"],
    "parce que son crayon est cassé",
  ],
  [
    "La fée prête son chapeau à Léa. Le soir, Léa le lui rend.",
    "À qui appartient le chapeau ?",
    "à la fée",
    ["à Léa", "au dragon"],
    "la fée",
  ],
  [
    "Deux chemins mènent au château. Luna choisit celui qui passe près du lac.",
    "Près de quoi passe Luna ?",
    "du lac",
    ["du marché", "de la gare"],
    "le lac",
  ],
  [
    "Le castor fabrique une table avec du bois. Il utilise ensuite un pinceau pour la peindre.",
    "Avec quoi peint-il la table ?",
    "un pinceau",
    ["un marteau", "une cuillère"],
    "pinceau",
  ],
  [
    "Emma entend un bruit dans les feuilles. Un hérisson en sort doucement.",
    "Quel animal sort des feuilles ?",
    "un hérisson",
    ["un renard", "un chat"],
    "hérisson",
  ],
  [
    "La bibliothèque ferme bientôt. Tom range son livre puis salue la gardienne.",
    "Que fait Tom avant de saluer ?",
    "il range son livre",
    ["il ouvre une fenêtre", "il court"],
    "ranger son livre",
  ],
  [
    "Le lapin veut rejoindre ses amis de l’autre côté de la rivière. Il emprunte le pont.",
    "Comment le lapin traverse-t-il ?",
    "par le pont",
    ["à la nage", "en bateau"],
    "il emprunte le pont",
  ],
  [
    "Le vent emporte le dessin de Zoé. Le dessin se pose au pied d’un arbre.",
    "Qu’est-ce que le vent emporte ?",
    "le dessin",
    ["le sac", "le chapeau"],
    "un dessin",
  ],
  [
    "Le jardinier cueille des fraises mûres. Il laisse les fraises vertes sur la plante.",
    "Quelles fraises laisse-t-il ?",
    "les fraises vertes",
    ["les fraises mûres", "les fraises rouges"],
    "les vertes",
  ],
  [
    "Un escargot avance sur une feuille. Luna le regarde sans le toucher.",
    "Que fait Luna ?",
    "elle observe",
    ["elle le déplace", "elle court"],
    "elle regarde",
  ],
  [
    "Le dragon prépare son sac : une gourde pour boire et une carte pour trouver son chemin.",
    "À quoi sert la carte ?",
    "à trouver son chemin",
    ["à boire", "à manger"],
    "trouver son chemin",
  ],
  [
    "Le chat dormait sous la table. Un bruit le réveille et il ouvre les yeux.",
    "Qu’est-ce qui réveille le chat ?",
    "un bruit",
    ["une fleur", "un livre"],
    "le bruit",
  ],
];
export function clockSvg(hour, half = false) {
  const angle = (hour % 12) * 30 + (half ? 15 : 0),
    rad = (angle * Math.PI) / 180,
    x = 100 + 40 * Math.sin(rad),
    y = 100 - 40 * Math.cos(rad);
  return `<svg viewBox="0 0 200 200" class="learning-clock" role="img" aria-label="Horloge à lire"><circle cx="100" cy="100" r="91" fill="#fffaf0" stroke="#80719e" stroke-width="7"/>${Array.from(
    { length: 12 },
    (_, i) => {
      const n = i + 1,
        a = (n * Math.PI) / 6;
      return `<text x="${100 + 72 * Math.sin(a)}" y="${106 - 72 * Math.cos(a)}" text-anchor="middle" font-size="16" fill="#454058">${n}</text>`;
    },
  ).join(
    "",
  )}<path d="M100 100L${x} ${y}" stroke="#765788" stroke-width="8" stroke-linecap="round"/><path d="M100 100V${half ? 160 : 40}" stroke="#438c8b" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#454058"/></svg>`;
}
export function extraExercise(q, id, seed, turn) {
  const a = 2 + (seed % 9),
    b = 2 + (Math.floor(seed / 9) % 8),
    mode = turn % 3;
  switch (id) {
    case "hundreds": {
      const h = 1 + (seed % 9),
        t = Math.floor(seed / 9) % 10,
        u = Math.floor(seed / 90) % 10;
      q.prompt = `${h} centaines, ${t} dizaines et ${u} unités : quel nombre ?`;
      q.answer = String(h * 100 + t * 10 + u);
      q.hint = `Une centaine vaut 100. Additionne ${h * 100} + ${t * 10} + ${u}.`;
      break;
    }
    case "compare": {
      const x = 100 + (seed % 800),
        y = x + 1 + (Math.floor(seed / 800) % 99);
      q.prompt = `Quel est le plus ${mode === 2 ? "petit" : "grand"} : ${seed % 2 ? x : y} ou ${seed % 2 ? y : x} ?`;
      q.answer = String(mode === 2 ? x : y);
      q.options = [String(x), String(y)];
      q.hint =
        "Compare d’abord les centaines. Si elles sont égales, compare les dizaines puis les unités.";
      break;
    }
    case "complements": {
      const target = mode === 2 ? 20 : 10,
        n = 1 + (seed % (target - 1));
      q.prompt = `${n} + … = ${target}. Quel nombre manque ?`;
      q.answer = String(target - n);
      q.hint = `Pars de ${n} et compte ce qu’il manque pour arriver à ${target}.`;
      break;
    }
    case "doubles":
      q.prompt = `Quel est le double de ${a} ?`;
      q.answer = String(a * 2);
      q.hint = `Additionne ${a} + ${a}.`;
      break;
    case "halves":
      q.prompt = `Quelle est la moitié de ${a * 2} ?`;
      q.answer = String(a);
      q.hint = `Partage ${a * 2} objets en deux groupes égaux.`;
      break;
    case "money": {
      if (mode === 2) {
        q.prompt = `Un carnet coûte ${a} euros. Tu donnes ${a + b} euros. Combien d’euros doit-on te rendre ?`;
        q.answer = String(b);
        q.dimension = "transfer";
        q.hint = `Cherche la différence entre ${a + b} et ${a}.`;
      } else {
        q.prompt = `Tu as ${a} pièces de 2 euros et ${b} pièces de 1 euro. Combien d’euros as-tu ?`;
        q.answer = String(a * 2 + b);
        q.hint = `Les pièces de 2 euros valent ensemble ${a * 2} euros. Ajoute ensuite les pièces de 1 euro.`;
      }
      break;
    }
    case "clock": {
      const hour = 1 + (seed % 12),
        half = mode !== 0;
      q.type = "input";
      q.dimension = "production";
      q.prompt =
        "Quelle heure indique cette horloge ? Écris par exemple 4h ou 4h30.";
      q.visual = clockSvg(hour, half);
      q.answer = `${hour}h${half ? "30" : ""}`;
      q.accepted = half
        ? [`${hour}:30`, `${hour} h 30`, `${hour} heures et demie`]
        : [`${hour}`, `${hour}:00`, `${hour}h00`, `${hour} heures`];
      q.hint =
        "La petite aiguille violette indique les heures. La grande aiguille verte indique les minutes : sur 12, heure entière ; sur 6, trente minutes.";
      break;
    }
    case "shapes": {
      const forms = [
        ["triangle", 3, '<polygon points="100,12 185,170 15,170"/>'],
        ["carré", 4, '<rect x="25" y="25" width="150" height="150"/>'],
        ["rectangle", 4, '<rect x="10" y="50" width="180" height="100"/>'],
      ];
      const f = forms[seed % 3];
      q.visual = `<svg class="learning-clock" viewBox="0 0 200 200" role="img" aria-label="Forme à observer"><g fill="#e7d6ed" stroke="#7d608d" stroke-width="5">${f[2]}</g></svg>`;
      q.prompt =
        mode === 2
          ? "Combien de côtés possède cette forme ?"
          : "Comment s’appelle cette forme ?";
      q.answer = String(mode === 2 ? f[1] : f[0]);
      q.options = mode === 2 ? ["3", "4", "5"] : forms.map((f) => f[0]);
      q.hint =
        mode === 2
          ? "Suis le contour et compte chaque segment droit une seule fois."
          : "Observe le nombre de côtés, leurs longueurs et les angles.";
      q.numeric = mode === 2;
      break;
    }
    case "verb":
    case "subject": {
      const [subject, verb] = sentences[seed % sentences.length];
      q.prompt = `Dans « ${subject} ${verb}. », quel est ${id === "verb" ? "le verbe" : "le sujet entier"} ?`;
      q.answer = id === "verb" ? verb : subject;
      q.options = [subject, verb, subject.split(" ")[0]];
      q.hint =
        id === "verb"
          ? "Quel mot dit ce que fait le personnage ?"
          : `Qui est-ce qui ${verb} ? Garde tous les mots qui désignent ce personnage.`;
      break;
    }
    case "present_er":
    case "etre":
    case "avoir": {
      const i = seed % 6,
        pronouns = ["je", "tu", "elle", "nous", "vous", "ils"];
      let forms, inf;
      if (id === "present_er") {
        inf = ["chanter", "jouer", "danser", "regarder", "parler", "dessiner"][
          Math.floor(seed / 6) % 6
        ];
        const root = inf.slice(0, -2);
        forms = ["e", "es", "e", "ons", "ez", "ent"].map((e) => root + e);
      } else {
        inf = id === "etre" ? "être" : "avoir";
        forms =
          id === "etre"
            ? ["suis", "es", "est", "sommes", "êtes", "sont"]
            : ["ai", "as", "a", "avons", "avez", "ont"];
      }
      q.prompt = `Complète au présent avec « ${inf} » : ${id === "avoir" && i === 0 ? "j’" : pronouns[i] + " "}…`;
      q.answer = forms[i];
      q.options = [...new Set(forms)];
      q.hint = `Repère le sujet « ${pronouns[i]} », puis retrouve la forme de « ${inf} » qui lui correspond.`;
      break;
    }
    case "calendar": {
      const days = [
          "lundi",
          "mardi",
          "mercredi",
          "jeudi",
          "vendredi",
          "samedi",
          "dimanche",
        ],
        months = [
          "janvier",
          "février",
          "mars",
          "avril",
          "mai",
          "juin",
          "juillet",
          "août",
          "septembre",
          "octobre",
          "novembre",
          "décembre",
        ];
      const list = mode === 2 ? months : days,
        i = seed % list.length,
        back = mode === 1 || (mode === 2 && Math.floor(seed / 12) % 3 === 1),
        shift = back ? list.length - 1 : 1;
      q.prompt =
        mode === 2
          ? "Quel mois vient " + (back ? "avant " : "après ") + list[i] + " ?"
          : "Quel jour vient " + (back ? "avant " : "après ") + list[i] + " ?";
      q.answer = list[(i + shift) % list.length];
      q.options = [q.answer, list[i], list[(i + 3) % list.length]];
      q.tolerant = true;
      // Pour les mois : seulement les voisins, pas douze mots d'un coup.
      q.hint =
        mode === 2
          ? "Dans l’ordre : …" +
            [-2, -1, 0, 1, 2].map((d) => list[(i + d + list.length) % list.length]).join(", ") +
            "… Puis le cycle recommence en janvier."
          : list.join(", ") + ". Puis le cycle recommence.";
      break;
    }
    case "english_numbers": {
      const words = [
          "one",
          "two",
          "three",
          "four",
          "five",
          "six",
          "seven",
          "eight",
          "nine",
          "ten",
        ],
        n = (seed % 10) + 1;
      q.type = "choice";
      q.dimension = "recognition";
      q.prompt = "Écoute le nombre anglais et choisis sa quantité.";
      q.audio = words[n - 1];
      q.lang = "en-GB";
      q.answer = String(n);
      q.options = [String(n), String((n % 10) + 1), String(((n + 3) % 10) + 1)];
      q.hint = `Le nombre entendu correspond à ${n}. Réécoute-le avant un autre exemple.`;
      break;
    }
    default:
      if (!curriculumExercise(q, id, seed, turn)) return false;
      if (curriculumNumeric.has(id) && q.type === "input") q.numeric = true;
      return true;
  }
  if (
    [
      "hundreds",
      "compare",
      "complements",
      "doubles",
      "halves",
      "money",
    ].includes(id)
  )
    q.numeric = true;
  return true;
}
export const extraDemos = {
  ...curriculumDemos,
  hundreds: [
    "🧱 🧱",
    "200 + 40 + 3",
    "243 : 2 centaines, 4 dizaines, 3 unités.",
  ],
  compare: [
    "342 · 329",
    "Même nombre de centaines…",
    "342 est le plus grand : ses 4 dizaines sont plus nombreuses que les 2 dizaines de 329.",
  ],
  complements: [
    "● ● ● ● ● ● ● ○ ○ ○",
    "7 objets dans une boîte de 10",
    "Trois places sont libres : 7 + 3 = 10.",
  ],
  doubles: [
    "🍒 🍒 🍒",
    "Deux groupes de 3",
    "3 + 3 = 6 : le double de 3 est 6.",
  ],
  halves: [
    "🍎 🍎 🍎 | 🍎 🍎 🍎",
    "Six pommes partagées en deux groupes égaux",
    "Chaque groupe en reçoit 3 : la moitié de 6 est 3.",
  ],
  money: [
    "2 € + 2 € + 1 €",
    "Trois pièces, mais combien d’euros ?",
    "2 + 2 + 1 = 5 euros. Le nombre de pièces et leur valeur sont différents.",
  ],
  clock: [
    clockSvg(3, true),
    "Observe les deux aiguilles",
    "Il est 3 h 30 : petite aiguille entre 3 et 4, grande aiguille sur 6.",
  ],
  shapes: [
    "△ □ ▭",
    "Trois formes à observer",
    "Le triangle a 3 côtés. Le carré et le rectangle ont chacun 4 côtés et 4 angles droits.",
  ],
  verb: [
    "🦊",
    "Le renard saute.",
    "Saute dit ce que fait le renard : c’est le verbe.",
  ],
  subject: [
    "🦊",
    "Le petit renard saute.",
    "Qui saute ? Le petit renard. Le sujet est le groupe entier, pas seulement « renard ».",
  ],
  present_er: [
    "🎵",
    "Nous … (chanter)",
    "Nous chantons. Avec nous, la terminaison est -ons.",
  ],
  etre: [
    "✨",
    "Vous … dans le jardin.",
    "Vous êtes dans le jardin. Êtes est la forme du verbe être avec vous.",
  ],
  avoir: [
    "🎒",
    "Nous … des livres.",
    "Nous avons des livres. Avons est la forme du verbe avoir avec nous.",
  ],
  calendar: [
    "📅 lun · mar · mer · jeu · ven · sam · dim",
    "Sept jours, douze mois : on tourne en rond",
    "Après dimanche vient lundi. Après décembre vient janvier. Avant mardi, c’est lundi. Dis-les doucement à voix haute, comme une chanson.",
  ],
  english_numbers: [
    "1 · 2 · 3 · 4 · 5",
    "One · two · three · four · five",
    "Un · deux · trois · quatre · cinq",
  ],
};
