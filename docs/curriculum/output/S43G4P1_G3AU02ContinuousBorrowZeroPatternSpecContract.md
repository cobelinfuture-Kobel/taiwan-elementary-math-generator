# S43G4P1 G3A-U02 Continuous Borrow Zero PatternSpec Contract

## Status

```text
CONTRACT_LOCKED
```

## KP / Group / Spec

```text
kp_g3a_u02_continuous_borrow_zero
pg_g3a_u02_continuous_borrow_zero
ps_g3a_u02_continuous_borrow_zero
```

## Shape

```text
A - B = C
```

## Contract

```text
operator = subtract
A is four digits
B is three or four digits in QA coverage
A has 0 in hundreds or tens
subtraction requires borrow through the zero column
regroup count across ones/tens/hundreds >= 3
C is the computed non-negative result
no missing digit requirement
vertical layout is not required
```

## Validator Hook

```text
continuousBorrowZeroPolicy.required = true
```

## Next

```text
S43G4P2_G3AU02ContinuousBorrowZeroGeneratorImplementation
```
