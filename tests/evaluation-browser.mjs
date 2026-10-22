// Bilan complet, mission « points à renforcer », palier de difficulté figé, rapport parent.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", serviceWorkers: "allow" }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const noOverflow = async (label) => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} : débordement`);
const currentQ = () =>
  page.evaluate(async () => {
    const st = JSON.parse(localStorage.getItem("academie.save.v2")), s = st.session,
      { exercise } = await import("/js/exercises.js");
    return exercise(s.queue[s.index], s.questionSeed, st.skills[s.queue[s.index]].level, s.index, Boolean(s.questionEase), s.questionTier ?? 1);
  });
async function answerRight() {
  const q = await currentQ();
  if (q.type === "input") {
    await page.locator("#answer-input").fill(q.answer);
    await page.getByRole("button", { name: "Valider", exact: true }).click();
  } else if (q.type === "choice") {
    await page.locator(".choices").getByRole("button", { name: q.answer, exact: true }).click();
  } else return false;
  return true;
}
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  await page.evaluate(async () => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.settings.motion = false;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  // Le bilan est proposé depuis la page des missions
  await page.getByRole("button", { name: "Choisir ma mission →", exact: true }).click();
  await page.getByRole("button", { name: "Faire le bilan →" }).click();
  await page.getByRole("heading", { name: /Où en es-tu vraiment/ }).waitFor();
  await noOverflow("bilan");
  const sets = await page.locator('[data-action="bilan-start"]').count();
  assert.ok(sets >= 10, `séries de bilan : ${sets}`);
  await page.locator('[data-action="bilan-start"]').first().click();
  await page.locator(".exercise").waitFor();
  let st = await state();
  assert.equal(st.session.mode, "bilan");
  const n = st.session.queue.length;
  assert.ok(n >= 4 && n <= 8 && new Set(st.session.queue).size === n, "une question par pouvoir");
  // Deux bonnes réponses, le reste « Je ne sais pas »
  for (let i = 0; i < n; i++) {
    st = await state();
    assert.equal(st.session.questionTier, 1, "le bilan reste au palier normal");
    if (i < 2 && (await answerRight())) {
      /* ok */
    } else await page.locator('[data-action="skip"]').click();
    await page.locator('[data-action="next"]').click();
  }
  await page.getByRole("heading", { name: "Série terminée !" }).waitFor();
  assert.ok((await page.locator(".bilan-result li").count()) === n);
  await noOverflow("fin de série");
  st = await state();
  assert.equal(Object.keys(st.assessment).length, n);
  assert.ok(st.history.length === n, "pas de répétition des erreurs pendant le bilan");
  assert.ok(Object.values(st.assessment).some((a) => a.result === "wrong"));
  await page.locator('[data-action="bilan-back"]').click();
  await page.getByRole("heading", { name: /Où en es-tu vraiment/ }).waitFor();
  assert.ok((await page.locator(".bilan-chip.map-low").count()) >= 1, "pouvoirs à découvrir");
  // Mission « points à renforcer »
  await page.locator('[data-action="weak-start"]').first().click();
  await page.locator(".exercise").waitFor();
  st = await state();
  assert.equal(st.session.mode, "weak");
  assert.equal(st.session.queue.length, 6);
  assert.ok(new Set(st.session.queue).size <= 3);
  // Le palier est figé pendant la question (même énoncé après réponse)
  const before = await page.locator("h2").first().innerText();
  await page.locator('[data-action="skip"]').click();
  assert.equal(await page.locator("h2").first().innerText(), before);
  assert.equal((await state()).session.questionTier, 1);
  await page.reload();
  await page.getByRole("button", { name: "Reprendre ma mission →" }).click();
  await page.locator(".exercise").waitFor();
  // Espace parent : rapport, carte, rapidité
  await page.evaluate(() => {});
  await page.goto("http://localhost:4173");
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.locator(".week-report").waitFor();
  for (const t of [/Rapport de la semaine/i, /Trois forces/i, /À renforcer/i, /À faire à la maison/i, /Carte des petits pouvoirs/i])
    assert.ok((await page.locator("body").innerText()).match(t), String(t));
  assert.ok((await page.locator(".map-report .bilan-chip").count()) >= 80, "88 pouvoirs sur la carte");
  await noOverflow("parent");
  // Mobile
  await page.setViewportSize({ width: 390, height: 800 });
  await noOverflow("parent mobile");
  assert.deepEqual(errors, []);
  console.log("evaluation-browser OK");
} finally {
  await browser.close();
}
