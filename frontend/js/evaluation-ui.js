// Écrans du bilan, des points faibles et du rapport parent. Les textes parlent d'« à découvrir »,
// jamais d'échec : la carte n'est pas une note.
import { skills } from "./content.js";
import {
  assessmentBatches,
  assessmentProgress,
  mapStatus,
  MAP_LABELS,
  weakScores,
  weakQueue,
  fluency,
  FLUENCY_LABELS,
  tierFor,
  TIERED,
  TIER_LABELS,
  weeklyReport,
  skillName,
} from "./evaluation.js";

const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const btn = (label, action, cls = "", extra = "") => `<button data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
const pct = (x) => `${Math.round(x * 100)} %`;

// Page enfant : le bilan par séries + la mission « points faibles ».
export function bilanView(state) {
  const batches = assessmentBatches(),
    prog = assessmentProgress(state),
    weak = weakQueue(state).length;
  const sets = batches
    .map((b) => {
      const done = b.skills.filter((id) => state.assessment?.[id]).length;
      return `<article class="course-card bilan-set"><span class="course-tag">${done === b.skills.length ? "Terminé" : done ? `${done}/${b.skills.length}` : "À faire"}</span><h3>${esc(b.subject)}${b.parts > 1 ? ` · partie ${b.part}` : ""}</h3><p>${b.skills.length} petites questions, une par pouvoir. Pas de note : c’est pour que Luna te propose les bonnes missions.</p><div class="bilan-chips">${b.skills
        .map((id) => {
          const [ic, label] = MAP_LABELS[mapStatus(state, id)];
          return `<span class="bilan-chip map-${mapStatus(state, id)}" title="${esc(label)}">${ic} ${esc(skillName(id))}</span>`;
        })
        .join("")}</div>${state.session ? btn("Reprendre ma mission", "resume", "secondary") : btn(done === b.skills.length ? "Refaire ce bilan" : "Commencer →", "bilan-start", "secondary", `data-batch="${b.id}"`)}</article>`;
    })
    .join("");
  return `<section class="panel bilan-intro"><p class="eyebrow">🦄 Le bilan de Luna</p><h2>Où en es-tu vraiment ?</h2><p>Une petite question pour chaque pouvoir, par séries de 8 environ. Tu peux en faire une aujourd’hui, une autre demain. « Je ne sais pas » est une bonne réponse : ça aide Luna à te proposer les bons défis.</p><p class="sub">${prog.done} pouvoirs explorés sur ${prog.total}.</p><div class="legend">${Object.entries(MAP_LABELS)
    .map(([k, [ic, label]]) => `<span class="bilan-chip map-${k}">${ic} ${label}</span>`)
    .join("")}</div>${weak ? `<div class="notice weak-note">${btn("🎯 Ma mission « points à renforcer »", "weak-start", "primary")}<small>6 défis sur ce qui demande encore un peu d’entraînement.</small></div>` : ""}</section><div class="course-grid">${sets}</div>${btn("← Toutes les missions", "missions", "quiet")}`;
}
// Fin d'une série de bilan : la carte des résultats, en douceur.
export function bilanFinish(state, session) {
  const ids = [...new Set(session.queue)];
  const rows = ids
    .map((id) => {
      const st = mapStatus(state, id),
        [ic, label] = MAP_LABELS[st];
      return `<li class="map-${st}">${ic} <strong>${esc(skillName(id))}</strong> — ${label}${st === "low" || st === "mid" ? ` ${btn("Voir la leçon", "lesson", "small quiet", `data-id="${id}"`)}` : ""}</li>`;
    })
    .join("");
  return `<section class="panel celebration"><div class="emoji">🗺️</div><h2>Ta carte est prête</h2><p>Luna a dessiné ta carte. Les pouvoirs « à découvrir » ne sont pas des échecs : ce sont tes prochaines aventures.</p><ul class="bilan-result">${rows}</ul><p>⭐ ${session.queue.length} étoiles d’aventure · 🌱 2 graines · 🪙 10 pièces</p><p>${btn("Retour au bilan", "bilan-back", "primary")} ${btn("Retour au menu principal", "finish-home", "secondary")} ${btn("Planter mes graines", "finish", "quiet")}</p></section>`;
}
// Petite carte d'invitation sur la page des missions.
export function bilanTeaser(state) {
  const prog = assessmentProgress(state),
    weak = weakQueue(state).length;
  return `<section class="bilan-teaser"><div><p class="eyebrow">🦄 Luna t’aide à choisir</p><h3>${prog.done ? `Ma carte des pouvoirs · ${prog.done}/${prog.total}` : "Faire le bilan des pouvoirs"}</h3><p>${weak ? "Luna a repéré quelques pouvoirs à renforcer." : "Une petite question par pouvoir pour savoir par où commencer."}</p></div><div>${btn(prog.done ? "Ouvrir ma carte →" : "Faire le bilan →", "bilan", "secondary")} ${weak && !state.session ? btn("🎯 Points à renforcer", "weak-start", "primary") : ""}</div></section>`;
}

// ───────── Espace parent ─────────
const fmtMin = (ms) => (ms < 60000 ? `${Math.max(1, Math.round(ms / 1000))} s` : `${Math.round(ms / 60000)} min`);
function delta(cur, prev) {
  if (cur === null || prev === null) return "";
  const d = Math.round((cur - prev) * 100);
  return d === 0 ? " (stable)" : d > 0 ? ` (+${d} points)` : ` (${d} points)`;
}
export function weeklyReportView(state, now = Date.now()) {
  const r = weeklyReport(state, now);
  if (!r.cur.answered) return `<section class="panel week-report"><p class="eyebrow">Rapport de la semaine</p><h2>Pas encore de défis cette semaine.</h2><p>Une mission de 5 défis suffit pour recommencer doucement.</p></section>`;
  const li = (items, f) => (items.length ? `<ul>${items.map((x) => `<li>${f(x)}</li>`).join("")}</ul>` : "<p class=\"muted\">Rien de particulier cette semaine.</p>");
  return `<section class="panel week-report" id="week-report"><p class="eyebrow">Rapport de la semaine</p><h2>${r.cur.answered} défis sur ${r.cur.days} jour${r.cur.days > 1 ? "s" : ""}, ${pct(r.cur.rate)} réussis sans aide${delta(r.cur.rate, r.prev.rate)}</h2><p>${r.cur.missions} mission${r.cur.missions > 1 ? "s" : ""}${r.cur.ms ? ` · environ ${fmtMin(r.cur.ms)} de travail` : ""}${r.prev.answered ? ` · semaine précédente : ${r.prev.answered} défis, ${pct(r.prev.rate)}` : ""}.</p>
