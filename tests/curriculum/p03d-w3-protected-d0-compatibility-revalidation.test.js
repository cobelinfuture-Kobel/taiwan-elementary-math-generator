import test from "node:test";
import assert from "node:assert/strict";

import {
  getP03DProtectedD0CompatibilityRow,
  materializeP03DW3ProtectedD0CompatibilityRevalidation,
} from "../../src/curriculum/full-product/p03d-w3-protected-d0-compatibility-revalidation.mjs";
import { validateP03DW3ProtectedD0CompatibilityRevalidation } from "../../tools/curriculum/validate-p03d-w3-protected-d0-compatibility-revalidation.mjs";

const EXPECTED_IDS = [
  "kp_g3a_u01_digit_arrangement_max_min",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4b_u01_trailing_zero_division_remainder_restore",
];

test("P03D closes the four protected D0 compatibility-revalidation rows", () => {
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
  assert.equal(runtime.taskId, "P03D_W3ProtectedD0CompatibilityRevalidation");
  assert.deepEqual([...runtime.protectedKnowledgePointIds].sort(), EXPECTED_IDS);
  assert.equal(runtime.metrics.protectedKnowledgePointCount, 4);
  assert.equal(runtime.metrics.protectedSourceCount, 3);
  assert.equal(runtime.metrics.historicallyProductionAdmittedCount, 4);
  assert.equal(runtime.metrics.capabilityUnblockedProtectedCount, 4);
  assert.equal(runtime.metrics.revalidatedProtectedCount, 4);
  assert.equal(runtime.metrics.preservedProtectedProductAdmissionCount, 4);
  assert.equal(runtime.metrics.newProductAdmissionCount, 0);
  assert.equal(runtime.metrics.unaffectedNewProductRowCount, 115);
});

test("P03D revalidates every visible protected pattern group through the public pipeline", () => {
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
  assert.ok(runtime.metrics.publicPatternGroupCount > 0);
  assert.ok(runtime.metrics.publicPatternSpecCount > 0);
  assert.ok(runtime.metrics.compatibilityWitnessCount > 0);
  assert.equal(runtime.metrics.compatibilityWitnessPassCount, runtime.metrics.compatibilityWitnessCount);
  assert.equal(runtime.metrics.compatibilityWitnessFailCount, 0);
  assert.equal(runtime.metrics.answerKeyWitnessCount, runtime.metrics.compatibilityWitnessCount);
  assert.equal(runtime.metrics.htmlWitnessCount, runtime.metrics.compatibilityWitnessCount);
  assert.equal(runtime.metrics.printLayoutWitnessCount, runtime.metrics.compatibilityWitnessCount);
  assert.equal(runtime.metrics.globalAuthorityWitnessCount, runtime.metrics.compatibilityWitnessCount);

  for (const witness of runtime.compatibilityWitnesses) {
    assert.equal(witness.passed, true, witness.witnessId);
    assert.equal(witness.checks.worksheetBuildPass, true, witness.witnessId);
    assert.equal(witness.checks.validatorPass, true, witness.witnessId);
    assert.equal(witness.checks.generatedQuestionPass, true, witness.witnessId);
    assert.equal(witness.checks.answerKeyPass, true, witness.witnessId);
    assert.equal(witness.checks.htmlRenderPass, true, witness.witnessId);
    assert.equal(witness.checks.printLayoutPass, true, witness.witnessId);
    assert.equal(witness.checks.globalAuthorityCutoverPass, true, witness.witnessId);
    assert.equal(witness.checks.knowledgePointIdentityPass, true, witness.witnessId);
    assert.equal(witness.checks.patternGroupIdentityPass, true, witness.witnessId);
    assert.equal(witness.authority.authorityMode, "GLOBAL_PRIMARY");
    assert.equal(witness.authority.legacyAuthorityRole, "COMPATIBILITY_ALIAS_READ_ONLY");
    assert.ok(witness.generatedQuestionCount > 0);
    assert.ok(witness.answerKeyCount > 0);
    assert.ok(witness.htmlByteLength > 0);
  }
});

test("P03D preserves the exact product-admission identity without recreating admissions", () => {
  for (const knowledgePointId of EXPECTED_IDS) {
    const row = getP03DProtectedD0CompatibilityRow(knowledgePointId);
    assert.ok(row);
    assert.equal(row.protectedExistingD0, true);
    assert.equal(row.historicalProductProductionAdmitted, true);
    assert.equal(row.capabilityUnblocked, true);
    assert.equal(row.compatibilityRevalidated, true);
    assert.equal(row.productProductionAdmitted, true);
    assert.equal(row.newlyProductAdmittedByP03D, false);
    assert.equal(row.successorProductAdmissionState, "PROTECTED_D0_COMPATIBILITY_REVALIDATED_ADMISSION_PRESERVED");
    assert.ok(row.publicPatternGroupIds.length > 0);
    assert.ok(row.publicPatternSpecIds.length > 0);
    assert.equal(row.compatibilityWitnesses.length, row.publicPatternGroupIds.length);
  }
});

test("P03D deterministic validator passes", () => {
  const result = validateP03DW3ProtectedD0CompatibilityRevalidation();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.errors, []);
  assert.equal(result.counts.protectedKnowledgePoints, 4);
  assert.equal(result.counts.protectedSources, 3);
  assert.equal(result.counts.revalidatedProtected, 4);
  assert.equal(result.counts.preservedAdmissions, 4);
  assert.equal(result.counts.newProductAdmissions, 0);
  assert.equal(result.counts.unaffectedNewProductRows, 115);
});
