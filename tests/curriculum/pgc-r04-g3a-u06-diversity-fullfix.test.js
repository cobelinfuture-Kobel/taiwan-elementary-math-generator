import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { materializePgcR04G3aU06DiversityAcceptance } from "../../tools/curriculum/materialize-pgc-r04-g3a-u06-diversity-acceptance.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const generatorPath = path.join(root, "site/modules/curriculum/batch-a/g3a-u06-division-generator.js");
const contractPath = path.join(root, "data/curriculum/public-generation/r04_g3a_u06_diversity_acceptance.json");
const reportPath = path.join(root, "docs/curriculum/output/PGC-R04-A02_G3A_U06_diversity_acceptance.md");

function load() {
  assert.equal(fs.existsSync(contractPath), true);
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

test("PGC-R04-A02 routes seed through the existing G3A-U06 division generator", () => {
  const source = fs.readFileSync(generatorPath, "utf8");
  assert.match(source, /PGC_R04_G3A_U06_SEEDED_VARIATION_V1/);
  assert.match(source, /function seededSequenceNumber\(/);
  assert.match(source, /makeDivisionWithRemainderQuestion\(seededNumber\)/);
  assert.match(source, /makeQuotativeDivisionPackagingQuestion\(seededNumber\)/);
  assert.match(source, /makePartitiveDivisionEqualSharingQuestion\(seededNumber\)/);
  assert.match(source, /makeParityRangeMissingDigitQuestion\(seededNumber\)/);
  assert.doesNotMatch(source, /Math\.random\(/);
});

test("PGC-R04-A02 proves four G3A-U06 routes across ten seeds", () => {
  const contract = load();
  assert.equal(contract.schemaName, "PgcR04G3aU06DiversityAcceptanceV1");
  assert.equal(contract.status, "PASS", JSON.stringify(contract.blockingFailures, null, 2));
  assert.equal(contract.summary.targetRouteCount, 4);
  assert.equal(contract.summary.verified20RouteCount, 4);
  assert.equal(contract.summary.diverseRouteCount, 4);
  assert.equal(contract.summary.sameSeedReplayPassRouteCount, 4);
  assert.equal(contract.summary.duplicatePromptRouteCount, 0);
  assert.equal(contract.summary.resolvedGapRouteCount, 4);
  assert.equal(contract.summary.cumulativeResolvedGapRouteCount, 12);
  assert.equal(contract.summary.remainingR04GapRouteCount, 69);
  assert.equal(contract.summary.remainingDiversityGapRouteCount, 24);
  assert.equal(contract.summary.remainingCapacityGapRouteCount, 69);
  assert.equal(contract.summary.blockingFailureCount, 0);
  for (const route of contract.routes) {
    assert.equal(route.capacityStatus, "VERIFIED_20", route.routeId);
    assert.equal(route.diversityStatus, "DIVERSE_PARAMETER_GENERATOR", route.routeId);
    assert.equal(route.sameSeedReplayPassed, true, route.routeId);
    assert.ok(route.uniqueItemSetCount >= 8, route.routeId);
    assert.equal(route.maximumDuplicatePromptCount, 0, route.routeId);
    assert.equal(route.successfulSeedCount, 10, route.routeId);
    assert.deepEqual(route.failureCodes, [], route.routeId);
    assert.equal(route.replay.orderedWorksheetSignature, route.seedRuns[0].orderedWorksheetSignature, route.routeId);
  }
});

test("PGC-R04-A02 artifacts are deterministic and advance the queue", () => {
  const committed = load();
  const rebuilt = materializePgcR04G3aU06DiversityAcceptance();
  assert.deepEqual(rebuilt.summary, committed.summary);
  assert.deepEqual(rebuilt.blockingFailures, committed.blockingFailures);
  assert.deepEqual(rebuilt.routes.map((route) => [route.routeId, route.uniqueItemSetCount]), committed.routes.map((route) => [route.routeId, route.uniqueItemSetCount]));
  assert.equal(fs.existsSync(reportPath), true);
  const report = fs.readFileSync(reportPath, "utf8");
  assert.match(report, /CUMULATIVE_RESOLVED_GAP_ROUTES\s+= 12/);
  assert.match(report, /REMAINING_DIVERSITY_GAPS\s+= 24/);
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R04-A03_NumericCapacityAndDiversityQueueReprioritization/);
});
