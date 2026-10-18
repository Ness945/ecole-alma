const nouns = [
  ["chat", "chats", "m"],
  ["lapin", "lapins", "m"],
  ["dragon", "dragons", "m"],
  ["cabane", "cabanes", "f"],
  ["fleur", "fleurs", "f"],
  ["étoile", "étoiles", "f"],
];
export function rng(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function group(seed) {
  const r = rng(seed),
    n = nouns[Math.floor(r() * nouns.length)],
    plural = r() > 0.5;
  return {
    det: plural ? "les" : n[2] === "f" ? "la" : "le",
    adj: "petit" + (n[2] === "f" ? "e" : "") + (plural ? "s" : ""),
    noun: n[plural ? 1 : 0],
    gender: n[2],
    plural,
  };
}
export const normalize = (s) =>
  String(s)
    .normalize("NFC")
    .trim()
    .toLocaleLowerCase("fr")
    .replace(/[.!?]+$/, "")
    .replace(/\s+/g, " ");
export function exercise(id, seed, level = 2, turn = 0) {
  const r = rng(seed),
    a = 2 + Math.floor(r() * 8),
    b = 1 + Math.floor(r() * 8),
    g = group(seed);
  const choice = turn % 3 === 0;
  const q = {
    skill: id,
    dimension: choice ? "recognition" : "production",
    type: choice ? "choice" : "input",
    prompt: "",
    answer: "",
    options: [],
    hint: "",
    visual: "",
    audio: "",
    lang: "fr-FR",
  };
  switch (id) {
    case "multiplication": {
      const groups = 2 + (seed % 4),
        each = 2 + (Math.floor(seed / 4) % 4);
      q.prompt =
        turn % 3 === 2
          ? `Pour le goûter, ${groups} paniers contiennent chacun ${each} pommes. Combien y a-t-il de pommes en tout ?`
          : `Combien font ${groups} × ${each} ?`;
      q.answer = String(groups * each);
      q.dimension =
        turn % 3 === 2 ? "transfer" : choice ? "recognition" : "production";
      q.hint = `Dessine ${groups} groupes de ${each} points. Additionne ${Array(groups).fill(each).join(" + ")}.`;
      q.visual =
        level < 3
          ? Array(groups)
              .fill("[" + "● ".repeat(each).trim() + "]")
              .join("  ")
          : "";
      break;
    }
    case "number": {
      const tens = 1 + Math.floor(r() * 5),
        units = Math.floor(r() * 10);
      q.prompt = `Construis ${tens * 10 + units} avec les dizaines et les unités.`;
      q.type = "blocks";
      q.dimension = "manipulation";
      q.answer = String(tens * 10 + units);
      q.hint = "Une barre vaut 10. Un petit cube vaut 1.";
      if (turn % 3) {
        q.type = turn % 3 === 1 ? "input" : "choice";
        q.dimension = turn % 3 === 1 ? "production" : "recognition";
        q.prompt = `${tens} dizaines et ${units} unités : quel nombre ?`;
        q.visual = "▰ ".repeat(tens) + " · " + "▪ ".repeat(units);
      }
      break;
    }
    case "addition":
      q.prompt = `Combien font ${a} + ${b} ?`;
      q.answer = String(a + b);
      q.hint = `Pars de ${a}, puis avance de ${b}.`;
      q.visual = level < 3 ? "🍎".repeat(a) + " + " + "🍎".repeat(b) : "";
      break;
    case "subtract":
      q.prompt = `Combien font ${a + b} − ${b} ?`;
      q.answer = String(a);
      q.hint = `Dessine ${a + b} points et barre ${b} points.`;
      break;
    case "problem":
      q.type = "input";
      q.dimension = "transfer";
      q.prompt = `Le dragon a ${a + b} fruits. Il en donne ${b} à Luna. Combien lui en reste-t-il ?`;
      q.answer = String(a);
      q.hint = `Représente les ${a + b} fruits, puis enlève ceux qu’il donne.`;
      q.visual = "🐉 🧺 → 🦄";
      break;
    case "noun":
    case "determiner":
    case "adjective": {
      const part = id === "noun" ? "noun" : id === "determiner" ? "det" : "adj";
      q.prompt = `Dans « ${g.det} ${g.adj} ${g.noun} », quel est ${id === "noun" ? "le nom" : id === "determiner" ? "le déterminant" : "l’adjectif"} ?`;
      q.answer = g[part];
      q.options = [g.det, g.adj, g.noun];
      q.hint =
        id === "noun"
          ? "Cherche l’animal ou la chose."
          : id === "determiner"
            ? "Cherche seulement le petit mot qui présente le nom."
            : "Cherche le mot qui dit comment est la chose ou l’animal.";
      break;
    }
    case "agreement":
      q.type = "input";
      q.dimension = "production";
      q.prompt = `Complète : ${g.det} … ${g.noun}. Utilise le mot « petit » en l’accordant.`;
      q.answer = g.adj;
      q.hint = `Le nom est ${g.gender === "f" ? "féminin" : "masculin"} et ${g.plural ? "pluriel" : "singulier"}.`;
      break;
    case "sentence": {
      const variants = [
        ["Le", "chat", "dort."],
        ["La", "fée", "chante."],
        ["Le", "dragon", "vole."],
        ["Le", "lapin", "saute."],
      ];
      const words = variants[seed % 4];
      q.type = "order";
      q.dimension = "manipulation";
      q.prompt =
        "Remets les mots dans l’ordre pour raconter une petite histoire.";
      q.answer = words.join(" ");
      q.words = [...words.slice(1), words[0]];
      q.hint = "Commence par la majuscule. Le point termine la phrase.";
      break;
    }
    case "reading": {
      const variants = [
        [
          "Lina cache une clé sous un pot. Elle appelle Luna.",
          "Que cache Lina ?",
          "une clé",
          ["une clé", "un pot", "un livre"],
        ],
        [
          "Milo porte un panier. Dans le panier, un chat dort.",
          "Quel animal dort dans le panier ?",
          "un chat",
          ["un chat", "un lapin", "un chien"],
        ],
        [
          "La fée pose une fleur près du pont. Puis elle rentre au château.",
          "Que pose la fée ?",
          "une fleur",
          ["une fleur", "une clé", "une pomme"],
        ],
      ];
      const v = variants[seed % 3];
      q.passage = v[0];
      q.prompt = v[1];
      q.answer = v[2];
      q.options = v[3];
      q.hint = "Relis le texte et cherche ce que fait le personnage.";
      break;
    }
    case "living": {
      const v = [
        ["un arbre", "vivant"],
        ["une pierre", "non-vivant"],
        ["un papillon", "vivant"],
        ["une chaise", "non-vivant"],
        ["un lapin", "vivant"],
        ["une fleur", "vivant"],
      ][seed % 6];
      q.type = "choice";
      q.dimension = "recognition";
      q.prompt = `${v[0]} : vivant ou non-vivant ?`;
      q.answer = v[1];
      q.options = ["vivant", "non-vivant"];
      q.hint =
        "Un être vivant grandit et se nourrit. Il peut être immobile, comme un arbre.";
      break;
    }
    case "seasons": {
      const seasons = ["printemps", "été", "automne", "hiver"],
        i = seed % 4;
      q.prompt = `Quelle saison vient après ${seasons[i] === "printemps" ? "le printemps" : seasons[i] === "été" ? "l’été" : seasons[i] === "automne" ? "l’automne" : "l’hiver"} en France ?`;
      q.answer = seasons[(i + 1) % 4];
      q.options = seasons;
      q.hint =
        "Le cycle est : printemps, été, automne, hiver, puis il recommence.";
      break;
    }
    case "colors":
    case "animals": {
      const v =
        id === "colors"
          ? [
              ["red", "rouge"],
              ["blue", "bleu"],
              ["green", "vert"],
              ["yellow", "jaune"],
            ]
          : [
              ["cat", "chat"],
              ["dog", "chien"],
              ["rabbit", "lapin"],
              ["bird", "oiseau"],
            ];
      const selected = v[seed % 4];
      q.type = "choice";
      q.dimension = "recognition";
      q.prompt = "Écoute le mot anglais, puis choisis ce qu’il signifie.";
      q.audio = selected[0];
      q.lang = "en-GB";
      q.answer = selected[1];
      q.options = v.map((x) => x[1]);
      q.hint = `Le mot entendu signifie « ${q.answer} ». Réécoute-le, puis essaie avec un autre mot.`;
      break;
    }
    default:
      throw Error("Compétence inconnue");
  }
  if (q.type === "choice" && !q.options.length)
    q.options = [
      q.answer,
      String(Number(q.answer) + 1),
      String(Math.max(0, Number(q.answer) - 1)),
    ];
  q.options = [...new Set(q.options)].sort(() => r() - 0.5);
  q.fingerprint = id + ":" + q.prompt + ":" + q.answer;
  return q;
}
export function check(q, value) {
  return normalize(q.answer) === normalize(value);
}
export function diagnostic(q, value) {
  if (q.skill === "determiner" && normalize(value).includes(q.answer))
    return {
      code: "determiner_group",
      text: "Tu as trouvé le bon début du groupe. Cherche seulement le petit mot qui présente le nom.",
    };
  return {
    code: ["number", "addition", "subtract", "problem"].includes(q.skill)
      ? "calculation"
      : "needs_practice",
    text: q.hint,
  };
}
