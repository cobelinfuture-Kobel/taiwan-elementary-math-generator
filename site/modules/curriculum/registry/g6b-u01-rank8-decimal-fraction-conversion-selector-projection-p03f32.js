export const P03F32_TASK_ID = "P03F_W3DirectProductVerticalSlice032Implementation";
export const G6B_U01_P03F32_SOURCE_ID = "g6b_u01_6b01";
export const G6B_U01_P03F32_UNIT_CODE = "6B-U01";
export const G6B_U01_P03F32_UNIT_TITLE = "小數與分數的計算";
export const G6B_U01_P03F32_KP_ID = "kp_g6b_u01_decimal_fraction_conversion";
export const G6B_U01_P03F32_GROUP_ID = "pg_g6b_u01_decimal_fraction_conversion_numeric";
export const G6B_U01_P03F32_FRACTION_SPEC_ID = "ps_g6b_u01_decimal_fraction_conversion_fraction_numeric";
export const G6B_U01_P03F32_DECIMAL_SPEC_ID = "ps_g6b_u01_decimal_fraction_conversion_decimal_numeric";
export const G6B_U01_P03F32_SPEC_IDS = Object.freeze([
  G6B_U01_P03F32_FRACTION_SPEC_ID,
  G6B_U01_P03F32_DECIMAL_SPEC_ID,
]);
export const P03F32_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_decimal_domain_validator",
  "cap_decimal_number_system",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
  "cap_mixed_number_domain_normalization",
]);
export const P03F32_HIDDEN_SIBLING_KP_IDS = Object.freeze([
  "kp_g6b_u01_mixed_decimal_fraction_add_sub",
  "kp_g6b_u01_mixed_decimal_fraction_mul_div",
  "kp_g6b_u01_mixed_number_domain_order",
  "kp_g6b_u01_mixed_domain_expression",
]);

export const G6B_U01_P03F32_PATTERN_GROUP = Object.freeze({
  patternGroupId: G6B_U01_P03F32_GROUP_ID,
  sourceId: G6B_U01_P03F32_SOURCE_ID,
  unitCode: G6B_U01_P03F32_UNIT_CODE,
  unitTitle: G6B_U01_P03F32_UNIT_TITLE,
  displayName: "小數與分數互換",
  primaryKnowledgePointId: G6B_U01_P03F32_KP_ID,
  knowledgePointIds: Object.freeze([G6B_U01_P03F32_KP_ID]),
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "mixed_decimal_fraction_conversion",
  representationTags: Object.freeze(["decimal", "fraction", "exact_conversion", "terminating_decimal", "reduced_fraction"]),
  patternSpecIds: G6B_U01_P03F32_SPEC_IDS,
  allocationPolicy: "balanced_pattern_specs",
  visibilityStatus: "visible",
  holdReason: null,
});

export const G6B_U01_P03F32_SELECTOR_ROW = Object.freeze({
  knowledgePointId: G6B_U01_P03F32_KP_ID,
  sourceId: G6B_U01_P03F32_SOURCE_ID,
  unitCode: G6B_U01_P03F32_UNIT_CODE,
  unitTitle: G6B_U01_P03F32_UNIT_TITLE,
  displayName: "小數分數互換",
  canonicalNameZh: "小數分數互換",
  mode: "numeric",
  questionMode: "numeric",
  questionModes: Object.freeze(["numeric"]),
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_COMPATIBLE_FUTURE_QUEUE_RESERVED",
  canonicalPatternGroupIds: Object.freeze([G6B_U01_P03F32_GROUP_ID]),
  canonicalPatternSpecIds: G6B_U01_P03F32_SPEC_IDS,
  patternGroupIds: Object.freeze([G6B_U01_P03F32_GROUP_ID]),
  patternSpecIds: G6B_U01_P03F32_SPEC_IDS,
  requiredCapabilityIds: P03F32_REQUIRED_CAPABILITY_IDS,
  hiddenApplicationPatternSpecIds: Object.freeze([]),
  qaStatusLabel: "P03F32_R02_PAGE1_CANONICAL_PREREQUISITE_PROJECTION",
  productionUse: "full_product_w3_slice032_candidate",
});

export const G6B_U01_P03F32_SELECTOR_PROJECTION = Object.freeze({
  taskId: P03F32_TASK_ID,
  sourceId: G6B_U01_P03F32_SOURCE_ID,
  status: "MIXED_DOMAIN_CONVERSION_KP_ADDED_AS_NEW_PUBLIC_SOURCE",
  knowledgePointCount: 1,
  hiddenSiblingKnowledgePointCount: 4,
  patternGroupCount: 1,
  patternSpecCount: 2,
  numericPatternSpecCount: 2,
  applicationPatternSpecCount: 0,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  sharedMixedDomainNormalizerRequired: true,
  applicationModeAllowed: false,
  compareModeAllowed: false,
  arithmeticModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 1,
  expectedSourceHiddenCountAfterAdmission: 4,
  expectedPublicSourceCountAfterAdmission: 32,
  expectedPublicKnowledgePointCountAfterAdmission: 226,
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export function listG6BU01P03F32SelectorRows() { return [clone(G6B_U01_P03F32_SELECTOR_ROW)]; }
export function getG6BU01P03F32SelectorRow(id) { return id === G6B_U01_P03F32_KP_ID ? clone(G6B_U01_P03F32_SELECTOR_ROW) : null; }
export function listG6BU01P03F32PatternGroups(id) { return id === G6B_U01_P03F32_KP_ID ? [clone(G6B_U01_P03F32_PATTERN_GROUP)] : []; }
export function resolveG6BU01P03F32PatternSpecIds(id) { return id === G6B_U01_P03F32_KP_ID ? [...G6B_U01_P03F32_SPEC_IDS] : []; }
export function auditG6BU01P03F32SelectorProjection() {
  const errors = [];
  if (G6B_U01_P03F32_SELECTOR_ROW.questionMode !== "numeric") errors.push("P03F32_QUESTION_MODE_INVALID");
  if (G6B_U01_P03F32_PATTERN_GROUP.patternSpecIds.length !== 2) errors.push("P03F32_SPEC_COUNT_INVALID");
  if (JSON.stringify(G6B_U01_P03F32_SELECTOR_ROW.requiredCapabilityIds) !== JSON.stringify(P03F32_REQUIRED_CAPABILITY_IDS)) errors.push("P03F32_CAPABILITY_SET_INVALID");
  if (P03F32_REQUIRED_CAPABILITY_IDS.some((id) => id === "cap_decimal_arithmetic" || id === "cap_fraction_arithmetic")) errors.push("P03F32_ARITHMETIC_CAPABILITY_LEAK");
  if (G6B_U01_P03F32_SELECTOR_ROW.hiddenApplicationPatternSpecIds.length !== 0) errors.push("P03F32_APPLICATION_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints:1, hiddenSiblings:4, patternGroups:1, patternSpecs:2, numeric:2, application:0 }) });
}
