export const G3B_U09_SOURCE_ID = "g3b_u09_3b09";
export const G3B_U09_UNIT_CODE = "3B-U09";
export const G3B_U09_UNIT_TITLE = "小數";
export const G3B_U09_TENTH_DECIMAL_KP_ID = "kp_g3b_u09_tenth_representation";
export const G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID = "pg_g3b_u09_tenth_representation_numeric";
export const G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID = "ps_g3b_u09_tenth_representation_decimal_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U09_TENTH_DECIMAL_PATTERN_GROUPS = freeze([{
  patternGroupId: G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID,
  sourceId: G3B_U09_SOURCE_ID,
  unitCode: G3B_U09_UNIT_CODE,
  unitTitle: G3B_U09_UNIT_TITLE,
  displayName: "十分位與 0.1",
  primaryKnowledgePointId: G3B_U09_TENTH_DECIMAL_KP_ID,
  knowledgePointIds: [G3B_U09_TENTH_DECIMAL_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "tenth_decimal_representation",
  representationTags: ["ten_equal_parts", "decimal_notation", "place_value_tenths"],
  patternSpecIds: [G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G3B_U09_TENTH_DECIMAL_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3B_U09_TENTH_DECIMAL_KP_ID,
  sourceId: G3B_U09_SOURCE_ID,
  unitCode: G3B_U09_UNIT_CODE,
  unitTitle: G3B_U09_UNIT_TITLE,
  displayName: "十分位與 0.1",
  canonicalNameZh: "十分位與 0.1",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: [G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID],
  patternGroupIds: [G3B_U09_TENTH_DECIMAL_PATTERN_GROUP_ID],
  patternSpecIds: [G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F4_SLICE004_D0",
  productionUse: "full_product_w3_slice004_production",
}]);

export const G3B_U09_TENTH_DECIMAL_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice004Implementation",
  sourceId: G3B_U09_SOURCE_ID,
  status: "ONE_W3_KP_PUBLIC_D0_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
    "kp_g3b_u09_decimal_read_write",
    "kp_g3b_u09_decimal_compose_decompose",
    "kp_g3b_u09_decimal_compare",
    "kp_g3b_u09_decimal_add_sub",
    "kp_g3b_u09_length_decimal_conversion",
    "kp_g3b_u09_tenths_fraction_decimal",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG3BU09TenthDecimalSelectorRows() { return clone(G3B_U09_TENTH_DECIMAL_KNOWLEDGE_POINT_ROWS); }
export function getG3BU09TenthDecimalSelectorRow(knowledgePointId) {
  return knowledgePointId === G3B_U09_TENTH_DECIMAL_KP_ID
    ? clone(G3B_U09_TENTH_DECIMAL_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG3BU09TenthDecimalPatternGroups(knowledgePointId) {
  return knowledgePointId === G3B_U09_TENTH_DECIMAL_KP_ID
    ? clone(G3B_U09_TENTH_DECIMAL_PATTERN_GROUPS)
    : [];
}
export function resolveG3BU09TenthDecimalPatternSpecIds(knowledgePointId) {
  return knowledgePointId === G3B_U09_TENTH_DECIMAL_KP_ID
    ? [G3B_U09_TENTH_DECIMAL_PATTERN_SPEC_ID]
    : [];
}
export function auditG3BU09TenthDecimalSelectorProjection() {
  const errors = [];
  if (G3B_U09_TENTH_DECIMAL_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F4_KP_COUNT_INVALID");
  if (G3B_U09_TENTH_DECIMAL_PATTERN_GROUPS.length !== 1) errors.push("P03F4_GROUP_COUNT_INVALID");
  if (G3B_U09_TENTH_DECIMAL_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F4_SPEC_COUNT_INVALID");
  if (G3B_U09_TENTH_DECIMAL_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F4_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }) });
}
