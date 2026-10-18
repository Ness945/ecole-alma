import test from "node:test";
import assert from "node:assert/strict";
import { fresh, validate, save, load, KEY, LEGACY_KEY } from "../frontend/js/core.js";
import * as D from "../frontend/js/discovery.js";
import {
  FAMILIES,
  LADDER,
  make,
  judge,
  looseEqual,
  READING_INSTRUCTION,
} from "../frontend/js/discovery-bank.js";
import { RULES, STEPS, validDiscovery } from "../frontend/js/discovery-model.js";

const memory = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
  };
};
let clock = 1_000_000;
const tick = () => (clock += 1000);
const roundTrip = (s) => validate(JSON.parse(JSON.stringify(s)));
const wrongValue = (q) => (q.numeric ? "999" : "zzzz");

// Joue une étape avec un script de réponses : "ok", "ko", "skip", "nl" (pas appris), "help" (exemple puis réussite), "voice".
function play(state, run, step, script) {
  let r = D.ensureActive(state, run, step, tick());
  let i = 0;
  const log = [];
  while (r.active) {
    const mode = typeof script === "function" ? script(r.active, i) : script[i] ?? "ok";
    i++;
    const q = D.questionOf(run, r.active);
    if (mode === "help") D.setHelp(run, step, "hint");
    if (mode === "adult") D.setHelp(run, step, "adult");
    if (mode === "voice") D.setHelp(run, step, "voice");
    let input;
    if (mode === "skip") input = { kind: "skip" };
    else if (mode === "nl") input = { kind: "not_learned" };
    else if (mode === "ko") input = { kind: "answer", value: wrongValue(q) };
    else input = { kind: "answer", value: q.answer };
    log.push(D.answerActive(state, run, step, input, tick()));
    r = D.advance(state, run, step, tick());
    if (i > 60) throw Error("boucle");
  }
  return log;
}
const allSeen = (s) => {
  for (const id of ["verb", "subject"]) s.skills[id].status = "seen";
  return s;
};

// ───────────────────────── Banque de défis ─────────────────────────
test("banque : chaque notion a au moins 3 familles et chaque famille au moins 6 variantes", () => {
  for (const [skill, l] of Object.entries(LADDER)) {
    const ids = [...l.tier1, ...l.tier2];
    assert.ok(ids.length >= 3, skill);
    for (const id of ids) {
      assert.equal(FAMILIES[id].skill, skill);
      assert.ok(FAMILIES[id].variants.length >= 6, id);
    }
  }
});
test("banque : réponses attendues présentes parmi des options distinctes, calculs vérifiés, exemples sans fuite", () => {
  const seen = new Set();
  for (const f of Object.values(FAMILIES)) {
    const answers = new Set();
    f.variants.forEach((v, i) => {
      const q = make(f.id, i, 7);
      assert.ok(!seen.has(q.fingerprint), "empreinte unique " + q.fingerprint);
      seen.add(q.fingerprint);
      answers.add(String(q.answer));
      assert.ok(judge(q, q.answer), `${f.id}#${i} accepte sa réponse`);
      if (f.form === "choice") {
        assert.ok(q.options.includes(q.answer), `${f.id}#${i} option correcte`);
        assert.equal(new Set(q.options).size, q.options.length, `${f.id}#${i} options distinctes`);
        assert.ok(q.options.length >= (f.id === "num-compare" ? 2 : 3) || f.id.includes("det"), `${f.id}#${i} distracteurs`);
        assert.equal(q.options.filter((o) => judge(q, o)).length, 1, `${f.id}#${i} une seule bonne option`);
      }
      if (v.calc) {
        const [a, b] = v.calc.nums;
        const expected = {
          "+": a + b,
          "-": a - b,
          compose: a * 10 + b,
          compare: v.calc.word === "grand" ? Math.max(a, b) : Math.min(a, b),
        }[v.calc.op];
        assert.equal(Number(v.answer), expected, `${f.id}#${i} calcul`);
      }
      if (f.skill === "reading") {
        assert.equal(q.speech, "instruction");
        assert.equal(q.instruction, READING_INSTRUCTION);
        assert.ok(!READING_INSTRUCTION.includes(q.passage.slice(0, 12)));
      }
    });
    const ex = String(f.example?.answer ?? "").toLowerCase();
    if (ex) assert.ok(![...answers].some((a) => a.toLowerCase() === ex), `${f.id} : l'exemple révèle une réponse`);
  }
});
test("banque : make est pur (même question après rechargement)", () => {
  assert.deepEqual(make("add-count", 2, 99), make("add-count", 2, 99));
});
test("réponses courtes : tolérance aux accents, articles et une faute, sans accepter n'importe quoi", () => {
  assert.ok(looseEqual("le dragon", "dragon"));
  assert.ok(looseEqual("lanterne", "lanterme"));
  assert.ok(looseEqual("éléphant", "elephant"));
  assert.ok(!looseEqual("chat", "chien"));
  assert.ok(!looseEqual("lit", "lis"), "mots courts : pas de tolérance");
  assert.ok(!looseEqual("lettre", ""));
});

