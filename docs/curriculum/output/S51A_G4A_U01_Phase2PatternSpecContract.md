S51A_G4A_U01_Phase2PatternSpecContract

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = PHASE2_PATTERN_SPEC_CONTRACT_COMPLETED
write_type = FormalMapping / PatternSpec contract document

scope_lock:
- Add only G4A-U01 Phase 2 source-image-derived patterns.
- Do not implement Phase 3 Chinese-number parsing/formatting or word-problem semantics.
- Do not start G4A-U02/G4A-U04/G4A-U08.
- Preserve S50 Phase 1 print-ready behavior.

phase2_goal:
- Extend G4A-U01 beyond Phase 1 core printable set into reasoning-heavy place-value and comparison patterns visible in source images.
- Keep implementation deterministic and validator-backed.
- Keep answer models printable in the existing Batch A worksheet UI.

phase2_patterns:

1. ps_g4a_u01_nonstandard_place_value_composition
- source_task_group = 題型1 八位數分解組合
- knowledgePointId = kp_g4a_u01_nonstandard_place_value_composition
- kind = g4aU01NonstandardPlaceValueComposition
- answerModel = integer_number
- generatorContract:
  - represent an 8-digit value using nonstandard counts, such as more than 9 百萬 or 十萬 units.
  - ask student to combine units into one integer.
  - expose placeCounts and finalAnswer.
- validatorContract:
  - computed value = sum(count * unit)
  - at least one non-leading unit count must be > 9.
  - finalAnswer and answerText equal computed value.
  - value remains 10,000,000 to 99,999,999.

2. ps_g4a_u01_place_value_card_unit_model_composition
- source_task_group = 題型1 八位數分解組合
- knowledgePointId = kp_g4a_u01_place_value_card_unit_model_composition
- kind = g4aU01PlaceValueCardComposition
- answerModel = integer_number
- generatorContract:
  - present place-value card/unit counts as a card model.
  - ask student to combine the card model into an integer.
- validatorContract:
  - computed value = sum(cardCount * unit)
  - card counts are standard 0-9, ten-millions count 1-9.
  - answerText/finalAnswer equal computed value.

3. ps_g4a_u01_compare_first_different_place
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_compare_first_different_place
- kind = g4aU01CompareFirstDifferentPlace
- answerModel = place_label
- generatorContract:
  - generate two 8-digit numbers sharing a prefix, then differing at a declared place.
  - ask which place should be compared first.
- validatorContract:
  - firstDifferentIndex is the first digit index where left/right differ.
  - answerText equals the corresponding place label.

4. ps_g4a_u01_missing_digit_comparison_possible_digits
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_missing_digit_comparison_possible_digits
- kind = g4aU01MissingDigitComparisonPossibleDigits
- answerModel = digit_set
- generatorContract:
  - generate comparison with one □ digit in one number.
  - ask which digits can make the comparison true.
  - avoid leading-zero blank positions.
- validatorContract:
  - possibleDigits equals the exhaustive set of digits 0-9 satisfying the comparison.
  - answerText is the sorted comma-separated digit set.

5. ps_g4a_u01_missing_digit_comparison_extreme_digit
- source_task_group = 題型4 八位數比大小
- knowledgePointId = kp_g4a_u01_missing_digit_comparison_extreme_digit
- kind = g4aU01MissingDigitComparisonExtremeDigit
- answerModel = digit
- generatorContract:
  - generate comparison with one □ digit and a question asking 最大 or 最小 possible digit.
  - possible digit set must be non-empty.
- validatorContract:
  - finalAnswer equals max(possibleDigits) or min(possibleDigits) according to extremeMode.
  - answerText equals that digit.

duplicate_policy:
- 30/60 question smoke should avoid duplicate normalized prompt strings.
- Large 150/200 worksheets may accept limited duplicates only if operator accepts them later; implementation should still suppress duplicates where practical.

range_policy:
- All generated values remain 8-digit unless the specific pattern explicitly uses within-100-million comparison already covered by Phase 1.
- Missing-digit blanks must not allow leading-zero 7-digit results.

renderer_policy:
- All Phase 2 patterns expose blankedDisplayText and answerText.
- Long unit/card prompts may use adaptive tall-card print layout caps during later PDF smoke.

acceptance:
- Source-pattern definitions exist for five Phase 2 PatternSpecs.
- Generator can produce all five patterns.
- Validator can verify all five answer models.
- KnowledgePoint selector exposes five additional G4A-U01 KPs.
- npm test must pass before Phase 2 UI/PDF smoke.

anti_scope_check:
- Contract only; no code modified by this marker.
- No Phase 3 patterns included.

GOAL_DISTANCE_BEFORE = D0_G4A_U01_PHASE1_PRINT_READY
GOAL_DISTANCE_AFTER = D2_G4A_U01_PHASE2_PATTERN_SPEC_CONTRACT_COMPLETE
DISTANCE_REDUCED = G4A-U01 Phase 2 scope is fixed into five deterministic PatternSpecs with generator/validator contracts.
REMAINING_BLOCKERS = ["Phase 2 generator/validator not implemented", "Phase 2 KnowledgePoint selector projection not implemented", "Phase 2 npm test not run", "Phase 2 PDF smoke not run", "Phase 3 source-image patterns deferred"]
NEXT_SHORTEST_STEP = S51B_G4A_U01_Phase2GeneratorValidatorSelectorImplementation
