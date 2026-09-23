export const P03F30_TASK_ID = "P03F_W3DirectProductVerticalSlice030Implementation";
export const G5A_U06_P03F30_SOURCE_ID = "g5a_u06_5a06";
export const G5A_U06_P03F30_UNIT_CODE = "5A-U06";
export const G5A_U06_P03F30_UNIT_TITLE = "異分母分數加減";
export const P03F30_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

export const G5A_U06_P03F30_SURFACES = Object.freeze([
  Object.freeze({
    knowledgePointId: "kp_g5a_u06_reciprocal_unit_fraction_sum",
    displayName: "單位分數規律合計",
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    operationModelId: "op_g5a_u06_reciprocal_unit_fraction_sum",
    operationFamilyId: "reciprocal_sum",
    requestedUnknownRole: "sum",
    patternGroupId: "pg_g5a_u06_reciprocal_unit_fraction_sum_numeric",
    patternSpecId: "ps_g5a_u06_reciprocal_unit_fraction_sum_sum_numeric",
    hiddenApplicationPatternSpecId: null,
    representationTags: Object.freeze(["fraction", "unit_fraction", "reciprocal_sum", "exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g5a_u06_unlike_fraction_add",
    displayName: "異分母分數加法",
    applicationClassification: "APPLICATION_COMPATIBLE",
    operationModelId: "op_g5a_u06_unlike_fraction_add",
    operationFamilyId: "fraction_add_sub",
    requestedUnknownRole: "result",
    patternGroupId: "pg_g5a_u06_unlike_fraction_add_numeric",
    patternSpecId: "ps_g5a_u06_unlike_fraction_add_result_numeric",
    hiddenApplicationPatternSpecId: "ps_g5a_u06_unlike_fraction_add_result_application",
    representationTags: Object.freeze(["fraction", "common_denominator", "addition", "exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g5a_u06_unlike_fraction_compare",
    displayName: "異分母分數比較",
    applicationClassification: "APPLICATION_COMPATIBLE",
    operationModelId: "op_g5a_u06_unlike_fraction_compare",
    operationFamilyId: "fraction_compare",
    requestedUnknownRole: "comparison",
    patternGroupId: "pg_g5a_u06_unlike_fraction_compare_numeric",
    patternSpecId: "ps_g5a_u06_unlike_fraction_compare_comparison_numeric",
    hiddenApplicationPatternSpecId: "ps_g5a_u06_unlike_fraction_compare_comparison_application",
    representationTags: Object.freeze(["fraction", "common_denominator", "cross_product", "exact_rational"]),
  }),
  Object.freeze({
    knowledgePointId: "kp_g5a_u06_unlike_fraction_sub",
    displayName: "異分母分數減法",
    applicationClassification: "APPLICATION_COMPATIBLE",
    operationModelId: "op_g5a_u06_unlike_fraction_sub",
    operationFamilyId: "fraction_add_sub",
    requestedUnknownRole: "result",
    patternGroupId: "pg_g5a_u06_unlike_fraction_sub_numeric",
    patternSpecId: "ps_g5a_u06_unlike_fraction_sub_result_numeric",
    hiddenApplicationPatternSpecId: "ps_g5a_u06_unlike_fraction_sub_result_application",
    representationTags: Object.freeze(["fraction", "common_denominator", "subtraction", "exact_rational"]),
  }),
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

export const G5A_U06_P03F30_PATTERN_GROUPS = Object.freeze(G5A_U06_P03F30_SURFACES.map((surface) => Object.freeze({
  patternGroupId: surface.patternGroupId,
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  unitCode: G5A_U06_P03F30_UNIT_CODE,
  unitTitle: G5A_U06_P03F30_UNIT_TITLE,
  displayName: surface.displayName,
  primaryKnowledgePointId: surface.knowledgePointId,
  knowledgePointIds: Object.freeze([surface.knowledgePointId]),
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: surface.operationFamilyId,
  representationTags: surface.representationTags,
  patternSpecIds: Object.freeze([surface.patternSpecId]),
  allocationPolicy: "single_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
})));

export const G5A_U06_P03F30_SELECTOR_ROWS = Object.freeze(G5A_U06_P03F30_SURFACES.map((surface) => Object.freeze({
  knowledgePointId: surface.knowledgePointId,
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  unitCode: G5A_U06_P03F30_UNIT_CODE,
  unitTitle: G5A_U06_P03F30_UNIT_TITLE,
  displayName: surface.displayName,
  canonicalNameZh: surface.displayName,
  mode: "numeric",
  questionMode: "numeric",
  questionModes: Object.freeze(["numeric"]),
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: surface.applicationClassification,
  canonicalPatternGroupIds: Object.freeze([surface.patternGroupId]),
  canonicalPatternSpecIds: Object.freeze([surface.patternSpecId]),
  patternGroupIds: Object.freeze([surface.patternGroupId]),
  patternSpecIds: Object.freeze([surface.patternSpecId]),
  requiredCapabilityIds: P03F30_REQUIRED_CAPABILITY_IDS,
  hiddenApplicationPatternSpecIds: Object.freeze(surface.hiddenApplicationPatternSpecId ? [surface.hiddenApplicationPatternSpecId] : []),
  qaStatusLabel: "P03F30_SLICE030_AUTHORITY_FROZEN",
  productionUse: "full_product_w3_slice030_candidate",
})));

export const G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS = Object.freeze(G5A_U06_P03F30_SURFACES.map((surface) => surface.patternSpecId));
export const G5A_U06_P03F30_KP_IDS = Object.freeze(G5A_U06_P03F30_SURFACES.map((surface) => surface.knowledgePointId));
export const G5A_U06_P03F30_HIDDEN_APPLICATION_SPEC_IDS = Object.freeze(G5A_U06_P03F30_SURFACES.map((surface) => surface.hiddenApplicationPatternSpecId).filter(Boolean));

export const G5A_U06_P03F30_SELECTOR_PROJECTION = Object.freeze({
  taskId: P03F30_TASK_ID,
  sourceId: G5A_U06_P03F30_SOURCE_ID,
  status: "FOUR_RANK8_FRACTION_KPS_ADDED_AS_NEW_PUBLIC_SOURCE",
  knowledgePointCount: 4,
  patternGroupCount: 4,
  patternSpecCount: 4,
  numericPatternSpecCount: 4,
  applicationPatternSpecCount: 0,
  hiddenApplicationPatternSpecIds: G5A_U06_P03F30_HIDDEN_APPLICATION_SPEC_IDS,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 4,
  expectedSourceHiddenCountAfterAdmission: 3,
  expectedPublicSourceCountAfterAdmission: 30,
  expectedPublicKnowledgePointCountAfterAdmission: 224,
});

export function listG5AU06P03F30SelectorRows() { return clone(G5A_U06_P03F30_SELECTOR_ROWS); }
export function getG5AU06P03F30SelectorRow(id) { return clone(G5A_U06_P03F30_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG5AU06P03F30PatternGroups(id) { return clone(G5A_U06_P03F30_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG5AU06P03F30PatternSpecIds(id) { const row = G5A_U06_P03F30_SURFACES.find((surface) => surface.knowledgePointId === id); return row ? [row.patternSpecId] : []; }
export function auditG5AU06P03F30SelectorProjection() {
  const errors = [];
  if (G5A_U06_P03F30_SELECTOR_ROWS.length !== 4) errors.push("P03F30_KP_COUNT_INVALID");
  if (G5A_U06_P03F30_PATTERN_GROUPS.length !== 4) errors.push("P03F30_GROUP_COUNT_INVALID");
  if (new Set(G5A_U06_P03F30_NUMERIC_PATTERN_SPEC_IDS).size !== 4) errors.push("P03F30_SPEC_COUNT_INVALID");
  if (G5A_U06_P03F30_SELECTOR_ROWS.some((row) => row.questionMode !== "numeric" || row.patternSpecIds.some((id) => G5A_U06_P03F30_HIDDEN_APPLICATION_SPEC_IDS.includes(id)))) errors.push("P03F30_APPLICATION_MODE_LEAK");
  if (G5A_U06_P03F30_SELECTOR_ROWS.some((row) => JSON.stringify(row.requiredCapabilityIds) !== JSON.stringify(P03F30_REQUIRED_CAPABILITY_IDS))) errors.push("P03F30_CAPABILITY_SET_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 4, patternGroups: 4, patternSpecs: 4, numeric: 4, application: 0 }) });
}
