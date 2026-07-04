import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../registry/batch-a-selector-candidates.js";

export const BATCH_A_RESOLVER_SELECTION_MODES = Object.freeze({
  SOURCE_UNIT: "sourceUnit",
  SINGLE_KNOWLEDGE_POINT: "singleKnowledgePoint",
  MIXED_KNOWLEDGE_POINTS_SAME_UNIT: "mixedKnowledgePointsSameUnit",
  MIXED_KNOWLEDGE_POINTS_CROSS_UNIT: "mixedKnowledgePointsCrossUnit"
});

export const BATCH_A_RESOLVER_ERROR_CODES = Object.freeze({
  SELECTION_MODE_INVALID: "kp_resolver_selection_mode_invalid",
  NO_VISIBLE_KP: "kp_resolver_no_visible_kp",
  KP_NOT_VISIBLE: "kp_resolver_kp_not_visible",
  PATTERN_GROUP_NOT_VISIBLE: "kp_resolver_pattern_group_not_visible",
  PATTERN_GROUP_NOT_LINKED_TO_KP: "kp_resolver_pattern_group_not_linked_to_kp",
  MAPPING_NOT_QA_VERIFIED: "kp_resolver_mapping_not_qa_verified",
  PATTERN_SPEC_MISSING: "kp_resolver_pattern_spec_missing",
  ALL_CANDIDATES_REJECTED: "kp_resolver_all_candidates_rejected",
  MIXED_SAME_UNIT_SOURCE_MISMATCH: "kp_resolver_mixed_same_unit_source_mismatch",
  CROSS_UNIT_NOT_SUPPORTED_YET: "kp_resolver_cross_unit_not_supported_yet",
  ALLOCATION_NOT_APPLICABLE: "kp_resolver_allocation_not_applicable"
});

const VALID_SELECTION_MODES = Object.freeze(Object.values(BATCH_A_RESOLVER_SELECTION_MODES));

const DEFAULT_REGISTRY_ACCESS = Object.freeze({
  listVisibleBatchAKnowledgePoints,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  resolveVisiblePatternSpecIdsForKnowledgePoint
});

