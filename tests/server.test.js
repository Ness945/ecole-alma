import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
test("toutes les ressources hors ligne déclarées existent", async () => {
  const worker = await readFile(
    new URL("../frontend/sw.js", import.meta.url),
    "utf8",
  );
  const files = worker
    .match(/const FILES\s*=\s*\[([\s\S]*?)\]/)[1]
    .match(/["']([^"']+)["']/g)
    .map((s) => s.slice(1, -1));
  for (const f of files)
    await readFile(
      new URL("../frontend" + (f === "/" ? "/index.html" : f), import.meta.url),
    );
  assert.ok(files.includes("/js/core.js"));
});
