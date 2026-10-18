// Moteur du parcours « À la découverte de tes pouvoirs » : adaptation, arrêt, observations, bilan et recommandations.
// Logique pure (sans DOM). Les observations restent dans state.discovery : ce module n'écrit jamais dans state.skills,
// ne modifie pas les statuts scolaires du parent et n'ajoute aucune preuve de maîtrise.
import { skills } from "./content.js";
import { DAY, ready, mastered, missing } from "./core.js";
import { LADDER, FAMILIES, make, judge, FORM_LABELS } from "./discovery-bank.js";
import {
  STEPS,
  STEP_IDS,
  SAMPLED,
  RULES,
  NEEDS_PARENT_SEEN,
  newDiscovery,
  newRun,
  stepOf,
} from "./discovery-model.js";

export const CATEGORIES = {
  deepen: "À approfondir",
  train: "À entraîner avec un exemple",
  explore: "À explorer",
  confirm: "À confirmer",
  unassessed: "Non évaluée",
};
export const CATEGORY_ORDER = ["deepen", "train", "confirm", "explore", "unassessed"];

export const skillName = (id) => skills.find((s) => s.id === id)?.name ?? id;
export const skillIcon = (id) => skills.find((s) => s.id === id)?.icon ?? "✦";
export const parentStatus = (state, skill) =>
  state.skills[skill]?.status ?? "unknown";
const NON_SUCCESS = ["wrong", "skipped", "not_learned"];

// ───────────────────────── Bilans (runs) ─────────────────────────
export function ensure(state) {
  state.discovery ??= newDiscovery();
  return state.discovery;
}
export const runList = (state) => state.discovery?.runs ?? [];
export function openRun(state) {
  const d = state.discovery;
  return d?.current ? (d.runs.find((r) => r.id === d.current) ?? null) : null;
}
export const allChallenges = (run) =>
  run.compact ? [] : STEP_IDS.flatMap((id) => run.steps[id].challenges);
export const challengesOf = (run, skill) =>
  run.compact
    ? []
    : run.steps[stepOf(skill).id].challenges.filter((c) => c.skill === skill);

export function tally(list) {
  const t = { A: 0, Q: 0, D: 0, H: 0, W: 0, S: 0, N: 0 };
  for (const c of list) {
    if (c.outcome === "auto") {
      if (c.afterDemo || c.repeated) t.D++;
      else {
        t.A++;
        if (c.form !== "choice") t.Q++; // réussite autonome produite (saisie ou manipulation)
      }
    }
    else if (c.outcome === "helped") t.H++;
    else if (c.outcome === "wrong") t.W++;
    else if (c.outcome === "skipped") t.S++;
    else if (c.outcome === "not_learned") t.N++;
  }
  return finishCounts(t);
}
function finishCounts(t) {
  // E : observations indépendantes (une réussite après démonstration ou sur un exemple déjà vu n'en est pas une).
  return { ...t, E: t.A + t.H + t.W + t.S, total: t.A + t.D + t.H + t.W + t.S + t.N };
}
export function countsOf(run, skill) {
  if (!run) return finishCounts({ A: 0, Q: 0, D: 0, H: 0, W: 0, S: 0, N: 0 });
  if (run.compact) {
    const s = run.summary[skill] ?? { A: 0, Q: 0, D: 0, H: 0, W: 0, S: 0, N: 0 };
    return finishCounts({ A: s.A, Q: s.Q, D: s.D, H: s.H, W: s.W, S: s.S, N: s.N });
  }
  return tally(challengesOf(run, skill));
}

export function compactRun(run) {
  if (run.compact) return run;
  const summary = {};
  for (const skill of SAMPLED) {
    const t = tally(challengesOf(run, skill));
    if (t.total)
      summary[skill] = Object.fromEntries(
        ["A", "Q", "D", "H", "W", "S", "N"].map((k) => [k, Math.min(99, t[k])]),
      );
  }
  const stepStatus = Object.fromEntries(
    STEP_IDS.map((id) => [id, run.steps[id].status]),
  );
  delete run.steps;
  Object.assign(run, { compact: true, summary, stepStatus });
  return run;
}
function compactOld(d) {
  const detailed = d.runs
    .filter((r) => !r.compact && r.id !== d.current)
    .sort((a, b) => b.started - a.started);
  for (const r of detailed.slice(RULES.keepDetailedRuns)) compactRun(r);
}
// Démarre un nouveau bilan. Un bilan en cours est conservé tel quel et marqué « abandonné » : aucune observation n'est perdue.
export function startRun(state, seed, id, now = Date.now()) {
  const d = ensure(state);
  const open = openRun(state);
  if (open) open.abandoned = true;
  const run = newRun(id, seed >>> 0, now);
  d.runs.push(run);
  d.current = run.id;
  compactOld(d);
  return run;
}
export function rerunAdvice(state, now = Date.now()) {
  const finished = runList(state)
    .filter((r) => r.finished !== null)
    .sort((a, b) => b.finished - a.finished)[0];
  return {
    open: Boolean(openRun(state)),
    recent: Boolean(finished) && now - finished.finished < RULES.rerunDays * DAY,
    lastFinished: finished?.finished ?? null,
  };
}