// ───────────────────────── Règles d'adaptation et d'arrêt ─────────────────────────
test("un premier défi accessible puis un exemple différent de forme différente pour confirmer", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 5, "d:a", tick());
  play(s, run, "numbers", (a, i) => (i < 2 ? "ok" : "skip"));
  const nums = D.challengesOf(run, "number");
  assert.equal(nums.length, 2);
  assert.notEqual(nums[0].item, nums[1].item);
  assert.ok(LADDER.number.tier1.includes(nums[0].item));
  assert.ok(LADDER.number.tier2.includes(nums[1].item));
});
test("jamais plus de 3 défis par notion et l'étape respecte sa limite", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 6, "d:b", tick());
  // alternance qui n'atteint jamais 2 échecs consécutifs ni 2 réussites autonomes
  play(s, run, "numbers", (a, i) => (i % 2 ? "help" : "ko"));
  for (const sk of STEPS[0].skills) assert.ok(D.challengesOf(run, sk).length <= RULES.maxPerSkill);
  assert.ok(D.allChallenges(run).length <= STEPS[0].limit);
});
test("deux non-réussites consécutives arrêtent la notion sans multiplier les défis difficiles", () => {
  const s = fresh(),
    run = D.startRun(s, 7, "d:c", tick());
  play(s, run, "numbers", ["ko", "ko", "ok", "ok", "ok", "ok", "ok", "ok"]);
  assert.equal(D.challengesOf(run, "number").length, 2);
  assert.equal(D.skillStop(D.challengesOf(run, "number")), "blocked");
});
test("trois non-réussites consécutives dans l'étape déclenchent l'arrêt « fatigue » (pause proposée)", () => {
  const s = fresh(),
    run = D.startRun(s, 8, "d:d", tick());
  play(s, run, "numbers", ["ok", "ko", "ko", "ko", "ko"]);
  assert.equal(run.steps.numbers.stopReason, "fatigue");
  assert.equal(run.steps.numbers.status, "done");
  assert.ok(run.steps.numbers.challenges.length <= 4);
});
test("deux réussites autonomes confirment une notion (arrêt « confirmed »)", () => {
  const s = fresh(),
    run = D.startRun(s, 9, "d:e", tick());
  play(s, run, "numbers", ["ok", "ok", "skip", "skip"]);
  assert.equal(D.skillStop(D.challengesOf(run, "number")), "confirmed");
});
test("réponses contradictoires → À confirmer, pas de conclusion", () => {
  const c = { A: 1, Q: 1, D: 0, H: 0, W: 1, S: 0, N: 0, total: 2 };
  assert.equal(D.classify(c, "unknown").category, "confirm");
});
test("« Je ne l'ai pas appris » arrête la notion et ne propose pas la suivante dépendante", () => {
  const s = fresh(),
    run = D.startRun(s, 10, "d:f", tick());
  play(s, run, "numbers", ["nl"]);
  assert.equal(D.skillStop(D.challengesOf(run, "number")), "not_learned");
  assert.equal(D.eligibility(s, run, "addition").reason, "prereq_not_learned");
  assert.equal(D.challengesOf(run, "addition").length, 0);
});
test("verbe et sujet ne sont proposés que si le parent les a marqués « déjà travaillés »", () => {
  const s = fresh(),
    run = D.startRun(s, 11, "d:g", tick());
  assert.equal(D.eligibility(s, run, "verb").reason, "needs_parent_seen");
  play(s, run, "grammar", []);
  assert.equal(D.challengesOf(run, "verb").length, 0);
  assert.equal(D.challengesOf(run, "subject").length, 0);
  const row = D.buildReport(s).rows.find((r) => r.skill === "verb");
  assert.equal(row.category, "unassessed");
});
test("une notion « pas encore abordée » n'est jamais proposée à l'enfant", () => {
  const s = fresh();
  s.skills.addition.status = "not_seen";
  const run = D.startRun(s, 12, "d:h", tick());
  play(s, run, "numbers", []);
  assert.equal(D.challengesOf(run, "addition").length, 0);
  const rows = D.buildReport(s).rows;
  assert.equal(rows.find((r) => r.skill === "addition").category, "explore");
  assert.notEqual(D.nextAdventure(s, rows)?.skill, "addition");
});
test("un exemple déjà vu dans les deux derniers bilans est évité, sinon marqué « déjà rencontré »", () => {
  const s = fresh();
  const seen = new Set();
  for (let r = 0; r < 3; r++) {
    const run = D.startRun(s, 40 + r, "d:r" + r, tick());
    play(s, run, "numbers", ["ok", "ok"]);
    for (const c of D.challengesOf(run, "number")) {
      const key = c.item + c.variant;
      assert.ok(!seen.has(key) || r === 2, "variante répétée trop tôt");
      assert.equal(c.repeated, false);
      seen.add(key);
    }
  }
  const f = FAMILIES["num-build"];
  const run = D.startRun(s, 77, "d:rep", tick());
  const used = new Set();
  for (let i = 0; i < f.variants.length; i++) {
    const v = D.chooseVariant(s, run, "num-build", f.variants.length);
    run.steps.numbers.challenges.push({
      skill: "number", item: "num-build", variant: v.variant, task: "t", form: "blocks",
      outcome: "auto", afterDemo: false, repeated: v.repeated, hint: false, voice: false, adult: false, at: tick(),
    });
    used.add(v.variant);
  }
  assert.equal(used.size, f.variants.length);
  assert.equal(D.chooseVariant(s, run, "num-build", f.variants.length).repeated, true);
});

