import test from "node:test";
import assert from "node:assert/strict";
import {
  extraSkills,
  extraDemos,
  stories,
  sentences,
} from "../frontend/js/expansion.js";
import { skills } from "../frontend/js/content.js";
import { exercise, check, selectExercise } from "../frontend/js/exercises.js";
import { fresh, validate } from "../frontend/js/core.js";

test("30 notions avec leçons et exemples pour les 15 ajouts", () => {
  assert.equal(skills.length, 30);
  assert.equal(extraSkills.length, 15);
  for (const s of extraSkills) {
    assert.ok(s.lesson.length > 40);
    assert.equal(extraDemos[s.id].length, 3);
  }
  assert.equal(stories.length, 24);
  assert.equal(new Set(stories.map((s) => s[0])).size, 24);
  assert.equal(sentences.length, 12);
});
test("Calculs supplémentaires vérifiés à partir des consignes", () => {
  for (let seed = 0; seed < 1000; seed++)
    for (const id of [
      "hundreds",
      "compare",
      "complements",
      "doubles",
      "halves",
      "money",
    ])
      for (let turn = 0; turn < 3; turn++) {
        const q = exercise(id, seed, 2, turn),
          n = q.prompt.match(/\d+/g).map(Number);
        const expected =
          id === "hundreds"
            ? n[0] * 100 + n[1] * 10 + n[2]
            : id === "compare"
              ? turn === 2
                ? Math.min(...n)
                : Math.max(...n)
              : id === "complements"
                ? n[1] - n[0]
                : id === "doubles"
                  ? n[0] * 2
                  : id === "halves"
                    ? n[0] / 2
                    : turn === 2
                      ? n[1] - n[0]
                      : n[0] * n[1] + n[2] * n[3];
        assert.equal(Number(q.answer), expected, q.prompt);
      }
});
test("Conjugaisons, horloges et calendrier aux limites", () => {
  for (const [id, forms] of [
    ["etre", ["suis", "es", "est", "sommes", "êtes", "sont"]],
    ["avoir", ["ai", "as", "a", "avons", "avez", "ont"]],
  ])
    for (let i = 0; i < 6; i++)
      assert.equal(exercise(id, i, 1, 0).answer, forms[i]);
  for (const [v, inf] of [
    "chanter",
    "jouer",
    "danser",
    "regarder",
    "parler",
    "dessiner",
  ].entries())
    for (const [i, end] of ["e", "es", "e", "ons", "ez", "ent"].entries())
      assert.equal(
        exercise("present_er", v * 6 + i, 1, 0).answer,
        inf.slice(0, -2) + end,
      );
  assert.equal(exercise("calendar", 6, 1, 0).answer, "lundi");
  assert.equal(exercise("calendar", 0, 1, 1).answer, "dimanche");
  assert.equal(exercise("calendar", 11, 1, 2).answer, "janvier");
  for (let seed = 0; seed < 12; seed++) {
    assert.ok(check(exercise("clock", seed, 1, 1), `${seed + 1}:30`));
    assert.ok(check(exercise("clock", seed, 1, 0), `${seed + 1}h00`));
  }
});
test("Sélection évite les exemples récents et reste déterministe", () => {
  const q = exercise("reading", 0, 1, 0),
    history = [{ skill: "reading", fingerprint: q.fingerprint }];
  const selected = selectExercise("reading", 0, 1, 0, history);
  assert.notEqual(selected.q.fingerprint, q.fingerprint);
  assert.deepEqual(selected, selectExercise("reading", 0, 1, 0, history));
  assert.deepEqual(selected.q, exercise("reading", selected.seed, 1, 0));
  const all = Array.from({ length: 4 }, (_, i) => ({
    skill: "colors",
    fingerprint: exercise("colors", i, 1, 0).fingerprint,
  }));
  assert.ok(selectExercise("colors", 0, 1, 0, all).q.answer);
});
test("Sauvegarde v2 antérieure enrichie sans modifier la source", () => {
  const old = fresh();
  old.name = "Alma";
  old.rpg.coins = 37;
  old.skills.noun.status = "seen";
  for (const s of extraSkills) delete old.skills[s.id];
  const snapshot = structuredClone(old),
    next = validate(old);
  assert.deepEqual(old, snapshot);
  assert.equal(next.rpg.coins, 37);
  assert.deepEqual(next.skills.noun, old.skills.noun);
  for (const s of extraSkills)
    assert.equal(next.skills[s.id].status, "unknown");
  delete old.skills.noun;
  assert.throws(() => validate(old));
});
