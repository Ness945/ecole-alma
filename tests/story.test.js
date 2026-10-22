import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  validate,
  load,
  KEY,
  reward,
  plant,
  expandGarden,
  upgradePlant,
  adopt,
  nextGardenSize,
  GARDEN_SIZES,
  EXPAND_COST,
  UPGRADE_COST,
} from "../frontend/js/core.js";
import { skills, items } from "../frontend/js/content.js";
import {
  chapters,
  books,
  chapterDone,
  doneCount,
  openChapters,
  nextChapter,
  createChapter,
  bookDone,
  CHAPTER_COUNT,
} from "../frontend/js/story.js";
import { stages } from "../frontend/js/adventure.js";
import { exercise } from "../frontend/js/exercises.js";
import { bookView, chapterView, chapterFinish, storyTeaser } from "../frontend/js/story-ui.js";
import { lessonActivity } from "../frontend/js/lessons.js";

const finishChapter = (s, n, uuid = "u" + n) => {
  const session = createChapter(s, n, 12345, uuid);
  session.index = session.queue.length;
  reward(s, session);
  s.session = null;
};

test("le Grand Livre : 160 chapitres, 8 livres de 20, tous reliés à un petit pouvoir existant", () => {
  assert.equal(CHAPTER_COUNT, 160);
  assert.equal(books.length, 8);
  const ids = new Set(skills.map((s) => s.id));
  for (const b of books) assert.equal(chapters.filter((c) => c.book === b.id).length, 20);
  chapters.forEach((c, i) => {
    assert.equal(c.n, i + 1);
    assert.ok(ids.has(c.skill), `chapitre ${c.n} : compétence ${c.skill}`);
    assert.ok(c.title.length > 3 && c.text.length > 30);
  });
  assert.equal(new Set(chapters.map((c) => c.title)).size, 160, "titres tous différents");
  assert.deepEqual(
    chapters.slice(0, 3).map((c) => [c.skill, c.title, c.text]),
    stages.map((s) => [s.skill, s.title, s.story]),
    "les chapitres 1 à 3 sont les trois parties du pont",
  );
  for (const s of skills) assert.ok(chapters.some((c) => c.skill === s.id), `${s.id} a un chapitre`);
});
test("chaque chapitre produit des défis valides sur son petit pouvoir, à tous les niveaux", () => {
  for (const c of chapters.slice(3))
    for (let i = 0; i < 6; i++)
      for (const level of [0, 2, 4]) {
        const q = exercise(c.skill, 1000 + i * 7919 + c.n, level, i);
        assert.equal(q.skill, c.skill);
        assert.ok(q.prompt && q.fingerprint, `${c.n}/${i}`);
        assert.doesNotMatch(q.prompt, /undefined|NaN|\[object/);
      }
});
test("un chapitre ouvre son petit pouvoir, crée une mission valide, et n'est validé qu'une fois terminé", () => {
  const s = fresh();
  assert.equal(s.skills.multiplication.status, "unknown");
  const session = createChapter(s, 44, 7, "abc");
  assert.equal(s.skills.multiplication.status, "seen", "l'enfant choisit : pas de prérequis bloquant");
  assert.equal(session.id, "story:44:abc");
  assert.equal(session.queue.length, 6);
  assert.ok(session.queue.every((x) => x === "multiplication"));
  assert.equal(session.mode, "discovery");
  validate(JSON.parse(JSON.stringify(s)));
  assert.equal(chapterDone(s, 44), false);
  assert.throws(() => createChapter(s, 45, 1, "z"), /déjà en cours/);
  session.index = session.queue.length;
  assert.notEqual(reward(s, session), false);
  assert.equal(chapterDone(s, 44), true);
  assert.equal(s.stars, 6);
  assert.equal(s.rpg.coins, 10);
  s.session = null;
  assert.throws(() => createChapter(s, 44, 1, "again"), /déjà terminé/);
  assert.throws(() => createChapter(s, 2, 1, "bridge"), /pont/);
  assert.throws(() => createChapter(s, 161, 1, "x"));
});
test("les chapitres terminés disparaissent des listes et ne sont plus proposés", () => {
  const s = fresh();
  assert.equal(nextChapter(s).n, 1);
  s.completed.push("bridge:0:a", "bridge:1:b", "bridge:2:c");
  assert.equal(nextChapter(s).n, 4);
  finishChapter(s, 4);
  finishChapter(s, 6);
  assert.equal(doneCount(s), 5);
  assert.deepEqual(openChapters(s, 1).slice(0, 3).map((c) => c.n), [5, 7, 8]);
  assert.equal(nextChapter(s).n, 5);
  const html = bookView(s, 1);
  assert.ok(!html.includes('data-n="4"') && !html.includes('data-n="6"'), "ni le 4 ni le 6 ne sont proposés");
  assert.ok(html.includes('data-n="5"') && html.includes('data-n="7"'));
  assert.match(html, /Mon journal · 5 chapitres terminés/);
  assert.match(storyTeaser(s), /Prochain chapitre : « Les glands de Brindille »/);
  assert.equal(bookDone(s, 1), false);
});
test("on peut sauter des chapitres : choisir la multiplication sans avoir fait l'addition", () => {
  const s = fresh();
  s.completed.push("bridge:0:a", "bridge:1:b", "bridge:2:c");
  finishChapter(s, 51);
  assert.equal(chapterDone(s, 51), true);
  assert.equal(nextChapter(s).n, 4, "la suite proposée reste la première non terminée");
  assert.ok(bookView(s, 3).includes('data-n="44"'));
});
test("un livre terminé propose le suivant", () => {
  const s = fresh();
  s.completed.push("bridge:0:a", "bridge:1:b", "bridge:2:c");
  for (let n = 4; n <= 20; n++) s.completed.push(`story:${n}:x`);
  assert.equal(bookDone(s, 1), true);
  assert.match(bookView(s, 1), /Livre terminé/);
  assert.match(bookView(s, 1), /data-book="2"/);
  assert.equal(nextChapter(s).n, 21);
  assert.match(chapterFinish(s, { chapter: 20, queue: Array(6).fill("addition") }), new RegExp(books[0].end.slice(0, 20)));
});
test("toutes les vues du livre se génèrent sans erreur", () => {
  const s = fresh();
  for (const c of chapters.slice(3)) {
    const html = chapterView(s, c.n, 0);
    assert.ok(html.includes(c.title.replace(/’/g, "’")), `chapitre ${c.n}`);
    assert.doesNotMatch(html, /undefined|NaN/);
    assert.ok(lessonActivity(c.skill, 0) && lessonActivity(c.skill, 1));
  }
  for (const b of books) assert.doesNotMatch(bookView(s, b.id), /undefined|NaN/);
});
test("sauvegarde : une mission de chapitre incohérente est refusée, une mission normale reste valide", () => {
  const s = fresh();
  createChapter(s, 44, 7, "abc");
  const ok = JSON.parse(JSON.stringify(s));
  validate(ok);
  for (const mutate of [
    (x) => (x.session.chapter = 2),
    (x) => (x.session.chapter = 999),
    (x) => (x.session.chapter = "44"),
    (x) => (x.session.id = "story:45:abc"),
    (x) => (x.session.queue[0] = "addition"),
  ]) {
    const bad = JSON.parse(JSON.stringify(ok));
    mutate(bad);
    bad.skills.addition.status = "seen";
    assert.throws(() => validate(bad), /invalide/);
  }
  const old = fresh();
  old.skills.number.status = "seen";
  old.session = { id: "m", queue: ["number"], index: 0, seed: 1, started: 1, mode: "normal", draft: "", assisted: false, feedback: "", confidence: "", answered: false, order: [] };
  validate(old);
});

// ───────────── Jardin ─────────────
test("jardin : 8 parcelles au départ, agrandissement par paliers payés en pièces", () => {
  const s = fresh();
  assert.equal(s.garden.length, 8);
  assert.equal(nextGardenSize(s), 12);
  assert.equal(expandGarden(s), false, "pas de pièces, pas d'agrandissement");
  s.rpg.coins = 500;
  const sizes = [s.garden.length];
  while (expandGarden(s)) sizes.push(s.garden.length);
  assert.deepEqual(sizes, GARDEN_SIZES);
  assert.equal(s.rpg.coins, 500 - Object.values(EXPAND_COST).reduce((a, b) => a + b, 0));
  assert.equal(s.gardenLevels.length, 24);
  assert.equal(nextGardenSize(s), null);
  assert.equal(expandGarden(s), false);
  validate(JSON.parse(JSON.stringify(s)));
});
test("jardin : planter dans une parcelle ajoutée, plante rare payée en pièces, graines inchangées", () => {
  const s = fresh();
  s.rpg.coins = 100;
  assert.equal(plant(s, "flower", 9), false, "parcelle inexistante avant l'agrandissement");
  expandGarden(s);
  const coins = s.rpg.coins;
  assert.equal(plant(s, "flower", 9), false, "plante à graines sans graine");
  assert.equal(plant(s, "sunflower", 9), true);
  assert.equal(s.rpg.coins, coins - 6);
  assert.equal(s.seeds, 0);
  assert.equal(s.garden[9], "sunflower");
  assert.equal(plant(s, "sunflower", 9), false, "parcelle occupée");
  s.rpg.coins = 3;
  assert.equal(plant(s, "rainbow", 0), false);
  assert.equal(plant(s, "hat", 0), false);
  assert.equal(plant(s, "sunflower", -1), false);
  assert.equal(plant(s, "sunflower", 1.5), false);
});
test("jardin : une plante fleurit puis devient magique, une seule fois chaque, sans débit si impossible", () => {
  const s = fresh();
  s.rpg.coins = 100;
  assert.equal(upgradePlant(s, 0), false, "rien à améliorer sur une parcelle vide");
  plant(s, "rose", 0);
  assert.equal(upgradePlant(s, 0), true);
  assert.equal(s.gardenLevels[0], 1);
  assert.equal(upgradePlant(s, 0), true);
  assert.equal(s.gardenLevels[0], 2);
  assert.equal(upgradePlant(s, 0), false);
  assert.equal(s.rpg.coins, 100 - 6 - UPGRADE_COST[0] - UPGRADE_COST[1]);
  plant(s, "rose", 1);
  s.rpg.coins = UPGRADE_COST[0] - 1;
  assert.equal(upgradePlant(s, 1), false);
  assert.equal(s.rpg.coins, UPGRADE_COST[0] - 1);
  validate(JSON.parse(JSON.stringify(s)));
});
test("jardin : sauvegardes antérieures valides (8 parcelles, sans niveaux) et incohérences refusées", () => {
  const old = JSON.parse(JSON.stringify(fresh()));
  delete old.gardenLevels;
  old.garden[2] = "tree";
  const v = validate(old);
  assert.deepEqual(v.gardenLevels, Array(8).fill(0));
  for (const mutate of [
    (x) => x.garden.push(null),
    (x) => (x.garden.length = 4),
    (x) => (x.gardenLevels = [0]),
    (x) => (x.gardenLevels[0] = 3),
    (x) => (x.gardenLevels[1] = 1),
    (x) => (x.garden[0] = "inconnue"),
  ]) {
    const bad = JSON.parse(JSON.stringify(fresh()));
    mutate(bad);
    assert.throws(() => validate(bad), /invalide/);
  }
  const storage = new Map();
  storage.getItem = (k) => storage.get(k) ?? null;
  storage.setItem = (k, v) => storage.set(k, v);
  storage.set(KEY, JSON.stringify(old));
  assert.equal(load(storage).garden.length, 8);
});

// ───────────── Compagnons ─────────────
test("compagnons : adoption payée, sans doublon, jamais offerte comme cadeau de mission", () => {
  const s = fresh();
  assert.equal(adopt(s, "owl"), false);
  s.rpg.coins = 60;
  assert.equal(adopt(s, "owl"), true);
  assert.equal(s.rpg.coins, 32);
  assert.equal(adopt(s, "owl"), false);
  assert.equal(adopt(s, "fox"), false, "le renard est un cadeau, pas un achat");
  assert.equal(adopt(s, "hat"), false);
  s.pet = "owl";
  validate(JSON.parse(JSON.stringify(s)));
  const t = fresh();
  const gifts = [];
  for (let i = 0; i < 6; i++) {
    const g = reward(t, { id: "m" + i, index: 5, queue: Array(5).fill("number") });
    gifts.push(g);
  }
  assert.deepEqual(gifts.filter((g) => typeof g === "string"), ["hat", "crown", "fox", "dragon"]);
  assert.ok(items.filter((i) => i.kind === "pet" && i.price).every((i) => !t.inventory.includes(i.id)));
});
