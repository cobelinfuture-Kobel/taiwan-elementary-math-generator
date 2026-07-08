import * as base from "./batch-a-selector-equation-extension.js";

const clone = (value) => JSON.parse(JSON.stringify(value));
const g4aU01 = "g4a_u01_4a01";
const g4aU02 = "g4a_u02_4a02";
const rows = Object.freeze([
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_compare_8digit", "pg_g4a_u01_compare_8digit", "ps_g4a_u01_compare_8digit", "八位數比大小", "large_number_comparison", ["eight_digit", "comparison"], "large_number_compare", "numeric_expression"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_within_100million_compare", "pg_g4a_u01_within_100million_compare", "ps_g4a_u01_within_100million_compare", "1億以內數比大小", "large_number_comparison", ["within_100million", "comparison"], "large_number_compare", "numeric_expression"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_large_number_add_sub", "pg_g4a_u01_large_number_add_sub", "ps_g4a_u01_large_number_add_sub", "大數加減", "large_number_addition_subtraction", ["large_number", "addition", "subtraction"], "large_number_add_sub", "numeric_expression"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_8digit_place_value_decomposition", "pg_g4a_u01_8digit_place_value_decomposition", "ps_g4a_u01_8digit_place_value_decomposition", "八位數位值分解", "large_number_place_value", ["eight_digit", "decomposition", "place_value"], "place_value_decomposition", "decomposition_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_place_value_composition_to_number", "pg_g4a_u01_place_value_composition_to_number", "ps_g4a_u01_place_value_composition_to_number", "八位數位值組合", "large_number_place_value", ["eight_digit", "composition", "place_value"], "place_value_composition", "composition_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_same_digit_place_value_difference", "pg_g4a_u01_same_digit_place_value_difference", "ps_g4a_u01_same_digit_place_value_difference", "相同數字不同位值差和", "large_number_place_value", ["same_digit", "place_value_difference", "place_value_sum", "eight_digit"], "same_digit_place_value_difference_sum", "reasoning_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_nonstandard_place_value_composition", "pg_g4a_u01_nonstandard_place_value_composition", "ps_g4a_u01_nonstandard_place_value_composition", "非標準位值組合", "large_number_place_value", ["nonstandard_composition", "count_1_to_99", "place_value"], "nonstandard_place_value_composition", "composition_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_place_value_card_unit_model_composition", "pg_g4a_u01_place_value_card_unit_model_composition", "ps_g4a_u01_place_value_card_unit_model_composition", "位值卡組合", "large_number_place_value", ["card_model", "composition", "sparse_cards", "place_value"], "place_value_card_composition", "card_model_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_compare_first_different_place", "pg_g4a_u01_compare_first_different_place", "ps_g4a_u01_compare_first_different_place", "從哪一位開始比較", "large_number_comparison", ["first_different_place", "comparison"], "large_number_compare_reasoning", "reasoning_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_missing_digit_comparison_possible_digits", "pg_g4a_u01_missing_digit_comparison_possible_digits", "ps_g4a_u01_missing_digit_comparison_possible_digits", "缺位比較可填哪些數", "large_number_comparison", ["missing_digit", "possible_digits", "comparison"], "missing_digit_comparison", "digit_set_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_missing_digit_comparison_extreme_digit", "pg_g4a_u01_missing_digit_comparison_extreme_digit", "ps_g4a_u01_missing_digit_comparison_extreme_digit", "缺位比較最大最小", "large_number_comparison", ["missing_digit", "extreme_digit", "comparison"], "missing_digit_comparison", "digit_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_large_number_reading_writing_conversion", "pg_g4a_u01_large_number_reading_writing_conversion", "ps_g4a_u01_large_number_reading_writing_conversion", "大數讀寫轉換", "large_number_reading_writing", ["chinese_number", "conversion"], "large_number_read_write", "conversion_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_numeric_vs_chinese_number_compare", "pg_g4a_u01_numeric_vs_chinese_number_compare", "ps_g4a_u01_numeric_vs_chinese_number_compare", "數字與中文數詞比大小", "large_number_comparison", ["chinese_number", "mixed_notation", "comparison"], "large_number_compare_mixed_notation", "mixed_notation_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_wan_mixed_notation_subtraction", "pg_g4a_u01_wan_mixed_notation_subtraction", "ps_g4a_u01_wan_mixed_notation_subtraction", "萬單位混合記法減法", "large_number_addition_subtraction", ["wan_notation", "subtraction"], "large_number_wan_subtraction", "wan_notation_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_boundary_number_difference", "pg_g4a_u01_boundary_number_difference", "ps_g4a_u01_boundary_number_difference", "最大最小位數邊界差", "large_number_comparison", ["digit_count_boundary", "difference"], "boundary_difference", "reasoning_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_comparison_word_problem_total", "pg_g4a_u01_comparison_word_problem_total", "ps_g4a_u01_comparison_word_problem_total", "比較型應用題求總和", "large_number_word_problem", ["comparison", "total"], "comparison_word_problem_total", "word_problem_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_large_number_unit_word_problem_add_subtract", "pg_g4a_u01_large_number_unit_word_problem_add_subtract", "ps_g4a_u01_large_number_unit_word_problem_add_subtract", "大數單位加減應用題", "large_number_word_problem", ["unit", "add_sub"], "large_number_unit_word_problem", "word_problem_prompt"],
  [g4aU01, "4A-U01", "1億以內的數", "kp_g4a_u01_digit_arrangement_max_min", "pg_g4a_u01_digit_arrangement_max_min", "ps_g4a_u01_digit_arrangement_max_min", "指定數字排列最大最小", "place_value_reasoning", ["digit_arrangement", "max_min", "no_leading_zero"], "digit_arrangement_max_min", "number_or_short_word_problem_prompt"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_3digit_by_1digit_review", "pg_g4a_u02_3digit_by_1digit_review", "ps_g4a_u02_3digit_by_1digit_review", "三位數乘一位數複習", "integer_multiplication", ["three_digit", "one_digit", "review"], "vertical_multiplication", "numeric_vertical"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_4digit_by_1digit_missing_digit", "pg_g4a_u02_4digit_by_1digit_missing_digit", "ps_g4a_u02_4digit_by_1digit_missing_digit", "四位數乘一位數缺位", "integer_multiplication", ["four_digit", "one_digit", "missing_digit"], "vertical_missing_digit", "numeric_vertical_missing_digit"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_1digit_by_2digit", "pg_g4a_u02_1digit_by_2digit", "ps_g4a_u02_1digit_by_2digit", "一位數乘二位數", "integer_multiplication", ["one_digit", "two_digit"], "vertical_multiplication", "numeric_vertical"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_1digit_by_3digit", "pg_g4a_u02_1digit_by_3digit", "ps_g4a_u02_1digit_by_3digit", "一位數乘三位數", "integer_multiplication", ["one_digit", "three_digit"], "vertical_multiplication", "numeric_vertical"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_2digit_by_2digit", "pg_g4a_u02_2digit_by_2digit", "ps_g4a_u02_2digit_by_2digit", "二位數乘二位數", "integer_multiplication", ["two_digit", "two_digit", "partial_product"], "vertical_multiplication_partial_products", "numeric_vertical"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_2digit_by_3digit", "pg_g4a_u02_2digit_by_3digit", "ps_g4a_u02_2digit_by_3digit", "二位數乘三位數", "integer_multiplication", ["two_digit", "three_digit", "partial_product"], "vertical_multiplication_partial_products", "numeric_vertical"],
  [g4aU02, "4A-U02", "整數的乘法", "kp_g4a_u02_3digit_by_2digit", "pg_g4a_u02_3digit_by_2digit", "ps_g4a_u02_3digit_by_2digit", "三位數乘二位數", "integer_multiplication", ["three_digit", "two_digit", "partial_product"], "vertical_multiplication_partial_products", "numeric_vertical"]
]);