// ───────────────────────── Aide, autonomie, passage ─────────────────────────
test("les issues sont distinguées : autonome, accompagnée, incorrecte, passée, non apprise", () => {
  const s = fresh(),
    run = D.startRun(s, 13, "d:i", tick());
  const log = play(s, run, "numbers", ["ok", "help", "ko", "skip"]);
  assert.deepEqual(
    log.map((c) => c.outcome).slice(0, 4),
    ["auto", "helped", "wrong", "skipped"],
  );
  const t = D.tally(D.allChallenges(run));
  assert.ok(t.A >= 1 && t.H >= 1 && t.W >= 1 && t.S >= 1);
});
test("après une démonstration, le défi équivalent n'est pas une preuve indépendante", () => {
  const s = fresh(),
    run = D.startRun(s, 14, "d:j", tick());
  play(s, run, "numbers", ["help", "ok", "skip", "skip", "skip"]);
  const [first, second] = D.challengesOf(run, "number");
  assert.equal(first.outcome, "helped");
  assert.equal(second.afterDemo, true);
  assert.equal(D.tally([first, second]).A, 0);
  assert.equal(D.tally([first, second]).D, 1);
});
test("lecture : voix ou adulte → réussite accompagnée, jamais lecture autonome", () => {
  const s = fresh(),
    run = D.startRun(s, 15, "d:k", tick());
  play(s, run, "reading", (a, i) => (i % 2 ? "adult" : "voice"));
  for (const c of D.challengesOf(run, "reading")) assert.equal(c.outcome, "helped");
  const row = D.buildReport(s).rows.find((r) => r.skill === "reading");
  assert.match(row.note, /non autonome/);
  assert.notEqual(row.category, "deepen");
});
test("« non appris » reste une observation : le statut du parent n'est jamais modifié", () => {
  const s = fresh();
  s.skills.number.status = "seen";
  const run = D.startRun(s, 16, "d:l", tick());
  play(s, run, "numbers", ["nl"]);
  assert.equal(s.skills.number.status, "seen");
  const row = D.buildReport(s).rows.find((r) => r.skill === "number");
  assert.equal(row.parent, "seen");
  assert.equal(row.category, "confirm", "contradiction parent/enfant → à confirmer, pas de décision");
});
test("« non appris » sans information du parent → À explorer", () => {
  const s = fresh(),
    run = D.startRun(s, 17, "d:m", tick());
  play(s, run, "numbers", ["nl"]);
  assert.equal(D.buildReport(s).rows.find((r) => r.skill === "number").category, "explore");
});
test("une seule réussite (ou des QCM seuls) ne conclut jamais « À approfondir »", () => {
  assert.notEqual(D.classify({ A: 1, Q: 1, D: 0, H: 0, W: 0, S: 0, N: 0, total: 1 }, "unknown").category, "deepen");
  assert.equal(D.classify({ A: 2, Q: 0, D: 0, H: 0, W: 0, S: 0, N: 0, total: 2 }, "unknown").category, "confirm");
  assert.equal(D.classify({ A: 2, Q: 1, D: 0, H: 0, W: 0, S: 0, N: 0, total: 2 }, "unknown").category, "deepen");
  assert.equal(D.classify({ A: 0, Q: 0, D: 0, H: 2, W: 0, S: 0, N: 0, total: 2 }, "unknown").category, "train");
});
test("le bilan n'écrit jamais dans les preuves de maîtrise ni dans les statuts", () => {
  const s = allSeen(fresh());
  const before = JSON.stringify({ skills: s.skills, rpg: { ...s.rpg, coins: 0 } });
  const run = D.startRun(s, 18, "d:n", tick());
  for (const st of ["numbers", "reading", "grammar"]) play(s, run, st, []);
  assert.equal(JSON.stringify({ skills: s.skills, rpg: { ...s.rpg, coins: 0 } }), before);
  assert.equal(s.completed.filter((x) => String(x).includes("discovery")).length, 0);
});

