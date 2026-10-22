import test from "node:test";
import assert from "node:assert/strict";
import { skills } from "../frontend/js/content.js";
import { extraSkills, extraDemos } from "../frontend/js/expansion.js";
import { curriculumSkills } from "../frontend/js/curriculum-skills.js";
import { exercise, check } from "../frontend/js/exercises.js";
import { chapters } from "../frontend/js/story-data.js";
import { subjects } from "../frontend/js/lessons.js";

test("58 nouveaux petits pouvoirs : matière connue, prérequis valides, leçon et animation", () => {
  assert.equal(curriculumSkills.length, 58);
  const ids = new Set(skills.map((s) => s.id)),
    names = new Set(subjects.map((s) => s.name));
  for (const s of curriculumSkills) {
    assert.ok(names.has(s.subject), `${s.id}: matière ${s.subject}`);
    for (const p of s.pre) assert.ok(ids.has(p), `${s.id}: prérequis ${p}`);
    assert.ok(s.lesson.length > 60, `${s.id}: leçon`);
    assert.equal(extraDemos[s.id].length, 3);
    assert.ok(extraDemos[s.id][2].length > 40, `${s.id}: animation`);
    assert.ok(chapters.some((c) => c.skill === s.id), `${s.id}: chapitre`);
  }
  assert.ok(extraSkills.length >= 73);
});
test("chaque nouveau thème produit des exercices valides, réponse présente et corrigeable", () => {
  for (const s of curriculumSkills)
    for (let seed = 1; seed < 120; seed++)
      for (let turn = 0; turn < 6; turn++)
        for (const level of [0, 2, 4]) {
          const q = exercise(s.id, seed, level, turn);
          assert.ok(q.prompt && q.answer !== undefined && q.answer !== "", `${s.id}`);
          assert.doesNotMatch(q.prompt + q.answer + (q.options || []).join(" ") + q.hint, /undefined|NaN|\[object/, s.id);
          if (q.type === "choice") {
            assert.ok(q.options.includes(String(q.answer)), `${s.id}: réponse absente « ${q.prompt} »`);
            assert.equal(new Set(q.options).size, q.options.length, `${s.id}: doublons « ${q.prompt} »`);
          } else assert.ok(check(q, String(q.answer)), `${s.id}: ${q.prompt}`);
        }
});
test("retenue : le total reste inférieur à 100 et la soustraction reste positive", () => {
  for (let seed = 1; seed < 600; seed++)
    for (let turn = 0; turn < 6; turn++) {
      assert.ok(Number(exercise("add_carry", seed, 2, turn).answer) < 100);
      assert.ok(Number(exercise("sub_borrow", seed, 2, turn).answer) >= 0);
    }
});
test("au moins 9 exercices différents par thème", () => {
  for (const s of curriculumSkills) {
    const f = new Set();
    for (let seed = 1; seed < 300; seed++) for (let t = 0; t < 6; t++) f.add(exercise(s.id, seed, 1, t).fingerprint);
    assert.ok(f.size >= 9, `${s.id}: ${f.size}`);
  }
});
