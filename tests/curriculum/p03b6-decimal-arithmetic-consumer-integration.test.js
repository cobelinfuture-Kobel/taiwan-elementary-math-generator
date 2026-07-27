import test from "node:test";
import assert from "node:assert/strict";

import { materializeP03B6DecimalArithmeticConsumer } from "../../src/curriculum/full-product/p03b6-decimal-arithmetic-consumer.mjs";
import { validateP03B6DecimalArithmeticConsumer } from "../../tools/curriculum/validate-p03b6-decimal-arithmetic-consumer.mjs";

test("P03B6 admission validator passes queue, gates, cohort and promotion", () => {
  const result = validateP03B6DecimalArithmeticConsumer();
  assert.equal(result.status, "W3_DECIMAL_ARITHMETIC_PRODUCTION_ADMITTED");
  assert.equal(result.capabilityId, "cap_decimal_arithmetic");
  assert.equal(result.validation.hardeningQueueEntryPassed, true);
  assert.equal(result.validation.hardeningGateSatisfied, true);
  assert.equal(result.validation.predecessorPromotionPassed, true);
  assert.equal(result.validation.cohortSweepPassed, true);
  assert.equal(result.validation.predecessorNumberSystemCoveragePassed, true);
  assert.equal(result.validation.predecessorDomainValidatorCoveragePassed, true);
  assert.equal(result.validation.promotionStatusPassed, true);
  assert.equal(result.validation.historicalR04Preserved, true);
  assert.equal(result.validation.scopeBoundaryPassed, true);
  assert.equal(result.validation.milestoneClaimIntegrityPassed, true);
});

test("P03B6 executes one exact arithmetic witness for every dependent KnowledgePoint", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  assert.ok(consumer.descriptors.length > 0);

  for (const descriptor of consumer.descriptors) {
    const result = consumer.execute({
      action: "ADD",
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: descriptor.sourceNodeIds[0],
      leftValue: "0.1",
      rightValue: "0.2",
      assertedCapabilityId: "cap_decimal_arithmetic",
    });
    assert.equal(result.ok, true, `${descriptor.knowledgePointId}:${result.errors.join(",")}`);
    assert.equal(result.result.resultCanonicalValue.canonicalText, "0.3");
    assert.equal(result.descriptor.numberSystemDescriptorId != null, true);
    assert.equal(result.descriptor.domainValidatorDescriptorId != null, true);
  }

  assert.equal(
    consumer.effectivePromotionCapabilityIds.includes("cap_decimal_arithmetic"),
    true,
  );
  assert.deepEqual(
    consumer.promotionRegistry.remainingW3ContractCapabilityIds,
    ["cap_mixed_number_domain_normalization"],
  );
});
