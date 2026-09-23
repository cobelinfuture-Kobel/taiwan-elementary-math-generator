export const G4B_U08_SOURCE_ID = "g4b_u08_4b08";
export const G4B_U08_UNIT_CODE = "4B-U08";
export const G4B_U08_UNIT_TITLE = "等值分數";
export const G4B_U08_EQUIVALENT_FRACTION_KP_ID = "kp_g4b_u08_generate_equivalent_fraction";
export const G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID = "pg_g4b_u08_generate_equivalent_fraction_numeric";
export const G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4b_u08_generate_equivalent_fraction_factor_numeric",
  "ps_g4b_u08_generate_equivalent_fraction_equivalent_numerator_numeric",
  "ps_g4b_u08_generate_equivalent_fraction_equivalent_denominator_numeric",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUPS = freeze([{
  patternGroupId: G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: "擴分與約分產生等值分數",
  primaryKnowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  knowledgePointIds: [G4B_U08_EQUIVALENT_FRACTION_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "equivalent_fraction_structure",
  representationTags: ["expansion", "reduction", "missing_integer"],
  patternSpecIds: G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
  allocationPolicy: "balanced_three_pattern_specs",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G4B_U08_EQUIVALENT_FRACTION_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: "擴分與約分產生等值分數",
  canonicalNameZh: "擴分與約分產生等值分數",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
  patternGroupIds: [G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID],
  patternSpecIds: G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
  qaStatusLabel: "P03F5_SLICE005_D0",
  productionUse: "full_product_w3_slice005_production",
}]);

export const G4B_U08_EQUIVALENT_FRACTION_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice005Implementation",
  sourceId: G4B_U08_SOURCE_ID,
  status: "ONE_W3_KP_PUBLIC_D0_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 3,
  excludedKnowledgePointIds: [
    "kp_g4b_u08_equivalence_cross_product",
    "kp_g4b_u08_fraction_compare_cross_product",
    "kp_g4b_u08_unlike_denominator_add_sub",
    "kp_g4b_u08_fraction_decimal_conversion",
    "kp_g4b_u08_fraction_number_line_distance",
    "kp_g4b_u08_mixed_fraction_order_constraints",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG4BU08EquivalentFractionSelectorRows() { return clone(G4B_U08_EQUIVALENT_FRACTION_KNOWLEDGE_POINT_ROWS); }
export function getG4BU08EquivalentFractionSelectorRow(knowledgePointId) {
  return knowledgePointId === G4B_U08_EQUIVALENT_FRACTION_KP_ID
    ? clone(G4B_U08_EQUIVALENT_FRACTION_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG4BU08EquivalentFractionPatternGroups(knowledgePointId) {
  return knowledgePointId === G4B_U08_EQUIVALENT_FRACTION_KP_ID
    ? clone(G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUPS)
    : [];
}
export function resolveG4BU08EquivalentFractionPatternSpecIds(knowledgePointId) {
  return knowledgePointId === G4B_U08_EQUIVALENT_FRACTION_KP_ID
    ? [...G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS]
    : [];
}
export function auditG4BU08EquivalentFractionSelectorProjection() {
  const errors = [];
  if (G4B_U08_EQUIVALENT_FRACTION_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F5_KP_COUNT_INVALID");
  if (G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUPS.length !== 1) errors.push("P03F5_GROUP_COUNT_INVALID");
  if (G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUPS[0].patternSpecIds.length !== 3) errors.push("P03F5_SPEC_COUNT_INVALID");
  if (G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F5_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 }) });
}
