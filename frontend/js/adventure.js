import { ready } from "./core.js";
export const stages = [
  {
    skill: "number",
    title: "Les paquets du castor",
    icon: "🧱",
    story:
      "Le castor prépare les clous du pont. Pour les compter facilement, il fait des paquets de dix.",
    lesson:
      "Dix cubes peuvent devenir une barre de dix. On change leur rangement, mais pas leur nombre. Deux barres et trois cubes représentent 23.",
    strategy: "Tu as compté les dizaines puis les unités.",
  },
  {
    skill: "noun",
    title: "Les étiquettes de la forêt",
    icon: "🌱",
    story:
      "Le vent a mélangé les étiquettes du castor. Retrouvons les mots qui nomment les choses et les animaux.",
    lesson:
      "Dans « le chat », chat nomme un animal : c’est un nom. Dans « une cabane », cabane nomme une chose. Le nom nous dit de qui ou de quoi on parle.",
    strategy: "Tu as cherché le mot qui nomme la chose ou l’animal.",
  },
  {
    skill: "determiner",
    title: "Les petits mots du passage",
    icon: "🛡️",
    story:
      "Les noms ont retrouvé leur place. Il leur manque maintenant les petits mots qui les accompagnent pour terminer le panneau du pont.",
    lesson:
      "Dans « le chat », le présente le nom chat : c’est le déterminant. Dans « une cabane », c’est une. On garde seulement ce petit mot, pas le groupe entier.",
    strategy: "Tu as séparé le petit mot du nom qu’il accompagne.",
  },
];
export const stageDone = (state, n) =>
  state.completed.some((id) => id.startsWith(`bridge:${n}:`));
export const bridgeCount = (state) =>
  stages.filter((_, i) => stageDone(state, i)).length;
