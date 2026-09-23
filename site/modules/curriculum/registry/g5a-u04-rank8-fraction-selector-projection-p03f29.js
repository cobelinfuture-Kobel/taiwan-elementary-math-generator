import { G5A_U04_SOURCE_ID, G5A_U04_UNIT_CODE, G5A_U04_UNIT_TITLE } from "./g5a-u04-rank7-fraction-selector-projection.js";

export const P03F29_TASK_ID = "P03F_W3DirectProductVerticalSlice029Implementation";
export const G5A_U04_P03F29_SOURCE_ID = G5A_U04_SOURCE_ID;
export const G5A_U04_P03F29_KP_ID = "kp_g5a_u04_unlike_fraction_compare";
export const G5A_U04_P03F29_GROUP_ID = "pg_g5a_u04_unlike_fraction_compare_numeric";
export const G5A_U04_P03F29_SPEC_ID = "ps_g5a_u04_unlike_fraction_compare_comparison_numeric";
export const G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID = "ps_g5a_u04_unlike_fraction_compare_comparison_application";
export const P03F29_REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

export const G5A_U04_P03F29_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G5A_U04_P03F29_GROUP_ID,
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    unitCode: G5A_U04_UNIT_CODE,
    unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "通分後比較異分母分數",
    primaryKnowledgePointId: G5A_U04_P03F29_KP_ID,
    knowledgePointIds: [G5A_U04_P03F29_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "unlike_fraction_compare",
    representationTags: ["fraction", "common_denominator", "cross_product", "exact_rational"],
    patternSpecIds: [G5A_U04_P03F29_SPEC_ID],
    allocationPolicy: "single_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G5A_U04_P03F29_SELECTOR_ROWS = freeze([
  {
    knowledgePointId: G5A_U04_P03F29_KP_ID,
    sourceId: G5A_U04_P03F29_SOURCE_ID,
    unitCode: G5A_U04_UNIT_CODE,
    unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "通分後比較異分母分數",
    canonicalNameZh: "通分後比較異分母分數",
    mode: "numeric",
    questionMode: "numeric",
    questionModes: ["numeric"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G5A_U04_P03F29_GROUP_ID],
    canonicalPatternSpecIds: [G5A_U04_P03F29_SPEC_ID],
    patternGroupIds: [G5A_U04_P03F29_GROUP_ID],
    patternSpecIds: [G5A_U04_P03F29_SPEC_ID],
    requiredCapabilityIds: P03F29_REQUIRED_CAPABILITY_IDS,
    hiddenApplicationPatternSpecIds: [G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID],
    qaStatusLabel: "P03F29_SLICE029_AUTHORITY_FROZEN",
    productionUse: "full_product_w3_slice029_candidate",
  },
]);

export const G5A_U04_P03F29_SELECTOR_PROJECTION = freeze({
  taskId: P03F29_TASK_ID,
  sourceId: G5A_U04_P03F29_SOURCE_ID,
  status: "ONE_RANK8_FRACTION_COMPARE_KP_ADDED_TO_EXISTING_PUBLIC_SOURCE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  numericPatternSpecCount: 1,
  applicationPatternSpecCount: 0,
  hiddenApplicationPatternSpecIds: [G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  expectedSourceVisibleCountAfterAdmission: 5,
  expectedSourceHiddenCountAfterAdmission: 2,
  expectedPublicSourceCountAfterAdmission: 29,
  expectedPublicKnowledgePointCountAfterAdmission: 220,
});

export function listG5AU04P03F29SelectorRows() { return clone(G5A_U04_P03F29_SELECTOR_ROWS); }
export function getG5AU04P03F29SelectorRow(id) { return clone(G5A_U04_P03F29_SELECTOR_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG5AU04P03F29PatternGroups(id) { return clone(G5A_U04_P03F29_PATTERN_GROUPS.filter((group) => group.primaryKnowledgePointId === id)); }
export function resolveG5AU04P03F29PatternSpecIds(id) { return id === G5A_U04_P03F29_KP_ID ? [G5A_U04_P03F29_SPEC_ID] : []; }
export function auditG5AU04P03F29SelectorProjection() {
  const errors = [];
  if (G5A_U04_P03F29_SELECTOR_ROWS.length !== 1) errors.push("P03F29_KP_COUNT_INVALID");
  if (G5A_U04_P03F29_PATTERN_GROUPS.length !== 1) errors.push("P03F29_GROUP_COUNT_INVALID");
  if (G5A_U04_P03F29_SELECTOR_ROWS[0].patternSpecIds.length !== 1) errors.push("P03F29_SPEC_COUNT_INVALID");
  if (G5A_U04_P03F29_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F29_APPLICATION_MODE_LEAK");
  if (G5A_U04_P03F29_SELECTOR_ROWS[0].patternSpecIds.includes(G5A_U04_P03F29_HIDDEN_APPLICATION_SPEC_ID)) errors.push("P03F29_HIDDEN_APPLICATION_SPEC_LEAK");
  if (JSON.stringify(G5A_U04_P03F29_SELECTOR_ROWS[0].requiredCapabilityIds) !== JSON.stringify(P03F29_REQUIRED_CAPABILITY_IDS)) errors.push("P03F29_CAPABILITY_SET_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1, numeric: 1, application: 0 }) });
}
