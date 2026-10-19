import test from "node:test";
import assert from "node:assert/strict";
import { fresh, validate, record, reward, DAY, dayKey, SESSION_LENGTHS, ROOM_GIFT_EVERY } from "../frontend/js/core.js";
import { items } from "../frontend/js/content.js";
import { shop, roomSvg, defaultRpg } from "../frontend/js/rpg.js";
import {
  reviewQueue,
  dailyAvailable,
  dailyQueue,
  stickers,
  earnedStickers,
  newStickers,
  weekSummary,
  exportDue,
  giftNote,
} from "../frontend/js/extras.js";
import { plantIcon, plantIds } from "../frontend/js/plant-art.js";

const ok = (n, d = "production", at = Date.now(), correct = true) => ({
  correct,
  assisted: false,
  skip: false,
  dimension: d,
  fingerprint: "fp" + n,
});
function seeded(now = Date.now()) {
  const s = fresh();
  s.skills.number.status = "seen";
  s.skills.addition.status = "seen";
  return s;
}
test("rappel de Luna : seulement les notions réussies et échues", () => {
  const now = Date.now(),
    s = seeded();
  assert.deepEqual(reviewQueue(s, now), [], "rien de réussi : rien à revoir");
  record(s, "number", ok(1), now - 10 * DAY);
  assert.deepEqual(reviewQueue(s, now), ["number"]);
  record(s, "addition", ok(2), now);
  assert.deepEqual(reviewQueue(s, now), ["number"], "addition n'est pas encore échue");
  record(s, "addition", ok(3, "production", now, false), now - 5 * DAY);
  assert.ok(!reviewQueue(s, now).includes("addition"), "une erreur n'est pas une réussite à revoir");
  assert.ok(reviewQueue(s, now, 1).length <= 1);
});
test("défi du jour : un par jour, trois défis, validé par la sauvegarde", () => {
  const s = seeded();
  assert.ok(dailyAvailable(s));
  assert.equal(dailyQueue(s).length, 3);
  const id = crypto.randomUUID();
  s.session = { id, queue: dailyQueue(s), index: 3, mode: "daily" };
  reward(s, s.session);
  assert.deepEqual(s.daily, { day: dayKey(), done: true });
  assert.equal(dailyAvailable(s), false);
  assert.equal(dailyAvailable(s, Date.now() + DAY + 3600000), true, "revient le lendemain");
  s.session = null;
  assert.equal(validate(s).daily.done, true);
  const bad = structuredClone(s);
  bad.daily.day = "hier";
  assert.throws(() => validate(bad));
  assert.equal(dailyAvailable(fresh()), false, "aucune notion abordée : pas de défi");
});
test("modes de session daily et review acceptés, mode inconnu refusé", () => {
  for (const mode of ["daily", "review"]) {
    const s = seeded();
    s.session = { contentRevision: 2, id: "x" + mode, queue: ["number"], index: 0, seed: 1, started: 1, mode, draft: "", assisted: false, feedback: "", confidence: "", answered: false, order: [] };
    assert.equal(validate(s).session.mode, mode);
    s.session.mode = "autre";
    assert.throws(() => validate(s));
  }
});
test("cadeau de chambre toutes les 5 missions, jamais deux fois le même", () => {
  const s = fresh();
  const gifts = [];
  for (let i = 1; i <= ROOM_GIFT_EVERY * 3; i++) {
    delete s.newRoomGift;
    reward(s, { id: "m" + i, queue: ["number"], index: 1, mode: "normal" });
    if (s.newRoomGift) gifts.push(s.newRoomGift);
    assert.equal(Boolean(s.newRoomGift), i % ROOM_GIFT_EVERY === 0, "mission " + i);
  }
  assert.equal(gifts.length, 3);
  assert.equal(new Set(gifts).size, 3);
  assert.ok(gifts.every((g) => s.rpg.owned.includes(g) && shop.find((i) => i.id === g).kind === "room"));
  assert.match(giftNote(s), /Un cadeau pour ta chambre/);
  assert.equal(giftNote(fresh()), "");
  assert.ok(validate(s));
  s.newRoomGift = "head-hat";
  assert.throws(() => validate(s), "cadeau doit être un objet de chambre");
});
test("album : 25 autocollants uniques, calculés, « nouveau » jusqu'à ouverture", () => {
  assert.equal(stickers.length, 25);
  assert.equal(new Set(stickers.map((s) => s.id)).size, 25);
  const s = fresh();
  assert.deepEqual(earnedStickers(s), []);
  s.completed.push("m1");
  s.garden[0] = "flower";
  s.gardenLevels[0] = 2;
  const got = earnedStickers(s);
  for (const id of ["first", "g1", "gf", "gm"]) assert.ok(got.includes(id), id);
  assert.deepEqual(newStickers(s), got);
  s.stickersSeen = got;
  assert.deepEqual(newStickers(s), []);
  assert.ok(validate(s));
  s.stickersSeen = [1];
  assert.throws(() => validate(s));
});
test("bilan de la semaine : jours, réussites autonomes, solide / à reprendre", () => {
  const now = Date.now(),
    s = seeded();
  for (let i = 0; i < 4; i++) record(s, "number", ok(i), now - i * 3600000);
  for (let i = 0; i < 4; i++) record(s, "addition", ok(i + 9, "production", now, i === 0), now - 2 * DAY);
  record(s, "number", ok(50), now - 20 * DAY);
  const w = weekSummary(s, now);
  assert.equal(w.days.length, 7);
  assert.equal(w.answered, 8, "l'essai d'il y a 20 jours est exclu");
  assert.equal(w.solo, 5);
  assert.deepEqual(w.solid.map((r) => r.skill), ["number"]);
  assert.deepEqual(w.toRevisit.map((r) => r.skill), ["addition"]);
  assert.equal(w.days.reduce((n, d) => n + d.answered, 0), 8);
});
test("rappel de sauvegarde : après 3 missions, tous les 14 jours, reportable 7 jours", () => {
  const now = Date.now(),
    s = fresh();
  assert.equal(exportDue(s, now), false);
  s.completed = ["a", "b", "c"];
  assert.equal(exportDue(s, now), true);
  s.settings.exportSnooze = now - DAY;
  assert.equal(exportDue(s, now), false);
  assert.equal(exportDue(s, now + 8 * DAY), true);
  s.settings.exportSnooze = undefined;
  s.settings.lastExport = now - DAY;
  assert.equal(exportDue(s, now), false);
  assert.equal(exportDue(s, now + 15 * DAY), true);
});
test("réglages facultatifs : valeurs permises seulement", () => {
  const good = fresh();
  Object.assign(good.settings, { length: 8, textSize: "large", slow: true, lastExport: 5, exportSnooze: 6 });
  assert.equal(validate(good).settings.length, 8);
  assert.ok(SESSION_LENGTHS.includes(5));
  for (const bad of [{ length: 7 }, { textSize: "huge" }, { slow: "oui" }, { lastExport: -1 }, { exportSnooze: "x" }]) {
    const s = fresh();
    Object.assign(s.settings, bad);
    assert.throws(() => validate(s), JSON.stringify(bad));
  }
  assert.ok(validate(fresh()), "anciennes sauvegardes sans ces champs");
});
test("plantes dessinées : une pour chaque plante du jardin, sans identifiant SVG", () => {
  const garden = items.filter((i) => i.kind === "garden").map((i) => i.id);
  assert.deepEqual([...plantIds].sort(), [...garden].sort());
  for (const id of garden) {
    const svg = plantIcon(id, "x");
    assert.match(svg, /^<svg viewBox="0 0 80 80"/);
    assert.doesNotMatch(svg, /undefined|NaN| id="/, id);
  }
  assert.equal(plantIcon("inconnue"), null);
});
test("chambre vivante : la nuit assombrit la scène et allume la lampe", () => {
  const r = defaultRpg();
  r.room.lamp = "lamp-moon";
  const day = roomSvg(r, "x", { pet: "fox" }),
    night = roomSvg(r, "x", { pet: "fox", night: true });
  assert.doesNotMatch(day, /room-glow|#1b2150/);
  assert.match(night, /room-glow/);
  assert.match(night, /#1b2150/);
  assert.match(day, /room-pet/);
  assert.doesNotMatch(roomSvg(defaultRpg(), "x", { night: true }), /room-glow/, "pas de lampe : pas de lueur");
});
