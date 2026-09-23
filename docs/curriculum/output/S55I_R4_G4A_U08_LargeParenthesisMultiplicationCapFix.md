S55I_R4_G4A_U08_LargeParenthesisMultiplicationCapFix

sourceId = g4a_u08_4a08
unit = 4A-U08 整數四則
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = npm_failure_fix_report

operator_npm_readback_before_fix:
- tests = 489
- pass = 488
- fail = 1
- failing_test = G4A-U08 expressions recompute by standard precedence
- failure_site = tests/curriculum/batch-a/g4a-u08-order-of-operations.test.js line 140
- failure_reason = validateBatchABrowserQuestion(question).ok returned false for at least one generated question.

root_cause:
- S55I_R3 added a large_with_parentheses leading-group multiplication shape:
  - (a + b) × c + largeA - largeB
- The generator used:
  - a in 10..60
  - b in 10..60
  - c in 2..6
- This allowed the intermediate multiplication (a + b) × c to exceed the validator's multiplication cap of 500.
- The independent arithmetic recomputation matched finalAnswer, but the validator correctly rejected the item because it violated the number-control contract.

fix_applied:
- Modified site/modules/curriculum/batch-a/g4a-u08-expression-generator.js.
- In the large_with_parentheses leading-group multiplication variant, tightened ranges to:
  - a in 10..50
  - b in 10..50
  - c in 2..5
- This caps (a + b) × c at 500 while preserving the varied leading-parentheses expression shape.

expected_effect:
- The failing generated item should now pass validateBatchABrowserQuestion.
- S55I_R3 shape diversity remains intact.
- S55I_R3 overlay-aware allocation remains intact.
- Expected test count does not change.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_test_result_after_fix:
- tests = 489
- pass = 489
- fail = 0

not_claimed:
- npm test has not been run after this fix.
- PDFs have not been regenerated after this fix.
- PDF smoke after this fix has not been performed.
- Formal closeout is not claimed.

GOAL_DISTANCE_BEFORE = D1_G4A_U08_VARIATION_AND_RATIO_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U08_MULTIPLICATION_CAP_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = Fixed the generated expression that violated the multiplication-size validator while preserving expression-shape variation and overlay-ratio fixes.
REMAINING_BLOCKERS = ["Need npm test readback after S55I_R4", "Need regenerated G4A-U08 PDFs after npm pass", "Need PDF smoke to confirm expression variety and overlay ratio", "Need final closeout marker after PDF smoke pass"]
NEXT_SHORTEST_STEP = S55I_R5_G4A_U08_NpmRetestAndRegeneratedPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S55I_R4_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, rerun npm test, then regenerate the five G4A-U08 PDFs if tests pass.
NEXT_RESUME_TASK = S55I_R5_G4A_U08_NpmRetestAndRegeneratedPDFSmoke
