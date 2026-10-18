import { skills, chapters, items } from "./content.js";
import {
  marketView,
  marketTeaser,
  marketCount,
  marketStages,
  newMarket,
  marketQuestion,
  answerMarket,
  advanceMarket,
  learningReport,
} from "./market.js";
import {
  discoveryTeaser,
  discoveryParentSummary,
  discoveryView,
  discoveryParentView,
  discoveryAction,
  discoveryInput,
  discoverySubmit,
  resetDiscoveryScreen,
} from "./discovery-ui.js";
import { upgradeDiscovery } from "./discovery.js";
import {
  fresh,
  load,
  save,
  validate,
  KEY,
  LEGACY_KEY,
  plan,
  missing,
  record,
  reward,
  plant,
  ready,
  mastered,
  evidence,
} from "./core.js";
import { exercise, check, diagnostic, selectExercise } from "./exercises.js";
import { exercise as legacyExercise } from "./exercises-v03.js";
import {
  shop,
  itemArt,
  purchase,
  equip as equipRpg,
  avatarSvg,
} from "./rpg.js";
import { homeView, pickerView, customizationView } from "./rpg-ui.js";
import { subjects, lessonActivity } from "./lessons.js";
import {
  stages,
  stageDone,
  bridgeCount,
  nextStage,
  createAdventure,
  adventureExercise,
  bridgeScene,
} from "./adventure.js";
const app = document.querySelector("#app");
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let state,
  route = "home",
  fatal = "",
  storageError = "",
  picked = "flower",
  lessonId = null,
  parentUnlocked = false;
let selectedSubject = "Mathématiques",
  lessonStep = 0,
  previewItem = null;
try {
  state = load(localStorage);
  if (upgradeDiscovery(state)) save(localStorage, state);
} catch (e) {
  fatal = e.message;
  state = fresh();
}
function persist() {
  try {
    if (fatal) return false;
    save(localStorage, state);
    storageError = "";
    return true;
  } catch {
    storageError =
      "La sauvegarde est indisponible. Gardez cette page ouverte et exportez votre progression dans l’espace parent.";
    return false;
  }
}
const button = (text, action, cls = "", extra = "") =>
  `<button class="${cls}" data-action="${action}" ${extra}>${text}</button>`;
