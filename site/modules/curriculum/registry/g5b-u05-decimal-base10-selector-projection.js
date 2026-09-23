export const G5B_U05_DECIMAL_BASE10_SOURCE_ID = "g5b_u05_5b05a";
export const G5B_U05_DECIMAL_BASE10_UNIT_CODE = "5B-U05";
export const G5B_U05_DECIMAL_BASE10_UNIT_TITLE = "數的十進位結構與億以上的數";
export const G5B_U05_DECIMAL_BASE10_KP_ID = "kp_g5b_u05a_decimal_base10_structure";
export const G5B_U05_DECIMAL_BASE10_GROUP_ID = "pg_g5b_u05a_decimal_base10_structure_numeric";
export const G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g5b_u05a_decimal_base10_adjacent_place_relation",
  "ps_g5b_u05a_decimal_base10_cross_decimal_point_relation",
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G5B_U05_DECIMAL_BASE10_PATTERN_GROUPS = freeze([{
  patternGroupId: G5B_U05_DECIMAL_BASE10_GROUP_ID,
  sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  unitCode: G5B_U05_DECIMAL_BASE10_UNIT_CODE,
  unitTitle: G5B_U05_DECIMAL_BASE10_UNIT_TITLE,
  displayName: "整數與小數的十進位結構",
  primaryKnowledgePointId: G5B_U05_DECIMAL_BASE10_KP_ID,
  knowledgePointIds: [G5B_U05_DECIMAL_BASE10_KP_ID],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag: "decimal_base10_place_relation",
  representationTags: ["place_value", "adjacent_place_relation", "decimal_point_boundary"],
  patternSpecIds: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
  allocationPolicy: "balanced_by_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
}]);

export const G5B_U05_DECIMAL_BASE10_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G5B_U05_DECIMAL_BASE10_KP_ID,
  sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  unitCode: G5B_U05_DECIMAL_BASE10_UNIT_CODE,
  unitTitle: G5B_U05_DECIMAL_BASE10_UNIT_TITLE,
  displayName: "整數小數十進位結構",
  canonicalNameZh: "整數小數十進位結構",
  mode: "numeric",
  questionMode: "numeric",
  supportClass: "A",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  applicationClassification: "APPLICATION_NOT_APPLICABLE",
  canonicalPatternGroupIds: [G5B_U05_DECIMAL_BASE10_GROUP_ID],
  canonicalPatternSpecIds: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
  patternGroupIds: [G5B_U05_DECIMAL_BASE10_GROUP_ID],
  patternSpecIds: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
  qaStatusLabel: "P03F14_SLICE014_E4",
  productionUse: "full_product_w3_slice014_candidate",
}]);

export const G5B_U05_DECIMAL_BASE10_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice014Implementation",
  sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  status: "ONE_W3_KP_ADDED_TO_EXISTING_W1_PUBLIC_SOURCE",
  knowledgePointCount: 1,
  patternGroupCount: 1,
  patternSpecCount: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.length,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  applicationModeAllowed: false,
  sourceEvidence: Object.freeze({
    canonicalNameZh: "整數小數十進位結構",
    capabilityStatement: "學生能連結整數位與小數位的10倍、十分之一關係。",
    reasoningInvariant: "小數點兩側相鄰位值均維持10倍關係。",
    evidencePages: Object.freeze([1]),
  }),
});

export function listG5BU05DecimalBase10SelectorRows() { return clone(G5B_U05_DECIMAL_BASE10_KNOWLEDGE_POINT_ROWS); }
export function getG5BU05DecimalBase10SelectorRow(knowledgePointId) {
  return knowledgePointId === G5B_U05_DECIMAL_BASE10_KP_ID ? clone(G5B_U05_DECIMAL_BASE10_KNOWLEDGE_POINT_ROWS[0]) : null;
}
export function listG5BU05DecimalBase10PatternGroups(knowledgePointId) {
  return knowledgePointId === G5B_U05_DECIMAL_BASE10_KP_ID ? clone(G5B_U05_DECIMAL_BASE10_PATTERN_GROUPS) : [];
}
export function resolveG5BU05DecimalBase10PatternSpecIds(knowledgePointId) {
  return knowledgePointId === G5B_U05_DECIMAL_BASE10_KP_ID ? [...G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS] : [];
}
export function auditG5BU05DecimalBase10SelectorProjection() {
  const errors = [];
  if (G5B_U05_DECIMAL_BASE10_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F14_KP_COUNT_INVALID");
  if (G5B_U05_DECIMAL_BASE10_PATTERN_GROUPS.length !== 1) errors.push("P03F14_GROUP_COUNT_INVALID");
  if (G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.length !== 2) errors.push("P03F14_PATTERN_COUNT_INVALID");
  if (G5B_U05_DECIMAL_BASE10_PATTERN_GROUPS[0].publicQuestionMode !== "numeric") errors.push("P03F14_APPLICATION_SCOPE_VIOLATION");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 2 }) });
}
