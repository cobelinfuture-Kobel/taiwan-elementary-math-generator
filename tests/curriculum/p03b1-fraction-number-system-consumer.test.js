import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B1FractionNumberSystem,
  materializeP03B1FractionNumberSystemConsumer,
  normalizeP03B1FractionValue,
} from "../../src/curriculum/full-product/p03b1-fraction-number-system-consumer.mjs";

function firstDescriptor(consumer) {
  assert.ok(consumer.descriptors.length > 0);
  return consumer.descriptors[0];
}

test("P03B1 materializes the exact fraction-number-system cohort", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  assert.equal(consumer.capabilityId, "cap_fraction_number_system");
  assert.equal(consumer.queueEntry.queueOrder, 1);
  assert.equal(consumer.queueEntry.readyForImplementationTask, true);
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(consumer.metrics.effectiveDependentKnowledgePointCount, 73);
  assert.equal(consumer.metrics.directW3KnowledgePointCount, 40);
  assert.equal(consumer.metrics.protectedExistingD0KnowledgePointCount, 1);
  assert.equal(consumer.metrics.newProductDependentKnowledgePointCount, 72);
  assert.equal(consumer.metrics.descriptorErrorCount, 0);
  assert.equal(consumer.metrics.acceptedInputFormCount, 3);
  assert.equal(consumer.metrics.allowedActionCount, 4);
  assert.ok(consumer.metrics.dependentSourceNodeCount > 0);
  assert.ok(consumer.metrics.sourceKnowledgePointBindingCount >= 73);

  console.log("P03B1_METRICS", JSON.stringify(consumer.metrics));
});

test("P03B1 normalizes integer, fraction, improper fraction, mixed number and zero exactly", () => {
  assert.deepEqual(normalizeP03B1FractionValue(3).canonicalValue, {
    numericDomainId: "NON_NEGATIVE_RATIONAL",
    valueForm: "REDUCED_IMPROPER_FRACTION",
    numerator: 3,
    denominator: 1,
    mixedProjection: {
      wholeNumber: 3,
      numerator: 0,
      denominator: 1,
    },
    magnitudeClass: "WHOLE_NUMBER",
    isReduced: true,
    exact: true,
  });

  assert.deepEqual(
    normalizeP03B1FractionValue({ numerator: 2, denominator: 4 }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      valueForm: "REDUCED_IMPROPER_FRACTION",
      numerator: 1,
      denominator: 2,
      mixedProjection: {
        wholeNumber: 0,
        numerator: 1,
        denominator: 2,
      },
      magnitudeClass: "PROPER_FRACTION",
      isReduced: true,
      exact: true,
    },
  );

  assert.deepEqual(
    normalizeP03B1FractionValue({ numerator: 7, denominator: 3 }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      valueForm: "REDUCED_IMPROPER_FRACTION",
      numerator: 7,
      denominator: 3,
      mixedProjection: {
        wholeNumber: 2,
        numerator: 1,
        denominator: 3,
      },
      magnitudeClass: "IMPROPER_FRACTION",
      isReduced: true,
      exact: true,
    },
  );

  assert.deepEqual(
    normalizeP03B1FractionValue({
      wholeNumber: 1,
      numerator: 2,
      denominator: 4,
    }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      valueForm: "REDUCED_IMPROPER_FRACTION",
      numerator: 3,
      denominator: 2,
      mixedProjection: {
        wholeNumber: 1,
        numerator: 1,
        denominator: 2,
      },
      magnitudeClass: "IMPROPER_FRACTION",
      isReduced: true,
      exact: true,
    },
  );

  assert.deepEqual(
    normalizeP03B1FractionValue({ numerator: 0, denominator: 9 }).canonicalValue,
    {
      numericDomainId: "NON_NEGATIVE_RATIONAL",
      valueForm: "REDUCED_IMPROPER_FRACTION",
      numerator: 0,
      denominator: 1,
      mixedProjection: {
        wholeNumber: 0,
        numerator: 0,
        denominator: 1,
      },
      magnitudeClass: "ZERO",
      isReduced: true,
      exact: true,
    },
  );
});

test("P03B1 executes equivalence, comparison and equivalent expansion with exact integer intermediates", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  const descriptor = firstDescriptor(consumer);
  const baseRequest = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const equivalent = consumer.execute({
    ...baseRequest,
    action: "EQUIVALENCE",
    value: { numerator: 2, denominator: 4 },
    otherValue: { numerator: 1, denominator: 2 },
  });
  assert.equal(equivalent.ok, true);
  assert.equal(equivalent.result.equivalent, true);

  const compare = consumer.execute({
    ...baseRequest,
    action: "COMPARE",
    value: { numerator: 3, denominator: 4 },
    otherValue: { numerator: 2, denominator: 3 },
  });
  assert.equal(compare.ok, true);
  assert.equal(compare.result.comparison, 1);
  assert.equal(compare.result.relation, "GREATER_THAN");

  const expanded = consumer.execute({
    ...baseRequest,
    action: "EXPAND_EQUIVALENT",
    value: { numerator: 2, denominator: 4 },
    equivalentFactor: 3,
  });
  assert.equal(expanded.ok, true);
  assert.deepEqual(expanded.result.canonicalValue, {
    numericDomainId: "NON_NEGATIVE_RATIONAL",
    valueForm: "REDUCED_IMPROPER_FRACTION",
    numerator: 1,
    denominator: 2,
    mixedProjection: {
      wholeNumber: 0,
      numerator: 1,
      denominator: 2,
    },
    magnitudeClass: "PROPER_FRACTION",
    isReduced: true,
    exact: true,
  });
  assert.deepEqual(expanded.result.equivalentRepresentation, {
    numerator: 3,
    denominator: 6,
    scaleFactor: 3,
    isCanonicalReducedForm: false,
    exact: true,
  });
});

test("P03B1 fails closed on identity, source, malformed values and out-of-scope arithmetic", () => {
  const consumer = materializeP03B1FractionNumberSystemConsumer();
  const descriptor = firstDescriptor(consumer);
  const nonFractionRow = consumer.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_fraction_number_system")
  ));
  assert.ok(nonFractionRow);

  const cases = [
    consumer.execute({ value: { numerator: 1, denominator: 2 } }),
    consumer.execute({
      knowledgePointId: "kp_not_real",
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      knowledgePointId: nonFractionRow.knowledgePointId,
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: "source_not_bound",
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      assertedCapabilityId: "cap_fraction_arithmetic",
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "ADD",
      value: { numerator: 1, denominator: 2 },
      otherValue: { numerator: 1, denominator: 3 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: 0.5,
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { numerator: 1, denominator: 0 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { wholeNumber: 1, numerator: 3, denominator: 3 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EQUIVALENCE",
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EXPAND_EQUIVALENT",
      value: { numerator: 1, denominator: 2 },
      equivalentFactor: 0,
    }),
    executeP03B1FractionNumberSystem({
      knowledgePointId: descriptor.knowledgePointId,
      action: "EXPAND_EQUIVALENT",
      value: { numerator: Number.MAX_SAFE_INTEGER, denominator: 1 },
      equivalentFactor: 2,
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
});
