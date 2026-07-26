import test from "node:test";
import assert from "node:assert/strict";

import {
  executeP03B3FractionDomainValidation,
  materializeP03B3FractionDomainValidator,
} from "../../src/curriculum/full-product/p03b3-fraction-domain-validator.mjs";

function firstDescriptor(validator) {
  assert.ok(validator.descriptors.length > 0);
  return validator.descriptors[0];
}

test("P03B3 materializes the exact fraction-domain-validator cohort", () => {
  const validator = materializeP03B3FractionDomainValidator();
  assert.equal(validator.capabilityId, "cap_fraction_domain_validator");
  assert.equal(validator.queueEntry.queueOrder, 3);
  assert.deepEqual(validator.queueEntry.hardeningGateCapabilityIds, ["cap_fraction_number_system"]);
  assert.equal(validator.queueEntry.deliveryStatusBeforeP03A, "contract_only");
  assert.equal(validator.metrics.effectiveDependentKnowledgePointCount, 52);
  assert.equal(validator.metrics.directW3KnowledgePointCount, 40);
  assert.equal(validator.metrics.protectedExistingD0KnowledgePointCount, 1);
  assert.equal(validator.metrics.newProductDependentKnowledgePointCount, 51);
  assert.equal(validator.metrics.predecessorNumberSystemCoverageCount, 52);
  assert.equal(validator.metrics.descriptorErrorCount, 0);
  assert.equal(validator.metrics.allowedActionCount, 3);
  assert.equal(validator.metrics.allowedRelationCount, 6);
  assert.ok(validator.metrics.dependentSourceNodeCount > 0);
  assert.ok(validator.metrics.sourceKnowledgePointBindingCount >= 52);

  console.log("P03B3_METRICS", JSON.stringify(validator.metrics));
});

test("P03B3 validates exact canonical values and deterministic value policies", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
  };

  const normalized = validator.execute({
    ...base,
    value: { numerator: 2, denominator: 4 },
  });
  assert.equal(normalized.ok, true);
  assert.equal(normalized.valid, true);
  assert.equal(normalized.result.canonicalIdentity, "1/2");

  const properOnly = validator.execute({
    ...base,
    value: { numerator: 3, denominator: 4 },
    valuePolicy: {
      allowedMagnitudeClasses: ["PROPER_FRACTION"],
      allowZero: false,
      minimumValue: { numerator: 1, denominator: 4 },
      maximumValue: { numerator: 7, denominator: 8 },
      maxCanonicalNumerator: 10,
      maxCanonicalDenominator: 10,
    },
  });
  assert.equal(properOnly.ok, true);

  const magnitudeBlocked = validator.execute({
    ...base,
    value: { numerator: 7, denominator: 3 },
    valuePolicy: { allowedMagnitudeClasses: ["PROPER_FRACTION"] },
  });
  assert.equal(magnitudeBlocked.ok, false);
  assert.ok(magnitudeBlocked.errors.some((error) => error.startsWith("P03B3_MAGNITUDE_CLASS_NOT_ALLOWED")));

  const zeroBlocked = validator.execute({
    ...base,
    value: { numerator: 0, denominator: 9 },
    valuePolicy: { allowZero: false },
  });
  assert.equal(zeroBlocked.ok, false);
  assert.ok(zeroBlocked.errors.includes("P03B3_ZERO_FORBIDDEN"));

  const rangeBlocked = validator.execute({
    ...base,
    value: { numerator: 1, denominator: 5 },
    valuePolicy: { minimumValue: { numerator: 1, denominator: 4 } },
  });
  assert.equal(rangeBlocked.ok, false);
  assert.ok(rangeBlocked.errors.includes("P03B3_MINIMUM_VALUE_VIOLATION"));

  const denominatorBlocked = validator.execute({
    ...base,
    value: { numerator: 1, denominator: 11 },
    valuePolicy: { maxCanonicalDenominator: 10 },
  });
  assert.equal(denominatorBlocked.ok, false);
  assert.ok(denominatorBlocked.errors.some((error) => error.startsWith("P03B3_DENOMINATOR_LIMIT_EXCEEDED")));
});

