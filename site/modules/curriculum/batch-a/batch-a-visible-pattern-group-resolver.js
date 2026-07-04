import {
  BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint
} from "../registry/batch-a-selector-candidates.js";

export const BATCH_A_KP_SELECTION_MODES = Object.freeze({
  SOURCE_UNIT: "sourceUnit",
  SINGLE_KNOWLEDGE_POINT: "singleKnowledgePoint",
  MIXED_KNOWLEDGE_POINTS_SAME_UNIT: "mixedKnowledgePointsSameUnit",
  MIXED_KNOWLEDGE_POINTS_CROSS_UNIT: "mixedKnowledgePointsCrossUnit"
});

export const BATCH_A_KP_RESOLVER_ERRORS = Object.freeze({
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

const VALID_SELECTION_MODES = Object.freeze(Object.values(BATCH_A_KP_SELECTION_MODES));

const DEFAULT_REGISTRY_API = Object.freeze({
  availability: BATCH_A_SELECTOR_AVAILABILITY,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource
});

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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function basePlan(input, overrides = {}) {
  return {
    schemaVersion: "batch-a-kp-resolver-plan-v1",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: input.selectionMode ?? BATCH_A_KP_SELECTION_MODES.SOURCE_UNIT,
    sourceIds: input.sourceId ? [input.sourceId] : [],
    knowledgePointIds: [],
    patternGroupIds: [],
    patternSpecIds: [],
    allocation: [],
    questionCount: positiveInteger(input.questionCount, 1),
    ordering: input.ordering ?? "groupedByPattern",
    generationSeed: String(input.generationSeed ?? "batch-a-browser"),
    includeAnswerKey: input.includeAnswerKey ?? true,
    visibilityValidation: {
      visibleAcceptedCount: 0,
      rejectedCount: 0,
      rejectionCodes: []
    },
    provenance: {
      source: "batch-a-visible-pattern-group-resolver",
      registry: "browser-safe-selector-candidates"
    },
    errors: [],
    warnings: [],
    ...overrides
  };
}

function rejectionValidation(rejectionCodes, rejectedCount = 1) {
  return {
    visibleAcceptedCount: 0,
    rejectedCount,
    rejectionCodes: uniqueSorted(rejectionCodes)
  };
}

function sourceUnitHandoff(input) {
  return {
    ok: true,
    mode: BATCH_A_KP_SELECTION_MODES.SOURCE_UNIT,
    ...basePlan(input, {
      worksheetMode: "batchASource",
      selectionMode: BATCH_A_KP_SELECTION_MODES.SOURCE_UNIT,
      sourceIds: input.sourceId ? [input.sourceId] : [],
      warnings: []
    })
  };
}

function errorPlan(input, errors, rejectedCount = 1) {
  return {
    ok: false,
    mode: input.selectionMode,
    ...basePlan(input, {
      errors: uniqueSorted(errors),
      visibilityValidation: rejectionValidation(errors, rejectedCount)
    })
  };
}

function resolvePatternGroupsForKnowledgePoint(knowledgePointId, selectedPatternGroupIds, registryApi) {
  const visibleGroups = registryApi.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) ?? [];
  if (selectedPatternGroupIds.length === 0) return visibleGroups;
  const selected = new Set(selectedPatternGroupIds);
  return visibleGroups.filter((group) => selected.has(group.patternGroupId));
}

function allocateQuestions(questionCount, patternGroups, patternSpecIdsByPatternGroupId) {
  const sortedGroups = [...patternGroups].sort((left, right) => left.patternGroupId.localeCompare(right.patternGroupId));
  const base = Math.floor(questionCount / sortedGroups.length);
  let remainder = questionCount % sortedGroups.length;
  const allocations = [];

  for (const group of sortedGroups) {
    const groupCount = base + (remainder > 0 ? 1 : 0);
    remainder -= remainder > 0 ? 1 : 0;
    const patternSpecIds = patternSpecIdsByPatternGroupId.get(group.patternGroupId) ?? [];

    if (patternSpecIds.length <= 1 || group.allocationPolicy === "single_pattern") {
      allocations.push({
        patternGroupId: group.patternGroupId,
        patternSpecId: patternSpecIds[0],
        questionCount: groupCount
      });
      continue;
    }

    if (group.allocationPolicy === "average_across_patterns") {
      const perSpecBase = Math.floor(groupCount / patternSpecIds.length);
      let perSpecRemainder = groupCount % patternSpecIds.length;
      for (const patternSpecId of patternSpecIds) {
        allocations.push({
          patternGroupId: group.patternGroupId,
          patternSpecId,
          questionCount: perSpecBase + (perSpecRemainder > 0 ? 1 : 0)
        });
        perSpecRemainder -= perSpecRemainder > 0 ? 1 : 0;
      }
    }
  }

  return allocations;
}

export function resolveBatchAVisiblePatternGroupSelection(input = {}, registryApi = DEFAULT_REGISTRY_API) {
  const selectionMode = input.selectionMode ?? BATCH_A_KP_SELECTION_MODES.SOURCE_UNIT;

  if (selectionMode === BATCH_A_KP_SELECTION_MODES.SOURCE_UNIT || selectionMode === undefined || selectionMode === null) {
    return sourceUnitHandoff(input);
  }

  if (!VALID_SELECTION_MODES.includes(selectionMode)) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.SELECTION_MODE_INVALID],
      1
    );
  }

  const availability = registryApi.availability ?? { visibleCount: 0 };
  const selectedKnowledgePointIds = normalizeIdArray(input.selectedKnowledgePointIds);
  const selectedPatternGroupIds = normalizeIdArray(input.selectedPatternGroupIds);

  if ((availability.visibleCount ?? 0) <= 0) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.NO_VISIBLE_KP, BATCH_A_KP_RESOLVER_ERRORS.ALL_CANDIDATES_REJECTED],
      selectedKnowledgePointIds.length + selectedPatternGroupIds.length || 1
    );
  }

  if (selectionMode === BATCH_A_KP_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_CROSS_UNIT) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.CROSS_UNIT_NOT_SUPPORTED_YET],
      selectedKnowledgePointIds.length || 1
    );
  }

  if (selectionMode === BATCH_A_KP_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT && selectedKnowledgePointIds.length !== 1) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.KP_NOT_VISIBLE],
      Math.max(1, selectedKnowledgePointIds.length)
    );
  }

  if (selectionMode === BATCH_A_KP_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT && selectedKnowledgePointIds.length < 2) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.ALL_CANDIDATES_REJECTED],
      Math.max(1, selectedKnowledgePointIds.length)
    );
  }

  const visibleKnowledgePoints = [];
  const rejectedCodes = [];

  for (const knowledgePointId of selectedKnowledgePointIds) {
    const visibleKnowledgePoint = registryApi.getVisibleBatchAKnowledgePoint(knowledgePointId);
    if (!visibleKnowledgePoint) {
      rejectedCodes.push(BATCH_A_KP_RESOLVER_ERRORS.KP_NOT_VISIBLE);
      continue;
    }
    visibleKnowledgePoints.push(visibleKnowledgePoint);
  }

  if (visibleKnowledgePoints.length === 0) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.ALL_CANDIDATES_REJECTED, ...rejectedCodes],
      selectedKnowledgePointIds.length || 1
    );
  }

  if (selectionMode === BATCH_A_KP_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT) {
    const sourceIds = uniqueSorted(visibleKnowledgePoints.map((kp) => kp.sourceId));
    if (sourceIds.length !== 1) {
      return errorPlan(
        { ...input, selectionMode },
        [BATCH_A_KP_RESOLVER_ERRORS.MIXED_SAME_UNIT_SOURCE_MISMATCH],
        visibleKnowledgePoints.length
      );
    }
  }

  const resolvedPatternGroups = [];
  const patternSpecIdsByPatternGroupId = new Map();
  const sourceIds = uniqueSorted(visibleKnowledgePoints.map((kp) => kp.sourceId));

  for (const kp of visibleKnowledgePoints) {
    const groups = resolvePatternGroupsForKnowledgePoint(kp.knowledgePointId, selectedPatternGroupIds, registryApi);
    if (groups.length === 0) {
      rejectedCodes.push(BATCH_A_KP_RESOLVER_ERRORS.PATTERN_GROUP_NOT_VISIBLE);
      continue;
    }

    for (const group of groups) {
      const patternSpecIds = registryApi.resolveVisiblePatternSpecIdsForKnowledgePoint(kp.knowledgePointId)
        .filter((patternSpecId) => (kp.patternSpecIds ?? []).includes(patternSpecId));

      if (patternSpecIds.length === 0) {
        rejectedCodes.push(BATCH_A_KP_RESOLVER_ERRORS.PATTERN_SPEC_MISSING);
        continue;
      }

      if (group.allocationPolicy === "not_applicable") {
        rejectedCodes.push(BATCH_A_KP_RESOLVER_ERRORS.ALLOCATION_NOT_APPLICABLE);
        continue;
      }

      resolvedPatternGroups.push(group);
      patternSpecIdsByPatternGroupId.set(group.patternGroupId, patternSpecIds);
    }
  }

  if (resolvedPatternGroups.length === 0) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.ALL_CANDIDATES_REJECTED, ...rejectedCodes],
      selectedKnowledgePointIds.length || 1
    );
  }

  const questionCount = positiveInteger(input.questionCount, 1);
  const allocation = allocateQuestions(questionCount, resolvedPatternGroups, patternSpecIdsByPatternGroupId);
  const patternSpecIds = uniqueSorted(allocation.map((item) => item.patternSpecId));

  if (allocation.length === 0 || patternSpecIds.length === 0) {
    return errorPlan(
      { ...input, selectionMode },
      [BATCH_A_KP_RESOLVER_ERRORS.ALL_CANDIDATES_REJECTED, BATCH_A_KP_RESOLVER_ERRORS.PATTERN_SPEC_MISSING],
      selectedKnowledgePointIds.length || 1
    );
  }

  return {
    ok: true,
    mode: selectionMode,
    ...basePlan(input, {
      selectionMode,
      sourceIds,
      knowledgePointIds: visibleKnowledgePoints.map((kp) => kp.knowledgePointId).sort(),
      patternGroupIds: resolvedPatternGroups.map((group) => group.patternGroupId).sort(),
      patternSpecIds,
      allocation,
      visibilityValidation: {
        visibleAcceptedCount: visibleKnowledgePoints.length,
        rejectedCount: rejectedCodes.length,
        rejectionCodes: uniqueSorted(rejectedCodes)
      },
      provenance: {
        source: "batch-a-visible-pattern-group-resolver",
        registry: "browser-safe-selector-candidates",
        availability: cloneValue(registryApi.listBatchAKnowledgePointAvailabilityBySource?.(sourceIds[0]) ?? availability)
      }
    })
  };
}
