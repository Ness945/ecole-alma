// Modèle de données du parcours « À la découverte de tes pouvoirs » et validation (sauvegarde locale et import).
// Les observations du bilan sont stockées dans state.discovery, séparément des preuves de maîtrise (state.skills).
import { FAMILIES, has } from "./discovery-bank.js";

export const DISCOVERY_VERSION = 1;
export const STEPS = [
  {
    id: "numbers",
    name: "Les nombres et le calcul",
    short: "Nombres et calcul",
    icon: "🔢",
    skills: ["number", "addition", "subtract", "problem"],
    limit: 10,
    invite: "Construire des nombres, additionner, soustraire et résoudre un petit problème.",
  },
  {
    id: "reading",
    name: "Lire et comprendre",
    short: "Lecture",
    icon: "📖",
    skills: ["reading"],
    limit: 4,
    invite: "Lire un tout petit texte et répondre à une question.",
  },
  {
    id: "grammar",
    name: "Les mots et les phrases",
    short: "Mots et phrases",
    icon: "✏️",
    skills: ["noun", "determiner", "verb", "subject"],
    limit: 10,
    invite: "Retrouver les noms, les petits mots qui les présentent et, si c’est le moment, les verbes.",
  },
];
export const STEP_IDS = STEPS.map((s) => s.id);
export const SAMPLED = STEPS.flatMap((s) => s.skills);
export const stepOf = (skill) => STEPS.find((s) => s.skills.includes(skill));

// Règles explicites (documentées dans docs/DISCOVERY.md).
export const RULES = {
  maxPerSkill: 3, // défis maximum par notion
  skillStopStreak: 2, // non-réussites consécutives qui arrêtent une notion
  stepStopStreak: 3, // non-réussites consécutives qui arrêtent une étape (pause conseillée)
  minObservations: 2, // observations indépendantes minimum avant une recommandation
  independentSuccesses: 2, // réussites autonomes indépendantes pour « À approfondir »
  rerunDays: 3, // délai conseillé avant un nouveau bilan
  keepDetailedRuns: 8, // bilans conservés en détail ; les plus anciens sont résumés, jamais supprimés
  recentRunsAvoided: 2, // exemples des deux derniers bilans évités
  participationCoins: 5,
  participationSeeds: 1,
};
// Notions que l'on ne propose que si le parent les a marquées « déjà travaillées ».
export const NEEDS_PARENT_SEEN = ["verb", "subject"];

export const OUTCOMES = ["auto", "helped", "wrong", "skipped", "not_learned"];
export const OUTCOME_LABELS = {
  auto: "réussite autonome",
  helped: "réussite accompagnée",
  wrong: "réponse incorrecte",
  skipped: "question passée",
  not_learned: "notion déclarée non apprise",
};
export const STEP_STATUS = ["todo", "active", "done"];
export const STOP_REASONS = ["", "complete", "limit", "fatigue", "asked"];
const FORMS = ["choice", "input", "blocks", "tap"];
const COUNT_KEYS = ["A", "Q", "D", "H", "W", "S", "N"];

