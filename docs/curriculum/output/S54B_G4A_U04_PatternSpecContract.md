S54B_G4A_U04_PatternSpecContract

sourceId = g4a_u04_4a04
unit = 4A-U04 整數的除法
status = PATTERN_SPEC_CONTRACT_COMPLETED
write_type = formal_pattern_spec_contract

scope_lock:
- Contract only the seven G4A-U04 source-image KnowledgePoint candidates from S54A.
- Do not implement generator/validator/selector in this task.
- Do not add G4A-U08 or cross-unit fusion.
- Keep quotient-zero and remainder variants as internal coverage unless future PDF QA indicates student-facing confusion.

shared_division_contract:
- questionKind = g4aU04Division
- answerModel = quotient_remainder
- required fields:
  - dividend
  - divisor
  - quotient
  - remainder
  - dividendDigits
  - divisorDigits
  - quotientDigits
  - firstDivisionUnit
  - quotientStartPlace
  - coverageCase
- correctness rules:
  - quotient = floor(dividend / divisor)
  - remainder = dividend % divisor
  - dividend = divisor × quotient + remainder
  - 0 <= remainder < divisor
- prompt model:
  - horizontal prompt acceptable for first implementation if it preserves source-image case label and answer model.
  - long-division metadata must be present for later scaffold rendering.

coverage_mix_contract:
- Each PatternSpec must include deterministic coverage cases.
- Required internal coverage:
  - remainder_zero
  - remainder_nonzero
  - quotient_zero_in_middle when valid for 4digit ÷ 1digit and 3digit ÷ 2digit cases
  - place_value_start alignment
  - no_leading_zero_quotient
- Verification pattern must include only remainder_nonzero unless later source evidence adds no-remainder check.

pattern_specs:

1. ps_g4a_u04_4digit_by_1digit_thousands_sufficient
- kp = kp_g4a_u04_4digit_by_1digit_thousands_sufficient
- title = 4位數除以1位數：千位夠除
- kind = g4aU04LongDivision
- dividendRange = [1000, 9999]
- divisorRange = [2, 9]
- divisorDigits = 1
- dividendDigits = 4
- firstPlaceRule:
  - thousandsDigit > divisor OR thousandsDigit >= divisor with firstStepRemainder > 0
  - quotientStartPlace = thousands
- answerModel = quotient_remainder
- coverageCases = [remainder_zero, remainder_nonzero, quotient_zero_in_middle]

2. ps_g4a_u04_4digit_by_1digit_thousands_insufficient
- kp = kp_g4a_u04_4digit_by_1digit_thousands_insufficient
- title = 4位數除以1位數：千位不夠除
- kind = g4aU04LongDivision
- dividendRange = [1000, 9999]
- divisorRange = [2, 9]
- divisorDigits = 1
- dividendDigits = 4
- firstPlaceRule:
  - thousandsDigit < divisor
  - firstDivisionUnit = first two digits of dividend
  - quotientStartPlace = hundreds
- answerModel = quotient_remainder
- coverageCases = [remainder_zero, remainder_nonzero, quotient_zero_in_middle]

3. ps_g4a_u04_4digit_by_1digit_thousands_exact
- kp = kp_g4a_u04_4digit_by_1digit_thousands_exact
- title = 4位數除以1位數：千位整除
- kind = g4aU04LongDivision
- dividendRange = [1000, 9999]
- divisorRange = [2, 9]
- divisorDigits = 1
- dividendDigits = 4
- firstPlaceRule:
  - thousandsDigit % divisor = 0
  - thousandsDigit >= divisor
  - quotientStartPlace = thousands
  - firstStepRemainder = 0
- answerModel = quotient_remainder
- coverageCases = [next_digit_zero, remainder_zero, remainder_nonzero, quotient_zero_in_middle]

4. ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor
- kp = kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor
- title = 2位數除以2位數：除數是10的倍數
- kind = g4aU04LongDivision
- dividendRange = [10, 99]
- divisorSet = [10, 20, 30, 40, 50, 60, 70, 80, 90]
- divisorDigits = 2
- dividendDigits = 2
- quotientStartPlace = ones
- answerModel = quotient_remainder
- coverageCases = [remainder_zero, remainder_nonzero, divisor_10_multiple]

