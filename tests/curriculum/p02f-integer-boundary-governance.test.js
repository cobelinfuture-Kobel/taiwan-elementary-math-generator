import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P02F governance cannot promote fraction arithmetic through the same-unit foundation", () => {
  const policy = readJson("data/curriculum/full-product/p02f/same-unit-quantity-arithmetic-policy.json");
  const manifest = readJson("data/curriculum/full-product/p02f/same-unit-quantity-arithmetic.manifest.json");
  const promotion = readJson("data/curriculum/full-product/p02f/w2-capability-promotion-registry.json");
  const claim = readJson("data/project/milestones/FPL-P02F.claim.json");
  const row = promotion.promotions[0];

  assert.equal(policy.arithmeticContract.rationalObjectInputAllowed, false);
  assert.equal(policy.arithmeticContract.fractionMagnitudeParsingAllowed, false);
  assert.equal(policy.mainlineBoundary.fractionArithmeticImplemented, false);

  assert.equal(manifest.expectedCounts.safeIntegerDescriptorCount, 2);
  assert.deepEqual(manifest.expectedCounts.coefficientDomainCounts, {
    NON_NEGATIVE_SAFE_INTEGER: 2,
  });
  assert.equal(manifest.mainlineBoundary.fractionArithmeticImplemented, false);

  assert.equal(row.safeIntegerCoefficientOnly, true);
  assert.equal(row.exactRationalArithmetic, false);
  assert.equal(row.fractionMagnitudeParsingAllowed, false);
  assert.equal(row.sourceDeclaredUnitIsOpaqueIdentity, true);
  assert.equal(row.scope.coefficientDomainId, "NON_NEGATIVE_SAFE_INTEGER");
  assert.equal(row.scope.safeIntegerDescriptorCount, 2);

  assert.doesNotMatch(claim.claimedStatus, /RATIONAL/);
  assert.doesNotMatch(claim.distance.distanceReduced, /exact fraction|mixed-number scaling|rational forms/i);
});
