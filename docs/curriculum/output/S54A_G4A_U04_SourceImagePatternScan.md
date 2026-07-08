S54A_G4A_U04_SourceImagePatternScan

sourceId = g4a_u04_4a04
unit = 4A-U04 整數的除法
status = SOURCE_IMAGE_PATTERN_SCAN_COMPLETED
write_type = source_image_pattern_scan

preflight:
- Prior unit G4A-U02 is closed as PASS_ACCEPTED_AND_CLOSED in S53H_G4A_U02_UNIT_CLOSEOUT_PASS.marker.
- Operator provided seven G4A-U04 source images.
- This task scans only the provided source images and converts them into KnowledgePoint / PatternSpec candidates.

scope_lock:
- Scan G4A-U04 only.
- Do not start G4A-U08 整數四則.
- Do not start G4B/G5 units.
- Do not implement generator/validator in this task.
- Treat source-image labels as the primary evidence for visible KnowledgePoint candidates.

source_observations:
1. 4位數 ÷ 1位數 第一型（千位夠除）
   - Long division pattern.
   - First dividend digit at thousands place is sufficient for the one-digit divisor.
   - Quotient starts at thousands place.
   - Source example shape: 3）4852, with thousands-place division visible.
   - Candidate KP: kp_g4a_u04_4digit_by_1digit_thousands_sufficient.

2. 4位數 ÷ 1位數 第二型（千位不夠除）
   - Long division pattern.
   - Thousands digit is smaller than divisor, so the first division unit must combine thousands and hundreds.
   - Quotient starts at hundreds place.
   - Source example shape: 9）2754.
   - Candidate KP: kp_g4a_u04_4digit_by_1digit_thousands_insufficient.

3. 4位數 ÷ 1位數 第三型（千位整除）
   - Long division pattern.
   - Thousands-place division is exact at the first step.
   - Source example shape: 7）7052.
   - Important subcase: after thousands-place exact division, the following digit may require place-value alignment and quotient-zero handling.
   - Candidate KP: kp_g4a_u04_4digit_by_1digit_thousands_exact.

4. 2位數 ÷ 2位數，除數是10的倍數
   - Long division / estimation pattern.
   - Divisor is a multiple of 10.
   - Source example shape: 20）66.
   - Candidate KP: kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor.

5. 3位數 ÷ 2位數 第一型（十位夠除）
   - Long division pattern.
   - First two dividend digits are sufficient for the two-digit divisor.
   - Quotient starts at tens place.
   - Source example shape: 30）852.
   - Candidate KP: kp_g4a_u04_3digit_by_2digit_tens_sufficient.

6. 3位數 ÷ 2位數 第二型（十位不夠除）
   - Long division pattern.
   - First two dividend digits are smaller than the two-digit divisor.
   - Quotient starts at ones place.
   - Source example shape: 30）252.
   - Candidate KP: kp_g4a_u04_3digit_by_2digit_tens_insufficient.

7. 除法驗算（有餘數）
   - Remainder division verification pattern.
   - Key relation: dividend = divisor × quotient + remainder.
   - Remainder must be smaller than divisor.
   - Source example: 15 ÷ 4 = 3 ... 3; check 4 × 3 + 3 = 15.
   - Candidate KP: kp_g4a_u04_division_check_with_remainder.

visible_knowledge_point_candidates:
1. kp_g4a_u04_4digit_by_1digit_thousands_sufficient
   - displayName = 4位數除以1位數：千位夠除
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division
2. kp_g4a_u04_4digit_by_1digit_thousands_insufficient
   - displayName = 4位數除以1位數：千位不夠除
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division
3. kp_g4a_u04_4digit_by_1digit_thousands_exact
   - displayName = 4位數除以1位數：千位整除
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division
4. kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor
   - displayName = 2位數除以2位數：除數是10的倍數
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division_estimation
5. kp_g4a_u04_3digit_by_2digit_tens_sufficient
   - displayName = 3位數除以2位數：十位夠除
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division
6. kp_g4a_u04_3digit_by_2digit_tens_insufficient
   - displayName = 3位數除以2位數：十位不夠除
   - outputStyle = horizontal_or_long_division_prompt
   - sourceImageType = long_division
7. kp_g4a_u04_division_check_with_remainder
   - displayName = 除法驗算：有餘數
   - outputStyle = verification_reasoning_prompt
   - sourceImageType = verification_diagram

subcase_inventory:
- first_place_sufficient
- first_place_insufficient
- first_place_exact
- quotient_starts_thousands
- quotient_starts_hundreds
- quotient_starts_tens
- quotient_starts_ones
- quotient_zero_in_middle
- ten_multiple_divisor
- remainder_zero
- remainder_nonzero
- remainder_less_than_divisor
- division_check_with_remainder

initial_visible_vs_internal_decision:
- Keep the seven source-labeled patterns as visible KnowledgePoints.
- Treat quotient-zero, remainder-zero/nonzero, and place-value alignment as internal coverage unless later source evidence requires separate visible KPs.
- For first implementation, long-division scaffold can be represented by horizontal division prompts plus metadata, but PDF smoke must confirm the output is pedagogically readable.

next_contract_requirements:
- Formal PatternSpecs must define dividend/divisor ranges.
- PatternSpecs must define first-place sufficiency rules.
- PatternSpecs must define quotient start place.
- PatternSpecs must define quotient/remainder answer model.
- Verification PatternSpec must define dividend = divisor × quotient + remainder and remainder < divisor.

GOAL_DISTANCE_BEFORE = D4_G4A_U04_SOURCE_IMAGES_PROVIDED
GOAL_DISTANCE_AFTER = D3_G4A_U04_KP_AND_PATTERN_CANDIDATES_SCANNED
DISTANCE_REDUCED = G4A-U04 source images were converted into 7 visible KnowledgePoint candidates, subcase inventory, and next PatternSpec contract requirements.
REMAINING_BLOCKERS = ["Need S54B PatternSpec contract", "Need generator/validator implementation after contract approval", "Need npm/PDF validation", "Need decide whether long-division scaffold is required or horizontal prompts are acceptable for current stage"]
NEXT_SHORTEST_STEP = S54B_G4A_U04_PatternSpecContract
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S54A_SOURCE_IMAGE_PATTERN_SCAN_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S54B_G4A_U04_PatternSpecContract
