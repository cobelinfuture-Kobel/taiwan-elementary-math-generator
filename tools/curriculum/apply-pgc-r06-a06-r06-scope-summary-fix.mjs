import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const target = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a06-five-pbl-residual-closeout.mjs");
const before = "  const diversityGapRouteCount = legal.filter((route) => canonicalGaps(route).includes(DIVERSITY_GAP)).length;";
const after = "  const diversityGapRouteCount = legal.filter((route) => REPAIR_TYPES.has(route.questionType) && canonicalGaps(route).includes(DIVERSITY_GAP)).length;";
let source = fs.readFileSync(target, "utf8");
if (!source.includes(after)) {
  if (!source.includes(before)) throw new Error("PGC_R06_A06_SCOPE_SUMMARY_ANCHOR_MISSING");
  source = source.replace(before, after);
  fs.writeFileSync(target, source);
}
console.log("PGC_R06_A06_SCOPE_SUMMARY_FIX=PASS");
