export const G4A_U09_SOURCE_ID = "g4a_u09_4a09";
export const G4A_U09_UNIT_CODE = "4A-U09";
export const G4A_U09_UNIT_TITLE = "2位小數";
export const G4A_U09_HUNDREDTH_DECIMAL_KP_ID = "kp_g4a_u09_hundredth_representation";
export const G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID = "pg_g4a_u09_hundredth_representation_numeric";
export const G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID = "ps_g4a_u09_hundredth_representation_decimal_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUPS = freeze([{
  patternGroupId: G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID,
  sourceId: G4A_U09_SOURCE_ID,
  unitCode: G4A_U09_UNIT_CODE,
  unitTitle: G4A_U09_UNIT_TITLE,
  displayName: "百分位與 0.01",
  primaryKnowledgePointId: G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  knowledgePointIds: [G4A_U09_HUNDREDTH_DECIMAL_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "hundredth_decimal_representation",
  representationTags: ["hundred_equal_parts", "decimal_notation", "place_value_hundredths"],
  patternSpecIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G4A_U09_HUNDREDTH_DECIMAL_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G4A_U09_HUNDREDTH_DECIMAL_KP_ID,
  sourceId: G4A_U09_SOURCE_ID,
  unitCode: G4A_U09_UNIT_CODE,
  unitTitle: G4A_U09_UNIT_TITLE,
  displayName: "百分位與 0.01",
  canonicalNameZh: "百分位與 0.01",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID],
  patternGroupIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUP_ID],
  patternSpecIds: [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F10_SLICE010_E4",
  productionUse: "full_product_w3_slice010_candidate",
}]);

export const G4A_U09_HUNDREDTH_DECIMAL_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice010Implementation",
  sourceId: G4A_U09_SOURCE_ID,
  status: "ONE_W3_KP_PUBLIC_CANDIDATE_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
    "kp_g4a_u09_decimal_compose_decompose",
    "kp_g4a_u09_decimal_compare",
    "kp_g4a_u09_decimal_sequence",
    "kp_g4a_u09_missing_digit_column_operation",
    "kp_g4a_u09_place_value_factor_relation",
    "kp_g4a_u09_missing_digit_inequality",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG4AU09HundredthDecimalSelectorRows() { return clone(G4A_U09_HUNDREDTH_DECIMAL_KNOWLEDGE_POINT_ROWS); }
export function getG4AU09HundredthDecimalSelectorRow(knowledgePointId) {
  return knowledgePointId === G4A_U09_HUNDREDTH_DECIMAL_KP_ID
    ? clone(G4A_U09_HUNDREDTH_DECIMAL_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG4AU09HundredthDecimalPatternGroups(knowledgePointId) {
  return knowledgePointId === G4A_U09_HUNDREDTH_DECIMAL_KP_ID
    ? clone(G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUPS)
    : [];
}
export function resolveG4AU09HundredthDecimalPatternSpecIds(knowledgePointId) {
  return knowledgePointId === G4A_U09_HUNDREDTH_DECIMAL_KP_ID
    ? [G4A_U09_HUNDREDTH_DECIMAL_PATTERN_SPEC_ID]
    : [];
}
export function auditG4AU09HundredthDecimalSelectorProjection() {
  const errors = [];
  if (G4A_U09_HUNDREDTH_DECIMAL_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F10_KP_COUNT_INVALID");
  if (G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUPS.length !== 1) errors.push("P03F10_GROUP_COUNT_INVALID");
  if (G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F10_SPEC_COUNT_INVALID");
  if (G4A_U09_HUNDREDTH_DECIMAL_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F10_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }) });
}
