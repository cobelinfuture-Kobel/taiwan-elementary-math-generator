import { G3A_U08_SOURCE_ID, G3A_U08_UNIT_CODE, G3A_U08_UNIT_TITLE } from "./g3a-u08-part-whole-fraction-selector-projection.js";

export const G3A_U08_UNIT_FRACTION_KP_ID = "kp_g3a_u08_unit_fraction_accumulation";
export const G3A_U08_DISCRETE_FRACTION_KP_ID = "kp_g3a_u08_discrete_set_fraction";

export const G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID = "pg_g3a_u08_unit_fraction_accumulation_numeric";
export const G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID = "pg_g3a_u08_unit_fraction_accumulation_application";
export const G3A_U08_DISCRETE_NUMERIC_GROUP_ID = "pg_g3a_u08_discrete_set_fraction_numeric";
export const G3A_U08_DISCRETE_APPLICATION_GROUP_ID = "pg_g3a_u08_discrete_set_fraction_application";

export const G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID = "ps_g3a_u08_unit_fraction_accumulation_fraction_numeric";
export const G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID = "ps_g3a_u08_unit_fraction_accumulation_fraction_application";
export const G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID = "ps_g3a_u08_discrete_set_fraction_item_count_numeric";
export const G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID = "ps_g3a_u08_discrete_set_fraction_fractional_units_numeric";
export const G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID = "ps_g3a_u08_discrete_set_fraction_item_count_application";
export const G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID = "ps_g3a_u08_discrete_set_fraction_fractional_units_application";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3A_U08_SLICE002_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "單位分數累積｜數字題", primaryKnowledgePointId: G3A_U08_UNIT_FRACTION_KP_ID,
    knowledgePointIds: [G3A_U08_UNIT_FRACTION_KP_ID], supportClass: "A", mode: "numeric", publicQuestionMode: "numeric",
    representationTag: "unit_fraction_accumulation", representationTags: ["unit_fraction", "fraction_accumulation"],
    patternSpecIds: [G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "單位分數累積｜應用題", primaryKnowledgePointId: G3A_U08_UNIT_FRACTION_KP_ID,
    knowledgePointIds: [G3A_U08_UNIT_FRACTION_KP_ID], supportClass: "A", mode: "application", publicQuestionMode: "application",
    representationTag: "unit_fraction_accumulation_application", representationTags: ["application", "global_context", "fraction_accumulation"],
    patternSpecIds: [G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G3A_U08_DISCRETE_NUMERIC_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "離散集合分數與單位換算｜數字題", primaryKnowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID,
    knowledgePointIds: [G3A_U08_DISCRETE_FRACTION_KP_ID], supportClass: "A", mode: "numeric", publicQuestionMode: "numeric",
    representationTag: "discrete_fraction_conversion", representationTags: ["discrete_set", "bidirectional_conversion"],
    patternSpecIds: [G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID], allocationPolicy: "balanced_by_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G3A_U08_DISCRETE_APPLICATION_GROUP_ID,
    sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "離散集合分數與單位換算｜應用題", primaryKnowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID,
    knowledgePointIds: [G3A_U08_DISCRETE_FRACTION_KP_ID], supportClass: "A", mode: "application", publicQuestionMode: "application",
    representationTag: "discrete_fraction_conversion_application", representationTags: ["application", "global_context", "bidirectional_conversion"],
    patternSpecIds: [G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID], allocationPolicy: "balanced_by_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
]);

const GROUPS_BY_KP = new Map([
  [G3A_U08_UNIT_FRACTION_KP_ID, G3A_U08_SLICE002_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === G3A_U08_UNIT_FRACTION_KP_ID)],
  [G3A_U08_DISCRETE_FRACTION_KP_ID, G3A_U08_SLICE002_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === G3A_U08_DISCRETE_FRACTION_KP_ID)],
]);