5. ps_g4a_u04_3digit_by_2digit_tens_sufficient
- kp = kp_g4a_u04_3digit_by_2digit_tens_sufficient
- title = 3位數除以2位數：十位夠除
- kind = g4aU04LongDivision
- dividendRange = [100, 999]
- divisorRange = [10, 99]
- divisorDigits = 2
- dividendDigits = 3
- firstPlaceRule:
  - firstTwoDividendDigits >= divisor
  - quotientStartPlace = tens
- answerModel = quotient_remainder
- coverageCases = [remainder_zero, remainder_nonzero, quotient_zero_in_middle]

6. ps_g4a_u04_3digit_by_2digit_tens_insufficient
- kp = kp_g4a_u04_3digit_by_2digit_tens_insufficient
- title = 3位數除以2位數：十位不夠除
- kind = g4aU04LongDivision
- dividendRange = [100, 999]
- divisorRange = [10, 99]
- divisorDigits = 2
- dividendDigits = 3
- firstPlaceRule:
  - firstTwoDividendDigits < divisor
  - quotientStartPlace = ones
- answerModel = quotient_remainder
- coverageCases = [remainder_zero, remainder_nonzero]

7. ps_g4a_u04_division_check_with_remainder
- kp = kp_g4a_u04_division_check_with_remainder
- title = 除法驗算：有餘數
- kind = g4aU04DivisionCheckWithRemainder
- dividendRange = [10, 9999]
- divisorRange = [2, 99]
- answerModel = verification_equation
- required fields:
  - dividend
  - divisor
  - quotient
  - remainder
  - checkExpression = divisor × quotient + remainder
  - checkValue = dividend
- correctness rules:
  - remainder > 0
  - remainder < divisor
  - divisor × quotient + remainder = dividend
- prompt shape:
  - quotient/remainder shown; student completes or verifies the check equation.

selector_contract:
- G4A-U04 visible KnowledgePoints after implementation = 7.
- Same-unit mixed selector must allow all seven G4A-U04 KPs.
- Source-unit mode should generate all seven PatternSpecs.

validator_contract:
- Validate quotient/remainder math for all long division KPs.
- Validate firstPlaceRule for each PatternSpec.
- Validate quotientStartPlace metadata.
- Validate divisorSet for ten-multiple pattern.
- Validate check equation for remainder verification pattern.
- Reject cases where remainder >= divisor.

pdf_smoke_acceptance_contract:
- Single-KP PDFs must show expected source case label or equivalent wording.
- Same-unit mixed PDF must include all seven pattern families.
- Answer key must include quotient and remainder, or verification equation result.
- Exact duplicate prompts should stay bounded.
- If long-division scaffold is not implemented in first pass, horizontal prompts are acceptable only if firstPlaceRule metadata and source labels are test-covered.

GOAL_DISTANCE_BEFORE = D3_G4A_U04_KP_AND_PATTERN_CANDIDATES_SCANNED
GOAL_DISTANCE_AFTER = D2_G4A_U04_PATTERN_SPEC_CONTRACT_COMPLETED
DISTANCE_REDUCED = G4A-U04 moved from source-image KP candidates into formal PatternSpec, generator, validator, selector, and PDF-smoke contracts for seven visible KnowledgePoints.
REMAINING_BLOCKERS = ["Need operator approval before implementation", "Need generator/validator/selector implementation", "Need npm test readback", "Need single-KP and mixed PDF smoke", "Need decide during PDF QA whether horizontal prompts are sufficient or long-division scaffold is required"]
NEXT_SHORTEST_STEP = S54C_G4A_U04_GeneratorValidatorSelectorImplementation
STOP_REASON = planning_to_implementation_requires_operator_approval
BLOCKER_TYPE = OPERATOR_APPROVAL_REQUIRED
LAST_COMPLETED_STATUS = S54B_PATTERN_SPEC_CONTRACT_COMPLETED
REQUIRED_OPERATOR_ACTION = Approve S54C implementation or revise the seven-KP G4A-U04 scope before code changes.
NEXT_RESUME_TASK = S54C_G4A_U04_GeneratorValidatorSelectorImplementation
