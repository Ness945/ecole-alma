// Château en vraie 3D (Three.js embarqué dans frontend/vendor, aucun serveur, fonctionne hors ligne).
// Chargé à la demande par app.js ; si WebGL manque ou échoue, le dessin SVG reste affiché.
// Le même état `rpg.castle` pilote la 3D : toit, murs, tours, porte, fenêtres, bannières, douves, chemin,
// lumières, météo, créatures, ciel, alentours, jardin et fontaine. Aucune donnée n'est envoyée nulle part.
import * as T from "../vendor/three.module.min.js";
import { WALLS, phaseNow } from "./castle-scene.js";
import { roofColors, defaultRoof } from "./castle-art.js";

const FLAG_COLORS = {
  true: ["#e9bd5e", ""],
  "castle-flags": ["#e9bd5e", ""],
  "flags-rose": ["#ee93ad", ""],
  "flags-blue": ["#6c9bd8", ""],
  "flags-stars": ["#8d78c4", "star"],
};
const PHASE = {
  day: { top: "#8ec5ea", bottom: "#f4eddc", hemi: [0xffffff, 0xb9c9a0, 1.15], sun: [0xfff3dc, 1.7, [8, 14, 10]] },
  dusk: { top: "#6f5fa8", bottom: "#f6b88f", hemi: [0xcfb4d8, 0x8a7aa0, 0.85], sun: [0xff9f6b, 1.2, [-11, 5, 8]] },
  night: { top: "#141a47", bottom: "#3f4580", hemi: [0x8a96e6, 0x3a4080, 1.05], sun: [0xaabcff, 0.8, [-6, 12, 9]] },
};
let shared = null; // rendu persistant : un seul contexte WebGL pour toute l'application
const state3d = { yaw: 0, sig: "", host: null, running: false, failed: false, dragging: false, last: 0, lastDraw: 0, gap: 33, avg: 0, tier: 0, prevRaf: 0 };

export function castle3dSupported() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

