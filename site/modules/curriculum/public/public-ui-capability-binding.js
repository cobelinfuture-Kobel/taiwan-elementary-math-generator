import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBase,
  resolvePublicUiCapabilityBinding as resolveBase,
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

const unique = (values = []) => [...new Set((Array.isArray(values) ? values : [])
  .map((value) => String(value ?? "").trim()).filter(Boolean))];
const key = (values = []) => unique(values).sort().join("|");
const profileOptions = (definition) => definition?.supported === true
  ? (definition.options ?? []).map((option) => ({ ...option }))
  : [];
const choose = (requested, options) => options.some((option) => option.value === requested)
  ? requested
  : options[0]?.value ?? null;

function decode(row) {
  return {
    sourceId: row[0], selectionMode: row[1], selectedKnowledgePointKey: row[2],
    questionType: row[3], publicPatternGroupKey: row[4], depthMode: row[5] || null,
    contextMode: row[6] || null, verifiedMaxQuestionCount: Number(row[7] ?? 0),
    legalRoute: row[8] === "LEGAL", qualityStatus: row[9] ?? "UNKNOWN", routeId: row[10] ?? null,
  };
}
const CAPACITY_ROWS = PUBLIC_GENERATOR_CAPACITY_REGISTRY_STATUS === "PENDING_PGC_R03"
  ? [] : PUBLIC_GENERATOR_CAPACITY_ROWS.map(decode);

function rowsForGroups(rows, selectedPatternGroupIds) {
  const requested = unique(selectedPatternGroupIds);
  if (requested.length === 0) return rows;
  const exact = rows.filter((row) => row.publicPatternGroupKey === key(requested));
  if (exact.length > 0) return exact;
  const requestedSet = new Set(requested);
  return rows.filter((row) => {
    const groups = new Set(unique(row.publicPatternGroupKey.split("|")));
    return [...requestedSet].every((groupId) => groups.has(groupId));
  });
}

function exactCapacity(input) {
  const questionType = String(input.requestedQuestionType ?? "").trim();
  if (!questionType || CAPACITY_ROWS.length === 0) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const selectedKnowledgePointKey = selectionMode === SOURCE_UNIT_MODE ? "" : key(input.selectedKnowledgePointIds);
  const caseRows = CAPACITY_ROWS.filter((row) => row.sourceId === input.sourceId
    && row.selectionMode === selectionMode
    && row.selectedKnowledgePointKey === selectedKnowledgePointKey
    && row.questionType === questionType
    && row.legalRoute && row.verifiedMaxQuestionCount > 0);
  const selectedGroupRows = rowsForGroups(caseRows, input.selectedPatternGroupIds);
  const groupRows = selectedGroupRows.length > 0 ? selectedGroupRows : caseRows;
  if (groupRows.length === 0) return null;

  const profile = getFullProductPublicControlProfile(input.sourceId);
  const depthValues = new Set(unique(groupRows.map((row) => row.depthMode)));
  const depthOptions = profileOptions(profile?.reasoningDepthControl).filter((option) => depthValues.has(option.value));
  const depthMode = choose(input.requestedDepthMode, depthOptions);
  const depthRows = depthOptions.length === 0
    ? groupRows.filter((row) => row.depthMode == null)
    : groupRows.filter((row) => row.depthMode === depthMode);
  const contextSource = depthRows.length > 0 ? depthRows : groupRows;
  const contextValues = new Set(unique(contextSource.map((row) => row.contextMode)));
  const contextOptions = profileOptions(profile?.contextControl).filter((option) => contextValues.has(option.value));
  const contextMode = choose(input.requestedContextMode, contextOptions);
  const exactRows = contextSource.filter((row) =>
    (depthOptions.length === 0 ? row.depthMode == null : row.depthMode === depthMode)
    && (contextOptions.length === 0 ? row.contextMode == null : row.contextMode === contextMode));
  const legalRows = exactRows.length > 0 ? exactRows : contextSource;
  if (legalRows.length === 0) return null;

  return Object.freeze({
    questionType,
    questionTypeOption: profileOptions(profile?.questionTypeControl).find((option) => option.value === questionType) ?? null,
    depthOptions: Object.freeze(depthOptions.map(Object.freeze)),
    contextOptions: Object.freeze(contextOptions.map(Object.freeze)),
    depthMode,
    contextMode,
    routeIds: Object.freeze(unique(legalRows.map((row) => row.routeId))),
    qualityStatuses: Object.freeze(unique(legalRows.map((row) => row.qualityStatus))),
    patternGroupIds: Object.freeze(unique(legalRows.flatMap((row) => row.publicPatternGroupKey.split("|")))),
  });
}