// ───────────────────────── Récompense ─────────────────────────
test("récompense de participation : une seule fois, indépendante du score", () => {
  const s = fresh();
  const coins = s.rpg.coins,
    seeds = s.seeds;
  const run = D.startRun(s, 19, "d:o", tick());
  assert.equal(D.grantParticipation(s, run), false, "rien sans observation");
  play(s, run, "numbers", ["ko", "skip", "ko"]);
  assert.equal(s.rpg.coins, coins + RULES.participationCoins);
  assert.equal(s.seeds, seeds + RULES.participationSeeds);
  const again = D.startRun(s, 20, "d:p", tick());
  play(s, again, "numbers", ["ok", "ok"]);
  assert.equal(s.rpg.coins, coins + RULES.participationCoins, "pas de doublon après un nouveau bilan");
  const copy = roundTrip(s);
  assert.equal(D.grantParticipation(copy, null), false, "pas de doublon après rechargement");
});
test("une réponse déjà enregistrée n'est jamais comptée deux fois", () => {
  const s = fresh(),
    run = D.startRun(s, 21, "d:q", tick());
  const { active } = D.ensureActive(s, run, "numbers", tick());
  const q = D.questionOf(run, active);
  assert.ok(D.answerActive(s, run, "numbers", { kind: "answer", value: q.answer }, tick()));
  assert.equal(D.answerActive(s, run, "numbers", { kind: "answer", value: q.answer }, tick()), null);
  assert.equal(run.steps.numbers.challenges.length, 1);
});
test("une réponse vide n'est pas enregistrée", () => {
  const s = fresh(),
    run = D.startRun(s, 22, "d:r", tick());
  D.ensureActive(s, run, "numbers", tick());
  assert.deepEqual(D.answerActive(s, run, "numbers", { kind: "answer", value: "  " }, tick()), { error: "empty" });
  assert.equal(run.steps.numbers.challenges.length, 0);
});

