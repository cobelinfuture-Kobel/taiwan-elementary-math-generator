S53E_R2_G4A_U02_NumericNpmFailureFix

sourceId = g4a_u02_4a02
unit = 4A-U02 整數的乘法
status = FIX_APPLIED_STATIC_READBACK_PASS_TEST_READBACK_REQUIRED
write_type = npm_failure_fix_report

operator_test_readback:
- tests = 462
- pass = 461
- fail = 1
- failed_file = tests/curriculum/batch-a/g4a-u02-numeric.test.js
- failed_test = G4A-U02 same-unit numeric mix builds worksheet and answer key
- failure = answerKeyItems.length actual 0, expected 49

root_cause:
- The failing test used buildWorksheetDocumentFromState(stateFor(KP_IDS, 49)).
- The browser state default preset can have showAnswerKeyPage disabled.
- The test expected answer key items without explicitly enabling includeAnswerKey in the constructed test state.
- This was a test setup defect, not a multiplication generator defect.

fix_applied:
- Updated tests/curriculum/batch-a/g4a-u02-numeric.test.js.
- Imported setBatchAIncludeAnswerKey.
- Updated stateFor(kpIds, count, includeAnswerKey = true) to explicitly set answer key inclusion.
- The same-unit worksheet test now calls stateFor(KP_IDS, 49, true), making the answer-key expectation explicit.

scope_integrity:
- No production generator logic changed in this fix.
- No PatternSpec or selector count changed.
- S53E_R1 production fix remains active:
  - horizontal output retained
  - operand display order fixed
  - duplicate guard active
  - zero/carry/missing-zero/partial-product coverage preserved

latest_commits:
- 0a575e0d682de7adf32ae97decee22b51ebbddd2 fix(g4a-u02): stabilize per-pattern coverage sequencing
- 611fd5c4053d11c805bce7ff96d80c734629321a test(g4a-u02): enable answer key in worksheet state

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_result:
- The known answerKeyItems 0 != 49 failure should be cleared.
- Test count should remain 462 unless new commits add tests.

GOAL_DISTANCE_BEFORE = D1_G4A_U02_NUMERIC_DUPLICATE_AND_OPERAND_FIX_APPLIED_TEST_PENDING
GOAL_DISTANCE_AFTER = D1_G4A_U02_NUMERIC_NPM_FAILURE_FIX_APPLIED_TEST_PENDING
DISTANCE_REDUCED = The S53E_R1 npm blocker was isolated to an answer-key test setup issue and fixed; production numeric fixes remain unchanged and await retest.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after S53E_R2", "Need regenerated numeric PDFs and smoke review", "Reasoning/text KPs deferred to S53F"]
NEXT_SHORTEST_STEP = S53E_R3_G4A_U02_NumericNpmRetestAndPDFSmoke
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S53E_R2_FIX_APPLIED_STATIC_READBACK_PASS
REQUIRED_OPERATOR_ACTION = Pull public/main, rerun npm test, then regenerate the 8 G4A-U02 numeric PDFs after pass.
NEXT_RESUME_TASK = S53E_R3_G4A_U02_NumericNpmRetestAndPDFSmoke
