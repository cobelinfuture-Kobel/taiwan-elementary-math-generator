import {
  G5A_U04_SOURCE_ID,
  G5A_U04_UNIT_CODE,
  G5A_U04_UNIT_TITLE,
} from "./g5a-u04-expand-reduce-simplest-selector-projection.js";

export { G5A_U04_SOURCE_ID, G5A_U04_UNIT_CODE, G5A_U04_UNIT_TITLE };
export const G5A_U04_COMMON_DENOMINATOR_KP_ID = "kp_g5a_u04_common_denominator";
export const G5A_U04_DIVISIBILITY_REDUCTION_KP_ID = "kp_g5a_u04_divisibility_supported_reduction";
export const G5A_U04_COMMON_DENOMINATOR_GROUP_ID = "pg_g5a_u04_common_denominator_numeric";
export const G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID = "pg_g5a_u04_divisibility_supported_reduction_numeric";
export const G5A_U04_COMMON_DENOMINATOR_SPEC_IDS = Object.freeze([
  "ps_g5a_u04_common_denominator_common_denominator_numeric",
  "ps_g5a_u04_common_denominator_left_equivalent_numeric",
  "ps_g5a_u04_common_denominator_right_equivalent_numeric",
]);
export const G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS = Object.freeze([
  "ps_g5a_u04_divisibility_supported_reduction_common_factor_numeric",
  "ps_g5a_u04_divisibility_supported_reduction_simplest_numerator_numeric",
  "ps_g5a_u04_divisibility_supported_reduction_simplest_denominator_numeric",
]);
export const G5A_U04_SLICE022_KP_IDS = Object.freeze([
  G5A_U04_COMMON_DENOMINATOR_KP_ID,
  G5A_U04_DIVISIBILITY_REDUCTION_KP_ID,
]);
export const G5A_U04_SLICE022_PATTERN_SPEC_IDS = Object.freeze([
  ...G5A_U04_COMMON_DENOMINATOR_SPEC_IDS,
  ...G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
};

export const G5A_U04_SLICE022_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G5A_U04_COMMON_DENOMINATOR_GROUP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "通分", primaryKnowledgePointId: G5A_U04_COMMON_DENOMINATOR_KP_ID,
    knowledgePointIds: [G5A_U04_COMMON_DENOMINATOR_KP_ID], supportClass: "A",
    mode: "numeric", publicQuestionMode: "numeric", representationTag: "common_denominator",
    representationTags: ["fraction", "equivalent_fraction", "least_common_multiple"],
    patternSpecIds: G5A_U04_COMMON_DENOMINATOR_SPEC_IDS,
    allocationPolicy: "balanced_numeric_patterns", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "利用整除規則約分", primaryKnowledgePointId: G5A_U04_DIVISIBILITY_REDUCTION_KP_ID,
    knowledgePointIds: [G5A_U04_DIVISIBILITY_REDUCTION_KP_ID], supportClass: "A",
    mode: "numeric", publicQuestionMode: "numeric", representationTag: "divisibility_reduction",
    representationTags: ["fraction", "reduction", "divisibility"],
    patternSpecIds: G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
    allocationPolicy: "balanced_numeric_patterns", visibilityStatus: "visible", holdReason: null,
  },
]);

export const G5A_U04_SLICE022_ROWS = freeze([
  {
    knowledgePointId: G5A_U04_COMMON_DENOMINATOR_KP_ID, sourceId: G5A_U04_SOURCE_ID,
    unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE, displayName: "通分", canonicalNameZh: "通分",
    mode: "numeric", questionMode: "numeric", questionModes: ["numeric"], supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G5A_U04_COMMON_DENOMINATOR_GROUP_ID], canonicalPatternSpecIds: G5A_U04_COMMON_DENOMINATOR_SPEC_IDS,
    patternGroupIds: [G5A_U04_COMMON_DENOMINATOR_GROUP_ID], patternSpecIds: G5A_U04_COMMON_DENOMINATOR_SPEC_IDS,
    qaStatusLabel: "P03F_SLICE022_CANDIDATE", productionUse: "full_product_w3_slice022_candidate",
  },
  {
    knowledgePointId: G5A_U04_DIVISIBILITY_REDUCTION_KP_ID, sourceId: G5A_U04_SOURCE_ID,
    unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE, displayName: "利用整除規則約分", canonicalNameZh: "利用整除規則約分",
    mode: "numeric", questionMode: "numeric", questionModes: ["numeric"], supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID], canonicalPatternSpecIds: G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
    patternGroupIds: [G5A_U04_DIVISIBILITY_REDUCTION_GROUP_ID], patternSpecIds: G5A_U04_DIVISIBILITY_REDUCTION_SPEC_IDS,
    qaStatusLabel: "P03F_SLICE022_CANDIDATE", productionUse: "full_product_w3_slice022_candidate",
  },
]);

export function listG5AU04Slice022SelectorRows() { return clone(G5A_U04_SLICE022_ROWS); }
export function getG5AU04Slice022SelectorRow(id) { return clone(G5A_U04_SLICE022_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG5AU04Slice022PatternGroups(id) { return clone(G5A_U04_SLICE022_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG5AU04Slice022PatternSpecIds(id) { return listG5AU04Slice022PatternGroups(id).flatMap((row) => row.patternSpecIds); }
export function auditG5AU04Slice022SelectorProjection() {
  const errors = [];
  if (G5A_U04_SLICE022_ROWS.length !== 2) errors.push("P03F22_KP_COUNT_INVALID");
  if (G5A_U04_SLICE022_PATTERN_GROUPS.length !== 2) errors.push("P03F22_GROUP_COUNT_INVALID");
  if (G5A_U04_SLICE022_PATTERN_SPEC_IDS.length !== 6) errors.push("P03F22_SPEC_COUNT_INVALID");
  if (G5A_U04_SLICE022_PATTERN_GROUPS.some((row) => row.publicQuestionMode !== "numeric")) errors.push("P03F22_APPLICATION_MODE_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 2, patternSpecs: 6 }) });
}
