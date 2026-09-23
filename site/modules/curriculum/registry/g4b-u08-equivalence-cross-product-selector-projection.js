export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID = "kp_g4b_u08_equivalence_cross_product";
export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID = "pg_g4b_u08_equivalence_cross_product_numeric";
export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID = "ps_g4b_u08_equivalence_cross_product_equivalent_numeric";

import {
  G4B_U08_SOURCE_ID,
  G4B_U08_UNIT_CODE,
  G4B_U08_UNIT_TITLE,
} from "./g4b-u08-equivalent-fraction-selector-projection.js";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_GROUPS = freeze([{
  patternGroupId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID,
  sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: "交叉乘積判定等值",
  primaryKnowledgePointId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  knowledgePointIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "fraction_equivalence_cross_product",
  representationTags: ["fraction", "equivalence", "cross_product", "boolean_judgment"],
  patternSpecIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_ROWS = freeze([{
  knowledgePointId: G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID,
  sourceId: G4B_U08_SOURCE_ID,
  unitCode: G4B_U08_UNIT_CODE,
  unitTitle: G4B_U08_UNIT_TITLE,
  displayName: "交叉乘積判定等值",
  canonicalNameZh: "交叉乘積判定等值",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID],
  canonicalPatternSpecIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID],
  patternGroupIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_GROUP_ID],
  patternSpecIds: [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID],
  qaStatusLabel: "P03F_SLICE012_CANDIDATE",
  productionUse: "full_product_w3_slice012_candidate",
}]);

export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice012Implementation",
  sourceId: G4B_U08_SOURCE_ID,
  status: "SECOND_W3_KP_NUMERIC_PUBLIC_D0_CANDIDATE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
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

export function listG4BU08EquivalenceCrossProductSelectorRows() {
  return clone(G4B_U08_EQUIVALENCE_CROSS_PRODUCT_ROWS);
}
export function getG4BU08EquivalenceCrossProductSelectorRow(id) {
  return id === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID
    ? clone(G4B_U08_EQUIVALENCE_CROSS_PRODUCT_ROWS[0])
    : null;
}
export function listG4BU08EquivalenceCrossProductPatternGroups(id) {
  return id === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID
    ? clone(G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_GROUPS)
    : [];
}
export function resolveG4BU08EquivalenceCrossProductPatternSpecIds(id) {
  return id === G4B_U08_EQUIVALENCE_CROSS_PRODUCT_KP_ID
    ? [G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SPEC_ID]
    : [];
}
export function auditG4BU08EquivalenceCrossProductSelectorProjection() {
  const errors = [];
  if (G4B_U08_EQUIVALENCE_CROSS_PRODUCT_ROWS.length !== 1) errors.push("P03F12_KP_COUNT_INVALID");
  if (G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_GROUPS.length !== 1) errors.push("P03F12_GROUP_COUNT_INVALID");
  if (G4B_U08_EQUIVALENCE_CROSS_PRODUCT_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F12_SPEC_COUNT_INVALID");
  if (G4B_U08_EQUIVALENCE_CROSS_PRODUCT_SELECTOR_PROJECTION.applicationModeAllowed) errors.push("P03F12_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }),
  });
}
