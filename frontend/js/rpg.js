import {
  skins,
  hairs,
  styles,
  avatarSvg,
  avatarItemArt,
  petIcon,
} from "./avatar-art.js";
import {
  roofColors,
  defaultRoof,
  castleExtraFragment,
  castleExtraIcon,
} from "./castle-art.js";
import { roomItems, roomItemArt, roomSvg, roomSlots } from "./room-art.js";
export { skins, hairs, styles, avatarSvg, petIcon, roomSvg, roomSlots };
// Groupe de l'état qui porte les objets équipés selon le type d'objet.
export const groupOf = (kind) =>
  kind === "avatar" ? "equipped" : kind === "room" ? "room" : "castle";
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
    id: "head-flowers",
    slot: "head",
    name: "Couronne de fleurs",
    icon: "🌼",
    price: 10,
    kind: "avatar",
    value: "flowers",
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
    id: "dress-sun",
    slot: "dress",
    name: "Robe du soleil",
    icon: "🌞",
    price: 16,
    kind: "avatar",
    value: "sun",
  },
  {
    id: "boots-trail",
    slot: "feet",
    name: "Bottines de sentier",
    icon: "🥾",
    price: 10,
    kind: "avatar",
    value: "trail",
  },
  {
    id: "shoes-star",
    slot: "feet",
    name: "Chaussons étoilés",
    icon: "👟",
    price: 14,
    kind: "avatar",
    value: "star",
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
    id: "lantern-glow",
    slot: "hand",
    name: "Lanterne des lucioles",
    icon: "🏮",
    price: 14,
    kind: "avatar",
    value: "lantern",
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
  {
    id: "head-catears",
    slot: "head",
    name: "Serre-tête chaton",
    icon: "🐱",
    price: 10,
    kind: "avatar",
    value: "catears",
  },
  {
    id: "head-bunnyears",
    slot: "head",
    name: "Oreilles de lapin",
    icon: "🐰",
    price: 12,
    kind: "avatar",
    value: "bunnyears",
  },
  {
    id: "head-beanie",
    slot: "head",
    name: "Bonnet à pompon",
    icon: "🧶",
    price: 12,
    kind: "avatar",
    value: "beanie",
  },
  {
    id: "head-beret",
    slot: "head",
    name: "Béret d’artiste",
    icon: "🎨",
    price: 12,
    kind: "avatar",
    value: "beret",
  },
  {
    id: "head-tiara",
    slot: "head",
    name: "Diadème de cristal",
    icon: "💎",
    price: 22,
    kind: "avatar",
    value: "tiara",
  },
  {
    id: "head-sunhat",
    slot: "head",
    name: "Chapeau de paille",
    icon: "👒",
    price: 14,
    kind: "avatar",
    value: "sunhat",
  },
  {
    id: "face-glasses",
    slot: "face",
    name: "Lunettes rondes",
    icon: "👓",
    price: 10,
    kind: "avatar",
    value: "glasses",
  },
  {
    id: "face-heartglasses",
    slot: "face",
    name: "Lunettes cœur",
    icon: "💗",
    price: 12,
    kind: "avatar",
    value: "heartglasses",
  },
  {
    id: "face-stars",
    slot: "face",
    name: "Étoiles de fête",
    icon: "✨",
    price: 8,
    kind: "avatar",
    value: "stars",
  },
  {
    id: "face-mask",
    slot: "face",
    name: "Masque de fée",
    icon: "🎭",
    price: 14,
    kind: "avatar",
    value: "mask",
  },
  {
    id: "neck-scarf",
    slot: "neck",
    name: "Écharpe rayée",
    icon: "🧣",
    price: 12,
    kind: "avatar",
    value: "scarf",
  },
  {
    id: "neck-star",
    slot: "neck",
    name: "Collier d’étoile",
    icon: "⭐",
    price: 12,
    kind: "avatar",
    value: "star",
  },
  {
    id: "neck-pearls",
    slot: "neck",
    name: "Collier de perles",
    icon: "🦪",
    price: 16,
    kind: "avatar",
    value: "pearls",
  },
  {
    id: "neck-medal",
    slot: "neck",
    name: "Médaille d’exploratrice",
    icon: "🏅",
    price: 14,
    kind: "avatar",
    value: "medal",
  },
  {
    id: "neck-bow",
    slot: "neck",
    name: "Nœud papillon",
    icon: "🎀",
    price: 8,
    kind: "avatar",
    value: "bow",
  },
  {
    id: "back-fairy",
    slot: "back",
    name: "Ailes de fée",
    icon: "🧚",
    price: 30,
    kind: "avatar",
    value: "fairy",
  },
  {
    id: "back-butterfly",
    slot: "back",
    name: "Ailes de papillon",
    icon: "🦋",
    price: 34,
    kind: "avatar",
    value: "butterfly",
  },
  {
    id: "back-dragon",
    slot: "back",
    name: "Ailes de dragon",
    icon: "🐉",
    price: 28,
    kind: "avatar",
    value: "dragon",
  },
  {
    id: "cape-royal",
    slot: "cape",
    name: "Cape royale",
    icon: "👑",
    price: 26,
    kind: "avatar",
    value: "royal",
  },
  {
    id: "cape-rain",
    slot: "cape",
    name: "Ciré jaune",
    icon: "☔",
    price: 14,
    kind: "avatar",
    value: "rain",
  },
  {
    id: "dress-ocean",
    slot: "dress",
    name: "Robe océan",
    icon: "🌊",
    price: 15,
    kind: "avatar",
    value: "ocean",
  },
  {
    id: "dress-night",
    slot: "dress",
    name: "Robe nuit étoilée",
    icon: "🌙",
    price: 18,
    kind: "avatar",
    value: "night",
  },
  {
    id: "dress-berry",
    slot: "dress",
    name: "Robe cerise",
    icon: "🍒",
    price: 14,
    kind: "avatar",
    value: "berry",
  },
  {
    id: "dress-meadow",
    slot: "dress",
    name: "Robe des prés",
    icon: "🌼",
    price: 15,
    kind: "avatar",
    value: "meadow",
  },
  {
    id: "boots-rain",
    slot: "feet",
    name: "Bottes de pluie",
    icon: "🥾",
    price: 12,
    kind: "avatar",
    value: "rain",
  },
  {
    id: "shoes-sneakers",
    slot: "feet",
    name: "Baskets arc-en-ciel",
    icon: "👟",
    price: 14,
    kind: "avatar",
    value: "sneakers",
  },
  {
    id: "shoes-ballet",
    slot: "feet",
    name: "Ballerines roses",
    icon: "🩰",
    price: 10,
    kind: "avatar",
    value: "ballet",
  },
  {
    id: "hand-balloon",
    slot: "hand",
    name: "Ballon rouge",
    icon: "🎈",
    price: 8,
    kind: "avatar",
    value: "balloon",
  },
  {
    id: "hand-bouquet",
    slot: "hand",
    name: "Bouquet de fleurs",
    icon: "💐",
    price: 12,
    kind: "avatar",
    value: "bouquet",
  },
  {
    id: "hand-book",
    slot: "hand",
    name: "Livre magique",
    icon: "📖",
    price: 14,
    kind: "avatar",
    value: "book",
  },
  {
    id: "hand-umbrella",
    slot: "hand",
    name: "Parapluie bleu",
    icon: "🌂",
    price: 14,
    kind: "avatar",
    value: "umbrella",
  },
  {
    id: "roof-gold",
    slot: "roof",
    name: "Toits dorés",
    icon: "✨",
    price: 36,
    kind: "castle",
    value: "gold",
  },
  {
    id: "roof-emerald",
    slot: "roof",
    name: "Toits d’émeraude",
    icon: "💚",
    price: 36,
    kind: "castle",
    value: "emerald",
  },
  {
    id: "sky-rainbow",
    slot: "sky",
    name: "Arc-en-ciel",
    icon: "🌈",
    price: 28,
    kind: "castle",
    value: "rainbow",
  },
  {
    id: "sky-balloon",
    slot: "sky",
    name: "Montgolfière",
    icon: "🎈",
    price: 30,
    kind: "castle",
    value: "balloon",
  },
  {
    id: "sky-aurora",
    slot: "sky",
    name: "Aurore des lucioles",
    icon: "🌌",
    price: 34,
    kind: "castle",
    value: "aurora",
  },
  {
    id: "ground-windmill",
    slot: "ground",
    name: "Moulin du royaume",
    icon: "🌾",
    price: 40,
    kind: "castle",
    value: "windmill",
  },
  {
    id: "ground-village",
    slot: "ground",
    name: "Petit village",
    icon: "🏘️",
    price: 48,
    kind: "castle",
    value: "village",
  },
  {
    id: "ground-tent",
    slot: "ground",
    name: "Tente de fête",
    icon: "🎪",
    price: 55,
    kind: "castle",
    value: "tent",
  },
];
const ROOM_DATA = {
  "wall-rose": ["Murs rose pâle", 8],
  "wall-sky": ["Murs ciel", 8],
  "wall-mint": ["Murs menthe", 8],
  "wall-lilac": ["Murs lilas", 8],
  "wall-stripes": ["Murs rayés", 14],
  "wall-clouds": ["Murs nuages", 16],
  "wall-forest": ["Murs forêt", 16],
  "wall-stars": ["Murs étoilés", 20],
  "floor-pale": ["Parquet clair", 8],
  "floor-checker": ["Carreaux roses", 14],
  "floor-blue": ["Moquette bleue", 14],
  "floor-meadow": ["Sol prairie", 20],
  "bed-flower": ["Lit fleuri", 18],
  "bed-star": ["Lit des étoiles", 22],
  "bed-cloud": ["Lit nuage", 28],
  "bed-hut": ["Lit cabane", 34],
  "bed-princess": ["Lit de princesse", 45],
  "rug-round": ["Tapis rond rose", 8],
  "rug-clover": ["Tapis trèfle", 12],
  "rug-star": ["Tapis étoile", 16],
  "rug-rainbow": ["Tapis arc-en-ciel", 22],
  "window-pink": ["Rideaux roses", 10],
  "window-garden": ["Fenêtre sur le jardin", 14],
  "window-rainbow": ["Fenêtre arc-en-ciel", 18],
  "window-snow": ["Fenêtre de Noël", 18],
  "window-night": ["Fenêtre de nuit", 20],
  "lamp-mushroom": ["Lampe champignon", 10],
  "lamp-lantern": ["Lanterne", 12],
  "lamp-moon": ["Lampe lune", 16],
  "lamp-stars": ["Guirlande d’étoiles", 22],
  "shelf-books": ["Étagère à livres", 12],
  "shelf-plants": ["Étagère fleurie", 14],
  "shelf-toys": ["Étagère à jouets", 16],
  "desk-study": ["Bureau d’étude", 16],
  "desk-easel": ["Chevalet de peintre", 24],
  "desk-vanity": ["Coiffeuse", 30],
  "toy-blocks": ["Cubes en bois", 8],
  "toy-teddy": ["Gros nounours", 14],
  "toy-train": ["Petit train", 18],
  "toy-horse": ["Cheval à bascule", 24],
  "toy-dollhouse": ["Maison de poupée", 32],
  "deco-garland": ["Guirlande de fanions", 8],
  "deco-clock": ["Horloge", 10],
  "deco-mirror": ["Miroir doré", 14],
  "deco-poster-castle": ["Affiche du château", 12],
  "deco-poster-unicorn": ["Affiche licorne", 12],
  "plant-cactus": ["Petit cactus", 8],
  "plant-flowers": ["Pot de fleurs", 10],
  "plant-tall": ["Grande plante", 14],
};
for (const id of roomItems)
  shop.push({
    id,
    slot: id.split("-")[0],
    name: ROOM_DATA[id][0],
    icon: "🛏️",
    price: ROOM_DATA[id][1],
    kind: "room",
    value: id,
  });
