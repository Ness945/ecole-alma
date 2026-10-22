// Suivi parent : tendances, erreurs récurrentes, temps, détail des missions, idées à faire ensemble.
// Logique pure calculée à partir de la sauvegarde locale (rien n'est envoyé nulle part).
// Ce sont des observations prudentes, pas un diagnostic.
import { skills } from "./content.js";
import { DAY } from "./core.js";
import { slipOf } from "./slips.js";

const WEEK = 7 * DAY;
const esc = (x) => String(x ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const name = (id) => skills.find((s) => s.id === id)?.name ?? id;
const subjectOf = (id) => skills.find((s) => s.id === id)?.subject ?? "";
const dayStart = (t) => {
  const d = new Date(t);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};
const solo = (e) => e.correct && !e.assisted && !e.skip;

// ───────── Idées d'activités hors écran (5 minutes) ─────────
const TIPS = {
  number: "Avec des pailles ou des cure-dents : faites des fagots de 10 et des unités, puis dites le nombre (ex. 3 fagots et 4 pailles = 34).",
  addition: "Jeu de dés : lancez deux dés, additionnez, puis vérifiez en comptant sur les doigts.",
  subtract: "Avec 10 objets (raisins, pâtes) : retirez-en quelques-uns et dites ce qu'il reste, puis écrivez la soustraction.",
  multiplication: "Dans l'assiette ou sur la table : faites 3 groupes de 4 objets et comptez de 4 en 4.",
  problem: "Inventez ensemble un petit problème avec ses jouets, puis dessinez-le avant de calculer.",
  hundreds: "Comptez de 10 en 10 puis de 100 en 100 en marchant dans la maison.",
  compare: "Deux piles de cartes ou de pièces : laquelle est la plus grande ? Expliquez avec « plus grand que / plus petit que ».",
  complements: "« Je pense à 6, combien pour aller à 10 ? » : jouez en voiture ou à table.",
  doubles: "Avec un miroir ou des paires de chaussettes : comptez les paires, puis le double.",
  halves: "Partagez un gâteau ou une pomme en deux parts égales, puis en quatre.",
  money: "Jeu de la marchande avec de vraies pièces : payer 3 € 50 et rendre la monnaie.",
  clock: "Faites-lui lire l'heure sur une vraie horloge à des moments de la journée (goûter, coucher).",
  shapes: "Chasse aux formes dans la pièce : trouver trois carrés, deux cercles, un triangle.",
  noun: "Ouvrez un album : pointez les noms de personnes, d'animaux et d'objets sur une page.",
  determiner: "Devant chaque objet de la pièce, dire « le / la / un / une + nom ».",
  adjective: "Décrivez un jouet avec 3 mots qui disent comment il est (grand, doux, rouge…).",
  agreement: "Jeu du pluriel : « un chat noir / des chats noirs », à dire puis à écrire.",
  sentence: "Mélangez les mots d'une phrase écrits sur des papiers et remettez-les dans l'ordre.",
  reading: "Lisez ensemble une histoire courte, puis demandez : qui ? où ? que se passe-t-il ?",
  verb: "Dans une phrase du quotidien, trouvez le mot qui dit ce que quelqu'un fait.",
  subject: "Posez « Qui est-ce qui… ? » devant une phrase pour trouver le sujet.",
  present_er: "Mimez des actions (je chante, tu danses, il saute) et dites la phrase avec la bonne terminaison.",
  etre: "Jeu « je suis, tu es, il est… » : chacun dit où il est ou comment il se sent.",
  avoir: "Jeu « j'ai, tu as, il a… » avec des objets que l'on tient dans la main.",
  living: "Promenade : classer ce que l'on voit en vivant (mange, grandit) et non-vivant.",
  seasons: "Dessinez ensemble la roue des quatre saisons et récitez-la en tournant. Les petites fautes d’orthographe sont acceptées ; la bonne écriture est montrée à chaque fois.",
  calendar: "Au calendrier : réciter les jours puis les mois comme une chanson, dans les deux sens (avant / après). Les petites fautes d’orthographe sont acceptées.",
  colors: "Jouez à « I spy something… red/blue » avec les couleurs en anglais.",
  animals: "Chansons ou images d'animaux : dites le nom anglais avant de montrer la carte.",
  english_numbers: "Comptez en anglais de 1 à 10 en montant l'escalier.",
};
export const tipFor = (id) => TIPS[id] || (subjectOf(id) === "Mathématiques" ? "Refaites 3 ou 4 exemples avec des objets à manipuler." : "Relisez ensemble quelques exemples à voix haute.");

// ───────── Erreurs : on regarde la réponse donnée, pas seulement « faux » ─────────
export function errorOf(e) {
  if (e.correct) return null;
  if (e.skip || e.error === "dont_know") return { code: "help", label: "A demandé de l'aide (« Je ne sais pas »)" };
  const a = String(e.answer ?? "").trim(),
    x = String(e.expected ?? "").trim();
  if (e.answer !== undefined && a === "") return { code: "empty", label: "Pas de réponse" };
  const sl = slipOf({ skill: e.skill, prompt: e.prompt, answer: e.answer, expected: e.expected });
  if (sl) return { code: sl.code, label: sl.label };
  const na = Number(a.replace(",", ".")),
    nx = Number(x.replace(",", "."));
  if (a !== "" && x !== "" && Number.isFinite(na) && Number.isFinite(nx)) {
    const nums = (String(e.prompt ?? "").match(/\d+/g) || []).map(Number);
    if (e.skill === "subtract" && nums.length >= 2 && na === nums[0] + nums[1]) return { code: "op", label: "Additionne au lieu de soustraire" };
    if (e.skill === "addition" && nums.length >= 2 && na === Math.abs(nums[0] - nums[1])) return { code: "op", label: "Soustrait au lieu d'additionner" };
    if (e.skill === "multiplication" && nums.length >= 2 && na === nums[0] + nums[1]) return { code: "op", label: "Additionne au lieu de multiplier" };
    if (Math.abs(na - nx) === 1) return { code: "off1", label: "Se trompe de 1 (comptage ou retenue)" };
    if (Math.abs(na - nx) === 10) return { code: "off10", label: "Se trompe d'une dizaine" };
    if (a.length === x.length && a.length > 1 && [...a].reverse().join("") === x) return { code: "swap", label: "Inverse les dizaines et les unités" };
    if (nums.includes(na)) return { code: "copy", label: "Recopie un nombre de la consigne" };
    return { code: "calc", label: "Calcul à revoir" };
  }
  if (e.error === "determiner_group") return { code: "group", label: "Donne le groupe entier au lieu du petit mot" };
  if (a === "" && e.answer === undefined) return { code: "other", label: "Réponse différente de celle attendue" };
  return { code: "other", label: "Réponse différente de celle attendue" };
}
export function recurringErrors(state, now = Date.now(), days = 28) {
  const from = now - days * DAY,
    map = new Map();
  for (const e of state.history) {
    if (e.at < from) continue;
    const er = errorOf(e);
    if (!er) continue;
    const k = e.skill + "|" + er.code,
      r = map.get(k) || { skill: e.skill, code: er.code, label: er.label, count: 0, last: null };
    r.count++;
    if (e.answer !== undefined && er.code !== "help") r.last = { prompt: e.prompt, answer: e.answer, expected: e.expected };
    map.set(k, r);
  }
  return [...map.values()].filter((r) => r.count >= 2).sort((a, b) => b.count - a.count).slice(0, 6);
}

// ───────── Tendances sur 4 semaines ─────────
export function weeklyRates(state, id, now = Date.now()) {
  const w = Array.from({ length: 4 }, () => ({ tries: 0, solo: 0 }));
  for (const e of state.history) {
    if (e.skill !== id || e.skip) continue;
    const i = Math.floor((now - e.at) / WEEK);
    if (i < 0 || i > 3) continue;
    w[3 - i].tries++;
    if (solo(e)) w[3 - i].solo++;
  }
  return w;
}
const rate = (a) => {
  const t = a.reduce((n, x) => n + x.tries, 0);
  return t >= 3 ? a.reduce((n, x) => n + x.solo, 0) / t : null;
};
export function trendOf(state, id, now = Date.now()) {
  const w = weeklyRates(state, id, now),
    recent = rate(w.slice(2)),
    before = rate(w.slice(0, 2));
  let status;
  if (recent === null) status = "few";
  else if (before !== null && recent - before >= 0.15) status = "up";
  else if (before !== null && before - recent >= 0.15) status = "down";
  else if (recent >= 0.75) status = "solid";
  else if (recent < 0.5) status = "down";
  else status = "steady";
  return { id, weeks: w, recent, before, status, tries: w.reduce((n, x) => n + x.tries, 0) };
}
const STATUS = {
  up: ["📈", "En progrès", "good"],
  solid: ["🌷", "Solide", "good"],
  steady: ["➡️", "Stable, à entretenir", "mid"],
  down: ["🔁", "À reprendre", "warn"],
  few: ["…", "Peu de données", "mid"],
};
export function trends(state, now = Date.now()) {
  return skills
    .filter((s) => state.skills[s.id]?.status === "seen")
    .map((s) => trendOf(state, s.id, now))
    .filter((t) => t.tries > 0)
    .sort((a, b) => ["down", "steady", "few", "up", "solid"].indexOf(a.status) - ["down", "steady", "few", "up", "solid"].indexOf(b.status) || b.tries - a.tries);
}

// ───────── Missions, temps, concentration ─────────
export function missionsList(state, max = 10) {
  const g = new Map();
  for (const e of state.history) {
    const id = e.mission || "jour:" + dayStart(e.at);
    const m = g.get(id) || { id, start: e.at, end: e.at, entries: [], ms: 0, timed: 0, detailed: Boolean(e.mission) };
    m.start = Math.min(m.start, e.at);
    m.end = Math.max(m.end, e.at);
    m.entries.push(e);
    if (Number.isFinite(e.ms)) {
      m.ms += e.ms;
      m.timed++;
    }
    g.set(id, m);
  }
  return [...g.values()].sort((a, b) => b.end - a.end).slice(0, max);
}
export function timeByDay(state, now = Date.now()) {
  const today = dayStart(now),
    days = Array.from({ length: 7 }, (_, i) => ({ start: today - (6 - i) * DAY, ms: 0, n: 0 }));
  for (const e of state.history) {
    if (!Number.isFinite(e.ms)) continue;
    const d = days.find((x) => e.at >= x.start && e.at < x.start + DAY + 7200000);
    if (d) {
      d.ms += e.ms;
      d.n++;
    }
  }
  const timed = days.reduce((n, d) => n + d.n, 0);
  return { days, totalMs: days.reduce((n, d) => n + d.ms, 0), timed, avgMs: timed ? days.reduce((n, d) => n + d.ms, 0) / timed : 0 };
}
export function focusInsights(state, now = Date.now()) {
  const out = [],
    h = state.history.filter((e) => e.at >= now - 28 * DAY && !e.skip);
  const early = h.filter((e) => Number.isInteger(e.pos) && e.pos < 4),
    late = h.filter((e) => Number.isInteger(e.pos) && e.pos >= 6);
  if (early.length >= 6 && late.length >= 6) {
    const r = (a) => a.filter(solo).length / a.length;
    if (r(early) - r(late) >= 0.25) out.push("Les réussites autonomes baissent après le 6ᵉ défi : des missions plus courtes (5 défis) lui conviennent sans doute mieux. Vous pouvez les choisir dans les réglages.");
  }
  const conf = h.filter((e) => e.confidence),
    sureWrong = conf.filter((e) => !e.correct && ["sure", "very"].includes(e.confidence)).length,
    unsureRight = conf.filter((e) => e.correct && e.confidence === "unsure").length;
  if (sureWrong >= 3) out.push(`Elle se dit « sûre » ${sureWrong} fois alors que la réponse était fausse : l'inviter à relire la consigne avant de valider.`);
  if (unsureRight >= 3) out.push(`Elle dit « pas sûre » ${unsureRight} fois et réussit : elle en sait plus qu'elle ne le croit, un encouragement l'aidera.`);
  const slow = h.filter((e) => Number.isFinite(e.ms) && e.ms > 90000).length;
  if (slow >= 3) out.push(`${slow} défis ont duré plus d'une minute et demie : ce sont souvent des notions à accompagner.`);
  const eased = h.filter((e) => e.ease);
  if (eased.length >= 3) out.push(`L'application a proposé ${eased.length} exemples plus faciles après des échecs (${Math.round((eased.filter(solo).length / eased.length) * 100)} % réussis seule ensuite).`);
  return out;
}
export function inactivityDays(state, now = Date.now()) {
  const last = state.history.at(-1)?.at;
  return last ? Math.floor((dayStart(now) - dayStart(last)) / DAY) : null;
}

// ───────── Quoi faire ensemble cette semaine ─────────
export function suggestions(state, now = Date.now(), max = 3) {
  const ts = trends(state, now).filter((t) => t.status === "down" || t.status === "steady");
  return ts.slice(0, max).map((t) => ({
    skill: t.id,
    name: name(t.id),
    reason:
      t.status === "down"
        ? `${Math.round((t.recent ?? 0) * 100)} % de réussites sans aide ces deux dernières semaines.`
        : "Réussites correctes mais pas encore autonomes.",
    tip: tipFor(t.id),
    errors: recurringErrors(state, now).filter((r) => r.skill === t.id).slice(0, 2),
  }));
}

// ───────── Affichage ─────────
const fmtMin = (ms) => (ms < 60000 ? `${Math.max(1, Math.round(ms / 1000))} s` : `${Math.round(ms / 60000)} min`);
const fmtDate = (t) => new Date(t).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
function spark(weeks) {
  const bars = weeks
    .map((w, i) => {
      const h = w.tries ? Math.max(3, Math.round((w.solo / w.tries) * 26)) : 0;
      return `<rect x="${i * 14}" y="${28 - h}" width="10" height="${h || 1}" rx="2" class="${w.tries ? "bar" : "bar empty"}"><title>Semaine ${i + 1} : ${w.tries ? `${w.solo}/${w.tries} sans aide` : "aucun défi"}</title></rect>`;
    })
    .join("");
  return `<svg class="spark" viewBox="0 0 54 30" role="img" aria-label="Réussites sans aide sur 4 semaines : ${weeks.map((w) => (w.tries ? `${w.solo} sur ${w.tries}` : "aucune")).join(", ")}">${bars}</svg>`;
}
export function followupView(state, now = Date.now()) {
  if (!state.history.length)
    return `<section class="panel follow-report"><p class="eyebrow">Suivi détaillé</p><h2>Le suivi apparaîtra après les premières missions.</h2><p>Vous y trouverez l'évolution par notion, les erreurs qui reviennent, le temps passé et des idées à faire ensemble.</p></section>`;
  const sug = suggestions(state, now),
    tr = trends(state, now),
    errs = recurringErrors(state, now),
    time = timeByDay(state, now),
    maxMs = Math.max(1, ...time.days.map((d) => d.ms)),
    insights = focusInsights(state, now),
    idle = inactivityDays(state, now),
    ms = missionsList(state, 8);
  const confLabel = { unsure: "pas sûre", sure: "assez sûre", very: "très sûre" };
  return `<section class="panel follow-report"><p class="eyebrow">Suivi détaillé</p><h2>Où elle en est, et comment l'aider</h2>${
    idle !== null && idle >= 4 ? `<div class="notice">Aucun défi depuis ${idle} jours. Une mission de 5 défis, un jour calme, suffit pour reprendre doucement.</div>` : ""
  }<div class="row follow-tools">${`<button class="secondary" data-action="followup-print">🖨️ Imprimer / enregistrer en PDF</button>`}</div>
<h3>À faire ensemble cette semaine</h3>${
    sug.length
      ? sug
          .map(
            (s) =>
              `<article class="follow-card"><h4>${esc(s.name)}</h4><p>${esc(s.reason)}</p>${s.errors.map((r) => `<p class="follow-err">Erreur fréquente : ${esc(r.label)} (${r.count} fois).</p>`).join("")}<p class="follow-tip">💡 <strong>5 minutes sans écran :</strong> ${esc(s.tip)}</p></article>`,
          )
          .join("")
      : "<p>Rien d'urgent : les notions travaillées se passent bien. Continuez à votre rythme.</p>"
  }
<h3>Évolution par notion (4 dernières semaines)</h3>${
    tr.length
      ? `<div class="follow-table" role="table" aria-label="Évolution par notion">${tr
          .map((t) => {
            const [ic, label, cls] = STATUS[t.status];
            return `<div class="follow-row" role="row"><span class="follow-name">${esc(name(t.id))}</span>${spark(t.weeks)}<span class="chip ${cls}">${ic} ${label}</span><small>${t.tries} défis${t.recent !== null ? ` · ${Math.round(t.recent * 100)} % sans aide` : ""}</small></div>`;
          })
          .join("")}</div><p class="sub">Chaque barre = une semaine (de la plus ancienne à la plus récente), hauteur = part de réponses justes sans aide.</p>`
      : "<p>Pas encore assez de défis sur les 4 dernières semaines.</p>"
  }
<h3>Erreurs qui reviennent</h3>${
    errs.length
      ? `<ul class="follow-list">${errs
          .map(
            (r) =>
              `<li><strong>${esc(name(r.skill))}</strong> — ${esc(r.label)} <span class="muted">(${r.count} fois)</span>${r.last && r.last.prompt ? `<br><small>Exemple : « ${esc(r.last.prompt)} » → a répondu « ${esc(r.last.answer)} », attendu « ${esc(r.last.expected)} ».</small>` : ""}</li>`,
          )
          .join("")}</ul>`
      : "<p>Aucune erreur ne se répète pour l'instant.</p>"
  }
<h3>Temps et concentration</h3>${
    time.timed
      ? `<p>${fmtMin(time.totalMs)} cette semaine · ${fmtMin(time.avgMs)} en moyenne par défi.</p><div class="time-bars" role="img" aria-label="Temps par jour">${time.days.map((d) => `<div><span style="height:${Math.round((d.ms / maxMs) * 60)}px" title="${fmtMin(d.ms)}"></span><small>${new Date(d.start).toLocaleDateString("fr-FR", { weekday: "short" })}</small></div>`).join("")}</div>`
      : "<p>Le temps est mesuré à partir de cette version : il apparaîtra après les prochaines missions.</p>"
  }${insights.map((t) => `<p class="follow-insight">🔎 ${esc(t)}</p>`).join("")}
<h3>Dernières missions (détail)</h3>${ms
    .map((m) => {
      const ok = m.entries.filter(solo).length,
        aided = m.entries.filter((e) => e.correct && e.assisted).length;
      return `<details class="follow-mission"><summary>${esc(fmtDate(m.end))} · ${ok}/${m.entries.length} réussis sans aide${aided ? ` · ${aided} avec aide` : ""}${m.timed ? ` · ${fmtMin(m.ms)}` : ""}</summary>${
        m.detailed
          ? `<ol>${m.entries
              .map((e) => `<li class="${e.correct ? "ok" : "ko"}"><strong>${esc(name(e.skill))}</strong> ${e.prompt ? `— ${esc(e.prompt)}` : ""}<br><small>${e.correct ? "✓" : "✗"} ${e.skip ? "« Je ne sais pas »" : `réponse « ${esc(e.answer ?? "")} »${e.correct ? "" : `, attendu « ${esc(e.expected ?? "")} »`}`}${e.hints ? ` · ${e.hints} indice${e.hints > 1 ? "s" : ""}` : ""}${e.confidence ? ` · se disait ${confLabel[e.confidence]}` : ""}${Number.isFinite(e.ms) ? ` · ${fmtMin(e.ms)}` : ""}${e.ease ? " · exemple facilité" : ""}</small></li>`)
              .join("")}</ol>`
          : `<p class="muted">Missions d'avant le suivi détaillé : seuls les résultats par notion sont conservés (${[...new Set(m.entries.map((e) => name(e.skill)))].map(esc).join(", ")}).</p>`
      }</details>`;
    })
    .join("")}
<p class="sub">Ces repères sont des observations tirées des réponses de votre enfant, pas un diagnostic. Tout reste dans la sauvegarde de cet appareil.</p></section>`;
}
