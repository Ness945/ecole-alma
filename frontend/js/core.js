import { skills, items } from "./content.js";
import { defaultRpg, validRpg } from "./rpg.js";
import { extraSkills } from "./expansion.js";
import { validMarket } from "./market.js";
export const DAY = 86400000;
export const dimensions = [
  "recognition",
  "manipulation",
  "production",
  "transfer",
  "memory",
];
export function fresh() {
  return {
    version: 2,
    rpg: defaultRpg(),
    name: "Aventurière",
    settings: { sound: true, motion: true },
    skills: Object.fromEntries(
      skills.map((s) => [
        s.id,
        { status: "unknown", level: 0, evidence: [], due: 0, interval: 0 },
      ]),
    ),
    stars: 0,
    seeds: 0,
    inventory: [],
    garden: Array(8).fill(null),
    outfit: null,
    pet: null,
    completed: [],
    history: [],
    session: null,
  };
}
export function evidence(s, dimension) {
  return s.evidence.filter(
    (e) => e.dimension === dimension && !e.assisted && !e.skip,
  );
}
export function ready(s) {
  return ["recognition", "production"].every(
    (d) =>
      new Set(
        evidence(s, d)
          .slice(-5)
          .filter((e) => e.correct)
          .map((e) => e.fingerprint),
      ).size >= 2,
  );
}
export function mastered(s) {
  return (
    ready(s) &&
    ["recognition", "manipulation", "production", "transfer", "memory"].every(
      (d) =>
        new Set(
          evidence(s, d)
            .slice(-5)
            .filter((e) => e.correct)
            .map((e) => e.fingerprint),
        ).size >= 2,
    ) &&
    new Set(
      s.evidence
        .filter((e) => e.correct && !e.assisted)
        .map((e) => Math.floor(e.at / DAY)),
    ).size >= 3
  );
}
export function missing(state, id) {
  return skills
    .find((s) => s.id === id)
    .pre.filter((p) => !ready(state.skills[p]));
}
export function eligible(state) {
  return skills.filter((s) => state.skills[s.id].status === "seen");
}
export function plan(state, count = 5, now = Date.now()) {
  let pool = eligible(state).sort(
    (a, b) => (state.skills[a.id].due || 0) - (state.skills[b.id].due || 0),
  );
  const discovering = pool.find((s) => state.skills[s.id].level < 2);
  if (discovering) pool = [discovering];
  if (!pool.length) return [];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length].id);
}
export function record(state, id, result, now = Date.now()) {
  const s = state.skills[id];
  if (s.status !== "seen") throw Error("Notion non abordée");
  const prior = s.evidence.filter((e) => e.correct && !e.assisted && !e.skip);
  const memory =
    result.correct &&
    !result.assisted &&
    !result.skip &&
    prior.some(
      (e) => now - e.at >= 3 * DAY && e.fingerprint !== result.fingerprint,
    );
  const e = { ...result, at: now };
  s.evidence.push(e);
  if (memory && result.dimension === "production")
    s.evidence.push({ ...e, dimension: "memory" });
  s.evidence = s.evidence.slice(-200);
  if (!result.skip) {
    if (result.correct && !result.assisted) {
      if (!s.interval || now >= s.due) {
        s.interval = [1, 3, 7, 14, 30].find((n) => n > s.interval) || 30;
        s.due = now + s.interval * DAY;
      }
    } else {
      s.interval = 0;
      s.due = now + DAY;
    }
  }
  s.level = mastered(s)
    ? 5
    : ready(s)
      ? evidence(s, "transfer").some((e) => e.correct)
        ? 4
        : 3
      : s.evidence.some((e) => e.correct && !e.assisted)
        ? 2
        : 1;
  state.history.push({ skill: id, ...e });
  state.history = state.history.slice(-1000);
}
export function reward(state, session) {
  if (
    state.completed.includes(session.id) ||
    session.index < session.queue.length
  )
    return false;
  state.completed.push(session.id);
  state.stars += session.queue.length;
  state.seeds += 2;
  state.rpg.coins += 10;
  const gifts = items.filter(
    (i) => i.kind !== "garden" && !state.inventory.includes(i.id),
  );
  const gift = gifts[0];
  if (gift) state.inventory.push(gift.id);
  const wearable =
    gift?.id === "hat"
      ? "head-hat"
      : gift?.id === "crown"
        ? "head-crown"
        : null;
  if (wearable && !state.rpg.owned.includes(wearable))
    state.rpg.owned.push(wearable);
  return gift?.id || true;
}
export function plant(state, id, slot) {
  const item = items.find((i) => i.id === id && i.kind === "garden");
  if (
    !item ||
    !Number.isInteger(slot) ||
    slot < 0 ||
    slot >= 8 ||
    state.garden[slot] ||
    state.seeds < item.cost
  )
    return false;
  state.seeds -= item.cost;
  state.garden[slot] = id;
  if (!state.inventory.includes(id)) state.inventory.push(id);
  return true;
}
export function validate(raw) {
  const fail = () => {
    throw Error("Sauvegarde invalide ou version non prise en charge.");
  };
  if (!raw || ![1, 2].includes(raw.version)) fail();
  raw = structuredClone(raw);
  if (raw.skills)
    for (const skill of extraSkills) {
      if (raw.skills[skill.id] === undefined)
        raw.skills[skill.id] = {
          status: "unknown",
          level: 0,
          evidence: [],
          due: 0,
          interval: 0,
        };
    }
  if (raw.version === 1) {
    raw = structuredClone(raw);
    if (!raw.skills || !Number.isSafeInteger(raw.stars) || raw.stars < 0)
      fail();
    raw.skills.multiplication ??= {
      status: "unknown",
      level: 0,
      evidence: [],
      due: 0,
      interval: 0,
    };
    raw.rpg = defaultRpg(raw.stars);
    if (raw.inventory?.includes("crown")) {
      raw.rpg.owned.push("head-crown");
      if (raw.outfit === "crown") raw.rpg.equipped.head = "head-crown";
    }
    if (raw.inventory?.includes("hat")) {
      raw.rpg.owned.push("head-hat");
      if (raw.outfit === "hat") raw.rpg.equipped.head = "head-hat";
    }
    raw.version = 2;
  }
  if (!validRpg(raw.rpg)) fail();
  if (!validMarket(raw.market)) fail();
  if (
    raw.marketDecor !== undefined &&
    !["rose", "sage", "gold"].includes(raw.marketDecor)
  )
    fail();
  const base = fresh();
  const integer = (x) => Number.isSafeInteger(x) && x >= 0;
  const ids = items.map((x) => x.id);
  const validEvidence = (e) =>
    e &&
    typeof e.correct === "boolean" &&
    typeof e.assisted === "boolean" &&
    typeof e.skip === "boolean" &&
    dimensions.includes(e.dimension) &&
    Number.isFinite(e.at) &&
    e.at >= 0 &&
    typeof e.fingerprint === "string" &&
    e.fingerprint.length < 500;
  if (
    typeof raw.name !== "string" ||
    raw.name.length > 40 ||
    !integer(raw.stars) ||
    !integer(raw.seeds) ||
    !Array.isArray(raw.inventory) ||
    raw.inventory.some((x) => !ids.includes(x)) ||
    !Array.isArray(raw.completed) ||
    raw.completed.some((x) => typeof x !== "string") ||
    !Array.isArray(raw.history) ||
    raw.history.length > 1000 ||
    raw.history.some((e) => !validEvidence(e) || !base.skills[e.skill])
  )
    fail();
  if (
    !Array.isArray(raw.garden) ||
    raw.garden.length !== 8 ||
    raw.garden.some(
      (x) =>
        x !== null && !items.some((i) => i.id === x && i.kind === "garden"),
    )
  )
    fail();
  for (const id of Object.keys(base.skills)) {
    const s = raw.skills?.[id];
    if (
      !s ||
      !["unknown", "seen", "not_seen"].includes(s.status) ||
      !integer(s.level) ||
      s.level > 5 ||
      !integer(s.interval) ||
      !Number.isFinite(s.due) ||
      s.due < 0 ||
      !Array.isArray(s.evidence) ||
      s.evidence.length > 200 ||
      s.evidence.some((e) => !validEvidence(e))
    )
      fail();
  }
  if (
    !raw.settings ||
    typeof raw.settings.sound !== "boolean" ||
    typeof raw.settings.motion !== "boolean"
  )
    fail();
  for (const [key, kind] of [
    ["outfit", "outfit"],
    ["pet", "pet"],
  ])
    if (
      raw[key] !== null &&
      (!raw.inventory.includes(raw[key]) ||
        !items.some((i) => i.id === raw[key] && i.kind === kind))
    )
      fail();
  if (raw.session !== null) {
    const s = raw.session;
    if (s?.contentRevision !== undefined && s.contentRevision !== 2) fail();
    if (
      s?.questionSeed !== undefined &&
      (!integer(s.questionSeed) || s.questionSeed > 4294967295)
    )
      fail();
    if (
      s.adventure !== undefined &&
      (![0, 1, 2].includes(s.adventure) ||
        !s.id?.startsWith(`bridge:${s.adventure}:`) ||
        !Array.isArray(s.queue) ||
        s.queue.some(
          (id) => id !== ["number", "noun", "determiner"][s.adventure],
        ))
    )
      fail();
    if (
      !s ||
      typeof s.id !== "string" ||
      !Array.isArray(s.queue) ||
      s.queue.length < 1 ||
      s.queue.length > 30 ||
      s.queue.some(
        (id) => !base.skills[id] || raw.skills[id].status !== "seen",
      ) ||
      !integer(s.index) ||
      s.index > s.queue.length ||
      !integer(s.seed) ||
      !integer(s.started) ||
      !["normal", "discovery", "mini"].includes(s.mode) ||
      typeof s.draft !== "string" ||
      s.draft.length > 500 ||
      typeof s.assisted !== "boolean" ||
      typeof s.feedback !== "string" ||
      !["", "unsure", "sure", "very"].includes(s.confidence) ||
      typeof s.answered !== "boolean" ||
      !Array.isArray(s.order) ||
      s.order.some((x) => !integer(x) || x > 20)
    )
      fail();
  }
  return structuredClone(raw);
}
export const LEGACY_KEY = "academie.save.v1";
export const KEY = "academie.save.v2";
export function load(storage) {
  const current = storage.getItem(KEY);
  const text = current || storage.getItem(LEGACY_KEY);
  if (!text) return fresh();
  try {
    const raw = JSON.parse(text),
      state = validate(raw);
    if (raw.version === 1 && !storage.getItem(KEY + ".backup-before-v2"))
      storage.setItem(KEY + ".backup-before-v2", text);
    if (!current) storage.setItem(KEY, JSON.stringify(state));
    return state;
  } catch {
    throw Error(
      "La sauvegarde locale ne peut pas être lue. Exportez-la avant toute réinitialisation.",
    );
  }
}
export function save(storage, state) {
  validate(state);
  storage.setItem(KEY, JSON.stringify(state));
}
