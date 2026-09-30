export * from "./public-ui-capability-binding-p09-a03b.js";
import * as base from "./public-ui-capability-binding-p09-a03b.js";
import {
  P09_MIXED21_TARGET_SOURCE_IDS,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p09-mixed21-extension.js";

export const PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION = base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION;
export const PUBLIC_UI_SAFE_QUESTION_COUNT = base.PUBLIC_UI_SAFE_QUESTION_COUNT;
export const PUBLIC_UI_SURFACES = base.PUBLIC_UI_SURFACES;

const MIXED = "mixedKnowledgePointsSameUnit";
const CROSS = "mixedKnowledgePointsCrossUnit";
const TARGETS = new Set(P09_MIXED21_TARGET_SOURCE_IDS);
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];

function mixedBinding(input = {}) {
  if (!TARGETS.has(input.sourceId) || input.selectionMode !== MIXED) return null;
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === input.sourceId);
  if (rows.length < 2) return null;
  const requested = unique(input.selectedKnowledgePointIds);
  const requestedSet = new Set(requested);
  const requestedRows = rows.filter((row) => requestedSet.has(row.knowledgePointId));
  const selected = requestedRows.length >= 2 ? requestedRows : rows;
  const selectedIds = selected.map((row) => row.knowledgePointId);
  const groups = [...new Map(
    selected.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId))
      .filter((group) => group?.patternGroupId)
      .map((group) => [group.patternGroupId, group]),
  ).values()];
  const labels = Object.fromEntries(selected.map((row) => [row.knowledgePointId, row.displayName]));
  const sourceBinding = base.resolvePublicUiCapabilityBinding({
    ...input,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
  });
  return Object.freeze({
    sourceId: input.sourceId,
    surfaceId: input.surfaceId ?? base.PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: MIXED,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: "sourceUnit", enabled: sourceBinding?.blocked === false }),
      Object.freeze({ value: "singleKnowledgePoint", enabled: true }),
      Object.freeze({ value: MIXED, enabled: true }),
      Object.freeze({ value: CROSS, enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedIds),
    selectedKnowledgePointCount: selectedIds.length,
    availableQuestionTypeOptions: Object.freeze([]),
    questionType: "mixed",
    compatiblePatternGroups: Object.freeze(groups.map((group) => Object.freeze({
      ...group,
      knowledgePointId: group.primaryKnowledgePointId,
      knowledgePointDisplayName: labels[group.primaryKnowledgePointId] ?? null,
      effectiveQuestionType: "mixed",
      uiQuestionType: "mixed",
      displayLabel: group.displayName,
      selected: true,
    }))),
    compatiblePatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    selectedCompatiblePatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: Object.freeze({
      min: selectedIds.length,
      max: 240,
      default: Math.max(20, selectedIds.length),
    }),
    capacityStatus: "P09_MIXED21_SHARED_UNIT_AGGREGATION",
    capacityRegistryStatus: base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P09_UI_SAME_UNIT_MIXED21_SHARED_AGGREGATION"]),
    capacityReconciliation: base.PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
    operatorApprovedExtension: true,
    sameUnitMixedAdmission: true,
    globalContextEnabled: false,
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return mixedBinding(input) ?? base.resolvePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding() {
  const baseAudit = base.auditPublicUiCapabilityBinding();
  const errors = [...(baseAudit.errors ?? [])];
  let cases = 0;
  for (const sourceId of P09_MIXED21_TARGET_SOURCE_IDS) {
    const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
    const mixed = mixedBinding({
      sourceId,
      selectionMode: MIXED,
      selectedKnowledgePointIds: rows.slice(0, 2).map((row) => row.knowledgePointId),
    });
    cases += 1;
    if (!mixed
      || mixed.blocked
      || mixed.sameUnitMixedAdmission !== true
      || mixed.selectedKnowledgePointIds.length !== 2
      || !mixed.availableSelectionModes.find((option) => option.value === MIXED && option.enabled === true)) {
      errors.push(`P09_MIXED21_CAPABILITY_BINDING_INVALID:${sourceId}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    caseCount: Number(baseAudit.caseCount ?? 0) + cases,
    errors: Object.freeze(errors),
    baseAuditCaseCount: Number(baseAudit.caseCount ?? 0),
    p09Mixed21AuditCaseCount: cases,
  });
}
