// Vues du Grand Livre des Lucioles (liste des chapitres, chapitre, fin de chapitre).
import { skills } from "./content.js";
import { lessonActivity } from "./lessons.js";
import {
  books,
  chapters,
  chapterById,
  chapterDone,
  openChapters,
  bookProgress,
  bookDone,
  doneCount,
  nextChapter,
  currentBook,
  BRIDGE_CHAPTERS,
  CHAPTER_COUNT,
} from "./story.js";
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const btn = (label, action, cls = "", extra = "") =>
  `<button data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
const skillOf = (id) => skills.find((s) => s.id === id);
import { mixQueue } from "./evaluation.js";
const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
const openAction = (n) => (n <= BRIDGE_CHAPTERS ? "bridge" : "chapter-open");
export function storyTeaser(state) {
  const next = nextChapter(state),
    done = doneCount(state);
  if (!next)
    return `<section class="story-strip book-strip" data-bridge-count="3" data-chapters-done="${done}"><span class="story-icon">📖</span><div><p class="eyebrow">LE GRAND LIVRE · ${done}/${CHAPTER_COUNT}</p><h2>Le Grand Livre est complet !</h2><p>Tu as retrouvé toutes les pages. Bravo, aventurière.</p></div>${btn("Relire l’histoire", "book", "secondary")}</section>`;
  const b = books[next.book - 1];
  if (next.n <= BRIDGE_CHAPTERS) {
    const count = next.n - 1;
    return `<section class="story-strip book-strip" data-bridge-count="${count}" data-chapters-done="${done}"><span class="story-icon">🌉</span><div><p class="eyebrow">LE GRAND LIVRE · CHAPITRE ${next.n} · ${count}/3 PARTIES DU PONT</p><h2>Le pont des petits pouvoirs</h2><p>Trois parties à construire pour découvrir un nouveau lieu. Le Grand Livre compte 100 chapitres : tu pourras ensuite choisir le tien.</p></div>${btn("Partir avec Luna →", "bridge", "secondary")} ${btn("Ouvrir le Grand Livre", "book", "quiet")}</section>`;
  }
  return `<section class="story-strip book-strip" data-bridge-count="3" data-chapters-done="${done}"><span class="story-icon">${b.icon}</span><div><p class="eyebrow">LE GRAND LIVRE · ${done}/${CHAPTER_COUNT} CHAPITRES</p><h2>Livre ${romans[next.book - 1]} · ${b.title}</h2><p>Prochain chapitre : « ${next.title} ». Tu peux aussi choisir un autre chapitre.</p></div>${btn("Ouvrir le Grand Livre →", "book", "secondary")} ${btn("Traverser le pont →", "clearing", "quiet")}</section>`;
}
export function bookView(state, book = currentBook(state)) {
  const b = books[book - 1],
    done = doneCount(state),
    open = openChapters(state, book),
    next = open[0];
  const tabs = books
    .map((x) => {
      const full = bookDone(state, x.id);
      return btn(
        `<span>${full ? "✓" : x.icon}</span><strong>Livre ${romans[x.id - 1]}</strong><small>${bookProgress(state, x.id)}/20</small>`,
        "book-select",
        `book-tab ${x.id === book ? "active" : ""} ${full ? "complete" : ""}`,
        `data-book="${x.id}" aria-pressed="${x.id === book}"`,
      );
    })
    .join("");
  const card = (c, featured = false) => {
    const sk = skillOf(c.skill),
      fresh = state.skills[c.skill].status !== "seen";
    return `<article class="chapter-card ${featured ? "featured" : ""}" data-chapter="${c.n}"><div class="chapter-num">${c.n}</div><div><p class="eyebrow">${featured ? "PROCHAIN CHAPITRE" : `CHAPITRE ${c.n}`} · ${sk.icon} ${esc(sk.name)}${fresh ? ' · <span class="chapter-new">nouveau pouvoir</span>' : ""}</p><h3>${esc(c.title)}</h3>${featured ? `<p>${esc(c.text)}</p>` : ""}</div>${btn(featured ? "Ouvrir ce chapitre →" : "Ouvrir", openAction(c.n), featured ? "primary" : "secondary small", `data-n="${c.n}"`)}</article>`;
  };
  const finished = chapters.filter((c) => chapterDone(state, c.n));
  return `<section class="book-head"><div><p class="eyebrow">LE GRAND LIVRE DES LUCIOLES</p><h2>${done} chapitre${done > 1 ? "s" : ""} sur ${CHAPTER_COUNT}</h2><p class="sub">Choisis le chapitre que tu veux : le livre te propose la suite, mais rien ne t’oblige. Un chapitre terminé disparaît de la liste.</p></div><div class="progress book-progress" role="progressbar" aria-label="Progression du Grand Livre" aria-valuemin="0" aria-valuemax="${CHAPTER_COUNT}" aria-valuenow="${done}"><span style="width:${(done / CHAPTER_COUNT) * 100}%"></span></div></section><div class="book-tabs" role="group" aria-label="Les huit livres">${tabs}</div><section class="panel book-intro"><p class="eyebrow">${b.icon} LIVRE ${romans[book - 1]}</p><h2>${b.title}</h2><p>${b.intro}</p></section>${
    next
      ? `<div class="chapter-list">${card(next, true)}${open
          .slice(1)
          .map((c) => card(c))
          .join("")}</div>`
      : `<section class="panel celebration"><div class="emoji">✨</div><h2>Livre terminé !</h2><p>${b.end}</p>${book < books.length ? btn("Ouvrir le livre suivant →", "book-select", "primary", `data-book="${book + 1}"`) : ""}</section>`
  }${finished.length ? `<details class="book-journal"><summary>Mon journal · ${finished.length} chapitre${finished.length > 1 ? "s" : ""} terminé${finished.length > 1 ? "s" : ""}</summary><ol>${finished.map((c) => `<li value="${c.n}">${esc(c.title)}</li>`).join("")}</ol></details>` : ""}`;
}
export function chapterView(state, n, step = 0) {
  const c = chapterById(n),
    sk = skillOf(c.skill),
    b = books[c.book - 1],
    paused = Boolean(state.session);
  return `<div class="lesson-path"><span>1 · Je lis</span><span>2 · Je découvre</span><span>3 · Je pars en chapitre</span></div><section class="panel ludic-lesson chapter-page"><p class="eyebrow">${b.icon} LIVRE ${romans[c.book - 1]} · CHAPITRE ${c.n}</p><h2>${esc(c.title)}</h2><p class="intro-lesson chapter-text">${esc(c.text)}</p>${btn("🔊 Écouter l’histoire", "chapter-audio")}<div class="chapter-skill"><p class="eyebrow">${sk.icon} ${esc(sk.subject)} · LE PETIT POUVOIR DU CHAPITRE</p><h3>${esc(sk.name)}</h3><p class="intro-lesson">${sk.lesson}</p></div>${lessonActivity(c.skill, step)}<div class="lesson-launch"><div><h3>Prête à partir ?</h3><p>${6} petits défis · des indices si tu en as besoin · 🪙 10 pièces</p></div>${btn(paused ? "Reprendre ma mission →" : "Partir en chapitre →", paused ? "resume" : "chapter-start", "primary", `data-n="${c.n}"`)}</div>${btn("← Retour au Grand Livre", "book", "quiet")}</section>`;
}
export function chapterFinish(state, session) {
  const c = chapterById(session.chapter),
    b = books[c.book - 1],
    full = bookDone(state, c.book),
    next = nextChapter(state);
  const mix = mixQueue(state).length >= 3;
  return `<section class="panel celebration chapter-finish"><div class="emoji">${full ? "🏆" : "📖"}</div><h1>Chapitre ${c.n} terminé !</h1><p><strong>${esc(c.title)}</strong> rejoint ton journal. Il ne réapparaîtra plus dans ta liste.</p>${full ? `<div class="notice">${b.end}</div>` : ""}<p>⭐ ${session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p><p>${next ? btn(`Chapitre suivant : ${esc(next.title)} →`, "book-next", "primary") : ""} ${mix ? btn("🎲 Mini-bilan mélangé · 5 questions", "mix-start", "secondary") : ""} ${btn("Voir le Grand Livre", "chapter-to-book", "secondary")} ${btn("Retour au menu principal", "finish-home", "secondary")} ${btn("Planter mes graines", "finish", "quiet")}</p></section>`;
}
