S50F_R2_G4A_U01_KPSelectorVisibleCountFix

sourceId = g4a_u01_4a01
unit = 4A-U01 1億以內的數
status = FIX_APPLIED_AWAITING_TEST_READBACK
write_type = ci_failure_fix_readback

operator_readback_before_fix:
- npm test on public/main after S50F_R1 reported:
  - tests = 440
  - pass = 432
  - fail = 8
- All 8 failures had the same assertion shape:
  - actual visibleCount = 47
  - expected visibleCount = 41

root_cause:
- S50F_R1 intentionally added six visible G4A-U01 Phase 1 KnowledgePoints.
- Therefore global BATCH_A_SELECTOR_AVAILABILITY.visibleCount correctly changed from 41 to 47.
- Legacy selector tests still hard-coded 41 as the global visible count.
- The failures were test expectation drift, not generator, validator, resolver, or worksheet failures.

fixes_applied:
- Updated selector global visible-count expectations from 41 to 47 in existing tests that assert global selector availability.
- Added CURRENT_VISIBLE_KP_COUNT constant where appropriate.
- Updated selector-state.test.js to explicitly assert g4a_u01_4a01 visibleCount = 6.
- Verified by GitHub search that no remaining visibleCount 41 hard-coded references were found after the patch.

files_modified:
- tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
- tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
- tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
- tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
- tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js
- tests/site/selector-state.test.js

commits:
- 9a83edb9f58e38be56dcbe30af07f200f143864c test(selector): include g4a u01 selector availability

validation_status:
- GitHub connector static write succeeded.
- workflow_runs = [] for commit 9a83edb9f58e38be56dcbe30af07f200f143864c at inspection time.
- combined statuses = [] for commit 9a83edb9f58e38be56dcbe30af07f200f143864c at inspection time.
- npm test is not claimed as passed until operator or Actions readback confirms.

expected_next_local_command:
- git fetch public
- git switch public-main
- git reset --hard public/main
- git clean -fd
- npm test

expected_result_after_fix:
- The 8 visible-count failures should be removed.
- Expected test count should remain about 440 unless additional tests were added by a concurrent commit.

expected_ui_result_after_pull:
- 4A-U01 selector availability should show 本單元可選知識點：6.
- The six G4A-U01 Phase 1 KnowledgePoints should be selectable.

anti_scope_check:
- No runtime generator logic changed.
- No validator logic changed.
- No UI layout or renderer changed.
- No Phase 2/Phase 3 G4A-U01 features added.
- No G4A-U02/G4A-U04/G4A-U08 work.

GOAL_DISTANCE_BEFORE = D1_G4A_U01_KP_SELECTOR_PROJECTION_IMPLEMENTED_TEST_FAIL_VISIBLE_COUNT_DRIFT
GOAL_DISTANCE_AFTER = D1_G4A_U01_KP_SELECTOR_VISIBLE_COUNT_FIX_APPLIED_AWAITING_TEST_READBACK
DISTANCE_REDUCED = The 8 selector test failures were narrowed to stale global visible-count expectations and patched to the new expected 47 total / 6 G4A-U01 visible KnowledgePoints.
REMAINING_BLOCKERS = ["Need npm test readback on public/main after 9a83edb", "Need UI screenshot confirming G4A-U01 selector shows 6 KnowledgePoints", "G4A-U01 PDF print smoke not completed", "Phase 2/Phase 3 fine-grained source-image patterns deferred"]
NEXT_SHORTEST_STEP = S50F_R3_G4A_U01_KPSelectorNpmTestReadback
STOP_REASON = awaiting_required_test_readback
BLOCKER_TYPE = TEST_EXECUTION_READBACK_REQUIRED
LAST_COMPLETED_STATUS = S50F_R2_VISIBLE_COUNT_FIX_APPLIED
REQUIRED_OPERATOR_ACTION = Pull public/main at or after 9a83edb and run npm test; then refresh UI and confirm G4A-U01 KnowledgePoint selector count.
NEXT_RESUME_TASK = S50F_R3_G4A_U01_KPSelectorNpmTestReadback
