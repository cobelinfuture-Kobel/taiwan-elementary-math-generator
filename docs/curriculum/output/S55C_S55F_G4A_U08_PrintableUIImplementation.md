S55C_S55F_G4A_U08_PrintableUIImplementation

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = IMPLEMENTED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = selector_generator_validator_worksheet_implementation

preflight:
- S55A TaskSequencePlan completed.
- S55B FormalKPAndPatternSpecContract completed.
- Operator approved implementation with: 核准. 開始實作.

scope_lock:
- Implement only horizontal expression calculation for G4A-U08.
- Implement the four visible KP structure confirmed in planning.
- Keep multiplication/division small.
- Keep large add/sub as about 20% overlay.
- Do not implement algebraic transposition/移項.
- Do not introduce decimals, fractions, or negative answers.
- Do not implement worked-step answer key unless later requested.

implemented_visible_knowledge_points:
1. kp_g4a_u08_parentheses_first
   - displayName = 括號優先計算
   - PatternSpecs:
     - ps_g4a_u08_parentheses_add_sub
     - ps_g4a_u08_parentheses_mul_div

2. kp_g4a_u08_mul_div_before_add_sub
   - displayName = 乘除先於加減
   - PatternSpecs:
     - ps_g4a_u08_mul_before_add_sub
     - ps_g4a_u08_div_before_add_sub

3. kp_g4a_u08_left_to_right_same_level
   - displayName = 同級運算由左至右
   - PatternSpecs:
     - ps_g4a_u08_add_sub_left_to_right
     - ps_g4a_u08_mul_div_left_to_right

4. kp_g4a_u08_comprehensive_order_of_operations
   - displayName = 四則與括號綜合計算
   - PatternSpecs:
     - ps_g4a_u08_mixed_mul_div_add_sub_no_parentheses
     - ps_g4a_u08_mixed_with_parentheses
     - ps_g4a_u08_large_add_sub_overlay_no_parentheses
     - ps_g4a_u08_large_add_sub_overlay_with_parentheses

files_created:
- docs/curriculum/output/S55B_G4A_U08_FormalKPAndPatternSpecContract.md
- site/modules/curriculum/batch-a/source-pattern-g4a-u08-extension.js
- site/modules/curriculum/batch-a/g4a-u08-expression-generator.js
- site/modules/curriculum/batch-a/batch-a-browser-validator-g4a-u08-extension.js
- tests/curriculum/batch-a/g4a-u08-order-of-operations.test.js

files_modified:
- site/modules/curriculum/batch-a/batch-a-browser-question-router.js
- site/modules/curriculum/registry/batch-a-selector-g4a-extension.js
- site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
- tests/site/selector-state.test.js
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js

implementation_summary:
- Added G4A-U08 PatternSpec definitions.
- Added four visible selector KnowledgePoints.
- G4A-U08 visible KnowledgePoints expected = 4.
- Batch A global visible KnowledgePoints expected = 79.
- Added G4A-U08 expression generator and router branch.
- Generator outputs expression, expressionTokens, blankedDisplayText, finalAnswer, answerText, operationOrderTrace, intermediateResults, coverageCase, ruleTags, and largeAddSubOverlay flag.
- Student prompt shape is horizontal only: expression = ______.
- Answer key shape is final numeric answer only.
- Added G4A-U08 validator extension and made worksheet pipeline use it.

number_control_implemented:
- exact division only.
- finalAnswer between 0 and 9999.
- intermediate results between 0 and 9999.
- multiplication operation result capped at 500.
- division quotient capped at 100.
- large add/sub overlay uses two PatternSpecs out of ten source-unit PatternSpecs, giving 20% overlay in source-unit grouped allocation.

validator_rules_implemented:
- expressionTokens evaluated with parentheses and arithmetic precedence.
- Same-level operators are left-associative in evaluation.
- Division must be exact.
- finalAnswer and answerText must match recomputed answer.
- operationOrderTrace must match recomputed operations.
- no KP/source labels may leak into blankedDisplayText.
- largeAddSubOverlay flag must match overlay PatternSpecs.
- hasParentheses and hasMulDiv flags must match expressionTokens.

new_test_coverage:
- G4A-U08 exposes four visible KnowledgePoints.
- Source-unit generation produces ten PatternSpecs.
- Expressions recompute by standard precedence.
- Prompt format is horizontal and label-free.
- Same-level left-to-right examples differ from common wrong grouping.
- Validator rejects corrupted answer and trace.
- Number-control constraints hold.
- Large add/sub overlay rate is exactly 20% in 100-question source-unit mode.
- Same-unit mixed worksheet builds answer key.
- Mixed duplicate rate stays bounded.
- shuffleAcrossPatterns changes render order.

not_claimed:
- npm test has not been run in this environment.
- UI selector readback has not been confirmed by operator.
- G4A-U08 single-KP PDFs have not been generated or inspected.
- G4A-U08 mixed PDF has not been generated or inspected.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result:
- Previous passing count before S55 implementation: 476.
- New g4a-u08-order-of-operations.test.js adds 11 tests.
- Expected tests after pull: 487.
- Expected pass: 487.
- Expected fail: 0.

expected_ui_result_after_pull:
- 4A-U08 本單元可選知識點：4
- The four G4A-U08 KPs should be selectable:
  - 括號優先計算
  - 乘除先於加減
  - 同級運算由左至右
  - 四則與括號綜合計算

expected_pdf_generation_after_test_pass:
- Single-KP PDFs:
  1. g4a_u08_括號優先計算.pdf
  2. g4a_u08_乘除先於加減.pdf
  3. g4a_u08_同級運算由左至右.pdf
  4. g4a_u08_四則與括號綜合計算.pdf
- Mixed PDF:
  - g4a_u08_同單位知識點混合_隨機排序.pdf

expected_pdf_smoke_checks:
- question count = requested count.
- answer key count = question count.
- student prompts contain only horizontal expressions and blank answer line.
- recomputed final-answer errors = 0.
- all four visible KP families appear in mixed PDF.
- large add/sub overlay rate is near 20%, acceptable 10%-30% in standard mixed PDF.
- multiplication/division operation results remain small.
- no card split / orphan answer fragments.

GOAL_DISTANCE_BEFORE = D2_G4A_U08_PATTERN_SPEC_CONTRACT_COMPLETED
GOAL_DISTANCE_AFTER = D1_G4A_U08_PRINTABLE_UI_IMPLEMENTED_STATIC_READBACK_PASS_TEST_PENDING
DISTANCE_REDUCED = G4A-U08 moved from PatternSpec contract to implemented selector, generator, validator, worksheet-ready output, and regression tests.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S55C-S55F", "Need UI selector readback showing 4 G4A-U08 KPs", "Need single-KP PDF smokes", "Need same-unit mixed PDF smoke and overlay ratio check"]
NEXT_SHORTEST_STEP = S55G_G4A_U08_NpmAndUISelectorReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S55C_S55F_IMPLEMENTED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, run npm test, confirm UI selector shows 4 G4A-U08 KnowledgePoints, then generate PDFs after pass.
NEXT_RESUME_TASK = S55G_G4A_U08_NpmAndUISelectorReadback
