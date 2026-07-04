# S43F9R — LocalTestReadback FAIL

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F9R_LocalTestReadback_FAIL
TASK_STATUS = FAIL_LOCAL_TEST_READBACK
```

## Local Readback

```text
WORKTREE = G:\HomeWork\Math_Learning_DB\homework\math-worksheet-generator-public
REMOTE_USED = public/main
HEAD = a69565a
MERGE_STATUS = clean
```

## Test Result

```text
NPM_TEST = FAIL
TESTS = 312
PASS = 311
FAIL = 1
```

## Failing Test

```text
tests/curriculum/batch-a/browser-registry-modules.test.js
case = build selector projection computes the same availability from source registries
actual_visibleCount = 7
expected_visibleCount = 1
```

## Diagnosis

```text
S43F8 Alpha5 runtime projection unintentionally changed selector projection availability.
This violates the S43F8 scope guard that browser selector visibility policy should remain unchanged.
```

## Gate

```text
S43F9R_GATE = FAIL
CONTINUOUS_EXECUTION_STOP = TRUE
NEXT_SHORTEST_STEP = S43F9A_SelectorVisibilityPolicyGuardFix
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_ALPHA_RUNTIME_PROJECTED_READBACK_PASS_TEST_BLOCKED
GOAL_DISTANCE_AFTER = D1_S43F_ALPHA_RUNTIME_PROJECTED_BUT_SELECTOR_VISIBILITY_REGRESSION_FOUND
DISTANCE_REDUCED = test blocker converted from unknown to concrete selector visibility regression
```
