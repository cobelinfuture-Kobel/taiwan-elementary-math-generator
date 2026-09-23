S53D_G4A_U02_NumericGeneratorValidatorImplementation

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = numeric_generator_validator_selector_implementation

scope_lock:
- Implement S53D numeric core only.
- Implement first 7 visible numeric vertical multiplication KnowledgePoints.
- Do not implement the 2 reasoning/text KPs yet.
- Do not begin G4A-U04 or cross-unit fusion.

implemented_visible_knowledge_points:
1. kp_g4a_u02_3digit_by_1digit_review / ps_g4a_u02_3digit_by_1digit_review
2. kp_g4a_u02_4digit_by_1digit_missing_digit / ps_g4a_u02_4digit_by_1digit_missing_digit
3. kp_g4a_u02_1digit_by_2digit / ps_g4a_u02_1digit_by_2digit
4. kp_g4a_u02_1digit_by_3digit / ps_g4a_u02_1digit_by_3digit
5. kp_g4a_u02_2digit_by_2digit / ps_g4a_u02_2digit_by_2digit
6. kp_g4a_u02_2digit_by_3digit / ps_g4a_u02_2digit_by_3digit
7. kp_g4a_u02_3digit_by_2digit / ps_g4a_u02_3digit_by_2digit

not_implemented_in_this_task:
- kp_g4a_u02_digit_card_arrangement_product_max_min
- kp_g4a_u02_near_hundred_multiplication_strategy

files_created:
- site/modules/curriculum/batch-a/source-pattern-g4a-u02-extension.js
- site/modules/curriculum/batch-a/g4a-u02-numeric-generator.js
- tests/curriculum/batch-a/g4a-u02-numeric.test.js

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
- Added G4A-U02 numeric PatternSpec definitions.
- Added G4A-U02 numeric generator route.
- Added deterministic source-unit generation for the first 7 numeric KPs.
- Added single-KP and same-unit mixed selector support.
- Added missing-digit multiplication with zero-answer coverage.
- Added partial product metadata for two-digit multiplier patterns.
- Added internal coverage cases for zero/carry/trailing-zero/multiplier-multiple-of-10/partial-product-zero.
- Added extended validator support for G4A-U02 numeric questions.
- Updated selector visible counts from 59 to 66.

coverage_implemented:
- normal_no_carry
- carry
- zero_in_operand
- zero_in_product
- trailing_zero_product
- multiplier_multiple_of_10
- partial_product_zero
- missing_digit_zero_answer
- missing_digit_nonzero_answer
- partialProductsRequired validation for two-digit multiplier patterns

test_coverage_added:
- G4A-U02 exposes seven numeric KnowledgePoints.
- Source-unit generation produces the seven numeric PatternSpecs.
- Generated numeric questions pass the extended validator.
- Zero and partial-product coverage appears in generated output.
- Missing-digit multiplication includes zero-answer coverage.
- Same-unit numeric mix builds worksheet and answer key.
- shuffleAcrossPatterns changes numeric render order.

static_readback:
- Router now routes sourceId g4a_u02_4a02 to g4a-u02-numeric-generator.js.
- Selector registry exposes 7 visible G4A-U02 numeric KPs.
- Validator wrapper version is s53d-g4a-u02-numeric-v1.
- Reasoning/text KPs remain intentionally absent from visible selector until S53F.

validation_status:
- GitHub connector writes completed.
- npm test is not claimed until operator or Actions readback confirms.
- Numeric PDF smoke is not claimed until regenerated PDFs are inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_ui_result_after_pull:
- 4A-U02 本單元可選知識點 should show 7.
- The seven numeric KPs should be selectable.
- The two reasoning/text KPs should not appear yet.

expected_numeric_pdf_smoke_after_test_pass:
- Generate 7 single-KP PDFs with answer key:
  - g4a_u02_三位數乘一位數複習.pdf
  - g4a_u02_四位數乘一位數缺位.pdf
  - g4a_u02_一位數乘二位數.pdf
  - g4a_u02_一位數乘三位數.pdf
  - g4a_u02_二位數乘二位數.pdf
  - g4a_u02_二位數乘三位數.pdf
  - g4a_u02_三位數乘二位數.pdf
- Generate one G4A-U02 numeric same-unit mixed PDF.

GOAL_DISTANCE_BEFORE = D2_G4A_U02_PATTERN_SPEC_CONTRACT_COMPLETED
GOAL_DISTANCE_AFTER = D1_G4A_U02_NUMERIC_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = G4A-U02 numeric core moved from PatternSpec contract into implemented PatternSpec definitions, selector projection, generator, validator, and tests.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53D", "Need numeric single-KP PDFs and mixed PDF smoke", "Reasoning/text KPs deferred to S53F", "PDF source images are conversation-provided evidence rather than permanent source PDFs"]
NEXT_SHORTEST_STEP = S53E_G4A_U02_NumericNpmAndPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53D_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, and generate the requested numeric PDFs.
NEXT_RESUME_TASK = S53E_G4A_U02_NumericNpmAndPDFSmoke
