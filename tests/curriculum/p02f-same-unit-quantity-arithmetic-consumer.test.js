import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import {
  executeP02FSameUnitQuantityArithmetic,
  listP02FEffectiveW2PromotionCapabilityIds,
  materializeP02FSameUnitQuantityArithmeticConsumer,
} from "../../src/curriculum/full-product/p02f-same-unit-quantity-arithmetic-consumer.mjs";
import { validateP02FSameUnitQuantityArithmeticConsumer } from "../../tools/curriculum/validate-p02f-same-unit-quantity-arithmetic-consumer.mjs";

const EXPECTED_KP_IDS = [
  "kp_fraction_times_integer_quantity",
  "kp_mass_times_integer",
];

test("P02F admits the exact two direct dependents with distinct numeric and unit modes", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 2);
  assert.equal(runtime.metrics.operationDescriptorCount, 2, runtime.descriptorErrors.join("\n"));
  assert.equal(runtime.metrics.descriptorErrorCount, 0, runtime.descriptorErrors.join("\n"));
  assert.deepEqual(runtime.descriptors.map((row) => row.knowledgePointId), EXPECTED_KP_IDS);
  assert.deepEqual(runtime.metrics.numericDomainCounts, {
    NON_NEGATIVE_RATIONAL: 1,
    NON_NEGATIVE_SAFE_INTEGER: 1,
  });
  assert.equal(runtime.metrics.sourceDeclaredUnitDescriptorCount, 1);
  assert.equal(runtime.metrics.fixedCanonicalUnitBindingCount, 4);
  assert.equal(runtime.operationFamilyId, "QUANTITY_TIMES_INTEGER");
  process.stdout.write(`P02F_DESCRIPTOR_READBACK ${JSON.stringify(runtime.descriptors.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    sourceNodeIds: row.sourceNodeIds,
    numericDomainId: row.numericDomainId,
    dimensionId: row.dimensionId,
    unitFamilyId: row.unitFamilyId,
    canonicalUnitIds: row.canonicalUnitIds,
    sourceDeclaredUnitRequired: row.sourceDeclaredUnitRequired,
    semanticRelationFamilyId: row.semanticRelationFamilyId,
  })))}\n`);
});

test("P02F executes exact rational quantity scaling without floating-point approximation", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const descriptor = runtime.getDescriptor("kp_fraction_times_integer_quantity");
  assert.ok(descriptor);
  assert.equal(descriptor.numericDomainId, "NON_NEGATIVE_RATIONAL");
  assert.equal(descriptor.sourceDeclaredUnitRequired, true);

  for (const sourceNodeId of descriptor.sourceNodeIds) {
    const result = executeP02FSameUnitQuantityArithmetic({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId,
      quantity: {
        value: { wholeNumber: 1, numerator: 1, denominator: 2 },
        unitId: "metre",
      },
      sourceDeclaredUnitId: "metre",
      integerMultiplier: 3,
      assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
      assertedResultUnitId: "metre",
    });
    assert.equal(result.ok, true, `${sourceNodeId}:${result.errors.join("|")}`);
    assert.deepEqual(result.resultQuantity, {
      valueModel: "REDUCED_RATIONAL",
      value: {
        numerator: 9,
        denominator: 2,
        wholeNumber: 4,
        remainderNumerator: 1,
      },
      unitId: "metre",
      dimensionId: "SOURCE_DECLARED_QUANTITY",
      unitFamilyId: "SOURCE_DECLARED_UNIT_FAMILY",
    });
  }

  const reduced = runtime.execute({
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId: descriptor.sourceNodeIds[0],
    quantity: { value: { numerator: 2, denominator: 4 }, unitId: "litre" },
    sourceDeclaredUnitId: "litre",
    integerMultiplier: 3,
  });
  assert.equal(reduced.ok, true, reduced.errors.join("|"));
  assert.deepEqual(reduced.resultQuantity.value, {
    numerator: 3,
    denominator: 2,
    wholeNumber: 1,
    remainderNumerator: 1,
  });
});

test("P02F executes whole-number mass scaling across every canonical mass unit", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const descriptor = runtime.getDescriptor("kp_mass_times_integer");
  assert.ok(descriptor);
  assert.equal(descriptor.numericDomainId, "NON_NEGATIVE_SAFE_INTEGER");
  assert.deepEqual(descriptor.executableCanonicalUnitIds, [
    "milligram",
    "gram",
    "kilogram",
    "metric_ton",
  ]);

  for (const unitId of descriptor.executableCanonicalUnitIds) {
    const result = runtime.execute({
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId: descriptor.sourceNodeIds[0],
      quantity: { value: 12, unitId },
      integerMultiplier: 3,
      assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
      assertedResultUnitId: unitId,
    });
    assert.equal(result.ok, true, `${unitId}:${result.errors.join("|")}`);
    assert.deepEqual(result.resultQuantity, {
      valueModel: "SAFE_INTEGER",
      value: 36,
      unitId,
      dimensionId: "MASS",
      unitFamilyId: "METRIC_MASS",
    });
  }
});

