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

const EXPLICIT_SOURCE_UNIT_ID = "explicit_fractional_quantity_unit";

function requestFor(descriptor, sourceNodeId, value = 12, integerMultiplier = 3) {
  if (descriptor.sourceDeclaredUnitRequired) {
    return {
      knowledgePointId: descriptor.knowledgePointId,
      sourceNodeId,
      quantity: { value, unitId: EXPLICIT_SOURCE_UNIT_ID },
      sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID,
      integerMultiplier,
      assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
      assertedResultUnitId: EXPLICIT_SOURCE_UNIT_ID,
    };
  }
  const unitId = descriptor.executableCanonicalUnitIds[0];
  return {
    knowledgePointId: descriptor.knowledgePointId,
    sourceNodeId,
    quantity: { value, unitId },
    integerMultiplier,
    assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
    assertedResultUnitId: unitId,
  };
}

test("P02F admits exactly two direct same-unit quantity arithmetic dependents", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 2);
  assert.equal(runtime.metrics.operationDescriptorCount, 2, runtime.descriptorErrors.join("\n"));
  assert.equal(runtime.metrics.descriptorErrorCount, 0, runtime.descriptorErrors.join("\n"));
  assert.deepEqual(runtime.descriptors.map((row) => row.knowledgePointId), [
    "kp_fraction_times_integer_quantity",
    "kp_mass_times_integer",
  ]);
  assert.equal(runtime.operationFamilyId, "QUANTITY_TIMES_INTEGER");
  assert.equal(runtime.metrics.dependentSourceNodeCount, 3);
  assert.equal(runtime.metrics.sourceKnowledgePointBindingCount, 3);
  assert.equal(runtime.metrics.fixedCanonicalUnitBindingCount, 4);
  assert.equal(runtime.metrics.sourceDeclaredUnitDescriptorCount, 1);
  assert.equal(runtime.metrics.safeIntegerDescriptorCount, 2);
  process.stdout.write(`P02F_DESCRIPTOR_READBACK ${JSON.stringify(runtime.descriptors.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    sourceNodeIds: row.sourceNodeIds,
    dimensionId: row.dimensionId,
    unitFamilyId: row.unitFamilyId,
    canonicalUnitIds: row.canonicalUnitIds,
    executableCanonicalUnitIds: row.executableCanonicalUnitIds,
    sourceDeclaredUnitRequired: row.sourceDeclaredUnitRequired,
    semanticRelationFamilyId: row.semanticRelationFamilyId,
  })))}\n`);
});

test("P02F computes integer coefficient times integer and preserves the exact unit", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  for (const descriptor of runtime.descriptors) {
    for (const sourceNodeId of descriptor.sourceNodeIds) {
      const request = requestFor(descriptor, sourceNodeId);
      const result = runtime.execute(request);
      assert.equal(result.ok, true, `${sourceNodeId}:${descriptor.knowledgePointId}:${result.errors.join("|")}`);
      assert.deepEqual(result.resultQuantity, {
        value: 36,
        unitId: request.quantity.unitId,
        dimensionId: descriptor.dimensionId,
        unitFamilyId: descriptor.unitFamilyId,
      });
      assert.equal(result.descriptor.nonNegativeSafeIntegerOnly, true);
      assert.equal(result.descriptor.rationalObjectInputAllowed, false);
      assert.equal(result.descriptor.fractionMagnitudeParsingAllowed, false);
      assert.equal(result.descriptor.unitConversionAllowed, false);
      assert.equal(result.descriptor.mixedUnitNormalizationAllowed, false);
    }
  }
});

test("P02F executes every fixed P02C canonical unit without conversion", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  for (const descriptor of runtime.descriptors.filter((row) => !row.sourceDeclaredUnitRequired)) {
    const identity = p02c.getIdentity(descriptor.knowledgePointId);
    assert.ok(identity, descriptor.knowledgePointId);
    assert.equal(descriptor.quantityIdentityId, identity.identityId);
    assert.deepEqual(descriptor.canonicalUnitIds, [...identity.canonicalUnitIds]);
    for (const unitId of descriptor.executableCanonicalUnitIds) {
      const result = executeP02FSameUnitQuantityArithmetic({
        knowledgePointId: descriptor.knowledgePointId,
        quantity: { value: 5, unitId },
        integerMultiplier: 2,
      });
      assert.equal(result.ok, true, `${descriptor.knowledgePointId}:${unitId}:${result.errors.join("|")}`);
      assert.equal(result.resultQuantity.value, 10);
      assert.equal(result.resultQuantity.unitId, unitId);
    }
  }
});

