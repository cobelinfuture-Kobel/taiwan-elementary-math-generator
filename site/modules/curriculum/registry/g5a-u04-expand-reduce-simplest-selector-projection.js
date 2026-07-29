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

export const G5A_U04_QUOTIENT_CONTEXT_KP_ID = "kp_g5a_u04_quotient_as_fraction_context";
export const G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID = "pg_g5a_u04_quotient_as_fraction_context_numeric";
export const G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID = "pg_g5a_u04_quotient_as_fraction_context_application";
export const G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID = "ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_numeric";
export const G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID = "ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application";
export const G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS = Object.freeze([
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
]);
export const G5A_U04_SLICE013_KP_IDS = Object.freeze([
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
]);
export const G5A_U04_SLICE013_PATTERN_SPEC_IDS = Object.freeze([
  ...G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  ...G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS,
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G5A_U04_SLICE013_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "擴分、約分與最簡分數", primaryKnowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    knowledgePointIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID], supportClass: "A",
    mode: "numeric", publicQuestionMode: "numeric", representationTag: "fraction_simplification",
    representationTags: ["fraction", "reduction", "gcd", "simplest_fraction"],
    patternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
    allocationPolicy: "balanced_across_three_requested_roles", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "整數相除的分數商｜數字題", primaryKnowledgePointId: G5A_U04_QUOTIENT_CONTEXT_KP_ID,
    knowledgePointIds: [G5A_U04_QUOTIENT_CONTEXT_KP_ID], supportClass: "A",
    mode: "numeric", publicQuestionMode: "numeric", representationTag: "quotient_as_fraction",
    representationTags: ["fraction", "integer_division", "reduced_quotient"],
    patternSpecIds: [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID],
    allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
  {
    patternGroupId: G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "平均分配的分數商｜應用題", primaryKnowledgePointId: G5A_U04_QUOTIENT_CONTEXT_KP_ID,
    knowledgePointIds: [G5A_U04_QUOTIENT_CONTEXT_KP_ID], supportClass: "A",
    mode: "application", publicQuestionMode: "application", representationTag: "quotient_fraction_application",
    representationTags: ["application", "global_context", "equal_sharing", "fraction_quotient"],
    patternSpecIds: [G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID],
    allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null,
  },
]);

export const G5A_U04_SLICE013_ROWS = freeze([
  {
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "擴分、約分與最簡分數", canonicalNameZh: "擴分、約分與最簡分數",
    mode: "numeric", questionMode: "numeric", questionModes: ["numeric"], supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_NOT_APPLICABLE",
    canonicalPatternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
    canonicalPatternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
    patternGroupIds: [G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID],
    patternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F_SLICE013_CANDIDATE", productionUse: "full_product_w3_slice013_candidate",
  },
  {
    knowledgePointId: G5A_U04_QUOTIENT_CONTEXT_KP_ID,
    sourceId: G5A_U04_SOURCE_ID, unitCode: G5A_U04_UNIT_CODE, unitTitle: G5A_U04_UNIT_TITLE,
    displayName: "整數相除與平均分配的分數商", canonicalNameZh: "整數相除與平均分配的分數商",
    mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"], supportClass: "A",
    visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
    applicationClassification: "APPLICATION_REQUIRED",
    canonicalPatternGroupIds: [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID, G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID],
    canonicalPatternSpecIds: G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS,
    patternGroupIds: [G5A_U04_QUOTIENT_CONTEXT_NUMERIC_GROUP_ID, G5A_U04_QUOTIENT_CONTEXT_APPLICATION_GROUP_ID],
    patternSpecIds: G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS,
    qaStatusLabel: "P03F_SLICE013_CANDIDATE", productionUse: "full_product_w3_slice013_candidate",
  },
]);

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_GROUPS = Object.freeze(
  G5A_U04_SLICE013_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID),
);
export const G5A_U04_EXPAND_REDUCE_SIMPLEST_ROWS = Object.freeze(
  G5A_U04_SLICE013_ROWS.filter((row) => row.knowledgePointId === G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID),
);

export const G5A_U04_EXPAND_REDUCE_SIMPLEST_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice013Implementation", sourceId: G5A_U04_SOURCE_ID,
  status: "TWO_W3_KP_NUMERIC_APPLICATION_PUBLIC_D0_CANDIDATE",
  knowledgePointCount: 2, patternGroupCount: 3, patternSpecCount: 5,
  excludedKnowledgePointIds: [
    "kp_g5a_u04_common_denominator",
    "kp_g5a_u04_divisibility_supported_reduction",
    "kp_g5a_u04_unlike_fraction_compare",
    "kp_g5a_u04_fraction_measurement_segments",
    "kp_g5a_u04_equivalent_mixed_selection",
  ],
  publicSelectionEnabled: true, sharedPipelineRequired: true, applicationModeAllowed: true,
});

export function listG5AU04ExpandReduceSimplestSelectorRows() { return clone(G5A_U04_SLICE013_ROWS); }
export function getG5AU04ExpandReduceSimplestSelectorRow(id) { return clone(G5A_U04_SLICE013_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG5AU04ExpandReduceSimplestPatternGroups(id) { return clone(G5A_U04_SLICE013_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG5AU04ExpandReduceSimplestPatternSpecIds(id, mode = null) {
  return listG5AU04ExpandReduceSimplestPatternGroups(id)
    .filter((row) => !mode || row.publicQuestionMode === mode)
    .flatMap((row) => row.patternSpecIds);
}
export function auditG5AU04ExpandReduceSimplestSelectorProjection() {
  const errors = [];
  if (G5A_U04_SLICE013_ROWS.length !== 2) errors.push("P03F13_KP_COUNT_INVALID");
  if (G5A_U04_SLICE013_PATTERN_GROUPS.length !== 3) errors.push("P03F13_GROUP_COUNT_INVALID");
  if (G5A_U04_SLICE013_PATTERN_SPEC_IDS.length !== 5) errors.push("P03F13_SPEC_COUNT_INVALID");
  if (G5A_U04_SLICE013_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application").length !== 1) errors.push("P03F13_APPLICATION_GROUP_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 3, patternSpecs: 5 }) });
}
