export const shop = [
  {
    id: "head-hat",
    slot: "head",
    name: "Chapeau de voyage",
    icon: "🧙",
    price: 12,
    kind: "avatar",
    value: "hat",
  },
  {
    id: "head-ribbon",
    slot: "head",
    name: "Ruban des étoiles",
    icon: "🎀",
    price: 8,
    kind: "avatar",
    value: "ribbon",
  },
  {
    id: "head-crown",
    slot: "head",
    name: "Couronne solaire",
    icon: "👑",
    price: 18,
    kind: "avatar",
    value: "crown",
  },
  {
    id: "cape-forest",
    slot: "cape",
    name: "Cape des exploratrices",
    icon: "🍃",
    price: 12,
    kind: "avatar",
    value: "forest",
  },
  {
    id: "cape-night",
    slot: "cape",
    name: "Cape du ciel étoilé",
    icon: "🌙",
    price: 22,
    kind: "avatar",
    value: "night",
  },
  {
    id: "dress-lilac",
    slot: "dress",
    name: "Tunique lilas",
    icon: "🪻",
    price: 10,
    kind: "avatar",
    value: "lilac",
  },
  {
    id: "dress-rose",
    slot: "dress",
    name: "Robe des fleurs",
    icon: "🌸",
    price: 15,
    kind: "avatar",
    value: "rose",
  },
  {
    id: "wand-star",
    slot: "hand",
    name: "Baguette étoilée",
    icon: "🪄",
    price: 16,
    kind: "avatar",
    value: "star",
  },
  {
    id: "bag-adventure",
    slot: "hand",
    name: "Sac d’exploratrice",
    icon: "🎒",
    price: 12,
    kind: "avatar",
    value: "bag",
  },
  {
    id: "roof-lilac",
    slot: "roof",
    name: "Toits d’améthyste",
    icon: "🔮",
    price: 20,
    kind: "castle",
    value: "lilac",
  },
  {
    id: "roof-rose",
    slot: "roof",
    name: "Toits de rose",
    icon: "🌸",
    price: 20,
    kind: "castle",
    value: "rose",
  },
  {
    id: "castle-flags",
    slot: "flags",
    name: "Bannières dorées",
    icon: "🚩",
    price: 14,
    kind: "castle",
    value: "gold",
  },
  {
    id: "castle-garden",
    slot: "garden",
    name: "Bosquet enchanté",
    icon: "🌳",
    price: 24,
    kind: "castle",
    value: "trees",
  },
  {
    id: "castle-fountain",
    slot: "fountain",
    name: "Fontaine des rêves",
    icon: "⛲",
    price: 30,
    kind: "castle",
    value: "water",
  },
];
export const skins = ["#f4c7a3", "#dca578", "#b97a51", "#875039"];
export const hairs = ["#59382e", "#a56539", "#e4bc68", "#302c39"];
export function defaultRpg(coins = 0) {
  return {
    coins,
    owned: [],
    look: { skin: 0, hair: 0 },
    equipped: { head: null, cape: null, dress: null, hand: null },
    castle: { roof: null, flags: null, garden: null, fountain: null },
  };
}
export function validRpg(r) {
  if (
    !r ||
    !Number.isSafeInteger(r.coins) ||
    r.coins < 0 ||
    !Array.isArray(r.owned) ||
    new Set(r.owned).size !== r.owned.length ||
    r.owned.some((id) => !shop.some((i) => i.id === id)) ||
    !r.look ||
    ![0, 1, 2, 3].includes(r.look.skin) ||
    ![0, 1, 2, 3].includes(r.look.hair)
  )
    return false;
  for (const [group, kind, slots] of [
    ["equipped", "avatar", ["head", "cape", "dress", "hand"]],
    ["castle", "castle", ["roof", "flags", "garden", "fountain"]],
  ]) {
    if (!r[group]) return false;
    for (const slot of slots) {
      const id = r[group][slot];
      if (
        id !== null &&
        (!r.owned.includes(id) ||
          !shop.some((i) => i.id === id && i.kind === kind && i.slot === slot))
      )
        return false;
    }
  }
  return true;
}
export function purchase(state, id) {
  const i = shop.find((i) => i.id === id);
  if (!i || state.rpg.owned.includes(id) || state.rpg.coins < i.price)
    return false;
  state.rpg.coins -= i.price;
  state.rpg.owned.push(id);
  return true;
}
export function equip(state, id) {
  const i = shop.find((i) => i.id === id);
  if (!i || !state.rpg.owned.includes(id)) return false;
  state.rpg[i.kind === "avatar" ? "equipped" : "castle"][i.slot] = id;
  return true;
}
export function preview(rpg, id) {
  const r = structuredClone(rpg),
    i = shop.find((i) => i.id === id);
  if (i) r[i.kind === "avatar" ? "equipped" : "castle"][i.slot] = id;
  return r;
}
export function itemArt(id) {
  let body = "";
  if (id === "head-crown")
    body =
      '<path d="m15 56-5-30 20 11 10-22 12 22 19-11-5 30Z" fill="#edc868" stroke="#bb8d44" stroke-width="3"/><path d="m40 32 6 9-6 9-6-9Z" fill="#85bdaa"/>';
  else if (id === "head-hat")
    body =
      '<path d="m14 56 24-44 16 41 17 9q-30 16-62 0Z" fill="#7984b1" stroke="#53618c" stroke-width="3"/><path d="m25 42 27 10" stroke="#dfbd78" stroke-width="6"/>';
  else if (id === "head-ribbon")
    body =
      '<path d="M36 39Q5 9 10 43q4 22 27 3 27 23 32-1 5-36-32-6" fill="#dc94af" stroke="#be708d" stroke-width="3"/><circle cx="39" cy="43" r="9" fill="#f7c7d6"/>';
  else if (id.startsWith("cape"))
    body = `<path d="M28 16q12-9 24 0l18 48q-30 15-60 0Z" fill="${id === "cape-night" ? "#646597" : "#70967a"}" stroke="#4d5c72" stroke-width="2"/><path d="m32 18 8 11 8-11" fill="#f4db95"/><path d="m41 42 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#e8d79a"/>`;
  else if (id.startsWith("dress"))
    body = `<path d="m24 17-13 20 13 9-5 23q21 8 43-1l-7-22 14-9-14-20-14 8Z" fill="${id === "dress-rose" ? "#da8e9f" : "#9787c5"}" stroke="#8d729f" stroke-width="2"/><path d="m27 20 14 15 12-15" fill="#fff1d2"/><path d="M24 47h33" stroke="#edc57c" stroke-width="6"/>`;
  else if (id === "wand-star")
    body =
      '<path d="m23 66 29-43" stroke="#aa855c" stroke-width="6" stroke-linecap="round"/><path d="m53 8 5 13 14 2-11 9 2 14-11-7-12 7 3-14-10-9 14-2Z" fill="#f3d073" stroke="#c5a051" stroke-width="2"/>';
  else if (id === "bag-adventure")
    body =
      '<path d="M27 27q0-24 26 0" fill="none" stroke="#a47149" stroke-width="5"/><rect x="17" y="23" width="47" height="48" rx="12" fill="#c78c5e"/><rect x="26" y="44" width="30" height="20" rx="6" fill="#e4b080"/><path d="M20 32h42" stroke="#f2c997" stroke-width="3"/>';
  else if (id.startsWith("roof"))
    body = `<path d="M17 42v26l23 9 24-13V38Z" fill="#e6d2ab"/><path d="m10 41 30-31 33 31-33 13Z" fill="${id === "roof-rose" ? "#c6889d" : "#9485be"}"/><path d="m40 10 33 31-33 13Z" fill="${id === "roof-rose" ? "#a66680" : "#71629a"}"/>`;
  else if (id === "castle-flags")
    body =
      '<path d="M24 71V10" stroke="#9c805b" stroke-width="5"/><path d="m26 12 40 10-11 13 11 13-40-8Z" fill="#e9c16b" stroke="#bb9652" stroke-width="2"/>';
  else if (id === "castle-garden")
    body =
      '<path d="M40 71V35" stroke="#a48b60" stroke-width="9"/><path d="M15 40q-10-27 14-29 20-14 31 7 22 25-3 36-26 12-42-14" fill="#779d80"/><circle cx="31" cy="30" r="6" fill="#efb2ba"/><circle cx="49" cy="44" r="6" fill="#efb2ba"/>';
  else
    body =
      '<ellipse cx="40" cy="65" rx="31" ry="12" fill="#dcd0ba" stroke="#b4a893" stroke-width="3"/><ellipse cx="40" cy="62" rx="23" ry="8" fill="#8ec5d0"/><path d="M40 62V25m-18 8q18 15 36 0" fill="none" stroke="#d8cbb5" stroke-width="6"/><path d="M40 27q-21-29-25 7m25-7q21-29 25 7" fill="none" stroke="#83bbc8" stroke-width="3"/>';
  return `<svg viewBox="0 0 80 80" class="item-art" aria-hidden="true">${body}</svg>`;
}
export function avatarSvg(rpg, label = "Ton aventurière") {
  const skin = skins[rpg.look.skin],
    hair = hairs[rpg.look.hair],
    e = rpg.equipped;
  const dress =
      e.dress === "dress-rose"
        ? "#df8b9d"
        : e.dress === "dress-lilac"
          ? "#9685cb"
          : "#4c9b91",
    cape = e.cape === "cape-night" ? "#54558c" : "#658765";
  return `<svg class="girl-avatar" viewBox="0 0 260 340" role="img" aria-label="${label}"><ellipse cx="133" cy="318" rx="65" ry="12" fill="#4f3b6420"/>${e.cape ? `<path d="M94 160Q62 195 61 286Q128 315 196 282L165 161Z" fill="${cape}" stroke="#ffffff55" stroke-width="3"/>${e.cape === "cape-night" ? '<g fill="#ffe7a6"><path d="m81 244 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z"/><circle cx="178" cy="271" r="3"/><circle cx="72" cy="274" r="3"/></g>' : ""}` : ""}<path d="M81 145Q55 77 96 46Q145 10 181 64Q207 101 176 168Z" fill="${hair}"/><path d="M97 238v53m57-53v53" stroke="${skin}" stroke-width="21" stroke-linecap="round"/><path d="M86 284h24v26H78q-6-14 8-26m56 0h24q18 10 10 26h-34Z" fill="#805b47"/><path d="M88 162Q69 181 60 221m103-58q25 20 31 58" fill="none" stroke="${skin}" stroke-width="17" stroke-linecap="round"/><path d="M94 158Q130 146 164 158L180 242Q129 261 78 242Z" fill="${dress}"/><path d="M97 159l29 29 34-29" fill="#fff3da"/><path d="M91 206h78" stroke="#dfb165" stroke-width="10"/><rect x="122" y="200" width="15" height="14" rx="3" fill="#fff0bd"/><path d="M97 218l-6 22m65-22 8 22" stroke="#ffffff35" stroke-width="3"/><path d="M118 140v19q11 14 24 0v-19" fill="${skin}"/><ellipse cx="130" cy="105" rx="47" ry="51" fill="${skin}"/><path d="M82 102Q71 45 125 40Q180 37 180 99Q154 85 145 64Q124 95 82 102" fill="${hair}"/><path d="M89 103q-10 10-9 27m91-27q11 12 8 28" fill="none" stroke="${hair}" stroke-width="13" stroke-linecap="round"/><g fill="#3d3034"><ellipse cx="112" cy="111" rx="4" ry="6"/><ellipse cx="151" cy="111" rx="4" ry="6"/></g><g fill="#fff"><circle cx="113" cy="109" r="1.4"/><circle cx="152" cy="109" r="1.4"/></g><ellipse cx="103" cy="127" rx="9" ry="5" fill="#df8e8a" opacity=".45"/><ellipse cx="158" cy="127" rx="9" ry="5" fill="#df8e8a" opacity=".45"/><path d="M122 132q9 9 18 0" fill="none" stroke="#a15853" stroke-width="3" stroke-linecap="round"/>${e.head === "head-hat" ? '<path d="m81 67 39-57 31 54 31 9q-51 28-111 0Z" fill="#6d79a6" stroke="#505d89" stroke-width="3"/><path d="m96 49 57 14" stroke="#e4be75" stroke-width="7"/>' : e.head === "head-crown" ? '<path d="m91 64-5-30 23 12 20-25 20 25 24-12-6 30Z" fill="#edc868" stroke="#bd8b37" stroke-width="3"/><path d="m130 39 6 9-6 9-6-9Z" fill="#8bbdac"/>' : e.head === "head-ribbon" ? '<path d="M166 65q-42-29-33 2 1 14 30 5 29 23 29-1 0-23-26-6" fill="#dc92ac"/><circle cx="164" cy="69" r="7" fill="#f7c3d3"/>' : ""}${e.hand === "wand-star" ? '<path d="m193 223 21-66" stroke="#b28a52" stroke-width="6"/><path d="m219 129 5 13 14 1-11 9 3 14-12-8-12 7 3-14-10-9 14-1Z" fill="#f8d878" stroke="#cca24b" stroke-width="2"/>' : e.hand === "bag-adventure" ? '<path d="M170 197q14-24 25 0" fill="none" stroke="#ae7346" stroke-width="5"/><rect x="165" y="194" width="36" height="47" rx="10" fill="#c98c59"/><rect x="173" y="215" width="21" height="18" rx="5" fill="#e6b174"/>' : ""}</svg>`;
}
export function castleSvg(rpg, id = "kingdom") {
  const c = rpg.castle,
    roof =
      c.roof === "roof-rose"
        ? "#ca8397"
        : c.roof === "roof-lilac"
          ? "#9381bd"
          : "#668fae",
    dark =
      c.roof === "roof-rose"
        ? "#a6657d"
        : c.roof === "roof-lilac"
          ? "#6d6099"
          : "#476c8a";
  const tower = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="125" rx="41" ry="15" fill="#544d6730"/><path d="M-34 0h68v119q-34 21-68 0Z" fill="#eddbba"/><path d="M10 0h24v119q-12 8-24 10Z" fill="#c6b28f"/><ellipse rx="34" ry="12" fill="#fff0d1"/><path d="m-43 0 43-76L43 0Q0 25-43 0" fill="${roof}"/><path d="M0-76 43 0Q21 12 11 12Z" fill="${dark}"/><path d="M-8 48q0-17 15-17v31H-8Z" fill="#657b88" stroke="#fff0d1" stroke-width="5"/><path d="M-22 89h13m13 14h16m-3-30h13" stroke="#bba88a" stroke-width="2"/>${c.flags ? '<path d="M0-76v-38l37 9-37 13" fill="#e9bd5e" stroke="#ac8152" stroke-width="2"/>' : ""}</g>`;
  return `<svg class="castle-art" viewBox="0 0 860 590" role="img" aria-label="Ton château personnalisable en perspective"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="#e8edf7"/><stop offset="1" stop-color="#f4eddc"/></linearGradient><linearGradient id="${id}-land" x2="0" y2="1"><stop stop-color="#bfd6a0"/><stop offset="1" stop-color="#89af87"/></linearGradient><filter id="${id}-shadow"><feGaussianBlur stdDeviation="12"/></filter></defs><rect width="860" height="590" rx="30" fill="url(#${id}-sky)"/><circle cx="709" cy="94" r="43" fill="#fff4cb"/><g fill="#fff" opacity=".6"><ellipse cx="164" cy="97" rx="71" ry="17"/><ellipse cx="198" cy="82" rx="39" ry="22"/><ellipse cx="605" cy="62" rx="55" ry="14"/></g><ellipse cx="438" cy="506" rx="275" ry="35" fill="#66817b33" filter="url(#${id}-shadow)"/><path d="M130 360Q430 190 744 351v52Q432 604 130 409Z" fill="#a5aa85"/><path d="M130 360Q430 190 744 351Q432 557 130 360" fill="url(#${id}-land)"/><path d="M163 396q270 154 544-10" fill="none" stroke="#d2d8ac" stroke-width="9"/><path d="M366 353Q443 383 542 437l-80 36Q405 402 322 378Z" fill="#e5cfaa"/><g fill="#4e725c" opacity=".18"><ellipse cx="422" cy="359" rx="169" ry="46"/></g><path d="M301 201 443 154 569 221v135l-142 58-126-71Z" fill="#eedfc0"/><path d="m443 154 126 67v135l-142 58V233Z" fill="#d2bc97"/><path d="M301 201 443 154 569 221 427 273Z" fill="#fff0ce"/><path d="m285 200 141-119 159 132-158 59Z" fill="${roof}"/><path d="m426 81 159 132-158 59Z" fill="${dark}"/><path d="M346 311v-39q0-26 26-32v61m93-6v-40q0-22 22-16v46m27 5v-40q0-22 22-16v46" fill="#728890" stroke="#fff1d0" stroke-width="6"/>${tower(285, 244, 0.9)}${tower(577, 270, 1)}${tower(424, 169, 0.85)}<path d="M391 395v-57q13-28 43-21v62Z" fill="#8d6b57" stroke="#c6af88" stroke-width="7"/><path d="M411 329v56" stroke="#b18b62" stroke-width="3"/><circle cx="424" cy="359" r="3" fill="#efd17f"/><g stroke="#819b70" stroke-width="4" fill="#779d76"><path d="M214 369v-57m-27 20q-5-52 30-52 37 6 24 46-18 27-54 6M669 360v-56m-29 14q-4-55 30-52 36 3 28 49-24 31-58 3"/></g>${c.garden ? '<g fill="#668e71"><ellipse cx="255" cy="417" rx="35" ry="40"/><ellipse cx="616" cy="409" rx="35" ry="43"/></g><g fill="#e8a6ae"><circle cx="243" cy="405" r="8"/><circle cx="268" cy="426" r="9"/><circle cx="605" cy="398" r="8"/><circle cx="628" cy="421" r="8"/></g>' : ""}${c.fountain ? '<ellipse cx="470" cy="447" rx="48" ry="21" fill="#e9dfcb" stroke="#bdb39e" stroke-width="5"/><ellipse cx="470" cy="444" rx="35" ry="13" fill="#85c7d1"/><path d="M470 445v-43m-24 8q24 22 48 0" fill="none" stroke="#ede1c7" stroke-width="8"/><path d="M470 402q-24-30-28 3m28-3q24-30 28 3" fill="none" stroke="#91cbd4" stroke-width="3"/>' : ""}<g fill="#f7e1a1"><circle cx="191" cy="367" r="4"/><circle cx="315" cy="437" r="5"/><circle cx="580" cy="434" r="4"/></g></svg>`;
}
