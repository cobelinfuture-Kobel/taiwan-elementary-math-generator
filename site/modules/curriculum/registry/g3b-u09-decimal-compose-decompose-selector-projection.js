export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID = "kp_g3b_u09_decimal_compose_decompose";
export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID = "pg_g3b_u09_decimal_compose_decompose_numeric";
export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID = "ps_g3b_u09_decimal_compose_decompose_decimal_numeric";
export const G3B_U09_SOURCE_ID = "g3b_u09_3b09";
export const G3B_U09_UNIT_CODE = "3B-U09";
export const G3B_U09_UNIT_TITLE = "小數";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUPS = freeze([{
  patternGroupId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID,
  sourceId: G3B_U09_SOURCE_ID,
  unitCode: G3B_U09_UNIT_CODE,
  unitTitle: G3B_U09_UNIT_TITLE,
  displayName: "個位與十分位組成分解",
  primaryKnowledgePointId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  knowledgePointIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "decimal_compose_decompose",
  representationTags: ["whole_units", "tenths_units", "expanded_decimal_form", "place_value_tenths"],
  patternSpecIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID,
  sourceId: G3B_U09_SOURCE_ID,
  unitCode: G3B_U09_UNIT_CODE,
  unitTitle: G3B_U09_UNIT_TITLE,
  displayName: "個位與十分位組成分解",
  canonicalNameZh: "個位與十分位組成分解",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID],
  patternGroupIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUP_ID],
  patternSpecIds: [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F8_SLICE008_D0",
  productionUse: "full_product_w3_slice008_production",
}]);

export const G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice008Implementation",
  sourceId: G3B_U09_SOURCE_ID,
  status: "SECOND_G3B_U09_W3_KP_PUBLIC_D0_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
    "kp_g3b_u09_decimal_read_write",
    "kp_g3b_u09_decimal_compare",
    "kp_g3b_u09_decimal_add_sub",
    "kp_g3b_u09_length_decimal_conversion",
    "kp_g3b_u09_tenths_fraction_decimal",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG3BU09DecimalComposeDecomposeSelectorRows() { return clone(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KNOWLEDGE_POINT_ROWS); }
export function getG3BU09DecimalComposeDecomposeSelectorRow(knowledgePointId) {
  return knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID
    ? clone(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG3BU09DecimalComposeDecomposePatternGroups(knowledgePointId) {
  return knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID
    ? clone(G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUPS)
    : [];
}
export function resolveG3BU09DecimalComposeDecomposePatternSpecIds(knowledgePointId) {
  return knowledgePointId === G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KP_ID
    ? [G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_SPEC_ID]
    : [];
}
export function auditG3BU09DecimalComposeDecomposeSelectorProjection() {
  const errors = [];
  if (G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F8_KP_COUNT_INVALID");
  if (G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUPS.length !== 1) errors.push("P03F8_GROUP_COUNT_INVALID");
  if (G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F8_SPEC_COUNT_INVALID");
  if (G3B_U09_DECIMAL_COMPOSE_DECOMPOSE_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F8_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }) });
}
