import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const filePath = path.join(repoRoot, "site/modules/curriculum/batch-a/number-theory-runtime.js");
const marker = "PGC-R04 final number-theory LCM parameter expansion";
let content = fs.readFileSync(filePath, "utf8");

if (!content.includes(marker)) {
  const pattern = /const LCM_PAIRS = Object\.freeze\(\[[^\n]*\]\);/;
  const replacement = `const LCM_PAIRS = Object.freeze(Array.from({ length: 35 }, (_, index) => index + 2)
  .flatMap((left) => Array.from({ length: 35 }, (_, index) => index + 2)
    .filter((right) => right > left && leastCommonMultiple(left, right) <= 900)
    .map((right) => Object.freeze([left, right]))));`;
  const next = content.replace(pattern, replacement);
  if (next === content) throw new Error("PGC_R04_NUMBER_THEORY_LCM_PREPATCH_ANCHOR_MISSING");
  content = `${next}\n// ${marker}\n`;
  fs.writeFileSync(filePath, content);
}

console.log("PGC_R04_NUMBER_THEORY_LCM_PREPATCH=PASS");
