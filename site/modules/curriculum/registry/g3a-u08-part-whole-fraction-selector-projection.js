export const G3A_U08_SOURCE_ID = "g3a_u08_3a08";
export const G3A_U08_UNIT_CODE = "3A-U08";
export const G3A_U08_UNIT_TITLE = "分數";
export const G3A_U08_PART_WHOLE_KP_ID = "kp_g3a_u08_part_whole_fraction";
export const G3A_U08_PART_WHOLE_PATTERN_GROUP_ID = "pg_g3a_u08_part_whole_fraction_numeric";
export const G3A_U08_PART_WHOLE_PATTERN_SPEC_ID = "ps_g3a_u08_part_whole_fraction_fraction_numeric";

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G3A_U08_PART_WHOLE_PATTERN_GROUPS = freeze([{
  patternGroupId: G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  sourceId: G3A_U08_SOURCE_ID,
  unitCode: G3A_U08_UNIT_CODE,
  unitTitle: G3A_U08_UNIT_TITLE,
  displayName: "等分整體與分數意義",
  primaryKnowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
  knowledgePointIds: [G3A_U08_PART_WHOLE_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "part_whole_fraction",
  representationTags: ["continuous_equal_partition", "discrete_set_partition"],
  patternSpecIds: [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID],
  allocationPolicy: "single_canonical_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G3A_U08_PART_WHOLE_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
  sourceId: G3A_U08_SOURCE_ID,
  unitCode: G3A_U08_UNIT_CODE,
  unitTitle: G3A_U08_UNIT_TITLE,
  displayName: "等分整體與分數意義",
  canonicalNameZh: "等分整體與分數意義",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G3A_U08_PART_WHOLE_PATTERN_GROUP_ID],
  canonicalPatternSpecIds: [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID],
  patternGroupIds: [G3A_U08_PART_WHOLE_PATTERN_GROUP_ID],
  patternSpecIds: [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID],
  qaStatusLabel: "P03F_SLICE001_D0",
  productionUse: "full_product_w3_slice001_production",
}]);

export const G3A_U08_PART_WHOLE_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice001Implementation",
  sourceId: G3A_U08_SOURCE_ID,
  status: "ONE_W3_KP_PUBLIC_D0_VERTICAL_SLICE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: 1,
  excludedKnowledgePointIds: [
    "kp_g3a_u08_unit_fraction_accumulation",
    "kp_g3a_u08_discrete_set_fraction",
    "kp_g3a_u08_measurement_fraction",
    "kp_g3a_u08_whole_as_fraction",
    "kp_g3a_u08_same_denominator_compare",
    "kp_g3a_u08_unlike_denominator_comparison_limit",
  ],
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
});

export function listG3AU08PartWholeSelectorRows() {
  return clone(G3A_U08_PART_WHOLE_KNOWLEDGE_POINT_ROWS);
}
export function getG3AU08PartWholeSelectorRow(knowledgePointId) {
  return knowledgePointId === G3A_U08_PART_WHOLE_KP_ID
    ? clone(G3A_U08_PART_WHOLE_KNOWLEDGE_POINT_ROWS[0])
    : null;
}
export function listG3AU08PartWholePatternGroups(knowledgePointId) {
  return knowledgePointId === G3A_U08_PART_WHOLE_KP_ID
    ? clone(G3A_U08_PART_WHOLE_PATTERN_GROUPS)
    : [];
}
export function resolveG3AU08PartWholePatternSpecIds(knowledgePointId) {
  return knowledgePointId === G3A_U08_PART_WHOLE_KP_ID
    ? [G3A_U08_PART_WHOLE_PATTERN_SPEC_ID]
    : [];
}
export function auditG3AU08PartWholeSelectorProjection() {
  const errors = [];
  if (G3A_U08_PART_WHOLE_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F_KP_COUNT_INVALID");
  if (G3A_U08_PART_WHOLE_PATTERN_GROUPS.length !== 1) errors.push("P03F_GROUP_COUNT_INVALID");
  if (G3A_U08_PART_WHOLE_PATTERN_GROUPS[0].patternSpecIds.length !== 1) errors.push("P03F_SPEC_COUNT_INVALID");
  if (G3A_U08_PART_WHOLE_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 }),
  });
}
