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
// ease = true : l'enfant vient d'échouer deux fois sur cette notion. Nombres plus petits, matériel visible
// (niveau 1) et, pour les autres notions, un petit coup de pouce affiché d'emblée (q.support).
export function exercise(id, seed, level = 2, turn = 0, ease = false) {
  const r = rng(seed),
    a = ease ? 1 + Math.floor(r() * 4) : 2 + Math.floor(r() * 8),
    b = ease ? 1 + Math.floor(r() * 3) : 1 + Math.floor(r() * 8),
    g = group(seed);
  if (ease) level = 1;
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
      const groups = 2 + (seed % (ease ? 2 : 4)),
        each = 2 + (Math.floor(seed / 4) % (ease ? 2 : 4));
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
      const tens = 1 + Math.floor(r() * (ease ? 2 : 5)),
        units = Math.floor(r() * (ease ? 5 : 10));
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
        the = ["le printemps", "l’été", "l’automne", "l’hiver"],
        clues = [
          ["Les fleurs s’ouvrent et les bourgeons apparaissent. Quelle saison est-ce ?", 0],
          ["On se baigne et on mange des glaces. Quelle saison est-ce ?", 1],
          ["Les feuilles changent de couleur et tombent. Quelle saison est-ce ?", 2],
          ["Il fait très froid et il peut neiger. Quelle saison est-ce ?", 3],
        ];
      // 16 variantes (au lieu de 4) : après, avant, entre, repères dans la nature.
      const v = seed % 16,
        i = v % 4;
      if (v < 4) {
        q.prompt = `Quelle saison vient après ${the[i]} en France ?`;
        q.answer = seasons[(i + 1) % 4];
      } else if (v < 8) {
        q.prompt = `Quelle saison vient avant ${the[i]} en France ?`;
        q.answer = seasons[(i + 3) % 4];
      } else if (v < 12) {
        q.prompt = `Quelle saison se trouve entre ${the[i]} et ${the[(i + 2) % 4]} ?`;
        q.answer = seasons[(i + 1) % 4];
      } else {
        q.prompt = clues[i][0];
        q.answer = seasons[clues[i][1]];
      }
      q.options = seasons;
      q.tolerant = true;
      q.hint =
        "Le cycle : 🌸 printemps → ☀️ été → 🍂 automne → ❄️ hiver, puis il recommence. Écris-le doucement : prin-temps, é-té, au-tomne, hi-ver.";
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
  if (ease) {
    q.eased = true;
    if (!["number", "addition", "subtract", "multiplication", "problem"].includes(id) && q.hint) q.support = true;
  }
  q.fingerprint = id + ":" + (q.passage || "") + q.prompt + ":" + q.answer;
  return q;
}
// Distance d'édition (insertion, suppression, substitution) entre deux petits mots.
function distance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const plain = (s) =>
  normalize(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
// Pour les suites de mots (saisons, jours, mois) : la notion est la suite, pas l'orthographe.
// Une faute proche (« Vandredi », « Hivr », « Ive ») compte comme réussie ; la bonne écriture est montrée.
export function nearCheck(q, value) {
  if (!q.tolerant || q.type === "choice" || check(q, value)) return false;
  const got = plain(value).replace(/^h/, ""),
    want = plain(q.answer).replace(/^h/, "");
  if (got.length < 3 || got[0] !== want[0]) return false;
  const best = distance(got, want);
  let prefix = 0;
  while (prefix < got.length && got[prefix] === want[prefix]) prefix++;
  const close = best <= Math.max(1, Math.floor(want.length * 0.4)) || (prefix >= 5 && prefix >= want.length * 0.55);
  // Jamais si le mot est au moins aussi proche d'une autre réponse possible (jeudi / lundi…).
  return close && !(q.options || []).some((o) => o !== q.answer && distance(got, plain(o).replace(/^h/, "")) <= best);
}
export function check(q, value) {
  return [q.answer, ...(q.accepted || [])].some(
    (answer) => normalize(answer) === normalize(value),
  );
}
// Explication ciblée après une erreur : ce qui s'est sans doute passé, pourquoi, et la bonne réponse.
// Retourne { why, slip } : `why` explique la bonne réponse ; `slip` (facultatif) nomme l'erreur probable.
function explainRaw(q, value) {
  const v = String(value ?? "").trim(),
    num = /^-?\d+$/.test(v) ? Number(v) : null,
    nums = (q.prompt.match(/\d+/g) || []).map(Number),
    ans = q.displayAnswer || q.answer,
    n = Number(q.answer);
  const out = (why, slip = "") => ({ why, slip });
  const near = num !== null && Number.isFinite(n) && Math.abs(num - n) === 1
    ? "Tu étais tout proche : il manque ou il y a un de trop. Recompte tranquillement, par exemple avec tes doigts ou des petits traits."
    : "";
  switch (q.skill) {
    case "addition": {
      const [x, y] = nums;
      return out(`Additionner, c’est réunir : on part de ${x} et on avance de ${y}. ${x} + ${y} = ${ans}.`,
        num === x - y || num === y - x ? "Tu as retiré au lieu d’ajouter : le signe + veut dire qu’on réunit." : near);
    }
    case "subtract": {
      const [x, y] = nums;
      return out(`Soustraire, c’est enlever : on part de ${x} et on recule de ${y}. ${x} − ${y} = ${ans}. Pour vérifier : ${ans} + ${y} = ${x}.`,
        num === x + y ? "Tu as ajouté au lieu de retirer : le signe − veut dire qu’on enlève." : near);
    }
    case "multiplication": {
      if (/paniers/.test(q.prompt)) {
        const [g, e] = nums;
        return out(`${g} paniers avec ${e} pommes chacun : on répète ${e} ${g} fois. ${Array(g).fill(e).join(" + ")} = ${ans}.`,
          num === g + e ? `Tu as additionné ${g} et ${e}. Ici il faut répéter ${e}, ${g} fois.` : near);
      }
      const [g, e] = nums;
      return out(`${g} × ${e}, c’est ${g} groupes de ${e}. ${Array(g).fill(e).join(" + ")} = ${ans}.`,
        num === g + e ? `Tu as additionné ${g} et ${e}. Le signe × veut dire qu’on répète : ${g} fois ${e}.` : near);
    }
    case "number": {
      if (/^Construis/.test(q.prompt)) return out(`${nums[0]}, c’est ${Math.floor(nums[0] / 10)} dizaines et ${nums[0] % 10} unités. Une dizaine = 10 cubes.`);
      const [t, u] = nums;
      return out(`${t} dizaines valent ${t * 10}, et on ajoute ${u} unités : ${t * 10} + ${u} = ${ans}. Le chiffre des dizaines est à gauche, celui des unités à droite.`,
        num !== null && String(num) === `${u}${t}` ? "Tu as écrit les chiffres à l’envers : les dizaines vont d’abord, puis les unités." : near);
    }
    case "hundreds": {
      const [h, t, u] = nums;
      return out(`${h} centaines = ${h * 100}, ${t} dizaines = ${t * 10}, ${u} unités = ${u}. On les réunit : ${h * 100} + ${t * 10} + ${u} = ${ans}.`,
        num !== null && String(num).length !== 3 ? "Un nombre avec des centaines a trois chiffres : centaines, dizaines, unités." : "");
    }
    case "compare":
      return out(`On compare les centaines d’abord, puis les dizaines, puis les unités. Le plus ${/petit/.test(q.prompt) ? "petit" : "grand"} est ${ans}.`);
    case "complements": {
      const [x, target] = [nums[0], nums[1]];
      return out(`De ${x} pour arriver à ${target}, il manque ${ans} : ${x} + ${ans} = ${target}.`,
        num === target ? `Tu as écrit le total. On cherche ce qu’il faut ajouter à ${x}.` : near);
    }
    case "doubles":
      return out(`Le double, c’est deux fois le même nombre : ${nums[0]} + ${nums[0]} = ${ans}.`, num === nums[0] ? "Tu as recopié le nombre : le double, c’est le nombre deux fois." : near);
    case "halves":
      return out(`La moitié, c’est partager en deux parts égales : ${nums[0]} partagé en deux, c’est ${ans} de chaque côté. Pour vérifier : ${ans} + ${ans} = ${nums[0]}.`, num === nums[0] * 2 ? "Tu as doublé au lieu de partager en deux." : near);
    case "money":
      return /pièces/.test(q.prompt)
        ? out(`${nums[0]} pièces de 2 euros valent ${nums[0] * 2} euros (2 + 2 …). On ajoute ensuite ${nums[1]} euro${nums[1] > 1 ? "s" : ""} : ${nums[0] * 2} + ${nums[1]} = ${ans}.`,
            num === nums[0] + nums[1] ? "Tu as compté chaque pièce pour 1 euro. Une pièce de 2 euros vaut 2 euros." : near)
        : out(`On rend la différence entre ce qu’on donne et le prix : ${nums[1]} − ${nums[0]} = ${ans} euros.`, num === nums[1] ? "Tu as écrit la somme donnée. On rend seulement ce qui dépasse le prix." : near);
    case "problem":
      return out(`${q.hint} La réponse est ${ans}.`, near);
    case "clock":
      return out("La petite aiguille donne l’heure ; la grande donne les minutes (sur 12 : heure pile, sur 6 : et demie). Ici, c’est " + ans + ".");
    case "shapes":
      return out(/côtés/.test(q.prompt) ? `On suit le contour et on compte chaque côté droit une seule fois : ${ans}.` : `Un triangle a 3 côtés, un carré 4 côtés égaux, un rectangle 4 côtés dont deux plus longs. Ici, c’est un ${ans}.`);
    case "noun":
      return out(`Le nom dit de quelle chose ou de quel animal on parle : « ${ans} ». Le petit mot devant le nom, c’est le déterminant, et le mot qui décrit, c’est l’adjectif.`);
    case "determiner":
      return out(`Le déterminant est le petit mot placé juste devant le nom pour le présenter : « ${ans} ».`);
    case "adjective":
      return out(`L’adjectif dit comment est la chose ou l’animal : « ${ans} ».`);
    case "agreement":
      return out(`L’adjectif s’accorde avec le nom : ${q.hint} On écrit donc « ${ans} ».`);
    case "verb":
      return out(`Le verbe dit ce que fait le personnage : « ${ans} ».`);
    case "subject":
      return out(`Le sujet répond à « Qui est-ce qui … ? » : c’est « ${ans} ». On garde tous les mots qui désignent ce personnage.`);
    case "present_er":
    case "etre":
    case "avoir":
      return out(`${q.hint} Avec ce sujet, le verbe s’écrit « ${ans} ».`);
    case "living":
      return out(`Un être vivant naît, grandit, se nourrit et peut mourir. ${q.hint} Ici : ${ans}.`);
    case "seasons":
      return out(`Les saisons se suivent toujours dans le même ordre : 🌸 printemps → ☀️ été → 🍂 automne → ❄️ hiver, puis ça recommence. Ici, c’est « ${ans} ».`);
    case "calendar":
      return out(`${q.hint} Ici, c’est « ${ans} ».`);
    case "reading":
      return out(`La réponse est écrite dans le texte : « ${q.passage || ""} » On retrouve ${ans}. Relis la phrase en cherchant les mots de la question.`);
    case "colors":
    case "animals":
    case "english_numbers":
      return out(`${q.hint || ""} C’est « ${ans} ».`);
    case "sentence":
      return out("Une phrase commence par une majuscule, raconte quelque chose avec un verbe, et finit par un point.");
    default:
      return out(q.hint || "");
  }
}
export function explain(q, value) {
  try {
    const e = explainRaw(q, value);
    // Énoncés d'aventure ou de format inattendu : jamais de texte cassé, on retombe sur l'indice.
    if (!/undefined|NaN|\[object/.test(e.why + e.slip) && e.why) return e;
  } catch {}
  return { why: q.hint || "", slip: "" };
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

export function selectExercise(id, seed, level, turn, history = [], ease = false) {
  const recent = new Set(
    history
      .filter((e) => e.skill === id)
      .slice(-20)
      .map((e) => e.fingerprint),
  );
  let q;
  for (let i = 0; i < 100; i++) {
    const selectedSeed = (seed + i * 104729) >>> 0;
    q = exercise(id, selectedSeed, level, turn, ease);
    if (!recent.has(q.fingerprint)) return { q, seed: selectedSeed };
  }
  return { q: exercise(id, seed, level, turn, ease), seed };
}
