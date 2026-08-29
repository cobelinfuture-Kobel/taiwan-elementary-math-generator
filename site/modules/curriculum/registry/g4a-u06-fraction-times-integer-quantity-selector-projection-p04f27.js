export const P04F27_TASK_ID = "P04F_W4DirectProductVerticalSlice027Implementation";
export const G4A_U06_P04F27_SOURCE_ID = "g4a_u06_4a06";
export const G4A_U06_P04F27_KP_ID = "kp_fraction_times_integer_quantity";
export const G4A_U06_P04F27_HISTORICAL_ALIAS_ID = "kp_g4a_u06_fraction_times_integer_quantity";
export const G4A_U06_P04F27_GROUP_ID = "pg_g4a_u06_fraction_times_integer_quantity_application";
export const G4A_U06_P04F27_SPEC_ID = "ps_g4a_u06_fraction_times_integer_quantity_application";
export const P04F27_REQUIRED_PRODUCT_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
  "cap_quantity_domain_validator",
  "cap_quantity_semantic_role_binding",
]);
export const P04F27_RESERVED_SUCCESSOR_KP_IDS = Object.freeze([
  "kp_g5a_u04_fraction_measurement_segments",
]);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
export const G4A_U06_P04F27_PATTERN_GROUP = Object.freeze({
  patternGroupId: G4A_U06_P04F27_GROUP_ID,
  sourceId: G4A_U06_P04F27_SOURCE_ID,
  unitCode: "4A-U06",
  unitTitle: "假分數與帶分數",
  displayName: "分數量乘以整數倍",
  primaryKnowledgePointId: G4A_U06_P04F27_KP_ID,
  knowledgePointIds: Object.freeze([G4A_U06_P04F27_KP_ID]),
  supportClass: "A",
  mode: "application",
  publicQuestionMode: "application",
  representationTag: "measurement_application",
  representationTags: Object.freeze([
    "application_word_problem",
    "fraction",
    "mixed_number",
    "quantity_scaling",
    "exact_rational",
  ]),
  patternSpecIds: Object.freeze([G4A_U06_P04F27_SPEC_ID]),
  allocationPolicy: "single_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
});
export const G4A_U06_P04F27_SELECTOR_ROW = Object.freeze({
  knowledgePointId: G4A_U06_P04F27_KP_ID,
  sourceCanonicalKnowledgePointId: G4A_U06_P04F27_HISTORICAL_ALIAS_ID,
  sourceId: G4A_U06_P04F27_SOURCE_ID,
  unitCode: "4A-U06",
  unitTitle: "假分數與帶分數",
  displayName: "分數量乘以整數倍",
  canonicalNameZh: "分數量乘以整數倍",
  mode: "application",
  questionMode: "application",
  questionModes: Object.freeze(["application"]),
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_REQUIRED",
  canonicalPatternGroupIds: Object.freeze([G4A_U06_P04F27_GROUP_ID]),
  canonicalPatternSpecIds: Object.freeze([G4A_U06_P04F27_SPEC_ID]),
  patternGroupIds: Object.freeze([G4A_U06_P04F27_GROUP_ID]),
  patternSpecIds: Object.freeze([G4A_U06_P04F27_SPEC_ID]),
  requiredCapabilityIds: P04F27_REQUIRED_PRODUCT_CAPABILITY_IDS,
  hiddenApplicationPatternSpecIds: Object.freeze([]),
  qaStatusLabel: "P04F27_G4A_U06_FRACTION_TIMES_INTEGER_QUANTITY",
  productionUse: "full_product_w4_slice027_candidate",
});
export function listG4AU06P04F27SelectorRows() { return [clone(G4A_U06_P04F27_SELECTOR_ROW)]; }
export function getG4AU06P04F27SelectorRow(id) { return id === G4A_U06_P04F27_KP_ID ? clone(G4A_U06_P04F27_SELECTOR_ROW) : null; }
export function listG4AU06P04F27PatternGroups(id) { return id === G4A_U06_P04F27_KP_ID ? [clone(G4A_U06_P04F27_PATTERN_GROUP)] : []; }
export function resolveG4AU06P04F27PatternSpecIds(id) { return id === G4A_U06_P04F27_KP_ID ? [G4A_U06_P04F27_SPEC_ID] : []; }
export function auditG4AU06P04F27SelectorProjection() {
  const errors = [];
  if (G4A_U06_P04F27_SELECTOR_ROW.questionMode !== "application") errors.push("P04F27_APPLICATION_MODE_INVALID");
  if (G4A_U06_P04F27_SELECTOR_ROW.applicationClassification !== "APPLICATION_REQUIRED") errors.push("P04F27_APPLICATION_CLASSIFICATION_INVALID");
  if (G4A_U06_P04F27_SELECTOR_ROW.knowledgePointId === G4A_U06_P04F27_HISTORICAL_ALIAS_ID) errors.push("P04F27_FROZEN_ALIAS_RECONCILIATION_INVALID");
  if (P04F27_RESERVED_SUCCESSOR_KP_IDS.includes(G4A_U06_P04F27_KP_ID)) errors.push("P04F27_SUCCESSOR_BOUNDARY_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1, application: 1 }),
  });
}
