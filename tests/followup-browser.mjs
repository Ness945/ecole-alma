// Adaptation après échecs (exemple plus facile, indice en deux temps) et suivi parent détaillé.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce", serviceWorkers: "allow" }),
  page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
const noOverflow = async (label) => {
  for (const [w, h] of [[768, 1024], [1194, 834], [390, 844], [1280, 900]]) {
    await page.setViewportSize({ width: w, height: h });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${label} ${w}×${h}`);
  }
};
const question = () =>
  page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem("academie.save.v2")).session,
      st = JSON.parse(localStorage.getItem("academie.save.v2")),
      { exercise } = await import("/js/exercises.js"),
      id = s.queue[s.index];
    return exercise(id, s.questionSeed, st.skills[id].level, s.index, Boolean(s.questionEase), s.questionTier ?? 1);
  });
async function reply(correct) {
  const q = await question();
  if (q.type === "input") {
    await page.locator("#answer-input").fill(correct ? q.answer : "999");
    await page.getByRole("button", { name: "Valider", exact: true }).click();
  } else if (q.type === "choice") {
    const wrong = q.options.find((o) => o !== q.answer);
    await page.locator(".choices").getByRole("button", { name: correct ? q.answer : wrong, exact: true }).click();
  } else throw Error("Type inattendu " + q.type);
  return q;
}
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
  // Indice en deux temps
  await page.getByRole("button", { name: "💡 Un indice" }).click();
  const first = await page.locator(".feedback").innerText();
  await page.getByRole("button", { name: "💡 Encore un indice" }).click();
  const second = await page.locator(".feedback").innerText();
  assert.notEqual(first, second, "deux indices différents");
  assert.match(first, /encore/i);
  // Deux échecs → exemple facilité
  await reply(false);
  await page.locator('[data-action="next"]').click();
  assert.equal(await page.locator(".ease-note").count(), 0, "un seul échec : pas encore de facilitation");
  await reply(false);
  await page.locator('[data-action="next"]').click();
  await page.locator(".ease-note").waitFor();
  const q3 = await question();
  assert.ok(q3.eased, "exemple facilité");
  const nums = q3.prompt.match(/\d+/g).map(Number);
  assert.ok(nums[0] <= 4 && nums[1] <= 3, q3.prompt);
  assert.ok(await page.locator(".visual").count(), "matériel visible");
  await reply(true);
  await page.locator('[data-action="next"]').click();
  assert.equal(await page.locator(".ease-note").count(), 0, "réussite : retour à la difficulté normale");
  // Termine la mission en répondant juste
  for (let i = 0; i < 20 && (await page.locator(".exercise").count()); i++) {
    await reply(true);
    await page.locator('[data-action="next"]').click();
  }
  const s = await state();
  const h = s.history;
  assert.ok(h.length >= 8);
  assert.equal(h[0].hints, 2);
  assert.equal(h[0].prompt.length > 0, true);
  assert.equal(h[1].answer.length > 0, true);
  assert.ok(h.every((e) => e.mission === h[0].mission && Number.isInteger(e.pos)));
  assert.ok(h.some((e) => Number.isFinite(e.ms)), "durée mesurée");
  assert.ok(h.some((e) => e.ease === true));
  assert.equal(s.skills.addition.evidence.every((e) => e.prompt === undefined), true, "détails hors des preuves");
  // Espace parent
  await page.goto("http://localhost:4173");
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.locator(".follow-report").waitFor();
  for (const t of ["À faire ensemble cette semaine", "Évolution par notion", "Erreurs qui reviennent", "Temps et concentration", "Dernières missions"])
    assert.ok(await page.getByRole("heading", { name: new RegExp(t) }).count(), t);
  assert.ok((await page.locator(".follow-card").count()) || /Rien d'urgent/.test(await page.locator(".follow-report").innerText()), "idée ou « rien d'urgent »");
  await page.locator(".follow-mission summary").first().click();
  assert.ok((await page.locator(".follow-mission[open] li").count()) >= 8, "détail de chaque défi");
  assert.match(await page.locator(".follow-mission[open]").innerText(), /999/);
  // Impression : détails dépliés avant impression
  await page.evaluate(() => {
    window.__printed = 0;
    window.print = () => window.__printed++;
    document.querySelectorAll(".follow-mission").forEach((d) => (d.open = false));
  });
  await page.getByRole("button", { name: /Imprimer/ }).click();
  assert.equal(await page.evaluate(() => window.__printed), 1);
  assert.equal(await page.locator(".follow-mission:not([open])").count(), 0);
  await noOverflow("Suivi parent");
  // Hors ligne
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.locator(".follow-report").waitFor();
  await context.setOffline(false);
  assert.deepEqual(errors, []);
  console.log("Suivi : indice en deux temps, exemple facilité après deux échecs, détails conservés, page parent (idées, tendances, erreurs, temps, missions), impression, formats et hors ligne OK.");
} finally {
  await browser.close();
}
