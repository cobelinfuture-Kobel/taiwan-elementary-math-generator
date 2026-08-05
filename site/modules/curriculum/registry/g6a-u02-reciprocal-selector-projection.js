export const G6A_U02_SOURCE_ID = "g6a_u02_6a02";
export const G6A_U02_UNIT_CODE = "6A-U02";
export const G6A_U02_UNIT_TITLE = "分數除法";
export const G6A_U02_RECIPROCAL_KP_ID = "kp_g6a_u02_reciprocal_concept";
export const G6A_U02_RECIPROCAL_GROUP_ID = "pg_g6a_u02_reciprocal_concept_numeric";
export const G6A_U02_RECIPROCAL_SPEC_IDS = Object.freeze([
  "ps_g6a_u02_fraction_reciprocal_numeric",
  "ps_g6a_u02_integer_reciprocal_numeric",
  "ps_g6a_u02_reciprocal_identity_missing_factor_numeric",
]);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const freeze = (value) => { if (!value || typeof value !== "object" || Object.isFrozen(value)) return value; Object.values(value).forEach(freeze); return Object.freeze(value); };
export const G6A_U02_RECIPROCAL_PATTERN_GROUPS = freeze([{
  patternGroupId: G6A_U02_RECIPROCAL_GROUP_ID, sourceId: G6A_U02_SOURCE_ID,
  unitCode: G6A_U02_UNIT_CODE, unitTitle: G6A_U02_UNIT_TITLE, displayName: "倒數概念",
  primaryKnowledgePointId: G6A_U02_RECIPROCAL_KP_ID, knowledgePointIds: [G6A_U02_RECIPROCAL_KP_ID],
  supportClass: "A", mode: "numeric", publicQuestionMode: "numeric", representationTag: "fraction_reciprocal",
  representationTags: ["fraction", "reciprocal", "multiplicative_identity"], patternSpecIds: G6A_U02_RECIPROCAL_SPEC_IDS,
  allocationPolicy: "balanced_numeric_patterns", visibilityStatus: "visible", holdReason: null,
}]);
export const G6A_U02_RECIPROCAL_ROWS = freeze([{
  knowledgePointId: G6A_U02_RECIPROCAL_KP_ID, sourceId: G6A_U02_SOURCE_ID,
  unitCode: G6A_U02_UNIT_CODE, unitTitle: G6A_U02_UNIT_TITLE, displayName: "倒數概念", canonicalNameZh: "倒數概念",
  mode: "numeric", questionMode: "numeric", questionModes: ["numeric"], supportClass: "A",
  visibilityStatus: "visible", selectorStatus: "visible", holdReason: null,
  applicationClassification: "APPLICATION_COMPATIBLE_BUT_NOT_ADMITTED",
  canonicalPatternGroupIds: [G6A_U02_RECIPROCAL_GROUP_ID], canonicalPatternSpecIds: G6A_U02_RECIPROCAL_SPEC_IDS,
  patternGroupIds: [G6A_U02_RECIPROCAL_GROUP_ID], patternSpecIds: G6A_U02_RECIPROCAL_SPEC_IDS,
  qaStatusLabel: "P03F_SLICE023_CANDIDATE", productionUse: "full_product_w3_slice023_candidate",
}]);
export function getG6AU02ReciprocalSelectorRow(id) { return clone(G6A_U02_RECIPROCAL_ROWS.find((row) => row.knowledgePointId === id) ?? null); }
export function listG6AU02ReciprocalPatternGroups(id) { return clone(G6A_U02_RECIPROCAL_PATTERN_GROUPS.filter((row) => row.primaryKnowledgePointId === id)); }
export function resolveG6AU02ReciprocalPatternSpecIds(id) { return listG6AU02ReciprocalPatternGroups(id).flatMap((row) => row.patternSpecIds); }
export function auditG6AU02ReciprocalSelectorProjection() {
  const errors = [];
  if (G6A_U02_RECIPROCAL_ROWS.length !== 1) errors.push("P03F23_KP_COUNT_INVALID");
  if (G6A_U02_RECIPROCAL_PATTERN_GROUPS.length !== 1) errors.push("P03F23_GROUP_COUNT_INVALID");
  if (G6A_U02_RECIPROCAL_SPEC_IDS.length !== 3) errors.push("P03F23_SPEC_COUNT_INVALID");
  if (G6A_U02_RECIPROCAL_PATTERN_GROUPS.some((row) => row.publicQuestionMode !== "numeric")) errors.push("P03F23_APPLICATION_MODE_LEAK");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: 1, patternGroups: 1, patternSpecs: 3 }) });
}
