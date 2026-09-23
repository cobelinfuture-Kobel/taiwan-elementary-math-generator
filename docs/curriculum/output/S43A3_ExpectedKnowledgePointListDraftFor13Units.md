# S43A3 Expected KnowledgePoint List Draft for 13 Batch A Units

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43A3_ExpectedKnowledgePointListDraftFor13Units
TASK_STATUS = DRAFT_LIST
WRITE_TYPE = docs_only
```

S43A3 turns the S43A1 expected KnowledgePoint examples into normalized `knowledgePointId` candidates for all 13 Batch A source units.

This is not a production registry. It does not create `batch_a_knowledge_points.json`, PatternGroup JSON, PatternSpec JSON, UI, generator, validator, or renderer code.

## Inputs

```text
primaryInput = docs/curriculum/output/S43A1_BatchAKnowledgePointSelectableWorksheetInventory.md
secondaryInput = docs/curriculum/output/S43A2_CurrentSourceToPatternSpecCoverageReadback.md
sourceAuthority = manual_visual_read_summary
```

## Draft Row Contract

Each row in this file is a draft KnowledgePoint candidate with this intended shape:

```yaml
knowledgePointId: string
sourceId: string
displayName: string
canonicalSkillTagCandidate: string
questionKindCandidate: string
supportStatusCandidate: string
sourceAuthorityStatus: manual_visual_read_summary
registryStatus: draft_candidate
patternGroupStatus: not_created
htmlSelectableStatus: not_implemented
```

## Summary

```text
sourceUnits = 13
expectedKnowledgePointDraftRows = 172
registryStatus = draft_candidate_only
patternGroupStatus = not_created
htmlSelectableStatus = not_implemented
```

## Support Status Candidate Legend

```text
v1NumberSenseSupported = likely supported by number-sense/text generator after PatternSpec work
v1TextFallbackSupported = text fallback possible; visual renderer may still be needed for full fidelity
v1ExpressionSupported = likely supported by integer expression generator after PatternSpec work
requiresWordProblemTemplate = needs controlled word-problem template before printable production
requiresVisualGenerator = not printable in S43 unless text fallback is explicitly accepted
needsNewPatternSpec = no current fine-grained PatternSpec exists yet
```

---

## g3a_u01_3a01 — 3A-U01 10000以內的數

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3a_u01_base10_table_4digit | 10進位表 | number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 2 | kp_g3a_u01_number_to_chinese | 數字寫成中文 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 3 | kp_g3a_u01_chinese_to_number | 中文寫成數字 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 4 | kp_g3a_u01_money_representation | 錢幣表示 | money_representation | v1TextFallbackSupported, needsNewPatternSpec |
| 5 | kp_g3a_u01_place_value_blank | 位值填空 | number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 6 | kp_g3a_u01_unknown_digit_reasoning | 未知位數推理 | number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 7 | kp_g3a_u01_max_min_4digit | 四位數最大最小 | number_comparison | v1NumberSenseSupported, needsNewPatternSpec |
| 8 | kp_g3a_u01_number_line_drawing | 數線畫法 | number_line | v1TextFallbackSupported, requiresVisualGenerator |
| 9 | kp_g3a_u01_number_line_addition | 數線加法 | number_line | v1TextFallbackSupported, needsNewPatternSpec |
| 10 | kp_g3a_u01_number_line_subtraction | 數線減法 | number_line | v1TextFallbackSupported, needsNewPatternSpec |
| 11 | kp_g3a_u01_place_value_decomposition | 四位數位值分解 | number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 12 | kp_g3a_u01_place_value_composition | 四位數位值組合 | number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 13 | kp_g3a_u01_4digit_read_write | 四位數讀寫 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 14 | kp_g3a_u01_between_numbers_pattern | 兩數間規律 | pattern_sequence | plannedOnly, needsNewPatternSpec |
| 15 | kp_g3a_u01_money_conversion_4digit | 四位數錢幣換算 | money_representation | v1TextFallbackSupported, needsNewPatternSpec |
| 16 | kp_g3a_u01_4digit_compare | 四位數比大小 | number_comparison | v1NumberSenseSupported, existingSeedPatternSpec |
| 17 | kp_g3a_u01_integer_number_line | 整數數線 | number_line | v1TextFallbackSupported, needsNewPatternSpec |

## g3a_u02_3a02 — 3A-U02 四位數的加減

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3a_u02_add_multi_carry | 四位數加法多次進位 | integer_addition | v1ExpressionSupported, existingSeedPatternSpec, needsExplicitCarryConstraint |
| 2 | kp_g3a_u02_sub_multi_borrow | 四位數減法多次退位 | integer_subtraction | v1ExpressionSupported, existingSeedPatternSpec, needsExplicitBorrowConstraint |
| 3 | kp_g3a_u02_sub_consecutive_borrow | 四位數減法連續退位 | integer_subtraction | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g3a_u02_estimate_nearest_thousand | 整千估算 | rounding_approximation | plannedOnly, needsNewPatternSpec |
| 5 | kp_g3a_u02_word_problem_estimation_add_sub | 加減應用題估算 | integer_add_sub_mixed | requiresWordProblemTemplate, needsNewPatternSpec |
| 6 | kp_g3a_u02_vertical_add_missing_digit | 直式加法缺位填空 | integer_addition | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g3a_u02_vertical_sub_missing_digit | 直式減法缺位填空 | integer_subtraction | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g3a_u02_sub_missing_middle_digit | 四位數減法中間缺位 | integer_subtraction | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g3a_u02_borrow_zero_middle_handling | 連續退位中間有 0 的處理 | integer_subtraction | v1ExpressionSupported, needsNewPatternSpec |

## g3a_u03_3a03 — 3A-U03 乘法

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3a_u03_multiple_of_10_by_1digit | 10 的倍數乘一位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g3a_u03_base10_multiplication_principle | 10 進位乘法原理 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g3a_u03_2digit_by_1digit_carry | 二位數乘一位數直接進位 | integer_multiplication | v1ExpressionSupported, existingSeedPatternSpec, needsExplicitMultiplicationCarryConstraint |
| 4 | kp_g3a_u03_3digit_by_1digit | 三位數乘一位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g3a_u03_3digit_by_1digit_missing_digit | 三位數乘一位數有缺位 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g3a_u03_consecutive_multiplication | 兩步驟連續乘法 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g3a_u03_2digit_round10_then_multiply | 二位數整十估算再乘 | integer_multiplication | plannedOnly, needsNewPatternSpec |
| 8 | kp_g3a_u03_3digit_round100_then_multiply | 三位數整百估算再乘 | integer_multiplication | plannedOnly, needsNewPatternSpec |
| 9 | kp_g3a_u03_vertical_multiplication_missing_digit | 乘法直式缺位推理 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |

## g3a_u06_3a06 — 3A-U06 二位數除以一位數

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3a_u06_estimate_quotient_by_multiplication | 用乘法估商 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g3a_u06_long_division_method | 直式除法計算方法 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g3a_u06_exact_divisibility_check | 哪些數字可以整除 | integer_division | v1ExpressionSupported, existingSeedPatternSpec |
| 4 | kp_g3a_u06_division_with_remainder | 有餘數除法 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g3a_u06_division_missing_digit | 除法直式缺位填空 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g3a_u06_zero_and_one_division | 0 與 1 的除法 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g3a_u06_even_odd_judgment | 奇偶數判斷 | number_properties | plannedOnly, needsNewPatternSpec |
| 8 | kp_g3a_u06_number_line_even_range_reasoning | 數線範圍推理偶數 | number_line | v1TextFallbackSupported, needsNewPatternSpec |
| 9 | kp_g3a_u06_division_language_conversion | 除法語言轉換 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 10 | kp_g3a_u06_containment_and_equal_sharing | 包含除與等分除 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 11 | kp_g3a_u06_division_as_fraction | 除法可以寫成分數 | fraction_basic | futureFractionDomain |
| 12 | kp_g3a_u06_answer_unit_change | 答案單位變化 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 13 | kp_g3a_u06_division_word_problem | 除法應用題 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 14 | kp_g3a_u06_remainder_context_reasoning | 餘數情境判斷 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |

## g3b_u01_3b01 — 3B-U01 除法

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3b_u01_quotient_estimation | 估商方式 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g3b_u01_quotient_place_ones_tens | 商寫在個位 / 商寫在十位 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g3b_u01_remainder_less_than_divisor | 餘數必須小於除數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g3b_u01_equal_sharing_division | 等分除 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 5 | kp_g3b_u01_containment_division | 包含除 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 6 | kp_g3b_u01_2digit_by_1digit_high_place_insufficient | 2 位數除以 1 位數最高位不夠除退位 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g3b_u01_2digit_by_1digit_ones_insufficient | 2 位數個位不夠除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g3b_u01_2digit_by_1digit_remainder_cases | 最高位沒有餘數 / 個位小於除數 / 個位等於除數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g3b_u01_3digit_by_1digit_high_place_insufficient | 3 位數除以 1 位數最高位不夠除退位 | integer_division | v1ExpressionSupported, existingSeedPatternSpec, needsExplicitRegroupConstraint |
| 10 | kp_g3b_u01_3digit_by_1digit_tens_insufficient | 3 位數十位不夠除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 11 | kp_g3b_u01_3digit_by_1digit_ones_insufficient | 3 位數個位不夠除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 12 | kp_g3b_u01_tens_and_ones_insufficient | 十位個位都不夠除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 13 | kp_g3b_u01_quotient_zero_placeholder | 商要補 0 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 14 | kp_g3b_u01_middle_zero_or_missing_digit | 被除數中間有 0 / 缺位 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 15 | kp_g3b_u01_division_unit_conversion | 等分、包含、餘數單位轉換 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 16 | kp_g3b_u01_division_estimation | 除法估算 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 17 | kp_g3b_u01_divide_then_add | 先除再加 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 18 | kp_g3b_u01_add_then_divide | 先加再除 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 19 | kp_g3b_u01_divide_then_subtract | 先除再減 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 20 | kp_g3b_u01_subtract_then_divide | 先減再除 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |

## g3b_u04_3b04 — 3B-U04 兩步驟計算

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3b_u04_add_then_divide | 先加再除 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g3b_u04_subtract_then_divide | 先減再除 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g3b_u04_divide_then_add | 先除再加 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g3b_u04_divide_then_subtract | 先除再減 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g3b_u04_consecutive_multiplication | 連續乘法 | integer_multiplication | v1ExpressionSupported, existingSeedPatternSpec |
| 6 | kp_g3b_u04_multiple_word_problem | 倍數問題 | integer_multiplication | requiresWordProblemTemplate, needsNewPatternSpec |
| 7 | kp_g3b_u04_line_diagram_two_step_word_problem | 線段圖輔助兩步驟應用題 | word_problem_strategy | requiresWordProblemTemplate, requiresVisualGenerator |
| 8 | kp_g3b_u04_equal_sharing_then_add_sub | 平均分後再加減 | integer_mixed_operations | requiresWordProblemTemplate, needsNewPatternSpec |
| 9 | kp_g3b_u04_containment_then_add_sub | 分裝後再加減 | integer_mixed_operations | requiresWordProblemTemplate, needsNewPatternSpec |
| 10 | kp_g3b_u04_multiplication_context | 乘法情境 | integer_multiplication | requiresWordProblemTemplate, needsNewPatternSpec |
| 11 | kp_g3b_u04_multiple_relation_chain | 倍數關係鏈 | integer_multiplication | requiresWordProblemTemplate, needsNewPatternSpec |
| 12 | kp_g3b_u04_multi_layer_multiple_reasoning | 多層倍數推理 | integer_multiplication | requiresWordProblemTemplate, needsNewPatternSpec |

## g3b_u08_3b08 — 3B-U08 乘法與除法

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g3b_u08_add_sub_inverse_transposition | 加減互逆 / 移項法則 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g3b_u08_addition_commutative | 加法交換律 | integer_addition | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g3b_u08_unknown_by_inverse | 用互逆解未知數 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g3b_u08_mul_div_inverse_transposition | 乘除互逆 / 乘除法移項 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g3b_u08_multiplication_commutative | 乘法交換律 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g3b_u08_inverse_vertical_unknown | 用乘除互逆解直式未知數 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g3b_u08_inverse_no_calculation | 乘除互逆免計算題型 | integer_mul_div_mixed | v1ExpressionSupported, existingSeedPatternSpec |
| 8 | kp_g3b_u08_multiplication_check_division | 乘法驗算除法 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g3b_u08_division_check_no_remainder | 除法驗算無餘數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 10 | kp_g3b_u08_division_check_with_remainder | 除法驗算有餘數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 11 | kp_g3b_u08_unit_price_unit_amount | 單價、單位量、每單位問題 | integer_mul_div_mixed | requiresWordProblemTemplate, needsNewPatternSpec |
| 12 | kp_g3b_u08_average_per_share | 平均分 / 每份量 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 13 | kp_g3b_u08_equal_share_containment | 等分與包含應用 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 14 | kp_g3b_u08_unknown_dividend | 被除數未知 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 15 | kp_g3b_u08_division_sentence | 除法列式 | integer_division | requiresWordProblemTemplate, needsNewPatternSpec |
| 16 | kp_g3b_u08_shopping_estimation | 估算購物問題 | integer_mul_div_mixed | requiresWordProblemTemplate, needsNewPatternSpec |
| 17 | kp_g3b_u08_better_buy_compare | 比較划算問題 | integer_mul_div_mixed | requiresWordProblemTemplate, needsNewPatternSpec |

## g4a_u01_4a01 — 4A-U01 1億以內的數

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g4a_u01_base10_table_100k | 10萬以內的10進位表 | large_number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 2 | kp_g4a_u01_decomposition_100k | 10萬以內數的分解 | large_number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 3 | kp_g4a_u01_composition_100k | 10萬以內數的合成 | large_number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 4 | kp_g4a_u01_reading_100k | 10萬以內數的讀法 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 5 | kp_g4a_u01_base10_table_100million | 1億以內10進位表 | large_number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 6 | kp_g4a_u01_3digit_sectioning | 3位分節法 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 7 | kp_g4a_u01_4digit_sectioning | 4位分節法 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 8 | kp_g4a_u01_100million_read_write | 1億以內數的讀寫 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 9 | kp_g4a_u01_100million_compare | 1億以內數比大小 | number_comparison | v1NumberSenseSupported, needsNewPatternSpec |
| 10 | kp_g4a_u01_make_5digit_from_digits | 用指定數字組合五位數 | number_comparison | v1NumberSenseSupported, needsNewPatternSpec |
| 11 | kp_g4a_u01_unknown_digit_max_min | 未知數位下的最大最小 | number_comparison | v1NumberSenseSupported, needsNewPatternSpec |
| 12 | kp_g4a_u01_large_number_vertical_calculation | 大數直式計算 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 13 | kp_g4a_u01_middle_zero_read_write | 中間有0的讀寫 | number_reading_writing | v1NumberSenseSupported, needsNewPatternSpec |
| 14 | kp_g4a_u01_between_numbers_pattern | 兩數間規律 | pattern_sequence | plannedOnly, needsNewPatternSpec |
| 15 | kp_g4a_u01_large_number_add_sub | 大數加減 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 16 | kp_g4a_u01_8digit_decompose_compose | 八位數分解組合 | large_number_place_value | v1NumberSenseSupported, needsNewPatternSpec |
| 17 | kp_g4a_u01_8digit_compare | 八位數比大小 | number_comparison | v1NumberSenseSupported, existingSeedPatternSpec |

## g4a_u02_4a02 — 4A-U02 整數的乘法

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g4a_u02_3digit_by_1digit_review | 三位數 × 一位數複習 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g4a_u02_base10_multiplication_principle | 乘法的 10 進位原理 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g4a_u02_multiple_of_10_multiplication | 10 的倍數乘法 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g4a_u02_4digit_by_1digit_missing_digit | 四位數 × 一位數有缺位 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g4a_u02_1digit_by_2digit | 一位數 × 二位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g4a_u02_1digit_by_3digit | 一位數 × 三位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g4a_u02_10multiple_by_10multiple | 10 的倍數 × 10 的倍數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g4a_u02_2digit_by_2digit | 二位數 × 二位數 | integer_multiplication | v1ExpressionSupported, existingSeedPatternSpec |
| 9 | kp_g4a_u02_vertical_place_alignment | 乘法直式位值排列 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |

## g4a_u04_4a04 — 4A-U04 整數的除法

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g4a_u04_division_learning_progression | 除法學習歷程整理 | integer_division | plannedOnly |
| 2 | kp_g4a_u04_4digit_by_1digit_thousands_enough | 四位數 ÷ 一位數：千位夠除 | integer_division | v1ExpressionSupported, existingSeedPatternSpec |
| 3 | kp_g4a_u04_4digit_by_1digit_thousands_insufficient | 四位數 ÷ 一位數：千位不夠除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g4a_u04_4digit_by_1digit_thousands_exact | 四位數 ÷ 一位數：千位整除 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g4a_u04_2digit_by_2digit | 二位數 ÷ 二位數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g4a_u04_divisor_multiple_of_10 | 除數是 10 的倍數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g4a_u04_remainder_less_than_divisor | 餘數不能大於除數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g4a_u04_quotient_estimation | 除法估商 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g4a_u04_3digit_by_2digit | 三位數 ÷ 二位數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |

## g4a_u08_4a08 — 4A-U08 整數四則

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g4a_u08_add_sub_symbol_position | 加減符號與數字位置 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g4a_u08_rearrange_numbers_for_easier_calculation | 移動數字使容易計算 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g4a_u08_minus_to_front | 減號可移到最前面 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g4a_u08_add_sub_left_to_right | 加減混合由左到右 | integer_add_sub_mixed | v1ExpressionSupported, existingSeedPatternSpec |
| 5 | kp_g4a_u08_parentheses_first | 有括號先算 | operation_precedence | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g4a_u08_consecutive_subtraction_parentheses | 連續減法可用括號合併 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g4a_u08_mul_div_commutative_associative | 乘除混合的交換與結合 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g4a_u08_add_sub_with_multiply_divide_precedence | 加減法碰到乘法 / 除法的優先順序 | operation_precedence | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g4a_u08_parentheses_and_operation_order | 括號與四則運算順序 | operation_precedence | v1ExpressionSupported, needsNewPatternSpec |
| 10 | kp_g4a_u08_two_step_word_problem | 兩步驟應用題 | integer_mixed_operations | requiresWordProblemTemplate, needsNewPatternSpec |
| 11 | kp_g4a_u08_multiply_then_divide | 先乘再除 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 12 | kp_g4a_u08_divide_then_multiply | 先除再乘 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 13 | kp_g4a_u08_mul_div_before_add_sub | 先乘除後加減 | operation_precedence | v1ExpressionSupported, needsNewPatternSpec |
| 14 | kp_g4a_u08_mixed_operations_without_parentheses | 無括號四則混合 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |

## g4b_u01_4b01 — 4B-U01 多位數的乘與除

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g4b_u01_product_row_count_by_digits | 幾位數相乘，乘積有幾排 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g4b_u01_3digit_by_3digit | 三位數 × 三位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g4b_u01_4digit_by_3digit | 四位數 × 三位數 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g4b_u01_multiplier_middle_zero | 乘數中間有 0 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g4b_u01_multiplier_trailing_zero | 乘數尾巴有 0 | integer_multiplication | v1ExpressionSupported, existingSeedPatternSpec |
| 6 | kp_g4b_u01_multiplicand_trailing_zero | 被乘數尾巴有 0 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g4b_u01_both_operands_trailing_zero | 被乘數與乘數尾巴都有 0 | integer_multiplication | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g4b_u01_3digit_by_3digit_division | 三位數 ÷ 三位數 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 9 | kp_g4b_u01_4digit_by_3digit_no_regroup | 四位數 ÷ 三位數不退位 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 10 | kp_g4b_u01_4digit_by_3digit_regroup | 四位數 ÷ 三位數退位 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 11 | kp_g4b_u01_mul_div_vertical_place_alignment | 乘除直式位值對齊 | integer_mul_div_mixed | v1ExpressionSupported, needsNewPatternSpec |

## g5a_u08_5a08 — 5A-U08 整數四則

| # | knowledgePointId | displayName | canonicalSkillTagCandidate | supportStatusCandidate |
|---:|---|---|---|---|
| 1 | kp_g5a_u08_integer_mixed_operations | 整數四則混合計算 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 2 | kp_g5a_u08_add_sub_associative | 加減法混合結合律 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 3 | kp_g5a_u08_add_sub_mul_div_mixed | 加減乘除混合 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 4 | kp_g5a_u08_same_multiplier_two_products_sum | 兩組乘法相同乘數再相加 | distributive_property | v1ExpressionSupported, needsNewPatternSpec |
| 5 | kp_g5a_u08_same_multiplier_two_products_difference | 兩組乘法相同乘數再相減 | distributive_property | v1ExpressionSupported, needsNewPatternSpec |
| 6 | kp_g5a_u08_reverse_distributive_property | 分配律反向還原 | distributive_property | v1ExpressionSupported, needsNewPatternSpec |
| 7 | kp_g5a_u08_consecutive_division | 連續除法 | integer_division | v1ExpressionSupported, needsNewPatternSpec |
| 8 | kp_g5a_u08_consecutive_subtraction | 連續減法 | integer_subtraction | v1ExpressionSupported, existingSeedPatternSpec |
| 9 | kp_g5a_u08_commutative_associative | 交換律 + 結合律 | integer_mixed_operations | v1ExpressionSupported, needsNewPatternSpec |
| 10 | kp_g5a_u08_distributive_property_word_sum_diff | 兩組乘法相加 / 相減的分配律應用題 | distributive_property | requiresWordProblemTemplate, needsNewPatternSpec |
| 11 | kp_g5a_u08_distributive_property_simplification | 分配律簡化計算 | distributive_property | v1ExpressionSupported, needsNewPatternSpec |
| 12 | kp_g5a_u08_large_number_add_sub_simplification | 大數加減用分配律或拆解策略簡化 | integer_add_sub_mixed | v1ExpressionSupported, needsNewPatternSpec |
| 13 | kp_g5a_u08_shopping_discount_change_word_problem | 購物折價與找錢四則應用題 | integer_mixed_operations | requiresWordProblemTemplate, needsNewPatternSpec |
| 14 | kp_g5a_u08_average_pack_then_add_sub_word_problem | 平均分裝後再加減應用題 | integer_mixed_operations | requiresWordProblemTemplate, needsNewPatternSpec |

## Draft Status Matrix

```text
knowledgePointDraftRows = 172
sourceAuthorityStatus = manual_visual_read_summary
registryStatus = draft_candidate
patternGroupStatus = not_created
htmlSelectableStatus = not_implemented
productionUse = forbidden
```

## S43A3 Gate

```text
S43A3_GATE = PASS_EXPECTED_KP_DRAFT_LIST_CREATED

