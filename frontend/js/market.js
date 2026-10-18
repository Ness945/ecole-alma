import { avatarSvg } from "./rpg.js";
import { clockSvg } from "./expansion.js";
import { skills } from "./content.js";
const escapeHtml = (text) =>
  text.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const marketStages = [
  {
    name: "La commande de Rose",
    skill: "reading",
    icon: "📜",
    lesson:
      "Lis toute la commande. Cherche le fruit demandé, même si Rose parle aussi d’un autre fruit. Exemple : « Je garde les poires. Apporte des pommes. » Il faut apporter des pommes.",
  },
  {
    name: "Les paniers du verger",
    skill: "multiplication",
    icon: "🍎",
    lesson:
      "Chaque panier reçoit la même quantité. Deux paniers de trois pommes, c’est 3 + 3 = 6 pommes. Touche chaque panier pour y déposer une pomme.",
  },
  {
    name: "La caisse de la marchande",
    skill: "money",
    icon: "🪙",
    lesson:
      "Une pièce de 2 euros vaut autant que deux pièces de 1 euro. Pour payer 5 euros, on peut préparer 2 + 2 + 1. Plusieurs façons de payer sont possibles.",
  },
  {
    name: "L’heure de la fête",
    skill: "clock",
    icon: "🕒",
    lesson:
      "La petite aiguille indique l’heure. La grande sur 12 indique une heure entière ; sur 6, une demi-heure. À 3 h 30, la petite est entre 3 et 4. Règle les aiguilles avec les boutons.",
  },
];
export const marketCount = (s) =>
  marketStages.filter((_, i) => s.completed.includes(`market:${i}`)).length;
export function newMarket(stage = 0, level = 0) {
  return {
    stage,
    step: 0,
    level,
    streak: 0,
    attempt: 0,
    draft: [0, 0, 0, 0],
    helped: false,
    solved: false,
    feedback: "",
    started: false,
  };
}
export function validMarket(m) {
  return (
    m === undefined ||
    (m &&
      [0, 1, 2, 3, 4].includes(m.stage) &&
      [0, 1, 2].includes(m.step) &&
      [0, 1, 2].includes(m.level) &&
      Number.isSafeInteger(m.streak) &&
      m.streak >= 0 &&
      m.streak <= 3 &&
      Number.isSafeInteger(m.attempt) &&
      m.attempt >= 0 &&
      Array.isArray(m.draft) &&
      m.draft.length === 4 &&
      m.draft.every((x) => Number.isSafeInteger(x) && x >= 0 && x <= 12) &&
      ["helped", "solved", "started"].every((k) => typeof m[k] === "boolean") &&
      typeof m.feedback === "string" &&
      m.feedback.length < 1000)
  );
}
export function marketQuestion(m) {
  const n = m.step + m.attempt;
  if (m.stage === 0) {
    const fruit = ["pommes", "poires", "fraises"],
      i = n % 3,
      other = fruit[(i + 1) % 3];
    return {
      skill: "reading",
      prompt:
        m.level === 0
          ? `Rose demande : « Apporte des ${fruit[i]} pour la fête. »`
          : `Rose dit : « Je garde les ${other} pour demain. Pour la fête, apporte des ${fruit[i]}. »`,
      answer: i + 1,
      options: fruit,
      hint: `Relis la demande pour la fête : il faut apporter des ${fruit[i]}.`,
    };
  }
  if (m.stage === 1) {
    const count = m.level === 0 ? 2 : 3,
      each = 2 + (n % (m.level === 2 ? 3 : 2));
    return {
      skill: "multiplication",
      prompt: `Prépare ${count} paniers avec ${each} pommes dans chacun.`,
      count,
      each,
      answer: count * each,
      hint: `Dans chaque panier, dépose ${each} pommes. ${Array(count).fill(each).join(" + ")} = ${count * each}.`,
    };
  }
  if (m.stage === 2) {
    const price = 3 + (n % 4) + m.level * 2;
    return {
      skill: "money",
      prompt: `Les fleurs pour la fête coûtent ${price} euros. Prépare la somme exacte.`,
      answer: price,
      hint: `Tu peux utiliser ${Math.floor(price / 2)} pièces de 2 euros${price % 2 ? " et une pièce de 1 euro" : ""}. Compte leur valeur, pas seulement les pièces.`,
    };
  }
  const hour = 2 + (n % 9),
    half = m.level > 0 && n % 2 === 0;
  return {
    skill: "clock",
    prompt: `La fête commence à ${hour} h${half ? " 30" : ""}. Règle l’horloge.`,
    hour,
    half,
    answer: hour * 60 + (half ? 30 : 0),
    hint: `Place la petite aiguille ${half ? "entre " + hour + " et " + (hour + 1) : "sur " + hour} et la grande sur ${half ? "6" : "12"}.`,
  };
}
export function answerMarket(m) {
  if (!m.started || m.solved || m.stage > 3) return null;
  const q = marketQuestion(m),
    value =
      m.stage === 0
        ? m.draft[0]
        : m.stage === 1
          ? m.draft.slice(0, q.count).reduce((a, b) => a + b, 0)
          : m.stage === 2
            ? m.draft[0] + 2 * m.draft[1]
            : m.draft[0] * 60 + m.draft[1] * 30;
  const correct =
    m.stage === 1
      ? m.draft.slice(0, q.count).every((x) => x === q.each)
      : value === q.answer;
  const result = {
    correct,
    assisted: m.helped,
    skip: false,
    dimension: m.stage === 0 ? "recognition" : "manipulation",
    fingerprint: `market:${m.stage}:${q.prompt}`,
    skill: q.skill,
  };
  m.solved = true;
  m.feedback = correct
    ? "Bien joué ! Ta préparation aide Rose à ouvrir le marché."
    : `On regarde ensemble. ${q.hint}`;
  if (correct && !m.helped) m.streak++;
  else m.streak = 0;
  return result;
}
export function advanceMarket(m, correct) {
  if (!m.solved) return null;
  const finished = correct && m.step === 2 ? m.stage : null;
  if (correct) {
    m.step++;
    if (m.streak >= 2) {
      m.level = Math.min(2, m.level + 1);
      m.streak = 0;
    }
  } else {
    m.level = Math.max(0, m.level - 1);
    m.attempt++;
  }
  if (finished !== null) {
    m.stage++;
    m.step = 0;
    m.started = false;
    m.level = 0;
    m.streak = 0;
    m.attempt = 0;
  }
  m.draft = [0, 0, 0, 0];
  m.solved = false;
  m.feedback = "";
  m.helped = false;
  return finished;
}
const btn = (label, action, extra = "") =>
  `<button data-action="market-${action}" ${extra}>${label}</button>`;
