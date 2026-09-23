# S43E3B G3A-U03 Word Problem KP Selector Integration — CI Failure Pending Test Names

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3B_R2_G3AU03WordProblemQueryStateCIFix
TASK_STATUS = CI_FAILED_NEEDS_FAILING_TEST_NAMES
WRITE_TYPE = code_and_test
```

## CI Failure Readbacks

Operator-provided GitHub Actions readback #1:

```text
CI_READBACK_NPM_TEST_EXIT_CODE = 1
Detected tests = 366
Detected pass  = 356
Detected fail  = 10
```

Operator-provided GitHub Actions readback #2 after the R2 query-state guard fix:

```text
CI_READBACK_NPM_TEST_EXIT_CODE = 1
Detected tests = 366
Detected pass  = 357
Detected fail  = 9
```

The R2 fix reduced the failure count by 1 but did not clear CI.

## Problem Observed By Browser Smoke

The operator selected G3A-U03 and expected the newly added `兩步驟連續乘法應用題` selector path, but the public page still showed the older `兩步驟連續乘法` numeric-expression KnowledgePoint and generated formula questions.

Observed UI indicators:

```text
本單元可選知識點：6
selector_id_dropped
selector_mode_fallback
```

## Current Diagnosis

The failing CI excerpt provided so far is the summary-parsing step only. It includes the final test counts but not the names or assertion details of the failing tests.

```text
Detected tests=366 pass=357 fail=9
```

The next fix should not guess across unrelated selector behavior. The needed evidence is the actual `not ok ...` / assertion failure block from the `npm test` step.

## R2 Fix Already Implemented

```text
site/assets/browser/state/query-state.js
```

keeps the existing base selector candidate guard and adds a narrow query-state bridge only for the current task:

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

CI_FAILURE_READBACK_1 = 366 tests / 356 pass / 10 fail
CI_FAILURE_READBACK_2 = 366 tests / 357 pass / 9 fail
LATEST_R2_QUERY_STATE_GUARD_FIX = IMPLEMENTED_BUT_INSUFFICIENT
LATEST_LOCAL_NPM_TEST = PENDING_OPERATOR_READBACK
LATEST_CI_READBACK = FAIL_9
FAILING_TEST_NAMES = REQUIRED
```

## Required Evidence For Next Fix

```text
REQUIRED_OPERATOR_ACTION = paste the npm test failure blocks before the summary parser step, especially lines beginning with:
- not ok
- failureType
- error:
- expected
- actual
- stack
```

## Expected Browser Result After Final Fix / Deploy / Cache Refresh

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
NEXT_SHORTEST_STEP = inspect the 9 failing test names/assertion blocks, then apply a targeted FullFix without broadening selector scope
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_WORD_PROBLEM_QUERY_STATE_GUARD_FIX_IMPLEMENTED_READBACK_PENDING
GOAL_DISTANCE_AFTER  = D1_CI_FAIL_9_NEEDS_FAILURE_DETAILS
DISTANCE_REDUCED     = CI failure count reduced from 10 to 9, but blocker remains unresolved because failing test names are not present in the pasted excerpt

REMAINING_BLOCKERS = [
  "CI still fails: 366 tests / 357 pass / 9 fail",
  "failing test names/assertion blocks 尚未取得",
  "public GitHub Pages deploy/cache refresh 後的 browser smoke 尚未確認"
]
```
