import { G4A_U09_DECIMAL_COMPOSE_SOURCE_ID } from "./g4a-u09-decimal-compose-decompose-selector-projection.js";

export const P03F26_TASK_ID = "P03F_W3DirectProductVerticalSlice026Implementation";
export const G4A_U09_P03F26_SOURCE_ID = G4A_U09_DECIMAL_COMPOSE_SOURCE_ID;
export const G4A_U09_P03F26_UNIT_CODE = "4A-U09";
export const G4A_U09_P03F26_UNIT_TITLE = "2位小數";

export const G4A_U09_P03F26_KP_IDS = Object.freeze([
  "kp_g4a_u09_decimal_compare",
  "kp_g4a_u09_decimal_sequence",
  "kp_g4a_u09_missing_digit_column_operation",
  "kp_g4a_u09_place_value_factor_relation",
]);

export const G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4a_u09_decimal_compare_comparison_numeric",
  "ps_g4a_u09_decimal_sequence_term_numeric",
  "ps_g4a_u09_missing_digit_column_operation_missing_digits_numeric",
  "ps_g4a_u09_place_value_factor_relation_higher_place_value_numeric",
  "ps_g4a_u09_place_value_factor_relation_lower_place_value_numeric",
]);
export const G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID = "ps_g4a_u09_decimal_compare_comparison_application";

