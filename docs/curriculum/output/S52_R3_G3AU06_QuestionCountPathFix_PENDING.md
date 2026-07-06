S52 R3 G3A-U06 Question Count Path Fix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06

Failure readback:
- npm test reported tests 365, pass 364, fail 1.
- Failing test: tests/site/site-operator-controls.test.js legacy question count helper keeps allocation in sync.
- Cause: test referenced state.draftConfig.allocation.totalQuestionCount, but current config-state stores allocation at state.draftConfig.patternPlan.allocation.totalQuestionCount.

Fix:
- Updated the assertion to state.draftConfig.patternPlan.allocation.totalQuestionCount.

GOAL_DISTANCE_BEFORE = D1_G3A_U06_S52_TEST_READBACK_FIX_IMPLEMENTED_PENDING_READBACK
GOAL_DISTANCE_AFTER = D1_G3A_U06_S52_QUESTION_COUNT_PATH_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED = resolved final test-contract path mismatch for question count allocation sync
REMAINING_BLOCKERS = npm test readback pending; browser PDF smoke pending; Pages deploy may need rerun
NEXT_SHORTEST_STEP = git pull public main; npm test; git status