// ───────────────────────── Règles d'adaptation et d'arrêt ─────────────────────────
// Raison d'arrêt d'une notion, ou "" si l'on peut continuer.
export function skillStop(list) {
  if (list.some((c) => c.outcome === "not_learned")) return "not_learned";
  if (list.length >= RULES.maxPerSkill) return "max";
  if (tally(list).A >= RULES.independentSuccesses) return "confirmed";
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].outcome === "wrong" || list[i].outcome === "skipped") streak++;
    else break;
  }
  return streak >= RULES.skillStopStreak ? "blocked" : "";
}
// Raison d'arrêt d'une étape, ou "".
export function stepStop(step, stepId) {
  if (step.challenges.length >= STEPS.find((s) => s.id === stepId).limit)
    return "limit";
  const last = step.challenges.slice(-RULES.stepStopStreak);
  return last.length === RULES.stepStopStreak &&
    last.every((c) => NON_SUCCESS.includes(c.outcome))
    ? "fatigue"
    : "";
}
// Une notion n'est proposée que si le contexte scolaire et ses prérequis le permettent.
export function eligibility(state, run, skill) {
  const parent = parentStatus(state, skill);
  if (parent === "not_seen") return { ok: false, reason: "parent_not_seen" };
  if (NEEDS_PARENT_SEEN.includes(skill) && parent !== "seen")
    return { ok: false, reason: "needs_parent_seen" };
  for (const p of skills.find((s) => s.id === skill).pre) {
    if (!SAMPLED.includes(p)) continue;
    if (parentStatus(state, p) === "not_seen")
      return { ok: false, reason: "prereq_not_seen", prereq: p };
    const t = countsOf(run, p);
    if (t.N) return { ok: false, reason: "prereq_not_learned", prereq: p };
    if (t.A < 1) return { ok: false, reason: "prereq_unconfirmed", prereq: p };
  }
  return { ok: true, reason: "" };
}
const wantTier = (list) => {
  const last = list.at(-1);
  return last && last.outcome === "auto" && !last.afterDemo && !last.repeated
    ? 2
    : 1;
};
function pickFamily(skill, tier, used) {
  const L = LADDER[skill],
    first = tier === 2 ? L.tier2 : L.tier1,
    other = tier === 2 ? L.tier1 : L.tier2;
  return (
    first.find((f) => !used.has(f)) ??
    other.find((f) => !used.has(f)) ??
    first[0] ??
    other[0]
  );
}
function recentRuns(state, run) {
  return runList(state)
    .filter((r) => r.id !== run.id && !r.compact)
    .sort((a, b) => b.started - a.started)
    .slice(0, RULES.recentRunsAvoided);
}
// Choisit une variante inédite (ce bilan et les deux précédents). Si la banque est épuisée, l'exemple est marqué « déjà rencontré ».
export function chooseVariant(state, run, famId, count) {
  const now = new Set(),
    before = new Set();
  for (const c of allChallenges(run)) if (c.item === famId) now.add(c.variant);
  for (const r of recentRuns(state, run))
    for (const c of allChallenges(r)) if (c.item === famId) before.add(c.variant);
  const start = (run.seed + hashCode(famId)) % count;
  for (let k = 0; k < count; k++) {
    const v = (start + k) % count;
    if (!now.has(v) && !before.has(v)) return { variant: v, repeated: false };
  }
  for (let k = 0; k < count; k++) {
    const v = (start + k) % count;
    if (!now.has(v)) return { variant: v, repeated: true };
  }
  return { variant: start, repeated: true };
}
function hashCode(text) {
  let h = 0;
  for (const ch of text) h = (Math.imul(h, 31) + ch.codePointAt(0)) >>> 0;
  return h;
}
// Prochain défi d'une étape (pur : même état → même défi), ou null si l'étape est terminée.
export function nextChallenge(state, run, stepId) {
  const step = run.steps[stepId];
  if (stepStop(step, stepId)) return null;
  for (const skill of STEPS.find((s) => s.id === stepId).skills) {
    const list = challengesOf(run, skill);
    if (skillStop(list) || !eligibility(state, run, skill).ok) continue;
    const item = pickFamily(
      skill,
      wantTier(list),
      new Set(list.map((c) => c.item)),
    );
    const { variant, repeated } = chooseVariant(
      state,
      run,
      item,
      FAMILIES[item].variants.length,
    );
    // Après une démonstration (exemple demandé), un exemple équivalent n'est pas une preuve indépendante.
    return { skill, item, variant, repeated, afterDemo: Boolean(list.at(-1)?.hint) };
  }
  return null;
}

