import { pathToFileURL } from "node:url";

import { materializeP02EQuantitySemanticRoleBindingConsumer } from "../../src/curriculum/full-product/p02e-quantity-semantic-role-binding-consumer.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";

const TARGET_CAPABILITY_ID = "cap_quantity_semantic_role_binding";
const EXPECTED_PROMOTIONS = [
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
  "cap_quantity_semantic_role_binding",
];
const EXPECTED_REMAINING = ["cap_same_unit_quantity_arithmetic"];

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function sameSet(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateP02EQuantitySemanticRoleBindingConsumer({ consumer = null } = {}) {
  const runtime = consumer ?? materializeP02EQuantitySemanticRoleBindingConsumer();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const errors = [];
  const expected = runtime.manifest.expectedCounts;
  const metrics = runtime.metrics;

  if (runtime.consumerMode !== "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING") {
    errors.push("P02E_CONSUMER_MODE_INVALID");
  }
  if (runtime.productionAdmissionState !== "PRODUCTION_ADMITTED") {
    errors.push("P02E_PRODUCTION_ADMISSION_STATE_INVALID");
  }
  if (metrics.effectiveDependentKnowledgePointCount !== expected.effectiveDependentKnowledgePointCount) {
    errors.push(`P02E_DEPENDENT_KP_COUNT_INVALID:${metrics.effectiveDependentKnowledgePointCount}`);
  }
  if (metrics.classifiedKnowledgePointCount !== expected.effectiveDependentKnowledgePointCount) {
    errors.push(`P02E_CLASSIFIED_KP_COUNT_INVALID:${metrics.classifiedKnowledgePointCount}`);
  }
  if (metrics.classificationErrorCount !== expected.classificationErrorCount) {
    errors.push(`P02E_CLASSIFICATION_ERROR_COUNT_INVALID:${metrics.classificationErrorCount}:${runtime.classificationErrors.join("|")}`);
  }
  if (metrics.effectivePromotionCount !== expected.promotedCapabilityCount) {
    errors.push(`P02E_EFFECTIVE_PROMOTION_COUNT_INVALID:${metrics.effectivePromotionCount}`);
  }
  if (metrics.newPromotionCount !== expected.newPromotionCount) {
    errors.push(`P02E_NEW_PROMOTION_COUNT_INVALID:${metrics.newPromotionCount}`);
  }
  if (metrics.remainingShadowFoundationCount !== expected.remainingShadowFoundationCount) {
    errors.push(`P02E_REMAINING_SHADOW_COUNT_INVALID:${metrics.remainingShadowFoundationCount}`);
  }

  const knowledgePointIds = runtime.bindings.map((row) => row.knowledgePointId);
  const bindingIds = runtime.bindings.map((row) => row.bindingId);
  if (unique(knowledgePointIds).length !== knowledgePointIds.length) errors.push("P02E_DUPLICATE_KNOWLEDGE_POINT_BINDING");
  if (unique(bindingIds).length !== bindingIds.length) errors.push("P02E_DUPLICATE_BINDING_ID");
  if (Object.values(metrics.relationFamilyCounts).reduce((sum, count) => sum + count, 0) !== runtime.bindings.length) {
    errors.push("P02E_RELATION_FAMILY_COUNT_SUM_INVALID");
  }

  let sourceBindingCount = 0;
  for (const binding of runtime.bindings) {
    const quantityIdentity = p02c.getIdentity(binding.knowledgePointId);
    if (!quantityIdentity || quantityIdentity.identityId !== binding.quantityIdentityId) {
      errors.push(`P02E_QUANTITY_IDENTITY_LINK_INVALID:${binding.knowledgePointId}`);
      continue;
    }
    if (!runtime.policy.scope.allowedPrimaryRuntimeProfileIds.includes(binding.primaryRuntimeProfileId)) {
      errors.push(`P02E_PRIMARY_PROFILE_INVALID:${binding.knowledgePointId}:${binding.primaryRuntimeProfileId}`);
    }
    if (!binding.relationFamilyId
      || binding.knownRoleIds.length === 0
      || !binding.targetRoleId
      || !binding.allowedTargetRoleIds.includes(binding.targetRoleId)) {
      errors.push(`P02E_ROLE_FIELDS_INCOMPLETE:${binding.knowledgePointId}`);
    }
    if (binding.storyTemplateGenerationAllowed !== false
      || binding.numericComputationAllowed !== false
      || binding.quantityArithmeticAllowed !== false) {
      errors.push(`P02E_SCOPE_EXPANSION_INVALID:${binding.knowledgePointId}`);
    }
    const exact = runtime.resolve({
      knowledgePointId: binding.knowledgePointId,
      assertedRelationFamilyId: binding.relationFamilyId,
      assertedTargetRoleId: binding.targetRoleId,
      assertedDimensionId: binding.dimensionId,
      assertedUnitId: binding.canonicalUnitIds[0],
    });
    if (!exact.ok || exact.blocked || exact.binding?.bindingId !== binding.bindingId) {
      errors.push(`P02E_BINDING_ROUND_TRIP_INVALID:${binding.knowledgePointId}`);
    }
    for (const sourceNodeId of binding.sourceNodeIds) {
      sourceBindingCount += 1;
      const pair = runtime.resolve({
        knowledgePointId: binding.knowledgePointId,
        sourceNodeId,
        assertedRelationFamilyId: binding.relationFamilyId,
        assertedTargetRoleId: binding.targetRoleId,
      });
      if (!pair.ok || pair.blocked) {
        errors.push(`P02E_SOURCE_KP_ROUND_TRIP_INVALID:${sourceNodeId}:${binding.knowledgePointId}`);
      }
    }
  }
  if (sourceBindingCount !== metrics.sourceKnowledgePointBindingCount) {
    errors.push(`P02E_SOURCE_BINDING_COUNT_INVALID:${sourceBindingCount}:${metrics.sourceKnowledgePointBindingCount}`);
  }

  const empty = runtime.resolve({});
  if (!empty.blocked || !empty.errors.includes("P02E_SEMANTIC_ROLE_KP_ID_REQUIRED")) {
    errors.push("P02E_EMPTY_LOOKUP_NOT_BLOCKED");
  }
  const unknown = runtime.resolve({ knowledgePointId: "kp_p02e_unknown" });
  if (!unknown.blocked || !unknown.errors.some((code) => code.startsWith("P02E_UNKNOWN_KNOWLEDGE_POINT:"))) {
    errors.push("P02E_UNKNOWN_KP_NOT_BLOCKED");
  }
  const dependentSet = new Set(knowledgePointIds);
  const nonDependent = p02b.knowledgePointDescriptors.find((row) => !dependentSet.has(row.knowledgePointId));
  if (!nonDependent) {
    errors.push("P02E_NON_DEPENDENT_FIXTURE_MISSING");
  } else {
    const rejected = runtime.resolve({ knowledgePointId: nonDependent.knowledgePointId });
    if (!rejected.blocked || !rejected.errors.some((code) => code.startsWith("P02E_KP_NOT_SEMANTIC_ROLE_DEPENDENT:"))) {
      errors.push("P02E_NON_DEPENDENT_KP_NOT_BLOCKED");
    }
  }

  const first = runtime.bindings[0];
  if (!first) {
    errors.push("P02E_BINDING_FIXTURE_MISSING");
  } else {
    const wrongFamily = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedRelationFamilyId: "P02E_WRONG_RELATION_FAMILY",
    });
    if (!wrongFamily.blocked || !wrongFamily.errors.some((code) => code.startsWith("P02E_RELATION_FAMILY_MISMATCH:"))) {
      errors.push("P02E_WRONG_RELATION_FAMILY_NOT_BLOCKED");
    }
    const wrongTarget = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedTargetRoleId: "P02E_WRONG_TARGET_ROLE",
    });
    if (!wrongTarget.blocked || !wrongTarget.errors.some((code) => code.startsWith("P02E_TARGET_ROLE_MISMATCH:"))) {
      errors.push("P02E_WRONG_TARGET_ROLE_NOT_BLOCKED");
    }
    const wrongDimension = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedDimensionId: "P02E_WRONG_DIMENSION",
    });
    if (!wrongDimension.blocked || !wrongDimension.errors.some((code) => code.startsWith("P02E_DIMENSION_ASSERTION_INVALID:"))) {
      errors.push("P02E_WRONG_DIMENSION_NOT_BLOCKED");
    }
    const wrongUnit = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedUnitId: "p02e_wrong_unit",
    });
    if (!wrongUnit.blocked || !wrongUnit.errors.some((code) => code.startsWith("P02E_UNIT_ASSERTION_INVALID:"))) {
      errors.push("P02E_WRONG_UNIT_NOT_BLOCKED");
    }
    const wrongSource = runtime.sourceNodeIds.find((sourceNodeId) => !first.sourceNodeIds.includes(sourceNodeId));
    if (wrongSource) {
      const mismatched = runtime.resolve({ knowledgePointId: first.knowledgePointId, sourceNodeId: wrongSource });
      if (!mismatched.blocked || !mismatched.errors.some((code) => code.startsWith("P02E_SOURCE_KP_MISMATCH:"))) {
        errors.push("P02E_SOURCE_KP_MISMATCH_NOT_BLOCKED");
      }
    }
  }

  if (!sameSet(runtime.effectivePromotionCapabilityIds, EXPECTED_PROMOTIONS)) {
    errors.push("P02E_EFFECTIVE_PROMOTION_SET_INVALID");
  }
  const newPromotions = runtime.promotionRegistry.promotions ?? [];
  if (newPromotions.length !== 1
    || newPromotions[0].capabilityId !== TARGET_CAPABILITY_ID
    || newPromotions[0].effectiveDeliveryStatus !== "production_admitted") {
    errors.push("P02E_NEW_PROMOTION_INVALID");
  }
  if (!sameSet(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, EXPECTED_REMAINING)) {
    errors.push("P02E_REMAINING_SHADOW_SET_INVALID");
  }
  if (runtime.policy.consumerContract.storyTemplateGenerationAllowed !== false
    || runtime.policy.consumerContract.numericComputationAllowed !== false
    || runtime.policy.consumerContract.quantityArithmeticAllowed !== false) {
    errors.push("P02E_POLICY_SCOPE_EXPANSION_INVALID");
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      effectiveDependentKnowledgePoints: metrics.effectiveDependentKnowledgePointCount,
      classifiedKnowledgePoints: metrics.classifiedKnowledgePointCount,
      dependentSources: metrics.dependentSourceNodeCount,
      sourceKnowledgePointBindings: metrics.sourceKnowledgePointBindingCount,
      fixedRoleBindings: metrics.fixedRoleBindingCount,
      sourceDeclaredRoleBindings: metrics.sourceDeclaredRoleBindingCount,
      relationFamilies: Object.freeze({ ...metrics.relationFamilyCounts }),
      effectivePromotions: metrics.effectivePromotionCount,
      remainingShadowFoundations: metrics.remainingShadowFoundationCount,
    }),
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  const result = validateP02EQuantitySemanticRoleBindingConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
