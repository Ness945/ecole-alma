import test from "node:test";
import assert from "node:assert/strict";
import {
  wordBanks,
  arrowPuzzles,
  gridFor,
  cellsFor,
  newWordGame,
  wordQuestion,
  answerWord,
  nextWord,
  writeGrid,
  validWordGame,
} from "../frontend/js/word-workshop.js";
import { fresh, validate, reward } from "../frontend/js/core.js";
test("Mots : 36 exercices originaux, corrections et accents", () => {
  for (const mode of Object.keys(wordBanks)) {
    assert.equal(wordBanks[mode].length, 12);
    for (let p = 0; p < 3; p++) {
      const g = newWordGame(mode, p);
      for (let i = 0; i < 4; i++) {
        g.draft = wordQuestion(g).answer;
        assert.ok(answerWord(g).correct);
        assert.equal(answerWord(g), null);
        nextWord(g);
      }
      assert.ok(g.finished);
      assert.ok(validWordGame(g));
    }
  }
  const g = newWordGame("cloze", 2);
  g.index = 1;
  g.draft = "etoile";
  assert.equal(answerWord(g).correct, false);
  assert.ok(g.assisted.includes(1));
  g.draft = "étoile";
  g.attempted = false;
  assert.ok(answerWord(g).assisted);
});
test("Grilles : croisements cohérents, définitions sans collision et cellules dans la grille", () => {
  for (const puzzle of arrowPuzzles) {
    const grid = gridFor(puzzle);
    assert.ok(Object.values(grid).some((c) => c.words.length > 1));
    for (const w of puzzle.words) {
      for (const key of cellsFor(w)) {
        const [r, c] = key.split(",").map(Number);
        assert.ok(r >= 0 && r < 6 && c >= 0 && c < 7);
      }
      const clue = `${w.row - (w.dir === "down" ? 1 : 0)},${w.col - (w.dir === "right" ? 1 : 0)}`;
      assert.equal(grid[clue], undefined);
    }
  }
});
test("Grilles : lettres partagées, mots verrouillés et reprise", () => {
  for (let p = 0; p < 3; p++) {
    const g = newWordGame("arrow", p);
    for (let i = 0; i < 3; i++) {
      g.index = i;
      g.attempted = false;
      writeGrid(g, arrowPuzzles[p].words[i].answer);
      assert.ok(answerWord(g).correct);
      assert.ok(validWordGame(g));
    }
    assert.ok(g.finished);
    const s = fresh();
    s.wordGame = g;
    assert.deepEqual(validate(s).wordGame, g);
  }
});
test("Atelier : récompense unique, anciennes sauvegardes et corruption refusée", () => {
  const s = fresh();
  assert.ok(validate(s));
  const session = {
    id: "words:cloze:0",
    index: 4,
    queue: Array(4).fill("noun"),
  };
  assert.ok(reward(s, session));
  assert.equal(reward(s, session), false);
  assert.equal(s.rpg.coins, 10);
  for (const bad of [
    { mode: "evil" },
    { letters: { "<script>": "A" } },
    { solved: [7] },
    { finished: "true" },
  ]) {
    s.wordGame = { ...newWordGame("arrow"), ...bad };
    assert.throws(() => validate(s));
  }
});
