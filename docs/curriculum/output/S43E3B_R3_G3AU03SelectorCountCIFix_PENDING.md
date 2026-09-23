# S43E3B R3 G3A-U03 Selector Count CI Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
PUBLIC_MAIN_FAILURE = 366 tests / 357 pass / 9 fail
FAILURE_PATTERN = visibleCount actual 19 expected 18
FIX = update stale selector-count test expectations to 19 total and 7 for G3A-U03
NEXT_SHORTEST_STEP = pull public/main, run npm test, run git status
```

Files touched:

```text
tests/curriculum/batch-a/g3a-u02-continuous-borrow-zero.test.js
tests/curriculum/batch-a/g3a-u02-equation-blank.test.js
tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
tests/curriculum/batch-a/g3a-u02-sub-middle-missing-digit.test.js
tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
tests/site/selector-state.test.js
```

```text
GOAL_DISTANCE_BEFORE = D1_CI_FAIL_9_SELECTOR_COUNT_EXPECTATION_STALE
GOAL_DISTANCE_AFTER  = D1_SELECTOR_COUNT_FIX_IMPLEMENTED_READBACK_PENDING
REMAINING_BLOCKERS = ["R3 npm test readback", "CI rerun", "browser smoke"]
```
