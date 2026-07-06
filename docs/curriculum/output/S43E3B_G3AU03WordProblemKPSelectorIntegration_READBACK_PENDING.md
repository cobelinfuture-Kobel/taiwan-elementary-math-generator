# S43E3B G3A-U03 Word Problem KP Selector Integration — Query-State Fix Pending Readback

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3B_R1_G3AU03WordProblemQueryStateSmokeFix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
WRITE_TYPE = code_and_test
```

## Problem Observed By Browser Smoke

The operator selected G3A-U03 and expected the newly added `兩步驟連續乘法應用題` selector path, but the public page still showed the older `兩步驟連續乘法` numeric-expression KnowledgePoint and generated formula questions.

Observed UI indicators:

```text
本單元可選知識點：6
selector_id_dropped
selector_mode_fallback
```

## Root Cause

```text
site/assets/browser/state/query-state.js
```

was still importing selector validation from:

```text
../../../modules/curriculum/registry/batch-a-selector-candidates.js
```

instead of the extended selector registry:

```text
../../../modules/curriculum/registry/batch-a-selector-extension.js
```

Therefore extended KnowledgePoint IDs could be dropped from URL/query restoration and fall back to source-unit mode.

## Fix Implemented

```text
site/assets/browser/state/query-state.js
```

now uses `batch-a-selector-extension.js`, so extended G3A-U03 KnowledgePoints are valid during query parsing.

## Added QA Coverage

```text
tests/curriculum/g3a-u03-word-problem-query-state.test.js
```

The new test verifies that this URL state survives parsing without `selector_id_dropped` or `selector_mode_fallback`:

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

LATEST_QUERY_STATE_FIX = IMPLEMENTED
LATEST_LOCAL_NPM_TEST = PENDING_OPERATOR_READBACK
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
NEXT_SHORTEST_STEP = run npm test and git status after pulling latest query-state fix; then run browser smoke on the public page after deployment/cache refresh
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_WORD_PROBLEM_SELECTOR_PASS_LOCAL_SYNCED_BUT_BROWSER_QUERY_FALLBACK
GOAL_DISTANCE_AFTER  = D1_G3A_U03_WORD_PROBLEM_QUERY_STATE_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = browser-smoke root cause identified and fixed in query-state selector registry source

REMAINING_BLOCKERS = [
  "latest query-state fix npm test readback 尚未取得",
  "public GitHub Pages deploy/cache refresh 後的 browser smoke 尚未確認"
]
```
