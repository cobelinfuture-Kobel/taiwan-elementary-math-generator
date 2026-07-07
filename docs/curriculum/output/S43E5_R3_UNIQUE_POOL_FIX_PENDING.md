# S43E5 R3 G3B-U01 Unique Pool Fix — Pending Readback

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R3_UNIQUE_POOL_FIX
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3b_u01_3b01
```

## Failure Readback

Browser smoke screenshot showed:

```text
batch_a_g3b_u01_unique_pool_exhausted:
G3B-U01 unique division question pool exhausted
```

This occurred after automated tests passed, during manual browser worksheet generation.

## Root Cause

The quotient-zero subpool is intentionally narrow, especially:

```text
ps_g3b_u01_2digit_ones_quotient_zero
```

For a 40-question `商中有 0 的除法` worksheet, the allocation can require all 14 unique two-digit ones-zero exact-division candidates. The old candidate picker used:

```text
hash(seed + patternSpecId + sequenceNumber) % candidates.length
```

That does not guarantee full traversal of a tight candidate pool before duplicates repeat, so the generator could retry duplicates until the pool-exhaustion guard fired.

## Fix

Changed the candidate picker to deterministic offset + sequence traversal:

```text
start = hash(seed + patternSpecId) % candidates.length
candidate = candidates[(start + sequenceNumber - 1) % candidates.length]
```

This preserves seed variation and guarantees that tight pools are exhausted sequentially before cycling.

## Tests Added

```text
tests/curriculum/batch-a/g3b-u01-unique-pool.test.js
```

Coverage:

```text
1. 商中有 0 的除法 can generate 40 printable questions.
2. Five-KP mixed G3B-U01 worksheet can generate 40 printable questions without unique_pool_exhausted.
```

## Validation Required

```text
git pull public main
npm test
git status
```

Then retry browser generation for the failed G3B-U01 PDF smoke case.

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3B_U01_R3_LOCAL_PASS_BROWSER_PDF_SMOKE_PENDING
GOAL_DISTANCE_AFTER  = D1_G3B_U01_R3_UNIQUE_POOL_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED     = fixed the browser-only unique_pool_exhausted blocker for tight quotient-zero division pools
REMAINING_BLOCKERS   = ["npm test readback pending", "browser PDF smoke pending", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = git pull public main; npm test; git status
```
