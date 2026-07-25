export const G5A_U03_SOURCE_ID = "g5a_u03_5a03a";
export const G5A_U03A1_SOURCE_ID = "g5a_u03_5a03a1";
export const G5A_U03_SOURCE_IDS = Object.freeze([G5A_U03_SOURCE_ID, G5A_U03A1_SOURCE_ID]);

const freeze = (value) => {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

const groupRows = [
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_factor_multiple_relation", "乘法算式中的因數倍數關係", "kp_g5a_u03a_factor_multiple_relation", "factor_multiple_relation", ["ps_g5a_u03a_relation_from_product", "ps_g5a_u03a_complete_factor_multiple_statement"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_divisibility_rules", "2、3、5、10 的倍數判別", "kp_g5a_u03a_divisibility_rules", "divisibility_rules", ["ps_g5a_u03a_divisibility_classification_23510", "ps_g5a_u03a_missing_digit_divisibility"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_exact_grouping_feasibility", "整除分組方案可行性", "kp_g5a_u03a_exact_grouping_feasibility", "exact_grouping", ["ps_g5a_u03a_exact_grouping_yes_no", "ps_g5a_u03a_exact_grouping_candidate_sizes"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_multiple_identify_enumerate", "倍數辨識與列舉", "kp_g5a_u03a_multiple_identify_enumerate", "multiple_enumeration", ["ps_g5a_u03a_enumerate_first_multiples", "ps_g5a_u03a_enumerate_multiples_after"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_bounded_or_nearest_multiple", "範圍內與最接近的倍數", "kp_g5a_u03a_bounded_or_nearest_multiple", "bounded_nearest_multiple", ["ps_g5a_u03a_list_multiples_in_interval", "ps_g5a_u03a_nearest_multiple"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_count_multiples_interval", "區間內倍數個數", "kp_g5a_u03a_count_multiples_interval", "multiple_count", ["ps_g5a_u03a_count_multiples_in_interval", "ps_g5a_u03a_nth_multiple"]],
  [G5A_U03_SOURCE_ID, "pg_g5a_u03a_divisor_multiple_classification", "因數與倍數集合分類", "kp_g5a_u03a_divisor_multiple_classification", "divisor_multiple_classification", ["ps_g5a_u03a_classify_divisor_multiple", "ps_g5a_u03a_partition_candidate_set"]],
  [G5A_U03A1_SOURCE_ID, "pg_g5a_u03a1_common_multiple_lcm", "公倍數與最小公倍數", "kp_g5a_u03a1_common_multiple_lcm", "common_multiple_lcm", ["ps_g5a_u03a1_lcm_direct", "ps_g5a_u03a1_first_common_multiples"]],
  [G5A_U03A1_SOURCE_ID, "pg_g5a_u03a1_bounded_common_multiples", "指定範圍內的公倍數", "kp_g5a_u03a1_bounded_common_multiples", "bounded_common_multiples", ["ps_g5a_u03a1_bounded_common_multiples", "ps_g5a_u03a1_count_common_multiples_interval"]],
  [G5A_U03A1_SOURCE_ID, "pg_g5a_u03a1_factor_multiple_language", "因數倍數公倍數語句辨識", "kp_g5a_u03a1_factor_multiple_language", "factor_multiple_language", ["ps_g5a_u03a1_factor_multiple_statement_truth", "ps_g5a_u03a1_choose_correct_relation_statement"]],
  [G5A_U03A1_SOURCE_ID, "pg_g5a_u03a1_grouping_constraints", "兩種分組規格的共同總量", "kp_g5a_u03a1_grouping_constraints", "common_grouping_constraints", ["ps_g5a_u03a1_minimum_common_group_total", "ps_g5a_u03a1_possible_common_totals_in_range"]],
  [G5A_U03A1_SOURCE_ID, "pg_g5a_u03a1_number_constraint_construction", "倍數條件的數字組成", "kp_g5a_u03a1_number_constraint_construction", "number_constraint_construction", ["ps_g5a_u03a1_construct_number_divisibility", "ps_g5a_u03a1_possible_digits_for_divisibility"]],
];

export const G5A_U03_PATTERN_GROUPS = freeze(groupRows.map(([sourceId, patternGroupId, displayName, primaryKnowledgePointId, representationTag, patternSpecIds]) => ({
  patternGroupId,
  sourceId,
  unitCode: sourceId === G5A_U03_SOURCE_ID ? "5A-U03A" : "5A-U03A1",
  unitTitle: sourceId === G5A_U03_SOURCE_ID ? "倍數" : "公倍數",
  displayName,
  primaryKnowledgePointId,
  knowledgePointIds: [primaryKnowledgePointId],
  supportClass: "A",
  mode: "numeric",
  publicQuestionMode: "numeric",
  representationTag,
  representationTags: [representationTag, "factor_multiple"],
  patternSpecIds,
  allocationPolicy: "balanced_by_pattern_spec",
  visibilityStatus: "visible",
  holdReason: null,
})));

const GROUPS_BY_KP = new Map(G5A_U03_PATTERN_GROUPS.map((group) => [group.primaryKnowledgePointId, Object.freeze([group])]));

export const G5A_U03_KNOWLEDGE_POINT_ROWS = freeze(G5A_U03_PATTERN_GROUPS.map((group) => ({
  knowledgePointId: group.primaryKnowledgePointId,
  sourceId: group.sourceId,
  unitCode: group.unitCode,
  unitTitle: group.unitTitle,
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

const ROW_BY_ID = new Map(G5A_U03_KNOWLEDGE_POINT_ROWS.map((row) => [row.knowledgePointId, row]));
const ROWS_BY_SOURCE = new Map(G5A_U03_SOURCE_IDS.map((sourceId) => [sourceId, G5A_U03_KNOWLEDGE_POINT_ROWS.filter((row) => row.sourceId === sourceId)]));
export const G5A_U03_PATTERN_SPEC_IDS = freeze([...new Set(G5A_U03_PATTERN_GROUPS.flatMap((group) => group.patternSpecIds))]);

export const G5A_U03_SELECTOR_PROJECTION = freeze({
  taskId: "P01D3_G5AU03FactorMultipleVerticalSlice",
  sourceIds: G5A_U03_SOURCE_IDS,
  status: "TWELVE_W1_KPS_RUNTIME_VERTICAL_SLICE",
  knowledgePointCount: G5A_U03_KNOWLEDGE_POINT_ROWS.length,
  patternGroupCount: G5A_U03_PATTERN_GROUPS.length,
  patternSpecCount: G5A_U03_PATTERN_SPEC_IDS.length,
  publicSelectionEnabled: false,
  publicSelectionCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
  sharedPipelineRequired: true,
});

export function listG5AU03SelectorRows(sourceId = null) { return clone(sourceId ? (ROWS_BY_SOURCE.get(sourceId) ?? []) : G5A_U03_KNOWLEDGE_POINT_ROWS); }
export function getG5AU03SelectorRow(knowledgePointId) { return clone(ROW_BY_ID.get(knowledgePointId) ?? null); }
export function listG5AU03SelectorPatternGroups(knowledgePointId) { return clone(GROUPS_BY_KP.get(knowledgePointId) ?? []); }
export function resolveG5AU03SelectorPatternSpecIds(knowledgePointId) { return [...new Set(listG5AU03SelectorPatternGroups(knowledgePointId).flatMap((group) => group.patternSpecIds ?? []))]; }

export function auditG5AU03SelectorProjection() {
  const errors = [];
  const rowIds = G5A_U03_KNOWLEDGE_POINT_ROWS.map((row) => row.knowledgePointId);
  const groupIds = G5A_U03_PATTERN_GROUPS.map((group) => group.patternGroupId);
  if (rowIds.length !== 12 || new Set(rowIds).size !== 12) errors.push("G5A_U03_KP_COUNT_OR_IDENTITY_INVALID");
  if (groupIds.length !== 12 || new Set(groupIds).size !== 12) errors.push("G5A_U03_PATTERN_GROUP_COUNT_OR_IDENTITY_INVALID");
  if (G5A_U03_PATTERN_SPEC_IDS.length !== 24) errors.push("G5A_U03_PATTERN_SPEC_COUNT_INVALID");
  if ((ROWS_BY_SOURCE.get(G5A_U03_SOURCE_ID)?.length ?? 0) !== 7 || (ROWS_BY_SOURCE.get(G5A_U03A1_SOURCE_ID)?.length ?? 0) !== 5) errors.push("G5A_U03_SOURCE_KP_SPLIT_INVALID");
  if (G5A_U03_KNOWLEDGE_POINT_ROWS.some((row) => row.visibilityStatus !== "visible" || row.holdReason !== null)) errors.push("G5A_U03_KP_VISIBILITY_INVALID");
  if (G5A_U03_KNOWLEDGE_POINT_ROWS.some((row) => listG5AU03SelectorPatternGroups(row.knowledgePointId).length !== 1)) errors.push("G5A_U03_KP_GROUP_BINDING_INVALID");
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), counts: Object.freeze({ knowledgePoints: rowIds.length, patternGroups: groupIds.length, patternSpecs: G5A_U03_PATTERN_SPEC_IDS.length, sourceNodes: 2 }) });
}
