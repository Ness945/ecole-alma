// Parcours navigateur de « À la découverte de tes pouvoirs ».
// Usage : node tests/discovery-browser.mjs [chemin/playwright] [url]   (serveur : npm start, http://localhost:4173/)
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";

const { chromium } = createRequire(import.meta.url)(process.argv[2] || "playwright");
const url = process.argv[3] || "http://localhost:4173/";
const KEY = "academie.save.v2";
const browser = await launch(chromium);
const errors = [];

const fresh = async (viewport = { width: 1024, height: 768 }) => {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(url);
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  return { context, page };
};
const save = (page) =>
  page.evaluate(async (k) => {
    const raw = localStorage.getItem(k);
    if (raw) return JSON.parse(raw);
    const core = await import(new URL("js/core.js", document.baseURI)); // pas encore enregistrée : sauvegarde neuve
    return core.fresh();
  }, KEY);
const act = (page, action) => page.locator(`[data-action="${action}"]:visible`).first();
const openHub = async (page) => {
  await act(page, "disc-hub").click();
  await page.locator(".disc-step").first().waitFor();
};
// Calcule, depuis la sauvegarde, la question affichée (même moteur que l'application).
const currentQuestion = (page) =>
  page.evaluate(async (k) => {
    const D = await import(new URL("js/discovery.js", document.baseURI));
    const state = JSON.parse(localStorage.getItem(k));
    const run = D.openRun(state);
    if (!run) return null;
    for (const step of Object.values(run.steps))
      if (step.active && !step.active.answered) {
        const q = D.questionOf(run, step.active);
        return { form: q.form, answer: q.answer, tokens: q.tokens, options: q.options, numeric: q.numeric, skill: q.skill, speech: q.speech, passage: q.passage };
      }
    return null;
  }, KEY);

async function solve(page, q, wrong = false) {
  if (q.form === "choice") {
    const value = wrong ? await page.evaluate(() => [...document.querySelectorAll('[data-action="disc-pick"]')].map((b) => b.dataset.value)) : [q.answer];
    const target = wrong ? value.find((v) => v !== q.answer) : q.answer;
    await page.locator(`[data-action="disc-pick"]`).evaluateAll((els, t) => els.find((e) => e.dataset.value === t).click(), target);
    await act(page, "disc-confirm").click();
  } else if (q.form === "tap") {
    const idx = q.tokens.findIndex((t) => t === q.answer);
    const pick = wrong ? q.tokens.findIndex((t) => t !== q.answer) : idx;
    await page.locator(`[data-action="disc-pick"][data-index="${pick}"]`).click();
    await act(page, "disc-confirm").click();
  } else if (q.form === "order") {
    const tokens = wrong ? [...q.answer.split(" ")].reverse() : q.answer.split(" ");
    for (const t of tokens) await page.locator(`[data-action="disc-order"][data-index="${q.options.indexOf(t)}"]`).click();
    if (wrong) {
      await page.locator('[data-action="disc-clear"]').click();
      for (const t of q.answer.split(" ").reverse()) await page.locator(`[data-action="disc-order"][data-index="${q.options.indexOf(t)}"]`).click();
    }
    await act(page, "disc-confirm").click();
  } else if (q.form === "blocks") {
    const n = wrong ? (Number(q.answer) + 11) % 100 : Number(q.answer);
    for (let i = 0; i < Math.floor(n / 10); i++) await page.locator('[data-part="tens"][data-step="1"]').click();
    for (let i = 0; i < n % 10; i++) await page.locator('[data-part="units"][data-step="1"]').click();
    await act(page, "disc-confirm").click();
  } else {
    await page.locator("#disc-input").fill(wrong ? (q.numeric ? "99" : "zzzz") : String(q.answer));
    await page.locator("#disc-form button").click();
  }
}
// Joue les défis d'une étape jusqu'à son terme. modes[i] : ok | ko | skip | nl | help | adult | voice
async function drive(page, stepId, modes = []) {
  await page.locator(`[data-action="disc-open"][data-step="${stepId}"]`).click();
  for (let i = 0; i < 40; i++) {
    const q = await currentQuestion(page);
    if (!q) return i;
    await page.locator(".disc-question").waitFor();
    const mode = modes[i] ?? "ok";
    if (mode === "help") await act(page, "disc-hint").click();
    if (mode === "adult") await act(page, "disc-adult").click();
    if (mode === "voice") await act(page, "disc-read-text").click();
    if (mode === "skip") await act(page, "disc-skip").click();
    else if (mode === "nl") await act(page, "disc-notlearned").click();
    else await solve(page, q, mode === "ko");
    await act(page, "disc-next").click();
  }
  throw Error("étape sans fin");
}
const coinsOf = async (page) => (await save(page)).rpg.coins;
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);

