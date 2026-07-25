import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds,
} from "./source-pattern-full-product-p01d2-extension.js";
import {
  G5A_U03_PATTERN_GROUPS,
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  G5A_U03_SOURCE_IDS,
} from "../registry/g5a-u03-factor-multiple-selector-projection.js";

const groupBySpecId = new Map(G5A_U03_PATTERN_GROUPS.flatMap((group) => (
  group.patternSpecIds.map((patternSpecId) => [patternSpecId, group])
)));

const operationBySpecId = Object.freeze({
  ps_g5a_u03a_relation_from_product: "relation_from_product",
  ps_g5a_u03a_complete_factor_multiple_statement: "complete_factor_multiple_statement",
  ps_g5a_u03a_divisibility_classification_23510: "divisibility_classification_23510",
  ps_g5a_u03a_missing_digit_divisibility: "missing_digit_divisibility",
  ps_g5a_u03a_exact_grouping_yes_no: "exact_grouping_yes_no",
  ps_g5a_u03a_exact_grouping_candidate_sizes: "exact_grouping_candidate_sizes",
  ps_g5a_u03a_enumerate_first_multiples: "enumerate_first_multiples",
  ps_g5a_u03a_enumerate_multiples_after: "enumerate_multiples_after",
  ps_g5a_u03a_list_multiples_in_interval: "list_multiples_in_interval",
  ps_g5a_u03a_nearest_multiple: "nearest_multiple",
  ps_g5a_u03a_count_multiples_in_interval: "count_multiples_in_interval",
  ps_g5a_u03a_nth_multiple: "nth_multiple",
  ps_g5a_u03a_classify_divisor_multiple: "classify_divisor_multiple",
  ps_g5a_u03a_partition_candidate_set: "partition_candidate_set",
  ps_g5a_u03a1_lcm_direct: "lcm_direct_grade5",
  ps_g5a_u03a1_first_common_multiples: "first_common_multiples",
  ps_g5a_u03a1_bounded_common_multiples: "bounded_common_multiples",
  ps_g5a_u03a1_count_common_multiples_interval: "count_common_multiples_interval",
  ps_g5a_u03a1_factor_multiple_statement_truth: "factor_multiple_statement_truth",
  ps_g5a_u03a1_choose_correct_relation_statement: "choose_correct_relation_statement",
  ps_g5a_u03a1_minimum_common_group_total: "minimum_common_group_total",
  ps_g5a_u03a1_possible_common_totals_in_range: "possible_common_totals_in_range",
  ps_g5a_u03a1_construct_number_divisibility: "construct_number_divisibility",
  ps_g5a_u03a1_possible_digits_for_divisibility: "possible_digits_for_divisibility",
});

const titleBySpecId = Object.freeze({
  ps_g5a_u03a_relation_from_product: "由乘積判定因數與倍數",
  ps_g5a_u03a_complete_factor_multiple_statement: "完整表達因數倍數關係",
  ps_g5a_u03a_divisibility_classification_23510: "判定2、3、5、10整除性",
  ps_g5a_u03a_missing_digit_divisibility: "由整除條件求缺失數字",
  ps_g5a_u03a_exact_grouping_yes_no: "判斷能否剛好分組",
  ps_g5a_u03a_exact_grouping_candidate_sizes: "選出可行分組規格",
  ps_g5a_u03a_enumerate_first_multiples: "列出前幾個倍數",
  ps_g5a_u03a_enumerate_multiples_after: "由指定倍數繼續列舉",
  ps_g5a_u03a_list_multiples_in_interval: "列出範圍內倍數",
  ps_g5a_u03a_nearest_multiple: "找最接近的倍數",
  ps_g5a_u03a_count_multiples_in_interval: "計算區間內倍數個數",
  ps_g5a_u03a_nth_multiple: "求第n個倍數",
  ps_g5a_u03a_classify_divisor_multiple: "判定因數或倍數角色",
  ps_g5a_u03a_partition_candidate_set: "分類因數倍數候選集合",
  ps_g5a_u03a1_lcm_direct: "直接求最小公倍數",
  ps_g5a_u03a1_first_common_multiples: "列出前幾個公倍數",
  ps_g5a_u03a1_bounded_common_multiples: "列出範圍內公倍數",
  ps_g5a_u03a1_count_common_multiples_interval: "計算區間內公倍數個數",
  ps_g5a_u03a1_factor_multiple_statement_truth: "判斷因數倍數語句正誤",
  ps_g5a_u03a1_choose_correct_relation_statement: "選出正確數學關係語句",
  ps_g5a_u03a1_minimum_common_group_total: "求兩種分組的最小共同總量",
  ps_g5a_u03a1_possible_common_totals_in_range: "列出範圍內共同總量",
  ps_g5a_u03a1_construct_number_divisibility: "用數字卡組成指定倍數",
  ps_g5a_u03a1_possible_digits_for_divisibility: "求符合整除條件的數字",
});

