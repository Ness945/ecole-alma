// Banques originales : une seule réponse attendue par consigne.
export const wordModes = {
  cloze: {
    title: "Les mots à trous",
    icon: "🧩",
    lesson:
      "Lis la phrase et l’indice, puis complète les lettres manquantes. Dans « Le ch_t miaule », il manque a : chat. Écris le mot entier, avec ses accents.",
  },
  infinitive: {
    title: "Retrouver l’infinitif",
    icon: "✨",
    lesson:
      "L’infinitif est le nom du verbe, celui que l’on trouve dans le dictionnaire. « Tu chantes » → il faut chanter. Attention, tous les infinitifs ne finissent pas par -er : finir, lire, prendre…",
  },
  adjective: {
    title: "L’adjectif qualificatif",
    icon: "🎨",
    lesson:
      "L’adjectif qualificatif précise comment est une personne, un animal ou une chose. Dans « une fleur rouge », rouge précise la couleur de la fleur. Écris seulement l’adjectif, tel qu’il apparaît.",
  },
  arrow: {
    title: "Les mots fléchés de Luna",
    icon: "🗝️",
    lesson:
      "Touche une case avec une définition et une flèche. Écris le mot dans le sens de la flèche. Les mots se croisent : ils partagent la même lettre ! Dans les grilles seulement, on écrit en majuscules sans accents.",
  },
};
export const wordBanks = {
  cloze: [
    ["Le ch_t miaule.", "Animal qui miaule.", "chat"],
    ["Le lap_n mange une carotte.", "Animal aux longues oreilles.", "lapin"],
    ["La fl_ur pousse.", "Elle a des pétales.", "fleur"],
    ["Je lis un li_re.", "Il contient des pages.", "livre"],
    ["La po_me est un fruit.", "Fruit rond, parfois rouge.", "pomme"],
    ["La lu_e brille cette nuit.", "On la voit dans le ciel la nuit.", "lune"],
    ["Le so_eil nous éclaire.", "Notre étoile, visible le jour.", "soleil"],
    ["La tor_ue a une carapace.", "Animal qui porte une carapace.", "tortue"],
    ["Le ba_eau flotte.", "Il navigue sur l’eau.", "bateau"],
    ["Une ét_ile brille.", "Un point lumineux dans le ciel la nuit.", "étoile"],
    ["Le vé_o a deux roues.", "On avance en pédalant.", "vélo"],
    ["Le ja_din est fleuri.", "On y cultive des plantes.", "jardin"],
  ],
  infinitive: [
    ["Tu chantes une chanson.", "chantes", "chanter"],
    ["Nous jouons dehors.", "jouons", "jouer"],
    ["Elle danse.", "danse", "danser"],
    ["Vous regardez la lune.", "regardez", "regarder"],
    ["Ils finissent leur dessin.", "finissent", "finir"],
    ["Tu choisis un livre.", "choisis", "choisir"],
    ["Je lis une histoire.", "lis", "lire"],
    ["Nous prenons le train.", "prenons", "prendre"],
    ["Elle fait un gâteau.", "fait", "faire"],
    ["Ils vont au jardin.", "vont", "aller"],
    ["Tu es contente.", "es", "être"],
    ["Nous avons des graines.", "avons", "avoir"],
  ],
  adjective: [
    ["Le petit chat dort.", "chat", "petit"],
    ["Une fleur rouge pousse.", "fleur", "rouge"],
    ["Le dragon gentil sourit.", "dragon", "gentil"],
    ["Une grande maison apparaît.", "maison", "grande"],
    ["Les oiseaux bleus chantent.", "oiseaux", "bleus"],
    ["Une soupe chaude attend.", "soupe", "chaude"],
    ["Le renard rusé se cache.", "renard", "rusé"],
    ["Des étoiles brillantes scintillent.", "étoiles", "brillantes"],
    ["Une tortue lente avance.", "tortue", "lente"],
    ["Le jardin fleuri attire les abeilles.", "jardin", "fleuri"],
    ["Des pommes mûres tombent.", "pommes", "mûres"],
    ["Une douce musique résonne.", "musique", "douce"],
  ],
};
// row/col désignent la première LETTRE ; la définition occupe la case précédente.
export const arrowPuzzles = [
  {
    title: "Les amis du jardin",
    words: [
      { answer: "CHAT", clue: "Il miaule", row: 2, col: 1, dir: "right" },
      {
        answer: "LAPIN",
        clue: "Longues oreilles",
        row: 1,
        col: 3,
        dir: "down",
      },
      { answer: "LIT", clue: "Pour dormir", row: 4, col: 2, dir: "right" },
    ],
  },
  {
    title: "Les trésors de la mer",
    words: [
      { answer: "MER", clue: "Grande eau salée", row: 2, col: 1, dir: "right" },
      {
        answer: "PERLE",
        clue: "Bille dans une huître",
        row: 1,
        col: 2,
        dir: "down",
      },
      {
        answer: "BLE",
        clue: "Céréale pour la farine",
        row: 4,
        col: 1,
        dir: "right",
      },
    ],
  },
  {
    title: "Les verbes en voyage",
    words: [
      {
        answer: "MANGER",
        clue: "Infinitif de « tu manges »",
        row: 2,
        col: 1,
        dir: "right",
      },
      {
        answer: "LAVER",
        clue: "Infinitif de « je lave »",
        row: 1,
        col: 2,
        dir: "down",
      },
      { answer: "MER", clue: "Grande eau salée", row: 4, col: 1, dir: "right" },
    ],
  },
];
export const cellsFor = (w) =>
  Array.from(
    w.answer,
    (_, i) =>
      `${w.row + (w.dir === "down" ? i : 0)},${w.col + (w.dir === "right" ? i : 0)}`,
  );
