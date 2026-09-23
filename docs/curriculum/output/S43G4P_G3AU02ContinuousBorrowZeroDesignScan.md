# S43G4P G3A-U02 Continuous Borrow Zero DesignScan

## Scope

Design only. No generator, validator, selector, or renderer code is changed by this task.

This task locks the meaning of the G3A-U02 topic usually described as:

```text
連續退位中間有 0 的處理
```

It must remain separate from:

```text
kp_g3a_u02_sub_missing_digit_operand
kp_g3a_u02_sub_missing_digit_equation
kp_g3a_u02_sub_middle_missing_digit
```

## Target KP Candidate

```text
kp_g3a_u02_continuous_borrow_zero
pg_g3a_u02_continuous_borrow_zero
ps_g3a_u02_continuous_borrow_zero
```

## Meaning

The learning target is not just missing digits.
It is subtraction where regrouping must pass through a zero in a higher or middle place-value column.

Canonical horizontal shape:

```text
A - B = C
```

Examples of intended source-like shapes:

```text
7003 - 2458 = 4545
6000 - 2786 = 3214
5040 - 2687 = 2353
```

These are examples only. The implementation must generate exact, validated equations.

## Locked Rules

1. Operator is subtraction only.
2. A is four digits.
3. B should be three or four digits in the promoted QA path.
4. C must be non-negative.
5. A must contain at least one 0 in a place that participates in the borrow chain.
6. The subtraction must require continuous borrow across a zero.
7. The first implementation may be pure calculation without missing digits.
8. A later variant may combine this with missing digits, but that is not required for the first KP.
9. Vertical rendering is not required for first implementation.
10. Answer is the computed result C.

## Borrow Condition Contract

A generated item should satisfy at least one of these concrete cases:

```text
thousands -> hundreds -> tens -> ones borrow chain
hundreds -> tens -> ones borrow chain
```

Operational check for first implementation:

```text
A has 0 in hundreds or tens
A - B requires borrowing from a higher place through that 0
normal integer subtraction gives C
```

## Why Separate From Sub Middle Missing Digit

`sub_middle_missing_digit` targets reasoning about blanks in hundreds or tens.

This KP targets the calculation behavior of continuous borrowing through zero. It can be shown as ordinary subtraction with no blanks.

## Non-scope

```text
missing-digit equation requirement
same-place blank constraint
vertical layout
multi-step word problem
addition
```

## Acceptance Criteria For Next Implementation Task

The next implementation task should prove:

1. Generated questions are subtraction questions.
2. A is four digits.
3. B is three or four digits for QA coverage.
4. A contains zero in a borrow-chain position.
5. The item requires continuous borrow across zero.
6. Answer C is correct.
7. Worksheet and answer key generation pass.
8. HTML render path passes.
9. Existing missing-digit KPs remain unchanged.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_SUB_MIDDLE_MISSING_DIGIT_CLOSED_AND_CI_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U02_CONTINUOUS_BORROW_ZERO_SCOPE_LOCKED
DISTANCE_REDUCED     = separated continuous-borrow-zero calculation target from missing-digit topics and locked implementable PatternSpec scope
REMAINING_BLOCKERS   = ["continuous borrow zero PatternSpec not yet implemented", "main selector projection materialization deferred"]
NEXT_SHORTEST_STEP   = S43G4P1_G3AU02ContinuousBorrowZeroPatternSpecContract
```
