// Château animé et personnalisable : moments de la journée, achats, aperçu, animations coupées, formats, hors ligne.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "allow" }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const noOverflow = async (label) => {
  for (const [w, h] of [[768, 1024], [1024, 768], [1194, 834], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} ${w}×${h}`);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
};
const seed = (motion) =>
  page.evaluate(async (motion) => {
    const { fresh } = await import("/js/core.js");
    const s = fresh();
    s.rpg.coins = 600;
    s.settings.motion = motion;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  }, motion);
const buy = async (id) => {
  await page.locator(`[data-action="rpg-preview"][data-id="${id}"]`).click();
  await page.getByRole("button", { name: /Acheter/ }).click();
  await page.getByRole("button", { name: "✓ Équiper" }).click();
};
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  await seed(true);
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  await page.getByRole("heading", { name: "Mon château" }).first().waitFor();
  assert.ok((await page.locator(".shop-group").count()) >= 15, "au moins 15 catégories");
  assert.ok((await page.locator(".shop-tile").count()) >= 50);
  // Château 3D : le canvas WebGL est affiché, non vide, et se fait tourner au doigt
  await page.waitForSelector(".castle3d.ready > canvas.castle3d-canvas");
  const pic = await page.locator(".castle3d-canvas").screenshot();
  assert.ok(pic.length > 20000, "la 3D n'est pas vide");
  const yaw0 = await page.evaluate(async () => (await import("/js/castle-3d.js")).castle3dDebug().yaw);
  const box3d = await page.locator(".castle3d-canvas").boundingBox();
  await page.mouse.move(box3d.x + box3d.width / 2, box3d.y + box3d.height / 2);
  await page.mouse.down();
  await page.mouse.move(box3d.x + box3d.width / 2 + 120, box3d.y + box3d.height / 2, { steps: 5 });
  await page.mouse.up();
  assert.notEqual(await page.evaluate(async () => (await import("/js/castle-3d.js")).castle3dDebug().yaw), yaw0, "rotation au glissement");
  // Moments de la journée
  assert.equal(await page.locator(".time-picker button").count(), 4);
  for (const [t, label] of [["night", "🌙 Nuit"], ["dusk", "🌇 Soir"], ["day", "☀️ Jour"]]) {
    await page.getByRole("button", { name: label }).click();
    assert.ok(await page.locator(`.castle-stage svg.castle-${t}`).count(), t);
    assert.ok(await page.locator(`.castle-stage .castle3d.ready[data-phase="${t}"]`).count(), "3D " + t);
  }
  // Aperçu libre puis achats
  await page.locator('[data-action="rpg-preview"][data-id="walls-rose"]').click();
  assert.equal((await state()).rpg.castle.walls ?? null, null, "aperçu sans effet");
  for (const id of ["walls-rose", "towers-onion", "door-gold", "flags-stars", "creature-dragon", "weather-snow", "lights-torches", "moat-water", "path-gold"]) await buy(id);
  const s = await state();
  assert.equal(s.rpg.castle.towers, "towers-onion");
  assert.equal(s.rpg.castle.weather, "weather-snow");
  assert.ok(s.rpg.coins < 600 - 150);
  // Les animations tournent quand « Animations douces » est actif…
  const anim = (sel) => page.locator(sel).first().evaluate((e) => getComputedStyle(e).animationName);
  assert.notEqual(await anim(".castle-stage .c-flag"), "none");
  assert.notEqual(await anim(".castle-stage .c-snow"), "none");
  assert.ok(await page.locator(".castle-stage .c-creature").count());
  await noOverflow("Château personnalisé");
  // …et s'arrêtent quand il est coupé.
  await page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem("academie.save.v2"));
    s.settings.motion = false;
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  });
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  assert.equal(await anim(".castle-stage .c-flag"), "none");
  assert.equal(await anim(".castle-stage .c-snow"), "none");
  await page.waitForSelector(".castle3d.ready");
  assert.equal(await page.evaluate(async () => (await import("/js/castle-3d.js")).castle3dDebug().running), false, "3D immobile sans animations douces");
  // Retour au château de départ : tous les emplacements vidés, objets gardés
  await page.getByRole("button", { name: "Revenir au château de départ" }).click();
  const r = await state();
  assert.ok(Object.values(r.rpg.castle).every((v) => v === null));
  assert.ok(r.rpg.owned.includes("creature-dragon"));
  // Accueil : le château animé s'y affiche aussi, sans débordement
  await page.locator('header [data-action="home"]').click();
  assert.ok(await page.locator(".rpg-world svg.castle-art").count());
  await page.waitForSelector(".rpg-world .castle3d.ready");
  await noOverflow("Accueil");
  // Hors ligne
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  await page.getByRole("heading", { name: "Mon château" }).first().waitFor();
  await page.waitForSelector(".castle3d.ready");
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  console.log("Château 3D (rotation, jour/soir/nuit), 4 moments, aperçu libre, 9 achats sur 9 emplacements, animations actives puis coupées, retour au départ, formats et hors ligne OK.");
} finally {
  await browser.close();
}
