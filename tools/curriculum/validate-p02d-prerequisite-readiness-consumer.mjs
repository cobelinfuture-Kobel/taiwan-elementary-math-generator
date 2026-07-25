import { pathToFileURL } from "node:url";

import { materializeP02DPrerequisiteReadinessConsumer } from "../../src/curriculum/full-product/p02d-prerequisite-readiness-consumer.mjs";

const TARGET_CAPABILITY_ID = "cap_prerequisite_readiness";
const EXPECTED_EFFECTIVE_PROMOTIONS = [
  "cap_kp_authority_lookup",
  "cap_prerequisite_readiness",
  "cap_quantity_dimension_unit_identity",
];
const EXPECTED_REMAINING = [
  "cap_quantity_semantic_role_binding",
  "cap_same_unit_quantity_arithmetic",
];

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function sameSet(left, right) {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

function satisfyingMasteredSet(descriptor) {
  return unique([
    ...descriptor.requiredPrerequisiteKnowledgePointIds,
    ...descriptor.alternativePrerequisiteGroups.flatMap((group) => (
      group.sourceKnowledgePointIds.slice(0, group.minimumSatisfied)
    )),
  ]).sort();
}

export function validateP02DPrerequisiteReadinessConsumer({ consumer = null } = {}) {
  const runtime = consumer ?? materializeP02DPrerequisiteReadinessConsumer();
  const errors = [];
  const expected = runtime.manifest.expectedCounts;
  const metrics = runtime.metrics;

  if (runtime.consumerMode !== "PRODUCTION_READ_ONLY_PREREQUISITE_READINESS") {
    errors.push("P02D_CONSUMER_MODE_INVALID");
  }
  if (runtime.productionAdmissionState !== "PRODUCTION_ADMITTED") {
    errors.push("P02D_PRODUCTION_ADMISSION_STATE_INVALID");
  }

  const countFields = [
    "canonicalKnowledgePointCount",
    "directPrerequisiteEdgeCount",
    "requiredEdgeCount",
    "alternativeEdgeCount",
    "supportingEdgeCount",
    "rootKnowledgePointCount",
    "alternativeGroupCount",
    "descriptorErrorCount",
    "effectivePromotionCount",
    "newPromotionCount",
    "remainingShadowFoundationCount",
  ];
  const expectedByMetric = {
    effectivePromotionCount: expected.promotedCapabilityCount,
    newPromotionCount: expected.newPromotionCount,
    remainingShadowFoundationCount: expected.remainingShadowFoundationCount,
  };
  for (const field of countFields) {
    const expectedValue = expectedByMetric[field] ?? expected[field];
    if (metrics[field] !== expectedValue) {
      errors.push(`P02D_${field.toUpperCase()}_INVALID:${metrics[field]}:${expectedValue}`);
    }
  }

  if (runtime.descriptors.length !== expected.canonicalKnowledgePointCount) {
    errors.push(`P02D_DESCRIPTOR_COUNT_INVALID:${runtime.descriptors.length}`);
  }
  const descriptorIds = runtime.descriptors.map((row) => row.knowledgePointId);
  if (unique(descriptorIds).length !== descriptorIds.length) {
    errors.push("P02D_DUPLICATE_DESCRIPTOR_KP");
  }
  if (runtime.descriptorErrors.length !== 0) {
    errors.push(...runtime.descriptorErrors);
  }

  const canonicalIds = new Set(runtime.globalAuthority.knowledgePointDescriptors.map((row) => row.knowledgePointId));
  if (canonicalIds.size !== expected.canonicalKnowledgePointCount) {
    errors.push(`P02D_GLOBAL_AUTHORITY_SCOPE_INVALID:${canonicalIds.size}`);
  }
  for (const edge of runtime.graphAuthority.edges) {
    if (!canonicalIds.has(edge.fromKnowledgePointId) || !canonicalIds.has(edge.toKnowledgePointId)) {
      errors.push(`P02D_EDGE_ENDPOINT_UNKNOWN:${edge.edgeId}`);
    }
  }
  if (runtime.graphAuthority.graphPolicy.requiredPrerequisitesCombineAs !== "AND"
    || runtime.graphAuthority.graphPolicy.supportingEdgesBlockReadiness !== false
    || runtime.graphAuthority.graphPolicy.alternativePrerequisitesCombineByGroup !== true) {
    errors.push("P02D_R03_GRAPH_POLICY_INVALID");
  }

  let readySweepCount = 0;
  let blockedRequiredWitnessCount = 0;
  for (const descriptor of runtime.descriptors) {
    if (!runtime.globalAuthority.getKnowledgePoint(descriptor.knowledgePointId)) {
      errors.push(`P02D_DESCRIPTOR_NOT_GLOBAL:${descriptor.knowledgePointId}`);
      continue;
    }
    const mastered = satisfyingMasteredSet(descriptor);
    const result = runtime.resolve({
      targetKnowledgePointId: descriptor.knowledgePointId,
      masteredKnowledgePointIds: mastered,
    });
    if (!result.ok || result.blocked || !result.ready || result.readiness?.readinessState !== "READY_N_PLUS_ONE") {
      errors.push(`P02D_FULLY_SATISFIED_TARGET_NOT_READY:${descriptor.knowledgePointId}`);
    } else {
      readySweepCount += 1;
    }

    if (descriptor.requiredPrerequisiteKnowledgePointIds.length > 0) {
      const removed = descriptor.requiredPrerequisiteKnowledgePointIds[0];
      const missingWitnessSet = mastered.filter((knowledgePointId) => knowledgePointId !== removed);
      const blocked = runtime.resolve({
        targetKnowledgePointId: descriptor.knowledgePointId,
        masteredKnowledgePointIds: missingWitnessSet,
      });
      if (!blocked.ok || blocked.blocked || blocked.ready
        || !blocked.readiness.missingRequiredKnowledgePointIds.includes(removed)) {
        errors.push(`P02D_REQUIRED_EDGE_NOT_BLOCKING:${descriptor.knowledgePointId}:${removed}`);
      } else {
        blockedRequiredWitnessCount += 1;
      }
    }
  }
  if (readySweepCount !== expected.canonicalKnowledgePointCount) {
    errors.push(`P02D_READY_SWEEP_COUNT_INVALID:${readySweepCount}`);
  }

  const emptyReady = runtime.listReady([]);
  if (!emptyReady.ok || emptyReady.blocked || emptyReady.candidates.length !== expected.rootKnowledgePointCount) {
    errors.push(`P02D_EMPTY_MASTERED_ROOT_SET_INVALID:${emptyReady.candidates.length}`);
  }
  if (emptyReady.candidates.some((row) => !runtime.getDescriptor(row.knowledgePointId)?.isRoot)) {
    errors.push("P02D_EMPTY_MASTERED_NON_ROOT_READY");
  }

  const alternativeDescriptor = runtime.descriptors.find((row) => row.alternativePrerequisiteGroups.length > 0);
  if (!alternativeDescriptor) {
    errors.push("P02D_ALTERNATIVE_DESCRIPTOR_MISSING");
  } else {
    const requiredOnly = [...alternativeDescriptor.requiredPrerequisiteKnowledgePointIds];
    const unsatisfied = runtime.resolve({
      targetKnowledgePointId: alternativeDescriptor.knowledgePointId,
      masteredKnowledgePointIds: requiredOnly,
    });
    if (!unsatisfied.ok || unsatisfied.blocked || unsatisfied.ready
      || unsatisfied.readiness.unsatisfiedAlternativeGroupIds.length === 0) {
      errors.push(`P02D_ALTERNATIVE_GROUP_NOT_BLOCKING:${alternativeDescriptor.knowledgePointId}`);
    }
    const satisfied = runtime.resolve({
      targetKnowledgePointId: alternativeDescriptor.knowledgePointId,
      masteredKnowledgePointIds: satisfyingMasteredSet(alternativeDescriptor),
    });
    if (!satisfied.ok || satisfied.blocked || !satisfied.ready) {
      errors.push(`P02D_ALTERNATIVE_GROUP_NOT_SATISFIABLE:${alternativeDescriptor.knowledgePointId}`);
    }
  }

  const supportingDescriptor = runtime.descriptors.find((row) => row.supportingKnowledgePointIds.length > 0);
  if (!supportingDescriptor) {
    errors.push("P02D_SUPPORTING_DESCRIPTOR_MISSING");
  } else {
    const result = runtime.resolve({
      targetKnowledgePointId: supportingDescriptor.knowledgePointId,
      masteredKnowledgePointIds: satisfyingMasteredSet(supportingDescriptor),
    });
    if (!result.ok || result.blocked || !result.ready) {
      errors.push(`P02D_SUPPORTING_EDGE_BLOCKED_READINESS:${supportingDescriptor.knowledgePointId}`);
    }
  }

  const first = runtime.descriptors[0];
  const missingTarget = runtime.resolve({ masteredKnowledgePointIds: [] });
  if (!missingTarget.blocked || !missingTarget.errors.includes("P02D_TARGET_KP_ID_REQUIRED")) {
    errors.push("P02D_MISSING_TARGET_NOT_BLOCKED");
  }
  const missingMastered = runtime.resolve({ targetKnowledgePointId: first.knowledgePointId });
  if (!missingMastered.blocked || !missingMastered.errors.includes("P02D_MASTERED_SET_REQUIRED")) {
    errors.push("P02D_MISSING_MASTERED_SET_NOT_BLOCKED");
  }
  const invalidMastered = runtime.resolve({
    targetKnowledgePointId: first.knowledgePointId,
    masteredKnowledgePointIds: "not-an-array",
  });
  if (!invalidMastered.blocked || !invalidMastered.errors.includes("P02D_MASTERED_SET_INVALID")) {
    errors.push("P02D_INVALID_MASTERED_SET_NOT_BLOCKED");
  }
  const unknownTarget = runtime.resolve({
    targetKnowledgePointId: "kp_p02d_unknown_target",
    masteredKnowledgePointIds: [],
  });
  if (!unknownTarget.blocked || !unknownTarget.errors.some((code) => code.startsWith("P02D_UNKNOWN_TARGET_KP:"))) {
    errors.push("P02D_UNKNOWN_TARGET_NOT_BLOCKED");
  }
  const unknownMastered = runtime.resolve({
    targetKnowledgePointId: first.knowledgePointId,
    masteredKnowledgePointIds: ["kp_p02d_unknown_mastered"],
  });
  if (!unknownMastered.blocked || !unknownMastered.errors.some((code) => code.startsWith("P02D_UNKNOWN_MASTERED_KP:"))) {
    errors.push("P02D_UNKNOWN_MASTERED_NOT_BLOCKED");
  }
  const duplicateMasteredId = runtime.descriptors.find((row) => row.knowledgePointId !== first.knowledgePointId).knowledgePointId;
  const duplicateMastered = runtime.resolve({
    targetKnowledgePointId: first.knowledgePointId,
    masteredKnowledgePointIds: [duplicateMasteredId, duplicateMasteredId],
  });
  if (!duplicateMastered.blocked || !duplicateMastered.errors.some((code) => code.startsWith("P02D_DUPLICATE_MASTERED_KP:"))) {
    errors.push("P02D_DUPLICATE_MASTERED_NOT_BLOCKED");
  }
  const alreadyMastered = runtime.resolve({
    targetKnowledgePointId: first.knowledgePointId,
    masteredKnowledgePointIds: [first.knowledgePointId],
  });
  if (!alreadyMastered.blocked || !alreadyMastered.errors.some((code) => code.startsWith("P02D_TARGET_ALREADY_MASTERED:"))) {
    errors.push("P02D_ALREADY_MASTERED_TARGET_NOT_BLOCKED");
  }

  if (!sameSet(runtime.effectivePromotionCapabilityIds, EXPECTED_EFFECTIVE_PROMOTIONS)) {
    errors.push("P02D_EFFECTIVE_PROMOTION_SET_INVALID");
  }
  const promotions = runtime.promotionRegistry.promotions ?? [];
  if (promotions.length !== 1
    || promotions[0].capabilityId !== TARGET_CAPABILITY_ID
    || promotions[0].effectiveDeliveryStatus !== "production_admitted") {
    errors.push("P02D_NEW_PROMOTION_INVALID");
  }
  if (!sameSet(runtime.promotionRegistry.remainingShadowFoundationCapabilityIds, EXPECTED_REMAINING)) {
    errors.push("P02D_REMAINING_SHADOW_SET_INVALID");
  }
  if (runtime.policy.consumerContract.learnerStatePersistenceAllowed !== false
    || runtime.policy.consumerContract.masteryMutationAllowed !== false
    || runtime.policy.consumerContract.lessonSchedulingAllowed !== false) {
    errors.push("P02D_SCOPE_EXPANSION_INVALID");
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      canonicalKnowledgePoints: metrics.canonicalKnowledgePointCount,
      directPrerequisiteEdges: metrics.directPrerequisiteEdgeCount,
      requiredEdges: metrics.requiredEdgeCount,
      alternativeEdges: metrics.alternativeEdgeCount,
      supportingEdges: metrics.supportingEdgeCount,
      rootsReadyFromEmptySet: emptyReady.candidates.length,
      fullReadinessSweepPassed: readySweepCount,
      requiredBlockingWitnesses: blockedRequiredWitnessCount,
      alternativeGroups: metrics.alternativeGroupCount,
      effectivePromotions: metrics.effectivePromotionCount,
      remainingShadowFoundations: metrics.remainingShadowFoundationCount,
    }),
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : null;
if (invokedPath === import.meta.url) {
  const result = validateP02DPrerequisiteReadinessConsumer();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
