# S43G4N G3A-U02 Missing Digit Add/Sub Closeout

## Status

```text
S43G4H_DESIGNSCAN = PASS
S43G4I_PATTERNSPEC_CONTRACT = PASS
S43G4J_GENERATOR_IMPLEMENTATION = PASS
S43G4K_VALIDATOR_QA = PASS
S43G4L_SELECTOR_PROMOTION = PASS
S43G4M_UI_PRINT_QA = PASS
S43G4N_CLOSEOUT = PASS
```

## CI Evidence

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = 8c0c847c81666a9872f50925594cd0cca6c13ba3
CI_TESTS = 351
CI_PASS = 351
CI_FAIL = 0
WORKING_TREE = clean
```

## Added KnowledgePoints

| KnowledgePoint | PatternGroup | PatternSpec | Status |
|---|---|---|---|
| `kp_g3a_u02_add_missing_digit_operand` | `pg_g3a_u02_add_missing_digit_operand` | `ps_g3a_u02_add_missing_digit_operand` | PASS |
| `kp_g3a_u02_sub_missing_digit_operand` | `pg_g3a_u02_sub_missing_digit_operand` | `ps_g3a_u02_sub_missing_digit_operand` | PASS |

## Supported Question Shape

```text
A + B = C
A - B = C
```

Rules:

- exactly one digit in operand A or B is replaced by `□`
- result C is not hidden
- no vertical-column rendering
- answer is a single digit
- validator checks the hidden digit and restored equation

## Selector Count Update

```text
G3A-U02 visible KP count: 4 -> 6
Batch A visible KP count: 10 -> 12
```

## Regression Coverage

Added:

```text
tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
tests/site/g3a-u02-missing-digit-ui.test.js
```

Coverage:

- selector exposure for both missing-digit KPs
- add/sub generator produces `missingDigit` questions
- right operand digit coverage includes 1 / 2 / 3 / 4 digits
- validator rejects wrong hidden digit
- same-unit mixed resolver accepts the two new KPs
- UI state builds worksheet document
- answer key and HTML render path pass

## Non-scope Remaining

```text
S43G4O_G3AU02SubMiddleMissingDigitDesignScan
S43G4P_G3AU02ContinuousBorrowZeroDesignScan
```

These are intentionally not implemented in S43G4H-N.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_CORE_AND_RENDERER_QUALITY_PATCHED_AND_CI_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U02_MISSING_DIGIT_ADD_SUB_CLOSED_AND_CI_PASS
DISTANCE_REDUCED     = added two supplementary missing-digit calculation KPs with generator, validator, selector, worksheet, answer key, and HTML render QA
REMAINING_BLOCKERS   = [
  "subtraction middle-place missing digit not yet designed",
  "continuous borrow with zero not yet designed",
  "formal registry materialization still deferred"
]
NEXT_SHORTEST_STEP   = S43G4O_G3AU02SubMiddleMissingDigitDesignScan or S43G5_G3B_U01_Phase1SelectionScan
```
