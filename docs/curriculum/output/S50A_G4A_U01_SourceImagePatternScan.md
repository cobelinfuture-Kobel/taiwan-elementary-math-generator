S50A_G4A_U01_SourceImagePatternScan

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = SOURCE_IMAGE_PATTERN_SCAN_COMPLETED
operator_input = three uploaded source images: 題型1 八位數分解組合, 題型3 大數的加減, 題型4 八位數比大小
write_type = source_image_pattern_scan_report_only

scope_lock:
- Understand the operator-provided G4A-U01 source images.
- Compare the image-observed subtypes against the existing S43E8 G4A-U01 KP expansion overlay.
- Record fine-grained KnowledgePoint and PatternSpec candidates needed before generator / validator implementation.
- Do not modify generator, validator, renderer, UI, or worksheet output.
- Do not perform browser/PDF smoke in this task.

existing_g4a_u01_registry_context:
- Batch A includes g4a_u01_4a01 as 4A-U01 1億以內的數.
- S43E8 already recorded 17 broad G4A-U01 KnowledgePoints.
- Existing runtime PatternSpec before this scan is ps_g4a_u01_compare_8digit.
- S43E8 broad coverage already includes:
  - 八位數分解組合
  - 八位數比大小
  - 1億以內數比大小
  - 1億以內數的讀寫
  - 未知數位下的最大最小
  - 用指定數字組合五位數
  - 大數直式計算
  - 大數加減
  - 中間有0的讀寫
  - 兩數間規律

image_observed_task_groups:
- 題型1 八位數分解組合:
  - visible_count_estimate = 9
  - observed_subtypes:
    - standard place-value decomposition
    - standard place-value composition
    - nonstandard place-value composition / regrouping
    - place-value card or unit-card composition
    - same digit in different places, value difference
    - Chinese-number / Arabic-number reading-writing connection
- 題型3 大數的加減:
  - visible_count_estimate = 3
  - observed_subtypes:
    - wan-unit mixed notation subtraction
    - large-number compare relationship word problem then total
    - large-number real-world add/subtract with 萬 / 公噸 style units
- 題型4 八位數比大小:
  - visible_count_estimate = 8 to 9
  - observed_subtypes:
    - direct eight-digit comparison
    - numeric notation vs Chinese-number notation comparison
    - comparison procedure: identify first different place
    - missing-digit inequality: possible digits
    - missing-digit inequality: maximum/minimum digit
    - digit arrangement maximum/minimum
    - digit-count boundary number difference

classification_delta_vs_S43E8:
- broad_coverage_match = true
- S43E8 broad KPs cover the three image task groups at a coarse level.
- However, several image-observed subtypes are not yet fine-grained enough for generator / validator contracts.
- The scan therefore refines S43E8 broad KPs into implementation-oriented candidates.

fine_grained_knowledgepoint_candidates:
- kp_g4a_u01_8digit_standard_place_value_decomposition
- kp_g4a_u01_8digit_standard_place_value_composition
- kp_g4a_u01_8digit_nonstandard_place_value_composition
- kp_g4a_u01_place_value_card_unit_model_composition
- kp_g4a_u01_same_digit_different_place_difference
- kp_g4a_u01_large_number_reading_writing_conversion
- kp_g4a_u01_large_number_compare_direct
- kp_g4a_u01_compare_first_different_place
- kp_g4a_u01_numeric_vs_chinese_number_compare
- kp_g4a_u01_missing_digit_comparison_possible_digits
- kp_g4a_u01_missing_digit_comparison_extreme_digit
- kp_g4a_u01_digit_arrangement_max_min
- kp_g4a_u01_boundary_number_difference
- kp_g4a_u01_wan_mixed_notation_add_subtract
- kp_g4a_u01_large_number_vertical_add_subtract
- kp_g4a_u01_comparison_word_problem_total
- kp_g4a_u01_large_number_unit_word_problem_add_subtract

patternspec_candidates:
- ps_g4a_u01_8digit_place_value_decomposition
  - source_task_group = 題型1
  - answer_model = place_value_expansion
  - validator_need = parse value into place-value units up to ten-millions
- ps_g4a_u01_place_value_composition_to_number
  - source_task_group = 題型1
  - answer_model = integer_number
  - validator_need = sum place-value unit quantities
- ps_g4a_u01_nonstandard_place_value_composition
  - source_task_group = 題型1
  - answer_model = integer_number
  - validator_need = regroup units such as more than 9 ten-thousands or thousands into standard notation
- ps_g4a_u01_place_value_card_unit_model_composition
  - source_task_group = 題型1
  - answer_model = integer_number
  - validator_need = sum unit-card counts by denomination
