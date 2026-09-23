import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-p03f32.js";
import {
  G4A_U06_P03F33_KP_IDS,
  G4A_U06_P03F33_SOURCE_ID,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p03f33-extension.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";
const SOURCE_UNIT_MODE = "sourceUnit";
const CROSS_UNIT_MIXED_MODE = "mixedKnowledgePointsCrossUnit";
const uniqueStrings = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];

function g4aU06Slice033Binding(input = {}) {
  if (input.sourceId !== G4A_U06_P03F33_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  if (![SINGLE_KP_MODE, SAME_UNIT_MIXED_MODE].includes(selectionMode)) return null;

  const visibleRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_P03F33_SOURCE_ID);
  const visibleIds = new Set(visibleRows.map((row) => row.knowledgePointId));
  const requestedIds = uniqueStrings(input.selectedKnowledgePointIds).filter((id) => visibleIds.has(id));
  if (requestedIds.length === 0 || !requestedIds.some((id) => G4A_U06_P03F33_KP_IDS.includes(id))) return null;

  const selectedKnowledgePointIds = selectionMode === SINGLE_KP_MODE ? [requestedIds[0]] : requestedIds;
  const requestedGroupIds = new Set(uniqueStrings(input.selectedPatternGroupIds));
  let compatiblePatternGroups = selectedKnowledgePointIds.flatMap((knowledgePointId) => {
    const row = visibleRows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
      effectiveQuestionType: "numeric",
      uiQuestionType: "numeric",
      displayLabel: group.displayName ?? row?.displayName ?? "數字題",
      selected: true,
    }));
  });
  if (requestedGroupIds.size > 0) {
    const requestedGroups = compatiblePatternGroups.filter((group) => requestedGroupIds.has(group.patternGroupId));
    if (requestedGroups.length > 0) compatiblePatternGroups = requestedGroups;
  }
  if (compatiblePatternGroups.length === 0) return null;

  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId: G4A_U06_P03F33_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value:SOURCE_UNIT_MODE, enabled:true }),
      Object.freeze({ value:SINGLE_KP_MODE, enabled:true }),
      Object.freeze({ value:SAME_UNIT_MIXED_MODE, enabled:selectedKnowledgePointIds.length >= 2 }),
      Object.freeze({ value:CROSS_UNIT_MIXED_MODE, enabled:false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedKnowledgePointIds),
    selectedKnowledgePointCount: selectedKnowledgePointIds.length,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value:"numeric", label:"數字題" })]),
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
    capacityQualityStatuses: Object.freeze(["P03F33_G4A_U06_RANK9_FRACTION_STRUCTURAL_RUNTIME"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return g4aU06Slice033Binding(input) ?? resolveBasePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding() {
  const baseAudit = auditBasePublicUiCapabilityBinding();
  const errors = [...(baseAudit.errors ?? [])];
  let slice033CaseCount = 0;
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    for (const knowledgePointId of G4A_U06_P03F33_KP_IDS) {
      const binding = g4aU06Slice033Binding({
        sourceId:G4A_U06_P03F33_SOURCE_ID,
        surfaceId,
        selectionMode:SINGLE_KP_MODE,
        selectedKnowledgePointIds:[knowledgePointId],
      });
      slice033CaseCount += 1;
      if (!binding || binding.blocked || binding.questionType !== "numeric") errors.push(`P03F33_PUBLIC_BINDING_INVALID:${surfaceId}:${knowledgePointId}`);
      if (binding?.selectedKnowledgePointIds?.[0] !== knowledgePointId || binding?.compatiblePatternGroupIds?.length !== 1) errors.push(`P03F33_PUBLIC_BINDING_IDENTITY_INVALID:${surfaceId}:${knowledgePointId}`);
      if (binding?.depthOptions?.length !== 0 || binding?.contextOptions?.length !== 0) errors.push(`P03F33_PUBLIC_BINDING_SCOPE_LEAK:${surfaceId}:${knowledgePointId}`);
    }
    const mixed = g4aU06Slice033Binding({
      sourceId:G4A_U06_P03F33_SOURCE_ID,
      surfaceId,
      selectionMode:SAME_UNIT_MIXED_MODE,
      selectedKnowledgePointIds:[...G4A_U06_P03F33_KP_IDS],
    });
    slice033CaseCount += 1;
    if (!mixed || mixed.blocked || mixed.selectedKnowledgePointCount !== 3 || mixed.compatiblePatternGroupIds.length !== 3) errors.push(`P03F33_PUBLIC_BINDING_MIXED_INVALID:${surfaceId}`);
  }
  return Object.freeze({
    ok:errors.length===0,
    caseCount:Number(baseAudit.caseCount ?? 0) + slice033CaseCount,
    errors:Object.freeze(errors),
    baseAuditCaseCount:Number(baseAudit.caseCount ?? 0),
    slice033AuditCaseCount:slice033CaseCount,
  });
}
