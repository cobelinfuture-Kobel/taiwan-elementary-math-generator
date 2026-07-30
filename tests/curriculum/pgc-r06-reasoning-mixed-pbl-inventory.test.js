import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const capacityPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const inventoryPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/reasoning_mixed_pbl_route_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R06_reasoning_mixed_pbl_inventory.md");

const inventoryTextBefore = fs.readFileSync(inventoryPath, "utf8");
const capacityTextBefore = fs.readFileSync(capacityPath, "utf8");
const inventory = JSON.parse(inventoryTextBefore);
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");

function rank(route) {
  if (route.gapCodes.includes("ZERO_SAFE_CAPACITY")) return 0;
  if (route.gapCodes.includes("CAPACITY_BELOW_20")) return 10;
  if (route.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")) return 20;
  if (route.gapCodes.length > 0) return 30;
  return 80;
}

test("PGC-R06 A00 historical scope remains identifiable without rematerializing current authority", () => {
  assert.equal(inventory.schemaName, "PublicReasoningMixedPblRouteInventoryV1");
  assert.equal(inventory.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(inventory.taskId, "PGC-R06-A00_ReasoningMixedPBLRouteInventoryAndRepairQueueFreeze");
  assert.equal(inventory.status, "PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN");
  assert.equal(inventory.routes.length, inventory.summary.r06RouteCount);
  assert.ok(inventory.routes.length > 0);
  assert.deepEqual(new Set(inventory.routes.map((route) => route.questionType)), new Set(["reasoning", "mixed", "pbl"]));
  assert.equal(new Set(inventory.routes.map((route) => route.routeId)).size, inventory.routes.length);
  assert.equal(inventory.routes.some((route) => ["numeric", "application"].includes(route.questionType)), false);
});

test("PGC-R06 A00 frozen boundaries remain immutable while current queue may advance", () => {
  assert.equal(inventory.scope.sameUnitMixedSelectionOverlapIsReadOnly, true);
  assert.equal(inventory.scope.crossUnitMixedSelectionAllowed, false);
  assert.ok(inventory.closedScopeOverlapRoutes.length > 0);
  assert.equal(inventory.closedScopeOverlapRoutes.every((route) => route.selectionMode === "mixedKnowledgePointsSameUnit"), true);
  assert.equal(inventory.closedScopeOverlapRoutes.every((route) => ["numeric", "application"].includes(route.questionType)), true);
  assert.deepEqual(inventory.boundary, {
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    uiModified: false,
    capacityContractModified: false,
    r04NumericReopened: false,
    r05ApplicationReopened: false,
    slice014Started: false,
  });
  assert.equal(inventory.scope.newKnowledgePointsAllowed, false);
  assert.equal(inventory.scope.newPatternGroupsAllowed, false);
  assert.equal(inventory.scope.newPatternSpecsAllowed, false);
  assert.equal(inventory.scope.secondGeneratorAllowed, false);
  assert.equal(inventory.scope.secondValidatorAllowed, false);
});

test("PGC-R06 current repair queue remains deterministic and milestone-aware", () => {
  assert.equal(inventory.repairQueue.length, inventory.summary.repairQueueCount);
  assert.equal(inventory.repairQueue.every((route) => route.legalRoute === true && route.gapCodes.length > 0), true);
  const sorted = [...inventory.repairQueue].sort((a, b) => rank(a) - rank(b)
    || a.sourceId.localeCompare(b.sourceId)
    || a.questionType.localeCompare(b.questionType)
    || a.routeId.localeCompare(b.routeId));
  assert.deepEqual(inventory.repairQueue.map((route) => route.routeId), sorted.map((route) => route.routeId));

  if (inventory.lastR06A06Reconciliation) {
    assert.equal(inventory.summary.repairQueueCount, 0);
    assert.match(inventory.nextShortestStep, /^PGC-R06-A07_/);
  } else if (inventory.lastR06A05Reconciliation) {
    assert.equal(inventory.summary.repairQueueCount, 5);
    assert.match(inventory.nextShortestStep, /^PGC-R06-A06_/);
  } else if (inventory.lastR06A04Reconciliation) {
    assert.equal(inventory.summary.repairQueueCount, 35);
  } else if (inventory.lastR06A03Reconciliation) {
    assert.equal(inventory.summary.repairQueueCount, 47);
  } else {
    assert.ok(inventory.summary.repairQueueCount >= 0);
  }
});

test("PGC-R06 A00 artifacts remain row-aligned and preserve the historical readback", () => {
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, inventory.routes.length + 1);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /STATUS\s+= PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN/);
  assert.match(readback, /R04_R05_MIXED_OVERLAP/);
  assert.doesNotMatch(readback, /Slice014.*true/i);
});

test("PGC-R06 A00 acceptance is read-only", () => {
  assert.equal(digest(fs.readFileSync(inventoryPath, "utf8")), digest(inventoryTextBefore));
  assert.equal(digest(fs.readFileSync(capacityPath, "utf8")), digest(capacityTextBefore));
});
