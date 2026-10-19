// Rappel de Luna, défi du jour, album d'autocollants, bilan de la semaine, rappel de sauvegarde.
// Logique pure (aucun accès au DOM) : tout est calculé à partir de la sauvegarde locale.
import { skills, items } from "./content.js";
import { shop } from "./rpg.js";
import { DAY, dayKey, plan, mastered } from "./core.js";

// ───────── Rappel de Luna : les notions déjà réussies qu'il est temps de revoir ─────────
export function reviewQueue(state, now = Date.now(), max = 6) {
  return skills
    .filter((s) => {
      const k = state.skills[s.id];
      return (
        k.status === "seen" &&
        k.interval > 0 &&
        k.due <= now &&
        k.evidence.some((e) => e.correct && !e.assisted && !e.skip)
      );
    })
    .sort((a, b) => state.skills[a.id].due - state.skills[b.id].due)
    .slice(0, max)
    .map((s) => s.id);
}
// ───────── Défi du jour : trois petits défis, un seul par jour, sans série à tenir ─────────
export function dailyAvailable(state, now = Date.now()) {
  return state.daily?.day !== dayKey(now) && plan(state, 3).length > 0;
}
export const dailyQueue = (state) => plan(state, 3);
// ───────── Album d'autocollants : calculés à partir de la sauvegarde, rien à stocker ─────────
const chapters = (s) => s.completed.filter((id) => id.startsWith("story:")).length;
const planted = (s) => s.garden.filter(Boolean).length;
const pets = (s) =>
  s.inventory.filter((id) => items.some((i) => i.id === id && i.kind === "pet")).length;
const roomOwned = (s) => s.rpg.owned.filter((id) => /^(wall|floor|bed|rug|window|lamp|shelf|desk|toy|deco|plant)-/.test(id)).length;
export const stickers = [
  ["first", "🌟", "Première aventure", "Terminer une mission", (s) => s.completed.length >= 1],
  ["m5", "🗺️", "Exploratrice", "5 missions terminées", (s) => s.completed.length >= 5],
  ["m10", "🧭", "Voyageuse", "10 missions terminées", (s) => s.completed.length >= 10],
  ["m25", "🏅", "Grande aventurière", "25 missions terminées", (s) => s.completed.length >= 25],
  ["m50", "🏆", "Légende des Lucioles", "50 missions terminées", (s) => s.completed.length >= 50],
  ["c1", "📖", "Première page", "Terminer un chapitre du Grand Livre", (s) => chapters(s) >= 1],
  ["c10", "📚", "Lectrice du Grand Livre", "10 chapitres terminés", (s) => chapters(s) >= 10],
  ["c25", "🦊", "Gardienne du Grand Livre", "25 chapitres terminés", (s) => chapters(s) >= 25],
  ["g1", "🌱", "Main verte", "Planter une première graine", (s) => planted(s) >= 1],
  ["g8", "🌻", "Jardin fleuri", "8 plantes dans le jardin", (s) => planted(s) >= 8],
  ["gf", "🌸", "Floraison", "Faire fleurir une plante", (s) => (s.gardenLevels || []).some((l) => l >= 1)],
  ["gm", "✨", "Plante magique", "Rendre une plante magique", (s) => (s.gardenLevels || []).some((l) => l >= 2)],
  ["gx", "🧺", "Grand jardin", "Agrandir le jardin", (s) => s.garden.length > 8],
  ["p1", "🐾", "Premier compagnon", "Adopter un compagnon", (s) => pets(s) >= 1],
  ["p3", "🦄", "Amie des animaux", "3 compagnons", (s) => pets(s) >= 3],
  ["r1", "🛏️", "Un coin à moi", "Un premier objet pour la chambre", (s) => roomOwned(s) >= 1],
  ["r10", "🏡", "Chambre bien remplie", "10 objets de chambre", (s) => roomOwned(s) >= 10],
  [
    "rc",
    "🎀",
    "Chambre complète",
    "Mur, sol, lit, tapis et fenêtre choisis",
    (s) => ["wall", "floor", "bed", "rug", "window"].every((k) => s.rpg.room?.[k]),
  ],
  ["cs", "🏰", "Château à ma façon", "Décorer le château", (s) => Object.values(s.rpg.castle).some(Boolean)],
  ["av", "👑", "Bien habillée", "4 accessoires portés en même temps", (s) => Object.values(s.rpg.equipped).filter(Boolean).length >= 4],
  ["col", "🛍️", "Collectionneuse", "20 objets dans la collection", (s) => s.rpg.owned.length >= 20],
  ["sk3", "🎯", "Trois pouvoirs", "3 notions bien comprises", (s) => Object.values(s.skills).filter((k) => k.level >= 3).length >= 3],
  ["sk5", "💎", "Maîtrise", "Une notion maîtrisée", (s) => Object.values(s.skills).some((k) => mastered(k))],
  ["mem", "🧠", "Mémoire d’éléphant", "Réussir une notion revue des jours plus tard", (s) => s.history.some((e) => e.dimension === "memory" && e.correct)],
  ["day", "☀️", "Défi du jour", "Réussir le défi du jour", (s) => s.daily?.done === true],
].map(([id, icon, name, how, test]) => ({ id, icon, name, how, test }));
export const earnedStickers = (state) => stickers.filter((s) => s.test(state)).map((s) => s.id);
export const newStickers = (state) =>
  earnedStickers(state).filter((id) => !(state.stickersSeen || []).includes(id));
// ───────── Bilan de la semaine pour l'adulte ─────────
const startOfDay = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
export function weekSummary(state, now = Date.now()) {
  const today = startOfDay(now),
    days = Array.from({ length: 7 }, (_, i) => ({ start: today - (6 - i) * DAY, answered: 0 })),
    from = days[0].start,
    perSkill = {};
  let answered = 0,
    solo = 0;
  for (const e of state.history) {
    if (e.at < from || e.skip) continue;
    const d = days.find((x) => e.at >= x.start && e.at < x.start + DAY + 3600000 * 2);
    if (d) d.answered++;
    answered++;
    const ok = e.correct && !e.assisted;
    if (ok) solo++;
    const p = (perSkill[e.skill] ??= { skill: e.skill, tries: 0, solo: 0 });
    p.tries++;
    if (ok) p.solo++;
  }
  const rows = Object.values(perSkill).sort((a, b) => b.tries - a.tries);
  return {
    days,
    answered,
    solo,
    missions: state.history.length ? state.completed.length : 0,
    solid: rows.filter((r) => r.tries >= 3 && r.solo / r.tries >= 0.75),
    toRevisit: rows.filter((r) => r.tries >= 3 && r.solo / r.tries < 0.5),
    rows,
  };
}
// ───────── Rappel de sauvegarde : doux, une fois toutes les deux semaines ─────────
export function exportDue(state, now = Date.now()) {
  if (state.completed.length < 3) return false;
  const { lastExport, exportSnooze } = state.settings;
  if (exportSnooze !== undefined && now - exportSnooze < 7 * DAY) return false;
  return lastExport === undefined || now - lastExport >= 14 * DAY;
}
// ───────── Cadeau de chambre affiché à la fin d'une mission ─────────
export function giftNote(state) {
  const g = state.newRoomGift && shop.find((i) => i.id === state.newRoomGift);
  return g
    ? `<div class="notice gift-note">🎁 <strong>Un cadeau pour ta chambre :</strong> ${g.name} ! <button data-action="gift-room" class="small secondary">Voir ma chambre</button></div>`
    : "";
}