function toSpecIds(value) {
  return Object.freeze(Array.isArray(value) ? [...value] : [value]);
}

function toKp([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName, canonicalSkillTag, subskillTags, difficultyTag, representationTag]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ knowledgePointId, sourceId: rowSourceId, unitCode, unitTitle, displayName, supportClass: "B", canonicalSkillTag, subskillTags, difficultyTags: [difficultyTag], representationTags: [representationTag], patternGroupIds: [patternGroupId], patternSpecIds, qaStatusLabel: "qa_verified" });
}

function toGroup([rowSourceId, unitCode, unitTitle, knowledgePointId, patternGroupId, patternSpecId, displayName]) {
  const patternSpecIds = toSpecIds(patternSpecId);
  return Object.freeze({ patternGroupId, sourceId: rowSourceId, unitCode, unitTitle, displayName, primaryKnowledgePointId: knowledgePointId, knowledgePointIds: [knowledgePointId], supportClass: "B", patternSpecIds, allocationPolicy: "single_pattern", visibilityStatus: "visible", holdReason: null });
}

const extraKps = Object.freeze(rows.map(toKp));
const extraGroups = Object.freeze(rows.map(toGroup));
const kpById = new Map(extraKps.map((kp) => [kp.knowledgePointId, kp]));
const groupsByKpId = new Map(extraGroups.flatMap((group) => group.knowledgePointIds.map((kpId) => [kpId, [group]])));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  for (const kp of extraKps) {
    const current = entries.get(kp.sourceId) ?? { sourceId: kp.sourceId, visibleCount: 0, hiddenPendingCount: 0, notSelectableCount: 0 };
    entries.set(kp.sourceId, { ...current, visibleCount: current.visibleCount + 1 });
  }
  return Object.fromEntries(entries);
}

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + extraKps.length,
  notSelectableCount: base.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  bySourceId: availabilityBySource()
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
