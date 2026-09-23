# S44C R2 G3A-U06 Divisibility Balance Retry Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
AFFECTED_KP = kp_g3a_u06_divisibility_exact_check
BUG_TYPE = duplicate_retry_broke_yes_no_balance
```

## Failure Readback

```text
npm test after S44C still failed:
- 12-question balance test: actual 可以 count = 4, expected 6
- 20-question balance test: actual 可以 count = 7, expected 10
```

## Root Cause

```text
The previous implementation still derived the target answer from sequenceNumber parity.
Duplicate retries changed sequenceNumber, so the accepted output stream was not guaranteed to keep 1:1 yes/no balance.
```

## R2 Fix

```text
1. Make shouldBeDivisible an explicit generation target.
2. Derive shouldBeDivisible from acceptedForPattern parity, not retry sequenceNumber parity.
3. Keep duplicate retries as candidate variation only.
4. Pass shouldBeDivisible into the divisibility generator.
5. Include the target answer in the generated question id and seed hash.
```

## Files Updated

```text
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
```

## Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke for G3A-U06 整除檢查
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_DIVISIBILITY_BALANCE_FIX_IMPLEMENTED_BUT_TEST_FAIL
GOAL_DISTANCE_AFTER  = D1_DIVISIBILITY_BALANCE_RETRY_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = fixed the retry/parity bug that allowed duplicate rejection to break yes/no balance
REMAINING_BLOCKERS   = ["npm test readback", "browser PDF smoke", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = pull latest public/main, rerun npm test, then regenerate G3A-U06 整除檢查 PDF
```
