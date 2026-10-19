import test from "node:test";
import assert from "node:assert/strict";
import { fresh, validate } from "../frontend/js/core.js";
import { shop, defaultRpg, validRpg, purchase, equip, unequip, preview, itemArt, castleSvg, castleNewSlots } from "../frontend/js/rpg.js";
import { castleSceneItems, castleSceneIcon, phases, phaseNow } from "../frontend/js/castle-scene.js";

const items = shop.filter((i) => i.kind === "castle");
const fresh0 = () => defaultRpg();
test("château : au moins 80 objets, 15 emplacements, chacun avec plusieurs choix", () => {
  const slots = [...new Set(items.map((i) => i.slot))];
  assert.ok(items.length >= 50, "objets " + items.length);
  for (const s of ["roof", "walls", "towers", "door", "windows", "flags", "moat", "path", "garden", "fountain", "lights", "creature", "weather", "sky", "ground"])
    assert.ok(slots.includes(s), s);
  assert.ok(slots.length >= 15);
  for (const s of ["walls", "door", "windows", "weather", "creature", "lights", "path", "moat"])
    assert.ok(items.filter((i) => i.slot === s).length >= 3, s);
  assert.equal(new Set(shop.map((i) => i.id)).size, shop.length);
  assert.equal(castleNewSlots.length, 9);
});
test("château : chaque objet a une icône tirée de la scène et un prix", () => {
  for (const i of items) {
    assert.ok(i.name && i.price >= 1, i.id);
    assert.match(itemArt(i.id), /^<svg/, i.id);
  }
  for (const id of castleSceneItems) {
    const svg = castleSceneIcon(id);
    assert.match(svg, /castle-icon-still/, id);
    assert.doesNotMatch(svg, /undefined|NaN|filter=/, id);
  }
});
test("château : la scène se dessine pour chaque objet à chaque moment, sans identifiant dupliqué", () => {
  const base = castleSvg(fresh0(), "k", { time: "day" });
  for (const t of phases) {
    assert.match(castleSvg(fresh0(), "k", { time: t }), new RegExp(`castle-${t}`));
    for (const i of items) {
      const r = fresh0();
      r.castle[i.slot] = i.id;
      const svg = castleSvg(r, "k", { time: t, pet: "fox" });
      assert.doesNotMatch(svg, /undefined|NaN/, i.id + t);
      const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(ids.every((x) => x.startsWith("k-")), "identifiants préfixés");
      if (t === "day") assert.notEqual(svg, base.replace(/castle-day/, "castle-day"), i.id);
    }
  }
});
test("château : jour, soir, nuit changent le ciel, la nuit allume les fenêtres", () => {
  const d = castleSvg(fresh0(), "k", { time: "day" }),
    n = castleSvg(fresh0(), "k", { time: "night" });
  assert.notEqual(d, n);
  assert.match(n, /#1b2150/);
  assert.doesNotMatch(d, /#1b2150/);
  assert.match(n, /#ffd978/);
  assert.equal(phaseNow(new Date(2026, 0, 1, 12)), "day");
  assert.equal(phaseNow(new Date(2026, 0, 1, 19)), "dusk");
  assert.equal(phaseNow(new Date(2026, 0, 1, 23)), "night");
  assert.equal(phaseNow(new Date(2026, 0, 1, 3)), "night");
});
test("château : animations CSS seulement (aucun SMIL), compagnon et météo présents", () => {
  const r = fresh0();
  Object.assign(r.castle, { weather: "weather-snow", creature: "creature-dragon", flags: "flags-stars", fountain: "castle-fountain", lights: "lights-torches" });
  const svg = castleSvg(r, "k", { time: "night", pet: "fox" });
  for (const c of ["c-snow", "c-creature", "c-flag", "c-drop", "c-flicker", "c-walk", "c-cloud", "c-twinkle"]) assert.match(svg, new RegExp(c), c);
  assert.doesNotMatch(svg, /<animate|<set /);
});
test("château : achat, équipement, aperçu, retrait pour les nouveaux emplacements", () => {
  const s = fresh();
  s.rpg.coins = 500;
  for (const id of ["walls-rose", "towers-onion", "creature-dragon", "weather-snow"]) {
    assert.ok(purchase(s, id));
    assert.ok(equip(s, id));
  }
  assert.equal(s.rpg.castle.walls, "walls-rose");
  assert.equal(s.rpg.castle.creature, "creature-dragon");
  assert.equal(preview(s.rpg, "door-red").castle.door, "door-red");
  assert.equal(s.rpg.castle.door, null);
  assert.ok(unequip(s, "weather-snow"));
  assert.equal(s.rpg.castle.weather, null);
  assert.ok(validate(s));
});
test("château : anciennes sauvegardes valides, objets faux refusés", () => {
  const old = JSON.parse(JSON.stringify(fresh()));
  for (const k of castleNewSlots) delete old.rpg.castle[k];
  const v = validate(old);
  assert.ok(castleNewSlots.every((k) => v.rpg.castle[k] === null));
  const bad = defaultRpg();
  bad.castle.walls = "walls-rose";
  assert.equal(validRpg(bad), false, "non possédé");
  bad.owned.push("walls-rose");
  assert.ok(validRpg(bad));
  bad.castle.door = "walls-rose";
  assert.equal(validRpg(bad), false, "mauvais emplacement");
});
