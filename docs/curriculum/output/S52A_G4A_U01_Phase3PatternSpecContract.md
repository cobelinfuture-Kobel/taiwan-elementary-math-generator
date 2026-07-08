S52A_G4A_U01_Phase3PatternSpecContract

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PHASE3_PATTERN_SPEC_CONTRACT_COMPLETED
write_type = FormalMapping / PatternSpec contract document

source_basis:
- S50A source-image scan identified Phase 3 candidates requiring Chinese-number parser/formatter, contextual units, or multi-step word-problem semantics.
- S50B roadmap deferred these candidates until Phase 1 and Phase 2 were print-ready.
- S51F closes Phase 2 as accepted; Phase 3 can now proceed under the operator-selected scope.

scope_lock:
- Add only G4A-U01 Phase 3 fine-grained source-image patterns.
- Do not start G4A-U02/G4A-U04/G4A-U08.
- Do not implement cross-unit fusion.
- Preserve Phase 1 and Phase 2 generator/validator/selector/PDF behavior.

phase3_patterns:

1. ps_g4a_u01_large_number_reading_writing_conversion
- source_task_group = 題型1 / 題型4
- knowledgePointId = kp_g4a_u01_large_number_reading_writing_conversion
- kind = g4aU01LargeNumberReadingWritingConversion
- answerModel = chinese_number_or_arabic_number
- generatorContract:
  - alternate numeric_to_chinese and chinese_to_numeric prompts.
  - values remain 1 to 99,999,999.
  - expose value, chineseText, conversionDirection.
- validatorContract:
  - chineseText must parse back to value.
  - numeric_to_chinese answerText = chineseText.
  - chinese_to_numeric answerText = decimal integer string.

2. ps_g4a_u01_numeric_vs_chinese_number_compare
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_numeric_vs_chinese_number_compare
- kind = g4aU01NumericVsChineseNumberCompare
- answerModel = comparison_symbol
- generatorContract:
  - left side is Arabic numeric notation.
  - right side is Chinese-number notation.
  - expose leftValue, rightValue, rightChineseText.
- validatorContract:
  - parse rightChineseText to rightValue.
  - answerText must be >, <, or = according to leftValue vs rightValue.

3. ps_g4a_u01_wan_mixed_notation_subtraction
- source_task_group = 題型3 大數的加減
- knowledgePointId = kp_g4a_u01_wan_mixed_notation_subtraction
- kind = g4aU01WanMixedNotationSubtraction
- answerModel = integer_difference
- generatorContract:
  - generate subtraction using mixed 萬 notation, such as 854萬4128 - 126萬3005.
  - expose leftValue, rightValue, leftWanText, rightWanText.
  - leftValue >= rightValue.
- validatorContract:
  - parse wan notation back to integer values.
  - answerText/finalAnswer = leftValue - rightValue.

4. ps_g4a_u01_boundary_number_difference
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_boundary_number_difference
- kind = g4aU01BoundaryNumberDifference
- answerModel = integer_difference
- generatorContract:
  - ask largest/smallest digit-count boundary differences, e.g. 最大8位數 and 最小7位數.
  - expose largerValue, smallerValue, digitCountPair.
- validatorContract:
  - largerValue is 10^n - 1.
  - smallerValue is 10^(m-1).
  - answerText/finalAnswer = largerValue - smallerValue.

5. ps_g4a_u01_comparison_word_problem_total
- source_task_group = 題型3 大數的加減
- knowledgePointId = kp_g4a_u01_comparison_word_problem_total
- kind = g4aU01ComparisonWordProblemTotal
- answerModel = integer_total
- generatorContract:
  - generate compare-more/less relation then ask total.
  - expose baseValue, deltaValue, comparedValue, relationMode, total.
- validatorContract:
  - comparedValue = baseValue ± deltaValue according to relationMode.
  - total = baseValue + comparedValue.
  - answerText/finalAnswer = total.

6. ps_g4a_u01_large_number_unit_word_problem_add_subtract
- source_task_group = 題型3 大數的加減
- knowledgePointId = kp_g4a_u01_large_number_unit_word_problem_add_subtract
- kind = g4aU01LargeNumberUnitWordProblemAddSubtract
- answerModel = integer_quantity_with_unit
- generatorContract:
  - generate large-number add/sub word problem with contextual units: 人, 元, 公斤, 公噸, 萬元.
  - expose leftValue, rightValue, operator, unit, numericAnswer.
- validatorContract:
  - addition answer = leftValue + rightValue.
  - subtraction answer = leftValue - rightValue with non-negative result.
  - answerText includes number and unit.

acceptance:
- Six Phase 3 PatternSpecs are materialized in source-pattern index.
- Generator supports all Phase 1 + Phase 2 + Phase 3 printable G4A-U01 patterns.
- Validator checks Chinese-number parsing, wan notation parsing, boundary arithmetic, and word-problem semantics.
- Selector exposes six additional G4A-U01 KnowledgePoints.
- npm test must pass before PDF smoke.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_PHASE2_CLOSED_ACCEPTED_PASS
GOAL_DISTANCE_AFTER = D2_G4A_U01_PHASE3_PATTERN_SPEC_CONTRACT_COMPLETE
DISTANCE_REDUCED = Phase 3 is fixed into six source-image-derived PatternSpecs with generator and validator contracts.
REMAINING_BLOCKERS = ["Phase 3 generator/validator not implemented", "Phase 3 selector projection not implemented", "Phase 3 tests not implemented", "Phase 3 npm test not run", "Phase 3 PDF smoke not run"]
NEXT_SHORTEST_STEP = S52B_G4A_U01_Phase3GeneratorValidatorSelectorImplementation
STOP_REASON = NONE
BLOCKER_TYPE = NONE
LAST_COMPLETED_STATUS = S52A_PHASE3_PATTERN_SPEC_CONTRACT_COMPLETED
REQUIRED_OPERATOR_ACTION = NONE
NEXT_RESUME_TASK = S52B_G4A_U01_Phase3GeneratorValidatorSelectorImplementation
