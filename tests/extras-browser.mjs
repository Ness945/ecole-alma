// Défi du jour, rappel de Luna, cadeau de chambre, album, bilan parent, réglages, rappel de sauvegarde.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", acceptDownloads: true }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const home = () => page.locator('header [data-action="home"]').click();
const noOverflow = async (label) => {
  for (const [w, h] of [[768, 1024], [1194, 834], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} ${w}×${h}`);
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
      return exercise(s.session.queue[s.session.index], s.session.questionSeed ?? (s.session.seed + s.session.index * 7919) >>> 0, s.skills[s.session.queue[s.session.index]].level, s.session.index);
    });
    if (q.type === "input") {
      await page.locator("#answer-input").fill(q.answer);
      await page.getByRole("button", { name: "Valider", exact: true }).click();
    } else if (q.type === "choice") await page.locator(".choices").getByRole("button", { name: q.answer, exact: true }).click();
    else throw Error("Type de défi inattendu : " + q.type);
    await page.locator('[data-action="next"]').click();
  }
}
const seed = (extra = "") =>
  page.evaluate(async (extra) => {
    const { fresh, record } = await import("/js/core.js");
    const s = fresh();
    s.skills.multiplication.status = "seen";
    const old = Date.now() - 8 * 86400000;
    for (let i = 0; i < 3; i++) record(s, "multiplication", { correct: true, assisted: false, skip: false, dimension: "production", fingerprint: "n" + i }, old + i);
    s.completed = ["m1", "m2", "m3", "m4"];
    if (extra === "recent") s.settings.lastExport = Date.now();
    localStorage.setItem("academie.save.v2", JSON.stringify(s));
  }, extra);
try {
  await page.goto("http://localhost:4173");
  await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
  assert.equal(await page.locator(".extra-card").count(), 1, "profil neuf : seulement l'album");
  await seed();
  await page.reload();
  assert.equal(await page.locator('[data-action="daily"]').count(), 1);
  assert.equal(await page.locator('[data-action="review"]').count(), 1);
  assert.equal(await page.locator(".backup-note").count(), 1, "rappel de sauvegarde après 4 missions");
  await noOverflow("Accueil enrichi");

  // Rappel de Luna : une notion, réussie il y a longtemps.
  await page.locator('[data-action="review"]').click();
  let s = await state();
  assert.equal(s.session.mode, "review");
  assert.deepEqual(s.session.queue, ["multiplication"]);
  await answerAll();
  s = await state();
  assert.equal(s.completed.length, 5);
  assert.equal(s.newRoomGift && s.rpg.owned.includes(s.newRoomGift), true, "5ᵉ mission : cadeau de chambre");
  await page.getByText("Un cadeau pour ta chambre").waitFor();
  await noOverflow("Fin de mission avec cadeau");
  await page.getByRole("button", { name: "Voir ma chambre" }).click();
  await page.getByRole("heading", { name: "Ma chambre" }).first().waitFor();
  assert.equal((await state()).newRoomGift, undefined, "cadeau annoncé une seule fois");
  assert.equal(await page.locator(".shop-tile").filter({ hasText: "Dans ta collection" }).count(), 1);

  // Défi du jour : trois défis, une fois par jour.
  await home();
  await page.locator('[data-action="daily"]').click();
  assert.equal((await state()).session.queue.length, 3);
  await answerAll();
  s = await state();
  assert.deepEqual(s.daily.done, true);
  assert.equal(s.completed.length, 6);
  await page.getByRole("button", { name: "Retour au menu principal" }).click();
  assert.equal(await page.locator('[data-action="daily"]').count(), 0, "plus de défi aujourd'hui");

  // Album : nouveaux autocollants une fois, puis plus.
  await page.locator('[data-action="album"]').click();
  await page.getByRole("heading", { name: "Mon album d’autocollants" }).waitFor();
  assert.ok((await page.locator(".sticker.got").count()) >= 3);
  assert.ok((await page.locator(".sticker-new").count()) >= 3);
  await noOverflow("Album");
  await home();
  await page.locator('[data-action="album"]').click();
  assert.equal(await page.locator(".sticker-new").count(), 0);
  await home();

  // Rappel de sauvegarde : « Plus tard » le masque ; Exporter enregistre la date.
  await page.getByRole("button", { name: "Plus tard" }).click();
  assert.equal(await page.locator(".backup-note").count(), 0);
  assert.ok((await state()).settings.exportSnooze > 0);

  // Espace parent : bilan, longueur de mission, texte plus grand, voix plus lente, export.
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.getByText("Cette semaine").waitFor();
  assert.ok(await page.locator(".week-bars div").count() === 7);
  await page.locator("#length").selectOption("5");
  await page.locator("#slow").check();
  await page.locator("#textsize").check();
  s = await state();
  assert.equal(s.settings.length, 5);
  assert.equal(s.settings.slow, true);
  assert.equal(s.settings.textSize, "large");
  assert.ok(await page.evaluate(() => document.body.classList.contains("text-large")));
  await noOverflow("Parent, texte plus grand");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exporter la sauvegarde JSON" }).click();
  await download;
  assert.ok((await state()).settings.lastExport > 0);
  await home();
  await noOverflow("Accueil, texte plus grand");
  await page.locator('header [data-action="home"]').click();
  await page.getByRole("button", { name: "Laisser Luna choisir" }).click();
  assert.equal((await state()).session.queue.length, 5, "mission courte");
  await page.reload();
  assert.ok(await page.evaluate(() => document.body.classList.contains("text-large")), "réglage conservé");
  assert.deepEqual(errors, []);
  console.log("Extras : rappel de Luna, cadeau de chambre, défi du jour unique, album, bilan parent, mission courte, texte plus grand, rappel de sauvegarde OK.");
} finally {
  await browser.close();
}
