import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-base.js";
import {
  PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,
  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
} from "./public-generator-capacity-registry.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p03f25-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";
import { G4A_U06_P03F25_KP_ID } from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import { G4A_U09_P03F26_SOURCE_ID } from "../registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";
import {
  G6A_U02_SOURCE_ID,
  G6A_U02_RECIPROCAL_KP_ID,
  G6A_U02_RECIPROCAL_PATTERN_GROUPS,
} from "../registry/g6a-u02-reciprocal-selector-projection.js";

export { PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION = Object.freeze({
  ...PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,
  registryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
});

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";
const MIXED_MODE = "mixed";
const G5A_U08_SOURCE_ID = "g5a_u08_5a08";
const CAPACITY_BLOCK_REASONS = new Set([
  "PUBLIC_CAPACITY_ROUTE_UNAVAILABLE",
  "COMPATIBLE_QUESTION_TYPE_MISSING",
  "COMPATIBLE_PATTERN_GROUP_MISSING",
]);

function p03f23Binding(input = {}) {
  if (input.sourceId !== G6A_U02_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const group = G6A_U02_RECIPROCAL_PATTERN_GROUPS[0];
  const compatiblePatternGroup = Object.freeze({
    ...group,
    knowledgePointId: G6A_U02_RECIPROCAL_KP_ID,
    knowledgePointDisplayName: "倒數概念",
    effectiveQuestionType: "numeric",
    uiQuestionType: "numeric",
    displayLabel: "倒數概念",
    selected: true,
  });
  return Object.freeze({
    sourceId: G6A_U02_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: true }),
      Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: false }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze([G6A_U02_RECIPROCAL_KP_ID]),
    selectedKnowledgePointCount: 1,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "numeric", label: "數字題" })]),
    questionType: "numeric",
    compatiblePatternGroups: Object.freeze([compatiblePatternGroup]),
    compatiblePatternGroupIds: Object.freeze([group.patternGroupId]),
    selectedCompatiblePatternGroupIds: Object.freeze([group.patternGroupId]),
    depthOptions: Object.freeze([]), contextOptions: Object.freeze([]), depthMode: null, contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P03F23_FOCUSED_RUNTIME_240_VALIDATED"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

function uniqueStrings(values = []) {
  return [...new Set((Array.isArray(values) ? values : [])
    .map((value) => String(value ?? "").trim())
    .filter(Boolean))];
}

function withGlobalQuestionCount(binding) {
  const blockedReasons = (binding?.blockedReasons ?? [])
    .filter((reason) => reason !== "PUBLIC_CAPACITY_ROUTE_UNAVAILABLE");
  return Object.freeze({
    ...binding,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    capacityStatus: binding?.questionCount?.max > 0
      ? binding.capacityStatus
      : "STRUCTURAL_FALLBACK_AVAILABLE",
    blocked: blockedReasons.length > 0,
    blockedReasons: Object.freeze(blockedReasons),
  });
}

function g4aU06CurrentBinding(input = {}) {
  if (input.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const visibleRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID);
  const allowedIds = visibleRows.map((row) => row.knowledgePointId);
  const requested = uniqueStrings(input.selectedKnowledgePointIds).filter((id) => allowedIds.includes(id));
  let selectedKnowledgePointIds;
  if (selectionMode === SINGLE_KP_MODE) {
    selectedKnowledgePointIds = [requested[0] ?? G4A_U06_FRACTION_CLASSIFICATION_KP_ID];
  } else if (selectionMode === SAME_UNIT_MIXED_MODE) {
    selectedKnowledgePointIds = requested.length > 0 ? requested : allowedIds;
  } else {
    selectedKnowledgePointIds = allowedIds;
  }
  const compatiblePatternGroups = selectedKnowledgePointIds.flatMap((knowledgePointId) => {
    const row = visibleRows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
      effectiveQuestionType: "numeric",
      uiQuestionType: "numeric",
      displayLabel: row?.displayName ?? group.displayName ?? "數字題",
      selected: true,
    }));
  });
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  const sameUnitMixedEnabled = allowedIds.includes(G4A_U06_FRACTION_CLASSIFICATION_KP_ID) && allowedIds.includes(G4A_U06_P03F25_KP_ID);
  return Object.freeze({
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: true }),
      Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: sameUnitMixedEnabled }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "numeric", label: "數字題" })]),
    questionType: "numeric",
    compatiblePatternGroups: Object.freeze(compatiblePatternGroups),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P03F25_G4A_U06_TWO_KP_STRUCTURAL_RUNTIME"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

