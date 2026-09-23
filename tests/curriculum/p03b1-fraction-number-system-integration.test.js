import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B1FractionNumberSystemConsumer } from "../../src/curriculum/full-product/p03b1-fraction-number-system-consumer.mjs";
import { validateP03B1FractionNumberSystemConsumer } from "../../tools/curriculum/validate-p03b1-fraction-number-system-consumer.mjs";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B1 reconciles P03A, P03 inventory and successor promotion authority", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  const validation = validateP03B1FractionNumberSystemConsumer();
  const promotion = readJson(
    "data/curriculum/full-product/p03b1/w3-capability-promotion-registry.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B1.claim.json");

  assert.equal(validation.validation.hardeningQueueEntryPassed, true);
  assert.equal(validation.validation.cohortSweepPassed, true);
  assert.equal(validation.validation.sourceKnowledgePointBindingSweepPassed, true);
  assert.equal(validation.validation.promotionStatusPassed, true);
  assert.equal(validation.validation.historicalR04Preserved, true);
  assert.equal(validation.validation.scopeBoundaryPassed, true);
  assert.equal(validation.validation.milestoneClaimIntegrityPassed, true);

  assert.equal(consumer.queueEntry.queueOrder, 1);
  assert.deepEqual(consumer.queueEntry.hardeningGateCapabilityIds, []);
  assert.equal(consumer.queueEntry.readyForImplementationTask, true);
  assert.equal(consumer.queueEntry.readyForProductionAdmission, false);
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");

  assert.equal(promotion.promotions.length, 1);
  assert.equal(promotion.promotions[0].capabilityId, "cap_fraction_number_system");
  assert.equal(
    promotion.promotions[0].effectiveDeliveryStatus,
    "production_admitted",
  );
  assert.equal(consumer.effectivePromotionCapabilityIds.length, 6);
  assert.equal(
    promotion.remainingW3ContractCapabilityIds.length,
    6,
  );

  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
});

test("P03B1 preserves product admission boundaries while admitting only the shared capability", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();

  const protectedRows = consumer.descriptors.filter(
    (row) => row.protectedExistingD0,
  );
  const newProductRows = consumer.descriptors.filter(
    (row) => !row.protectedExistingD0,
  );

  assert.equal(protectedRows.length, 1);
  assert.equal(protectedRows[0].productProductionAdmitted, true);
  assert.equal(newProductRows.length, 72);
  assert.equal(
    newProductRows.filter((row) => row.productProductionAdmitted).length,
    0,
  );

  for (const row of consumer.descriptors) {
    assert.equal(row.productionAdmissionState, "PRODUCTION_ADMITTED");
    assert.equal(row.arithmeticAllowed, false);
    assert.equal(row.decimalConversionAllowed, false);
    assert.equal(row.crossDomainNormalizationAllowed, false);
    assert.equal(row.questionGenerationAllowed, false);
  }
});

test("P03B1 keeps later hardening entries gated", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  const queue = consumer.hardeningAuthority.queue;

  assert.equal(queue.length, 7);
  assert.equal(queue[0].capabilityId, "cap_fraction_number_system");
  assert.equal(queue[1].capabilityId, "cap_decimal_number_system");
  assert.equal(queue[2].capabilityId, "cap_fraction_domain_validator");
  assert.equal(queue[4].capabilityId, "cap_fraction_arithmetic");
  assert.equal(queue[6].capabilityId, "cap_mixed_number_domain_normalization");

  for (const row of queue.slice(1)) {
    assert.equal(row.readyForImplementationTask, false);
    assert.equal(row.readyForProductionAdmission, false);
  }
});
