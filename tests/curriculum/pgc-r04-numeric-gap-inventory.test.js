import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  materializePgcR04NumericGapInventory,
} from "../../tools/curriculum/materialize-pgc-r04-numeric-gap-inventory.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(repoRoot, "data/curriculum/public-generation/numeric_generation_gap_inventory.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/numeric_generation_gap_inventory.csv");
const reportPath = path.join(repoRoot, "docs/curriculum/output/PGC-R04_numeric_generation_gap_inventory.md");

function loadInventory() {
  assert.equal(fs.existsSync(jsonPath), true, "R04 inventory must be materialized before acceptance");
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

test("PGC-R04 freezes the exact numeric-like downstream scope from R03", () => {
  const inventory = loadInventory();
  assert.equal(inventory.schemaName, "PublicNumericGenerationGapInventoryV1");
  assert.equal(inventory.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(inventory.taskId, "PGC-R04_NumericGenerationFullFix");
  assert.equal(inventory.status, "PASS", JSON.stringify(inventory.blockingGaps, null, 2));
  assert.deepEqual(inventory.numericLikeQuestionTypes, ["numeric", "concept", "operation_estimation", "representation"]);
  assert.deepEqual(inventory.excludedQuestionTypes, ["application", "reasoning", "pbl", "mixed"]);

  const expected = {
    candidateRouteCount: 195,
    legalRouteCount: 193,
    illegalExcludedRouteCount: 2,
    healthyLegalRouteCount: 112,
    gapRouteCount: 81,
    capacityBelow20RouteCount: 69,
    diversityDeficientRouteCount: 36,
    overlappingCapacityAndDiversityRouteCount: 24,
    affectedSourceCount: 19,
  };
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(inventory.summary[key], value, key);
    assert.equal(inventory.frozenExpectedCounts[key], value, key);
  }
  assert.equal(inventory.summary.blockingInventoryGapCount, 0);
  assert.equal(inventory.summary.unmappedGapRouteCount, 0);
  assert.equal(inventory.summary.mappedGapRouteCount, 81);
  assert.equal(inventory.gapRoutes.length, 81);
  assert.equal(inventory.illegalExcludedRoutes.length, 2);
});

test("PGC-R04 maps every gap route to repository implementation evidence", () => {
  const inventory = loadInventory();
  for (const route of inventory.gapRoutes) {
    assert.ok(route.implementationTokens.length > 0, route.routeId);
    assert.ok(route.implementationReferenceCount > 0, route.routeId);
    assert.ok(route.implementationReferences.length > 0, route.routeId);
    assert.ok(["CAPACITY_BELOW_20", "CROSS_SEED_DIVERSITY", "CAPACITY_AND_DIVERSITY", "ZERO_SAFE_CAPACITY"].includes(route.gapFamily), route.routeId);
    assert.match(route.repairPriority, /^P[0-4]_/);
    assert.ok(route.verifiedMaxQuestionCount >= 1 && route.verifiedMaxQuestionCount <= 20, route.routeId);
    assert.ok(route.downstreamGapCodes.length > 0, route.routeId);
  }
});

test("PGC-R04 selects the largest pure diversity cluster as the first repair", () => {
  const inventory = loadInventory();
  assert.equal(inventory.firstRepairCandidate.sourceId, "g3a_u03_3a03");
  assert.equal(inventory.firstRepairCandidate.routeCount, 8);
  assert.equal(inventory.firstRepairCandidate.nextTaskId, "PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix");
  assert.equal(inventory.firstRepairCandidate.routeIds.length, 8);
  const selectedRoutes = inventory.gapRoutes.filter((route) => route.sourceId === "g3a_u03_3a03");
  assert.equal(selectedRoutes.length, 8);
  for (const route of selectedRoutes) {
    assert.equal(route.verifiedMaxQuestionCount, 20);
    assert.equal(route.gapFamily, "CROSS_SEED_DIVERSITY");
    assert.equal(route.qualityStatus, "FIXTURE_SELECTOR");
  }
});

test("PGC-R04 committed inventory artifacts are deterministic and row aligned", () => {
  const committed = loadInventory();
  const rebuilt = materializePgcR04NumericGapInventory();
  assert.deepEqual(rebuilt.summary, committed.summary);
  assert.deepEqual(rebuilt.firstRepairCandidate, committed.firstRepairCandidate);
  assert.deepEqual(rebuilt.gapRoutes.map((route) => route.routeId), committed.gapRoutes.map((route) => route.routeId));
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(reportPath), true);
  assert.equal(fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/).length, committed.gapRoutes.length + 1);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /R04_GAP_ROUTES\s+= 81/);
  assert.match(report, /IMPLEMENTATION_REFERENCE_COVERAGE\s+= 81\/81/);
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04-A01_G3A_U03_SeedConsumptionAndCrossSeedDiversityFullFix/);
});
