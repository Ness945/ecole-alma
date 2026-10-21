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
  expandGarden,
  upgradePlant,
  plantLevel,
  nextGardenSize,
  adopt,
  EXPAND_COST,
  UPGRADE_COST,
  PLANT_LEVELS,
  ready,
  mastered,
  evidence,
  easeFor,
  recallFor,
} from "./core.js";
import { exercise, check, diagnostic, selectExercise } from "./exercises.js";
import { exercise as legacyExercise } from "./exercises-v03.js";
import {
  shop,
  itemArt,
  purchase,
  equip as equipRpg,
  unequip as unequipRpg,
  avatarSvg,
  petIcon,
  groupOf,
  skins,
  hairs,
  styles,
} from "./rpg.js";
import { homeView, pickerView, customizationView } from "./rpg-ui.js";
import {
  reviewQueue,
  dailyQueue,
  dailyAvailable,
  stickers,
  earnedStickers,
  newStickers,
  weekSummary,
  giftNote,
} from "./extras.js";
import { plantIcon } from "./plant-art.js";
import { followupView } from "./followup.js";
import { syncOnce, readConfig, writeConfig, newCode, codeValid, normalizeCode } from "./sync.js";
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
import {
  chapterById,
  chapterDone,
  nextChapter,
  createChapter,
  BRIDGE_CHAPTERS,
} from "./story.js";
import { bookView, chapterView, chapterFinish } from "./story-ui.js";
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
  selectedBook = null,
  chapterId = null,
  selectedPlot = null,
  previewItem = null;
try {
  state = load(localStorage);
  if (upgradeDiscovery(state)) save(localStorage, state);
} catch (e) {
  fatal = e.message;
  state = fresh();
}

// Synchronisation chiffrée facultative (voir docs/SYNC.md) : hors ligne, tout continue de fonctionner.
let syncStatus = "",
  syncTimer = 0,
  syncBusy = false;
