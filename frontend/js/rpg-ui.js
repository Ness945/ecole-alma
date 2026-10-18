import { skills, items } from "./content.js";
import { missing } from "./core.js";
import {
  shop,
  preview,
  itemArt,
  avatarSvg,
  castleSvg,
  skins,
  hairs,
} from "./rpg.js";
import { subjects } from "./lessons.js";
import { bridgeCount } from "./adventure.js";
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
export function homeView(state) {
  const count = bridgeCount(state);
  return `<main class="rpg-home"><div class="rpg-welcome"><div><p class="eyebrow">TON HISTOIRE COMMENCE ICI</p><h1>Bienvenue dans ton royaume,<br><em>${esc(state.name)}.</em></h1><p>Un petit défi. Un nouveau pouvoir. Un monde à toi.</p></div><span class="level-badge">✦ ${state.completed.length} aventure${state.completed.length > 1 ? "s" : ""}<small>À ton rythme, toujours.</small></span></div><div class="rpg-hero"><section class="rpg-world" aria-label="Ton royaume personnalisable">${castleSvg(state.rpg, "home")}<div class="island-label">✦ LE DOMAINE DES LUCIOLES</div>${btn("🏰 Décorer mon château", "castle", "island-link castle-link")}${btn("🌱 Mon jardin", "garden", "island-link garden-link")}<button class="hero-girl" data-action="avatar" aria-label="Habiller mon aventurière">${avatarSvg(state.rpg)}</button>${state.pet ? `<span class="world-companion" aria-label="Ton compagnon">${items.find((i) => i.id === state.pet)?.icon || ""}</span>` : ""}<div class="world-caption">Ton royaume grandit avec tes découvertes.</div></section><aside class="quest-aside"><div class="quest-luna">🦄 <span>LUNA<small>Ta compagne d’aventure</small></span></div><h2>Où partons-nous<br>aujourd’hui ?</h2><p>Des nombres à explorer, des mots à apprivoiser… Choisis ton prochain petit pouvoir.</p>${btn("Choisir ma mission →", "missions", "primary mission-choice")}${state.session ? btn("Reprendre ma mission →", "resume", "secondary") : btn("Ma mission →", "start", "quiet")}<div class="daily-reward"><span>🪙</span><div><strong>10 pièces par mission</strong><small>Pour choisir tes trésors à la boutique.</small></div></div></aside></div><nav class="rpg-shortcuts" aria-label="Les lieux de ton royaume">${[
    ["🗺️", "Mes missions", "Une matière, un petit pouvoir", "missions"],
    ["🎀", "Mon aventurière", "Tenues, coiffure et accessoires", "avatar"],
    ["🏰", "Mon château", "Des détails qui changent tout", "castle"],
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
    )}</nav><section class="story-strip" data-bridge-count="${count}"><span class="story-icon">🌉</span><div><p class="eyebrow">LA GRANDE AVENTURE · ${count}/3</p><h2>${count === 3 ? "La clairière du renard" : "Le pont des petits pouvoirs"}</h2><p>${count === 3 ? "Le chemin est ouvert. Ton nouvel ami t’attend." : "Trois parties à construire pour découvrir un nouveau lieu."}</p></div>${btn(count === 3 ? "Traverser le pont →" : "Partir avec Luna →", count === 3 ? "clearing" : "bridge", "secondary")}</section></main>`;
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
export function customizationView(state, kind, selected) {
  const chosen = shop.find((i) => i.id === selected && i.kind === kind),
    r = chosen ? preview(state.rpg, chosen.id) : state.rpg;
  return `<div class="studio"><section class="studio-stage ${kind === "avatar" ? "dressing-stage" : "castle-stage"}"><div class="studio-label">${chosen ? "APERÇU · " + chosen.name : "TON AVENTURIÈRE, TON UNIVERS"}</div>${kind === "avatar" ? avatarSvg(r) : castleSvg(r, "studio")}<div class="studio-caption">${chosen ? "Essaie librement. Tes pièces ne sont dépensées que si tu achètes." : "Les objets équipés apparaissent aussi dans ton royaume."}</div></section><section class="studio-controls"><div class="wallet"><span>🪙 ${state.rpg.coins} pièces</span><small>Gagnées dans tes missions · aucun achat réel</small></div>${chosen ? `<div class="purchase-card"><h2>${chosen.name}</h2><p>${state.rpg.owned.includes(chosen.id) ? "Cet objet est à toi." : `${chosen.price} pièces pour l’ajouter à ta collection.`}</p>${state.rpg.owned.includes(chosen.id) ? btn("✓ Équiper", "rpg-equip", "primary", `data-id="${chosen.id}"`) : btn(state.rpg.coins >= chosen.price ? `Acheter · ${chosen.price} 🪙` : `Il manque ${chosen.price - state.rpg.coins} pièces`, "rpg-buy", "primary", `data-id="${chosen.id}" ${state.rpg.coins < chosen.price ? "disabled" : ""}`)} ${btn("Fermer l’aperçu", "preview-clear", "quiet small")}</div>` : `<h2>${kind === "avatar" ? "Le dressing de l’aventurière" : "L’atelier du château"}</h2><p>Touche un objet pour le voir sur ${kind === "avatar" ? "ton personnage" : "ton château"}.</p>`}${kind === "avatar" ? `<div class="appearance"><h3>Mon apparence</h3><div class="swatches" aria-label="Teint">${skins.map((c, i) => btn(`<span style="background:${c}"></span>`, "look", state.rpg.look.skin === i ? "selected" : "", `data-part="skin" data-index="${i}" aria-label="Teint ${i + 1}" aria-pressed="${state.rpg.look.skin === i}"`)).join("")}</div><div class="swatches" aria-label="Cheveux">${hairs.map((c, i) => btn(`<span style="background:${c}"></span>`, "look", state.rpg.look.hair === i ? "selected" : "", `data-part="hair" data-index="${i}" aria-label="Cheveux ${i + 1}" aria-pressed="${state.rpg.look.hair === i}"`)).join("")}</div></div>` : ""}${btn(kind === "avatar" ? "Remettre ma tenue de départ" : "Revenir au château de départ", "rpg-reset", "quiet small", `data-kind="${kind}"`)}<p class="sub">Tous tes objets restent dans ta collection.</p></section></div><h2 class="shop-heading">${kind === "avatar" ? "La boutique des accessoires" : "Les décorations du royaume"}</h2><div class="shop-grid">${shop
    .filter((i) => i.kind === kind)
    .map((i) => {
      const owned = state.rpg.owned.includes(i.id),
        equipped =
          state.rpg[kind === "avatar" ? "equipped" : "castle"][i.slot] === i.id;
      return btn(
        `<span class="shop-item-art">${itemArt(i.id)}</span><strong>${i.name}</strong><small>${equipped ? "✓ Équipé" : owned ? "Dans ta collection" : i.price + " 🪙"}</small>`,
        "rpg-preview",
        `shop-tile ${selected === i.id ? "selected" : ""}`,
        `data-id="${i.id}"`,
      );
    })
    .join("")}</div>`;
}
