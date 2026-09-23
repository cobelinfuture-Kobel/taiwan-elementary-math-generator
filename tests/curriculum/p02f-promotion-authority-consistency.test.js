import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P02F promotion remains consistent with canonical fraction-times-integer authority", () => {
  const operation = readJson("data/curriculum/application/operations/w02/g4a_u06_4a06.canonical-operation.json");
  const manifest = readJson("data/curriculum/full-product/p02f/same-unit-quantity-arithmetic.manifest.json");
  const promotion = readJson("data/curriculum/full-product/p02f/w2-capability-promotion-registry.json");
  const claim = readJson("data/project/milestones/FPL-P02F.claim.json");

  const canonical = operation.knowledgePoints.find((row) => (
    row.knowledgePointId === "kp_g4a_u06_fraction_times_integer_quantity"
  ));
  assert.ok(canonical);
  assert.equal(canonical.operationModels[0].operationFamilyId, "fraction_times_integer");
  assert.equal(canonical.operationModels[0].answerType, "fraction_measure");

  const row = promotion.promotions[0];
  assert.equal(row.capabilityId, "cap_same_unit_quantity_arithmetic");
  assert.equal(row.canonicalOperationAuthorityRequired, true);
  assert.equal(row.exactRationalArithmetic, true);
  assert.equal(row.floatingPointApproximationAllowed, false);
  assert.deepEqual(row.scope.numericDomainIds, [
    "NON_NEGATIVE_RATIONAL",
    "NON_NEGATIVE_SAFE_INTEGER",
  ]);
  assert.equal(row.scope.exactRationalDescriptorCount, 1);

  assert.equal(manifest.expectedCounts.exactRationalDescriptorCount, 1);
  assert.equal(manifest.expectedCounts.numericDomainCounts.NON_NEGATIVE_RATIONAL, 1);
  assert.equal(manifest.exactAcceptance.exactRationalMixedNumberExecutionPassed, true);
  assert.equal(manifest.exactAcceptance.rationalReductionPassed, true);

  assert.match(claim.claimedStatus, /EXACT_INTEGER_RATIONAL/);
  assert.match(claim.distance.distanceReduced, /exact rational arithmetic/);
});
