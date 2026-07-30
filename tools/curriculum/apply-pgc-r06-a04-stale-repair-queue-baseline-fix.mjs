import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const target = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a04-g5a-u02-pbl-cross-seed-diversity.mjs");
const marker = "PGC-R06 A04 derive current queue from route authority";
let source = fs.readFileSync(target, "utf8");

if (!source.includes(marker)) {
  const before = `  const before = inventory.repairQueue?.length ?? inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0).length;\n  if (before !== 47) throw new Error(\`PGC_R06_A04_REPAIR_QUEUE_BASELINE_MISMATCH:\${before}\`);`;
  const after = `  const storedQueueBefore = inventory.repairQueue?.length ?? 0;\n  const before = inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0).length;\n  if (before !== 47) throw new Error(\`PGC_R06_A04_DERIVED_REPAIR_QUEUE_BASELINE_MISMATCH:\${before}\`);`;
  if (!source.includes(before)) throw new Error("PGC_R06_A04_STALE_QUEUE_PATCH_ANCHOR_MISSING");
  source = source.replace(before, after);
  source = source.replace(
    `    repairQueueBefore: before,\n    removedFromRepairQueueCount: ROUTE_COUNT,`,
    `    repairQueueBefore: before,\n    storedQueueBefore,\n    staleQueueMaterializationRepaired: storedQueueBefore !== before,\n    removedFromRepairQueueCount: ROUTE_COUNT,`,
  );
  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(target, source);
}

console.log(`PGC_R06_A04_STALE_QUEUE_BASELINE_FIX=${JSON.stringify({
  status: source.includes(marker) ? "PASS" : "FAIL",
  routeAuthorityBaseline: 47,
  staleStoredQueueBaseline: 133,
})}`);