// ───────────────────────── Déroulement d'une étape ─────────────────────────
export function grantParticipation(state, run, now = Date.now()) {
  const d = ensure(state);
  if (d.rewardGranted || (run && allChallenges(run).length === 0)) return false;
  d.rewardGranted = true;
  d.rewardAt = now;
  state.rpg.coins += RULES.participationCoins;
  state.seeds += RULES.participationSeeds;
  return true;
}
export function finishStep(state, run, stepId, reason, now = Date.now()) {
  const step = run.steps[stepId];
  if (step.status === "done") return { granted: false };
  step.status = "done";
  step.stopReason = reason;
  step.active = null;
  const granted = grantParticipation(state, run, now);
  if (STEP_IDS.every((id) => run.steps[id].status === "done")) {
    run.finished = now;
    if (state.discovery.current === run.id) state.discovery.current = null;
  }
  return { granted };
}
// Retourne le défi en cours (le crée et le fige si besoin) ou termine l'étape.
export function ensureActive(state, run, stepId, now = Date.now()) {
  const step = run.steps[stepId];
  if (step.status === "done") return { active: null, ended: true, granted: false };
  if (step.active) return { active: step.active, ended: false, granted: false };
  if (step.status === "todo") step.status = "active";
  const next = nextChallenge(state, run, stepId);
  if (!next) {
    const { granted } = finishStep(
      state,
      run,
      stepId,
      stepStop(step, stepId) || "complete",
      now,
    );
    return { active: null, ended: true, granted };
  }
  step.active = {
    skill: next.skill,
    item: next.item,
    variant: next.variant,
    afterDemo: next.afterDemo,
    repeated: next.repeated,
    draft: "",
    order: [],
    help: { hint: false, voice: false, adult: false },
    answered: false,
    outcome: "",
  };
  return { active: step.active, ended: false, granted: false };
}
export const questionOf = (run, active) => make(active.item, active.variant, run.seed);
export function setHelp(run, stepId, kind) {
  const a = run.steps[stepId].active;
  if (!a || a.answered || !["hint", "voice", "adult"].includes(kind)) return false;
  a.help[kind] = true;
  return true;
}
export function setDraft(run, stepId, draft) {
  const a = run.steps[stepId].active;
  if (!a || a.answered) return false;
  a.draft = String(draft).slice(0, 200);
  return true;
}
// Enregistre la réponse. Idempotent : une réponse déjà enregistrée n'est jamais comptée deux fois.
export function answerActive(state, run, stepId, input, now = Date.now()) {
  const step = run.steps[stepId],
    a = step.active;
  if (!a || a.answered) return null;
  const q = questionOf(run, a);
  let outcome;
  if (input.kind === "skip") outcome = "skipped";
  else if (input.kind === "not_learned") outcome = "not_learned";
  else {
    const value = String(input.value ?? "");
    if (!value.trim()) return { error: "empty" };
    const helped = a.help.hint || a.help.voice || a.help.adult;
    outcome = judge(q, value) ? (helped ? "helped" : "auto") : "wrong";
    if (q.form !== "blocks") a.draft = value.slice(0, 200);
  }
  const challenge = {
    skill: a.skill,
    item: a.item,
    variant: a.variant,
    task: q.task,
    form: q.form,
    outcome,
    afterDemo: a.afterDemo,
    repeated: a.repeated,
    hint: a.help.hint,
    voice: a.help.voice,
    adult: a.help.adult,
    at: now,
  };
  step.challenges.push(challenge);
  a.answered = true;
  a.outcome = outcome;
  return challenge;
}
export function advance(state, run, stepId, now = Date.now()) {
  const step = run.steps[stepId];
  if (!step.active?.answered) return ensureActive(state, run, stepId, now);
  step.active = null;
  return ensureActive(state, run, stepId, now);
}
// L'enfant choisit de s'arrêter : les notions restantes ne sont pas évaluées.
export function stopStep(state, run, stepId, now = Date.now()) {
  const step = run.steps[stepId];
  if (step.active && !step.active.answered) return { granted: false, refused: true };
  step.active = null;
  return finishStep(state, run, stepId, "asked", now);
}