<div class="week-cols"><div><h3>🌷 Trois forces</h3>${li(r.strengths, (x) => `<strong>${esc(skillName(x.id))}</strong> — ${x.solo}/${x.tries} sans aide`)}${r.progress.length ? `<h4>📈 En progrès</h4>${li(r.progress, (x) => esc(skillName(x.id)))}` : ""}</div>
<div><h3>🌱 À renforcer</h3>${li(r.weak, (w) => `<strong>${esc(skillName(w.id))}</strong>${w.reasons.length ? ` — ${esc(w.reasons.slice(0, 2).join(", "))}` : ""}`)}</div></div>
<h3>🏠 À faire à la maison (5 minutes, sans écran)</h3>${li(r.home, (h) => `<strong>${esc(skillName(h.id))}</strong> : ${esc(h.tip)}`)}</section>`;
}
export function mapParentView(state) {
  const prog = assessmentProgress(state);
  const subjects = [...new Set(skills.map((s) => s.subject))];
  return `<section class="panel map-report"><p class="eyebrow">Carte des petits pouvoirs</p><h2>${prog.done ? `${prog.done} pouvoirs explorés au bilan sur ${prog.total}` : "Le bilan n’a pas encore été fait"}</h2><p>🌷 acquis · 🌿 à consolider · 🌱 à découvrir ou revoir · ◻︎ pas encore vu. « À découvrir » ne veut pas dire « raté » : la notion n’est simplement pas encore acquise.</p>${subjects
    .map(
      (sub) =>
        `<h3>${esc(sub)}</h3><div class="bilan-chips">${skills
          .filter((s) => s.subject === sub)
          .map((s) => {
            const st = mapStatus(state, s.id),
              [ic, label] = MAP_LABELS[st];
            return `<span class="bilan-chip map-${st}" title="${esc(label)}">${ic} ${esc(s.name)}</span>`;
          })
          .join("")}</div>`,
    )
    .join("")}${prog.done ? "" : btn("Lancer le bilan avec elle", "bilan", "secondary")}</section>`;
}
export function fluencyView(state) {
  const rows = skills
    .map((s) => ({ s, f: fluency(state, s.id), tier: TIERED.has(s.id) ? tierFor(state, s.id) : null }))
    .filter((x) => x.f || (x.tier !== null && state.history.some((e) => e.skill === x.s.id)));
  if (!rows.length) return "";
  return `<section class="panel fluency-report"><p class="eyebrow">Rapidité et difficulté</p><h2>Ce qui devient automatique</h2><p class="sub">Le temps est mesuré sans que l’enfant voie de chrono. Une réponse juste mais lente signale une notion pas encore automatique, pas une erreur. Le palier de difficulté monte après 3 réussites seule et redescend après 2 échecs.</p><div class="follow-table">${rows
    .map(({ s, f, tier }) => {
      const [ic, label] = f ? FLUENCY_LABELS[f.level] : ["…", "Peu de données"];
      return `<div class="follow-row"><span class="follow-name">${esc(s.name)}</span><span class="chip ${f?.level === "slow" ? "warn" : f?.level === "auto" ? "good" : "mid"}">${ic} ${label}</span><small>${f ? `${f.median.toFixed(1).replace(".", ",")} s en médiane` : ""}${tier !== null ? `${f ? " · " : ""}palier ${TIER_LABELS[tier]}` : ""}</small></div>`;
    })
    .join("")}</div></section>`;
}
export function evaluationParentView(state, now = Date.now()) {
  return weeklyReportView(state, now) + mapParentView(state) + fluencyView(state);
}
export { weakScores };
