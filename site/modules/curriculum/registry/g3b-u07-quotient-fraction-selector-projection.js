export const G3B_U07_SOURCE_ID = "g3b_u07_3b07";
export const G3B_U07_UNIT_CODE = "3B-U07";
export const G3B_U07_UNIT_TITLE = "分數的加減";
export const G3B_U07_QUOTIENT_FRACTION_KP_ID = "kp_g3b_u07_quotient_as_fraction";
export const G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID = "pg_g3b_u07_quotient_as_fraction_numeric";
export const G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID = "ps_g3b_u07_quotient_as_fraction_quotient_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUPS = freeze([{
  patternGroupId: G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  sourceId: G3B_U07_SOURCE_ID,
  unitCode: G3B_U07_UNIT_CODE,
  unitTitle: G3B_U07_UNIT_TITLE,
  displayName: "除法結果的分數表示",
  primaryKnowledgePointId: G3B_U07_QUOTIENT_FRACTION_KP_ID,
  knowledgePointIds: [G3B_U07_QUOTIENT_FRACTION_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "quotient_as_fraction",
  representationTags: ["division_expression", "fraction_notation"],
  patternSpecIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G3B_U07_QUOTIENT_FRACTION_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3B_U07_QUOTIENT_FRACTION_KP_ID,
  sourceId: G3B_U07_SOURCE_ID,
  unitCode: G3B_U07_UNIT_CODE,
  unitTitle: G3B_U07_UNIT_TITLE,
  displayName: "除法結果的分數表示",
  canonicalNameZh: "除法結果的分數表示",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID],
  patternGroupIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID],
  patternSpecIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F3_SLICE003_D0",
  productionUse: "full_product_w3_slice003_production",
}]);

export const G3B_U07_QUOTIENT_FRACTION_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice003Implementation",
  sourceId: G3B_U07_SOURCE_ID,
  status: "ONE_W3_KP_PUBLIC_D0_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
    "kp_g3b_u07_fraction_unit_conversion",
    "kp_g3b_u07_same_denominator_compare",
    "kp_g3b_u07_same_denominator_add_sub",
    "kp_g3b_u07_whole_and_fraction_add_sub",
    "kp_g3b_u07_combined_fraction_context",
    "kp_g3b_u07_fraction_plus_count_context",
    "kp_g3b_u07_original_or_difference_context",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG3BU07QuotientFractionSelectorRows() { return clone(G3B_U07_QUOTIENT_FRACTION_KNOWLEDGE_POINT_ROWS); }
export function getG3BU07QuotientFractionSelectorRow(knowledgePointId) {
  return knowledgePointId === G3B_U07_QUOTIENT_FRACTION_KP_ID
    ? clone(G3B_U07_QUOTIENT_FRACTION_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG3BU07QuotientFractionPatternGroups(knowledgePointId) {
  return knowledgePointId === G3B_U07_QUOTIENT_FRACTION_KP_ID
    ? clone(G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUPS)
    : [];
}
export function resolveG3BU07QuotientFractionPatternSpecIds(knowledgePointId) {
  return knowledgePointId === G3B_U07_QUOTIENT_FRACTION_KP_ID
    ? [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID]
    : [];
}
export function auditG3BU07QuotientFractionSelectorProjection() {
  const errors = [];
  if (G3B_U07_QUOTIENT_FRACTION_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F3_KP_COUNT_INVALID");
  if (G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUPS.length !== 1) errors.push("P03F3_GROUP_COUNT_INVALID");
  if (G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F3_SPEC_COUNT_INVALID");
  if (G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F3_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }) });
}
