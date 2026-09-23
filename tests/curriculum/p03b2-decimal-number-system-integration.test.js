import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B2DecimalNumberSystemConsumer } from "../../src/curriculum/full-product/p03b2-decimal-number-system-consumer.mjs";
import { validateP03B2DecimalNumberSystemConsumer } from "../../tools/curriculum/validate-p03b2-decimal-number-system-consumer.mjs";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B2 reconciles P03A, P03B1 and successor promotion authority", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const validation = validateP03B2DecimalNumberSystemConsumer();
  const promotion = readJson(
    "data/curriculum/full-product/p03b2/w3-capability-promotion-registry.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B2.claim.json");

  assert.equal(validation.validation.hardeningQueueEntryPassed, true);
  assert.equal(validation.validation.predecessorPromotionPassed, true);
  assert.equal(validation.validation.cohortSweepPassed, true);
  assert.equal(validation.validation.sourceKnowledgePointBindingSweepPassed, true);
  assert.equal(validation.validation.promotionStatusPassed, true);
  assert.equal(validation.validation.historicalR04Preserved, true);
  assert.equal(validation.validation.scopeBoundaryPassed, true);
  assert.equal(validation.validation.milestoneClaimIntegrityPassed, true);

  assert.equal(consumer.queueEntry.queueOrder, 2);
  assert.deepEqual(consumer.queueEntry.hardeningGateCapabilityIds, []);
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(
    consumer.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    true,
  );

  assert.equal(promotion.promotions.length, 1);
  assert.equal(promotion.promotions[0].capabilityId, "cap_decimal_number_system");
  assert.equal(promotion.promotions[0].effectiveDeliveryStatus, "production_admitted");
  assert.equal(consumer.effectivePromotionCapabilityIds.length, 7);
  assert.equal(promotion.remainingW3ContractCapabilityIds.length, 5);

  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
});

test("P03B2 preserves product admission boundaries while admitting only the shared decimal capability", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const protectedRows = consumer.descriptors.filter((row) => row.protectedExistingD0);
  const newProductRows = consumer.descriptors.filter((row) => !row.protectedExistingD0);

  assert.equal(protectedRows.length, 3);
  assert.equal(protectedRows.filter((row) => row.productProductionAdmitted).length, 3);
  assert.equal(newProductRows.length, 48);
  assert.equal(newProductRows.filter((row) => row.productProductionAdmitted).length, 0);

  for (const row of consumer.descriptors) {
    assert.equal(row.productionAdmissionState, "PRODUCTION_ADMITTED");
    assert.equal(row.arithmeticAllowed, false);
    assert.equal(row.fractionConversionAllowed, false);
    assert.equal(row.crossDomainNormalizationAllowed, false);
    assert.equal(row.questionGenerationAllowed, false);
  }
});

test("P03B2 keeps domain-validator, arithmetic and mixed-normalization work gated", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const queue = consumer.hardeningAuthority.queue;

  assert.equal(queue.length, 7);
  assert.equal(queue[0].capabilityId, "cap_fraction_number_system");
  assert.equal(queue[1].capabilityId, "cap_decimal_number_system");
  assert.equal(queue[2].capabilityId, "cap_fraction_domain_validator");
  assert.equal(queue[3].capabilityId, "cap_decimal_domain_validator");
  assert.equal(queue[5].capabilityId, "cap_decimal_arithmetic");
  assert.equal(queue[6].capabilityId, "cap_mixed_number_domain_normalization");

  assert.equal(consumer.policy.authorities.operatorApproval, "P03B2_APPROVED_2026-07-26");
  for (const row of queue.slice(2)) {
    assert.equal(row.readyForImplementationTask, false);
    assert.equal(row.readyForProductionAdmission, false);
  }
});
