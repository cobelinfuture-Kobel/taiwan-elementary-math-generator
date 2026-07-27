import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B7MixedNumberDomainNormalization,
  materializeP03B7MixedNumberDomainNormalizationConsumer,
} from "../../src/curriculum/full-product/p03b7-mixed-number-domain-normalization-consumer.mjs";

function firstDescriptor(consumer) {
  assert.ok(consumer.descriptors.length > 0);
  return consumer.descriptors[0];
}

function baseFor(consumer) {
  const descriptor = firstDescriptor(consumer);
  return {
    descriptor,
    request: {
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: descriptor.sourceNodeIds[0],
      assertedCapabilityId: "cap_mixed_number_domain_normalization",
    },
  };
}

test("P03B7 materializes the authoritative mixed-domain cohort", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  assert.equal(consumer.capabilityId, "cap_mixed_number_domain_normalization");
  assert.equal(consumer.queueEntry.queueOrder, 7);
  assert.deepEqual(consumer.queueEntry.hardeningGateCapabilityIds, [
    "cap_fraction_number_system",
    "cap_decimal_number_system",
    "cap_fraction_domain_validator",
    "cap_decimal_domain_validator",
    "cap_fraction_arithmetic",
    "cap_decimal_arithmetic",
  ]);
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(
    consumer.metrics.effectiveDependentKnowledgePointCount,
    consumer.queueEntry.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.directW3KnowledgePointCount,
    consumer.queueEntry.directW3KnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.protectedExistingD0KnowledgePointCount,
    consumer.queueEntry.protectedExistingD0KnowledgePointCount,
  );
  assert.equal(consumer.metrics.descriptorErrorCount, 0);
  assert.equal(
    consumer.metrics.predecessorFractionNumberSystemCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorDecimalNumberSystemCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorFractionDomainValidatorCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorDecimalDomainValidatorCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  console.log("P03B7_METRICS", JSON.stringify(consumer.metrics));
});

test("P03B7 converts exact decimals to reduced fractions", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { request } = baseFor(consumer);

  const result = consumer.execute({
    ...request,
    action: "TO_FRACTION",
    sourceDomain: "DECIMAL",
    value: "1.2500",
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.sourceCanonicalValue.canonicalText, "1.25");
  assert.equal(result.result.canonicalValue.numerator, 5);
  assert.equal(result.result.canonicalValue.denominator, 4);
  assert.equal(result.result.canonicalRationalIdentity, "5/4");
  assert.equal(result.result.exact, true);
});

test("P03B7 converts fractions and mixed numbers to terminating decimals", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { request } = baseFor(consumer);

  const mixed = consumer.execute({
    ...request,
    action: "TO_DECIMAL",
    sourceDomain: "FRACTION",
    value: { wholeNumber: 1, numerator: 1, denominator: 4 },
  });
  assert.equal(mixed.ok, true);
  assert.equal(mixed.result.sourceCanonicalValue.numerator, 5);
  assert.equal(mixed.result.sourceCanonicalValue.denominator, 4);
  assert.equal(mixed.result.canonicalValue.canonicalText, "1.25");
  assert.equal(mixed.result.canonicalRationalIdentity, "5/4");

  const eighth = consumer.execute({
    ...request,
    action: "TO_DECIMAL",
    sourceDomain: "FRACTION",
    value: { numerator: 1, denominator: 8 },
  });
  assert.equal(eighth.ok, true);
  assert.equal(eighth.result.canonicalValue.canonicalText, "0.125");
  assert.deepEqual(eighth.result.termination, {
    factorTwoCount: 3,
    factorFiveCount: 0,
    canonicalScale: 3,
  });
});

test("P03B7 resolves exact cross-domain equivalence and comparison", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { request } = baseFor(consumer);

  const equivalent = consumer.execute({
    ...request,
    action: "EQUIVALENCE",
    leftDomain: "FRACTION",
    leftValue: { numerator: 1, denominator: 2 },
    rightDomain: "DECIMAL",
    rightValue: "0.500",
  });
  assert.equal(equivalent.ok, true);
  assert.equal(equivalent.result.equivalent, true);
  assert.equal(equivalent.result.relation, "EQUAL");
  assert.equal(equivalent.result.leftCanonicalRationalIdentity, "1/2");
  assert.equal(equivalent.result.rightCanonicalRationalIdentity, "1/2");

  const less = consumer.execute({
    ...request,
    action: "COMPARE",
    leftDomain: "FRACTION",
    leftValue: { numerator: 3, denominator: 4 },
    rightDomain: "DECIMAL",
    rightValue: "0.8",
  });
  assert.equal(less.ok, true);
  assert.equal(less.result.comparison, -1);
  assert.equal(less.result.relation, "LESS_THAN");

  const greater = executeP03B7MixedNumberDomainNormalization({
    ...request,
    action: "COMPARE",
    leftDomain: "DECIMAL",
    leftValue: "2.5",
    rightDomain: "FRACTION",
    rightValue: { wholeNumber: 2, numerator: 1, denominator: 4 },
  });
  assert.equal(greater.ok, true);
  assert.equal(greater.result.relation, "GREATER_THAN");
});

