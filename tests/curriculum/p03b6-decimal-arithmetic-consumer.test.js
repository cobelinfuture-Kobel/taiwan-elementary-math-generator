import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B6DecimalArithmetic,
  materializeP03B6DecimalArithmeticConsumer,
} from "../../src/curriculum/full-product/p03b6-decimal-arithmetic-consumer.mjs";

function firstDescriptor(consumer) {
  assert.ok(consumer.descriptors.length > 0);
  return consumer.descriptors[0];
}

function requestBase(consumer) {
  const descriptor = firstDescriptor(consumer);
  return {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };
}

test("P03B6 materializes the authoritative decimal-arithmetic cohort", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  assert.equal(consumer.capabilityId, "cap_decimal_arithmetic");
  assert.equal(consumer.queueEntry.queueOrder, 6);
  assert.deepEqual(
    consumer.queueEntry.hardeningGateCapabilityIds,
    ["cap_decimal_number_system", "cap_decimal_domain_validator"],
  );
  assert.equal(consumer.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(
    consumer.metrics.effectiveDependentKnowledgePointCount,
    consumer.queueEntry.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorNumberSystemCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    consumer.metrics.predecessorDomainValidatorCoverageCount,
    consumer.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(consumer.metrics.descriptorErrorCount, 0);
  assert.ok(consumer.metrics.dependentSourceNodeCount > 0);
  console.log("P03B6_METRICS", JSON.stringify(consumer.metrics));
});

test("P03B6 performs exact base-10 addition and subtraction", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const base = requestBase(consumer);

  const addition = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: "0.10",
    rightValue: "0.20",
  });
  assert.equal(addition.ok, true);
  assert.equal(addition.result.resultCanonicalValue.canonicalText, "0.3");
  assert.equal(addition.result.arithmeticModel, "COMMON_SCALE_EXACT_INTEGER_ARITHMETIC");

  const subtraction = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: "1.20",
    rightValue: "0.25",
  });
  assert.equal(subtraction.ok, true);
  assert.equal(subtraction.result.resultCanonicalValue.canonicalText, "0.95");

  const zero = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: "2.500",
    rightValue: "2.5",
  });
  assert.equal(zero.ok, true);
  assert.equal(zero.result.resultCanonicalValue.canonicalText, "0");
});

test("P03B6 performs exact multiplication and terminating division", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const base = requestBase(consumer);

  const multiplication = consumer.execute({
    ...base,
    action: "MULTIPLY",
    leftValue: "1.25",
    rightValue: "0.4",
  });
  assert.equal(multiplication.ok, true);
  assert.equal(multiplication.result.resultCanonicalValue.canonicalText, "0.5");
  assert.equal(multiplication.result.arithmeticModel, "COEFFICIENT_PRODUCT_SCALE_SUM");

  const division = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: "1",
    rightValue: "8",
  });
  assert.equal(division.ok, true);
  assert.equal(division.result.resultCanonicalValue.canonicalText, "0.125");
  assert.equal(division.result.arithmeticModel, "REDUCED_RATIONAL_TO_FINITE_BASE10");

  const whole = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: "1.2",
    rightValue: "0.3",
  });
  assert.equal(whole.ok, true);
  assert.equal(whole.result.resultCanonicalValue.canonicalText, "4");
});

test("P03B6 accepts all P03B2 exact decimal input forms", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const base = requestBase(consumer);

  const result = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: { coefficient: "125", scale: 2 },
    rightValue: { wholeNumber: 2, fractionalDigits: "75" },
  });
  assert.equal(result.ok, true);
  assert.equal(result.result.leftCanonicalValue.canonicalText, "1.25");
  assert.equal(result.result.rightCanonicalValue.canonicalText, "2.75");
  assert.equal(result.result.resultCanonicalValue.canonicalText, "4");
});

test("P03B6 fails closed on invalid arithmetic-domain results", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const base = requestBase(consumer);

  const negative = consumer.execute({
    ...base,
    action: "SUBTRACT",
    leftValue: "0.2",
    rightValue: "0.3",
  });
  assert.equal(negative.ok, false);
  assert.ok(negative.errors.includes("P03B6_NEGATIVE_RESULT_FORBIDDEN"));

  const zeroDivisor = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: "1",
    rightValue: "0.00",
  });
  assert.equal(zeroDivisor.ok, false);
  assert.ok(zeroDivisor.errors.includes("P03B6_DIVISION_BY_ZERO"));

  const recurring = consumer.execute({
    ...base,
    action: "DIVIDE",
    leftValue: "1",
    rightValue: "3",
  });
  assert.equal(recurring.ok, false);
  assert.ok(recurring.errors.includes("P03B6_NON_TERMINATING_DECIMAL"));
});

test("P03B6 enforces operand policy, result policy and overflow boundaries", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const base = requestBase(consumer);

  const operandBlocked = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: "0",
    rightValue: "1",
    operandPolicy: { allowZero: false },
  });
  assert.equal(operandBlocked.ok, false);
  assert.ok(operandBlocked.errors.some((error) => error.includes("P03B4_ZERO_FORBIDDEN")));

  const resultBlocked = consumer.execute({
    ...base,
    action: "ADD",
    leftValue: "0.2",
    rightValue: "0.3",
    resultPolicy: { maximumValue: "0.4" },
  });
  assert.equal(resultBlocked.ok, false);
  assert.ok(resultBlocked.errors.some((error) => error.startsWith("P03B6_RESULT_POLICY_REJECTED")));

  const huge = "9".repeat(64);
  const overflow = consumer.execute({
    ...base,
    action: "MULTIPLY",
    leftValue: huge,
    rightValue: "9",
  });
  assert.equal(overflow.ok, false);
  assert.ok(overflow.errors.some((error) => error.startsWith("P03B6_RESULT_OVERFLOW")));
});

test("P03B6 fails closed on identity, malformed input and out-of-scope operations", () => {
  const consumer = materializeP03B6DecimalArithmeticConsumer();
  const descriptor = firstDescriptor(consumer);
  const nonArithmeticRow = consumer.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_decimal_arithmetic")
  ));
  assert.ok(nonArithmeticRow);

  const cases = [
    consumer.execute({ leftValue: "1", rightValue: "2" }),
    consumer.execute({ knowledgePointId: "kp_not_real", leftValue: "1", rightValue: "2" }),
    consumer.execute({
      knowledgePointId: nonArithmeticRow.knowledgePointId,
      leftValue: "1",
      rightValue: "2",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: "source_not_bound",
      leftValue: "1",
      rightValue: "2",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      assertedCapabilityId: "cap_fraction_arithmetic",
      leftValue: "1",
      rightValue: "2",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "POWER",
      leftValue: "2",
      rightValue: "3",
    }),
    consumer.execute({
      knowledgePointId: descriptor.knowledgePointId,
      leftValue: 0.5,
      rightValue: "1",
    }),
    executeP03B6DecimalArithmetic({
      knowledgePointId: descriptor.knowledgePointId,
      action: "ADD",
      leftValue: "-0.5",
      rightValue: "1",
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
});
