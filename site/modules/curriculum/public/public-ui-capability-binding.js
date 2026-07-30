import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-base.js";

export { PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SOURCE_UNIT_MODE = "sourceUnit";
const MIXED_MODE = "mixed";
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
    capacityStatus: binding?.questionCount?.max > 0
      ? binding.capacityStatus
      : "STRUCTURAL_FALLBACK_AVAILABLE",
    blocked: blockedReasons.length > 0,
    blockedReasons: Object.freeze(blockedReasons),
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

function selectedFallbackGroups(sourceBinding, requestedKnowledgePointIds) {
  const requested = new Set(uniqueStrings(requestedKnowledgePointIds));
  const sourceGroups = [...(sourceBinding?.compatiblePatternGroups ?? [])];
  if (requested.size === 0) return sourceGroups;
  const selected = sourceGroups.filter((group) => requested.has(group.knowledgePointId));
  return selected.length > 0 ? selected : sourceGroups;
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  const primary = resolveBasePublicUiCapabilityBinding(input);
  if (!needsStructuralFallback(primary)) return withGlobalQuestionCount(primary);

  const sourceBinding = resolveBasePublicUiCapabilityBinding(sourceUnitFallbackInput(input));
  const fallbackGroups = selectedFallbackGroups(sourceBinding, input.selectedKnowledgePointIds);
  if (sourceBinding.blocked || fallbackGroups.length === 0) return withGlobalQuestionCount(primary);

  const requestedKnowledgePointIds = uniqueStrings(input.selectedKnowledgePointIds);
  const compatiblePatternGroupIds = uniqueStrings(fallbackGroups.map((group) => group.patternGroupId));
  const mixedAvailable = sourceBinding.availableQuestionTypeOptions
    .some((option) => option.value === MIXED_MODE);

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
    questionType: mixedAvailable ? MIXED_MODE : sourceBinding.questionType,
    compatiblePatternGroups: Object.freeze(fallbackGroups),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function auditPublicUiCapabilityBinding() {
  return auditBasePublicUiCapabilityBinding();
}
