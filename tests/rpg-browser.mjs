import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
import { mkdir } from "node:fs/promises";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({
    viewport: { width: 1366, height: 1024 },
    reducedMotion: "reduce",
  }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const home = () => page.locator('header [data-action="home"]').click();
async function fit() {
  for (const [width, height] of [
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
    await page.setViewportSize({ width, height });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow ${width}×${height}`,
    );
  }
  await page.setViewportSize({ width: 1366, height: 1024 });
}
try {
  await page.goto("http://localhost:4173");
  await page
    .getByRole("heading", { name: /Bienvenue dans ton royaume/ })
    .waitFor();
  await fit();
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/rpg-royaume.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: "Choisir ma mission →", exact: true })
    .click();
  await page.locator('[data-id="multiplication"]').click();
  await page
    .getByRole("heading", { name: "Préparons cette aventure ensemble." })
    .waitFor();
  // Genuine v1 fixture in an isolated browser profile, never the user's browser.
  await page.evaluate(async () => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.version = 1;
    delete s.rpg;
    delete s.skills.multiplication;
    s.stars = 100;
    s.name = "Alma";
    s.skills.determiner.status = "seen";
    localStorage.setItem("academie.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Choisir ma mission →", exact: true })
    .click();
  await page.locator('[data-subject="Français"]').click();
  await page.locator('[data-id="determiner"]').click();
  await page.locator('[data-action="lesson-token"][data-word="le"]').click();
  assert.equal(
    await page.locator(".grammar-words .revealed").textContent(),
    "le",
  );
  await page
    .getByRole("button", { name: "À moi d’essayer →", exact: true })
    .click();
  assert.equal((await state()).version, 2);
  assert.ok((await state()).session.queue.every((x) => x === "determiner"));
  await home();
  await page
    .getByRole("button", { name: "Choisir ma mission →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ranger cette mission", exact: true })
    .click();
  assert.equal((await state()).session, null);
  // Mark the prerequisite through the parent-visible status route for this fixture.
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("academie.save.v2"));
    s.skills.multiplication.status = "seen";
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  await page
    .getByRole("button", { name: "Choisir ma mission →", exact: true })
    .click();
  await page.locator('[data-id="multiplication"]').click();
  await page
    .getByRole("button", { name: "Ajouter un panier de 2 pommes", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Ajouter un panier de 2 pommes", exact: true })
    .click();
  assert.ok(
    (await page.locator(".math-formula").textContent()).includes(
      "2 + 2 + 2 = 6",
    ),
  );
  await fit();
  await page.screenshot({
    path: "test-results/rpg-lecon.png",
    fullPage: true,
    animations: "disabled",
  });
  await home();
  await page.locator('.rpg-shortcuts [data-action="avatar"]').click();
  await page
    .locator('[data-action="rpg-preview"][data-id="head-crown"]')
    .click();
  assert.equal((await state()).rpg.coins, 100);
  assert.equal((await state()).rpg.equipped.head, null);
  await page.locator('[data-action="rpg-buy"]').click();
  assert.equal((await state()).rpg.coins, 82);
  await page.getByRole("button", { name: "✓ Équiper", exact: true }).click();
  assert.equal((await state()).rpg.equipped.head, "head-crown");
  await page.locator('[data-part="skin"][data-index="2"]').click();
  await fit();
  await page.screenshot({
    path: "test-results/rpg-avatar.png",
    fullPage: true,
    animations: "disabled",
  });
  await home();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  for (const id of ["roof-rose", "castle-fountain", "castle-flags"]) {
    await page.locator(`[data-action="rpg-preview"][data-id="${id}"]`).click();
    await page.locator('[data-action="rpg-buy"]').click();
    await page.getByRole("button", { name: "✓ Équiper", exact: true }).click();
  }
  assert.equal((await state()).rpg.coins, 18);
  await fit();
  await page.screenshot({
    path: "test-results/rpg-chateau.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .locator('[data-action="rpg-preview"][data-id="castle-garden"]')
    .click();
  assert.equal(
    await page.locator('[data-action="rpg-buy"]').isDisabled(),
    true,
  );
  assert.equal((await state()).rpg.coins, 18);
  await page.reload();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("heading", { name: /Bienvenue dans ton royaume/ })
    .waitFor();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  assert.equal((await state()).rpg.castle.roof, "roof-rose");
  assert.equal((await state()).rpg.equipped.head, "head-crown");
  assert.equal((await state()).rpg.look.skin, 2);
  assert.deepEqual(errors, []);
  console.log(
    "RPG : migration v1, matières, leçons interactives, mission ciblée, aperçu, achat, équipement, château, neuf formats et hors ligne OK.",
  );
} finally {
  await browser.close();
}
