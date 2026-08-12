import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-p03f31.js";
import {
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  listG6BU01P03F32PatternGroups,
} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const uniqueStrings = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];

function g6bU01Slice032Binding(input = {}) {
  if (input.sourceId !== G6B_U01_P03F32_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  if (![SOURCE_UNIT_MODE, SINGLE_KP_MODE].includes(selectionMode)) return null;
  const selectedKnowledgePointIds = Object.freeze([G6B_U01_P03F32_KP_ID]);
  const compatiblePatternGroups = listG6BU01P03F32PatternGroups(G6B_U01_P03F32_KP_ID).map((group) => Object.freeze({
    ...group,
    knowledgePointId:G6B_U01_P03F32_KP_ID,
    knowledgePointDisplayName:"小數分數互換",
    effectiveQuestionType:"numeric",
    uiQuestionType:"numeric",
    displayLabel:group.displayName ?? "小數與分數互換",
    selected:true,
  }));
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId:G6B_U01_P03F32_SOURCE_ID,
    surfaceId:input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes:Object.freeze([
      Object.freeze({ value:SOURCE_UNIT_MODE, enabled:true }),
      Object.freeze({ value:SINGLE_KP_MODE, enabled:true }),
      Object.freeze({ value:"mixedKnowledgePointsSameUnit", enabled:false }),
      Object.freeze({ value:"mixedKnowledgePointsCrossUnit", enabled:false }),
    ]),
    selectedKnowledgePointIds,
    selectedKnowledgePointCount:1,
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
    capacityQualityStatuses:Object.freeze(["P03F32_G6B_U01_MIXED_DOMAIN_CONVERSION_STRUCTURAL_RUNTIME"]),
    capacityReconciliation:PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked:false,
    blockedReasons:Object.freeze([]),
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return g6bU01Slice032Binding(input) ?? resolveBasePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding() {
  const baseAudit = auditBasePublicUiCapabilityBinding();
  const errors = [...(baseAudit.errors ?? [])];
  let slice032CaseCount = 0;
  const cases = [
    { selectionMode:SOURCE_UNIT_MODE, selectedKnowledgePointIds:[] },
    { selectionMode:SINGLE_KP_MODE, selectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID] },
  ];
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    for (const input of cases) {
      const binding = g6bU01Slice032Binding({ sourceId:G6B_U01_P03F32_SOURCE_ID, surfaceId, ...input });
      slice032CaseCount += 1;
      if (!binding || binding.blocked || binding.questionType !== "numeric") errors.push(`P03F32_PUBLIC_BINDING_INVALID:${surfaceId}:${input.selectionMode}`);
      if (binding?.compatiblePatternGroupIds?.length !== 1 || binding?.selectedKnowledgePointIds?.[0] !== G6B_U01_P03F32_KP_ID) errors.push(`P03F32_PUBLIC_BINDING_IDENTITY_INVALID:${surfaceId}:${input.selectionMode}`);
      if (binding?.depthOptions?.length !== 0 || binding?.contextOptions?.length !== 0) errors.push(`P03F32_PUBLIC_BINDING_SCOPE_LEAK:${surfaceId}:${input.selectionMode}`);
    }
  }
  return Object.freeze({
    ok:errors.length===0,
    caseCount:Number(baseAudit.caseCount ?? 0) + slice032CaseCount,
    errors:Object.freeze(errors),
    baseAuditCaseCount:Number(baseAudit.caseCount ?? 0),
    slice032AuditCaseCount:slice032CaseCount,
  });
}
