# S43C14R1 Public Main Test Readback FAIL

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C14R1_PublicMainTestReadback
TASK_STATUS = PUBLIC_MAIN_TEST_FAIL
WRITE_TYPE = docs_only_operator_evidence_failure
```

This record captures operator-provided public-main worktree test evidence after S43C14 added focused single visible-KP smoke QA.

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C14R1_PublicMainTestReadback
ROADMAP_ALIGNMENT = PASS
```

S43C14R1 is a readback-only task. It does not proceed to S43C15 and does not start S43E.

## Operator Context

The operator tested from the public-main worktree:

```text
G:\HomeWork\Math_Learning_DB\homework\math-worksheet-generator-public
```

Git status showed:

```text
HEAD detached at public/main
nothing to commit, working tree clean
```

## Operator Test Readback

The operator ran:

```text
npm test
```

Observed result:

```text
tests 312
suites 0
pass 311
fail 1
cancelled 0
skipped 0
todo 0
duration_ms 574.8378
```

## Failing Test

```text
test at tests\curriculum\batch-a\g3a-u02-single-visible-kp-smoke-qa.test.js:219:1
S43C14 smoke: mixed KP modes remain deferred before their gates
```

Observed assertion failure:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
+ actual - expected

  [
+   'kp_resolver_all_candidates_rejected'
-   undefined
  ]
```

Failure location:

```text
tests/curriculum/batch-a/g3a-u02-single-visible-kp-smoke-qa.test.js:228:10
```

## Failure Classification

```text
FAILURE_CLASS = test_expectation_mismatch
SCOPE = S43C14 smoke QA only
RUNTIME_GENERATION_FAILURE = false
REGISTRY_FAILURE = false
WORKSHEET_FAILURE = false
ANSWER_KEY_FAILURE = false
RENDERER_FAILURE = false
QUERY_SURVIVAL_FAILURE = false
SOURCE_UNIT_FAILURE = false
```

Interpretation:

```text
The smoke QA failure is limited to the mixed-mode deferral assertion. The test expected a constant that resolved to undefined for the same-unit mixed mode error expectation, while the current resolver returned the deterministic error code kp_resolver_all_candidates_rejected.
```

## Result

```text
TEST_SCOPE_OBSERVED = public-main worktree
LOCAL_TEST_COMMAND = npm test
LOCAL_TESTS_TOTAL = 312
LOCAL_TESTS_PASS = 311
LOCAL_TESTS_FAIL = 1
LOCAL_TESTS_CANCELLED = 0
LOCAL_TESTS_SKIPPED = 0
LOCAL_TESTS_TODO = 0
LOCAL_WORKTREE_STATUS = clean
LOCAL_HEAD_STATUS = detached_at_public_main
S43C14R1_STATUS = PUBLIC_MAIN_TEST_FAIL
```

## QA Interpretation

```text
- S43C14 smoke QA implementation is not test-readback complete.
- S43C14R1 cannot be upgraded to PASS_PUBLIC_MAIN_SYNCED_AND_TESTED.
- S43C15 G3A-U02 prototype closeout must not proceed.
- The next valid step is a focused S43C14R2 fix for the mixed-mode smoke assertion / resolver deferral expectation.
```

## Scope Boundary Preserved

```text
S43C15 prototype closeout = not executed
same-unit mixed KP selection = not implemented
cross-unit mixed KP selection = not implemented
S43E 13-unit KP expansion = not started
Batch B/C/D/E expansion = not started
```

## S43C14R1 Failed Gate

```text
S43C14R1_GATE = PUBLIC_MAIN_TEST_FAIL

PASS:
- public-main worktree test readback received
- git status clean readback received
- HEAD detached at public/main readback received
- failing test isolated to S43C14 smoke QA mixed-mode deferral assertion

FAIL:
- tests total = 312
- tests pass = 311
- tests fail = 1
- PASS_PUBLIC_MAIN_SYNCED_AND_TESTED not achieved
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_SINGLE_VISIBLE_KP_SMOKE_QA_IMPLEMENTED_PENDING_TEST_READBACK
GOAL_DISTANCE_AFTER  = D1_SINGLE_VISIBLE_KP_SMOKE_QA_PUBLIC_MAIN_TEST_FAIL
DISTANCE_REDUCED     = post-S43C14 public-main test evidence was obtained, but S43C14 remains blocked by one focused mixed-mode deferral assertion failure

HTMLSingleVisibleKPEnablement         100% -> 100%
SingleVisibleKPSmokeQA                100% -> 100%
KPHTMLSelectablePath                   99% ->  99%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C14 public/main npm test PASS 尚未 observed",
  "S43C14R1 PASS_PUBLIC_MAIN_SYNCED_AND_TESTED 尚未 achieved",
  "S43C14 smoke QA mixed-mode deferral assertion still failing",
  "S43C15 G3A-U02 prototype closeout 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C14R2_MixedModeDeferralAssertionFullFix
```

S43C14R2 should fix only the observed mixed-mode deferral assertion mismatch. It must not implement same-unit mixed KP selection, cross-unit mixed KP selection, S43C15 closeout, or S43E expansion.
