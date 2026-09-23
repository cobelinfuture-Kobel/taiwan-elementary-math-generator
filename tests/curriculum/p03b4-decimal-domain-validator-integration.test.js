import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B4DecimalDomainValidator } from "../../src/curriculum/full-product/p03b4-decimal-domain-validator.mjs";
import { validateP03B4DecimalDomainValidator } from "../../tools/curriculum/validate-p03b4-decimal-domain-validator.mjs";

const ROOT = process.cwd();

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

test("P03B4 reconciles P03A, P03B2, P03B3 and successor promotion authority", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const validation = validateP03B4DecimalDomainValidator();
  const promotion = readJson(
    "data/curriculum/full-product/p03b4/w3-capability-promotion-registry.json",
  );
  const claim = readJson("data/project/milestones/FPL-P03B4.claim.json");

  for (const value of Object.values(validation.validation)) assert.equal(value, true);

  assert.equal(validator.queueEntry.queueOrder, 4);
  assert.deepEqual(validator.queueEntry.hardeningGateCapabilityIds, ["cap_decimal_number_system"]);
  assert.equal(validator.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(validator.decimalNumberSystem.capabilityId, "cap_decimal_number_system");
  assert.equal(validator.decimalNumberSystem.status, "W3_DECIMAL_NUMBER_SYSTEM_PRODUCTION_ADMITTED");
  assert.equal(
    validator.predecessorPromotionRegistry.effectivePromotionCapabilityIds.includes(
      "cap_fraction_domain_validator",
    ),
    true,
  );

  assert.equal(promotion.promotions.length, 1);
  assert.equal(promotion.promotions[0].capabilityId, "cap_decimal_domain_validator");
  assert.equal(promotion.promotions[0].effectiveDeliveryStatus, "production_admitted");
  assert.equal(validator.effectivePromotionCapabilityIds.length, 9);
  assert.equal(promotion.remainingW3ContractCapabilityIds.length, 3);

  assert.equal(claim.actualEvidenceLevel, "E5_PRODUCTION_ADMITTED");
  assert.equal(claim.claims.runtimeIntegrated, true);
  assert.equal(claim.claims.productionAdmitted, true);
  assert.equal(claim.claims.visibleOutputChanged, false);
  assert.equal(claim.claims.d0Complete, false);
});

test("P03B4 preserves product admission boundaries while admitting only the shared validator", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const protectedRows = validator.descriptors.filter((row) => row.protectedExistingD0);
  const newProductRows = validator.descriptors.filter((row) => !row.protectedExistingD0);

  assert.equal(
    protectedRows.length,
    validator.metrics.protectedExistingD0KnowledgePointCount,
  );
  assert.equal(
    newProductRows.length,
    validator.metrics.newProductDependentKnowledgePointCount,
  );
  assert.equal(newProductRows.filter((row) => row.productProductionAdmitted).length, 0);

  for (const row of validator.descriptors) {
    assert.equal(row.productionAdmissionState, "PRODUCTION_ADMITTED");
    assert.equal(row.numberSystemCapabilityId, "cap_decimal_number_system");
    assert.equal(row.arithmeticAllowed, false);
    assert.equal(row.fractionConversionAllowed, false);
    assert.equal(row.crossDomainNormalizationAllowed, false);
    assert.equal(row.questionGenerationAllowed, false);
  }
});

test("P03B4 keeps arithmetic and mixed normalization gated", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const queue = validator.hardeningAuthority.queue;

  assert.equal(queue.length, 7);
  assert.equal(queue[0].capabilityId, "cap_fraction_number_system");
  assert.equal(queue[1].capabilityId, "cap_decimal_number_system");
  assert.equal(queue[2].capabilityId, "cap_fraction_domain_validator");
  assert.equal(queue[3].capabilityId, "cap_decimal_domain_validator");
  assert.equal(queue[4].capabilityId, "cap_fraction_arithmetic");
  assert.equal(queue[5].capabilityId, "cap_decimal_arithmetic");
  assert.equal(queue[6].capabilityId, "cap_mixed_number_domain_normalization");

  assert.equal(validator.policy.authorities.operatorApproval, "P03B4_APPROVED_2026-07-27");
  for (const row of queue.slice(4)) {
    assert.equal(row.readyForImplementationTask, false);
    assert.equal(row.readyForProductionAdmission, false);
  }
});
