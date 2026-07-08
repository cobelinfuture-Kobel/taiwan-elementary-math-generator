S54C_S54F_G4A_U04_PrintableUIImplementation

sourceId = g4a_u04_4a04
unit = 4A-U04 整數的除法
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = selector_generator_validator_worksheet_implementation

preflight:
- S54A SourceImagePatternScan completed.
- S54B PatternSpecContract completed.
- S54C0 PrintableUITaskBreakdown completed.
- Operator approved implementation with: 開始推進.

scope_lock:
- Implement only the seven G4A-U04 source-image KnowledgePoints.
- Keep horizontal prompt output for first printable stage.
- Preserve long-division metadata for later scaffold upgrade if PDF QA requires it.
- Do not add extra G4A-U04 KPs.
- Do not move to G4A-U08.

implemented_visible_knowledge_points:
1. kp_g4a_u04_4digit_by_1digit_thousands_sufficient / ps_g4a_u04_4digit_by_1digit_thousands_sufficient
2. kp_g4a_u04_4digit_by_1digit_thousands_insufficient / ps_g4a_u04_4digit_by_1digit_thousands_insufficient
3. kp_g4a_u04_4digit_by_1digit_thousands_exact / ps_g4a_u04_4digit_by_1digit_thousands_exact
4. kp_g4a_u04_2digit_by_2digit_ten_multiple_divisor / ps_g4a_u04_2digit_by_2digit_ten_multiple_divisor
5. kp_g4a_u04_3digit_by_2digit_tens_sufficient / ps_g4a_u04_3digit_by_2digit_tens_sufficient
6. kp_g4a_u04_3digit_by_2digit_tens_insufficient / ps_g4a_u04_3digit_by_2digit_tens_insufficient
7. kp_g4a_u04_division_check_with_remainder / ps_g4a_u04_division_check_with_remainder

files_created:
- site/modules/curriculum/batch-a/source-pattern-g4a-u04-extension.js
- site/modules/curriculum/batch-a/g4a-u04-division-generator.js
- tests/curriculum/batch-a/g4a-u04-division.test.js

files_modified:
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-extension.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js

implementation_summary:
- Added G4A-U04 PatternSpec definitions.
- Added seven visible selector KnowledgePoints.
- G4A-U04 visible KnowledgePoints expected = 7.
- Batch A global visible KnowledgePoints expected = 75.
- Added G4A-U04 division generator and router branch.
- Generator creates quotient/remainder questions for six long-division source-image patterns.
- Generator creates verification-equation questions for 除法驗算：有餘數.
- Generator includes metadata: dividend, divisor, quotient, remainder, dividendDigits, divisorDigits, quotientDigits, firstDivisionUnit, quotientStartPlace, firstPlaceCase, coverageCase.
- Added duplicate guard for PatternSpec + blankedDisplayText.
- Extended validator to validate G4A-U04 quotient/remainder math and source start-place rules.

validator_rules_implemented:
- quotient = floor(dividend / divisor).
- remainder = dividend % divisor.
- 0 <= remainder < divisor.
- dividend = divisor × quotient + remainder.
- firstPlaceCase matches source-image case.
- quotientStartPlace matches quotient digits and source case.
- ten-multiple divisor pattern uses divisor multiple of 10.
- verification pattern requires remainder > 0 and divisor × quotient + remainder = dividend.

worksheet_readiness:
- G4A-U04 questions use text display models with blankedDisplayText and answerText.
- Long-division patterns answer as 商 q，餘 r.
- Verification pattern answers as divisor × quotient + remainder = dividend.
- buildWorksheetDocument coverage added for single KP and same-unit mixed output.
- Answer key inclusion is test-covered.

new_test_coverage:
- G4A-U04 exposes seven visible KnowledgePoints.
- Source-unit generation produces seven PatternSpecs.
- Generated questions satisfy quotient/remainder and source start-place cases.
- Verification questions use dividend = divisor × quotient + remainder.
- Validator rejects corrupted quotient and start-place metadata.
- Single-KP worksheets avoid excessive duplicate prompts.
- Same-unit mixed worksheet builds questions and answer key.
- Mixed duplicate rate stays bounded.
- shuffleAcrossPatterns changes render order.

not_claimed:
- npm test has not been run in this environment.
- UI selector readback has not been confirmed by operator.
- G4A-U04 single-KP PDFs have not been generated or inspected.
- G4A-U04 mixed PDF has not been generated or inspected.
- Long-division scaffold sufficiency remains a PDF QA decision point.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result:
- Previous passing count before S54C implementation: 465.
- New g4a-u04-division.test.js adds 9 tests.
- Expected tests after pull: 474.
- Expected pass: 474.
- Expected fail: 0.

expected_ui_result_after_pull:
- 4A-U04 本單元可選知識點：7
- The seven G4A-U04 KPs should be selectable.

expected_pdf_generation_after_test_pass:
- Single-KP PDFs:
  1. g4a_u04_4位數除以1位數_千位夠除.pdf
  2. g4a_u04_4位數除以1位數_千位不夠除.pdf
  3. g4a_u04_4位數除以1位數_千位整除.pdf
  4. g4a_u04_2位數除以2位數_除數是10的倍數.pdf
  5. g4a_u04_3位數除以2位數_十位夠除.pdf
  6. g4a_u04_3位數除以2位數_十位不夠除.pdf
  7. g4a_u04_除法驗算_有餘數.pdf
- Mixed PDF:
  - g4a_u04_同單位知識點混合_隨機排序.pdf

expected_pdf_smoke_checks:
- Question count = requested count.
- Answer key count = question count.
- Recomputed quotient/remainder answer errors = 0.
- Verification equation errors = 0.
- All seven pattern families appear in mixed PDF.
- Random/shuffle output interleaves pattern families.
- No answer-card split / orphan answer fragments.
- Horizontal prompt sufficiency should be evaluated; if insufficient, create S54I_R3 LongDivisionScaffoldFix.

GOAL_DISTANCE_BEFORE = D2_G4A_U04_PRINTABLE_UI_TASK_SEQUENCE_LOCKED
GOAL_DISTANCE_AFTER = D1_G4A_U04_PRINTABLE_UI_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = G4A-U04 moved from task sequence and PatternSpec contract to implemented selector, generator, validator, worksheet-ready output, and test coverage.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S54C-S54F", "Need UI selector readback showing 7 G4A-U04 KPs", "Need seven single-KP PDF smokes", "Need same-unit mixed PDF smoke", "Need decide during PDF QA whether horizontal prompts are sufficient or long-division scaffold is required"]
NEXT_SHORTEST_STEP = S54G_G4A_U04_NpmAndUISelectorReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S54C_S54F_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, confirm UI selector shows 7 G4A-U04 KnowledgePoints, then generate PDFs after pass.
NEXT_RESUME_TASK = S54G_G4A_U04_NpmAndUISelectorReadback
