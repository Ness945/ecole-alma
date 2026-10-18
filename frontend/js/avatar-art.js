// Dessin de l'aventurière, de ses accessoires et de ses compagnons (SVG local, sans dépendance).
// Source unique : l'icône d'un objet dans la boutique et l'objet porté sur le personnage sont le MÊME dessin
// (l'icône n'est qu'un cadrage du fragment, avec ses propres couleurs), donc ils ne peuvent plus diverger.
// Aucun dégradé nommé : les identifiants dupliqués d'un document HTML rendraient les icônes fragiles.

export const skins = ["#f4c7a3", "#dca578", "#b97a51", "#875039"];
export const hairs = ["#59382e", "#a56539", "#e4bc68", "#302c39"];
export const styles = [
  { id: 0, name: "Cheveux longs" },
  { id: 1, name: "Queue de cheval" },
  { id: 2, name: "Tresses" },
  { id: 3, name: "Chignon" },
];

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
// Éclaircit (t > 0) ou assombrit (t < 0) une couleur #rrggbb.
export function shade(hex, t) {
  const n = parseInt(hex.slice(1), 16),
    f = (c) => clamp(t >= 0 ? c + (255 - c) * t : c * (1 + t));
  const r = f(n >> 16),
    g = f((n >> 8) & 255),
    b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
const line = (c) => shade(c, -0.28);

// ───────────────────────── Tenues ─────────────────────────
const DRESSES = {
  default: { base: "#4c9b91", trim: "#e2b866", collar: "#fff3da", deco: "" },
  "dress-lilac": { base: "#9685cb", trim: "#e2b866", collar: "#fff3da", deco: "stars" },
  "dress-rose": { base: "#df8b9d", trim: "#f3d27c", collar: "#fff3da", deco: "flowers" },
  "dress-sun": { base: "#f0bf55", trim: "#e98b4a", collar: "#fff6dc", deco: "rays" },
};
const CAPES = {
  "cape-forest": { base: "#658765", lining: "#8fb28f", deco: "leaves" },
  "cape-night": { base: "#54558c", lining: "#7a7bb3", deco: "stars" },
};

const star = (x, y, r, fill) => {
  const p = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2,
      d = i % 2 ? r * 0.45 : r;
    p.push(`${(x + Math.cos(a) * d).toFixed(1)} ${(y + Math.sin(a) * d).toFixed(1)}`);
  }
  return `<path d="M${p.join("L")}Z" fill="${fill}"/>`;
};
const flower = (x, y, r, petal, heart = "#f6d36e") =>
  `<g>${[0, 72, 144, 216, 288]
    .map((a) => `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * r).toFixed(1)}" cy="${(y + Math.sin((a * Math.PI) / 180) * r).toFixed(1)}" r="${(r * 0.8).toFixed(1)}" fill="${petal}"/>`)
    .join("")}<circle cx="${x}" cy="${y}" r="${(r * 0.7).toFixed(1)}" fill="${heart}"/></g>`;

// ───────────────────────── Fragments d'objets (coordonnées du personnage, viewBox 260×340) ─────────────────────────
const ART = {};

ART["head-hat"] = () => {
  const c = "#6f7bab";
  return `<ellipse cx="130" cy="72" rx="62" ry="13" fill="${shade(c, -0.12)}" stroke="${line(c)}" stroke-width="3"/><path d="M84 70Q92 22 126 8Q128 30 150 38Q160 52 176 70Q130 84 84 70Z" fill="${c}" stroke="${line(c)}" stroke-width="3" stroke-linejoin="round"/><path d="M87 63Q130 78 173 63" fill="none" stroke="#e4be75" stroke-width="8" stroke-linecap="round"/>${star(130, 68, 7, "#fff0bd")}<path d="M100 44Q108 26 122 18" fill="none" stroke="#ffffff55" stroke-width="4" stroke-linecap="round"/>`;
};
ART["head-crown"] = () =>
  `<path d="M88 70 84 36 108 52 130 24 152 52 176 36 172 70Q130 80 88 70Z" fill="#edc868" stroke="#b98a35" stroke-width="3" stroke-linejoin="round"/><path d="M88 70Q130 80 172 70" fill="none" stroke="#fff1b8" stroke-width="3" opacity=".7"/><path d="m130 44 7 10-7 10-7-10Z" fill="#86c1ad" stroke="#4f8f7b" stroke-width="2"/><circle cx="84" cy="36" r="4.5" fill="#f4a8b6"/><circle cx="130" cy="24" r="4.5" fill="#f4a8b6"/><circle cx="176" cy="36" r="4.5" fill="#f4a8b6"/>`;
ART["head-ribbon"] = () =>
  `<path d="M164 66Q136 42 132 66Q132 84 160 74Z" fill="#dc94af" stroke="#b86d89" stroke-width="3" stroke-linejoin="round"/><path d="M164 66Q194 40 196 68Q194 88 168 76Z" fill="#dc94af" stroke="#b86d89" stroke-width="3" stroke-linejoin="round"/><path d="M162 74Q154 96 146 104M168 76Q176 98 184 104" fill="none" stroke="#c97b97" stroke-width="7" stroke-linecap="round"/><circle cx="165" cy="70" r="9" fill="#f7c7d6" stroke="#b86d89" stroke-width="2"/>`;
ART["head-flowers"] = () => {
  const pts = [[92, 84, "#f4a8b6"], [104, 66, "#fff4d8"], [120, 56, "#f6d36e"], [138, 55, "#f4a8b6"], [156, 62, "#fff4d8"], [170, 76, "#f6d36e"], [176, 92, "#f4a8b6"]];
  return `<path d="M88 92Q96 56 130 52Q164 52 180 96" fill="none" stroke="#6f9d73" stroke-width="6" stroke-linecap="round"/>${[[98, 74], [150, 56], [172, 82]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="4" fill="#79a97c" transform="rotate(-30 ${x} ${y})"/>`).join("")}${pts.map(([x, y, c]) => flower(x, y, 5.5, c)).join("")}`;
};

ART["cape-forest"] = () => capeArt(CAPES["cape-forest"]);
ART["cape-night"] = () => capeArt(CAPES["cape-night"]);
function capeArt(c) {
  const deco =
    c.deco === "stars"
      ? `${star(86, 246, 7, "#ffe7a6")}${star(178, 266, 6, "#ffe7a6")}${star(100, 286, 4.5, "#ffe7a6")}${star(160, 232, 4, "#ffe7a6")}<circle cx="72" cy="270" r="2.5" fill="#ffe7a6"/><circle cx="188" cy="244" r="2.5" fill="#ffe7a6"/>`
      : `<path d="M88 232q8-12 20-6-6 12-20 6Zm74 30q10-12 22-4-8 14-22 4Zm-56 28q8-10 18-4-6 11-18 4Z" fill="#a9c9a3"/>`;
  return `<path d="M96 160C74 198 58 246 62 292Q130 320 198 292C202 246 186 198 164 160Z" fill="${c.base}" stroke="${line(c.base)}" stroke-width="3" stroke-linejoin="round"/><path d="M62 292Q130 320 198 292L194 278Q130 304 66 278Z" fill="${c.lining}" opacity=".75"/>${deco}<path d="M96 160Q130 150 164 160" fill="none" stroke="${shade(c.base, 0.25)}" stroke-width="5" stroke-linecap="round"/>`;
}
// Fermoir de cape, dessiné devant le cou.
const clasp = `<path d="M104 168Q130 176 156 168" fill="none" stroke="#e5c378" stroke-width="3" stroke-linecap="round"/><circle cx="130" cy="174" r="7" fill="#edc868" stroke="#b98a35" stroke-width="2"/><circle cx="130" cy="174" r="2.8" fill="#86c1ad"/>`;

function dressArt(id) {
  const d = DRESSES[id] ?? DRESSES.default;
  const deco =
    d.deco === "flowers"
      ? [[108, 198], [150, 206], [122, 226], [158, 232], [100, 236]].map(([x, y]) => flower(x, y, 4, "#fff0f3")).join("")
      : d.deco === "stars"
        ? [[110, 202], [152, 210], [124, 230], [160, 236], [98, 238]].map(([x, y]) => star(x, y, 5, "#f6e9ff")).join("")
        : d.deco === "rays"
          ? `<g stroke="${d.trim}" stroke-width="3" stroke-linecap="round" opacity=".9"><path d="M130 222v14M112 218l-6 12M148 218l6 12M96 226l-8 8M164 226l8 8"/></g>`
          : "";
  return `<path d="M95 160Q130 148 165 160L186 248q-14 12-28 5-14 11-28 5-14 6-28-5-14 7-28-5Z" fill="${d.base}" stroke="${line(d.base)}" stroke-width="3" stroke-linejoin="round"/><path d="M95 160Q130 148 165 160L170 190Q130 200 90 190Z" fill="${shade(d.base, 0.14)}"/>${deco}<path d="M92 204Q130 214 168 204" fill="none" stroke="${d.trim}" stroke-width="9" stroke-linecap="round"/><rect x="121" y="198" width="18" height="16" rx="4" fill="#fff0bd" stroke="${line(d.trim)}" stroke-width="2"/><path d="M104 162l26 26 26-26" fill="${d.collar}" stroke="${line(d.collar)}" stroke-width="2" stroke-linejoin="round"/>`;
}
ART["dress-lilac"] = () => dressArt("dress-lilac");
ART["dress-rose"] = () => dressArt("dress-rose");
ART["dress-sun"] = () => dressArt("dress-sun");

ART["wand-star"] = () =>
  `<path d="m196 232 30-92" stroke="#b28a52" stroke-width="7" stroke-linecap="round"/><path d="m196 232 30-92" stroke="#e1c08a" stroke-width="2" stroke-linecap="round" transform="translate(-1.5 0)"/>${star(231, 124, 20, "#f8d878").replace("/>", ' stroke="#c9a04a" stroke-width="2.5" stroke-linejoin="round"/>')}<circle cx="231" cy="124" r="5" fill="#fff3bf"/><g fill="#fff3bf"><circle cx="208" cy="106" r="2.5"/><circle cx="252" cy="140" r="2.5"/><circle cx="246" cy="98" r="2"/></g>`;
ART["bag-adventure"] = () =>
  `<path d="M104 166Q150 196 188 200" fill="none" stroke="#a47149" stroke-width="6" stroke-linecap="round"/><rect x="166" y="196" width="40" height="50" rx="11" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><path d="M168 208h36" stroke="#f0c796" stroke-width="3"/><rect x="175" y="220" width="22" height="18" rx="5" fill="#e6b174" stroke="#a97245" stroke-width="2"/><circle cx="186" cy="229" r="2.6" fill="#8d5d36"/>`;
ART["lantern-glow"] = () =>
  `<circle cx="196" cy="256" r="24" fill="#ffe9a0" opacity=".35"/><circle cx="196" cy="256" r="15" fill="#ffe9a0" opacity=".35"/><path d="M196 230q-12-16 0-24 12 8 0 24" fill="none" stroke="#8f7a55" stroke-width="3.5" stroke-linecap="round"/><path d="M186 234h20l4 8h-28Z" fill="#a98f5e" stroke="#7c6840" stroke-width="2" stroke-linejoin="round"/><rect x="184" y="242" width="24" height="26" rx="5" fill="#ffe08a" stroke="#a98f5e" stroke-width="3"/><path d="M196 248q5 6 0 14-5-8 0-14Z" fill="#f4a43a"/><path d="M182 270h28l-3 6h-22Z" fill="#a98f5e" stroke="#7c6840" stroke-width="2" stroke-linejoin="round"/>`;

// Chaussures : les jambes sont à x = 112 et 148, symétriques autour de x = 130 ; le pied droit est le miroir du gauche.
const SHOE_BROWN = "#805b47";
const pair = (left) => `${left}<g transform="translate(260 0) scale(-1 1)">${left}</g>`;
const shoes = (c, extra = "") =>
  pair(`<path d="M100 288H124V312H90Q80 312 82 303Q85 294 100 288Z" fill="${c}" stroke="${line(c)}" stroke-width="3" stroke-linejoin="round"/>${extra}`);
ART["boots-trail"] = () =>
  pair(`<path d="M101 266H123V296Q124 306 130 312H90Q80 312 82 303Q86 295 101 292Z" fill="#a8654b" stroke="#6f3f2d" stroke-width="3" stroke-linejoin="round"/><path d="M101 274H123" stroke="#e6c79a" stroke-width="6" stroke-linecap="round"/><path d="M84 307H128" stroke="#6f3f2d" stroke-width="4" stroke-linecap="round"/>`);
ART["shoes-star"] = () =>
  shoes("#8f78c4", `<path d="M103 296H123" stroke="#d9cdf3" stroke-width="4" stroke-linecap="round"/>${star(96, 302, 5.5, "#ffe7a6")}`);
ART["feet-default"] = () => shoes(SHOE_BROWN);

// Cadrage de chaque icône : [x, y, largeur, hauteur] dans le repère du personnage.
const VIEW = {
  "head-hat": [60, 0, 140, 92],
  "head-crown": [72, 14, 116, 74],
  "head-ribbon": [124, 36, 80, 74],
  "head-flowers": [78, 40, 114, 66],
  "cape-forest": [50, 150, 160, 176],
  "cape-night": [50, 150, 160, 176],
  "dress-lilac": [72, 140, 120, 130],
  "dress-rose": [72, 140, 120, 130],
  "dress-sun": [72, 140, 120, 130],
  "wand-star": [176, 86, 94, 160],
  "bag-adventure": [96, 156, 120, 100],
  "lantern-glow": [164, 196, 66, 90],
  "boots-trail": [72, 258, 116, 60],
  "shoes-star": [72, 280, 116, 40],
};
export const avatarItems = Object.keys(ART).filter((k) => k !== "feet-default");

export function avatarItemArt(id) {
  const v = VIEW[id];
  if (!v || !ART[id]) return null;
  return `<svg viewBox="${v.join(" ")}" class="item-art" aria-hidden="true" focusable="false">${ART[id]()}</svg>`;
}

// ───────────────────────── Compagnons ─────────────────────────
export function petArt(id) {
  if (id === "fox")
    return `<path d="M52 62q22 6 20-14-6-14-14-6Z" fill="#e88a3d" stroke="#a9591f" stroke-width="2"/><path d="M60 52q8-4 8 4-4 6-8 4Z" fill="#fff3da"/><ellipse cx="34" cy="56" rx="22" ry="16" fill="#e88a3d" stroke="#a9591f" stroke-width="2"/><path d="M22 64q12 8 24 0 0 8-12 8-12 0-12-8Z" fill="#fff3da"/><circle cx="24" cy="36" r="13" fill="#e88a3d" stroke="#a9591f" stroke-width="2"/><path d="M13 30 11 14l11 8Zm22-8 10-6-1 16Z" fill="#e88a3d" stroke="#a9591f" stroke-width="2" stroke-linejoin="round"/><path d="M18 40q6 7 14 0 0 7-7 8-7-1-7-8Z" fill="#fff3da"/><circle cx="19" cy="34" r="1.8" fill="#3d3034"/><circle cx="30" cy="34" r="1.8" fill="#3d3034"/><circle cx="24.5" cy="39" r="2" fill="#3d3034"/><path d="M20 70v6m28-6v6" stroke="#a9591f" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "dragon")
    return `<path d="M58 58q22-4 24 12-8 4-14-2Z" fill="#7bbf8d" stroke="#3f8a58" stroke-width="2"/><ellipse cx="36" cy="58" rx="22" ry="16" fill="#7bbf8d" stroke="#3f8a58" stroke-width="2"/><ellipse cx="36" cy="64" rx="13" ry="9" fill="#e9f3c8"/><path d="M26 44q-10-12 2-16l4 14Zm20 0q8-12-2-16l-4 14Z" fill="#7bbf8d" stroke="#3f8a58" stroke-width="2" stroke-linejoin="round"/><path d="M28 44q-18-8-12-22 4 4 8 6M44 44q16-4 18-16-6 0-9 4" fill="#a8d9b4" stroke="#3f8a58" stroke-width="2"/><circle cx="26" cy="40" r="11" fill="#7bbf8d" stroke="#3f8a58" stroke-width="2"/><circle cx="22" cy="38" r="2" fill="#3d3034"/><circle cx="31" cy="38" r="2" fill="#3d3034"/><path d="M24 45q3 2 6 0" fill="none" stroke="#3f8a58" stroke-width="2" stroke-linecap="round"/><path d="M22 74v6m30-6v6" stroke="#3f8a58" stroke-width="4" stroke-linecap="round"/><path d="M40 44l4-6 3 6Zm9 2 4-6 2 7Z" fill="#f2c866"/>`;
  return "";
}

// ───────────────────────── Cheveux ─────────────────────────
function hairBack(style, c) {
  const o = line(c);
  if (style === 1)
    return `<path d="M170 72C210 66 228 112 214 154 208 178 196 190 186 198 192 170 194 142 178 116Z" fill="${c}" stroke="${o}" stroke-width="3" stroke-linejoin="round"/><path d="M80 112C70 60 100 40 130 40c32 0 60 22 50 72Z" fill="${c}"/>`;
  if (style === 2) return `<path d="M80 112C70 60 100 38 130 38c32 0 60 22 50 74Z" fill="${c}"/>`;
  if (style === 3) return `<path d="M80 112C70 60 100 38 130 38c32 0 60 22 50 74Z" fill="${c}"/>`;
  return `<path d="M78 112C54 150 58 202 76 224c24 10 84 10 108 0 18-22 22-74-2-112C170 40 90 40 78 112Z" fill="${c}" stroke="${o}" stroke-width="3" stroke-linejoin="round"/>`;
}
function hairFront(style, c) {
  const o = line(c),
    hi = shade(c, 0.28);
  const bangs = `<path d="M80 110C72 62 100 38 132 38c34 0 52 30 48 72-10-16-22-30-30-44-12 22-40 38-70 44Z" fill="${c}" stroke="${o}" stroke-width="3" stroke-linejoin="round"/><path d="M96 60Q118 44 142 48" fill="none" stroke="${hi}" stroke-width="5" stroke-linecap="round" opacity=".7"/><path d="M84 106q-8 14-6 34m96-34q10 14 8 32" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`;
  if (style === 3)
    return `<circle cx="130" cy="36" r="21" fill="${c}" stroke="${o}" stroke-width="3"/><path d="M118 28q10-8 22-2" fill="none" stroke="${hi}" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="M110 52q20 10 40 0" fill="none" stroke="#dc94af" stroke-width="6" stroke-linecap="round"/>${bangs}`;
  if (style === 1) return `${bangs}<path d="M170 78q12 4 12 14" fill="none" stroke="#dc94af" stroke-width="8" stroke-linecap="round"/>`;
  return bangs;
}
function braids(c) {
  const o = line(c);
  const braid = (x0, x1) =>
    [0, 1, 2, 3, 4].map((i) => `<ellipse cx="${(x0 + ((x1 - x0) * i) / 4).toFixed(1)}" cy="${166 + i * 17}" rx="9" ry="9.5" fill="${c}" stroke="${o}" stroke-width="2.5"/>`).join("");
  return `${braid(94, 84)}${braid(166, 176)}<circle cx="83" cy="236" r="5" fill="#dc94af"/><circle cx="177" cy="236" r="5" fill="#dc94af"/>`;
}

// ───────────────────────── Personnage ─────────────────────────
export function avatarSvg(rpg, label = "Ton aventurière", opts = {}) {
  const skin = skins[rpg.look.skin] ?? skins[0],
    hair = hairs[rpg.look.hair] ?? hairs[0],
    style = rpg.look.style ?? 0,
    e = rpg.equipped,
    skinO = line(skin);
  const dressId = e.dress && DRESSES[e.dress] ? e.dress : "default";
  const feet = e.feet && ART[e.feet] ? ART[e.feet]() : ART["feet-default"]();
  const arm = (x1, y1, x2, y2, sleeve) =>
    `<path d="M${x1} ${y1}Q${(x1 + x2) / 2 + (x1 < 130 ? -6 : 6)} ${(y1 + y2) / 2 - 6} ${x2} ${y2}" fill="none" stroke="${skin}" stroke-width="17" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="9.5" fill="${skin}"/><path d="M${x1} ${y1}Q${(x1 + x2) / 2 + (x1 < 130 ? -4 : 4)} ${(y1 + y2) / 2 - 8} ${x1 + (x2 - x1) * 0.45} ${y1 + (y2 - y1) * 0.45}" fill="none" stroke="${sleeve}" stroke-width="19" stroke-linecap="round"/>`;
  const sleeve = DRESSES[dressId].base;
  const pet = opts.pet && petArt(opts.pet) ? `<g transform="translate(196 250) scale(.78)">${petArt(opts.pet)}</g>` : "";
  return `<svg class="girl-avatar" viewBox="0 0 260 340" role="img" aria-label="${label}"><ellipse cx="130" cy="320" rx="68" ry="11" fill="#4f3b6420"/>${e.cape && ART[e.cape] ? ART[e.cape]() : ""}${hairBack(style, hair)}<path d="M112 238v52m36-52v52" stroke="${skin}" stroke-width="19" stroke-linecap="round"/>${feet}${dressArt(dressId)}${style === 2 ? braids(hair) : ""}${arm(97, 172, 70, 226, sleeve)}${arm(163, 172, 190, 226, sleeve)}<path d="M118 142v22q12 10 24 0v-22" fill="${skin}" stroke="${skinO}" stroke-width="2"/><ellipse cx="83" cy="116" rx="7" ry="10" fill="${skin}" stroke="${skinO}" stroke-width="2"/><ellipse cx="177" cy="116" rx="7" ry="10" fill="${skin}" stroke="${skinO}" stroke-width="2"/><path d="M84 106C84 70 106 54 130 54s46 16 46 52c0 32-20 54-46 54s-46-22-46-54Z" fill="${skin}" stroke="${skinO}" stroke-width="2.5"/><g fill="#fff"><ellipse cx="111" cy="112" rx="8" ry="10"/><ellipse cx="149" cy="112" rx="8" ry="10"/></g><g fill="#5a3b2e"><ellipse cx="111" cy="113" rx="6" ry="8"/><ellipse cx="149" cy="113" rx="6" ry="8"/></g><g fill="#2f2428"><ellipse cx="111" cy="114" rx="3.4" ry="5"/><ellipse cx="149" cy="114" rx="3.4" ry="5"/></g><g fill="#fff"><circle cx="113.5" cy="109.5" r="2.2"/><circle cx="151.5" cy="109.5" r="2.2"/><circle cx="108.5" cy="117.5" r="1.1"/><circle cx="146.5" cy="117.5" r="1.1"/></g><path d="M100 98q11-8 22-1m16 1q11-7 22 1" fill="none" stroke="${shade(hair, -0.1)}" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="100" cy="132" rx="9.5" ry="5.5" fill="#e98f8c" opacity=".42"/><ellipse cx="160" cy="132" rx="9.5" ry="5.5" fill="#e98f8c" opacity=".42"/><path d="M127 126q3 3 6 0" fill="none" stroke="${shade(skin, -0.25)}" stroke-width="2.2" stroke-linecap="round"/><path d="M120 137q10 9 20 0" fill="none" stroke="#a15853" stroke-width="3.2" stroke-linecap="round"/>${hairFront(style, hair)}${e.cape ? clasp : ""}${e.head && ART[e.head] ? ART[e.head]() : ""}${e.hand && ART[e.hand] ? ART[e.hand]() : ""}${pet}</svg>`;
}
