import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../registry/batch-a-selector-equation-extension.js";

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
const MULTISPEC_ALLOCATION_SOURCE_IDS = Object.freeze(new Set(["g3a_u01_3a01"]));

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

function shouldExpandGroupPatternSpecs(group) {
  return MULTISPEC_ALLOCATION_SOURCE_IDS.has(group.sourceId);
}

function buildAllocationCandidates(patternGroups, patternSpecIdsByGroup) {
  const candidates = [];
  for (const group of patternGroups) {
    const specIds = patternSpecIdsByGroup.get(group.patternGroupId) ?? [];
    const selectedSpecIds = shouldExpandGroupPatternSpecs(group) ? specIds : specIds.slice(0, 1);
    for (const patternSpecId of selectedSpecIds) {
      candidates.push({ patternGroupId: group.patternGroupId, patternSpecId });
    }
  }
  return candidates;
}

function allocateEvenly({ patternGroups, patternSpecIdsByGroup, questionCount }) {
  const candidates = buildAllocationCandidates(patternGroups, patternSpecIdsByGroup);
  if (candidates.length === 0) return [];
  const base = Math.floor(questionCount / candidates.length);
  let remainder = questionCount % candidates.length;
  return candidates.map((candidate) => {
    const count = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    return {
      patternGroupId: candidate.patternGroupId,
      patternSpecId: candidate.patternSpecId,
      questionCount: count
    };
  }).filter((entry) => entry.questionCount > 0);
}

function expandPatternGroups({ knowledgePointIds, selectedPatternGroupIds, registry }) {
  const selectedGroupSet = new Set(normalizeIdArray(selectedPatternGroupIds));
  const patternGroups = [];
  const rejectedCodes = [];

  for (const knowledgePointId of knowledgePointIds) {
    const kp = registry.getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (!kp) {
      rejectedCodes.push(BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE);
      continue;
    }
    const groups = registry.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
    if (groups.length === 0) {
      rejectedCodes.push(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_VISIBLE);
      continue;
    }
    const selectedOrAll = selectedGroupSet.size > 0
      ? groups.filter((group) => selectedGroupSet.has(group.patternGroupId))
      : groups;
    if (selectedOrAll.length === 0) {
      rejectedCodes.push(BATCH_A_RESOLVER_ERROR_CODES.PATTERN_GROUP_NOT_LINKED_TO_KP);
      continue;
    }
    patternGroups.push(...selectedOrAll.map((group) => ({ ...group, knowledgePointId })));
  }

  return { patternGroups, rejectedCodes };
}

export function resolveVisiblePatternGroupSelection(input = {}, options = {}) {
  const registry = resolveRegistryAccess(options);
  const selectionMode = input.selectionMode ?? BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT;
  const plan = baseResolverPlan(input, selectionMode);

  if (!VALID_SELECTION_MODES.includes(selectionMode)) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.SELECTION_MODE_INVALID]);
  }
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT) {
    return ok(plan);
  }
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.CROSS_UNIT_NOT_SUPPORTED_YET]);
  }

  const requestedKnowledgePointIds = normalizeIdArray(input.selectedKnowledgePointIds);
  if (requestedKnowledgePointIds.length === 0) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.NO_VISIBLE_KP]);
  }

  const knowledgePoints = requestedKnowledgePointIds
    .map((id) => registry.getVisibleBatchAKnowledgePoint(id))
    .filter(Boolean);
  if (knowledgePoints.length !== requestedKnowledgePointIds.length) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.KP_NOT_VISIBLE], requestedKnowledgePointIds.length - knowledgePoints.length);
  }

  const sourceIds = [...new Set(knowledgePoints.map((kp) => kp.sourceId))];
  if (selectionMode === BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT && sourceIds.length > 1) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH]);
  }
  if (input.sourceId && sourceIds.some((sourceId) => sourceId !== input.sourceId)) {
    return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.MIXED_SAME_UNIT_SOURCE_MISMATCH]);
  }

  const { patternGroups, rejectedCodes } = expandPatternGroups({
    knowledgePointIds: requestedKnowledgePointIds,
    selectedPatternGroupIds: input.selectedPatternGroupIds,
    registry
  });
  if (patternGroups.length === 0) {
    return fail(plan, rejectedCodes.length ? rejectedCodes : [BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED], requestedKnowledgePointIds.length);
  }

  const patternSpecIdsByGroup = new Map();
  for (const group of patternGroups) {
    const ids = registry.resolveVisiblePatternSpecIdsForKnowledgePoint(group.knowledgePointId)
      .filter((id) => Array.isArray(group.patternSpecIds) ? group.patternSpecIds.includes(id) : true);
    if (ids.length === 0) {
      return fail(plan, [BATCH_A_RESOLVER_ERROR_CODES.PATTERN_SPEC_MISSING], 1);
    }
    patternSpecIdsByGroup.set(group.patternGroupId, ids);
  }

  plan.sourceIds = sourceIds;
  plan.knowledgePointIds = [...requestedKnowledgePointIds].sort();
  plan.patternGroupIds = patternGroups.map((group) => group.patternGroupId).sort();
  plan.patternSpecIds = [...new Set([...patternSpecIdsByGroup.values()].flat())].sort();
  plan.allocation = allocateEvenly({
    patternGroups,
    patternSpecIdsByGroup,
    questionCount: plan.questionCount
  });
  plan.visibilityValidation.visibleAcceptedCount = patternGroups.length;
  return ok(plan);
}