function resolveRegistryAccess(options = {}) {
  const override = options.registryAccess ?? {};
  return {
    listVisibleBatchAKnowledgePoints: typeof override.listVisibleBatchAKnowledgePoints === "function"
      ? override.listVisibleBatchAKnowledgePoints
      : DEFAULT_REGISTRY_ACCESS.listVisibleBatchAKnowledgePoints,
    getVisibleBatchAKnowledgePoint: typeof override.getVisibleBatchAKnowledgePoint === "function"
      ? override.getVisibleBatchAKnowledgePoint
      : DEFAULT_REGISTRY_ACCESS.getVisibleBatchAKnowledgePoint,
    getVisiblePatternGroupsForKnowledgePoint: typeof override.getVisiblePatternGroupsForKnowledgePoint === "function"
      ? override.getVisiblePatternGroupsForKnowledgePoint
      : DEFAULT_REGISTRY_ACCESS.getVisiblePatternGroupsForKnowledgePoint,
    resolveVisiblePatternSpecIdsForKnowledgePoint: typeof override.resolveVisiblePatternSpecIdsForKnowledgePoint === "function"
      ? override.resolveVisiblePatternSpecIdsForKnowledgePoint
      : DEFAULT_REGISTRY_ACCESS.resolveVisiblePatternSpecIdsForKnowledgePoint
  };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function normalizeIdArray(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

function positiveInteger(value, fallback = 1) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function error(code) {
  return { code };
}

function baseResolverPlan(input, selectionMode) {
  return {
    schemaVersion: "batch-a-kp-resolver-plan-v1",
    worksheetMode: selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT ? "batchASource" : "batchAKnowledgePoint",
    selectionMode,
    sourceIds: input?.sourceId ? [input.sourceId] : [],
    knowledgePointIds: [],
    patternGroupIds: [],
    patternSpecIds: [],
    allocation: [],
    questionCount: positiveInteger(input?.questionCount, 1),
    ordering: input?.ordering ?? "groupedByPattern",
    generationSeed: String(input?.generationSeed ?? "batch-a-browser"),
    includeAnswerKey: input?.includeAnswerKey ?? true,
    visibilityValidation: {
      visibleAcceptedCount: 0,
      rejectedCount: 0,
      rejectionCodes: []
    },
    provenance: {
      resolver: "visiblePatternGroupResolver",
      sourceId: input?.sourceId ?? null
    },
    errors: [],
    warnings: []
  };
}

function fail(plan, codes, rejectedCount = 0) {
  const uniqueCodes = [...new Set(codes)];
  plan.ok = false;
  plan.errors = uniqueCodes.map((code) => error(code));
  plan.visibilityValidation.rejectedCount = rejectedCount;
  plan.visibilityValidation.rejectionCodes = uniqueCodes;
  return plan;
}

function ok(plan) {
  plan.ok = true;
  return plan;
}

function allocateEvenly({ patternGroups, patternSpecIdsByGroup, questionCount }) {
  if (patternGroups.length === 0) return [];

  const baseCount = Math.floor(questionCount / patternGroups.length);
  let remainder = questionCount % patternGroups.length;
  const allocations = [];

  for (const group of [...patternGroups].sort((left, right) => left.patternGroupId.localeCompare(right.patternGroupId))) {
    const groupCount = baseCount + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    const patternSpecIds = patternSpecIdsByGroup.get(group.patternGroupId) ?? [];

    if (patternSpecIds.length === 0) continue;

    if (group.allocationPolicy === "not_applicable") {
      return null;
    }

    if (group.allocationPolicy === "single_pattern" || patternSpecIds.length === 1) {
      allocations.push({
        patternGroupId: group.patternGroupId,
        patternSpecId: patternSpecIds[0],
        questionCount: groupCount
      });
      continue;
    }

    const perSpecBase = Math.floor(groupCount / patternSpecIds.length);
    let perSpecRemainder = groupCount % patternSpecIds.length;
    for (const patternSpecId of [...patternSpecIds].sort()) {
      allocations.push({
        patternGroupId: group.patternGroupId,
        patternSpecId,
        questionCount: perSpecBase + (perSpecRemainder > 0 ? 1 : 0)
      });
      perSpecRemainder -= perSpecRemainder > 0 ? 1 : 0;
    }
  }

  return allocations.filter((item) => item.questionCount > 0);
}

export function resolveVisiblePatternGroupSelection(input = {}, options = {}) {
  const registryAccess = resolveRegistryAccess(options);
  const rawSelectionMode = input.selectionMode ?? BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;
  const selectionMode = VALID_SELECTION_MODES.includes(rawSelectionMode)
    ? rawSelectionMode
    : null;

  if (!selectionMode) {
    return fail(
      baseResolverPlan(input, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT),
      [BATCH_A_RESOLVER_ERROR_CODES.SELECTION_MODE_INVALID],
      1
    );
  }

  const plan = baseResolverPlan(input, selectionMode);

  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) {
    return ok(plan);
  }

  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET], 1);
  }

  const visibleKnowledgePoints = registryAccess.listVisibleBatchAKnowledgePoints();
  if (visibleKnowledgePoints.length === 0) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP], 1);
  }

  const requestedKnowledgePointIds = normalizeIdArray(input.selectedKnowledgePointIds);

  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT && requestedKnowledgePointIds.length !== 1) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED], requestedKnowledgePointIds.length || 1);
  }

  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT && requestedKnowledgePointIds.length < 2) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED], requestedKnowledgePointIds.length || 1);
  }

  const selectedKnowledgePoints = [];
  for (const knowledgePointId of requestedKnowledgePointIds) {
    const visibleKnowledgePoint = registryAccess.getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (visibleKnowledgePoint) {
      selectedKnowledgePoints.push(visibleKnowledgePoint);
    }
  }

  if (selectedKnowledgePoints.length !== requestedKnowledgePointIds.length) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE], requestedKnowledgePointIds.length - selectedKnowledgePoints.length);
  }

  if (selectedKnowledgePoints.length === 0) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED], requestedKnowledgePointIds.length || 1);
  }

  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    const selectedSourceIds = new Set(selectedKnowledgePoints.map((knowledgePoint) => knowledgePoint.sourceId));
    if (selectedSourceIds.size !== 1) {
      return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH], selectedKnowledgePoints.length);
    }
  }

  const requestedPatternGroupIds = normalizeIdArray(input.selectedPatternGroupIds);
  const selectedPatternGroups = [];
  const patternSpecIdsByGroup = new Map();
  const acceptedSourceIds = new Set();

  for (const knowledgePoint of selectedKnowledgePoints) {
    acceptedSourceIds.add(knowledgePoint.sourceId);
    const visiblePatternGroups = registryAccess.getVisiblePatternGroupsForKnowledgePoint(knowledgePoint.knowledgePointId);
    const allowedGroups = requestedPatternGroupIds.length > 0
      ? visiblePatternGroups.filter((group) => requestedPatternGroupIds.includes(group.patternGroupId))
      : visiblePatternGroups;

    for (const group of allowedGroups) {
      const patternSpecIds = registryAccess.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePoint.knowledgePointId)
        .filter((patternSpecId) => Array.isArray(group.patternSpecIds) ? group.patternSpecIds.includes(patternSpecId) : true);

      if (patternSpecIds.length === 0) {
        return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_SPEC_MISSING], 1);
      }

      selectedPatternGroups.push(group);
      patternSpecIdsByGroup.set(group.patternGroupId, patternSpecIds);
    }
  }

  if (requestedPatternGroupIds.length > 0 && selectedPatternGroups.length !== requestedPatternGroupIds.length) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_VISIBLE], requestedPatternGroupIds.length - selectedPatternGroups.length);
  }

  if (selectedPatternGroups.length === 0) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED], selectedKnowledgePoints.length);
  }

  const allocation = allocateEvenly({
    patternGroups: selectedPatternGroups,
    patternSpecIdsByGroup,
    questionCount: plan.questionCount
  });

  if (allocation === null) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.ALLOCATION_NOT_APPLICABLE], selectedPatternGroups.length);
  }

  if (allocation.length === 0) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_SPEC_MISSING], selectedPatternGroups.length);
  }

  plan.sourceIds = [...acceptedSourceIds].sort();
  plan.knowledgePointIds = selectedKnowledgePoints.map((knowledgePoint) => knowledgePoint.knowledgePointId).sort();
  plan.patternGroupIds = [...new Set(selectedPatternGroups.map((group) => group.patternGroupId))].sort();
  plan.patternSpecIds = [...new Set(allocation.map((item) => item.patternSpecId))].sort();
  plan.allocation = cloneValue(allocation);
  plan.visibilityValidation.visibleAcceptedCount = selectedKnowledgePoints.length;
  plan.provenance = {
    resolver: "visiblePatternGroupResolver",
    sourceIds: cloneValue(plan.sourceIds),
    knowledgePointIds: cloneValue(plan.knowledgePointIds),
    patternGroupIds: cloneValue(plan.patternGroupIds),
    patternSpecIds: cloneValue(plan.patternSpecIds)
  };

  return ok(plan);
}