test("P02F treats source-declared fractional quantity units as opaque and rejects rational parsing", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const descriptor = runtime.getDescriptor("kp_fraction_times_integer_quantity");
  assert.ok(descriptor);
  assert.equal(descriptor.sourceDeclaredUnitRequired, true);
  assert.deepEqual(descriptor.executableCanonicalUnitIds, []);
  const sourceNodeId = descriptor.sourceNodeIds[0];

  const valid = runtime.execute(requestFor(descriptor, sourceNodeId, 4, 5));
  assert.equal(valid.ok, true, valid.errors.join("\n"));
  assert.equal(valid.resultQuantity.value, 20);
  assert.equal(valid.resultQuantity.unitId, EXPLICIT_SOURCE_UNIT_ID);

  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_SOURCE_REQUIRED:/);
  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_REQUIRED:/);
  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: "source_declared_unit" }, sourceDeclaredUnitId: "source_declared_unit", integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_PLACEHOLDER_FORBIDDEN:/);
  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, sourceNodeId, quantity: { value: 2, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: "different_source_unit", integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_DECLARED_UNIT_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, sourceNodeId, quantity: { value: { numerator: 1, denominator: 2 }, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: descriptor.knowledgePointId, sourceNodeId, quantity: { value: 1.5, unitId: EXPLICIT_SOURCE_UNIT_ID }, sourceDeclaredUnitId: EXPLICIT_SOURCE_UNIT_ID, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
});

test("P02F fails closed for invalid identity, unit, operand, operation and result-unit requests", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const first = runtime.getDescriptor("kp_mass_times_integer");
  assert.ok(first);
  const unitId = first.executableCanonicalUnitIds[0];
  const nonDependent = p02b.knowledgePointDescriptors.find((row) => !runtime.descriptors.some((descriptor) => descriptor.knowledgePointId === row.knowledgePointId));
  const wrongSource = p02b.sourceDescriptors.find((row) => !first.sourceNodeIds.includes(row.sourceNodeId));

  assert.deepEqual(runtime.execute({}).errors, ["P02F_ARITHMETIC_KP_ID_REQUIRED"]);
  assert.match(runtime.execute({ knowledgePointId: "kp_unknown_p02f" }).errors[0], /^P02F_UNKNOWN_KNOWLEDGE_POINT:/);
  assert.match(runtime.execute({ knowledgePointId: nonDependent.knowledgePointId }).errors[0], /^P02F_KP_NOT_SAME_UNIT_ARITHMETIC_DEPENDENT:/);
  assert.equal(runtime.execute({ knowledgePointId: first.knowledgePointId, integerMultiplier: 2 }).errors[0], "P02F_QUANTITY_INPUT_REQUIRED");
  assert.equal(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2 }, integerMultiplier: 2 }).errors[0], "P02F_UNIT_ID_REQUIRED");
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: -1, unitId }, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 1.5, unitId }, integerMultiplier: 2 }).errors[0], /^P02F_QUANTITY_VALUE_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: -1 }).errors[0], /^P02F_INTEGER_MULTIPLIER_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 1.5 }).errors[0], /^P02F_INTEGER_MULTIPLIER_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId: "wrong_unit" }, integerMultiplier: 2 }).errors[0], /^P02F_UNIT_ID_INVALID:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedOperationFamilyId: "WRONG_OPERATION" }).errors[0], /^P02F_OPERATION_FAMILY_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: 2, unitId }, integerMultiplier: 2, assertedResultUnitId: "different_unit" }).errors[0], /^P02F_RESULT_UNIT_MISMATCH:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, quantity: { value: Number.MAX_SAFE_INTEGER, unitId }, integerMultiplier: 2 }).errors[0], /^P02F_RESULT_OVERFLOW:/);
  assert.match(runtime.execute({ knowledgePointId: first.knowledgePointId, sourceNodeId: wrongSource.sourceNodeId, quantity: { value: 2, unitId }, integerMultiplier: 2 }).errors[0], /^P02F_SOURCE_KP_MISMATCH:/);
});

test("P02F preserves predecessor promotions and closes the five-foundation W2 set", () => {
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
  assert.deepEqual(result.counts, {
    effectiveDependentKnowledgePoints: 2,
    operationDescriptors: 2,
    dependentSources: 3,
    sourceKnowledgePointBindings: 3,
    semanticRoleBindings: 2,
    fixedCanonicalUnitBindings: 4,
    sourceDeclaredUnitDescriptors: 1,
    safeIntegerDescriptors: 2,
    effectivePromotions: 5,
    remainingShadowFoundations: 0,
  });
  process.stdout.write(`P02F_READBACK ${JSON.stringify(result.counts)}\n`);
});
