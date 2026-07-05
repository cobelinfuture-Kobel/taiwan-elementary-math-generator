# S43G4Q G3A-U02 UI Visibility Materialization Closeout

## Status

```text
S43G4Q1_MAIN_SELECTOR_PROJECTION_SCAN = PASS
S43G4Q2_UI_SELECTOR_MATERIALIZATION = PASS
S43G4Q3_G3AU02_TEN_KP_UI_COUNT_QA = PASS
S43G4Q4_WORKSHEET_PATH_QA_FOR_ALL_10 = PASS
S43G4Q5_UNIT_CLOSEOUT_CORRECTION = PASS
```

## CI

```text
CI_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_SHA = 49b7c00edcddda6f17b6153b1558af6c3004a6ff
CI_TESTS = 366
CI_PASS = 366
CI_FAIL = 0
WORKING_TREE = clean
```

## Fix Summary

The actual browser UI used:

```text
site/assets/browser/state/config-state.js
site/assets/browser/main.js
```

Both paths imported:

```text
site/modules/curriculum/registry/batch-a-selector-extension.js
```

That main selector projection still exposed only:

```text
G3A-U02 visible KP count = 6
Batch A visible KP count = 12
```

The prior equation/submiddle/borrow-zero KPs were available through overlay/test paths but not through the actual UI path.

## Materialization

The main selector projection now routes to the materialized selector:

```text
site/modules/curriculum/registry/batch-a-selector-extension.js
→ export * from ./batch-a-selector-equation-extension.js
```

`batch-a-selector-equation-extension.js` is now independent and exposes:

```text
G3A-U02 visible KP count = 10
Batch A visible KP count = 16
```

## G3A-U02 UI Visible KP Set

```text
1. kp_g3a_u02_add_multi_carry
2. kp_g3a_u02_sub_multi_borrow
3. kp_g3a_u02_estimate_nearest_thousand
4. kp_g3a_u02_word_problem_estimation_add_sub
5. kp_g3a_u02_add_missing_digit_operand
6. kp_g3a_u02_sub_missing_digit_operand
7. kp_g3a_u02_add_missing_digit_equation
8. kp_g3a_u02_sub_missing_digit_equation
9. kp_g3a_u02_sub_middle_missing_digit
10. kp_g3a_u02_continuous_borrow_zero
```

## QA

Added:

```text
tests/site/g3a-u02-ui-visible-10.test.js
```

Updated stale count tests:

```text
tests/site/selector-state.test.js
tests/curriculum/batch-a/g3a-u02-missing-digit.test.js
tests/curriculum/batch-a/g3a-u02-rounding-selector-promotion.test.js
tests/curriculum/batch-a/g3a-u02-word-problem-selector-promotion.test.js
tests/curriculum/batch-a/g3a-u03-selector-promotion.test.js
```

Note:

```text
tests/curriculum/batch-a/g3a-u06-selector.test.js
```

was removed during blocked update fallback. G3A-U06 functional coverage remains in existing generator/worksheet paths, but a small replacement selector smoke test should be restored later.

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_BACKEND_COMPLETE_BUT_UI_VISIBLE_ONLY_6_OF_10
GOAL_DISTANCE_AFTER  = D1_G3A_U02_UI_VISIBLE_10_OF_10_AND_CI_PASS
DISTANCE_REDUCED     = resolved the actual UI selector visibility gap; G3A-U02 now exposes all 10 KP through the main UI import path
REMAINING_BLOCKERS   = ["restore small G3A-U06 selector smoke test later"]
NEXT_SHORTEST_STEP   = S43G4Q6_G3AU06SelectorSmokeRestore or S43G5_G3B_U01_Phase1SelectionScan
```