// ───────── Petits outils ─────────
const col = (c) => new T.Color(c);
const std = (c, o = {}) => new T.MeshStandardMaterial({ color: col(c), flatShading: true, roughness: 0.92, metalness: 0, ...o });
function mesh(geo, mat, x = 0, y = 0, z = 0, parent) {
  const m = new T.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  if (parent) parent.add(m);
  return m;
}
const box = (w, h, d, c, x, y, z, p) => mesh(new T.BoxGeometry(w, h, d), std(c), x, y, z, p);
const cyl = (rt, rb, h, seg, c, x, y, z, p) => mesh(new T.CylinderGeometry(rt, rb, h, seg), std(c), x, y, z, p);
const cone = (r, h, seg, c, x, y, z, p) => mesh(new T.ConeGeometry(r, h, seg), std(c), x, y, z, p);
const ball = (r, c, x, y, z, p, o = {}) => mesh(new T.SphereGeometry(r, 12, 10), std(c, o), x, y, z, p);
function archShape(w, h) {
  const r = w / 2,
    s = new T.Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, h - r);
  s.absarc(0, h - r, r, Math.PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  return s;
}
const flat = (shape, mat, z = 0) => {
  const m = new T.Mesh(new T.ShapeGeometry(shape), mat);
  m.position.z = z;
  return m;
};
let glowTex = null, dotTex = null;
function radial(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d"),
    gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  stops.forEach(([o, col]) => gr.addColorStop(o, col));
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
const glowSprite = (x, y, z, size, color, opacity, p) => {
  glowTex ||= radial([[0, "rgba(255,255,255,1)"], [0.4, "rgba(255,255,255,.35)"], [1, "rgba(255,255,255,0)"]]);
  const s = new T.Sprite(new T.SpriteMaterial({ map: glowTex, color: col(color), transparent: true, opacity, depthWrite: false, blending: T.AdditiveBlending }));
  s.position.set(x, y, z);
  s.scale.set(size, size, 1);
  p.add(s);
  return s;
};

// ───────── Le monde ─────────
function build(world, anim, rpg, phase) {
  const c = rpg.castle || {},
    night = phase !== "day",
    W = WALLS[c.walls] || WALLS.default,
    [roof, roofDark] = roofColors[c.roof] || defaultRoof,
    style = c.towers || "",
    flag = FLAG_COLORS[c.flags] || null;
  const island = new T.Group();
  world.add(island);
  anim.island = island;
  // Île flottante
  cyl(9, 8.5, 0.9, 40, "#9dc58a", 0, -0.45, 0, island);
  cyl(9.1, 9.1, 0.18, 40, "#c9d9a4", 0, -0.12, 0, island).scale.set(1, 1, 1);
  const rock = cone(8.5, 6.5, 9, "#a5958a", 0, -4.1, 0, island);
  rock.rotation.x = Math.PI;
  for (const [x, z, h] of [[-3, 2, 3], [3.5, -2, 3.6], [0.5, 4, 2.4], [-1.5, -4, 2.8]]) {
    const s = cone(1.2, h, 6, "#8e8076", x, -6.2 - h * 0.15, z, island);
    s.rotation.x = Math.PI;
  }
  // Soubassement et salle
  box(6.5, 0.4, 4.5, W[1], 0, 0.2, 0, island);
  box(6, 3.7, 4, W[0], 0, 2.25, 0, island);
  box(6.25, 0.28, 4.25, roof, 0, 4.0, 0, island);
  for (let i = 0; i < 7; i++) {
    const x = -2.7 + i * 0.9;
    box(0.55, 0.6, 0.5, W[0], x, 4.5, 1.85, island);
    box(0.55, 0.6, 0.5, W[0], x, 4.5, -1.85, island);
  }
  for (const sx of [-1, 1]) for (const z of [-0.9, 0, 0.9]) box(0.5, 0.6, 0.55, W[0], sx * 2.85, 4.5, z, island);
  // Tours
  const makeTower = (x, z, r, h, withFlag) => {
    const g = new T.Group();
    g.position.set(x, 0, z);
    island.add(g);
    cyl(r + 0.12, r + 0.18, 0.4, 14, W[4], 0, 0.2, 0, g);
    cyl(r, r, h, 14, W[3], 0, h / 2, 0, g);
    cyl(r + 0.1, r + 0.1, 0.22, 14, W[4], 0, h - 0.1, 0, g);
    let top = h;
    if (style === "towers-square") {
      cyl(r + 0.25, r + 0.25, 0.35, 14, roof, 0, h + 0.1, 0, g);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const m = box(0.45, 0.55, 0.38, W[3], Math.sin(a) * (r + 0.1), h + 0.5, Math.cos(a) * (r + 0.1), g);
        m.rotation.y = a;
      }
      top = h + 0.8;
    } else if (style === "towers-spire") {
      cone(r + 0.2, r * 4.4, 14, roof, 0, h + r * 2.2, 0, g);
      top = h + r * 4.4;
    } else if (style === "towers-onion") {
      const pts = [[0.01, 0], [1.25, 0], [1.5, 0.45], [1.3, 1.1], [0.8, 1.7], [0.3, 2.3], [0.02, 2.8]].map(([a, b]) => new T.Vector2(a * r * 0.95, b * r));
      mesh(new T.LatheGeometry(pts, 16), std(roof), 0, h, 0, g);
      ball(0.13, "#f2c94e", 0, h + 2.9 * r, 0, g);
      top = h + 2.9 * r;
    } else {
      cone(r + 0.3, r * 2.3, 14, roof, 0, h + r * 1.15, 0, g);
      cone(r + 0.31, r * 2.3, 4, roofDark, 0, h + r * 1.15, 0, g).rotation.y = 0.4;
      top = h + r * 2.3;
    }
    if (withFlag && flag) {
      cyl(0.04, 0.04, 1.5, 6, "#9c805b", 0, top + 0.6, 0, g);
      const geo = new T.PlaneGeometry(1.15, 0.68, 10, 1);
      geo.translate(0.58, 0, 0);
      const f = new T.Mesh(geo, new T.MeshStandardMaterial({ color: col(flag[0]), side: T.DoubleSide, roughness: 0.8 }));
      f.position.set(0.02, top + 1.1, 0);
      f.castShadow = true;
      g.add(f);
      if (flag[1] === "star") ball(0.09, "#ffffff", 0.2, top + 1.1, 0.03, g);
      anim.flags.push({ geo, base: geo.attributes.position.array.slice() });
    }
  };
  makeTower(0, -0.5, 1.4, 7.4, true);
  makeTower(-3.1, 1.9, 1.15, 5.4, true);
  makeTower(3.1, 1.9, 1.15, 5.4, true);
  makeTower(-3.1, -1.9, 1.1, 4.8, false);
  makeTower(3.1, -1.9, 1.1, 4.8, false);
  // Porte
  {
    const frame = flat(archShape(1.9, 2.3), std(W[4], { side: T.FrontSide }), 2.01);
    island.add(frame);
    const dc = { "door-red": "#c6465a", "door-gold": "#e3b84f", "door-blue": "#5b84b8", "door-crystal": "#a8e3ef" }[c.door] || "#8d6b57";
    const shape = archShape(1.4, 2.0),
      door = new T.Mesh(new T.ShapeGeometry(shape), c.door === "door-crystal" ? new T.MeshStandardMaterial({ color: col(dc), emissive: col("#7fd3e6"), emissiveIntensity: 0.5, transparent: true, opacity: 0.85 }) : std(dc));
    door.position.z = 2.03;
    island.add(door);
    box(0.06, 1.4, 0.02, "#5a4638", 0, 0.7, 2.045, island);
    if (c.door === "door-gold") for (const y of [0.6, 1.2]) box(1.2, 0.07, 0.02, "#c58f22", 0, y, 2.05, island);
    ball(0.07, "#efd17f", 0.45, 0.95, 2.06, island);
    box(1.9, 0.2, 0.7, W[1], 0, 0.1, 2.35, island);
    if (c.door === "door-flowers")
      for (let i = 0; i < 11; i++) {
        const a = Math.PI * (i / 10);
        ball(0.15, ["#f4a8b6", "#fff4d8", "#f6d36e"][i % 3], -Math.cos(a) * 0.95, 1.4 + Math.sin(a) * 0.95, 2.08, island);
      }
    if (c.door === "door-crystal") {
      const s = new T.Mesh(new T.OctahedronGeometry(0.13), new T.MeshBasicMaterial({ color: col("#fff7c8") }));
      s.position.set(0.8, 2.6, 2.1);
      island.add(s);
      anim.twinkle.push(s);
    }
  }
  // Fenêtres
  {
    const lit = night,
      glassOf = (i) => {
        const base = c.windows === "windows-golden" ? "#f6d36e" : c.windows === "windows-round" ? "#ffd978" : c.windows === "windows-stained" ? ["#e8546a", "#4d8fc4", "#7fbf7a", "#f2c14e", "#a994d6"][i % 5] : lit ? "#ffd978" : "#728890";
        return new T.MeshStandardMaterial({ color: col(base), emissive: col(lit || c.windows === "windows-golden" ? (c.windows === "windows-stained" ? base : "#ffd978") : "#000000"), emissiveIntensity: lit ? 0.9 : c.windows === "windows-golden" ? 0.25 : 0, roughness: 0.5 });
      },
      frameMat = std(c.windows === "windows-stained" ? "#f2c14e" : c.windows === "windows-round" ? "#e8b04a" : "#fff1d0");
    let n = 0;
    const win = (x, y, z, ry) => {
      const g = new T.Group();
      g.position.set(x, y, z);
      g.rotation.y = ry;
      island.add(g);
      const f = flat(archShape(0.92, 1.45), frameMat, 0);
      g.add(f);
      const gl = flat(archShape(0.7, 1.23), glassOf(n++), 0.015);
      gl.position.y = 0.11;
      g.add(gl);
      if (c.windows === "windows-stained" || c.windows === "windows-round") {
        const bar = new T.Mesh(new T.PlaneGeometry(0.05, 1.0), frameMat);
        bar.position.set(0, 0.62, 0.03);
        g.add(bar);
        if (c.windows === "windows-round") {
          const ring = new T.Mesh(new T.TorusGeometry(0.2, 0.025, 6, 20), new T.MeshBasicMaterial({ color: col("#fff6cc") }));
          ring.position.set(0, 0.75, 0.035);
          g.add(ring);
        }
      }
      if (c.windows === "windows-shutters")
        for (const s of [-1, 1]) {
          const sh = box(0.3, 1.2, 0.06, "#6fae73", s * 0.62, 0.65, 0.03, g);
          sh.castShadow = false;
        }
    };
    const onTower = (cx, cz, r, y, a) => win(cx + Math.sin(a) * (r + 0.03), y, cz + Math.cos(a) * (r + 0.03), a);
    for (const sx of [-1, 1]) {
      win(sx * 1.35, 1.35, 2.02, 0);
      win(sx * 1.35, 1.35, -2.02, Math.PI);
      win(sx * 3.02, 1.35, 0, sx * (Math.PI / 2));
      onTower(sx * 3.1, 1.9, 1.15, 2.7, 0);
      onTower(sx * 3.1, 1.9, 1.15, 2.7, sx * 0.9);
    }
    for (const a of [0, 1.1, -1.1, 2.2, -2.2]) onTower(0, -0.5, 1.4, 5.5, a);
  }
  // Douves, pont-levis, chemin
  const moatCol = { "moat-water": "#8fd0e2", "moat-lilies": "#8fd0e2", "moat-magic": "#9c8be0" }[c.moat];
  {
    const y0 = c.moat ? 6.3 : 2.1;
    const pathCol = { "path-stone": "#c4c7cc", "path-gold": "#f4d884" }[c.path] || "#e5cfaa";
    const p = mesh(new T.BoxGeometry(1.7, 0.06, 8.6 - y0 + 0.2), std(pathCol), 0, 0.03, (y0 + 8.8) / 2, island);
    p.castShadow = false;
    const inner = box(1.7, 0.06, 6.3 - 2.1, pathCol, 0, 0.03, (2.1 + 5) / 2, island);
    inner.castShadow = false;
    if (c.path === "path-stone")
      for (let i = 0; i < 8; i++) {
        const s = cyl(0.42, 0.42, 0.08, 8, "#dfe2e6", i % 2 ? -0.38 : 0.38, 0.09, 3 + i * 0.75, island);
        s.scale.z = 0.6;
        s.castShadow = false;
      }
    if (c.path === "path-flowers")
      for (let i = 0; i < 10; i++) ball(0.15, ["#f4a8b6", "#fff4d8", "#f6d36e"][i % 3], i % 2 ? 1.05 : -1.05, 0.16, 3 + i * 0.6, island);
    if (c.path === "path-gold")
      for (let i = 0; i < 7; i++) {
        const s = box(0.6, 0.07, 0.6, "#fff1b0", i % 2 ? 0.3 : -0.3, 0.09, 3.2 + i * 0.8, island);
        s.rotation.y = 0.78;
        s.castShadow = false;
      }
  }
  if (moatCol) {
    const water = new T.Mesh(new T.RingGeometry(5.0, 6.3, 64), new T.MeshStandardMaterial({ color: col(moatCol), roughness: 0.25, metalness: 0.1, emissive: col(c.moat === "moat-magic" ? "#6a55c0" : "#000000"), emissiveIntensity: c.moat === "moat-magic" ? 0.5 : 0 }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.05;
    water.receiveShadow = true;
    island.add(water);
    for (const [ri, ro] of [[4.9, 5.0], [6.3, 6.4]]) {
      const e = new T.Mesh(new T.RingGeometry(ri, ro, 64), std("#f1ead8"));
      e.rotation.x = -Math.PI / 2;
      e.position.y = 0.07;
      island.add(e);
    }
    const bridge = new T.Group();
    bridge.position.set(0, 0.12, 5.65);
    island.add(bridge);
    box(1.8, 0.18, 1.7, "#b0794f", 0, 0, 0, bridge);
    for (let i = -3; i <= 3; i++) box(1.8, 0.2, 0.04, "#7d5a3a", 0, 0.01, i * 0.22, bridge).castShadow = false;
    for (const s of [-1, 1]) box(0.1, 0.45, 1.7, "#7d5a3a", s * 0.85, 0.3, 0, bridge);
    if (c.moat === "moat-lilies")
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * 0.12 + (i / 8) * Math.PI * 0.76 + (i % 2) * 0.05,
          rr = 5.65 + (i % 3 === 0 ? 0.25 : -0.2);
        if (Math.abs(a - Math.PI / 2) < 0.28) continue;
        const l = cyl(0.3, 0.3, 0.04, 10, "#79b97a", Math.cos(a) * rr, 0.09, Math.sin(a) * rr, island);
        l.castShadow = false;
        ball(0.09, "#f6b9c8", Math.cos(a) * rr, 0.16, Math.sin(a) * rr, island);
      }
    if (c.moat === "moat-magic")
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.3;
        const s = new T.Mesh(new T.SphereGeometry(0.08, 6, 6), new T.MeshBasicMaterial({ color: col("#fff6c8") }));
        s.position.set(Math.cos(a) * 5.65, 0.2, Math.sin(a) * 5.65);
        island.add(s);
        anim.twinkle.push(s);
      }
  }
  // Arbres, jardin, fontaine
  for (const [x, z, s] of [[-7, 0.5, 1], [7, -0.5, 1.1]]) {
    cyl(0.22, 0.3, 1.6, 7, "#7d6a52", x, 0.8, z, island);
    ball(1.15 * s, "#779d76", x, 2.4 * s, z, island);
    ball(0.85 * s, "#86ab80", x + 0.5, 3.3 * s, z + 0.2, island);
  }
  if (c.garden)
    for (const [x, z] of [[-6.2, 4.2], [-4.4, 6.5]]) {
      const b = ball(0.95, "#668e71", x, 0.55, z, island);
      b.scale.y = 0.8;
      [[0.5, 0.5, 0.4], [-0.4, 0.7, 0.3], [0.1, 0.9, -0.5]].forEach(([dx, dy, dz], i) => ball(0.2, ["#e8a6ae", "#fff4d8", "#f6d36e"][i], x + dx, dy + 0.2, z + dz, island));
    }
  if (c.fountain) {
    const g = new T.Group();
    g.position.set(3.9, 0, 7.0);
    island.add(g);
    cyl(1.3, 1.45, 0.5, 20, "#e9dfcb", 0, 0.25, 0, g);
    cyl(1.05, 1.05, 0.52, 20, "#85c7d1", 0, 0.26, 0, g).castShadow = false;
    cyl(0.14, 0.2, 1.3, 8, "#ede1c7", 0, 1.0, 0, g);
    cyl(0.6, 0.35, 0.18, 14, "#ede1c7", 0, 1.55, 0, g);
    for (let i = 0; i < 6; i++) {
      const d = new T.Mesh(new T.SphereGeometry(0.07, 6, 6), new T.MeshBasicMaterial({ color: col("#bfe8f0") }));
      g.add(d);
      anim.drops.push({ m: d, a: (i / 6) * Math.PI * 2, ph: i / 6 });
    }
  }
  // Lumières
  const glowOn = night ? 0.85 : 0;
  const lanternAt = (x, z) => {
    cyl(0.07, 0.09, 1.5, 6, "#6b5b45", x, 0.75, z, island);
    const l = box(0.34, 0.42, 0.34, "#ffd978", x, 1.7, z, island);
    l.material = new T.MeshStandardMaterial({ color: col("#ffd978"), emissive: col("#ffd978"), emissiveIntensity: night ? 1.2 : 0.2 });
    cone(0.28, 0.25, 4, "#6b5b45", x, 2.0, z, island).rotation.y = 0.78;
    if (night) glowSprite(x, 1.7, z, 2.4, "#ffe9a0", 0.55, island);
  };
  if (c.lights === "lights-lanterns") for (const [x, z] of [[-1.3, 7.2], [1.3, 7.2], [-1.3, 8.1], [1.3, 8.1], [-2.2, 4.6], [2.2, 4.6]]) lanternAt(x, z);
  if (c.lights === "lights-torches")
    for (const x of [-1.25, 1.25]) {
      cyl(0.05, 0.07, 0.9, 6, "#7d5a3a", x, 2.1, 2.3, island);
      const fl = cone(0.2, 0.5, 7, "#f4a43a", x, 2.7, 2.3, island);
      fl.material = new T.MeshBasicMaterial({ color: col("#ffb347") });
      fl.castShadow = false;
      anim.flames.push(fl);
      if (night) glowSprite(x, 2.7, 2.35, 2.2, "#ffbf6a", 0.6, island);
    }
  if (c.lights === "lights-fairy") {
    const curve = new T.CatmullRomCurve3([new T.Vector3(-3.1, 5.3, 3.1), new T.Vector3(-1.5, 4.6, 3.35), new T.Vector3(0, 4.35, 3.4), new T.Vector3(1.5, 4.6, 3.35), new T.Vector3(3.1, 5.3, 3.1)]);
    mesh(new T.TubeGeometry(curve, 24, 0.02, 4), std("#9a8a6a"), 0, 0, 0, island).castShadow = false;
    for (let i = 0; i < 12; i++) {
      const p = curve.getPoint(i / 11),
        cc = ["#ffd978", "#f4a8c0", "#bfe3f4", "#fff4a8"][i % 4];
      const s = new T.Mesh(new T.SphereGeometry(0.1, 8, 8), new T.MeshBasicMaterial({ color: col(cc) }));
      s.position.copy(p);
      island.add(s);
      anim.twinkle.push(s);
      if (night) glowSprite(p.x, p.y, p.z, 0.9, cc, 0.5, island);
    }
  }
  // Alentours
  if (c.ground === "ground-windmill") {
    const g = new T.Group();
    g.position.set(-5.4, 0, -5.8);
    island.add(g);
    cyl(0.7, 1.1, 3.2, 8, "#efdcbc", 0, 1.6, 0, g);
    cone(0.95, 1.1, 8, "#b5705a", 0, 3.7, 0, g);
    box(0.45, 0.8, 0.1, "#8d6b57", 0, 0.4, 1.0, g);
    const bl = new T.Group();
    bl.position.set(0, 3.1, 1.0);
    g.add(bl);
    for (let i = 0; i < 4; i++) {
      const a = new T.Group();
      a.rotation.z = (i * Math.PI) / 2;
      bl.add(a);
      box(0.28, 1.9, 0.04, "#f6f1e4", 0, 1.1, 0, a);
      box(0.06, 2.0, 0.05, "#8d6b57", -0.14, 1.1, 0, a);
    }
    ball(0.14, "#8d6b57", 0, 0, 0.05, bl);
    anim.blades = bl;
  }
  if (c.ground === "ground-village")
    for (const [x, z, rc] of [[6.6, 4.0, "#c6889d"], [5.2, 5.6, "#9381bd"]]) {
      box(1.4, 1.1, 1.3, "#f0dfc0", x, 0.55, z, island);
      const r = cone(1.2, 0.9, 4, rc, x, 1.55, z, island);
      r.rotation.y = Math.PI / 4;
      box(0.3, 0.55, 0.05, "#8d6b57", x, 0.28, z + 0.66, island);
    }
  if (c.ground === "ground-tent") {
    const g = new T.Group();
    g.position.set(5.2, 0, -5.6);
    island.add(g);
    cone(1.5, 2.1, 6, "#f08aa6", 0, 1.05, 0, g);
    cone(1.52, 2.1, 6, "#fff4e6", 0, 1.05, 0, g).rotation.y = Math.PI / 6;
    g.children[1].scale.set(0.9, 1, 0.9);
    box(0.5, 0.85, 0.05, "#7a3d4a", 0, 0.42, 1.2, g);
    cyl(0.03, 0.03, 0.7, 5, "#9c805b", 0, 2.4, 0, g);
    box(0.5, 0.3, 0.03, "#f6c85f", 0.28, 2.6, 0, g);
  }
  // Ciel : nuages, arc-en-ciel, ballon, aurore
  const cloudMat = new T.MeshBasicMaterial({ color: col(phase === "night" ? "#8f95c8" : phase === "dusk" ? "#ffe4d0" : "#ffffff"), transparent: true, opacity: 0.85 });
  [[-9, 11, -6, 1.2], [10, 12.5, -9, 1.5], [2, 14, -14, 1.8]].forEach(([x, y, z, s], i) => {
    const g = new T.Group();
    g.position.set(x, y, z);
    for (const [dx, dy, r] of [[0, 0, 1.2], [1.3, 0.2, 1.0], [-1.2, -0.1, 0.9], [0.4, 0.6, 0.8]]) {
      const b = new T.Mesh(new T.SphereGeometry(r * s, 10, 8), cloudMat);
      b.position.set(dx * s, dy * s, 0);
      b.scale.y = 0.55;
      g.add(b);
    }
    world.add(g);
    anim.clouds.push({ g, x, ph: i * 1.7, sp: 0.18 + i * 0.05 });
  });
  if (c.sky === "sky-rainbow")
    ["#e98a8a", "#f3b86b", "#f2e27a", "#98cf8f", "#8cc3e0", "#a994d6"].forEach((cc, i) => {
      const t = new T.Mesh(new T.TorusGeometry(15 - i * 0.55, 0.28, 6, 60, Math.PI), new T.MeshBasicMaterial({ color: col(cc), transparent: true, opacity: 0.7 }));
      t.position.set(0, -3.5, -14);
      world.add(t);
    });
  if (c.sky === "sky-balloon") {
    const g = new T.Group();
    g.position.set(-11, 8.5, -2);
    const b = ball(1.5, "#e98a8a", 0, 0, 0, g);
    b.scale.y = 1.25;
    const st = ball(1.51, "#f6d36e", 0, 0, 0, g);
    st.scale.set(0.4, 1.26, 1);
    box(0.7, 0.5, 0.7, "#8d6b57", 0, -2.6, 0, g);
    for (const [x, z] of [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) cyl(0.015, 0.015, 1.2, 4, "#6b5b45", x * 1.6, -1.9, z * 1.6, g);
    world.add(g);
    anim.balloon = g;
  }
  if (c.sky === "sky-aurora")
    [["#b9a6ee", 15.5, 0], ["#a5dcc0", 13.5, 1.4]].forEach(([cc, y, ph]) => {
      const geo = new T.PlaneGeometry(34, 3.6, 40, 1),
        m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: col(cc), transparent: true, opacity: 0.38, side: T.DoubleSide, depthWrite: false }));
      m.position.set(0, y, -20);
      world.add(m);
      anim.aurora.push({ geo, base: geo.attributes.position.array.slice(), ph });
    });
  // Créatures
  const wing = (color, s = 1) => {
    const sh = new T.Shape();
    sh.moveTo(0, 0);
    sh.quadraticCurveTo(0.5 * s, 0.9 * s, 1.5 * s, 0.7 * s);
    sh.quadraticCurveTo(1.0 * s, 0.3 * s, 1.1 * s, -0.2 * s);
    sh.quadraticCurveTo(0.5 * s, 0, 0, 0);
    const m = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshStandardMaterial({ color: col(color), side: T.DoubleSide, roughness: 0.7 }));
    m.castShadow = true;
    return m;
  };
  const addWings = (parent, color, s, y, z, speed = 7) => {
    const L = new T.Group(),
      R = new T.Group();
    L.position.set(0.12, y, z);
    R.position.set(-0.12, y, z);
    L.add(wing(color, s));
    const w2 = wing(color, s);
    w2.scale.x = -1;
    R.add(w2);
    parent.add(L, R);
    anim.wings.push({ L, R, speed });
  };
  if (c.creature === "creature-dragon") {
    const g = new T.Group();
    ball(0.55, "#9bd48f", 0, 0, 0, g).scale.set(0.9, 0.8, 1.6);
    ball(0.38, "#9bd48f", 0, 0.25, 1.0, g);
    cone(0.12, 0.35, 5, "#f2c14e", 0.14, 0.62, 1.0, g);
    cone(0.12, 0.35, 5, "#f2c14e", -0.14, 0.62, 1.0, g);
    const tail = cone(0.28, 1.5, 6, "#8cc680", 0, 0, -1.4, g);
    tail.rotation.x = -Math.PI / 2;
    ball(0.06, "#2c3a2c", 0.15, 0.35, 1.3, g);
    ball(0.06, "#2c3a2c", -0.15, 0.35, 1.3, g);
    addWings(g, "#c6ebb9", 1.1, 0.3, 0.1, 6);
    world.add(g);
    anim.fliers.push({ g, r: 8.5, h: 9.5, sp: 0.35, bob: 0.5, ph: 0 });
  }
  if (c.creature === "creature-pegasus") {
    const g = new T.Group();
    ball(0.5, "#ffffff", 0, 0, 0, g).scale.set(0.8, 0.8, 1.5);
    const neck = cyl(0.17, 0.25, 0.9, 7, "#ffffff", 0, 0.45, 0.8, g);
    neck.rotation.x = 0.5;
    ball(0.28, "#ffffff", 0, 0.95, 1.2, g).scale.set(0.9, 0.9, 1.3);
    box(0.12, 0.5, 0.1, "#f3b86b", 0, 0.8, 0.55, g).rotation.x = 0.4;
    for (const [x, z] of [[-0.2, 0.5], [0.2, 0.5], [-0.2, -0.5], [0.2, -0.5]]) cyl(0.07, 0.06, 0.7, 5, "#ffffff", x, -0.5, z, g);
    const tail = cone(0.14, 0.9, 5, "#f3b86b", 0, -0.1, -1.0, g);
    tail.rotation.x = -2.4;
    addWings(g, "#f2ecff", 1.1, 0.35, 0.1, 5);
    world.add(g);
    anim.fliers.push({ g, r: 8, h: 8.5, sp: 0.3, bob: 0.45, ph: 2 });
  }
  if (c.creature === "creature-birds")
    for (let i = 0; i < 4; i++) {
      const g = new T.Group();
      ball(0.13, "#6b5b70", 0, 0, 0, g).scale.set(0.8, 0.8, 1.4);
      addWings(g, "#6b5b70", 0.35, 0, 0, 9);
      world.add(g);
      anim.fliers.push({ g, r: 7 + i * 0.8, h: 10 + (i % 2) * 1.2, sp: 0.42 - i * 0.03, bob: 0.3, ph: i * 1.3 });
    }
  if (c.creature === "creature-butterflies")
    [["#f08a2e", 0], ["#8d78c4", 2], ["#f08aa6", 4]].forEach(([cc, ph], i) => {
      const g = new T.Group();
      ball(0.05, "#4a3a3a", 0, 0, 0, g).scale.z = 3;
      addWings(g, cc, 0.3, 0, 0, 14);
      world.add(g);
      anim.fliers.push({ g, r: 3 + i, h: 3.5 + i * 0.8, sp: 0.55, bob: 0.6, ph, ox: i % 2 ? 4 : -4, oz: 5.5, wander: true });
    });
  if (c.creature === "creature-fairy") {
    const g = new T.Group();
    cone(0.22, 0.55, 8, "#f4a8c0", 0, -0.05, 0, g);
    ball(0.17, "#f7d9c4", 0, 0.34, 0, g);
    ball(0.19, "#f3b86b", 0, 0.42, -0.03, g).scale.set(1, 0.8, 1);
    addWings(g, "#e8f6ff", 0.55, 0.15, -0.05, 12);
    glowSprite(0, 0.2, 0, 1.8, "#fff3a0", 0.55, g);
    world.add(g);
    anim.fliers.push({ g, r: 5.2, h: 6.6, sp: 0.5, bob: 0.5, ph: 0, orbit: true });
  }
  // Météo
  if (c.weather) {
    const n = c.weather === "weather-rain" ? 260 : 170,
      pos = new Float32Array(n * 3),
      seed = [];
    for (let i = 0; i < n; i++) {
      const r = Math.random;
      pos.set([(r() - 0.5) * 22, r() * 15, (r() - 0.5) * 22], i * 3);
      seed.push(r() * 6.28);
    }
    dotTex ||= radial([[0, "rgba(255,255,255,1)"], [0.55, "rgba(255,255,255,.9)"], [1, "rgba(255,255,255,0)"]]);
    const o = {
      "weather-rain": ["#9cc3ec", 0.22],
      "weather-snow": ["#ffffff", 0.3],
      "weather-petals": ["#f4a8b6", 0.34],
      "weather-fireflies": ["#fff29a", 0.34],
      "weather-stardust": ["#ffd978", 0.3],
    }[c.weather] || ["#ffffff", 0.3];
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    const pts = new T.Points(geo, new T.PointsMaterial({ color: col(o[0]), size: o[1], map: dotTex, transparent: true, depthWrite: false, blending: c.weather === "weather-fireflies" || c.weather === "weather-stardust" ? T.AdditiveBlending : T.NormalBlending }));
    pts.frustumCulled = false;
    world.add(pts);
    anim.weather = { pts, geo, seed, kind: c.weather, n };
  }
}

