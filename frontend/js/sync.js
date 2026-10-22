// Synchronisation facultative et chiffrée entre appareils.
// Le « code famille » ne quitte jamais l'appareil : on en dérive (PBKDF2) un identifiant opaque
// et une clé AES-GCM. Le serveur ne reçoit que du texte chiffré.
import { validate } from "./core.js";

export const SYNC_KEY = "academie.sync.v1";
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const SALT = new TextEncoder().encode("academie-des-aventuriers/sync/v1");
const enc = new TextEncoder();
// Par blocs : une vraie sauvegarde (plusieurs dizaines de Ko) ferait dépasser la pile avec un « ... » géant.
const b64 = (u8) => {
  let out = "";
  for (let i = 0; i < u8.length; i += 8192) out += String.fromCharCode.apply(null, u8.subarray(i, i + 8192));
  return btoa(out);
};
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const hex = (u8) => [...u8].map((x) => x.toString(16).padStart(2, "0")).join("");

export function newCode(random = crypto.getRandomValues.bind(crypto)) {
  const bytes = random(new Uint8Array(20));
  const chars = [...bytes].map((b) => ALPHABET[b % 32]);
  return [0, 5, 10, 15].map((i) => chars.slice(i, i + 5).join("")).join("-");
}
export const normalizeCode = (c) => String(c || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
export const codeValid = (c) => normalizeCode(c).length >= 16;

export async function derive(code) {
  const base = await crypto.subtle.importKey("raw", enc.encode(normalizeCode(code)), "PBKDF2", false, ["deriveBits"]);
  const bits = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: SALT, iterations: 200000 }, base, 512),
  );
  const key = await crypto.subtle.importKey("raw", bits.slice(0, 32), "AES-GCM", false, ["encrypt", "decrypt"]);
  return { id: hex(bits.slice(32)), key };
}
const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
// Octet 1 = JSON compressé (gzip) : une sauvegarde chargée reste bien sous la limite du service.
export async function encrypt(key, state) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const packed = await pipe(enc.encode(JSON.stringify(state)), new CompressionStream("gzip"));
  const plain = new Uint8Array(packed.length + 1);
  plain[0] = 1;
  plain.set(packed, 1);
  const body = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  const all = new Uint8Array(iv.length + body.length);
  all.set(iv);
  all.set(body, iv.length);
  return b64(all);
}
export async function decrypt(key, text) {
  const all = unb64(text);
  const plain = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: all.slice(0, 12) }, key, all.slice(12)));
  const json = plain[0] === 1 ? await pipe(plain.slice(1), new DecompressionStream("gzip")) : plain;
  return JSON.parse(new TextDecoder().decode(json));
}

const union = (a = [], b = []) => [...new Set([...a, ...b])];
const lastAt = (s) => s.evidence.reduce((m, e) => Math.max(m, e.at || 0), 0);
// Fusion prudente : rien de ce qu'un enfant a appris ou gagné n'est perdu ; le reste suit l'appareil le plus récent.
export function mergeStates(local, remote) {
  // La base est la sauvegarde la plus avancée (jamais une sauvegarde neuve, même plus récente) ; à égalité, la plus récente.
  const progress = (x) => x.completed.length * 50 + x.history.length + x.rpg.owned.length * 5 + x.inventory.length * 5;
  const pl = progress(local),
    pr = progress(remote);
  const remoteNewer = pr !== pl ? pr > pl : (remote.modified || 0) > (local.modified || 0);
  const newer = remoteNewer ? remote : local,
    older = remoteNewer ? local : remote;
  const out = structuredClone(newer);
  out.modified = Math.max(local.modified || 0, remote.modified || 0);
  for (const id of Object.keys(out.skills)) {
    const a = newer.skills[id],
      b = older.skills?.[id];
    if (!b) continue;
    const ta = lastAt(a),
      tb = lastAt(b);
    if (tb > ta || (tb === ta && a.status === "unknown" && b.status !== "unknown")) out.skills[id] = structuredClone(b);
  }
  const seen = new Set(),
    hist = [];
  for (const e of [...older.history, ...newer.history]) {
    const k = `${e.skill}|${e.at}|${e.fingerprint ?? ""}|${e.correct}`;
    if (!seen.has(k)) (seen.add(k), hist.push(e));
  }
  out.history = hist.sort((x, y) => x.at - y.at).slice(-1000);
  if (newer.assessment || older.assessment) {
    out.assessment = { ...(older.assessment || {}) };
    for (const [id, v] of Object.entries(newer.assessment || {})) if (!out.assessment[id] || v.at >= out.assessment[id].at) out.assessment[id] = v;
  }
  out.completed = union(newer.completed, older.completed);
  out.inventory = union(newer.inventory, older.inventory);
  if (out.rpg && older.rpg) out.rpg.owned = union(newer.rpg.owned, older.rpg.owned);
  try {
    return validate(out);
  } catch {
    return structuredClone(newer);
  }
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function readConfig(storage) {
  try {
    const c = JSON.parse(storage.getItem(SYNC_KEY));
    return c && c.url && c.code ? c : null;
  } catch {
    return null;
  }
}
export const writeConfig = (storage, c) =>
  c ? storage.setItem(SYNC_KEY, JSON.stringify(c)) : storage.removeItem(SYNC_KEY);

// Un échange complet : lire, fusionner, écrire. Retourne { state, changed (local modifié), pushed, status }.
export async function syncOnce(local, config, rawFetch = (...a) => fetch(...a)) {
  // Délai maximal : un service injoignable ne doit jamais bloquer les synchronisations suivantes.
  const fetchFn = (url, init = {}) => rawFetch(url, { ...init, signal: AbortSignal.timeout(12000) });
  const { id, key } = await derive(config.code);
  const url = `${config.url.replace(/\/+$/, "")}/v1/${id}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetchFn(url, { cache: "no-store" });
    let merged = local,
      rev = 0;
    if (res.status === 200) {
      const remote = await res.json();
      rev = remote.rev;
      let theirs;
      try {
        theirs = validate(await decrypt(key, remote.data));
      } catch {
        throw Error("Code famille incorrect ou données illisibles.");
      }
      merged = mergeStates(local, theirs);
      if (same(merged, theirs)) return { state: merged, changed: !same(merged, local), pushed: false, rev };
    } else if (res.status !== 404) throw Error("Serveur de synchronisation indisponible.");
    const put = await fetchFn(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base: rev, data: await encrypt(key, merged) }),
    });
    if (put.status === 409) continue;
    if (!put.ok) throw Error("Envoi refusé par le serveur de synchronisation.");
    const { rev: newRev } = await put.json();
    return { state: merged, changed: !same(merged, local), pushed: true, rev: newRev };
  }
  throw Error("Conflit de synchronisation, nouvel essai plus tard.");
}