// ───────────────────────── Interprétation prudente ─────────────────────────
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
export function classify(c, parent) {
  if (parent === "not_seen")
    return {
      category: "explore",
      reason:
        "Vous avez indiqué que cette notion n’est pas encore abordée en classe : elle n’a pas été proposée. Une découverte guidée reste possible quand vous le souhaitez.",
    };
  if (c.N >= 1) {
    if (parent === "seen" || c.A + c.H + c.D >= 1)
      return {
        category: "confirm",
        reason:
          parent === "seen"
            ? "Alma a dit ne pas l’avoir apprise alors que vous l’avez marquée « déjà travaillée ». C’est une observation, pas un constat : à confirmer avec l’école. Votre statut n’a pas été modifié."
            : "Résultats contradictoires : des réussites puis « Je ne l’ai pas appris ». À confirmer sur d’autres exemples et avec l’école.",
      };
    return {
      category: "explore",
      reason:
        "Alma a indiqué ne pas l’avoir apprise. C’est une observation à confirmer avec l’école, pas un constat. Votre statut n’a pas été modifié.",
      toConfirm: true,
    };
  }
  if (c.E < RULES.minObservations)
    return {
      category: "confirm",
      reason: `Trop peu d’observations indépendantes (${c.E}) pour conclure${c.D ? ` ; ${plural(c.D, "réussite", "réussites")} après un exemple montré ou sur un exemple déjà vu ne compte pas comme preuve indépendante` : ""}. Une courte mission permettra de confirmer.`,
    };
  const bad = c.W + c.S;
  if (c.A >= RULES.independentSuccesses && bad === 0 && c.Q === 0)
    return {
      category: "confirm",
      reason:
        "Les réussites autonomes sont toutes des choix multiples : à confirmer avec une réponse écrite ou une manipulation avant de conclure.",
    };
  if (c.A >= RULES.independentSuccesses && bad === 0)
    return {
      category: "deepen",
      reason: `${plural(c.A, "réussite autonome", "réussites autonomes")} sur des exemples différents${c.H ? ", avec une aide sur un autre exemple" : ""}. Une mission d’approfondissement est possible ; ce n’est pas encore une preuve de maîtrise durable.`,
    };
  if (c.A >= 1 && bad >= 1)
    return {
      category: "confirm",
      reason:
        "Résultats contradictoires (une réussite autonome et des réponses non abouties ou passées). À confirmer sur d’autres exemples, à un autre moment.",
    };
  if (c.H >= 1)
    return {
      category: "train",
      reason:
        "Une aide (exemple, adulte ou lecture à voix haute) a été utile. Un exemple guidé pourra aider ; une réussite accompagnée ne prouve pas encore l’autonomie.",
    };
  return {
    category: "train",
    reason:
      "Plusieurs réponses non abouties ou passées. Cela peut venir d’une notion pas encore vue, d’une consigne mal comprise ou de fatigue : à reprendre doucement avec un exemple.",
  };
}
const unassessedText = (state, latest, skill) => {
  if (!latest) return "Aucun bilan pour l’instant.";
  if (latest.compact) return "Pas explorée dans ce bilan.";
  const e = eligibility(state, latest, skill),
    step = latest.steps[stepOf(skill).id];
  if (e.reason === "needs_parent_seen")
    return "Proposée seulement si vous l’avez marquée « déjà travaillée » en classe.";
  if (step.status !== "done") return "L’étape n’est pas encore terminée.";
  if (!e.ok) {
    const name = skillName(e.prereq ?? "");
    return {
      prereq_unconfirmed: `Non proposée : « ${name} » n’a pas encore été confirmée dans ce bilan.`,
      prereq_not_learned: `Non proposée : « ${name} » a été déclarée non apprise.`,
      prereq_not_seen: `Non proposée : « ${name} » est marquée « pas encore abordée ».`,
    }[e.reason];
  }
  if (step.stopReason === "limit")
    return "Le nombre maximal de défis de l’étape a été atteint.";
  if (step.stopReason === "fatigue")
    return "L’étape s’est arrêtée pour laisser souffler Alma (plusieurs défis difficiles d’affilée).";
  if (step.stopReason === "asked") return "Alma a choisi de s’arrêter.";
  return "Pas explorée dans ce bilan.";
};
export const dateFr = (t) =>
  new Date(t).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
