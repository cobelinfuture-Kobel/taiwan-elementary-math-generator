export const G5A_U04_SOURCE_ID = "g5a_u04_5a04";
export const G5A_U04_UNIT_CODE = "5A-U04";
export const G5A_U04_UNIT_TITLE = "擴分約分通分";
export const G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID = "kp_g5a_u04_expand_reduce_simplest";
export const G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID = "pg_g5a_u04_expand_reduce_simplest_numeric";
export const G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g5a_u04_expand_reduce_simplest_common_factor_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_numerator_numeric",
  "ps_g5a_u04_expand_reduce_simplest_simplest_denominator_numeric",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_GROUPS = freeze([{
  patternGroupId: G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  sourceId: G5A_U04_SOURCE_ID,
  unitCode: G5A_U04_UNIT_CODE,
  unitTitle: G5A_U04_UNIT_TITLE,
  displayName: "擴分、約分與最簡分數",
  primaryKnowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  knowledgePointIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "fraction_simplification",
  representationTags: ["fraction", "reduction", "gcd", "simplest_fraction"],
  patternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  allocationPolicy: "balanced_across_three_requested_roles",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_ROWS = freeze([{
  knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  sourceId: G5A_U04_SOURCE_ID,
  unitCode: G5A_U04_UNIT_CODE,
  unitTitle: G5A_U04_UNIT_TITLE,
  displayName: "擴分、約分與最簡分數",
  canonicalNameZh: "擴分、約分與最簡分數",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
  canonicalPatternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  patternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
  patternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  qaStatusLabel: "P03F_SLICE013_CANDIDATE",
  productionUse: "full_product_w3_slice013_candidate",
}]);

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice013Implementation",
  sourceId: G5A_U04_SOURCE_ID,
  status: "FIRST_W3_KP_NUMERIC_PUBLIC_D0_CANDIDATE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 3,
  excludedKnowledgePointIds: [
    "kp_g5a_u04_common_denominator",
    "kp_g5a_u04_divisibility_supported_reduction",
    "kp_g5a_u04_unlike_fraction_compare",
    "kp_g5a_u04_equivalent_mixed_selection",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG5AU04ExpandReduceSimplestSelectorRows() {
  return clone(G5A_U04_EXPAND_REDUCE_SIMPLEST_ROWS);
}
export function getG5AU04ExpandReduceSimplestSelectorRow(id) {
  return id === G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID
    ? clone(G5A_U04_EXPAND_REDUCE_SIMPLEST_ROWS[0])
    : null;
}
export function listG5AU04ExpandReduceSimplestPatternGroups(id) {
  return id === G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID
    ? clone(G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_GROUPS)
    : [];
}
export function resolveG5AU04ExpandReduceSimplestPatternSpecIds(id) {
  return id === G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID
    ? [...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS]
    : [];
}
export function auditG5AU04ExpandReduceSimplestSelectorProjection() {
  const errors = [];
  if (G5A_U04_EXPAND_REDUCE_SIMPLEST_ROWS.length !== 1) errors.push("P03F13_KP_COUNT_INVALID");
  if (G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_GROUPS.length !== 1) errors.push("P03F13_GROUP_COUNT_INVALID");
  if (G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_GROUPS[0].patternSpecIds.length !== 3) errors.push("P03F13_SPEC_COUNT_INVALID");
  if (G5A_U04_EXPAND_REDUCE_SIMPLEST_SELECTOR_PROJECTION.applicationModeAllowed) errors.push("P03F13_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 }),
  });
}