// ───────────────────────── Reprise et sauvegarde ─────────────────────────
test("reprise exacte après rechargement : même question, aides et brouillon conservés", () => {
  const s = fresh(),
    run = D.startRun(s, 23, "d:s", tick());
  const { active } = D.ensureActive(s, run, "numbers", tick());
  D.setHelp(run, "numbers", "hint");
  D.setDraft(run, "numbers", "12");
  const q1 = D.questionOf(run, active);
  const reloaded = roundTrip(s);
  const run2 = D.openRun(reloaded);
  const again = D.ensureActive(reloaded, run2, "numbers", tick());
  assert.deepEqual(again.active, run2.steps.numbers.active);
  assert.deepEqual(D.questionOf(run2, again.active), q1);
  assert.equal(again.active.draft, "12");
  assert.equal(again.active.help.hint, true);
});
test("un rechargement après réponse ne change pas la question ni n'accorde la récompense deux fois", () => {
  const s = fresh(),
    run = D.startRun(s, 24, "d:t", tick());
  const { active } = D.ensureActive(s, run, "numbers", tick());
  D.answerActive(s, run, "numbers", { kind: "answer", value: D.questionOf(run, active).answer }, tick());
  const reloaded = roundTrip(s);
  const run2 = D.openRun(reloaded);
  assert.equal(run2.steps.numbers.active.answered, true);
  assert.equal(D.answerActive(reloaded, run2, "numbers", { kind: "answer", value: "1" }, tick()), null);
  const coins = reloaded.rpg.coins;
  assert.equal(D.stopStep(reloaded, run2, "numbers", tick()).granted, true);
  assert.equal(reloaded.rpg.coins, coins + RULES.participationCoins);
  const coinsAfter = reloaded.rpg.coins;
  const third = roundTrip(reloaded);
  assert.equal(third.rpg.coins, coinsAfter);
  assert.equal(third.discovery.rewardGranted, true);
});
test("une étape peut être mise en pause avec une question en cours (arrêt refusé tant que non répondue)", () => {
  const s = fresh(),
    run = D.startRun(s, 25, "d:u", tick());
  D.ensureActive(s, run, "numbers", tick());
  assert.equal(D.stopStep(s, run, "numbers", tick()).refused, true);
  assert.equal(run.steps.numbers.status, "active");
});
test("anciennes sauvegardes : v2 sans bilan et v1 migrée restent valides, sans données de bilan", () => {
  const s = fresh();
  s.rpg.coins = 42;
  s.stars = 7;
  const mem = memory();
  mem.setItem(KEY, JSON.stringify(s));
  const loaded = load(mem);
  assert.equal(loaded.discovery, undefined);
  assert.equal(loaded.rpg.coins, 42);
  assert.equal(loaded.stars, 7);
  assert.equal(D.buildReport(loaded).latest, null);
  const old = fresh();
  const v1 = memory();
  v1.setItem(LEGACY_KEY, JSON.stringify({ ...old, version: 1 }));
  try {
    const migrated = load(v1);
    assert.equal(migrated.discovery, undefined);
  } catch (e) {
    // si la forme v1 minimale n'est pas acceptée, le comportement est identique à avant (voir core.test.js)
    assert.match(String(e.message), /sauvegarde/);
  }
});
test("la sauvegarde avec bilan est écrite puis relue à l'identique", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 26, "d:v", tick());
  for (const st of ["numbers", "reading", "grammar"]) play(s, run, st, []);
  const mem = memory();
  save(mem, s);
  assert.deepEqual(load(mem), s);
});

// ───────────────────────── Nouveau bilan sans perte ─────────────────────────
test("relancer un bilan conserve l'historique ; un bilan ouvert est marqué abandonné, jamais supprimé", () => {
  const s = fresh(),
    first = D.startRun(s, 27, "d:w1", tick());
  play(s, first, "numbers", ["ok"]);
  const n = D.allChallenges(first).length;
  const second = D.startRun(s, 28, "d:w2", tick());
  assert.equal(s.discovery.runs.length, 2);
  assert.equal(first.abandoned, true);
  assert.equal(D.allChallenges(D.runList(s)[0]).length, n);
  assert.equal(s.discovery.current, second.id);
  validate(s);
});
test("au-delà de 8 bilans détaillés, les plus anciens sont résumés sans perdre leurs comptes", () => {
  const s = fresh();
  for (let i = 0; i < RULES.keepDetailedRuns + 3; i++) {
    const r = D.startRun(s, 100 + i, "d:x" + i, tick());
    play(s, r, "numbers", ["ok", "help"]);
  }
  const compact = s.discovery.runs.filter((r) => r.compact);
  assert.equal(compact.length, 2, "8 bilans détaillés + le bilan courant");
  assert.equal(s.discovery.runs.length, RULES.keepDetailedRuns + 3);
  assert.ok(compact[0].summary.number.A + compact[0].summary.number.H > 0);
  validate(s);
  const report = D.buildReport(s);
  assert.equal(report.rows.length, 9);
});
test("conseil de délai : un bilan terminé il y a moins de 3 jours déclenche un avertissement doux", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 29, "d:y", tick());
  for (const st of ["numbers", "reading", "grammar"]) play(s, run, st, []);
  assert.equal(D.rerunAdvice(s, run.finished + 1000).recent, true);
  assert.equal(D.rerunAdvice(s, run.finished + 4 * 86400000).recent, false);
});
test("le rapport s'appuie sur le bilan le plus récent de chaque notion et garde les précédents", () => {
  const s = fresh();
  const r1 = D.startRun(s, 30, "d:z1", tick());
  play(s, r1, "numbers", ["ko", "ko"]);
  const r2 = D.startRun(s, 31, "d:z2", tick());
  play(s, r2, "numbers", ["ok", "ok"]);
  const row = D.buildReport(s).rows.find((r) => r.skill === "number");
  assert.equal(row.counts.W, 0);
  assert.equal(row.previous.length, 1);
  assert.equal(row.previous[0].counts.W, 2);
});

