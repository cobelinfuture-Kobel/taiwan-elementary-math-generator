import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  materializePgcR04NumericQueueReprioritization,
} from "../../tools/curriculum/materialize-pgc-r04-numeric-queue-reprioritization.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(root, "data/curriculum/public-generation/r04_numeric_queue_reprioritization.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A03_numeric_queue_reprioritization.md");

function loadContract() {
  assert.equal(fs.existsSync(jsonPath), true, "A03 reprioritization must be materialized before focused acceptance");
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

test("PGC-R04-A03 freezes the post-diversity remaining queue", () => {
  const contract = loadContract();
  assert.equal(contract.schemaName, "PgcR04NumericQueueReprioritizationV1");
  assert.equal(contract.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(contract.taskId, "PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization");
  assert.equal(contract.status, "PASS", JSON.stringify(contract.blockingGaps, null, 2));
  assert.deepEqual(contract.resolvedSources, ["g3a_u03_3a03", "g3a_u06_3a06"]);

  const expected = {
    cumulativeResolvedGapRouteCount: 12,
    remainingGapRouteCount: 69,
    remainingCapacityGapRouteCount: 69,
    remainingDiversityGapRouteCount: 24,
    remainingCapacityAndDiversityOverlapCount: 24,
    remainingAffectedSourceCount: 17,
  };
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(contract.summary[key], value, key);
    assert.equal(contract.frozenExpectedCounts[key], value, key);
  }
  assert.equal(contract.summary.blockingGapCount, 0);
  assert.equal(contract.sourceSummaries.length, 17);
  assert.equal(contract.remainingRoutes.length, 69);
  assert.equal(contract.remainingRoutes.some((route) => contract.resolvedSources.includes(route.sourceId)), false);
});

test("PGC-R04-A03 selects G5A-U02 as the largest capacity-only shared root", () => {
  const contract = loadContract();
  const candidate = contract.nextRepairCandidate;
  assert.ok(candidate);
  assert.equal(candidate.sourceId, "g5a_u02_5a02");
  assert.equal(candidate.defectClass, "CAPACITY_ONLY");
  assert.equal(candidate.routeCount, 11);
  assert.equal(candidate.minimumVerifiedQuestionCount, 8);
  assert.equal(candidate.maximumVerifiedQuestionCount, 16);
  assert.equal(candidate.nextTaskId, "PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix");
  assert.equal(candidate.routeIds.length, 11);
  assert.ok(candidate.runtimeReferencePaths.length > 0);
  assert.ok(candidate.runtimeReferencePaths.some((filePath) => filePath.includes("g5a-u02")));

  const source = contract.sourceSummaries.find((row) => row.sourceId === candidate.sourceId);
  assert.ok(source);
  assert.equal(source.routeCount, 11);
  assert.equal(source.capacityGapRouteCount, 11);
  assert.equal(source.diversityGapRouteCount, 0);
  assert.equal(source.overlapRouteCount, 0);
  assert.equal(source.defectClass, "CAPACITY_ONLY");
});

test("PGC-R04-A03 separates capacity-only and capacity-plus-diversity lanes", () => {
  const contract = loadContract();
  const capacityOnly = contract.sourceSummaries.filter((source) => source.defectClass === "CAPACITY_ONLY");
  const overlap = contract.sourceSummaries.filter((source) => source.defectClass === "CAPACITY_AND_DIVERSITY");
  assert.ok(capacityOnly.length > 0);
  assert.ok(overlap.length > 0);
  assert.equal(capacityOnly.every((source) => source.diversityGapRouteCount === 0), true);
  assert.equal(overlap.every((source) => source.capacityGapRouteCount === source.diversityGapRouteCount), true);
  assert.equal(contract.remainingRoutes.filter((route) => route.gapFamily === "CROSS_SEED_DIVERSITY").length, 0);
});

test("PGC-R04-A03 artifacts are deterministic and declare A04", () => {
  const committed = loadContract();
  const rebuilt = materializePgcR04NumericQueueReprioritization();
  assert.deepEqual(rebuilt.summary, committed.summary);
  assert.deepEqual(rebuilt.blockingGaps, committed.blockingGaps);
  assert.deepEqual(rebuilt.nextRepairCandidate, committed.nextRepairCandidate);
  assert.deepEqual(rebuilt.remainingRoutes, committed.remainingRoutes);
  assert.equal(fs.existsSync(reportPath), true);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /REMAINING_GAP_ROUTES\s+= 69/);
  assert.match(report, /SOURCE_ID\s+= g5a_u02_5a02/);
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04-A04_G5A_U02_NumericCapacityExpansionFullFix/);
});
