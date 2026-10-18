import { extraExercise, stories, sentences } from "./expansion.js";
const nouns = [
  ["renard", "renards", "m"],
  ["livre", "livres", "m"],
  ["jardin", "jardins", "m"],
  ["panier", "paniers", "m"],
  ["chemin", "chemins", "m"],
  ["mouton", "moutons", "m"],
  ["papillon", "papillons", "m"],
  ["maison", "maisons", "f"],
  ["pomme", "pommes", "f"],
  ["rivière", "rivières", "f"],
  ["table", "tables", "f"],
  ["porte", "portes", "f"],
  ["plante", "plantes", "f"],
  ["graine", "graines", "f"],
  ["feuille", "feuilles", "f"],
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
    case "problem": {
      q.type = "input";
      q.dimension = "transfer";
      const kind = seed % 6;
      const variants = [
        [
          "Luna a " +
            a +
            " graines. Le castor lui en offre " +
            b +
            ". Combien en a-t-elle maintenant ?",
          a + b,
          "Réunis les deux groupes de graines.",
        ],
        [
          "Le dragon a " +
            (a + b) +
            " fruits. Il en donne " +
            b +
            ". Combien lui en reste-t-il ?",
          a,
          "Dessine les fruits puis barre ceux qui sont donnés.",
        ],
        [
          "Il y a " +
            (a + b) +
            " livres sur deux étagères. La première porte " +
            b +
            " livres. Combien sont sur la seconde ?",
          a,
          "Le total est partagé en deux groupes. Cherche le groupe manquant.",
        ],
        [
          "Nora a " +
            (a + b) +
            " billes et Milo en a " +
            b +
            ". Combien Nora a-t-elle de billes de plus que Milo ?",
          a,
          "Associe leurs billes une à une. Compte celles qui restent à Nora.",
        ],
        [
          "Le jardin contient " +
            b +
            " fleurs rouges et " +
            a +
            " fleurs jaunes. Combien de fleurs y a-t-il en tout ?",
          a + b,
          "Réunis les fleurs rouges et les fleurs jaunes.",
        ],
        [
          "Luna veut " +
            (a + b) +
            " planches pour un abri. Elle en a déjà " +
            b +
            ". Combien de planches lui manque-t-il ?",
          a,
          "Cherche ce qu’il faut ajouter à la quantité déjà trouvée.",
        ],
      ];
      const v = variants[kind];
      q.prompt = v[0];
      q.answer = String(v[1]);
      q.hint = v[2];
      q.problemKind = kind;
      q.quantities = { a, b };
      break;
    }
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
      const v = sentences[seed % sentences.length],
        words = (v[0] + " " + v[1] + ".").split(" ");
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
      const v = stories[seed % stories.length];
      q.passage = v[0];
      q.prompt = v[1];
      q.answer = v[2];
      q.options = [v[2], ...v[3]];
      q.accepted = [v[4]];
      q.hint =
        "Relis le texte. Cherche les indices qui répondent précisément à la question.";
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
      if (!extraExercise(q, id, seed, turn)) throw Error("Compétence inconnue");
  }
  if (q.type === "choice" && !q.options.length)
    q.options = [
      q.answer,
      String(Number(q.answer) + 1),
      String(Math.max(0, Number(q.answer) - 1)),
    ];
  q.options = [...new Set(q.options)].sort(() => r() - 0.5);
  q.fingerprint = id + ":" + (q.passage || "") + q.prompt + ":" + q.answer;
  return q;
}
export function check(q, value) {
  return [q.answer, ...(q.accepted || [])].some(
    (answer) => normalize(answer) === normalize(value),
  );
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

export function selectExercise(id, seed, level, turn, history = []) {
  const recent = new Set(
    history
      .filter((e) => e.skill === id)
      .slice(-20)
      .map((e) => e.fingerprint),
  );
  let q;
  for (let i = 0; i < 100; i++) {
    const selectedSeed = (seed + i * 104729) >>> 0;
    q = exercise(id, selectedSeed, level, turn);
    if (!recent.has(q.fingerprint)) return { q, seed: selectedSeed };
  }
  return { q: exercise(id, seed, level, turn), seed };
}
