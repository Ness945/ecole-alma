// Synchronisation chiffrée entre deux « appareils » (deux profils) avec un faux service local.
import { createRequire } from "node:module";
import http from "node:http";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
import worker from "../worker/sync-worker.js";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const store = new Map(),
  env = { SYNC: { get: async (k) => store.get(k) ?? null, put: async (k, v) => void store.set(k, v) } };
const srv = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const r = await worker.fetch(new Request("http://x" + req.url, { method: req.method, body: ["GET", "OPTIONS"].includes(req.method) ? undefined : Buffer.concat(chunks) }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers));
  res.end(Buffer.from(await r.arrayBuffer()));
}).listen(4180);
const browser = await launch(chromium);
const errors = [];
const device = async () => {
  const ctx = await browser.newContext({ viewport: { width: 1000, height: 900 }, reducedMotion: "reduce" }),
    page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:4173");
  return page;
};
const openParent = async (page) => {
  await page.getByRole("button", { name: "⚙ Espace parent" }).click();
  await page.locator("#gate").fill("56");
  await page.getByRole("button", { name: "Ouvrir", exact: true }).click();
  await page.getByRole("heading", { name: "Synchronisation chiffrée" }).waitFor();
};
try {
  const a = await device();
  await openParent(a);
  await a.locator("#sync-url").fill("http://localhost:4180/");
  await a.getByRole("button", { name: "Créer un code" }).click();
  const code = await a.locator("#sync-code").inputValue();
  assert.match(code, /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/);
  await a.getByRole("button", { name: "Activer", exact: true }).click();
  await a.getByText(/Synchronisé à/).waitFor({ timeout: 15000 });
  assert.equal(store.size, 1);
  assert.ok(!JSON.stringify([...store.values()]).includes("Aventurière"), "serveur : chiffré uniquement");
  // L'appareil A change un réglage (donc une vraie sauvegarde) puis pousse.
  await a.locator("#length").selectOption("12");
  await a.getByRole("button", { name: "Synchroniser maintenant" }).click();
  await a.getByText(/Synchronisé à/).waitFor({ timeout: 15000 });
  // L'appareil B se connecte avec le même code et récupère la progression.
  const b = await device();
  await openParent(b);
  await b.locator("#sync-url").fill("http://localhost:4180");
  await b.locator("#sync-code").fill(code.toLowerCase().replaceAll("-", " "));
  await b.getByRole("button", { name: "Activer", exact: true }).click();
  await b.getByText(/Synchronisé à/).waitFor({ timeout: 15000 });
  const sb = await b.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
  assert.equal(sb.settings.length, 12);
  // Adresse sans « https:// » : complétée automatiquement.
  await b.getByRole("button", { name: "Désactiver sur cet appareil" }).click();
  await b.locator("#sync-url").fill("localhost:1");
  await b.locator("#sync-code").fill(code);
  await b.getByRole("button", { name: "Activer", exact: true }).click();
  assert.equal(await b.evaluate(() => JSON.parse(localStorage.getItem("academie.sync.v1")).url), "https://localhost:1");
  await b.getByText(/injoignable|indisponible|Erreur|Failed/i).first().waitFor({ timeout: 20000 });
  await b.getByRole("button", { name: "Désactiver sur cet appareil" }).click();
  await b.locator("#sync-url").fill("http://localhost:4180");
  await b.locator("#sync-code").fill(code);
  await b.getByRole("button", { name: "Activer", exact: true }).click();
  await b.getByRole("button", { name: "Synchroniser maintenant" }).click();
  await b.getByText(/Synchronisé à/).waitFor({ timeout: 15000 }).catch(async (e) => {
    console.log("CFG:", await b.evaluate(() => localStorage.getItem("academie.sync.v1")));
    throw e;
  });
  // Hors ligne : l'app reste utilisable, aucun plantage.
  await b.context().setOffline(true);
  await b.getByRole("button", { name: "Synchroniser maintenant" }).click();
  await b.getByRole("heading", { name: "Synchronisation chiffrée" }).waitFor();
  // Désactivation locale
  await b.context().setOffline(false);
  await b.getByRole("button", { name: "Désactiver sur cet appareil" }).click();
  assert.equal(await b.evaluate(() => localStorage.getItem("academie.sync.v1")), null);
  assert.deepEqual(errors, []);
  console.log("sync-browser OK");
} finally {
  await browser.close();
  srv.close();
}