// Indépendant des preuves de maîtrise : seul un regard (lecture seule) sur ce que les missions ont déjà établi.
export function missionLevel(state, skill) {
  const s = state.skills[skill];
  if (!s || !s.evidence.length) return "none";
  if (mastered(s)) return "mastered";
  if (ready(s)) return "ready";
  return s.evidence.some((e) => e.correct && !e.assisted && !e.skip)
    ? "started"
    : "trying";
}
// Bilan par notion : le bilan le plus récent de chaque notion fait foi ; les précédents restent consultables.
export function buildReport(state) {
  const runs = [...runList(state)].sort((a, b) => b.started - a.started);
  const latest = runs[0] ?? null;
  const rows = SAMPLED.map((skill) => {
    const parent = parentStatus(state, skill),
      found = runs.find((r) => countsOf(r, skill).total > 0),
      counts = countsOf(found, skill),
      list = found ? challengesOf(found, skill) : [];
    const cls = parent === "not_seen" || found
        ? classify(counts, parent)
        : { category: "unassessed", reason: unassessedText(state, latest, skill) };
    const previous = runs
      .filter((r) => r !== found && countsOf(r, skill).total > 0)
      .map((r) => ({ date: r.started, counts: countsOf(r, skill) }));
    let note = "";
    if (skill === "reading" && list.some((c) => c.outcome === "helped" && (c.voice || c.adult)))
      note =
        "Lecture non autonome : le texte a été lu par une voix ou un adulte pour au moins une réponse.";
    return {
      skill,
      name: skillName(skill),
      icon: skillIcon(skill),
      step: stepOf(skill).id,
      parent,
      ...cls,
      counts,
      note,
      date: found?.started ?? null,
      observations: list.map((c) => ({
        task: c.task,
        form: FORM_LABELS[c.form],
        outcome: c.outcome,
        afterDemo: c.afterDemo,
        repeated: c.repeated,
        help: [c.hint && "exemple", c.voice && "voix", c.adult && "adulte"].filter(Boolean),
      })),
      previous,
      missions: missionLevel(state, skill),
    };
  });
  return { latest, runs, rows };
}
// Prochaine étape cohérente avec le graphe de prérequis, comme le fait déjà la page de leçon.
export function resolveTarget(state, skill) {
  let t = skill;
  for (let i = 0; i < 12; i++) {
    if (state.skills[t].status === "seen") return t;
    const miss = missing(state, t);
    if (!miss.length) return t;
    t = miss[0];
  }
  return t;
}
export function actionsFor(state, row) {
  if (row.category === "unassessed") return [];
  const target = resolveTarget(state, row.skill),
    startable = state.skills[target].status === "seen",
    prereq = target !== row.skill;
  const label = {
    deepen: "Approfondir",
    train: "Leçon avec exemple",
    explore: "Découvrir ensemble",
    confirm: "Confirmer",
  }[row.category];
  return [
    {
      type: "lesson",
      id: target,
      text: `${label} : ${skillName(target)}`,
      prereq,
      parentNotSeen: state.skills[target].status === "not_seen",
    },
    ...(startable && row.category !== "train" && row.category !== "explore"
      ? [{ type: "mission", id: target, text: `Mission de 5 défis : ${skillName(target)}` }]
      : []),
  ];
}
// Une seule proposition claire pour Alma : d'abord ce qui a bien marché, jamais une notion marquée « pas encore abordée ».
export function nextAdventure(state, rows) {
  for (const category of ["deepen", "confirm", "train", "explore"])
    for (const row of rows) {
      if (row.category !== category || row.parent === "not_seen") continue;
      const target = resolveTarget(state, row.skill);
      if (state.skills[target].status === "not_seen") continue;
      return {
        skill: target,
        name: skillName(target),
        icon: skillIcon(target),
        mission: state.skills[target].status === "seen",
      };
    }
  return null;
}
export const explored = (run) =>
  run ? SAMPLED.filter((s) => countsOf(run, s).total > 0) : [];
