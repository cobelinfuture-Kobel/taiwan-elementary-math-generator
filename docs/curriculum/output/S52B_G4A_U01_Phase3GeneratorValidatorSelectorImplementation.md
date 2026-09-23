S52B_G4A_U01_Phase3GeneratorValidatorSelectorImplementation

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = code_implementation_plus_static_readback_report

scope_lock:
- Implement only S52A Phase 3 six PatternSpecs.
- Do not start G4A-U02/G4A-U04/G4A-U08.
- Do not implement cross-unit fusion.
- Preserve S50/S51 Phase 1 and Phase 2 behavior.

source_basis:
- S50A identified Chinese-number / Arabic-number reading-writing connection, numeric notation vs Chinese-number notation comparison, wan-unit mixed notation subtraction, digit-count boundary number difference, comparison word problem total, and large-number unit word problem add/subtract.
- S50B defined these six items as Phase 3 extension scope.
- S51F formally closed Phase 2 and deferred Phase 3.

implemented_phase3_patterns:
- ps_g4a_u01_large_number_reading_writing_conversion
- ps_g4a_u01_numeric_vs_chinese_number_compare
- ps_g4a_u01_wan_mixed_notation_subtraction
- ps_g4a_u01_boundary_number_difference
- ps_g4a_u01_comparison_word_problem_total
- ps_g4a_u01_large_number_unit_word_problem_add_subtract

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
- Added six Phase 3 source-pattern definitions.
- Extended G4A-U01 printable PatternSpec set from 11 to 17.
- Added generator support for:
  - Chinese-number / Arabic-number reading-writing conversion.
  - Arabic number vs Chinese-number comparison.
  - 萬 unit mixed-notation subtraction.
  - largest/smallest digit-count boundary difference.
  - compare-more/less word problem then total.
  - large-number unit add/subtract word problem.
- Added validator support for:
  - Chinese-number parsing.
  - mixed 萬 notation parsing.
  - boundary-number arithmetic.
  - comparison word-problem relation and total.
  - unit word-problem numeric answer and answerText unit.
- Extended G4A-U01 selector projection from 11 to 17 visible KnowledgePoints.
- Updated Batch A global visible KnowledgePoint test count from 52 to 58.
- Added tests for Phase 3 source-unit generation, validation, selector projection, and semantic model fields.

new_selector_labels:
- 大數讀寫轉換
- 數字與中文數詞比大小
- 萬單位混合記法減法
- 最大最小位數邊界差
- 比較型應用題求總和
- 大數單位加減應用題

static_readback:
- g4a-u01 generator readback confirms G4A_U01_PHASE3_PATTERN_SPEC_IDS and G4A_U01_PRINTABLE_PATTERN_SPEC_IDS include Phase 3.
- generator readback confirms Phase 3 generation functions and route dispatch exist.
- validator update adds Phase 3 validation branches and validatorVersion = s52b-g4a-u01-phase3-v1.
- selector extension exposes 17 G4A-U01 rows.
- tests assert 17 G4A-U01 KPs and Phase 3 source-unit generation / validator coverage.

validation_status:
- GitHub connector writes completed.
- workflow_runs = [] for latest inspected commit 891b13f0e5b0948bb8383111df7eb9a25842b407 at inspection time.
- combined statuses = [] for latest inspected commit 891b13f0e5b0948bb8383111df7eb9a25842b407 at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.
- Phase 3 PDF smoke is not claimed until regenerated PDFs are inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- 4A-U01 本單元可選知識點 should increase from 11 to 17.
- The six new Phase 3 KnowledgePoints should be selectable.

expected_pdf_smoke_after_test_pass:
- Generate 6 single-KP PDFs with answer key:
  - g4a_u01_大數讀寫轉換.pdf
  - g4a_u01_數字與中文數詞比大小.pdf
  - g4a_u01_萬單位混合記法減法.pdf
  - g4a_u01_最大最小位數邊界差.pdf
  - g4a_u01_比較型應用題求總和.pdf
  - g4a_u01_大數單位加減應用題.pdf

anti_scope_check:
- No G4A-U02/G4A-U04/G4A-U08 implementation.
- No Phase 4/cross-unit fusion.
- No unrelated generator semantics changed.

GOAL_DISTANCE_BEFORE = D2_G4A_U01_PHASE3_PATTERN_SPEC_CONTRACT_COMPLETE
GOAL_DISTANCE_AFTER = D1_G4A_U01_PHASE3_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = G4A-U01 Phase 3 moved from contract-only to implemented generator/validator/selector/test coverage state; execution validation remains pending.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S52B", "Need UI screenshot/readback confirming G4A-U01 selector shows 17 KnowledgePoints", "Need Phase 3 PDF smoke", "optional renderer-wide blank-page cleanup backlog"]
NEXT_SHORTEST_STEP = S52C_G4A_U01_Phase3NpmTestAndUIReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S52B_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main and run npm test; then refresh UI and confirm G4A-U01 KnowledgePoint selector count is 17.
NEXT_RESUME_TASK = S52C_G4A_U01_Phase3NpmTestAndUIReadback
