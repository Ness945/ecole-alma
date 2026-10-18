// Vues et événements du parcours « À la découverte de tes pouvoirs ».
// app.js ne fait que déléguer : le rendu, les actions « disc-* » et l'état d'écran vivent ici.
import { skills } from "./content.js";
import {
  STEPS,
  STEP_IDS,
  SAMPLED,
  RULES,
  OUTCOME_LABELS,
  NEEDS_PARENT_SEEN,
} from "./discovery-model.js";
import * as D from "./discovery.js";

const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const btn = (label, action, cls = "", extra = "") =>
  `<button class="${cls}" data-action="${action}" ${extra}>${label}</button>`;
const page = (title, body) =>
  `<main class="page disc-page"><div class="page-head">${btn("←", "home", "quiet", 'aria-label="Retour au royaume"')}<h1>${title}</h1></div>${body}</main>`;
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;
const TITLE = "À la découverte de tes pouvoirs";

// État d'écran non persistant : tout ce qui compte (question, saisie, aides, réponses) est dans state.discovery.
const ui = { step: null, ended: null, results: false, confirmRerun: false };
export const resetDiscoveryScreen = () => {
  Object.assign(ui, { step: null, ended: null, results: false, confirmRerun: false });
};

const lastRunWithObservations = (state) =>
  [...D.runList(state)]
    .sort((a, b) => b.started - a.started)
    .find((r) => D.explored(r).length > 0) ?? null;
const progressOf = (run) =>
  run ? D.allChallenges(run).length : 0;

// ───────────────────────── Accueil ─────────────────────────
const scene = `<svg class="disc-scene" viewBox="0 0 360 200" aria-hidden="true" focusable="false"><rect width="360" height="200" rx="26" fill="#e4ecdf"/><ellipse cx="180" cy="170" rx="150" ry="18" fill="#c9d6bf"/><path d="M60 158C112 116 168 152 222 112S300 96 316 58" fill="none" stroke="#b69b6a" stroke-width="7" stroke-linecap="round" stroke-dasharray="2 13"/><circle cx="118" cy="92" r="46" fill="#fffdf3" stroke="#8f7a4f" stroke-width="5"/><path d="M118 52l11 34 30 6-30 10-11 34-11-34-30-10 30-6Z" fill="#d9a441"/><circle cx="118" cy="92" r="6" fill="#6d5a34"/><text x="236" y="70" font-size="30" fill="#c9a24a">✦</text><text x="278" y="116" font-size="22" fill="#7ea58b">✦</text><text x="64" y="52" font-size="20" fill="#7ea58b">✦</text><text x="250" y="150" font-size="26" fill="#c9a24a">✦</text></svg>`;
export function discoveryTeaser(state) {
  const runs = D.runList(state),
    open = D.openRun(state),
    resumed = open && progressOf(open) > 0;
  const text = !runs.length
    ? "Trois petites explorations, sans note ni chronomètre, pour que Luna choisisse tes premières aventures."
    : open
      ? resumed
        ? "Ton exploration t’attend, exactement là où tu l’as laissée."
        : "Un nouveau voyage de découverte est prêt."
      : "Tes découvertes sont prêtes : Luna a une idée pour ta prochaine aventure.";
  const label = !runs.length
    ? "Commencer l’exploration →"
    : open
      ? resumed
        ? "Reprendre mon exploration →"
        : "Commencer l’exploration →"
      : "Voir mes découvertes →";
  return `<section class="disc-teaser" aria-labelledby="disc-teaser-title"><div><p class="eyebrow">NOUVEAU · UN PETIT VOYAGE DE DÉCOUVERTE</p><h2 id="disc-teaser-title">${TITLE}</h2><p>${text}</p>${btn(label, !runs.length || open ? "disc-hub" : "disc-results", "primary")}</div>${scene}</section>`;
}
export function discoveryParentSummary(state) {
  const runs = D.runList(state);
  const latest = [...runs].sort((a, b) => b.started - a.started)[0];
  return `<section class="panel disc-parent-summary"><p class="eyebrow">LE BILAN DE DÉPART</p><h2>${TITLE}</h2><p>${
    latest
      ? `${plural(runs.length, "bilan", "bilans")} conservé${runs.length > 1 ? "s" : ""} · dernier lancé le ${esc(D.dateFr(latest.started))} · ${plural(D.explored(latest).length, "notion explorée", "notions explorées")}.`
      : "Aucun bilan pour le moment. Indiquez d’abord ce qui a déjà été vu en classe, puis laissez Alma explorer à son rythme."
  }</p>${btn("Ouvrir le bilan et le contexte scolaire", "disc-parent", "small")}</section>`;
}

