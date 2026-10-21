import test from "node:test";
import assert from "node:assert/strict";
import { fresh, validate, KEY } from "../frontend/js/core.js";
import {
  shop,
  defaultRpg,
  validRpg,
  purchase,
  equip,
  unequip,
  preview,
  itemArt,
  roomSvg,
  roomSlots,
  groupOf,
} from "../frontend/js/rpg.js";
import { roomItems, roomItemArt } from "../frontend/js/room-art.js";

const items = shop.filter((i) => i.kind === "room");
test("chambre : au moins 90 objets, 13 emplacements, au moins 3 choix chacun", () => {
  assert.ok(items.length >= 90);
  assert.equal(roomSlots.length, 13);
  for (const s of roomSlots)
    assert.ok(items.filter((i) => i.slot === s).length >= 3, s);
  assert.equal(new Set(shop.map((i) => i.id)).size, shop.length, "ids uniques");
});
test("chambre : chaque objet a un nom, un prix et une icône issue de la scène", () => {
  assert.deepEqual(items.map((i) => i.id).sort(), [...roomItems].sort());
  for (const i of items) {
    assert.ok(i.name && i.price >= 1 && i.price <= 50, i.id);
    assert.match(roomItemArt(i.id), /^<svg viewBox="[\d. -]+"/);
    assert.equal(itemArt(i.id), roomItemArt(i.id));
    assert.doesNotMatch(roomItemArt(i.id), /undefined|NaN| id="/);
  }
});
test("chambre : la scène se dessine pour chaque objet, seule et avec un compagnon", () => {
  const base = roomSvg(defaultRpg(), "x");
  assert.match(base, /^<svg/);
  for (const i of items) {
    const r = defaultRpg();
    r.room[i.slot] = i.id;
    const svg = roomSvg(r, "x", { pet: "fox" });
    assert.doesNotMatch(svg, /undefined|NaN| id="/, i.id);
    assert.notEqual(svg, roomSvg(defaultRpg(), "x", { pet: "fox" }), i.id);
  }
});
test("chambre : achat, équipement, retrait et aperçu", () => {
  const s = fresh();
  s.rpg.coins = 100;
  assert.equal(groupOf("room"), "room");
  assert.ok(purchase(s, "bed-star"));
  assert.equal(s.rpg.coins, 100 - items.find((i) => i.id === "bed-star").price);
  assert.ok(equip(s, "bed-star"));
  assert.equal(s.rpg.room.bed, "bed-star");
  assert.equal(preview(s.rpg, "wall-rose").room.wall, "wall-rose");
  assert.equal(s.rpg.room.wall, null);
  assert.ok(unequip(s, "bed-star"));
  assert.equal(s.rpg.room.bed, null);
  assert.equal(equip(s, "wall-rose"), false, "non acheté");
});
test("chambre : sauvegardes anciennes valides, objets faux refusés", () => {
  const old = defaultRpg();
  delete old.room;
  assert.ok(validRpg(old));
  const s = JSON.parse(JSON.stringify(fresh()));
  delete s.rpg.room;
  const v = validate(s);
  assert.ok(v.rpg.room && roomSlots.every((k) => v.rpg.room[k] === null));
  const bad = defaultRpg();
  bad.room.bed = "bed-star";
  assert.equal(validRpg(bad), false, "non possédé");
  bad.owned.push("bed-star");
  assert.ok(validRpg(bad));
  bad.room.wall = "bed-star";
  assert.equal(validRpg(bad), false, "mauvais emplacement");
});
test("v0.14 : couleurs et coiffures ajoutées, anciennes valeurs conservées, sièges et plafond utilisables", async () => {
  const { hairs, styles, validRpg, defaultRpg: dr, avatarSvg } = await import("../frontend/js/rpg.js");
  assert.deepEqual(hairs.slice(0, 4), ["#59382e", "#a56539", "#e4bc68", "#302c39"]);
  assert.ok(hairs.length >= 12 && styles.length >= 10);
  const r = dr();
  r.look = { skin: 1, hair: hairs.length - 1, style: styles.length - 1 };
  assert.equal(validRpg(r), true);
  assert.match(avatarSvg(r), /<svg/);
  r.look.hair = hairs.length;
  assert.equal(validRpg(r), false);
  assert.ok(items.filter((i) => i.slot === "seat").length >= 5 && items.filter((i) => i.slot === "ceiling").length >= 4);
});
