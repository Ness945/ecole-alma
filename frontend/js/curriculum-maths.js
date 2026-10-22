import { pick, between, numberOptions, shuffled, parseBank, fromBank } from "./curriculum-core.js";

const things = ["bonbons", "billes", "cartes", "fleurs", "crayons", "gâteaux", "pommes"];
const holders = ["enfants", "boîtes", "assiettes", "paniers", "sacs"];
const names = ["Luna", "Safran", "Brindille", "Épine", "Plume", "Braise"];

const lengthBank = parseBank([
  "Quelle unité pour mesurer la longueur d’un crayon ?|cm|km|kg|Un crayon est petit : on le mesure en centimètres.",
  "Quelle unité pour mesurer la longueur de la classe ?|m|cm|km|La classe se mesure en mètres.",
  "Quelle unité pour mesurer la distance entre deux villes ?|km|cm|m|Pour les longues distances, on utilise le kilomètre.",
  "1 mètre, c’est combien de centimètres ?|100|10|1000|1 m = 100 cm.",
  "Quelle unité pour mesurer ta gomme ?|cm|m|km|Un petit objet se mesure en centimètres.",
  "Quel instrument sert à mesurer une longueur ?|la règle|la balance|le thermomètre|La règle graduée mesure les longueurs.",
  "Combien de centimètres y a-t-il dans 2 mètres ?|200|20|2000|2 m = 2 × 100 cm = 200 cm.",
  "Combien de centimètres y a-t-il dans 1 m 20 cm ?|120|1020|21|1 m = 100 cm, plus 20 cm : 100 + 20 = 120.",
  "300 cm, c’est combien de mètres ?|3|30|300|100 cm font 1 m : 300 cm = 3 m.",
  "Un lapin mesure environ 40 …|cm|km|m|40 cm : c’est plus petit qu’un mètre.",
]);
const massBank = parseBank([
  "Quelle unité pour peser une pomme ?|g|kg|L|Une pomme est légère : on la pèse en grammes.",
  "Quelle unité pour peser un enfant ?|kg|g|L|Un enfant se pèse en kilogrammes.",
  "1 kg, c’est combien de grammes ?|1000|100|10|1 kg = 1 000 g.",
  "Quelle unité pour mesurer l’eau d’une bouteille ?|L|kg|cm|L’eau d’une bouteille se mesure en litres.",
  "Quel instrument sert à peser ?|la balance|la règle|l’horloge|La balance donne la masse.",
  "Une plume est légère. Elle pèse quelques …|g|kg|L|Quelques grammes seulement.",
  "Un sac de pommes de terre pèse 2 …|kg|g|cm|Un gros sac se pèse en kilogrammes.",
  "Combien de grammes y a-t-il dans 2 kg ?|2000|200|20|2 kg = 2 × 1 000 g.",
  "Une bouteille de lait contient 1 …|L|kg|m|Les liquides se mesurent en litres.",
  "Un litre d’eau, c’est plus ou moins qu’un demi-litre ?|plus|moins|pareil|Un litre = deux demi-litres : c’est plus.",
]);
const lineBank = parseBank([
  "Avec quel outil trace-t-on une ligne droite ?|la règle|le compas|les ciseaux|La règle permet de tracer droit.",
  "Avec quel outil vérifie-t-on un angle droit ?|l’équerre|la règle|le crayon|L’équerre a un angle droit pour comparer.",
  "Une ligne droite qui commence ici et finit là s’appelle un …|segment|rond|coin|Un segment a un début et une fin.",
  "Le coin d’une feuille de papier est un angle …|droit|rond|courbe|Le coin d’une feuille est un angle droit.",
  "Combien d’angles droits a un carré ?|4|2|0|Un carré a quatre coins : tous sont des angles droits.",
  "Combien d’angles droits a un rectangle ?|4|3|2|Comme le carré, le rectangle a quatre angles droits.",
  "Un trait qui ne tourne jamais est …|droit|courbe|rond|Droit veut dire « sans courbe ».",
  "Quel trait n’est pas droit ?|une vague|un segment|le bord d’une règle|Une vague se courbe.",
  "Un triangle a combien de côtés ?|3|4|5|Tri- veut dire trois : trois côtés.",
  "Que mesure-t-on avec une règle graduée ?|une longueur|une masse|une durée|La règle mesure des longueurs.",
]);
const symBank = parseBank([
  "Quelle lettre a un axe de symétrie vertical ?|A|F|G|On peut plier le A en deux : les deux côtés se recouvrent.",
  "Quelle lettre a un axe de symétrie vertical ?|M|R|P|Le M se plie en deux moitiés pareilles.",
  "Les deux ailes d’un papillon sont …|symétriques|différentes|rondes|Les deux moitiés sont identiques, comme dans un miroir.",
  "Si on plie une figure sur son axe de symétrie, les deux côtés …|se superposent|se séparent|disparaissent|Les deux côtés se recouvrent exactement.",
  "Quelle forme a un axe de symétrie ?|le cœur|le zigzag|la spirale|Le cœur est pareil à gauche et à droite.",
  "Dans un miroir, ton reflet est …|symétrique|plus petit|différent|Le reflet est le symétrique.",
  "Quelle lettre a un axe de symétrie horizontal ?|B|A|P|On plie B en haut et en bas : les deux moitiés se recouvrent.",
  "Un carré a combien d’axes de symétrie ?|4|1|2|Deux par les milieux et deux par les coins : quatre.",
  "Quelle lettre a un axe de symétrie vertical ?|T|L|J|Le T est pareil à gauche et à droite.",
  "Un cercle a …|beaucoup d’axes de symétrie|aucun axe|un seul axe|On peut le plier de mille façons.",
]);
const solidBank = parseBank([
  "Quel solide ressemble à un dé ?|le cube|la boule|le cône|Un dé a six faces carrées : c’est un cube.",
  "Quel solide ressemble à un ballon ?|la boule|le cube|le pavé|Un ballon est tout rond : c’est une boule.",
  "Quel solide ressemble à une boîte de conserve ?|le cylindre|le cube|la boule|Deux disques et une face courbe : un cylindre.",
  "Quel solide ressemble à une boîte à chaussures ?|le pavé|la boule|le cylindre|Ses faces sont des rectangles : un pavé.",
  "Quel solide ressemble à un cornet de glace ?|le cône|le cube|la boule|Un cône a une pointe et une face ronde.",
  "Combien de faces a un cube ?|6|4|8|Un cube a 6 faces carrées.",
  "Les faces d’un cube sont des …|carrés|ronds|triangles|Toutes les faces d’un cube sont des carrés.",
  "Quel solide roule le mieux ?|la boule|le cube|le pavé|Une boule n’a pas de coins : elle roule.",
  "Combien de sommets a un cube ?|8|6|4|Un cube a 8 coins, appelés sommets.",
  "Combien d’arêtes a un cube ?|12|6|8|Un cube a 12 arêtes (les bords).",
]);

