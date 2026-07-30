import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = path.join(repoRoot, "data/curriculum/public-generation");
const contractPath = path.join(publicDir, "generator_capacity_contract.json");
const diagnosticsPath = path.join(publicDir, "PGC-R06-A01.g4b-u04-bounded-capacity-diagnostics.json");
const inventoryPath = path.join(publicDir, "PGC-R06.reasoning-mixed-pbl-inventory.json");
const reportPath = path.join(publicDir, "PGC-R06-A01.g4b-u04-capacity-contract-reconciliation.json");
const routeCsvPath = path.join(publicDir, "route_capacity_matrix.csv");
const registryPath = path.join(repoRoot, "site/modules/curriculum/public/public-generator-capacity-registry.js");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R06-A01_G4B_U04_CAPACITY_CONTRACT_CLOSEOUT.md");
const A04_TASK_ID = "PGC-R06-A04_G5A-U02_12_PBL_CrossSeedDiversityFullFix";
const A05_TASK_ID = "PGC-R06-A05_G5A-U08_30ResidualDualAxisFullFix";

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

const contract = readJson(contractPath);
const diagnostics = readJson(diagnosticsPath);
const inventory = readJson(inventoryPath);
const report = readJson(reportPath);
const targetIds = new Set(diagnostics.routes.map((route) => route.routeId));
const targetRoutes = contract.routes.filter((route) => targetIds.has(route.routeId));

test("PGC-R06 A01 reconciles exactly the 15 live G4B-U04 bounded routes", () => {
  assert.equal(report.schemaName, "PgcR06A01G4BU04CapacityContractReconciliationV1");
  assert.equal(report.status, "PASS_R06_A01_G4BU04_15_BOUNDED_ROUTES_CONTRACT_RECONCILED_AND_CLOSED");
  assert.equal(report.reconciledRouteIds.length, 15);
  assert.equal(new Set(report.reconciledRouteIds).size, 15);
  assert.equal(targetRoutes.length, 15);
  assert.equal(targetRoutes.every((route) => route.sourceId === "g4b_u04_4b04"), true);
  assert.equal(targetRoutes.every((route) => ["mixed", "reasoning"].includes(route.questionType)), true);
  assert.equal(targetRoutes.every((route) => route.verifiedMaxQuestionCount === 20), true);
  assert.equal(targetRoutes.every((route) => route.capacityStatus === "VERIFIED_20"), true);
  assert.equal(targetRoutes.every((route) => route.qualityStatus === "DIVERSE_PARAMETER_GENERATOR"), true);
  assert.equal(targetRoutes.every((route) => route.downstreamGapCodes.length === 0), true);
});

test("PGC-R06 A01 stores two-seed live capacity and diversity evidence", () => {
  for (const route of targetRoutes) {
    assert.equal(route.selectedCapacityEvidence?.evidenceAuthority, "PGC-R06-A01_G4B-U04_TWO_SEED_20_QUESTION_LIVE_RUNTIME", route.routeId);
    assert.equal(route.selectedCapacityEvidence?.questionCount, 20, route.routeId);
    assert.equal(route.selectedCapacityEvidence?.diagnosticSeedCount, 2, route.routeId);
    assert.equal(route.selectedCapacityEvidence?.runs?.length, 2, route.routeId);
    assert.equal(new Set(route.selectedCapacityEvidence.runs.map((run) => run.itemSetSignature)).size, 2, route.routeId);
    assert.equal(route.reconciliationCodes.includes("PGC_R06_A01_LIVE_20_CAPACITY_RECONCILED"), true, route.routeId);
    assert.equal(route.reconciliationCodes.includes("PGC_R06_A01_CROSS_SEED_ITEM_SET_DIVERSITY_RECONCILED"), true, route.routeId);
  }
});

test("PGC-R06 A01 preserves prior R05 terminal authority and records a separate R06 reconciliation", () => {
  assert.equal(contract.lastReconciliation?.taskId, "PGC-R05_CapacityContractReconciliationAndD0Closeout");
  assert.equal(contract.lastR06Reconciliation?.taskId, "PGC-R06-A01_BoundedCapacityReasoningMixedPBLRouteFullFix");
  assert.equal(contract.lastR06Reconciliation?.sourceId, "g4b_u04_4b04");
  assert.equal(contract.lastR06Reconciliation?.reconciledRouteCount, 15);
});