export function marketScene(count, decor = "rose") {
  const stripe =
    { rose: "#c88183", sage: "#659580", gold: "#c49a43" }[decor] || "#c88183";
  return `<svg viewBox="0 0 720 230" class="market-scene" role="img" aria-label="Marché du royaume, ${count} préparatifs terminés sur 4"><rect width="720" height="230" rx="28" fill="#e9efdc"/><ellipse cx="365" cy="195" rx="295" ry="23" fill="#c9d4b5"/><path d="M115 88 350 42 608 92 370 151Z" fill="#c8916b"/><path d="M115 88v85l255 43v-65Z" fill="#b87e5b"/><path d="m370 151 238-59v85l-238 39Z" fill="#986445"/><path d="M100 87 350 10 625 88 370 137Z" fill="#f3d9a0"/><path d="m160 69 55-17 268 67-57 12Zm110-34 55-17 268 67-56 14Z" fill="${stripe}"/><path d="M115 90v87m493-87v87" stroke="#735344" stroke-width="9"/><text x="185" y="145" font-size="34">${count > 0 ? "📜" : "🌿"}</text><text x="285" y="167" font-size="34">${count > 1 ? "🍎 🍐" : "🧺"}</text><text x="442" y="155" font-size="34">${count > 2 ? "🌷" : "🌱"}</text><text x="620" y="180" font-size="44">${count === 4 ? "🎉" : "🌳"}</text></svg>`;
}
export function marketTeaser(s) {
  return `<section class="market-teaser"><div><p class="eyebrow">UNE NOUVELLE HISTOIRE · ${marketCount(s)}/4</p><h2>Le marché du royaume</h2><p>${marketCount(s) === 4 ? "Rose a ouvert son étal ! Reviens lui rendre visite." : "Rose prépare une fête. Des commandes, des paniers et des pièces à manipuler."}</p>${btn(s.market?.started ? "Reprendre avec Rose →" : "Rencontrer Rose →", "open")}</div>${marketScene(marketCount(s), s.marketDecor)}</section>`;
}
export function marketView(s) {
  const m = s.market || newMarket(marketCount(s)),
    count = marketCount(s);
  const head = `<div class="market-party"><div class="market-avatar">${avatarSvg(s.rpg)}</div><div><p class="eyebrow">TON AVENTURIÈRE & ROSE</p><h1>Le marché du royaume</h1><p>Une fête se prépare, un petit pas à la fois.</p></div></div>${marketScene(count, s.marketDecor)}<ol class="market-steps">${marketStages.map((x, i) => `<li ${i === m.stage ? 'aria-current="step"' : ""}>${i < count ? "✓" : x.icon} ${x.name}</li>`).join("")}</ol>`;
  if (m.stage === 4)
    return `<main class="page">${head}<section class="panel"><h2>Le marché est ouvert !</h2><p>Rose et les habitants peuvent se retrouver autour de ton nouvel étal. Tu as aussi reçu le sac d’exploratrice : retrouve-le dans ta garde-robe.</p><h3>Décorer mon étal</h3><div class="market-controls">${[
      ["rose", "Rose"],
      ["sage", "Sauge"],
      ["gold", "Miel"],
    ]
      .map(([color, label]) =>
        btn(
          label,
          "decor",
          `data-color="${color}" aria-pressed="${(s.marketDecor || "rose") === color}"`,
        ),
      )
      .join(
        "",
      )}</div>${btn("Équiper mon sac", "equip")} ${btn("Rejouer l’aventure", "replay")}<p class="sub">Les souvenirs et les récompenses restent acquis. Rejouer ne redonne pas les récompenses.</p></section></main>`;
  const stage = marketStages[m.stage];
  if (!m.started)
    return `<main class="page">${head}<section class="panel"><p class="eyebrow">ÉTAPE ${m.stage + 1} · PETITE LEÇON</p><h2>${stage.name}</h2><p class="passage">${stage.lesson}</p>${btn("🔊 Écouter Rose", "read")} ${btn("À moi de préparer →", "start")}<p class="sub">Trois préparatifs réussis pour cette étape. Les essais et les indices sont toujours permis.</p></section></main>`;
  const q = marketQuestion(m),
    disabled = m.solved ? "disabled" : "";
  let controls = "";
  if (m.stage === 0)
    controls = `<div class="market-controls">${q.options.map((f, i) => btn(["🍎", "🍐", "🍓"][i] + " " + f, "pick", `data-value="${i + 1}" aria-pressed="${m.draft[0] === i + 1}" ${disabled}`)).join("")}</div>`;
  if (m.stage === 1)
    controls = `<div class="market-controls">${Array.from({ length: q.count }, (_, i) => `<div class="market-basket"><p>Panier ${i + 1}</p><div aria-live="polite">${"🍎".repeat(m.draft[i]) || "🧺"}</div><p>${m.draft[i]} pomme(s)</p>${btn("−", "adjust", `data-slot="${i}" data-delta="-1" aria-label="Retirer une pomme du panier ${i + 1}" ${disabled}`)} ${btn("+", "adjust", `data-slot="${i}" data-delta="1" aria-label="Ajouter une pomme au panier ${i + 1}" ${disabled}`)}</div>`).join("")}</div>`;
  if (m.stage === 2)
    controls = `<div class="market-controls">${[1, 2].map((v, i) => `<div class="market-basket"><div class="market-coin">${v} €</div><p>${m.draft[i]} pièce(s)</p>${btn("−", "adjust", `data-slot="${i}" data-delta="-1" aria-label="Retirer une pièce de ${v} euros" ${disabled}`)} ${btn("+", "adjust", `data-slot="${i}" data-delta="1" aria-label="Ajouter une pièce de ${v} euros" ${disabled}`)}</div>`).join("")}</div><p class="market-total" aria-live="polite">Dans ta coupelle : ${m.draft[0] + 2 * m.draft[1]} €</p>`;
  if (m.stage === 3)
    controls = `${clockSvg(m.draft[0] || 12, m.draft[1] === 1)}<div class="market-controls">${btn("− 1 heure", "hour", 'data-delta="-1" ' + disabled)} ${btn("+ 1 heure", "hour", 'data-delta="1" ' + disabled)} ${btn(m.draft[1] ? "Grande aiguille sur 12" : "Grande aiguille sur 6", "minute", disabled)}</div><p class="market-total" aria-live="polite">${m.draft[0] || 12} h ${m.draft[1] ? "30" : "00"}</p>`;
  return `<main class="page">${head}<section class="panel"><p class="eyebrow">PRÉPARATIF ${m.step + 1}/3 · ${["Petits pas", "Je progresse", "Je me lance"][m.level]}</p><h2>${q.prompt}</h2>${btn("🔊 Écouter", "read")}${controls}${m.solved ? `<div class="notice" role="status">${escapeHtml(m.feedback)}</div>${btn(m.feedback.startsWith("Bien") ? "Continuer →" : "Essayer un nouvel exemple →", "next")}` : `${btn("Vérifier ma préparation", "check")} ${btn("Un exemple pour m’aider", "hint")}${m.helped ? `<p class="notice">${q.hint}</p>` : ""}`}</section></main>`;
}
export function learningReport(s) {
  const recent = s.history.slice(-60),
    ids = [...new Set(recent.map((e) => e.skill))];
  return `<section class="panel"><p class="eyebrow">LES 60 DERNIERS ESSAIS</p><h2>Les réussites sans aide</h2><div class="learning-report">${
    ids
      .map((id) => {
        const es = recent.filter((e) => e.skill === id),
          solo = es.filter((e) => !e.assisted && !e.skip),
          ok = solo.filter((e) => e.correct).length;
        return `<div><strong>${skills.find((x) => x.id === id)?.name}</strong><p>${ok}/${solo.length} réussites sans aide · ${es.filter((e) => e.assisted).length} essais accompagnés</p><small>${solo.length < 3 ? "Encore peu d’observations." : ok / solo.length < 0.6 ? "À reprendre ensemble avec un exemple concret." : "Continuer avec des situations variées."}</small></div>`;
      })
      .join("") ||
    "<p>Les observations apparaîtront après les premiers essais.</p>"
  }</div><p class="sub">Une réussite accompagnée est utile, mais ne prouve pas encore l’autonomie. Le marché : ${marketCount(s)}/4 étapes terminées.</p></section>`;
}
