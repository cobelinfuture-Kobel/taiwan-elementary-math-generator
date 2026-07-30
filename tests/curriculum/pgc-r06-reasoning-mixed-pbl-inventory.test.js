import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { materializePgcR06ReasoningMixedPblInventory } from "../../tools/curriculum/materialize-pgc-r06-reasoning-mixed-pbl-inventory.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const capacityPath = path.join(repoRoot, "data/curriculum/public-generation/generator_capacity_contract.json");
const inventoryPath = path.join(repoRoot, "data/curriculum/public-generation/PGC-R06.reasoning-mixed-pbl-inventory.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/reasoning_mixed_pbl_route_inventory.csv");
const readbackPath = path.join(repoRoot, "docs/curriculum/output/PGC-R06_reasoning_mixed_pbl_inventory.md");

const capacityBefore = fs.readFileSync(capacityPath, "utf8");
const materialized = materializePgcR06ReasoningMixedPblInventory();
const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));

function rank(route) {
  if (route.gapCodes.includes("ZERO_SAFE_CAPACITY")) return 0;
  if (route.gapCodes.includes("CAPACITY_BELOW_20")) return 10;
  if (route.gapCodes.includes("CROSS_SEED_ITEM_DIVERSITY_DEFICIENT")) return 20;
  if (route.gapCodes.length > 0) return 30;
  return 80;
}

test("PGC-R06 A00 freezes the exact reasoning, mixed and PBL repair scope", () => {
  assert.equal(materialized.status, "PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN");
  assert.equal(inventory.schemaName, "PublicReasoningMixedPblRouteInventoryV1");
  assert.equal(inventory.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(inventory.taskId, "PGC-R06-A00_ReasoningMixedPBLRouteInventoryAndRepairQueueFreeze");
  assert.equal(inventory.routes.length, inventory.summary.r06RouteCount);
  assert.ok(inventory.routes.length > 0);
  assert.deepEqual(new Set(inventory.routes.map((route) => route.questionType)), new Set(["reasoning", "mixed", "pbl"]));
  assert.equal(new Set(inventory.routes.map((route) => route.routeId)).size, inventory.routes.length);
  assert.equal(inventory.routes.some((route) => ["numeric", "application"].includes(route.questionType)), false);
});

test("PGC-R06 A00 protects closed R04/R05 same-unit mixed-selection overlap", () => {
  assert.equal(inventory.scope.sameUnitMixedSelectionOverlapIsReadOnly, true);
  assert.equal(inventory.scope.crossUnitMixedSelectionAllowed, false);
  assert.ok(inventory.closedScopeOverlapRoutes.length > 0);
  assert.equal(inventory.closedScopeOverlapRoutes.every((route) => route.selectionMode === "mixedKnowledgePointsSameUnit"), true);
  assert.equal(inventory.closedScopeOverlapRoutes.every((route) => ["numeric", "application"].includes(route.questionType)), true);
  assert.equal(inventory.boundary.r04NumericReopened, false);
  assert.equal(inventory.boundary.r05ApplicationReopened, false);
});

test("PGC-R06 A00 produces one deterministic severity-ordered repair queue", () => {
  assert.equal(inventory.repairQueue.length, inventory.summary.repairQueueCount);
  assert.equal(inventory.repairQueue.every((route) => route.legalRoute === true && route.gapCodes.length > 0), true);
  const sorted = [...inventory.repairQueue].sort((a, b) => rank(a) - rank(b)
    || a.sourceId.localeCompare(b.sourceId)
    || a.questionType.localeCompare(b.questionType)
    || a.routeId.localeCompare(b.routeId));
  assert.deepEqual(inventory.repairQueue.map((route) => route.routeId), sorted.map((route) => route.routeId));
  assert.match(inventory.nextShortestStep, /^PGC-R06-A01_/);
});

test("PGC-R06 A00 is inventory-only and leaves every implementation authority frozen", () => {
  assert.equal(fs.readFileSync(capacityPath, "utf8"), capacityBefore);
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

test("PGC-R06 A00 artifacts remain row-aligned and name one next shortest step", () => {
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(readbackPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, inventory.routes.length + 1);
  const readback = fs.readFileSync(readbackPath, "utf8");
  assert.match(readback, /STATUS\s+= PASS_R06_A00_SCOPE_AND_REPAIR_QUEUE_FROZEN/);
  assert.match(readback, /R04_R05_MIXED_OVERLAP/);
  assert.match(readback, new RegExp(`NEXT_SHORTEST_STEP\\s+= ${inventory.nextShortestStep}`));
  assert.doesNotMatch(readback, /Slice014.*true/i);
});
