import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  validate,
  load,
  KEY,
  LEGACY_KEY,
  reward,
} from "../frontend/js/core.js";
import {
  purchase,
  equip,
  preview,
  avatarSvg,
  castleSvg,
} from "../frontend/js/rpg.js";
import { exercise, check } from "../frontend/js/exercises.js";
test("migration v1 réelle : points, objets, réponses et session conservés", () => {
  const old = fresh();
  old.version = 1;
  delete old.rpg;
  delete old.skills.multiplication;
  old.stars = 23;
  old.seeds = 5;
  old.inventory = ["hat", "crown"];
  old.outfit = "hat";
  old.skills.noun.status = "seen";
  old.session = {
    id: "old",
    queue: ["noun"],
    index: 0,
    seed: 12,
    started: 1,
    mode: "normal",
    draft: "chat",
    assisted: false,
    feedback: "",
    confidence: "",
    answered: false,
    order: [],
  };
  const text = JSON.stringify(old),
    map = new Map([[LEGACY_KEY, text]]),
    storage = { getItem: (k) => map.get(k), setItem: (k, v) => map.set(k, v) };
  const current = load(storage);
  assert.equal(current.version, 2);
  assert.equal(current.rpg.coins, 23);
  assert.equal(current.rpg.equipped.head, "head-hat");
  assert.deepEqual(current.session, old.session);
  assert.deepEqual(current.inventory, old.inventory);
  assert.deepEqual(current.skills.noun, old.skills.noun);
  assert.equal(current.skills.multiplication.status, "unknown");
  assert.equal(map.get(KEY + ".backup-before-v2"), text);
  assert.equal(map.get(LEGACY_KEY), text);
  assert.equal(JSON.parse(map.get(KEY)).version, 2);
  assert.equal(old.version, 1);
});
test("achat et équipement séparés ; aucun double débit ou solde négatif", () => {
  const s = fresh();
  assert.equal(purchase(s, "head-crown"), false);
  s.rpg.coins = 20;
  assert.equal(equip(s, "head-crown"), false);
  assert.equal(purchase(s, "head-crown"), true);
  assert.equal(s.rpg.coins, 2);
  assert.equal(s.rpg.equipped.head, null);
  assert.equal(purchase(s, "head-crown"), false);
  assert.equal(purchase(s, "not-an-item"), false);
  assert.equal(purchase(s, "cape-night"), false);
  assert.equal(s.rpg.coins, 2);
  assert.equal(equip(s, "head-crown"), true);
  assert.equal(s.rpg.equipped.head, "head-crown");
  assert.deepEqual(validate(s), s);
});
test("aperçu sans effet sur les pièces, les objets ni le personnage équipé", () => {
  const s = fresh(),
    before = structuredClone(s.rpg),
    p = preview(s.rpg, "head-crown");
  assert.equal(p.equipped.head, "head-crown");
  assert.deepEqual(s.rpg, before);
  assert.notEqual(avatarSvg(p), avatarSvg(s.rpg));
  assert.notEqual(castleSvg(preview(s.rpg, "roof-rose")), castleSvg(s.rpg));
});
test("les missions gagnent dix pièces une seule fois et conservent les étoiles", () => {
  const s = fresh(),
    mission = { id: "mission", queue: ["noun", "noun"], index: 2 };
  reward(s, mission);
  assert.equal(s.rpg.coins, 10);
  assert.equal(s.stars, 2);
  reward(s, mission);
  assert.equal(s.rpg.coins, 10);
  assert.ok(s.rpg.owned.includes("head-hat"));
});
test("sauvegardes RPG corrompues refusées", () => {
  for (const mutate of [
    (s) => (s.rpg.coins = -1),
    (s) => (s.rpg.look.skin = 8),
    (s) => (s.rpg.equipped.head = "head-crown"),
    (s) => (s.rpg.owned = ["invalid"]),
    (s) => {
      s.rpg.owned = ["roof-rose"];
      s.rpg.equipped.head = "roof-rose";
    },
  ]) {
    const s = fresh();
    mutate(s);
    assert.throws(() => validate(s));
  }
});
test("1000 multiplications : groupes égaux, résultat exact et choix unique", () => {
  for (let seed = 0; seed < 1000; seed++) {
    const q = exercise("multiplication", seed, 2, seed % 3);
    assert.equal(
      Number(q.answer),
      (2 + (seed % 4)) * (2 + (Math.floor(seed / 4) % 4)),
    );
    assert.ok(check(q, q.answer));
    if (q.type === "choice")
      assert.equal(q.options.filter((x) => x === q.answer).length, 1);
  }
});
test("un ancien onglet en v1 ne peut pas remplacer la progression RPG v2", () => {
  const current = fresh();
  current.rpg.coins = 37;
  current.rpg.owned = ["head-crown"];
  const older = fresh();
  older.version = 1;
  delete older.rpg;
  delete older.skills.multiplication;
  older.stars = 2;
  const map = new Map([
    [KEY, JSON.stringify(current)],
    [LEGACY_KEY, JSON.stringify(older)],
  ]);
  const storage = {
    getItem: (k) => map.get(k),
    setItem: (k, v) => map.set(k, v),
  };
  assert.equal(load(storage).rpg.coins, 37);
  assert.deepEqual(load(storage).rpg.owned, ["head-crown"]);
});

