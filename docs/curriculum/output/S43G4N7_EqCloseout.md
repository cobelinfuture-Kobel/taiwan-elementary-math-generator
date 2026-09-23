# S43G4N7 Closeout

```text
STATUS = PASS
CI_SHA = aa978ff221caa45ff6a21781d02534c74a865997
CI_TESTS = 356
CI_PASS = 356
CI_FAIL = 0
WORKING_TREE = clean
```

Added:

```text
kp_g3a_u02_add_missing_digit_equation
kp_g3a_u02_sub_missing_digit_equation
```

Rule:

```text
A+B=C / A-B=C
C has at least one square placeholder
A/B/C placeholders cannot share the same place-value column
Answer digits follow prompt order
```

QA:

```text
tests/curriculum/batch-a/g3a-u02-equation-blank.test.js
tests/site/g3a-u02-eqblank-ui.test.js
```

Distance:

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_MISSING_DIGIT_ADD_SUB_CLOSED_AND_CI_PASS
GOAL_DISTANCE_AFTER  = D1_G3A_U02_MISSING_DIGIT_EQUATION_CLOSED_AND_CI_PASS
DISTANCE_REDUCED     = added equation-level missing digit add/sub path
REMAINING_BLOCKERS   = ["main selector projection materialization deferred", "middle-place subtraction and zero-borrow topics remain separate"]
NEXT_SHORTEST_STEP   = S43G4O_G3AU02SubMiddleMissingDigitDesignScan or S43G5_G3B_U01_Phase1SelectionScan
```
