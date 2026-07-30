import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetPath = path.join(repoRoot, "src/curriculum/g5a-u02/class-c-generator-validator.js");
const marker = "PGC-R06 A02 G5A-U02 Class C seed collision FullFix V2";

const before = `    const slot = (normalizedSeed - 1) % 90;
    const multiplier = 2 + (slot % 9);
    const prime = PGC_R04_FACTOR_TARGET_PRIMES[Math.floor(slot / 9) % PGC_R04_FACTOR_TARGET_PRIMES.length];
    return multiplier * prime;`;

const after = `    const slot = (normalizedSeed - 1) % 4000;
    return 2 * (100 + slot);`;

const source = fs.readFileSync(targetPath, "utf8");
if (source.includes(marker)) {
  console.log("PGC_R06_A02_CLASS_C_SEED_COLLISION_FIX=ALREADY_APPLIED");
} else {
  if (!source.includes(before)) {
    throw new Error("PGC_R06_A02_CLASS_C_SEED_COLLISION_ANCHOR_MISSING");
  }
  fs.writeFileSync(targetPath, `${source.replace(before, after).trimEnd()}\n\n// ${marker}\n`);
  console.log("PGC_R06_A02_CLASS_C_SEED_COLLISION_FIX=APPLIED");
}
