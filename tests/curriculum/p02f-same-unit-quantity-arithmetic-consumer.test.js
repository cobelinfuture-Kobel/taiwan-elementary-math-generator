import test from "node:test";
import assert from "node:assert/strict";

import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import {
  executeP02FSameUnitQuantityArithmetic,
  listP02FEffectiveW2PromotionCapabilityIds,
  listP02FSameUnitQuantityArithmeticDescriptors,
  materializeP02FSameUnitQuantityArithmeticConsumer,
} from "../../src/curriculum/full-product/p02f-same-unit-quantity-arithmetic-consumer.mjs";
import { validateP02FSameUnitQuantityArithmeticConsumer } from "../../tools/curriculum/validate-p02f-same-unit-quantity-arithmetic-consumer.mjs";

test("P02F admits exactly two direct same-unit quantity arithmetic dependents", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 2);
  assert.equal(runtime.metrics.operationDescriptorCount, 2, runtime.descriptorErrors.join("\n"));
  assert.equal(runtime.metrics.descriptorErrorCount, 0, runtime.descriptorErrors.join("\n"));
  assert.equal(runtime.descriptors.length, 2);
  assert.equal(new Set(runtime.descriptors.map((row) => row.knowledgePointId)).size, 2);
  assert.equal(runtime.operationFamilyId, "QUANTITY_TIMES_INTEGER");
  process.stdout.write(`P02F_DESCRIPTOR_READBACK ${JSON.stringify(runtime.descriptors.map((row) => ({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    sourceNodeIds: row.sourceNodeIds,
    dimensionId: row.dimensionId,
    unitFamilyId: row.unitFamilyId,
    canonicalUnitIds: row.canonicalUnitIds,
    semanticRelationFamilyId: row.semanticRelationFamilyId,
  })))}\n`);
});

test("P02F computes deterministic quantity times integer while preserving the exact unit", () => {
  for (const descriptor of listP02FSameUnitQuantityArithmeticDescriptors()) {
    for (const unitId of descriptor.canonicalUnitIds) {
      const result = executeP02FSameUnitQuantityArithmetic({
        knowledgePointId: descriptor.knowledgePointId,
        sourceNodeId: descriptor.sourceNodeIds[0],
        quantity: { value: 12, unitId },
        integerMultiplier: 3,
        assertedOperationFamilyId: "QUANTITY_TIMES_INTEGER",
        assertedResultUnitId: unitId,
      });
      assert.equal(result.ok, true, `${descriptor.knowledgePointId}:${unitId}:${result.errors.join("|")}`);
      assert.deepEqual(result.resultQuantity, {
        value: 36,
        unitId,
        dimensionId: descriptor.dimensionId,
        unitFamilyId: descriptor.unitFamilyId,
      });
      assert.equal(result.descriptor.unitConversionAllowed, false);
      assert.equal(result.descriptor.mixedUnitNormalizationAllowed, false);
    }
  }
});

test("P02F delegates unit identity to P02C and preserves source/KP authority", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  let sourceBindingCount = 0;
  for (const descriptor of runtime.descriptors) {
    const identity = p02c.getIdentity(descriptor.knowledgePointId);
    assert.ok(identity, descriptor.knowledgePointId);
    assert.equal(descriptor.quantityIdentityId, identity.identityId);
    assert.deepEqual(descriptor.canonicalUnitIds, [...identity.canonicalUnitIds]);
    for (const sourceNodeId of descriptor.sourceNodeIds) {
      sourceBindingCount += 1;
      const result = runtime.execute({
        knowledgePointId: descriptor.knowledgePointId,
        sourceNodeId,
        quantity: { value: 5, unitId: descriptor.canonicalUnitIds[0] },
        integerMultiplier: 2,
      });
      assert.equal(result.ok, true, `${sourceNodeId}:${descriptor.knowledgePointId}:${result.errors.join("|")}`);
      assert.equal(result.resultQuantity.value, 10);
    }
  }
  assert.equal(sourceBindingCount, runtime.metrics.sourceKnowledgePointBindingCount);
});

test("P02F fails closed for invalid identity, unit, operand, operation and result-unit requests", () => {
  const runtime = materializeP02FSameUnitQuantityArithmeticConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const first = runtime.descriptors[0];
  assert.ok(first);
  const unitId = first.canonicalUnitIds[0];
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
  assert.equal(result.counts.effectivePromotions, 5);
  assert.equal(result.counts.remainingShadowFoundations, 0);
  process.stdout.write(`P02F_READBACK ${JSON.stringify(result.counts)}\n`);
});
