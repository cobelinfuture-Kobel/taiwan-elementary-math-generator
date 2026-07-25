import test from "node:test";
import assert from "node:assert/strict";

import {
  listP02CEffectiveW2PromotionCapabilityIds,
  listP02CQuantityIdentities,
  materializeP02CQuantityDimensionUnitIdentityConsumer,
  resolveP02CQuantityIdentity,
} from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { validateP02CQuantityDimensionUnitIdentityConsumer } from "../../tools/curriculum/validate-p02c-quantity-dimension-unit-identity-consumer.mjs";

test("P02C admits all 51 quantity-identity dependents through one read-only consumer", () => {
  const runtime = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const classificationReadback = runtime.classificationErrors.join("\n");
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 51);
  assert.equal(runtime.metrics.classifiedKnowledgePointCount, 51, classificationReadback);
  assert.equal(runtime.metrics.classificationErrorCount, 0, classificationReadback);
  assert.equal(runtime.metrics.dependentSourceNodeCount, 20, classificationReadback);
  assert.equal(runtime.identities.length, 51, classificationReadback);
  assert.equal(new Set(runtime.identities.map((row) => row.knowledgePointId)).size, 51, classificationReadback);
  assert.equal(Object.values(runtime.metrics.dimensionCounts).reduce((sum, count) => sum + count, 0), 51, classificationReadback);
  assert.equal(runtime.consumerMode, "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY");
  assert.equal(runtime.productionAdmissionState, "PRODUCTION_ADMITTED");
});

test("P02C performs complete KP and canonical source/KP round trips", () => {
  const runtime = materializeP02CQuantityDimensionUnitIdentityConsumer();
  let bindingCount = 0;
  for (const identity of runtime.identities) {
    const resolved = resolveP02CQuantityIdentity({
      knowledgePointId: identity.knowledgePointId,
      assertedDimensionId: identity.dimensionId,
      assertedUnitId: identity.canonicalUnitIds[0],
    });
    assert.equal(resolved.ok, true, identity.knowledgePointId);
    assert.equal(resolved.identity.identityId, identity.identityId);
    for (const sourceNodeId of identity.sourceNodeIds) {
      bindingCount += 1;
      const pair = runtime.resolve({ knowledgePointId: identity.knowledgePointId, sourceNodeId });
      assert.equal(pair.ok, true, `${sourceNodeId}:${identity.knowledgePointId}`);
    }
  }
  assert.equal(bindingCount, runtime.metrics.quantityIdentityBindingCount);
});

test("P02C fails closed for missing, unknown, non-dependent and mismatched identities", () => {
  const runtime = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const dependentIds = new Set(runtime.identities.map((row) => row.knowledgePointId));
  const nonDependent = p02b.knowledgePointDescriptors.find((row) => !dependentIds.has(row.knowledgePointId));
  assert.ok(nonDependent);

  assert.deepEqual(runtime.resolve({}).errors, ["P02C_QUANTITY_KP_ID_REQUIRED"]);
  assert.match(runtime.resolve({ knowledgePointId: "kp_unknown_p02c" }).errors[0], /^P02C_UNKNOWN_KNOWLEDGE_POINT:/);
  assert.match(runtime.resolve({ knowledgePointId: nonDependent.knowledgePointId }).errors[0], /^P02C_KP_NOT_QUANTITY_IDENTITY_DEPENDENT:/);

  const first = runtime.identities[0];
  const wrongSource = runtime.sourceNodeIds.find((sourceNodeId) => !first.sourceNodeIds.includes(sourceNodeId));
  assert.ok(wrongSource);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    sourceNodeId: wrongSource,
  }).errors[0], /^P02C_SOURCE_KP_MISMATCH:/);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedDimensionId: "WRONG_DIMENSION",
  }).errors[0], /^P02C_DIMENSION_ID_MISMATCH:/);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedUnitId: "wrong_unit",
  }).errors[0], /^P02C_UNIT_ID_MISMATCH:/);
});

test("P02C preserves P02B promotion and admits exactly one new capability", () => {
  const runtime = materializeP02CQuantityDimensionUnitIdentityConsumer();
  assert.deepEqual(listP02CEffectiveW2PromotionCapabilityIds().sort(), [
    "cap_kp_authority_lookup",
    "cap_quantity_dimension_unit_identity",
  ]);
  assert.equal(runtime.predecessorPromotionRegistry.promotions.length, 1);
  assert.equal(runtime.predecessorPromotionRegistry.promotions[0].capabilityId, "cap_kp_authority_lookup");
  assert.equal(runtime.promotionRegistry.promotions.length, 1);
  assert.equal(runtime.promotionRegistry.promotions[0].capabilityId, "cap_quantity_dimension_unit_identity");
  assert.deepEqual(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, [
    "cap_prerequisite_readiness",
    "cap_quantity_semantic_role_binding",
    "cap_same_unit_quantity_arithmetic",
  ]);
});

test("P02C identity contract does not implement conversion, roles or arithmetic", () => {
  for (const identity of listP02CQuantityIdentities()) {
    assert.equal(identity.conversionAllowed, false);
    assert.equal(identity.semanticRoleBindingAllowed, false);
    assert.equal(identity.quantityArithmeticAllowed, false);
    assert.ok(identity.dimensionId);
    assert.ok(identity.unitFamilyId);
    assert.ok(identity.canonicalUnitIds.length > 0);
  }
});

test("P02C fail-closed validator accepts exact production admission", () => {
  const result = validateP02CQuantityDimensionUnitIdentityConsumer();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.effectiveDependentKnowledgePoints, 51);
  assert.equal(result.counts.classifiedKnowledgePoints, 51);
  assert.equal(result.counts.dependentSources, 20);
  assert.equal(result.counts.effectivePromotions, 2);
  assert.equal(result.counts.remainingShadowFoundations, 3);
});
