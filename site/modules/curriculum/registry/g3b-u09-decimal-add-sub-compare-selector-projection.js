export const G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID = "g3b_u09_3b09";
export const G3B_U09_DECIMAL_ARITHMETIC_UNIT_CODE = "3B-U09";
export const G3B_U09_DECIMAL_ARITHMETIC_UNIT_TITLE = "小數";

export const G3B_U09_DECIMAL_ADD_SUB_KP_ID = "kp_g3b_u09_decimal_add_sub";
export const G3B_U09_DECIMAL_COMPARE_KP_ID = "kp_g3b_u09_decimal_compare";
export const G3B_U09_DECIMAL_ADD_SUB_GROUP_ID = "pg_g3b_u09_decimal_add_sub_numeric";
export const G3B_U09_DECIMAL_COMPARE_GROUP_ID = "pg_g3b_u09_decimal_compare_numeric";
export const G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3b_u09_decimal_add",
  "ps_g3b_u09_decimal_sub",
]);
export const G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g3b_u09_decimal_compare",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U09_DECIMAL_ARITHMETIC_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G3B_U09_DECIMAL_ADD_SUB_GROUP_ID,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    unitCode: G3B_U09_DECIMAL_ARITHMETIC_UNIT_CODE,
    unitTitle: G3B_U09_DECIMAL_ARITHMETIC_UNIT_TITLE,
    displayName: "一位小數加減",
    primaryKnowledgePointId: G3B_U09_DECIMAL_ADD_SUB_KP_ID,
    knowledgePointIds: [G3B_U09_DECIMAL_ADD_SUB_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "one_decimal_add_sub",
    representationTags: ["decimal", "tenths", "add_sub"],
    patternSpecIds: G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G3B_U09_DECIMAL_COMPARE_GROUP_ID,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    unitCode: G3B_U09_DECIMAL_ARITHMETIC_UNIT_CODE,
    unitTitle: G3B_U09_DECIMAL_ARITHMETIC_UNIT_TITLE,
    displayName: "一位小數比較",
    primaryKnowledgePointId: G3B_U09_DECIMAL_COMPARE_KP_ID,
    knowledgePointIds: [G3B_U09_DECIMAL_COMPARE_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "one_decimal_compare",
    representationTags: ["decimal", "tenths", "compare"],
    patternSpecIds: G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G3B_U09_DECIMAL_ARITHMETIC_KNOWLEDGE_POINT_ROWS = freeze([
  {
    knowledgePointId: G3B_U09_DECIMAL_ADD_SUB_KP_ID,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    unitCode: G3B_U09_DECIMAL_ARITHMETIC_UNIT_CODE,
    unitTitle: G3B_U09_DECIMAL_ARITHMETIC_UNIT_TITLE,
    displayName: "一位小數加減",
    canonicalNameZh: "一位小數加減",
    mode: "numeric", questionMode: "numeric", supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G3B_U09_DECIMAL_ADD_SUB_GROUP_ID],
    canonicalPatternSpecIds: G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
    patternGroupIds: [G3B_U09_DECIMAL_ADD_SUB_GROUP_ID],
    patternSpecIds: G3B_U09_DECIMAL_ADD_SUB_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F16_SLICE016_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice016_candidate",
  },
  {
    knowledgePointId: G3B_U09_DECIMAL_COMPARE_KP_ID,
    sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
    unitCode: G3B_U09_DECIMAL_ARITHMETIC_UNIT_CODE,
    unitTitle: G3B_U09_DECIMAL_ARITHMETIC_UNIT_TITLE,
    displayName: "一位小數比較",
    canonicalNameZh: "一位小數比較",
    mode: "numeric", questionMode: "numeric", supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G3B_U09_DECIMAL_COMPARE_GROUP_ID],
    canonicalPatternSpecIds: G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
    patternGroupIds: [G3B_U09_DECIMAL_COMPARE_GROUP_ID],
    patternSpecIds: G3B_U09_DECIMAL_COMPARE_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F16_SLICE016_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice016_candidate",
  },
]);

export const G3B_U09_DECIMAL_ARITHMETIC_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice016Implementation",
  sourceId: G3B_U09_DECIMAL_ARITHMETIC_SOURCE_ID,
  status: "TWO_W3_DECIMAL_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 2,
  patternGroupCount: 2,
  patternSpecCount: 3,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationExpansionAllowed: false,
  sourceEvidence: {
    authorityPath: "data/curriculum/knowledge/units/g3b_u09_3b09.knowledge-operation.json",
    addSubEvidencePages: [1, 2],
    compareEvidencePages: [1],
  },
});

export function listG3BU09DecimalArithmeticSelectorRows() { return clone(G3B_U09_DECIMAL_ARITHMETIC_KNOWLEDGE_POINT_ROWS); }
export function getG3BU09DecimalArithmeticSelectorRow(id) { return clone(G3B_U09_DECIMAL_ARITHMETIC_KNOWLEDGE_POINT_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG3BU09DecimalArithmeticPatternGroups(id) { return clone(G3B_U09_DECIMAL_ARITHMETIC_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG3BU09DecimalArithmeticPatternSpecIds(id) { return listG3BU09DecimalArithmeticPatternGroups(id).flatMap((group) => group.patternSpecIds); }
export function auditG3BU09DecimalArithmeticSelectorProjection() {
  const errors = [];
  if (G3B_U09_DECIMAL_ARITHMETIC_KNOWLEDGE_POINT_ROWS.length !== 2) errors.push("P03F16_KP_COUNT_INVALID");
  if (G3B_U09_DECIMAL_ARITHMETIC_PATTERN_GROUPS.length !== 2) errors.push("P03F16_GROUP_COUNT_INVALID");
  if (new Set(G3B_U09_DECIMAL_ARITHMETIC_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds)).size !== 3) errors.push("P03F16_PATTERN_COUNT_INVALID");
  if (G3B_U09_DECIMAL_ARITHMETIC_PATTERN_GROUPS.some((group) => group.publicQuestionMode !== "numeric")) errors.push("P03F16_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 2, patternSpecs: 3 }) });
}