export const defaultRoom = () =>
  Object.fromEntries(roomSlots.map((s) => [s, null]));
export function defaultRpg(coins = 0) {
  return {
    coins,
    owned: [],
    look: { skin: 0, hair: 0, style: 0 },
    equipped: {
      head: null,
      face: null,
      neck: null,
      back: null,
      cape: null,
      dress: null,
      feet: null,
      hand: null,
    },
    castle: {
      roof: null,
      flags: null,
      garden: null,
      fountain: null,
      sky: null,
      ground: null,
    },
    room: defaultRoom(),
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
    ![0, 1, 2, 3].includes(r.look.hair) ||
    // Coiffure : absente des sauvegardes antérieures (équivaut à 0).
    !(r.look.style === undefined || styles.some((s) => s.id === r.look.style))
  )
    return false;
  for (const [group, kind, slots] of [
    ["equipped", "avatar", ["head", "face", "neck", "back", "cape", "dress", "feet", "hand"]],
    ["castle", "castle", ["roof", "flags", "garden", "fountain", "sky", "ground"]],
  ]) {
    if (!r[group]) return false;
    for (const slot of slots) {
      const id = r[group][slot];
      // Emplacements ajoutés après coup (chaussures, ciel, alentours) : absents
      // des sauvegardes antérieures, ce qui équivaut à vide.
      if (id === undefined && ["feet", "face", "neck", "back", "sky", "ground"].includes(slot))
        continue;
      if (
        id !== null &&
        (!r.owned.includes(id) ||
          !shop.some((i) => i.id === id && i.kind === kind && i.slot === slot))
      )
        return false;
    }
  }
  // Chambre : absente des sauvegardes antérieures (équivaut à vide).
  if (r.room !== undefined) {
    if (!r.room || typeof r.room !== "object") return false;
    for (const slot of roomSlots) {
      const id = r.room[slot];
      if (id === undefined || id === null) continue;
      if (!r.owned.includes(id) || !shop.some((i) => i.id === id && i.kind === "room" && i.slot === slot))
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
  (state.rpg[groupOf(i.kind)] ??= defaultRoom())[i.slot] = id;
  return true;
}
export function unequip(state, id) {
  const i = shop.find((i) => i.id === id);
  if (!i) return false;
  const group = state.rpg[groupOf(i.kind)] || {};
  if (group[i.slot] !== id) return false;
  group[i.slot] = null;
  return true;
}
export function preview(rpg, id) {
  const r = structuredClone(rpg),
    i = shop.find((i) => i.id === id);
  if (i) (r[groupOf(i.kind)] ??= defaultRoom())[i.slot] = id;
  return r;
}
export function itemArt(id) {
  const worn = avatarItemArt(id) || castleExtraIcon(id) || roomItemArt(id);
  if (worn) return worn;
  let body = "";
  if (id.startsWith("roof"))
    body = `<path d="M17 42v26l23 9 24-13V38Z" fill="#e6d2ab"/><path d="m10 41 30-31 33 31-33 13Z" fill="${(roofColors[id] || defaultRoof)[0]}"/><path d="m40 10 33 31-33 13Z" fill="${(roofColors[id] || defaultRoof)[1]}"/>`;
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
export function castleSvg(rpg, id = "kingdom") {
  const c = rpg.castle,
    [roof, dark] = roofColors[c.roof] || defaultRoof,
    sky = castleExtraFragment(c.sky),
    ground = castleExtraFragment(c.ground);
  const tower = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="125" rx="41" ry="15" fill="#544d6730"/><path d="M-34 0h68v119q-34 21-68 0Z" fill="#eddbba"/><path d="M10 0h24v119q-12 8-24 10Z" fill="#c6b28f"/><ellipse rx="34" ry="12" fill="#fff0d1"/><path d="m-43 0 43-76L43 0Q0 25-43 0" fill="${roof}"/><path d="M0-76 43 0Q21 12 11 12Z" fill="${dark}"/><path d="M-8 48q0-17 15-17v31H-8Z" fill="#657b88" stroke="#fff0d1" stroke-width="5"/><path d="M-22 89h13m13 14h16m-3-30h13" stroke="#bba88a" stroke-width="2"/>${c.flags ? '<path d="M0-76v-38l37 9-37 13" fill="#e9bd5e" stroke="#ac8152" stroke-width="2"/>' : ""}</g>`;
  return `<svg class="castle-art" viewBox="0 0 860 590" role="img" aria-label="Ton château personnalisable en perspective"><defs><linearGradient id="${id}-sky" x2="0" y2="1"><stop stop-color="#e8edf7"/><stop offset="1" stop-color="#f4eddc"/></linearGradient><linearGradient id="${id}-land" x2="0" y2="1"><stop stop-color="#bfd6a0"/><stop offset="1" stop-color="#89af87"/></linearGradient><filter id="${id}-shadow"><feGaussianBlur stdDeviation="12"/></filter></defs><rect width="860" height="590" rx="30" fill="url(#${id}-sky)"/><circle cx="709" cy="94" r="43" fill="#fff4cb"/><g fill="#fff" opacity=".6"><ellipse cx="164" cy="97" rx="71" ry="17"/><ellipse cx="198" cy="82" rx="39" ry="22"/><ellipse cx="605" cy="62" rx="55" ry="14"/></g>${sky}<ellipse cx="438" cy="506" rx="275" ry="35" fill="#66817b33" filter="url(#${id}-shadow)"/><path d="M130 360Q430 190 744 351v52Q432 604 130 409Z" fill="#a5aa85"/><path d="M130 360Q430 190 744 351Q432 557 130 360" fill="url(#${id}-land)"/><path d="M163 396q270 154 544-10" fill="none" stroke="#d2d8ac" stroke-width="9"/><path d="M366 353Q443 383 542 437l-80 36Q405 402 322 378Z" fill="#e5cfaa"/><g fill="#4e725c" opacity=".18"><ellipse cx="422" cy="359" rx="169" ry="46"/></g>${ground}<path d="M301 201 443 154 569 221v135l-142 58-126-71Z" fill="#eedfc0"/><path d="m443 154 126 67v135l-142 58V233Z" fill="#d2bc97"/><path d="M301 201 443 154 569 221 427 273Z" fill="#fff0ce"/><path d="m285 200 141-119 159 132-158 59Z" fill="${roof}"/><path d="m426 81 159 132-158 59Z" fill="${dark}"/><path d="M346 311v-39q0-26 26-32v61m93-6v-40q0-22 22-16v46m27 5v-40q0-22 22-16v46" fill="#728890" stroke="#fff1d0" stroke-width="6"/>${tower(285, 244, 0.9)}${tower(577, 270, 1)}${tower(424, 169, 0.85)}<path d="M391 395v-57q13-28 43-21v62Z" fill="#8d6b57" stroke="#c6af88" stroke-width="7"/><path d="M411 329v56" stroke="#b18b62" stroke-width="3"/><circle cx="424" cy="359" r="3" fill="#efd17f"/><g stroke="#819b70" stroke-width="4" fill="#779d76"><path d="M214 369v-57m-27 20q-5-52 30-52 37 6 24 46-18 27-54 6M669 360v-56m-29 14q-4-55 30-52 36 3 28 49-24 31-58 3"/></g>${c.garden ? '<g fill="#668e71"><ellipse cx="255" cy="417" rx="35" ry="40"/><ellipse cx="616" cy="409" rx="35" ry="43"/></g><g fill="#e8a6ae"><circle cx="243" cy="405" r="8"/><circle cx="268" cy="426" r="9"/><circle cx="605" cy="398" r="8"/><circle cx="628" cy="421" r="8"/></g>' : ""}${c.fountain ? '<ellipse cx="470" cy="447" rx="48" ry="21" fill="#e9dfcb" stroke="#bdb39e" stroke-width="5"/><ellipse cx="470" cy="444" rx="35" ry="13" fill="#85c7d1"/><path d="M470 445v-43m-24 8q24 22 48 0" fill="none" stroke="#ede1c7" stroke-width="8"/><path d="M470 402q-24-30-28 3m28-3q24-30 28 3" fill="none" stroke="#91cbd4" stroke-width="3"/>' : ""}<g fill="#f7e1a1"><circle cx="191" cy="367" r="4"/><circle cx="315" cy="437" r="5"/><circle cx="580" cy="434" r="4"/></g></svg>`;
}
