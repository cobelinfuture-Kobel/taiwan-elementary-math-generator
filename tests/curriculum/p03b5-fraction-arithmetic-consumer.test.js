import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B5FractionArithmetic,
  materializeP03B5FractionArithmeticConsumer,
} from "../../src/curriculum/full-product/p03b5-fraction-arithmetic-consumer.mjs";

function firstDescriptor(consumer) {
  assert.ok(consumer.descriptors.length > 0);
  return consumer.descriptors[0];
}

test("P03B5 materializes the exact fraction-arithmetic cohort", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  assert.equal(consumer.capabilityId, "cap_fraction_arithmetic");
  assert.equal(consumer.queueEntry.queueOrder, 5);
  assert.deepEqual(
    [...consumer.queueEntry.hardeningGateCapabilityIds].sort(),
    ["cap_fraction_domain_validator", "cap_fraction_number_system"],
  );
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.ok(consumer.metrics.effectiveDependentKnowledgePointCount > 0);
  assert.ok(consumer.metrics.directW3KnowledgePointCount > 0);
  assert.equal(consumer.metrics.descriptorErrorCount, 0);
  assert.equal(
    consumer.metrics.predecessorNumberSystemCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorDomainValidatorCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(consumer.metrics.allowedActionCount, 4);
  assert.ok(consumer.metrics.dependentSourceNodeCount > 0);
  assert.ok(
    consumer.metrics.sourceKnowledgePointBindingCount
      >= consumer.metrics.effectiveDependentKnowledgePointCount,
  );

  console.log("P03B5_METRICS", JSON.stringify(consumer.metrics));
});

test("P03B5 executes exact add, subtract, multiply and divide", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const descriptor = firstDescriptor(consumer);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const addition = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: { numerator: 1, denominator: 2 },
    rightValue: { numerator: 1, denominator: 3 },
  });
  assert.equal(addition.ok, true);
  assert.equal(addition.result.canonicalValue.numerator, 5);
  assert.equal(addition.result.canonicalValue.denominator, 6);
  assert.equal(addition.result.exact, true);
  assert.equal(addition.result.arithmeticTrace.algorithm, "LEAST_COMMON_DENOMINATOR_VIA_GCD");

  const subtraction = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: { numerator: 5, denominator: 6 },
    rightValue: { numerator: 1, denominator: 2 },
  });
  assert.equal(subtraction.ok, true);
  assert.equal(subtraction.result.canonicalValue.numerator, 1);
  assert.equal(subtraction.result.canonicalValue.denominator, 3);

  const multiplication = consumer.execute({
    ...base,
    action: "MULTIPLY",
    leftValue: { numerator: 2, denominator: 3 },
    rightValue: { numerator: 9, denominator: 4 },
  });
  assert.equal(multiplication.ok, true);
  assert.equal(multiplication.result.canonicalValue.numerator, 3);
  assert.equal(multiplication.result.canonicalValue.denominator, 2);
  assert.equal(multiplication.result.arithmeticTrace.algorithm, "CROSS_CANCEL_THEN_MULTIPLY");

  const division = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: { numerator: 3, denominator: 5 },
    rightValue: { numerator: 9, denominator: 10 },
  });
  assert.equal(division.ok, true);
  assert.equal(division.result.canonicalValue.numerator, 2);
  assert.equal(division.result.canonicalValue.denominator, 3);
  assert.equal(division.result.arithmeticTrace.algorithm, "MULTIPLY_BY_RECIPROCAL_THEN_REDUCE");
});

test("P03B5 accepts mixed-number operands and returns reduced improper fractions", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const descriptor = firstDescriptor(consumer);
  const result = consumer.execute({
    action: "ADD",
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    leftValue: { wholeNumber: 1, numerator: 1, denominator: 2 },
    rightValue: { numerator: 2, denominator: 3 },
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.leftCanonicalValue.numerator, 3);
  assert.equal(result.result.leftCanonicalValue.denominator, 2);
  assert.equal(result.result.canonicalValue.numerator, 13);
  assert.equal(result.result.canonicalValue.denominator, 6);
  assert.equal(result.result.canonicalValue.mixedProjection.wholeNumber, 2);
  assert.equal(result.result.canonicalValue.mixedProjection.numerator, 1);
  assert.equal(result.result.canonicalValue.mixedProjection.denominator, 6);
  assert.equal(result.result.canonicalValue.isReduced, true);
});

