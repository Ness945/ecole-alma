import test from "node:test";
import assert from "node:assert/strict";
import {
  newMarket,
  marketQuestion,
  answerMarket,
  advanceMarket,
  validMarket,
  marketCount,
} from "../frontend/js/market.js";
import { fresh, validate, reward, record } from "../frontend/js/core.js";
function solve(m) {
  const q = marketQuestion(m);
  m.draft =
    m.stage === 0
      ? [q.answer, 0, 0, 0]
      : m.stage === 1
        ? Array(4).fill(q.each)
        : m.stage === 2
          ? [q.answer % 2, Math.floor(q.answer / 2), 0, 0]
          : [q.hour, q.half ? 1 : 0, 0, 0];
  return answerMarket(m);
}
test("Marché : reprise, quatre étapes, preuve et récompense uniques", () => {
  const s = fresh();
  s.market = newMarket();
  for (let stage = 0; stage < 4; stage++) {
    let m = s.market;
    m.started = true;
    for (let i = 0; i < 3; i++) {
      const result = solve(m);
      assert.ok(result.correct);
      s.skills[result.skill].status = "seen";
      record(s, result.skill, result);
      assert.equal(answerMarket(m), null);
      assert.deepEqual(validate(s), s);
      const done = advanceMarket(m, true);
      if (i === 2) {
        assert.equal(done, stage);
        const session = {
          id: `market:${stage}`,
          index: 3,
          queue: Array(3).fill(result.skill),
        };
        assert.ok(reward(s, session));
        assert.equal(reward(s, session), false);
      }
    }
  }
  assert.equal(s.market.stage, 4);
  assert.equal(marketCount(s), 4);
  assert.equal(s.rpg.coins, 40);
  assert.equal(s.history.length, 12);
});
test("Marché : deux réussites autonomes augmentent la difficulté, erreur réduit et change la question", () => {
  const m = newMarket(1);
  m.started = true;
  solve(m);
  advanceMarket(m, true);
  solve(m);
  advanceMarket(m, true);
  assert.equal(m.level, 1);
  const before = marketQuestion(m);
  m.draft = [0, 0, 0, 0];
  assert.equal(answerMarket(m).correct, false);
  advanceMarket(m, false);
  assert.equal(m.level, 0);
  assert.equal(m.step, 2);
  assert.notEqual(marketQuestion(m).prompt, before.prompt);
});
test("Marché : aide ne compte pas comme autonomie et somme seule ne suffit pas aux paniers", () => {
  const m = newMarket(1);
  m.started = true;
  const q = marketQuestion(m);
  m.draft = [q.answer, 0, 0, 0];
  assert.equal(answerMarket(m).correct, false);
  advanceMarket(m, false);
  m.helped = true;
  assert.equal(solve(m).assisted, true);
  assert.equal(m.streak, 0);
});
test("Marché : plusieurs paiements exacts acceptés, horaires entiers et demis", () => {
  for (let level = 0; level < 3; level++)
    for (let step = 0; step < 3; step++) {
      const m = newMarket(2, level);
      m.step = step;
      m.started = true;
      const q = marketQuestion(m);
      m.draft = [q.answer, 0, 0, 0];
      assert.ok(answerMarket(m).correct);
      const clock = newMarket(3, level);
      clock.step = step;
      clock.started = true;
      assert.ok(solve(clock).correct);
    }
});
test("Marché : anciennes sauvegardes acceptées, données de reprise corrompues refusées", () => {
  assert.ok(validate(fresh()));
  for (const field of ["stage", "step", "level", "draft", "started"]) {
    const s = fresh();
    s.market = newMarket();
    s.market[field] = "invalid";
    assert.equal(validMarket(s.market), false);
    assert.throws(() => validate(s));
  }
});
