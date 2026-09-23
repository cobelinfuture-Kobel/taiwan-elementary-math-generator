# S44C G3A-U06 Divisibility Check Balance Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
AFFECTED_KP = kp_g3a_u06_divisibility_exact_check
BUG_TYPE = divisibility_yes_no_distribution_imbalanced
```

## PDF Smoke Finding

```text
The uploaded G3A-U06 整除檢查 PDF showed 19 divisible cases and 3 non-divisible cases in the first 22 questions.
The question form was correct, but the answer distribution was too biased for a divisibility-check worksheet.
```

## Fix

```text
1. Keep 二位數除以一位數 scope.
2. Keep the yes/no 整除檢查 question form.
3. Make accepted divisibility-check sequence numbers alternate target outcome.
4. For non-divisible cases, choose a dividend by scanning 20..99 until dividend % divisor !== 0.
5. Add automated tests requiring 6/6 balance for 12 questions and 10/10 balance for first 20 questions.
```

## Files Updated

```text
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
tests/curriculum/g3a-u06-division-kp-generator.test.js
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
GOAL_DISTANCE_BEFORE = D1_EXACT_DIVISION_PASS_DIVISIBILITY_BALANCE_BUG_CONFIRMED
GOAL_DISTANCE_AFTER  = D1_DIVISIBILITY_BALANCE_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = fixed the remaining G3A-U06 divisibility-check quality bug by enforcing balanced yes/no output
REMAINING_BLOCKERS   = ["npm test readback", "browser PDF smoke", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = pull latest public/main, run npm test, then regenerate G3A-U06 整除檢查 PDF
```
