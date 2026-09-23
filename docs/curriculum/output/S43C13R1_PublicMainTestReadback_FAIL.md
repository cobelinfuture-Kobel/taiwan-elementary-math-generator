# S43C13R1 Public Main Test Readback FAIL

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = OPERATOR_PUBLIC_MAIN_CLEAN_WORKTREE_TEST_FOR_S43C13R1
TASK_STATUS = PUBLIC_MAIN_TEST_FAIL
WRITE_TYPE = docs_only_operator_evidence_failure
```

This record captures the operator-provided test output from a public-main worktree after the earlier remote-divergence blocker was identified.

## Operator Context

The operator tested from:

```text
G:\HomeWork\Math_Learning_DB\homework\math-worksheet-generator-public
```

The operator ran:

```text
npm test
```

## Test Summary

```text
TEST_SCOPE_OBSERVED = public-main worktree
LOCAL_TEST_COMMAND = npm test
LOCAL_TESTS_TOTAL = 302
LOCAL_TESTS_PASS = 295
LOCAL_TESTS_FAIL = 7
LOCAL_TESTS_CANCELLED = 0
LOCAL_TESTS_SKIPPED = 0
LOCAL_TESTS_TODO = 0
DURATION_MS = 514.9038
S43C13R1_STATUS = PUBLIC_MAIN_TEST_FAIL
```

## Failing Tests Observed

```text
1. tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
   add multi-carry candidate registry triplet remains hidden until promotion QA passes
   actual = selectable
   expected = hidden

2. tests/curriculum/batch-a/g3a-u02-add-multi-carry-promotion-qa.test.js
   browser selector projection remains zero-visible after carry policy implementation
   actual = 1
   expected = 0

3. tests/curriculum/batch-a/html-single-visible-kp-worksheet.test.js
   S43C13 single visible KP generation produces only add-multi-carry questions
   actual = [undefined]
   expected = [ps_g3a_u02_4digit_add_multi_carry]

4. tests/site/html-zero-visible-selector.test.js
   main.js binds visible KP selector state without enabling mixed modes
   missing expected /MIXED_KNOWLEDGE_POINTS_SAME_UNIT/ regex in main.js

5. tests/site/selector-state.test.js
   Batch A selector state defaults to source-unit mode
   actual visibleCount-related assertion = 1
   expected = 0

6. tests/site/selector-state.test.js
   hidden A-class KnowledgePoint IDs cannot survive selector normalization
   selector normalization expectations are stale after add-multi-carry promotion

7. tests/site/readiness.test.js
   readiness - site directory file count is within expected range
   expected range is stale after S43C13 site/runtime additions
```

## Failure Classification

```text
STALE_TEST_EXPECTATION_FAILURES = [
  "promotion QA still expects add-multi-carry registry triplet to remain hidden",
  "promotion QA still expects browser selector visibleCount = 0",
  "selector-state tests still assume zero visible KP as default",
  "readiness file-count guard likely needs controlled S43C13 range update"
]

RUNTIME_OR_ASSERTION_FAILURES = [
  "html-single-visible-kp generation test reads question.patternSpecId, but generated expression questions appear to carry PatternSpec through metadata rather than top-level patternSpecId",
  "main.js mixed-mode assertion expects explicit MIXED_* enum names in runtime file after implementation used option-level disabling instead"
]
```

## QA Interpretation

```text
- public-main npm test was executed and failed.
- S43C13R1 cannot be upgraded to PASS_LOCAL_SYNCED_AND_TESTED.
- S43C14 single visible KP smoke QA must not proceed.
- The next valid step is a focused S43C13R2 FullFix that updates stale tests or runtime metadata without expanding scope beyond S43C13 single visible KP enablement.
```

## Scope Boundary

```text
Do not proceed to S43C14.
Do not implement same-unit multi-KP selection.
Do not implement cross-unit multi-KP selection.
Do not expand S43E 13-unit KP registry.
Do not merge/rebase dev/private branch into public/main as part of this fix.
```

## Required Fix Direction

```text
S43C13R2 should address exactly the observed failure set:

1. Retire or rewrite stale pre-promotion tests that still assert hidden/zero-visible state after S43C11/S43C12.
2. Fix single-KP generation assertion or runtime metadata so generated questions expose the expected PatternSpec consistently.
3. Update selector-state tests to the current production one-visible state while preserving hidden/D row rejection.
4. Update the main.js mixed-mode test to assert actual disabled-mode behavior rather than requiring literal enum names if the HTML already disables mixed modes.
5. Update readiness file-count guard only if the additional files are intentional S43C13 artifacts.
```

## S43C13R1 Failed Gate

```text
S43C13R1_LOCAL_GATE = PUBLIC_MAIN_TEST_FAIL

PASS:
- public-main worktree test attempt received
- npm test executed
- failure set identified

FAIL:
- tests total = 302
- tests pass = 295
- tests fail = 7
- PASS_LOCAL_SYNCED_AND_TESTED not achieved
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_TEST_READBACK_BLOCKED_REMOTE_DIVERGENCE
GOAL_DISTANCE_AFTER  = D1_HTML_SINGLE_VISIBLE_KP_ENABLEMENT_PUBLIC_MAIN_TEST_FAIL
DISTANCE_REDUCED     = remote divergence blocker is replaced by concrete public-main test failure evidence; S43C13 remains blocked by 7 failing tests

HTMLSingleVisibleKPEnablement         100% -> 100%
SingleVisibleKPSmokeQA                  0% ->   0%
KPHTMLSelectablePath                   96% ->  96%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C13 public/main npm test PASS 尚未 observed",
  "S43C13R1 PASS_LOCAL_SYNCED_AND_TESTED 尚未 achieved",
  "public-main npm test currently fails 7 tests",
  "S43C14 single visible KP smoke QA 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C13R2_PublicMainTestFailureFullFix
```