const int = (x, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(x) && x >= 0 && x <= max;
const isBool = (x) => typeof x === "boolean";
const stamp = (x) => Number.isFinite(x) && x >= 0;
const plain = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

export function newDiscovery() {
  return {
    v: DISCOVERY_VERSION,
    rewardGranted: false,
    rewardAt: null,
    current: null,
    runs: [],
  };
}
export function newStep() {
  return { status: "todo", stopReason: "", challenges: [], active: null };
}
export function newRun(id, seed, now) {
  return {
    id,
    seed,
    started: now,
    finished: null,
    abandoned: false,
    steps: Object.fromEntries(STEP_IDS.map((s) => [s, newStep()])),
  };
}

function validChallenge(c, stepId) {
  if (!plain(c) || !has(c.item)) return false;
  const f = FAMILIES[c.item];
  return (
    STEPS.find((s) => s.id === stepId).skills.includes(c.skill) &&
    f.skill === c.skill &&
    int(c.variant, f.variants.length - 1) &&
    OUTCOMES.includes(c.outcome) &&
    FORMS.includes(c.form) &&
    typeof c.task === "string" &&
    c.task.length < 140 &&
    ["afterDemo", "repeated", "hint", "voice", "adult"].every((k) =>
      isBool(c[k]),
    ) &&
    stamp(c.at)
  );
}
function validActive(a, step, stepId) {
  if (!plain(a) || !has(a.item)) return false;
  const f = FAMILIES[a.item];
  if (
    !STEPS.find((s) => s.id === stepId).skills.includes(a.skill) ||
    f.skill !== a.skill ||
    !int(a.variant, f.variants.length - 1) ||
    !isBool(a.afterDemo) ||
    !isBool(a.repeated) ||
    typeof a.draft !== "string" ||
    a.draft.length > 200 ||
    !Array.isArray(a.order) ||
    a.order.length > 12 ||
    a.order.some((x) => !int(x, 50)) ||
    !plain(a.help) ||
    !["hint", "voice", "adult"].every((k) => isBool(a.help[k])) ||
    !isBool(a.answered) ||
    !(a.outcome === "" || OUTCOMES.includes(a.outcome))
  )
    return false;
  if (a.answered) {
    const last = step.challenges.at(-1);
    return (
      a.outcome !== "" &&
      last !== undefined &&
      last.item === a.item &&
      last.variant === a.variant &&
      last.outcome === a.outcome
    );
  }
  return a.outcome === "";
}
function validStep(s, stepId) {
  if (
    !plain(s) ||
    !STEP_STATUS.includes(s.status) ||
    !STOP_REASONS.includes(s.stopReason) ||
    !Array.isArray(s.challenges) ||
    s.challenges.length > 40 ||
    !s.challenges.every((c) => validChallenge(c, stepId))
  )
    return false;
  if (s.status === "todo" && (s.challenges.length || s.active)) return false;
  if (s.status === "done" && s.active !== null) return false;
  if (s.active !== null && !validActive(s.active, s, stepId)) return false;
  return true;
}
function validCompactRun(r) {
  return (
    r.compact === true &&
    plain(r.summary) &&
    Object.keys(r.summary).every(
      (k) =>
        SAMPLED.includes(k) &&
        plain(r.summary[k]) &&
        COUNT_KEYS.every((c) => int(r.summary[k][c], 99)),
    ) &&
    plain(r.stepStatus) &&
    STEP_IDS.every((id) => STEP_STATUS.includes(r.stepStatus[id]))
  );
}
function validRun(r) {
  if (
    !plain(r) ||
    typeof r.id !== "string" ||
    !/^[A-Za-z0-9:_-]{1,64}$/.test(r.id) ||
    !int(r.seed, 4294967295) ||
    !stamp(r.started) ||
    !(r.finished === null || stamp(r.finished)) ||
    !isBool(r.abandoned)
  )
    return false;
  if (r.compact !== undefined) return validCompactRun(r);
  return (
    plain(r.steps) &&
    STEP_IDS.every((id) => validStep(r.steps[id], id)) &&
    Object.keys(r.steps).length === STEP_IDS.length
  );
}
export function validDiscovery(d) {
  if (d === undefined) return true;
  if (
    !plain(d) ||
    d.v !== DISCOVERY_VERSION ||
    !isBool(d.rewardGranted) ||
    !(d.rewardAt === null || stamp(d.rewardAt)) ||
    !(d.current === null || typeof d.current === "string") ||
    !Array.isArray(d.runs) ||
    d.runs.length > 200 ||
    !d.runs.every(validRun)
  )
    return false;
  if (new Set(d.runs.map((r) => r.id)).size !== d.runs.length) return false;
  const open = d.runs.filter((r) => r.finished === null && !r.abandoned);
  if (d.current === null) return open.length === 0;
  return open.length === 1 && open[0].id === d.current && !open[0].compact;
}
