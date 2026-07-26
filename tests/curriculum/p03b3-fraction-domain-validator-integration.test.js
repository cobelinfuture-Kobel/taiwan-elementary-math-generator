import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B3FractionDomainValidator } from "../../src/curriculum/full-product/p03b3-fraction-domain-validator.mjs";
import { validateP03B3FractionDomainValidator } from "../../tools/curriculum/validate-p03b3-fraction-domain-validator.mjs";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B3 reconciles P03A, P03B1, P03B2 and successor promotion authority", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const validation = validateP03B3FractionDomainValidator();
  const promotion = readJson(
    "data/curriculum/full-product/p03b3/w3-capability-promotion-registry.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B3.claim.json");

  assert.equal(validation.validation.hardeningQueueEntryPassed, true);
  assert.equal(validation.validation.hardeningGateSatisfied, true);
  assert.equal(validation.validation.predecessorPromotionPassed, true);
  assert.equal(validation.validation.cohortSweepPassed, true);
  assert.equal(validation.validation.sourceKnowledgePointBindingSweepPassed, true);
  assert.equal(validation.validation.predecessorNumberSystemCoveragePassed, true);
  assert.equal(validation.validation.promotionStatusPassed, true);
  assert.equal(validation.validation.historicalR04Preserved, true);
  assert.equal(validation.validation.scopeBoundaryPassed, true);
  assert.equal(validation.validation.milestoneClaimIntegrityPassed, true);

  assert.equal(validator.queueEntry.queueOrder, 3);
  assert.deepEqual(validator.queueEntry.hardeningGateCapabilityIds, ["cap_fraction_number_system"]);
  assert.equal(validator.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(validator.fractionNumberSystem.capabilityId, "cap_fraction_number_system");
  assert.equal(validator.fractionNumberSystem.status, "W3_FRACTION_NUMBER_SYSTEM_PRODUCTION_ADMITTED");
  assert.equal(
    validator.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_number_system",
    ),
    true,
  );

  assert.equal(promotion.promotions.length, 1);
  assert.equal(promotion.promotions[0].capabilityId, "cap_fraction_domain_validator");
  assert.equal(promotion.promotions[0].effectiveDeliveryStatus, "production_admitted");
  assert.equal(validator.effectivePromotionCapabilityIds.length, 8);
  assert.equal(promotion.remainingW3ContractCapabilityIds.length, 4);

  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
});

test("P03B3 preserves product admission boundaries while admitting only the shared validator capability", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const protectedRows = validator.descriptors.filter((row) => row.protectedExistingD0);
  const newProductRows = validator.descriptors.filter((row) => !row.protectedExistingD0);

  assert.equal(protectedRows.length, 1);
  assert.equal(protectedRows[0].productProductionAdmitted, true);
  assert.equal(newProductRows.length, 51);
  assert.equal(newProductRows.filter((row) => row.productProductionAdmitted).length, 0);

  for (const row of validator.descriptors) {
    assert.equal(row.productionAdmissionState, "PRODUCTION_ADMITTED");
    assert.equal(row.numberSystemCapabilityId, "cap_fraction_number_system");
    assert.equal(row.arithmeticAllowed, false);
    assert.equal(row.decimalConversionAllowed, false);
    assert.equal(row.crossDomainNormalizationAllowed, false);
    assert.equal(row.questionGenerationAllowed, false);
  }
});

test("P03B3 keeps decimal validation, arithmetic and mixed normalization gated", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const queue = validator.hardeningAuthority.queue;

  assert.equal(queue.length, 7);
  assert.equal(queue[0].capabilityId, "cap_fraction_number_system");
  assert.equal(queue[1].capabilityId, "cap_decimal_number_system");
  assert.equal(queue[2].capabilityId, "cap_fraction_domain_validator");
  assert.equal(queue[3].capabilityId, "cap_decimal_domain_validator");
  assert.equal(queue[4].capabilityId, "cap_fraction_arithmetic");
  assert.equal(queue[6].capabilityId, "cap_mixed_number_domain_normalization");

  assert.equal(validator.policy.authorities.operatorApproval, "P03B3_APPROVED_2026-07-26");
  for (const row of queue.slice(3)) {
    assert.equal(row.readyForImplementationTask, false);
    assert.equal(row.readyForProductionAdmission, false);
  }
});
