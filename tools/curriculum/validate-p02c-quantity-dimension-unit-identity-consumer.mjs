import { pathToFileURL } from "node:url";

import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "../../src/curriculum/full-product/p02c-quantity-dimension-unit-identity-consumer.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";

const TARGET_CAPABILITY_ID = "cap_quantity_dimension_unit_identity";
const PREDECESSOR_CAPABILITY_ID = "cap_kp_authority_lookup";
const EXPECTED_REMAINING = [
  "cap_prerequisite_readiness",
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
];

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function sameSet(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function validateP02CQuantityDimensionUnitIdentityConsumer({ consumer = null } = {}) {
  const runtime = consumer ?? materializeP02CQuantityDimensionUnitIdentityConsumer();
  const globalAuthority = materializeP02BGlobalAuthorityLookupConsumer();
  const errors = [];
  const expected = runtime.manifest.expectedCounts;
  const metrics = runtime.metrics;

  if (runtime.consumerMode !== "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY") {
    errors.push("P02C_CONSUMER_MODE_INVALID");
  }
  if (runtime.productionAdmissionState !== "PRODUCTION_ADMITTED") {
    errors.push("P02C_PRODUCTION_ADMISSION_STATE_INVALID");
  }
  if (globalAuthority.metrics.globalSourceNodeCount !== 79
    || globalAuthority.metrics.canonicalKnowledgePointCount !== 482) {
    errors.push("P02C_P02B_GLOBAL_AUTHORITY_SCOPE_INVALID");
  }
  if (metrics.effectiveDependentKnowledgePointCount !== expected.effectiveDependentKnowledgePointCount) {
    errors.push(`P02C_DEPENDENT_KP_COUNT_INVALID:${metrics.effectiveDependentKnowledgePointCount}`);
  }
  if (metrics.classifiedKnowledgePointCount !== expected.effectiveDependentKnowledgePointCount) {
    errors.push(`P02C_CLASSIFIED_KP_COUNT_INVALID:${metrics.classifiedKnowledgePointCount}`);
  }
  if (metrics.classificationErrorCount !== expected.classificationErrorCount) {
    errors.push(`P02C_CLASSIFICATION_ERROR_COUNT_INVALID:${metrics.classificationErrorCount}`);
  }
  if (metrics.dependentSourceNodeCount !== expected.dependentSourceNodeCount) {
    errors.push(`P02C_DEPENDENT_SOURCE_COUNT_INVALID:${metrics.dependentSourceNodeCount}`);
  }
  if (metrics.effectivePromotionCount !== expected.promotedCapabilityCount) {
    errors.push(`P02C_EFFECTIVE_PROMOTION_COUNT_INVALID:${metrics.effectivePromotionCount}`);
  }
  if (metrics.newPromotionCount !== expected.newPromotionCount) {
    errors.push(`P02C_NEW_PROMOTION_COUNT_INVALID:${metrics.newPromotionCount}`);
  }
  if (metrics.remainingShadowFoundationCount !== expected.remainingShadowFoundationCount) {
    errors.push(`P02C_REMAINING_SHADOW_COUNT_INVALID:${metrics.remainingShadowFoundationCount}`);
  }

  const knowledgePointIds = runtime.identities.map((row) => row.knowledgePointId);
  const identityIds = runtime.identities.map((row) => row.identityId);
  if (unique(knowledgePointIds).length !== knowledgePointIds.length) errors.push("P02C_DUPLICATE_KNOWLEDGE_POINT_IDENTITY");
  if (unique(identityIds).length !== identityIds.length) errors.push("P02C_DUPLICATE_IDENTITY_ID");
  if (Object.values(metrics.dimensionCounts).reduce((sum, count) => sum + count, 0) !== runtime.identities.length) {
    errors.push("P02C_DIMENSION_COUNT_SUM_INVALID");
  }

  let sourceBindingCount = 0;
  for (const identity of runtime.identities) {
    if (!runtime.policy.scope.allowedPrimaryRuntimeProfileIds.includes(identity.primaryRuntimeProfileId)) {
      errors.push(`P02C_PRIMARY_PROFILE_INVALID:${identity.knowledgePointId}:${identity.primaryRuntimeProfileId}`);
    }
    if (!identity.dimensionId || !identity.unitFamilyId || identity.canonicalUnitIds.length === 0) {
      errors.push(`P02C_IDENTITY_FIELDS_INCOMPLETE:${identity.knowledgePointId}`);
    }
    if (identity.conversionAllowed !== false
      || identity.semanticRoleBindingAllowed !== false
      || identity.quantityArithmeticAllowed !== false) {
      errors.push(`P02C_SCOPE_EXPANSION_INVALID:${identity.knowledgePointId}`);
    }
    const exact = runtime.resolve({
      knowledgePointId: identity.knowledgePointId,
      assertedDimensionId: identity.dimensionId,
      assertedUnitId: identity.canonicalUnitIds[0],
    });
    if (!exact.ok || exact.blocked || exact.identity?.identityId !== identity.identityId) {
      errors.push(`P02C_IDENTITY_ROUND_TRIP_INVALID:${identity.knowledgePointId}`);
    }
    for (const sourceNodeId of identity.sourceNodeIds) {
      sourceBindingCount += 1;
      const pair = runtime.resolve({ knowledgePointId: identity.knowledgePointId, sourceNodeId });
      if (!pair.ok || pair.blocked) {
        errors.push(`P02C_SOURCE_KP_ROUND_TRIP_INVALID:${sourceNodeId}:${identity.knowledgePointId}`);
      }
    }
  }
  if (sourceBindingCount !== metrics.quantityIdentityBindingCount) {
    errors.push(`P02C_BINDING_COUNT_INVALID:${sourceBindingCount}:${metrics.quantityIdentityBindingCount}`);
  }

  const empty = runtime.resolve({});
  if (!empty.blocked || !empty.errors.includes("P02C_QUANTITY_KP_ID_REQUIRED")) {
    errors.push("P02C_EMPTY_LOOKUP_NOT_BLOCKED");
  }
  const unknown = runtime.resolve({ knowledgePointId: "kp_p02c_unknown" });
  if (!unknown.blocked || !unknown.errors.some((code) => code.startsWith("P02C_UNKNOWN_KNOWLEDGE_POINT:"))) {
    errors.push("P02C_UNKNOWN_KP_NOT_BLOCKED");
  }
  const dependentSet = new Set(knowledgePointIds);
  const nonDependent = globalAuthority.knowledgePointDescriptors.find((row) => !dependentSet.has(row.knowledgePointId));
  if (!nonDependent) {
    errors.push("P02C_NON_DEPENDENT_FIXTURE_MISSING");
  } else {
    const rejected = runtime.resolve({ knowledgePointId: nonDependent.knowledgePointId });
    if (!rejected.blocked || !rejected.errors.some((code) => code.startsWith("P02C_KP_NOT_QUANTITY_IDENTITY_DEPENDENT:"))) {
      errors.push("P02C_NON_DEPENDENT_KP_NOT_BLOCKED");
    }
  }

  const first = runtime.identities[0];
  if (first) {
    const wrongDimension = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedDimensionId: `${first.dimensionId}_WRONG`,
    });
    if (!wrongDimension.blocked || !wrongDimension.errors.some((code) => code.startsWith("P02C_DIMENSION_ID_MISMATCH:"))) {
      errors.push("P02C_WRONG_DIMENSION_NOT_BLOCKED");
    }
    const wrongUnit = runtime.resolve({
      knowledgePointId: first.knowledgePointId,
      assertedUnitId: "p02c_wrong_unit",
    });
    if (!wrongUnit.blocked || !wrongUnit.errors.some((code) => code.startsWith("P02C_UNIT_ID_MISMATCH:"))) {
      errors.push("P02C_WRONG_UNIT_NOT_BLOCKED");
    }
    const wrongSource = runtime.sourceNodeIds.find((sourceNodeId) => !first.sourceNodeIds.includes(sourceNodeId));
    if (wrongSource) {
      const mismatched = runtime.resolve({ knowledgePointId: first.knowledgePointId, sourceNodeId: wrongSource });
      if (!mismatched.blocked || !mismatched.errors.some((code) => code.startsWith("P02C_SOURCE_KP_MISMATCH:"))) {
        errors.push("P02C_SOURCE_KP_MISMATCH_NOT_BLOCKED");
      }
    }
  }

  const predecessorPromotions = runtime.predecessorPromotionRegistry.promotions ?? [];
  if (predecessorPromotions.length !== 1
    || predecessorPromotions[0].capabilityId !== PREDECESSOR_CAPABILITY_ID
    || predecessorPromotions[0].effectiveDeliveryStatus !== "production_admitted") {
    errors.push("P02C_PREDECESSOR_PROMOTION_INVALID");
  }
  const newPromotions = runtime.promotionRegistry.promotions ?? [];
  if (newPromotions.length !== 1
    || newPromotions[0].capabilityId !== TARGET_CAPABILITY_ID
    || newPromotions[0].effectiveDeliveryStatus !== "production_admitted") {
    errors.push("P02C_NEW_PROMOTION_INVALID");
  }
  if (!sameSet(runtime.effectivePromotionCapabilityIds, [PREDECESSOR_CAPABILITY_ID, TARGET_CAPABILITY_ID])) {
    errors.push("P02C_EFFECTIVE_PROMOTION_SET_INVALID");
  }
  if (!sameSet(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, EXPECTED_REMAINING)) {
    errors.push("P02C_REMAINING_SHADOW_SET_INVALID");
  }
  if (runtime.policy.consumerContract.conversionAllowed !== false
    || runtime.policy.consumerContract.semanticRoleBindingAllowed !== false
    || runtime.policy.consumerContract.quantityArithmeticAllowed !== false) {
    errors.push("P02C_POLICY_SCOPE_EXPANSION_INVALID");
  }
  if (dependentSet.size !== expected.effectiveDependentKnowledgePointCount) {
    errors.push("P02C_DEPENDENT_IDENTITY_SET_INVALID");
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      effectiveDependentKnowledgePoints: metrics.effectiveDependentKnowledgePointCount,
      classifiedKnowledgePoints: metrics.classifiedKnowledgePointCount,
      dependentSources: metrics.dependentSourceNodeCount,
      quantityIdentityBindings: metrics.quantityIdentityBindingCount,
      sourceDeclaredFallbacks: metrics.sourceDeclaredFallbackCount,
      dimensions: Object.freeze({ ...metrics.dimensionCounts }),
      effectivePromotions: metrics.effectivePromotionCount,
      remainingShadowFoundations: metrics.remainingShadowFoundationCount,
    }),
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  const result = validateP02CQuantityDimensionUnitIdentityConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
