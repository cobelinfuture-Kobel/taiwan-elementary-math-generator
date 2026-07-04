# S43C14R2 Mixed Mode Deferral Assertion FullFix

## Current State

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43C14R2_MixedModeDeferralAssertionFullFix
TASK_STATUS = MIXED_MODE_DEFERRAL_ASSERTION_FULLFIX_IMPLEMENTED_PENDING_TEST_READBACK
WRITE_TYPE = focused_test_assertion_patch_plus_docs
```

## Roadmap Alignment

```text
ROADMAP_FILE = docs/curriculum/roadmap/S43_BatchA_KnowledgePointSelectable_HTMLWorksheet_Roadmap.md
ROADMAP_PHASE = S43C_G3AU02PrototypeAndFirstVisibleKPPath
ROADMAP_NEXT_EXPECTED_STEP = S43C14R2_MixedModeDeferralAssertionFullFix
ROADMAP_ALIGNMENT = PASS
```

S43C14R2 is a corrective task after S43C14R1 public-main test readback failed. It fixes only the observed mixed-mode smoke assertion mismatch. It does not proceed to S43C15, does not implement same-unit mixed KP selection, does not implement cross-unit mixed KP selection, and does not start S43E.

## Failure Input

S43C14R1 public-main test readback reported:

```text
TEST_SCOPE_OBSERVED = public-main worktree
LOCAL_TEST_COMMAND = npm test
LOCAL_TESTS_TOTAL = 312
LOCAL_TESTS_PASS = 311
LOCAL_TESTS_FAIL = 1
LOCAL_WORKTREE_STATUS = clean
LOCAL_HEAD_STATUS = detached_at_public_main
S43C14R1_STATUS = PUBLIC_MAIN_TEST_FAIL
```

Failing test:

```text
tests/curriculum/batch-a/g3a-u02-single-visible-kp-smoke-qa.test.js
S43C14 smoke: mixed KP modes remain deferred before their gates
```

Observed mismatch:

```text
actual   = ["kp_resolver_all_candidates_rejected"]
expected = [undefined]
```

## Root Cause

`BATCH_A_RESOLVER_ERROR_CODES` has no `SAME_UNIT_MIXED_NOT_SUPPORTED_YET` member. The smoke test expected:

```text
BATCH_A_RESOLVER_ERROR_CODES.SAME_UNIT_MIXED_NOT_SUPPORTED_YET
```

which resolved to `undefined`.

The resolver's current deterministic behavior is:

```text
same-unit mixed mode with only one requested visible KP
→ BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED
→ "kp_resolver_all_candidates_rejected"
```

This is consistent with the current S43C14 state, because only one visible G3A-U02 KP exists and same-unit mixed selection is not enabled by S43C14.

## File Changed

```text
tests/curriculum/batch-a/g3a-u02-single-visible-kp-smoke-qa.test.js
docs/curriculum/output/S43C14R2_MixedModeDeferralAssertionFullFix.md
```

## Fix Applied

Updated the same-unit mixed-mode smoke assertion from the nonexistent constant to the current resolver contract:

```text
before:
BATCH_A_RESOLVER_ERROR_CODES.SAME_UNIT_MIXED_NOT_SUPPORTED_YET

now:
BATCH_A_RESOLVER_ERROR_CODES.ALL_CANDIDATES_REJECTED
```

Also added explicit no-exposure checks:

```text
sameUnit.patternSpecIds = []
sameUnit.allocation = []
crossUnit.patternSpecIds = []
crossUnit.allocation = []
```

## Scope Boundary Preserved

```text
S43C15 prototype closeout = not executed
same-unit mixed KP selection = not implemented
cross-unit mixed KP selection = not implemented
S43E 13-unit KP expansion = not started
Batch B/C/D/E expansion = not started
```

## S43C14R2 Gate

```text
S43C14R2_GATE = PASS_MIXED_MODE_ASSERTION_FULLFIX_IMPLEMENTED_PENDING_TEST_READBACK

PASS:
- observed S43C14R1 failure was traced to a nonexistent test constant
- same-unit mixed assertion now matches current resolver deterministic error code
- same-unit mixed path still resolves no PatternSpec and no allocation
- cross-unit mixed path remains deferred
- cross-unit mixed path still resolves no PatternSpec and no allocation
- no mixed KP feature implementation added
- S43C15 not executed
- S43E not started

GAPS:
- post-S43C14R2 public/main npm test PASS not observed
- S43C15 G3A-U02 prototype closeout not executed
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_SINGLE_VISIBLE_KP_SMOKE_QA_PUBLIC_MAIN_TEST_FAIL
GOAL_DISTANCE_AFTER  = D1_SINGLE_VISIBLE_KP_SMOKE_QA_FULLFIX_PENDING_TEST_READBACK
DISTANCE_REDUCED     = the only observed S43C14R1 failure cause was fixed; S43C14 still requires post-S43C14R2 public-main npm test readback before S43C15

HTMLSingleVisibleKPEnablement         100% -> 100%
SingleVisibleKPSmokeQA                100% -> 100%
KPHTMLSelectablePath                   99% ->  99%
S43Overall                             99% ->  99%
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "post-S43C14R2 public/main npm test PASS 尚未 observed",
  "S43C14R2 PASS_PUBLIC_MAIN_SYNCED_AND_TESTED 尚未 achieved",
  "S43C15 G3A-U02 prototype closeout 尚未 executed",
  "S43E 13-unit KP expansion 尚未開始"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43C14R2R1_PublicMainTestReadback
```

Run public-main worktree test after pulling the latest public main:

```text
git fetch public main
git checkout public/main
npm test
git status
```

Expected valid evidence:

```text
npm test: fail 0
git status: working tree clean
```
