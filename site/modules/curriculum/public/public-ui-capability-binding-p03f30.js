import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding.js";
import {
  G5A_U04_P03F29_KP_ID,
  G5A_U04_P03F29_SOURCE_ID,
  listG5AU04P03F29PatternGroups,
} from "../registry/g5a-u04-rank8-fraction-selector-projection-p03f29.js";
import {
  G5A_U06_P03F30_SOURCE_ID,
  listG5AU06P03F30PatternGroups,
  listG5AU06P03F30SelectorRows,
} from "../registry/g5a-u06-rank8-fraction-selector-projection-p03f30.js";
import { listVisibleBatchAKnowledgePoints } from "../registry/batch-a-selector-p03f30-extension.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";
const CROSS_UNIT_MIXED_MODE = "mixedKnowledgePointsCrossUnit";
const uniqueStrings = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];

function structuralNumericBinding({ sourceId, surfaceId, selectionMode, selectedKnowledgePointIds, compatiblePatternGroups, capacityQualityStatus }) {
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId,
    surfaceId: surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: true }),
      Object.freeze({ value: SAME_UNIT_MIXED_MODE, enabled: selectedKnowledgePointIds.length >= 2 }),
      Object.freeze({ value: CROSS_UNIT_MIXED_MODE, enabled: false }),
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
    capacityRegistryStatus: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze([capacityQualityStatus]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

function g5aU04Slice029Binding(input = {}) {
  if (input.sourceId !== G5A_U04_P03F29_SOURCE_ID) return null;
  if ((input.selectionMode ?? SOURCE_UNIT_MODE) !== SINGLE_KP_MODE) return null;
  if (!uniqueStrings(input.selectedKnowledgePointIds).includes(G5A_U04_P03F29_KP_ID)) return null;
  const compatiblePatternGroups = listG5AU04P03F29PatternGroups(G5A_U04_P03F29_KP_ID).map((group) => Object.freeze({
    ...group,
    knowledgePointId: G5A_U04_P03F29_KP_ID,
    knowledgePointDisplayName: "通分後比較異分母分數",
    effectiveQuestionType: "numeric",
    uiQuestionType: "numeric",
    displayLabel: group.displayName ?? "通分後比較異分母分數",
    selected: true,
  }));
  return structuralNumericBinding({
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    surfaceId: input.surfaceId,
    selectionMode: SINGLE_KP_MODE,
    selectedKnowledgePointIds: [G5A_U04_P03F29_KP_ID],
    compatiblePatternGroups,
    capacityQualityStatus: "P03F29_G5A_U04_RANK8_COMPARE_STRUCTURAL_RUNTIME",
  });
}

function g5aU06CurrentBinding(input = {}) {
  if (input.sourceId !== G5A_U06_P03F30_SOURCE_ID) return null;
  const rows = listG5AU06P03F30SelectorRows();
  const allowedIds = rows.map((row) => row.knowledgePointId);
  const requested = uniqueStrings(input.selectedKnowledgePointIds).filter((id) => allowedIds.includes(id));
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  const selectedKnowledgePointIds = selectionMode === SINGLE_KP_MODE
    ? [requested[0] ?? allowedIds[0]].filter(Boolean)
    : selectionMode === SAME_UNIT_MIXED_MODE
      ? (requested.length > 0 ? requested : allowedIds)
      : allowedIds;
  const compatiblePatternGroups = selectedKnowledgePointIds.flatMap((knowledgePointId) => {
    const row = rows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return listG5AU06P03F30PatternGroups(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
      effectiveQuestionType: "numeric",
      uiQuestionType: "numeric",
      displayLabel: row?.displayName ?? group.displayName ?? "數字題",
      selected: true,
    }));
  });
  return structuralNumericBinding({
    sourceId: G5A_U06_P03F30_SOURCE_ID,
    surfaceId: input.surfaceId,
    selectionMode,
    selectedKnowledgePointIds,
    compatiblePatternGroups,
    capacityQualityStatus: "P03F30_G5A_U06_FOUR_KP_STRUCTURAL_RUNTIME",
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return g5aU04Slice029Binding(input)
    ?? g5aU06CurrentBinding(input)
    ?? resolveBasePublicUiCapabilityBinding(input);
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
        const single = resolvePublicUiCapabilityBinding({ sourceId, surfaceId, selectionMode: SINGLE_KP_MODE, selectedKnowledgePointIds: [kp.knowledgePointId] });
        caseCount += 1;
        if (single.blocked) errors.push(`${sourceId}|${surfaceId}|${kp.knowledgePointId}:${single.blockedReasons.join("|")}`);
      }
      if (visible.length >= 2) {
        const mixed = resolvePublicUiCapabilityBinding({ sourceId, surfaceId, selectionMode: SAME_UNIT_MIXED_MODE, selectedKnowledgePointIds: visible.map((kp) => kp.knowledgePointId) });
        caseCount += 1;
        if (mixed.blocked) errors.push(`${sourceId}|${surfaceId}|mixed:${mixed.blockedReasons.join("|")}`);
      }
    }
  }
  return Object.freeze({ ok: errors.length === 0, caseCount, errors: Object.freeze(errors) });
}