test("P03B7 delegates source and target policies to domain validators", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { request } = baseFor(consumer);

  const valid = consumer.execute({
    ...request,
    action: "TO_FRACTION",
    sourceDomain: "DECIMAL",
    value: "0.75",
    decimalPolicy: {
      allowedMagnitudeClasses: ["DECIMAL_FRACTION"],
      allowZero: false,
      maximumValue: "1.00",
    },
    fractionPolicy: {
      allowedMagnitudeClasses: ["PROPER_FRACTION"],
      maxCanonicalDenominator: 8,
    },
  });
  assert.equal(valid.ok, true);
  assert.equal(valid.result.canonicalRationalIdentity, "3/4");

  const targetBlocked = consumer.execute({
    ...request,
    action: "TO_DECIMAL",
    sourceDomain: "FRACTION",
    value: { numerator: 1, denominator: 8 },
    decimalPolicy: { maxCanonicalScale: 2 },
  });
  assert.equal(targetBlocked.ok, false);
  assert.ok(targetBlocked.errors.some((error) => (
    error.includes("P03B7_TARGET_VALIDATOR_REJECTED")
      && error.includes("P03B4_SCALE_LIMIT_EXCEEDED")
  )));
});

test("P03B7 fails closed on recurring decimals and cross-domain violations", () => {
  const consumer = materializeP03B7MixedNumberDomainNormalizationConsumer();
  const { descriptor, request } = baseFor(consumer);
  const nonDependentRow = consumer.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_mixed_number_domain_normalization")
  ));
  assert.ok(nonDependentRow);

  const cases = [
    consumer.execute({ action: "TO_FRACTION", sourceDomain: "DECIMAL", value: "0.5" }),
    consumer.execute({
      knowledgePointId: "kp_not_real",
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "0.5",
    }),
    consumer.execute({
      knowledgePointId: nonDependentRow.knowledgePointId,
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "0.5",
    }),
    consumer.execute({
      ...request,
      sourceNodeId: "source_not_bound",
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "0.5",
    }),
    consumer.execute({
      ...request,
      assertedCapabilityId: "cap_ratio_percent_reasoning",
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "0.5",
    }),
    consumer.execute({
      ...request,
      action: "ROUND",
      sourceDomain: "DECIMAL",
      value: "0.5",
    }),
    consumer.execute({
      ...request,
      action: "TO_FRACTION",
      sourceDomain: "FRACTION",
      value: { numerator: 1, denominator: 2 },
    }),
    consumer.execute({
      ...request,
      action: "TO_DECIMAL",
      sourceDomain: "FRACTION",
      value: { numerator: 1, denominator: 3 },
    }),
    consumer.execute({
      ...request,
      action: "COMPARE",
      leftDomain: "DECIMAL",
      leftValue: "0.5",
      rightDomain: "DECIMAL",
      rightValue: "0.50",
    }),
    consumer.execute({
      ...request,
      action: "EQUIVALENCE",
      leftDomain: "FRACTION",
      leftValue: { numerator: 1, denominator: 2 },
      rightDomain: "BINARY",
      rightValue: "0.1",
    }),
    consumer.execute({
      ...request,
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: 0.5,
    }),
    consumer.execute({
      ...request,
      action: "TO_FRACTION",
      sourceDomain: "DECIMAL",
      value: "-0.5",
    }),
    consumer.execute({
      ...request,
      action: "COMPARE",
      leftDomain: "FRACTION",
      leftValue: null,
      rightDomain: "DECIMAL",
      rightValue: "0.5",
    }),
    executeP03B7MixedNumberDomainNormalization({
      knowledgePointId: descriptor.knowledgePointId,
      action: "TO_DECIMAL",
      sourceDomain: "FRACTION",
      value: null,
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
  assert.ok(cases[7].errors.some((error) => error.startsWith("P03B7_NON_TERMINATING_DECIMAL")));
  assert.ok(cases[8].errors.some((error) => error.startsWith("P03B7_CROSS_DOMAIN_REQUIRED")));
});
