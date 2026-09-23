# S44B G3A-U06 Two-Digit Division Correction — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
CORRECTION_TYPE = operator_source_content_correction
SOURCE_ID = g3a_u06_3a06
UNIT_TITLE = 二位數除以一位數
AFFECTED_KPS = [
  "kp_g3a_u06_exact_division_check",
  "kp_g3a_u06_divisibility_exact_check"
]
```

## Correction

```text
1. Operator clarified that g3a_u06_3a06 is correct.
2. Operator clarified that the unit must be 3A-U06 二位數除以一位數.
3. Reverted the previously introduced 三位數除以一位數 exact-division interpretation.
4. Exact-division KP now uses 二位數除以一位數整除.
5. Exact-division generator now emits dividend 10..99 and divisor 2..9 with exact quotient.
6. Divisibility-check KP remains a yes/no 整除檢查 prompt with both divisible and non-divisible cases.
```

## Files Updated

```text
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
site/modules/curriculum/batch-a/source-units.js
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
tests/curriculum/g3a-u06-division-kp-generator.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke for:
- 二位數除以一位數整除
- 整除檢查
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U06_TWO_DIVISION_KP_FIX_IMPLEMENTED_READBACK_PENDING_BUT_WRONG_THREE_DIGIT_SCOPE
GOAL_DISTANCE_AFTER  = D1_G3A_U06_TWO_DIGIT_CORRECTION_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = corrected source unit title and exact-division KP/generator back to 二位數除以一位數 scope
REMAINING_BLOCKERS   = ["npm test readback", "browser PDF smoke", "Pages deploy retry"]
NEXT_SHORTEST_STEP   = pull latest public/main, run npm test, then regenerate the two G3A-U06 PDFs
```
