import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  plan,
  record,
  ready,
  mastered,
  missing,
  reward,
  plant,
  validate,
  save,
  load,
  DAY,
} from "../frontend/js/core.js";
import { skills } from "../frontend/js/content.js";
import { group, exercise, check } from "../frontend/js/exercises.js";
const result = (more = {}) => ({
  correct: true,
  assisted: false,
  skip: false,
  dimension: "production",
  fingerprint: "new-example",
  ...more,
});
test("not_seen et unknown exclus des séances de consolidation", () => {
  const s = fresh();
  assert.deepEqual(plan(s), []);
  s.skills.noun.status = "seen";
  s.skills.number.status = "not_seen";
  assert.deepEqual(plan(s, 5), Array(5).fill("noun"));
  assert.throws(() => record(s, "number", result()));
});
test("prérequis exigent reconnaissance ET production sans aide", () => {
  const s = fresh();
  s.skills.noun.status = "seen";
  for (let i = 0; i < 8; i++)
    record(
      s,
      "noun",
      result({ dimension: "recognition", fingerprint: "r" + i }),
    );
  assert.equal(ready(s.skills.noun), false);
  assert.deepEqual(missing(s, "determiner"), ["noun"]);
  for (let i = 0; i < 2; i++) record(s, "noun", result({ assisted: true }));
  assert.equal(ready(s.skills.noun), false);
  for (let i = 0; i < 2; i++)
    record(s, "noun", result({ fingerprint: "p" + i }));
  assert.equal(ready(s.skills.noun), true);
  assert.deepEqual(missing(s, "determiner"), []);
});
test("révisions 1, 3, 7, 14 jours et aide non autonome", () => {
  const s = fresh();
  s.skills.number.status = "seen";
  let n = 100 * DAY;
  for (const d of [1, 3, 7, 14]) {
    record(s, "number", result(), n);
    assert.equal(s.skills.number.due, n + d * DAY);
    n += d * DAY;
  }
  record(s, "number", result({ assisted: true }), n);
  assert.equal(s.skills.number.due, n + DAY);
  const level = s.skills.number.level;
  record(
    s,
    "number",
    result({ skip: true, correct: false, assisted: true }),
    n,
  );
  assert.equal(s.skills.number.level, level);
});
test("mémoire seulement après délai et exemple différent", () => {
  const s = fresh();
  s.skills.number.status = "seen";
  record(s, "number", result(), DAY);
  record(s, "number", result(), 5 * DAY);
  assert.equal(
    s.skills.number.evidence.filter((e) => e.dimension === "memory").length,
    0,
  );
  record(s, "number", result({ fingerprint: "different" }), 5 * DAY);
  assert.equal(
    s.skills.number.evidence.filter((e) => e.dimension === "memory").length,
    1,
  );
  assert.equal(mastered(s.skills.number), false);
});
test("une rafale de QCM ne prouve jamais la maîtrise", () => {
  const s = fresh();
  s.skills.noun.status = "seen";
  for (let i = 0; i < 100; i++)
    record(s, "noun", result({ dimension: "recognition" }));
  assert.equal(mastered(s.skills.noun), false);
});
test("récompense atomique et sans doublons, jardin sans solde négatif", () => {
  const s = fresh(),
    session = { id: "one", index: 5, queue: Array(5).fill("noun") };
  assert.ok(reward(s, session));
  assert.equal(reward(s, session), false);
  assert.equal(s.stars, 5);
  assert.equal(s.seeds, 2);
  assert.equal(plant(s, "tree", 0), true);
  assert.equal(s.seeds, 0);
  assert.equal(plant(s, "flower", 1), false);
  assert.equal(plant(s, "tree", 0), false);
  assert.equal(plant(s, "hat", 1), false);
  assert.equal(reward(s, { ...session, id: "incomplete", index: 1 }), false);
});
test("export/import et écriture locale réversibles", () => {
  const s = fresh();
  s.name = "Alma";
  const map = new Map(),
    storage = { getItem: (k) => map.get(k), setItem: (k, v) => map.set(k, v) };
  save(storage, s);
  assert.deepEqual(load(storage), s);
  assert.deepEqual(validate(JSON.parse(JSON.stringify(s))), s);
});
test("imports corrompus et versions inconnues refusés", () => {
  for (const mutate of [
    (s) => (s.version = 999),
    (s) => (s.seeds = -1),
    (s) => (s.inventory = ["evil"]),
    (s) => (s.skills.noun.status = "weak"),
    (s) => (s.garden = ["flower"]),
    (s) => (s.history = [{}]),
    (s) => (s.session = { id: "x" }),
    (s) => (s.outfit = "crown"),
  ]) {
    const s = fresh();
    mutate(s);
    assert.throws(() => validate(s));
  }
});
test("graphe de prérequis sans cycle ni identifiant manquant", () => {
  function walk(id, path = []) {
    assert.ok(!path.includes(id));
    const s = skills.find((s) => s.id === id);
    assert.ok(s);
    s.pre.forEach((p) => walk(p, [...path, id]));
  }
  skills.forEach((s) => walk(s.id));
});
test("10 000 groupes nominaux : accords en genre et nombre", () => {
  for (let seed = 0; seed < 10000; seed++) {
    const g = group(seed);
    assert.equal(g.det, g.plural ? "les" : g.gender === "f" ? "la" : "le");
    assert.equal(
      g.adj,
      "petit" + (g.gender === "f" ? "e" : "") + (g.plural ? "s" : ""),
    );
    assert.equal(g.noun.endsWith("s"), g.plural);
  }
});
test("30 000 exercices : bonne réponse unique et correction stable", () => {
  for (const s of skills)
    for (let i = 0; i < 1000; i++) {
      const q = exercise(s.id, i, 3, i % 6);
      assert.ok(check(q, q.answer));
      assert.ok(!check(q, "réponse impossible"));
      if (q.type === "choice") {
        assert.equal(q.options.filter((v) => check(q, v)).length, 1);
        assert.equal(new Set(q.options).size, q.options.length);
      }
      if (s.id === "addition" || s.id === "subtract") {
        const n = q.prompt.match(/\d+/g).map(Number);
        assert.equal(
          Number(q.answer),
          s.id === "addition" ? n[0] + n[1] : n[0] - n[1],
        );
      }
    }
});
test("numération propose reconnaissance, manipulation et production", () => {
  assert.deepEqual(
    new Set([0, 1, 2].map((i) => exercise("number", 8, 2, i).dimension)),
    new Set(["recognition", "manipulation", "production"]),
  );
});
test("les répétitions du même exemple ne débloquent pas les prérequis", () => {
  const s = fresh();
  s.skills.noun.status = "seen";
  for (let i = 0; i < 10; i++) {
    record(s, "noun", result({ dimension: "recognition" }));
    record(s, "noun", result());
  }
  assert.equal(ready(s.skills.noun), false);
});
test("une rafale le même jour ne repousse pas les rappels", () => {
  const s = fresh();
  s.skills.noun.status = "seen";
  for (let i = 0; i < 10; i++)
    record(s, "noun", result({ fingerprint: "example" + i }), DAY);
  assert.equal(s.skills.noun.interval, 1);
  assert.equal(s.skills.noun.due, 2 * DAY);
});
