// Le royaume : scène SVG animée en CSS, jour / soir / nuit, très personnalisable.
// Source unique : l'icône de la boutique est un recadrage (VIEW) du dessin de la scène.
// Aucun identifiant SVG dans les fragments ; seul le dégradé du ciel en porte un, préfixé par `id`.
// Les animations sont uniquement en CSS (rpg.css) : « Animations douces » les coupe toutes.
import { roofColors, defaultRoof, castleExtraFragment } from "./castle-art.js";
import { petIcon } from "./avatar-art.js";

export const castleNewSlots = [
  "walls",
  "towers",
  "door",
  "windows",
  "moat",
  "path",
  "lights",
  "weather",
  "creature",
];
// ───────── Moment de la journée ─────────
export const phases = ["day", "dusk", "night"];
export function phaseNow(date = new Date()) {
  const h = date.getHours();
  return h >= 7 && h < 18 ? "day" : h === 6 || (h >= 18 && h < 20) ? "dusk" : "night";
}
const SKY = {
  day: { top: "#e8edf7", bottom: "#f4eddc", dim: 0 },
  dusk: { top: "#8a79b8", bottom: "#f6b88f", dim: 0.16 },
  night: { top: "#1d2150", bottom: "#3f4580", dim: 0.34 },
};
// ───────── Murs : [face claire, face sombre, dessus, tour, ombre de tour, dessus de tour, joints] ─────────
const WALLS = {
  default: ["#eedfc0", "#d2bc97", "#fff0ce", "#eddbba", "#c6b28f", "#fff0d1", "#bba88a"],
  "walls-rose": ["#f3d9dc", "#d9b3ba", "#fff0f1", "#f1d5d9", "#d4adb4", "#fff2f3", "#c79fa7"],
  "walls-blue": ["#d6e1ec", "#aebfd0", "#eef5fb", "#d3dfeb", "#a9bbcd", "#f0f6fb", "#93a9be"],
  "walls-white": ["#f7f5f0", "#d9d4c8", "#ffffff", "#f4f1ea", "#d1cbbd", "#ffffff", "#bdb7a8"],
  "walls-brick": ["#dc9d85", "#b97762", "#f0c0a8", "#d99a82", "#b27561", "#f2c4ad", "#9c5f4c"],
  "walls-moss": ["#d3dfbc", "#a8bb8b", "#e9f2d6", "#d0dcb8", "#a1b583", "#eaf3d9", "#8aa06c"],
  "walls-sand": ["#eed39e", "#cbaf70", "#fae6b6", "#ecd09a", "#c7aa69", "#fbe8bb", "#b09352"],
  "walls-lilac": ["#e1d4ee", "#baa9d3", "#f2eafa", "#ded0ec", "#b5a3cf", "#f4ecfb", "#9c8bb8"],
};
// ───────── Bannières ─────────
const FLAGS = {
  true: ["#e9bd5e", "#ac8152", ""],
  "castle-flags": ["#e9bd5e", "#ac8152", ""],
  "flags-rose": ["#ee93ad", "#b6607c", ""],
  "flags-blue": ["#6c9bd8", "#41679c", ""],
  "flags-stars": ["#8d78c4", "#5f4d92", "star"],
};
// ───────── Tours ─────────
function towerHead(style, roof, dark, w) {
  if (style === "towers-square")
    return {
      top: -12,
      svg: `<path d="M-34 -2h68v12q-34 19-68 0Z" fill="${roof}"/>${[-34, -17, 0, 17]
        .map((x) => `<rect x="${x}" y="-18" width="17" height="18" rx="2" fill="${w[3]}" stroke="${w[4]}" stroke-width="2"/>`)
        .join("")}<path d="M17 -18h17v18H17Z" fill="${w[4]}"/>`,
    };
  if (style === "towers-spire")
    return {
      top: -118,
      svg: `<path d="m-38 0 38-118L38 0Q0 22-38 0" fill="${roof}"/><path d="M0-118 38 0Q19 11 10 11Z" fill="${dark}"/>`,
    };
  if (style === "towers-onion")
    return {
      top: -96,
      svg: `<path d="M-38 0Q-54-34-18-62-4-74 0-96 4-74 18-62 54-34 38 0Q0 22-38 0Z" fill="${roof}"/><path d="M0-96Q4-74 18-62 54-34 38 0Q19 11 10 11Z" fill="${dark}"/><circle cy="-98" r="4" fill="#f2c94e"/>`,
    };
  return {
    top: -76,
    svg: `<path d="m-43 0 43-76L43 0Q0 25-43 0" fill="${roof}"/><path d="M0-76 43 0Q21 12 11 12Z" fill="${dark}"/>`,
  };
}
function tower(x, y, s, o) {
  const { w, roof, dark, style, flag } = o,
    head = towerHead(style, roof, dark, w),
    f = FLAGS[flag] || null,
    pole = style === "towers-square" ? 42 : 38;
  return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="125" rx="41" ry="15" fill="#544d6730"/><path d="M-34 0h68v119q-34 21-68 0Z" fill="${w[3]}"/><path d="M10 0h24v119q-12 8-24 10Z" fill="${w[4]}"/><ellipse rx="34" ry="12" fill="${w[5]}"/>${head.svg}<path d="M-8 48q0-17 15-17v31H-8Z" fill="${o.winFill}" stroke="${w[5]}" stroke-width="5"/><path d="M-22 89h13m13 14h16m-3-30h13" stroke="${w[6]}" stroke-width="2"/>${
    f
      ? `<g class="c-flag"><path d="M0 ${head.top}v-${pole}" stroke="#9c805b" stroke-width="2.5"/><path d="M0 ${head.top - pole}l37 9-37 13" fill="${f[0]}" stroke="${f[1]}" stroke-width="2"/>${f[2] === "star" ? `<circle cx="11" cy="${head.top - pole + 9}" r="3" fill="#fff"/>` : ""}</g>`
      : ""
  }</g>`;
}
// ───────── Portes ─────────
const doorShape = (fill, stroke = "#c6af88") =>
  `<path d="M391 395v-57q13-28 43-21v62Z" fill="${fill}" stroke="${stroke}" stroke-width="7"/><path d="M411 329v56" stroke="#00000030" stroke-width="3"/>`;
const DOORS = {
  default: () => `${doorShape("#8d6b57")}<circle cx="424" cy="359" r="3" fill="#efd17f"/>`,
  "door-red": () => `${doorShape("#c6465a", "#e8c9a0")}<circle cx="424" cy="359" r="3" fill="#ffe08a"/>`,
  "door-gold": () => `${doorShape("#e3b84f", "#fff0b8")}<path d="M399 372h28M399 352h28" stroke="#c58f22" stroke-width="3"/><circle cx="424" cy="362" r="3" fill="#fff"/>`,
  "door-blue": () => `${doorShape("#5b84b8", "#dfe9f6")}<circle cx="424" cy="359" r="3" fill="#f2f6ff"/>`,
  "door-crystal": () =>
    `${doorShape("#a8e3ef", "#e9fbff")}<path d="M402 384v-40q10-18 24-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/><path d="M416 336v54" stroke="#6fb8cc" stroke-width="2"/><path d="m404 322 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff7c8"/>`,
  "door-flowers": () =>
    `${doorShape("#8d6b57")}<circle cx="424" cy="359" r="3" fill="#efd17f"/>${[[388, 372], [388, 350], [396, 331], [411, 320], [428, 314], [440, 322]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6.5" fill="${["#f4a8b6", "#fff4d8", "#f6d36e"][i % 3]}" stroke="#5f9a63" stroke-width="1.5"/>`).join("")}`,
};
// ───────── Fenêtres du corps principal (trois) ─────────
const WIN = [
  "M346 311v-39q0-26 26-32v61",
  "M465 305v-40q0-22 22-16v46",
  "M492 310v-40q0-22 22-16v46",
];
const WINDOWS = {
  default: (lit) => WIN.map((d) => `<path d="${d}" fill="${lit ? "#ffd978" : "#728890"}" stroke="#fff1d0" stroke-width="6"/>`).join(""),
  "windows-golden": () => WIN.map((d) => `<path d="${d}" fill="#f6d36e" stroke="#fff7d6" stroke-width="6"/><path d="${d}" fill="none" stroke="#d9a73a" stroke-width="1.8"/>`).join(""),
  "windows-stained": () =>
    WIN.map((d, i) => `<path d="${d}" fill="${["#e8546a", "#4d8fc4", "#7fbf7a"][i]}" stroke="#f2c14e" stroke-width="6"/><path d="${d}" fill="none" stroke="#fff6" stroke-width="2"/>`).join(""),
  "windows-shutters": (lit) =>
    WIN.map((d) => `<path d="${d}" fill="${lit ? "#ffd978" : "#728890"}" stroke="#fff1d0" stroke-width="6"/>`).join("") +
    [[336, 266], [455, 258], [517, 258]].map(([x, y]) => `<rect x="${x}" y="${y}" width="9" height="42" rx="2" fill="#6fae73" stroke="#4d8452" stroke-width="2"/>`).join(""),
  "windows-round": () => WIN.map((d) => `<path d="${d}" fill="#ffd978" stroke="#e8b04a" stroke-width="6"/><path d="${d}" fill="none" stroke="#fff6cc" stroke-width="1.6" stroke-dasharray="3 5"/>`).join(""),
};
// ───────── Douves, chemins ─────────
const MOATS = {
  "moat-water": () => moat("#8fd0e2", "#c9eef6", ""),
  "moat-lilies": () =>
    moat("#8fd0e2", "#c9eef6", [[330, 396], [372, 423], [490, 424], [545, 393], [592, 372]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="4.5" fill="#79b97a" stroke="#4f8a5d" stroke-width="1.5"/><circle cx="${x + 2}" cy="${y - 4}" r="3" fill="#f6b9c8"/>`).join("")),
  "moat-magic": () =>
    moat("#9c8be0", "#d9d0ff", [[340, 400], [440, 446], [530, 410], [584, 380]].map(([x, y]) => `<circle class="c-twinkle" cx="${x}" cy="${y}" r="3" fill="#fff6c8"/>`).join("")),
};
function moat(fill, shine, extra) {
  return `<path d="M268 346 427 440 604 366l-35-10L427 414 301 343Z" fill="${fill}" stroke="${shine}" stroke-width="4" stroke-linejoin="round"/><path d="M290 352 427 428 586 366" fill="none" stroke="${shine}" stroke-width="2" stroke-dasharray="14 12" opacity=".8"/>${extra}<path d="M400 412 456 410 474 452 386 454Z" fill="#b0794f" stroke="#7d5a3a" stroke-width="2.5" stroke-linejoin="round"/><path d="M398 424h66M394 438h74" stroke="#7d5a3a" stroke-width="2"/>`;
}
const ROAD = "M366 353Q443 383 542 437l-80 36Q405 402 322 378Z";
const PATHS = {
  default: () => `<path d="${ROAD}" fill="#e5cfaa"/>`,
  "path-stone": () => `<path d="${ROAD}" fill="#c4c7cc" stroke="#9fa3aa" stroke-width="2"/>${[[400, 388], [430, 406], [466, 424], [508, 440], [360, 372], [446, 384], [486, 402]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="#dfe2e6" stroke="#9fa3aa" stroke-width="1.5"/>`).join("")}`,
  "path-flowers": () => `<path d="${ROAD}" fill="#e5cfaa"/>${[[348, 388], [392, 408], [440, 428], [496, 454], [470, 392], [520, 424]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${["#f4a8b6", "#fff4d8", "#f6d36e"][i % 3]}" stroke="#5f9a63" stroke-width="1.4"/>`).join("")}`,
  "path-gold": () => `<path d="${ROAD}" fill="#f4d884" stroke="#d9a73a" stroke-width="2"/>${[[390, 386], [430, 404], [474, 424], [514, 440]].map(([x, y]) => `<path d="M${x - 14} ${y}l14-7 14 7-14 7Z" fill="#fff1b0" stroke="#d9a73a" stroke-width="1.5"/>`).join("")}<path class="c-twinkle" d="m478 398 2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff"/>`,
};
// ───────── Lumières (brillent au soir et la nuit) ─────────
const lamp = (x, y) =>
  `<g><path d="M${x} ${y}v-44" stroke="#6b5b45" stroke-width="4"/><rect x="${x - 7}" y="${y - 62}" width="14" height="20" rx="4" fill="#ffd978" stroke="#a98f5e" stroke-width="2"/><path d="M${x - 9} ${y - 62}h18l-9-9Z" fill="#6b5b45"/></g>`;
const flame = (x, y) =>
  `<g><rect x="${x - 3}" y="${y}" width="6" height="26" rx="2" fill="#7d5a3a"/><path class="c-flicker" d="M${x} ${y + 2}q-9-10-2-22 3 7 8 6 5-10-6-22 16 8 12 30-1 8-12 8Z" transform="translate(0 6)" fill="#f4a43a" stroke="#d9772a" stroke-width="1.5"/></g>`;
const LIGHTS = {
  "lights-lanterns": () => `${lamp(352, 424)}${lamp(528, 462)}${lamp(300, 392)}`,
  "lights-torches": () => `${flame(382, 336)}${flame(446, 332)}`,
  "lights-fairy": () =>
    `<path d="M296 252Q427 306 586 258" fill="none" stroke="#9a8a6a" stroke-width="2.5"/>${[[312, 262], [342, 274], [376, 284], [412, 290], [448, 290], [484, 284], [520, 276], [554, 266]].map(([x, y], i) => `<circle class="c-twinkle" style="animation-delay:-${(i * 0.37).toFixed(2)}s" cx="${x}" cy="${y}" r="4.6" fill="${["#ffd978", "#f4a8c0", "#bfe3f4", "#fff4a8"][i % 4]}"/>`).join("")}`,
};
// Halo de nuit autour des lumières
const GLOW = {
  "lights-lanterns": [[352, 372], [528, 410], [300, 340]],
  "lights-torches": [[382, 348], [446, 344]],
  "lights-fairy": [[427, 280]],
};
// ───────── Météo ─────────
let STILL = false;
function rnd(seed) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
function particles(n, seed, make) {
  const r = rnd(seed);
  return Array.from({ length: n }, (_, i) => make(r, i)).join("");
}
const WEATHER = {
  "weather-rain": () =>
    particles(34, 7, (r) => {
      const x = Math.round(r() * 860), y = Math.round(r() * (STILL ? 330 : 120)), d = (r() * 1.2).toFixed(2);
      return `<g class="c-rain" style="animation-delay:-${d}s"><path d="M${x} ${y}l-5 16" stroke="#8fb4d8" stroke-width="2" stroke-linecap="round" opacity=".7"/></g>`;
    }),
  "weather-snow": () =>
    particles(30, 11, (r) => {
      const x = Math.round(r() * 860), y = Math.round(r() * (STILL ? 400 : 120)), d = (r() * 8).toFixed(2), s = (2 + r() * 2.4).toFixed(1);
      return `<g class="c-snow" style="animation-delay:-${d}s"><circle cx="${x}" cy="${y}" r="${s}" fill="#fff" opacity=".95"/></g>`;
    }),
  "weather-petals": () =>
    particles(18, 5, (r) => {
      const x = Math.round(r() * 860), y = Math.round(r() * (STILL ? 400 : 120)), d = (r() * 9).toFixed(2);
      return `<g class="c-snow" style="animation-delay:-${d}s"><ellipse cx="${x}" cy="${y}" rx="5" ry="2.8" transform="rotate(${Math.round(r() * 90)} ${x} ${y})" fill="#f6b9c8" stroke="#e38fa6" stroke-width="1"/></g>`;
    }),
  "weather-fireflies": () =>
    particles(16, 3, (r) => {
      const x = Math.round(120 + r() * 620), y = Math.round(230 + r() * 220), d = (r() * 4).toFixed(2);
      return `<g class="c-fire" style="animation-delay:-${d}s"><circle cx="${x}" cy="${y}" r="9" fill="#fff3a0" opacity=".25"/><circle cx="${x}" cy="${y}" r="3" fill="#ffe36a"/></g>`;
    }),
  "weather-stardust": () =>
    particles(20, 9, (r, i) => {
      const x = Math.round(40 + r() * 780), y = Math.round(30 + r() * 330), d = (r() * 3).toFixed(2), s = (4 + r() * 5).toFixed(1);
      return `<g class="c-twinkle" style="animation-delay:-${d}s">${starPath(x, y, +s, i % 2 ? "#fff0a8" : "#ffd0e8")}</g>`;
    }),
};
function starPath(x, y, r, fill) {
  const p = [];
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2, d = i % 2 ? r * 0.4 : r;
    p.push(`${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`);
  }
  return `<path d="M${p.join("L")}Z" fill="${fill}"/>`;
}
// ───────── Créatures du ciel (origine en haut à gauche de 90 × 70) ─────────
const CREATURES = {
  "creature-dragon": () =>
    `<g class="c-wing"><path d="M40 28Q24 -4 6 6q10 12 8 26Z" fill="#9bd48f" stroke="#5f9a63" stroke-width="2"/></g><ellipse cx="44" cy="40" rx="24" ry="14" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2.5"/><path d="M22 44Q6 52 4 64q16-2 22-12Z" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2.5"/><ellipse cx="44" cy="46" rx="14" ry="7" fill="#e9efb8"/><circle cx="72" cy="30" r="11" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2.5"/><path d="M68 20 66 10M76 20l4-9" stroke="#e8a63a" stroke-width="3" stroke-linecap="round"/><circle cx="76" cy="28" r="2.4" fill="#3d3034"/><path d="M80 36q-4 3-8 1" stroke="#3d3034" stroke-width="1.8" fill="none" stroke-linecap="round"/><g class="c-wing"><path d="M52 28Q66 0 84 8q-8 12-8 22Z" fill="#b6e3ac" stroke="#5f9a63" stroke-width="2"/></g>`,
  "creature-birds": () =>
    [[0, 20, 1], [28, 4, 0.8], [52, 30, 0.9], [74, 12, 0.7]].map(([x, y, s], i) => `<g transform="translate(${x} ${y}) scale(${s})"><g class="c-wing" style="animation-delay:-${i * 0.3}s"><path d="M0 12Q10-6 20 8Q30-6 40 12" fill="none" stroke="#5a5470" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></g></g>`).join(""),
  "creature-butterflies": () =>
    [[4, 10, "#f08a2e"], [40, 34, "#8d78c4"], [66, 6, "#f08aa6"]].map(([x, y, c], i) => `<g transform="translate(${x} ${y})"><g class="c-flap" style="animation-delay:-${i * 0.4}s"><path d="M10 10Q-4-6-6 8T10 14Q10 12 10 10ZM10 10Q24-6 26 8T10 14Z" fill="${c}" stroke="#00000030" stroke-width="1.5"/><path d="M10 6v12" stroke="#4a3a2a" stroke-width="2.4" stroke-linecap="round"/></g></g>`).join(""),
  "creature-pegasus": () =>
    `<path d="M2 50Q-8 40 6 34M0 58Q-14 52 2 44" fill="none" stroke="#f3b86b" stroke-width="4" stroke-linecap="round" opacity=".8"/><path d="M0 62Q-10 58 4 50" fill="none" stroke="#98cf8f" stroke-width="4" stroke-linecap="round" opacity=".8"/><ellipse cx="42" cy="44" rx="26" ry="13" fill="#fff" stroke="#cfc6dc" stroke-width="2.5"/><path d="M62 38Q74 22 70 12l10-2q8 16-6 34Z" fill="#fff" stroke="#cfc6dc" stroke-width="2.5" stroke-linejoin="round"/><ellipse cx="78" cy="12" rx="9" ry="6.5" fill="#fff" stroke="#cfc6dc" stroke-width="2.5"/><path d="M66 22Q56 14 62 4" fill="none" stroke="#f4a8c0" stroke-width="5" stroke-linecap="round"/><circle cx="80" cy="10" r="1.8" fill="#3d3034"/><path d="M26 54 22 68M36 56 34 70M52 56 56 70M62 52 68 66" stroke="#cfc6dc" stroke-width="4.5" stroke-linecap="round"/><g class="c-wing"><path d="M40 36Q34 6 12 2q8 18 14 30Z" fill="#fff7fc" stroke="#d8c8e8" stroke-width="2.2"/><path d="M40 36Q48 8 70 4q-8 20-16 30Z" fill="#f4ecfb" stroke="#d8c8e8" stroke-width="2.2"/></g>`,
  "creature-fairy": () =>
    `<circle cx="30" cy="34" r="26" fill="#fff3a044"/><g class="c-flap"><ellipse cx="18" cy="26" rx="12" ry="7" transform="rotate(-30 18 26)" fill="#e8f6ff" stroke="#9cc8e0" stroke-width="1.6"/><ellipse cx="42" cy="26" rx="12" ry="7" transform="rotate(30 42 26)" fill="#e8f6ff" stroke="#9cc8e0" stroke-width="1.6"/></g><circle cx="30" cy="24" r="6" fill="#f4d0b0" stroke="#c9996f" stroke-width="1.6"/><path d="M24 20q6-8 12 0" fill="#e8a63a"/><path d="M22 30h16l4 22H18Z" fill="#f4a8c0" stroke="#d98ba5" stroke-width="1.6" stroke-linejoin="round"/><path d="M26 52l-2 8M34 52l2 8" stroke="#c9996f" stroke-width="3" stroke-linecap="round"/><path d="M50 40l3 6 6 2-6 2-3 6-3-6-6-2 6-2Z" fill="#fff0a8"/>`,
};
// Position et mouvement des créatures dans le ciel
const FLY = {
  "creature-dragon": ["c-fly", 130, 120],
  "creature-birds": ["c-fly2", 120, 70],
  "creature-butterflies": ["c-bob", 640, 150],
  "creature-pegasus": ["c-fly", 80, 90],
  "creature-fairy": ["c-orbit", 470, 170],
};
// ───────── Scène ─────────
const shine = (x, y) => `<circle class="c-twinkle" cx="${x}" cy="${y}" r="2.4" fill="#fff"/>`;
export function castleSvg(rpg, id = "kingdom", opts = {}) {
  const c = rpg.castle || {},
    phase = phases.includes(opts.time) ? opts.time : phaseNow(),
    night = phase !== "day",
    sk = SKY[phase],
    [roof, dark] = roofColors[c.roof] || defaultRoof,
    w = WALLS[c.walls] || WALLS.default,
    style = c.towers || "",
    winFill = night ? "#ffd978" : "#728890",
    t = (x, y, s) => tower(x, y, s, { w, roof, dark, style, flag: c.flags || false, winFill });
  const sky = castleExtraFragment(c.sky),
    ground = castleExtraFragment(c.ground),
    cre = CREATURES[c.creature]
      ? `<g class="c-creature ${FLY[c.creature][0]}"><g transform="translate(${FLY[c.creature][1]} ${FLY[c.creature][2]})">${CREATURES[c.creature]()}</g></g>`
      : "",
    door = (DOORS[c.door] || DOORS.default)(),
    windows = (WINDOWS[c.windows] || WINDOWS.default)(false),
    litWindows = night ? (WINDOWS[c.windows] || WINDOWS.default)(true) : "",
    stars = night
      ? [[60, 40, 4], [150, 110, 3], [250, 60, 4], [340, 30, 3], [520, 50, 3.4], [610, 130, 3], [780, 60, 4], [820, 150, 3], [700, 30, 3], [40, 160, 3]]
          .map(([x, y, r], i) => `<g class="c-twinkle" style="animation-delay:-${(i * 0.41).toFixed(2)}s">${starPath(x, y, r + 2, "#fff6cc")}</g>`)
          .join("")
      : "",
    body = phase === "night"
      ? `<circle cx="709" cy="94" r="56" fill="#fff6c822"/><path d="M718 64a34 34 0 1 0 0 60 27 27 0 1 1 0-60Z" fill="#fff4cb"/>`
      : phase === "dusk"
        ? `<circle cx="720" cy="268" r="62" fill="#ffd08a55"/><circle cx="720" cy="268" r="40" fill="#ffd08a"/>`
        : `<circle cx="709" cy="94" r="43" fill="#fff4cb"/>`,
    cloudFill = phase === "night" ? "#8f95c8" : phase === "dusk" ? "#ffe4d0" : "#fff",
    clouds = `<g fill="${cloudFill}" opacity=".6"><g class="c-cloud c1"><ellipse cx="164" cy="97" rx="71" ry="17"/><ellipse cx="198" cy="82" rx="39" ry="22"/></g><g class="c-cloud c2"><ellipse cx="605" cy="62" rx="55" ry="14"/><ellipse cx="630" cy="50" rx="28" ry="15"/></g><g class="c-cloud c3"><ellipse cx="420" cy="140" rx="48" ry="12"/></g></g>`,
    glows = night
      ? (GLOW[c.lights] || []).map(([x, y]) => `<circle class="c-glow" cx="${x}" cy="${y}" r="34" fill="#ffe9a0" opacity=".2"/>`).join("")
      : "",
    pet = opts.pet && petIcon(opts.pet)
      ? `<g class="c-walk"><g transform="translate(330 400) scale(.62)">${petIcon(opts.pet).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g></g>`
      : "";
  return `<svg class="castle-art castle-${phase}" viewBox="0 0 860 590" role="img" aria-label="Ton château personnalisable en perspective"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="${sk.top}"/><stop offset="1" stop-color="${sk.bottom}"/></linearGradient><linearGradient id="${id}-land" x2="0" y2="1"><stop stop-color="#bfd6a0"/><stop offset="1" stop-color="#89af87"/></linearGradient><filter id="${id}-shadow"><feGaussianBlur stdDeviation="12"/></filter></defs><rect width="860" height="590" rx="30" fill="url(#${id}-sky)"/>${stars}${body}${clouds}${sky}<ellipse cx="438" cy="506" rx="275" ry="35" fill="#66817b33" filter="url(#${id}-shadow)"/><path d="M130 360Q430 190 744 351v52Q432 604 130 409Z" fill="#a5aa85"/><path d="M130 360Q430 190 744 351Q432 557 130 360" fill="url(#${id}-land)"/><path d="M163 396q270 154 544-10" fill="none" stroke="#d2d8ac" stroke-width="9"/>${(PATHS[c.path] || PATHS.default)()}<g fill="#4e725c" opacity=".18"><ellipse cx="422" cy="359" rx="169" ry="46"/></g>${ground}${MOATS[c.moat] ? MOATS[c.moat]() : ""}<path d="M301 201 443 154 569 221v135l-142 58-126-71Z" fill="${w[0]}"/><path d="m443 154 126 67v135l-142 58V233Z" fill="${w[1]}"/><path d="M301 201 443 154 569 221 427 273Z" fill="${w[2]}"/><path d="m285 200 141-119 159 132-158 59Z" fill="${roof}"/><path d="m426 81 159 132-158 59Z" fill="${dark}"/>${windows}${t(285, 244, 0.9)}${t(577, 270, 1)}${t(424, 169, 0.85)}${door}<g stroke="#819b70" stroke-width="4" fill="#779d76"><path d="M214 369v-57m-27 20q-5-52 30-52 37 6 24 46-18 27-54 6M669 360v-56m-29 14q-4-55 30-52 36 3 28 49-24 31-58 3"/></g>${c.garden ? '<g fill="#668e71"><ellipse cx="255" cy="417" rx="35" ry="40"/><ellipse cx="616" cy="409" rx="35" ry="43"/></g><g fill="#e8a6ae"><circle cx="243" cy="405" r="8"/><circle cx="268" cy="426" r="9"/><circle cx="605" cy="398" r="8"/><circle cx="628" cy="421" r="8"/></g>' : ""}${c.fountain ? `<ellipse cx="470" cy="447" rx="48" ry="21" fill="#e9dfcb" stroke="#bdb39e" stroke-width="5"/><ellipse cx="470" cy="444" rx="35" ry="13" fill="#85c7d1"/><path d="M470 445v-43m-24 8q24 22 48 0" fill="none" stroke="#ede1c7" stroke-width="8"/><path d="M470 402q-24-30-28 3m28-3q24-30 28 3" fill="none" stroke="#91cbd4" stroke-width="3"/><g class="c-drop"><circle cx="470" cy="412" r="3.4" fill="#bfe8f0"/></g><g class="c-drop d2"><circle cx="455" cy="418" r="3" fill="#bfe8f0"/></g><g class="c-drop d3"><circle cx="486" cy="418" r="3" fill="#bfe8f0"/></g>` : ""}${LIGHTS[c.lights] ? LIGHTS[c.lights]() : ""}${sky && c.sky === "sky-rainbow" ? shine(430, 100) : ""}<g fill="#f7e1a1"><circle class="c-twinkle" cx="191" cy="367" r="4"/><circle class="c-twinkle" style="animation-delay:-.7s" cx="315" cy="437" r="5"/><circle class="c-twinkle" style="animation-delay:-1.3s" cx="580" cy="434" r="4"/></g>${night ? `<rect width="860" height="590" rx="30" fill="#1b2150" opacity="${sk.dim}"/>` : ""}${litWindows}${cre}${glows}${WEATHER[c.weather] ? `<g class="c-weather">${WEATHER[c.weather]()}</g>` : ""}${pet}</svg>`;
}
// ───────── Icônes de la boutique (recadrage de la scène, sans animation) ─────────
const VIEW = {};
const bg = {};
const sample = (slot, id) => ({ castle: { [slot]: id } });
for (const [slot, table] of [
  ["walls", WALLS],
  ["towers", { "towers-square": 1, "towers-spire": 1, "towers-onion": 1 }],
]) {
  for (const id of Object.keys(table)) if (id !== "default") {
    VIEW[id] = [520, 150, 120, 250];
    bg[id] = "#e8edf7";
  }
}
for (const id of Object.keys(DOORS)) if (id !== "default") (VIEW[id] = [372, 300, 90, 120]), (bg[id] = WALLS.default[0]);
for (const id of Object.keys(WINDOWS)) if (id !== "default") (VIEW[id] = [326, 226, 210, 100]), (bg[id] = WALLS.default[0]);
for (const id of Object.keys(MOATS)) (VIEW[id] = [250, 340, 380, 125]), (bg[id] = "#bfd6a0");
for (const id of Object.keys(PATHS)) if (id !== "default") (VIEW[id] = [310, 340, 250, 140]), (bg[id] = "#bfd6a0");
Object.assign(VIEW, { "lights-lanterns": [280, 340, 270, 130], "lights-torches": [350, 296, 130, 90], "lights-fairy": [290, 236, 310, 80] });
Object.assign(bg, { "lights-lanterns": "#bfd6a0", "lights-torches": "#d2bc97", "lights-fairy": "#e8edf7" });
for (const id of Object.keys(WEATHER)) (VIEW[id] = [110, 40, 400, 250]), (bg[id] = id === "weather-fireflies" ? "#4b5588" : "#dbe6f2");
for (const id of Object.keys(CREATURES)) {
  const [, x, y] = FLY[id];
  VIEW[id] = [x - 6, y - 10, 110, 90];
  bg[id] = "#e8edf7";
}
for (const id of ["flags-rose", "flags-blue", "flags-stars"]) (VIEW[id] = [545, 100, 100, 110]), (bg[id] = "#e8edf7");
export const castleSceneItems = Object.keys(VIEW);
export function castleSceneIcon(id) {
  const v = VIEW[id];
  if (!v) return null;
  const slot = id.split("-")[0] === "flags" ? "flags" : id.split("-")[0];
  STILL = true;
  const svg = castleSvg(sample(slot, id), "ico" + id.replace(/[^a-z]/g, ""), { time: id === "weather-fireflies" ? "night" : "day" });
  STILL = false;
  // On garde le dessin complet mais on le recadre ; les halos de nuit et animations sont évités (jour).
  return svg
    .replace(/<ellipse cx="438" cy="506"[^>]*filter="[^"]*"\/>/, "")
    .replace(/^<svg class="castle-art castle-\w+" viewBox="[^"]+" role="img" aria-label="[^"]*">/, `<svg viewBox="${v.join(" ")}" class="item-art castle-icon castle-icon-still" aria-hidden="true" focusable="false">`)
    .replace(/(<rect width="860" height="590" rx="30" fill=")[^"]+("\/>)/, `$1${bg[id]}$2`);
}
