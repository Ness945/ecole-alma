// Chambre : ouverture, achat, équipement, aperçu, retrait, vidage, formats, hors ligne.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    reducedMotion: "reduce",
    serviceWorkers: "allow",
  }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const noOverflow = async (label) => {
  for (const [w, h] of [[768, 1024], [1024, 768], [1194, 834], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} ${w}×${h}`);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
};
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  await page.evaluate(async () => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.rpg.coins = 200;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="room"]').click();
  await page.getByRole("heading", { name: "Ma chambre" }).first().waitFor();
  assert.ok(await page.locator(".room-stage .room-art").count());
  assert.ok((await page.locator(".shop-group").count()) >= 11);
  assert.ok((await page.locator(".shop-tile").count()) >= 40);
  await noOverflow("Chambre");
  await page.locator('[data-action="rpg-preview"][data-id="bed-princess"]').click();
  assert.equal((await state()).rpg.room?.bed ?? null, null, "aperçu sans effet sur la sauvegarde");
  await page.getByRole("button", { name: /Acheter/ }).click();
  await page.getByRole("button", { name: "✓ Équiper" }).click();
  let s = await state();
  assert.equal(s.rpg.room.bed, "bed-princess");
  assert.equal(s.rpg.coins, 155);
  for (const id of ["wall-stars", "rug-rainbow", "toy-teddy", "plant-cactus"]) {
    await page.locator(`[data-action="rpg-preview"][data-id="${id}"]`).click();
    await page.getByRole("button", { name: /Acheter/ }).click();
    await page.getByRole("button", { name: "✓ Équiper" }).click();
  }
  s = await state();
  assert.equal(s.rpg.room.wall, "wall-stars");
  assert.equal(s.rpg.room.toy, "toy-teddy");
  await page.locator('[data-action="rpg-preview"][data-id="bed-princess"]').click();
  await page.getByRole("button", { name: "Retirer cet objet" }).click();
  assert.equal((await state()).rpg.room.bed, null);
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="room"]').click();
  assert.equal((await state()).rpg.room.rug, "rug-rainbow");
  // Entrée depuis le château et depuis la collection
  await page.locator('header [data-action="home"]').click();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  await page.getByRole("button", { name: "Entrer dans les pièces du château" }).click();
  await page.locator('[data-action="room"]').click();
  await page.getByRole("heading", { name: "Ma chambre" }).first().waitFor();
  await page.getByRole("button", { name: "Vider ma chambre" }).click();
  s = await state();
  assert.ok(Object.values(s.rpg.room).every((v) => v === null));
  assert.ok(s.rpg.owned.includes("wall-stars"), "objets gardés dans la collection");
  // Hors ligne
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="room"]').click();
  await page.getByRole("heading", { name: "Ma chambre" }).first().waitFor();
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  console.log("Chambre : ouverture, aperçu sans effet, achat, équipement, retrait, vidage, objets conservés, quatre formats et hors ligne OK.");
} finally {
  await browser.close();
}