const item = (id) => items.find((x) => x.id === id);
function toast(text) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.role = "status";
  el.textContent = text;
  document.body.append(el);
  setTimeout(() => el.remove(), 5000);
}
function speak(text, lang = "fr-FR") {
  if (!state.settings.sound) {
    toast("Le son est désactivé. Activez-le en haut de l’écran.");
    return;
  }
  if (!("speechSynthesis" in window)) {
    toast("La lecture vocale n’est pas disponible sur cet appareil.");
    return;
  }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.85;
  u.onerror = () =>
    toast(
      "La voix n’est pas disponible. Pour l’anglais, faites lire le mot par un adulte.",
    );
  speechSynthesis.speak(u);
}
function header() {
  return `<header class="topbar"><button class="brand quiet" data-action="home" aria-label="Retour au royaume"><img src="./assets/icon.svg" alt=""><div><small>APPRENDRE DEVIENT UNE AVENTURE</small>L’Académie des Aventuriers</div></button><div class="top-actions"><div class="resources"><span title="Étoiles de progression">⭐ ${state.stars}</span><span title="Pièces à dépenser">🪙 ${state.rpg.coins}</span><span title="Graines du jardin">🌱 ${state.seeds}</span></div><button data-action="avatar" class="header-girl" aria-label="Mon aventurière">${avatarSvg(state.rpg)}</button></div></header>`;
}
function footer() {
  return `<footer class="footer"><span>À petits pas, de grandes découvertes.<br>Progression enregistrée sur cet appareil.</span><div>${button(state.settings.sound ? "🔊 Son" : "🔇 Son", "sound", "quiet small")}${button("⚙ Espace parent", "parent-gate", "quiet small")}</div></footer>`;
}
function page(title, body) {
  return `<main class="page"><div class="page-head">${button("←", "home", "quiet", 'aria-label="Retour au royaume"')}<h1>${title}</h1></div>${body}</main>`;
}
function home() {
  return homeView(state).replace(
    "</main>",
    discoveryTeaser(state) + marketTeaser(state) + "</main>",
  );
}
function current() {
  const s = state.session;
  if (s.adventure !== undefined) return adventureExercise(s);
  const id = s.queue[s.index],
    seed = (s.seed + s.index * 7919) >>> 0;
  if (s.contentRevision !== 2)
    return legacyExercise(id, seed, state.skills[id].level, s.index);
  if (s.questionSeed === undefined) {
    s.questionSeed = selectExercise(
      id,
      seed,
      state.skills[id].level,
      s.index,
      state.history,
    ).seed;
    persist();
  }
  return exercise(id, s.questionSeed, state.skills[id].level, s.index);
}
function bridgeTeaser() {
  const n = bridgeCount(state);
  return `<section class="bridge-teaser"><div><p class="eyebrow">Une histoire à construire · ${n}/3 parties du pont</p><h2>${n === 3 ? "La clairière est ouverte !" : "Le pont des petits pouvoirs"}</h2><p>${n === 3 ? "Un renard t’attend de l’autre côté." : "Le castor a besoin de toi. Trois petites aventures pour rejoindre la clairière."}</p></div>${button(n === 3 ? "Traverser le pont →" : "Partir avec Luna →", n === 3 ? "clearing" : "bridge", "primary")}</section>`;
}
function bridge() {
  const n = nextStage(state),
    count = bridgeCount(state),
    prep = n === 1 && stageDone(state, 1),
    stage = stages[n];
  return page(
    "Le pont des petits pouvoirs",
    `${bridgeScene(count)}<div class="adventure-steps">${stages.map((s, i) => `<div class="${stageDone(state, i) ? "done" : ""}"><span>${stageDone(state, i) ? "✓" : i + 1}</span>${s.title}</div>`).join("")}</div><section class="panel"><p class="eyebrow">🦄 ${prep ? "Un petit pouvoir à préparer" : count === 3 ? "Le chemin est ouvert" : "Une aventure, à ton rythme"}</p><h2>${stage?.title || "Bienvenue de l’autre côté !"}</h2><p class="intro-lesson">${prep ? "Nous avons posé la deuxième partie du pont. Avant les déterminants, retrouvons encore quelques noms sans aide. Tout ce que tu as construit reste en place." : stage?.story || "Grâce à tes aventures, le passage est réparé. Le renard a une histoire pour toi."}</p>${stage ? `<div class="notice">${stage.lesson}</div>${button("🔊 Écouter Luna", "bridge-audio")} ${button(state.session ? "Reprendre ma mission →" : prep ? "Préparer mon pouvoir →" : "Essayer avec Luna →", state.session ? "resume" : "bridge-start", "primary")}` : button("Traverser →", "clearing", "primary")}<p class="sub">Tu peux faire une seule partie aujourd’hui et revenir quand tu veux.</p></section>`,
  );
}
function clearing() {
  if (bridgeCount(state) < 3) return bridge();
  return page(
    "La clairière des histoires",
    `<section class="clearing-scene"><span>🌲</span><span>🦊</span><span>🌳</span><h2>Tu as trouvé mon petit refuge !</h2></section><article class="panel"><p class="eyebrow">Un nouveau lieu dans ton royaume</p><h2>Le renard et les trois passages</h2><p class="passage">Le renard attendait près de la rivière. « Je voyais le château, mais je ne pouvais pas le rejoindre. »<br>Luna lui montre le pont : « Nous avons compté, cherché les mots et essayé encore. »<br>Le renard pose une petite graine dans sa main. « Alors, plantons une histoire ensemble. »</p>${button("🔊 Écouter l’histoire", "clearing-audio")} ${button("Retrouver mon jardin", "garden", "primary")}</article>`,
  );
}
function start(mode = "normal", id = null) {
  if (state.session) {
    route = "mission";
    render();
    return;
  }
  const queue = id ? Array(5).fill(id) : plan(state, mode === "mini" ? 5 : 12);
  if (!queue.length) {
    route = "discover";
    render();
    return;
  }
  state.session = {
    contentRevision: 2,
    id: crypto.randomUUID(),
    queue,
    index: 0,
    seed: crypto.getRandomValues(new Uint32Array(1))[0],
    started: Date.now(),
    mode,
    draft: "",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
  };
  persist();
  route = "mission";
  render();
}
function discover() {
  return page("Choisir ma mission", pickerView(state, selectedSubject));
}
function lesson() {
  const skill = skills.find((s) => s.id === lessonId);
  const blocked =
    state.skills[lessonId].status === "seen" ? [] : missing(state, lessonId);
  if (blocked.length) {
    const first = skills.find((s) => s.id === blocked[0]);
    return page(
      skill.name,
      `<section class="panel course-preparation"><div class="course-icon">${skill.icon}</div><p class="eyebrow">LE CHEMIN VERS UN NOUVEAU POUVOIR</p><h2>Préparons cette aventure ensemble.</h2><p>Pour découvrir « ${skill.name} », commençons par « ${first.name} ». Ce petit pouvoir va nous aider.</p>${button("Préparer : " + first.name, "lesson", "primary", `data-id="${first.id}"`)} ${button("Choisir une autre mission", "missions", "quiet")}</section>`,
    );
  }
  return page(
    skill.name,
    `<div class="lesson-path"><span>1 · Je découvre</span><span>2 · J’essaie</span><span>3 · Je pars en mission</span></div><section class="panel ludic-lesson"><p class="eyebrow">${skill.icon} ${skill.subject} · AVEC LUNA</p><h2>Un petit pouvoir à comprendre.</h2><p class="intro-lesson">${skill.lesson}</p>${button("🔊 Écouter", "lesson-audio")}${lessonActivity(lessonId, lessonStep)}<div class="lesson-launch"><div><h3>Prête à essayer ?</h3><p>5 petits défis · des indices si tu en as besoin · 🪙 10 pièces</p></div>${button(state.session ? "Reprendre ma mission →" : "À moi d’essayer →", state.session ? "resume" : "lesson-start", "primary")}</div>${button("← Toutes les missions", "missions", "quiet")}</section>`,
  );
}
function mission() {
  const s = state.session;
  if (!s) return home();
  if (s.index >= s.queue.length) return finish();
  const q = current(),
    skill = skills.find((x) => x.id === q.skill),
    pct = (s.index / s.queue.length) * 100;
  let input = "";
  if (q.type === "exchange") {
    const exchanged = s.draft === "1,3";
    input = `<div class="exchange-board"><div><strong>${exchanged ? "Une dizaine" : "Les clous à regrouper"}</strong><div class="cube-tray ${exchanged ? "bundled" : ""}">${Array.from({ length: 10 }, () => '<span class="cube"></span>').join("")}</div></div><div><strong>Les unités restantes</strong><div class="cube-tray">${'<span class="cube"></span>'.repeat(3)}</div></div></div><p class="notice">${exchanged ? "10 + 3 = 13. Le rangement a changé, le nombre de clous est resté le même." : "Compte les dix cubes à gauche. Nous allons en faire une seule barre."}</p>${button(exchanged ? "✓ Une dizaine formée" : "Regrouper dix cubes", "exchange", "", exchanged || s.answered ? "disabled" : "")} ${button("Valider mon rangement", "exchange-check", "primary", !exchanged || s.answered ? "disabled" : "")}`;
  }
  if (q.type === "sortword")
    input = `<div class="word-bank sorting">${q.words.map((w, i) => button(esc(w), "sort-select", s.order[0] === i ? "selected" : "", `data-index="${i}" aria-pressed="${s.order[0] === i}" ${s.answered ? "disabled" : ""}`)).join("")}</div>${button(`${q.destination}<br><small>${s.order.length ? `Déposer « ${esc(q.words[s.order[0]])} »` : "Choisis d’abord un mot"}</small>`, "sort-place", "word-house", !s.order.length || s.answered ? "disabled" : "")}`;
  if (q.type === "choice")
    input = `<div class="choices">${q.options.map((v) => button(esc(v), "answer", "", `data-value="${esc(v)}" ${s.answered ? "disabled" : ""}`)).join("")}</div>`;
  if (q.type === "input")
    input = `<form class="answer" id="answer-form"><label class="sr-only" for="answer-input">Ta réponse</label><input id="answer-input" autocomplete="off" maxlength="150" inputmode="${q.numeric || ["number", "addition", "subtract", "problem", "multiplication"].includes(q.skill) ? "numeric" : "text"}" value="${esc(s.draft)}" ${s.answered ? "disabled" : ""}><button class="primary" ${s.answered ? "disabled" : ""}>Valider</button></form>`;
  if (q.type === "blocks") {
    const v = s.draft.split(",").map(Number),
      t = v[0] || 0,
      u = v[1] || 0;
    input = `<div class="blocks">${[
      ["Dizaines", t, "tens", "▰"],
      ["Unités", u, "units", "▪"],
    ]
      .map(
        ([name, n, key, icon]) =>
          `<div><strong>${name}</strong><output>${icon.repeat(n) || "—"}</output><div class="row">${button("−", "block", "", `data-part="${key}" data-step="-1" aria-label="Retirer une ${name.toLowerCase()}" ${s.answered ? "disabled" : ""}`)}<span>${n}</span>${button("+", "block", "", `data-part="${key}" data-step="1" aria-label="Ajouter une ${name.toLowerCase()}" ${s.answered ? "disabled" : ""}`)}</div></div>`,
      )
      .join(
        "",
      )}</div>${button("Valider", "block-check", "primary", s.answered ? "disabled" : "")}`;
  }
  if (q.type === "order")
    input = `<div class="word-zone" aria-label="Ta phrase">${s.order.map((n, i) => button(esc(q.words[n]), "word-remove", "", `data-index="${i}" ${s.answered ? "disabled" : ""}`)).join("") || '<span class="muted">Touche les mots dans le bon ordre.</span>'}</div><div class="word-bank">${q.words.map((w, i) => button(esc(w), "word", "", `data-index="${i}" ${s.order.includes(i) || s.answered ? "disabled" : ""}`)).join("")}</div><p>${button("Valider ma phrase", "order-check", "primary", s.answered ? "disabled" : "")}</p>`;
  const fatigue =
    (state.history.slice(-3).length === 3 &&
      state.history.slice(-3).every((e) => e.skip || !e.correct)) ||
    Date.now() - s.started > 20 * 60000;
  return `<main class="exercise">${s.adventure !== undefined ? `<div class="adventure-ribbon">🌉 ${stages[s.adventure].title} · ${bridgeCount(state)}/3 parties du pont</div>` : ""}<div class="row" style="justify-content:space-between">${button("← Faire une pause", "home", "quiet")}<span class="muted">${s.index + 1} / ${s.queue.length} petits défis</span></div><div class="progress" role="progressbar" aria-label="Mission" aria-valuemin="0" aria-valuemax="${s.queue.length}" aria-valuenow="${s.index}"><span style="width:${pct}%"></span></div><section class="panel"><p class="eyebrow">${skill.icon} ${skill.name}</p>${q.passage ? `<div class="passage">${q.passage}</div>` : ""}${q.guided ? `<div class="notice">🦄 On essaie ensemble. ${stages[s.adventure].lesson}</div>` : ""}<h2>${q.prompt}</h2>${button(q.audio ? "▶ Écouter le mot" : "🔊 Écouter la consigne", "read", "small")}${q.audio ? `<details><summary>Si le son ne fonctionne pas · aide adulte</summary><p>Mot à lire : <strong>${q.audio}</strong>. Utiliser cette aide ne valide pas une réussite autonome.</p>${button("Utiliser cette aide", "hint", "small")}</details>` : ""}${q.visual ? `<div class="visual">${q.visual}</div>` : ""}${input}${
    !s.answered
      ? `<fieldset class="confidence"><legend>Si tu veux, dis à Luna comment tu te sens.</legend>${[
          ["unsure", "🤔 Pas sûre"],
          ["sure", "🙂 Assez sûre"],
          ["very", "😎 Très sûre"],
        ]
          .map(([v, t]) =>
            button(
              t,
              "confidence",
              s.confidence === v ? "selected" : "",
              `data-value="${v}" aria-pressed="${s.confidence === v}"`,
            ),
          )
          .join(
            "",
          )}</fieldset><div class="row">${button("💡 Un indice", "hint", "quiet")}${button("🤷 Je ne sais pas", "skip", "quiet")}</div>`
      : ""
  }${s.feedback ? `<div class="feedback" role="status">🦄 ${esc(s.feedback)}${s.answered ? `<br>${button(s.index + 1 === s.queue.length ? "Terminer ma mission →" : "Un autre défi →", "next", "primary")}` : ""}</div>` : ""}${fatigue ? `<div class="notice">On a déjà bien travaillé. Tu peux retourner au royaume et te reposer. Ta mission t’attendra.${button("Faire une pause", "home", "quiet")}</div>` : ""}</section></main>`;
}
function answer(value, skip = false) {
  const s = state.session;
  if (!s || s.answered) return;
  const q = current();
  if (!skip && !String(value).trim()) {
    toast("Écris une réponse ou choisis « Je ne sais pas ».");
    return;
  }
  const correct = !skip && check(q, value);
  const d = diagnostic(q, value);
  record(
    state,
    q.skill,
    {
      correct,
      skip,
      assisted: s.assisted || skip || Boolean(q.guided),
      dimension: q.dimension,
      fingerprint: q.fingerprint,
      confidence: s.confidence,
      error: correct ? "" : skip ? "dont_know" : d.code,
    },
    Date.now(),
  );
  if (q.type !== "blocks") s.draft = String(value);
  s.answered = true;
  s.feedback = correct
    ? s.assisted || q.guided
      ? "Tu as utilisé l’aide pour avancer. Nous réessaierons avec un nouvel exemple."
      : s.adventure !== undefined
        ? stages[s.adventure].strategy
        : "Tu as trouvé ! Garde cette stratégie pour le prochain défi."
    : `${skip ? "Regardons ensemble. " : ""}${d.text} La réponse est : ${q.displayAnswer || q.answer}. On essaiera un autre exemple.`;
  if (!correct && s.queue.length < 16) s.queue.push(q.skill);
  persist();
  render();
}
function next() {
  const s = state.session;
  if (!s?.answered) return;
  s.index++;
  delete s.questionSeed;
  Object.assign(s, {
    draft: "",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
  });
  if (s.index === s.queue.length) reward(state, s);
  persist();
  render();
}
function finish() {
  if (state.session.adventure !== undefined) {
    const count = bridgeCount(state);
    return page(
      count === 3 ? "Le pont est réparé !" : "Une partie du pont est posée !",
      `${bridgeScene(count)}<section class="panel celebration"><h2>${count === 3 ? "La clairière t’attend." : "Regarde ce que tes efforts ont construit."}</h2><p>Tu as cherché, manipulé et essayé. La suite peut attendre : rien ne disparaîtra.</p><p>⭐ ${state.session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p>${button(count === 3 ? "Découvrir la clairière →" : "Revenir au pont →", "bridge-finish", "primary")} ${button("Planter mes graines", "finish")}</section>`,
    );
  }
  return page(
    "Une aventure de plus !",
    `<section class="panel celebration"><div class="emoji">🌟</div><h1>Ton royaume a grandi.</h1><p>Tu as pris le temps de chercher, d’essayer et d’apprendre.<br>Tu gagnes <strong>2 graines</strong> à planter dans ton jardin.</p><p>⭐ ${state.session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p><p class="sub">Les étoiles racontent tes aventures. Elles ne sont pas une note.</p><p>${button("Planter mes graines →", "finish", "primary")}</p></section>`,
  );
}
function garden() {
  return page(
    "Mon jardin magique",
    `<p class="sub">Choisis une plante, puis touche une parcelle libre. Rien ne disparaît pendant tes pauses.</p><div class="garden-layout"><div class="plots">${state.garden.map((id, i) => button(id ? item(id).icon : "＋", "plant", "", `data-slot="${i}" aria-label="${id ? item(id).name : "Parcelle libre " + (i + 1)}" ${id ? "disabled" : ""}`)).join("")}</div><section class="panel"><h2>Une graine, une découverte.</h2><p>🌱 ${state.seeds} graines dans ta poche</p><div class="shop">${items
      .filter((i) => i.kind === "garden")
      .map((i) =>
        button(
          `<span class="emoji">${i.icon}</span><span>${i.name}<br><small>🌱 ${i.cost} graine${i.cost > 1 ? "s" : ""}</small></span>`,
          "pick",
          picked === i.id ? "selected" : "",
          `data-id="${i.id}" aria-pressed="${picked === i.id}"`,
        ),
      )
      .join("")}</div></section></div>`,
  );
}
function castleRooms() {
  return page(
    "Mon château",
    `<div class="panel"><h2>Chaque aventure ouvre une porte.</h2><p>Le château garde les souvenirs de tes découvertes.</p></div><div class="collection">${[
      ["📚", "Bibliothèque", 0],
      ["👗", "Dressing", 1],
      ["🏆", "Salle des trésors", 3],
      ["🔭", "Observatoire", 6],
    ]
      .map(
        ([icon, name, n]) =>
          `<div class="collect-item ${state.completed.length < n ? "locked" : ""}"><span class="emoji">${icon}</span><h3>${name}</h3>${state.completed.length >= n ? button("Entrer", name === "Dressing" ? "avatar" : name === "Salle des trésors" ? "collection" : name === "Observatoire" ? "science" : "story", "small") : `<p>Après ${n} aventures</p>`}</div>`,
      )
      .join("")}</div>`,
  );
}
function legacyOutfits() {
  return page(
    "Mon personnage",
    `<div class="avatar-preview" aria-label="Ton personnage et son compagnon">${item(state.outfit)?.icon || "🧑‍🌾"} ${item(state.pet)?.icon || ""}</div><div class="collection">${items
      .filter((i) => i.kind !== "garden")
      .map(
        (i) =>
          `<div class="collect-item"><span class="emoji">${i.icon}</span><h3>${i.name}</h3>${state.inventory.includes(i.id) ? button(state[i.kind === "pet" ? "pet" : "outfit"] === i.id ? "✓ Équipé" : "Équiper", "equip", "small", `data-id="${i.id}"`) : '<p class="sub">À découvrir dans une aventure</p>'}</div>`,
      )
      .join("")}</div>`,
  );
}
function castle() {
  return page(
    "Mon château",
    customizationView(state, "castle", previewItem) +
      `<p>${button("Entrer dans les pièces du château", "rooms", "secondary")}</p>`,
  );
}
function avatar() {
  return page(
    "Mon aventurière",
    customizationView(state, "avatar", previewItem) +
      `<p>${button("Mes compagnons et cadeaux de mission", "legacy-outfits", "secondary")}</p>`,
  );
}
function collection() {
  return page(
    "Mes trésors",
    `<p>Les souvenirs de tes aventures et les objets que tu as choisis.</p><h2>Ma boutique personnelle</h2><div class="shop-grid">${
      state.rpg.owned
        .map((id) => {
          const i = shop.find((x) => x.id === id);
          return button(
            `<span class="shop-item-art">${itemArt(i.id)}</span><strong>${i.name}</strong><small>Voir et équiper</small>`,
            "owned-item",
            "shop-tile",
            `data-id="${i.id}"`,
          );
        })
        .join("") ||
      '<p class="muted">Tes premiers objets t’attendent au fil des missions.</p>'
    }</div><h2 class="shop-heading">Mon jardin et mes compagnons</h2><div class="collection">${items.map((i) => `<div class="collect-item ${state.inventory.includes(i.id) ? "" : "locked"}"><span class="emoji">${state.inventory.includes(i.id) ? i.icon : "◇"}</span><h3>${i.name}</h3><p class="sub">${state.inventory.includes(i.id) ? "Dans ta collection" : "À découvrir"}</p></div>`).join("")}</div>`,
  );
}
function adventureReport() {
  const rows = stages
    .map((stage) => {
      const entries = state.history.filter(
        (e) => e.fingerprint.startsWith("bridge:") && e.skill === stage.skill,
      );
      if (!entries.length) return "";
      const independent = entries.filter(
        (e) => e.correct && !e.assisted && !e.skip,
      );
      const last = entries.at(-1);
      return `<p><strong>${skills.find((s) => s.id === stage.skill).name}</strong> : ${independent.length ? "des exemples réussis sans aide" : "premiers essais accompagnés"}. ${last.skip || !last.correct ? "À reprendre tranquillement avec un exemple différent." : "À retrouver plus tard pour vérifier ce qui reste en mémoire."}</p>`;
    })
    .join("");
  return `<section class="panel"><p class="eyebrow">L’aventure du pont</p><h2>${bridgeCount(state)} parties construites sur 3</h2>${rows || "<p>Une première histoire pour manipuler, comprendre puis essayer sans aide.</p>"}<p class="sub">La construction récompense le travail réalisé. Elle ne certifie pas la maîtrise d’une notion.</p></section>`;
}
function gatePanel() {
  return page(
    "Espace parent",
    `<section class="panel"><h2>Cette porte est pour les grands.</h2><p>Pour ouvrir les réglages, combien font 7 × 8 ?</p><form id="gate-form" class="answer"><label class="sr-only" for="gate">Réponse du parent</label><input id="gate" inputmode="numeric" maxlength="3"><button class="primary">Ouvrir</button></form><p class="sub">Protection contre les clics accidentels, pas un contrôle d’accès sécurisé.</p></section>`,
  );
}
function discoveryParentPage() {
  return parentUnlocked
    ? discoveryParentView(state, { sessionActive: Boolean(state.session) })
    : gatePanel();
}
function parent() {
  if (!parentUnlocked) return gatePanel();
  const recent = state.history.slice(-12),
    touched = [...new Set(recent.map((e) => e.skill))];
  return page(
    "L’espace parent",
    `<section class="panel"><p class="eyebrow">Le carnet de voyage</p><h2>${state.completed.length} aventures, à son rythme.</h2><p>Les étoiles récompensent la participation. La maîtrise repose sur des preuves distinctes et espacées ; les notions non abordées ne sont jamais des faiblesses.</p>${
      touched
        .map((id) => {
          const s = state.skills[id];
          return `<p>${mastered(s) ? "🌷" : ready(s) ? "🌿" : "🌱"} <strong>${skills.find((x) => x.id === id).name}</strong> — ${mastered(s) ? "preuves variées et rappels espacés" : ready(s) ? "premières réussites autonomes, à consolider" : "en cours d’apprentissage"}${s.due ? " · rappel prévu le " + new Date(s.due).toLocaleDateString("fr-FR") : ""}</p>`;
        })
        .join("") ||
      "<p>Aucune réponse pour le moment. Indiquez les notions déjà travaillées ou commencez par une découverte.</p>"
    }<p class="sub">Prochaine mission : ${[...new Set(plan(state, 5))].map((id) => skills.find((x) => x.id === id).name).join(", ") || "une découverte choisie ensemble"}.</p></section>${discoveryParentSummary(state)}${adventureReport()}${learningReport(state)}<section class="panel settings"><h2>Profil et sauvegardes</h2><label>Nom du royaume <input id="profile-name" type="text" maxlength="40" value="${esc(state.name)}"></label><label><input type="checkbox" id="motion" ${state.settings.motion ? "checked" : ""}> Animations douces</label><div class="row">${button("Exporter la sauvegarde JSON", "export")}${button("Importer une sauvegarde", "import")}<input type="file" id="import-file" accept="application/json,.json" hidden></div><p class="sub">Sauvegarde locale à cet appareil et à cette adresse. Exportez régulièrement pour changer de navigateur ou de tablette. L’import remplace la progression ; une copie de l’état actuel est téléchargée avant remplacement.</p></section><h2>Notions et prérequis</h2><div class="parent-grid">${skills
      .map((s) => {
        const p = state.skills[s.id];
        return `<section class="skill-row"><div class="skill-top"><h3>${s.icon} ${s.name}</h3><select data-status="${s.id}" aria-label="Statut scolaire : ${s.name}" ${state.session ? "disabled" : ""}>${[
          ["unknown", "À vérifier"],
          ["seen", "Déjà travaillé"],
          ["not_seen", "Pas encore abordé"],
        ]
          .map(
            ([v, t]) =>
              `<option value="${v}" ${p.status === v ? "selected" : ""}>${t}</option>`,
          )
          .join(
            "",
          )}</select></div><p>${s.subject} · Prérequis : ${s.pre.map((id) => skills.find((x) => x.id === id).name).join(", ") || "aucun"}.</p><div class="stats">${[
          ["recognition", "Reconnaissance"],
          ["manipulation", "Manipulation"],
          ["production", "Autonomie"],
          ["transfer", "Transfert"],
          ["memory", "Mémoire"],
        ]
          .map(([d, t]) => {
            const es = evidence(p, d);
            return `<span>${t} : ${es.length ? es.filter((e) => e.correct).length + "/" + es.length : "à observer"}</span>`;
          })
          .join(
            "",
          )}</div><p>${p.evidence.filter((e) => e.skip).length} demandes « Je ne sais pas » · ${p.evidence.filter((e) => e.assisted && !e.skip).length} réponses avec aide</p><div class="row">${button("Repartir des bases", "lesson", "small", `data-id="${s.id}" ${state.session ? "disabled" : ""}`)}${button("Mini-bilan", "assessment", "small", `data-id="${s.id}" ${state.session ? "disabled" : ""}`)}</div></section>`;
      })
      .join(
        "",
      )}</div><p class="notice">${state.session ? "Une mission est en cours : les changements de statut attendront sa fin. " : ""}30 notions disponibles. Couverture CE1 partielle ; la progression proposée doit être mise en regard du travail en classe. Aucune donnée envoyée à une IA.</p>`,
  );
}
function render() {
  document.body.classList.toggle("no-motion", !state.settings.motion);
  let body;
  if (fatal) {
    body = page(
      "Préservons ta sauvegarde",
      `<div class="panel"><p>${esc(fatal)}</p>${button("Télécharger la sauvegarde brute", "export-raw")}</div>`,
    );
  } else
    body =
      {
        home,
        market: () => marketView(state),
        discovery: () => discoveryView(state),
        "discovery-parent": discoveryParentPage,
        missions: discover,
        rooms: castleRooms,
        "legacy-outfits": legacyOutfits,
        bridge,
        clearing,
        discover,
        lesson,
        mission,
        garden,
        castle,
        avatar,
        collection,
        parent,
        story: () =>
          page(
            "La petite graine de Luna",
            `<article class="panel passage">Luna trouve une graine au bord du chemin. Elle la plante près du château. Le dragon lui apporte de l’eau. Ensemble, ils attendent.<p>Un matin, une petite feuille apparaît.</p>« Elle a pris son temps », dit Luna. « Comme nous quand nous apprenons. »<p>${button("🔊 Écouter l’histoire", "story-audio", "small")}</p></article>`,
          ),
        science: () =>
          page(
            "L’observatoire",
            `<section class="panel"><h2>Regarder, se demander, observer.</h2><p>Choisis une plante près de chez toi. Dessine une feuille aujourd’hui. Dans quelques jours, observe-la de nouveau : qu’est-ce qui a changé ?</p>${button("Explorer le vivant", "lesson", "primary", 'data-id="living"')}</section>`,
          ),
      }[route]?.() || home();
  app.innerHTML =
    `<div class="shell">${header()}${storageError ? `<div class="notice error" role="alert">${storageError}</div>` : ""}${body}${footer()}</div>`.replaceAll(
      "🪙",
      '<span class="coin-symbol" aria-hidden="true">✦</span>',
    );
}
function discoveryCtx() {
  return {
    state,
    persist,
    render,
    go,
    speak,
    toast,
    startMission: (id) => start("mini", id),
    download,
    now: () => Date.now(),
    seed: () => crypto.getRandomValues(new Uint32Array(1))[0],
    uuid: () => "d:" + crypto.randomUUID(),
  };
}
function go(to) {
  route = to;
  render();
  scrollTo({ top: 0, behavior: "instant" });
}
function download(text, name) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
app.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b || b.disabled) return;
  const a = b.dataset.action;
  if (a.startsWith("disc-")) {
    discoveryAction(discoveryCtx(), b);
    return;
  }
  if (a.startsWith("market-")) {
    if (a === "market-open") {
      state.market ??= newMarket(marketCount(state));
      persist();
      go("market");
      return;
    }
    const m = state.market;
    if (!m) return;
    if (
      a === "market-decor" &&
      marketCount(state) === 4 &&
      ["rose", "sage", "gold"].includes(b.dataset.color)
    ) {
      state.marketDecor = b.dataset.color;
      persist();
      render();
      return;
    }
    if (a === "market-read") {
      speak(
        m.started
          ? marketQuestion(m).prompt
          : marketStages[m.stage]?.lesson || "Le marché est ouvert !",
      );
      return;
    }
    if (a === "market-equip") {
      equipRpg(state, "bag-adventure");
      persist();
      go("avatar");
      return;
    }
    if (a === "market-replay" && m.stage === 4) {
      state.market = newMarket();
      persist();
      go("market");
      return;
    }
    if (a === "market-start" && m.stage < 4) {
      if (state.session) {
        toast(
          "Une mission est en pause. Termine-la ou range-la dans « Choisir ma mission » avant de commencer cette aventure.",
        );
        return;
      }
      state.skills[marketStages[m.stage].skill].status = "seen";
      const recent = state.history
        .filter((e) => e.skill === marketStages[m.stage].skill)
        .slice(-5);
      const autonomous = new Set(
        recent
          .filter((e) => e.correct && !e.assisted && !e.skip)
          .map((e) => e.fingerprint),
      ).size;
      m.level = autonomous >= 4 ? 2 : autonomous >= 2 ? 1 : 0;
      m.started = true;
    }
    if (m.started && !m.solved) {
      if (a === "market-pick") m.draft[0] = Number(b.dataset.value);
      if (a === "market-adjust") {
        const i = Number(b.dataset.slot);
        m.draft[i] = Math.max(
          0,
          Math.min(12, m.draft[i] + Number(b.dataset.delta)),
        );
      }
      if (a === "market-hour")
        m.draft[0] =
          (((m.draft[0] || 12) + Number(b.dataset.delta) + 11) % 12) + 1;
      if (a === "market-minute") m.draft[1] = 1 - m.draft[1];
      if (a === "market-hint") m.helped = true;
      if (a === "market-check") {
        const result = answerMarket(m);
        if (result) {
          state.skills[result.skill].status = "seen";
          record(state, result.skill, result);
        }
      }
    }
    if (a === "market-next" && m.solved) {
      const finished = advanceMarket(m, m.feedback.startsWith("Bien"));
      if (finished !== null) {
        reward(state, {
          id: `market:${finished}`,
          index: 3,
          queue: Array(3).fill(marketStages[finished].skill),
        });
      }
      if (m.stage === 4 && !state.rpg.owned.includes("bag-adventure"))
        state.rpg.owned.push("bag-adventure");
    }
    persist();
    render();
    return;
  }
  if (["missions", "rooms", "legacy-outfits"].includes(a)) {
    go(a);
    return;
  }
  if (a === "subject") {
    if (subjects.some((s) => s.name === b.dataset.subject)) {
      selectedSubject = b.dataset.subject;
      go("missions");
    }
    return;
  }
  if (a === "lesson-step") {
    lessonStep = ["number", "multiplication"].includes(lessonId)
      ? (lessonStep + 1) % 3
      : lessonStep
        ? 0
        : 1;
    render();
    return;
  }
  if (a === "lesson-token") {
    const expected =
      lessonId === "noun"
        ? "dragon"
        : lessonId === "determiner"
          ? "le"
          : "petit";
    if (b.dataset.word === expected) {
      lessonStep = 1;
      render();
    } else
      toast(
        lessonId === "determiner"
          ? "Cherche le tout petit mot devant « petit dragon »."
          : lessonId === "noun"
            ? "Quel mot nomme l’animal ?"
            : "Quel mot dit comment est le dragon ?",
      );
    return;
  }
  if (a === "lesson-english") {
    speak(
      lessonId === "english_numbers"
        ? "one, two, three, four, five, six, seven, eight, nine, ten"
        : lessonId === "colors"
          ? "red, blue, green, yellow"
          : "cat, dog, rabbit, bird",
      "en-GB",
    );
    return;
  }
  if (a === "owned-item") {
    const i = shop.find((i) => i.id === b.dataset.id);
    if (i) {
      previewItem = i.id;
      go(i.kind === "avatar" ? "avatar" : "castle");
    }
    return;
  }
  if (a === "rpg-preview") {
    previewItem = b.dataset.id;
    render();
    document.querySelector(".studio")?.scrollIntoView({ block: "start" });
    return;
  }
  if (a === "preview-clear") {
    previewItem = null;
    render();
    return;
  }
  if (a === "rpg-buy") {
    if (purchase(state, b.dataset.id)) {
      persist();
      render();
      toast("Cet objet est à toi ! Tu peux maintenant l’équiper.");
    } else toast("Cet achat n’est pas possible. Tes pièces sont conservées.");
    return;
  }
  if (a === "rpg-equip") {
    if (equipRpg(state, b.dataset.id)) {
      persist();
      previewItem = null;
      render();
      toast("Équipé ! Retrouve-le aussi dans ton royaume.");
    }
    return;
  }
  if (a === "look") {
    const part = b.dataset.part,
      n = Number(b.dataset.index);
    if (["skin", "hair"].includes(part) && [0, 1, 2, 3].includes(n)) {
      state.rpg.look[part] = n;
      persist();
      render();
    }
    return;
  }
  if (a === "rpg-reset") {
    const group = b.dataset.kind === "castle" ? "castle" : "equipped";
    for (const slot of Object.keys(state.rpg[group]))
      state.rpg[group][slot] = null;
    previewItem = null;
    persist();
    render();
    return;
  }
  if (a === "park-session") {
    state.session = null;
    persist();
    go("missions");
    toast(
      "Tes réponses sont conservées. Tu peux choisir une nouvelle mission.",
    );
    return;
  }
  if (a === "bridge" || a === "clearing") {
    go(a);
    return;
  }
  if (a === "bridge-start") {
    if (state.session) {
      go("mission");
      return;
    }
    createAdventure(
      state,
      crypto.getRandomValues(new Uint32Array(1))[0],
      crypto.randomUUID(),
    );
    persist();
    go("mission");
    return;
  }
  if (a === "bridge-audio") {
    const n = nextStage(state);
    if (n >= 0) speak(stages[n].story + " " + stages[n].lesson);
    return;
  }
  if (a === "bridge-finish") {
    state.session = null;
    persist();
    go(bridgeCount(state) === 3 ? "clearing" : "bridge");
    return;
  }
  if (a === "clearing-audio") {
    speak(
      "Le renard attendait près de la rivière. Je voyais le château, mais je ne pouvais pas le rejoindre. Luna lui montre le pont : nous avons compté, cherché les mots et essayé encore. Le renard pose une petite graine dans sa main. Alors, plantons une histoire ensemble.",
    );
    return;
  }
  if (a === "exchange") {
    state.session.draft = "1,3";
    persist();
    render();
    return;
  }
  if (a === "exchange-check") {
    answer(state.session.draft);
    return;
  }
  if (a === "sort-select") {
    state.session.order = [Number(b.dataset.index)];
    persist();
    render();
    return;
  }
  if (a === "sort-place") {
    answer(current().words[state.session.order[0]]);
    return;
  }
  if (
    [
      "home",
      "garden",
      "castle",
      "avatar",
      "collection",
      "discover",
      "story",
      "science",
    ].includes(a)
  ) {
    go(a);
    return;
  }
  if (a === "start" || a === "mini") {
    start(a === "mini" ? "mini" : "normal");
    return;
  }
  if (a === "resume") {
    go(state.session ? "mission" : "home");
    return;
  }
  if (a === "parent-gate") {
    go("parent");
    return;
  }
  if (a === "sound") {
    state.settings.sound = !state.settings.sound;
    if (!state.settings.sound) window.speechSynthesis?.cancel();
    persist();
    render();
    return;
  }
  if (a === "lesson") {
    lessonId = b.dataset.id;
    lessonStep = 0;
    go("lesson");
    return;
  }
  if (a === "lesson-audio") {
    speak(skills.find((x) => x.id === lessonId).lesson);
    return;
  }
  if (a === "lesson-start") {
    state.skills[lessonId].status = "seen";
    persist();
    start("discovery", lessonId);
    state.session.assisted = true;
    persist();
    render();
    return;
  }
  if (a === "assessment") {
    state.skills[b.dataset.id].status = "seen";
    persist();
    start("mini", b.dataset.id);
    return;
  }
  if (a === "read") {
    const q = current();
    speak(q.audio || [q.passage, q.prompt].filter(Boolean).join(" "), q.lang);
    return;
  }
  if (a === "story-audio") {
    speak(
      "Luna trouve une graine au bord du chemin. Elle la plante près du château. Le dragon lui apporte de l’eau. Ensemble, ils attendent. Un matin, une petite feuille apparaît. Elle a pris son temps, dit Luna. Comme nous quand nous apprenons.",
    );
    return;
  }
  if (a === "answer") {
    answer(b.dataset.value);
    return;
  }
  if (a === "skip") {
    answer("", true);
    return;
  }
  if (a === "hint") {
    state.session.assisted = true;
    state.session.feedback = current().hint;
    persist();
    render();
    return;
  }
  if (a === "confidence") {
    state.session.confidence = b.dataset.value;
    persist();
    render();
    return;
  }
  if (a === "next") {
    next();
    return;
  }
  if (a === "block") {
    let [t = 0, u = 0] = state.session.draft.split(",").map(Number);
    if (b.dataset.part === "tens")
      t = Math.min(9, Math.max(0, t + Number(b.dataset.step)));
    else u = Math.min(9, Math.max(0, u + Number(b.dataset.step)));
    state.session.draft = `${t},${u}`;
    persist();
    render();
    return;
  }
  if (a === "block-check") {
    const [t = 0, u = 0] = state.session.draft.split(",").map(Number);
    answer(String(t * 10 + u));
    return;
  }
  if (a === "word") {
    state.session.order.push(Number(b.dataset.index));
    persist();
    render();
    return;
  }
  if (a === "word-remove") {
    state.session.order.splice(Number(b.dataset.index), 1);
    persist();
    render();
    return;
  }
  if (a === "order-check") {
    answer(state.session.order.map((i) => current().words[i]).join(" "));
    return;
  }
  if (a === "finish") {
    state.session = null;
    persist();
    go("garden");
    return;
  }
  if (a === "pick") {
    picked = b.dataset.id;
    render();
    return;
  }
  if (a === "plant") {
    if (plant(state, picked, Number(b.dataset.slot))) {
      persist();
      render();
      toast("Une nouvelle pousse dans ton jardin !");
    } else
      toast(
        "Cette plante attend encore quelques graines. Tu peux les gagner dans une mission.",
      );
    return;
  }
  if (a === "equip") {
    const i = item(b.dataset.id);
    if (state.inventory.includes(i.id)) {
      state[i.kind === "pet" ? "pet" : "outfit"] = i.id;
      const wearable =
        i.id === "hat" ? "head-hat" : i.id === "crown" ? "head-crown" : null;
      if (wearable) {
        if (!state.rpg.owned.includes(wearable)) state.rpg.owned.push(wearable);
        equipRpg(state, wearable);
      }
      persist();
      render();
    }
    return;
  }
  if (a === "export") {
    download(JSON.stringify(state, null, 2), "academie-sauvegarde.json");
    return;
  }
  if (a === "export-raw") {
    download(
      localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY) || "",
      "academie-sauvegarde-a-recuperer.json",
    );
    return;
  }
  if (a === "import") document.querySelector("#import-file").click();
});
app.addEventListener("submit", (e) => {
  e.preventDefault();
  if (e.target.id === "answer-form")
    answer(document.querySelector("#answer-input").value);
  if (e.target.id === "disc-form") discoverySubmit(discoveryCtx());
  if (e.target.id === "gate-form") {
    if (document.querySelector("#gate").value.trim() === "56") {
      parentUnlocked = true;
      render();
    } else toast("Ce n’est pas la réponse attendue. Demande à un adulte.");
  }
});
app.addEventListener("input", (e) => {
  if (e.target.id === "answer-input") {
    state.session.draft = e.target.value;
    persist();
  }
  if (e.target.id === "disc-input") discoveryInput(discoveryCtx(), e.target);
  if (e.target.id === "profile-name") {
    state.name = e.target.value;
    persist();
  }
});
app.addEventListener("change", async (e) => {
  if (e.target.dataset.status) {
    state.skills[e.target.dataset.status].status = e.target.value;
    persist();
    render();
  }
  if (e.target.id === "motion") {
    state.settings.motion = e.target.checked;
    persist();
    render();
  }
  if (e.target.id === "import-file") {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 2000000)
        throw Error("Fichier trop volumineux (maximum 2 Mo).");
      const imported = validate(JSON.parse(await file.text()));
      if (
        !confirm(
          "Remplacer la progression de cet appareil par cette sauvegarde ?",
        )
      )
        return;
      download(JSON.stringify(state, null, 2), "academie-avant-import.json");
      state = imported;
      upgradeDiscovery(state);
      resetDiscoveryScreen();
      persist();
      render();
      toast("Sauvegarde importée.");
    } catch (err) {
      toast("Import refusé : " + err.message);
    }
  }
});
render();
app.addEventListener(
  "toggle",
  (e) => {
    if (e.target.tagName === "DETAILS" && e.target.open && state.session) {
      state.session.assisted = true;
      persist();
    }
  },
  true,
);
if ("serviceWorker" in navigator)
  navigator.serviceWorker
    .register("./sw.js")
    .catch(() =>
      toast("Le mode hors ligne n’est pas disponible à cette adresse."),
    );

window.addEventListener("storage", (e) => {
  if (e.key === KEY && e.newValue) {
    try {
      state = validate(JSON.parse(e.newValue));
      render();
    } catch {
      toast(
        "Une autre fenêtre a modifié la sauvegarde. Exportez votre progression avant de continuer.",
      );
    }
  }
});
