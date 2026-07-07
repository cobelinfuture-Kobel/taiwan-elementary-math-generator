# S43E5 R3 Visible Count Test Fix — Pending Readback

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R3_VISIBLE_COUNT_TEST_FIX
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
```

## Failure Readback

Operator local test readback after S43E5 R3 implementation:

```text
tests 373
pass 366
fail 7
working tree clean
```

All 7 failures were stale total visibleCount assertions:

```text
actual = 29
expected = 26
```

## Root Cause

G3B-U01 R3 intentionally changes Batch A visible KnowledgePoint count:

```text
before R3 = 26
G3B-U01 visible KPs before R3 = 2
after R3 = 29
G3B-U01 visible KPs after R3 = 5
```

The failing tests were older G3A-U02 / G3A-U03 selector regression tests that still asserted the global total count as 26.

## Fix

Updated stale visibleCount assertions from 26 to 29 in the failing selector tests while keeping unit-local counts unchanged:

```text
G3A-U02 visibleCount = 10
G3A-U03 visibleCount = 7
G3B-U01 visibleCount = 5
Batch A total visibleCount = 29
```

## Validation Required

```text
git pull public main
npm test
git status
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3B_U01_R3_GENERATOR_VALIDATOR_UI_MIXED_IMPLEMENTED_PENDING_READBACK
GOAL_DISTANCE_AFTER  = D1_G3B_U01_R3_STALE_VISIBLE_COUNT_TESTS_FIXED_PENDING_READBACK
DISTANCE_REDUCED     = fixed stale selector-count test blockers caused by expected Batch A visibleCount increasing from 26 to 29
REMAINING_BLOCKERS   = ["npm test readback pending", "browser PDF smoke pending", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = git pull public main; npm test; git status
```
