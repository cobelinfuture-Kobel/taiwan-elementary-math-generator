import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B4DecimalDomainValidation,
  materializeP03B4DecimalDomainValidator,
} from "../../src/curriculum/full-product/p03b4-decimal-domain-validator.mjs";

function firstDescriptor(validator) {
  assert.ok(validator.descriptors.length > 0);
  return validator.descriptors[0];
}

test("P03B4 materializes the authoritative decimal-domain-validator cohort", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  assert.equal(validator.capabilityId, "cap_decimal_domain_validator");
  assert.equal(validator.queueEntry.queueOrder, 4);
  assert.deepEqual(validator.queueEntry.hardeningGateCapabilityIds, ["cap_decimal_number_system"]);
  assert.equal(validator.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(
    validator.metrics.effectiveDependentKnowledgePointCount,
    validator.queueEntry.effectiveDependentKnowledgePointCount,
  );
  assert.equal(
    validator.metrics.directW3KnowledgePointCount,
    validator.queueEntry.directW3KnowledgePointCount,
  );
  assert.equal(
    validator.metrics.protectedExistingD0KnowledgePointCount,
    validator.queueEntry.protectedExistingD0KnowledgePointCount,
  );
  assert.equal(
    validator.metrics.predecessorNumberSystemCoverageCount,
    validator.metrics.effectiveDependentKnowledgePointCount,
  );
  assert.equal(validator.metrics.descriptorErrorCount, 0);
  assert.ok(validator.metrics.dependentSourceNodeCount > 0);
  assert.ok(
    validator.metrics.sourceKnowledgePointBindingCount
      >= validator.metrics.effectiveDependentKnowledgePointCount,
  );
  console.log("P03B4_METRICS", JSON.stringify(validator.metrics));
});

test("P03B4 validates exact canonical decimal values and policies", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const normalized = validator.execute({ ...base, value: "1.2500" });
  assert.equal(normalized.ok, true);
  assert.equal(normalized.result.canonicalIdentity, "125e-2");
  assert.equal(normalized.result.canonicalValue.canonicalText, "1.25");

  const constrained = validator.execute({
    ...base,
    value: "3.45",
    valuePolicy: {
      allowedMagnitudeClasses: ["DECIMAL_FRACTION"],
      allowZero: false,
      minimumValue: "1.25",
      maximumValue: "8.75",
      maxCanonicalCoefficientDigits: 3,
      maxCanonicalScale: 2,
      allowedCanonicalScales: [2],
    },
  });
  assert.equal(constrained.ok, true);

  const magnitudeBlocked = validator.execute({
    ...base,
    value: "7",
    valuePolicy: { allowedMagnitudeClasses: ["DECIMAL_FRACTION"] },
  });
  assert.equal(magnitudeBlocked.ok, false);
  assert.ok(magnitudeBlocked.errors.some((error) => error.startsWith("P03B4_MAGNITUDE_CLASS_NOT_ALLOWED")));

  const zeroBlocked = validator.execute({
    ...base,
    value: "0.00",
    valuePolicy: { allowZero: false },
  });
  assert.equal(zeroBlocked.ok, false);
  assert.ok(zeroBlocked.errors.includes("P03B4_ZERO_FORBIDDEN"));

  const digitsBlocked = validator.execute({
    ...base,
    value: "123.45",
    valuePolicy: { maxCanonicalCoefficientDigits: 4 },
  });
  assert.equal(digitsBlocked.ok, false);
  assert.ok(digitsBlocked.errors.some((error) => error.startsWith("P03B4_COEFFICIENT_DIGIT_LIMIT_EXCEEDED")));

  const scaleBlocked = validator.execute({
    ...base,
    value: "1.234",
    valuePolicy: { maxCanonicalScale: 2 },
  });
  assert.equal(scaleBlocked.ok, false);
  assert.ok(scaleBlocked.errors.some((error) => error.startsWith("P03B4_SCALE_LIMIT_EXCEEDED")));

  const allowedScaleBlocked = validator.execute({
    ...base,
    value: "1.2",
    valuePolicy: { allowedCanonicalScales: [2, 3] },
  });
  assert.equal(allowedScaleBlocked.ok, false);
  assert.ok(allowedScaleBlocked.errors.some((error) => error.startsWith("P03B4_SCALE_NOT_ALLOWED")));

  const rangeBlocked = validator.execute({
    ...base,
    value: "0.24",
    valuePolicy: { minimumValue: "0.25" },
  });
  assert.equal(rangeBlocked.ok, false);
  assert.ok(rangeBlocked.errors.includes("P03B4_MINIMUM_VALUE_VIOLATION"));
});

