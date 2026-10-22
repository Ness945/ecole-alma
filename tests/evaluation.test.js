import test from "node:test";
import assert from "node:assert/strict";
import { skills } from "../frontend/js/content.js";
import { fresh, record, validate, DAY } from "../frontend/js/core.js";
import { exercise, check, explain } from "../frontend/js/exercises.js";
import { slipOf } from "../frontend/js/slips.js";
import {
  TIERED, tierFor, fluency, assessmentBatches, batchById, recordAssessment, mapStatus, outcomeOf,
  weakScores, weakQueue, mixQueue, weeklyReport,
} from "../frontend/js/evaluation.js";
import { errorOf } from "../frontend/js/followup.js";
import { mergeStates } from "../frontend/js/sync.js";

const NOW = Date.UTC(2026, 9, 20, 10);
function seen(ids) {
  const s = fresh();
  for (const id of ids) s.skills[id].status = "seen";
  return s;
}
function add(s, id, n, ok, t, extra = {}) {
  for (let i = 0; i < n; i++)
    record(s, id, { correct: ok, assisted: false, skip: false, dimension: "production", fingerprint: `${id}${t}${i}${Math.random()}`, ...extra }, t + i * 1000);
}

test("échelle de difficulté : monte après 3 réussites seule, descend après 2 échecs", () => {
  const s = seen(["addition", "reading"]);
  assert.equal(tierFor(s, "addition"), 1);
  add(s, "addition", 3, true, NOW);
  assert.equal(tierFor(s, "addition"), 2);
  add(s, "addition", 2, false, NOW + 1e5);
  assert.equal(tierFor(s, "addition"), 1);
  add(s, "addition", 2, false, NOW + 2e5);
  assert.equal(tierFor(s, "addition"), 0);
  add(s, "reading", 6, true, NOW);
  assert.equal(tierFor(s, "reading"), 1, "notion sans échelle : palier normal");
});
test("les trois paliers produisent des exercices valides et de plus en plus difficiles", () => {
  for (const id of TIERED)
    for (const tier of [0, 1, 2])
      for (let seed = 1; seed < 120; seed++)
        for (let turn = 0; turn < 6; turn++) {
          const q = exercise(id, seed, 2, turn, false, tier);
          assert.doesNotMatch(q.prompt + q.answer + q.options.join(" "), /undefined|NaN|\[object/, id);
          if (q.type === "choice") assert.ok(q.options.includes(String(q.answer)), `${id} t${tier}`);
          else if (q.type === "input") assert.ok(check(q, String(q.answer)), `${id} t${tier}`);
          if (id === "add_carry") assert.ok(Number(q.answer) < 100);
          if (id === "sub_borrow" || id === "subtract") assert.ok(Number(q.answer) >= 0);
        }
  const size = (tier) => {
    let m = 0;
    for (let seed = 1; seed < 80; seed++) m = Math.max(m, Number(exercise("addition", seed, 2, 1, false, tier).answer));
    return m;
  };
  assert.ok(size(0) < size(1) && size(1) < size(2), "les sommes grandissent avec le palier");
});
test("erreurs typées : retenue oubliée, échange oublié, pluriel, féminin, passé composé", () => {
  assert.equal(slipOf({ skill: "add_carry", prompt: "Combien font 38 + 27 ?", answer: "55", expected: "65" }).code, "carry");
  assert.equal(slipOf({ skill: "sub_borrow", prompt: "Combien font 52 − 27 ?", answer: "35", expected: "25" }).code, "borrow");
  assert.equal(slipOf({ skill: "plural", prompt: "x", answer: "chat", expected: "chats" }).code, "plural_s");
  assert.equal(slipOf({ skill: "gender", prompt: "x", answer: "ami", expected: "amie" }).code, "fem_e");
  assert.equal(slipOf({ skill: "passe_compose", prompt: "x", answer: "joué", expected: "ai joué" }).code, "aux");
  assert.equal(slipOf({ skill: "tables", prompt: "Combien font 3 × 4 ?", answer: "7", expected: "12" }).code, "op");
  assert.equal(slipOf({ skill: "add_carry", prompt: "x", answer: "65", expected: "65" }), null);
  // utilisés par le suivi parent et par l'explication à l'enfant
  assert.match(errorOf({ skill: "add_carry", prompt: "Combien font 38 + 27 ?", answer: "55", expected: "65", correct: false }).label, /retenue/);
  const q = { skill: "add_carry", prompt: "Combien font 38 + 27 ?", answer: "65", hint: "Sépare les dizaines et les unités.", type: "input" };
  assert.match(explain(q, "55").slip, /retenue/i);
});
test("rapidité : médiane des réussites seule, jamais d'étiquette sans 4 mesures", () => {
  const s = seen(["tables", "reading"]);
  add(s, "tables", 3, true, NOW, { ms: 3000 });
  assert.equal(fluency(s, "tables"), null);
  add(s, "tables", 2, true, NOW + 1e5, { ms: 4000 });
  assert.equal(fluency(s, "tables").level, "auto");
  add(s, "reading", 5, true, NOW, { ms: 20000 });
  assert.equal(fluency(s, "reading").level, "build");
  const t = seen(["tables"]);
  add(t, "tables", 5, true, NOW, { ms: 20000 });
  assert.equal(fluency(t, "tables").level, "slow", "table pas encore automatique");
});
test("bilan : chaque petit pouvoir dans une et une seule série de 8 au plus", () => {
  const batches = assessmentBatches(),
    all = batches.flatMap((b) => b.skills);
  assert.equal(all.length, skills.length);
  assert.equal(new Set(all).size, skills.length);
  for (const b of batches) assert.ok(b.skills.length <= 8 && b.skills.length >= 1);
  assert.ok(batchById(batches[0].id));
  assert.equal(batchById("999"), null);
});
test("bilan : un résultat par série, carte vert / orange / rouge, rattrapage par des réussites ensuite", () => {
  const s = seen(["number", "addition", "subtract"]);
  recordAssessment(s, "number", "run1", "auto");
  recordAssessment(s, "number", "run1", "wrong"); // même série : ignoré
  recordAssessment(s, "addition", "run1", "helped");
  recordAssessment(s, "subtract", "run1", "wrong");
  assert.equal(mapStatus(s, "number"), "good");
  assert.equal(mapStatus(s, "addition"), "mid");
  assert.equal(mapStatus(s, "subtract"), "low");
  assert.equal(mapStatus(fresh(), "number"), "none");
  s.assessment.subtract.at = NOW - 1e6;
  add(s, "subtract", 2, true, NOW);
  assert.equal(mapStatus(s, "subtract"), "good");
  assert.equal(outcomeOf(true, false, false), "auto");
  assert.equal(outcomeOf(true, true, false), "helped");
  assert.equal(outcomeOf(false, false, true), "wrong");
});
test("points faibles : classés, 6 défis répartis sur 3 notions au plus, rien si tout va bien", () => {
  const s = seen(["money", "calendar", "seasons", "addition"]);
  assert.deepEqual(weakQueue(s, 6, NOW), []);
  add(s, "money", 5, false, NOW - 2 * DAY);
  add(s, "calendar", 4, false, NOW - 2 * DAY);
  add(s, "seasons", 4, false, NOW - 3 * DAY);
  add(s, "addition", 6, true, NOW - DAY);
  const w = weakScores(s, NOW);
  assert.ok(w.length >= 3);
  assert.ok(!w.some((x) => x.id === "addition"));
  const q = weakQueue(s, 6, NOW);
  assert.equal(q.length, 6);
  assert.ok(new Set(q).size <= 3);
  assert.ok(q.every((id) => s.skills[id].status === "seen"));
  validate({ ...structuredClone(s), session: { id: "w", queue: q, index: 0, seed: 1, started: NOW, mode: "weak", draft: "", assisted: false, feedback: "", confidence: "", answered: false, order: [] } });
});
test("mini-bilan mélangé : 3 à 5 notions déjà vues, sinon rien", () => {
  const s = seen(["number", "addition", "noun", "reading", "money"]);
  assert.deepEqual(mixQueue(s), []);
  for (const id of ["number", "addition", "noun", "reading", "money"]) add(s, id, 1, true, NOW);
  const q = mixQueue(s);
  assert.equal(q.length, 5);
  assert.equal(new Set(q).size, 5);
});
test("rapport de la semaine : compare à la semaine précédente, forces et idées à la maison", () => {
  const s = seen(["addition", "money", "calendar"]);
  add(s, "addition", 5, false, NOW - 10 * DAY);
  add(s, "addition", 5, true, NOW - DAY);
  add(s, "money", 4, false, NOW - DAY);
  add(s, "calendar", 4, false, NOW - 2 * DAY);
  const r = weeklyReport(s, NOW);
  assert.equal(r.cur.answered, 13);
  assert.equal(r.cur.solo, 5);
  assert.equal(r.prev.answered, 5);
  assert.ok(r.strengths.some((x) => x.id === "addition"));
  assert.ok(r.progress.some((x) => x.id === "addition"));
  assert.ok(r.weak.length >= 1);
  assert.ok(r.home.length >= 1 && r.home[0].tip.length > 10);
});
test("synchronisation : le bilan des deux appareils est réuni", () => {
  const a = seen(["number", "addition"]),
    b = seen(["number", "addition"]);
  add(a, "number", 2, true, NOW);
  add(b, "number", 1, true, NOW);
  a.assessment = { number: { at: 100, run: "x", result: "wrong" } };
  b.assessment = { number: { at: 200, run: "y", result: "auto" }, addition: { at: 50, run: "y", result: "helped" } };
  const m = mergeStates(a, b);
  assert.equal(m.assessment.number.result, "auto");
  assert.equal(m.assessment.addition.result, "helped");
});