function g4aU09CurrentBinding(input = {}) {
  if (input.sourceId !== G4A_U09_P03F26_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const visibleRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U09_P03F26_SOURCE_ID);
  const allowedIds = visibleRows.map((row) => row.knowledgePointId);
  const requested = uniqueStrings(input.selectedKnowledgePointIds).filter((id) => allowedIds.includes(id));
  let selectedKnowledgePointIds;
  if (selectionMode === SINGLE_KP_MODE) {
    selectedKnowledgePointIds = [requested[0] ?? allowedIds[0]].filter(Boolean);
  } else if (selectionMode === SAME_UNIT_MIXED_MODE) {
    selectedKnowledgePointIds = requested.length > 0 ? requested : allowedIds;
  } else {
    selectedKnowledgePointIds = allowedIds;
  }
  const compatiblePatternGroups = selectedKnowledgePointIds.flatMap((knowledgePointId) => {
    const row = visibleRows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
      effectiveQuestionType: "numeric",
      uiQuestionType: "numeric",
      displayLabel: row?.displayName ?? group.displayName ?? "數字題",
      selected: true,
    }));
  });
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: allowedIds.length > 0 }),
      Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: allowedIds.length >= 2 }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "numeric", label: "數字題" })]),
    questionType: "numeric",
    compatiblePatternGroups: Object.freeze(compatiblePatternGroups),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P03F26_G4A_U09_SIX_KP_STRUCTURAL_RUNTIME"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

function needsStructuralFallback(binding) {
  return binding?.blocked === true
    && (binding.blockedReasons ?? []).some((reason) => CAPACITY_BLOCK_REASONS.has(reason));
}

function sourceUnitFallbackInput(input) {
  return {
    ...input,
    selectionMode: SOURCE_UNIT_MODE,
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    requestedQuestionType: MIXED_MODE,
  };
}

function inferGroupMode(group = {}, input = {}) {
  const mode = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "numeric").toLowerCase();
  const preserveSingleKpReasoning = input.sourceId === G5A_U08_SOURCE_ID
    && input.selectionMode === SINGLE_KP_MODE
    && mode.includes("reasoning");
  if (preserveSingleKpReasoning) return "reasoning";
  return mode.includes("application") || mode.includes("word_problem") ? "application" : "numeric";
}

function fallbackQuestionTypeValues(input, fallbackModes) {
  const singleKpG5AU08 = input.sourceId === G5A_U08_SOURCE_ID
    && input.selectionMode === SINGLE_KP_MODE;
  if (!singleKpG5AU08 || fallbackModes.length < 2) return fallbackModes;
  return uniqueStrings([MIXED_MODE, ...fallbackModes]);
}

function fallbackQuestionTypeLabel(value) {
  if (value === MIXED_MODE) return "混合題";
  if (value === "application") return "應用題";
  if (value === "reasoning") return "推理題";
  return "數字題";
}

function requestedKnowledgePointFallbackGroups(requestedKnowledgePointIds, input) {
  return uniqueStrings(requestedKnowledgePointIds).flatMap((knowledgePointId) =>
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => ({
      ...group,
      knowledgePointId,
      effectiveQuestionType: inferGroupMode(group, input),
      uiQuestionType: inferGroupMode(group, input),
      displayLabel: String(group.displayName ?? "題目形式"),
      selected: true,
    })),
  );
}