test("P03B4 validates exact decimal pair relations", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    action: "VALIDATE_PAIR",
  };

  const equivalent = validator.execute({
    ...base,
    value: "0.5",
    otherValue: "0.500",
    requiredRelation: "EQUAL",
  });
  assert.equal(equivalent.ok, true);
  assert.equal(equivalent.result.relation, "EQUAL");

  const greater = validator.execute({
    ...base,
    value: "1.2",
    otherValue: "1.19",
    requiredRelation: "GREATER_THAN",
  });
  assert.equal(greater.ok, true);
  assert.equal(greater.result.relation, "GREATER_THAN");

  const mismatch = validator.execute({
    ...base,
    value: "0.3",
    otherValue: "0.31",
    requiredRelation: "GREATER_THAN_OR_EQUAL",
  });
  assert.equal(mismatch.ok, false);
  assert.ok(mismatch.errors.some((error) => error.startsWith("P03B4_RELATION_MISMATCH")));
});

test("P03B4 validates canonical decimal sets and equivalent duplicates", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    action: "VALIDATE_SET",
  };

  const validSet = validator.execute({
    ...base,
    values: ["0.25", "0.5", "0.75"],
    valuePolicy: { allowedMagnitudeClasses: ["DECIMAL_FRACTION"] },
    setPolicy: { minCount: 3, maxCount: 3, uniqueCanonicalValues: true },
  });
  assert.equal(validSet.ok, true);
  assert.equal(validSet.result.uniqueCanonicalValueCount, 3);

  const duplicateSet = validator.execute({
    ...base,
    values: ["0.5", "0.500"],
    setPolicy: { uniqueCanonicalValues: true },
  });
  assert.equal(duplicateSet.ok, false);
  assert.ok(duplicateSet.errors.includes("P03B4_DUPLICATE_CANONICAL_VALUE"));

  const sizeBlocked = validator.execute({
    ...base,
    values: ["0.5"],
    setPolicy: { minCount: 2, maxCount: 4 },
  });
  assert.equal(sizeBlocked.ok, false);
  assert.ok(sizeBlocked.errors.some((error) => error.startsWith("P03B4_SET_SIZE_INVALID")));
});

test("P03B4 fails closed on identity, malformed policies and arithmetic scope", () => {
  const validator = materializeP03B4DecimalDomainValidator();
  const descriptor = firstDescriptor(validator);
  const nonValidatorRow = validator.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_decimal_domain_validator")
  ));
  assert.ok(nonValidatorRow);

  const cases = [
    validator.execute({ value: "0.5" }),
    validator.execute({ knowledgePointId: "kp_not_real", value: "0.5" }),
    validator.execute({ knowledgePointId: nonValidatorRow.knowledgePointId, value: "0.5" }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: "source_not_bound",
      value: "0.5",
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      assertedCapabilityId: "cap_decimal_arithmetic",
      value: "0.5",
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "ADD",
      value: "0.5",
      otherValue: "0.3",
    }),
    validator.execute({ knowledgePointId: descriptor.knowledgePointId, value: 0.5 }),
    validator.execute({ knowledgePointId: descriptor.knowledgePointId, value: "-0.5" }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: "0.5",
      valuePolicy: { unsupported: true },
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_PAIR",
      value: "0.5",
      otherValue: "0.3",
      requiredRelation: "APPROXIMATELY_EQUAL",
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_SET",
      values: [],
    }),
    executeP03B4DecimalDomainValidation({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_SET",
      values: ["0.5"],
      setPolicy: { maxCount: 33 },
    }),
  ];

  for (const result of cases) {
    assert.equal(result.ok, false);
    assert.equal(result.valid, false);
    assert.equal(result.blocked, true);
    assert.ok(result.errors.length > 0);
  }
});
