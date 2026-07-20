import * as base from "./batch-a-selector-candidates.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const sourceIds = Object.freeze({ u01: "g3a_u01_3a01", u02: "g3a_u02_3a02", u03: "g3a_u03_3a03", u06: "g3a_u06_3a06", b01: "g3b_u01_3b01" });
const rows = Object.freeze([
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_4digit_compare", "pg_g3a_u01_4digit_compare", "ps_g3a_u01_4digit_compare", "四位數比大小", "integer_comparison", ["four_digit", "comparison", "within_10000"], "number_sense_comparison", "numeric_expression"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_number_to_chinese", "pg_g3a_u01_number_to_chinese", ["ps_g3a_u01_4digit_number_to_chinese_basic", "ps_g3a_u01_4digit_number_to_chinese_with_zero"], "四位數數字轉中文數字", "number_representation", ["four_digit", "chinese_numeral", "conversion"], "number_to_chinese", "conversion_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_chinese_to_number", "pg_g3a_u01_chinese_to_number", ["ps_g3a_u01_chinese_to_4digit_number_basic", "ps_g3a_u01_chinese_to_4digit_number_with_zero"], "中文數字轉四位數", "number_representation", ["four_digit", "chinese_numeral", "conversion"], "chinese_to_number", "conversion_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_digit_place_value_decomposition", "pg_g3a_u01_digit_place_value_decomposition", ["ps_g3a_u01_4digit_place_value_full_decomposition", "ps_g3a_u01_4digit_digit_value_identification", "ps_g3a_u01_4digit_same_digit_different_place"], "四位數位值分解與位值判讀", "place_value", ["four_digit", "decomposition", "digit_value"], "place_value_decomposition", "decomposition_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_place_value_composition", "pg_g3a_u01_place_value_composition", ["ps_g3a_u01_place_value_standard_composition", "ps_g3a_u01_place_value_nonstandard_composition", "ps_g3a_u01_place_value_partial_composition"], "四位數位值組合", "place_value", ["four_digit", "composition", "nonstandard_count"], "place_value_composition", "composition_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_place_value_unit_conversion", "pg_g3a_u01_place_value_unit_conversion", ["ps_g3a_u01_tens_to_hundreds_conversion", "ps_g3a_u01_hundreds_to_thousands_conversion", "ps_g3a_u01_money_place_value_exchange"], "四位數位值換算：十、百、千、金錢", "place_value", ["unit_conversion", "money", "base_10_exchange"], "place_value_unit_conversion", "unit_conversion_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_digit_arrangement_max_min", "pg_g3a_u01_digit_arrangement_max_min", ["ps_g3a_u01_digit_arrangement_max_4digit", "ps_g3a_u01_digit_arrangement_min_4digit_no_leading_zero", "ps_g3a_u01_digit_arrangement_max_min_pair"], "指定數字組成最大 / 最小四位數", "place_value_reasoning", ["digit_arrangement", "max_min", "no_leading_zero"], "digit_arrangement_max_min", "arrangement_prompt"],
  [sourceIds.u01, "3A-U01", "10000以內的數", "kp_g3a_u01_range_reasoning", "pg_g3a_u01_range_reasoning", ["ps_g3a_u01_4digit_range_compare_reasoning", "ps_g3a_u01_4digit_serial_number_range", "ps_g3a_u01_4digit_price_range_reasoning"], "四位數條件範圍推理", "place_value_reasoning", ["range", "comparison", "serial_number", "price"], "range_reasoning", "reasoning_prompt"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_estimate_nearest_thousand", "pg_g3a_u02_estimate_nearest_thousand", "ps_g3a_u02_estimate_nearest_thousand", "整千估算", "rounding_approximation", ["nearest_thousand"], "rounding", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_word_problem_estimation_add_sub", "pg_g3a_u02_word_problem_estimation_add_sub", "ps_g3a_u02_word_problem_estimation_add_sub", "加減應用題估算", "integer_add_sub_mixed", ["estimation", "word_problem"], "context_reasoning", "word_problem"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_add_missing_digit_operand", "pg_g3a_u02_add_missing_digit_operand", "ps_g3a_u02_add_missing_digit_operand", "加法缺位填空", "integer_add_sub_mixed", ["missing_digit", "addition"], "missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_missing_digit_operand", "pg_g3a_u02_sub_missing_digit_operand", "ps_g3a_u02_sub_missing_digit_operand", "減法缺位填空", "integer_add_sub_mixed", ["missing_digit", "subtraction"], "missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_add_missing_digit_equation", "pg_g3a_u02_add_missing_digit_equation", "ps_g3a_u02_add_missing_digit_equation", "加法等式缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "addition"], "missing_digit_equation", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_missing_digit_equation", "pg_g3a_u02_sub_missing_digit_equation", "ps_g3a_u02_sub_missing_digit_equation", "減法等式缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "subtraction"], "missing_digit_equation", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_sub_middle_missing_digit", "pg_g3a_u02_sub_middle_missing_digit", "ps_g3a_u02_sub_middle_missing_digit", "減法中間缺位填空", "integer_add_sub_mixed", ["missing_digit", "equation_reasoning", "sub_middle"], "sub_middle_missing_digit", "numeric_expression"],
  [sourceIds.u02, "3A-U02", "四位數的加減", "kp_g3a_u02_continuous_borrow_zero", "pg_g3a_u02_continuous_borrow_zero", "ps_g3a_u02_continuous_borrow_zero", "連續退位中間有 0", "integer_add_sub_mixed", ["subtraction", "continuous_borrow", "zero_borrow"], "continuous_borrow_zero", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "ps_g3a_u03_2digit_by_1digit_carry", "二位數乘以一位數", "integer_multiplication", ["two_digit", "one_digit", "carry"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_10_multiple_by_1digit", "pg_g3a_u03_10_multiple_by_1digit", "ps_g3a_u03_10_multiple_by_1digit", "10 的倍數乘以一位數", "integer_multiplication", ["ten_multiple", "one_digit"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_3digit_by_1digit", "pg_g3a_u03_3digit_by_1digit", "ps_g3a_u03_3digit_by_1digit", "三位數乘以一位數", "integer_multiplication", ["three_digit", "one_digit"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_consecutive_multiplication_two_step", "pg_g3a_u03_consecutive_multiplication_two_step", "ps_g3a_u03_consecutive_multiplication_two_step", "兩步驟連續乘法", "integer_multiplication", ["two_step", "multiplication"], "multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_consecutive_multiplication_two_step_word_problem", "pg_g3a_u03_consecutive_multiplication_two_step_word_problem", "ps_g3a_u03_consecutive_multiplication_two_step_word_problem", "兩步驟連續乘法應用題", "integer_multiplication", ["two_step", "multiplication", "word_problem"], "three_factor_product_word_problem", "word_problem"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_3digit_zero_middle_by_1digit", "pg_g3a_u03_3digit_zero_middle_by_1digit", "ps_g3a_u03_3digit_zero_middle_by_1digit", "三位數中間為0乘一位數", "integer_multiplication", ["three_digit", "zero_middle", "one_digit"], "zero_middle_multiplication", "numeric_expression"],
  [sourceIds.u03, "3A-U03", "乘法", "kp_g3a_u03_multiplication_missing_digit_inference", "pg_g3a_u03_multiplication_missing_digit_inference", "ps_g3a_u03_multiplication_missing_digit_inference", "乘法缺位推理", "integer_multiplication", ["missing_digit", "inference", "not_same_place"], "multiplication_missing_digit", "numeric_expression"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_exact_division_check", "pg_g3a_u06_exact_division_check", "ps_g3a_u06_exact_division_check", "二位數除以一位數整除", "integer_division_exact", ["two_digit", "one_digit", "exact_division"], "division", "numeric_expression"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_divisibility_exact_check", "pg_g3a_u06_divisibility_exact_check", "ps_g3a_u06_divisibility_exact_check", "整除檢查", "integer_division_exact", ["divisibility", "exact_division", "check"], "division", "word_problem"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_division_with_remainder", "pg_g3a_u06_division_with_remainder", "ps_g3a_u06_division_with_remainder", "二位數除以一位數有餘數", "integer_division_remainder", ["two_digit", "one_digit", "remainder", "division"], "division_with_remainder", "numeric_expression"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_quotative_division_packaging", "pg_g3a_u06_quotative_division_packaging", "ps_g3a_u06_quotative_division_packaging", "包含除：分裝", "division_word_problem", ["quotative_division", "packaging", "items_per_group", "word_problem"], "quotative_division_packaging", "word_problem"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_partitive_division_equal_sharing", "pg_g3a_u06_partitive_division_equal_sharing", "ps_g3a_u06_partitive_division_equal_sharing", "等分除：平分", "division_word_problem", ["partitive_division", "equal_sharing", "groups", "word_problem"], "partitive_division_equal_sharing", "word_problem"],
  [sourceIds.u06, "3A-U06", "二位數除以一位數", "kp_g3a_u06_parity_range_missing_digit", "pg_g3a_u06_parity_range_missing_digit", "ps_g3a_u06_parity_range_missing_digit", "奇偶數條件判斷", "parity_reasoning", ["parity", "range_condition", "missing_digit", "multiple_answers"], "parity_range_missing_digit", "reasoning_prompt"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_2digit_division_place_value_cases", "pg_g3b_u01_2digit_division_place_value_cases", ["ps_g3b_u01_2digit_by_1digit_regroup_tens", "ps_g3b_u01_2digit_leading_digit_insufficient", "ps_g3b_u01_2digit_leading_digit_exact"], "二位數除以一位數商位判斷", "integer_division_exact", ["two_digit", "one_digit", "place_value", "quotient_digit"], "division_place_value_cases", "numeric_expression"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_3digit_by_1digit_regroup_hundreds", "pg_g3b_u01_3digit_by_1digit_regroup_hundreds", "ps_g3b_u01_3digit_by_1digit_regroup_hundreds", "三位數除以一位數", "integer_division_exact", ["three_digit", "one_digit", "division"], "division", "numeric_expression"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_3digit_division_place_value_cases", "pg_g3b_u01_3digit_division_place_value_cases", ["ps_g3b_u01_3digit_hundreds_insufficient", "ps_g3b_u01_3digit_hundreds_exact"], "三位數除以一位數商位判斷", "integer_division_exact", ["three_digit", "one_digit", "place_value", "quotient_digit"], "division_place_value_cases", "numeric_expression"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_quotient_zero_cases", "pg_g3b_u01_quotient_zero_cases", ["ps_g3b_u01_2digit_ones_quotient_zero", "ps_g3b_u01_3digit_tens_quotient_zero", "ps_g3b_u01_3digit_ones_quotient_zero"], "商中有 0 的除法", "integer_division_exact", ["quotient_zero", "place_value", "division"], "quotient_zero_cases", "numeric_expression"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_division_with_remainder", "pg_g3b_u01_division_with_remainder", ["ps_g3b_u01_2digit_division_with_remainder", "ps_g3b_u01_3digit_division_with_remainder"], "有餘數除法", "integer_division_remainder", ["remainder", "division", "two_digit", "three_digit"], "division_with_remainder", "numeric_expression"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_wp_partitive_division", "pg_g3b_u01_wp_partitive_division", ["ps_g3b_u01_wp_partitive_equal_sharing", "ps_g3b_u01_wp_partitive_unit_rate"], "等分除：平分與單位量", "division_word_problem", ["partitive_division", "equal_sharing", "unit_rate", "word_problem"], "partitive_division", "word_problem"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_wp_quotative_division", "pg_g3b_u01_wp_quotative_division", ["ps_g3b_u01_wp_quotative_packaging_exact", "ps_g3b_u01_wp_quotative_grouping_exact"], "包含除：分裝與分組", "division_word_problem", ["quotative_division", "packaging", "grouping", "word_problem"], "quotative_division", "word_problem"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_wp_division_with_remainder", "pg_g3b_u01_wp_division_with_remainder", ["ps_g3b_u01_wp_remainder_packaging_leftover", "ps_g3b_u01_wp_remainder_calendar_weeks_days"], "有餘數除法應用題", "division_word_problem", ["remainder", "quotient_remainder", "leftover", "word_problem"], "division_with_remainder_word_problem", "word_problem"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_wp_remainder_interpretation", "pg_g3b_u01_wp_remainder_interpretation", ["ps_g3b_u01_wp_remainder_floor_max_groups", "ps_g3b_u01_wp_remainder_ceil_min_containers"], "餘數判讀：最多與最少", "division_word_problem", ["remainder_interpretation", "floor", "ceil", "word_problem"], "remainder_interpretation", "word_problem"],
  [sourceIds.b01, "3B-U01", "除法", "kp_g3b_u01_wp_two_step_division", "pg_g3b_u01_wp_two_step_division", ["ps_g3b_u01_wp_two_step_divide_then_add", "ps_g3b_u01_wp_two_step_add_then_divide", "ps_g3b_u01_wp_two_step_divide_then_subtract", "ps_g3b_u01_wp_two_step_subtract_then_divide"], "兩步驟除法應用題", "division_word_problem", ["two_step", "division", "word_problem"], "two_step_division", "word_problem"]
]);

function toSpecIds(value) {
  return Object.freeze(Array.isArray(value) ? [...value] : [value]);
}

function toKp([sourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName, canonicalSkillTag, subskillTags, difficultyTag, representationTag]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ knowledgePointId, sourceId, unitCode, unitTitle, displayName, supportClass: "B", canonicalSkillTag, subskillTags, difficultyTags: [difficultyTag], representationTags: [representationTag], patternGroupIds: [patternGroupId], patternSpecIds, qaStatusLabel: "qa_verified" });
}

