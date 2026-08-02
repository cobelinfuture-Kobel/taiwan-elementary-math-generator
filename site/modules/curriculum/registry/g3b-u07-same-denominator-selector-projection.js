export const G3B_U07_SAME_DENOMINATOR_SOURCE_ID = "g3b_u07_3b07";
export const G3B_U07_SAME_DENOMINATOR_UNIT_CODE = "3B-U07";
export const G3B_U07_SAME_DENOMINATOR_UNIT_TITLE = "分數的加減";

export const G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID = "kp_g3b_u07_same_denominator_add_sub";
export const G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID = "kp_g3b_u07_same_denominator_compare";

export const G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID = "pg_g3b_u07_same_denominator_add_sub_numeric";
export const G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID = "pg_g3b_u07_same_denominator_compare_numeric";

export const G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3b_u07_same_denominator_add",
  "ps_g3b_u07_same_denominator_sub",
]);
export const G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3b_u07_same_denominator_compare_fraction",
  "ps_g3b_u07_same_denominator_compare_whole_one",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U07_SAME_DENOMINATOR_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    unitCode: G3B_U07_SAME_DENOMINATOR_UNIT_CODE,
    unitTitle: G3B_U07_SAME_DENOMINATOR_UNIT_TITLE,
    displayName: "同分母分數加減",
    primaryKnowledgePointId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
    knowledgePointIds: [G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "same_denominator_fraction_add_sub",
    representationTags: ["fraction", "same_denominator", "add_sub"],
    patternSpecIds: G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    unitCode: G3B_U07_SAME_DENOMINATOR_UNIT_CODE,
    unitTitle: G3B_U07_SAME_DENOMINATOR_UNIT_TITLE,
    displayName: "同分母分數比較與整數改寫",
    primaryKnowledgePointId: G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
    knowledgePointIds: [G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "same_denominator_fraction_compare",
    representationTags: ["fraction", "same_denominator", "compare", "whole_one_rewrite"],
    patternSpecIds: G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G3B_U07_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS = freeze([
  {
    knowledgePointId: G3B_U07_SAME_DENOMINATOR_ADD_SUB_KP_ID,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    unitCode: G3B_U07_SAME_DENOMINATOR_UNIT_CODE,
    unitTitle: G3B_U07_SAME_DENOMINATOR_UNIT_TITLE,
    displayName: "同分母分數加減",
    canonicalNameZh: "同分母分數加減",
    mode: "numeric",
    questionMode: "numeric",
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID],
    canonicalPatternSpecIds: G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
    patternGroupIds: [G3B_U07_SAME_DENOMINATOR_ADD_SUB_GROUP_ID],
    patternSpecIds: G3B_U07_SAME_DENOMINATOR_ADD_SUB_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F15_SLICE015_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice015_candidate",
  },
  {
    knowledgePointId: G3B_U07_SAME_DENOMINATOR_COMPARE_KP_ID,
    sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
    unitCode: G3B_U07_SAME_DENOMINATOR_UNIT_CODE,
    unitTitle: G3B_U07_SAME_DENOMINATOR_UNIT_TITLE,
    displayName: "同分母分數比較與整數改寫",
    canonicalNameZh: "同分母分數比較與整數改寫",
    mode: "numeric",
    questionMode: "numeric",
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID],
    canonicalPatternSpecIds: G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
    patternGroupIds: [G3B_U07_SAME_DENOMINATOR_COMPARE_GROUP_ID],
    patternSpecIds: G3B_U07_SAME_DENOMINATOR_COMPARE_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F15_SLICE015_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice015_candidate",
  },
]);

export const G3B_U07_SAME_DENOMINATOR_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice015Implementation",
  sourceId: G3B_U07_SAME_DENOMINATOR_SOURCE_ID,
  status: "TWO_W3_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 2,
  patternGroupCount: 2,
  patternSpecCount: 4,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationExpansionAllowed: false,
  sourceEvidence: Object.freeze({
    authorityPath: "data/curriculum/knowledge/units/g3b_u07_3b07.knowledge-operation.json",
    addSubEvidencePages: Object.freeze([2, 3]),
    compareEvidencePages: Object.freeze([1, 3]),
  }),
});

export function listG3BU07SameDenominatorSelectorRows() { return clone(G3B_U07_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS); }
export function getG3BU07SameDenominatorSelectorRow(knowledgePointId) {
  return clone(G3B_U07_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS.find((row) => row.knowledgePointId === knowledgePointId) ?? null);
}
export function listG3BU07SameDenominatorPatternGroups(knowledgePointId) {
  return clone(G3B_U07_SAME_DENOMINATOR_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === knowledgePointId));
}
export function resolveG3BU07SameDenominatorPatternSpecIds(knowledgePointId) {
  return listG3BU07SameDenominatorPatternGroups(knowledgePointId).flatMap((group) => group.patternSpecIds);
}
export function auditG3BU07SameDenominatorSelectorProjection() {
  const errors = [];
  if (G3B_U07_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS.length !== 2) errors.push("P03F15_KP_COUNT_INVALID");
  if (G3B_U07_SAME_DENOMINATOR_PATTERN_GROUPS.length !== 2) errors.push("P03F15_GROUP_COUNT_INVALID");
  if (new Set(G3B_U07_SAME_DENOMINATOR_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds)).size !== 4) errors.push("P03F15_PATTERN_COUNT_INVALID");
  if (G3B_U07_SAME_DENOMINATOR_PATTERN_GROUPS.some((group) => group.publicQuestionMode !== "numeric")) errors.push("P03F15_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 2, patternSpecs: 4 }) });
}
