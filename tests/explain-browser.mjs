// Après une erreur : signalée, expliquée, avec la bonne réponse.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const page = await (await browser.newContext({ viewport: { width: 1100, height: 900 }, reducedMotion: "reduce" })).newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  await page.evaluate(async () => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.skills.addition.status = "seen";
    s.settings.length = 8;
    s.settings.motion = false;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator('[data-action="start"]').first().click();
  await page.locator(".exercise").waitFor();
  const q = await page.evaluate(async () => {
    const st = JSON.parse(localStorage.getItem("academie.save.v2")), s = st.session,
      { exercise } = await import("/js/exercises.js");
    return exercise(s.queue[s.index], s.questionSeed, st.skills[s.queue[s.index]].level, s.index, Boolean(s.questionEase), s.questionTier ?? 1);
  });
  if (q.type === "input") {
    await page.locator("#answer-input").fill("999");
    await page.getByRole("button", { name: "Valider", exact: true }).click();
  } else {
    await page.locator(".choices").getByRole("button", { name: q.options.find((o) => o !== q.answer), exact: true }).click();
  }
  const lines = (await page.locator(".feedback").innerText()).split("\n").map((l) => l.trim());
  const text = lines.join(" ");
  assert.match(text, /Ce n’est pas tout à fait ça/);
  assert.match(text, /Il fallait répondre : /);
  assert.ok(text.includes(q.answer), "bonne réponse affichée");
  assert.match(text, /Additionner, c’est réunir/);
  assert.ok(await page.locator(".feedback br").count() >= 2, "lignes séparées");
  assert.deepEqual(errors, []);
  console.log("explain-browser OK");
} finally {
  await browser.close();
}