test("P03B3 validates exact pair relations without performing fraction arithmetic", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    action: "VALIDATE_PAIR",
  };

  const equivalent = validator.execute({
    ...base,
    value: { numerator: 2, denominator: 4 },
    otherValue: { numerator: 1, denominator: 2 },
    requiredRelation: "EQUAL",
  });
  assert.equal(equivalent.ok, true);
  assert.equal(equivalent.result.relation, "EQUAL");
  assert.equal(equivalent.result.relationSatisfied, true);

  const greater = validator.execute({
    ...base,
    value: { numerator: 3, denominator: 4 },
    otherValue: { numerator: 2, denominator: 3 },
    requiredRelation: "GREATER_THAN",
  });
  assert.equal(greater.ok, true);
  assert.equal(greater.result.relation, "GREATER_THAN");

  const mismatch = validator.execute({
    ...base,
    value: { numerator: 1, denominator: 3 },
    otherValue: { numerator: 1, denominator: 2 },
    requiredRelation: "GREATER_THAN",
  });
  assert.equal(mismatch.ok, false);
  assert.ok(mismatch.errors.some((error) => error.startsWith("P03B3_RELATION_MISMATCH")));
});

test("P03B3 validates canonical sets and fails closed on equivalent duplicates", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const descriptor = firstDescriptor(validator);
  const base = {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    action: "VALIDATE_SET",
  };

  const validSet = validator.execute({
    ...base,
    values: [
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 3 },
      { numerator: 3, denominator: 4 },
    ],
    valuePolicy: { allowedMagnitudeClasses: ["PROPER_FRACTION"] },
    setPolicy: { minCount: 3, maxCount: 3, uniqueCanonicalValues: true },
  });
  assert.equal(validSet.ok, true);
  assert.equal(validSet.result.uniqueCanonicalValueCount, 3);

  const duplicateSet = validator.execute({
    ...base,
    values: [
      { numerator: 1, denominator: 2 },
      { numerator: 2, denominator: 4 },
    ],
    setPolicy: { uniqueCanonicalValues: true },
  });
  assert.equal(duplicateSet.ok, false);
  assert.ok(duplicateSet.errors.includes("P03B3_DUPLICATE_CANONICAL_VALUE"));

  const sizeBlocked = validator.execute({
    ...base,
    values: [{ numerator: 1, denominator: 2 }],
    setPolicy: { minCount: 2, maxCount: 4 },
  });
  assert.equal(sizeBlocked.ok, false);
  assert.ok(sizeBlocked.errors.some((error) => error.startsWith("P03B3_SET_SIZE_INVALID")));
});

test("P03B3 fails closed on identity, source, malformed policies and out-of-scope arithmetic", () => {
  const validator = materializeP03B3FractionDomainValidator();
  const descriptor = firstDescriptor(validator);
  const nonValidatorRow = validator.predecessorInventory.rows.find((row) => (
    !row.w3CapabilityIds.includes("cap_fraction_domain_validator")
  ));
  assert.ok(nonValidatorRow);

  const cases = [
    validator.execute({ value: { numerator: 1, denominator: 2 } }),
    validator.execute({ knowledgePointId: "kp_not_real", value: { numerator: 1, denominator: 2 } }),
    validator.execute({ knowledgePointId: nonValidatorRow.knowledgePointId, value: { numerator: 1, denominator: 2 } }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: "source_not_bound",
      value: { numerator: 1, denominator: 2 },
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      assertedCapabilityId: "cap_fraction_arithmetic",
      value: { numerator: 1, denominator: 2 },
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "ADD",
      value: { numerator: 1, denominator: 2 },
      otherValue: { numerator: 1, denominator: 3 },
    }),
    validator.execute({ knowledgePointId: descriptor.knowledgePointId, value: 0.5 }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { numerator: 1, denominator: 0 },
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      value: { numerator: 1, denominator: 2 },
      valuePolicy: { unsupported: true },
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_PAIR",
      value: { numerator: 1, denominator: 2 },
      otherValue: { numerator: 1, denominator: 3 },
      requiredRelation: "APPROXIMATELY_EQUAL",
    }),
    validator.execute({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_SET",
      values: [],
    }),
    executeP03B3FractionDomainValidation({
      knowledgePointId: descriptor.knowledgePointId,
      action: "VALIDATE_SET",
      values: [{ numerator: 1, denominator: 2 }],
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
