import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 1024, height: 768 },
  }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto("http://localhost:4173");
  await page
    .getByRole("button", { name: "Partir avec Luna →", exact: true })
    .click();
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/pont-depart.png",
    fullPage: true,
    animations: "disabled",
  });
  for (let stage = 0; stage < 3; stage++) {
    await page
      .getByRole("button", { name: "Essayer avec Luna →", exact: true })
      .click();
    if (stage === 0) {
      await page
        .getByRole("button", { name: "Regrouper dix cubes", exact: true })
        .click();
      await page.reload();
      await page
        .getByRole("button", { name: "Reprendre ma mission →", exact: true })
        .click();
      assert.equal(
        await page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("academie.save.v2")).session.draft,
        ),
        "1,3",
      );
    }
    let guard = 0;
    while (await page.locator(".exercise").count()) {
      if (++guard > 16) throw Error("Mission non terminée");
      const q = await page.evaluate(async () => {
        const { adventureExercise } = await import("/js/adventure.js");
        return adventureExercise(
          JSON.parse(localStorage.getItem("academie.save.v2")).session,
        );
      });
      if (q.type === "exchange") {
        await page
          .getByRole("button", { name: "Valider mon rangement", exact: true })
          .click();
      } else if (q.type === "blocks") {
        for (const [part, n] of [
          ["tens", Math.floor(Number(q.answer) / 10)],
          ["units", Number(q.answer) % 10],
        ])
          for (let i = 0; i < n; i++)
            await page.locator(`[data-part="${part}"][data-step="1"]`).click();
        await page
          .getByRole("button", { name: "Valider", exact: true })
          .click();
      } else if (q.type === "sortword") {
        await page
          .locator('[data-action="sort-select"]')
          .filter({ hasText: q.answer })
          .click();
        if (stage === 1 && guard === 1) {
          await page.setViewportSize({ width: 768, height: 1024 });
          await page.reload();
          await page
            .getByRole("button", {
              name: "Reprendre ma mission →",
              exact: true,
            })
            .click();
          assert.equal(
            await page.locator(".sorting .selected").textContent(),
            q.answer,
          );
        }
        await page.locator('[data-action="sort-place"]').click();
      } else if (q.type === "choice")
        await page
          .locator(".choices")
          .getByRole("button", { name: q.answer, exact: true })
          .click();
      else {
        await page.locator("#answer-input").fill(q.answer);
        await page
          .getByRole("button", { name: "Valider", exact: true })
          .click();
      }
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      );
      await page.locator('[data-action="next"]').click();
    }
    assert.equal(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("academie.save.v2")).seeds,
      ),
      (stage + 1) * 2,
    );
    await page.locator('[data-action="bridge-finish"]').click();
  }
  await page
    .getByRole("heading", { name: "La clairière des histoires", exact: true })
    .waitFor();
  await page.screenshot({
    path: "test-results/clairiere.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Retour au royaume", exact: true })
    .first()
    .click();
  assert.equal(
    await page.locator("[data-bridge-count]").getAttribute("data-bridge-count"),
    "3",
  );
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Traverser le pont →", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "La clairière des histoires", exact: true })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "Pont : 3 étapes, manipulations, reprise, rotation, récompenses, clairière et accès hors ligne OK.",
  );
} finally {
  await browser.close();
}
