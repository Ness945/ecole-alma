import test from "node:test";
import assert from "node:assert/strict";
import { fresh, record, validate, easeFor, recallFor, DAY } from "../frontend/js/core.js";
import { exercise, selectExercise } from "../frontend/js/exercises.js";
import { errorOf, recurringErrors, trendOf, trends, missionsList, timeByDay, focusInsights, suggestions, followupView, inactivityDays } from "../frontend/js/followup.js";

const NOW = new Date(2026, 9, 19, 12).getTime();
const seen = (ids) => {
  const s = fresh();
  for (const id of ids) s.skills[id].status = "seen";
  return s;
};
const rec = (s, id, over = {}, at = NOW) =>
  record(s, id, { correct: false, assisted: false, skip: false, dimension: "production", fingerprint: id + Math.random(), error: "calculation", ...over }, at);

test("suivi : les détails vont dans l'historique, pas dans les preuves de la notion", () => {
  const s = seen(["addition"]);
  rec(s, "addition", { prompt: "Combien font 7 + 5 ?", answer: "11", expected: "12", ms: 4200, hints: 1, mission: "m1", pos: 0 });
  assert.equal(s.history[0].answer, "11");
  assert.equal(s.history[0].expected, "12");
  assert.equal(s.skills.addition.evidence[0].answer, undefined);
  assert.equal(s.skills.addition.evidence[0].prompt, undefined);
  assert.doesNotThrow(() => validate(JSON.parse(JSON.stringify(s))));
});
test("suivi : anciennes sauvegardes sans détails valides, détails abîmés nettoyés sans bloquer", () => {
  const s = seen(["addition"]);
  rec(s, "addition");
  rec(s, "addition", { prompt: "x".repeat(500), answer: 5, ms: -3, hints: "a", ease: "oui", mission: 7 });
  const v = validate(JSON.parse(JSON.stringify(s)));
  const e = v.history[1];
  assert.equal(e.prompt.length, 140);
  for (const k of ["answer", "ms", "hints", "ease", "mission"]) assert.equal(e[k], undefined, k);
  assert.ok(v.history[0]);
});
test("adaptation : deux échecs de suite → exemple plus simple, pas de soutien inutile sinon", () => {
  const s = seen(["addition", "number"]);
  assert.equal(easeFor(s, "addition"), false);
  rec(s, "addition");
  assert.equal(easeFor(s, "addition"), false);
  rec(s, "addition", { skip: true, assisted: true, error: "dont_know" });
  assert.equal(easeFor(s, "addition"), true);
  assert.equal(easeFor(s, "number"), false, "autre notion non concernée");
  rec(s, "addition", { correct: true });
  assert.equal(easeFor(s, "addition"), false, "une réussite remet la difficulté normale");
});
test("adaptation : nombres plus petits, matériel visible, soutien pour les notions de français", () => {
  for (let seed = 1; seed < 60; seed++) {
    const q = exercise("addition", seed, 4, 1, true);
    const nums = q.prompt.match(/\d+/g).map(Number);
    assert.ok(nums[0] <= 4 && nums[1] <= 3, q.prompt);
    assert.ok(q.visual.includes("🍎"), "matériel visible même au niveau 4");
    assert.ok(q.eased);
    const m = exercise("multiplication", seed, 4, 1, true);
    assert.ok(m.visual && m.eased);
  }
  const f = exercise("noun", 5, 3, 1, true);
  assert.ok(f.support && f.hint);
  const normal = exercise("addition", 5, 4, 1, false);
  assert.ok(!normal.eased);
  assert.equal(selectExercise("addition", 5, 2, 1, [], true).q.eased, true);
});
test("adaptation : trois échecs → on revoit d'abord un prérequis déjà abordé", () => {
  const s = seen(["addition", "subtract"]);
  for (let i = 0; i < 3; i++) rec(s, "subtract");
  assert.equal(recallFor(s, "subtract"), "addition");
  const t = seen(["subtract"]);
  for (let i = 0; i < 3; i++) rec(t, "subtract");
  assert.equal(recallFor(t, "subtract"), null, "prérequis non abordé : rien à revoir");
  const u = seen(["addition", "subtract"]);
  rec(u, "subtract");
  rec(u, "subtract");
  assert.equal(recallFor(u, "subtract"), null, "deux échecs seulement");
});
test("suivi : les erreurs sont décrites d'après la réponse donnée", () => {
  const base = { correct: false, skip: false, skill: "addition", prompt: "Combien font 7 + 5 ?", expected: "12" };
  assert.equal(errorOf({ ...base, answer: "11" }).code, "off1");
  assert.equal(errorOf({ ...base, answer: "22" }).code, "off10");
  assert.equal(errorOf({ ...base, answer: "7" }).code, "copy");
  assert.equal(errorOf({ ...base, answer: "2" }).code, "op");
  assert.equal(errorOf({ ...base, answer: "40" }).code, "calc");
  assert.equal(errorOf({ ...base, skill: "subtract", prompt: "Combien font 12 − 5 ?", expected: "7", answer: "17" }).code, "op");
  assert.equal(errorOf({ ...base, skill: "multiplication", prompt: "Combien font 3 × 4 ?", expected: "12", answer: "7" }).code, "op");
  assert.equal(errorOf({ ...base, skill: "number", prompt: "x", expected: "34", answer: "43" }).code, "swap");
  assert.equal(errorOf({ ...base, skip: true }).code, "help");
  assert.equal(errorOf({ ...base, answer: "" }).code, "empty");
  assert.equal(errorOf({ ...base, correct: true }), null);
  assert.equal(errorOf({ skill: "determiner", correct: false, skip: false, error: "determiner_group", answer: "la lune", expected: "la", prompt: "p" }).code, "group");
});
test("suivi : tendance, erreurs récurrentes, missions, temps, idées et page", () => {
  const s = seen(["addition", "subtract"]);
  // anciennes semaines : bien réussi ; récentes : en difficulté
  for (let i = 0; i < 4; i++) rec(s, "addition", { correct: true, mission: "old", pos: i, ms: 5000 }, NOW - 18 * DAY + i);
  for (let i = 0; i < 4; i++)
    rec(s, "addition", { answer: "11", expected: "12", prompt: "Combien font 7 + 5 ?", mission: "m1", pos: i, ms: 20000, confidence: "very" }, NOW - 2 * DAY + i);
  const t = trendOf(s, "addition", NOW);
  assert.equal(t.status, "down");
  assert.equal(trends(s, NOW)[0].id, "addition");
  assert.equal(trendOf(s, "subtract", NOW).status, "few");
  const errs = recurringErrors(s, NOW);
  assert.equal(errs[0].code, "off1");
  assert.equal(errs[0].count, 4);
  const ms = missionsList(s);
  assert.equal(ms[0].id, "m1");
  assert.equal(ms[0].entries.length, 4);
  assert.ok(timeByDay(s, NOW).totalMs >= 80000);
  assert.equal(suggestions(s, NOW)[0].skill, "addition");
  assert.match(suggestions(s, NOW)[0].tip, /dés/);
  assert.ok(focusInsights(s, NOW).some((x) => /sûre/.test(x)));
  assert.equal(inactivityDays(s, NOW + 5 * DAY), 7);
  const html = followupView(s, NOW + 0);
  for (const w of ["À faire ensemble", "Évolution par notion", "Erreurs qui reviennent", "Temps et concentration", "Dernières missions", "pas un diagnostic"]) assert.match(html, new RegExp(w), w);
  assert.doesNotMatch(html, /undefined|NaN|\[object/);
});
test("suivi : texte venant de l'enfant échappé, page vide correcte, anciennes missions lisibles", () => {
  const s = seen(["noun"]);
  assert.match(followupView(s, NOW), /apparaîtra après les premières missions/);
  rec(s, "noun", { answer: "<img src=x onerror=alert(1)>", expected: "chat", prompt: "<b>Trouve</b>", mission: "m9", pos: 0 });
  rec(s, "noun");
  const html = followupView(s, NOW);
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
  assert.match(html, /avant le suivi détaillé/);
});
