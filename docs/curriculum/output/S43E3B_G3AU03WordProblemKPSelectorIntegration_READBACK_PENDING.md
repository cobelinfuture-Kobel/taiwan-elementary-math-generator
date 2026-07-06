# S43E3B G3A-U03 Word Problem KP Selector Integration — CI Fix Pending Readback

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3B_R2_G3AU03WordProblemQueryStateCIFix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
WRITE_TYPE = code_and_test
```

## CI Failure Readback

Operator-provided GitHub Actions readback:

```text
CI_READBACK_NPM_TEST_EXIT_CODE = 1
Detected tests = 366
Detected pass  = 356
Detected fail  = 10
```

## Problem Observed By Browser Smoke

The operator selected G3A-U03 and expected the newly added `兩步驟連續乘法應用題` selector path, but the public page still showed the older `兩步驟連續乘法` numeric-expression KnowledgePoint and generated formula questions.

Observed UI indicators:

```text
本單元可選知識點：6
selector_id_dropped
selector_mode_fallback
```

## Root Cause Refinement

The first query-state fix broadened `site/assets/browser/state/query-state.js` to use the full selector extension registry. That fixed the intended G3A-U03 word-problem query path, but it also changed query guard behavior for other extended rows and caused CI failures in existing query-state safety expectations.

## R2 Fix Implemented

```text
site/assets/browser/state/query-state.js
```

now keeps the existing base selector candidate guard and adds a narrow query-state bridge only for the current task:

```text
kp = kp_g3a_u03_consecutive_multiplication_two_step_word_problem
pg = pg_g3a_u03_consecutive_multiplication_two_step_word_problem
```

This avoids widening unrelated selector-query eligibility while preserving the G3A-U03 word-problem browser smoke path.

## Added QA Coverage

```text
tests/curriculum/g3a-u03-word-problem-query-state.test.js
```

The test verifies that this URL state survives parsing without `selector_id_dropped` or `selector_mode_fallback`:

```text
sourceId = g3a_u03_3a03
selectionMode = singleKnowledgePoint
kp = kp_g3a_u03_consecutive_multiplication_two_step_word_problem
pg = pg_g3a_u03_consecutive_multiplication_two_step_word_problem
```

## Prior Completed Implementation Still Applies

```text
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
tests/curriculum/g3a-u03-word-problem-kp-selector.test.js
```

The G3A-U03 selector availability is expected to show 7 visible KnowledgePoints instead of 6 after the latest deployed JavaScript is loaded.

## Readback Status

```text
PREVIOUS_LOCAL_TESTS_TOTAL = 835
PREVIOUS_LOCAL_TESTS_PASS = 835
PREVIOUS_LOCAL_TESTS_FAIL = 0
PREVIOUS_LOCAL_WORKTREE_STATUS = clean

CI_FAILURE_READBACK = 366 tests / 356 pass / 10 fail
LATEST_R2_QUERY_STATE_GUARD_FIX = IMPLEMENTED
LATEST_LOCAL_NPM_TEST = PENDING_OPERATOR_READBACK
LATEST_CI_READBACK = PENDING
```

## Expected Browser Result After Pull / Deploy / Cache Refresh

The correct selector item is:

```text
兩步驟連續乘法應用題｜3A-U03｜qa_verified
```

The correct URL should include:

```text
selectionMode=singleKnowledgePoint
kp=kp_g3a_u03_consecutive_multiplication_two_step_word_problem
pg=pg_g3a_u03_consecutive_multiplication_two_step_word_problem
```

It should not show:

```text
selector_id_dropped
selector_mode_fallback
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = run npm test and git status after pulling latest R2 query-state guard fix; then confirm CI / browser smoke
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_WORD_PROBLEM_QUERY_STATE_FIX_IMPLEMENTED_BUT_CI_FAILED
GOAL_DISTANCE_AFTER  = D1_G3A_U03_WORD_PROBLEM_QUERY_STATE_GUARD_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = CI failure source narrowed; query-state guard changed from broad extension acceptance to task-scoped word-problem bridge

REMAINING_BLOCKERS = [
  "latest R2 query-state guard fix npm test readback 尚未取得",
  "CI rerun 尚未 PASS",
  "public GitHub Pages deploy/cache refresh 後的 browser smoke 尚未確認"
]
```
