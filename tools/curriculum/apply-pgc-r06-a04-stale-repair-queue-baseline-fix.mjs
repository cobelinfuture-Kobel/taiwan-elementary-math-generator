import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const target = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a04-g5a-u02-pbl-cross-seed-diversity.mjs");
const marker = "PGC-R06 A04 derive current queue from capacity route authority";
let source = fs.readFileSync(target, "utf8");

if (!source.includes(marker)) {
  source = source.replace(
    `function reconcileInventory(inventory, diagnosticsByRoute) {`,
    `function reconcileInventory(inventory, diagnosticsByRoute, capacityBaseline) {`,
  );

  const before = `  const before = inventory.repairQueue?.length ?? inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0).length;\n  if (before !== 47) throw new Error(\`PGC_R06_A04_REPAIR_QUEUE_BASELINE_MISMATCH:\${before}\`);`;
  const after = `  const storedQueueBefore = inventory.repairQueue?.length ?? 0;\n  const baselineRoutesById = new Map(capacityBaseline.routes\n    .filter((route) => route.sourceId === SOURCE_ID && ["reasoning", "mixed", "pbl"].includes(route.questionType))\n    .map((route) => [route.routeId, route]));\n  if (baselineRoutesById.size !== 98) throw new Error(\`PGC_R06_A04_A03_CAPACITY_BASELINE_ROUTE_COUNT_MISMATCH:\${baselineRoutesById.size}\`);\n  let baselineSyncedRouteCount = 0;\n  for (const route of inventory.routes) {\n    const baseline = baselineRoutesById.get(route.routeId);\n    if (!baseline) continue;\n    baselineSyncedRouteCount += 1;\n    route.verifiedMaxQuestionCount = baseline.verifiedMaxQuestionCount;\n    route.capacityStatus = baseline.capacityStatus;\n    route.qualityStatus = baseline.qualityStatus;\n    route.uniqueItemSetCount = baseline.uniqueItemSetCount;\n    route.uniqueOrderedWorksheetCount = baseline.uniqueOrderedWorksheetCount;\n    route.gapCodes = [...(baseline.gapCodes ?? [])];\n    route.reconciliationStatus = route.gapCodes.length === 0\n      ? "A03_CAPACITY_AUTHORITY_RECONCILED_AND_REMOVED_FROM_QUEUE"\n      : "A03_CAPACITY_AUTHORITY_RECONCILED_GAP_REMAINS";\n  }\n  if (baselineSyncedRouteCount !== 98) throw new Error(\`PGC_R06_A04_A03_INVENTORY_BASELINE_SYNC_MISMATCH:\${baselineSyncedRouteCount}\`);\n  const before = inventory.routes.filter((route) => route.legalRoute === true && route.publiclyExposed === true && routeGapCodes(route).length > 0).length;\n  if (before !== 47) throw new Error(\`PGC_R06_A04_DERIVED_REPAIR_QUEUE_BASELINE_MISMATCH:\${before}\`);`;
  if (!source.includes(before)) throw new Error("PGC_R06_A04_STALE_QUEUE_PATCH_ANCHOR_MISSING");
  source = source.replace(before, after);

  source = source.replace(
    `    repairQueueBefore: before,\n    removedFromRepairQueueCount: ROUTE_COUNT,`,
    `    repairQueueBefore: before,\n    storedQueueBefore,\n    baselineSyncedRouteCount,\n    staleQueueMaterializationRepaired: storedQueueBefore !== before,\n    removedFromRepairQueueCount: ROUTE_COUNT,`,
  );

  source = source.replace(
    `const capacity = readJson(paths.capacity);\nconst targetRoutes = capacity.routes.filter`,
    `const capacityBaseline = readJson(paths.capacity);\nconst capacity = structuredClone(capacityBaseline);\nconst targetRoutes = capacity.routes.filter`,
  );

  source = source.replace(
    `const inventory = reconcileInventory(readJson(paths.repairInventory), diagnosticsByRoute);`,
    `const inventory = reconcileInventory(readJson(paths.repairInventory), diagnosticsByRoute, capacityBaseline);`,
  );

  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(target, source);
}

console.log(`PGC_R06_A04_STALE_QUEUE_BASELINE_FIX=${JSON.stringify({
  status: source.includes(marker) ? "PASS" : "FAIL",
  capacityRouteAuthorityBaseline: 98,
  derivedRepairQueueBaseline: 47,
  staleStoredQueueBaseline: 133,
})}`);
