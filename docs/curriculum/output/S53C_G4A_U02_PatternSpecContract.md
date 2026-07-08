S53C_G4A_U02_PatternSpecContract

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = PATTERN_SPEC_CONTRACT_COMPLETED
write_type = formal_pattern_spec_contract

scope_lock:
- Contract all 9 visible G4A-U02 KnowledgePoints.
- Implementation sequence remains split: first 7 numeric KPs, then 2 reasoning/text KPs.
- Zero cases remain internal coverage/subcase unless later promoted by QA evidence.

shared_numeric_contract:
- questionKind = g4aU02VerticalMultiplication
- answerModel = integer_product
- required fields:
  - multiplicand
  - multiplier
  - product
  - operandDigitCounts
  - partialProducts for two-digit multiplier patterns
  - coverageCase
  - hasCarry
  - hasZeroInOperand
  - hasZeroInProduct
- prompt model:
  - numeric vertical or compact multiplication expression.
  - answer key must expose product.
- validator requirements:
  - product = multiplicand × multiplier
  - operand digit counts match PatternSpec
  - product within answerConstraint
  - coverageCase fields match actual operands/product
  - if multiplier has two digits, partialProducts are validated:
    - onesPartial = multiplicand × onesDigit(multiplier)
    - tensPartial = multiplicand × tensDigit(multiplier) × 10
    - product = onesPartial + tensPartial

coverage_mix_contract:
- coverage cases are deterministic by sequence number.
- numeric PatternSpecs must cycle through:
  - normal_no_carry
  - carry
  - zero_in_operand
  - zero_in_product
  - trailing_zero_product
- two-digit multiplier PatternSpecs additionally cycle:
  - multiplier_multiple_of_10
  - partial_product_zero
  - place_value_alignment
- missing-digit PatternSpec additionally cycles:
  - missing_digit_zero_answer
  - missing_digit_nonzero_answer
- zero cases are internal coverage and not separate visible KPs.

pattern_specs:

1. ps_g4a_u02_3digit_by_1digit_review
- kp = kp_g4a_u02_3digit_by_1digit_review
- title = 三位數乘一位數複習
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [100, 999]
- multiplierRange = [2, 9]
- digitCounts = [3, 1]
- answerConstraint = [200, 8991]
- coverageCases = [normal_no_carry, carry, zero_in_operand, zero_in_product]

2. ps_g4a_u02_4digit_by_1digit_missing_digit
- kp = kp_g4a_u02_4digit_by_1digit_missing_digit
- title = 四位數乘一位數缺位
- kind = g4aU02MissingDigitMultiplication
- multiplicandRange = [1000, 9999]
- multiplierRange = [2, 9]
- digitCounts = [4, 1]
- answerConstraint = [2000, 89991]
- missingTarget = multiplicand digit or product digit
- missingDigitCanBeZero = true
- uniqueSolutionRequired = true
- noLeadingZeroGuard = true
- answerModel = single_digit

3. ps_g4a_u02_1digit_by_2digit
- kp = kp_g4a_u02_1digit_by_2digit
- title = 一位數乘二位數
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [10, 99]
- multiplierRange = [2, 9]
- displayOrder = one_digit_by_two_digit_allowed
- digitCounts = [2, 1]
- answerConstraint = [20, 891]
- coverageCases = [normal_no_carry, carry, zero_in_operand, zero_in_product]

4. ps_g4a_u02_1digit_by_3digit
- kp = kp_g4a_u02_1digit_by_3digit
- title = 一位數乘三位數
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [100, 999]
- multiplierRange = [2, 9]
- displayOrder = one_digit_by_three_digit_allowed
- digitCounts = [3, 1]
- answerConstraint = [200, 8991]
- coverageCases = [normal_no_carry, carry, zero_in_operand, zero_in_product]

5. ps_g4a_u02_2digit_by_2digit
- kp = kp_g4a_u02_2digit_by_2digit
- title = 二位數乘二位數
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [10, 99]
- multiplierRange = [10, 99]
- digitCounts = [2, 2]
- answerConstraint = [100, 9801]
- partialProductsRequired = true
- coverageCases = [normal_no_carry, carry, multiplier_multiple_of_10, partial_product_zero, trailing_zero_product]

6. ps_g4a_u02_2digit_by_3digit
- kp = kp_g4a_u02_2digit_by_3digit
- title = 二位數乘三位數
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [100, 999]
- multiplierRange = [10, 99]
- digitCounts = [3, 2]
- answerConstraint = [1000, 98901]
- partialProductsRequired = true
- coverageCases = [normal_no_carry, carry, zero_in_operand, multiplier_multiple_of_10, partial_product_zero]

7. ps_g4a_u02_3digit_by_2digit
- kp = kp_g4a_u02_3digit_by_2digit
- title = 三位數乘二位數
- kind = g4aU02VerticalMultiplication
- multiplicandRange = [100, 999]
- multiplierRange = [10, 99]
- digitCounts = [3, 2]
- answerConstraint = [1000, 98901]
- partialProductsRequired = true
- coverageCases = [normal_no_carry, carry, zero_in_operand, multiplier_multiple_of_10, partial_product_zero]

8. ps_g4a_u02_digit_card_arrangement_product_max_min
- kp = kp_g4a_u02_digit_card_arrangement_product_max_min
- title = 數字卡排列最大最小乘積
- kind = g4aU02DigitCardArrangementProductMaxMin
- digitCardCount = 6
- arrangementShape = three_digit_by_two_digit
- digitUse = each once
- answerModel = max_min_product_pair
- validator requirements:
  - build all legal permutations deterministically or compute equivalent max/min by exhaustive search.
  - no leading zero in three-digit or two-digit factor.
  - maxProduct and minProduct correct.

9. ps_g4a_u02_near_hundred_multiplication_strategy
- kp = kp_g4a_u02_near_hundred_multiplication_strategy
- title = 接近整百乘法策略
- kind = g4aU02NearHundredMultiplicationStrategy
- base = 100
- shapes:
  - n × 99 = n × 100 - n
  - n × 101 = n × 100 + n
- nRange = [12, 99]
- answerModel = strategy_decomposition_and_product
- validator requirements:
  - baseProduct = n × 100
  - adjustment = n
  - finalProduct = n × targetFactor
  - direction = subtract for 99, add for 101

selector_contract:
- G4A-U02 visible KnowledgePoints after numeric implementation = 7.
- G4A-U02 visible KnowledgePoints after reasoning implementation = 9.
- Same-unit mixed selector must allow all visible G4A-U02 KPs.
- shuffleAcrossPatterns must interleave numeric/reasoning patterns after all-9 implementation.

implementation_stop_points:
- S53D implements only PatternSpecs 1-7.
- S53F implements PatternSpecs 8-9.
- Unit closeout requires both numeric and reasoning PDF smoke.

GOAL_DISTANCE_BEFORE = D3_G4A_U02_KP_AND_PATTERN_CANDIDATES_SCANNED
GOAL_DISTANCE_AFTER = D2_G4A_U02_PATTERN_SPEC_CONTRACT_COMPLETED
DISTANCE_REDUCED = G4A-U02 moved from KP candidates into formal PatternSpec/validator contracts for 9 visible KnowledgePoints.
REMAINING_BLOCKERS = ["Need numeric generator/validator/selector implementation", "Need npm test readback after implementation", "Need numeric PDF smoke", "Reasoning/text KPs deferred to S53F"]
NEXT_SHORTEST_STEP = S53D_G4A_U02_NumericGeneratorValidatorImplementation
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S53C_PATTERN_SPEC_CONTRACT_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S53D_G4A_U02_NumericGeneratorValidatorImplementation
