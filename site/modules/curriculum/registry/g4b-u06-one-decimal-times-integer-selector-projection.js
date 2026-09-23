export const G4B_U06_SOURCE_ID = "g4b_u06_4b06";
export const G4B_U06_UNIT_CODE = "4B-U06";
export const G4B_U06_UNIT_TITLE = "小數乘法";
export const G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID = "kp_g4b_u06_one_decimal_times_integer";
export const G4B_U06_NUMERIC_GROUP_ID = "pg_g4b_u06_one_decimal_times_integer_numeric";
export const G4B_U06_APPLICATION_GROUP_ID = "pg_g4b_u06_one_decimal_times_integer_application";
export const G4B_U06_NUMERIC_SPEC_ID = "ps_g4b_u06_one_decimal_times_integer_product_numeric";
export const G4B_U06_APPLICATION_SPEC_ID = "ps_g4b_u06_one_decimal_times_integer_product_application";
export const G4B_U06_PATTERN_SPEC_IDS = Object.freeze([G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID]);

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; for (const nested of Object.values(value)) freeze(nested); return Object.freeze(value); };

export const G4B_U06_PATTERN_GROUPS = freeze([
  { patternGroupId: G4B_U06_NUMERIC_GROUP_ID, sourceId: G4B_U06_SOURCE_ID, unitCode: G4B_U06_UNIT_CODE, unitTitle: G4B_U06_UNIT_TITLE, displayName: "一位小數乘整數｜數字題", primaryKnowledgePointId: G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, knowledgePointIds: [G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID], supportClass: "A", mode: "numeric", publicQuestionMode: "numeric", representationTag: "decimal_multiplication_numeric", representationTags: ["one_decimal", "integer_factor", "exact_product"], patternSpecIds: [G4B_U06_NUMERIC_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null },
  { patternGroupId: G4B_U06_APPLICATION_GROUP_ID, sourceId: G4B_U06_SOURCE_ID, unitCode: G4B_U06_UNIT_CODE, unitTitle: G4B_U06_UNIT_TITLE, displayName: "一位小數乘整數｜應用題", primaryKnowledgePointId: G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, knowledgePointIds: [G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID], supportClass: "A", mode: "application", publicQuestionMode: "application", representationTag: "decimal_multiplication_application", representationTags: ["application", "global_context", "charity_donation", "quantity_per_package"], patternSpecIds: [G4B_U06_APPLICATION_SPEC_ID], allocationPolicy: "single_canonical_pattern_spec", visibilityStatus: "visible", holdReason: null }
]);

export const G4B_U06_KNOWLEDGE_POINT_ROWS = freeze([{
  knowledgePointId: G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, sourceId: G4B_U06_SOURCE_ID, unitCode: G4B_U06_UNIT_CODE, unitTitle: G4B_U06_UNIT_TITLE, displayName: "一位小數乘整數", canonicalNameZh: "一位小數乘整數", mode: "mixed", questionMode: "numeric", questionModes: ["numeric", "application"], supportClass: "A", visibilityStatus: "visible", selectorStatus: "visible", holdReason: null, applicationClassification: "APPLICATION_COMPATIBLE", canonicalPatternGroupIds: [G4B_U06_NUMERIC_GROUP_ID, G4B_U06_APPLICATION_GROUP_ID], canonicalPatternSpecIds: [...G4B_U06_PATTERN_SPEC_IDS], patternGroupIds: [G4B_U06_NUMERIC_GROUP_ID, G4B_U06_APPLICATION_GROUP_ID], patternSpecIds: [...G4B_U06_PATTERN_SPEC_IDS], qaStatusLabel: "P03F11_SLICE011_E4", productionUse: "full_product_w3_slice011_candidate"
}]);

export const G4B_U06_SELECTOR_PROJECTION = freeze({ taskId: "P03F_W3DirectProductVerticalSlice011Implementation", sourceId: G4B_U06_SOURCE_ID, status: "ONE_W3_KP_NUMERIC_APPLICATION_CANDIDATE_VERTICAL_SLICE", knowledgePointCount: 1, patternGroupCount: 2, patternSpecCount: 2, excludedKnowledgePointIds: ["kp_g4b_u06_two_decimal_times_integer", "kp_g4b_u06_integer_times_decimal", "kp_g4b_u06_decimal_rate_context", "kp_g4b_u06_missing_digit_decimal_multiplication", "kp_g4b_u06_decimal_multiplication_estimation"], publicSelectionEnabled: true, sharedPipelineRequired: true, applicationModeAllowed: true });

export function listG4BU06SelectorRows() { return clone(G4B_U06_KNOWLEDGE_POINT_ROWS); }
export function getG4BU06SelectorRow(id) { return id === G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID ? clone(G4B_U06_KNOWLEDGE_POINT_ROWS[0]) : null; }
export function listG4BU06PatternGroups(id) { return id === G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID ? clone(G4B_U06_PATTERN_GROUPS) : []; }
export function resolveG4BU06PatternSpecIds(id, mode = null) { return listG4BU06PatternGroups(id).filter((row) => !mode || row.publicQuestionMode === mode).flatMap((row) => row.patternSpecIds); }
export function auditG4BU06SelectorProjection() { const errors = []; if (G4B_U06_KNOWLEDGE_POINT_ROWS.length !== 1) errors.push("P03F11_KP_COUNT_INVALID"); if (G4B_U06_PATTERN_GROUPS.length !== 2) errors.push("P03F11_GROUP_COUNT_INVALID"); if (G4B_U06_PATTERN_SPEC_IDS.length !== 2) errors.push("P03F11_SPEC_COUNT_INVALID"); if (G4B_U06_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application").length !== 1) errors.push("P03F11_APPLICATION_GROUP_INVALID"); return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 2, patternSpecs: 2 }) }); }
