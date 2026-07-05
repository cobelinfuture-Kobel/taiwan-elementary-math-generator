# S43G4I G3A-U02 Missing Digit PatternSpec Contract

## Status

CONTRACT_LOCKED

## KnowledgePoints

| KnowledgePoint | Display | PatternGroup | PatternSpec |
|---|---|---|---|
| `kp_g3a_u02_add_missing_digit_operand` | 加法缺位填空 | `pg_g3a_u02_add_missing_digit_operand` | `ps_g3a_u02_add_missing_digit_operand` |
| `kp_g3a_u02_sub_missing_digit_operand` | 減法缺位填空 | `pg_g3a_u02_sub_missing_digit_operand` | `ps_g3a_u02_sub_missing_digit_operand` |

## Question Model

```json
{
  "kind": "missingDigit",
  "operator": "add | subtract",
  "left": 3948,
  "right": 2576,
  "result": 6524,
  "missingOperand": "left | right",
  "missingIndex": 1,
  "missingDigit": 9,
  "displayText": "3948 + 2576 = 6524",
  "blankedDisplayText": "3□48 + 2576 = 6524",
  "answerText": "9",
  "finalAnswer": 9
}
```

## Validation Contract

A valid missing-digit question must satisfy:

1. `kind = missingDigit`.
2. `operator` is `add` or `subtract`.
3. `left`, `right`, and `result` are safe integers.
4. `missingOperand` is `left` or `right`.
5. `missingDigit` is an integer digit from 0 to 9.
6. `answerText === String(missingDigit)`.
7. `finalAnswer === missingDigit`.
8. Replacing `□` with `missingDigit` restores the equation.
9. The visible prompt contains exactly one `□`.

## Generation Contract

Addition:

```text
left + right = result
left is 4 digits
right covers 1 / 2 / 3 / 4 digits by sequence
hide one non-leading digit from left or right when possible
```

Subtraction:

```text
left - right = result
left is 4 digits
right covers 1 / 2 / 3 / 4 digits by sequence
result >= 0
hide one non-leading digit from left or right when possible
```

## Non-scope

- Vertical layout
- Missing result digit
- Multiple hidden digits
- Dedicated middle-place subtraction
- Dedicated continuous-borrow-zero topic

## Next

```text
S43G4J_G3AU02MissingDigitGeneratorImplementation
```
