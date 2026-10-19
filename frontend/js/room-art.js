// La chambre de l'aventurière (SVG local, sans dépendance).
// Source unique : l'icône de la boutique est un recadrage (VIEW) du fragment dessiné dans la chambre.
// Aucun identifiant SVG : plusieurs chambres peuvent cohabiter dans une page.
// Repère : viewBox 0 0 800 520. Mur du fond jusqu'à y = 330, sol ensuite, plinthe à 322–338.
// Emplacements : mur, sol, lit, tapis, fenêtre, lampe, étagère, bureau, jouets, décoration, plante.
import { petIcon } from "./avatar-art.js";

export const roomSlots = [
  "wall",
  "floor",
  "bed",
  "rug",
  "window",
  "lamp",
  "shelf",
  "desk",
  "toy",
  "deco",
  "plant",
];
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
  `<g>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * r).toFixed(1)}" cy="${(y + Math.sin((a * Math.PI) / 180) * r).toFixed(1)}" r="${(r * 0.8).toFixed(1)}" fill="${petal}"/>`).join("")}<circle cx="${x}" cy="${y}" r="${(r * 0.7).toFixed(1)}" fill="${heart}"/></g>`;
const dots = (pts, r, fill) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join("");

// ───────────── Murs ─────────────
const solidWall = (c) => `<rect width="800" height="330" fill="${c}"/>`;
const WALLS = {
  default: () => solidWall("#f6efe0"),
  "wall-rose": () => solidWall("#f9dfe4"),
  "wall-sky": () => solidWall("#d9ecf7"),
  "wall-mint": () => solidWall("#dcefe3"),
  "wall-lilac": () => solidWall("#e6dff3"),
  "wall-stripes": () =>
    `${solidWall("#fbeacd")}${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 80 + 40}" width="40" height="330" fill="#f6d9a8"/>`).join("")}`,
  "wall-stars": () =>
    `${solidWall("#3f4a82")}${[[60, 40, 9], [150, 120, 6], [250, 50, 7], [340, 150, 8], [430, 60, 6], [520, 130, 9], [610, 45, 7], [700, 110, 8], [760, 220, 6], [90, 240, 8], [300, 260, 6], [560, 250, 7], [680, 290, 6]].map(([x, y, r]) => star(x, y, r, "#ffe7a6")).join("")}`,
  "wall-clouds": () =>
    `${solidWall("#d6ecfa")}${[[130, 90], [430, 60], [640, 150], [260, 230], [560, 260]].map(([x, y]) => `<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="52" ry="16"/><ellipse cx="${x - 20}" cy="${y - 10}" rx="26" ry="16"/><ellipse cx="${x + 16}" cy="${y - 14}" rx="24" ry="18"/></g>`).join("")}`,
  "wall-forest": () =>
    `${solidWall("#d3e8d0")}${[[70, 60], [200, 160], [330, 50], [450, 170], [580, 70], [710, 160], [140, 260], [380, 270], [640, 270]].map(([x, y]) => `<path d="M${x} ${y}q22-30 44 0-22 30-44 0Z" fill="#9fc79b" transform="rotate(-25 ${x} ${y})"/><path d="M${x + 8} ${y + 2}h26" stroke="#7fa97c" stroke-width="2" transform="rotate(-25 ${x} ${y})"/>`).join("")}`,
};
// ───────────── Sols ─────────────
const FLOORS = {
  default: () =>
    `<path d="M0 330H800V520H0Z" fill="#d9b88c"/>${[356, 388, 426, 470].map((y) => `<path d="M0 ${y}H800" stroke="#c49f72" stroke-width="3"/>`).join("")}${[120, 330, 540, 740].map((x, i) => `<path d="M${x} 330V356M${x - 70} 356V388M${x + 40} 388V426M${x - 30} 426V470M${x + 60} 470V520" stroke="#c49f72" stroke-width="3" opacity="${i % 2 ? 0.6 : 1}"/>`).join("")}`,
  "floor-pale": () =>
    `<path d="M0 330H800V520H0Z" fill="#efdfc0"/>${[356, 388, 426, 470].map((y) => `<path d="M0 ${y}H800" stroke="#dcc79f" stroke-width="3"/>`).join("")}${[200, 450, 700].map((x) => `<path d="M${x} 330V356M${x - 90} 356V388M${x + 50} 388V426M${x - 40} 426V470M${x + 70} 470V520" stroke="#dcc79f" stroke-width="3"/>`).join("")}`,
  "floor-checker": () =>
    `<path d="M0 330H800V520H0Z" fill="#fbf1e2"/>${Array.from({ length: 40 }, (_, k) => {
      const r = Math.floor(k / 10),
        c = k % 10,
        y = 330 + r * 48,
        w = 80;
      return (r + c) % 2 ? `<rect x="${c * w}" y="${y}" width="${w}" height="48" fill="#f0b9c4"/>` : "";
    }).join("")}`,
  "floor-meadow": () =>
    `<path d="M0 330H800V520H0Z" fill="#b9dca0"/>${[[60, 390], [170, 480], [290, 360], [420, 500], [540, 380], [660, 470], [740, 360], [120, 440]].map(([x, y], i) => flower(x, y, 5, i % 2 ? "#fff4d8" : "#f6b9c8")).join("")}`,
  "floor-blue": () =>
    `<path d="M0 330H800V520H0Z" fill="#b7cbe8"/>${[345, 400, 455, 505].map((y) => `<path d="M0 ${y}H800" stroke="#a3b9dc" stroke-width="2" stroke-dasharray="10 12"/>`).join("")}`,
};
// ───────────── Fenêtres (avec rideaux) ─────────────
const windowArt = ({ sky, scene = "", curtain }) =>
  `<rect x="74" y="64" width="182" height="162" rx="10" fill="#f6ecda" stroke="#cdb892" stroke-width="4"/><rect x="86" y="76" width="158" height="138" rx="4" fill="${sky}"/>${scene}<path d="M165 76V214M86 145H244" stroke="#f6ecda" stroke-width="7"/><rect x="66" y="218" width="198" height="12" rx="4" fill="#e6d6b9" stroke="#cdb892" stroke-width="2"/><path d="M52 52Q96 84 94 128 92 188 74 244H44Z" fill="${curtain}" stroke="#00000018" stroke-width="2"/><path d="M278 52Q234 84 236 128 238 188 256 244H286Z" fill="${curtain}" stroke="#00000018" stroke-width="2"/><path d="M62 70Q74 150 60 236M270 70Q256 150 270 236" fill="none" stroke="#ffffff66" stroke-width="3"/><rect x="40" y="46" width="250" height="9" rx="4" fill="#b98a5e"/>`;
