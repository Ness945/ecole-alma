// Génère docs/QUESTIONS.md : toutes les questions du bilan de départ, pour relecture par un adulte.
// Usage : node tools/export-questions.mjs
import { writeFileSync } from "node:fs";
import { FAMILIES, LADDER, FORM_LABELS, make } from "../frontend/js/discovery-bank.js";
import { skills } from "../frontend/js/content.js";
import { STEPS } from "../frontend/js/discovery-model.js";

const name = (id) => skills.find((s) => s.id === id)?.name ?? id;
const out = [
  "# Questions du bilan de départ — relecture",
  "",
  "Document généré par `node tools/export-questions.mjs` (ne pas modifier à la main).",
  "Pour chaque question : l’énoncé, les choix proposés (le cas échéant) et **la réponse attendue**. Merci de signaler tout énoncé ambigu, trop difficile ou mal formulé pour un enfant de CE1.",
  "",
];
for (const step of STEPS) {
  out.push(`## ${step.icon} ${step.name}`, "");
  for (const skill of step.skills) {
    out.push(`### ${name(skill)} (\`${skill}\`)`, "");
    for (const tier of [1, 2]) {
      for (const id of LADDER[skill][`tier${tier}`]) {
        const f = FAMILIES[id];
        out.push(
          `#### ${id} — ${f.task}`,
          "",
          `Niveau ${tier === 1 ? "accessible (premier défi)" : "de confirmation (exemple différent)"} · forme : ${FORM_LABELS[f.form]}`,
          "",
          `Exemple montré en aide : ${f.example}`,
          "",
        );
        f.variants.forEach((_, i) => {
          const q = make(id, i, 0);
          const text = [q.passage && `« ${q.passage} »`, q.prompt, q.visual && `[${q.visual}]`, q.sentence && `(phrase : ${q.sentence})`]
            .filter(Boolean)
            .join(" ");
          const choices = q.options.length && q.form !== "order" ? ` — choix : ${q.options.join(" / ")}` : q.form === "order" ? ` — à ranger : ${q.options.join(" / ")}` : "";
          out.push(`${i + 1}. ${text}${choices} → **${q.answer}**`);
        });
        out.push("");
      }
    }
  }
}
writeFileSync(new URL("../docs/QUESTIONS.md", import.meta.url), out.join("\n"));
console.log("docs/QUESTIONS.md écrit.");
