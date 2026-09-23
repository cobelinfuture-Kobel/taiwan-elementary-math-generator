# S43G5K G3A-U03 Supplementary KP Closeout

## Status

```text
S43G5D_DESIGNSCAN = PASS
S43G5E_ZERO_MIDDLE_PATTERNSPEC = PASS
S43G5F_ZERO_MIDDLE_GENERATOR_VALIDATOR = PASS
S43G5G_MISSING_DIGIT_INFERENCE_PATTERNSPEC = PASS
S43G5H_MISSING_DIGIT_INFERENCE_GENERATOR_VALIDATOR = PASS
S43G5I_SELECTOR_PROMOTION = PASS
S43G5J_UI_PRINT_QA = PASS
S43G5K_CLOSEOUT = PASS
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = 20f837d381f0a7e542204fadf6fd02c024e2b8da
CI_TESTS = 361
CI_PASS = 361
CI_FAIL = 0
WORKING_TREE = clean
```

## Added KnowledgePoints

```text
kp_g3a_u03_3digit_zero_middle_by_1digit
kp_g3a_u03_multiplication_missing_digit_inference
```

## UI Count

```text
G3A-U03 visible KP count: 4 -> 6
Batch A visible KP count: 16 -> 18
```

## KP 1 Contract

```text
三位數中間為0乘一位數
A × B = C
A is 3 digits
A tens digit is 0
B is 1 digit, 2..9
answer is C
no missing digit requirement
```

## KP 2 Contract

```text
乘法缺位推理
A × B = C
allowed blank pairs: A/C or B/C
C must contain □
blank place values must be different
same-place blanks are invalid
answer order follows prompt order
```

Explicit validator rejection:

```text
3□2 × 2 = 6□4
A □ is tens place
C □ is tens place
same place value => FAIL
```

## Files Changed

```text
docs/curriculum/output/S43G5D_G3AU03SupplementaryKPDesignScan.md
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/batch-a/g3a-u03-quality-generator.js
site/modules/curriculum/batch-a/g3a-u03-multiplication-policy.js
site/modules/curriculum/batch-a/batch-a-browser-validator.js
tests/curriculum/batch-a/g3a-u03-supplementary-kp.test.js
```

Related QA maintenance:

```text
updated stale selector count tests from 16 to 18
replaced stale site readiness file-count test with tests/site/site-smoke.test.js
```

## QA Coverage

```text
1. UI selector exposes G3A-U03 6 visible KPs.
2. Zero-middle multiplication generates 3-digit numbers with tens digit 0 times 2..9.
3. Multiplication missing digit inference generates A/C and B/C blanks.
4. Same-place blank rule rejects 3□2 × 2 = 6□4.
5. Supplementary KPs can be mixed in same-unit mode.
6. Worksheet, answer key, and HTML render path pass.
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_UI_VISIBLE_4_KP_AND_OUTPUT_QA_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U03_UI_VISIBLE_6_KP_PRINTABLE_AND_CI_PASS
DISTANCE_REDUCED     = added two supplementary G3A-U03 KPs through PatternSpec, generator, validator, selector, worksheet, answer key, and HTML print QA
REMAINING_BLOCKERS   = ["manual visual PDF readback remains optional"]
NEXT_SHORTEST_STEP   = S43G5L_G3AU03VisualPDFReadbackQA or S43G5_G3B_U01_Phase1SelectionScan
```
