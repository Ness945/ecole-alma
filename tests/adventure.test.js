import test from "node:test";
import assert from "node:assert/strict";
import { fresh, validate, record, reward, ready } from "../frontend/js/core.js";
import {
  createAdventure,
  adventureExercise,
  bridgeCount,
  nextStage,
  stages,
} from "../frontend/js/adventure.js";
function complete(state, correct = true) {
  const session = state.session;
  while (session.index < session.queue.length) {
    const q = adventureExercise(session);
    record(state, q.skill, {
      correct,
      assisted: q.guided,
      skip: false,
      dimension: q.dimension,
      fingerprint: q.fingerprint,
    });
    session.index++;
  }
  reward(state, session);
  state.session = null;
}
test("ancienne sauvegarde v1 inchangée, session classique comprise", () => {
  const s = fresh();
  s.skills.noun.status = "seen";
  s.session = {
    id: "legacy",
    queue: ["noun"],
    index: 0,
    seed: 123,
    started: 1,
    mode: "normal",
    draft: "chat",
    assisted: false,
    feedback: "",
    confidence: "sure",
    answered: false,
    order: [],
  };
  assert.deepEqual(validate(s), s);
  assert.equal(bridgeCount(s), 0);
});
test("trois étapes ouvrent le pont, les preuves guidées restent aidées", () => {
  const s = fresh();
  for (let n = 0; n < 3; n++) {
    assert.equal(nextStage(s), n);
    const session = createAdventure(s, 7, "test-" + n);
    assert.equal(session.adventure, n);
    assert.equal(s.skills[stages[n].skill].status, "seen");
    assert.deepEqual(validate(s), s);
    complete(s);
    assert.equal(bridgeCount(s), n + 1);
  }
  assert.equal(nextStage(s), -1);
  assert.throws(() => createAdventure(s, 1, "again"));
  assert.equal(s.history[0].assisted, true);
  assert.equal(ready(s.skills.noun), true);
});
test("noms fragiles : préparation sans perdre une planche ni introduire les déterminants", () => {
  const s = fresh();
  createAdventure(s, 1, "a");
  complete(s);
  createAdventure(s, 2, "b");
  complete(s, false);
  assert.equal(bridgeCount(s), 2);
  assert.equal(nextStage(s), 1);
  assert.equal(s.skills.determiner.status, "unknown");
  createAdventure(s, 4, "prep");
  complete(s);
  assert.equal(bridgeCount(s), 2);
  assert.equal(nextStage(s), 2);
});
test("pas de remplacement d’une mission en cours et récompense unique après reprise", () => {
  const s = fresh(),
    session = createAdventure(s, 25, "a");
  assert.throws(() => createAdventure(s, 22, "b"));
  s.session.draft = "1,3";
  const resumed = validate(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(
    adventureExercise(resumed.session),
    adventureExercise(session),
  );
  session.index = 7;
  reward(s, session);
  const stars = s.stars;
  assert.equal(reward(s, session), false);
  assert.equal(s.stars, stars);
  assert.equal(bridgeCount(s), 1);
});
test("imports aventure incohérents refusés", () => {
  for (const mutate of [
    (s) => (s.session.adventure = 9),
    (s) => (s.session.queue = ["noun"]),
    (s) => (s.session.id = "bad"),
  ]) {
    const s = fresh();
    createAdventure(s, 1, "x");
    mutate(s);
    assert.throws(() => validate(s));
  }
});
test("variantes de l’aventure : deux productions et reconnaissances distinctes", () => {
  for (let seed = 0; seed < 100; seed++)
    for (let n = 0; n < 3; n++) {
      const qs = Array.from({ length: 7 }, (_, index) =>
        adventureExercise({ seed, index, adventure: n }),
      );
      for (const d of ["production", "recognition"])
        assert.ok(
          new Set(qs.filter((q) => q.dimension === d).map((q) => q.fingerprint))
            .size >= 2,
        );
      for (const q of qs) {
        assert.ok(q.answer);
        if (q.type === "choice")
          assert.equal(q.options.filter((x) => x === q.answer).length, 1);
      }
    }
});