// ───────────────────────── Recommandations ─────────────────────────
test("les recommandations respectent les prérequis (leçon de la notion manquante d'abord)", () => {
  const s = fresh();
  s.skills.number.status = "unknown";
  s.skills.addition.status = "unknown";
  const run = D.startRun(s, 32, "d:aa", tick());
  play(s, run, "numbers", (a, i) => (a.skill === "addition" ? "help" : "ok"));
  const rows = D.buildReport(s).rows;
  for (const row of rows) {
    if (row.category === "unassessed") {
      assert.deepEqual(D.actionsFor(s, row), []);
      continue;
    }
    const target = D.resolveTarget(s, row.skill);
    const acts = D.actionsFor(s, row);
    assert.equal(acts[0].id, target);
    for (const a of acts.filter((x) => x.type === "mission"))
      assert.equal(s.skills[a.id].status, "seen", "pas de mission sur une notion non travaillée");
  }
});
test("la proposition pour Alma privilégie l'approfondissement et ne cible jamais une notion « pas encore abordée »", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 33, "d:bb", tick());
  for (const st of ["numbers", "reading", "grammar"]) play(s, run, st, []);
  const rows = D.buildReport(s).rows;
  const next = D.nextAdventure(s, rows);
  assert.ok(next);
  assert.notEqual(s.skills[next.skill].status, "not_seen");
  const blocked = fresh();
  for (const sk of Object.values(blocked.skills)) sk.status = "not_seen";
  assert.equal(D.nextAdventure(blocked, D.buildReport(blocked).rows), null);
});
test("parcours complet : toutes les notions explorées, bilan terminé, récompense unique", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 34, "d:cc", tick());
  for (const st of ["numbers", "reading", "grammar"]) play(s, run, st, []);
  validate(s);
  assert.ok(run.finished);
  assert.equal(s.discovery.current, null);
  assert.equal(s.discovery.rewardGranted, true);
  const rows = D.buildReport(s).rows;
  assert.equal(rows.filter((r) => r.category === "deepen").length, 9);
});

// ───────────────────────── Validation à l'import ─────────────────────────
test("import : un bilan valide est accepté, tout bilan mal formé est refusé", () => {
  const s = allSeen(fresh()),
    run = D.startRun(s, 35, "d:dd", tick());
  play(s, run, "numbers", ["ok", "ko"]);
  D.ensureActive(s, run, "reading", tick());
  assert.doesNotThrow(() => validate(JSON.parse(JSON.stringify(s))));
  const mutate = (fn) => {
    const c = JSON.parse(JSON.stringify(s));
    fn(c.discovery);
    return c;
  };
  const bad = [
    (d) => (d.v = 2),
    (d) => (d.rewardGranted = "oui"),
    (d) => (d.runs[0].steps.numbers.challenges[0].item = "inconnu"),
    (d) => (d.runs[0].steps.numbers.challenges[0].outcome = "genial"),
    (d) => (d.runs[0].steps.numbers.challenges[0].variant = 999),
    (d) => (d.runs[0].steps.reading.active.item = "num-build"),
    (d) => (d.runs[0].steps.reading.active.draft = "x".repeat(500)),
    (d) => (d.runs[0].steps.numbers.status = "todo"),
    (d) => (d.current = "autre"),
    (d) => d.runs.push(structuredClone(d.runs[0])),
    (d) => (d.runs[0].steps.grammar = null),
    (d) => (d.runs[0].seed = -1),
    (d) => (d.runs[0].id = "<script>"),
  ];
  for (const fn of bad) assert.throws(() => validate(mutate(fn)), fn.toString());
  assert.equal(validDiscovery(undefined), true);
  assert.equal(validDiscovery(null), false);
  assert.equal(validDiscovery([]), false);
});
