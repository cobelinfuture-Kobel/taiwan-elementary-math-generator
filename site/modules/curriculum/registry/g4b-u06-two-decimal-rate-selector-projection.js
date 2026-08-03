export const G4B_U06_SLICE019_SOURCE_ID = "g4b_u06_4b06";
export const G4B_U06_SLICE019_UNIT_CODE = "4B-U06";
export const G4B_U06_SLICE019_UNIT_TITLE = "小數乘法";

export const G4B_U06_TWO_DECIMAL_KP_ID = "kp_g4b_u06_two_decimal_times_integer";
export const G4B_U06_RATE_TOTAL_KP_ID = "kp_g4b_u06_rate_distance_context";

export const G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID = "pg_g4b_u06_two_decimal_times_integer_numeric";
export const G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID = "pg_g4b_u06_two_decimal_times_integer_application";
export const G4B_U06_RATE_NUMERIC_GROUP_ID = "pg_g4b_u06_rate_distance_context_numeric";
export const G4B_U06_RATE_APPLICATION_GROUP_ID = "pg_g4b_u06_rate_distance_context_application";

export const G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID = "ps_g4b_u06_two_decimal_times_integer_product_numeric";
export const G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID = "ps_g4b_u06_two_decimal_times_integer_product_application";
export const G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID = "ps_g4b_u06_rate_distance_context_total_numeric";
export const G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID = "ps_g4b_u06_rate_distance_context_combined_numeric";
export const G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID = "ps_g4b_u06_rate_distance_context_total_application";
export const G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID = "ps_g4b_u06_rate_distance_context_combined_application";

export const G4B_U06_SLICE019_PATTERN_SPEC_IDS = Object.freeze([
  G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID,
  G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID,
  G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID,
  G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID,
]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};

