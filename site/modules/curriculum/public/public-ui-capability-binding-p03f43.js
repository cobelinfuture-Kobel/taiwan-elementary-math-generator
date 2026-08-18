import {
  PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding as auditBase,
  resolvePublicUiCapabilityBinding as resolveBase,
} from "./public-ui-capability-binding-p03f42.js";
import { G4B_U08_P03F43_SOURCE_ID, P03F43_KP_IDS } from "../registry/g4b-u08-rank10-fraction-selector-projection-p03f43.js";
import { getVisiblePatternGroupsForKnowledgePoint, listVisibleBatchAKnowledgePoints } from "../registry/batch-a-selector-p03f43-extension.js";

export { PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION, PUBLIC_UI_SAFE_QUESTION_COUNT, PUBLIC_UI_SURFACES };
const SINGLE = "singleKnowledgePoint";
const MIXED = "mixedKnowledgePointsSameUnit";
const SOURCE = "sourceUnit";
const CROSS = "mixedKnowledgePointsCrossUnit";
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).map((value) => String(value ?? "").trim()).filter(Boolean))];
const isTarget = (id) => P03F43_KP_IDS.includes(id);

function slice043Binding(input = {}) {
  if (input.sourceId !== G4B_U08_P03F43_SOURCE_ID) return null;
  const mode = input.selectionMode ?? SOURCE;
  if (![SINGLE, MIXED].includes(mode)) return null;
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4B_U08_P03F43_SOURCE_ID);
  const visibleIds = new Set(rows.map((row) => row.knowledgePointId));
  const requested = unique(input.selectedKnowledgePointIds).filter((id) => visibleIds.has(id));
  if (!requested.some(isTarget)) return null;
  const selected = mode === SINGLE ? [requested.find(isTarget)] : requested;
  const requestedGroups = new Set(unique(input.selectedPatternGroupIds));
  let groups = selected.flatMap((knowledgePointId) => {
    const row = rows.find((entry) => entry.knowledgePointId === knowledgePointId);
    return getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.publicQuestionMode === "numeric" || group.mode === "numeric")
      .map((group) => Object.freeze({
        ...group,
        knowledgePointId,
        knowledgePointDisplayName: row?.displayName ?? knowledgePointId,
        effectiveQuestionType: "numeric",
        uiQuestionType: "numeric",
        displayLabel: group.displayName ?? row?.displayName ?? "數字題",
        selected: true,
      }));
  });
  if (requestedGroups.size) {
    const filtered = groups.filter((group) => requestedGroups.has(group.patternGroupId));
    if (filtered.some((group) => isTarget(group.knowledgePointId))) groups = filtered;
  }
  if (!groups.length) return null;
  const groupIds = unique(groups.map((group) => group.patternGroupId));
  return Object.freeze({
    sourceId: G4B_U08_P03F43_SOURCE_ID,
    surfaceId: input.surfaceId ?? PUBLIC_UI_SURFACES.CLASSIC,
    selectionMode: mode,
    availableSelectionModes: Object.freeze([
      Object.freeze({ value: SOURCE, enabled: true }),
      Object.freeze({ value: SINGLE, enabled: true }),
      Object.freeze({ value: MIXED, enabled: selected.length >= 2 }),
      Object.freeze({ value: CROSS, enabled: false }),
    ]),
    selectedKnowledgePointIds: Object.freeze(selected),
    selectedKnowledgePointCount: selected.length,
    availableQuestionTypeOptions: Object.freeze([Object.freeze({ value: "numeric", label: "數字題" })]),
    questionType: "numeric",
    compatiblePatternGroups: Object.freeze(groups),
    compatiblePatternGroupIds: Object.freeze(groupIds),
    selectedCompatiblePatternGroupIds: Object.freeze(groupIds),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    depthMode: null,
    contextMode: null,
    questionCount: PUBLIC_UI_SAFE_QUESTION_COUNT,
    capacityStatus: "STRUCTURAL_FALLBACK_AVAILABLE",
    capacityRegistryStatus: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION.registryStatus,
    capacityRouteIds: Object.freeze([]),
    capacityQualityStatuses: Object.freeze(["P03F43_G4B_U08_RANK10_TWO_KP_SHARED_RUNTIME"]),
    capacityReconciliation: PUBLIC_UI_RUNTIME_CAPACITY_RECONCILIATION,
    blocked: false,
    blockedReasons: Object.freeze([]),
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) { return slice043Binding(input) ?? resolveBase(input); }
export function auditPublicUiCapabilityBinding() {
  const base = auditBase();
  const errors = [...(base.errors ?? [])];
  let cases = 0;
  for (const targetId of P03F43_KP_IDS) {
    for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
      const binding = slice043Binding({ sourceId: G4B_U08_P03F43_SOURCE_ID, surfaceId, selectionMode: SINGLE, selectedKnowledgePointIds: [targetId] });
      cases += 1;
      if (!binding || binding.blocked || binding.questionType !== "numeric" || binding.selectedKnowledgePointIds[0] !== targetId || binding.compatiblePatternGroupIds.length !== 1 || binding.depthOptions.length || binding.contextOptions.length) errors.push(`P03F43_PUBLIC_BINDING_INVALID:${targetId}:${surfaceId}`);
    }
  }
  const mixed = slice043Binding({ sourceId: G4B_U08_P03F43_SOURCE_ID, surfaceId: PUBLIC_UI_SURFACES.CLASSIC, selectionMode: MIXED, selectedKnowledgePointIds: P03F43_KP_IDS });
  cases += 1;
  if (!mixed || mixed.blocked || mixed.selectedKnowledgePointCount !== 2 || mixed.compatiblePatternGroupIds.length !== 2) errors.push("P03F43_PUBLIC_BINDING_Q043_MIXED_INVALID");
  return Object.freeze({ ok: errors.length === 0, caseCount: Number(base.caseCount ?? 0) + cases, errors: Object.freeze(errors), baseAuditCaseCount: Number(base.caseCount ?? 0), slice043AuditCaseCount: cases });
}
