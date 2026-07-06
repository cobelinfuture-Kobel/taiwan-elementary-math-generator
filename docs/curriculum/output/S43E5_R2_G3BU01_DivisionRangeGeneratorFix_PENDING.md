# S43E5 R2 G3B-U01 Division Range Generator Fix — Pending Readback

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R2_G3BU01_DivisionRangeGeneratorFix
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3b_u01_3b01
```

## Failure Readback

Browser PDF smoke failed after S43E5 local tests passed:

```text
g3b_u01_三位數除以一位數.pdf        = FAIL
g3b_u01_二位數除以一位數退位.pdf    = FAIL
g3b_u01_同單位混合知識隨機.pdf      = FAIL
```

Observed output contained one-digit division such as:

```text
9 ÷ 9 = ___
6 ÷ 6 = ___
8 ÷ 8 = ___
6 ÷ 3 = ___
```

This failed the expected G3B-U01 ranges:

```text
ps_g3b_u01_3digit_by_1digit_regroup_hundreds: dividend 100..999, divisor 2..9
ps_g3b_u01_2digit_by_1digit_regroup_tens: dividend 10..99, divisor 2..9
```

## Root Cause

The worksheet route imports the source-specific ordered generator chain. G3B-U01 was visible in the selector registry, but lacked a direct source-specific generation route with PDF-smoke range tests, so the browser output could degrade to the generic one-digit division path without automated detection.

## Fix

```text
1. Added explicit G3B-U01 exact-division routing inside the division generator wrapper.
2. Added deterministic exact-division generation for:
   - 3-digit dividend ÷ 1-digit divisor
   - 2-digit dividend ÷ 1-digit divisor
3. Preserved exact quotient and answer-key generation.
4. Added range assertions to G3B-U01 worksheet tests.
5. Added mixed worksheet test requiring both PatternSpecs and no one-digit dividend output.
```

## Files Updated

```text
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
tests/curriculum/batch-a/g3b-u01-kp-expansion.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
```

Then regenerate:

```text
1. g3b_u01_三位數除以一位數.pdf
2. g3b_u01_二位數除以一位數退位.pdf
3. g3b_u01_同單位混合知識隨機.pdf
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_G3B_U01_BROWSER_PDF_SMOKE_FAIL_RANGE_BUG_CONFIRMED
GOAL_DISTANCE_AFTER  = D1_G3B_U01_DIVISION_RANGE_GENERATOR_FIX_IMPLEMENTED_PENDING_READBACK
DISTANCE_REDUCED     = fixed the generator routing/range bug that produced one-digit division for G3B-U01 PDFs
REMAINING_BLOCKERS   = ["npm test readback pending", "browser PDF smoke pending", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = git pull public main; npm test; git status
```
