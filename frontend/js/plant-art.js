// Plantes du jardin dessinées en SVG local (remplacent les emojis). Aucun identifiant SVG.
// Repère 80 × 80, sol à y = 70.
const shadow = '<ellipse cx="40" cy="71" rx="22" ry="5" fill="#0000001c"/>';
const stem = (d, w = 4) => `<path d="${d}" fill="none" stroke="#5f9a63" stroke-width="${w}" stroke-linecap="round"/>`;
const leaf = (x, y, r, c = "#7fbf7a") =>
  `<ellipse cx="${x}" cy="${y}" rx="8" ry="4.5" transform="rotate(${r} ${x} ${y})" fill="${c}" stroke="#4f8a5d" stroke-width="1.5"/>`;
const ring = (cx, cy, n, rx, ry, dist, fill, stroke) =>
  Array.from({ length: n }, (_, i) => {
    const a = (360 / n) * i;
    return `<ellipse cx="${cx}" cy="${cy - dist}" rx="${rx}" ry="${ry}" transform="rotate(${a} ${cx} ${cy})" fill="${fill}" stroke="${stroke}" stroke-width="1.2"/>`;
  }).join("");
const ART = {
  flower: () =>
    `${shadow}${stem("M30 70V42M52 70V34")}${leaf(26, 58, -35)}${leaf(56, 56, 35)}<path d="M21 42Q21 26 30 26T39 42Q30 48 21 42Z" fill="#f08aa6" stroke="#c4577a" stroke-width="2"/><path d="M30 26 26 38M30 26l4 12" stroke="#c4577a" stroke-width="1.2"/><path d="M44 34Q44 18 52 18T60 34Q52 40 44 34Z" fill="#f7c35f" stroke="#c98e22" stroke-width="2"/>`,
  tree: () =>
    `${shadow}<path d="M35 70V44h10v26Z" fill="#a9774c" stroke="#7a5230" stroke-width="2"/><circle cx="26" cy="38" r="15" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2"/><circle cx="54" cy="38" r="15" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2"/><circle cx="40" cy="25" r="17" fill="#8ccb85" stroke="#4f8a5d" stroke-width="2"/><rect x="34" y="30" width="7" height="9" rx="1" fill="#fffaf0" transform="rotate(-12 37 34)"/><rect x="47" y="38" width="7" height="9" rx="1" fill="#fffaf0" transform="rotate(10 50 42)"/><rect x="22" y="40" width="6" height="8" rx="1" fill="#fffaf0" transform="rotate(8 25 44)"/>`,
  mushroom: () =>
    `${shadow}<path d="M33 70V50q0-6 7-6t7 6v20Z" fill="#fff0d8" stroke="#d1b78c" stroke-width="2"/><path d="M14 50Q14 20 40 20T66 50Q40 58 14 50Z" fill="#e8546a" stroke="#b13a4f" stroke-width="2.5"/><circle cx="30" cy="38" r="4.5" fill="#fff"/><circle cx="46" cy="30" r="5.5" fill="#fff"/><circle cx="56" cy="43" r="3.5" fill="#fff"/><path d="m64 16 1.8 4.2 4.2 1.8-4.2 1.8L64 28l-1.8-4.2L58 22l4.2-1.8Z" fill="#ffd978"/>`,
  fountain: () =>
    `${shadow}<ellipse cx="40" cy="62" rx="30" ry="9" fill="#dcd0ba" stroke="#b4a893" stroke-width="2.5"/><ellipse cx="40" cy="59" rx="22" ry="6" fill="#8ec5d0"/><path d="M40 59V30" stroke="#d8cbb5" stroke-width="6"/><path d="M28 36q12 12 24 0" fill="none" stroke="#d8cbb5" stroke-width="5"/><path d="M40 26q-14-16-17 4m17-4q14-16 17 4" fill="none" stroke="#83bbc8" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="22" r="3" fill="#bfe3f4"/>`,
  sunflower: () =>
    `${shadow}${stem("M40 70V38", 5)}${leaf(30, 58, -30)}${leaf(50, 52, 30)}${ring(40, 30, 12, 4, 10, 13, "#f6c94e", "#c9991f")}<circle cx="40" cy="30" r="9" fill="#7a5230" stroke="#5a3a20" stroke-width="1.5"/><circle cx="37" cy="28" r="1.2" fill="#a9774c"/><circle cx="43" cy="32" r="1.2" fill="#a9774c"/>`,
  rose: () =>
    `${shadow}${stem("M40 70V40")}${leaf(30, 60, -30)}${leaf(50, 54, 30)}<circle cx="40" cy="30" r="14" fill="#e0405c" stroke="#a8243f" stroke-width="2"/><path d="M40 30m-8 0a8 8 0 1 1 8 8M40 30m-3 0a3 3 0 1 1 3 3" fill="none" stroke="#a8243f" stroke-width="2" stroke-linecap="round"/><path d="M36 46l-4 2m12-2 4 2" stroke="#4f8a5d" stroke-width="2" stroke-linecap="round"/>`,
  pumpkin: () =>
    `${shadow}<ellipse cx="28" cy="52" rx="14" ry="16" fill="#f08a2e" stroke="#b9591a" stroke-width="2"/><ellipse cx="52" cy="52" rx="14" ry="16" fill="#f08a2e" stroke="#b9591a" stroke-width="2"/><ellipse cx="40" cy="52" rx="13" ry="17" fill="#f6a24a" stroke="#b9591a" stroke-width="2"/><path d="M40 36q0-8 4-10" stroke="#5f9a63" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M44 28q6-4 8 2" stroke="#5f9a63" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M34 50a6 6 0 1 0 6-6 4.5 4.5 0 1 1-6 6Z" fill="#ffe9a8"/>`,
  lantern: () =>
    `<ellipse cx="40" cy="71" rx="16" ry="4" fill="#0000001c"/><path d="M40 70V32" stroke="#6b5b45" stroke-width="4"/><path d="M40 32q12 0 12 8" stroke="#6b5b45" stroke-width="3" fill="none"/><circle cx="52" cy="44" r="18" fill="#ffe9a044"/><rect x="45" y="40" width="14" height="19" rx="4" fill="#ffd978" stroke="#a98f5e" stroke-width="2"/><path d="M52 45q3 5 0 10-3-5 0-10Z" fill="#f4a43a"/><circle cx="26" cy="38" r="2.4" fill="#ffe36a"/><circle cx="30" cy="54" r="2" fill="#ffe36a"/><circle cx="64" cy="30" r="2.2" fill="#ffe36a"/><circle cx="22" cy="58" r="1.6" fill="#ffe36a"/>`,
  cherry: () =>
    `${shadow}<path d="M36 70V48q-2-8 4-14 6 6 4 14v22Z" fill="#8d5d44" stroke="#6a4230" stroke-width="2"/><circle cx="26" cy="32" r="13" fill="#f6b9c8" stroke="#d98ba5" stroke-width="2"/><circle cx="54" cy="32" r="13" fill="#f6b9c8" stroke="#d98ba5" stroke-width="2"/><circle cx="40" cy="22" r="15" fill="#fbcad6" stroke="#d98ba5" stroke-width="2"/><circle cx="34" cy="26" r="2" fill="#fff"/><circle cx="48" cy="30" r="2" fill="#fff"/><circle cx="22" cy="36" r="2" fill="#fff"/><circle cx="62" cy="52" r="2.4" fill="#f6b9c8"/><circle cx="18" cy="56" r="2.4" fill="#f6b9c8"/><circle cx="58" cy="64" r="2" fill="#f6b9c8"/>`,
  hibiscus: () =>
    `${shadow}${stem("M40 70V44")}${leaf(30, 62, -30)}${leaf(52, 58, 30)}${ring(40, 32, 5, 9, 12, 12, "#f4707a", "#c23a4a")}<circle cx="40" cy="32" r="5" fill="#ffd978"/><path d="M40 32l10-12" stroke="#c23a4a" stroke-width="2.2" stroke-linecap="round"/><circle cx="51" cy="19" r="2.4" fill="#ffd978"/>`,
  apple: () =>
    `${shadow}<path d="M35 70V46h10v24Z" fill="#a9774c" stroke="#7a5230" stroke-width="2"/><circle cx="26" cy="36" r="15" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2"/><circle cx="54" cy="36" r="15" fill="#7fbf7a" stroke="#4f8a5d" stroke-width="2"/><circle cx="40" cy="24" r="16" fill="#8ccb85" stroke="#4f8a5d" stroke-width="2"/><circle cx="30" cy="38" r="5.2" fill="#f2c23e" stroke="#c19b1f" stroke-width="1.5"/><circle cx="50" cy="40" r="5.2" fill="#f2c23e" stroke="#c19b1f" stroke-width="1.5"/><circle cx="40" cy="26" r="5.2" fill="#f2c23e" stroke="#c19b1f" stroke-width="1.5"/><circle cx="28" cy="29" r="1.6" fill="#fff" opacity=".8"/>`,
  hive: () =>
    `${shadow}<path d="M20 68Q20 22 40 16Q60 22 60 68Z" fill="#f2c23e" stroke="#b9891a" stroke-width="2.5"/><path d="M22 56H58M24 44H56M28 32H52" stroke="#b9891a" stroke-width="2.5"/><ellipse cx="40" cy="62" rx="7" ry="6" fill="#4a3a2a"/><ellipse cx="62" cy="30" rx="4.5" ry="3.4" fill="#f6d36e" stroke="#4a3a2a" stroke-width="1.5"/><path d="M60 30h4" stroke="#4a3a2a" stroke-width="1.6"/><ellipse cx="60" cy="25" rx="3" ry="2" fill="#dff1f7" stroke="#8fb7c8" stroke-width="1"/>`,
  butterfly: () =>
    `<ellipse cx="40" cy="71" rx="16" ry="4" fill="#0000001c"/><path d="M40 40Q18 14 12 32T32 54Q40 50 40 40Z" fill="#f08a2e" stroke="#b9591a" stroke-width="2"/><path d="M40 40Q62 14 68 32T48 54Q40 50 40 40Z" fill="#f08a2e" stroke="#b9591a" stroke-width="2"/><path d="M40 44Q26 52 28 62T40 60Z" fill="#e8546a" stroke="#a8243f" stroke-width="1.8"/><path d="M40 44Q54 52 52 62T40 60Z" fill="#e8546a" stroke="#a8243f" stroke-width="1.8"/><circle cx="22" cy="32" r="4" fill="#fff0c0"/><circle cx="58" cy="32" r="4" fill="#fff0c0"/><rect x="38" y="30" width="4" height="30" rx="2" fill="#4a3a2a"/><path d="M39 30Q34 20 30 18M41 30Q46 20 50 18" stroke="#4a3a2a" stroke-width="1.6" fill="none"/>`,
  crystal: () =>
    `${shadow}<path d="M40 14 54 34 40 66 26 34Z" fill="#8fd8f0" stroke="#3f9bbd" stroke-width="2.4" stroke-linejoin="round"/><path d="M26 34H54M40 14 34 34 40 66 46 34Z" fill="none" stroke="#3f9bbd" stroke-width="1.6"/><path d="M18 62 26 46 32 64Z" fill="#c9b6f0" stroke="#7a62b8" stroke-width="2" stroke-linejoin="round"/><path d="M62 62 56 46 50 64Z" fill="#c9b6f0" stroke="#7a62b8" stroke-width="2" stroke-linejoin="round"/><path d="m64 16 1.6 3.4 3.4 1.6-3.4 1.6L64 26l-1.6-3.4L59 21l3.4-1.6Z" fill="#fff0a8"/>`,
  rainbow: () =>
    `<ellipse cx="40" cy="71" rx="26" ry="4" fill="#0000001c"/>${[["#e98a8a", 28], ["#f3b86b", 23], ["#f2e27a", 18], ["#98cf8f", 13], ["#8cc3e0", 8]].map(([c, r]) => `<path d="M${40 - r} 62A${r} ${r} 0 0 1 ${40 + r} 62" fill="none" stroke="${c}" stroke-width="5.2"/>`).join("")}<g fill="#fff" stroke="#c9dbe8" stroke-width="1.5"><ellipse cx="16" cy="62" rx="10" ry="6"/><ellipse cx="10" cy="58" rx="5" ry="4"/><ellipse cx="64" cy="62" rx="10" ry="6"/><ellipse cx="70" cy="58" rx="5" ry="4"/></g>`,
};
export const plantIds = Object.keys(ART);
export function plantIcon(id, label = "") {
  return ART[id]
    ? `<svg viewBox="0 0 80 80" class="plant-art" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"'}>${ART[id]()}</svg>`
    : null;
}