export function mathsExercise(q, id, seed, turn, r, tier = 1) {
  const choice = q.type === "choice";
  const num = (answer, hint, spread) => {
    q.answer = String(answer);
    q.hint = hint;
    q.options = numberOptions(answer, r, spread);
    q.numeric = true;
  };
  switch (id) {
    case "count_step": {
      const step = pick(r, [2, 5, 10]),
        down = tier === 0 ? false : tier === 2 ? seed % 2 === 0 : seed % 5 === 4,
        start = step * (tier === 0 ? between(r, 0, 4) : tier === 2 ? between(r, down ? 8 : 5, down ? 15 : 12) : between(r, down ? 6 : 0, down ? 12 : 8)),
        seq = Array.from({ length: 5 }, (_, i) => start + (down ? -i : i) * step),
        hole = between(r, 1, 4);
      q.prompt = `Compte de ${step} en ${step}${down ? " en reculant" : ""} : ${seq.map((v, i) => (i === hole ? "…" : v)).join(", ")}. Quel nombre manque ?`;
      num(seq[hole], `On ${down ? "enlève" : "ajoute"} ${step} à chaque pas : ${seq[hole - 1]} ${down ? "−" : "+"} ${step} = ${seq[hole]}.`, [step, 1, 10]);
      return true;
    }
    case "neighbors": {
      const n =
          tier === 0
            ? between(r, 10, 48)
            : tier === 2
              ? pick(r, [9 + 10 * between(r, 10, 98), 99 + 100 * between(r, 1, 8), between(r, 100, 998)])
              : pick(r, [between(r, 10, 98), 9 + 10 * between(r, 1, 9), 99, 109, 199 + 100 * between(r, 0, 6)]),
        after = seed % 2 === 0,
        ans = after ? n + 1 : n - 1;
      q.prompt = `Quel nombre vient juste ${after ? "après" : "avant"} ${n} ?`;
      num(ans, after ? `Après ${n}, on ajoute 1 : ${n} + 1 = ${ans}. Attention : après un nombre qui finit par 9, on change de dizaine.` : `Avant ${n}, on enlève 1 : ${n} − 1 = ${ans}.`, [1, 2, 10]);
      return true;
    }
    case "order": {
      const nums = new Set();
      const [olo, ohi, ocount] = tier === 0 ? [10, 49, 3] : tier === 2 ? [100, 999, 4] : [10, 99, 3];
      while (nums.size < ocount) nums.add(between(r, olo, ohi));
      const list = [...nums],
        asc = seed % 2 === 0,
        sorted = [...list].sort((a, b) => (asc ? a - b : b - a));
      const fmt = (a) => a.join(", ");
      q.prompt = `Range ces nombres ${asc ? "du plus petit au plus grand" : "du plus grand au plus petit"} : ${list.join(" ; ")}.`;
      q.answer = fmt(sorted);
      q.accepted = [sorted.join(" "), sorted.join(","), sorted.join(" ; "), sorted.join(";"), sorted.join(" - "), sorted.join("-")];
      q.options = [q.answer, fmt([...sorted].reverse()), fmt([sorted[1], sorted[0], ...sorted.slice(2)])];
      q.hint = `Compare d’abord les dizaines. ${asc ? "Le plus petit d’abord" : "Le plus grand d’abord"} : ${q.answer}.`;
      return true;
    }
    case "evenodd": {
      const n = tier === 0 ? between(r, 0, 20) : tier === 2 ? between(r, 100, 999) : between(r, 0, 99);
      q.prompt = `Le nombre ${n} est-il pair ou impair ?`;
      q.answer = n % 2 === 0 ? "pair" : "impair";
      q.options = ["pair", "impair"];
      q.tolerant = true;
      q.hint = `Un nombre pair finit par 0, 2, 4, 6 ou 8 : on peut faire des paires sans reste. ${n} finit par ${n % 10}.`;
      return true;
    }
    case "mental10": {
      const kind = pick(r, tier === 0 ? ["+10", "−10"] : tier === 2 ? ["+100", "−100", "+9", "−9"] : ["+10", "−10", "+100", "−100", "+9", "−9"]),
        n = kind.endsWith("100") ? between(r, 2, 8) * 100 + between(r, 0, 99) : tier === 2 ? between(r, 120, 890) : between(r, 20, 90);
      const ans = { "+10": n + 10, "−10": n - 10, "+100": n + 100, "−100": n - 100, "+9": n + 9, "−9": n - 9 }[kind];
      q.prompt = `Combien font ${n} ${kind[0]} ${kind.slice(1)} ?`;
      num(ans, {
        "+10": `Ajouter 10 : le chiffre des dizaines monte de 1. ${n} → ${ans}.`,
        "−10": `Enlever 10 : le chiffre des dizaines baisse de 1. ${n} → ${ans}.`,
        "+100": `Ajouter 100 : le chiffre des centaines monte de 1. ${n} → ${ans}.`,
        "−100": `Enlever 100 : le chiffre des centaines baisse de 1. ${n} → ${ans}.`,
        "+9": `Ajouter 9, c’est ajouter 10 puis enlever 1 : ${n} + 10 = ${n + 10}, puis − 1 = ${ans}.`,
        "−9": `Enlever 9, c’est enlever 10 puis ajouter 1 : ${n} − 10 = ${n - 10}, puis + 1 = ${ans}.`,
      }[kind], [1, 10, 9]);
      return true;
    }
    case "add_carry": {
      const ua = between(r, 4, 9),
        ub = between(r, 10 - ua, 9),
        ta = tier === 0 ? between(r, 1, 3) : tier === 2 ? between(r, 4, 7) : between(r, 1, 6),
        tb = between(r, 1, Math.max(1, (tier === 0 ? 4 : 8) - ta));
      const a = ta * 10 + ua,
        b = tb * 10 + ub;
      q.prompt = `Combien font ${a} + ${b} ?`;
      num(a + b, `Sépare : ${ta * 10} + ${tb * 10} = ${(ta + tb) * 10} ; ${ua} + ${ub} = ${ua + ub} ; puis ${(ta + tb) * 10} + ${ua + ub} = ${a + b}. Les unités dépassent 10 : on fait une retenue.`, [1, 10, 2]);
      return true;
    }
    case "sub_borrow": {
      const ua = between(r, 0, 5),
        ub = between(r, ua + 1, 9),
        ta = tier === 0 ? between(r, 3, 5) : between(r, 4, 9),
        tb = tier === 2 ? between(r, Math.ceil(ta / 2), ta - 1) : between(r, 1, tier === 0 ? Math.min(2, ta - 1) : ta - 1);
      const a = ta * 10 + ua,
        b = tb * 10 + ub;
      q.prompt = `Combien font ${a} − ${b} ?`;
      num(a - b, `${a} − ${tb * 10} = ${a - tb * 10} ; puis ${a - tb * 10} − ${ub} = ${a - b}. On ne peut pas enlever ${ub} à ${ua} : on casse une dizaine.`, [1, 10, 2]);
      return true;
    }
    case "tables": {
      const t = pick(r, tier === 0 ? [2, 5, 10] : [2, 3, 4, 5, 10]),
        n = tier === 0 ? between(r, 1, 5) : tier === 2 ? between(r, 6, 10) : between(r, 1, 10),
        missing = tier === 2 ? turn % 3 !== 0 : turn % 3 === 2;
      if (missing) {
        q.prompt = `${t} × … = ${t * n}. Quel nombre manque ?`;
        num(n, `Compte de ${t} en ${t} jusqu’à ${t * n} : ${Array.from({ length: n }, (_, i) => t * (i + 1)).join(", ")}. Il y a ${n} pas.`, [1, 2, 3]);
      } else {
        q.prompt = `Combien font ${t} × ${n} ?`;
        num(t * n, `Compte de ${t} en ${t} : ${Array.from({ length: n }, (_, i) => t * (i + 1)).join(", ")}.`, [t, 1, 2]);
      }
      return true;
    }
    case "sharing": {
      const k = tier === 0 ? between(r, 2, 3) : between(r, 2, 5),
        m = tier === 0 ? between(r, 2, 4) : tier === 2 ? between(r, 5, 9) : between(r, 2, 6),
        thing = pick(r, things),
        holder = pick(r, holders);
      if (seed % 2) {
        q.prompt = `${k * m} ${thing} sont partagés en parts égales entre ${k} ${holder}. Combien chaque ${holder.slice(0, -1)} en reçoit-il ?`;
        num(m, `Cherche le nombre qui, multiplié par ${k}, donne ${k * m} : ${k} × ${m} = ${k * m}.`, [1, 2, k]);
      } else {
        q.prompt = `On range ${k * m} ${thing} par paquets de ${m}. Combien de paquets ?`;
        num(k, `Combien de fois ${m} dans ${k * m} ? ${m} × ${k} = ${k * m}.`, [1, 2, m]);
      }
      return true;
    }
    case "problem2": {
      const [n1, n2] = shuffled(r, names),
        a = tier === 0 ? between(r, 4, 9) : tier === 2 ? between(r, 15, 40) : between(r, 6, 15),
        b = tier === 0 ? between(r, 1, 4) : tier === 2 ? between(r, 4, 12) : between(r, 2, 6),
        c = tier === 0 ? between(r, 1, 3) : tier === 2 ? between(r, 3, 9) : between(r, 1, 5),
        form = seed % 4;
      const f = [
        [`${n1} a ${a} cerises. Elle en reçoit ${b}, puis elle en mange ${c}. Combien lui en reste-t-il ?`, a + b - c, `D’abord ${a} + ${b} = ${a + b}. Puis ${a + b} − ${c} = ${a + b - c}.`],
        [`${n1} a ${a} billes. Elle en perd ${c}, puis en gagne ${b}. Combien en a-t-elle ?`, a - c + b, `D’abord ${a} − ${c} = ${a - c}. Puis ${a - c} + ${b} = ${a - c + b}.`],
        [`${n1} a ${a} fleurs et ${n2} en a ${b}. Elles en offrent ${c} à Luna. Combien leur en reste-t-il ?`, a + b - c, `D’abord ${a} + ${b} = ${a + b}. Puis ${a + b} − ${c} = ${a + b - c}.`],
        [`Un panier contient ${b} fruits. ${n1} remplit ${Math.min(c, 3) + 1} paniers pareils, puis ajoute ${c} fruits. Combien de fruits en tout ?`, b * (Math.min(c, 3) + 1) + c, `D’abord ${b} × ${Math.min(c, 3) + 1} = ${b * (Math.min(c, 3) + 1)}. Puis on ajoute ${c}.`],
      ][form];
      q.prompt = f[0];
      num(f[1], `Fais deux petits calculs, l’un après l’autre. ${f[2]}`, [1, 2, 10]);
      q.type = choice ? "choice" : "input";
      q.dimension = choice ? "recognition" : "transfer";
      return true;
    }
    case "length":
      fromBank(q, lengthBank, seed, turn, r);
      q.numeric = /^\d+$/.test(q.answer);
      return true;
    case "mass_cap":
      fromBank(q, massBank, seed, turn, r);
      q.numeric = /^\d+$/.test(q.answer);
      return true;
    case "lines":
      fromBank(q, lineBank, seed, turn, r);
      q.numeric = /^\d+$/.test(q.answer);
      return true;
    case "symmetry":
      fromBank(q, symBank, seed, turn, r, { writable: false });
      return true;
    case "solids":
      fromBank(q, solidBank, seed, turn, r);
      q.numeric = /^\d+$/.test(q.answer);
      return true;
    case "duration": {
      const h = between(r, 1, 8),
        d = between(r, 1, 3),
        v = seed % 6;
      if (v === 0) {
        q.prompt = "1 heure, c’est combien de minutes ?";
        num(60, "Une heure dure 60 minutes : le tour complet de la grande aiguille.", [10, 30, 20]);
      } else if (v === 1) {
        q.prompt = `Il est ${h}h. Quelle heure sera-t-il dans ${d} heure${d > 1 ? "s" : ""} ?`;
        q.answer = `${h + d}h`;
        q.accepted = [`${h + d}`, `${h + d} h`, `${h + d} heures`, `${h + d}:00`, `${h + d}h00`];
        q.options = [`${h + d}h`, `${h + d + 1}h`, `${h - 1 || 12}h`];
        q.hint = `On avance de ${d} sur l’horloge : ${h} + ${d} = ${h + d}.`;
      } else if (v === 2) {
        q.prompt = `Un film commence à ${h}h et dure ${d} heure${d > 1 ? "s" : ""}. À quelle heure finit-il ?`;
        q.answer = `${h + d}h`;
        q.accepted = [`${h + d}`, `${h + d} h`, `${h + d} heures`, `${h + d}:00`, `${h + d}h00`];
        q.options = [`${h + d}h`, `${h}h`, `${h + d + 2}h`];
        q.hint = `${h} + ${d} = ${h + d}. Il finit à ${h + d}h.`;
      } else if (v === 3) {
        q.prompt = "30 minutes, c’est combien d’heure ?";
        q.answer = "une demi-heure";
        q.options = ["une demi-heure", "une heure", "un quart d’heure"];
        q.type = "choice";
        q.hint = "30 minutes, c’est la moitié de 60 minutes : une demi-heure.";
      } else if (v === 4) {
        q.prompt = "Une semaine, c’est combien de jours ?";
        num(7, "lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche : 7 jours.", [1, 2, 3]);
      } else {
        q.prompt = "Un jour, c’est combien d’heures ?";
        num(24, "Une journée entière dure 24 heures, la nuit comprise.", [12, 2, 10]);
      }
      return true;
    }
    case "grid": {
      const cols = "ABCDE",
        c = between(r, 0, 4),
        row = between(r, 1, 5);
      const cell = 40,
        dots = [];
      let svg = '<svg class="learning-clock" viewBox="0 0 250 250" role="img" aria-label="Quadrillage de 5 colonnes A à E et 5 lignes 1 à 5">';
      for (let i = 0; i < 5; i++) {
        svg += `<text x="${35 + i * cell + 20}" y="18" text-anchor="middle" font-size="16" fill="#454058">${cols[i]}</text><text x="14" y="${30 + i * cell + 28}" text-anchor="middle" font-size="16" fill="#454058">${i + 1}</text>`;
        for (let j = 0; j < 5; j++) svg += `<rect x="${35 + i * cell}" y="${30 + j * cell}" width="${cell}" height="${cell}" fill="#fffdf8" stroke="#b8a9c9" stroke-width="2"/>`;
      }
      svg += `<circle cx="${35 + c * cell + 20}" cy="${30 + (row - 1) * cell + 20}" r="12" fill="#d2556b"/></svg>`;
      q.visual = svg;
      q.prompt = "Dans quelle case se trouve le point rouge ? (la lettre de la colonne, puis le numéro de la ligne)";
      q.answer = `${cols[c]}${row}`;
      q.accepted = [`${cols[c]} ${row}`];
      q.options = [q.answer, `${cols[(c + 1) % 5]}${row}`, `${cols[c]}${(row % 5) + 1}`, `${cols[row - 1]}${c + 1}`];
      q.tolerant = false;
      q.hint = `Descends la colonne ${cols[c]}, puis arrête-toi à la ligne ${row} : ${cols[c]}${row}.`;
      return true;
    }
    case "data": {
      const fruits = shuffled(r, [["🍎", "pommes"], ["🍌", "bananes"], ["🍓", "fraises"], ["🍇", "raisins"]]).slice(0, 3),
        counts = [between(r, 2, 8), between(r, 2, 8), between(r, 2, 8)];
      while (new Set(counts).size < 3) counts[between(r, 0, 2)] = between(r, 1, 9);
      q.visual = `<div class="pictogram">${fruits.map((f, i) => `<p><strong>${f[1]}</strong> ${f[0].repeat(counts[i])} (1 emoji = 1 enfant)</p>`).join("")}</div>`;
      const top = counts.indexOf(Math.max(...counts)),
        i = between(r, 0, 2),
        v = seed % 3;
      if (v === 0) {
        q.prompt = `Combien d’enfants ont choisi les ${fruits[i][1]} ?`;
        num(counts[i], `On compte les ${fruits[i][0]} : il y en a ${counts[i]}.`, [1, 2, 3]);
      } else if (v === 1) {
        q.prompt = "Quel fruit a été le plus choisi ?";
        q.answer = fruits[top][1];
        q.options = fruits.map((f) => f[1]);
        q.tolerant = true;
        q.hint = `Le plus long rang d’emojis est celui des ${fruits[top][1]} (${counts[top]}).`;
      } else {
        const j = (i + 1) % 3;
        q.prompt = `Combien d’enfants en plus ont choisi les ${fruits[i][1]} par rapport aux ${fruits[j][1]} ? (écris 0 s’il n’y en a pas plus)`;
        const diff = Math.max(0, counts[i] - counts[j]);
        num(diff, `${counts[i]} − ${counts[j]} = ${counts[i] - counts[j]}. S’il y en a moins, la réponse est 0.`, [1, 2, 3]);
      }
      return true;
    }
    default:
      return false;
  }
}
export const mathsIds = ["count_step", "neighbors", "order", "evenodd", "mental10", "add_carry", "sub_borrow", "tables", "sharing", "problem2", "length", "mass_cap", "duration", "lines", "symmetry", "grid", "solids", "data"];
