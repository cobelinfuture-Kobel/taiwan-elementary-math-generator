# S43G5D G3A-U03 Supplementary KP DesignScan

## Scope

Add two supplementary G3A-U03 multiplication KnowledgePoints and promote them to the actual UI selector path.

## New KP Candidates

```text
kp_g3a_u03_3digit_zero_middle_by_1digit
kp_g3a_u03_multiplication_missing_digit_inference
```

## KP 1: 三位數中間為 0 乘一位數

Shape:

```text
A × B = C
```

Rules:

```text
A is 3 digits
A tens digit is 0
B is 1 digit, 2..9
answer is C
no missing digit requirement
```

Examples:

```text
302 × 4
507 × 3
801 × 6
```

## KP 2: 乘法缺位推理

Shape:

```text
A × B = C
```

Allowed blank pairs:

```text
A and C each have one □
B and C each have one □
```

Rules:

```text
support 2-digit × 1-digit
support 3-digit × 1-digit
C must contain □
A/C or B/C blank place values must be different
same-place blanks are invalid
answer order follows prompt order
unique solution is required
```

Explicit FAIL example:

```text
3□2 × 2 = 6□4
```

Reason:

```text
A □ is tens place
C □ is tens place
same place value => FAIL
```

## Implementation Chain

```text
S43G5E_G3AU03ZeroMiddleMultiplicationPatternSpec
S43G5F_G3AU03ZeroMiddleMultiplicationGeneratorValidator
S43G5G_G3AU03MissingDigitInferencePatternSpec
S43G5H_G3AU03MissingDigitInferenceGeneratorValidator
S43G5I_G3AU03SupplementaryKPSelectorPromotion
S43G5J_G3AU03SupplementaryKPUIPrintQA
S43G5K_G3AU03SupplementaryKPCloseout
```
