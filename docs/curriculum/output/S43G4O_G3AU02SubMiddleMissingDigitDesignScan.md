# S43G4O G3A-U02 Sub Middle Missing Digit DesignScan

## Scope

Design only. No generator or validator code is changed by this task.

This task splits a focused subtraction topic from the broader equation-level missing digit KPs.

## Target KP Candidate

```text
kp_g3a_u02_sub_middle_missing_digit
```

Candidate PatternGroup and PatternSpec:

```text
pg_g3a_u02_sub_middle_missing_digit
ps_g3a_u02_sub_middle_missing_digit
```

## Meaning

The topic is not general A/B/C equation blank filling.
It focuses on missing digits in the middle place-value columns of four-digit subtraction.

Primary columns:

```text
hundreds
 tens
```

Allowed equation shape:

```text
A - B = C
```

Display may stay horizontal, for example:

```text
6□59 - 24□3 = □665
```

The underlying reasoning remains column subtraction.

## Locked Rules

1. Operator is subtraction only.
2. Left operand A is four digits.
3. Right operand B supports one to four digits, but the promoted QA target should emphasize three- and four-digit B.
4. Result C must be non-negative.
5. At least one blank must be in a middle place-value column: hundreds or tens.
6. Result C should participate when possible, but this KP is defined by middle-column reasoning, not merely C participation.
7. No two blanks may use the same place-value column.
8. Answer order follows prompt left to right.
9. Vertical rendering is not required for first implementation.

## Why Separate From Equation Blank

Existing equation-level KPs already cover:

```text
A / B / C may contain blanks
C must include at least one blank
no duplicate place-value blanks
```

This new candidate must add a stricter learning target:

```text
middle-column subtraction reasoning
borrow interaction around hundreds / tens
```

## Non-scope

```text
continuous borrow with zero
vertical-column rendering
multiple blanks in the same place-value column
addition middle missing digit
```

Continuous borrow with zero remains a separate task:

```text
S43G4P_G3AU02ContinuousBorrowZeroDesignScan
```

## Acceptance Criteria For Next Implementation Task

The next implementation task should prove:

1. Generated questions are subtraction questions.
2. A is four digits.
3. At least one blank targets hundreds or tens.
4. No blank place-value column is repeated.
5. Refilled equation is mathematically correct.
6. Worksheet, answer key, and HTML render path pass.
7. Existing operand-only and equation-level missing digit KPs remain unchanged.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_MISSING_DIGIT_EQUATION_CLOSED_AND_CI_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U02_SUB_MIDDLE_MISSING_DIGIT_SCOPE_LOCKED
DISTANCE_REDUCED     = separated middle-column subtraction missing digit from general equation blank topic
REMAINING_BLOCKERS   = ["sub middle missing digit PatternSpec not yet implemented", "continuous borrow with zero not yet designed", "main selector projection materialization deferred"]
NEXT_SHORTEST_STEP   = S43G4O1_G3AU02SubMiddleMissingDigitPatternSpecContract
```
