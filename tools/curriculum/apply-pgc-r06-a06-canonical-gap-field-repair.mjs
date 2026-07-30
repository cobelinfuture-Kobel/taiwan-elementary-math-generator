import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const capacityPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const CAPACITY_GAP = "CAPACITY_BELOW_20";
const DIVERSITY_GAP = "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT";

const capacity = JSON.parse(fs.readFileSync(capacityPath, "utf8"));
let parallelFieldRemovedCount = 0;
let canonicalResolvedGapRemovedCount = 0;

for (const route of capacity.routes) {
  if (Object.hasOwn(route, "gapCodes")) {
    delete route.gapCodes;
    parallelFieldRemovedCount += 1;
  }
  const gaps = Array.isArray(route.downstreamGapCodes) ? route.downstreamGapCodes : [];
  const isLiveResolved = route.legalRoute === true
    && Number(route.verifiedMaxQuestionCount) >= 20
    && route.qualityStatus === "DIVERSE_PARAMETER_GENERATOR";
  if (!isLiveResolved) continue;
  const next = gaps.filter((code) => ![CAPACITY_GAP, DIVERSITY_GAP].includes(code));
  canonicalResolvedGapRemovedCount += gaps.length - next.length;
  route.downstreamGapCodes = [...new Set(next)].sort();
}

fs.writeFileSync(capacityPath, `${JSON.stringify(capacity, null, 2)}\n`);
console.log(`PGC_R06_A06_CANONICAL_GAP_FIELD_REPAIR=${JSON.stringify({
  status: "PASS",
  parallelFieldRemovedCount,
  canonicalResolvedGapRemovedCount,
  rule: "VERIFIED_20_AND_DIVERSE_PARAMETER_GENERATOR",
})}`);