const definitions = Object.freeze(Object.fromEntries(G5A_U03_PATTERN_SPEC_IDS.map((patternSpecId) => {
  const group = groupBySpecId.get(patternSpecId);
  const operation = operationBySpecId[patternSpecId];
  return [patternSpecId, Object.freeze({
    patternSpecId,
    sourceId: group.sourceId,
    title: titleBySpecId[patternSpecId],
    kind: "g5aU03FactorMultiple",
    operation,
    knowledgePointId: group.primaryKnowledgePointId,
    patternGroupId: group.patternGroupId,
    canonicalSkillIds: Object.freeze([group.primaryKnowledgePointId]),
    skillTags: Object.freeze(["factor_multiple", group.representationTag, group.sourceId]),
    difficultyTags: Object.freeze(["full_product_w1", operation, "grade_5_factor_multiple"]),
    numericDomain: Object.freeze({ minimum: 1, maximum: 1200, requireSafeInteger: true }),
  })];
})));

const patternIdsBySource = Object.freeze(Object.fromEntries(G5A_U03_SOURCE_IDS.map((sourceId) => [
  sourceId,
  Object.freeze(G5A_U03_PATTERN_GROUPS.filter((group) => group.sourceId === sourceId).flatMap((group) => group.patternSpecIds)),
])));

export {
  G5A_U03_PATTERN_GROUPS,
  G5A_U03_PATTERN_SPEC_IDS,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
  G5A_U03_SOURCE_IDS,
};

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions[patternSpecId] ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  if (patternIdsBySource[sourceId]) return [...patternIdsBySource[sourceId]];
  return baseGetPatternIds(sourceId);
}

export function getP01D3PatternSpecIdsForSource(sourceId) {
  return [...(patternIdsBySource[sourceId] ?? [])];
}

export function validateP01D3PatternDefinitions() {
  const errors = [];
  if (Object.keys(definitions).length !== 24) errors.push("P01D3_PATTERN_DEFINITION_COUNT_INVALID");
  if (patternIdsBySource[G5A_U03_SOURCE_ID].length !== 14) errors.push("P01D3_MULTIPLE_PATTERN_COUNT_INVALID");
  if (patternIdsBySource[G5A_U03A1_SOURCE_ID].length !== 10) errors.push("P01D3_COMMON_MULTIPLE_PATTERN_COUNT_INVALID");
  for (const patternSpecId of G5A_U03_PATTERN_SPEC_IDS) {
    const definition = definitions[patternSpecId];
    if (!definition || !G5A_U03_SOURCE_IDS.includes(definition.sourceId)) errors.push(`P01D3_PATTERN_DEFINITION_MISSING:${patternSpecId}`);
    if (!definition?.knowledgePointId || !definition?.patternGroupId || !definition?.operation) errors.push(`P01D3_PATTERN_BINDING_INCOMPLETE:${patternSpecId}`);
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), patternSpecCount: G5A_U03_PATTERN_SPEC_IDS.length });
}
