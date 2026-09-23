import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B5FractionArithmeticConsumer } from "../../src/curriculum/full-product/p03b5-fraction-arithmetic-consumer.mjs";
import { validateP03B5FractionArithmeticConsumer } from "../../tools/curriculum/validate-p03b5-fraction-arithmetic-consumer.mjs";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B5 reconciles P03A, P03B1, P03B3, P03B4 and successor promotion authority", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const validation = validateP03B5FractionArithmeticConsumer();
  const promotion = readJson(
    "data/curriculum/full-product/p03b5/w3-capability-promotion-registry.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B5.claim.json");

  assert.equal(validation.validation.hardeningQueueEntryPassed, true);
  assert.equal(validation.validation.hardeningGatesSatisfied, true);
  assert.equal(validation.validation.predecessorPromotionPassed, true);
  assert.equal(validation.validation.cohortSweepPassed, true);
  assert.equal(validation.validation.sourceKnowledgePointBindingSweepPassed, true);
  assert.equal(validation.validation.predecessorNumberSystemCoveragePassed, true);
  assert.equal(validation.validation.predecessorDomainValidatorCoveragePassed, true);
  assert.equal(validation.validation.promotionStatusPassed, true);
  assert.equal(validation.validation.historicalR04Preserved, true);
  assert.equal(validation.validation.scopeBoundaryPassed, true);
  assert.equal(validation.validation.milestoneClaimIntegrityPassed, true);

  assert.equal(consumer.queueEntry.queueOrder, 5);
  assert.deepEqual(
    [...consumer.queueEntry.hardeningGateCapabilityIds].sort(),
    ["cap_fraction_domain_validator", "cap_fraction_number_system"],
  );
  assert.equal(
    consumer.queueEntry.nextTaskId,
    "P03B5_W3FractionArithmeticConsumerAdmission",
  );
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(consumer.fractionNumberSystem.capabilityId, "cap_fraction_number_system");
  assert.equal(consumer.fractionDomainValidator.capabilityId, "cap_fraction_domain_validator");
  assert.equal(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    true,
  );
  assert.equal(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_domain_validator",
    ),
    true,
  );

  assert.equal(promotion.promotions.length, 1);
  assert.equal(promotion.promotions[0].capabilityId, "cap_fraction_arithmetic");
  assert.equal(promotion.promotions[0].effectiveDeliveryStatus, "production_admitted");
  assert.equal(consumer.effectivePromotionCapabilityIds.length, 10);
  assert.equal(promotion.remainingW3ContractCapabilityIds.length, 2);

  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
});

test("P03B5 preserves product admission boundaries while admitting only shared arithmetic", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const protectedRows = consumer.descriptors.filter((row) => row.protectedExistingD0);
  const newProductRows = consumer.descriptors.filter((row) => !row.protectedExistingD0);

  assert.equal(
    protectedRows.filter((row) => !row.productProductionAdmitted).length,
    0,
  );
  assert.equal(
    newProductRows.filter((row) => row.productProductionAdmitted).length,
    0,
  );

  for (const row of consumer.descriptors) {
    assert.equal(row.productionAdmissionState, "PRODUCTION_ADMITTED");
    assert.equal(row.numberSystemCapabilityId, "cap_fraction_number_system");
    assert.equal(row.domainValidatorCapabilityId, "cap_fraction_domain_validator");
    assert.equal(row.exactBigIntIntermediate, true);
    assert.equal(row.floatingPointApproximationAllowed, false);
    assert.equal(row.decimalArithmeticAllowed, false);
    assert.equal(row.fractionDecimalConversionAllowed, false);
    assert.equal(row.crossDomainNormalizationAllowed, false);
    assert.equal(row.questionGenerationAllowed, false);
  }
});

test("P03B5 keeps P02F as non-authoritative partial candidate and leaves later W3 stages gated", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const queue = consumer.hardeningAuthority.queue;

  assert.equal(consumer.policy.legacyCandidateBoundary.consumedAsArithmeticAuthority, false);
  assert.equal(
    consumer.policy.legacyCandidateBoundary.candidateEvidenceClass,
    "PARTIAL_COMPONENT_CANDIDATE",
  );
  assert.equal(queue.length, 7);
  assert.equal(queue[4].capabilityId, "cap_fraction_arithmetic");
  assert.equal(queue[5].capabilityId, "cap_decimal_arithmetic");
  assert.equal(queue[6].capabilityId, "cap_mixed_number_domain_normalization");
  assert.equal(
    consumer.policy.authorities.operatorApproval,
    "P03B5_APPROVED_2026-07-27",
  );
  for (const row of queue.slice(5)) {
    assert.equal(row.readyForImplementationTask, false);
    assert.equal(row.readyForProductionAdmission, false);
  }
});
