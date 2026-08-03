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
} from "../registry/batch-a-selector-p03f17-extension.js";
import {
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

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

function p03f17Binding(input = {}) {
  if (input.sourceId !== G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const requested = uniqueStrings(input.selectedKnowledgePointIds);
  const selectedKnowledgePointIds = requested.includes(G4A_U06_FRACTION_CLASSIFICATION_KP_ID)
    ? [G4A_U06_FRACTION_CLASSIFICATION_KP_ID]
    : [G4A_U06_FRACTION_CLASSIFICATION_KP_ID];
  const group = G4A_U06_FRACTION_CLASSIFICATION_PATTERN_GROUPS[0];
  const compatiblePatternGroup = Object.freeze({
    knowledgePointId: G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    knowledgePointDisplayName: "真分數、假分數與帶分數分類",
    patternGroupId: group.patternGroupId,
    patternSpecIds: Object.freeze([...(group.patternSpecIds ?? [])]),
    effectiveQuestionType: "numeric",
    uiQuestionType: "numeric",
    displayLabel: "真分數、假分數與帶分數分類",
    selected: true,
  });
  return Object.freeze({
    sourceId: G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: true }),
      Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: false }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
    selectedKnowledgePointCount: 1,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "numeric", label: "數字題" })]),
    questionType: "numeric",
    compatiblePatternGroups: Object.freeze([compatiblePatternGroup]),
    compatiblePatternGroupIds: Object.freeze([group.patternGroupId]),
    selectedCompatiblePatternGroupIds: Object.freeze([group.patternGroupId]),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P03F17_FOCUSED_RUNTIME_VALIDATED"]),
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

function inferGroupMode(group = {}) {
  const mode = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "numeric").toLowerCase();
  if (group.sourceId === G5A_U08_SOURCE_ID && mode.includes("reasoning")) return "reasoning";
  return mode.includes("application") || mode.includes("word_problem") ? "application" : "numeric";
}

function fallbackQuestionTypeValues(input, fallbackModes) {
  if (input.sourceId !== G5A_U08_SOURCE_ID || fallbackModes.length < 2) return fallbackModes;
  return uniqueStrings([MIXED_MODE, ...fallbackModes]);
}

function fallbackQuestionTypeLabel(value) {
  if (value === MIXED_MODE) return "混合題";
  if (value === "application") return "應用題";
  if (value === "reasoning") return "推理題";
  return "數字題";
}

function requestedKnowledgePointFallbackGroups(requestedKnowledgePointIds) {
  return uniqueStrings(requestedKnowledgePointIds).flatMap((knowledgePointId) =>
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => ({
      ...group,
      knowledgePointId,
      effectiveQuestionType: inferGroupMode(group),
      uiQuestionType: inferGroupMode(group),
      displayLabel: String(group.displayName ?? "題目形式"),
      selected: true,
    })),
  );
}

function selectedFallbackGroups(sourceBinding, requestedKnowledgePointIds) {
  const requested = new Set(uniqueStrings(requestedKnowledgePointIds));
  const sourceGroups = [...(sourceBinding?.compatiblePatternGroups ?? [])];
  if (requested.size === 0) return sourceGroups;
  const selected = sourceGroups.filter((group) => requested.has(group.knowledgePointId));
  return selected.length > 0 ? selected : requestedKnowledgePointFallbackGroups([...requested]);
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  const slice017 = p03f17Binding(input);
  if (slice017) return slice017;
  const primary = resolveBasePublicUiCapabilityBinding(input);
  if (!needsStructuralFallback(primary)) return withGlobalQuestionCount(primary);

  const sourceBinding = resolveBasePublicUiCapabilityBinding(sourceUnitFallbackInput(input));
  const fallbackGroups = selectedFallbackGroups(sourceBinding, input.selectedKnowledgePointIds);
  if (sourceBinding.blocked || fallbackGroups.length === 0) return withGlobalQuestionCount(primary);

  const requestedKnowledgePointIds = uniqueStrings(input.selectedKnowledgePointIds);
  const compatiblePatternGroupIds = uniqueStrings(fallbackGroups.map((group) => group.patternGroupId));
  const fallbackModes = uniqueStrings(fallbackGroups.map(inferGroupMode));
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