function selectedFallbackGroups(sourceBinding, requestedKnowledgePointIds, input) {
  const requested = new Set(uniqueStrings(requestedKnowledgePointIds));
  const sourceGroups = [...(sourceBinding?.compatiblePatternGroups ?? [])];
  if (requested.size === 0) return sourceGroups;
  const selected = sourceGroups.filter((group) => requested.has(group.knowledgePointId));
  return selected.length > 0 ? selected : requestedKnowledgePointFallbackGroups([...requested], input);
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  const slice023 = p03f23Binding(input);
  if (slice023) return slice023;
  const g4aU06 = g4aU06CurrentBinding(input);
  if (g4aU06) return g4aU06;
  const g4aU09 = g4aU09CurrentBinding(input);
  if (g4aU09) return g4aU09;
  const primary = resolveBasePublicUiCapabilityBinding(input);
  if (!needsStructuralFallback(primary)) return withGlobalQuestionCount(primary);

  const sourceBinding = resolveBasePublicUiCapabilityBinding(sourceUnitFallbackInput(input));
  const fallbackGroups = selectedFallbackGroups(sourceBinding, input.selectedKnowledgePointIds, input);
  if (sourceBinding.blocked || fallbackGroups.length === 0) return withGlobalQuestionCount(primary);

  const requestedKnowledgePointIds = uniqueStrings(input.selectedKnowledgePointIds);
  const compatiblePatternGroupIds = uniqueStrings(fallbackGroups.map((group) => group.patternGroupId));
  const fallbackModes = uniqueStrings(fallbackGroups.map((group) => inferGroupMode(group, input)));
  const availableFallbackQuestionTypeValues = fallbackQuestionTypeValues(input, fallbackModes);
  const requestedMode = String(input.requestedQuestionType ?? "");
  const fallbackQuestionType = fallbackModes.includes(requestedMode)
    ? requestedMode
    : fallbackModes.length === 1
      ? fallbackModes[0]
      : MIXED_MODE;

  return Object.freeze({
    ...sourceBinding,
    surfaceId: input.surfaceId ?? sourceBinding.surfaceId,
    selectionMode: input.selectionMode ?? sourceBinding.selectionMode,
    selectedKnowledgePointIds: Object.freeze(
      requestedKnowledgePointIds.length > 0
        ? requestedKnowledgePointIds
        : [...sourceBinding.selectedKnowledgePointIds],
    ),
    selectedKnowledgePointCount: requestedKnowledgePointIds.length > 0
      ? requestedKnowledgePointIds.length
      : sourceBinding.selectedKnowledgePointCount,
    availableQuestionTypeOptions: Object.freeze(availableFallbackQuestionTypeValues.map((value) => Object.freeze({
      value,
      label: fallbackQuestionTypeLabel(value),
    }))),
    questionType: fallbackQuestionType,
    compatiblePatternGroups: Object.freeze(fallbackGroups.map(Object.freeze)),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["POST_R03_STRUCTURAL_FALLBACK"]),
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function auditPublicUiCapabilityBinding() {
  const errors = [];
  const surfaces = Object.values(PUBLIC_UI_SURFACES);
  const visibleRows = listVisibleBatchAKnowledgePoints();
  const sourceIds = [...new Set(visibleRows.map((entry) => entry.sourceId))];
  let caseCount = 0;

  for (const sourceId of sourceIds) {
    const visible = visibleRows.filter((entry) => entry.sourceId === sourceId);
    for (const surfaceId of surfaces) {
      const sourceUnit = resolvePublicUiCapabilityBinding({ sourceId, surfaceId });
      caseCount += 1;
      if (sourceUnit.blocked) errors.push(`${sourceId}|${surfaceId}|sourceUnit:${sourceUnit.blockedReasons.join("|")}`);

      for (const kp of visible) {
        const single = resolvePublicUiCapabilityBinding({
          sourceId,
          surfaceId,
          selectionMode: SINGLE_KP_MODE,
          selectedKnowledgePointIds: [kp.knowledgePointId],
        });
        caseCount += 1;
        if (single.blocked) errors.push(`${sourceId}|${surfaceId}|${kp.knowledgePointId}:${single.blockedReasons.join("|")}`);
      }

      if (visible.length >= 2) {
        const mixed = resolvePublicUiCapabilityBinding({
          sourceId,
          surfaceId,
          selectionMode: SAME_UNIT_MIXED_MODE,
          selectedKnowledgePointIds: visible.map((kp) => kp.knowledgePointId),
        });
        caseCount += 1;
        if (mixed.blocked) errors.push(`${sourceId}|${surfaceId}|mixed:${mixed.blockedReasons.join("|")}`);
      }
    }
  }

  const result = Object.freeze({ ok: errors.length === 0, caseCount, errors: Object.freeze(errors) });
  return result;
}

// PGC-R06 A03 runtime capacity consumer reconciliation
