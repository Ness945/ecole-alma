import test from "node:test";
import assert from "node:assert/strict";
import { exercise, explain } from "../frontend/js/exercises.js";
import { skills } from "../frontend/js/content.js";

test("chaque notion a une explication non vide, avec la bonne réponse, pour une mauvaise réponse", () => {
  for (const s of skills) {
    for (let seed = 0; seed < 40; seed++) {
      for (let turn = 0; turn < 3; turn++) {
        const q = exercise(s.id, seed * 31 + 7, 2, turn);
        if (!q) continue;
        const e = explain(q, "zzz");
        assert.ok(e.why && e.why.length > 8, `${s.id}: explication vide pour « ${q.prompt} »`);
        assert.ok(!/undefined|NaN|\[object/.test(e.why + e.slip), `${s.id}: ${e.why}`);
      }
    }
  }
});

test("erreurs typiques nommées", () => {
  const find = (id, re, t = 1) => {
    for (let seed = 0; seed < 300; seed++) {
      const q = exercise(id, seed, 2, t);
      if (re.test(q.prompt)) return q;
    }
  };
  const add = find("addition", /\+/);
  const [x, y] = add.prompt.match(/\d+/g).map(Number);
  assert.match(explain(add, String(Math.abs(x - y))).slip || "x" + explain(add, "0").why, /retiré|\d/);
  const sub = find("subtract", /−/);
  const [sx, sy] = sub.prompt.match(/\d+/g).map(Number);
  assert.match(explain(sub, String(sx + sy)).slip, /ajouté/);
  const mul = find("multiplication", /×/);
  const [g, e] = mul.prompt.match(/\d+/g).map(Number);
  assert.match(explain(mul, String(g + e)).slip, /additionné/);
  const near = explain(add, String(x + y + 1));
  assert.match(near.slip, /proche/);
  const num = find("number", /dizaines et/);
  const [t, u] = num.prompt.match(/\d+/g).map(Number);
  if (t !== u) assert.match(explain(num, `${u}${t}`).slip, /envers/);
  const sea = find("seasons", /après l’automne/);
  assert.match(explain(sea, "été").why, /printemps → ☀️ été → 🍂 automne → ❄️ hiver/);
});

test("énoncé inattendu : repli sur l'indice, jamais de texte cassé", () => {
  const q = { skill: "number", prompt: "Prépare 24 clous avec les dizaines et les unités.", answer: "24", hint: "Une dizaine = 10.", type: "input" };
  const e = explain(q, "7");
  assert.ok(!/undefined|NaN/.test(e.why), e.why);
  assert.ok(e.why.length > 5);
});
