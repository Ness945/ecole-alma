// Erreurs typiques reconnues d'après l'énoncé, la réponse donnée et la réponse attendue.
// Utilisé par le suivi parent (étiquette) et par l'explication à l'enfant (conseil), sans dépendance.
const nums = (t) => (String(t ?? "").match(/\d+/g) || []).map(Number);
const plain = (t) =>
  String(t ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .trim();
const slip = (code, label, tip) => ({ code, label, tip });
export function slipOf({ skill, prompt, answer, expected }) {
  const a = String(answer ?? "").trim(),
    x = String(expected ?? "").trim();
  if (!a || a === x) return null;
  const n = nums(prompt),
    na = Number(a.replace(",", ".")),
    isNum = a !== "" && Number.isFinite(na);
  switch (skill) {
    case "add_carry": {
      if (n.length >= 2 && isNum) {
        const [p, q] = n,
          noCarry = (Math.floor(p / 10) + Math.floor(q / 10)) * 10 + ((p % 10) + (q % 10)) % 10;
        if (na === noCarry) return slip("carry", "Oublie la retenue", "Quand les unités font 10 ou plus, on fait un paquet de dix et on l’ajoute aux dizaines.");
        if (na === p + q - 10 || na === p + q + 10) return slip("off10", "Se trompe d’une dizaine", "Vérifie le chiffre des dizaines après la retenue.");
      }
      return null;
    }
    case "sub_borrow": {
      if (n.length >= 2 && isNum) {
        const [p, q] = n,
          wrong = (Math.floor(p / 10) - Math.floor(q / 10)) * 10 + Math.abs((p % 10) - (q % 10));
        if (na === wrong) return slip("borrow", "Soustrait le plus petit chiffre du plus grand", "On ne peut pas retirer un grand chiffre d’un petit : on casse une dizaine pour avoir dix unités de plus.");
        if (na === p + q) return slip("op", "Additionne au lieu de soustraire", "Le signe − veut dire qu’on enlève.");
      }
      return null;
    }
    case "tables":
    case "multiplication":
      if (n.length >= 2 && isNum && na === n[0] + n[1] && !/…/.test(String(prompt))) return slip("op", "Additionne au lieu de multiplier", "Multiplier, c’est répéter : 3 × 4 = 4 + 4 + 4.");
      return null;
    case "sharing":
      if (n.length >= 2 && isNum && na === n[0] * n[1]) return slip("op", "Multiplie au lieu de partager", "Partager, c’est répartir en parts égales : on cherche une part, pas le total.");
      if (n.length >= 2 && isNum && na === n[0]) return slip("copy", "Recopie le nombre de la consigne", "Relis la question : que cherche-t-on ?");
      return null;
    case "mental10":
      if (isNum && Number(x) && Math.abs(na - Number(x)) === 10) return slip("off10", "Se trompe d’une dizaine", "Pour +10 ou −10, seul le chiffre des dizaines change.");
      if (isNum && Number(x) && Math.abs(na - Number(x)) === 1) return slip("off1", "Se trompe de 1 (+9 / −9)", "Ajouter 9, c’est ajouter 10 puis enlever 1.");
      return null;
    case "plural":
    case "agreement": {
      const pa = plain(a),
        px = plain(x);
      if (px.endsWith("s") && px.slice(0, -1) === pa) return slip("plural_s", "Oublie la marque du pluriel (-s)", "Quand il y en a plusieurs, on ajoute souvent un -s à la fin.");
      if (px.endsWith("x") && px.slice(0, -1) === pa) return slip("plural_x", "Oublie le -x du pluriel", "Les noms en -eau et en -al (→ -aux) ont des pluriels particuliers.");
      if (pa.endsWith("s") && pa.slice(0, -1) === px) return slip("plural_extra", "Met un -s en trop", "Ici, le mot ne prend pas de -s.");
      return null;
    }
    case "gender": {
      const pa = plain(a),
        px = plain(x);
      if (px.endsWith("e") && px.slice(0, -1) === pa) return slip("fem_e", "Oublie le -e du féminin", "Au féminin, on ajoute souvent un -e à la fin.");
      return null;
    }
    case "passe_compose": {
      const pa = plain(a),
        px = plain(x);
      if (px.endsWith(pa) && pa !== px) return slip("aux", "Oublie l’auxiliaire", "Le passé composé a deux morceaux : avoir au présent + le participe (é).");
      if (/ e $| e$/.test(a) || pa.endsWith("er")) return slip("inf", "Écrit l’infinitif au lieu du participe", "Pour parler d’hier, le verbe en -er finit par -é.");
      return null;
    }
    case "futur": {
      const pa = plain(a),
        px = plain(x);
      if (pa.length && px.startsWith(pa) && px !== pa) return slip("fut_end", "Oublie la terminaison du futur", "Au futur, on garde l’infinitif puis on ajoute -ai, -as, -a, -ons, -ez, -ont.");
      return null;
    }
    case "homophones":
      return slip("homophone", "Confond deux mots qui sonnent pareil", "Fais le test du remplacement : a → avait, est → était, on → nous.");
    case "length":
    case "mass_cap":
      if (isNum && Number(x) && (na === Number(x) * 10 || na * 10 === Number(x))) return slip("unit", "Se trompe d’unité ou de rang", "Reprends la table : 1 m = 100 cm, 1 kg = 1 000 g, 1 L = 100 cL.");
      return null;
    case "duration":
      if (isNum && n.length >= 2 && na === n[0] + n[1]) return slip("op", "Additionne les heures au lieu de compter la durée", "Compte le temps qui passe entre le départ et l’arrivée.");
      return null;
    default:
      if (/^english_/.test(skill) && plain(a) !== plain(x) && plain(a).length > 0) return slip("english", "Mot anglais à retenir", "Écoute le mot, redis-le à voix haute, puis écris-le.");
      return null;
  }
}
