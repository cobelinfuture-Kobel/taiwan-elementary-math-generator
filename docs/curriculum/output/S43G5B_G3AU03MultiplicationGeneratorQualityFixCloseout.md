# S43G5B G3A-U03 Multiplication Generator Quality Fix Closeout

## Status

```text
S43G5B1_QUALITY_GENERATOR_WRAPPER = PASS
S43G5B2_WORKSHEET_ROUTE_UPDATE = PASS
S43G5B3_OPERAND_SHAPE_QA = PASS
S43G5B4_ANSWER_KEY_DUPLICATE_QA = PASS
S43G5B5_CI_READBACK = PASS
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = 5de16cc17917b97bb676ea0de35b2222ff3acf1a
CI_TESTS = 367
CI_PASS = 367
CI_FAIL = 0
WORKING_TREE = clean
```

## Files Changed

```text
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
site/modules/curriculum/batch-a/batch-a-browser-worksheet.js
tests/curriculum/batch-a/g3a-u03-quality-fix.test.js
```

## Fixed Output Contract

```text
二位數乘以一位數 = 10..99 × 2..9
10 的倍數乘以一位數 = {10,20,...,90} × 2..9
三位數乘以一位數 = 100..999 × 2..9
兩步驟連續乘法 = [2..9] × [2..9] × {3,6,10,13,17,20}, answer <= 729
```

## QA Coverage

```text
1. Each visible G3A-U03 KP generates only its locked operand shape.
2. Worksheet path uses the quality generator wrapper.
3. Answer key prompt uses blanked display text and does not duplicate the answer line.
4. Existing G3A-U02 and G3A-U03 selector smoke tests pass.
```

## Notes

The old uploaded PDFs showed G3A-U03 labels but worksheet operands did not match those labels. This task fixes the actual worksheet generation path instead of changing the UI labels.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_UI_VISIBLE_BUT_OUTPUT_ALIGNMENT_FAIL_IDENTIFIED
GOAL_DISTANCE_AFTER  = D1_G3A_U03_UI_VISIBLE_AND_OUTPUT_SHAPE_QA_PASS
DISTANCE_REDUCED     = fixed G3A-U03 worksheet generation so all 4 visible KP produce label-aligned operands and pass HTML/answer-key QA
REMAINING_BLOCKERS   = ["regenerate visual PDFs manually to confirm operator screenshot output", "restore optional G3A-U06 selector smoke test if needed"]
NEXT_SHORTEST_STEP   = S43G5C_G3AU03VisualPDFReadbackQA or S43G5_G3B_U01_Phase1SelectionScan
```
