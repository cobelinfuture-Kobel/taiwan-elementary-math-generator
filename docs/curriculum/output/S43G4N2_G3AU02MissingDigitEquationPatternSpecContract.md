# S43G4N2 G3A-U02 Missing Digit Equation PatternSpec Contract

## Status

CONTRACT_LOCKED

## PatternSpecs

| KnowledgePoint | PatternGroup | PatternSpec |
|---|---|---|
| `kp_g3a_u02_add_missing_digit_equation` | `pg_g3a_u02_add_missing_digit_equation` | `ps_g3a_u02_add_missing_digit_equation` |
| `kp_g3a_u02_sub_missing_digit_equation` | `pg_g3a_u02_sub_missing_digit_equation` | `ps_g3a_u02_sub_missing_digit_equation` |

## Question Model

```json
{
  "kind": "missingDigitEquation",
  "operator": "add | subtract",
  "left": 4349,
  "right": 1011,
  "result": 5360,
  "blanks": [
    { "target": "left", "index": 1, "placeValue": 2, "digit": 3 },
    { "target": "right", "index": 3, "placeValue": 0, "digit": 1 },
    { "target": "result", "index": 2, "placeValue": 1, "digit": 6 }
  ],
  "answerOrder": "prompt_left_to_right",
  "answerText": "3,1,6"
}
```

## Validation Contract

- Equation must be mathematically correct.
- `blanks` must contain at least two entries.
- At least one blank must target result C.
- Place values across blanks must be distinct.
- `answerText` must equal the digits in prompt left-to-right order.
- `blankedDisplayText` must contain the same number of `□` as `blanks.length`.

## Next

```text
S43G4N3_G3AU02MissingDigitEquationGeneratorImplementation
```
