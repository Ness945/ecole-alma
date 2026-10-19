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
  "dress-ocean": { base: "#4f93c7", trim: "#f2d58a", collar: "#f4fbff", deco: "waves" },
  "dress-night": { base: "#3f4a82", trim: "#e9c875", collar: "#e9eaf7", deco: "stars", mark: "#ffe7a6" },
  "dress-berry": { base: "#c2495f", trim: "#f6d6a0", collar: "#fff3e6", deco: "dots" },
  "dress-meadow": { base: "#7fbf7a", trim: "#f2d27a", collar: "#fffbe6", deco: "flowers", petal: "#fff3a8" },
};
const CAPES = {
  "cape-forest": { base: "#658765", lining: "#8fb28f", deco: "leaves" },
  "cape-night": { base: "#54558c", lining: "#7a7bb3", deco: "stars" },
  "cape-royal": { base: "#b8435a", lining: "#efe0cf", deco: "ermine" },
  "cape-rain": { base: "#f2c23e", lining: "#e0a82a", deco: "buttons" },
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
ART["cape-royal"] = () => capeArt(CAPES["cape-royal"]);
ART["cape-rain"] = () => capeArt(CAPES["cape-rain"]);
function capeArt(c) {
  const deco =
    c.deco === "stars"
      ? `${star(86, 246, 7, "#ffe7a6")}${star(178, 266, 6, "#ffe7a6")}${star(100, 286, 4.5, "#ffe7a6")}${star(160, 232, 4, "#ffe7a6")}<circle cx="72" cy="270" r="2.5" fill="#ffe7a6"/><circle cx="188" cy="244" r="2.5" fill="#ffe7a6"/>`
      : c.deco === "ermine"
        ? `<path d="M90 160Q130 148 170 160L176 182Q130 172 84 182Z" fill="#fbf6ee"/>${[[100, 170], [120, 168], [140, 168], [160, 170]].map(([x, y]) => `<path d="M${x} ${y}l3 8-3-1-3 1Z" fill="#3b3140"/>`).join("")}<path d="M66 286Q130 314 194 286L196 294Q130 324 64 294Z" fill="#fbf6ee"/>`
        : c.deco === "buttons"
          ? `<g fill="#fff4c9" stroke="#b98a1f" stroke-width="2"><circle cx="130" cy="196" r="4.5"/><circle cx="130" cy="226" r="4.5"/><circle cx="130" cy="256" r="4.5"/></g><path d="M130 176v110" stroke="#c9961f" stroke-width="2" stroke-dasharray="3 5"/>`
          : `<path d="M88 232q8-12 20-6-6 12-20 6Zm74 30q10-12 22-4-8 14-22 4Zm-56 28q8-10 18-4-6 11-18 4Z" fill="#a9c9a3"/>`;
  return `<path d="M96 160C74 198 58 246 62 292Q130 320 198 292C202 246 186 198 164 160Z" fill="${c.base}" stroke="${line(c.base)}" stroke-width="3" stroke-linejoin="round"/><path d="M62 292Q130 320 198 292L194 278Q130 304 66 278Z" fill="${c.lining}" opacity=".75"/>${deco}<path d="M96 160Q130 150 164 160" fill="none" stroke="${shade(c.base, 0.25)}" stroke-width="5" stroke-linecap="round"/>`;
}
// Fermoir de cape, dessiné devant le cou.
const clasp = `<path d="M104 168Q130 176 156 168" fill="none" stroke="#e5c378" stroke-width="3" stroke-linecap="round"/><circle cx="130" cy="174" r="7" fill="#edc868" stroke="#b98a35" stroke-width="2"/><circle cx="130" cy="174" r="2.8" fill="#86c1ad"/>`;

function dressArt(id) {
  const d = DRESSES[id] ?? DRESSES.default;
  const deco =
    d.deco === "flowers"
      ? [[108, 198], [150, 206], [122, 226], [158, 232], [100, 236]].map(([x, y]) => flower(x, y, 4, d.petal || "#fff0f3")).join("")
      : d.deco === "waves"
        ? `<g fill="none" stroke="#e6f6ff" stroke-width="3" stroke-linecap="round" opacity=".9"><path d="M100 224q8-7 16 0t16 0t16 0t16 0"/><path d="M104 240q8-7 16 0t16 0t16 0"/></g><circle cx="108" cy="204" r="3" fill="#e6f6ff"/><circle cx="154" cy="212" r="2.5" fill="#e6f6ff"/>`
        : d.deco === "dots"
          ? [[104, 200], [152, 204], [122, 224], [160, 232], [100, 236], [138, 240]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#fff3e6"/>`).join("")
      : d.deco === "stars"
        ? [[110, 202], [152, 210], [124, 230], [160, 236], [98, 238]].map(([x, y]) => star(x, y, 5, d.mark || "#f6e9ff")).join("")
        : d.deco === "rays"
          ? `<g stroke="${d.trim}" stroke-width="3" stroke-linecap="round" opacity=".9"><path d="M130 222v14M112 218l-6 12M148 218l6 12M96 226l-8 8M164 226l8 8"/></g>`
          : "";
  return `<path d="M95 160Q130 148 165 160L186 248q-14 12-28 5-14 11-28 5-14 6-28-5-14 7-28-5Z" fill="${d.base}" stroke="${line(d.base)}" stroke-width="3" stroke-linejoin="round"/><path d="M95 160Q130 148 165 160L170 190Q130 200 90 190Z" fill="${shade(d.base, 0.14)}"/>${deco}<path d="M92 204Q130 214 168 204" fill="none" stroke="${d.trim}" stroke-width="9" stroke-linecap="round"/><rect x="121" y="198" width="18" height="16" rx="4" fill="#fff0bd" stroke="${line(d.trim)}" stroke-width="2"/><path d="M104 162l26 26 26-26" fill="${d.collar}" stroke="${line(d.collar)}" stroke-width="2" stroke-linejoin="round"/>`;
}
ART["dress-lilac"] = () => dressArt("dress-lilac");
ART["dress-rose"] = () => dressArt("dress-rose");
ART["dress-sun"] = () => dressArt("dress-sun");
ART["dress-ocean"] = () => dressArt("dress-ocean");
ART["dress-night"] = () => dressArt("dress-night");
ART["dress-berry"] = () => dressArt("dress-berry");
ART["dress-meadow"] = () => dressArt("dress-meadow");

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
// ───────────────────────── Nouveaux accessoires ─────────────────────────
const mirror = (g) => `${g}<g transform="translate(260 0) scale(-1 1)">${g}</g>`;
// Sur la tête
ART["head-catears"] = () =>
  `<path d="M86 92Q86 44 130 40Q174 44 174 92" fill="none" stroke="#4a4458" stroke-width="7" stroke-linecap="round"/>${mirror(`<path d="M98 58 94 20 126 42Z" fill="#4a4458" stroke="#2f2a3a" stroke-width="3" stroke-linejoin="round"/><path d="M100 52 98 32 116 44Z" fill="#f2a7bd"/>`)}`;
ART["head-bunnyears"] = () =>
  `<path d="M88 90Q90 50 130 48Q170 50 172 90" fill="none" stroke="#f3a7bf" stroke-width="7" stroke-linecap="round"/>${mirror(`<ellipse cx="106" cy="36" rx="11" ry="28" transform="rotate(-10 106 36)" fill="#fffaf5" stroke="#cdbfd0" stroke-width="3"/><ellipse cx="106" cy="38" rx="5" ry="19" transform="rotate(-10 106 38)" fill="#f6bccb"/>`)}`;
ART["head-beanie"] = () =>
  `<path d="M86 86Q82 30 130 26Q178 30 174 86Q130 72 86 86Z" fill="#d95d6b" stroke="#a63f4d" stroke-width="3" stroke-linejoin="round"/><path d="M84 80Q130 66 176 80V94Q130 80 84 94Z" fill="#f4e9d6" stroke="#cdbb9b" stroke-width="2.5" stroke-linejoin="round"/><path d="M100 76v18m16-18v18m16-18v18m16-18v18m16-18v18" stroke="#e0cfb2" stroke-width="2"/><circle cx="130" cy="22" r="14" fill="#f8eee0" stroke="#cdbb9b" stroke-width="3"/><path d="M122 18q8-8 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
ART["head-beret"] = () =>
  `<path d="M90 74Q76 40 124 34Q178 28 186 62Q178 84 128 82Q96 82 90 74Z" fill="#c4474f" stroke="#8f2f38" stroke-width="3" stroke-linejoin="round"/><path d="M100 54Q124 42 156 46" fill="none" stroke="#e98a90" stroke-width="4" stroke-linecap="round" opacity=".7"/><path d="m126 33 5-10" stroke="#8f2f38" stroke-width="5" stroke-linecap="round"/>`;
ART["head-tiara"] = () =>
  `<path d="M90 80Q130 46 170 80" fill="none" stroke="#dfe6ee" stroke-width="6" stroke-linecap="round"/><path d="M90 80Q130 46 170 80" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/><path d="M118 58 130 36 142 58Z" fill="#eef3f8" stroke="#aab7c5" stroke-width="2.5" stroke-linejoin="round"/><path d="M98 70 106 52 116 64Z M144 64 154 52 162 70Z" fill="#eef3f8" stroke="#aab7c5" stroke-width="2.5" stroke-linejoin="round"/><circle cx="130" cy="46" r="6" fill="#7cc4e8" stroke="#4f8fb8" stroke-width="2"/><circle cx="106" cy="62" r="3.8" fill="#f4a8b6"/><circle cx="154" cy="62" r="3.8" fill="#f4a8b6"/>`;
ART["head-sunhat"] = () =>
  `<ellipse cx="130" cy="70" rx="76" ry="17" fill="#ecd08a" stroke="#b99650" stroke-width="3"/><path d="M92 68Q90 28 130 26Q170 28 168 68Q130 82 92 68Z" fill="#f2dc9c" stroke="#b99650" stroke-width="3" stroke-linejoin="round"/><path d="M92 62Q130 78 168 62" fill="none" stroke="#e56f7f" stroke-width="9" stroke-linecap="round"/>${flower(160, 66, 5, "#fff4d8")}<path d="M60 70Q80 80 130 82" fill="none" stroke="#d6b66c" stroke-width="2"/>`;
// Visage
ART["face-glasses"] = () =>
  `<g fill="#cfe9f544" stroke="#7a5236" stroke-width="3.5"><circle cx="111" cy="112" r="15"/><circle cx="149" cy="112" r="15"/></g><path d="M126 110Q130 106 134 110M96 108 84 104m80 4 12-4" fill="none" stroke="#7a5236" stroke-width="3.5" stroke-linecap="round"/><path d="M102 102q6-4 12-2" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
ART["face-heartglasses"] = () => {
  const h = `<path d="M111 128C90 114 92 96 104 97 109 98 111 102 111 105 111 102 113 98 118 97 130 96 132 114 111 128Z" fill="#f48fb166" stroke="#c2577c" stroke-width="3.5" stroke-linejoin="round"/>`;
  return `${h}<g transform="translate(38 0)">${h}</g><path d="M127 106Q131 102 135 106M92 104 84 100m84 4 8-4" fill="none" stroke="#c2577c" stroke-width="3.5" stroke-linecap="round"/>`;
};
ART["face-stars"] = () =>
  `${star(97, 134, 9, "#f6c94e").replace("/>", ' stroke="#c9902a" stroke-width="1.5" stroke-linejoin="round"/>')}${star(163, 130, 8, "#ee7fb2").replace("/>", ' stroke="#b8527f" stroke-width="1.5" stroke-linejoin="round"/>')}<circle cx="88" cy="122" r="2.4" fill="#ee7fb2"/><circle cx="173" cy="141" r="2.4" fill="#f6c94e"/><circle cx="106" cy="146" r="2" fill="#6fb5d6"/>`;
ART["face-mask"] = () =>
  `<path fill-rule="evenodd" d="M88 106Q110 92 130 102Q150 92 172 106Q168 128 148 128Q136 128 130 118Q124 128 112 128Q92 128 88 106ZM103 112a8 10 0 1 0 16 0a8 10 0 1 0-16 0ZM141 112a8 10 0 1 0 16 0a8 10 0 1 0-16 0Z" fill="#7e5fb3" stroke="#59418a" stroke-width="3" stroke-linejoin="round"/>${star(96, 104, 4.5, "#ffe7a6")}${star(164, 104, 4.5, "#ffe7a6")}`;
// Autour du cou
ART["neck-scarf"] = () =>
  `<path d="M138 172 154 218 134 224 122 180Z" fill="#d95d6b" stroke="#a63f4d" stroke-width="3" stroke-linejoin="round"/><path d="m146 198 8 20-14 4-5-14Z" fill="#f4e9d6"/><path d="M141 224l-2 8m8-10-2 8m8-8-2 6" stroke="#d95d6b" stroke-width="3" stroke-linecap="round"/><path d="M102 150Q130 172 158 150L162 168Q130 190 98 168Z" fill="#d95d6b" stroke="#a63f4d" stroke-width="3" stroke-linejoin="round"/><path d="m112 160-2 14m14-12-1 16m17-14 1 14m13-16 2 12" stroke="#f4e9d6" stroke-width="4" stroke-linecap="round"/>`;
ART["neck-star"] = () =>
  `<path d="M108 158Q130 198 152 158" fill="none" stroke="#e5c378" stroke-width="3" stroke-linecap="round"/>${star(130, 190, 11, "#f8d878").replace("/>", ' stroke="#c9a04a" stroke-width="2" stroke-linejoin="round"/>')}<circle cx="130" cy="190" r="3" fill="#fff3bf"/>`;
ART["neck-pearls"] = () => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8,
      u = 1 - t;
    return [u * u * 106 + 2 * u * t * 130 + t * t * 154, u * u * 156 + 2 * u * t * 192 + t * t * 156];
  });
  return pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="#fff8ef" stroke="#d6c4b2" stroke-width="1.6"/>`).join("");
};
ART["neck-medal"] = () =>
  `<path d="M110 156 130 192 150 156 142 154 130 174 118 154Z" fill="#4a8bc4" stroke="#2f6595" stroke-width="2" stroke-linejoin="round"/><circle cx="130" cy="200" r="12" fill="#edc868" stroke="#b98a35" stroke-width="3"/>${star(130, 200, 7, "#fff1b8")}`;
ART["neck-bow"] = () =>
  `<path d="M130 172 106 160V184Z" fill="#e2557a" stroke="#a83454" stroke-width="2.5" stroke-linejoin="round"/><path d="M130 172 154 160V184Z" fill="#e2557a" stroke="#a83454" stroke-width="2.5" stroke-linejoin="round"/><circle cx="130" cy="172" r="6" fill="#f08ba5" stroke="#a83454" stroke-width="2.5"/><path d="M112 168v8m-3-10v12M148 168v8m3-10v12" stroke="#f6b4c6" stroke-width="2" stroke-linecap="round"/>`;
// Dans le dos
const wingTop = (fill, stroke) => `<path d="M106 172C72 96 4 70 8 140 12 192 68 206 106 190Z" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;
const wingLow = (fill, stroke) => `<path d="M106 194C74 204 22 232 40 262 78 278 110 230 112 200Z" fill="${fill}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;
ART["back-fairy"] = () =>
  mirror(`${wingTop("#e2f4fa", "#8fc6dc")}${wingLow("#d6ecf6", "#8fc6dc")}<path d="M104 174Q56 118 18 106M104 182Q52 150 16 150M104 188Q52 184 20 172M108 204Q70 226 44 256" fill="none" stroke="#bfe0ee" stroke-width="2.5" stroke-linecap="round"/>`);
ART["back-butterfly"] = () =>
  mirror(`${wingTop("#f29bb5", "#b8587a")}${wingLow("#f6c36e", "#c58a2c")}<circle cx="36" cy="128" r="10" fill="#fff3f6"/><circle cx="66" cy="168" r="6" fill="#fff3f6"/><circle cx="62" cy="240" r="7" fill="#fff7dd"/>`);
ART["back-dragon"] = () =>
  mirror(`<path d="M106 178C80 120 30 90 6 94 24 112 22 132 16 148 34 150 38 166 34 182 54 180 76 188 106 196Z" fill="#7bbf8d" stroke="#3f8a58" stroke-width="3" stroke-linejoin="round"/><path d="M106 180 14 104M106 186 22 150M106 192 36 182" fill="none" stroke="#3f8a58" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>`);
// Chaussures
const bootArt = (c, band) =>
  pair(`<path d="M101 266H123V296Q124 306 130 312H90Q80 312 82 303Q86 295 101 292Z" fill="${c}" stroke="${line(c)}" stroke-width="3" stroke-linejoin="round"/><path d="M101 274H123" stroke="${band}" stroke-width="6" stroke-linecap="round"/><path d="M84 307H128" stroke="${line(c)}" stroke-width="4" stroke-linecap="round"/>`);
ART["boots-rain"] = () => bootArt("#f0c23c", "#e98a8a");
ART["shoes-sneakers"] = () =>
  shoes("#f6f3f8", `<path d="M86 300H124" stroke="#e98a8a" stroke-width="3" stroke-linecap="round"/><path d="M86 305H122" stroke="#f2c76a" stroke-width="3" stroke-linecap="round"/><path d="M90 310H118" stroke="#8cc3e0" stroke-width="3" stroke-linecap="round"/><path d="M106 292l12-2m-12 6 12-2" stroke="#b8a9c9" stroke-width="2" stroke-linecap="round"/>`);
ART["shoes-ballet"] = () =>
  shoes("#f3a7bf", `<path d="M96 294 88 289V300Zm0 0 8-5V300Z" fill="#dc7898" stroke="#b9577a" stroke-width="1.5" stroke-linejoin="round"/>`);
// Dans la main
ART["hand-balloon"] = () =>
  `<path d="M190 226Q194 196 206 164" fill="none" stroke="#b9b0c4" stroke-width="2.5" stroke-linecap="round"/><path d="m206 162-5 8h10Z" fill="#b13a4f"/><ellipse cx="206" cy="136" rx="24" ry="29" fill="#e8546a" stroke="#b13a4f" stroke-width="3"/><path d="M193 122q4-12 14-14" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`;
ART["hand-bouquet"] = () =>
  `<path d="M190 214 182 188M190 214 196 186M190 214 208 196" stroke="#6f9d73" stroke-width="4" stroke-linecap="round"/>${flower(181, 184, 6, "#f4a8b6")}${flower(197, 180, 6, "#fff4d8")}${flower(211, 193, 6, "#f6d36e")}<path d="M176 206h28l-14 34Z" fill="#f6e3c0" stroke="#c9b083" stroke-width="2.5" stroke-linejoin="round"/><path d="M180 214h20" stroke="#e56f7f" stroke-width="3" stroke-linecap="round"/>`;
ART["hand-book"] = () =>
  `<path d="M42 214 70 220 98 214V246L70 252 42 246Z" fill="#5b78b5" stroke="#3a5588" stroke-width="3" stroke-linejoin="round"/><path d="M47 217 70 223V246L47 241Z M93 217 70 223V246L93 241Z" fill="#fff6e0" stroke="#d8c9a3" stroke-width="1.5" stroke-linejoin="round"/>${star(58, 232, 6, "#f0b94e")}<path d="M78 230h12m-12 6h10" stroke="#c9b27a" stroke-width="2" stroke-linecap="round"/><g fill="#fff3bf"><circle cx="52" cy="200" r="2.5"/><circle cx="86" cy="196" r="2"/><circle cx="70" cy="188" r="3"/></g>`;
ART["hand-umbrella"] = () =>
  `<path d="M197 168V222Q197 234 188 232" fill="none" stroke="#7a5a3a" stroke-width="5" stroke-linecap="round"/><path d="M146 172Q146 130 197 124Q248 130 248 172Q235 162 222 172Q210 162 197 172Q184 162 172 172Q159 162 146 172Z" fill="#8fb6e8" stroke="#4f7fb8" stroke-width="3" stroke-linejoin="round"/><path d="M197 124 172 172M197 124 222 172M197 124V172" fill="none" stroke="#4f7fb8" stroke-width="2" opacity=".6"/>`;


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
  "head-catears": [76, 10, 108, 90],
  "head-bunnyears": [78, 2, 104, 100],
  "head-beanie": [66, 4, 128, 96],
  "head-beret": [72, 22, 124, 66],
  "head-tiara": [76, 30, 108, 56],
  "head-sunhat": [48, 14, 164, 80],
  "face-glasses": [80, 92, 100, 44],
  "face-heartglasses": [80, 90, 100, 44],
  "face-stars": [80, 116, 104, 36],
  "face-mask": [80, 88, 100, 46],
  "neck-scarf": [90, 144, 82, 96],
  "neck-star": [96, 150, 68, 54],
  "neck-pearls": [98, 148, 64, 50],
  "neck-medal": [98, 148, 64, 72],
  "neck-bow": [96, 152, 68, 40],
  "back-fairy": [4, 70, 252, 210],
  "back-butterfly": [4, 70, 252, 210],
  "back-dragon": [2, 80, 256, 130],
  "cape-royal": [50, 150, 160, 176],
  "cape-rain": [50, 150, 160, 176],
  "dress-ocean": [72, 140, 120, 130],
  "dress-night": [72, 140, 120, 130],
  "dress-berry": [72, 140, 120, 130],
  "dress-meadow": [72, 140, 120, 130],
  "boots-rain": [72, 258, 116, 60],
  "shoes-sneakers": [72, 280, 116, 40],
  "shoes-ballet": [72, 280, 116, 40],
  "hand-balloon": [170, 104, 76, 130],
  "hand-bouquet": [164, 170, 60, 74],
  "hand-book": [34, 180, 74, 76],
  "hand-umbrella": [136, 112, 124, 128],
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
  if (id === "bunny")
    return `<ellipse cx="60" cy="62" rx="7" ry="6" fill="#fff" stroke="#b9a89a" stroke-width="2"/><ellipse cx="36" cy="60" rx="21" ry="15" fill="#f3ece6" stroke="#b9a89a" stroke-width="2"/><path d="M18 68q12 7 24 0" fill="none" stroke="#e6d8cb" stroke-width="3" stroke-linecap="round"/><ellipse cx="21" cy="18" rx="4.5" ry="13" fill="#f3ece6" stroke="#b9a89a" stroke-width="2"/><ellipse cx="33" cy="17" rx="4.5" ry="13" fill="#f3ece6" stroke="#b9a89a" stroke-width="2"/><ellipse cx="21" cy="19" rx="1.8" ry="8" fill="#f2b8c3"/><ellipse cx="33" cy="18" rx="1.8" ry="8" fill="#f2b8c3"/><circle cx="27" cy="40" r="13" fill="#f3ece6" stroke="#b9a89a" stroke-width="2"/><circle cx="22" cy="38" r="1.9" fill="#3d3034"/><circle cx="32" cy="38" r="1.9" fill="#3d3034"/><path d="M25 43q2 2 4 0" fill="none" stroke="#c9758a" stroke-width="2" stroke-linecap="round"/><ellipse cx="18" cy="43" rx="3" ry="2" fill="#f2b8c3" opacity=".7"/><path d="M22 72v6m26-6v6" stroke="#b9a89a" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "hedgehog")
    return `<path d="M24 52 18 40l10 4 2-12 8 8 6-12 6 12 8-9 2 12 9-6-3 12 9 0-4 9q2 12-14 16H34q-14-8-10-22Z" fill="#7a5a47" stroke="#4f3a2d" stroke-width="2" stroke-linejoin="round"/><ellipse cx="40" cy="62" rx="22" ry="14" fill="#8d6b55"/><ellipse cx="22" cy="62" rx="13" ry="10" fill="#f0d4b4" stroke="#b08a63" stroke-width="2"/><circle cx="16" cy="59" r="2" fill="#3d3034"/><circle cx="25" cy="59" r="2" fill="#3d3034"/><circle cx="11" cy="65" r="2.6" fill="#3d3034"/><path d="M24 76v5m22-5v5" stroke="#b08a63" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "owl")
    return `<path d="M20 38 16 20l12 8Zm36 0 4-18-12 8Z" fill="#a47649" stroke="#6f4d2c" stroke-width="2" stroke-linejoin="round"/><ellipse cx="38" cy="54" rx="21" ry="24" fill="#b98a5e" stroke="#6f4d2c" stroke-width="2"/><ellipse cx="38" cy="62" rx="12" ry="14" fill="#f1dcb8"/><path d="M30 58q8 4 16 0m-14 8q6 3 12 0" fill="none" stroke="#c9a77a" stroke-width="2" stroke-linecap="round"/><path d="M17 52q-6 14 4 26M59 52q6 14-4 26" fill="#a47649" stroke="#6f4d2c" stroke-width="2"/><circle cx="29" cy="42" r="9" fill="#fff" stroke="#6f4d2c" stroke-width="2"/><circle cx="47" cy="42" r="9" fill="#fff" stroke="#6f4d2c" stroke-width="2"/><circle cx="30" cy="43" r="4.5" fill="#3d3034"/><circle cx="46" cy="43" r="4.5" fill="#3d3034"/><circle cx="31.5" cy="41" r="1.5" fill="#fff"/><circle cx="47.5" cy="41" r="1.5" fill="#fff"/><path d="m34 49 4 7 4-7Z" fill="#f0a447" stroke="#b9722a" stroke-width="1.5" stroke-linejoin="round"/><path d="M30 78v6m16-6v6" stroke="#f0a447" stroke-width="4" stroke-linecap="round"/>`;
  if (id === "turtle")
    return `<path d="M62 66q14 2 14 8-10 2-16-4Z" fill="#a8cf8a" stroke="#4f8a5d" stroke-width="2"/><path d="M14 64q0-30 28-30t28 30Z" fill="#6fae7c" stroke="#3f7a52" stroke-width="2.5" stroke-linejoin="round"/><path d="M42 34v30m-14-22 8 8-8 14m42-14-8-8M28 42h28" fill="none" stroke="#4f8a5d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M42 40l9 6-4 12H37l-4-12Z" fill="#8cc796" stroke="#3f7a52" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 66q-4-16 8-16 8 4 4 16Z" fill="#a8cf8a" stroke="#4f8a5d" stroke-width="2" stroke-linejoin="round"/><circle cx="18" cy="57" r="1.8" fill="#3d3034"/><path d="M14 62q3 2 6 0" fill="none" stroke="#3f7a52" stroke-width="1.6" stroke-linecap="round"/><path d="M24 66v9m30-9v9" stroke="#4f8a5d" stroke-width="5" stroke-linecap="round"/>`;
  if (id === "beaver")
    return `<ellipse cx="68" cy="68" rx="12" ry="6" transform="rotate(-18 68 68)" fill="#7c5434" stroke="#4f3520" stroke-width="2"/><path d="M60 64l6 8m-2-10 5 9" stroke="#a9825a" stroke-width="1.5"/><ellipse cx="38" cy="60" rx="21" ry="16" fill="#a9774c" stroke="#6f4a2a" stroke-width="2"/><ellipse cx="32" cy="66" rx="11" ry="8" fill="#e6c79c"/><circle cx="24" cy="40" r="13" fill="#a9774c" stroke="#6f4a2a" stroke-width="2"/><circle cx="14" cy="30" r="4.5" fill="#a9774c" stroke="#6f4a2a" stroke-width="2"/><circle cx="33" cy="29" r="4.5" fill="#a9774c" stroke="#6f4a2a" stroke-width="2"/><ellipse cx="20" cy="45" rx="8" ry="6" fill="#e6c79c"/><circle cx="19" cy="37" r="1.9" fill="#3d3034"/><circle cx="29" cy="37" r="1.9" fill="#3d3034"/><ellipse cx="22" cy="42" rx="2.6" ry="1.8" fill="#3d3034"/><path d="M20 47h5v6h-5Z" fill="#fff" stroke="#c9b79c" stroke-width="1"/><path d="M22 47v6" stroke="#c9b79c" stroke-width="1"/><path d="M22 74v6m28-6v6" stroke="#6f4a2a" stroke-width="4" stroke-linecap="round"/>`;
  return "";
}

