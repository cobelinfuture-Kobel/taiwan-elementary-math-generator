# S43G5L G3A-U03 Mixed KP Shuffle And Dedup QA

## Status

```text
S43G5L_MIXED_KP_SHUFFLE_FIX = PASS
S43G5L_DEDUP_CONTROL = PASS
S43G5L_QA = PASS
S43G5L_CI_READBACK = PASS
```

## Trigger

Uploaded PDF readback showed:

```text
G3A-U03 mixed worksheet contained 6 KPs
but questions were grouped by KP blocks instead of cross-KP random interleaving
and missing-digit / two-step multiplication repeated short cycles
```

Examples from readback:

```text
1–25   = 10 的倍數乘以一位數
26–50  = 二位數乘以一位數
51–75  = 三位數乘以一位數
76–100 = 三位數中間為0乘一位數
101–125 = 兩步驟連續乘法
126–150 = 乘法缺位推理
```

## Fix

Changed:

```text
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
```

Implementation:

```text
1. shuffleAcrossPatterns now uses round-robin interleaving across PatternSpec buckets.
2. two-step multiplication uses a generated unique pool instead of a short fixed 20-row cycle.
3. multiplication missing-digit inference uses a generated unique pool instead of an 8-row cycle.
4. generator-level questionKey dedup prevents duplicate prompts in one worksheet.
5. if the unique pool is exhausted, generation fails instead of emitting duplicate questions.
```

## QA Added

```text
tests/curriculum/batch-a/g3a-u03-shuffle-dedup.test.js
```

QA verifies:

```text
1. 150-question G3A-U03 same-unit mixed worksheet can generate.
2. ordering = shuffleAcrossPatterns.
3. first 30 questions contain at least 4 different PatternSpecs.
4. first 6 questions contain 6 different PatternSpecs.
5. full worksheet has no duplicate question prompts.
6. worksheet, answer key, and HTML render pass.
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = e8dcdf4ab7c4a2043143362e742d053b616a35e9
CI_TESTS = 362
CI_PASS = 362
CI_FAIL = 0
WORKING_TREE = clean
```

## Result

```text
G3A-U03 visible KP count remains 6
mixed mode now interleaves across KPs
short-cycle duplicates are blocked by generator-level dedup
print path remains valid
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_PDF_READBACK_RANDOMIZATION_GAP_IDENTIFIED
GOAL_DISTANCE_AFTER  = D1_G3A_U03_MIXED_KP_SHUFFLE_AND_DEDUP_QA_PASS
DISTANCE_REDUCED     = fixed G3A-U03 same-unit mixed worksheet ordering and duplicate-control so 6 KPs can print as cross-KP mixed practice
REMAINING_BLOCKERS   = ["manual PDF regeneration/readback optional to visually confirm new ordering"]
NEXT_SHORTEST_STEP   = S43G5M_G3AU03RegeneratedPDFReadback or S43G5_G3B_U01_Phase1SelectionScan
```