// ───────────────────────── Écrans de l'enfant ─────────────────────────
export function discoveryView(state) {
  const run = D.openRun(state);
  if (ui.step && run?.steps[ui.step]?.active) return questionView(state, run, ui.step);
  if (ui.ended) return endedView(state, ui.ended);
  if (ui.results && lastRunWithObservations(state)) return resultsView(state);
  ui.step = null;
  ui.results = false;
  return hubView(state, run);
}
function hubView(state, run) {
  const runs = D.runList(state);
  const canStart = Boolean(run) || !runs.length;
  const shown = run ?? [...runs].sort((a, b) => b.started - a.started)[0];
  const cards = STEPS.map((def) => {
    const step = shown && !shown.compact ? shown.steps[def.id] : null,
      status = step?.status ?? shown?.stepStatus?.[def.id] ?? "todo",
      n = step?.challenges.length ?? 0;
    const action =
      status === "done" || !canStart
        ? `<span class="disc-done">${status === "done" ? "✓ Exploré" : ""}</span>`
        : btn(status === "active" ? `Reprendre (${plural(n, "défi fait", "défis faits")}) →` : "Commencer →", "disc-open", "primary", `data-step="${def.id}"`);
    return `<li class="disc-step" data-state="${status}"><span class="disc-step-icon" aria-hidden="true">${def.icon}</span><div><h3>${def.name}</h3><p>${def.invite}</p></div>${action}</li>`;
  }).join("");
  const hasObservations = Boolean(lastRunWithObservations(state));
  return page(
    TITLE,
    `<section class="panel disc-luna"><p class="eyebrow">🦄 LUNA TE PRÉSENTE SON VOYAGE</p><h2>Bienvenue, ${esc(state.name)} !</h2><p class="intro-lesson">Luna voudrait découvrir quels sont tes pouvoirs, pour te proposer de belles aventures. Ce n’est pas un examen : il n’y a ni note, ni chronomètre, ni classement.</p><ul class="disc-promises"><li>Tu peux répondre « <strong>Je ne sais pas encore</strong> » ou « <strong>Je ne l’ai pas appris</strong> » : ce sont de très bonnes réponses.</li><li>Tu peux demander un exemple ou de l’aide.</li><li>Tu peux t’arrêter quand tu veux et reprendre plus tard, au même endroit.</li></ul>${!canStart && hasObservations ? '<p class="notice">Ce voyage est terminé. Un adulte pourra en relancer un autre plus tard.</p>' : ""}</section><ol class="disc-steps">${cards}</ol><div class="row disc-actions">${hasObservations ? btn("Voir mes découvertes", "disc-results", "secondary") : ""}${btn("Plus tard", "home", "quiet")}</div><details class="panel disc-adult"><summary>Pour l’adulte : à quoi sert ce parcours ?</summary><p>Quelques défis courts sur des notions déjà présentes dans l’application (nombres, calcul, lecture, mots) permettent de proposer de premières missions adaptées. Le résultat est un repérage provisoire et prudent, <strong>ni un diagnostic, ni une évaluation du niveau CE1</strong>. Avant de commencer, vous pouvez indiquer ce qui a déjà été vu en classe : « À vérifier » ne veut jamais dire « difficulté », et les réponses d’Alma ne modifient pas vos statuts.</p>${btn("Notions vues en classe et bilan parent", "disc-parent", "small")}</details>`,
  );
}
function questionView(state, run, stepId) {
  const def = STEPS.find((s) => s.id === stepId),
    step = run.steps[stepId],
    a = step.active,
    q = D.questionOf(run, a),
    skill = skills.find((s) => s.id === a.skill);
  const n = a.answered ? step.challenges.length : step.challenges.length + 1;
  const disabled = a.answered ? "disabled" : "";
  const reading = q.speech === "instruction";
  let input = "";
  if (q.form === "choice")
    input = `<div class="choices" role="group" aria-label="Réponses possibles">${q.options.map((o) => btn(esc(o), "disc-pick", a.draft === o ? "selected" : "", `data-value="${esc(o)}" aria-pressed="${a.draft === o}" ${disabled}`)).join("")}</div>`;
  if (q.form === "tap")
    input = `<div class="disc-sentence" role="group" aria-label="Touche un mot de la phrase">${q.tokens.map((t, i) => btn(esc(t), "disc-pick", `disc-token ${a.draft === String(i) ? "selected" : ""}`, `data-index="${i}" aria-pressed="${a.draft === String(i)}" ${disabled}`)).join("")}</div>`;
  if (q.form === "blocks") {
    const [t = 0, u = 0] = a.draft.split(",").map(Number);
    input = `<div class="blocks">${[
      ["Dizaines", t, "tens", "▰"],
      ["Unités", u, "units", "▪"],
    ]
      .map(
        ([name, v, key, icon]) =>
          `<div><strong>${name}</strong><output>${icon.repeat(v) || "—"}</output><div class="row">${btn("−", "disc-block", "", `data-part="${key}" data-step="-1" aria-label="Retirer une ${name.toLowerCase().slice(0, -1)}" ${disabled}`)}<span>${v}</span>${btn("+", "disc-block", "", `data-part="${key}" data-step="1" aria-label="Ajouter une ${name.toLowerCase().slice(0, -1)}" ${disabled}`)}</div></div>`,
      )
      .join("")}</div>`;
  }
  const hasDraft = a.draft !== "" && a.draft !== "0,0";
  const confirm =
    q.form === "input"
      ? `<form class="answer" id="disc-form"><label class="sr-only" for="disc-input">Ta réponse</label><input id="disc-input" autocomplete="off" maxlength="80" inputmode="${q.numeric ? "numeric" : "text"}" value="${esc(a.draft)}" ${disabled}><button class="primary" ${disabled}>C’est ma réponse ✓</button></form>`
      : `<p>${btn("C’est ma réponse ✓", "disc-confirm", "primary", !hasDraft || a.answered ? "disabled" : "")}</p>`;
  const helpRow = a.answered
    ? ""
    : `<div class="row disc-help">${btn("🔊 Écouter la consigne", "disc-read", "small")}${reading ? btn("👂 Écouter le texte (aide)", "disc-read-text", "small", `aria-pressed="${a.help.voice}"`) + btn("🧑 Un adulte me lit le texte (aide)", "disc-adult", "small", `aria-pressed="${a.help.adult}"`) : btn("🧑 Un adulte m’aide", "disc-adult", "small", `aria-pressed="${a.help.adult}"`)}${btn("💡 Un exemple pour m’aider", "disc-hint", "small", `aria-pressed="${a.help.hint}"`)}</div>${a.help.hint ? `<div class="notice disc-example" role="status">💡 ${esc(q.example)}</div>` : ""}<div class="row disc-escape">${btn("🤷 Je ne sais pas encore", "disc-skip", "quiet")}${btn("📚 Je ne l’ai pas appris", "disc-notlearned", "quiet")}</div>`;
  const thanks = {
    skipped:
      "Merci de me l’avoir dit ! « Pas encore » est une réponse très utile pour Luna.",
    not_learned:
      "Merci ! Si tu ne l’as pas encore appris, on le découvrira ensemble plus tard.",
  }[a.outcome] ?? "Merci, j’ai bien noté ta réponse ! ✨";
  const more = a.answered ? D.nextChallenge(state, run, stepId) : null;
  const feedback = a.answered
    ? `<div class="feedback disc-thanks" role="status">🦄 ${thanks}<br><small>Ici, chaque réponse aide Luna à choisir tes aventures : il n’y a pas de note.</small><br>${btn(more ? "Défi suivant →" : "Terminer cette exploration →", "disc-next", "primary")} ${btn("✋ Je m’arrête pour aujourd’hui", "disc-stop", "quiet")}</div>`
    : "";
  return `<main class="exercise disc-question"><div class="row" style="justify-content:space-between">${btn("← Faire une pause", "disc-pause", "quiet")}<span class="muted">${def.icon} ${def.short} · défi ${n}</span></div><div class="disc-sparks" aria-hidden="true">${"✦".repeat(step.challenges.length)}${a.answered ? "" : "<span>◇</span>"}</div><section class="panel"><p class="eyebrow">${skill.icon} ${esc(skill.name)}</p>${q.passage ? `<div class="passage" lang="fr">${esc(q.passage)}</div>` : ""}<h2>${esc(q.prompt)}</h2>${q.visual ? `<div class="visual" aria-label="Image à observer">${esc(q.visual)}</div>` : ""}${input}${confirm}${helpRow}${feedback}</section></main>`;
}
const endMessages = {
  complete: "Tu as terminé cette exploration. Bravo pour ta curiosité !",
  limit: "On a déjà exploré beaucoup de choses ! On s’arrête ici : c’est très bien.",
  fatigue:
    "On a bien cherché. C’est le bon moment pour faire une pause : tu pourras revenir quand tu voudras.",
  asked: "Tu as choisi de t’arrêter ici. C’est très bien : on continuera une autre fois.",
};
function endedView(state, ended) {
  const run = D.openRun(state) ?? lastRunWithObservations(state);
  const def = STEPS.find((s) => s.id === ended.step);
  const remaining = run && !run.compact ? STEPS.filter((s) => run.steps[s.id].status !== "done") : [];
  return page(
    def.name,
    `<section class="panel celebration"><div class="emoji">🌟</div><h2>${endMessages[ended.reason] ?? endMessages.complete}</h2>${ended.granted ? `<p class="disc-reward">🎁 Pour ta participation, Luna t’offre <strong>🪙 ${RULES.participationCoins} pièces</strong> et <strong>🌱 ${RULES.participationSeeds} graine</strong>. Ce cadeau n’arrive qu’une seule fois et ne dépend pas de tes réponses.</p>` : ""}<p class="sub">${remaining.length ? "Tu peux faire une autre exploration maintenant ou plus tard." : "Les trois explorations sont terminées !"}</p><div class="row" style="justify-content:center">${btn("Voir mes découvertes", "disc-results", "primary")} ${remaining.length ? btn("Choisir une autre exploration", "disc-hub", "secondary") : ""} ${btn("Retour au royaume", "home", "quiet")}</div></section>`,
  );
}
function resultsView(state) {
  const report = D.buildReport(state),
    run = lastRunWithObservations(state),
    names = D.explored(run);
  const next = D.nextAdventure(state, report.rows);
  const open = D.openRun(state);
  return page(
    "Tes découvertes",
    `<section class="panel"><p class="eyebrow">🦄 MERCI POUR TON EXPLORATION</p><h2>Tu as exploré ${plural(names.length, "pouvoir", "pouvoirs")} avec Luna.</h2><p class="intro-lesson">Bravo d’avoir essayé, demandé de l’aide et dit quand tu ne savais pas encore. C’est exactement ce qui aide Luna à bien te connaître.</p><div class="disc-explored">${names.map((id) => `<span class="disc-chip-explored">${skills.find((s) => s.id === id).icon} ${esc(D.skillName(id))}</span>`).join("")}</div><p class="sub">Il n’y a ni note ni classement : ce sont des pistes pour tes prochaines aventures. Tes découvertes s’enrichiront avec tes missions.</p></section><section class="panel disc-next"><p class="eyebrow">TA PROCHAINE AVENTURE</p>${next ? `<h2>${next.icon} ${esc(next.name)}</h2><p>Luna pense que ce sera une belle aventure pour toi.</p>${next.mission ? btn("Partir en mission →", "disc-mission", "primary", `data-id="${next.skill}"`) : btn("Découvrir avec Luna →", "lesson", "primary", `data-id="${next.skill}"`)}` : `<h2>À toi de choisir !</h2><p>Choisis la mission qui te fait envie.</p>${btn("Choisir ma mission →", "missions", "primary")}`}</section><div class="row">${open ? btn("Continuer l’exploration", "disc-hub", "secondary") : ""}${btn("Retour au royaume", "home", "quiet")}</div>`,
  );
}