// Compagnon seul, pour les listes et le jardin (même dessin que près de l'aventurière).
export const petIcon = (id, label = "") =>
  petArt(id)
    ? `<svg viewBox="0 0 90 90" class="pet-art" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} focusable="false">${petArt(id)}</svg>`
    : "";

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
  return `<svg class="girl-avatar" viewBox="0 0 260 340" role="img" aria-label="${label}"><ellipse cx="130" cy="320" rx="68" ry="11" fill="#4f3b6420"/>${e.back && ART[e.back] ? ART[e.back]() : ""}${e.cape && ART[e.cape] ? ART[e.cape]() : ""}${hairBack(style, hair)}<path d="M112 238v52m36-52v52" stroke="${skin}" stroke-width="19" stroke-linecap="round"/>${feet}${dressArt(dressId)}${style === 2 ? braids(hair) : ""}${arm(97, 172, 70, 226, sleeve)}${arm(163, 172, 190, 226, sleeve)}<path d="M118 142v22q12 10 24 0v-22" fill="${skin}" stroke="${skinO}" stroke-width="2"/><ellipse cx="83" cy="116" rx="7" ry="10" fill="${skin}" stroke="${skinO}" stroke-width="2"/><ellipse cx="177" cy="116" rx="7" ry="10" fill="${skin}" stroke="${skinO}" stroke-width="2"/><path d="M84 106C84 70 106 54 130 54s46 16 46 52c0 32-20 54-46 54s-46-22-46-54Z" fill="${skin}" stroke="${skinO}" stroke-width="2.5"/><g fill="#fff"><ellipse cx="111" cy="112" rx="8" ry="10"/><ellipse cx="149" cy="112" rx="8" ry="10"/></g><g fill="#5a3b2e"><ellipse cx="111" cy="113" rx="6" ry="8"/><ellipse cx="149" cy="113" rx="6" ry="8"/></g><g fill="#2f2428"><ellipse cx="111" cy="114" rx="3.4" ry="5"/><ellipse cx="149" cy="114" rx="3.4" ry="5"/></g><g fill="#fff"><circle cx="113.5" cy="109.5" r="2.2"/><circle cx="151.5" cy="109.5" r="2.2"/><circle cx="108.5" cy="117.5" r="1.1"/><circle cx="146.5" cy="117.5" r="1.1"/></g><path d="M100 98q11-8 22-1m16 1q11-7 22 1" fill="none" stroke="${shade(hair, -0.1)}" stroke-width="3.2" stroke-linecap="round"/><ellipse cx="100" cy="132" rx="9.5" ry="5.5" fill="#e98f8c" opacity=".42"/><ellipse cx="160" cy="132" rx="9.5" ry="5.5" fill="#e98f8c" opacity=".42"/><path d="M127 126q3 3 6 0" fill="none" stroke="${shade(skin, -0.25)}" stroke-width="2.2" stroke-linecap="round"/><path d="M120 137q10 9 20 0" fill="none" stroke="#a15853" stroke-width="3.2" stroke-linecap="round"/>${hairFront(style, hair)}${e.face && ART[e.face] ? ART[e.face]() : ""}${e.cape ? clasp : ""}${e.neck && ART[e.neck] ? ART[e.neck]() : ""}${e.head && ART[e.head] ? ART[e.head]() : ""}${e.hand && ART[e.hand] ? ART[e.hand]() : ""}${pet}</svg>`;
}
