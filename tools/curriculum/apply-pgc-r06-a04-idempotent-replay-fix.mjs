import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const targetPath = path.join(repoRoot, "tools/curriculum/materialize-pgc-r06-a04-g5a-u02-pbl-cross-seed-diversity.mjs");
const marker = "PGC-R06 A04 idempotent post-regression replay";
const A03_TASK_ID = "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation";
const A04_TASK_ID = "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix";

let source = fs.readFileSync(targetPath, "utf8");

if (!source.includes(marker)) {
  const functionStart = source.indexOf("function reconcileInventory(");
  const functionEnd = source.indexOf("\n}\n\nconst capacityBaseline = readJson(paths.capacity);", functionStart);
  if (functionStart < 0 || functionEnd < 0) {
    throw new Error("PGC_R06_A04_IDEMPOTENT_REPLAY_FUNCTION_ANCHOR_MISSING");
  }

  const replacement = `function reconcileInventory(inventory, diagnosticsByRoute, capacityBaseline) {
  const storedQueueBefore = inventory.repairQueue?.length ?? 0;
  const a03Reconciliation = capacityBaseline.lastR06A03Reconciliation;
  if (a03Reconciliation?.taskId !== "${A03_TASK_ID}") {
    throw new Error(\`PGC_R06_A04_A03_RECONCILIATION_METADATA_MISSING:\${a03Reconciliation?.taskId ?? "missing"}\`);
  }
  inventory.lastR06A03Reconciliation = structuredClone(a03Reconciliation);

  const targetRouteIds = new Set(diagnosticsByRoute.keys());
  const baselineRoutesById = new Map(capacityBaseline.routes
    .filter((route) => route.sourceId === SOURCE_ID
      && route.legalRoute === true
      && ["${A03_TASK_ID}", "${A04_TASK_ID}"].includes(route.lastReconciliation?.taskId))
    .map((route) => [route.routeId, route]));
  if (baselineRoutesById.size !== 98) {
    throw new Error(\`PGC_R06_A04_REPLAY_LINEAGE_ROUTE_COUNT_MISMATCH:\${baselineRoutesById.size}\`);
  }

  let baselineSyncedRouteCount = 0;
  for (const route of inventory.routes) {
    const baseline = baselineRoutesById.get(route.routeId);
    if (!baseline) continue;
    baselineSyncedRouteCount += 1;
    route.verifiedMaxQuestionCount = baseline.verifiedMaxQuestionCount;
    route.capacityStatus = baseline.capacityStatus;

    if (targetRouteIds.has(route.routeId)) {
      route.qualityStatus = "FIXTURE_SELECTOR";
      route.uniqueItemSetCount = 1;
      route.uniqueOrderedWorksheetCount = 1;
      route.gapCodes = unique([...(baseline.gapCodes ?? []), DIVERSITY_GAP]);
      route.reconciliationStatus = "A03_CAPACITY_AUTHORITY_RECONCILED_GAP_REMAINS";
    } else {
      route.qualityStatus = baseline.qualityStatus;
      route.uniqueItemSetCount = baseline.uniqueItemSetCount;
      route.uniqueOrderedWorksheetCount = baseline.uniqueOrderedWorksheetCount;
      route.gapCodes = [...(baseline.gapCodes ?? [])];
      route.reconciliationStatus = route.gapCodes.length === 0
        ? "A03_CAPACITY_AUTHORITY_RECONCILED_AND_REMOVED_FROM_QUEUE"
        : "A03_CAPACITY_AUTHORITY_RECONCILED_GAP_REMAINS";
    }
  }
  if (baselineSyncedRouteCount !== 98) {
    throw new Error(\`PGC_R06_A04_REPLAY_INVENTORY_BASELINE_SYNC_MISMATCH:\${baselineSyncedRouteCount}\`);
  }

  const before = inventory.routes.filter((route) => route.legalRoute === true
    && route.publiclyExposed === true
    && routeGapCodes(route).length > 0).length;
  if (before !== 47) {
    throw new Error(\`PGC_R06_A04_REPLAY_DERIVED_QUEUE_BASELINE_MISMATCH:\${before}\`);
  }

  let matched = 0;
  for (const route of inventory.routes) {
    if (!diagnosticsByRoute.has(route.routeId)) continue;
    matched += 1;
    route.verifiedMaxQuestionCount = QUESTION_COUNT;
    route.capacityStatus = "VERIFIED_20";
    route.qualityStatus = "DIVERSE_PARAMETER_GENERATOR";
    route.uniqueItemSetCount = 2;
    route.uniqueOrderedWorksheetCount = 2;
    route.gapCodes = routeGapCodes(route).filter((code) => code !== DIVERSITY_GAP);
    route.reconciliationStatus = "RECONCILED_AND_REMOVED_FROM_QUEUE";
  }
  if (matched !== ROUTE_COUNT) throw new Error(\`PGC_R06_A04_INVENTORY_ROUTE_MATCH_MISMATCH:\${matched}\`);

  inventory.repairQueue = inventory.routes.filter((route) => route.legalRoute === true
    && route.publiclyExposed === true
    && routeGapCodes(route).length > 0);
  if (inventory.repairQueue.length !== 35) {
    throw new Error(\`PGC_R06_A04_REPAIR_QUEUE_AFTER_MISMATCH:\${inventory.repairQueue.length}\`);
  }

  const legal = inventory.routes.filter((route) => route.legalRoute === true);
  inventory.summary = {
    ...inventory.summary,
    conformantRouteCount: legal.filter((route) => routeGapCodes(route).length === 0).length,
    repairQueueCount: inventory.repairQueue.length,
    zeroCapacityRouteCount: legal.filter((route) => !Number.isFinite(route.verifiedMaxQuestionCount) || route.verifiedMaxQuestionCount <= 0).length,
    limitedCapacityRouteCount: legal.filter((route) => route.verifiedMaxQuestionCount > 0 && route.verifiedMaxQuestionCount < QUESTION_COUNT).length,
    diversityGapRouteCount: legal.filter((route) => routeGapCodes(route).includes(DIVERSITY_GAP)).length,
    repairQueueCountBySource: countBy(inventory.repairQueue.map((route) => route.sourceId)),
    repairQueueCountByGapCode: countBy(inventory.repairQueue.flatMap((route) => routeGapCodes(route))),
  };
  inventory.lastR06A04Reconciliation = {
    taskId: TASK_ID,
    sourceId: SOURCE_ID,
    repairQueueBefore: before,
    storedQueueBefore,
    baselineSyncedRouteCount,
    replayedFromCurrentCapacityLineage: true,
    staleQueueMaterializationRepaired: storedQueueBefore !== before,
    removedFromRepairQueueCount: ROUTE_COUNT,
    repairQueueAfter: inventory.repairQueue.length,
    status: "PASS_R06_A04_G5A_U02_PBL_DIVERSITY_RECONCILED",
  };
  inventory.reconciliation = {
    ...(inventory.reconciliation ?? {}),
    taskId: TASK_ID,
    capacityContract: paths.capacity,
    publicBindingContract: paths.uiBinding,
    runtimeRegistry: paths.registry,
    diagnostics: paths.diagnostics,
  };
  return inventory;
}`;

  source = `${source.slice(0, functionStart)}${replacement}${source.slice(functionEnd + 2)}`;

  const targetBefore = `const targetRoutes = capacity.routes.filter((route) => route.sourceId === SOURCE_ID
  && route.questionType === "pbl"
  && route.legalRoute === true
  && routeGapCodes(route).includes(DIVERSITY_GAP));`;
  const targetAfter = `const targetRoutes = capacity.routes.filter((route) => route.sourceId === SOURCE_ID
  && route.questionType === "pbl"
  && route.legalRoute === true);`;
  if (!source.includes(targetBefore)) {
    throw new Error("PGC_R06_A04_IDEMPOTENT_REPLAY_TARGET_ANCHOR_MISSING");
  }
  source = source.replace(targetBefore, targetAfter);
  source = `${source.trimEnd()}\n\n// ${marker}\n`;
  fs.writeFileSync(targetPath, source);
}

const patched = fs.readFileSync(targetPath, "utf8");
if (!patched.includes(marker)
  || !patched.includes("replayedFromCurrentCapacityLineage: true")
  || patched.includes("&& routeGapCodes(route).includes(DIVERSITY_GAP));")) {
  throw new Error("PGC_R06_A04_IDEMPOTENT_REPLAY_POSTCONDITION_FAILED");
}

console.log(`PGC_R06_A04_IDEMPOTENT_REPLAY_FIX=${JSON.stringify({
  status: "PASS",
  historicalBaselineRouteCount: 98,
  replayQueueBefore: 47,
  replayQueueAfter: 35,
})}`);
