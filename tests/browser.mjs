// Usage: node tests/browser.mjs <chemin-du-module-playwright>
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url);
const { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:4173");
  await page
    .getByRole("heading", { name: /Bienvenue dans ton royaume/ })
    .waitFor();
  await mkdir("test-results", { recursive: true });
  await page.screenshot({ path: "test-results/royaume.png", fullPage: true });
  for (const [w, h] of [
    [768, 1024],
    [800, 1280],
    [834, 1194],
    [1024, 1366],
    [1024, 768],
    [1280, 800],
    [1194, 834],
    [1366, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Débordement ${w}×${h}`,
    );
  }
  await page.getByRole("button", { name: "Laisser Luna choisir", exact: true }).click();
  await page.locator('[data-id="number"]').click();
  await page.getByRole("button", { name: "À moi d’essayer →" }).click();
  for (const [w, h] of [
    [768, 1024],
    [800, 1280],
    [834, 1194],
    [1024, 1366],
    [1024, 768],
    [1280, 800],
    [1194, 834],
    [1366, 1024],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Exercice : débordement ${w}×${h}`,
    );
  }
  await page.locator('[data-part="tens"][data-step="1"]').click();
  await page.reload();
  await page.getByRole("button", { name: "Reprendre ma mission →" }).click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("academie.save.v2")).session.draft,
    ),
    "1,0",
  );
  let n = 0;
  while (await page.locator(".exercise").count()) {
    if (++n > 20) throw Error("Mission bloquée");
    const q = await page.evaluate(async () => {
      const s = JSON.parse(localStorage.getItem("academie.save.v2"));
      const { exercise } = await import("/js/exercises.js");
      return exercise(
        s.session.queue[s.session.index],
        s.session.questionSeed ??
          (s.session.seed + s.session.index * 7919) >>> 0,
        s.skills[s.session.queue[s.session.index]].level,
        s.session.index,
        false,
        s.session.questionTier ?? 1,
      );
    });
    if (q.type === "blocks") {
      const current = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("academie.save.v2")).session.draft,
      );
      const [t = 0, u = 0] = current.split(",").map(Number);
      for (const [part, delta] of [
        ["tens", Math.floor(Number(q.answer) / 10) - t],
        ["units", (Number(q.answer) % 10) - u],
      ])
        for (let k = 0; k < Math.abs(delta); k++)
          await page
            .locator(`[data-part="${part}"][data-step="${Math.sign(delta)}"]`)
            .click();
      await page.getByRole("button", { name: "Valider", exact: true }).click();
    } else if (q.type === "input") {
      await page.locator("#answer-input").fill(q.answer);
      await page.getByRole("button", { name: "Valider", exact: true }).click();
    } else if (q.type === "choice")
      await page
        .locator(".choices")
        .getByRole("button", { name: q.answer, exact: true })
        .click();
    await page.locator('[data-action="next"]').click();
  }
  await page.getByRole("heading", { name: "Ton royaume a grandi." }).waitFor();
  let s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("academie.save.v2")),
  );
  assert.equal(s.seeds, 2);
  assert.equal(s.completed.length, 1);
  await page.reload();
  await page.getByRole("button", { name: "Reprendre ma mission →" }).click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("academie.save.v2")).seeds,
    ),
    2,
  );
  await page.getByRole("button", { name: "Planter mes graines", exact: true }).click();
  await page.locator('[data-slot="0"]').click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("academie.save.v2")),
  );
  assert.equal(s.garden[0], "flower");
  assert.equal(s.seeds, 1);
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.locator('[data-status="noun"]').selectOption("seen");
  await page.locator("#profile-name").fill("Alma");
  await page.reload();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("academie.save.v2")).name,
    ),
    "Alma",
  );
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("heading", { name: /Bienvenue dans ton royaume/ })
    .waitFor();
  await page.getByRole("button", { name: "Laisser Luna choisir", exact: true }).click();
  await page.locator(".exercise").waitFor();
  await page
    .getByRole("button", { name: "🤷 Je ne sais pas", exact: true })
    .click();
  assert.ok(
    (await page.locator(".feedback").textContent()).includes("Il fallait répondre"),
  );
  await page.locator('[data-action="next"]').click();
  s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("academie.save.v2")),
  );
  assert.equal(s.history.at(-1).skip, true);
  assert.equal(s.history.at(-1).assisted, true);
  assert.deepEqual(errors, []);
  console.log(
    "Navigateur : mission, reprise, récompense unique, jardin, parent, 9 viewports, hors ligne OK.",
  );
} finally {
  await browser.close();
}
