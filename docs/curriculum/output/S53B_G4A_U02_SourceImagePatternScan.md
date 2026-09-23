S53B_G4A_U02_SourceImagePatternScan

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = SOURCE_IMAGE_PATTERN_SCAN_COMPLETED
write_type = source_image_pattern_scan

scope_lock:
- Scan only operator-provided G4A-U02 images.
- Do not expand to G4A-U04/G4A-U08.
- Do not promote zero cases into separate visible KnowledgePoints at this stage.
- Record zero/carry/partial-product cases as internal coverage/subcases.

source_observations:
1. 複習三位數 × 一位數
   - numeric vertical multiplication.
   - source examples include digit-by-digit multiplication and carrying columns.
   - candidate KP: kp_g4a_u02_3digit_by_1digit_review.
2. 四位數 × 一位數（有缺位）
   - numeric vertical missing-digit multiplication.
   - source example asks for missing digit in a four-digit by one-digit product setup.
   - candidate KP: kp_g4a_u02_4digit_by_1digit_missing_digit.
3. 一位數 × 二位數
   - numeric vertical multiplication; one-digit factor may be written below two-digit factor.
   - candidate KP: kp_g4a_u02_1digit_by_2digit.
4. 一位數 × 三位數
   - numeric vertical multiplication; one-digit factor below three-digit factor.
   - candidate KP: kp_g4a_u02_1digit_by_3digit.
5. 二位數 × 二位數
   - numeric vertical multiplication with partial products.
   - source examples include carry and place-value alignment.
   - candidate KP: kp_g4a_u02_2digit_by_2digit.
6. 二位數 × 三位數
   - numeric vertical multiplication with partial products.
   - source examples include two-digit multiplier and three-digit multiplicand.
   - candidate KP: kp_g4a_u02_2digit_by_3digit.
7. 三位數 × 二位數
   - numeric vertical multiplication with partial products.
   - candidate KP: kp_g4a_u02_3digit_by_2digit.
8. 數字卡排列三位數 × 二位數，求最大/最小乘積
   - reasoning/text pattern.
   - source prompt uses six digit cards and asks largest and smallest product.
   - candidate KP: kp_g4a_u02_digit_card_arrangement_product_max_min.
9. 接近整百乘法策略
   - reasoning/strategy text pattern.
   - source examples include 98×100, then 98×99 and 98×101 by subtracting or adding one group of 98.
   - candidate KP: kp_g4a_u02_near_hundred_multiplication_strategy.

numeric_vs_text_classification:
- numeric vertical KPs = 7
- reasoning/text KPs = 2
- operator classification confirmed: only 2 are text/reasoning; others are numeric vertical patterns.

internal_zero_coverage_decision:
- Zero-involved cases remain internal coverage/subcases.
- No visible zero-only KP in first G4A-U02 implementation.
- Missing-digit pattern must include answers where missing digit = 0.
- Two-digit multiplier patterns must include partial-product zero and multiplier multiple-of-10 cases.
- Numeric vertical patterns must include zero in operand and answer when the range makes it valid.

subcase_inventory:
- normal_no_carry
- carry_single_column
- carry_multi_column
- zero_in_operand
- zero_in_product
- trailing_zero_product
- multiplier_multiple_of_10
- partial_product_zero
- place_value_alignment
- missing_digit_zero_answer
- no_leading_zero_guard

visible_knowledge_point_candidates:
1. kp_g4a_u02_3digit_by_1digit_review
2. kp_g4a_u02_4digit_by_1digit_missing_digit
3. kp_g4a_u02_1digit_by_2digit
4. kp_g4a_u02_1digit_by_3digit
5. kp_g4a_u02_2digit_by_2digit
6. kp_g4a_u02_2digit_by_3digit
7. kp_g4a_u02_3digit_by_2digit
8. kp_g4a_u02_digit_card_arrangement_product_max_min
9. kp_g4a_u02_near_hundred_multiplication_strategy

next_contract_requirements:
- Numeric PatternSpecs must define operand ranges and answer bounds.
- Numeric PatternSpecs must define coverageMix.
- Missing-digit PatternSpec must define unique-answer missing digit model.
- Two-digit multiplier PatternSpecs must define partialProducts and placeValueShift.
- Reasoning PatternSpecs must define deterministic answer model before implementation.

GOAL_DISTANCE_BEFORE = D4_G4A_U02_SOURCE_IMAGES_UNSTRUCTURED
GOAL_DISTANCE_AFTER = D3_G4A_U02_KP_AND_PATTERN_CANDIDATES_SCANNED
DISTANCE_REDUCED = G4A-U02 source images were converted into 9 visible KP candidates, subcase inventory, and internal zero-coverage policy.
REMAINING_BLOCKERS = ["Need PatternSpec contract before implementation", "Need generator/validator implementation", "Need npm/PDF validation", "Source images are still conversation-provided evidence rather than permanent source PDFs"]
NEXT_SHORTEST_STEP = S53C_G4A_U02_PatternSpecContract
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S53B_SOURCE_IMAGE_PATTERN_SCAN_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S53C_G4A_U02_PatternSpecContract