function syncSoon(delay = 4000) {
  if (!readConfig(localStorage)) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(runSync, delay);
}
async function runSync(manual = false) {
  const config = readConfig(localStorage);
  if (!config || syncBusy || fatal) return;
  if (!navigator.onLine) {
    syncStatus = "Hors ligne : la synchronisation reprendra seule.";
    return;
  }
  syncBusy = true;
  const started = state.modified || 0;
  try {
    const r = await syncOnce(state, config);
    if (r.changed && (state.modified || 0) === started && !state.session) {
      state = r.state;
      upgradeDiscovery(state);
      save(localStorage, state);
      render();
    }
    config.last = Date.now();
    writeConfig(localStorage, config);
    syncStatus = "Synchronisé à " + new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) + ".";
  } catch (err) {
    syncStatus = /Failed to fetch|aborted|timed out|NetworkError|Load failed/i.test(err.message) ? "Serveur injoignable pour le moment." : err.message;
  } finally {
    syncBusy = false;
    if (route === "parent") render();
  }
}
function syncPanel() {
  const c = readConfig(localStorage);
  const body = c
    ? `<p>Synchronisation <strong>active</strong>. ${syncStatus || (c.last ? "Dernier échange réussi : " + new Date(c.last).toLocaleString("fr-FR") + "." : "")}</p><p class="sub">Code famille : <strong>${c.code}</strong> — à saisir sur l’autre appareil.</p><div class="actions">${button("Synchroniser maintenant", "sync-now", "ghost")}${button("Désactiver sur cet appareil", "sync-off", "ghost")}</div>`
    : `<p>Retrouvez la même progression sur tous les appareils. La sauvegarde est <strong>chiffrée sur l’appareil</strong> avant l’envoi : le serveur ne voit que du texte illisible. Facultatif, désactivé par défaut.</p><label>Adresse du service<input id="sync-url" type="url" placeholder="https://academie-sync.votre-compte.workers.dev" autocomplete="off"></label><label>Code famille<input id="sync-code" type="text" placeholder="XXXXX-XXXXX-XXXXX-XXXXX" autocomplete="off"></label><p class="sub">Premier appareil : appuyez sur « Créer un code » et notez-le. Autres appareils : saisissez le même code.</p><div class="actions">${button("Créer un code", "sync-gen", "ghost")}${button("Activer", "sync-on")}</div>`;
  return `<section class="panel"><p class="eyebrow">Plusieurs appareils</p><h2>Synchronisation chiffrée</h2>${body}</section>`;
}
function persist() {
  try {
    if (fatal) return false;
    state.modified = Date.now();
    save(localStorage, state);
    syncSoon();
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
  u.rate = state.settings.slow ? 0.65 : 0.85;
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
    // Adaptation : après deux échecs de suite sur la notion, exemple plus simple avec soutien (figé pour la question).
    s.questionEase = easeFor(state, id);
    s.questionSeed = selectExercise(
      id,
      seed,
      state.skills[id].level,
      s.index,
      state.history,
      s.questionEase,
    ).seed;
    s.qStart = Date.now();
    persist();
  }
  return exercise(id, s.questionSeed, state.skills[id].level, s.index, Boolean(s.questionEase));
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
function start(mode = "normal", id = null, count = 5) {
  if (state.session) {
    route = "mission";
    render();
    return;
  }
  const queue = id
    ? Array(count).fill(id)
    : mode === "review"
      ? reviewQueue(state)
      : mode === "daily"
        ? dailyQueue(state)
        : plan(state, mode === "mini" ? 5 : (state.settings.length ?? 12));
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
let albumNew = [];
let castleTime = "auto";
function album() {
  const got = earnedStickers(state);
  return page(
    "Mon album d’autocollants",
    `<p class="sub">${got.length} autocollant${got.length > 1 ? "s" : ""} sur ${stickers.length}. Ils se collent tout seuls quand tu accomplis quelque chose de beau.</p><div class="album">${stickers
      .map((s) => {
        const has = got.includes(s.id);
        return `<div class="sticker ${has ? "got" : "locked"} ${albumNew.includes(s.id) ? "fresh" : ""}"><span class="sticker-icon" aria-hidden="true">${has ? s.icon : "◇"}</span><strong>${has ? s.name : "À découvrir"}</strong><small>${s.how}</small>${albumNew.includes(s.id) ? '<i class="sticker-new">Nouveau !</i>' : ""}</div>`;
      })
      .join("")}</div>`,
  );
}
function discover() {
  return page("Choisir ma mission", pickerView(state, selectedSubject));
}
function lesson() {
  const skill = skills.find((s) => s.id === lessonId);
  const blocked =
    state.skills[lessonId].status === "seen" ? [] : missing(state, lessonId);
  const first = blocked.length ? skills.find((s) => s.id === blocked[0]) : null;
  const seen = state.skills[lessonId].status === "seen";
  return page(
    skill.name,
    `<div class="lesson-path"><span>1 · Je découvre</span><span>2 · J’essaie</span><span>3 · Je pars en mission</span></div><section class="panel ludic-lesson"><p class="eyebrow">${skill.icon} ${skill.subject} · AVEC LUNA</p><h2>Un petit pouvoir à comprendre.</h2>${first ? `<div class="notice prep-advice">🦄 Luna te conseille de commencer par « ${first.name} », mais c’est toi qui choisis. ${button("Préparer : " + first.name, "lesson", "small", `data-id="${first.id}"`)}</div>` : ""}<p class="intro-lesson">${skill.lesson}</p>${button("🔊 Écouter", "lesson-audio")}${lessonActivity(lessonId, lessonStep)}<div class="lesson-launch"><div><h3>Prête à essayer ?</h3><p>5 petits défis · des indices si tu en as besoin · 🪙 10 pièces</p></div>${button(state.session ? "Reprendre ma mission →" : "À moi d’essayer →", state.session ? "resume" : "lesson-start", "primary")}${seen && !state.session ? button("S’entraîner davantage →", "practice", "secondary", `data-id="${lessonId}"`) : ""}</div>${button("← Toutes les missions", "missions", "quiet")}</section>`,
  );
}
function bookPage() {
  return page("Le Grand Livre des Lucioles", bookView(state, selectedBook || undefined));
}
function chapterPage() {
  const c = chapterById(chapterId);
  if (!c || chapterDone(state, c.n)) return bookPage();
  return page(c.title, chapterView(state, c.n, lessonStep));
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
  return `<main class="exercise">${s.adventure !== undefined ? `<div class="adventure-ribbon">🌉 ${stages[s.adventure].title} · ${bridgeCount(state)}/3 parties du pont</div>` : s.chapter !== undefined ? `<div class="adventure-ribbon">📖 Chapitre ${s.chapter} · ${esc(chapterById(s.chapter).title)}</div>` : ""}<div class="row" style="justify-content:space-between">${button("← Faire une pause", "home", "quiet")}<span class="muted">${s.index + 1} / ${s.queue.length} petits défis</span></div><div class="progress" role="progressbar" aria-label="Mission" aria-valuemin="0" aria-valuemax="${s.queue.length}" aria-valuenow="${s.index}"><span style="width:${pct}%"></span></div><section class="panel"><p class="eyebrow">${skill.icon} ${skill.name}</p>${s.note && s.noteAt === s.index ? `<div class="notice recall-note">🦄 ${esc(s.note)}</div>` : ""}${q.eased && !s.answered ? `<div class="notice ease-note">🦄 Cet exemple est un peu plus facile pour repartir doucement.${q.support && q.hint ? ` Petit coup de pouce : ${esc(q.hint)}` : ""}</div>` : ""}${q.passage ? `<div class="passage">${q.passage}</div>` : ""}${q.guided ? `<div class="notice">🦄 On essaie ensemble. ${stages[s.adventure].lesson}</div>` : ""}<h2>${q.prompt}</h2>${button(q.audio ? "▶ Écouter le mot" : "🔊 Écouter la consigne", "read", "small")}${q.audio ? `<details><summary>Si le son ne fonctionne pas · aide adulte</summary><p>Mot à lire : <strong>${q.audio}</strong>. Utiliser cette aide ne valide pas une réussite autonome.</p>${button("Utiliser cette aide", "hint", "small")}</details>` : ""}${q.visual ? `<div class="visual">${q.visual}</div>` : ""}${input}${
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
          )}</fieldset><div class="row">${button(s.hints ? "💡 Encore un indice" : "💡 Un indice", "hint", "quiet")}${button("🤷 Je ne sais pas", "skip", "quiet")}</div>`
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
      assisted: s.assisted || skip || Boolean(q.guided) || Boolean(q.support),
      dimension: q.dimension,
      fingerprint: q.fingerprint,
      confidence: s.confidence,
      error: correct ? "" : skip ? "dont_know" : d.code,
      // Détails pour le suivi parent (jamais envoyés nulle part, restent dans la sauvegarde locale)
      prompt: String(q.prompt).replace(/<[^>]*>/g, "").slice(0, 140),
      answer: skip ? "" : String(value).slice(0, 80),
      expected: String(q.displayAnswer || q.answer).slice(0, 80),
      ...(s.qStart && Date.now() - s.qStart <= 180000 ? { ms: Date.now() - s.qStart } : {}),
      hints: s.hints || 0,
      ease: Boolean(q.eased),
      mission: String(s.id).slice(0, 60),
      pos: s.index,
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
  // Trois échecs de suite : on revoit d'abord une notion de base déjà abordée, puis on reprend.
  const pre = !correct && s.adventure === undefined ? recallFor(state, q.skill) : null;
  if (pre && !(s.recalled || []).includes(pre) && s.queue.length < 16) {
    s.queue.splice(s.index + 1, 0, pre);
    s.recalled = [...(s.recalled || []), pre];
    s.note = `On revoit d’abord « ${skills.find((x) => x.id === pre).name} » pour repartir sur de bonnes bases.`;
    s.noteAt = s.index + 1;
  }
  persist();
  render();
}
function next() {
  const s = state.session;
  if (!s?.answered) return;
  s.index++;
  delete s.questionSeed;
  delete s.questionEase;
  delete s.qStart;
  Object.assign(s, {
    hints: 0,
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
  if (state.session.chapter !== undefined)
    return page("Chapitre terminé !", chapterFinish(state, state.session));
  if (state.session.adventure !== undefined) {
    const count = bridgeCount(state);
    return page(
      count === 3 ? "Le pont est réparé !" : "Une partie du pont est posée !",
      `${bridgeScene(count)}<section class="panel celebration"><h2>${count === 3 ? "La clairière t’attend." : "Regarde ce que tes efforts ont construit."}</h2><p>Tu as cherché, manipulé et essayé. La suite peut attendre : rien ne disparaîtra.</p><p>⭐ ${state.session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p>${giftNote(state)}${button(count === 3 ? "Découvrir la clairière →" : "Revenir au pont →", "bridge-finish", "primary")} ${button("Retour au menu principal", "finish-home", "secondary")} ${button("Planter mes graines", "finish", "quiet")}</section>`,
    );
  }
  return page(
    "Une aventure de plus !",
    `<section class="panel celebration"><div class="emoji">🌟</div><h1>Ton royaume a grandi.</h1><p>Tu as pris le temps de chercher, d’essayer et d’apprendre.<br>Tu gagnes <strong>2 graines</strong> à planter dans ton jardin.</p><p>⭐ ${state.session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p>${giftNote(state)}<p class="sub">Les étoiles racontent tes aventures. Elles ne sont pas une note.</p><p>${button("Retour au menu principal", "finish-home", "primary")} ${button("Planter mes graines", "finish", "secondary")}${new Set(state.session.queue).size === 1 ? " " + button("Encore des défis sur ce thème", "practice", "secondary", `data-id="${state.session.queue[0]}"`) : ""}</p></section>`,
  );
}
function garden() {
  const size = state.garden.length,
    next = nextGardenSize(state),
    cost = EXPAND_COST[size],
    sel = selectedPlot !== null && state.garden[selectedPlot] ? selectedPlot : null,
    seedItems = items.filter((i) => i.kind === "garden" && !i.coins),
    coinItems = items.filter((i) => i.kind === "garden" && i.coins);
  const tile = (i, price) =>
    button(
      `<span class="emoji">${plantIcon(i.id) || i.icon}</span><span>${i.name}<br><small>${price}</small></span>`,
      "pick",
      picked === i.id ? "selected" : "",
      `data-id="${i.id}" aria-pressed="${picked === i.id}"`,
    );
  const plots = state.garden
    .map((id, i) => {
      if (!id)
        return button("＋", "plant", "", `data-slot="${i}" aria-label="Parcelle libre ${i + 1}"`);
      const lv = plantLevel(state, i);
      return button(
        `<span class="plant plant-lv${lv}">${plantIcon(id) || item(id).icon}</span>${lv ? `<i class="plant-star" aria-hidden="true">${lv === 2 ? "🌟" : "✨"}</i>` : ""}`,
        "plot-select",
        `plot lv${lv} ${sel === i ? "selected" : ""}`,
        `data-slot="${i}" aria-label="${item(id).name}, ${PLANT_LEVELS[lv].toLowerCase()}" aria-pressed="${sel === i}"`,
      );
    })
    .join("");
  let care = "";
  if (sel !== null) {
    const lv = plantLevel(state, sel),
      up = UPGRADE_COST[lv];
    care = `<section class="panel plant-care"><h2>${plantIcon(state.garden[sel]) || item(state.garden[sel]).icon} ${item(state.garden[sel]).name}</h2><p>${PLANT_LEVELS[lv]} · ${lv === 0 ? "elle peut fleurir" : lv === 1 ? "elle peut devenir magique" : "elle brille de mille feux"}</p>${up !== undefined ? button(state.rpg.coins >= up ? `${lv === 0 ? "Faire fleurir" : "Rendre magique"} · ${up} 🪙` : `Il manque ${up - state.rpg.coins} pièces`, "plant-upgrade", "primary", `data-slot="${sel}" ${state.rpg.coins < up ? "disabled" : ""}`) : '<p class="muted">Cette plante a atteint sa plus belle forme.</p>'} ${button("Fermer", "plot-close", "quiet small")}</section>`;
  }
  return page(
    "Mon jardin magique",
    `<p class="sub">Touche une parcelle libre pour planter. Touche une plante pour la faire fleurir. Rien ne disparaît pendant tes pauses.</p><div class="garden-layout"><div><div class="plots" data-plots="${size}">${plots}</div>${state.pet ? `<div class="garden-pet">${petIcon(state.pet, "Ton compagnon se promène dans le jardin")}</div>` : ""}</div><div class="garden-side">${care}<section class="panel"><h2>Une graine, une découverte.</h2><p>🌱 ${state.seeds} graines dans ta poche · 🪙 ${state.rpg.coins} pièces</p><div class="shop">${seedItems.map((i) => tile(i, `🌱 ${i.cost} graine${i.cost > 1 ? "s" : ""}`)).join("")}</div></section><section class="panel"><h2>Les plantes rares</h2><p class="sub">Elles s’achètent avec des pièces.</p><div class="shop rare">${coinItems.map((i) => tile(i, `🪙 ${i.coins} pièces`)).join("")}</div></section><section class="panel garden-expand"><h2>Agrandir mon jardin</h2><p>${size} parcelles${next ? ` · +${next - size} parcelles possibles` : " · la taille maximale est atteinte"}</p>${next ? button(state.rpg.coins >= cost ? `Agrandir · ${cost} 🪙` : `Il manque ${cost - state.rpg.coins} pièces`, "garden-expand", "primary", state.rpg.coins < cost ? "disabled" : "") : ""}</section></div></div>`,
  );
}
function castleRooms() {
  return page(
    "Mon château",
    `<div class="panel"><h2>Chaque aventure ouvre une porte.</h2><p>Le château garde les souvenirs de tes découvertes.</p></div><div class="collection">${[
      ["🛏️", "Ma chambre", -1],
      ["📚", "Bibliothèque", 0],
      ["👗", "Dressing", 1],
      ["🏆", "Salle des trésors", 3],
      ["🔭", "Observatoire", 6],
    ]
      .map(
        ([icon, name, n]) =>
          `<div class="collect-item ${state.completed.length < n ? "locked" : ""}"><span class="emoji">${icon}</span><h3>${name}</h3>${state.completed.length >= n ? button("Entrer", name === "Ma chambre" ? "room" : name === "Dressing" ? "avatar" : name === "Salle des trésors" ? "collection" : name === "Observatoire" ? "science" : "story", "small") : `<p>Après ${n} aventures</p>`}</div>`,
      )
      .join("")}</div>`,
  );
}
function legacyOutfits() {
  return page(
    "Mon personnage",
    `<div class="avatar-preview legacy-avatar">${avatarSvg(state.rpg, "Ton personnage et son compagnon", { pet: state.pet })}</div><div class="collection">${items
      .filter((i) => i.kind !== "garden" && !i.price)
      .map(
        (i) =>
          `<div class="collect-item">${i.kind === "pet" ? `<span class="emoji pet-emoji">${petIcon(i.id)}</span>` : `<span class="emoji">${i.icon}</span>`}<h3>${i.name}</h3>${state.inventory.includes(i.id) ? button(i.kind === "pet" ? (state.pet === i.id ? "✓ Équipé" : "Équiper") : (state.rpg.equipped.head === ({ hat: "head-hat", crown: "head-crown" })[i.id] ? "✓ Équipé" : "Équiper"), "equip", "small", `data-id="${i.id}"`) : '<p class="sub">À découvrir dans une aventure</p>'}</div>`,
      )
      .join("")}</div>`,
  );
}
function castle() {
  return page(
    "Mon château",
    customizationView(state, "castle", previewItem, { time: castleTime }) +
      `<p>${button("Entrer dans les pièces du château", "rooms", "secondary")}</p>`,
  );
}
function room() {
  return page("Ma chambre", customizationView(state, "room", previewItem));
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
    }</div><h2 class="shop-heading">Mon jardin et mes compagnons</h2><div class="collection">${items.map((i) => `<div class="collect-item ${state.inventory.includes(i.id) ? "" : "locked"}"><span class="emoji">${state.inventory.includes(i.id) ? (i.kind === "garden" && plantIcon(i.id)) || i.icon : "◇"}</span><h3>${i.name}</h3><p class="sub">${state.inventory.includes(i.id) ? "Dans ta collection" : "À découvrir"}</p></div>`).join("")}</div>`,
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
function weekPanel() {
  const w = weekSummary(state),
    max = Math.max(1, ...w.days.map((d) => d.answered)),
    name = (id) => skills.find((s) => s.id === id)?.name ?? id,
    day = (t) => new Date(t).toLocaleDateString("fr-FR", { weekday: "short" });
  return `<section class="panel week-panel"><p class="eyebrow">Cette semaine</p><h2>${w.answered ? `${w.answered} petits défis, ${w.solo} réussis sans aide.` : "Pas encore de défis cette semaine."}</h2><div class="week-bars" role="img" aria-label="Défis par jour sur 7 jours : ${w.days.map((d) => day(d.start) + " " + d.answered).join(", ")}">${w.days.map((d) => `<div><span style="height:${Math.round((d.answered / max) * 56) + (d.answered ? 4 : 2)}px"></span><small>${day(d.start)}</small></div>`).join("")}</div>${w.solid.length ? `<p>🌷 <strong>Solide :</strong> ${w.solid.map((r) => name(r.skill)).join(", ")}.</p>` : ""}${w.toRevisit.length ? `<p>🌱 <strong>À reprendre tranquillement :</strong> ${w.toRevisit.map((r) => name(r.skill)).join(", ")}.</p>` : ""}${!w.solid.length && !w.toRevisit.length && w.answered ? "<p>Il faut encore quelques défis par notion pour dire ce qui est solide.</p>" : ""}<p class="sub">Un repère pour en parler ensemble, pas une note. Les aides et les « Je ne sais pas » ne comptent pas comme des réussites.</p></section>`;
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
    }<p class="sub">Prochaine mission : ${[...new Set(plan(state, 5))].map((id) => skills.find((x) => x.id === id).name).join(", ") || "une découverte choisie ensemble"}.</p></section>${followupView(state)}${syncPanel()}${weekPanel()}${discoveryParentSummary(state)}${adventureReport()}${learningReport(state)}<section class="panel settings"><h2>Profil et sauvegardes</h2><label>Nom du royaume <input id="profile-name" type="text" maxlength="40" value="${esc(state.name)}"></label><label><input type="checkbox" id="motion" ${state.settings.motion ? "checked" : ""}> Animations douces</label><label><input type="checkbox" id="textsize" ${state.settings.textSize === "large" ? "checked" : ""}> Texte plus grand</label><label><input type="checkbox" id="slow" ${state.settings.slow ? "checked" : ""}> Voix plus lente</label><label>Longueur d’une mission <select id="length">${[[5, "Courte · 5 défis"], [8, "Moyenne · 8 défis"], [12, "Longue · 12 défis"]].map(([n, t]) => `<option value="${n}" ${(state.settings.length ?? 12) === n ? "selected" : ""}>${t}</option>`).join("")}</select></label><div class="row">${button("Exporter la sauvegarde JSON", "export")}${button("Importer une sauvegarde", "import")}<input type="file" id="import-file" accept="application/json,.json" hidden></div><p class="sub">Sauvegarde locale à cet appareil et à cette adresse. Exportez régulièrement pour changer de navigateur ou de tablette. L’import remplace la progression ; une copie de l’état actuel est téléchargée avant remplacement.</p></section><h2>Notions et prérequis</h2><div class="parent-grid">${skills
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
  document.body.classList.toggle("text-large", state.settings.textSize === "large");
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
        book: bookPage,
        chapter: chapterPage,
        discover,
        lesson,
        mission,
        garden,
        album,
        castle,
        room,
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
  upgradeCastles();
}
// Château 3D : chargé à la demande ; sans WebGL (ou en cas d'erreur) le dessin SVG de secours reste affiché.
async function upgradeCastles() {
  if (!document.querySelector(".castle3d")) return;
  try {
    const m = await import("./castle-3d.js");
    if (!m.castle3dSupported()) return;
    const host = document.querySelector(".castle3d");
    if (!host) return;
    const castle = JSON.parse(host.dataset.castle || "{}");
    m.mountCastle3d(host, { castle }, { time: host.dataset.time || undefined, motion: state.settings.motion });
  } catch (e) {
    console.warn("Château 3D indisponible, dessin de secours conservé", e);
  }
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
  if (state.newRoomGift && route === "mission") {
    delete state.newRoomGift;
    persist();
  }
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
      go(i.kind === "avatar" ? "avatar" : i.kind === "room" ? "room" : "castle");
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
    const valid =
      part === "skin" ? skins.some((_, i) => i === n)
      : part === "hair" ? Number.isInteger(n) && n >= 0 && n < hairs.length
      : part === "style" ? styles.some((st) => st.id === n)
      : false;
    if (valid) {
      state.rpg.look[part] = n;
      persist();
      render();
    }
    return;
  }
  if (a === "rpg-unequip") {
    if (unequipRpg(state, b.dataset.id)) {
      persist();
      previewItem = null;
      render();
      toast("Objet retiré. Il reste dans ta collection.");
    }
    return;
  }
  if (a === "rpg-reset") {
    const group = groupOf(b.dataset.kind);
    for (const slot of Object.keys(state.rpg[group] || {}))
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
      "room",
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
  if (a === "review" || a === "daily") {
    start(a);
    return;
  }
  if (a === "castle-time") {
    if (["auto", "day", "dusk", "night"].includes(b.dataset.time)) castleTime = b.dataset.time;
    render();
    return;
  }
  if (a === "album") {
    albumNew = newStickers(state);
    state.stickersSeen = earnedStickers(state);
    persist();
    go("album");
    return;
  }
  if (a === "export-later") {
    state.settings.exportSnooze = Date.now();
    persist();
    render();
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
    const hq = current(),
      sh = state.session;
    sh.assisted = true;
    sh.hints = (sh.hints || 0) + 1;
    // Indice en deux temps : d'abord un coup de pouce, puis l'aide complète.
    sh.feedback =
      sh.hints === 1 && hq.hint && !hq.audio && hq.type !== "blocks"
        ? ["number", "addition", "subtract", "multiplication", "problem"].includes(hq.skill)
          ? "Prends ton temps : fais-toi une image dans ta tête, ou compte sur tes doigts. Touche encore « Encore un indice » si tu veux plus d’aide."
          : "Relis lentement la consigne et cherche le mot important. Touche encore « Encore un indice » si tu veux plus d’aide."
        : hq.hint;
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
  if (a === "followup-print") {
    document.querySelectorAll(".follow-mission").forEach((d) => (d.open = true));
    window.print();
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
  if (a === "gift-room") {
    state.session = null;
    persist();
    go("room");
    return;
  }
  if (a === "finish-home") {
    state.session = null;
    persist();
    go("home");
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
    const slot = Number(b.dataset.slot),
      it = item(picked);
    if (plant(state, picked, slot)) {
      persist();
      render();
      toast("Une nouvelle pousse dans ton jardin !");
    } else if (it && state.seeds < it.cost)
      toast(
        `Il te manque ${it.cost - state.seeds} graine${it.cost - state.seeds > 1 ? "s" : ""}. Tu les gagnes dans une mission.`,
      );
    else if (it?.coins && state.rpg.coins < it.coins)
      toast(`Il te manque ${it.coins - state.rpg.coins} pièces pour cette plante.`);
    else toast("Choisis une plante, puis une parcelle libre.");
    return;
  }
  if (a === "plot-select") {
    selectedPlot = Number(b.dataset.slot);
    render();
    return;
  }
  if (a === "plot-close") {
    selectedPlot = null;
    render();
    return;
  }
  if (a === "plant-upgrade") {
    if (upgradePlant(state, Number(b.dataset.slot))) {
      persist();
      render();
      toast("Ta plante a grandi : elle est encore plus belle !");
    } else toast("Il manque quelques pièces pour cette amélioration.");
    return;
  }
  if (a === "garden-expand") {
    if (expandGarden(state)) {
      persist();
      render();
      toast("Ton jardin s’agrandit : de nouvelles parcelles t’attendent !");
    } else toast("Il manque quelques pièces pour agrandir le jardin.");
    return;
  }
  if (a === "pet-adopt") {
    if (adopt(state, b.dataset.id)) {
      state.pet = b.dataset.id;
      persist();
      render();
      toast("Un nouveau compagnon te suit désormais !");
    } else toast("Il manque quelques pièces pour adopter ce compagnon.");
    return;
  }
  if (a === "pet-equip") {
    if (state.inventory.includes(b.dataset.id)) {
      state.pet = b.dataset.id;
      persist();
      render();
    }
    return;
  }
  if (a === "pet-unequip") {
    if (state.pet === b.dataset.id) {
      state.pet = null;
      persist();
      render();
      toast("Ton compagnon se repose. Il reste dans ta collection.");
    }
    return;
  }
  if (a === "practice") {
    if (state.session && state.session.index < state.session.queue.length) {
      go("mission");
      return;
    }
    state.session = null;
    const id = b.dataset.id;
    if (skills.some((x) => x.id === id) && state.skills[id].status === "seen")
      start("normal", id, 6);
    else go("missions");
    return;
  }
  if (a === "book" || a === "book-select" || a === "book-next") {
    if (a === "book-next") {
      state.session = null;
      persist();
      const n = nextChapter(state);
      if (n && n.n > BRIDGE_CHAPTERS) {
        chapterId = n.n;
        lessonId = n.skill;
        lessonStep = 0;
        go("chapter");
      } else go(n ? "bridge" : "book");
      return;
    }
    if (a === "book-select") selectedBook = Number(b.dataset.book) || null;
    else selectedBook = null;
    go("book");
    return;
  }
  if (a === "chapter-to-book") {
    state.session = null;
    persist();
    selectedBook = null;
    go("book");
    return;
  }
  if (a === "chapter-open") {
    const c = chapterById(Number(b.dataset.n));
    if (c && c.n > BRIDGE_CHAPTERS && !chapterDone(state, c.n)) {
      chapterId = c.n;
      lessonId = c.skill;
      lessonStep = 0;
      go("chapter");
    }
    return;
  }
  if (a === "chapter-audio") {
    const c = chapterById(chapterId);
    if (c) speak(c.text);
    return;
  }
  if (a === "chapter-start") {
    if (state.session) {
      go("mission");
      return;
    }
    createChapter(
      state,
      Number(b.dataset.n),
      crypto.getRandomValues(new Uint32Array(1))[0],
      crypto.randomUUID(),
    );
    persist();
    go("mission");
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
    state.settings.lastExport = Date.now();
    persist();
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
  if (a === "sync-gen") {
    document.querySelector("#sync-code").value = newCode();
    return;
  }
  if (a === "sync-on") {
    let url = document.querySelector("#sync-url").value.trim().replace(/\/+$/, "");
    // L'adresse affichée par le navigateur n'a souvent pas son « https:// » : on l'ajoute.
    if (url && !/^https?:\/\//i.test(url)) url = "https://" + url;
    const code = document.querySelector("#sync-code").value;
    if (!/^https:\/\/[^\s]+$/.test(url) && !/^http:\/\/localhost[:/]/.test(url)) return toast("Adresse du service invalide (https://…).");
    if (!codeValid(code)) return toast("Code famille trop court : utilisez « Créer un code ».");
    const c = normalizeCode(code).match(/.{1,5}/g).join("-");
    writeConfig(localStorage, { url, code: c });
    syncStatus = "Synchronisation en cours…";
    render();
    runSync(true);
    return;
  }
  if (a === "sync-now") {
    syncStatus = "Synchronisation en cours…";
    render();
    runSync(true);
    return;
  }
  if (a === "sync-off") {
    writeConfig(localStorage, null);
    syncStatus = "";
    render();
    toast("Synchronisation désactivée sur cet appareil.");
    return;
  }
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
  if (e.target.id === "textsize") {
    state.settings.textSize = e.target.checked ? "large" : "normal";
    persist();
    render();
  }
  if (e.target.id === "slow") {
    state.settings.slow = e.target.checked;
    persist();
  }
  if (e.target.id === "length") {
    state.settings.length = Number(e.target.value);
    persist();
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
if (readConfig(localStorage)) runSync();
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && syncSoon(500));
window.addEventListener("online", () => syncSoon(500));
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
