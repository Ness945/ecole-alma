// Saisons / calendrier : une faute d'orthographe proche est acceptée et la bonne écriture est montrée.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const page = await (await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: "reduce" })).newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  await page.evaluate(async () => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.skills.seasons.status = "seen";
    s.settings.length = 8;
    s.settings.motion = false;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator('[data-action="start"]').first().click();
  await page.locator(".exercise").waitFor();
  let near = false;
  for (let i = 0; i < 14 && !near && (await page.locator(".exercise").count()); i++) {
    if (await page.locator("#answer-input").count()) {
      const q = await page.evaluate(async () => {
        const st = JSON.parse(localStorage.getItem("academie.save.v2")), s = st.session,
          { exercise } = await import("/js/exercises.js");
        return exercise(s.queue[s.index], s.questionSeed, st.skills[s.queue[s.index]].level, s.index, Boolean(s.questionEase), s.questionTier ?? 1);
      });
      // Mot proche : on retire une lettre au milieu
      if (q.answer.length < 5) {
        await page.locator("#answer-input").fill(q.answer);
        await page.getByRole("button", { name: "Valider", exact: true }).click();
        await page.locator('[data-action="next"]').click();
        continue;
      }
      const typo = q.answer.slice(0, 2) + q.answer.slice(3);
      await page.locator("#answer-input").fill(typo);
      await page.getByRole("button", { name: "Valider", exact: true }).click();
      const fb = await page.locator(".feedback").innerText();
      assert.match(fb, /Bien vu/);
      assert.ok(fb.includes(q.answer), "la bonne écriture est montrée : " + fb);
      const h = (await state()).history.at(-1);
      assert.equal(h.correct, true);
      assert.equal(h.answer, typo);
      near = true;
    } else {
      const q = await page.evaluate(async () => {
        const st = JSON.parse(localStorage.getItem("academie.save.v2")), s = st.session,
          { exercise } = await import("/js/exercises.js");
        return exercise(s.queue[s.index], s.questionSeed, st.skills[s.queue[s.index]].level, s.index, Boolean(s.questionEase), s.questionTier ?? 1);
      });
      await page.locator(".choices").getByRole("button", { name: q.answer, exact: true }).click();
      await page.locator('[data-action="next"]').click();
    }
  }
  assert.ok(near, "une question à écrire a été rencontrée");
  assert.deepEqual(errors, []);
  console.log("words-browser OK");
} finally {
  await browser.close();
}