// ───────────────────────── Espace parent ─────────────────────────
const MISSION_TEXT = {
  none: "pas encore de preuve",
  trying: "premiers essais, sans réussite autonome pour l’instant",
  started: "premières réussites autonomes",
  ready: "base suffisante pour passer à la suite",
  mastered: "preuves variées et espacées",
};
function describeCounts(c) {
  const p = [];
  if (c.A) p.push(plural(c.A, "réussite autonome", "réussites autonomes"));
  if (c.H) p.push(plural(c.H, "réussite avec aide", "réussites avec aide"));
  if (c.W) p.push(plural(c.W, "réponse incorrecte", "réponses incorrectes"));
  if (c.S) p.push(plural(c.S, "question passée", "questions passées"));
  if (c.N) p.push(plural(c.N, "« Je ne l’ai pas appris »", "« Je ne l’ai pas appris »"));
  if (c.D) p.push(plural(c.D, "réussite après un exemple montré ou déjà vu (non indépendante)", "réussites après un exemple montré ou déjà vu (non indépendantes)"));
  return p.length ? `${plural(c.total, "observation", "observations")} : ${p.join(" · ")}` : "Aucune observation";
}
function rowHtml(state, row) {
  const actions = D.actionsFor(state, row)
    .map((x) =>
      x.type === "lesson"
        ? btn(esc(x.text), "lesson", "small", `data-id="${x.id}"`)
        : btn(esc(x.text), "disc-mission", "small", `data-id="${x.id}"`),
    )
    .join("");
  const prereq = D.actionsFor(state, row).find((x) => x.type === "lesson" && x.prereq);
  const notSeen = D.actionsFor(state, row).find((x) => x.type === "lesson" && x.parentNotSeen);
  const obs = row.observations.length
    ? `<ul class="disc-obs">${row.observations.map((o) => `<li>${esc(o.task)} — ${esc(o.form)} — <strong>${OUTCOME_LABELS[o.outcome]}</strong>${o.help.length ? ` (aide : ${o.help.join(", ")})` : ""}${o.afterDemo ? " · après un exemple montré" : ""}${o.repeated ? " · exemple déjà vu" : ""}</li>`).join("")}</ul>`
    : "";
  const history = row.previous.length
    ? `<p class="sub">Bilans précédents : ${row.previous.map((h) => `${esc(D.dateFr(h.date))} — ${esc(describeCounts(h.counts))}`).join(" ; ")}.</p>`
    : "";
  return `<section class="disc-row" data-skill="${row.skill}" data-category="${row.category}"><div class="disc-row-head"><h4>${row.icon} ${esc(row.name)}</h4><span class="disc-chip disc-chip--${row.category}">${D.CATEGORIES[row.category]}</span></div><p>${esc(row.reason)}</p>${row.note ? `<p class="notice">${esc(row.note)}</p>` : ""}${row.counts.total ? `<p class="disc-counts">${esc(describeCounts(row.counts))}${row.date ? ` · bilan du ${esc(D.dateFr(row.date))}` : ""}</p>${obs}` : ""}${history}<p class="sub">Dans les missions (preuves de maîtrise, indépendantes de ce bilan) : ${MISSION_TEXT[row.missions]}.</p>${prereq ? `<p class="sub">Les prérequis passent d’abord : la proposition commence par « ${esc(D.skillName(prereq.id))} ».</p>` : ""}${notSeen ? `<p class="sub">Cette notion est marquée « pas encore abordée » : c’est à vous de décider si vous souhaitez la découvrir maintenant.</p>` : ""}${actions ? `<div class="row">${actions}</div>` : ""}</section>`;
}
export function discoveryParentView(state, { sessionActive = false } = {}) {
  const report = D.buildReport(state),
    advice = D.rerunAdvice(state);
  const context = SAMPLED.map((id) => {
    const s = skills.find((x) => x.id === id),
      p = state.skills[id];
    return `<div class="disc-context-row"><label for="ctx-${id}">${s.icon} ${esc(s.name)}${NEEDS_PARENT_SEEN.includes(id) ? ' <small>(proposée seulement si « déjà travaillé »)</small>' : ""}</label><select id="ctx-${id}" data-status="${id}" aria-label="Statut scolaire : ${esc(s.name)}" ${sessionActive ? "disabled" : ""}>${[
      ["unknown", "À vérifier"],
      ["seen", "Déjà travaillé"],
      ["not_seen", "Pas encore abordé"],
    ]
      .map(([v, t]) => `<option value="${v}" ${p.status === v ? "selected" : ""}>${t}</option>`)
      .join("")}</select></div>`;
  }).join("");
  const groups = STEPS.map((def) => {
    const rows = report.rows.filter((r) => r.step === def.id);
    return `<section class="panel"><h3>${def.icon} ${def.name}</h3>${rows.map((r) => rowHtml(state, r)).join("")}</section>`;
  }).join("");
  const history = report.runs.length
    ? `<ul class="disc-history">${report.runs.map((r) => `<li>Bilan du ${esc(D.dateFr(r.started))} — ${r.finished ? "terminé" : r.abandoned ? "interrompu (observations conservées)" : "en cours"} · ${plural(r.compact ? Object.values(r.summary).reduce((n, s) => n + s.A + s.D + s.H + s.W + s.S + s.N, 0) : D.allChallenges(r).length, "défi", "défis")}${r.compact ? " (résumé)" : ""}</li>`).join("")}</ul>`
    : "<p>Aucun bilan pour le moment.</p>";
  const rerun = ui.confirmRerun
    ? `<div class="notice" role="alert"><p>${advice.open ? "Un bilan est en cours : il sera conservé tel quel (observations incluses) et marqué « interrompu ». " : ""}${advice.recent ? `Le dernier bilan est terminé depuis moins de ${RULES.rerunDays} jours : des réponses de mémoire à court terme sont possibles. ` : ""}Les exemples des deux derniers bilans sont évités et la récompense de participation ne sera pas redonnée. L’historique est conservé.</p>${btn("Oui, relancer un bilan", "disc-rerun-confirm", "primary")} ${btn("Annuler", "disc-rerun-cancel", "quiet")}</div>`
    : btn("Relancer un bilan", "disc-rerun", "secondary");
  return page(
    "Bilan parent",
    `<section class="panel"><p class="eyebrow">BILAN PROVISOIRE</p><h2>${TITLE}</h2><p>Un repérage prudent de quelques notions de l’application, pour choisir les premières missions d’Alma. <strong>Ce n’est ni un diagnostic scolaire ou clinique, ni une évaluation du niveau CE1</strong> : il n’y a ni note globale ni certification, et il s’enrichit avec les missions suivantes.</p>${btn("Ouvrir le parcours d’Alma", "disc-hub", "secondary")}</section><section class="panel"><h2>Notions déjà abordées en classe</h2><p>Ce sont les statuts scolaires habituels de l’espace parent. « À vérifier » signifie seulement « inconnu » : cela ne veut jamais dire « difficulté ». Les notions « pas encore abordées » ne sont pas proposées. Si Alma répond « Je ne l’ai pas appris », cela reste une observation du bilan et ne change jamais ces statuts.</p>${sessionActive ? '<p class="notice">Une mission est en cours : les statuts pourront être modifiés après sa fin.</p>' : ""}<div class="disc-context">${context}</div></section>${report.runs.length ? groups : '<section class="panel"><p>Aucun bilan pour le moment : les résultats apparaîtront ici après les premiers défis d’Alma.</p></section>'}<section class="panel"><h2>Comment lire ce bilan</h2><ul class="disc-legend"><li><strong>À approfondir</strong> : au moins ${RULES.independentSuccesses} réussites autonomes sur des exemples différents et aucune réponse non aboutie.</li><li><strong>À entraîner avec un exemple</strong> : une aide a été utile, ou plusieurs réponses non abouties (notion pas encore vue, consigne mal comprise ou fatigue sont possibles).</li><li><strong>À explorer</strong> : notion que vous avez marquée « pas encore abordée », ou que l’enfant déclare ne pas avoir apprise (à confirmer).</li><li><strong>À confirmer</strong> : moins de ${RULES.minObservations} observations indépendantes, ou résultats contradictoires.</li><li><strong>Non évaluée</strong> : non proposée (prérequis, contexte scolaire, pause ou limite de défis).</li></ul><p class="sub">Règles : un défi accessible, puis un exemple différent pour confirmer ; au plus ${RULES.maxPerSkill} défis par notion ; arrêt d’une notion après ${RULES.skillStopStreak} réponses non abouties ou passées d’affilée ; pause conseillée après ${RULES.stepStopStreak} défis non réussis d’affilée dans une étape. Une réussite après un exemple montré ou sur un exemple déjà vu n’est pas comptée comme preuve indépendante. Aucune correction n’est affichée pendant le bilan. Le bilan le plus récent de chaque notion fait foi ; les précédents restent consultables. Ces observations ne modifient ni les seuils de maîtrise ni les preuves des missions.</p></section><section class="panel"><h2>Nouveau bilan et historique</h2>${history}${rerun}</section>`,
  );
}

