export const G6A_U01_SOURCE_ID = "g6a_u01_6a01";
export const G6A_U01_UNIT_CODE = "6A-U01";
export const G6A_U01_UNIT_TITLE = "最大公因數與最小公倍數";

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const groups = [
  ["pg_g6a_u01_prime_composite_classification", "質數合數分類", "kp_g6a_u01_prime_composite_classification", "prime_composite_classification", ["ps_g6a_u01_classify_prime_composite_neither", "ps_g6a_u01_list_primes_in_interval"]],
  ["pg_g6a_u01_prime_factorization", "質因數分解", "kp_g6a_u01_prime_factorization", "prime_factorization", ["ps_g6a_u01_prime_factorization_product", "ps_g6a_u01_prime_factorization_exponents"]],
  ["pg_g6a_u01_short_division_common_factors", "短除法分解共同因數", "kp_g6a_u01_short_division_common_factors", "short_division_common_factors", ["ps_g6a_u01_short_division_trace", "ps_g6a_u01_short_division_common_product"]],
  ["pg_g6a_u01_greatest_common_factor", "最大公因數", "kp_g6a_u01_greatest_common_factor", "greatest_common_factor", ["ps_g6a_u01_gcf_direct", "ps_g6a_u01_gcf_from_prime_exponents"]],
  ["pg_g6a_u01_least_common_multiple", "最小公倍數", "kp_g6a_u01_least_common_multiple", "least_common_multiple", ["ps_g6a_u01_lcm_direct", "ps_g6a_u01_lcm_from_prime_exponents"]],
];

export const G6A_U01_PATTERN_GROUPS = freeze(groups.map(([patternGroupId, displayName, primaryKnowledgePointId, representationTag, patternSpecIds]) => ({
  patternGroupId,
  sourceId: G6A_U01_SOURCE_ID,
  unitCode: G6A_U01_UNIT_CODE,
  unitTitle: G6A_U01_UNIT_TITLE,
  displayName,
  primaryKnowledgePointId,
  knowledgePointIds: [primaryKnowledgePointId],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag,
  representationTags: [representationTag, "number_theory"],
  patternSpecIds,
  allocationPolicy: "balanced_by_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
})));

const GROUPS_BY_KP = new Map(G6A_U01_PATTERN_GROUPS.map((group) => [group.primaryKnowledgePointId, Object.freeze([group])]));

export const G6A_U01_KNOWLEDGE_POINT_ROWS = freeze(G6A_U01_PATTERN_GROUPS.map((group) => ({
  knowledgePointId: group.primaryKnowledgePointId,
  sourceId: G6A_U01_SOURCE_ID,
  unitCode: G6A_U01_UNIT_CODE,
  unitTitle: G6A_U01_UNIT_TITLE,
  displayName: group.displayName,
  mode: "numeric",
  questionMode: "numeric",
  visibilityStatus: "visible",
  selectorStatus: "visible",
  holdReason: null,
  canonicalPatternGroupIds: [group.patternGroupId],
  canonicalPatternSpecIds: [...group.patternSpecIds],
  productionUse: "full_product_w1_production",
})));

const ROW_BY_ID = new Map(G6A_U01_KNOWLEDGE_POINT_ROWS.map((row) => [row.knowledgePointId, row]));

export const G6A_U01_PATTERN_SPEC_IDS = freeze([...new Set(G6A_U01_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds))]);

export const G6A_U01_SELECTOR_PROJECTION = freeze({
  taskId: "P01D2_G6AU01NumberTheoryVerticalSlice",
  sourceId: G6A_U01_SOURCE_ID,
  status: "FIVE_W1_KPS_RUNTIME_VERTICAL_SLICE",
  knowledgePointCount: G6A_U01_KNOWLEDGE_POINT_ROWS.length,
  patternGroupCount: G6A_U01_PATTERN_GROUPS.length,
  patternSpecCount: G6A_U01_PATTERN_SPEC_IDS.length,
  publicSelectionEnabled: false,
  publicSelectionCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
  sharedPipelineRequired: true,
});

export function listG6AU01SelectorRows() { return clone(G6A_U01_KNOWLEDGE_POINT_ROWS); }
export function getG6AU01SelectorRow(knowledgePointId) { return clone(ROW_BY_ID.get(knowledgePointId) ?? null); }
export function listG6AU01SelectorPatternGroups(knowledgePointId) { return clone(GROUPS_BY_KP.get(knowledgePointId) ?? []); }
export function resolveG6AU01SelectorPatternSpecIds(knowledgePointId) {
  return [...new Set(listG6AU01SelectorPatternGroups(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))];
}

export function auditG6AU01SelectorProjection() {
  const errors = [];
  const rowIds = G6A_U01_KNOWLEDGE_POINT_ROWS.map((row) => row.knowledgePointId);
  const groupIds = G6A_U01_PATTERN_GROUPS.map((group) => group.patternGroupId);
  if (rowIds.length !== 5 || new Set(rowIds).size !== 5) errors.push("G6A_U01_KP_COUNT_OR_IDENTITY_INVALID");
  if (groupIds.length !== 5 || new Set(groupIds).size !== 5) errors.push("G6A_U01_PATTERN_GROUP_COUNT_OR_IDENTITY_INVALID");
  if (G6A_U01_PATTERN_SPEC_IDS.length !== 10) errors.push("G6A_U01_PATTERN_SPEC_COUNT_INVALID");
  if (G6A_U01_KNOWLEDGE_POINT_ROWS.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("G6A_U01_KP_VISIBILITY_INVALID");
  if (G6A_U01_PATTERN_GROUPS.some((group) => group.visibilityStatus !== "visible" || group.holdReason !== null)) errors.push("G6A_U01_GROUP_VISIBILITY_INVALID");
  if (G6A_U01_KNOWLEDGE_POINT_ROWS.some((row) => listG6AU01SelectorPatternGroups(row.knowledgePointId).length !== 1)) errors.push("G6A_U01_KP_GROUP_BINDING_INVALID");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({ knowledgePoints: rowIds.length, patternGroups: groupIds.length, patternSpecs: G6A_U01_PATTERN_SPEC_IDS.length }),
  });
}
