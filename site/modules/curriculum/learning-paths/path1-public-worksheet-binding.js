const block = (blockId, title, knowledgePointIds, options = {}) => Object.freeze({
  blockId,
  title,
  generationKind: options.generationKind ?? "CANONICAL_KP",
  questionMode: options.questionMode ?? null,
  knowledgePointIds: Object.freeze([...knowledgePointIds]),
  difficultyExpansionId: options.difficultyExpansionId ?? null,
});

export const PATH1_PUBLIC_WORKSHEET_BLOCKS = Object.freeze([
  block("P1-01", "十進位乘法原理", ["kp_g3a_u03_10_multiple_by_1digit"]),
  block("P1-02", "多位數×一位數", ["kp_g3a_u03_2digit_by_1digit_carry", "kp_g3a_u03_3digit_by_1digit"]),
  block("P1-03", "二位數×二位數", ["kp_g4a_u02_2digit_by_2digit"]),
  block("P1-04", "多位數×多位數", [
    "kp_g4a_u02_2digit_by_3digit",
    "kp_g4a_u02_3digit_by_2digit",
    "kp_g4b_u01_3digit_by_3digit",
    "kp_g4b_u01_4digit_by_3digit",
  ]),
  block("P1-05", "0 特殊情況", [
    "kp_g3a_u03_3digit_zero_middle_by_1digit",
    "kp_g4b_u01_multiplier_internal_zero",
    "kp_g4b_u01_trailing_zero_multiplication",
  ]),
  block("P1-06", "估商", ["kp_g4a_u04_3digit_by_2digit_tens_sufficient", "kp_g4a_u04_3digit_by_2digit_tens_insufficient"]),
  block("P1-07", "商的位值", ["kp_g3b_u01_2digit_division_place_value_cases", "kp_g3b_u01_3digit_division_place_value_cases"]),
  block("P1-08", "二位數除數", [
    "kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor",
    "kp_g4a_u04_3digit_by_2digit_tens_sufficient",
    "kp_g4a_u04_3digit_by_2digit_tens_insufficient",
  ]),
  block("P1-09", "多位數÷二位數", [], {
    generationKind: "DIFFICULTY_EXPANSION",
    difficultyExpansionId: "path1_four_digit_by_two_digit_division",
  }),
  block("P1-10", "多位數÷三位數", [
    "kp_g4b_u01_3digit_div_3digit",
    "kp_g4b_u01_4digit_div_3digit_2digit_quotient",
    "kp_g4b_u01_4digit_div_3digit_1digit_quotient",
  ]),
  block("P1-11", "餘數與驗算", ["kp_g4a_u04_division_check_with_remainder", "kp_g3b_u01_division_with_remainder"]),
  block("P1-12", "乘除互逆", [
    "kp_g3b_u08_total_from_groups",
    "kp_g3b_u08_group_count_from_total",
    "kp_g3b_u08_per_group_from_total",
  ], { questionMode: "application" }),
  block("P1-13", "同級混合", ["kp_g4a_u08_num_add_sub_left_assoc", "kp_g4a_u08_num_mul_div_left_assoc"]),
  block("P1-14", "乘除優先", ["kp_g4a_u08_num_mul_div_before_add_sub"]),
  block("P1-15", "括號", ["kp_g4a_u08_num_parentheses_first", "kp_g4a_u08_num_parentheses_change_precedence"]),
  block("P1-16", "交換律＋結合律", [
    "kp_g4a_u08_num_add_group_round",
    "kp_g4a_u08_num_mul_div_safe_reorder",
    "kp_g5a_u08_add_sub_equivalent_regroup",
    "kp_g5a_u08_mul_div_equivalent_regroup",
  ]),
  block("P1-17", "分配律", ["kp_g5a_u08_distributive_expand"]),
  block("P1-18", "分配律反向＋簡算", ["kp_g5a_u08_common_factor_extract"]),
  block("P1-19", "整除／因數／倍數", [
    "kp_g5a_u02_factor_criterion_multiplication_division_equivalence",
    "kp_g5a_u02_factor_enumeration_by_division",
    "kp_g5a_u03a_multiple_identify_enumerate",
    "kp_g5a_u03a_divisibility_rules",
    "kp_g5a_u03a_factor_multiple_relation",
  ]),
  block("P1-20", "公因數／公倍數", [
    "kp_g5a_u02_common_factor_concept",
    "kp_g5a_u02_common_factor_enumeration",
    "kp_g5a_u03a1_common_multiple_lcm",
    "kp_g5a_u03a1_bounded_common_multiples",
  ]),
  block("P1-21", "質數／合數／質因數", ["kp_g6a_u01_prime_composite_classification"]),
  block("P1-22", "質因數分解", ["kp_g6a_u01_prime_factorization"]),
  block("P1-23", "GCD", ["kp_g6a_u01_greatest_common_factor"]),
  block("P1-24", "LCM", ["kp_g6a_u01_least_common_multiple"]),
  block("P1-25", "整數四則綜合", [
    "kp_g4a_u08_num_mul_div_before_add_sub",
    "kp_g4a_u08_num_parentheses_change_precedence",
    "kp_g5a_u08_distributive_expand",
    "kp_g5a_u08_common_factor_extract",
  ], { generationKind: "INTEGRATION" }),
  block("P1-26", "整數結構綜合", [
    "kp_g5a_u02_common_factor_concept",
    "kp_g5a_u03a1_common_multiple_lcm",
    "kp_g6a_u01_prime_factorization",
    "kp_g6a_u01_greatest_common_factor",
    "kp_g6a_u01_least_common_multiple",
  ], { generationKind: "INTEGRATION" }),
  block("P1-27", "Cross-KP 應用", [
    "kp_g3b_u08_total_from_groups",
    "kp_g3b_u08_group_count_from_total",
    "kp_g3b_u08_per_group_from_total",
    "kp_g5a_u02_maximum_equal_grouping_gcf_application",
    "kp_g5a_u03a1_grouping_constraints",
  ], { generationKind: "INTEGRATION", questionMode: "application" }),
]);

export function listPath1PublicWorksheetBlocks() {
  return PATH1_PUBLIC_WORKSHEET_BLOCKS;
}

export function getPath1PublicWorksheetBlock(blockId) {
  return PATH1_PUBLIC_WORKSHEET_BLOCKS.find((entry) => entry.blockId === blockId) ?? null;
}