export const G3A_U08_SLICE002_KNOWLEDGE_POINT_ROWS = freeze([
  {
    knowledgePointId: G3A_U08_UNIT_FRACTION_KP_ID, sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "單位分數累積", canonicalNameZh: "單位分數累積", mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"],
    supportClass: "A", visibilityStatus: "visible", selectorStatus: "visible", holdReason: null, applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID, G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID],
    canonicalPatternSpecIds: [G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID, G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID],
    patternGroupIds: [G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID, G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID],
    patternSpecIds: [G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID, G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID],
    qaStatusLabel: "P03F_SLICE002_D0", productionUse: "full_product_w3_slice002_production",
  },
  {
    knowledgePointId: G3A_U08_DISCRETE_FRACTION_KP_ID, sourceId: G3A_U08_SOURCE_ID, unitCode: G3A_U08_UNIT_CODE, unitTitle: G3A_U08_UNIT_TITLE,
    displayName: "離散集合的分數與單位換算", canonicalNameZh: "離散集合的分數與單位換算", mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"],
    supportClass: "A", visibilityStatus: "visible", selectorStatus: "visible", holdReason: null, applicationClassification: "APPLICATION_REQUIRED",
    canonicalPatternGroupIds: [G3A_U08_DISCRETE_NUMERIC_GROUP_ID, G3A_U08_DISCRETE_APPLICATION_GROUP_ID],
    canonicalPatternSpecIds: [G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID],
    patternGroupIds: [G3A_U08_DISCRETE_NUMERIC_GROUP_ID, G3A_U08_DISCRETE_APPLICATION_GROUP_ID],
    patternSpecIds: [G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID, G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID],
    qaStatusLabel: "P03F_SLICE002_D0", productionUse: "full_product_w3_slice002_production",
  },
]);

export const G3A_U08_SLICE002_PATTERN_SPEC_IDS = freeze([...new Set(G3A_U08_SLICE002_PATTERN_GROUPS.flatMap((row) => row.patternSpecIds))]);
export const G3A_U08_SLICE002_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice002Implementation", sourceId: G3A_U08_SOURCE_ID,
  status: "TWO_W3_KPS_PUBLIC_D0_VERTICAL_SLICE", knowledgePointCount: 2, patternGroupCount: 4, patternSpecCount: 6,
  excludedKnowledgePointIds: ["kp_g3a_u08_measurement_fraction", "kp_g3a_u08_whole_as_fraction", "kp_g3a_u08_same_denominator_compare", "kp_g3a_u08_unlike_denominator_comparison_limit"],
  publicSelectionEnabled: true, sharedPipelineRequired: true, applicationModeAllowed: true,
});

export function listG3AU08Slice002SelectorRows() { return clone(G3A_U08_SLICE002_KNOWLEDGE_POINT_ROWS); }
export function getG3AU08Slice002SelectorRow(id) { return clone(G3A_U08_SLICE002_KNOWLEDGE_POINT_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG3AU08Slice002PatternGroups(id) { return clone(GROUPS_BY_KP.get(id) ?? []); }
export function resolveG3AU08Slice002PatternSpecIds(id, mode = null) {
  return [...new Set(listG3AU08Slice002PatternGroups(id).filter((row) => !mode || row.publicQuestionMode === mode).flatMap((row) => row.patternSpecIds))];
}
export function auditG3AU08Slice002SelectorProjection() {
  const errors = [];
  const ids = G3A_U08_SLICE002_KNOWLEDGE_POINT_ROWS.map((row) => row.knowledgePointId);
  if (ids.length !== 2 || new Set(ids).size !== 2) errors.push("P03F2_KP_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_GROUPS.length !== 4) errors.push("P03F2_GROUP_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_SPEC_IDS.length !== 6) errors.push("P03F2_SPEC_COUNT_INVALID");
  if (G3A_U08_SLICE002_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application").length !== 2) errors.push("P03F2_APPLICATION_GROUP_COUNT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 4, patternSpecs: 6 }) });
}
