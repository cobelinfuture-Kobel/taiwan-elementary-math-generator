import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetPath = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a03-capacity-public-runtime-repair-reconciliation.mjs");
const marker = "PGC-R06 A03 derive diversity gap from admitted live evidence";

const before = `function reconciledGapCodes(existing, crossSeedDistinct) {
  return unique(existing.filter((code) => code !== CAPACITY_GAP && (code !== DIVERSITY_GAP || !crossSeedDistinct)));
}`;

const after = `function reconciledGapCodes(existing, crossSeedDistinct) {
  const next = existing.filter((code) => code !== CAPACITY_GAP && code !== DIVERSITY_GAP);
  if (!crossSeedDistinct) next.push(DIVERSITY_GAP);
  return unique(next);
}`;

let source = fs.readFileSync(targetPath, "utf8");
if (source.includes(marker)) {
  console.log("PGC_R06_A03_DIVERSITY_GAP_DERIVATION_FIX=ALREADY_APPLIED");
} else {
  if (!source.includes(before)) throw new Error("PGC_R06_A03_DIVERSITY_GAP_DERIVATION_ANCHOR_MISSING");
  source = source.replace(before, after);
  fs.writeFileSync(targetPath, `${source.trimEnd()}\n\n// ${marker}\n`);
  console.log("PGC_R06_A03_DIVERSITY_GAP_DERIVATION_FIX=APPLIED");
}