try {
  // ── 1. Parcours de réussite, récompense unique, rechargement ─────────────
  {
    const { context, page } = await fresh();
    const before = await save(page);
    await page.locator(".disc-teaser").waitFor();
    assert.match(await page.locator(".disc-teaser").innerText(), /pouvoirs/);
    await openHub(page);
    assert.match(await page.locator("main").innerText(), /ni note|pas de note|sans note/i);
    const coins = await coinsOf(page);
    await drive(page, "numbers");
    assert.equal(await page.locator(".disc-reward").count(), 1, "récompense annoncée");
    assert.equal((await save(page)).rpg.coins, coins + 5);
    await openHub(page);
    await drive(page, "reading");
    assert.equal(await page.locator(".disc-reward").count(), 0, "pas de seconde récompense");
    await openHub(page);
    await drive(page, "grammar");
    await openHub(page);
    await drive(page, "world");
    assert.equal((await save(page)).discovery.runs[0].finished !== null, true, "bilan terminé après les quatre explorations");
    await act(page, "disc-results").click();
    assert.equal(await page.locator(".disc-ritual").count(), 1, "rituel de fin de Luna");
    assert.equal(await page.locator(".disc-ritual-pick").count(), 1);
    await page.getByText(/MERCI POUR TON EXPLORATION/).waitFor();
    const after = await save(page);
    assert.equal(after.rpg.coins, coins + 5);
    assert.equal(after.discovery.rewardGranted, true);
    assert.equal(after.completed.length, before.completed.length, "aucun succès de maîtrise ajouté");
    assert.deepEqual(after.skills.number.evidence, before.skills.number.evidence, "preuves de maîtrise inchangées");
    assert.equal(after.skills.number.status, before.skills.number.status);
    assert.ok(!/\b\d+\s*\/\s*\d+\b|\d+\s*%|\bscore (de|global)|\d+ points?\b/i.test(await page.locator("main").innerText()), "pas de score global");
    await page.reload();
    await page.locator(".disc-teaser").waitFor();
    assert.equal(await coinsOf(page), coins + 5, "rechargement : pas de récompense en double");
    await context.close();
  }

  // ── 2. Erreurs, aides, passages, « pas appris » + rapport parent ─────────
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers", ["help", "ko", "skip", "ok", "nl"]);
    await openHub(page);
    await drive(page, "reading", ["voice", "adult"]);
    await act(page, "disc-results").click();
    await page.getByText(/MERCI POUR TON EXPLORATION/).waitFor();
    await page.reload();
    await page.locator(".disc-teaser").waitFor();
    const save2 = await save(page);
    assert.equal(save2.skills.number.status, "unknown", "« non appris » ne modifie pas le statut du parent");
    // Espace parent : porte, rapport par notion, vocabulaire prudent
    await page.getByRole("button", { name: "⚙ Espace parent" }).click();
    await page.locator("#gate").fill("56");
    await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
    await act(page, "disc-parent").click();
    await page.locator(".disc-row").first().waitFor();
    const text = await page.locator("main").innerText();
    assert.match(text, /provisoire/i);
    assert.match(text, /À explorer|À confirmer|À entraîner|À approfondir/);
    assert.ok(!/diagnostic (scolaire|clinique) :|trouble|retard/i.test(text), "pas de vocabulaire de diagnostic");
    assert.match(text, /accompagn/i, "distinction autonomie / aide");
    assert.equal(await page.locator('.disc-row[data-skill="reading"]').getByText(/non autonome/).count(), 1, "lecture lue par voix/adulte signalée");
    assert.ok(await page.locator('.disc-row[data-skill="number"] .disc-obs li').count() >= 3);
    // Le parent peut indiquer une notion « déjà travaillée » (statut existant)
    await page.locator("#ctx-addition").selectOption("seen");
    assert.equal((await save(page)).skills.addition.status, "seen");
    // Relancer un bilan : l'historique est conservé
    await page.goto(url);
    await page.locator(".disc-teaser").waitFor();
    await page.getByRole("button", { name: "⚙ Espace parent" }).click();
    await page.locator("#gate").fill("56");
    await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
    await act(page, "disc-parent").click();
    await act(page, "disc-rerun").click();
    await act(page, "disc-rerun-confirm").click();
    await page.locator(".disc-step").first().waitFor();
    const reran = await save(page);
    assert.equal(reran.discovery.runs.length, 2);
    assert.deepEqual(reran.discovery.runs[0], { ...save2.discovery.runs[0], abandoned: true }, "ancien bilan intact (seulement marqué interrompu)");
    assert.equal(reran.discovery.rewardGranted, true);
    await context.close();
  }

  // ── 2b. Rapport parent : une recommandation « à confirmer » lance une vraie mission ──
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers", ["ok", "ko", "ok"]);
    await page.reload();
    await page.getByRole("button", { name: "⚙ Espace parent" }).click();
    await page.locator("#gate").fill("56");
    await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
    await act(page, "disc-parent").click();
    await page.locator("#ctx-number").selectOption("seen");
    const row = page.locator('.disc-row[data-skill="number"]');
    assert.equal(await row.getAttribute("data-category"), "confirm", "réponses contradictoires → à confirmer");
    const mission = row.locator('[data-action="disc-mission"]');
    assert.equal(await mission.count(), 1, "mission recommandée proposée");
    await mission.click();
    await page.locator(".exercise").waitFor();
    await context.close();
  }

  // ── 2c. Forme « remettre dans l'ordre », rangement erroné puis recommencé ───
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers", ["help", "ko", "ok", "skip", "skip"]);
    const chall = (await save(page)).discovery.runs[0].steps.numbers.challenges;
    assert.equal(chall[2].item, "num-order", "le troisième défi est un rangement");
    assert.equal(chall[2].outcome, "auto");
    await context.close();
  }
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers", ["help", "ko", "ko", "skip", "skip"]);
    assert.equal((await save(page)).discovery.runs[0].steps.numbers.challenges[2].outcome, "wrong", "mauvais ordre = incorrect");
    await context.close();
  }

  // ── 2d. Rapport parent : impression, export, évolution entre deux bilans ───
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers", ["ok", "ok"]);
    await page.reload();
    await page.getByRole("button", { name: "⚙ Espace parent" }).click();
    await page.locator("#gate").fill("56");
    await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
    await act(page, "disc-parent").click();
    await page.locator(".disc-row").first().waitFor();
    const [download] = await Promise.all([page.waitForEvent("download"), act(page, "disc-export").click()]);
    assert.match(download.suggestedFilename(), /bilan/);
    const exported = JSON.parse(await (await import("node:fs/promises")).readFile(await download.path(), "utf8"));
    assert.equal(exported.kind, "academie-bilan-depart");
    assert.equal(exported.discovery.runs.length, 1);
    assert.match(exported.note, /ni diagnostic/);
    await page.emulateMedia({ media: "print" });
    assert.equal(await page.locator('[data-action="disc-print"]').first().isVisible(), false, "boutons masqués à l’impression");
    assert.equal(await page.locator(".disc-print-only").isVisible(), true);
    await page.emulateMedia({ media: "screen" });
    // deuxième bilan → évolution indicative
    await act(page, "disc-rerun").click();
    await act(page, "disc-rerun-confirm").click();
    await act(page, "disc-hub").click().catch(() => {});
    await page.locator(".disc-step").first().waitFor();
    await drive(page, "numbers", ["ko", "ko"]);
    await page.getByRole("button", { name: /Retour au royaume|←/ }).first().click();
    await page.getByRole("button", { name: "⚙ Espace parent" }).click();
    await act(page, "disc-parent").click();
    assert.match(await page.locator('.disc-row[data-skill="number"]').innerText(), /Depuis le bilan précédent/);
    await context.close();
  }

  // ── 2e. Sauvegarde de la première version (3 explorations) : complétée, rien n'est perdu ───
  {
    const { context, page } = await fresh();
    await openHub(page);
    await drive(page, "numbers");
    await openHub(page);
    await drive(page, "reading");
    await openHub(page);
    await drive(page, "grammar");
    // Retire l'exploration 4 pour imiter une sauvegarde enregistrée avant son ajout.
    await page.evaluate((k) => {
      const st = JSON.parse(localStorage.getItem(k));
      for (const r of st.discovery.runs) delete r.steps.world;
      localStorage.setItem(k, JSON.stringify(st));
    }, KEY);
    const coins = await coinsOf(page);
    await page.reload();
    await page.locator(".disc-teaser").waitFor();
    await openHub(page);
    assert.equal(await page.locator(".disc-step").count(), 4);
    assert.match(await page.locator('.disc-step[data-state="todo"]').innerText(), /repères/i);
    await drive(page, "world");
    const st = await save(page);
    assert.equal(st.rpg.coins, coins, "pas de nouvelle récompense");
    assert.equal(st.discovery.runs.length, 1);
    assert.ok(st.discovery.runs[0].finished);
    await context.close();
  }

  // ── 3. Interruption puis reprise exacte, avec brouillon ───────────────────
  {
    const { context, page } = await fresh();
    await openHub(page);
    await page.locator('[data-action="disc-open"][data-step="grammar"]').click();
    await page.locator(".disc-question").waitFor();
    const q = await currentQuestion(page);
    await act(page, "disc-hint").click();
    const title = await page.locator(".disc-question h2").innerText();
    if (q.form === "input") await page.locator("#disc-input").fill("brouillon");
    await page.reload(); // rechargement en pleine question
    await page.locator(".disc-teaser").waitFor();
    await openHub(page);
    const resume = page.locator('[data-action="disc-open"][data-step="grammar"]');
    assert.match(await resume.innerText(), /Reprendre/);
    await resume.click();
    await page.locator(".disc-question").waitFor();
    assert.equal(await page.locator(".disc-question h2").innerText(), title, "même question après rechargement");
    assert.equal(await page.locator(".disc-example").count(), 1, "aide déjà demandée conservée");
    const run = (await save(page)).discovery.runs[0];
    assert.equal(run.steps.grammar.challenges.length, 0);
    // pause puis reprise sans perte
    await act(page, "disc-pause").click();
    await page.locator(".disc-teaser").waitFor();
    assert.equal((await save(page)).discovery.runs.length, 1);
    await context.close();
  }

  // ── 4. Lecture : la voix ne lit pas le texte observé ─────────────────────
  {
    const { context, page } = await fresh();
    await page.addInitScript(() => {
      window.__spoken = [];
      window.speechSynthesis?.speak && (window.speechSynthesis.speak = (u) => window.__spoken.push(u.text));
    });
    await page.reload();
    await page.locator(".disc-teaser").waitFor();
    await openHub(page);
    await page.locator('[data-action="disc-open"][data-step="reading"]').click();
    await page.locator(".disc-question").waitFor();
    const q = await currentQuestion(page);
    assert.equal(q.speech, "instruction");
    await act(page, "disc-read").click();
    const spoken = await page.evaluate(() => window.__spoken.join(" | "));
    assert.ok(!spoken.includes(q.passage.slice(0, 15)), "le texte observé n'est pas lu par la consigne vocale");
    await context.close();
  }

  // ── 5. Lisibilité téléphone / tablette / ordinateur ───────────────────────
  for (const [w, h] of [[390, 844], [768, 1024], [1024, 768]]) {
    const { context, page } = await fresh({ width: w, height: h });
    assert.ok(await noOverflow(page), `accueil ${w}px`);
    await openHub(page);
    assert.ok(await noOverflow(page), `hub ${w}px`);
    for (const id of ["numbers", "reading", "grammar", "world"]) {
      await page.locator(`[data-action="disc-open"][data-step="${id}"]`).click();
      await page.locator(".disc-question").waitFor();
      assert.ok(await noOverflow(page), `question ${id} ${w}px`);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll(".disc-question button:not([disabled])")].filter((b) => {
          const r = b.getBoundingClientRect();
          return r.height < 36 && r.width < 36;
        }).length,
      );
      assert.equal(small, 0, `cibles tactiles trop petites ${id} ${w}px`);
      await act(page, "disc-pause").click();
      await page.locator(".disc-teaser").waitFor();
      await openHub(page);
    }
    await context.close();
  }

  // ── 6. Hors ligne : une exploration commencée continue sans réseau ───────
  {
    const { context, page } = await fresh();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.evaluate(() => navigator.serviceWorker.ready);
    await context.setOffline(true);
    await page.reload();
    await page.locator(".disc-teaser").waitFor();
    await openHub(page);
    await drive(page, "reading", ["ok"]);
    assert.ok((await save(page)).discovery.runs[0].steps.reading.challenges.length >= 1);
    await context.setOffline(false);
    await context.close();
  }

  assert.deepEqual(errors, []);
  console.log("Bilan de départ : parcours de réussite, aides/passages, reprise, lecture, 3 tailles d’écran et hors ligne OK.");
} finally {
  await browser.close();
}
