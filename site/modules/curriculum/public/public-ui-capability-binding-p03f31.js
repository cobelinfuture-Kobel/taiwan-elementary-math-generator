import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBasePublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding as resolveBasePublicUiCapabilityBinding,
} from "./public-ui-capability-binding-p03f30.js";
import {
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  listG5BU04P03F31PatternGroups,
} from "../registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };

const SOURCE_UNIT_MODE = "sourceUnit";
const SINGLE_KP_MODE = "singleKnowledgePoint";
const uniqueStrings = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];

function g5bU04Slice031Binding(input = {}) {
  if (input.sourceId !== G5B_U04_P03F31_SOURCE_ID) return null;
  const selectionMode = input.selectionMode ?? SOURCE_UNIT_MODE;
  if (![SOURCE_UNIT_MODE, SINGLE_KP_MODE].includes(selectionMode)) return null;
  const selectedKnowledgePointIds = Object.freeze([G5B_U04_P03F31_KP_ID]);
  const compatiblePatternGroups = listG5BU04P03F31PatternGroups(G5B_U04_P03F31_KP_ID).map((group) => Object.freeze({
    ...group,
    knowledgePointId: G5B_U04_P03F31_KP_ID,
    knowledgePointDisplayName: "小數乘以整數",
    effectiveQuestionType: "numeric",
    uiQuestionType: "numeric",
    displayLabel: group.displayName ?? "三位小數乘以整數",
    selected: true,
  }));
  const compatiblePatternGroupIds = uniqueStrings(compatiblePatternGroups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId: G5B_U04_P03F31_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE_UNIT_MODE, enabled: true }),
      Object.freeze({ value: SINGLE_KP_MODE, enabled: true }),
      Object.freeze({ value: "mixedKnowledgePointsSameUnit", enabled: false }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds,
    selectedKnowledgePointCount: 1,
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
    capacityQualityStatuses: Object.freeze(["P03F31_G5B_U04_DECIMAL_TIMES_INTEGER_STRUCTURAL_RUNTIME"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  return g5bU04Slice031Binding(input) ?? resolveBasePublicUiCapabilityBinding(input);
}

export function auditPublicUiCapabilityBinding() {
  const baseAudit = auditBasePublicUiCapabilityBinding();
  const errors = [...(baseAudit.errors ?? [])];
  let slice031CaseCount = 0;
  const cases = [
    { selectionMode:SOURCE_UNIT_MODE, selectedKnowledgePointIds:[] },
    { selectionMode:SINGLE_KP_MODE, selectedKnowledgePointIds:[G5B_U04_P03F31_KP_ID] },
  ];
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    for (const input of cases) {
      const binding = g5bU04Slice031Binding({ sourceId:G5B_U04_P03F31_SOURCE_ID, surfaceId, ...input });
      slice031CaseCount += 1;
      if (!binding || binding.blocked || binding.questionType !== "numeric") errors.push(`P03F31_PUBLIC_BINDING_INVALID:${surfaceId}:${input.selectionMode}`);
      if (binding?.compatiblePatternGroupIds?.length !== 1 || binding?.selectedKnowledgePointIds?.[0] !== G5B_U04_P03F31_KP_ID) errors.push(`P03F31_PUBLIC_BINDING_IDENTITY_INVALID:${surfaceId}:${input.selectionMode}`);
      if (binding?.depthOptions?.length !== 0 || binding?.contextOptions?.length !== 0) errors.push(`P03F31_PUBLIC_BINDING_SCOPE_LEAK:${surfaceId}:${input.selectionMode}`);
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    caseCount: Number(baseAudit.caseCount ?? 0) + slice031CaseCount,
    errors: Object.freeze(errors),
    baseAuditCaseCount: Number(baseAudit.caseCount ?? 0),
    slice031AuditCaseCount: slice031CaseCount,
  });
}
