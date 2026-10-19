// Le Grand Livre des Lucioles : logique des chapitres (100 chapitres, 5 livres).
// Les chapitres 1 à 3 sont les trois parties du pont (adventure.js) ; les suivants
// sont des missions de 6 défis sur le petit pouvoir du chapitre.
import {
  chapters,
  books,
  CHAPTER_COUNT,
  chapterById,
  BRIDGE_CHAPTERS,
  validChapterSession,
} from "./story-data.js";
import { stageDone } from "./adventure.js";
export {
  chapters,
  books,
  CHAPTER_COUNT,
  chapterById,
  BRIDGE_CHAPTERS,
  validChapterSession,
};
export const CHAPTER_LENGTH = 6;
export const chapterDone = (state, n) =>
  n <= BRIDGE_CHAPTERS
    ? stageDone(state, n - 1)
    : state.completed.some((id) => id.startsWith(`story:${n}:`));
export const doneCount = (state) =>
  chapters.filter((c) => chapterDone(state, c.n)).length;
export const bookChapters = (book) => chapters.filter((c) => c.book === book);
// Les chapitres terminés disparaissent des listes : on ne propose que le reste.
export const openChapters = (state, book) =>
  bookChapters(book).filter((c) => !chapterDone(state, c.n));
export const bookDone = (state, book) => openChapters(state, book).length === 0;
export const bookProgress = (state, book) =>
  bookChapters(book).length - openChapters(state, book).length;
export function nextChapter(state) {
  return chapters.find((c) => !chapterDone(state, c.n)) || null;
}
export function currentBook(state) {
  return nextChapter(state)?.book ?? books.length;
}
export function createChapter(state, n, seed, uuid, now = Date.now()) {
  const chapter = chapterById(n);
  if (!chapter || n <= BRIDGE_CHAPTERS)
    throw Error("Ce chapitre se joue depuis le pont.");
  if (state.session) throw Error("Une mission est déjà en cours.");
  if (chapterDone(state, n)) throw Error("Ce chapitre est déjà terminé.");
  const first = state.skills[chapter.skill].status !== "seen";
  // Ouverture explicite d'un petit pouvoir : jamais une injection automatique.
  state.skills[chapter.skill].status = "seen";
  state.session = {
    contentRevision: 2,
    id: `story:${n}:${uuid}`,
    queue: Array(CHAPTER_LENGTH).fill(chapter.skill),
    index: 0,
    seed,
    started: now,
    mode: first ? "discovery" : "normal",
    draft: "",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
    chapter: n,
  };
  return state.session;
}
