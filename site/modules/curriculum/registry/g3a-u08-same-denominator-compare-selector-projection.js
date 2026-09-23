
import { G3A_U08_SOURCE_ID, G3A_U08_UNIT_CODE, G3A_U08_UNIT_TITLE } from "./g3a-u08-part-whole-fraction-selector-projection.js";

export const G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID = "kp_g3a_u08_same_denominator_compare";
export const G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID = "pg_g3a_u08_same_denominator_compare_numeric";
export const G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID = "pg_g3a_u08_same_denominator_compare_application";
export const G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID = "ps_g3a_u08_same_denominator_compare_comparison_numeric";
export const G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID = "ps_g3a_u08_same_denominator_compare_comparison_application";
export const G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS = Object.freeze([
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3A_U08_SAME_DENOMINATOR_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "同分母分數比較｜數字題", primaryKnowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
    knowledgePointIds: [G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID], supportClass: "A",
    mode: "numeric", publicQuestionMode: "numeric", representationTag: "same_denominator_fraction_compare",
    representationTags: ["fraction", "same_denominator", "comparison_symbol", "compare_with_one"],
    patternSpecIds: [G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec",
    visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "同分母分數比較｜應用題", primaryKnowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
    knowledgePointIds: [G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID], supportClass: "A",
    mode: "application", publicQuestionMode: "application", representationTag: "same_denominator_fraction_compare_application",
    representationTags: ["application", "global_context", "same_denominator", "comparison_symbol"],
    patternSpecIds: [G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec",
    visibilityStatus: "visible", holdReason: null,
  },
]);

export const G3A_U08_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
  displayName: "同分母分數比較", canonicalNameZh: "同分母分數比較",
  mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"], supportClass: "A",
  visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
  applicationClassification: "APPLICATION_COMPATIBLE",
  canonicalPatternGroupIds: [G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID, G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID],
  canonicalPatternSpecIds: [...G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS],
  patternGroupIds: [G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID, G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID],
  patternSpecIds: [...G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS],
  qaStatusLabel: "P03F_SLICE006_D0", productionUse: "full_product_w3_slice006_production",
}]);

export const G3A_U08_SAME_DENOMINATOR_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice006Implementation", sourceId: G3A_U08_SOURCE_ID,
  status: "ONE_W3_KP_NUMERIC_APPLICATION_PUBLIC_D0_VERTICAL_SLICE", knowledgePointCount: 1,
  patternGroupCount: 2, patternSpecCount: 2,
  excludedKnowledgePointIds: ["kp_g3a_u08_measurement_fraction", "kp_g3a_u08_whole_as_fraction", "kp_g3a_u08_unlike_denominator_comparison_limit"],
  publicSelectionEnabled: true, sharedPipelineRequired: true, applicationModeAllowed: true,
});

export function listG3AU08SameDenominatorSelectorRows() { return clone(G3A_U08_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS); }
export function getG3AU08SameDenominatorSelectorRow(id) { return id === G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID ? clone(G3A_U08_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS[0]) : null; }
export function listG3AU08SameDenominatorPatternGroups(id) { return id === G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID ? clone(G3A_U08_SAME_DENOMINATOR_PATTERN_GROUPS) : []; }
export function resolveG3AU08SameDenominatorPatternSpecIds(id, mode = null) {
  return listG3AU08SameDenominatorPatternGroups(id).filter((row) => !mode || row.publicQuestionMode === mode).flatMap((row) => row.patternSpecIds);
}
export function auditG3AU08SameDenominatorSelectorProjection() {
  const errors = [];
  if (G3A_U08_SAME_DENOMINATOR_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F6_KP_COUNT_INVALID");
  if (G3A_U08_SAME_DENOMINATOR_PATTERN_GROUPS.length !== 2) errors.push("P03F6_GROUP_COUNT_INVALID");
  if (G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS.length !== 2) errors.push("P03F6_SPEC_COUNT_INVALID");
  if (G3A_U08_SAME_DENOMINATOR_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application").length !== 1) errors.push("P03F6_APPLICATION_GROUP_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 2, patternSpecs: 2 }) });
}
