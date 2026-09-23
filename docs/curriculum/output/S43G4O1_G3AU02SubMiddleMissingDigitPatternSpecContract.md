# S43G4O1 G3A-U02 Sub Middle Missing Digit PatternSpec Contract

## Status

```text
CONTRACT_LOCKED
```

## KP / Group / Spec

```text
kp_g3a_u02_sub_middle_missing_digit
pg_g3a_u02_sub_middle_missing_digit
ps_g3a_u02_sub_middle_missing_digit
```

## Question Shape

```text
A - B = C
```

## Contract

```text
operator = subtract
A is four digits
B emphasizes 3 or 4 digits
C is non-negative
A / B / C may contain □
C must contain at least one □
No two □ share the same place-value column
At least one □ must be in hundreds or tens
Answer order follows prompt left to right
Vertical layout is not required
```

## Validator Hook

The equation blank validator enforces:

```text
middlePlaceRequired = true
```

## Next

```text
S43G4O2_G3AU02SubMiddleMissingDigitGeneratorImplementation
```