// ───────────────────────── Événements ─────────────────────────
// ctx : { state, persist, render, go, speak, toast, startMission, now, seed, uuid }
function current(ctx) {
  const run = D.openRun(ctx.state),
    step = ui.step && run ? run.steps[ui.step] : null;
  return { run, step, active: step?.active ?? null };
}
function submit(ctx, input) {
  const { run, active } = current(ctx);
  if (!active) return;
  const result = D.answerActive(ctx.state, run, ui.step, input, ctx.now());
  if (!result) return;
  if (result.error) {
    ctx.toast("Écris ou choisis une réponse, ou touche « Je ne sais pas encore ».");
    return;
  }
  ctx.persist();
  ctx.render();
}
function endStep(ctx, run, stepId, outcome) {
  ui.ended = { step: stepId, reason: run.steps[stepId].stopReason || "complete", granted: outcome.granted };
  ui.step = null;
}
export function discoveryAction(ctx, b) {
  const a = b.dataset.action,
    { state } = ctx;
  if (a === "disc-hub") {
    resetDiscoveryScreen();
    ctx.go("discovery");
    return;
  }
  if (a === "disc-results") {
    Object.assign(ui, { step: null, ended: null, results: true });
    ctx.go("discovery");
    return;
  }
  if (a === "disc-parent") {
    ctx.go("discovery-parent");
    return;
  }
  if (a === "disc-open") {
    const stepId = b.dataset.step;
    if (!STEP_IDS.includes(stepId)) return;
    let run = D.openRun(state);
    if (!run) {
      if (D.runList(state).length) {
        ctx.toast("Un adulte pourra relancer un nouveau voyage plus tard.");
        return;
      }
      run = D.startRun(state, ctx.seed(), ctx.uuid(), ctx.now());
    }
    if (run.steps[stepId].status === "done") return;
    const r = D.ensureActive(state, run, stepId, ctx.now());
    if (r.ended) endStep(ctx, run, stepId, r);
    else Object.assign(ui, { step: stepId, ended: null, results: false });
    ctx.persist();
    ctx.render();
    return;
  }
  if (a === "disc-pause") {
    ui.step = null;
    ctx.go("home");
    ctx.toast("Ton exploration est en pause. Tu pourras la reprendre quand tu voudras.");
    return;
  }
  if (a === "disc-rerun" || a === "disc-rerun-cancel") {
    ui.confirmRerun = a === "disc-rerun";
    ctx.render();
    return;
  }
  if (a === "disc-rerun-confirm") {
    D.startRun(state, ctx.seed(), ctx.uuid(), ctx.now());
    resetDiscoveryScreen();
    ctx.persist();
    ctx.go("discovery");
    ctx.toast("Un nouveau bilan est prêt. L’historique est conservé.");
    return;
  }
  if (a === "disc-mission") {
    const id = b.dataset.id;
    if (SAMPLED.includes(id) || skills.some((s) => s.id === id)) {
      if (state.skills[id]?.status === "seen") ctx.startMission(id);
      else ctx.toast("Cette notion n’est pas encore marquée « déjà travaillée » : ouvrez plutôt sa leçon.");
    }
    return;
  }
  const { run, active } = current(ctx);
  if (!run || !active) return;
  const stepId = ui.step,
    q = D.questionOf(run, active);
  if (a === "disc-pick" && !active.answered) {
    D.setDraft(run, stepId, b.dataset.index ?? b.dataset.value);
  } else if (a === "disc-block" && !active.answered) {
    let [t = 0, u = 0] = active.draft.split(",").map(Number);
    const step = Number(b.dataset.step);
    if (b.dataset.part === "tens") t = Math.min(9, Math.max(0, t + step));
    else u = Math.min(9, Math.max(0, u + step));
    D.setDraft(run, stepId, `${t},${u}`);
  } else if (a === "disc-confirm") {
    if (q.form === "blocks") {
      const [t = 0, u = 0] = active.draft.split(",").map(Number);
      submit(ctx, { kind: "answer", value: String(t * 10 + u) });
    } else if (q.form === "tap")
      submit(ctx, { kind: "answer", value: q.tokens[Number(active.draft)] ?? "" });
    else submit(ctx, { kind: "answer", value: active.draft });
    return;
  } else if (a === "disc-hint") D.setHelp(run, stepId, "hint");
  else if (a === "disc-adult") D.setHelp(run, stepId, "adult");
  else if (a === "disc-read") {
    ctx.speak(
      q.speech === "instruction"
        ? q.instruction
        : [q.prompt, q.sentence].filter(Boolean).join(" "),
    );
    return;
  } else if (a === "disc-read-text") {
    D.setHelp(run, stepId, "voice");
    ctx.speak([q.passage, q.prompt].filter(Boolean).join(" "));
  } else if (a === "disc-skip" || a === "disc-notlearned") {
    submit(ctx, { kind: a === "disc-skip" ? "skip" : "not_learned" });
    return;
  } else if (a === "disc-next") {
    const r = D.advance(state, run, stepId, ctx.now());
    if (r.ended) endStep(ctx, run, stepId, r);
  } else if (a === "disc-stop") {
    const r = D.stopStep(state, run, stepId, ctx.now());
    if (r.refused) return;
    endStep(ctx, run, stepId, r);
  } else return;
  ctx.persist();
  ctx.render();
}
export function discoveryInput(ctx, el) {
  if (el.id !== "disc-input") return;
  const { run, active } = current(ctx);
  if (active && !active.answered && D.setDraft(run, ui.step, el.value)) ctx.persist();
}
export function discoverySubmit(ctx) {
  const el = document.querySelector("#disc-input");
  submit(ctx, { kind: "answer", value: el?.value ?? "" });
}
