// Tablette tactile type Galaxy Tab S5e (800×1280 et 1280×800 px CSS, zoom d'agrandissement actif) :
// aucun débordement horizontal et cartes de matières de hauteur normale.
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { launch } from "./browser-launch.mjs";
const require = createRequire(import.meta.url),
  { chromium } = require(process.argv[2] || "playwright");
const browser = await launch(chromium);
try {
  for (const [w, h] of [[800, 1280], [1280, 800]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }),
      page = await ctx.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("http://localhost:4173");
    await page.getByRole("heading", { name: /Bienvenue dans ton royaume/ }).waitFor();
    for (const r of ["home", "missions", "avatar", "castle", "room", "garden", "collection", "story", "rooms"]) {
      await page.evaluate(() => document.querySelector('header [data-action="home"]')?.click());
      await page.evaluate((r) => document.querySelector(`[data-action="${r}"]`)?.click(), r);
      await page.waitForTimeout(250);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w}×${h} ${r} : débordement`);
      if (r === "missions") {
        const hs = await page.locator(".subject-tab").evaluateAll((t) => t.map((e) => e.getBoundingClientRect().height));
        assert.equal(hs.length, 4);
        assert.ok(Math.max(...hs) < 200, `cartes de matières trop hautes : ${hs}`);
      }
    }
    assert.deepEqual(errors, []);
    await ctx.close();
  }
  console.log("Tablette tactile 800×1280 et 1280×800 : neuf écrans sans débordement, cartes de matières normales OK.");
} finally {
  await browser.close();
}
