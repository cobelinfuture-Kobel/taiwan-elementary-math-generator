import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  materializePgcR04G3aU03DiversityAcceptance,
} from "../../tools/curriculum/materialize-pgc-r04-g3a-u03-diversity-acceptance.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorPath = path.join(repoRoot, "site/modules/curriculum/batch-a/g3a-u03-quality-generator.js");
const contractPath = path.join(repoRoot, "data/curriculum/public-generation/r04_g3a_u03_diversity_acceptance.json");
const reportPath = path.join(repoRoot, "docs/curriculum/output/PGC-R04-A01_G3A_U03_diversity_acceptance.md");

function loadContract() {
  assert.equal(fs.existsSync(contractPath), true, "A01 acceptance must be materialized before focused tests");
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

test("PGC-R04-A01 applies the seeded pool permutation to the existing G3A-U03 generator", () => {
  const source = fs.readFileSync(generatorPath, "utf8");
  assert.match(source, /PGC_R04_G3A_U03_SEEDED_VARIATION_V1/);
  assert.match(source, /function seededPoolIndex\(/);
  assert.match(source, /pairFor\(specId, sequenceNumber, seed\)/);
  assert.match(source, /makeMissingQuestion\(sequenceNumber, seed\)/);
  assert.doesNotMatch(source, /Math\.random\(/);
});

test("PGC-R04-A01 proves all eight G3A-U03 numeric routes across ten seeds", () => {
  const contract = loadContract();
  assert.equal(contract.schemaName, "PgcR04G3aU03DiversityAcceptanceV1");
  assert.equal(contract.status, "PASS", JSON.stringify(contract.blockingFailures, null, 2));
  assert.equal(contract.sourceId, "g3a_u03_3a03");
  assert.equal(contract.summary.targetRouteCount, 8);
  assert.equal(contract.summary.verified20RouteCount, 8);
  assert.equal(contract.summary.diverseRouteCount, 8);
  assert.equal(contract.summary.sameSeedReplayPassRouteCount, 8);
  assert.equal(contract.summary.duplicatePromptRouteCount, 0);
  assert.equal(contract.summary.resolvedGapRouteCount, 8);
  assert.equal(contract.summary.remainingR04GapRouteCount, 73);
  assert.equal(contract.summary.remainingDiversityGapRouteCount, 28);
  assert.equal(contract.summary.remainingCapacityGapRouteCount, 69);
  assert.equal(contract.summary.blockingFailureCount, 0);
  assert.equal(contract.routes.length, 8);

  for (const route of contract.routes) {
    assert.equal(route.capacityStatus, "VERIFIED_20", route.routeId);
    assert.equal(route.diversityStatus, "DIVERSE_PARAMETER_GENERATOR", route.routeId);
    assert.equal(route.sameSeedReplayPassed, true, route.routeId);
    assert.ok(route.uniqueItemSetCount >= 8, route.routeId);
    assert.equal(route.maximumDuplicatePromptCount, 0, route.routeId);
    assert.equal(route.successfulSeedCount, 10, route.routeId);
    assert.deepEqual(route.failureCodes, [], route.routeId);
    assert.equal(route.seedRuns.length, 10, route.routeId);
    for (const run of route.seedRuns) {
      assert.equal(run.ok, true, `${route.routeId}:${run.seed}`);
      assert.equal(run.questionCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.answerKeyItemCount, 20, `${route.routeId}:${run.seed}`);
      assert.equal(run.missingPromptCount, 0, `${route.routeId}:${run.seed}`);
      assert.equal(run.duplicatePromptCount, 0, `${route.routeId}:${run.seed}`);
    }
    assert.equal(route.replay.orderedWorksheetSignature, route.seedRuns[0].orderedWorksheetSignature, route.routeId);
  }
});

test("PGC-R04-A01 acceptance artifacts are deterministic and declare the next shortest repair", () => {
  const committed = loadContract();
  const rebuilt = materializePgcR04G3aU03DiversityAcceptance();
  assert.deepEqual(rebuilt.summary, committed.summary);
  assert.deepEqual(rebuilt.blockingFailures, committed.blockingFailures);
  assert.deepEqual(rebuilt.routes.map((route) => ({
    routeId: route.routeId,
    uniqueItemSetCount: route.uniqueItemSetCount,
    uniqueOrderedWorksheetCount: route.uniqueOrderedWorksheetCount,
  })), committed.routes.map((route) => ({
    routeId: route.routeId,
    uniqueItemSetCount: route.uniqueItemSetCount,
    uniqueOrderedWorksheetCount: route.uniqueOrderedWorksheetCount,
  })));
  assert.equal(fs.existsSync(reportPath), true);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /RESOLVED_R04_GAP_ROUTES\s+= 8/);
  assert.match(report, /REMAINING_DIVERSITY_GAP_ROUTES\s+= 28/);
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04-A02_G3A_U06_SeedConsumptionAndCrossSeedDiversityFullFix/);
});
