S50C_G4A_U01_Phase1PatternSpecContract

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PHASE1_PATTERN_SPEC_CONTRACT_COMPLETED
write_type = FormalMapping / PatternSpec contract document

scope_lock:
- Freeze the Phase 1 printable PatternSpec subset for G4A-U01.
- Define answer models, generator contracts, validator contracts, duplicate policy, and range policy.
- Do not implement code in this contract task.
- Do not add Phase 2/Phase 3 patterns to the first printable milestone.

phase1_goal:
- Make g4a_u01_4a01 UI-printable with representative coverage from:
  - 題型4 八位數比大小
  - 題型1 八位數分解組合
  - 題型3 大數的加減
- Keep Chinese-number parsing, missing-digit comparison, word-problem semantics, and unit-context variants out of Phase 1.

phase1_patterns:

1. ps_g4a_u01_compare_8digit
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_large_number_compare_direct
- kind = comparison
- range = left/right integers from 10,000,000 to 99,999,999
- answerModel = comparison_symbol
- validAnswers = [">", "<", "="]
- generatorContract:
  - generate two 8-digit integers
  - avoid equal values unless explicitly testing equality later
  - expose left, right, blankedDisplayText, answerText, finalAnswer
- validatorContract:
  - compare left and right numerically
  - answerText must equal expected comparison symbol

2. ps_g4a_u01_within_100million_compare
- source_task_group = 題型4 八位數比大小 / 1億以內數比大小
- knowledgePointId = kp_g4a_u01_large_number_compare_direct
- kind = comparison
- range = left/right integers from 0 to 99,999,999
- answerModel = comparison_symbol
- generatorContract:
  - generate two safe integers within 100 million
  - include varied digit lengths but keep values non-negative
- validatorContract:
  - compare left and right numerically
  - answerText must equal expected comparison symbol

3. ps_g4a_u01_large_number_add_sub
- source_task_group = 題型3 大數的加減
- knowledgePointId = kp_g4a_u01_large_number_vertical_add_subtract
- kind = expression
- range = operands from 10,000 to 99,999,999
- operator = add or subtract
- answerModel = integer_sum_or_difference
- generatorContract:
  - generate addition within answer max 99,999,999
  - generate subtraction with left >= right to avoid negative results
  - produce expression, finalAnswer, duplicateKey, display model compatible with existing renderer
- validatorContract:
  - evaluate expression
  - finalAnswer must equal numeric result
  - answer must be integer, non-negative, and <= 99,999,999

4. ps_g4a_u01_8digit_place_value_decomposition
- source_task_group = 題型1 八位數分解組合
- knowledgePointId = kp_g4a_u01_8digit_standard_place_value_decomposition
- kind = g4aU01PlaceValueDecomposition
- range = value from 10,000,000 to 99,999,999
- answerModel = place_value_expansion
- answerShape:
  - digits = [tenMillions, millions, hundredThousands, tenThousands, thousands, hundreds, tens, ones]
  - answerText = compact place-value expansion string
- generatorContract:
  - generate an 8-digit integer
  - expose digitsByPlace and placeValues
  - prompt asks how many of each place-value unit compose the number
- validatorContract:
  - value must be 8-digit
  - digitsByPlace must match String(value)
  - each represented place value must equal digit * place unit
  - answerText must match canonical expansion

5. ps_g4a_u01_place_value_composition_to_number
- source_task_group = 題型1 八位數分解組合
- knowledgePointId = kp_g4a_u01_8digit_standard_place_value_composition
- kind = g4aU01PlaceValueComposition
- range = standard 0-9 counts for each place-value unit, ten-millions count 1-9
- answerModel = integer_number
- generatorContract:
  - generate standard place-value unit counts
  - ask the student to combine them into an integer
  - expose placeCounts and finalAnswer
- validatorContract:
  - computed value = sum(count * unit)
  - finalAnswer and answerText must equal computed value
  - generated value must be within 10,000,000 to 99,999,999

6. ps_g4a_u01_same_digit_place_value_difference
- source_task_group = 題型1 八位數分解組合
- knowledgePointId = kp_g4a_u01_same_digit_different_place_difference
- kind = g4aU01SameDigitPlaceValueDifference
- range = 8-digit number containing the same nonzero digit in exactly two selected places
- answerModel = integer_difference
- generatorContract:
  - choose repeatedDigit from 2 to 9
  - choose two distinct place positions
  - generate an 8-digit value with that repeated digit in those places
  - avoid additional accidental occurrences of the repeated digit
- validatorContract:
  - repeatedDigit must occur at the declared two positions
  - represented values = repeatedDigit * unit for each declared position
  - finalAnswer = absolute difference between represented values
  - answerText must equal finalAnswer string

duplicate_policy:
- For Phase 1 local/browser smoke, normalized duplicate question strings should be zero for 30 and 100 question runs if feasible.
- If 150/200 question large mixed worksheets produce limited duplicate exact strings, operator may accept as non-blocking following G3B-U01 precedent.
- The implementation should still use deterministic duplicate suppression where practical.

range_policy:
- eight_digit patterns: 10,000,000 to 99,999,999
- within_100million comparison: 0 to 99,999,999
- large_number_add_sub: non-negative integer answers <= 99,999,999
- place-value composition/decomposition: 8-digit output for Phase 1

renderer_policy:
- All new place-value shapes must expose blankedDisplayText and answerText so existing text-question renderer can print them.
- Avoid overly long prompts where possible, because Phase 1 must print in the existing Batch A worksheet grid.

acceptance:
- All six Phase 1 PatternSpecs have frozen IDs.
- All six have answerModel, generatorContract, validatorContract, duplicate policy, range policy, and renderer policy.
- S50D may implement only these six PatternSpecs.

anti_scope_check:
- No code modified.
- No generator/validator/renderer changed.
- No worksheet output generated.
- No Phase 2/Phase 3 PatternSpecs implemented.

GOAL_DISTANCE_BEFORE = D2_G4A_U01_PRINTABLE_UI_ROADMAP_COMPLETE
GOAL_DISTANCE_AFTER = D2_G4A_U01_PHASE1_PATTERN_SPEC_CONTRACT_COMPLETE
DISTANCE_REDUCED = G4A-U01 Phase 1 printable scope is frozen into six PatternSpecs with generator, validator, renderer, range, and duplicate contracts.
REMAINING_BLOCKERS = ["Phase 1 generator/validator not implemented", "G4A-U01 UI browser generation not smoke-tested", "G4A-U01 PDF print smoke not completed", "Need clearer original source/PDF for exact item-level evidence", "browser/PDF smoke later", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S50D_G4A_U01_Phase1GeneratorValidatorImplementation
