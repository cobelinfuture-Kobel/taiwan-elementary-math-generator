export * from "./public-ui-capability-binding-p09-a02.js";
import {
  resolvePublicUiCapabilityBinding as baseResolve,
  auditPublicUiCapabilityBinding as baseAudit,
} from "./public-ui-capability-binding-p09-a02.js";
import {
  getP09A03BSourceRouteAlias,
  isP09A03BSourceRouteAlias,
} from "../registry/public-curriculum-source-route-aliases-p09-a03b.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../registry/batch-a-selector-p09-a03b-extension.js";

const G3A = "g3a_u08_3a08";
const unique = (values = []) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];

function sourceRows(sourceId) {
  return listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === sourceId);
}

function groupsFor(ids) {
  return [...new Map(ids.flatMap((id) => getVisiblePatternGroupsForKnowledgePoint(id))
    .map((group) => [group.patternGroupId, group])).values()];
}

function modeOptions({ sameUnitMixed = false } = {}) {
  return Object.freeze([
    Object.freeze({ value: "sourceUnit", label: "整個單元", enabled: true }),
    Object.freeze({ value: "singleKnowledgePoint", label: "單一知識點", enabled: true }),
    Object.freeze({ value: "mixedKnowledgePointsSameUnit", label: "同單元混合", enabled: sameUnitMixed }),
    Object.freeze({ value: "mixedKnowledgePointsCrossUnit", label: "跨單元混合", enabled: false }),
  ]);
}

function blocked(sourceId, selectionMode, selectedKnowledgePointIds, code) {
  return Object.freeze({
    sourceId,
    surfaceId: null,
    selectionMode,
    selectedKnowledgePointIds: Object.freeze([...selectedKnowledgePointIds]),
    selectedPatternGroupIds: Object.freeze([]),
    availableSelectionModes: modeOptions(),
    availableQuestionTypeOptions: Object.freeze([]),
    questionType: null,
    compatiblePatternGroups: Object.freeze([]),
    compatiblePatternGroupIds: Object.freeze([]),
    patternSpecIds: Object.freeze([]),
    questionCount: Object.freeze({ min: 1, max: 120, default: 20 }),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    blocked: true,
    blockedReasons: Object.freeze([code]),
    errors: Object.freeze([{ code, severity: "error" }]),
    warnings: Object.freeze([]),
    genericFallback: false,
    freeFormAI: false,
    sameUnitMixedAdmission: false,
    crossUnitMixedAdmission: false,
  });
}

function integratedBinding(sourceId, selectionMode, selectedKnowledgePointIds, { alias = null, surfaceId = null } = {}) {
  const allIds = sourceRows(sourceId).map((row) => row.knowledgePointId);
  const requested = unique(selectedKnowledgePointIds);
  const selected = selectionMode === "sourceUnit" ? allIds : requested.filter((id) => allIds.includes(id));
  if (selectionMode === "mixedKnowledgePointsSameUnit" && selected.length < 2) {
    return blocked(sourceId, selectionMode, selected, "P09_A03B_SAME_UNIT_MIX_REQUIRES_TWO_KPS");
  }
  if (selectionMode === "singleKnowledgePoint" && selected.length !== 1) {
    return blocked(sourceId, selectionMode, selected, "P09_A03B_SINGLE_KP_SELECTION_INVALID");
  }
  const groups = groupsFor(selected.length ? selected : allIds);
  const patternSpecIds = unique(groups.flatMap((group) => group.patternSpecIds ?? []));
  const g6Numeric = sourceId === "g6b_u02_6b02";
  const questionType = selectionMode === "singleKnowledgePoint"
    ? (sourceRows(sourceId).find((row) => row.knowledgePointId === selected[0])?.questionMode ?? "numeric")
    : (g6Numeric ? "numeric" : "mixed");
  return Object.freeze({
    sourceId,
    surfaceId,
    selectionMode,
    selectedKnowledgePointIds: Object.freeze(selected),
    selectedPatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    availableSelectionModes: modeOptions({ sameUnitMixed: sourceId === G3A }),
    availableQuestionTypeOptions: Object.freeze([
      Object.freeze({ value: questionType, label: questionType === "numeric" ? "數字題" : "混合題", enabled: true }),
    ]),
    questionType,
    compatiblePatternGroups: Object.freeze(groups),
    compatiblePatternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze(patternSpecIds),
    questionCount: Object.freeze({ min: 1, max: 120, default: 20 }),
    depthOptions: Object.freeze([]),
    contextOptions: Object.freeze([]),
    blocked: false,
    blockedReasons: Object.freeze([]),
    errors: Object.freeze([]),
    warnings: Object.freeze([]),
    genericFallback: false,
    freeFormAI: false,
    sameUnitMixedAdmission: sourceId === G3A,
    crossUnitMixedAdmission: false,
    sharedRuntimeScope: "SHARED_RUNTIME_BOUNDED",
    p09A03BPublicCurriculumRoute: true,
    semanticOwnerSourceId: alias?.semanticOwnerSourceId ?? null,
  });
}