// ───────── Mise en route ─────────
function makeShared() {
  const canvas = document.createElement("canvas");
  canvas.className = "castle3d-canvas";
  canvas.tabIndex = 0;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Ton château en 3D. Glisse le doigt ou utilise les flèches pour le faire tourner.");
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene(),
    camera = new T.PerspectiveCamera(36, 1.45, 0.5, 160),
    hemi = new T.HemisphereLight(0xffffff, 0xb9c9a0, 1),
    sun = new T.DirectionalLight(0xffffff, 1.5);
  sun.castShadow = state3d.tier < 1;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 14, bottom: -8, near: 1, far: 50 });
  sun.shadow.bias = -0.0006;
  scene.add(hemi, sun, sun.target);
  // Rendu logiciel (pas de carte graphique : SwiftShader, llvmpipe…) : on démarre directement en mode léger.
  try {
    const gl = renderer.getContext(),
      ext = gl.getExtension("WEBGL_debug_renderer_info"),
      name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : "";
    if (/swiftshader|llvmpipe|software|basic render/i.test(name)) {
      state3d.tier = 2;
      state3d.gap = 160;
      renderer.shadowMap.enabled = false;
      renderer.setPixelRatio(0.6);
    }
  } catch {}
  const sh = { canvas, renderer, scene, camera, hemi, sun, world: null, anim: null, bgTex: null, sky: null, t0: performance.now() };
  let down = null;
  canvas.addEventListener("pointerdown", (e) => {
    down = e.clientX;
    state3d.dragging = true;
    canvas.setPointerCapture?.(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (down === null) return;
    state3d.yaw += (e.clientX - down) * 0.008;
    down = e.clientX;
    frame();
  });
  const up = () => {
    down = null;
    state3d.dragging = false;
  };
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") state3d.yaw -= 0.2;
    else if (e.key === "ArrowRight") state3d.yaw += 0.2;
    else return;
    e.preventDefault();
    frame();
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    state3d.failed = true;
    state3d.host?.classList.remove("ready");
  });
  return sh;
}
function skyTexture(p) {
  const c = document.createElement("canvas");
  c.width = 2;
  c.height = 256;
  const g = c.getContext("2d"),
    gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, PHASE[p].top);
  gr.addColorStop(1, PHASE[p].bottom);
  g.fillStyle = gr;
  g.fillRect(0, 0, 2, 256);
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}
function disposeTree(o) {
  o.traverse((m) => {
    m.geometry?.dispose?.();
    const ms = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
    ms.forEach((x) => x.dispose?.());
  });
}
function setup(rpg, phase, motion) {
  const sh = shared,
    P = PHASE[phase];
  if (sh.world) {
    sh.scene.remove(sh.world);
    disposeTree(sh.world);
  }
  sh.bgTex?.dispose();
  sh.bgTex = skyTexture(phase);
  sh.scene.background = sh.bgTex;
  sh.hemi.color.set(P.hemi[0]);
  sh.hemi.groundColor.set(P.hemi[1]);
  sh.hemi.intensity = P.hemi[2];
  sh.sun.color.set(P.sun[0]);
  sh.sun.intensity = P.sun[1];
  sh.sun.position.set(...P.sun[2]);
  sh.world = new T.Group();
  sh.anim = { flags: [], clouds: [], twinkle: [], flames: [], drops: [], wings: [], fliers: [], aurora: [], weather: null, blades: null, balloon: null, island: null, stars: null, motion };
  sh.scene.add(sh.world);
  build(sh.world, sh.anim, rpg, phase);
  // Soleil / lune et étoiles
  const bodyPos = phase === "dusk" ? [-24, 5, -26] : [20, 22, -30];
  const body = new T.Mesh(new T.SphereGeometry(phase === "dusk" ? 3.4 : 2.6, 20, 16), new T.MeshBasicMaterial({ color: col(phase === "dusk" ? "#ffd08a" : "#fff4cb") }));
  body.position.set(...bodyPos);
  sh.world.add(body);
  glowSprite(...bodyPos, 14, phase === "dusk" ? "#ffb070" : phase === "night" ? "#c8d0ff" : "#fff3c0", phase === "night" ? 0.5 : 0.55, sh.world);
  if (phase === "night") {
    const n = 150,
      pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2,
        e = 0.15 + Math.random() * 1.1;
      pos.set([Math.cos(a) * 55 * Math.cos(e) * 0.9, 6 + Math.sin(e) * 45, -20 - Math.abs(Math.sin(a)) * 30], i * 3);
    }
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.BufferAttribute(pos, 3));
    dotTex ||= radial([[0, "rgba(255,255,255,1)"], [0.55, "rgba(255,255,255,.9)"], [1, "rgba(255,255,255,0)"]]);
    const stars = new T.Points(geo, new T.PointsMaterial({ color: col("#fff6cc"), size: 0.9, map: dotTex, transparent: true, depthWrite: false, fog: false }));
    sh.world.add(stars);
    sh.anim.stars = stars;
  }
}
function layout() {
  const sh = shared,
    h = state3d.host;
  if (!h) return;
  const w = Math.max(160, h.clientWidth),
    ht = Math.max(120, h.clientHeight || h.clientWidth / 1.46),
    asp = w / ht;
  sh.renderer.setSize(w, ht, false);
  sh.camera.aspect = asp;
  sh.camera.updateProjectionMatrix();
  sh.dist = Math.min(66, Math.max(35, 46 / asp));
}
function update(t, dt) {
  const sh = shared,
    a = sh.anim,
    cam = sh.camera;
  if (!a) return;
  const m = a.motion;
  const yaw = state3d.yaw + (m && !state3d.dragging ? Math.sin(t * 0.18) * 0.28 : 0),
    d = sh.dist || 28,
    el = 0.34;
  cam.position.set(Math.sin(yaw) * d * Math.cos(el), 3 + Math.sin(el) * d, Math.cos(yaw) * d * Math.cos(el));
  cam.lookAt(0, 2.2, 0);
  if (!m) return;
  a.island.position.y = Math.sin(t * 0.9) * 0.14;
  for (const f of a.flags) {
    const p = f.geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i + 2] = f.base[i + 2] + Math.sin(f.base[i] * 5 - t * 5) * 0.09 * f.base[i];
    f.geo.attributes.position.needsUpdate = true;
  }
  for (const c of a.clouds) c.g.position.x = c.x + Math.sin(t * 0.08 * c.sp * 6 + c.ph) * 2.5;
  a.twinkle.forEach((s, i) => s.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(t * 2 + i * 0.9))));
  a.flames.forEach((f, i) => f.scale.set(1, 0.85 + 0.25 * Math.sin(t * 11 + i), 1));
  a.drops.forEach((d2) => {
    const k = (t * 0.9 + d2.ph) % 1;
    d2.m.position.set(Math.cos(d2.a) * k * 0.9, 1.7 + Math.sin(k * Math.PI) * 0.8 - k * k * 0.7 * 1.0, Math.sin(d2.a) * k * 0.9);
  });
  if (a.blades) a.blades.rotation.z = -t * 0.7;
  if (a.balloon) a.balloon.position.y = 8.5 + Math.sin(t * 0.8) * 0.5;
  a.aurora.forEach((u) => {
    const p = u.geo.attributes.position.array;
    for (let i = 0; i < p.length; i += 3) p[i + 1] = u.base[i + 1] + Math.sin(u.base[i] * 0.3 + t * 0.6 + u.ph) * 0.9;
    u.geo.attributes.position.needsUpdate = true;
  });
  for (const w of a.wings) {
    const r = Math.sin(t * w.speed) * 0.7;
    w.L.rotation.z = r;
    w.R.rotation.z = -r;
    // L ouvre vers +x, R vers -x (aile retournée) : rotation symétrique
  }
  for (const f of a.fliers) {
    const ang = t * f.sp + f.ph;
    if (f.wander) {
      f.g.position.set(f.ox + Math.cos(ang * 1.3) * f.r * 0.5, f.h + Math.sin(ang * 2) * f.bob, f.oz + Math.sin(ang) * f.r * 0.4);
      f.g.rotation.y = Math.cos(ang * 1.3) > 0 ? 1.5 : -1.5;
    } else {
      f.g.position.set(Math.sin(ang) * f.r, f.h + Math.sin(ang * 2.3) * f.bob, Math.cos(ang) * f.r);
      f.g.rotation.y = ang + (f.orbit ? 0 : Math.PI / 2);
      if (f.orbit) f.g.rotation.y = ang + Math.PI;
    }
  }
  if (a.stars) a.stars.material.opacity = 0.75 + 0.25 * Math.sin(t * 1.7);
  const wz = a.weather;
  if (wz) {
    const p = wz.geo.attributes.position.array;
    for (let i = 0; i < wz.n; i++) {
      let x = p[i * 3], y = p[i * 3 + 1], z = p[i * 3 + 2];
      const s = wz.seed[i];
      if (wz.kind === "weather-rain") { y -= dt * 11; x -= dt * 0.8; }
      else if (wz.kind === "weather-snow") { y -= dt * 1.1; x += Math.sin(t + s) * dt * 0.5; }
      else if (wz.kind === "weather-petals") { y -= dt * 0.9; x += Math.sin(t * 0.8 + s) * dt * 1.2 + dt * 0.4; z += Math.cos(t * 0.7 + s) * dt * 0.6; }
      else if (wz.kind === "weather-fireflies") { x += Math.sin(t * 0.6 + s * 3) * dt * 0.8; y += Math.cos(t * 0.7 + s * 2) * dt * 0.5; z += Math.cos(t * 0.5 + s) * dt * 0.8; if (y < 0.4) y = 0.4; if (y > 5) y = 5; }
      else { y += dt * 0.5; }
      if (wz.kind === "weather-fireflies") { x = Math.max(-10, Math.min(10, x)); z = Math.max(-10, Math.min(10, z)); }
      else if (y < 0) y += 15;
      else if (y > 15) y -= 15;
      p[i * 3] = x; p[i * 3 + 1] = y; p[i * 3 + 2] = z;
    }
    wz.geo.attributes.position.needsUpdate = true;
  }
}
function frame() {
  if (!shared || !state3d.host || !shared.canvas.isConnected) return;
  const now = performance.now() / 1000;
  update(now, Math.min(0.1, now - (state3d.last || now)));
  state3d.last = now;
  try {
    shared.renderer.render(shared.scene, shared.camera);
  } catch {
    state3d.failed = true;
    state3d.host.classList.remove("ready");
  }
}
function loop() {
  if (!state3d.running) return;
  if (!shared.canvas.isConnected || state3d.failed || !shared.anim?.motion) {
    state3d.running = false;
    return;
  }
  // ~30 images/s suffisent pour ce décor doux et ménagent la batterie de la tablette
  const t0 = performance.now();
  if (t0 - state3d.lastDraw >= state3d.gap) {
    state3d.lastDraw = t0;
    frame();
    // Appareil lent : on allège par paliers (sans ombres, image plus petite, moins d'images/s)
    // plutôt que de ralentir toute l'application.
  }
  {
    // Le coût réel est côté carte graphique : on le mesure par l'intervalle entre deux images du navigateur.
    const dtRaf = t0 - (state3d.prevRaf || t0);
    state3d.prevRaf = t0;
    if (dtRaf > 0 && dtRaf < 1000) state3d.avg = state3d.avg ? state3d.avg * 0.75 + dtRaf * 0.25 : dtRaf;
    const tier = state3d.avg > 110 ? 2 : state3d.avg > 45 ? 1 : 0;
    if (tier > state3d.tier) {
      state3d.tier = tier;
      state3d.gap = tier === 2 ? 160 : 66;
      shared.sun.castShadow = false;
      shared.renderer.shadowMap.enabled = false;
      shared.renderer.setPixelRatio(tier === 2 ? 0.6 : 1);
      layout();
      shared.world?.traverse((m) => m.material && (m.material.needsUpdate = true));
    }
  }
  requestAnimationFrame(loop);
}
const ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => { if (shared && state3d.host) { layout(); frame(); } }) : null;

