// Grand Livre, choix libre de la mission, jardin extensible, compagnons : parcours réel
// dans un profil de navigateur isolé (jamais celui de l'utilisateur).
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
const home = () => page.locator('header [data-action="home"]').click();
const noOverflow = async (label) => {
  for (const [w, h] of [
    [768, 1024],
    [1024, 768],
    [1194, 834],
    [390, 844],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `${label} : débordement ${w}×${h}`,
    );
  }
  await page.setViewportSize({ width: 1280, height: 900 });
};
async function answerAll() {
  let n = 0;
  while (await page.locator(".exercise").count()) {
    if (++n > 20) throw Error("Mission bloquée");
    const q = await page.evaluate(async () => {
      const s = JSON.parse(localStorage.getItem("academie.save.v2"));
      const { exercise } = await import("/js/exercises.js");
      return exercise(
        s.session.queue[s.session.index],
        s.session.questionSeed ?? (s.session.seed + s.session.index * 7919) >>> 0,
        s.skills[s.session.queue[s.session.index]].level,
        s.session.index,
      );
    });
    if (q.type === "input") {
      await page.locator("#answer-input").fill(q.answer);
      await page.getByRole("button", { name: "Valider", exact: true }).click();
    } else if (q.type === "choice")
      await page
        .locator(".choices")
        .getByRole("button", { name: q.answer, exact: true })
        .click();
    else throw Error("Type de défi inattendu : " + q.type);
    await page.locator('[data-action="next"]').click();
  }
}
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  // Départ : le pont est le début du Grand Livre, mais le livre s'ouvre déjà.
  await page.getByRole("button", { name: "Ouvrir le Grand Livre", exact: true }).click();
  await page.getByRole("heading", { name: "0 chapitre sur 100" }).waitFor();
  assert.equal(await page.locator('[data-action="book-select"]').count(), 5);
  await noOverflow("Livre");

  // Alma n'a jamais vu la multiplication : elle la choisit directement.
  await page.locator('[data-action="book-select"][data-book="3"]').click();
  await page.locator('[data-action="chapter-open"][data-n="44"]').click();
  await page.getByRole("heading", { name: "Les paniers du dragon", level: 2 }).waitFor();
  assert.equal((await state())?.skills.multiplication.status ?? "unknown", "unknown");
  await noOverflow("Chapitre");
  await page.getByRole("button", { name: "Partir en chapitre →" }).click();
  let s = await state();
  assert.equal(s.skills.multiplication.status, "seen");
  assert.equal(s.session.chapter, 44);
  assert.equal(s.session.queue.length, 6);
  // Reprise après rechargement
  await page.reload();
  await page.getByRole("button", { name: "Reprendre ma mission →" }).click();
  await page.locator(".adventure-ribbon").getByText("Chapitre 44").waitFor();
  await answerAll();
  await page.getByRole("heading", { name: "Chapitre 44 terminé !" }).waitFor();
  s = await state();
  assert.ok(s.completed.some((id) => id.startsWith("story:44:")));
  assert.equal(s.rpg.coins, 10);
  await noOverflow("Fin de chapitre");
  assert.equal(await page.getByRole("button", { name: "Retour au menu principal" }).count(), 1);
  await page.getByRole("button", { name: "Retour au menu principal" }).click();
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  assert.equal((await state()).session, null);
  await page.getByRole("button", { name: "Ouvrir le Grand Livre", exact: true }).click();
  await page.getByRole("heading", { name: "1 chapitre sur 100" }).waitFor();
  assert.equal(await page.locator('[data-chapter="44"]').count(), 0, "chapitre terminé : plus proposé");
  await page.locator('[data-action="book-select"][data-book="3"]').click();
  assert.equal(await page.locator('[data-chapter="44"]').count(), 0);
  assert.equal(await page.locator('[data-chapter="41"]').count(), 1);
  await page.reload();
  await page.getByRole("button", { name: "Ouvrir le Grand Livre", exact: true }).click();
  await page.getByRole("heading", { name: "1 chapitre sur 100" }).waitFor();
  assert.match(await page.locator(".book-journal summary").textContent(), /1 chapitre terminé/);

  // Entraînement après une leçon : choix libre depuis le catalogue.
  await home();
  await page.getByRole("button", { name: "Choisir ma mission →", exact: true }).click();
  await page.locator('[data-id="multiplication"]').click();
  await page.getByRole("button", { name: "S’entraîner davantage →" }).click();
  s = await state();
  assert.equal(s.session.queue.length, 6);
  assert.ok(s.session.queue.every((x) => x === "multiplication"));
  await answerAll();
  await page.getByRole("button", { name: "Encore des défis sur ce thème" }).waitFor();
  await page.getByRole("button", { name: "Encore des défis sur ce thème" }).click();
  assert.equal((await state()).session.queue.length, 6);

  // Économie : pièces, jardin extensible, plantes améliorables, compagnons.
  await page.evaluate(() => {
    const x = JSON.parse(localStorage.getItem("academie.save.v2"));
    x.session = null;
    x.rpg.coins = 300;
    x.seeds = 0;
    localStorage.setItem("academie.save.v2", JSON.stringify(x));
  });
  await page.reload();
  await page.locator('.rpg-world [data-action="garden"]').click();
  assert.equal(await page.locator(".plots button").count(), 8);
  await page.locator('[data-action="garden-expand"]').click();
  assert.equal(await page.locator(".plots button").count(), 12);
  await page.locator('[data-action="pick"][data-id="sunflower"]').click();
  await page.locator('[data-action="plant"][data-slot="11"]').click();
  await page.locator('[data-action="plot-select"][data-slot="11"]').click();
  await page.locator('[data-action="plant-upgrade"]').click();
  await page.locator('[data-action="plant-upgrade"]').click();
  assert.equal(await page.locator('[data-action="plant-upgrade"]').count(), 0, "niveau maximal");
  s = await state();
  assert.equal(s.garden.length, 12);
  assert.equal(s.garden[11], "sunflower");
  assert.equal(s.gardenLevels[11], 2);
  assert.equal(s.rpg.coins, 300 - 15 - 6 - 10 - 20);
  await noOverflow("Jardin");
  await page.locator('[data-action="garden-expand"]').click();
  await page.locator('[data-action="garden-expand"]').click();
  await page.locator('[data-action="garden-expand"]').click();
  assert.equal(await page.locator(".plots button").count(), 24);
  assert.equal(await page.locator('[data-action="garden-expand"]').count(), 0);
  await noOverflow("Grand jardin");

  await home();
  await page.locator('.rpg-shortcuts [data-action="avatar"]').click();
  await page.locator('[data-action="rpg-preview"][data-id="owl"]').click();
  await page.getByRole("button", { name: /Adopter/ }).click();
  s = await state();
  assert.equal(s.pet, "owl");
  assert.ok(s.inventory.includes("owl"));
  await noOverflow("Compagnons");
  await home();
  assert.ok(await page.locator(".hero-girl .girl-avatar").count());
  await page.locator('.rpg-shortcuts [data-action="castle"]').click();
  await page.locator('[data-action="rpg-preview"][data-id="sky-rainbow"]').click();
  await page.getByRole("button", { name: /Acheter/ }).click();
  await page.getByRole("button", { name: "✓ Équiper" }).click();
  assert.equal((await state()).rpg.castle.sky, "sky-rainbow");

  // Hors ligne : le livre s'ouvre toujours.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Ouvrir le Grand Livre", exact: true }).click();
  await page.getByRole("heading", { name: "1 chapitre sur 100" }).waitFor();
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  console.log("Grand Livre : chapitre libre sans prérequis, reprise, chapitre terminé masqué, entraînement, jardin 8→24, plantes améliorées, compagnon, château et hors ligne OK.");
} finally {
  await browser.close();
}
