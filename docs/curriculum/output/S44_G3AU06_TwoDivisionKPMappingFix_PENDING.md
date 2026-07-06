# S44 G3A-U06 Two Division KnowledgePoint Mapping Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u06_3a06
AFFECTED_KPS = [
  "kp_g3a_u06_exact_division_check",
  "kp_g3a_u06_divisibility_exact_check"
]
```

## Scope

```text
1. Confirmed operator correction: target sourceId is g3a_u06_3a06, not g3a_u04.
2. Fix only the two visible division KnowledgePoints:
   - 三位數除以一位數整除
   - 整除檢查
3. Do not expand to other division units or mixed operation units.
```

## Fix

```text
1. Override G3A-U06 exact-division PatternSpec to require a 3-digit dividend and 1-digit divisor.
2. Add a G3A-U06 division generator wrapper that intercepts only g3a_u06_3a06 division KPs.
3. Generate exact division questions as 100..999 ÷ 2..9 with exact quotient.
4. Generate divisibility-check questions as yes/no prompts with both divisible and non-divisible cases.
5. Route worksheet generation through the new G3A-U06 wrapper, while preserving G3A-U03 behavior through delegation.
6. Add validator support for divisibilityCheck questions.
7. Add automated tests for selector labels, exact-division operand ranges, divisibility yes/no coverage, and worksheet bridge rendering.
```

## Files Modified / Created

```text
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3a-u06-division-generator.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
site/modules/curriculum/batch-a/batch-a-browser-validator.js
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
site/modules/curriculum/batch-a/source-units.js
tests/curriculum/g3a-u06-division-kp-generator.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke for both G3A-U06 KPs
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_SOURCE_ID_AND_KP_MAPPING_MISMATCH_TRACED
GOAL_DISTANCE_AFTER  = D1_G3A_U06_TWO_DIVISION_KP_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = g3a_u06 sourceId confirmed and two affected division KP mappings/generator outputs fixed in code
REMAINING_BLOCKERS   = ["npm test readback", "browser PDF smoke", "CI rerun"]
NEXT_SHORTEST_STEP   = pull latest public/main, run npm test, then regenerate PDFs for the two G3A-U06 KPs
```
