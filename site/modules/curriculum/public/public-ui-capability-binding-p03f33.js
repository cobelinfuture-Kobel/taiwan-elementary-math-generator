import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-p03f32.js";
import {
  G4A_U06_P03F33_SOURCE_ID,
  P03F33_REQUIRED_CAPABILITY_IDS,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p03f33-extension.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const SAME_UNIT_MIXED_MODE = "mixedKnowledgePointsSameUnit";
const CROSS_UNIT_MIXED_MODE = "mixedKnowledgePointsCrossUnit";
const uniqueStrings = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];

function g4aU06Slice033Binding(input = {}) {
  if (input.sourceId !== G4A_U06_P03F33_SOURCE_ID) return null;
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_P03F33_SOURCE_ID);
  const allowedIds = sourceRows.map((row) => row.knowledgePointId);
  const requested = uniqueStrings(input.selectedKnowledgePointIds).filter((id) => allowedIds.includes(id));
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  if (![SOURCE_UNIT_MODE, SINGLE_KP_MODE, SAME_UNIT_MIXED_MODE].includes(selectionMode)) return null;
  const selectedKnowledgePointIds = selectionMode === SOURCE_UNIT_MODE
    ? allowedIds
    : selectionMode === SINGLE_KP_MODE
      ? [requested[0] ?? allowedIds[0]].filter(Boolean)
      : (requested.length > 0 ? requested : allowedIds);
  const requestedGroupIds = new Set(uniqueStrings(input.selectedPatternGroupIds));
  let compatiblePatternGroups = selectedKnowledgePointIds.flatMap((knowledgePointId) => {
    const row = sourceRows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName:row?.displayName ?? knowledgePointId,
      effectiveQuestionType:"numeric",
      uiQuestionType:"numeric",
      displayLabel:group.displayName ?? row?.displayName ?? "數字題",
      selected:true,
    }));
  });
  if (requestedGroupIds.size > 0) {
    const filtered = compatiblePatternGroups.filter((group) => requestedGroupIds.has(group.patternGroupId));
    if (filtered.length > 0) compatiblePatternGroups = filtered;
  }
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId:G4A_U06_P03F33_SOURCE_ID,
    surfaceId:input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes:Object.freeze([
      Object.freeze({ value:SOURCE_UNIT_MODE, enabled:true }),
      Object.freeze({ value:SINGLE_KP_MODE, enabled:true }),
      Object.freeze({ value:SAME_UNIT_MIXED_MODE, enabled:allowedIds.length >= 2 }),
      Object.freeze({ value:CROSS_UNIT_MIXED_MODE, enabled:false }),
    ]),
    selectedKnowledgePointIds:Object.freeze(selectedKnowledgePointIds),
    selectedKnowledgePointCount:selectedKnowledgePointIds.length,
    availableQuestionTypeOptions:Object.freeze([Object.freeze({ value:"numeric", label:"數字題" })]),
    questionType:"numeric",
    compatiblePatternGroups:Object.freeze(compatiblePatternGroups),
    compatiblePatternGroupIds:Object.freeze(compatiblePatternGroupIds),
    selectedCompatiblePatternGroupIds:Object.freeze(compatiblePatternGroupIds),
    depthOptions:Object.freeze([]),
    contextOptions:Object.freeze([]),
    depthMode:null,
    contextMode:null,
    questionCount:PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus:"STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus:PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds:Object.freeze([]),
    capacityQualityStatuses:Object.freeze(["P03F33_G4A_U06_FIVE_KP_FRACTION_UNION_STRUCTURAL_RUNTIME"]),
    capacityReconciliation:PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    requiredCapabilityIds:P03F33_REQUIRED_CAPABILITY_IDS,
    blocked:false,
    blockedReasons:Object.freeze([]),
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return g4aU06Slice033Binding(input) ?? resolveBasePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding() {
  const baseAudit = auditBasePublicUiCapabilityBinding();
  const errors = [...(baseAudit.errors ?? [])];
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_P03F33_SOURCE_ID);
  const allowedIds = sourceRows.map((row) => row.knowledgePointId);
  let slice033CaseCount = 0;
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    const sourceUnit = g4aU06Slice033Binding({ sourceId:G4A_U06_P03F33_SOURCE_ID, surfaceId, selectionMode:SOURCE_UNIT_MODE });
    slice033CaseCount += 1;
    if (!sourceUnit || sourceUnit.blocked || sourceUnit.selectedKnowledgePointIds.length !== 5 || sourceUnit.compatiblePatternGroupIds.length !== 5) errors.push(`P03F33_SOURCE_UNIT_BINDING_INVALID:${surfaceId}`);
    for (const knowledgePointId of allowedIds) {
      const single = g4aU06Slice033Binding({ sourceId:G4A_U06_P03F33_SOURCE_ID, surfaceId, selectionMode:SINGLE_KP_MODE, selectedKnowledgePointIds:[knowledgePointId] });
      slice033CaseCount += 1;
      if (!single || single.blocked || single.selectedKnowledgePointIds.length !== 1 || single.selectedKnowledgePointIds[0] !== knowledgePointId) errors.push(`P03F33_SINGLE_KP_BINDING_INVALID:${surfaceId}:${knowledgePointId}`);
    }
    const mixed = g4aU06Slice033Binding({ sourceId:G4A_U06_P03F33_SOURCE_ID, surfaceId, selectionMode:SAME_UNIT_MIXED_MODE, selectedKnowledgePointIds:allowedIds });
    slice033CaseCount += 1;
    if (!mixed || mixed.blocked || mixed.selectedKnowledgePointIds.length !== 5) errors.push(`P03F33_SAME_UNIT_MIXED_BINDING_INVALID:${surfaceId}`);
  }
  return Object.freeze({
    ok:errors.length===0,
    caseCount:Number(baseAudit.caseCount ?? 0) + slice033CaseCount,
    errors:Object.freeze(errors),
    baseAuditCaseCount:Number(baseAudit.caseCount ?? 0),
    slice033AuditCaseCount:slice033CaseCount,
  });
}
