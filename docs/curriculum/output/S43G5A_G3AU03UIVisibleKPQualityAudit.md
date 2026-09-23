# S43G5A G3A-U03 UI Visible KP Quality Audit

## Status

```text
AUDIT_COMPLETE
CODE_CHANGED = false
```

## Scope

Checked current UI-visible G3A-U03 KnowledgePoints:

```text
kp_g3a_u03_2digit_by_1digit_carry
kp_g3a_u03_10_multiple_by_1digit
kp_g3a_u03_3digit_by_1digit
kp_g3a_u03_consecutive_multiplication_two_step
```

against uploaded worksheet PDFs and current PatternSpec definitions.

## Current PatternSpec Intent

```text
ps_g3a_u03_2digit_by_1digit_carry: [10..99] × [2..9]
ps_g3a_u03_10_multiple_by_1digit: [10..90] × [2..9]
ps_g3a_u03_3digit_by_1digit: [100..999] × [2..9]
ps_g3a_u03_consecutive_multiplication_two_step: [2..9] × [2..9] × [2..9]
```

## Uploaded PDF Readback Findings

### 三位數乘以一位數

Observed examples:

```text
9 × 16
2 × 9
3 × 3
4 × 17
```

Result:

```text
NOT_ALIGNED
```

Reason: expected 3-digit × 1-digit; observed first operand is always 1-digit and second operand is 1- or 2-digit.

### 10 的倍數乘以一位數

Observed examples:

```text
2 × 2
3 × 16
4 × 9
5 × 17
```

Result:

```text
NOT_ALIGNED
```

Reason: expected 10/20/.../90 × 1-digit; observed first operand is 1-digit and second operand is not constrained to multiples of 10.

### 二位數乘以一位數

Observed examples:

```text
5 × 7
5 × 0
6 × 15
8 × 16
```

Result:

```text
NOT_ALIGNED
```

Reason: expected 2-digit × 1-digit; observed first operand is always 1-digit, includes 0/1 in the other operand, and mixes 1-digit × 1-digit with 1-digit × 2-digit.

### 二步驟連續乘法

Observed examples:

```text
(3 × 9) × 6
(2 × 7) × 13
(6 × 9) × 13
(9 × 2) × 20
```

Result:

```text
PARTIAL_ALIGNMENT
```

Reason: structure is two-step multiplication, but current PatternSpec intent is [2..9] × [2..9] × [2..9]; observed third factor includes 10, 13, 17, 20.

## Audit Conclusion

```text
G3A-U03 UI visibility = PASS
G3A-U03 KP source/output alignment = FAIL
```

The four KPs are visible in UI, but the generated worksheets do not match their displayed KnowledgePoint names / current PatternSpec intent.

## Required Next Fix

```text
S43G5B_G3AU03MultiplicationGeneratorQualityFix
```

Expected fixes:

```text
1. 二位數乘以一位數 must generate 10..99 × 2..9, not 1-digit × mixed 0..20.
2. 10 的倍數乘以一位數 must generate {10,20,...,90} × 2..9.
3. 三位數乘以一位數 must generate 100..999 × 2..9.
4. 二步驟連續乘法 must either follow [2..9] × [2..9] × [2..9], or the PatternSpec must be explicitly widened if 10/13/17/20 are intended.
5. Answer key must not duplicate the answer line.
6. Filler blank cells should remain disabled as in S43G4F.
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U03_UI_VISIBLE_4_KP_UNCHECKED
GOAL_DISTANCE_AFTER  = D1_G3A_U03_UI_VISIBLE_BUT_OUTPUT_ALIGNMENT_FAIL_IDENTIFIED
DISTANCE_REDUCED     = verified that UI visibility is present but source/output alignment is not acceptable for G3A-U03
REMAINING_BLOCKERS   = ["G3A-U03 multiplication generator outputs do not match visible KP labels", "two-step multiplication PatternSpec/output mismatch", "answer key duplicate display appears in uploaded PDFs"]
NEXT_SHORTEST_STEP   = S43G5B_G3AU03MultiplicationGeneratorQualityFix
```