export function nextStage(state) {
  const n = stages.findIndex((_, i) => !stageDone(state, i));
  return n === 2 && !ready(state.skills.noun) ? 1 : n;
}
export function createAdventure(state, seed, uuid, now = Date.now()) {
  if (state.session) throw Error("Une mission est déjà en cours.");
  const n = nextStage(state);
  if (n < 0) throw Error("Le pont est déjà réparé.");
  const skill = stages[n].skill;
  // This is an explicit discovery, never an automatic consolidation injection.
  state.skills[skill].status = "seen";
  const session = {
    id: `bridge:${n}:${uuid}`,
    queue: Array(7).fill(skill),
    index: 0,
    seed,
    started: now,
    mode: "discovery",
    draft: "",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
    adventure: n,
  };
  state.session = session;
  return session;
}
const groups = [
  ["le", "chat"],
  ["une", "cabane"],
  ["les", "lapins"],
  ["la", "fleur"],
  ["un", "dragon"],
  ["des", "étoiles"],
  ["le", "jardin"],
  ["une", "pierre"],
  ["les", "arbres"],
  ["un", "renard"],
  ["la", "rivière"],
  ["des", "graines"],
  ["le", "pont"],
  ["une", "plante"],
  ["les", "oiseaux"],
  ["un", "castor"],
];
export function adventureExercise(session) {
  const stage = stages[session.adventure],
    i = session.index;
  const q = {
    skill: stage.skill,
    type: "input",
    dimension: "production",
    prompt: "",
    answer: "",
    options: [],
    hint: "",
    visual: "",
    audio: "",
    lang: "fr-FR",
    guided: i === 0,
  };
  if (stage.skill === "number") {
    const t = 1 + ((Math.floor(session.seed / 7) + i) % 4),
      u = ((session.seed + i * 3) % 9) + 1,
      n = t * 10 + u;
    q.answer = String(n);
    q.hint = `Fais ${t} paquet${t > 1 ? "s" : ""} de dix, puis ajoute ${u} cube${u > 1 ? "s" : ""}.`;
    if (i === 0) {
      q.type = "exchange";
      q.dimension = "manipulation";
      q.answer = "1,3";
      q.displayAnswer = "une dizaine et trois unités";
      q.prompt =
        "Voici 13 clous. Rassemble 10 cubes en une dizaine. Combien en reste-t-il à côté ?";
      q.hint =
        "Touche « Regrouper dix cubes ». Il reste trois cubes seuls : 13, c’est une dizaine et trois unités.";
    } else if (i === 1) {
      q.type = "blocks";
      q.dimension = "manipulation";
      q.prompt = `Prépare ${n} clous avec les dizaines et les unités.`;
    } else if (i === 2 || i === 4) {
      q.type = "choice";
      q.dimension = "recognition";
      q.prompt = `${t} dizaines et ${u} unités : quel nombre ?`;
      q.options = [String(n + 10), String(n), String(t * 10 + ((u + 1) % 10))];
    } else if (i === 6) {
      q.dimension = "transfer";
      q.prompt = `Le castor a ${t} boîtes de 10 clous et ${u} clous seuls. Combien de clous a-t-il en tout ?`;
    } else q.prompt = `Écris le nombre formé par ${t} dizaines et ${u} unités.`;
  } else {
    const words = groups[(i + (session.seed % 3) * 3) % groups.length];
    const noun = stage.skill === "noun";
    q.answer = words[noun ? 1 : 0];
    q.words = words;
    q.hint = noun
      ? `Dans « ${words.join(" ")} », cherche ce qui nomme l’animal ou la chose. Le petit mot devant ne fait pas partie du nom.`
      : `Dans « ${words.join(" ")} », cherche seulement le petit mot placé devant « ${words[1]} ».`;
    if (i === 0 || i === 5) {
      q.type = "sortword";
      q.dimension = "manipulation";
      q.prompt = `Touche ${noun ? "le nom" : "le déterminant"}, puis sa maison.`;
      q.destination = noun
        ? "🌱 La maison des noms"
        : "🛡️ La maison des déterminants";
    } else {
      q.prompt = `Dans « ${words.join(" ")} », ${noun ? "quel mot nomme l’animal ou la chose" : "quel est le déterminant"} ?`;
      if (i === 1 || i === 3) {
        q.type = "choice";
        q.dimension = "recognition";
        q.options = [...words];
      }
      if (i === 6) {
        q.dimension = "transfer";
        q.prompt = noun
          ? `Sur le panneau « Voici ${words.join(" ")}. », quel est le nom ?`
          : `Sur le panneau « Voici ${words.join(" ")}. », quel petit mot présente le nom « ${words[1]} » ?`;
      }
    }
  }
  q.fingerprint = `bridge:${q.skill}:${q.prompt}:${q.answer}`;
  return q;
}
export function bridgeScene(count) {
  return `<svg class="bridge-scene" viewBox="0 0 760 270" role="img" aria-label="Pont : ${count} parties réparées sur 3"><rect width="760" height="270" rx="25" fill="#e4eddc"/><path d="M300 0Q440 100 320 180T360 270H490Q450 180 510 100T470 0" fill="#9cc7c6"/><path d="M340 40h65m0 175h40m-70-85h50" stroke="#dfefdf" stroke-width="6" stroke-linecap="round"/><path d="M180 155h385M180 105h385" stroke="#a79b7b" stroke-width="8" stroke-dasharray="8 7"/>${[0, 1, 2].map((n) => `<g opacity="${n < count ? 1 : 0.18}"><rect x="${205 + n * 110}" y="100" width="103" height="65" rx="8" fill="#b58b5e" stroke="#806849" stroke-width="3"/><path d="M${239 + n * 110} 105v55m34-55v55" stroke="#d6b480" stroke-width="3"/></g>`).join("")}<text x="100" y="150" font-size="55">🦄</text><text x="600" y="140" font-size="65">🌳</text><text x="585" y="210" font-size="36">${count === 3 ? "🦊" : "🌿"}</text></svg>`;
}
