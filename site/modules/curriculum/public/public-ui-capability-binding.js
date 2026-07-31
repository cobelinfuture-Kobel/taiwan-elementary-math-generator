import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-base.js";
import { getFullProductPublicControlProfile } from "../registry/full-product-public-control-profiles.js";
import {
  PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,
  PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
  PUBLIC_GENERATOR_CAPACITY_ROWS,
} from "./public-generator-capacity-registry.js";

export { PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION = Object.freeze({
  ...PUBLIC_GENERATOR_CAPACITY_RECONCILIATION,
  registryStatus: PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS,
});

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

function sortedKey(values = []) {
  return uniqueStrings(values).sort().join("|");
}

function decodeCapacityRow(row) {
  return {
    sourceId: row[0],
    selectionMode: row[1],
    selectedKnowledgePointKey: row[2],
    questionType: row[3],
    publicPatternGroupKey: row[4],
    depthMode: row[5] || null,
    contextMode: row[6] || null,
    verifiedMaxQuestionCount: Number(row[7] ?? 0),
    legalRoute: row[8] === "LEGAL",
    qualityStatus: row[9] ?? "UNKNOWN",
    routeId: row[10] ?? null,
  };
}

const CAPACITY_ROWS = PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS === "PENDING_PGC_R03"
  ? []
  : PUBLIC_GENERATOR_CAPACITY_ROWS.map(decodeCapacityRow);

function profileOptions(definition) {
  return definition?.supported === true
    ? (definition.options ?? []).map((option) => ({ ...option }))
    : [];
}

function chooseValue(requested, options) {
  const values = new Set(options.map((option) => option.value));
  if (values.has(requested)) return requested;
  return options[0]?.value ?? null;
}

function rowsForSelectedGroups(rows, selectedPatternGroupIds) {
  const requested = uniqueStrings(selectedPatternGroupIds);
  if (requested.length === 0) return rows;
  const exactKey = sortedKey(requested);
  const exact = rows.filter((row) => row.publicPatternGroupKey === exactKey);
  if (exact.length > 0) return exact;
  const requestedSet = new Set(requested);
  return rows.filter((row) => {
    const rowGroups = new Set(uniqueStrings(row.publicPatternGroupKey.split("|")));
    return [...requestedSet].every((patternGroupId) => rowGroups.has(patternGroupId));
  });
}

function exactCapacityBinding(input) {
  const requestedQuestionType = String(input.requestedQuestionType ?? "").trim();
  if (!requestedQuestionType || CAPACITY_ROWS.length === 0) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const selectedKnowledgePointKey = selectionMode === SOURCE_UNIT_MODE
    ? ""
    : sortedKey(input.selectedKnowledgePointIds);
  const caseRows = CAPACITY_ROWS.filter((row) => row.sourceId === input.sourceId
    && row.selectionMode === selectionMode
    && row.selectedKnowledgePointKey === selectedKnowledgePointKey
    && row.questionType === requestedQuestionType
    && row.legalRoute
    && row.verifiedMaxQuestionCount > 0);
  if (caseRows.length === 0) return null;

  const groupRows = rowsForSelectedGroups(caseRows, input.selectedPatternGroupIds);
  if (groupRows.length === 0) return null;
  const profile = getFullProductPublicControlProfile(input.sourceId);
  const depthValues = new Set(uniqueStrings(groupRows.map((row) => row.depthMode)));
  const depthOptions = profileOptions(profile?.reasoningDepthControl)
    .filter((option) => depthValues.has(option.value));
  const depthMode = chooseValue(input.requestedDepthMode, depthOptions);
  const depthRows = depthOptions.length === 0
    ? groupRows.filter((row) => row.depthMode == null)
    : groupRows.filter((row) => row.depthMode === depthMode);
  const contextSourceRows = depthRows.length > 0 ? depthRows : groupRows;
  const contextValues = new Set(uniqueStrings(contextSourceRows.map((row) => row.contextMode)));
  const contextOptions = profileOptions(profile?.contextControl)
    .filter((option) => contextValues.has(option.value));
  const contextMode = chooseValue(input.requestedContextMode, contextOptions);
  const exactRows = contextSourceRows.filter((row) => {
    const depthMatches = depthOptions.length === 0 ? row.depthMode == null : row.depthMode === depthMode;
    const contextMatches = contextOptions.length === 0 ? row.contextMode == null : row.contextMode === contextMode;
    return depthMatches && contextMatches;
  });
  const legalRows = exactRows.length > 0 ? exactRows : contextSourceRows;
  if (legalRows.length === 0) return null;

  const profileQuestionOption = profileOptions(profile?.questionTypeControl)
    .find((option) => option.value === requestedQuestionType) ?? null;
  const publicPatternGroupIds = uniqueStrings(
    legalRows.flatMap((row) => row.publicPatternGroupKey.split("|")),
  );
  return Object.freeze({
    questionType: requestedQuestionType,
    questionTypeOption: profileQuestionOption,
    depthOptions: Object.freeze(depthOptions.map(Object.freeze)),
    contextOptions: Object.freeze(contextOptions.map(Object.freeze)),
    depthMode,
    contextMode,
    routeIds: Object.freeze(uniqueStrings(legalRows.map((row) => row.routeId))),
    qualityStatuses: Object.freeze(uniqueStrings(legalRows.map((row) => row.qualityStatus))),
    publicPatternGroupIds: Object.freeze(publicPatternGroupIds),
  });
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

function mergeQuestionTypeOptions(sourceOptions, exactCapacity) {
  const rows = [...(sourceOptions ?? [])].map((option) => ({ ...option }));
  if (exactCapacity?.questionTypeOption
      && !rows.some((option) => option.value === exactCapacity.questionTypeOption.value)) {
    rows.push({ ...exactCapacity.questionTypeOption });
  }
  return Object.freeze(rows.map(Object.freeze));
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  const primary = resolveBasePublicUiCapabilityBinding(input);
  if (!needsStructuralFallback(primary)) return withGlobalQuestionCount(primary);

  const sourceBinding = resolveBasePublicUiCapabilityBinding(sourceUnitFallbackInput(input));
  const fallbackGroups = selectedFallbackGroups(sourceBinding, input.selectedKnowledgePointIds);
  if (sourceBinding.blocked || fallbackGroups.length === 0) return withGlobalQuestionCount(primary);

  const requestedKnowledgePointIds = uniqueStrings(input.selectedKnowledgePointIds);
  const exactCapacity = exactCapacityBinding(input);
  const exactGroupIds = new Set(exactCapacity?.publicPatternGroupIds ?? []);
  const exactFallbackGroups = exactGroupIds.size > 0
    ? fallbackGroups.filter((group) => exactGroupIds.has(group.patternGroupId))
    : [];
  const compatiblePatternGroups = exactFallbackGroups.length > 0
    ? exactFallbackGroups.map((group) => ({ ...group, uiQuestionType: exactCapacity.questionType }))
    : fallbackGroups;
  const compatiblePatternGroupIds = uniqueStrings(
    compatiblePatternGroups.map((group) => group.patternGroupId),
  );
  const requestedPatternGroups = new Set(uniqueStrings(input.selectedPatternGroupIds));
  const selectedCompatiblePatternGroupIds = requestedPatternGroups.size === 0
    ? compatiblePatternGroupIds
    : compatiblePatternGroupIds.filter((patternGroupId) => requestedPatternGroups.has(patternGroupId));
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
    availableQuestionTypeOptions: exactCapacity
      ? mergeQuestionTypeOptions(sourceBinding.availableQuestionTypeOptions, exactCapacity)
      : sourceBinding.availableQuestionTypeOptions,
    questionType: exactCapacity?.questionType
      ?? (mixedAvailable ? MIXED_MODE : sourceBinding.questionType),
    compatiblePatternGroups: Object.freeze(compatiblePatternGroups.map(Object.freeze)),
    compatiblePatternGroupIds: Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(selectedCompatiblePatternGroupIds),
    depthOptions: exactCapacity?.depthOptions ?? sourceBinding.depthOptions,
    contextOptions: exactCapacity?.contextOptions ?? sourceBinding.contextOptions,
    depthMode: exactCapacity?.depthMode ?? sourceBinding.depthMode,
    contextMode: exactCapacity?.contextMode ?? sourceBinding.contextMode,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    capacityStatus: exactCapacity
      ? "STRUCTURAL_FALLBACK_EXACT_ROUTE_AVAILABLE"
      : "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRouteIds: exactCapacity?.routeIds ?? sourceBinding.capacityRouteIds,
    capacityQualityStatuses: exactCapacity?.qualityStatuses ?? sourceBinding.capacityQualityStatuses,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function auditPublicUiCapabilityBinding() {
  return auditBasePublicUiCapabilityBinding();
}

// PGC-R06 A03 runtime capacity consumer reconciliation
// PGC-R08 A04 A03 exact-route identity preservation through structural fallback
