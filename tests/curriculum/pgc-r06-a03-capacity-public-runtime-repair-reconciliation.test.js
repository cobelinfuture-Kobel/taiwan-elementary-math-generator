import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TASK_ID = "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation";
const SOURCE_ID = "g5a_u02_5a02";

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const capacity = readJson("data/curriculum/public-generation/generator_capacity_contract.json");
const materialized = capacity.lastReconciliation?.taskId === TASK_ID;

test("PGC-R06 A03 reconciliation is materialized before focused acceptance", { skip: !materialized }, async () => {
  const diagnostics = readJson("data/curriculum/public-generation/PGC-R06-A02.g5a-u02-live-diagnostics.json");
  const uiBinding = readJson("data/curriculum/public-generation/ui_capability_binding_contract.json");
  const inventory = readJson("data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json");

  assert.equal(diagnostics.summary.targetRouteCount, 98);
  assert.equal(diagnostics.summary.live20PassRouteCount, 98);
  assert.equal(diagnostics.summary.live20FailRouteCount, 0);

  const targetRouteIds = new Set(diagnostics.routes.map((route) => route.routeId));
  const capacityRoutes = capacity.routes.filter((route) => targetRouteIds.has(route.routeId));
  assert.equal(capacityRoutes.length, 98);
  assert.ok(capacityRoutes.every((route) => route.sourceId === SOURCE_ID));
  assert.ok(capacityRoutes.every((route) => route.verifiedMaxQuestionCount === 20));
  assert.ok(capacityRoutes.every((route) => route.capacityStatus === "VERIFIED_20"));
  assert.ok(capacityRoutes.every((route) => !route.gapCodes.includes("CAPACITY_BELOW_20")));

  const diverseRoutes = capacityRoutes.filter((route) => route.uniqueItemSetCount >= 2);
  const fixedPblRoutes = capacityRoutes.filter((route) => route.uniqueItemSetCount === 1);
  assert.equal(diverseRoutes.length, 86);
  assert.equal(fixedPblRoutes.length, 12);
  assert.ok(fixedPblRoutes.every((route) => route.questionType === "pbl"));
  assert.ok(fixedPblRoutes.every((route) => route.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")));

  assert.equal(uiBinding.safeQuestionCount.max, 240);
  assert.equal(uiBinding.lastReconciliation.taskId, TASK_ID);
  const reconciledBindings = uiBinding.bindings.filter((binding) => binding.lastCapacityReconciliation?.taskId === TASK_ID);
  assert.ok(reconciledBindings.length > 0);
  assert.ok(reconciledBindings.every((binding) => binding.questionCountMax === 240));
  assert.ok(reconciledBindings.every((binding) => binding.verifiedCapacityQuestionCountMax === 20));
  assert.ok(reconciledBindings.every((binding) => binding.blocked === false));

  const remainingG5AQueue = inventory.repairQueue.filter((route) => route.sourceId === SOURCE_ID);
  assert.equal(remainingG5AQueue.length, 12);
  assert.ok(remainingG5AQueue.every((route) => route.questionType === "pbl"));
  assert.ok(remainingG5AQueue.every((route) => route.gapCodes.length === 1 && route.gapCodes[0] === "CROSS_SEED_ITEM_DIVERSITY_DEFICIENT"));
  assert.equal(inventory.sourceAuthority.capacityLastReconciliation.removedFromRepairQueueCount, 86);

  const registryUrl = `${pathToFileURL(path.join(repoRoot, "site/modules/curriculum/public/public-generator-capacity-registry.js")).href}?pgcR06A03=${Date.now()}`;
  const registry = await import(registryUrl);
  assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS, "MATERIALIZED_PGC_R06_A03");
  assert.equal(registry.PUBLIC_GENERATOR_CAPACITY_RECONCILIATION.liveRouteCount, 98);
  const runtimeRows = registry.PUBLIC_GENERATOR_CAPACITY_ROWS.filter((row) => targetRouteIds.has(row[10]));
  assert.equal(runtimeRows.length, 98);
  assert.ok(runtimeRows.every((row) => row[7] === 20 && row[8] === "LEGAL"));

  const consumerUrl = `${pathToFileURL(path.join(repoRoot, "site/modules/curriculum/public/public-ui-capability-binding.js")).href}?pgcR06A03=${Date.now()}`;
  const consumer = await import(consumerUrl);
  assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.taskId, TASK_ID);
  assert.equal(consumer.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus, "MATERIALIZED_PGC_R06_A03");

  const sample = diagnostics.routes.find((route) => route.selectionMode === "singleKnowledgePoint" && route.questionType !== "pbl") ?? diagnostics.routes[0];
  const binding = consumer.resolvePublicUiCapabilityBinding({
    sourceId: sample.sourceId,
    selectionMode: sample.selectionMode,
    selectedKnowledgePointIds: sample.selectedKnowledgePointIds,
    requestedQuestionType: sample.questionType,
    requestedDepthMode: sample.depthMode,
    requestedContextMode: sample.contextMode,
    surfaceId: "CLASSIC",
  });
  assert.equal(binding.blocked, false);
  assert.equal(binding.questionCount.max, 240);
  assert.equal(binding.capacityReconciliation.taskId, TASK_ID);
});
