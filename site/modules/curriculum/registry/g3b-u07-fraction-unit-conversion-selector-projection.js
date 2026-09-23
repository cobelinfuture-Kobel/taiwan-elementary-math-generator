import { G3B_U07_SOURCE_ID, G3B_U07_UNIT_CODE, G3B_U07_UNIT_TITLE } from "./g3b-u07-quotient-fraction-selector-projection.js";

export const G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID = "kp_g3b_u07_fraction_unit_conversion";
export const G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID = "pg_g3b_u07_fraction_unit_conversion_numeric";
export const G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID = "pg_g3b_u07_fraction_unit_conversion_application";
export const G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID = "ps_g3b_u07_fraction_unit_conversion_item_count_numeric";
export const G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID = "ps_g3b_u07_fraction_unit_conversion_fractional_units_numeric";
export const G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID = "ps_g3b_u07_fraction_unit_conversion_item_count_application";
export const G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID = "ps_g3b_u07_fraction_unit_conversion_fractional_units_application";
export const G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS = Object.freeze([
  G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
]);
export const G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS = Object.freeze([
  G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
]);
export const G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS = Object.freeze([
  ...G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS,
  ...G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS,
]);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; for (const nested of Object.values(value)) freeze(nested); return Object.freeze(value); };
export const G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID, sourceId: G3B_U07_SOURCE_ID,
    unitCode: G3B_U07_UNIT_CODE, unitTitle: G3B_U07_UNIT_TITLE, displayName: "單位分數與離散單位換算｜數字題",
    primaryKnowledgePointId: G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, knowledgePointIds: [G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID],
    supportClass: "A", mode: "numeric", publicQuestionMode: "numeric", representationTag: "discrete_fraction_conversion",
    representationTags: ["fractional_units", "items_per_whole", "item_count", "bidirectional_conversion"],
    patternSpecIds: [...G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS], allocationPolicy: "balanced_two_pattern_specs",
    visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID, sourceId: G3B_U07_SOURCE_ID,
    unitCode: G3B_U07_UNIT_CODE, unitTitle: G3B_U07_UNIT_TITLE, displayName: "單位分數與離散單位換算｜應用題",
    primaryKnowledgePointId: G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, knowledgePointIds: [G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID],
    supportClass: "A", mode: "application", publicQuestionMode: "application", representationTag: "discrete_fraction_conversion_application",
    representationTags: ["box_quantity", "items_per_box", "fractional_box", "role_preserving_context"],
    patternSpecIds: [...G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS], allocationPolicy: "balanced_two_pattern_specs",
    visibilityStatus: "visible", holdReason: null,
  },
]);
export const G3B_U07_FRACTION_UNIT_CONVERSION_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, sourceId: G3B_U07_SOURCE_ID,
  unitCode: G3B_U07_UNIT_CODE, unitTitle: G3B_U07_UNIT_TITLE, displayName: "單位分數與離散單位換算",
  canonicalNameZh: "單位分數與離散單位換算", mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"],
  supportClass: "A", visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
  applicationClassification: "APPLICATION_REQUIRED",
  canonicalPatternGroupIds: [G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID],
  canonicalPatternSpecIds: [...G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS],
  patternGroupIds: [G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_GROUP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_GROUP_ID],
  patternSpecIds: [...G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS],
  qaStatusLabel: "P03F7_SLICE007_D0", productionUse: "full_product_w3_slice007_production",
}]);
export const G3B_U07_FRACTION_UNIT_CONVERSION_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice007Implementation", sourceId: G3B_U07_SOURCE_ID,
  status: "SECOND_W3_KP_PUBLIC_D0_VERTICAL_SLICE", knowledgePointCount: 1, patternGroupCount: 2, patternSpecCount: 4,
  excludedKnowledgePointIds: [
    "kp_g3b_u07_same_denominator_compare", "kp_g3b_u07_same_denominator_add_sub", "kp_g3b_u07_whole_and_fraction_add_sub",
    "kp_g3b_u07_combined_fraction_context", "kp_g3b_u07_fraction_plus_count_context", "kp_g3b_u07_original_or_difference_context",
  ],
  publicSelectionEnabled: true, sharedPipelineRequired: true, applicationModeRequired: true,
});
export function listG3BU07FractionUnitConversionSelectorRows() { return clone(G3B_U07_FRACTION_UNIT_CONVERSION_KNOWLEDGE_POINT_ROWS); }
export function getG3BU07FractionUnitConversionSelectorRow(id) { return id === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID ? clone(G3B_U07_FRACTION_UNIT_CONVERSION_KNOWLEDGE_POINT_ROWS[0]) : null; }
export function listG3BU07FractionUnitConversionPatternGroups(id) { return id === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID ? clone(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS) : []; }
export function resolveG3BU07FractionUnitConversionPatternSpecIds(id) { return id === G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID ? [...G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS] : []; }
export function auditG3BU07FractionUnitConversionSelectorProjection() {
  const errors = [];
  if (G3B_U07_FRACTION_UNIT_CONVERSION_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F7_KP_COUNT_INVALID");
  if (G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS.length !== 2) errors.push("P03F7_GROUP_COUNT_INVALID");
  if (new Set(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS.flatMap((g) => g.patternSpecIds)).size !== 4) errors.push("P03F7_SPEC_COUNT_INVALID");
  if (!G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS.some((g) => g.publicQuestionMode === "numeric") || !G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_GROUPS.some((g) => g.publicQuestionMode === "application")) errors.push("P03F7_NUMERIC_APPLICATION_PARITY_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 2, patternSpecs: 4 }) });
}