function toGroup([sourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ patternGroupId, sourceId, unitCode, unitTitle, displayName, primaryKnowledgePointId: knowledgePointId, knowledgePointIds: [knowledgePointId], supportClass: "B", patternSpecIds, allocationPolicy: "single_pattern", visibilityStatus: "visible", holdReason: null });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: 41,
  notSelectableCount: 0,
  bySourceId: {
    ...base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId,
    [sourceIds.u01]: { sourceId: sourceIds.u01, visibleCount: 8, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.u02]: { sourceId: sourceIds.u02, visibleCount: 10, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.u03]: { sourceId: sourceIds.u03, visibleCount: 7, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.u06]: { sourceId: sourceIds.u06, visibleCount: 6, hiddenPendingCount: 0, notSelectableCount: 0 },
    [sourceIds.b01]: { sourceId: sourceIds.b01, visibleCount: 10, hiddenPendingCount: 0, notSelectableCount: 0 }
  }
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...extraKps.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(id) {
  return BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id] ? clone(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[id]) : base.listBatchAKnowledgePointAvailabilityBySource(id);
}

export function getVisibleBatchAKnowledgePoint(id) {
  return kpById.has(id) ? clone(kpById.get(id)) : base.getVisibleBatchAKnowledgePoint(id);
}

export function getVisiblePatternGroupsForKnowledgePoint(id) {
  return groupsByKpId.has(id) ? clone(groupsByKpId.get(id)) : base.getVisiblePatternGroupsForKnowledgePoint(id);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(id) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(id);
  if (groups.length > 0) return groups.flatMap((group) => group.patternSpecIds ?? []);
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(id);
}
