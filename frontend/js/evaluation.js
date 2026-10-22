// Évaluation : échelle de difficulté, bilan complet, points faibles, fluidité (chrono invisible),
// mini-bilan de chapitre et rapport de la semaine. Logique pure calculée à partir de la sauvegarde.
// Ce sont des observations prudentes, jamais une note ni un diagnostic.
import { skills } from "./content.js";
import { DAY } from "./core.js";
import { trendOf, recurringErrors, tipFor } from "./followup.js";
import { chapters } from "./story-data.js";

const solo = (e) => e.correct && !e.assisted && !e.skip;
export const skillName = (id) => skills.find((s) => s.id === id)?.name ?? id;
export const skillOf = (id) => skills.find((s) => s.id === id);

// ───────── Échelle de difficulté (palier 0 facile · 1 normal · 2 plus difficile) ─────────
export const TIERED = new Set(["addition", "subtract", "multiplication", "number", "count_step", "neighbors", "order", "evenodd", "mental10", "add_carry", "sub_borrow", "tables", "sharing", "problem2"]);
// On monte après 3 réussites autonomes de suite, on redescend après 2 échecs de suite.
export function tierFor(state, id) {
  if (!TIERED.has(id)) return 1;
  let tier = 1,
    ok = 0,
    ko = 0;
  for (const e of state.history) {
    if (e.skill !== id || e.ease) continue;
    if (solo(e)) {
      ko = 0;
      if (++ok >= 3) (tier = Math.min(2, tier + 1)), (ok = 0);
    } else if (!e.correct) {
      ok = 0;
      if (++ko >= 2) (tier = Math.max(0, tier - 1)), (ko = 0);
    }
  }
  return tier;
}
export const TIER_LABELS = ["Pas à pas", "Normal", "Défi"];

// ───────── Rapidité (mesurée sans jamais afficher de chrono à l'enfant) ─────────
const AUTOMATISMS = new Set(["complements", "doubles", "halves", "tables", "mental10", "addition", "subtract", "count_step", "neighbors", "evenodd", "english_numbers", "alphabet", "syllables", "number"]);
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : 0;
};
export function fluency(state, id) {
  const times = state.history.filter((e) => e.skill === id && solo(e) && Number.isFinite(e.ms) && e.ms > 0).slice(-12).map((e) => e.ms);
  if (times.length < 4) return null;
  const m = median(times) / 1000,
    [fast, slow] = AUTOMATISMS.has(id) ? [7, 14] : [16, 32];
  return { median: m, n: times.length, level: m <= fast ? "auto" : m <= slow ? "build" : "slow", automatism: AUTOMATISMS.has(id) };
}
export const FLUENCY_LABELS = { auto: ["⚡", "Automatique"], build: ["🌿", "En construction"], slow: ["🐢", "Demande encore du temps"] };

// ───────── Bilan complet : une question par petit pouvoir, par séries ─────────
export const BATCH_SIZE = 8;
export function assessmentBatches() {
  const out = [];
  for (const subject of [...new Set(skills.map((s) => s.subject))]) {
    const list = skills.filter((s) => s.subject === subject).map((s) => s.id),
      parts = Math.ceil(list.length / BATCH_SIZE),
      size = Math.ceil(list.length / parts);
    for (let i = 0; i < parts; i++) out.push({ id: `${out.length + 1}`, subject, part: i + 1, parts, skills: list.slice(i * size, (i + 1) * size) });
  }
  return out;
}
export const batchById = (id) => assessmentBatches().find((b) => b.id === String(id)) || null;
export function recordAssessment(state, skill, runId, result) {
  state.assessment = state.assessment || {};
  const cur = state.assessment[skill];
  if (cur && cur.run === runId) return;
  state.assessment[skill] = { at: Date.now(), run: String(runId).slice(0, 60), result };
}
// auto = réussi seule · helped = réussi avec aide · wrong = à revoir
export const outcomeOf = (correct, assisted, skip) => (skip ? "wrong" : correct ? (assisted ? "helped" : "auto") : "wrong");
export function mapStatus(state, id) {
  const a = state.assessment?.[id];
  const later = state.history.filter((e) => e.skill === id && solo(e) && (!a || e.at > a.at)).length;
  if (!a) return later >= 2 ? "good" : "none";
  if (a.result === "auto") return "good";
  if (later >= 2) return "good";
  return a.result === "helped" ? "mid" : "low";
}
export const MAP_LABELS = { good: ["🌷", "Acquis"], mid: ["🌿", "À consolider"], low: ["🌱", "À découvrir ou revoir"], none: ["◻︎", "Pas encore vu"] };
export function assessmentProgress(state) {
  const total = skills.length,
    done = skills.filter((s) => state.assessment?.[s.id]).length;
  return { total, done };
}

