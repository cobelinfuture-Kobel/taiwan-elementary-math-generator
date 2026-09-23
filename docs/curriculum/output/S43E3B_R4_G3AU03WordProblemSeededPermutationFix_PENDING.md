# S43E3B R4 G3A-U03 Word Problem Seeded Permutation Fix — Pending Readback

```text
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
BUG_TYPE = deterministic_operand_order_leak
SOURCE_ID = g3a_u03_3a03
PATTERN_SPEC_ID = ps_g3a_u03_consecutive_multiplication_two_step_word_problem
```

## Problem

The browser/PDF smoke confirmed that the G3A-U03 two-step continuous multiplication word-problem worksheet emitted operands in sorted Cartesian-product order:

```text
2 x 2 x 3
2 x 3 x 3
2 x 4 x 3
...
```

This was a generator quality bug, not a PDF or answer-validation bug.

## Fix

```text
1. Keep the legal operand pool.
2. Replace direct sequenceNumber -> twoStepRows index lookup for the word-problem PatternSpec.
3. Use generationSeed to derive a deterministic permutation offset and step.
4. Preserve deterministic reproducibility for the same generationSeed.
5. Add regression tests that reject the previous first-eight lexicographic sequence.
```

## Files Updated

```text
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
tests/curriculum/g3a-u03-word-problem-kp-selector.test.js
```

## Validation Required

```text
git pull public main
npm test
git status
browser PDF smoke
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_OUTPUT_QUALITY_BUG_CONFIRMED
GOAL_DISTANCE_AFTER  = D1_SEEDED_PERMUTATION_FIX_IMPLEMENTED_READBACK_PENDING
DISTANCE_REDUCED     = G3A-U03 word-problem generator no longer emits the old lexicographic operand order for the same PatternSpec path
REMAINING_BLOCKERS   = ["npm test readback", "CI rerun", "browser PDF smoke"]
NEXT_SHORTEST_STEP   = pull latest public/main, run npm test, inspect first PDF page ordering
```