// Monte le château 3D dans `host` (un élément .castle3d) ; renvoie true si la 3D est affichée.
export function mountCastle3d(host, rpg, { time, motion = true } = {}) {
  if (state3d.failed && !shared?.renderer.getContext().isContextLost()) state3d.failed = false;
  if (state3d.failed) return false;
  try {
    shared ||= makeShared();
    const phase = ["day", "dusk", "night"].includes(time) ? time : phaseNow(),
      still = !motion || matchMedia("(prefers-reduced-motion: reduce)").matches,
      sig = JSON.stringify([rpg.castle, phase, !still]);
    if (state3d.host && state3d.host !== host) ro?.unobserve(state3d.host);
    state3d.host = host;
    host.appendChild(shared.canvas);
    ro?.observe(host);
    layout();
    if (sig !== state3d.sig) {
      setup(rpg, phase, !still);
      state3d.sig = sig;
    }
    host.classList.add("ready");
    host.dataset.phase = phase;
    frame();
    if (!still && !state3d.running) {
      state3d.running = true;
      requestAnimationFrame(loop);
    }
    return true;
  } catch (e) {
    state3d.failed = true;
    host.classList.remove("ready");
    return false;
  }
}
export const castle3dDebug = () => ({ yaw: state3d.yaw, running: state3d.running, failed: state3d.failed, sig: state3d.sig });