function withGlobalCount(binding) {
  const blockedReasons = (binding?.blockedReasons ?? []).filter((reason) => reason !== "PUBLIC_CAPACITY_ROUTE_UNAVAILABLE");
  return Object.freeze({
    ...binding,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    capacityStatus: binding?.questionCount?.max > 0 ? binding.capacityStatus : "STRUCTURAL_FALLBACK_AVAILABLE",
    blocked: blockedReasons.length > 0,
    blockedReasons: Object.freeze(blockedReasons),
  });
}
const needsFallback = (binding) => binding?.blocked === true
  && (binding.blockedReasons ?? []).some((reason) => CAPACITY_BLOCK_REASONS.has(reason));
const fallbackInput = (input) => ({
  ...input, selectionMode: SOURCE_UNIT_MODE, selectedKnowledgePointIds: [],
  selectedPatternGroupIds: [], requestedQuestionType: MIXED_MODE,
});
function fallbackGroups(sourceBinding, requestedKnowledgePointIds) {
  const requested = new Set(unique(requestedKnowledgePointIds));
  const groups = [...(sourceBinding?.compatiblePatternGroups ?? [])];
  if (requested.size === 0) return groups;
  const selected = groups.filter((group) => requested.has(group.knowledgePointId));
  return selected.length > 0 ? selected : groups;
}
function questionOptions(sourceOptions, capacity) {
  const options = [...(sourceOptions ?? [])].map((option) => ({ ...option }));
  if (capacity?.questionTypeOption && !options.some((option) => option.value === capacity.questionTypeOption.value)) {
    options.push({ ...capacity.questionTypeOption });
  }
  return Object.freeze(options.map(Object.freeze));
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  const primary = resolveBase(input);
  const capacity = exactCapacity(input);
  const exactIdentityMismatch = capacity && primary.questionType !== capacity.questionType;
  if (!needsFallback(primary) && !exactIdentityMismatch) return withGlobalCount(primary);

  const sourceBinding = resolveBase(fallbackInput(input));
  const sourceGroups = fallbackGroups(sourceBinding, input.selectedKnowledgePointIds);
  if (sourceBinding.blocked || sourceGroups.length === 0) return withGlobalCount(primary);

  const exactIds = new Set(capacity?.patternGroupIds ?? []);
  const exactGroups = exactIds.size > 0 ? sourceGroups.filter((group) => exactIds.has(group.patternGroupId)) : [];
  const groups = exactGroups.length > 0
    ? exactGroups.map((group) => ({ ...group, uiQuestionType: capacity.questionType }))
    : sourceGroups;
  const groupIds = unique(groups.map((group) => group.patternGroupId));
  const requestedGroupIds = new Set(unique(input.selectedPatternGroupIds));
  const selectedGroupIds = requestedGroupIds.size === 0
    ? groupIds : groupIds.filter((groupId) => requestedGroupIds.has(groupId));
  const requestedKnowledgePointIds = unique(input.selectedKnowledgePointIds);
  const mixedAvailable = sourceBinding.availableQuestionTypeOptions.some((option) => option.value === MIXED_MODE);

  return Object.freeze({
    ...sourceBinding,
    surfaceId: input.surfaceId ?? sourceBinding.surfaceId,
    selectionMode: input.selectionMode ?? sourceBinding.selectionMode,
    selectedKnowledgePointIds: Object.freeze(requestedKnowledgePointIds.length > 0
      ? requestedKnowledgePointIds : [...sourceBinding.selectedKnowledgePointIds]),
    selectedKnowledgePointCount: requestedKnowledgePointIds.length > 0
      ? requestedKnowledgePointIds.length : sourceBinding.selectedKnowledgePointCount,
    availableQuestionTypeOptions: capacity ? questionOptions(sourceBinding.availableQuestionTypeOptions, capacity)
      : sourceBinding.availableQuestionTypeOptions,
    questionType: capacity?.questionType ?? (mixedAvailable ? MIXED_MODE : sourceBinding.questionType),
    compatiblePatternGroups: Object.freeze(groups.map(Object.freeze)),
    compatiblePatternGroupIds: Object.freeze(groupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(selectedGroupIds),
    depthOptions: capacity?.depthOptions ?? sourceBinding.depthOptions,
    contextOptions: capacity?.contextOptions ?? sourceBinding.contextOptions,
    depthMode: capacity?.depthMode ?? sourceBinding.depthMode,
    contextMode: capacity?.contextMode ?? sourceBinding.contextMode,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    capacityStatus: capacity ? "STRUCTURAL_FALLBACK_EXACT_ROUTE_AVAILABLE" : "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRouteIds: capacity?.routeIds ?? sourceBinding.capacityRouteIds,
    capacityQualityStatuses: capacity?.qualityStatuses ?? sourceBinding.capacityQualityStatuses,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function auditPublicUiCapabilityBinding() { return auditBase(); }

// PGC-R06 A03 runtime capacity consumer reconciliation
// PGC-R08 A04 A03 exact-route identity preservation through structural fallback