test("PGC-R06 A01 frozen boundaries and public consumers remain aligned", () => {
  assert.equal(report.boundary.nonTargetRoutesPreserved, true);
  assert.equal(report.boundary.g4bU04PblRoutesPreserved, true);
  assert.equal(report.boundary.unrelatedBindingsPreserved, true);
  assert.equal(report.changedBindingIds.length > 0, true);
  assert.equal(fs.readFileSync(routeCsvPath, "utf8").trim().split(/\r?\n/).length, contract.routes.length + 1);
  const registry = fs.readFileSync(registryPath, "utf8");
  for (const routeId of targetIds) assert.equal(registry.includes(routeId), true, routeId);
});

test("PGC-R06 A01 historical queue delta remains immutable while current R06 queue may advance", () => {
  assert.equal(contract.lastR06A03Reconciliation?.taskId, "PGC-R06-A03_CapacityPublicBindingRuntimeConsumerAndRepairQueueReconciliation");
  assert.equal(inventory.repairQueue.some((route) => targetIds.has(route.routeId)), false);
  const remainingG4BU04 = inventory.repairQueue.filter((route) => route.sourceId === "g4b_u04_4b04");
  assert.equal(remainingG4BU04.length, 3);
  assert.equal(remainingG4BU04.every((route) => route.questionType === "pbl"), true);
  assert.equal(remainingG4BU04.every((route) => !route.gapCodes.includes("CAPACITY_BELOW_20")), true);

  const a05Materialized = inventory.lastR06A05Reconciliation?.taskId === A05_TASK_ID;
  const a04Materialized = inventory.lastR06A04Reconciliation?.taskId === A04_TASK_ID;
  if (a05Materialized) {
    assert.equal(inventory.summary.repairQueueCount, 5);
    assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 0);
    assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u08_5a08").length, 0);
    assert.equal(inventory.lastR06A04Reconciliation?.repairQueueBefore, 47);
    assert.equal(inventory.lastR06A04Reconciliation?.removedFromRepairQueueCount, 12);
    assert.equal(inventory.lastR06A04Reconciliation?.repairQueueAfter, 35);
    assert.equal(inventory.lastR06A05Reconciliation.repairQueueBefore, 35);
    assert.equal(inventory.lastR06A05Reconciliation.removedFromRepairQueueCount, 30);
    assert.equal(inventory.lastR06A05Reconciliation.repairQueueAfter, 5);
  } else if (a04Materialized) {
    assert.equal(inventory.summary.repairQueueCount, 35);
    assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 0);
    assert.equal(inventory.lastR06A04Reconciliation.repairQueueBefore, 47);
    assert.equal(inventory.lastR06A04Reconciliation.removedFromRepairQueueCount, 12);
    assert.equal(inventory.lastR06A04Reconciliation.repairQueueAfter, 35);
  } else {
    assert.equal(inventory.summary.repairQueueCount, 47);
    assert.equal(inventory.repairQueue.filter((route) => route.sourceId === "g5a_u02_5a02").length, 12);
  }

  assert.equal(report.remainingRepairQueueCount, 133);
  assert.match(report.nextShortestStep, /^PGC-R06-A02_/);
});

test("PGC-R06 A01 closeout readback records distance reduction and no scope expansion", () => {
  assert.equal(fs.existsSync(readbackPath), true);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /STATUS\s+= PASS_R06_A01_G4BU04_15_BOUNDED_ROUTES_CONTRACT_RECONCILED_AND_CLOSED/);
  assert.match(readback, /RECONCILED_ROUTE_COUNT\s+= 15/);
  assert.match(readback, /GOAL_DISTANCE_AFTER\s+= D1_R06_G4B_U04_BOUNDED_CAPACITY_CLOSED_AND_QUEUE_ADVANCED/);
  assert.match(readback, /NEXT_SHORTEST_STEP\s+= PGC-R06-A02_/);
  assert.equal(report.boundary.generatorModified, false);
  assert.equal(report.boundary.validatorModified, false);
  assert.equal(report.boundary.rendererModified, false);
  assert.equal(report.boundary.secondWorksheetPipelineAdded, false);
});

// PGC-R06 A04 historical authority and workflow governance compatibility

// PGC-R06 A05 current-state advancement with A01 history preserved