export const G4B_U06_SLICE019_PATTERN_GROUPS = freeze([
  {
    patternGroupId: G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "二位小數乘整數｜數字題",
    primaryKnowledgePointId: G4B_U06_TWO_DECIMAL_KP_ID,
    knowledgePointIds: [G4B_U06_TWO_DECIMAL_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "two_decimal_times_integer_numeric",
    representationTags: ["decimal", "multiplication", "hundredths", "exact_product"],
    patternSpecIds: [G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID],
    allocationPolicy: "single_canonical_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "二位小數乘整數｜應用題",
    primaryKnowledgePointId: G4B_U06_TWO_DECIMAL_KP_ID,
    knowledgePointIds: [G4B_U06_TWO_DECIMAL_KP_ID],
    supportClass: "A",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "two_decimal_times_integer_application",
    representationTags: ["decimal", "multiplication", "application", "disaster_preparedness"],
    patternSpecIds: [G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID],
    allocationPolicy: "single_canonical_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G4B_U06_RATE_NUMERIC_GROUP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "小數單位率與總量｜數字題",
    primaryKnowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
    knowledgePointIds: [G4B_U06_RATE_TOTAL_KP_ID],
    supportClass: "A",
    mode: "numeric",
    publicQuestionMode: "numeric",
    representationTag: "decimal_rate_total_numeric",
    representationTags: ["decimal", "rate", "total", "combined"],
    patternSpecIds: [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID, G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
  {
    patternGroupId: G4B_U06_RATE_APPLICATION_GROUP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "小數單位率與總量｜應用題",
    primaryKnowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
    knowledgePointIds: [G4B_U06_RATE_TOTAL_KP_ID],
    supportClass: "A",
    mode: "application",
    publicQuestionMode: "application",
    representationTag: "decimal_rate_total_application",
    representationTags: ["decimal", "rate", "application", "global_context"],
    patternSpecIds: [G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID, G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID],
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
  },
]);

export const G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS = freeze([
  {
    knowledgePointId: G4B_U06_RATE_TOTAL_KP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "小數單位率與距離總量",
    canonicalNameZh: "小數單位率與距離總量",
    mode: "mixed",
    questionMode: "application",
    questionModes: ["numeric", "application"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_REQUIRED",
    canonicalPatternGroupIds: [G4B_U06_RATE_NUMERIC_GROUP_ID, G4B_U06_RATE_APPLICATION_GROUP_ID],
    canonicalPatternSpecIds: [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID, G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID, G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID, G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID],
    patternGroupIds: [G4B_U06_RATE_NUMERIC_GROUP_ID, G4B_U06_RATE_APPLICATION_GROUP_ID],
    patternSpecIds: [G4B_U06_RATE_TOTAL_NUMERIC_SPEC_ID, G4B_U06_RATE_COMBINED_NUMERIC_SPEC_ID, G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID, G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID],
    qaStatusLabel: "P03F19_SLICE019_IMPLEMENTATION",
    productionUse: "full_product_w3_slice019_candidate",
  },
  {
    knowledgePointId: G4B_U06_TWO_DECIMAL_KP_ID,
    sourceId: G4B_U06_SLICE019_SOURCE_ID,
    unitCode: G4B_U06_SLICE019_UNIT_CODE,
    unitTitle: G4B_U06_SLICE019_UNIT_TITLE,
    displayName: "二位小數乘整數",
    canonicalNameZh: "二位小數乘整數",
    mode: "mixed",
    questionMode: "numeric",
    questionModes: ["numeric", "application"],
    supportClass: "A",
    visibilityStatus: "visible",
    selectorStatus: "visible",
    holdReason: null,
    applicationClassification: "APPLICATION_COMPATIBLE",
    canonicalPatternGroupIds: [G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID, G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID],
    canonicalPatternSpecIds: [G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID, G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID],
    patternGroupIds: [G4B_U06_TWO_DECIMAL_NUMERIC_GROUP_ID, G4B_U06_TWO_DECIMAL_APPLICATION_GROUP_ID],
    patternSpecIds: [G4B_U06_TWO_DECIMAL_NUMERIC_SPEC_ID, G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID],
    qaStatusLabel: "P03F19_SLICE019_IMPLEMENTATION",
    productionUse: "full_product_w3_slice019_candidate",
  },
]);

export const G4B_U06_SLICE019_SELECTOR_PROJECTION = freeze({
  taskId: "P03F_W3DirectProductVerticalSlice019Implementation",
  sourceId: G4B_U06_SLICE019_SOURCE_ID,
  status: "TWO_W3_KPS_NUMERIC_APPLICATION_CORE_CANDIDATE",
  knowledgePointCount: 2,
  patternGroupCount: 4,
  patternSpecCount: 6,
  publicSelectionEnabled: true,
  sharedPipelineRequired: true,
  existingW02ContextCandidateCount: 3,
  applicationContextExpansionAllowed: false,
});

export function listG4BU06Slice019SelectorRows() { return clone(G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS); }
export function getG4BU06Slice019SelectorRow(id) { return clone(G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG4BU06Slice019PatternGroups(id) { return clone(G4B_U06_SLICE019_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG4BU06Slice019PatternSpecIds(id, mode = null) {
  return listG4BU06Slice019PatternGroups(id).filter((row) => !mode || row.publicQuestionMode === mode).flatMap((row) => row.patternSpecIds);
}
export function auditG4BU06Slice019SelectorProjection() {
  const errors = [];
  if (G4B_U06_SLICE019_KNOWLEDGE_POINT_ROWS.length !== 2) errors.push("P03F19_KP_COUNT_INVALID");
  if (G4B_U06_SLICE019_PATTERN_GROUPS.length !== 4) errors.push("P03F19_GROUP_COUNT_INVALID");
  if (new Set(G4B_U06_SLICE019_PATTERN_GROUPS.flatMap((row) => row.patternSpecIds)).size !== 6) errors.push("P03F19_SPEC_COUNT_INVALID");
  if (G4B_U06_SLICE019_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application").length !== 2) errors.push("P03F19_APPLICATION_GROUP_COUNT_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 2, patternGroups: 4, patternSpecs: 6 }) });
}