test("P02F delegates P02C identity and fails closed for unit, source, operand and overflow drift", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const fraction = runtime.getDescriptor("kp_fraction_times_integer_quantity");
  const mass = runtime.getDescriptor("kp_mass_times_integer");
  assert.equal(fraction.quantityIdentityId, p02c.getIdentity(fraction.knowledgePointId).identityId);
  assert.equal(mass.quantityIdentityId, p02c.getIdentity(mass.knowledgePointId).identityId);

  const nonDependent = p02b.knowledgePointDescriptors.find((row) => !EXPECTED_KP_IDS.includes(row.knowledgePointId));
  const wrongSource = p02b.sourceDescriptors.find((row) => !mass.sourceNodeIds.includes(row.sourceNodeId));
  const massUnit = mass.executableCanonicalUnitIds[0];
  const fractionSource = fraction.sourceNodeIds[0];

  assert.deepEqual(runtime.execute({}).errors, ["P02F_ARITHMETIC_KP_ID_REQUIRED"]);
  assert.match(runtime.execute({ knowledgePointId: "kp_unknown_p02f" }).errors[0], /^P02F_UNKNOWN_KNOWLEDGE_POINT:/);
  assert.match(runtime.execute({ knowledgePointId: nonDependent.knowledgePointId }).errors[0], /^P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT:/);
  assert.equal(runtime.execute({ knowledgePointId: mass.knowledgePointId, integerMultiplier: 2 }).errors[0], "P02F_QUANTITY_INPUT_REQUIRED");
  assert.equal(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2 }, integerMultiplier: 2 }).errors[0], "P02F_UNIT_ID_REQUIRED");
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: -1, unitId: massUnit }, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 1.5, unitId: massUnit }, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2, unitId: massUnit }, integerMultiplier: -1 }).errors[0], /^P02F_INTEGER_MULTIPLIER_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2, unitId: massUnit }, integerMultiplier: 1.5 }).errors[0], /^P02F_INTEGER_MULTIPLIER_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2, unitId: "wrong_unit" }, integerMultiplier: 2 }).errors[0], /^P02F_UNIT_ID_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2, unitId: massUnit }, integerMultiplier: 2, assertedOperationFamilyId: "WRONG_OPERATION" }).errors[0], /^P02F_OPERATION_FAMILY_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: 2, unitId: massUnit }, integerMultiplier: 2, assertedResultUnitId: "gram" }).errors[0], /^P02F_RESULT_UNIT_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, quantity: { value: Number.MAX_SAFE_INTEGER, unitId: massUnit }, integerMultiplier: 2 }).errors[0], /^P02F_RESULT_OVERFLOW:/);
  assert.match(runtime.execute({ knowledgePointId: mass.knowledgePointId, sourceNodeId: wrongSource.sourceNodeId, quantity: { value: 2, unitId: massUnit }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_KP_MISMATCH:/);

  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_REQUIRED:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "source_declared_unit" }, sourceDeclaredUnitId: "source_declared_unit", integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { numerator: 1, denominator: 2 }, unitId: "metre" }, sourceDeclaredUnitId: "litre", integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { numerator: 1, denominator: 0 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0], /^P02F_RATIONAL_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { wholeNumber: 1, numerator: 3, denominator: 2 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0], /^P02F_RATIONAL_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: fraction.knowledgePointId, sourceNodeId: fractionSource, quantity: { value: { numerator: Number.MAX_SAFE_INTEGER, denominator: 1 }, unitId: "metre" }, sourceDeclaredUnitId: "metre", integerMultiplier: 2 }).errors[0], /^P02F_RESULT_OVERFLOW:/);
});

test("P02F preserves all predecessor promotions and closes the five-foundation W2 set", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  assert.deepEqual(listP02FEffectiveW2PromotionCapabilityIds().sort(), [
    "cap_kp_authority_lookup",
    "cap_prerequisite_readiness",
    "cap_quantity_dimension_unit_identity",
    "cap_quantity_semantic_role_binding",
    "cap_same_unit_quantity_arithmetic",
  ]);
  assert.equal(runtime.promotionRegistry.promotions.length, 1);
  assert.equal(runtime.promotionRegistry.promotions[0].capabilityId, "cap_same_unit_quantity_arithmetic");
  assert.deepEqual(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, []);
  assert.equal(runtime.metrics.effectivePromotionCount, 5);
  assert.equal(runtime.metrics.remainingShadowFoundationCount, 0);
});

test("P02F validator accepts exact production admission and reports machine-readable scope", () => {
  const result = validateP02FSameUnitQuantityArithmeticConsumer();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.effectiveDependentKnowledgePoints, 2);
  assert.equal(result.counts.operationDescriptors, 2);
  assert.equal(result.counts.dependentSourceNodes, 3);
  assert.equal(result.counts.sourceKnowledgePointBindings, 3);
  assert.equal(result.counts.fixedCanonicalUnitBindings, 4);
  assert.equal(result.counts.sourceDeclaredUnitDescriptors, 1);
  assert.equal(result.counts.exactRationalDescriptors, 1);
  assert.equal(result.counts.effectivePromotions, 5);
  assert.equal(result.counts.remainingShadowFoundations, 0);
  process.stdout.write(`P02F_READBACK ${JSON.stringify(result.counts)}\n`);
});