export function gridFor(puzzle) {
  const cells = {};
  puzzle.words.forEach((w, i) => {
    cellsFor(w).forEach((key, j) => {
      if (cells[key] && cells[key].answer !== w.answer[j])
        throw Error("Croisement incohérent");
      cells[key] ??= { answer: w.answer[j], words: [] };
      cells[key].words.push(i);
    });
  });
  return cells;
}
export const wordNormalize = (x) =>
  String(x).normalize("NFC").trim().toLocaleLowerCase("fr");
export const gridNormalize = (x) =>
  String(x)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
export function newWordGame(mode, puzzle = 0) {
  return {
    mode,
    puzzle,
    index: 0,
    draft: "",
    letters: {},
    solved: [],
    assisted: [],
    attempted: false,
    feedback: "",
    finished: false,
    results: [],
  };
}
export function wordQuestion(g) {
  const [phrase, detail, answer] = wordBanks[g.mode][g.puzzle * 4 + g.index];
  return {
    phrase,
    answer,
    prompt:
      g.mode === "cloze"
        ? "Quel mot complète la phrase ?"
        : g.mode === "infinitive"
          ? `Quel est l’infinitif de « ${detail} » ?`
          : `Quel adjectif précise le nom « ${detail} » ?`,
    hint:
      g.mode === "cloze"
        ? detail
        : g.mode === "infinitive"
          ? `Essaie de commencer par « il faut… ». Le verbe recherché commence par ${answer[0]}.`
          : `Comment est ${detail} ? Le mot commence par ${answer[0]}.`,
  };
}
export function selectedWord(g) {
  return arrowPuzzles[g.puzzle].words[g.index];
}
export function writeGrid(g, value) {
  if (g.finished || g.solved.includes(g.index)) return;
  const w = selectedWord(g),
    keys = cellsFor(w),
    text = gridNormalize(value).slice(0, w.answer.length),
    grid = gridFor(arrowPuzzles[g.puzzle]);
  keys.forEach((key, i) => {
    if (!grid[key].words.some((n) => g.solved.includes(n)))
      g.letters[key] = text[i] || "";
  });
  g.draft = text;
  g.attempted = false;
  g.feedback = "";
}
export function answerWord(g) {
  if (g.finished || g.solved.includes(g.index) || g.attempted) return null;
  const arrow = g.mode === "arrow",
    answer = arrow ? selectedWord(g).answer : wordQuestion(g).answer,
    value = arrow
      ? cellsFor(selectedWord(g))
          .map((k) => g.letters[k] || "")
          .join("")
      : g.draft;
  const correct = arrow
    ? value === answer
    : wordNormalize(value) === wordNormalize(answer);
  const result = {
    mode: g.mode,
    puzzle: g.puzzle,
    index: g.index,
    correct,
    assisted: g.assisted.includes(g.index),
    at: Date.now(),
  };
  g.results.push(result);
  g.results = g.results.slice(-200);
  g.attempted = true;
  if (correct) {
    g.solved.push(g.index);
    g.feedback = "Bien joué ! Tu as retrouvé le mot.";
    if (arrow && g.solved.length === 3) g.finished = true;
  } else {
    g.assisted = Array.from(new Set([...g.assisted, g.index]));
    g.feedback = arrow
      ? "Regarde la définition, la longueur et les lettres déjà croisées. Tu peux essayer encore."
      : `On regarde ensemble : ${answer}. Relis la phrase, puis écris le mot.`;
  }
  return result;
}
export function nextWord(g) {
  if (g.mode === "arrow" || !g.solved.includes(g.index)) return;
  if (g.index === 3) {
    g.finished = true;
    return;
  }
  g.index++;
  g.draft = "";
  g.feedback = "";
  g.attempted = false;
}
export function validWordGame(g) {
  if (g === undefined) return true;
  if (
    !g ||
    !Object.hasOwn(wordModes, g.mode) ||
    ![0, 1, 2].includes(g.puzzle) ||
    !Number.isInteger(g.index) ||
    g.index < 0 ||
    g.index > (g.mode === "arrow" ? 2 : 3) ||
    typeof g.draft !== "string" ||
    g.draft.length > 80 ||
    typeof g.feedback !== "string" ||
    g.feedback.length > 300 ||
    typeof g.finished !== "boolean" ||
    typeof g.attempted !== "boolean"
  )
    return false;
  const max = g.mode === "arrow" ? 3 : 4;
  if (
    !["solved", "assisted"].every(
      (k) =>
        Array.isArray(g[k]) &&
        g[k].length <= max &&
        new Set(g[k]).size === g[k].length &&
        g[k].every((i) => Number.isInteger(i) && i >= 0 && i < max),
    )
  )
    return false;
  if (g.finished && g.solved.length !== max) return false;
  if (!g.letters || typeof g.letters !== "object" || Array.isArray(g.letters))
    return false;
  const grid = g.mode === "arrow" ? gridFor(arrowPuzzles[g.puzzle]) : {};
  if(g.mode==='arrow'&&g.solved.some(i=>cellsFor(arrowPuzzles[g.puzzle].words[i]).some(k=>g.letters[k]!==grid[k].answer))) return false;
  if (
    Object.entries(g.letters).some(
      ([k, v]) =>
        !Object.hasOwn(grid, k) ||
        typeof v !== "string" ||
        !/^([A-Z])?$/.test(v),
    )
  )
    return false;
  return (
    Array.isArray(g.results) &&
    g.results.length <= 200 &&
    g.results.every(
      (r) =>
        r &&
        r.mode === g.mode &&
        r.puzzle === g.puzzle &&
        Number.isInteger(r.index) &&
        r.index >= 0 &&
        r.index < max &&
        typeof r.correct === "boolean" &&
        typeof r.assisted === "boolean" &&
        Number.isFinite(r.at),
    )
  );
}
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const b = (text, action, attr = "") =>
  `<button data-action="words-${action}" ${attr}>${text}</button>`;
