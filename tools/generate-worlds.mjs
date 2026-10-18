import { readFile, writeFile } from "node:fs/promises";
const source = await readFile(
  new URL("../frontend/assets/kingdom.svg", import.meta.url),
  "utf8",
);
const old = /<g transform="translate\(817 458\) rotate\(20\)">[\s\S]*?<\/g>/;
if (!old.test(source)) throw Error("Bridge source not found");
for (let count = 0; count <= 3; count++) {
  const bridge = `<g transform="translate(817 458) rotate(20)"><path d="M0-8h146M0 65h146" stroke="#786c51" stroke-width="6" stroke-dasharray="6 5"/>${Array.from({ length: count }, (_, i) => `<rect x="${i * 49}" width="46" height="58" rx="4" fill="#b18e60" stroke="#786c51" stroke-width="2"/><path d="M${i * 49 + 23} 2v54" stroke="#d5ba8e" stroke-width="3"/>`).join("")}</g>`;
  await writeFile(
    new URL(`../frontend/assets/kingdom-bridge-${count}.svg`, import.meta.url),
    source.replace(old, bridge),
  );
}