const WINDOWS = {
  default: () => windowArt({ sky: "#bfe3f4", scene: `<circle cx="205" cy="108" r="16" fill="#ffe8a0"/><path d="M86 214Q130 170 180 190T244 180V214Z" fill="#a9d29a"/>`, curtain: "#fff7e8" }),
  "window-pink": () => windowArt({ sky: "#bfe3f4", scene: `<ellipse cx="130" cy="110" rx="26" ry="9" fill="#fff"/><path d="M86 214Q130 176 180 192T244 184V214Z" fill="#a9d29a"/>`, curtain: "#f4b1c4" }),
  "window-night": () => windowArt({ sky: "#2d3566", scene: `<path d="M196 90a20 20 0 1 0 14 34 16 16 0 1 1-14-34Z" fill="#ffe9a8"/>${[[110, 100, 5], [140, 160, 4], [220, 170, 4], [120, 190, 3]].map(([x, y, r]) => star(x, y, r, "#fff2c2")).join("")}`, curtain: "#9a88c8" }),
  "window-garden": () => windowArt({ sky: "#c8e8f6", scene: `<path d="M86 214V170Q130 140 180 170T244 160V214Z" fill="#8cc58a"/><path d="M86 214V190Q140 170 244 190V214Z" fill="#6fb072"/>${[[110, 200], [150, 196], [200, 202], [228, 196]].map(([x, y], i) => flower(x, y, 4, i % 2 ? "#fff" : "#f4a8b6")).join("")}<circle cx="120" cy="104" r="14" fill="#ffe8a0"/>`, curtain: "#a9d29a" }),
  "window-rainbow": () =>
    windowArt({ sky: "#cfe9f7", scene: [["#e98a8a", 56], ["#f3b86b", 48], ["#f2e27a", 40], ["#98cf8f", 32], ["#8cc3e0", 24]].map(([c, r]) => `<path d="M${165 - r} 214A${r} ${r} 0 0 1 ${165 + r} 214" fill="none" stroke="${c}" stroke-width="8"/>`).join(""), curtain: "#f6df8e" }),
  "window-snow": () =>
    windowArt({ sky: "#dbe6f2", scene: `<path d="M86 214V180Q130 160 180 182T244 172V214Z" fill="#fff"/>${[[110, 100], [150, 130], [200, 96], [226, 140], [128, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff"/>`).join("")}`, curtain: "#d96b6b" }),
};
// ───────────── Lits ─────────────
const bedBase = ({ blanket, deco = "", frame = "#b98a5e", pillow = "#fff" }) =>
  `<rect x="282" y="238" width="296" height="70" rx="14" fill="${frame}" stroke="#00000022" stroke-width="2"/><rect x="290" y="288" width="280" height="76" rx="16" fill="#fffaf0" stroke="#d9cdb8" stroke-width="3"/><rect x="304" y="296" width="92" height="40" rx="14" fill="${pillow}" stroke="#d9cdb8" stroke-width="3"/><rect x="408" y="296" width="92" height="40" rx="14" fill="${pillow}" stroke="#d9cdb8" stroke-width="3"/><path d="M290 328H570V388Q570 398 556 398H304Q290 398 290 388Z" fill="${blanket}" stroke="#00000022" stroke-width="2"/><path d="M290 328H570" stroke="#ffffff88" stroke-width="8"/>${deco}<rect x="296" y="394" width="14" height="22" rx="4" fill="${frame}"/><rect x="550" y="394" width="14" height="22" rx="4" fill="${frame}"/>`;
const BEDS = {
  default: () => bedBase({ blanket: "#7fb8c4" }),
  "bed-star": () =>
    bedBase({ blanket: "#4d5a9a", frame: "#8a6a4a", deco: [[340, 358, 8], [410, 345, 6], [470, 366, 9], [530, 350, 6], [370, 380, 5]].map(([x, y, r]) => star(x, y, r, "#ffe7a6")).join("") }),
  "bed-flower": () =>
    bedBase({ blanket: "#a9d29a", deco: [[336, 356], [400, 372], [462, 354], [528, 370], [370, 344]].map(([x, y], i) => flower(x, y, 6, i % 2 ? "#fff4d8" : "#f6b9c8")).join("") }),
  "bed-cloud": () =>
    `${bedBase({ blanket: "#eaf4fb", frame: "#a8c4dc", pillow: "#f4f9fd" })}<g fill="#fff" stroke="#bcd3e6" stroke-width="3"><ellipse cx="330" cy="372" rx="36" ry="24"/><ellipse cx="400" cy="378" rx="40" ry="24"/><ellipse cx="480" cy="376" rx="42" ry="24"/><ellipse cx="546" cy="370" rx="32" ry="22"/></g>`,
  "bed-princess": () =>
    `<path d="M284 110Q430 150 576 110V170Q430 206 284 170Z" fill="#f8c9d8" stroke="#d98ba5" stroke-width="3"/><path d="M284 110Q300 190 288 250M576 110Q560 190 572 250" fill="none" stroke="#f8c9d8" stroke-width="22" stroke-linecap="round"/><rect x="278" y="106" width="14" height="300" rx="6" fill="#edc868" stroke="#b98a35" stroke-width="2"/><rect x="568" y="106" width="14" height="300" rx="6" fill="#edc868" stroke="#b98a35" stroke-width="2"/><circle cx="285" cy="104" r="9" fill="#edc868" stroke="#b98a35" stroke-width="2"/><circle cx="575" cy="104" r="9" fill="#edc868" stroke="#b98a35" stroke-width="2"/>${bedBase({ blanket: "#f4a8c0", frame: "#e9c776", deco: [[350, 360], [430, 372], [510, 358]].map(([x, y]) => flower(x, y, 6, "#fff4f6")).join("") })}`,
  "bed-hut": () =>
    `<path d="M270 244 430 100 590 244Z" fill="#c98c59" stroke="#8d5d36" stroke-width="4" stroke-linejoin="round"/><path d="M300 244 430 130 560 244Z" fill="#f1d6a8"/><rect x="266" y="236" width="12" height="176" rx="5" fill="#a9774c"/><rect x="582" y="236" width="12" height="176" rx="5" fill="#a9774c"/><path d="M430 100v-30l26 8-26 10" fill="#e8546a"/>${bedBase({ blanket: "#e8a874", frame: "#a9774c" })}`,
};
// ───────────── Tapis ─────────────
const rug = (inner) => `<ellipse cx="420" cy="452" rx="214" ry="48" fill="#00000012"/>${inner}`;
const RUGS = {
  "rug-round": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#f4b6c8" stroke="#d98ba5" stroke-width="4"/><ellipse cx="420" cy="450" rx="150" ry="30" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="3 9"/><ellipse cx="420" cy="450" rx="90" ry="18" fill="#f9d3de"/>`),
  "rug-star": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#fff0bd" stroke="#e1b94b" stroke-width="4"/><g transform="translate(420 450) scale(1 .42)">${star(0, 0, 100, "#f6c94e")}</g>`),
  "rug-rainbow": () => rug([["#e98a8a", 200, 42], ["#f3b86b", 170, 35], ["#f2e27a", 140, 28], ["#98cf8f", 110, 22], ["#8cc3e0", 80, 16], ["#a994d6", 50, 10]].map(([c, rx, ry]) => `<ellipse cx="420" cy="450" rx="${rx}" ry="${ry}" fill="${c}"/>`).join("")),
  "rug-clover": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#a9d29a" stroke="#6fa56f" stroke-width="4"/>${[[360, 440], [420, 432], [480, 440], [420, 462]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="34" ry="11" fill="#c9e7b7"/>`).join("")}`),
};
// ───────────── Lampes (sur une petite table de chevet) ─────────────
const nightstand = `<rect x="212" y="292" width="64" height="12" rx="4" fill="#c98c59" stroke="#8d5d36" stroke-width="2"/><rect x="218" y="304" width="52" height="52" rx="4" fill="#d9a773" stroke="#8d5d36" stroke-width="2"/><circle cx="244" cy="330" r="4" fill="#8d5d36"/><rect x="220" y="356" width="8" height="10" fill="#8d5d36"/><rect x="260" y="356" width="8" height="10" fill="#8d5d36"/>`;
const LAMPS = {
  "lamp-moon": () =>
    `${nightstand}<circle cx="244" cy="246" r="52" fill="#fff3b844"/><path d="M236 290v-18" stroke="#8d6b57" stroke-width="5"/><path d="M262 222a30 30 0 1 0 0 52 24 24 0 1 1 0-52Z" fill="#ffe9a8" stroke="#d1b25c" stroke-width="3"/>`,
  "lamp-mushroom": () =>
    `${nightstand}<circle cx="244" cy="262" r="50" fill="#ffd8e044"/><path d="M236 292V270h16v22Z" fill="#fff0d8" stroke="#d9c4a0" stroke-width="2"/><path d="M214 272Q214 232 244 230T274 272Z" fill="#e8546a" stroke="#b13a4f" stroke-width="3"/>${dots([[232, 250], [250, 244], [262, 260], [240, 264]], 4.5, "#fff")}`,
  "lamp-lantern": () =>
    `${nightstand}<circle cx="244" cy="262" r="46" fill="#ffe9a044"/><path d="M244 240q-10-12 0-20 10 8 0 20" fill="none" stroke="#8f7a55" stroke-width="3"/><rect x="228" y="242" width="32" height="46" rx="8" fill="#ffd978" stroke="#a98f5e" stroke-width="3"/><path d="M244 252q6 10 0 24-6-14 0-24Z" fill="#f4a43a"/><rect x="224" y="286" width="40" height="8" rx="3" fill="#a98f5e"/>`,
  "lamp-stars": () =>
    `<path d="M20 36Q220 84 400 40T780 36" fill="none" stroke="#b9a98c" stroke-width="3"/>${[[70, 52], [170, 64], [280, 66], [400, 44], [520, 56], [640, 66], [740, 50]].map(([x, y], i) => `<path d="M${x} ${y}v18" stroke="#b9a98c" stroke-width="2"/><circle cx="${x}" cy="${y + 26}" r="22" fill="#ffe9a044"/>${star(x, y + 26, 13, i % 2 ? "#ffd978" : "#fff0b8")}`).join("")}`,
};
// ───────────── Étagères ─────────────
const shelfBoard = `<rect x="590" y="140" width="180" height="12" rx="4" fill="#c98c59" stroke="#8d5d36" stroke-width="2"/><path d="M606 152v14m148-14v14" stroke="#8d5d36" stroke-width="4" stroke-linecap="round"/>`;
const SHELVES = {
  "shelf-books": () =>
    `${shelfBoard}${[["#e8546a", 604, 64], ["#4d8fc4", 626, 76], ["#f2c23e", 648, 58], ["#7fbf7a", 670, 70], ["#a994d6", 692, 62]].map(([c, x, h]) => `<rect x="${x}" y="${140 - h}" width="20" height="${h}" rx="3" fill="${c}" stroke="#00000022" stroke-width="2"/>`).join("")}<rect x="720" y="94" width="40" height="46" rx="4" fill="#f6ecda" stroke="#cdb892" stroke-width="2"/><path d="M728 108h24m-24 10h18" stroke="#cdb892" stroke-width="2"/>`,
  "shelf-toys": () =>
    `${shelfBoard}<rect x="606" y="100" width="40" height="40" rx="4" fill="#e8546a" stroke="#b13a4f" stroke-width="2"/><path d="M606 120h40M626 100v40" stroke="#fff" stroke-width="3"/><circle cx="690" cy="118" r="22" fill="#f2c23e" stroke="#c19b1f" stroke-width="2"/><circle cx="682" cy="114" r="2.5" fill="#3d3034"/><circle cx="698" cy="114" r="2.5" fill="#3d3034"/><path d="M682 124q8 6 16 0" fill="none" stroke="#3d3034" stroke-width="2"/><path d="M730 140 744 98 758 140Z" fill="#8cc3e0" stroke="#4f8fb8" stroke-width="2" stroke-linejoin="round"/>`,
  "shelf-plants": () =>
    `${shelfBoard}${[[624, "#e8a874"], [690, "#f4b6c8"], [742, "#a9d29a"]].map(([x, c], i) => `<path d="M${x - 16} 140l4-26h24l4 26Z" fill="${c}" stroke="#00000022" stroke-width="2"/><path d="M${x} 114q-14-18-4-30M${x} 114q14-18 6-34" fill="none" stroke="#6fa56f" stroke-width="4" stroke-linecap="round"/>${flower(x - 4, 80 - i * 2, 6, i % 2 ? "#fff4d8" : "#f6b9c8")}`).join("")}`,
};
// ───────────── Bureaux ─────────────
const deskTop = `<rect x="640" y="296" width="150" height="14" rx="4" fill="#c98c59" stroke="#8d5d36" stroke-width="2"/><rect x="648" y="310" width="10" height="66" fill="#a9774c"/><rect x="772" y="310" width="10" height="66" fill="#a9774c"/><rect x="664" y="310" width="62" height="40" rx="4" fill="#d9a773" stroke="#8d5d36" stroke-width="2"/><circle cx="695" cy="330" r="3.5" fill="#8d5d36"/>`;
const DESKS = {
  "desk-study": () =>
    `${deskTop}<path d="M690 296 720 284 750 296Z" fill="#f6ecda" stroke="#cdb892" stroke-width="2"/><path d="M692 292l28-10 28 10" fill="#fff6e0" stroke="#cdb892" stroke-width="2"/><rect x="760" y="264" width="10" height="32" rx="3" fill="#4d8fc4"/><rect x="772" y="270" width="8" height="26" rx="3" fill="#e8546a"/><rect x="704" y="332" width="0" height="0"/><path d="M646 376h40v30h-40Z" fill="none"/><rect x="684" y="336" width="62" height="14" rx="4" fill="#00000010"/>`,
  "desk-easel": () =>
    `<path d="M668 410 700 230M780 410 750 230M724 410V250" stroke="#a9774c" stroke-width="8" stroke-linecap="round"/><rect x="662" y="236" width="104" height="84" rx="4" fill="#fffaf0" stroke="#8d5d36" stroke-width="4"/><path d="M668 312V278Q690 252 716 280T762 270V312Z" fill="#9fd08f"/><circle cx="740" cy="256" r="10" fill="#ffd978"/><path d="M668 312Q710 296 762 312" fill="none" stroke="#7fb8c4" stroke-width="6"/><rect x="684" y="326" width="76" height="8" rx="3" fill="#a9774c"/>${dots([[694, 322], [708, 322], [722, 322], [736, 322]], 4, "#e8546a")}`,
  "desk-vanity": () =>
    `<ellipse cx="716" cy="190" rx="42" ry="54" fill="#e8f3f8" stroke="#edc868" stroke-width="6"/><path d="M696 170q12-16 28-10" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>${deskTop}<rect x="660" y="272" width="16" height="24" rx="4" fill="#f4b6c8"/><rect x="684" y="278" width="12" height="18" rx="4" fill="#a994d6"/><ellipse cx="740" cy="400" rx="26" ry="9" fill="#f4b6c8" stroke="#d98ba5" stroke-width="3"/><path d="M728 400v-30h24v30" fill="#e8a0b8"/>`,
};
// ───────────── Jouets (au sol, à gauche) ─────────────
const TOYS = {
  "toy-teddy": () =>
    `<ellipse cx="120" cy="472" rx="58" ry="10" fill="#00000014"/><ellipse cx="120" cy="436" rx="38" ry="36" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><ellipse cx="120" cy="446" rx="22" ry="22" fill="#e6c79c"/><circle cx="120" cy="380" r="28" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><circle cx="98" cy="360" r="11" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><circle cx="142" cy="360" r="11" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><ellipse cx="120" cy="390" rx="12" ry="9" fill="#e6c79c"/><circle cx="110" cy="376" r="3" fill="#3d3034"/><circle cx="130" cy="376" r="3" fill="#3d3034"/><ellipse cx="120" cy="388" rx="4" ry="3" fill="#3d3034"/><path d="M104 408q16 10 32 0" fill="none" stroke="#e8546a" stroke-width="6" stroke-linecap="round"/><ellipse cx="86" cy="440" rx="12" ry="18" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/><ellipse cx="154" cy="440" rx="12" ry="18" fill="#c98c59" stroke="#8d5d36" stroke-width="3"/>`,
  "toy-blocks": () =>
    `<ellipse cx="120" cy="474" rx="64" ry="9" fill="#00000014"/>${[["#e8546a", 66, 440, 44], ["#4d8fc4", 114, 440, 44], ["#f2c23e", 90, 396, 44], ["#7fbf7a", 154, 450, 34]].map(([c, x, y, s]) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="6" fill="${c}" stroke="#00000030" stroke-width="2.5"/><path d="M${x + 8} ${y + 14}h${s - 16}" stroke="#ffffff88" stroke-width="3"/>`).join("")}`,
  "toy-dollhouse": () =>
    `<ellipse cx="120" cy="476" rx="80" ry="10" fill="#00000014"/><rect x="48" y="396" width="144" height="80" rx="4" fill="#fbe3c4" stroke="#c9a77a" stroke-width="3"/><path d="M36 400 120 336 204 400Z" fill="#e8546a" stroke="#b13a4f" stroke-width="3" stroke-linejoin="round"/><rect x="64" y="414" width="30" height="28" rx="3" fill="#bfe3f4" stroke="#c9a77a" stroke-width="3"/><rect x="146" y="414" width="30" height="28" rx="3" fill="#bfe3f4" stroke="#c9a77a" stroke-width="3"/><rect x="104" y="436" width="32" height="40" rx="4" fill="#a9774c" stroke="#8d5d36" stroke-width="3"/><circle cx="128" cy="458" r="2.5" fill="#f2c23e"/><path d="M64 428h30M146 428h30" stroke="#c9a77a" stroke-width="2"/>`,
  "toy-horse": () =>
    `<path d="M50 478Q120 500 190 478" fill="none" stroke="#a9774c" stroke-width="9" stroke-linecap="round"/><ellipse cx="120" cy="420" rx="44" ry="26" fill="#f1d6a8" stroke="#c9a77a" stroke-width="3"/><path d="M146 408Q176 372 168 352L186 346Q196 380 172 424Z" fill="#f1d6a8" stroke="#c9a77a" stroke-width="3" stroke-linejoin="round"/><ellipse cx="184" cy="352" rx="18" ry="12" fill="#f1d6a8" stroke="#c9a77a" stroke-width="3"/><path d="M158 384Q148 372 152 352" fill="none" stroke="#a9774c" stroke-width="8" stroke-linecap="round"/><circle cx="186" cy="348" r="3" fill="#3d3034"/><path d="M82 432 70 478M98 442 96 478M142 442 150 478M158 432 176 478" stroke="#c9a77a" stroke-width="7" stroke-linecap="round"/><path d="M76 410Q60 420 62 440" fill="none" stroke="#a9774c" stroke-width="7" stroke-linecap="round"/><rect x="108" y="388" width="28" height="12" rx="4" fill="#e8546a"/>`,
  "toy-train": () =>
    `<ellipse cx="120" cy="478" rx="88" ry="8" fill="#00000014"/><rect x="40" y="432" width="52" height="34" rx="6" fill="#e8546a" stroke="#b13a4f" stroke-width="3"/><rect x="96" y="440" width="52" height="26" rx="6" fill="#4d8fc4" stroke="#2f6595" stroke-width="3"/><rect x="152" y="440" width="44" height="26" rx="6" fill="#f2c23e" stroke="#c19b1f" stroke-width="3"/><rect x="40" y="410" width="22" height="22" rx="4" fill="#4d4d66"/><rect x="66" y="418" width="28" height="14" rx="3" fill="#bfe3f4" stroke="#b13a4f" stroke-width="2"/>${[58, 78, 120, 138, 172, 190].map((x) => `<circle cx="${x}" cy="468" r="8" fill="#4d4d66" stroke="#fff" stroke-width="2"/>`).join("")}<circle cx="50" cy="398" r="8" fill="#fff" opacity=".8"/><circle cx="62" cy="384" r="10" fill="#fff" opacity=".6"/>`,
};
// ───────────── Décoration murale (au-dessus du lit) ─────────────
const DECOS = {
  "deco-poster-castle": () =>
    `<rect x="350" y="76" width="150" height="118" rx="6" fill="#fffaf0" stroke="#b98a5e" stroke-width="6"/><rect x="362" y="88" width="126" height="94" fill="#cfe9f7"/><path d="M362 182V160Q400 140 425 160T488 150V182Z" fill="#9fd08f"/><path d="M398 182v-36h54v36Z" fill="#eedfc0" stroke="#b99f7c" stroke-width="2"/><path d="M394 148 425 118 456 148Z" fill="#668fae"/><path d="M425 118v-16l14 4-14 6" fill="#e8546a"/>`,
  "deco-poster-unicorn": () =>
    `<rect x="350" y="76" width="150" height="118" rx="6" fill="#fffaf0" stroke="#edc868" stroke-width="6"/><rect x="362" y="88" width="126" height="94" fill="#f9e2ee"/><ellipse cx="425" cy="150" rx="34" ry="22" fill="#fff" stroke="#d9c6dc" stroke-width="3"/><path d="M448 144Q470 120 462 104L476 108Q480 132 456 156Z" fill="#fff" stroke="#d9c6dc" stroke-width="3" stroke-linejoin="round"/><path d="m462 104 6-20 8 22Z" fill="#f6c94e"/><path d="M446 126Q432 120 436 108" fill="none" stroke="#f4a8c0" stroke-width="6" stroke-linecap="round"/><circle cx="466" cy="112" r="2.5" fill="#3d3034"/>${star(380, 110, 8, "#f6c94e")}${star(400, 98, 5, "#f4a8c0")}`,
  "deco-garland": () =>
    `<path d="M300 78Q430 130 560 78" fill="none" stroke="#b9a98c" stroke-width="3"/>${[["#e8546a", 322, 92], ["#f2c23e", 358, 106], ["#4d8fc4", 394, 116], ["#7fbf7a", 430, 120], ["#a994d6", 466, 116], ["#f4a8c0", 502, 106], ["#f3b86b", 538, 92]].map(([c, x, y]) => `<path d="M${x - 15} ${y - 4}H${x + 15}L${x} ${y + 34}Z" fill="${c}" stroke="#00000022" stroke-width="2" stroke-linejoin="round"/>`).join("")}`,
  "deco-clock": () =>
    `<circle cx="425" cy="134" r="52" fill="#fffaf0" stroke="#c98c59" stroke-width="8"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<path d="M${(425 + Math.sin(a) * 40).toFixed(1)} ${(134 - Math.cos(a) * 40).toFixed(1)}L${(425 + Math.sin(a) * 46).toFixed(1)} ${(134 - Math.cos(a) * 46).toFixed(1)}" stroke="#8d5d36" stroke-width="3" stroke-linecap="round"/>`; }).join("")}<path d="M425 134V104M425 134l22 12" stroke="#4d4d66" stroke-width="5" stroke-linecap="round"/><circle cx="425" cy="134" r="5" fill="#e8546a"/>`,
  "deco-mirror": () =>
    `<ellipse cx="425" cy="136" rx="46" ry="60" fill="#e8f3f8" stroke="#edc868" stroke-width="8"/><path d="M398 116q12-22 36-20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/>${star(425, 76, 8, "#edc868")}`,
};
// ───────────── Plantes ─────────────
const PLANTS = {
  "plant-tall": () =>
    `<ellipse cx="610" cy="392" rx="30" ry="7" fill="#00000014"/><path d="M590 392 596 348H624L630 392Z" fill="#e8a874" stroke="#b9794c" stroke-width="3"/><path d="M610 350Q580 300 590 250M610 350Q640 296 632 240M610 350V226" fill="none" stroke="#5f9a63" stroke-width="5" stroke-linecap="round"/>${[[590, 250, -30], [632, 240, 30], [610, 226, 0], [598, 290, -50], [626, 288, 50]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="30" transform="rotate(${r} ${x} ${y})" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2.5"/>`).join("")}`,
  "plant-cactus": () =>
    `<ellipse cx="610" cy="392" rx="26" ry="6" fill="#00000014"/><path d="M592 392 598 360H622L628 392Z" fill="#f4b6c8" stroke="#d98ba5" stroke-width="3"/><rect x="598" y="300" width="24" height="62" rx="12" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="3"/><path d="M598 332H586Q580 332 580 322V316" fill="none" stroke="#4f8a5d" stroke-width="9" stroke-linecap="round"/><path d="M622 322h12q6 0 6-8v-8" fill="none" stroke="#4f8a5d" stroke-width="9" stroke-linecap="round"/><path d="M610 300v-6m-4 22h8" stroke="#f4a8b6" stroke-width="3"/>${flower(610, 296, 5, "#f4a8b6")}`,
  "plant-flowers": () =>
    `<ellipse cx="610" cy="392" rx="30" ry="7" fill="#00000014"/><path d="M588 392 594 346H626L632 392Z" fill="#a994d6" stroke="#7a68ad" stroke-width="3"/>${[[596, 310], [610, 290], [626, 308], [604, 322], [620, 326]].map(([x, y], i) => `<path d="M${x} ${y}L${608 + (i - 2) * 3} 348" stroke="#5f9a63" stroke-width="4"/>${flower(x, y, 8, ["#f4a8b6", "#fff4d8", "#f6d36e", "#fff4d8", "#f4a8b6"][i])}`).join("")}`,
};

const GROUPS = {
  wall: WALLS,
  floor: FLOORS,
  bed: BEDS,
  rug: RUGS,
  window: WINDOWS,
  lamp: LAMPS,
  shelf: SHELVES,
  desk: DESKS,
  toy: TOYS,
  deco: DECOS,
  plant: PLANTS,
};
const FRAG = {};
for (const g of Object.values(GROUPS))
  for (const [id, fn] of Object.entries(g)) if (id !== "default") FRAG[id] = fn;
export const roomItems = Object.keys(FRAG);
// Cadrage de chaque icône : [x, y, largeur, hauteur] dans le repère de la chambre.
const VIEW = {};
for (const id of roomItems) {
  const slot = id.split("-")[0];
  VIEW[id] =
    {
      wall: [0, 0, 280, 220],
      floor: [0, 330, 280, 190],
      bed: [262, 90, 330, 330],
      rug: [200, 400, 440, 100],
      window: [30, 40, 270, 214],
      lamp: [196, 196, 100, 176],
      shelf: [580, 70, 200, 110],
      desk: [630, 180, 170, 240],
      toy: [30, 330, 190, 160],
      deco: [330, 56, 190, 160],
      plant: [570, 224, 80, 176],
    }[slot] || [0, 0, 800, 520];
}
Object.assign(VIEW, {
  "bed-princess": [262, 90, 330, 330],
  "bed-hut": [252, 60, 360, 360],
  "lamp-stars": [10, 20, 780, 110],
  "deco-garland": [290, 60, 290, 110],
  "desk-vanity": [630, 120, 170, 300],
  "desk-easel": [640, 210, 150, 210],
  "toy-dollhouse": [20, 320, 200, 170],
  "toy-train": [20, 370, 220, 120],
  "toy-blocks": [40, 380, 170, 110],
});
const ICON_BG = { wall: null, floor: null };
export function roomItemArt(id) {
  const v = VIEW[id];
  if (!v || !FRAG[id]) return null;
  const slot = id.split("-")[0],
    bg = slot in ICON_BG ? "" : `<rect x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" fill="${slot === "lamp" && id === "lamp-stars" ? "#4a4f86" : "#f6efe0"}"/>`;
  return `<svg viewBox="${v.join(" ")}" class="item-art room-art-icon" aria-hidden="true" focusable="false">${bg}${FRAG[id]()}</svg>`;
}
// Nom lisible d'un emplacement.
export function roomSvg(rpg, label = "Ta chambre", opts = {}) {
  const r = rpg.room || {},
    pick = (slot, table) => (r[slot] && table[r[slot]] ? table[r[slot]] : table.default),
    some = (slot, table) => (r[slot] && table[r[slot]] ? table[r[slot]]() : "");
  const wall = pick("wall", WALLS)(),
    floor = pick("floor", FLOORS)(),
    win = pick("window", WINDOWS)(),
    bed = pick("bed", BEDS)();
  const pet = opts.pet && petIcon(opts.pet) ? `<g transform="translate(448 398) scale(.95)">${petIcon(opts.pet).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "")}</g>` : "";
  return `<svg class="room-art" viewBox="0 0 800 520" role="img" aria-label="${label}"><g>${wall}</g><rect y="322" width="800" height="14" fill="#ffffffaa"/><g>${floor}</g>${win}${some("deco", DECOS)}${some("shelf", SHELVES)}${some("rug", RUGS)}${some("toy", TOYS)}${bed}${some("desk", DESKS)}${some("plant", PLANTS)}${some("lamp", LAMPS)}${pet}</svg>`;
}
