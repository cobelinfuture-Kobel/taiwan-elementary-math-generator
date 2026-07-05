# S43G4O6 G3A-U02 Sub Middle Missing Digit Closeout

## Status

```text
S43G4O1_PATTERN_SPEC_CONTRACT = PASS
S43G4O2_GENERATOR_IMPLEMENTATION = PASS
S43G4O3_VALIDATOR_QA = PASS
S43G4O4_SELECTOR_PROMOTION = PASS_WITH_OVERLAY
S43G4O5_UI_PRINT_QA = PASS
S43G4O6_CLOSEOUT = PASS
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = ae3fef30e91db56dcedbec09e425ebd6c6d127c7
CI_TESTS = 361
CI_PASS = 361
CI_FAIL = 0
WORKING_TREE = clean
```

## Added KP

```text
kp_g3a_u02_sub_middle_missing_digit
pg_g3a_u02_sub_middle_missing_digit
ps_g3a_u02_sub_middle_missing_digit
```

## Rule

```text
A - B = C
A is four digits
C contains at least one □
At least one □ is in hundreds or tens
No two □ share the same place-value column
Answer order follows prompt order
```

## Implementation Notes

Used overlays to avoid blocked main projection writes:

```text
site/modules/curriculum/batch-a/source-pattern-submiddle-extension.js
site/modules/curriculum/registry/batch-a-selector-equation-extension.js
```

Generator and validator now read the submiddle source overlay.

## QA

```text
tests/curriculum/batch-a/g3a-u02-sub-middle-missing-digit.test.js
tests/site/g3a-u02-submid-ui.test.js
```

Coverage:

```text
selector exposure
generator produces subtraction middle-place blanks
validator accepts valid generated questions
validator rejects a no-middle-place manual question
worksheet, answer key, and HTML render pass
```

## Count

```text
G3A-U02 visible KP count through equation overlay: 8 -> 9
Batch A visible KP count through equation overlay: 14 -> 15
```

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_SUB_MIDDLE_MISSING_DIGIT_SCOPE_LOCKED
GOAL_DISTANCE_AFTER  = D1_G3A_U02_SUB_MIDDLE_MISSING_DIGIT_CLOSED_AND_CI_PASS
DISTANCE_REDUCED     = added subtraction middle-place missing digit KP with PatternSpec, generator, validator, selector overlay, worksheet, answer key, and HTML render QA
REMAINING_BLOCKERS   = ["main selector projection materialization deferred", "continuous borrow with zero not yet designed"]
NEXT_SHORTEST_STEP   = S43G4P_G3AU02ContinuousBorrowZeroDesignScan or S43G5_G3B_U01_Phase1SelectionScan
```