// ───────── Points faibles ─────────
export function weakScores(state, now = Date.now()) {
  const errs = recurringErrors(state, now);
  const out = [];
  for (const s of skills) {
    const k = state.skills[s.id];
    if (k.status !== "seen") continue;
    const reasons = [];
    let score = 0;
    const t = trendOf(state, s.id, now);
    if (t.recent !== null) {
      score += (1 - t.recent) * 3;
      if (t.status === "down") (score += 1.5), reasons.push(`${Math.round(t.recent * 100)} % de réussites sans aide récemment`);
    }
    const ms = mapStatus(state, s.id);
    if (ms === "low") (score += 3), reasons.push("à revoir au bilan");
    if (ms === "mid") (score += 1.2), reasons.push("réussi avec aide au bilan");
    const f = fluency(state, s.id);
    if (f?.level === "slow" && f.automatism) (score += 1.5), reasons.push("pas encore automatique (réponses lentes)");
    else if (f?.level === "slow") (score += 0.6), reasons.push("réponses lentes");
    const er = errs.filter((r) => r.skill === s.id);
    if (er.length) (score += 1), reasons.push(er[0].label.toLowerCase());
    if (score >= 1.8 && (t.tries >= 2 || ms === "low" || ms === "mid")) out.push({ id: s.id, score, reasons });
  }
  return out.sort((a, b) => b.score - a.score);
}
// Mission « points faibles » : 6 défis répartis sur les 3 notions les plus fragiles.
export function weakQueue(state, count = 6, now = Date.now()) {
  const top = weakScores(state, now).slice(0, 3).map((w) => w.id);
  if (!top.length) return [];
  return Array.from({ length: count }, (_, i) => top[i % top.length]);
}

// ───────── Mini-bilan mélangé (fin de chapitre) ─────────
export function mixQueue(state, count = 5) {
  const recentCh = state.completed
    .filter((id) => id.startsWith("story:"))
    .map((id) => chapters[Number(id.split(":")[1]) - 1]?.skill)
    .filter(Boolean)
    .reverse();
  const recentHist = [...state.history].reverse().map((e) => e.skill);
  const pool = [...new Set([...recentCh, ...recentHist])].filter((id) => state.skills[id]?.status === "seen");
  if (pool.length < 3) return [];
  return pool.slice(0, Math.max(count, 3)).slice(0, count);
}

// ───────── Rapport de la semaine ─────────
function stats(h) {
  const answered = h.filter((e) => !e.skip || true).length,
    ok = h.filter(solo).length,
    days = new Set(h.map((e) => new Date(e.at).toDateString())).size,
    missions = new Set(h.map((e) => e.mission).filter(Boolean)).size,
    ms = h.reduce((n, e) => n + (Number.isFinite(e.ms) ? e.ms : 0), 0);
  return { answered, solo: ok, rate: answered ? ok / answered : null, days, missions, ms };
}
export function weeklyReport(state, now = Date.now()) {
  const cur = state.history.filter((e) => e.at > now - 7 * DAY && e.at <= now),
    prev = state.history.filter((e) => e.at > now - 14 * DAY && e.at <= now - 7 * DAY);
  const c = stats(cur),
    p = stats(prev);
  const by = (h) => {
    const m = new Map();
    for (const e of h) {
      const r = m.get(e.skill) || { id: e.skill, tries: 0, solo: 0 };
      r.tries++;
      if (solo(e)) r.solo++;
      m.set(e.skill, r);
    }
    return m;
  };
  const bc = by(cur),
    bp = by(prev);
  const strengths = [...bc.values()].filter((r) => r.tries >= 3 && r.solo / r.tries >= 0.8).sort((a, b) => b.tries - a.tries).slice(0, 3);
  const progress = [...bc.values()]
    .filter((r) => r.tries >= 3 && bp.get(r.id)?.tries >= 3 && r.solo / r.tries - bp.get(r.id).solo / bp.get(r.id).tries >= 0.2)
    .slice(0, 3);
  const weak = weakScores(state, now).slice(0, 3);
  const home = weak.slice(0, 2).map((w) => ({ id: w.id, tip: tipFor(w.id) }));
  return { cur: c, prev: p, strengths, progress, weak, home };
}