PASS:
- 13 / 13 source units have normalized KnowledgePoint ID candidates
- 172 / 172 expected KnowledgePoint draft rows listed
- each row has sourceId, knowledgePointId, displayName, skill candidate, support candidate
- PatternGroup and HTML selectable status remain explicitly not created / not implemented
- no generator / validator / UI implementation introduced

GAPS:
- KnowledgePointNode schema not locked yet
- PatternGroup schema not locked yet
- KnowledgePointPatternMap schema not locked yet
- draft candidates not yet materialized as JSON registry
- no per-KP PatternGroup mapping yet
- no HTML KnowledgePoint selector yet
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_CURRENT_PATTERN_COVERAGE_CLASSIFIED_FOR_PATTERN_GROUP_SEEDING
GOAL_DISTANCE_AFTER  = D3_EXPECTED_KP_DRAFT_IDS_CREATED_FOR_13_UNITS
DISTANCE_REDUCED     = Batch A expected KP examples are now normalized into stable ID candidates, preparing schema lock and future registry materialization

SourceUnitCoverage               100% -> 100%
CurrentPatternReadback           100% -> 100%
PatternReuseClassification       100% -> 100%
ExpectedKPDraft                   60% -> 100%
KnowledgePointSchema               0% ->   0%
PatternGroupSchema                 0% ->   0%
PatternGroupRegistry               0% ->   0%
KPHTMLSelectablePath               0% ->   0%
S43Overall                        16% ->  22%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "KnowledgePointNode schema 尚未鎖定",
  "PatternGroup schema 尚未鎖定",
  "KnowledgePointPatternMap schema 尚未鎖定",
  "172 個 KP draft rows 尚未進 JSON registry",
  "PatternGroup JSON 尚未 materialize",
  "現有 PatternSpec seed 尚未接到 KP rows",
  "fine-grained PatternSpec families 尚未建立",
  "HTML KnowledgePoint selector 尚未實作",
  "per-KP printable QA 尚未建立"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43A4_KnowledgePointPrintableCoverageGapMatrix
```

S43A4 should classify each draft KnowledgePoint into printable coverage classes:

```text
A = existing PatternSpec seed can print coarse worksheet now
B = needs new fine-grained PatternSpec but existing generator likely supports
C = needs generator/validator variant
D = blocked by visual/word-problem/future-domain requirement
```