const SPEC_BY_KP = Object.freeze({
  kp_g4a_u09_decimal_compare: Object.freeze(["ps_g4a_u09_decimal_compare_comparison_numeric"]),
  kp_g4a_u09_decimal_sequence: Object.freeze(["ps_g4a_u09_decimal_sequence_term_numeric"]),
  kp_g4a_u09_missing_digit_column_operation: Object.freeze(["ps_g4a_u09_missing_digit_column_operation_missing_digits_numeric"]),
  kp_g4a_u09_place_value_factor_relation: Object.freeze([
    "ps_g4a_u09_place_value_factor_relation_higher_place_value_numeric",
    "ps_g4a_u09_place_value_factor_relation_lower_place_value_numeric",
  ]),
});
const GROUP_BY_KP = Object.freeze({
  kp_g4a_u09_decimal_compare: "pg_g4a_u09_decimal_compare_numeric",
  kp_g4a_u09_decimal_sequence: "pg_g4a_u09_decimal_sequence_numeric",
  kp_g4a_u09_missing_digit_column_operation: "pg_g4a_u09_missing_digit_column_operation_numeric",
  kp_g4a_u09_place_value_factor_relation: "pg_g4a_u09_place_value_factor_relation_numeric",
});
const NAME_BY_KP = Object.freeze({
  kp_g4a_u09_decimal_compare: "二位小數比較",
  kp_g4a_u09_decimal_sequence: "小數數列規律",
  kp_g4a_u09_missing_digit_column_operation: "小數直式缺位推理",
  kp_g4a_u09_place_value_factor_relation: "相鄰小數位值倍數關係",
});
const CLASS_BY_KP = Object.freeze({
  kp_g4a_u09_decimal_compare: "APPLICATION_COMPATIBLE",
  kp_g4a_u09_decimal_sequence: "APPLICATION_NOT_APPLICABLE",
  kp_g4a_u09_missing_digit_column_operation: "APPLICATION_NOT_APPLICABLE",
  kp_g4a_u09_place_value_factor_relation: "APPLICATION_NOT_APPLICABLE",
});
const TAG_BY_KP = Object.freeze({
  kp_g4a_u09_decimal_compare: "two_decimal_compare",
  kp_g4a_u09_decimal_sequence: "decimal_sequence",
  kp_g4a_u09_missing_digit_column_operation: "missing_column_digit",
  kp_g4a_u09_place_value_factor_relation: "place_value_factor",
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4A_U09_P03F26_PATTERN_GROUPS = freeze(G4A_U09_P03F26_KP_IDS.map((knowledgePointId) => ({
  patternGroupId: GROUP_BY_KP[knowledgePointId],
  sourceId: G4A_U09_P03F26_SOURCE_ID,
  unitCode: G4A_U09_P03F26_UNIT_CODE,
  unitTitle: G4A_U09_P03F26_UNIT_TITLE,
  displayName: NAME_BY_KP[knowledgePointId],
  primaryKnowledgePointId: knowledgePointId,
  knowledgePointIds: [knowledgePointId],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: TAG_BY_KP[knowledgePointId],
  representationTags: ["decimal", "hundredths", TAG_BY_KP[knowledgePointId]],
  patternSpecIds: SPEC_BY_KP[knowledgePointId],
  allocationPolicy: SPEC_BY_KP[knowledgePointId].length === 1 ? "single_pattern_spec" : "balanced_by_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
})));

export const G4A_U09_P03F26_SELECTOR_ROWS = freeze(G4A_U09_P03F26_KP_IDS.map((knowledgePointId) => ({
  knowledgePointId,
  sourceId: G4A_U09_P03F26_SOURCE_ID,
  unitCode: G4A_U09_P03F26_UNIT_CODE,
  unitTitle: G4A_U09_P03F26_UNIT_TITLE,
  displayName: NAME_BY_KP[knowledgePointId],
  canonicalNameZh: NAME_BY_KP[knowledgePointId],
  mode: "numeric",
  questionMode: "numeric",
  questionModes: ["numeric"],
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: CLASS_BY_KP[knowledgePointId],
  canonicalPatternGroupIds: [GROUP_BY_KP[knowledgePointId]],
  canonicalPatternSpecIds: SPEC_BY_KP[knowledgePointId],
  patternGroupIds: [GROUP_BY_KP[knowledgePointId]],
  patternSpecIds: SPEC_BY_KP[knowledgePointId],
  qaStatusLabel: "P03F26_SLICE026_AUTHORITY_FROZEN",
  productionUse: "full_product_w3_slice026_candidate",
})));

export const G4A_U09_P03F26_SELECTOR_PROJECTION = freeze({
  taskId: P03F26_TASK_ID,
  sourceId: G4A_U09_P03F26_SOURCE_ID,
  status: "FOUR_RANK8_DECIMAL_KPS_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 4,
  patternGroupCount: 4,
  patternSpecCount: 5,
  numericPatternSpecCount: 5,
  applicationPatternSpecCount: 0,
  hiddenApplicationPatternSpecIds: [G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 6,
  expectedSourceHiddenCountAfterAdmission: 2,
  expectedPublicSourceCountAfterAdmission: 29,
  expectedPublicKnowledgePointCountAfterAdmission: 216,
});

export function listG4AU09P03F26SelectorRows() { return clone(G4A_U09_P03F26_SELECTOR_ROWS); }
export function getG4AU09P03F26SelectorRow(id) { return clone(G4A_U09_P03F26_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4AU09P03F26PatternGroups(id) { return clone(G4A_U09_P03F26_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG4AU09P03F26PatternSpecIds(id) { return clone(SPEC_BY_KP[id] ?? []); }
export function auditG4AU09P03F26SelectorProjection() {
  const errors = [];
  if (G4A_U09_P03F26_SELECTOR_ROWS.length !== 4) errors.push("P03F26_KP_COUNT_INVALID");
  if (G4A_U09_P03F26_PATTERN_GROUPS.length !== 4) errors.push("P03F26_GROUP_COUNT_INVALID");
  if (G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS.length !== 5 || new Set(G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS).size !== 5) errors.push("P03F26_SPEC_COUNT_INVALID");
  if (G4A_U09_P03F26_PATTERN_GROUPS.some((group) => group.publicQuestionMode !== "numeric")) errors.push("P03F26_APPLICATION_MODE_LEAK");
  if (G4A_U09_P03F26_SELECTOR_ROWS.some((row) => row.patternSpecIds.includes(G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID))) errors.push("P03F26_HIDDEN_APPLICATION_SPEC_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 4, patternGroups: 4, patternSpecs: 5, numeric: 5, application: 0 }) });
}
