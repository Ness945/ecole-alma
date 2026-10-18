import { createRequire } from "node:module";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const { chromium } = createRequire(import.meta.url)(
  process.argv[2] || "playwright",
);
const browser = await chromium.launch({ headless: true, channel: "msedge" });
try {
  const context = await browser.newContext({
      reducedMotion: "reduce",
      viewport: { width: 1024, height: 768 },
    }),
    page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("academie.save.v2")));
  await mkdir("test-results", { recursive: true });
  await page.goto(process.argv[3] || "http://localhost:4173/");
  await page.locator('[data-action="market-open"]').click();
  for (let stage = 0; stage < 4; stage++) {
    await page.locator('[data-action="market-start"]').click();
    if (stage === 1) {
      await page.locator('[data-action="market-check"]').click();
      assert.equal((await state()).history.at(-1).correct, false);
      await page.locator('[data-action="market-next"]').click();
      assert.equal((await state()).market.step, 0);
    }
    for (let step = 0; step < 3; step++) {
      const q = await page.evaluate(async () => {
        const { marketQuestion } = await import(
          new URL("js/market.js", location.href)
        );
        return marketQuestion(
          JSON.parse(localStorage.getItem("academie.save.v2")).market,
        );
      });
      if (stage === 0)
        await page
          .locator(`[data-action="market-pick"][data-value="${q.answer}"]`)
          .click();
      if (stage === 1)
        for (let i = 0; i < q.count; i++)
          for (let j = 0; j < q.each; j++)
            await page
              .locator(
                `[data-action="market-adjust"][data-slot="${i}"][data-delta="1"]`,
              )
              .click();
      if (stage === 2) {
        for (let i = 0; i < Math.floor(q.answer / 2); i++)
          await page
            .locator(
              '[data-action="market-adjust"][data-slot="1"][data-delta="1"]',
            )
            .click();
        if (q.answer % 2)
          await page
            .locator(
              '[data-action="market-adjust"][data-slot="0"][data-delta="1"]',
            )
            .click();
      }
      if (stage === 3) {
        for (let i = 0; i < q.hour; i++)
          await page
            .locator('[data-action="market-hour"][data-delta="1"]')
            .click();
        if (q.half) await page.locator('[data-action="market-minute"]').click();
      }
      if (step === 0) {
        const before = (await state()).market.draft;
        await page.reload();
        await page.locator('[data-action="market-open"]').click();
        assert.deepEqual((await state()).market.draft, before);
        for (const width of [390, 768, 1024]) {
          await page.setViewportSize({ width, height: 844 });
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          );
        }
        await page.screenshot({
          path: `test-results/market-${stage}.png`,
          fullPage: true,
        });
      }
      await page.locator('[data-action="market-check"]').click();
      assert.equal((await state()).history.at(-1).correct, true);
      await page.locator('[data-action="market-next"]').click();
    }
  }
  await page
    .getByRole("heading", { name: "Le marché est ouvert !", exact: true })
    .waitFor();
  assert.equal((await state()).rpg.coins, 40);
  assert.ok((await state()).rpg.owned.includes("bag-adventure"));
  await page.locator('[data-action="market-decor"][data-color="sage"]').click();
  assert.equal((await state()).marketDecor, "sage");
  await page.locator('[data-action="market-equip"]').click();
  assert.equal((await state()).rpg.equipped.hand, "bag-adventure");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await page.locator('[data-action="market-open"]').click();
  await page
    .getByRole("heading", { name: "Le marché est ouvert !", exact: true })
    .waitFor();
  assert.equal((await state()).rpg.coins, 40);
  assert.equal((await state()).marketDecor, "sage");
  assert.deepEqual(errors, []);
  console.log(
    "Marché : quatre étapes complètes, erreur, manipulation, reprise, responsive, récompenses, équipement et hors ligne OK.",
  );
} finally {
  await browser.close();
}
