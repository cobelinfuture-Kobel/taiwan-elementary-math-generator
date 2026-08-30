import { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES, auditPublicUiCapabilityBinding as auditBase, resolvePublicUiCapabilityBinding as resolveBase } from "./public-ui-capability-binding-p04f26.js";
import { G4A_U06_P04F27_SOURCE_ID, G4A_U06_P04F27_KP_ID } from "../registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
import { getVisiblePatternGroupsForKnowledgePoint, listVisibleBatchAKnowledgePoints } from "../registry/batch-a-selector-p04f27-extension.js";
export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
function binding(input = {}) {
  if (input.sourceId !== G4A_U06_P04F27_SOURCE_ID) return null;
  const mode = input.selectionMode ?? "sourceUnit";
  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(mode)) return null;
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U06_P04F27_SOURCE_ID);
  const visibleIds = new Set(rows.map((row) => row.knowledgePointId));
  const requested = unique(input.selectedKnowledgePointIds).filter((id) => visibleIds.has(id));
  if (!requested.includes(G4A_U06_P04F27_KP_ID)) return null;
  const selectedIds = mode === "singleKnowledgePoint" ? [G4A_U06_P04F27_KP_ID] : requested;
  if (mode === "mixedKnowledgePointsSameUnit" && selectedIds.length < 2) return null;
  const mixed = selectedIds.length > 1;
  const groups = selectedIds.flatMap((knowledgePointId) => {
    const row = rows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId).map((group) => Object.freeze({
      ...group,
      knowledgePointId,
      knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
      effectiveQuestionType: mixed ? "mixed" : "application",
      uiQuestionType: mixed ? "mixed" : "application",
      displayLabel: group.displayName ?? row?.displayName ?? (mixed ? "數字題＋應用題" : "應用題"),
      selected: true,
    }));
  });
  if (groups.length < selectedIds.length) return null;
  const groupIds = unique(groups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId: G4A_U06_P04F27_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: mode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: "sourceUnit", enabled: true }),
      Object.freeze({ value: "singleKnowledgePoint", enabled: true }),
      Object.freeze({ value: "mixedKnowledgePointsSameUnit", enabled: rows.length >= 2 }),
      Object.freeze({ value: "mixedKnowledgePointsCrossUnit", enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selectedIds),
    selectedKnowledgePointCount: selectedIds.length,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: mixed ? "mixed" : "application", label: mixed ? "數字題＋應用題" : "應用題" })]),
    questionType: mixed ? "mixed" : "application",
    compatiblePatternGroups: Object.freeze(groups),
    compatiblePatternGroupIds: Object.freeze(groupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(groupIds),
    depthOptions: Object.freeze([]), contextOptions: Object.freeze([]), depthMode: null, contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: mixed ? "STRUCTURAL_CAPACITY_PROVEN_240_G4A_U06_MIXED" : "STRUCTURAL_CAPACITY_PROVEN_240_Q027",
    capacityRegistryStatus: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P04F27_G4A_U06_APPLICATION_REQUIRED"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false, blockedReasons: Object.freeze([]), operatorApprovedExtension: true, globalContextEnabled: false,
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
    if (!candidate || candidate.blocked || candidate.questionType !== "application" || candidate.questionCount.max !== 240 || candidate.compatiblePatternGroupIds.length !== 1) errors.push(`P04F27_G4A_U06_BINDING_INVALID:${surfaceId}`);
    const other = listVisibleBatchAKnowledgePoints().find((row) => row.sourceId === G4A_U06_P04F27_SOURCE_ID && row.knowledgePointId !== G4A_U06_P04F27_KP_ID);
    const mixed = binding({ sourceId: G4A_U06_P04F27_SOURCE_ID, surfaceId, selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID, other?.knowledgePointId] });
    cases += 1;
    if (!mixed || mixed.blocked || mixed.questionType !== "mixed" || mixed.questionCount.max !== 240 || mixed.selectedKnowledgePointCount !== 2) errors.push(`P04F27_G4A_U06_MIXED_BINDING_INVALID:${surfaceId}`);
  }
  return Object.freeze({ ok: errors.length === 0, caseCount: Number(base.caseCount ?? 0) + cases, errors: Object.freeze(errors), baseAuditCaseCount: Number(base.caseCount ?? 0), p04f27AuditCaseCount: cases });
}