// ───────────────────────── Graphisme et cohérence des objets (0.7) ─────────────────────────
import { avatarSvg as drawAvatar, itemArt as drawItem, shop as catalog, unequip as takeOff, validRpg as validRpgState, defaultRpg as newRpg, styles as hairStyles, skins as skinList, hairs as hairList } from "../frontend/js/rpg.js";
import { shade, petArt, avatarItems } from "../frontend/js/avatar-art.js";

test("chaque objet à porter a un dessin, et l'icône de boutique est le même dessin que sur le personnage", () => {
  const worn = catalog.filter((i) => i.kind === "avatar");
  assert.deepEqual([...avatarItems].sort(), worn.map((i) => i.id).sort(), "aucun objet sans dessin, aucun dessin orphelin");
  for (const i of worn) {
    const icon = drawItem(i.id);
    assert.match(icon, /^<svg viewBox="[\d. -]+" class="item-art"/);
    const rpg = newRpg();
    rpg.owned = [i.id];
    rpg.equipped[i.slot] = i.id;
    const fragment = icon.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
    assert.ok(drawAvatar(rpg).includes(fragment), `${i.id} : l'objet porté est exactement le dessin de l'icône`);
  }
  for (const i of catalog.filter((i) => i.kind === "castle")) assert.match(drawItem(i.id), /<svg/);
});
test("le personnage se dessine pour toutes les apparences et tous les objets, sans identifiant dupliqué ni valeur invalide", () => {
  const worn = catalog.filter((i) => i.kind === "avatar");
  for (const skin of skinList.keys())
    for (const hair of hairList.keys())
      for (const st of hairStyles) {
        const r = newRpg();
        r.look = { skin, hair, style: st.id };
        for (const slot of ["head", "face", "neck", "back", "cape", "dress", "feet", "hand"]) {
          const pick = worn.filter((i) => i.slot === slot)[(skin + hair + st.id) % worn.filter((i) => i.slot === slot).length];
          r.owned.push(pick.id);
          r.equipped[slot] = pick.id;
        }
        const svg = drawAvatar(r, "t", { pet: ["fox", "dragon", null][(skin + st.id) % 3] });
        assert.ok(!/undefined|NaN|\[object/.test(svg));
        assert.ok(!/\sid="/.test(svg), "pas d'identifiant : plusieurs dessins peuvent cohabiter dans une page");
        assert.equal((svg.match(/<svg/g) || []).length, 1);
        assert.ok(validRpgState(r));
      }
  assert.ok(petArt("fox") && petArt("dragon") && petArt("autre") === "");
});
test("anciennes sauvegardes : sans emplacement « chaussures » ni coiffure, elles restent valides et dessinables", () => {
  const old = newRpg(5);
  delete old.equipped.feet;
  delete old.look.style;
  assert.equal(validRpgState(old), true);
  assert.doesNotThrow(() => drawAvatar(old));
  const bad = newRpg();
  bad.look.style = 99;
  assert.equal(validRpgState(bad), false);
  const wrongSlot = newRpg();
  wrongSlot.owned = ["boots-trail"];
  wrongSlot.equipped.head = "boots-trail";
  assert.equal(validRpgState(wrongSlot), false, "une chaussure ne se porte pas sur la tête");
  const unowned = newRpg();
  unowned.equipped.feet = "shoes-star";
  assert.equal(validRpgState(unowned), false);
});
test("nouveaux objets : achat, équipement, retrait sans perte et sans double débit", () => {
  const s = fresh();
  s.rpg.coins = 50;
  for (const id of ["boots-trail", "head-flowers", "dress-sun", "lantern-glow"]) assert.equal(purchase(s, id), true, id);
  assert.equal(s.rpg.coins, 50 - 10 - 10 - 16 - 14);
  assert.equal(purchase(s, "boots-trail"), false);
  assert.equal(equip(s, "boots-trail"), true);
  assert.equal(s.rpg.equipped.feet, "boots-trail");
  assert.equal(takeOff(s, "head-flowers"), false, "on ne retire pas ce qui n'est pas porté");
  assert.equal(takeOff(s, "boots-trail"), true);
  assert.equal(s.rpg.equipped.feet, null);
  assert.ok(s.rpg.owned.includes("boots-trail"), "l'objet reste dans la collection");
  assert.equal(takeOff(s, "inconnu"), false);
  validate(JSON.parse(JSON.stringify(s)));
});
test("shade éclaircit et assombrit sans sortir de la gamme", () => {
  assert.equal(shade("#808080", 0), "#808080");
  assert.equal(shade("#000000", 1), "#ffffff");
  assert.equal(shade("#ffffff", -1), "#000000");
  assert.match(shade("#4c9b91", -0.28), /^#[0-9a-f]{6}$/);
});

test("accessoires : au moins 10 objets par emplacement principal, nouveaux emplacements facultatifs dans les anciennes sauvegardes", () => {
  const bySlot = {};
  for (const i of catalog.filter((i) => i.kind === "avatar")) (bySlot[i.slot] ??= []).push(i.id);
  assert.deepEqual(Object.keys(bySlot).sort(), ["back", "cape", "dress", "face", "feet", "hand", "head", "neck"]);
  assert.ok(bySlot.head.length >= 10 && bySlot.dress.length >= 6 && bySlot.hand.length >= 7);
  assert.ok(catalog.filter((i) => i.kind === "avatar").length >= 40);
  const old = newRpg(3);
  for (const slot of ["face", "neck", "back"]) delete old.equipped[slot];
  assert.equal(validRpgState(old), true);
  const wrong = newRpg();
  wrong.owned = ["back-fairy"];
  wrong.equipped.neck = "back-fairy";
  assert.equal(validRpgState(wrong), false, "des ailes ne se portent pas autour du cou");
  const s = fresh();
  s.rpg.coins = 300;
  for (const id of ["back-fairy", "face-glasses", "neck-scarf", "head-tiara"]) {
    assert.equal(purchase(s, id), true);
    assert.equal(equip(s, id), true);
  }
  const svg = drawAvatar(s.rpg);
  assert.ok(svg.includes(drawItem("back-fairy").replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")));
  validate(JSON.parse(JSON.stringify(s)));
  assert.equal(takeOff(s, "back-fairy"), true);
});
