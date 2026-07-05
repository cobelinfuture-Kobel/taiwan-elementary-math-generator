# S43G4P6 G3A-U02 Continuous Borrow Zero Closeout

## Status

```text
S43G4P1_PATTERN_SPEC_CONTRACT = PASS
S43G4P2_GENERATOR_IMPLEMENTATION = PASS
S43G4P3_VALIDATOR_QA = PASS
S43G4P4_SELECTOR_PROMOTION = PASS_WITH_OVERLAY
S43G4P5_UI_PRINT_QA = PASS
S43G4P6_CLOSEOUT = PASS
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = 4fcd0ff4279cdb3fbaf97fb6dd5972fd891f0b7b
CI_TESTS = 366
CI_PASS = 366
CI_FAIL = 0
WORKING_TREE = clean
```

## Added KP

```text
kp_g3a_u02_continuous_borrow_zero
pg_g3a_u02_continuous_borrow_zero
ps_g3a_u02_continuous_borrow_zero
```

## Rule

```text
A - B = C
A is four digits
B is three or four digits in QA coverage
A contains 0 in hundreds or tens
subtraction requires continuous borrow through zero
answer is C
no missing digit requirement
```

## Implementation Notes

Used existing overlay path:

```text
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
```

Added validator helper:

```text
site/modules/curriculum/batch-a/continuous-borrow-zero-policy.js
```

## QA

```text
tests/curriculum/batch-a/g3a-u02-continuous-borrow-zero.test.js
tests/site/g3a-u02-borrowzero-ui.test.js
```

Coverage:

```text
selector exposure
generator creates continuous-borrow-through-zero subtraction
right operand covers 3 and 4 digits
validator accepts valid generated questions
validator rejects a non-zero-borrow-chain edit
worksheet, answer key, and HTML render pass
```

## Count

```text
G3A-U02 visible KP count through equation overlay: 9 -> 10
Batch A visible KP count through equation overlay: 15 -> 16
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_CONTINUOUS_BORROW_ZERO_SCOPE_LOCKED
GOAL_DISTANCE_AFTER  = D1_G3A_U02_CONTINUOUS_BORROW_ZERO_CLOSED_AND_CI_PASS
DISTANCE_REDUCED     = added continuous-borrow-through-zero subtraction KP with PatternSpec, generator, validator, selector overlay, worksheet, answer key, and HTML render QA
REMAINING_BLOCKERS   = ["main selector projection materialization deferred"]
NEXT_SHORTEST_STEP   = S43G4Q_G3AU02OverlayMaterializationDesignScan or S43G5_G3B_U01_Phase1SelectionScan
```
