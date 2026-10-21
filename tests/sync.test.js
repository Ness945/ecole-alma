import test from "node:test";
import assert from "node:assert/strict";
import { fresh, record, validate } from "../frontend/js/core.js";
import { derive, encrypt, decrypt, mergeStates, newCode, codeValid, syncOnce } from "../frontend/js/sync.js";
import worker from "../worker/sync-worker.js";

const kv = () => {
  const m = new Map();
  return { get: async (k) => m.get(k) ?? null, put: async (k, v) => void m.set(k, v), m };
};
const fakeFetch = (env) => (url, init = {}) => worker.fetch(new Request(url, init), env);
const play = (s, id, at, correct = true) => {
  s.skills[id].status = "seen";
  record(s, id, { correct, assisted: false, skip: false, dimension: "production", fingerprint: id + at }, at);
  s.modified = at;
  return s;
};

test("code famille, chiffrement aller-retour et mauvais code", async () => {
  const code = newCode();
  assert.match(code, /^[A-Z2-9]{5}(-[A-Z2-9]{5}){3}$/);
  assert.ok(codeValid(code) && !codeValid("ABC"));
  const a = await derive(code),
    b = await derive("AAAAA-AAAAA-AAAAA-AAAAA");
  assert.match(a.id, /^[0-9a-f]{64}$/);
  const s = fresh();
  const text = await encrypt(a.key, s);
  assert.ok(!text.includes("Aventurière"));
  assert.deepEqual(await decrypt(a.key, text), s);
  await assert.rejects(decrypt(b.key, text));
});

test("la fusion garde les preuves des deux appareils", () => {
  const ids = Object.keys(fresh().skills);
  const x = play(fresh(), ids[0], 1000),
    y = play(fresh(), ids[1], 2000);
  y.completed.push("s1");
  x.completed.push("s2");
  const m = mergeStates(x, y);
  validate(m);
  assert.equal(m.skills[ids[0]].status, "seen");
  assert.equal(m.skills[ids[1]].status, "seen");
  assert.equal(m.history.length, 2);
  assert.deepEqual([...m.completed].sort(), ["s1", "s2"]);
  assert.deepEqual(mergeStates(m, m), m);
});

test("synchronisation de bout en bout avec un faux serveur", async () => {
  const env = { SYNC: kv() };
  const f = fakeFetch(env),
    config = { url: "https://sync.test", code: newCode() };
  const ids = Object.keys(fresh().skills);
  const a = play(fresh(), ids[0], 1000);
  let r = await syncOnce(a, config, f);
  assert.ok(r.pushed);
  const stored = [...env.SYNC.m.values()][0];
  assert.ok(!stored.includes("Aventuri") && !stored.includes(ids[0]), "le serveur ne voit que du chiffré");
  const b = play(fresh(), ids[1], 2000);
  r = await syncOnce(b, config, f);
  assert.ok(r.changed && r.state.skills[ids[0]].status === "seen");
  r = await syncOnce(a, config, f);
  assert.ok(r.state.skills[ids[1]].status === "seen");
  await assert.rejects(syncOnce(a, { ...config, code: newCode() }, async () => new Response("", { status: 500 })));
});

test("le serveur refuse les écritures en conflit ou mal formées", async () => {
  const env = { SYNC: kv() };
  const url = "https://s.test/v1/" + "a".repeat(64);
  const put = (body) => worker.fetch(new Request(url, { method: "PUT", body: JSON.stringify(body) }), env);
  assert.equal((await put({ base: 0, data: "QUJD" })).status, 200);
  assert.equal((await put({ base: 0, data: "QUJD" })).status, 409);
  assert.equal((await put({ base: 1, data: "<script>" })).status, 400);
  assert.equal((await worker.fetch(new Request("https://s.test/v1/zz"), env)).status, 404);
});

test("un appareil neuf, même plus récent, n'écrase pas une sauvegarde avancée", () => {
  const ids = Object.keys(fresh().skills);
  const played = play(play(fresh(), ids[0], 1000), ids[1], 1500);
  played.name = "Alma";
  played.stars = 40;
  const blank = fresh();
  blank.modified = 9999999;
  for (const [a, b] of [[blank, played], [played, blank]]) {
    const m = mergeStates(a, b);
    assert.equal(m.name, "Alma");
    assert.equal(m.stars, 40);
    assert.equal(m.history.length, 2);
  }
});