test("P03B5 delegates result policies to the admitted fraction-domain validator", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const descriptor = firstDescriptor(consumer);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const properResult = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: { numerator: 1, denominator: 4 },
    rightValue: { numerator: 1, denominator: 4 },
    resultPolicy: {
      allowedMagnitudeClasses: ["PROPER_FRACTION"],
      allowZero: false,
      maximumValue: { numerator: 3, denominator: 4 },
    },
  });
  assert.equal(properResult.ok, true);
  assert.equal(properResult.result.canonicalValue.numerator, 1);
  assert.equal(properResult.result.canonicalValue.denominator, 2);

  const improperBlocked = consumer.execute({
    ...base,
    action: "MULTIPLY",
    leftValue: { numerator: 3, denominator: 2 },
    rightValue: { numerator: 1, denominator: 1 },
    resultPolicy: { allowedMagnitudeClasses: ["PROPER_FRACTION"] },
  });
  assert.equal(improperBlocked.ok, false);
  assert.ok(
    improperBlocked.errors.some((error) => (
      error.startsWith("P03B5_RESULT_POLICY_REJECTED:P03B3_MAGNITUDE_CLASS_NOT_ALLOWED")
    )),
  );

  const zeroBlocked = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: { numerator: 1, denominator: 2 },
    rightValue: { numerator: 1, denominator: 2 },
    resultPolicy: { allowZero: false },
  });
  assert.equal(zeroBlocked.ok, false);
  assert.ok(
    zeroBlocked.errors.some((error) => (
      error === "P03B5_RESULT_POLICY_REJECTED:P03B3_ZERO_FORBIDDEN"
    )),
  );
});

test("P03B5 fails closed on negative results, zero divisors, overflow and invalid requests", () => {
  const consumer = materializeP03B5FractionArithmeticConsumer();
  const descriptor = firstDescriptor(consumer);
  const nonArithmeticRow = consumer.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_fraction_arithmetic")
  ));
  assert.ok(nonArithmeticRow);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const negative = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: { numerator: 1, denominator: 3 },
    rightValue: { numerator: 1, denominator: 2 },
  });
  assert.equal(negative.ok, false);
  assert.ok(negative.errors.includes("P03B5_NEGATIVE_RESULT_FORBIDDEN"));

  const divideByZero = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: { numerator: 1, denominator: 2 },
    rightValue: { numerator: 0, denominator: 7 },
  });
  assert.equal(divideByZero.ok, false);
  assert.ok(divideByZero.errors.includes("P03B5_DIVISION_BY_ZERO"));

  const overflow = consumer.execute({
    ...base,
    action: "MULTIPLY",
    leftValue: Number.MAX_SAFE_INTEGER,
    rightValue: Number.MAX_SAFE_INTEGER,
  });
  assert.equal(overflow.ok, false);
  assert.ok(overflow.errors.some((error) => error.startsWith("P03B5_RESULT_OVERFLOW")));

  const cases = [
    consumer.execute({ action: "ADD", leftValue: 1, rightValue: 2 }),
    consumer.execute({ knowledgePointId: "kp_not_real", action: "ADD", leftValue: 1, rightValue: 2 }),
    consumer.execute({
      knowledgePointId: nonArithmeticRow.knowledgePointId,
      action: "ADD",
      leftValue: 1,
      rightValue: 2,
    }),
    consumer.execute({
      ...base,
      sourceNodeId: "source_not_bound",
      action: "ADD",
      leftValue: 1,
      rightValue: 2,
    }),
    consumer.execute({
      ...base,
      assertedCapabilityId: "cap_decimal_arithmetic",
      action: "ADD",
      leftValue: 1,
      rightValue: 2,
    }),
    consumer.execute({ ...base, action: "POWER", leftValue: 1, rightValue: 2 }),
    consumer.execute({ ...base, action: "ADD", leftValue: null, rightValue: 2 }),
    consumer.execute({ ...base, action: "ADD", leftValue: 1, rightValue: null }),
    consumer.execute({
      ...base,
      action: "ADD",
      leftValue: 0.5,
      rightValue: { numerator: 1, denominator: 2 },
    }),
    executeP03B5FractionArithmetic({
      ...base,
      action: "ADD",
      leftValue: { numerator: 1, denominator: 0 },
      rightValue: { numerator: 1, denominator: 2 },
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
});
