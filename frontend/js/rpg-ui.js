import { skills, items } from "./content.js";
import { missing } from "./core.js";
import {
  shop,
  preview,
  itemArt,
  avatarSvg,
  petIcon,
  castleSvg,
  roomSvg,
  groupOf,
  skins,
  hairs,
  styles,
} from "./rpg.js";
import { subjects } from "./lessons.js";
import { reviewQueue, dailyAvailable, newStickers, exportDue } from "./extras.js";
import { storyTeaser } from "./story-ui.js";
const esc = (x) =>
  String(x).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const btn = (label, action, cls = "", extra = "") =>
  `<button data-action="${action}" class="${cls}" ${extra}>${label}</button>`;
// Petites invitations facultatives sous le royaume : jamais de série à tenir ni de perte.
function homeExtras(state) {
  const due = reviewQueue(state).length,
    daily = !state.session && dailyAvailable(state),
    fresh = newStickers(state).length,
    cards = [];
  if (daily)
    cards.push(
      btn("<span>☀️</span><strong>Le défi du jour</strong><small>3 petits défis, une fois par jour</small>", "daily", "extra-card"),
    );
  if (due && !state.session)
    cards.push(
      btn(`<span>🦄</span><strong>Luna te repose une question</strong><small>${due} notion${due > 1 ? "s" : ""} à retrouver</small>`, "review", "extra-card"),
    );
  cards.push(
    btn(`<span>⭐</span><strong>Mon album</strong><small>${fresh ? `${fresh} nouveau${fresh > 1 ? "x" : ""} !` : "Mes autocollants"}</small>`, "album", `extra-card ${fresh ? "has-new" : ""}`),
  );
  const backup = exportDue(state)
    ? `<div class="backup-note" role="note"><span>💾 Pense à garder une copie de la progression (un adulte peut le faire).</span>${btn("Exporter", "export", "small secondary")}${btn("Plus tard", "export-later", "small quiet")}</div>`
    : "";
  return `<section class="home-extras" aria-label="Invitations du jour">${cards.join("")}</section>${backup}`;
}
export function homeView(state) {
  return `<main class="rpg-home"><div class="rpg-welcome"><div><p class="eyebrow">TON HISTOIRE COMMENCE ICI</p><h1>Bienvenue dans ton royaume,<br><em>${esc(state.name)}.</em></h1><p>Un petit défi. Un nouveau pouvoir. Un monde à toi.</p></div><span class="level-badge">✦ ${state.completed.length} aventure${state.completed.length > 1 ? "s" : ""}<small>À ton rythme, toujours.</small></span></div><div class="rpg-hero"><section class="rpg-world" aria-label="Ton royaume personnalisable">${castleSvg(state.rpg, "home")}<div class="island-label">✦ LE DOMAINE DES LUCIOLES</div>${btn("🏰 Décorer mon château", "castle", "island-link castle-link")}${btn("🌱 Mon jardin", "garden", "island-link garden-link")}<button class="hero-girl" data-action="avatar" aria-label="Habiller mon aventurière">${avatarSvg(state.rpg, "Ton aventurière", { pet: state.pet })}</button><div class="world-caption">Ton royaume grandit avec tes découvertes.</div></section><aside class="quest-aside"><div class="quest-luna">🦄 <span>LUNA<small>Ta compagne d’aventure</small></span></div><h2>Où partons-nous <br>aujourd’hui ?</h2><p>Des nombres à explorer, des mots à apprivoiser… Choisis ton prochain petit pouvoir.</p>${btn("Choisir ma mission →", "missions", "primary mission-choice")}${state.session ? btn("Reprendre ma mission →", "resume", "secondary") : btn("Laisser Luna choisir", "start", "quiet")}<div class="daily-reward"><span>🪙</span><div><strong>10 pièces par mission</strong><small>Pour choisir tes trésors à la boutique.</small></div></div></aside></div>${homeExtras(state)}<nav class="rpg-shortcuts" aria-label="Les lieux de ton royaume">${[
    ["🗺️", "Mes missions", "Une matière, un petit pouvoir", "missions"],
    ["🎀", "Mon aventurière", "Tenues, coiffure et accessoires", "avatar"],
    ["🏰", "Mon château", "Des détails qui changent tout", "castle"],
    ["🛏️", "Ma chambre", "Un coin à moi, plein d’objets", "room"],
    ["🎁", "Mes trésors", "Les souvenirs de mes voyages", "collection"],
  ]
    .map(([icon, title, text, action]) =>
      btn(
        `<span class="shortcut-icon">${icon}</span><span><strong>${title}</strong><small>${text}</small></span><span class="shortcut-arrow">↗</span>`,
        action,
      ),
    )
    .join(
      "",
    )}</nav>${storyTeaser(state)}</main>`;
}
export function pickerView(state, subject) {
  const info = subjects.find((s) => s.name === subject) || subjects[0];
  return `<p class="sub">Choisis ta matière, puis le petit pouvoir que tu veux travailler.</p><div class="subject-tabs" role="group" aria-label="Matières">${subjects.map((s) => btn(`<span>${s.icon}</span><strong>${s.name}</strong>`, "subject", `subject-tab ${s.className} ${s.name === subject ? "active" : ""}`, `data-subject="${s.name}" aria-pressed="${s.name === subject}"`)).join("")}</div><div class="subject-heading ${info.className}"><p class="eyebrow">${info.name}</p><h2>${info.title}</h2><p>${info.text}</p></div>${state.session ? `<div class="notice">Une mission est en pause. Tu peux regarder les leçons ; reprends ta mission avant d’en commencer une autre. ${btn("Reprendre", "resume", "small")} ${btn("Ranger cette mission", "park-session", "quiet small")}</div>` : ""}<div class="course-grid">${skills
    .filter((s) => s.subject === subject)
    .map((s) => {
      const p = state.skills[s.id],
        pre = p.status === "seen" ? [] : missing(state, s.id);
      return `<article class="course-card"><div class="course-icon">${s.icon}</div><span class="course-tag">${p.status === "seen" ? "Déjà exploré" : "À découvrir"}</span><h3>${s.name}</h3><p>${pre.length ? "Un pouvoir à préparer avant cette découverte." : "Une petite leçon à toucher, puis des défis à essayer."}</p>${btn(pre.length ? "Voir le chemin →" : "Ouvrir la leçon →", "lesson", "secondary", `data-id="${s.id}"`)}</article>`;
    })
    .join(
      "",
    )}</div><p class="sub catalog-note">Le catalogue s’enrichit progressivement. Ces missions couvrent une partie du programme du CE1.</p>`;
}
// Les objets sont présentés par emplacement, dans l'ordre où on s'habille.
const SLOT_GROUPS = {
  avatar: [
    ["head", "Sur la tête"],
    ["face", "Visage"],
    ["neck", "Autour du cou"],
    ["back", "Dans le dos"],
    ["cape", "Capes"],
    ["dress", "Tenues"],
    ["feet", "Chaussures"],
    ["hand", "Dans la main"],
  ],
  room: [
    ["wall", "Murs"],
    ["floor", "Sol"],
    ["bed", "Lit"],
    ["rug", "Tapis"],
    ["window", "Fenêtre"],
    ["lamp", "Lumières"],
    ["shelf", "Étagères"],
    ["desk", "Bureau"],
    ["toy", "Jouets"],
    ["deco", "Au mur"],
    ["plant", "Plantes"],
  ],
  castle: [
    ["roof", "Toits"],
    ["flags", "Bannières"],
    ["garden", "Jardin"],
    ["fountain", "Fontaine"],
    ["sky", "Dans le ciel"],
    ["ground", "Autour du château"],
  ],
};
function petCard(state, pet) {
  const own = state.inventory.includes(pet.id),
    worn = state.pet === pet.id;
  return `<div class="purchase-card"><h2>${pet.name}</h2><p>${own ? (worn ? "Il te suit partout dans ton royaume." : "Il est à toi : il t’attend dans ta collection.") : pet.price ? `${pet.price} pièces pour l’adopter.` : "Un cadeau de mission : il t’attend au bout d’une aventure."}</p>${own ? (worn ? btn("Le laisser se reposer", "pet-unequip", "secondary", `data-id="${pet.id}"`) : btn("✓ Le prendre avec moi", "pet-equip", "primary", `data-id="${pet.id}"`)) : pet.price ? btn(state.rpg.coins >= pet.price ? `Adopter · ${pet.price} 🪙` : `Il manque ${pet.price - state.rpg.coins} pièces`, "pet-adopt", "primary", `data-id="${pet.id}" ${state.rpg.coins < pet.price ? "disabled" : ""}`) : ""} ${btn("Fermer l’aperçu", "preview-clear", "quiet small")}</div>`;
}
function companionShelf(state, selected) {
  return `<section class="shop-group companions" aria-label="Compagnons"><h3>Compagnons</h3><div class="shop-grid">${items
    .filter((i) => i.kind === "pet")
    .map((i) => {
      const own = state.inventory.includes(i.id);
      return btn(
        `<span class="shop-item-art">${petIcon(i.id)}</span><strong>${i.name}</strong><small>${state.pet === i.id ? "✓ Avec toi" : own ? "Dans ta collection" : i.price ? i.price + " 🪙" : "Cadeau de mission"}</small>`,
        "rpg-preview",
        `shop-tile ${selected === i.id ? "selected" : ""} ${own || i.price ? "" : "locked"}`,
        `data-id="${i.id}"`,
      );
    })
    .join("")}</div></section>`;
}
// Le soir (19 h – 7 h), la chambre s'assombrit et la lampe s'allume.
const nightNow = () => {
  const h = new Date().getHours();
  return h >= 19 || h < 7;
};
export function customizationView(state, kind, selected) {
  const chosenPet =
      kind === "avatar" ? items.find((i) => i.id === selected && i.kind === "pet") : null,
    chosen = shop.find((i) => i.id === selected && i.kind === kind),
    r = chosen ? preview(state.rpg, chosen.id) : state.rpg;
  return `<div class="studio"><section class="studio-stage ${kind === "avatar" ? "dressing-stage" : kind === "room" ? "room-stage" : "castle-stage"}"><div class="studio-label">${chosenPet ? "APERÇU · " + chosenPet.name : chosen ? "APERÇU · " + chosen.name : kind === "avatar" ? "TON AVENTURIÈRE, TON UNIVERS" : kind === "room" ? "TA CHAMBRE, TON COIN À TOI" : "TON CHÂTEAU, TON UNIVERS"}</div>${kind === "avatar" ? avatarSvg(r, "Ton aventurière", { pet: chosenPet ? chosenPet.id : state.pet }) : kind === "room" ? roomSvg(r, "Ta chambre", { pet: state.pet, night: nightNow() }) : castleSvg(r, "studio")}<div class="studio-caption">${chosen ? "Essaie librement. Tes pièces ne sont dépensées que si tu achètes." : (kind === "room" ? "Ta chambre est gardée d’une visite à l’autre." : "Les objets équipés apparaissent aussi dans ton royaume.")}</div></section><section class="studio-controls"><div class="wallet"><span>🪙 ${state.rpg.coins} pièces</span><small>Gagnées dans tes missions · aucun achat réel</small></div>${chosenPet ? petCard(state, chosenPet) : chosen ? `<div class="purchase-card"><h2>${chosen.name}</h2><p>${state.rpg.owned.includes(chosen.id) ? ((state.rpg[groupOf(kind)] || {})[chosen.slot] === chosen.id ? "Tu le portes en ce moment." : "Cet objet est à toi.") : `${chosen.price} pièces pour l’ajouter à ta collection.`}</p>${state.rpg.owned.includes(chosen.id) ? ((state.rpg[groupOf(kind)] || {})[chosen.slot] === chosen.id ? btn("Retirer cet objet", "rpg-unequip", "secondary", `data-id="${chosen.id}"`) : btn("✓ Équiper", "rpg-equip", "primary", `data-id="${chosen.id}"`)) : btn(state.rpg.coins >= chosen.price ? `Acheter · ${chosen.price} 🪙` : `Il manque ${chosen.price - state.rpg.coins} pièces`, "rpg-buy", "primary", `data-id="${chosen.id}" ${state.rpg.coins < chosen.price ? "disabled" : ""}`)} ${btn("Fermer l’aperçu", "preview-clear", "quiet small")}</div>` : `<h2>${kind === "avatar" ? "Le dressing de l’aventurière" : kind === "room" ? "Ma chambre" : "L’atelier du château"}</h2><p>Touche un objet pour le voir sur ${kind === "avatar" ? "ton personnage" : kind === "room" ? "dans ta chambre" : "ton château"}.</p>`}${kind === "avatar" ? `<div class="appearance"><h3>Mon apparence</h3><p class="appearance-label" id="lbl-skin">Teint</p><div class="swatches" role="group" aria-labelledby="lbl-skin">${skins.map((c, i) => btn(`<span style="background:${c}"></span>`, "look", state.rpg.look.skin === i ? "selected" : "", `data-part="skin" data-index="${i}" aria-label="Teint ${i + 1}" aria-pressed="${state.rpg.look.skin === i}"`)).join("")}</div><p class="appearance-label" id="lbl-hair">Couleur des cheveux</p><div class="swatches" role="group" aria-labelledby="lbl-hair">${hairs.map((c, i) => btn(`<span style="background:${c}"></span>`, "look", state.rpg.look.hair === i ? "selected" : "", `data-part="hair" data-index="${i}" aria-label="Cheveux ${i + 1}" aria-pressed="${state.rpg.look.hair === i}"`)).join("")}</div><p class="appearance-label" id="lbl-style">Coiffure</p><div class="styles" role="group" aria-labelledby="lbl-style">${styles.map((st) => btn(st.name, "look", `style-choice ${(state.rpg.look.style ?? 0) === st.id ? "selected" : ""}`, `data-part="style" data-index="${st.id}" aria-pressed="${(state.rpg.look.style ?? 0) === st.id}"`)).join("")}</div></div>` : ""}${btn(kind === "avatar" ? "Remettre ma tenue de départ" : kind === "room" ? "Vider ma chambre" : "Revenir au château de départ", "rpg-reset", "quiet small", `data-kind="${kind}"`)}<p class="sub">Tous tes objets restent dans ta collection.</p></section></div><h2 class="shop-heading">${kind === "avatar" ? "La boutique des accessoires" : kind === "room" ? "Les objets de la chambre" : "Les décorations du royaume"}</h2>${SLOT_GROUPS[kind]
    .map(([slot, title]) => {
      const list = shop.filter((i) => i.kind === kind && i.slot === slot);
      return `<section class="shop-group" aria-label="${title}"><h3>${title}</h3><div class="shop-grid">${list
        .map((i) => {
          const owned = state.rpg.owned.includes(i.id),
            equipped = (state.rpg[groupOf(kind)] || {})[i.slot] === i.id;
          return btn(
            `<span class="shop-item-art">${itemArt(i.id)}</span><strong>${i.name}</strong><small>${equipped ? "✓ Équipé" : owned ? "Dans ta collection" : i.price + " 🪙"}</small>`,
            "rpg-preview",
            `shop-tile ${selected === i.id ? "selected" : ""}`,
            `data-id="${i.id}"`,
          );
        })
        .join("")}</div></section>`;
    })
    .join("")}${kind === "avatar" ? companionShelf(state, selected) : ""}`;
}