export function wordTeaser() {
  return `<section class="words-banner"><span aria-hidden="true">🧩</span><div><p class="eyebrow">LE JARDIN DES LETTRES</p><h2>L’atelier des mots</h2><p>Mots à trous, infinitifs, adjectifs et petits mots fléchés.</p></div>${b("Jouer avec les mots →", "open")}</section>`;
}
export function wordMenu(s) {
  return `<main class="page"><h1>L’atelier des mots</h1><p>Choisis un jeu. Prends ton temps : les mots sont des petits trésors à découvrir.</p>${s.wordGame && !s.wordGame.finished ? `<div class="notice">Ton jeu est en pause. ${b("Reprendre mon jeu", "resume")}</div>` : ""}<div class="words-menu">${Object.entries(
    wordModes,
  )
    .map(
      ([mode, v]) =>
        `<section class="panel"><p class="eyebrow">${v.icon} FRANÇAIS</p><h2>${v.title}</h2><p>${v.lesson}</p><div class="words-series">${[0, 1, 2].map((n) => b(`${s.completed.includes(`words:${mode}:${n}`) ? "✓ " : ""}${mode === "arrow" ? arrowPuzzles[n].title : "Série " + (n + 1)}`, "start", `data-mode="${mode}" data-puzzle="${n}"`)).join("")}</div></section>`,
    )
    .join(
      "",
    )}</div><p class="sub">10 pièces par série ou grille terminée pour la première fois. Rejouer ne redonne pas les pièces. Les essais restent dans cet atelier et ne valident pas automatiquement une compétence scolaire.</p></main>`;
}
export function wordView(s) {
  const g = s.wordGame;
  if (!g) return wordMenu(s);
  const mode = wordModes[g.mode];
  let body = "";
  if (g.finished) {
    const solo = g.results.filter((r) => r.correct && !r.assisted).length;
    body = `<h2>Ton jardin de mots a grandi !</h2><p>${g.solved.length} mots retrouvés, dont ${solo} sans indice ni correction préalable.</p><p>Ta récompense est conservée. Tu peux rejouer ou découvrir une autre série.</p>${b("Choisir un autre jeu", "open")}`;
  } else if (g.mode !== "arrow") {
    const q = wordQuestion(g);
    body = `<p class="eyebrow">MOT ${g.index + 1} / 4</p><div class="word-phrase">${q.phrase}</div><h2>${q.prompt}</h2><label for="word-input">Écris le mot entier</label><input id="word-input" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(g.draft)}" ${g.solved.includes(g.index) ? "disabled" : ""}>${g.solved.includes(g.index) ? b("Continuer →", "next") : b("Vérifier mon mot", "check")} ${b("Un indice", "hint")}${g.assisted.includes(g.index) ? `<p class="notice">${q.hint}</p>` : ""}`;
  } else {
    const p = arrowPuzzles[g.puzzle],
      grid = gridFor(p),
      w = selectedWord(g),
      keys = cellsFor(w);
    const clues = {};
    p.words.forEach(
      (x, i) =>
        (clues[
          `${x.row - (x.dir === "down" ? 1 : 0)},${x.col - (x.dir === "right" ? 1 : 0)}`
        ] = i),
    );
    body = `<h2>${p.title}</h2><p>Touche une définition fléchée. Une lettre partagée aide les deux mots.</p><div class="arrow-grid" aria-label="Grille de mots fléchés">${Array.from(
      { length: 42 },
      (_, n) => {
        const key = `${Math.floor(n / 7)},${n % 7}`;
        if (Object.hasOwn(clues, key)) {
          const i = clues[key],
            x = p.words[i];
          return b(
            `${esc(x.clue)} <strong>${x.dir === "right" ? "→" : "↓"}</strong>`,
            "select",
            `data-index="${i}" class="arrow-clue" aria-pressed="${g.index === i}"`,
          );
        }
        if (grid[key])
          return b(
            g.letters[key] || "·",
            "cell",
            `data-cell="${key}" class="arrow-letter ${keys.includes(key) ? "active" : ""} ${grid[key].words.some((i) => g.solved.includes(i)) ? "done" : ""}" aria-label="Ligne ${Math.floor(n / 7) + 1}, colonne ${(n % 7) + 1} : ${g.letters[key] || "vide"}"`,
          );
        return '<span class="arrow-empty" aria-hidden="true"></span>';
      },
    ).join(
      "",
    )}</div><div class="arrow-entry"><h3>${w.dir === "right" ? "→" : "↓"} ${esc(w.clue)} · ${w.answer.length} lettres</h3><label for="word-input">Écris le mot dans la grille</label><input id="word-input" maxlength="${w.answer.length}" value="${esc(g.draft)}" autocomplete="off" autocapitalize="characters" spellcheck="false" ${g.solved.includes(g.index) ? "disabled" : ""}>${g.solved.includes(g.index) ? "<p>✓ Mot trouvé ! Choisis une autre flèche.</p>" : b("Vérifier mon mot", "check")}${b("Une lettre pour m’aider", "hint")}<p>${g.solved.length}/3 mots trouvés</p></div>`;
  }
  return `<main class="page words-page">${b("← Tous les jeux", "open")}<h1>${mode.icon} ${mode.title}</h1><details><summary>La petite leçon de Luna</summary><p>${mode.lesson}</p></details><section class="panel">${body}<p class="word-feedback" role="status">${esc(g.feedback)}</p></section></main>`;
}
