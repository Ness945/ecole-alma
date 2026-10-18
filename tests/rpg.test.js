import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  validate,
  load,
  KEY,
  LEGACY_KEY,
  reward,
} from "../frontend/js/core.js";
import {
  purchase,
  equip,
  preview,
  avatarSvg,
  castleSvg,
} from "../frontend/js/rpg.js";
import { exercise, check } from "../frontend/js/exercises.js";
test("migration v1 réelle : points, objets, réponses et session conservés", () => {
  const old = fresh();
  old.version = 1;
  delete old.rpg;
  delete old.skills.multiplication;
  old.stars = 23;
  old.seeds = 5;
  old.inventory = ["hat", "crown"];
  old.outfit = "hat";
  old.skills.noun.status = "seen";
  old.session = {
    id: "old",
    queue: ["noun"],
    index: 0,
    seed: 12,
    started: 1,
    mode: "normal",
    draft: "chat",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
  };
  const text = JSON.stringify(old),
    map = new Map([[LEGACY_KEY, text]]),
    storage = { getItem: (k) => map.get(k), setItem: (k, v) => map.set(k, v) };
  const current = load(storage);
  assert.equal(current.version, 2);
  assert.equal(current.rpg.coins, 23);
  assert.equal(current.rpg.equipped.head, "head-hat");
  assert.deepEqual(current.session, old.session);
  assert.deepEqual(current.inventory, old.inventory);
  assert.deepEqual(current.skills.noun, old.skills.noun);
  assert.equal(current.skills.multiplication.status, "unknown");
  assert.equal(map.get(KEY + ".backup-before-v2"), text);
  assert.equal(map.get(LEGACY_KEY), text);
  assert.equal(JSON.parse(map.get(KEY)).version, 2);
  assert.equal(old.version, 1);
});
test("achat et équipement séparés ; aucun double débit ou solde négatif", () => {
  const s = fresh();
  assert.equal(purchase(s, "head-crown"), false);
  s.rpg.coins = 20;
  assert.equal(equip(s, "head-crown"), false);
  assert.equal(purchase(s, "head-crown"), true);
  assert.equal(s.rpg.coins, 2);
  assert.equal(s.rpg.equipped.head, null);
  assert.equal(purchase(s, "head-crown"), false);
  assert.equal(purchase(s, "not-an-item"), false);
  assert.equal(purchase(s, "cape-night"), false);
  assert.equal(s.rpg.coins, 2);
  assert.equal(equip(s, "head-crown"), true);
  assert.equal(s.rpg.equipped.head, "head-crown");
  assert.deepEqual(validate(s), s);
});
test("aperçu sans effet sur les pièces, les objets ni le personnage équipé", () => {
  const s = fresh(),
    before = structuredClone(s.rpg),
    p = preview(s.rpg, "head-crown");
  assert.equal(p.equipped.head, "head-crown");
  assert.deepEqual(s.rpg, before);
  assert.notEqual(avatarSvg(p), avatarSvg(s.rpg));
  assert.notEqual(castleSvg(preview(s.rpg, "roof-rose")), castleSvg(s.rpg));
});
test("les missions gagnent dix pièces une seule fois et conservent les étoiles", () => {
  const s = fresh(),
    mission = { id: "mission", queue: ["noun", "noun"], index: 2 };
  reward(s, mission);
  assert.equal(s.rpg.coins, 10);
  assert.equal(s.stars, 2);
  reward(s, mission);
  assert.equal(s.rpg.coins, 10);
  assert.ok(s.rpg.owned.includes("head-hat"));
});
test("sauvegardes RPG corrompues refusées", () => {
  for (const mutate of [
    (s) => (s.rpg.coins = -1),
    (s) => (s.rpg.look.skin = 8),
    (s) => (s.rpg.equipped.head = "head-crown"),
    (s) => (s.rpg.owned = ["invalid"]),
    (s) => {
      s.rpg.owned = ["roof-rose"];
      s.rpg.equipped.head = "roof-rose";
    },
  ]) {
    const s = fresh();
    mutate(s);
    assert.throws(() => validate(s));
  }
});
test("1000 multiplications : groupes égaux, résultat exact et choix unique", () => {
  for (let seed = 0; seed < 1000; seed++) {
    const q = exercise("multiplication", seed, 2, seed % 3);
    assert.equal(
      Number(q.answer),
      (2 + (seed % 4)) * (2 + (Math.floor(seed / 4) % 4)),
    );
    assert.ok(check(q, q.answer));
    if (q.type === "choice")
      assert.equal(q.options.filter((x) => x === q.answer).length, 1);
  }
});
test("un ancien onglet en v1 ne peut pas remplacer la progression RPG v2", () => {
  const current = fresh();
  current.rpg.coins = 37;
  current.rpg.owned = ["head-crown"];
  const older = fresh();
  older.version = 1;
  delete older.rpg;
  delete older.skills.multiplication;
  older.stars = 2;
  const map = new Map([
    [KEY, JSON.stringify(current)],
    [LEGACY_KEY, JSON.stringify(older)],
  ]);
  const storage = {
    getItem: (k) => map.get(k),
    setItem: (k, v) => map.set(k, v),
  };
  assert.equal(load(storage).rpg.coins, 37);
  assert.deepEqual(load(storage).rpg.owned, ["head-crown"]);
});
