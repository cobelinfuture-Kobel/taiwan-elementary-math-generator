import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B2DecimalNumberSystem,
  materializeP03B2DecimalNumberSystemConsumer,
  normalizeP03B2DecimalValue,
} from "../../src/curriculum/full-product/p03b2-decimal-number-system-consumer.mjs";

function firstDescriptor(consumer) {
  assert.ok(consumer.descriptors.length > 0);
  return consumer.descriptors[0];
}

test("P03B2 materializes the exact decimal-number-system cohort", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  assert.equal(consumer.capabilityId, "cap_decimal_number_system");
  assert.equal(consumer.queueEntry.queueOrder, 2);
  assert.deepEqual(consumer.queueEntry.hardeningGateCapabilityIds, []);
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(consumer.metrics.effectiveDependentKnowledgePointCount, 51);
  assert.equal(consumer.metrics.directW3KnowledgePointCount, 45);
  assert.equal(consumer.metrics.protectedExistingD0KnowledgePointCount, 3);
  assert.equal(consumer.metrics.newProductDependentKnowledgePointCount, 48);
  assert.equal(consumer.metrics.descriptorErrorCount, 0);
  assert.equal(consumer.metrics.acceptedInputFormCount, 4);
  assert.equal(consumer.metrics.allowedActionCount, 4);
  assert.ok(consumer.metrics.dependentSourceNodeCount > 0);
  assert.ok(consumer.metrics.sourceKnowledgePointBindingCount >= 51);

  console.log("P03B2_METRICS", JSON.stringify(consumer.metrics));
});

test("P03B2 normalizes integer, decimal string, scaled integer, decimal parts and zero exactly", () => {
  assert.deepEqual(normalizeP03B2DecimalValue(3).canonicalValue, {
    numericDomainId: "NON_NEGATIVE_DECIMAL",
    valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
    coefficient: "3",
    scale: 0,
    canonicalText: "3",
    wholeNumberText: "3",
    fractionalDigits: "",
    magnitudeClass: "WHOLE_NUMBER",
    base: 10,
    trailingZerosRemoved: 0,
    exact: true,
  });

  assert.deepEqual(normalizeP03B2DecimalValue("0012.3400").canonicalValue, {
    numericDomainId: "NON_NEGATIVE_DECIMAL",
    valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
    coefficient: "1234",
    scale: 2,
    canonicalText: "12.34",
    wholeNumberText: "12",
    fractionalDigits: "34",
    magnitudeClass: "DECIMAL_FRACTION",
    base: 10,
    trailingZerosRemoved: 2,
    exact: true,
  });

  assert.deepEqual(
    normalizeP03B2DecimalValue({ coefficient: "500", scale: 3 }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
      coefficient: "5",
      scale: 1,
      canonicalText: "0.5",
      wholeNumberText: "0",
      fractionalDigits: "5",
      magnitudeClass: "DECIMAL_FRACTION",
      base: 10,
      trailingZerosRemoved: 2,
      exact: true,
    },
  );

  assert.deepEqual(
    normalizeP03B2DecimalValue({ wholeNumber: 1, fractionalDigits: "050" }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_DECIMAL",
      valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
      coefficient: "105",
      scale: 2,
      canonicalText: "1.05",
      wholeNumberText: "1",
      fractionalDigits: "05",
      magnitudeClass: "DECIMAL_FRACTION",
      base: 10,
      trailingZerosRemoved: 1,
      exact: true,
    },
  );

  assert.deepEqual(normalizeP03B2DecimalValue("0.000").canonicalValue, {
    numericDomainId: "NON_NEGATIVE_DECIMAL",
    valueForm: "NORMALIZED_BASE10_COEFFICIENT_SCALE",
    coefficient: "0",
    scale: 0,
    canonicalText: "0",
    wholeNumberText: "0",
    fractionalDigits: "",
    magnitudeClass: "ZERO",
    base: 10,
    trailingZerosRemoved: 3,
    exact: true,
  });
});

test("P03B2 executes equivalence, comparison and equivalent scale expansion with exact integer intermediates", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const descriptor = firstDescriptor(consumer);
  const baseRequest = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const equivalent = consumer.execute({
    ...baseRequest,
    action: "EQUIVALENCE",
    value: "0.5",
    otherValue: "0.5000",
  });
  assert.equal(equivalent.ok, true);
  assert.equal(equivalent.result.equivalent, true);

  const compare = consumer.execute({
    ...baseRequest,
    action: "COMPARE",
    value: "3.04",
    otherValue: "3.004",
  });
  assert.equal(compare.ok, true);
  assert.equal(compare.result.comparison, 1);
  assert.equal(compare.result.relation, "GREATER_THAN");

  const expanded = consumer.execute({
    ...baseRequest,
    action: "EXPAND_SCALE",
    value: "12.34",
    targetScale: 4,
  });
  assert.equal(expanded.ok, true);
  assert.deepEqual(expanded.result.equivalentRepresentation, {
    coefficient: "123400",
    scale: 4,
    decimalText: "12.3400",
    isCanonicalNormalizedForm: false,
    exact: true,
  });
});

test("P03B2 fails closed on identity, source, malformed decimal values and out-of-scope arithmetic", () => {
  const consumer = materializeP03B2DecimalNumberSystemConsumer();
  const descriptor = firstDescriptor(consumer);
  const nonDecimalRow = consumer.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_decimal_number_system")
  ));
  assert.ok(nonDecimalRow);

  const cases = [
    consumer.execute({ value: "0.5" }),
    consumer.execute({ knowledgePointId: "kp_not_real", value: "0.5" }),
    consumer.execute({ knowledgePointId: nonDecimalRow.knowledgePointId, value: "0.5" }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: "source_not_bound",
      value: "0.5",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      assertedCapabilityId: "cap_decimal_arithmetic",
      value: "0.5",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "ADD",
      value: "0.5",
      otherValue: "0.2",
    }),
    consumer.execute({ knowledgePointId: descriptor.knowledgePointId, value: 0.5 }),
    consumer.execute({ knowledgePointId: descriptor.knowledgePointId, value: " 0.5" }),
    consumer.execute({ knowledgePointId: descriptor.knowledgePointId, value: "5e-1" }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { coefficient: "5", scale: -1 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { wholeNumber: 1, fractionalDigits: "" },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EQUIVALENCE",
      value: "0.5",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EXPAND_SCALE",
      value: "0.50",
      targetScale: 0,
    }),
    executeP03B2DecimalNumberSystem({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EXPAND_SCALE",
      value: "0.5",
      targetScale: 33,
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: "1".repeat(65),
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
});
