// Objets de chambre supplémentaires (v0.14) : même principe que room-art.js, un fragment par objet.
// La fonction reçoit les petits outils de room-art.js (pas d'import circulaire).
// Repère : viewBox 0 0 800 520, mur jusqu'à y = 330, sol ensuite.
export function moreRoom(h) {
  const { solidWall, bedBase, nightstand, shelfBoard, deskTop, rug, windowArt, star, flower } = h;
  const heart = (x, y, s, fill) => `<path d="M${x} ${y + s}C${x - s * 1.6} ${y - s * 0.2} ${x - s * 0.7} ${y - s * 1.1} ${x} ${y - s * 0.35}C${x + s * 0.7} ${y - s * 1.1} ${x + s * 1.6} ${y - s * 0.2} ${x} ${y + s}Z" fill="${fill}"/>`;
  const waves = (y, c, w = 4) => `<path d="M0 ${y}q20-14 40 0${"t40 0".repeat(19)}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
  const sh = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="8" fill="#00000014"/>`;
  const glow = (c) => `<circle cx="244" cy="262" r="48" fill="${c}"/>`;
  return {
    wall: {
      "wall-peach": () => solidWall("#fbe0cc"),
      "wall-butter": () => solidWall("#fbf0b8"),
      "wall-dots": () =>
        `${solidWall("#fdeef1")}${Array.from({ length: 40 }, (_, k) => { const r = Math.floor(k / 10), c = k % 10; return `<circle cx="${c * 80 + 40 + (r % 2) * 40}" cy="${r * 80 + 40}" r="8" fill="#f7c6d2"/>`; }).join("")}`,
      "wall-hearts": () =>
        `${solidWall("#fbe6ee")}${[[70, 60], [200, 150], [330, 60], [460, 160], [590, 70], [720, 160], [140, 260], [400, 270], [660, 270]].map(([x, y], i) => heart(x, y, 15, i % 2 ? "#f4a8c0" : "#f8c7d6")).join("")}`,
      "wall-ocean": () => `${solidWall("#cfeaf5")}${[60, 130, 200, 270].map((y, i) => waves(y, i % 2 ? "#b4dcee" : "#9fd0e6")).join("")}${[[100, 100], [380, 170], [640, 90], [250, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#fff" opacity=".8"/>`).join("")}`,
      "wall-space": () =>
        `${solidWall("#2e2a5e")}${[[60, 50, 7], [260, 40, 6], [350, 150, 8], [520, 50, 6], [740, 40, 7], [700, 250, 6], [60, 260, 8], [300, 280, 6]].map(([x, y, r]) => star(x, y, r, "#fff2b0")).join("")}<ellipse cx="150" cy="120" rx="60" ry="12" transform="rotate(-18 150 120)" fill="none" stroke="#f5cf8b" stroke-width="6"/><circle cx="150" cy="120" r="36" fill="#f2a65a"/><path d="M114 128q36 24 72-6" fill="none" stroke="#f5cf8b" stroke-width="6" transform="rotate(-18 150 120)"/><circle cx="600" cy="100" r="26" fill="#8ec5e8"/><circle cx="590" cy="92" r="7" fill="#b5dcf2"/><circle cx="460" cy="240" r="18" fill="#e98aa8"/>`,
    },
    floor: {
      "floor-dark": () =>
        `<path d="M0 330H800V520H0Z" fill="#a97b55"/>${[356, 388, 426, 470].map((y) => `<path d="M0 ${y}H800" stroke="#8d6342" stroke-width="3"/>`).join("")}${[120, 330, 540, 740].map((x, i) => `<path d="M${x} ${[330, 356, 388, 426][i]}v${[26, 32, 38, 44][i]}" stroke="#8d6342" stroke-width="3"/>`).join("")}`,
      "floor-pink": () => `<path d="M0 330H800V520H0Z" fill="#f6cfd9"/>${[355, 405, 460].map((y) => `<path d="M0 ${y}H800" stroke="#eebac8" stroke-width="2" stroke-dasharray="10 12"/>`).join("")}`,
      "floor-sand": () => `<path d="M0 330H800V520H0Z" fill="#f1dfb0"/>${[380, 440, 500].map((y) => waves(y, "#e0c98e", 3)).join("")}${[[90, 400], [300, 470], [560, 420], [700, 490]].map(([x, y]) => `<path d="M${x} ${y}q10-14 20 0z" fill="#f6b9c8" stroke="#e38fa6" stroke-width="2"/>`).join("")}`,
      "floor-tiles": () =>
        `<path d="M0 330H800V520H0Z" fill="#f5f8fb"/>${Array.from({ length: 40 }, (_, k) => { const r = Math.floor(k / 10), c = k % 10; return (r + c) % 2 ? `<rect x="${c * 80}" y="${330 + r * 48}" width="80" height="48" fill="#bcd3ec"/>` : ""; }).join("")}`,
      "floor-cloud": () =>
        `<path d="M0 330H800V520H0Z" fill="#d6ecfa"/>${[[110, 390], [330, 450], [560, 400], [700, 480], [180, 490]].map(([x, y]) => `<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${y}" rx="54" ry="14"/><ellipse cx="${x - 20}" cy="${y - 8}" rx="26" ry="14"/><ellipse cx="${x + 22}" cy="${y - 10}" rx="22" ry="12"/></g>`).join("")}`,
    },
    bed: {
      "bed-boat": () =>
        `<path d="M430 238V104" stroke="#8d5d36" stroke-width="7" stroke-linecap="round"/><path d="M436 110 520 226H436Z" fill="#fff" stroke="#cdd9e3" stroke-width="3" stroke-linejoin="round"/><path d="M424 120 360 226H424Z" fill="#f4dfe5" stroke="#d9b8c4" stroke-width="3" stroke-linejoin="round"/><path d="M430 104l30 10-30 12Z" fill="#e8546a"/>${bedBase({ blanket: "#4d8fc4", frame: "#a9774c", deco: `${[330, 400, 470, 540].map((x) => `<circle cx="${x}" cy="262" r="0"/>`).join("")}<path d="M300 342q20-10 40 0t40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#9fd0e6" stroke-width="4"/>` })}${[320, 395, 470, 545].map((x) => `<circle cx="${x}" cy="262" r="9" fill="#cfe9f7" stroke="#6d4a2a" stroke-width="3"/>`).join("")}`,
      "bed-rocket": () =>
        `<path d="M282 300l-34 56h44Z" fill="#e8546a" stroke="#b13a4f" stroke-width="3" stroke-linejoin="round"/><path d="M578 300l34 56h-44Z" fill="#e8546a" stroke="#b13a4f" stroke-width="3" stroke-linejoin="round"/>${bedBase({ blanket: "#e8546a", frame: "#c9d3dc", pillow: "#fff", deco: [[340, 350, 7], [420, 338, 6], [500, 354, 8]].map(([x, y, r]) => star(x, y, r, "#ffe7a6")).join("") })}${[340, 430, 520].map((x) => `<circle cx="${x}" cy="262" r="11" fill="#8fd0e2" stroke="#8a97a3" stroke-width="4"/>`).join("")}`,
      "bed-bunny": () =>
        `<g stroke="#d9a9bd" stroke-width="3"><ellipse cx="350" cy="196" rx="20" ry="52" transform="rotate(-10 350 196)" fill="#f6dce6"/><ellipse cx="510" cy="196" rx="20" ry="52" transform="rotate(10 510 196)" fill="#f6dce6"/></g><ellipse cx="350" cy="198" rx="9" ry="34" transform="rotate(-10 350 198)" fill="#f4a8c0"/><ellipse cx="510" cy="198" rx="9" ry="34" transform="rotate(10 510 198)" fill="#f4a8c0"/>${bedBase({ blanket: "#f6dce6", frame: "#d9a9bd", deco: dotsOf([[336, 356], [404, 372], [466, 354], [530, 370]], 7, "#fff") })}`,
    },
    rug: {
      "rug-heart": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#fbd3de" stroke="#e48aa4" stroke-width="4"/><g transform="translate(420 452) scale(1 .42)">${heart(0, 0, 80, "#e8546a")}</g>`),
      "rug-flower": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#fff4d8" stroke="#e8c878" stroke-width="4"/><g transform="translate(420 450) scale(1 .42)">${flower(0, 0, 50, "#f4a8c0")}</g>`),
      "rug-moon": () => rug(`<ellipse cx="420" cy="450" rx="200" ry="42" fill="#3f4a82" stroke="#2c3560" stroke-width="4"/><g transform="translate(420 450) scale(1 .42)"><path d="M30-70a80 80 0 1 0 0 140 62 62 0 1 1 0-140Z" fill="#ffe9a8"/></g>${[[300, 444, 6], [530, 438, 7], [490, 464, 5], [350, 464, 5]].map(([x, y, r]) => star(x, y, r, "#ffe7a6")).join("")}`),
    },
    window: {
      "window-sunset": () => windowArt({ sky: "#f8b98a", scene: `<rect x="86" y="76" width="158" height="52" fill="#fcd2a0"/><circle cx="165" cy="190" r="34" fill="#ffd978"/><path d="M86 214V186Q130 160 180 186T244 176V214Z" fill="#c4739a"/><ellipse cx="120" cy="104" rx="26" ry="8" fill="#fde6d2"/>`, curtain: "#f7d8c4" }),
      "window-sea": () => windowArt({ sky: "#bfe6f6", scene: `<rect x="86" y="160" width="158" height="54" fill="#5fa8d3"/><path d="M86 176q20-8 40 0t40 0 40 0 40 0" fill="none" stroke="#a9dcf0" stroke-width="3"/><path d="M150 160V122l26 38Z" fill="#fff"/><path d="M146 162h36l-6 8h-24Z" fill="#c98c59"/><circle cx="214" cy="104" r="14" fill="#ffe8a0"/>`, curtain: "#e8f4fa" }),
      "window-butterflies": () =>
        windowArt({ sky: "#cfe9f7", scene: `<path d="M86 214V176Q130 150 180 176T244 166V214Z" fill="#8cc58a"/>${[[120, 110, "#f08a2e"], [180, 138, "#f08aa6"], [220, 100, "#8d78c4"]].map(([x, y, c]) => `<ellipse cx="${x - 7}" cy="${y}" rx="8" ry="6" fill="${c}"/><ellipse cx="${x + 7}" cy="${y}" rx="8" ry="6" fill="${c}"/><rect x="${x - 1}" y="${y - 6}" width="2" height="12" fill="#5a4636"/>`).join("")}${[[110, 204], [150, 198], [200, 206]].map(([x, y], i) => flower(x, y, 5, i % 2 ? "#fff4d8" : "#f6b9c8")).join("")}`, curtain: "#e6f3df" }),
    },
    lamp: {
      "lamp-cloud": () => `${nightstand}${glow("#cfe8ff44")}<path d="M244 292v-12" stroke="#8d6b57" stroke-width="5"/><g fill="#fff" stroke="#cfe3f0" stroke-width="3"><ellipse cx="244" cy="262" rx="30" ry="18"/><ellipse cx="224" cy="266" rx="18" ry="14"/><ellipse cx="266" cy="266" rx="18" ry="14"/><ellipse cx="244" cy="250" rx="16" ry="14"/></g>`,
      "lamp-flower": () => `${nightstand}${glow("#ffd8e044")}<path d="M244 292V258" stroke="#6fae73" stroke-width="5"/><path d="M244 280q-18-2-22-14 14-2 22 14" fill="#8fc88a"/>${flower(244, 242, 13, "#f4a8c0", "#ffe08a")}`,
      "lamp-owl": () => `${nightstand}${glow("#ffe9a044")}<ellipse cx="244" cy="264" rx="22" ry="28" fill="#b98a5e" stroke="#8d5d36" stroke-width="3"/><path d="M226 240l6 14h-12ZM262 240l-6 14h12Z" fill="#b98a5e" stroke="#8d5d36" stroke-width="2"/><circle cx="236" cy="256" r="9" fill="#fff3b8" stroke="#8d5d36" stroke-width="2"/><circle cx="254" cy="256" r="9" fill="#fff3b8" stroke="#8d5d36" stroke-width="2"/><circle cx="236" cy="257" r="3.5" fill="#3a2c24"/><circle cx="254" cy="257" r="3.5" fill="#3a2c24"/><path d="M241 266l3 5 3-5Z" fill="#f2a65a"/>`,
    },
    shelf: {
      "shelf-trophies": () =>
        `${shelfBoard}${[[626, 52], [682, 66], [738, 46]].map(([x, h]) => `<path d="M${x - 14} ${140 - h}h28q0 22-14 28-14-6-14-28Z" fill="#f2c23e" stroke="#c79a1f" stroke-width="2"/><path d="M${x} ${140 - h + 28}v${h - 36}" stroke="#c79a1f" stroke-width="4"/><rect x="${x - 12}" y="132" width="24" height="8" rx="2" fill="#c79a1f"/>`).join("")}<path d="M646 140v-12" stroke="none"/>`,
      "shelf-aquarium": () =>
        `${shelfBoard}<rect x="606" y="80" width="140" height="60" rx="6" fill="#bfe6f6" stroke="#8ec0d8" stroke-width="3"/><rect x="608" y="124" width="136" height="14" fill="#f1dfb0"/><path d="M630 124q-6-18 2-30M640 124q8-16 0-28" stroke="#6fae73" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="690" cy="104" rx="14" ry="8" fill="#f2a65a"/><path d="M704 104l12-8v16Z" fill="#f2a65a"/><circle cx="684" cy="102" r="2" fill="#333"/><ellipse cx="660" cy="92" rx="9" ry="6" fill="#e98aa8"/><path d="M669 92l8-6v12Z" fill="#e98aa8"/>${[[712, 120], [718, 108], [714, 96]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff" opacity=".8"/>`).join("")}`,
      "shelf-crafts": () =>
        `${shelfBoard}<rect x="606" y="98" width="28" height="42" rx="4" fill="#a9d29a" stroke="#6fa56f" stroke-width="2"/>${[[612, "#e8546a", 70], [620, "#4d8fc4", 64], [628, "#f2c23e", 74]].map(([x, c, y]) => `<path d="M${x} 100V${y}" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`).join("")}<rect x="652" y="106" width="28" height="34" rx="6" fill="#f4b6c8" stroke="#d98ba5" stroke-width="2"/><rect x="662" y="98" width="8" height="10" fill="#e8546a"/><rect x="696" y="110" width="26" height="30" rx="5" fill="#a994d6" stroke="#7a68ad" stroke-width="2"/><rect x="734" y="104" width="24" height="36" rx="3" fill="#f2c23e" stroke="#c79a1f" stroke-width="2"/><path d="M740 116h12M740 124h12" stroke="#fff" stroke-width="3"/>`,
    },
    desk: {
      "desk-piano": () =>
        `${deskTop}<rect x="652" y="270" width="134" height="26" rx="4" fill="#fff" stroke="#8a8a8a" stroke-width="2"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${652 + (i + 1) * 16.7} 270v26" stroke="#bbb" stroke-width="1.5"/>`).join("")}${[1, 2, 4, 5, 6].map((i) => `<rect x="${652 + i * 16.7 - 5}" y="270" width="10" height="16" fill="#2b2b2b"/>`).join("")}<rect x="700" y="214" width="50" height="40" fill="#fffaf0" stroke="#cdb892" stroke-width="2"/>${[[712, 226], [726, 222], [740, 230]].map(([x, y]) => `<ellipse cx="${x}" cy="${y + 8}" rx="4" ry="3" fill="#333"/><path d="M${x + 4} ${y + 8}V${y - 4}" stroke="#333" stroke-width="1.5"/>`).join("")}`,
      "desk-science": () =>
        `${deskTop}<path d="M668 296v-30q0-14 14-14t14 14v30" fill="#c9d3dc" stroke="#8a97a3" stroke-width="3"/><rect x="662" y="288" width="42" height="8" rx="3" fill="#8a97a3"/><path d="M678 252l14-22" stroke="#8a97a3" stroke-width="7" stroke-linecap="round"/><circle cx="698" cy="228" r="7" fill="#2e3340"/><circle cx="752" cy="270" r="22" fill="#8ec5e8" stroke="#5f93d0" stroke-width="3"/><path d="M736 262q16 10 30 0M738 278q14-8 28 0" fill="none" stroke="#9bd48f" stroke-width="5"/><path d="M752 292v4" stroke="#8a97a3" stroke-width="4"/><path d="M718 296v-24M726 296v-18" stroke="#e8546a" stroke-width="6" stroke-linecap="round"/>`,
    },
    toy: {
      "toy-robot": () =>
        `${sh(120, 474, 56)}<rect x="96" y="410" width="50" height="54" rx="6" fill="#9fb6c9" stroke="#6f8aa0" stroke-width="3"/><rect x="104" y="376" width="34" height="30" rx="6" fill="#b8cad8" stroke="#6f8aa0" stroke-width="3"/><circle cx="114" cy="390" r="5" fill="#ffe08a"/><circle cx="130" cy="390" r="5" fill="#ffe08a"/><path d="M121 376v-12" stroke="#6f8aa0" stroke-width="3"/><circle cx="121" cy="362" r="5" fill="#e8546a"/><rect x="78" y="416" width="16" height="36" rx="6" fill="#9fb6c9" stroke="#6f8aa0" stroke-width="3"/><rect x="148" y="416" width="16" height="36" rx="6" fill="#9fb6c9" stroke="#6f8aa0" stroke-width="3"/><rect x="102" y="464" width="16" height="12" fill="#6f8aa0"/><rect x="124" y="464" width="16" height="12" fill="#6f8aa0"/><circle cx="110" cy="428" r="5" fill="#e8546a"/><circle cx="124" cy="428" r="5" fill="#4d8fc4"/><circle cx="136" cy="428" r="5" fill="#f2c23e"/><path d="M106 446h30" stroke="#6f8aa0" stroke-width="3"/>`,
      "toy-unicorn": () =>
        `${sh(120, 476, 58)}<ellipse cx="116" cy="440" rx="42" ry="28" fill="#fff" stroke="#d9cde6" stroke-width="3"/><circle cx="152" cy="408" r="22" fill="#fff" stroke="#d9cde6" stroke-width="3"/><path d="M152 388l5-26 5 26Z" fill="#f2c23e" stroke="#c79a1f" stroke-width="2" stroke-linejoin="round"/><path d="M134 396q-14 8-12 26M138 392q-18 6-18 22" fill="none" stroke="#f4a8c0" stroke-width="7" stroke-linecap="round"/><circle cx="158" cy="410" r="3" fill="#3a2c24"/><circle cx="168" cy="418" r="3" fill="#f4a8c0"/>${[86, 106, 128, 146].map((x) => `<rect x="${x}" y="458" width="12" height="20" rx="5" fill="#fff" stroke="#d9cde6" stroke-width="2"/>`).join("")}<path d="M76 430q-16-6-10-24 12 8 14 20" fill="#f4a8c0"/>`,
      "toy-kitchen": () =>
        `${sh(120, 478, 78)}<rect x="52" y="382" width="136" height="94" rx="6" fill="#f4b6c8" stroke="#d98ba5" stroke-width="3"/><rect x="52" y="382" width="136" height="14" rx="4" fill="#fbd3de" stroke="#d98ba5" stroke-width="3"/><ellipse cx="86" cy="388" rx="12" ry="4" fill="#555"/><ellipse cx="124" cy="388" rx="12" ry="4" fill="#555"/><rect x="66" y="412" width="64" height="48" rx="4" fill="#fff" stroke="#d98ba5" stroke-width="2"/><rect x="74" y="420" width="48" height="30" rx="3" fill="#cfe9f7"/><circle cx="152" cy="420" r="6" fill="#fff" stroke="#d98ba5" stroke-width="2"/><circle cx="170" cy="420" r="6" fill="#fff" stroke="#d98ba5" stroke-width="2"/><path d="M70 370h100M86 370v12M124 370v12" stroke="#8a97a3" stroke-width="3"/><circle cx="86" cy="358" r="9" fill="#e8546a"/><path d="M118 370l-6-16h24l-6 16Z" fill="#9fb6c9"/>`,
      "toy-castle": () =>
        `${sh(120, 476, 70)}${[[56, 426, 40, 50, "#f1d6a8"], [144, 426, 40, 50, "#f1d6a8"], [96, 440, 48, 36, "#e8a874"], [96, 410, 48, 30, "#f1d6a8"]].map(([x, y, w, h, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}" stroke="#c9a77a" stroke-width="2.5"/>`).join("")}<path d="M52 426 76 394 100 426ZM140 426 164 394 188 426Z" fill="#e8546a" stroke="#b13a4f" stroke-width="2.5" stroke-linejoin="round"/><path d="M96 410 120 382 144 410Z" fill="#4d8fc4" stroke="#2f6694" stroke-width="2.5" stroke-linejoin="round"/><path d="M120 382v-16" stroke="#8d5d36" stroke-width="3"/><path d="M120 366l16 5-16 6Z" fill="#f2c23e"/><path d="M110 476v-22q10-12 20 0v22Z" fill="#8d6b57"/>`,
    },
    deco: {
      "deco-dreamcatcher": () =>
        `<circle cx="425" cy="120" r="40" fill="none" stroke="#c98c59" stroke-width="6"/><path d="M425 82 449 150 389 106 461 106 401 150Z" fill="none" stroke="#f6ecda" stroke-width="2.5"/><circle cx="425" cy="120" r="5" fill="#f4a8c0"/>${[[385, 168, "#f4a8c0"], [425, 182, "#a994d6"], [465, 168, "#8ec5e8"]].map(([x, y, c]) => `<path d="M${x} 158V${y - 14}" stroke="#c98c59" stroke-width="2.5"/><path d="M${x} ${y - 14}q-9 12 0 28 9-16 0-28Z" fill="${c}" stroke="#00000018" stroke-width="1.5"/>`).join("")}<circle cx="425" cy="160" r="4" fill="#f6d36e"/>`,
      "deco-poster-space": () =>
        `<rect x="350" y="76" width="150" height="118" rx="6" fill="#fffaf0" stroke="#8a6a4a" stroke-width="6"/><rect x="362" y="88" width="126" height="94" fill="#2e2a5e"/>${[[380, 104, 4], [470, 112, 5], [400, 164, 3], [462, 160, 4]].map(([x, y, r]) => star(x, y, r, "#fff2b0")).join("")}<circle cx="445" cy="132" r="22" fill="#f2a65a"/><path d="M425 140q20 10 40-8" fill="none" stroke="#f5cf8b" stroke-width="4"/><path d="M402 160q6-26 20-30l-4 26Z" fill="#e8546a" stroke="#fff" stroke-width="2" transform="rotate(20 410 146)"/><ellipse cx="412" cy="140" rx="7" ry="16" fill="#f6f6f6" stroke="#9aa5b1" stroke-width="2" transform="rotate(35 412 140)"/>`,
      "deco-poster-sea": () =>
        `<rect x="350" y="76" width="150" height="118" rx="6" fill="#fffaf0" stroke="#4d8fc4" stroke-width="6"/><rect x="362" y="88" width="126" height="94" fill="#8fd0e2"/><path d="M362 160q16-10 32 0t32 0 32 0 30 0v22H362Z" fill="#5fa8d3"/><ellipse cx="420" cy="128" rx="30" ry="16" fill="#6f8fb8"/><path d="M448 128l16-12v24Z" fill="#6f8fb8"/><circle cx="406" cy="124" r="3" fill="#fff"/><path d="M420 112q-4-12 4-18M420 112q6-10 14-8" fill="none" stroke="#cfe9f7" stroke-width="3" stroke-linecap="round"/><ellipse cx="470" cy="164" rx="9" ry="5" fill="#f2a65a"/>`,
      "deco-sun": () =>
        `<circle cx="425" cy="134" r="52" fill="#ffd978" opacity=".35"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<path d="M${(425 + Math.sin(a) * 40).toFixed(1)} ${(134 - Math.cos(a) * 40).toFixed(1)}L${(425 + Math.sin(a) * 58).toFixed(1)} ${(134 - Math.cos(a) * 58).toFixed(1)}" stroke="#f2a65a" stroke-width="7" stroke-linecap="round"/>`; }).join("")}<circle cx="425" cy="134" r="36" fill="#ffd978" stroke="#e8a83a" stroke-width="4"/><circle cx="412" cy="128" r="4" fill="#5a3b2e"/><circle cx="438" cy="128" r="4" fill="#5a3b2e"/><path d="M410 142q15 12 30 0" fill="none" stroke="#a15853" stroke-width="4" stroke-linecap="round"/><circle cx="404" cy="140" r="5" fill="#f4a8a8" opacity=".6"/><circle cx="446" cy="140" r="5" fill="#f4a8a8" opacity=".6"/>`,
      "deco-photos": () =>
        `<path d="M340 84Q425 112 510 84" fill="none" stroke="#b9a98c" stroke-width="3"/>${[[360, 98, 36, 44, "#f4b6c8", -6], [412, 108, 40, 50, "#cfe9f7", 3], [470, 98, 36, 44, "#f6e7a8", 7]].map(([x, y, w, hh, c, r]) => `<g transform="rotate(${r} ${x + w / 2} ${y})"><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#fffaf0" stroke="#c98c59" stroke-width="3"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${hh - 16}" fill="${c}"/><circle cx="${x + w / 2}" cy="${y + 16}" r="6" fill="#ffffffaa"/></g>`).join("")}${[[372, 92], [428, 104], [488, 92]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#e8546a"/>`).join("")}`,
    },
    plant: {
      "plant-sunflower": () =>
        `<ellipse cx="610" cy="392" rx="30" ry="7" fill="#00000014"/><path d="M590 392 596 352H624L630 392Z" fill="#e8a874" stroke="#b9794c" stroke-width="3"/><path d="M610 352V252" stroke="#6fae73" stroke-width="7" stroke-linecap="round"/><path d="M610 316q-26-4-30-26 22 2 30 26ZM610 300q26-4 30-26-22 2-30 26Z" fill="#8fc88a"/>${Array.from({ length: 12 }, (_, i) => { const a = (i * Math.PI) / 6; return `<ellipse cx="${(610 + Math.sin(a) * 26).toFixed(1)}" cy="${(250 - Math.cos(a) * 26).toFixed(1)}" rx="8" ry="15" transform="rotate(${i * 30} ${(610 + Math.sin(a) * 26).toFixed(1)} ${(250 - Math.cos(a) * 26).toFixed(1)})" fill="#f6c94e"/>`; }).join("")}<circle cx="610" cy="250" r="17" fill="#8d5d36"/>`,
      "plant-palm": () =>
        `<ellipse cx="610" cy="392" rx="30" ry="7" fill="#00000014"/><path d="M590 392 596 348H624L630 392Z" fill="#a994d6" stroke="#7a68ad" stroke-width="3"/><path d="M610 350q-4-40 4-80" fill="none" stroke="#8d6b57" stroke-width="9" stroke-linecap="round"/>${[[-60, -10], [-40, -40], [0, -54], [40, -40], [60, -8]].map(([dx, dy]) => `<path d="M614 272q${dx * 0.6} ${dy - 20} ${dx} ${dy + 20}q${-dx * 0.3 + 8} ${-14} ${-dx + 4} ${-18}Z" fill="#6fae73" stroke="#4f8a5d" stroke-width="2"/>`).join("")}`,
      "plant-fern": () =>
        `<ellipse cx="610" cy="392" rx="30" ry="7" fill="#00000014"/><path d="M588 392 594 346H626L632 392Z" fill="#f4b6c8" stroke="#d98ba5" stroke-width="3"/>${[-70, -45, -20, 5, 30, 55].map((d, i) => `<path d="M610 348q${d} -${40 + (i % 2) * 22} ${d * 1.5} -${70 + (i % 3) * 14}" fill="none" stroke="#6fae73" stroke-width="7" stroke-linecap="round"/>`).join("")}`,
    },
    seat: {
      "seat-pouf": () => `${sh(715, 490, 56)}<path d="M668 446v34q0 14 47 14t47-14v-34Z" fill="#f4a8c0" stroke="#d98ba5" stroke-width="3"/><ellipse cx="715" cy="446" rx="47" ry="15" fill="#f8c4d4" stroke="#d98ba5" stroke-width="3"/><path d="M690 448q25 8 50 0" fill="none" stroke="#d98ba5" stroke-width="3" stroke-dasharray="6 6"/>`,
      "seat-armchair": () => `${sh(715, 494, 66)}<rect x="668" y="392" width="94" height="76" rx="22" fill="#a994d6" stroke="#7a68ad" stroke-width="3"/><rect x="654" y="428" width="26" height="56" rx="12" fill="#b9a8e0" stroke="#7a68ad" stroke-width="3"/><rect x="750" y="428" width="26" height="56" rx="12" fill="#b9a8e0" stroke="#7a68ad" stroke-width="3"/><rect x="674" y="446" width="82" height="36" rx="12" fill="#c6b8ea" stroke="#7a68ad" stroke-width="3"/><path d="M670 484v10M760 484v10" stroke="#8d5d36" stroke-width="6" stroke-linecap="round"/><circle cx="715" cy="414" r="5" fill="#fff"/>`,
      "seat-ball": () => `${sh(715, 492, 48)}<circle cx="715" cy="452" r="40" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="3"/><path d="M690 424q25 20 50 0M683 452q32 14 64 0M690 480q25-10 50 0" fill="none" stroke="#a9d29a" stroke-width="4"/><path d="M692 430q-8 10-6 24" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>`,
      "seat-mushroom": () => `${sh(715, 492, 50)}<path d="M700 450h30l4 40h-38Z" fill="#fff0d8" stroke="#d9c4a0" stroke-width="3"/><path d="M664 448Q664 410 715 408T766 448Z" fill="#e8546a" stroke="#b13a4f" stroke-width="3"/><ellipse cx="715" cy="448" rx="51" ry="8" fill="#f5e6d3" stroke="#d9c4a0" stroke-width="2"/>${[[690, 430], [720, 424], [744, 438]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6" fill="#fff"/>`).join("")}`,
      "seat-beanbag": () => `${sh(715, 490, 62)}<path d="M660 484Q652 440 690 424Q715 396 744 424Q782 440 770 484Q715 500 660 484Z" fill="#6f9fd8" stroke="#4a78b0" stroke-width="3" stroke-linejoin="round"/><path d="M690 432q25 14 54 0" fill="none" stroke="#4a78b0" stroke-width="3" stroke-linecap="round"/><path d="M676 462q-4-12 4-22" fill="none" stroke="#a9c9ec" stroke-width="5" stroke-linecap="round"/>`,
    },
    ceiling: {
      "ceiling-lanterns": () => [[320, 28, "#f4a8c0"], [400, 44, "#ffd978"], [480, 26, "#8ec5e8"], [560, 46, "#a9d29a"], [640, 24, "#f2a65a"], [720, 42, "#c8a6e8"]].map(([x, y, c]) => `<path d="M${x} 0V${y - 16}" stroke="#9a8a6a" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="15" ry="19" fill="${c}" stroke="#00000022" stroke-width="2"/><path d="M${x - 15} ${y}q15 8 30 0M${x - 10} ${y - 12}q10 6 20 0" fill="none" stroke="#ffffff88" stroke-width="2"/><rect x="${x - 5}" y="${y + 17}" width="10" height="5" fill="#8d6b57"/>`).join(""),
      "ceiling-mobile": () => [[330, 0], [545, 0], [750, 0]].map(([x], i) => `<path d="M${x} 0V16" stroke="#9a8a6a" stroke-width="2"/><path d="M${x - 34} 16H${x + 34}" stroke="#c98c59" stroke-width="3" stroke-linecap="round"/>${[-34, 0, 34].map((d, j) => `<path d="M${x + d} 16V${34 + j * 6}" stroke="#9a8a6a" stroke-width="1.5"/>${[star(x + d, 44 + j * 6, 9, "#ffd978"), `<path d="M${x + d + 6} ${34 + j * 6}a10 10 0 1 0 0 20 8 8 0 1 1 0-20Z" fill="#cfe9f7"/>`, `<ellipse cx="${x + d}" cy="${46 + j * 6}" rx="12" ry="7" fill="#fff" stroke="#cfe3f0" stroke-width="2"/>`][(i + j) % 3]}`).join("")}`).join(""),
      "ceiling-balloons": () => `<path d="M545 52V108" stroke="#9a8a6a" stroke-width="2"/>${[[524, 40, "#e8546a"], [548, 28, "#f2c23e"], [570, 42, "#4d8fc4"], [536, 56, "#a9d29a"], [560, 58, "#f4a8c0"]].map(([x, y, c]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="17" fill="${c}" stroke="#00000022" stroke-width="2"/><path d="M${x} ${y + 17}L545 76" stroke="#9a8a6a" stroke-width="1.5"/><ellipse cx="${x - 5}" cy="${y - 6}" rx="3" ry="5" fill="#ffffff88"/>`).join("")}`,
      "ceiling-planes": () => [[340, 38], [470, 52], [660, 34], [750, 56]].map(([x, y], i) => `<path d="M${x} 0V${y - 8}" stroke="#9a8a6a" stroke-width="1.5"/><g transform="rotate(${i % 2 ? 14 : -12} ${x} ${y})"><path d="M${x - 22} ${y}l44-14-14 26-8-10Z" fill="${["#fff", "#cfe9f7", "#fbd3de", "#fff4d8"][i]}" stroke="#9a8a6a" stroke-width="2" stroke-linejoin="round"/><path d="M${x + 22} ${y - 14}L${x - 4} ${y + 8}" stroke="#9a8a6a" stroke-width="1.5"/></g>`).join(""),
    },
  };
  function dotsOf(pts, r, fill) {
    return pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`).join("");
  }
}
export const moreNames = {
  "wall-peach": ["Murs pêche", 8],
  "wall-butter": ["Murs beurre", 8],
  "wall-dots": ["Murs à pois", 12],
  "wall-hearts": ["Murs de cœurs", 14],
  "wall-ocean": ["Murs océan", 16],
  "wall-space": ["Murs de l’espace", 20],
  "floor-dark": ["Parquet foncé", 10],
  "floor-pink": ["Moquette rose", 12],
  "floor-sand": ["Sol de plage", 16],
  "floor-tiles": ["Carreaux bleus", 16],
  "floor-cloud": ["Sol nuages", 20],
  "bed-bunny": ["Lit lapin", 30],
  "bed-boat": ["Lit bateau", 40],
  "bed-rocket": ["Lit fusée", 42],
  "rug-heart": ["Tapis cœur", 14],
  "rug-flower": ["Tapis fleur", 16],
  "rug-moon": ["Tapis lune", 20],
  "window-sunset": ["Fenêtre coucher de soleil", 16],
  "window-sea": ["Fenêtre sur la mer", 18],
  "window-butterflies": ["Fenêtre aux papillons", 18],
  "lamp-cloud": ["Lampe nuage", 14],
  "lamp-flower": ["Lampe fleur", 14],
  "lamp-owl": ["Lampe hibou", 18],
  "shelf-crafts": ["Étagère à crayons", 12],
  "shelf-trophies": ["Étagère à trophées", 18],
  "shelf-aquarium": ["Étagère aquarium", 26],
  "desk-piano": ["Piano jouet", 28],
  "desk-science": ["Coin des sciences", 30],
  "toy-robot": ["Robot", 16],
  "toy-unicorn": ["Licorne en peluche", 20],
  "toy-castle": ["Château en blocs", 22],
  "toy-kitchen": ["Dînette", 28],
  "deco-sun": ["Soleil souriant", 12],
  "deco-photos": ["Cadres photos", 14],
  "deco-poster-sea": ["Affiche de la mer", 12],
  "deco-poster-space": ["Affiche de l’espace", 12],
  "deco-dreamcatcher": ["Attrape-rêves", 18],
  "plant-fern": ["Fougère", 10],
  "plant-sunflower": ["Tournesol géant", 14],
  "plant-palm": ["Petit palmier", 16],
  "seat-ball": ["Ballon de gym", 10],
  "seat-pouf": ["Pouf rose", 12],
  "seat-beanbag": ["Sac poire", 16],
  "seat-mushroom": ["Tabouret champignon", 18],
  "seat-armchair": ["Fauteuil douillet", 26],
  "ceiling-balloons": ["Ballons au plafond", 12],
  "ceiling-planes": ["Avions en papier", 14],
  "ceiling-lanterns": ["Lanternes en papier", 16],
  "ceiling-mobile": ["Mobiles étoilés", 20],
};
export const moreSlotLabels = { seat: "Sièges", ceiling: "Plafond" };
