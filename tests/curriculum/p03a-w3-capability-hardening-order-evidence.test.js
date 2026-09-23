import test from "node:test";
import assert from "node:assert/strict";

import {
  getP03AW3CapabilityEvidence,
  listP03AW3HardeningQueue,
  materializeP03AW3CapabilityHardeningOrderEvidence,
} from "../../src/curriculum/full-product/p03a-w3-capability-hardening-order-evidence.mjs";
import { validateP03AW3CapabilityHardeningOrderEvidence } from "../../tools/curriculum/validate-p03a-w3-capability-hardening-order-evidence.mjs";

const EXPECTED_QUEUE = [
  "cap_fraction_number_system",
  "cap_decimal_number_system",
  "cap_fraction_domain_validator",
  "cap_decimal_domain_validator",
  "cap_fraction_arithmetic",
  "cap_decimal_arithmetic",
  "cap_mixed_number_domain_normalization",
];

test("P03A materializes the exact seven-capability dependency-safe hardening queue", () => {
  const runtime = materializeP03AW3CapabilityHardeningOrderEvidence();
  assert.deepEqual(runtime.queue.map((row) => row.capabilityId), EXPECTED_QUEUE);
  assert.deepEqual(runtime.queue.map((row) => row.queueOrder), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(runtime.metrics.capabilityCount, 7);
  assert.equal(runtime.metrics.hardeningStageCount, 4);
  assert.equal(runtime.metrics.canonicalDependencyEdgeCount, 6);
  assert.equal(runtime.metrics.hardeningGateEdgeCount, 12);
  assert.ok(runtime.queue.every((row) => row.hardeningGateOrderValid));
  assert.ok(runtime.queue.every((row) => row.canonicalDependenciesIncludedInHardeningGate));
});

test("P03A preserves R04 canonical dependencies and strengthens only implementation sequencing", () => {
  const fractionArithmetic = getP03AW3CapabilityEvidence("cap_fraction_arithmetic");
  const decimalArithmetic = getP03AW3CapabilityEvidence("cap_decimal_arithmetic");
  const mixedNormalization = getP03AW3CapabilityEvidence("cap_mixed_number_domain_normalization");

  assert.deepEqual(fractionArithmetic.canonicalDependencyCapabilityIds, ["cap_fraction_number_system"]);
  assert.deepEqual(fractionArithmetic.hardeningGateCapabilityIds, [
    "cap_fraction_number_system",
    "cap_fraction_domain_validator",
  ]);
  assert.deepEqual(decimalArithmetic.canonicalDependencyCapabilityIds, ["cap_decimal_number_system"]);
  assert.deepEqual(decimalArithmetic.hardeningGateCapabilityIds, [
    "cap_decimal_number_system",
    "cap_decimal_domain_validator",
  ]);
  assert.deepEqual(mixedNormalization.canonicalDependencyCapabilityIds, [
    "cap_decimal_number_system",
    "cap_fraction_number_system",
  ]);
  assert.equal(mixedNormalization.hardeningGateCapabilityIds.length, 6);
});

test("P03A reconciles contracts and source cohorts while keeping all production evidence fail closed", () => {
  const runtime = materializeP03AW3CapabilityHardeningOrderEvidence();
  assert.equal(runtime.metrics.authoritativeContractEvidenceCount, 7);
  assert.equal(runtime.metrics.sourceDependentCohortEvidenceCount, 7);
  assert.equal(runtime.metrics.capabilityWithExistingRuntimeEvidenceCount, 0);
  assert.equal(runtime.metrics.capabilityWithoutExistingRuntimeEvidenceCount, 7);
  assert.equal(runtime.metrics.missingBlockingEvidenceRelationshipCount, 35);
  assert.equal(runtime.metrics.productionReadyCapabilityCount, 0);
  assert.ok(runtime.queue.every((row) => row.deliveryStatusBeforeP03A === "contract_only"));
  assert.ok(runtime.queue.every((row) => row.evidenceReconciliationState === "MISSING_BLOCKING_EVIDENCE"));
  assert.ok(runtime.queue.every((row) => row.missingBlockingEvidenceIds.length === 5));
});

test("P03A classifies P02F exact-rational artifacts only as partial component candidates", () => {
  const runtime = materializeP03AW3CapabilityHardeningOrderEvidence();
  const candidateRows = runtime.queue.filter((row) => row.partialCandidateEvidence.length > 0);
  assert.deepEqual(candidateRows.map((row) => row.capabilityId), [
    "cap_fraction_number_system",
    "cap_fraction_arithmetic",
    "cap_mixed_number_domain_normalization",
  ]);
  assert.equal(runtime.metrics.partialCandidateRelationshipCount, 9);
  assert.equal(runtime.metrics.uniquePartialCandidatePathCount, 3);
  assert.equal(runtime.metrics.partialCandidateExistingPathCount, 9);
  for (const row of candidateRows) {
    for (const candidate of row.partialCandidateEvidence) {
      assert.equal(candidate.exists, true, candidate.repoPath);
      assert.equal(candidate.evidenceClass, "PARTIAL_COMPONENT_CANDIDATE");
      assert.equal(candidate.productionSufficient, false);
    }
    assert.equal(row.readyForProductionAdmission, false);
  }
});

test("P03A keeps protected D0 rows as compatibility witnesses instead of global capability evidence", () => {
  const runtime = materializeP03AW3CapabilityHardeningOrderEvidence();
  const witnessRows = runtime.queue.filter((row) => row.productCompatibilityWitnessCount > 0);
  assert.equal(witnessRows.length, 5);
  assert.ok(witnessRows.every((row) => (
    row.productCompatibilityWitnessEvidenceClass === "PRODUCT_COMPATIBILITY_WITNESS_ONLY"
  )));
  assert.equal(runtime.metrics.capabilityWithProductCompatibilityWitnessCount, 5);
  assert.ok(witnessRows.every((row) => row.readyForProductionAdmission === false));
});

test("P03A exposes exactly one implementation entry point and validator readback", () => {
  const queue = listP03AW3HardeningQueue();
  assert.equal(queue[0].capabilityId, "cap_fraction_number_system");
  assert.equal(queue[0].nextTaskId, "P03B1_W3FractionNumberSystemConsumerAdmission");
  assert.equal(queue[0].readyForImplementationTask, true);
  assert.ok(queue.slice(1).every((row) => row.readyForImplementationTask === false));

  const result = validateP03AW3CapabilityHardeningOrderEvidence();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.capabilityCount, 7);
  assert.equal(result.counts.productionReadyCapabilityCount, 0);
  process.stdout.write(`P03A_READBACK ${JSON.stringify(result.counts)}\n`);
});
