# S43G4N1 G3A-U02 Missing Digit Equation Clone DesignScan

## Scope

Keep the prior operand-only missing digit KPs unchanged and add a new equation-level pair.

Prior KPs retained:

```text
kp_g3a_u02_add_missing_digit_operand
kp_g3a_u02_sub_missing_digit_operand
```

New KPs:

```text
kp_g3a_u02_add_missing_digit_equation
kp_g3a_u02_sub_missing_digit_equation
```

## Locked Rules

```text
A + B = C
A - B = C
```

- A / B / C may contain blanks.
- C must contain at least one blank.
- No two blanks may use the same place-value column.
- The answer is multiple digits in prompt left-to-right order.
- Vertical layout is not required in this implementation.

## Non-scope

- Do not modify operand-only missing digit KPs.
- Do not implement dedicated middle-place subtraction topic.
- Do not implement dedicated continuous-borrow-zero topic.

## Next

```text
S43G4N2_G3AU02MissingDigitEquationPatternSpecContract
```