function aliasSingle(input, alias) {
  const selected = unique(input.selectedKnowledgePointIds ?? input.knowledgePointIds ?? []);
  if (selected.length !== 1 || !alias.knowledgePointIds.includes(selected[0])) {
    return blocked(alias.sourceId, "singleKnowledgePoint", selected, "P09_A03B_ALIAS_KP_NOT_IN_SOURCE");
  }
  const owner = baseResolve({
    ...input,
    sourceId: alias.semanticOwnerSourceId,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: selected,
  });
  if (!owner || owner.blocked) {
    return blocked(alias.sourceId, "singleKnowledgePoint", selected, "P09_A03B_ALIAS_OWNER_BINDING_BLOCKED");
  }
  return Object.freeze({
    ...owner,
    sourceId: alias.sourceId,
    surfaceId: input.surfaceId ?? owner.surfaceId ?? null,
    availableSelectionModes: modeOptions(),
    questionCount: Object.freeze({
      min: Math.max(1, Number(owner.questionCount?.min ?? 1)),
      max: Math.min(120, Number(owner.questionCount?.max ?? 120)),
      default: Math.min(20, Number(owner.questionCount?.default ?? 20)),
    }),
    blocked: false,
    blockedReasons: Object.freeze([]),
    errors: Object.freeze([]),
    sameUnitMixedAdmission: false,
    crossUnitMixedAdmission: false,
    p09A03BPublicCurriculumRoute: true,
    sourceRouteAlias: true,
    semanticOwnerSourceId: alias.semanticOwnerSourceId,
  });
}

export function resolvePublicUiCapabilityBinding(input = {}) {
  if (isP09A03BSourceRouteAlias(input.sourceId)) {
    const alias = getP09A03BSourceRouteAlias(input.sourceId);
    const mode = input.selectionMode ?? "sourceUnit";
    if (mode === "singleKnowledgePoint") return aliasSingle(input, alias);
    if (mode === "sourceUnit") return integratedBinding(alias.sourceId, mode, [], { alias, surfaceId: input.surfaceId });
    return blocked(alias.sourceId, mode, unique(input.selectedKnowledgePointIds), "P09_A03B_ALIAS_MIXED_NOT_ADMITTED");
  }
  if (input.sourceId === G3A && ["sourceUnit", "mixedKnowledgePointsSameUnit"].includes(input.selectionMode ?? "sourceUnit")) {
    return integratedBinding(G3A, input.selectionMode ?? "sourceUnit", input.selectedKnowledgePointIds, { surfaceId: input.surfaceId });
  }
  return baseResolve(input);
}

export function auditPublicUiCapabilityBinding() {
  const base = baseAudit();
  const errors = [];
  if (base && !base.ok) errors.push(...base.errors.map((entry) => `P09_A03B_BASE:${entry}`));
  for (const sourceId of ["g4b_u03_4b03", "g6b_u02_6b02"]) {
    const sourceUnit = resolvePublicUiCapabilityBinding({ sourceId, selectionMode: "sourceUnit" });
    if (sourceUnit.blocked || sourceUnit.selectedKnowledgePointIds.length === 0) {
      errors.push(`P09_A03B_ALIAS_SOURCE_UNIT_BINDING_INVALID:${sourceId}`);
    }
  }
  const g3a = resolvePublicUiCapabilityBinding({ sourceId: G3A, selectionMode: "sourceUnit" });
  if (g3a.blocked || g3a.selectedKnowledgePointIds.length !== 7 || g3a.sameUnitMixedAdmission !== true) {
    errors.push("P09_A03B_G3A_U08_SOURCE_UNIT_BINDING_INVALID");
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    publicCurriculumUnitCount: 78,
    canonicalUniqueKnowledgePointCount: 482,
    sourceKnowledgePointRouteProjectionCount: 493,
  });
}
