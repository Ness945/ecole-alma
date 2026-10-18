import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
import { extraSkills } from "../frontend/js/expansion.js";
const { chromium } = createRequire(import.meta.url)(
  process.argv[2] || "playwright",
);
const browser = await launch(chromium);
const context = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:4173");
  for (const skill of extraSkills) {
    await page.evaluate(async () => {
      const { fresh } = await import("/js/core.js");
      const s = fresh();
      for (const v of Object.values(s.skills)) v.status = "seen";
      localStorage.setItem("academie.save.v2", JSON.stringify(s));
    });
    await page.reload();
    await page
      .getByRole("button", { name: "Choisir ma mission →", exact: true })
      .click();
    await page.locator(`[data-subject="${skill.subject}"]`).click();
    await page.locator(`[data-id="${skill.id}"]`).click();
    await page
      .getByRole("button", { name: "À moi d’essayer →", exact: true })
      .click();
    const q = await page.evaluate(async () => {
      const s = JSON.parse(localStorage.getItem("academie.save.v2"));
      const { exercise } = await import("/js/exercises.js");
      return exercise(
        s.session.queue[0],
        s.session.questionSeed,
        s.skills[s.session.queue[0]].level,
        0,
      );
    });
    if (q.type === "input") {
      await page.locator("#answer-input").fill(q.answer);
      if (skill.id === "clock") {
        await page.reload();
        await page
          .getByRole("button", { name: "Reprendre ma mission →" })
          .click();
        assert.equal(
          await page.locator("#answer-input").inputValue(),
          q.answer,
        );
        await page.locator(".exercise .learning-clock").waitFor();
        await page.screenshot({
          path: "test-results/content-clock.png",
          fullPage: true,
        });
      }
      await page.getByRole("button", { name: "Valider", exact: true }).click();
    } else
      await page
        .locator(".choices")
        .getByRole("button", { name: q.answer, exact: true })
        .click();
    await page.locator('[data-action="next"]').waitFor();
    assert.ok(
      await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("academie.save.v2")).history.at(-1)
            .correct,
      ),
      skill.id,
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      skill.id,
    );
  }
  assert.deepEqual(errors, []);
  console.log(
    "15 nouvelles leçons et réponses, horloge, reprise de saisie, format mobile : OK",
  );
} finally {
  await browser.close();
}
