// Décors du château (ciel et alentours) : source unique des dessins.
// L'icône de la boutique est un recadrage (VIEW) du fragment dessiné dans le royaume.
// Aucun identifiant SVG : plusieurs royaumes peuvent cohabiter dans une page.
export const roofColors = {
  "roof-lilac": ["#9381bd", "#6d6099"],
  "roof-rose": ["#ca8397", "#a6657d"],
  "roof-gold": ["#d9a94e", "#b08331"],
  "roof-emerald": ["#5fa387", "#42806a"],
};
export const defaultRoof = ["#668fae", "#476c8a"];
const FRAG = {
  "sky-rainbow": () =>
    [
      ["#e98a8a", 312],
      ["#f3b86b", 303],
      ["#f2e27a", 294],
      ["#98cf8f", 285],
      ["#8cc3e0", 276],
      ["#a994d6", 267],
    ]
      .map(
        ([c, r]) =>
          `<path d="M${430 - r} 372A${r} ${r} 0 0 1 ${430 + r} 372" fill="none" stroke="${c}" stroke-width="9" opacity=".8"/>`,
      )
      .join(""),
  "sky-balloon": () =>
    `<g transform="translate(150 118)"><g class="c-float"><path d="M0 0C-34 0-46 42-26 72 -18 82-8 90 0 94 8 90 18 82 26 72 46 42 34 0 0 0Z" fill="#e98a8a" stroke="#b9626b" stroke-width="2"/><path d="M0 0C-12 12-16 56 0 94 16 56 12 12 0 0Z" fill="#f5d36b"/><path d="M-20 54Q0 62 20 54" fill="none" stroke="#fff3d6" stroke-width="3"/><path d="M-13 88 -8 106m21-18L8 106" stroke="#8d6b57" stroke-width="2"/><path d="M-12 106h24v14h-24Z" fill="#b98a5e" stroke="#7d5a3a" stroke-width="2"/></g></g>`,
  "sky-aurora": () =>
    `<path d="M40 92Q230 20 420 80T830 52" fill="none" stroke="#b9a6ee" stroke-width="22" stroke-linecap="round" opacity=".4"/><path d="M60 128Q260 70 450 118T820 96" fill="none" stroke="#a5dcc0" stroke-width="16" stroke-linecap="round" opacity=".45"/><g fill="#fff6bb">${[[120, 190], [250, 150], [340, 60], [560, 150], [640, 40], [760, 180], [470, 36], [60, 250]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" opacity=".28"/><circle cx="${x}" cy="${y}" r="3.4"/>`).join("")}</g>`,
  "ground-windmill": () =>
    `<g transform="translate(108 232) scale(1.15)"><path d="M12 100 22 34h26l10 66Z" fill="#efdcbc" stroke="#bda57f" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 34 35 8l19 26Z" fill="#b5705a" stroke="#8c4f3e" stroke-width="2.5" stroke-linejoin="round"/><path d="M28 100v-22q7-8 14 0v22Z" fill="#8d6b57"/><g transform="translate(35 32)"><g class="c-spin"><path d="M0 0 40-30M0 0 34 36M0 0-40 30M0 0-34-36" stroke="#8d6b57" stroke-width="4" stroke-linecap="round"/><path d="m8-7 33-23 6 9-27 20ZM-8 7-41 30l-6-9 27-20Z" fill="#fff4dc" stroke="#cdb892" stroke-width="2" stroke-linejoin="round"/><circle r="5" fill="#8d6b57"/></g></g></g>`,
  "ground-village": () =>
    [
      [676, 330, "#c6889d"],
      [706, 342, "#9381bd"],
    ]
      .map(
        ([x, y, c]) =>
          `<g transform="translate(${x} ${y})"><path d="M2 44V22l18-14 18 14v22Z" fill="#f0dfc0" stroke="#c9b48c" stroke-width="2" stroke-linejoin="round"/><path d="M-3 24 20 4l23 20Z" fill="${c}" stroke="#7d6370" stroke-width="2" stroke-linejoin="round"/><path d="M15 44V32h10v12Z" fill="#8d6b57"/><path d="M28 28h6v6h-6Z" fill="#8ab4c4"/><path d="M8 28h6v6H8Z" fill="#8ab4c4"/></g>`,
      )
      .join(""),
  "ground-tent": () =>
    `<g transform="translate(560 412) scale(1.3)"><ellipse cx="0" cy="36" rx="38" ry="9" fill="#4e725c" opacity=".2"/><path d="M-32 34V10h64v24Z" fill="#fdf0d6" stroke="#cdb892" stroke-width="2"/><path d="M-36 12 0-24 36 12Z" fill="#e6a3b3" stroke="#b97589" stroke-width="2" stroke-linejoin="round"/><path d="M-12 12 0-24M12 12 0-24" stroke="#fff3d6" stroke-width="4"/><path d="M-9 34V20q9-8 18 0v14Z" fill="#8d6b57"/><path d="M0-24v-14l14 4-14 6" fill="#f3d27a" stroke="#c19b4a" stroke-width="1.5" stroke-linejoin="round"/></g>`,
};
const VIEW = {
  "sky-rainbow": [100, 40, 660, 340],
  "sky-balloon": [100, 110, 100, 120],
  "sky-aurora": [30, 20, 800, 260],
  "ground-windmill": [60, 215, 200, 170],
  "ground-village": [665, 320, 90, 70],
  "ground-tent": [500, 360, 120, 105],
};
export const castleExtras = Object.keys(FRAG);
export const castleExtraFragment = (id) => (FRAG[id] ? FRAG[id]() : "");
// Un petit fond doux rappelle le ciel quand le fragment est transparent.
export function castleExtraIcon(id) {
  const v = VIEW[id];
  if (!v || !FRAG[id]) return null;
  const fill =
    id === "sky-aurora" ? "#4a4780" : id.startsWith("sky-") ? "#e8edf7" : "#c6dca7";
  const bg = `<rect x="${v[0]}" y="${v[1]}" width="${v[2]}" height="${v[3]}" fill="${fill}"/>`;
  return `<svg viewBox="${v.join(" ")}" class="item-art" aria-hidden="true" focusable="false">${bg}${FRAG[id]()}</svg>`;
}
