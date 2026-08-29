import { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES, auditPublicUiCapabilityBinding as auditBase, resolvePublicUiCapabilityBinding as resolveBase } from "./public-ui-capability-binding-p04f26.js";
import { G4A_U06_P04F27_SOURCE_ID, G4A_U06_P04F27_KP_ID } from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-p04f27-extension.js";
export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };
function binding(input = {}) {
  if (input.sourceId !== G4A_U06_P04F27_SOURCE_ID) return null;
  const mode = input.selectionMode ?? "sourceUnit";
  if (mode !== "singleKnowledgePoint" || !(input.selectedKnowledgePointIds ?? []).includes(G4A_U06_P04F27_KP_ID)) return null;
  const groups = getVisiblePatternGroupsForKnowledgePoint(G4A_U06_P04F27_KP_ID);
  if (groups.length !== 1) return null;
  return Object.freeze({
    sourceId: G4A_U06_P04F27_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: mode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: "sourceUnit", enabled: true }),
      Object.freeze({ value: "singleKnowledgePoint", enabled: true }),
      Object.freeze({ value: "mixedKnowledgePointsSameUnit", enabled: false }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze([G4A_U06_P04F27_KP_ID]),
    selectedKnowledgePointCount: 1,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "application", label: "應用題" })]),
    questionType: "application",
    compatiblePatternGroups: Object.freeze(groups.map((group) => Object.freeze({ ...group, knowledgePointId: G4A_U06_P04F27_KP_ID, knowledgePointDisplayName: "分數量乘以整數倍", effectiveQuestionType: "application", uiQuestionType: "application", displayLabel: group.displayName, selected: true }))),
    compatiblePatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    selectedCompatiblePatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    depthOptions: Object.freeze([]), contextOptions: Object.freeze([]), depthMode: null, contextMode: null,
    questionCount: Object.freeze({ min: 1, max: 24, default: 8 }),
    capacityStatus: "STRUCTURAL_CAPACITY_PROVEN_24_Q027",
    capacityRegistryStatus: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P04F27_G4A_U06_APPLICATION_REQUIRED"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false, blockedReasons: Object.freeze([]), operatorApprovedExtension: false, globalContextEnabled: false,
  });
}
export function resolvePublicUiCapabilityBinding(input = {}) { return binding(input) ?? resolveBase(input); }
export function auditPublicUiCapabilityBinding() {
  const base = auditBase();
  const errors = [...(base.errors ?? [])];
  let cases = 0;
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    const candidate = binding({ sourceId: G4A_U06_P04F27_SOURCE_ID, surfaceId, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID] });
    cases += 1;
    if (!candidate || candidate.blocked || candidate.questionType !== "application" || candidate.questionCount.max !== 24 || candidate.compatiblePatternGroupIds.length !== 1) errors.push(`P04F27_G4A_U06_BINDING_INVALID:${surfaceId}`);
  }
  return Object.freeze({ ok: errors.length === 0, caseCount: Number(base.caseCount ?? 0) + cases, errors: Object.freeze(errors), baseAuditCaseCount: Number(base.caseCount ?? 0), p04f27AuditCaseCount: cases });
}
