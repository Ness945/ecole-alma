// Programme CE1 élargi (v0.18) : aides communes aux générateurs d'exercices.
// Tout le contenu est original, écrit d'après les attendus du programme officiel du cycle 2.
export const rng = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
export const pick = (r, list) => list[Math.floor(r() * list.length)];
export const between = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
export const shuffled = (r, list) => [...list].sort(() => r() - 0.5);
// Réponses fausses proches pour un nombre (jamais la bonne réponse, jamais négatives, sans doublon).
export function numberOptions(answer, r, spread = [1, 2, 10]) {
  const n = Number(answer),
    out = new Set([String(n)]);
  for (const d of shuffled(r, spread.flatMap((x) => [x, -x]))) {
    if (out.size >= 4) break;
    if (n + d >= 0) out.add(String(n + d));
  }
  return [...out];
}
// Banque de questions : « question|bonne réponse|faux 1|faux 2|explication ».
// Les réponses d'un seul mot court peuvent aussi être écrites (orthographe proche acceptée).
export function parseBank(lines) {
  return lines.map((l) => {
    const [prompt, answer, w1, w2, hint] = l.split("|");
    return { prompt, answer, wrong: [w1, w2].filter(Boolean), hint: hint || "" };
  });
}
export function fromBank(q, bank, seed, turn, r, { writable = true } = {}) {
  const item = bank[seed % bank.length];
  q.prompt = item.prompt;
  q.answer = item.answer;
  q.hint = item.hint || "Relis la question calmement, puis essaie encore.";
  if (q.hint.length < 24) q.hint = `${q.hint} La bonne réponse est « ${item.answer} ».`;
  q.options = [item.answer, ...item.wrong];
  const oneWord = /^[\p{L}\p{N}’'-]{1,16}$/u.test(item.answer);
  if (writable && oneWord && q.type === "input") {
    q.tolerant = true;
  } else {
    q.type = "choice";
    q.dimension = "recognition";
  }
  return item;
}
