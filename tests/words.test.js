import test from "node:test";
import assert from "node:assert/strict";
import { exercise, check, nearCheck } from "../frontend/js/exercises.js";


test("saisons : 16 variantes, toutes avec une bonne réponse parmi les saisons", () => {
  const prompts = new Set();
  for (let seed = 0; seed < 16; seed++) {
    const q = exercise("seasons", seed, 2, 0);
    prompts.add(q.prompt);
    assert.ok(q.options.includes(q.answer), q.prompt);
    assert.ok(q.tolerant);
  }
  assert.equal(prompts.size, 16);
  // vérités du cycle
  const find = (re) => [...Array(16).keys()].map((s) => exercise("seasons", s, 2, 0)).find((q) => re.test(q.prompt));
  assert.equal(find(/après l’automne/).answer, "hiver");
  assert.equal(find(/avant le printemps/).answer, "hiver");
  assert.equal(find(/avant l’hiver/).answer, "automne");
  assert.equal(find(/entre l’été et l’hiver/).answer, "automne");
  assert.equal(find(/entre l’hiver et l’été/).answer, "printemps");
  assert.equal(find(/neiger/).answer, "hiver");
});

test("orthographe proche acceptée pour les saisons, jours et mois (exemples réels)", () => {
  const sq = (answer) => ({ tolerant: true, type: "input", answer, options: ["printemps", "été", "automne", "hiver"] });
  for (const [got, want] of [["Ivér", "hiver"], ["Ive", "hiver"], ["Hivr", "hiver"], ["Printan", "printemps"], ["Autonn", "automne"], ["Ete", "été"]])
    assert.ok(nearCheck(sq(want), got) || check(sq(want), got), `${got} → ${want}`);
  const dq = (answer, others) => ({ tolerant: true, type: "input", answer, options: [answer, ...others] });
  assert.ok(nearCheck(dq("vendredi", ["samedi", "lundi"]), "Vandredi"));
  assert.ok(nearCheck(dq("samedi", ["dimanche", "mardi"]), "Samdi"));
  assert.ok(nearCheck(dq("août", ["juillet", "mai"]), "A oût"));
  // Jamais pour une vraie confusion
  assert.ok(!nearCheck(sq("hiver"), "été"));
  assert.ok(!nearCheck(sq("automne"), "hiver"));
  assert.ok(!nearCheck(dq("jeudi", ["vendredi", "lundi"]), "lundi"));
  assert.ok(!nearCheck(dq("mardi", ["mercredi", "lundi"]), "mercredi"));
  assert.ok(!nearCheck(dq("février", ["janvier", "mai"]), ""));
  // Réponse exacte : pas « proche », c'est juste
  assert.ok(!nearCheck(sq("hiver"), "Hiver") && check(sq("hiver"), "Hiver"));
  // Choix multiples : jamais de tolérance
  assert.ok(!nearCheck({ ...sq("hiver"), type: "choice" }, "hivr"));
});

test("calendrier : mois avant/après exacts et indice limité aux voisins", () => {
  const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  let back = 0,
    fwd = 0;
  for (let seed = 0; seed < 72; seed++) {
    const q = exercise("calendar", seed, 2, 2);
    const m = q.prompt.match(/Quel mois vient (avant|après) (\S+) \?/);
    assert.ok(m, q.prompt);
    const i = months.indexOf(m[2]);
    assert.equal(q.answer, months[(i + (m[1] === "avant" ? 11 : 1)) % 12]);
    assert.ok(q.tolerant && q.hint.split(",").length <= 5, q.hint);
    m[1] === "avant" ? back++ : fwd++;
  }
  assert.ok(back > 10 && fwd > 10);
});
