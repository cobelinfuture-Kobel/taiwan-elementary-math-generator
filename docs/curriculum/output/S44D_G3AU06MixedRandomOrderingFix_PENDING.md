# S44D G3A-U06 Mixed Random Ordering Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
BUG_TYPE = mixed_kp_ordering_ignored
AFFECTED_MODE = 同單位混合知識點隨機 / shuffleAcrossPatterns
```

## PDF Smoke Finding

```text
Uploaded PDF: g3a_u06_同單位混合知識點隨機.pdf
Content correctness: PASS
- 二位數除以一位數整除 questions were valid.
- 整除檢查 questions were valid and close to balanced.
Ordering correctness: FAIL
- Questions 1..11 were all ps_g3a_u06_exact_division_check.
- Questions 12..22 were all ps_g3a_u06_divisibility_exact_check.
- This means mixed random output was still grouped by PatternSpec.
```

## Fix

```text
1. Added a G3A-U06 ordering wrapper.
2. The wrapper delegates content generation to the existing G3A-U06 division generator.
3. When ordering = shuffleAcrossPatterns and multiple PatternSpecs are allocated, the wrapper sorts each PatternSpec bucket deterministically and interleaves PatternSpecs.
4. Worksheet generation is routed through the new wrapper.
5. Added an automated test to ensure the first half of mixed output contains both PatternSpecs and enough transitions.
```

## Files Created / Updated

```text
site/modules/curriculum/batch-a/g3a-u06-division-ordering-generator.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
tests/curriculum/g3a-u06-mixed-ordering.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke for g3a_u06 同單位混合知識點隨機
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_CONTENT_PASS_MIXED_ORDERING_BUG_CONFIRMED
GOAL_DISTANCE_AFTER  = D1_MIXED_RANDOM_ORDERING_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = fixed G3A-U06 worksheet routing so shuffleAcrossPatterns interleaves both division KPs instead of grouped PatternSpec output
REMAINING_BLOCKERS   = ["npm test readback", "browser PDF smoke", "Pages deploy may need rerun"]
NEXT_SHORTEST_STEP   = pull latest public/main, run npm test, then regenerate the mixed random PDF
```
