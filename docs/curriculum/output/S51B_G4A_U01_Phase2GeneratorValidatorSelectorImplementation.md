S51B_G4A_U01_Phase2GeneratorValidatorSelectorImplementation

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = code_implementation_plus_static_readback_report

scope_lock:
- Implement only S51A Phase 2 five PatternSpecs.
- Do not implement Phase 3 Chinese-number parsing/formatting or word-problem patterns.
- Preserve S50 Phase 1 generator/validator/selector/print-ready behavior.
- Do not start G4A-U02/G4A-U04/G4A-U08.

implemented_phase2_patterns:
- ps_g4a_u01_nonstandard_place_value_composition
- ps_g4a_u01_place_value_card_unit_model_composition
- ps_g4a_u01_compare_first_different_place
- ps_g4a_u01_missing_digit_comparison_possible_digits
- ps_g4a_u01_missing_digit_comparison_extreme_digit

files_modified:
- site/modules/curriculum/batch-a/source-pattern-index.js
- site/modules/curriculum/batch-a/g4a-u01-phase1-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- tests/curriculum/batch-a/g4a-u01-phase1.test.js
- tests/curriculum/batch-a/g4a-u01-kp-selector-projection.test.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js

implementation_summary:
- Added five Phase 2 source-pattern definitions for G4A-U01.
- Extended the existing G4A-U01 generator route to support Phase 1 + Phase 2 printable patterns.
- Added generator support for:
  - nonstandard place-value composition
  - place-value card/unit model composition
  - first-different-place comparison reasoning
  - missing-digit comparison possible-digit set
  - missing-digit comparison extreme digit
- Added validator support for all five new answer models.
- Exposed five additional G4A-U01 KnowledgePoints in the UI selector.
- Updated G4A-U01 selector availability from 6 to 11.
- Updated global Batch A visible KnowledgePoint count from 47 to 52 in tests.
- Added generation/validation/selector tests for Phase 2.

static_readback:
- source-pattern-index.js now includes the five Phase 2 PatternSpecs and kinds.
- g4a-u01-phase1-generator.js now exports Phase 2 pattern IDs and supports generation for all 11 G4A-U01 printable PatternSpecs.
- batch-a-browser-validator.js now validates the five new G4A-U01 Phase 2 kinds.
- batch-a-selector-g4a-extension.js now exposes 11 visible G4A-U01 KnowledgePoints.
- g4a-u01 tests now cover Phase 1 + Phase 2 source-unit generation, validation, selector projection, and worksheet document generation.

validation_status:
- GitHub connector static writes completed.
- workflow_runs = [] for latest inspected commit c9be3fa3eb3bd66d78a130723bd3f64702da1432 at inspection time.
- combined statuses = [] for latest inspected commit c9be3fa3eb3bd66d78a130723bd3f64702da1432 at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- 4A-U01 本單元可選知識點 should increase from 6 to 11.
- The five new Phase 2 KnowledgePoints should be selectable:
  - 非標準位值組合
  - 位值卡組合
  - 從哪一位開始比較
  - 缺位比較可填哪些數
  - 缺位比較最大最小

not_yet_claimed:
- Phase 2 npm test pass is not yet confirmed.
- Phase 2 browser/UI screenshot is not yet confirmed.
- Phase 2 PDF print smoke is not yet performed.

anti_scope_check:
- No Phase 3 patterns implemented.
- No G4A-U02/G4A-U04/G4A-U08 work performed.
- No runtime work outside G4A-U01 Phase 2 support except test visible-count synchronization.

GOAL_DISTANCE_BEFORE = D2_G4A_U01_PHASE2_PATTERN_SPEC_CONTRACT_COMPLETE
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE2_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = G4A-U01 Phase 2 moved from contract-only to implemented generator/validator/selector/test coverage state; execution validation remains pending.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S51B", "Need UI screenshot confirming G4A-U01 selector shows 11 KnowledgePoints", "Need Phase 2 PDF print smoke", "Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S51C_G4A_U01_Phase2NpmTestAndUIReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S51B_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main and run npm test; then refresh UI and confirm G4A-U01 KnowledgePoint selector count is 11.
NEXT_RESUME_TASK = S51C_G4A_U01_Phase2NpmTestAndUIReadback
