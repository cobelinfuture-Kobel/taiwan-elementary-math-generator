import test from "node:test";
import assert from "node:assert/strict";

import {
  listP02EEffectiveW2PromotionCapabilityIds,
  listP02EQuantitySemanticRoleBindings,
  materializeP02EQuantitySemanticRoleBindingConsumer,
  resolveP02EQuantitySemanticRoleBinding,
} from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import { validateP02EQuantitySemanticRoleBindingConsumer } from "../../tools/curriculum/validate-p02e-quantity-semantic-role-binding-consumer.mjs";

test("P02E admits all 26 semantic-role dependents through one read-only consumer", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const classificationReadback = runtime.classificationErrors.join("\n");
  assert.equal(runtime.metrics.effectiveDependentKnowledgePointCount, 26);
  assert.equal(runtime.metrics.classifiedKnowledgePointCount, 26, classificationReadback);
  assert.equal(runtime.metrics.classificationErrorCount, 0, classificationReadback);
  assert.equal(runtime.bindings.length, 26, classificationReadback);
  assert.equal(new Set(runtime.bindings.map((row) => row.knowledgePointId)).size, 26);
  assert.equal(Object.values(runtime.metrics.relationFamilyCounts).reduce((sum, count) => sum + count, 0), 26);
  assert.equal(runtime.consumerMode, "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING");
  assert.equal(runtime.productionAdmissionState, "PRODUCTION_ADMITTED");
});

test("P02E performs complete role and canonical source/KP round trips through P02C", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  let bindingCount = 0;
  for (const binding of runtime.bindings) {
    const identity = p02c.getIdentity(binding.knowledgePointId);
    assert.ok(identity, binding.knowledgePointId);
    assert.equal(identity.identityId, binding.quantityIdentityId);
    const resolved = resolveP02EQuantitySemanticRoleBinding({
      knowledgePointId: binding.knowledgePointId,
      assertedRelationFamilyId: binding.relationFamilyId,
      assertedTargetRoleId: binding.targetRoleId,
      assertedDimensionId: binding.dimensionId,
      assertedUnitId: binding.canonicalUnitIds[0],
    });
    assert.equal(resolved.ok, true, binding.knowledgePointId);
    assert.equal(resolved.binding.bindingId, binding.bindingId);
    for (const sourceNodeId of binding.sourceNodeIds) {
      bindingCount += 1;
      const pair = runtime.resolve({
        knowledgePointId: binding.knowledgePointId,
        sourceNodeId,
        assertedRelationFamilyId: binding.relationFamilyId,
        assertedTargetRoleId: binding.targetRoleId,
      });
      assert.equal(pair.ok, true, `${sourceNodeId}:${binding.knowledgePointId}`);
    }
  }
  assert.equal(bindingCount, runtime.metrics.sourceKnowledgePointBindingCount);
});

test("P02E fails closed for missing, unknown, non-dependent and mismatched role identities", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const dependentIds = new Set(runtime.bindings.map((row) => row.knowledgePointId));
  const nonDependent = p02b.knowledgePointDescriptors.find((row) => !dependentIds.has(row.knowledgePointId));
  assert.ok(nonDependent);

  assert.deepEqual(runtime.resolve({}).errors, ["P02E_SEMANTIC_ROLE_KP_ID_REQUIRED"]);
  assert.match(runtime.resolve({ knowledgePointId: "kp_unknown_p02e" }).errors[0], /^P02E_UNKNOWN_KNOWLEDGE_POINT:/);
  assert.match(runtime.resolve({ knowledgePointId: nonDependent.knowledgePointId }).errors[0], /^P02E_KP_NOT_SEMANTIC_ROLE_DEPENDENT:/);

  const first = runtime.bindings[0];
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedRelationFamilyId: "WRONG_RELATION_FAMILY",
  }).errors[0], /^P02E_RELATION_FAMILY_MISMATCH:/);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedTargetRoleId: "WRONG_TARGET_ROLE",
  }).errors[0], /^P02E_TARGET_ROLE_MISMATCH:/);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedDimensionId: "WRONG_DIMENSION",
  }).errors[0], /^P02E_DIMENSION_ASSERTION_INVALID:/);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    assertedUnitId: "wrong_unit",
  }).errors[0], /^P02E_UNIT_ASSERTION_INVALID:/);

  const wrongSource = runtime.sourceNodeIds.find((sourceNodeId) => !first.sourceNodeIds.includes(sourceNodeId));
  assert.ok(wrongSource);
  assert.match(runtime.resolve({
    knowledgePointId: first.knowledgePointId,
    sourceNodeId: wrongSource,
  }).errors[0], /^P02E_SOURCE_KP_MISMATCH:/);
});

test("P02E preserves P02B-P02D promotions and admits exactly one new capability", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  assert.deepEqual(listP02EEffectiveW2PromotionCapabilityIds().sort(), [
    "cap_kp_authority_lookup",
    "cap_prerequisite_readiness",
    "cap_quantity_dimension_unit_identity",
    "cap_quantity_semantic_role_binding",
  ]);
  assert.equal(runtime.promotionRegistry.promotions.length, 1);
  assert.equal(runtime.promotionRegistry.promotions[0].capabilityId, "cap_quantity_semantic_role_binding");
  assert.deepEqual(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, [
    "cap_same_unit_quantity_arithmetic",
  ]);
});

test("P02E role contract does not implement stories, computation or arithmetic", () => {
  for (const binding of listP02EQuantitySemanticRoleBindings()) {
    assert.equal(binding.storyTemplateGenerationAllowed, false);
    assert.equal(binding.numericComputationAllowed, false);
    assert.equal(binding.quantityArithmeticAllowed, false);
    assert.ok(binding.relationFamilyId);
    assert.ok(binding.knownRoleIds.length > 0);
    assert.ok(binding.targetRoleId);
    assert.ok(binding.allowedTargetRoleIds.includes(binding.targetRoleId));
    assert.ok(binding.quantityIdentityId);
  }
});

test("P02E source-declared target roles remain closed to the contract allow-list", () => {
  const runtime = materializeP02EQuantitySemanticRoleBindingConsumer();
  const sourceDeclared = runtime.bindings.find((row) => row.targetRoleMode !== "FIXED");
  assert.ok(sourceDeclared);
  assert.equal(runtime.resolve({
    knowledgePointId: sourceDeclared.knowledgePointId,
    assertedTargetRoleId: sourceDeclared.targetRoleId,
  }).ok, true);
  assert.match(runtime.resolve({
    knowledgePointId: sourceDeclared.knowledgePointId,
    assertedTargetRoleId: "UNDECLARED_TARGET_ROLE",
  }).errors[0], /^P02E_TARGET_ROLE_MISMATCH:/);
});

test("P02E fail-closed validator accepts exact production admission", () => {
  const result = validateP02EQuantitySemanticRoleBindingConsumer();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.effectiveDependentKnowledgePoints, 26);
  assert.equal(result.counts.classifiedKnowledgePoints, 26);
  assert.equal(result.counts.effectivePromotions, 4);
  assert.equal(result.counts.remainingShadowFoundations, 1);
  process.stdout.write(`P02E_READBACK ${JSON.stringify(result.counts)}\n`);
});
