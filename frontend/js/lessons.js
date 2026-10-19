import { extraDemos } from "./expansion.js";
export const subjects = [
  {
    name: "Mathématiques",
    title: "L’atelier des nombres",
    icon: "🔢",
    className: "math",
    text: "Compter, calculer et résoudre des énigmes.",
  },
  {
    name: "Français",
    title: "La bibliothèque magique",
    icon: "📚",
    className: "french",
    text: "Lire, jouer avec les mots et écrire.",
  },
  {
    name: "Questionner le monde",
    title: "Le jardin des découvertes",
    icon: "🌍",
    className: "discover-world",
    text: "Observer le vivant, le temps et les saisons.",
  },
  {
    name: "Anglais",
    title: "L’île aux nouveaux mots",
    icon: "🎧",
    className: "english",
    text: "Écouter et découvrir les mots anglais.",
  },
];
export function lessonActivity(id, step = 0) {
  if (id === "multiplication") {
    const n = Math.min(3, step + 1);
    return `<div class="lesson-play"><p class="eyebrow">Le goûter des petits dragons</p><div class="basket-row">${Array(n).fill('<div class="apple-basket"><span>🍎 🍎</span><small>2 pommes</small></div>').join("")}</div><p class="math-formula">${Array(n).fill("2").join(" + ")} = ${n * 2}</p><p>${n} panier${n > 1 ? "s" : ""} de 2 pommes, c’est <strong>${n} × 2 = ${n * 2}</strong>.</p><button data-action="lesson-step" class="primary">${n === 3 ? "Recommencer avec un panier" : "Ajouter un panier de 2 pommes"}</button><p class="sub">Chaque panier contient la même quantité. On compte tous les groupes.</p></div>`;
  }
  if (["noun", "determiner", "adjective", "agreement"].includes(id)) {
    const word =
      id === "noun" ? "dragon" : id === "determiner" ? "le" : "petit";
    return `<div class="lesson-play"><p class="eyebrow">Les mots ont chacun leur rôle</p><div class="grammar-dragon">🐉</div><div class="grammar-words">${["le", "petit", "dragon"].map((w) => `<button data-action="lesson-token" data-word="${w}" class="${step && w === word ? "revealed" : ""}">${w}</button>`).join("")}</div><p>${step ? `<strong>${word}</strong> ${id === "noun" ? "nomme l’animal : c’est le nom." : id === "determiner" ? "présente le nom dragon : c’est le déterminant." : "donne une précision sur le dragon : c’est l’adjectif."}` : `Touche ${id === "noun" ? "le mot qui nomme l’animal" : id === "determiner" ? "le petit mot qui présente le nom" : "le mot qui nous dit comment est le dragon"}.`}</p>${id === "agreement" ? "<p>Au pluriel : <strong>les petits dragons</strong>. Les trois mots changent ensemble.</p>" : ""}<p class="sub">C’est un essai accompagné, sans note ni récompense.</p></div>`;
  }
  if (id === "number")
    return `<div class="lesson-play"><p class="eyebrow">Le coffre des dizaines</p><div class="ten-bars">${Array(
      step + 1,
    )
      .fill(
        '<div class="ten-bar">' + Array(10).fill("<i></i>").join("") + "</div>",
      )
      .join(
        "",
      )}<div class="loose-cubes"><i></i><i></i><i></i></div></div><p class="math-formula">${step + 1} dizaine${step ? "s" : ""} + 3 unités = ${(step + 1) * 10 + 3}</p><button data-action="lesson-step" class="primary">${step === 2 ? "Revenir à une dizaine" : "Ajouter une dizaine"}</button><p class="sub">Une barre représente toujours dix petits cubes.</p></div>`;
  if (["addition", "subtract", "problem"].includes(id)) {
    const subtract = id !== "addition";
    return `<div class="lesson-play"><p class="eyebrow">Les provisions de Luna</p><div class="lesson-objects">${"🍎 ".repeat(step ? (subtract ? 3 : 5) : subtract ? 5 : 3)}</div><p class="math-formula">${step ? (subtract ? "5 − 2 = 3" : "3 + 2 = 5") : subtract ? "5 pommes" : "3 pommes"}</p><button data-action="lesson-step" class="primary">${step ? "Recommencer" : subtract ? "Donner deux pommes au dragon" : "Recevoir deux pommes"}</button><p>${subtract ? "Quand on en donne, il en reste moins." : "Quand on réunit les deux groupes, il y en a davantage."}</p></div>`;
  }
  const demos = {
    sentence: [
      "🦊 📖",
      "Le renard lit.",
      "Une majuscule au début. Un point à la fin.",
    ],
    reading: [
      "🧚 🌷",
      "La fée pose une fleur près du pont.",
      "Que pose la fée ? Une fleur. On retrouve cette information dans le texte.",
    ],
    living: [
      "🌳 🪨",
      "Un arbre et une pierre.",
      "L’arbre grandit et se nourrit : il est vivant. La pierre n’est pas vivante.",
    ],
    seasons: [
      "🌸 ☀️ 🍂 ❄️",
      "Printemps → été → automne → hiver",
      "Après l’hiver, le printemps revient. Le cycle recommence.",
    ],
    colors: [
      "🔴 🔵 🟢 🟡",
      "Red · blue · green · yellow",
      "Rouge · bleu · vert · jaune",
    ],
    animals: [
      "🐱 🐶 🐰 🐦",
      "Cat · dog · rabbit · bird",
      "Chat · chien · lapin · oiseau",
    ],
  };
  const d = demos[id] || extraDemos[id];
  if (!d) throw Error("Leçon manquante : " + id);
  return `<div class="lesson-play"><div class="lesson-objects">${d[0]}</div><h3>${d[1]}</h3>${step ? `<p>${d[2]}</p>` : '<button data-action="lesson-step" class="primary">Luna, montre-moi !</button>'}${["colors", "animals", "english_numbers"].includes(id) ? `<button data-action="lesson-english" class="quiet">🔊 Écouter les mots anglais</button>` : ""}</div>`;
}