- ps_g4a_u01_same_digit_place_value_difference
  - source_task_group = 題型1
  - answer_model = integer_difference
  - validator_need = locate repeated digit positions and subtract represented values
- ps_g4a_u01_large_number_reading_writing_conversion
  - source_task_group = 題型1 / 題型4
  - answer_model = chinese_number_or_arabic_number
  - validator_need = canonical Chinese-number parser / formatter within 100 million
- ps_g4a_u01_large_number_compare_direct
  - source_task_group = 題型4
  - answer_model = comparison_symbol
  - validator_need = compare numeric values directly
- ps_g4a_u01_compare_first_different_place
  - source_task_group = 題型4
  - answer_model = place_name
  - validator_need = find highest place where two numbers differ
- ps_g4a_u01_numeric_vs_chinese_number_compare
  - source_task_group = 題型4
  - answer_model = comparison_symbol
  - validator_need = parse Chinese-number side then compare
- ps_g4a_u01_missing_digit_comparison_possible_digits
  - source_task_group = 題型4
  - answer_model = digit_set
  - validator_need = evaluate all digits 0-9 against inequality constraints
- ps_g4a_u01_missing_digit_comparison_extreme_digit
  - source_task_group = 題型4
  - answer_model = single_digit
  - validator_need = compute maximum or minimum digit satisfying inequality
- ps_g4a_u01_digit_arrangement_max_min
  - source_task_group = 題型4
  - answer_model = integer_number
  - validator_need = arrange given digits under leading-zero policy
- ps_g4a_u01_boundary_number_difference
  - source_task_group = 題型4
  - answer_model = integer_difference
  - validator_need = construct largest/smallest number by digit count then subtract
- ps_g4a_u01_wan_mixed_notation_subtraction
  - source_task_group = 題型3
  - answer_model = integer_difference_or_wan_notation
  - validator_need = parse notation such as 854萬4128 before subtracting
- ps_g4a_u01_large_number_vertical_add_subtract
  - source_task_group = 題型3
  - answer_model = integer_sum_or_difference
  - validator_need = standard large-number add/subtract with carry/borrow
- ps_g4a_u01_comparison_word_problem_total
  - source_task_group = 題型3
  - answer_model = integer_total
  - validator_need = solve compare-more/less relation first, then add total
- ps_g4a_u01_large_number_unit_word_problem_add_subtract
  - source_task_group = 題型3
  - answer_model = integer_quantity_with_unit
  - validator_need = preserve contextual unit such as 人, 公斤, 公噸, 元, or 萬元

not_fully_classified_or_requires_source_confirmation:
- exact item wording in the uploaded images is low-resolution and should not be used as line-level evidence without the original PDF or clearer image.
- Some 題型1 rows appear to involve Chinese-number reading/writing and place-value blanks; exact split between conversion and composition should be confirmed from the original source.
- Some 題型4 rows appear to ask possible digits versus maximum/minimum digit; exact answer shape should be confirmed from the original source.
- Some 題型3 word problems use real-world context and large units; exact unit policy should be confirmed from the original source.

implementation_priority_recommendation:
- Priority 1: extend the existing ps_g4a_u01_compare_8digit path into direct compare / numeric-vs-Chinese compare / first-different-place compare.
- Priority 2: implement place-value composition/decomposition because it supports both 題型1 and later large-number reasoning.
- Priority 3: implement missing-digit comparison possible/extreme digit because it requires a distinct answer model.
- Priority 4: implement wan mixed notation and comparison word-problem total for 題型3.
- Priority 5: boundary number difference and digit arrangement can be implemented after compare and place-value core are stable.

anti_scope_check:
- No code modified.
- No generator/validator/renderer changed.
- No worksheet output generated.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No Batch D g3a_u04 work performed.

GOAL_DISTANCE_BEFORE = D1_G3B_U01_UNIT_CLOSED_ACCEPTED_PASS
GOAL_DISTANCE_AFTER = D2_G4A_U01_SOURCE_IMAGE_PATTERN_SCAN_COMPLETE
DISTANCE_REDUCED = G4A-U01 source images were converted from broad visual task groups into fine-grained KnowledgePoint and PatternSpec candidates for future generator/validator work.
REMAINING_BLOCKERS = ["Need clearer original source/PDF for exact item-level evidence", "G4A-U01 fine-grained PatternSpecs not yet materialized", "G4A-U01 generator/validator coverage not implemented for most C-class patterns", "G4A-U01 output QA not started", "G4A units still need output QA", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S50B_G4A_U01_PatternSpecMaterializationPlan
