# S43G4E G3A-U02 Core Quality Fix — PASS

## Result

```text
S43G4E_STATUS = PASS_CI_SYNCED_AND_CLEAN
CI_TESTS = 344
CI_PASS = 344
CI_FAIL = 0
WORKING_TREE = clean
CI_SHA = a97fc52ad8bb4dd038ceb2b9f86995e6f7bc0867
```

## Fixed Scope

- G3A-U02 addition now uses deterministic operands for at least two carries.
- G3A-U02 subtraction now uses deterministic operands for at least two regroups.
- G3A-U02 right operand digit coverage now covers 1 / 2 / 3 / 4 digits.
- G3A-U02 rounding prompts explicitly say nearest thousand and include boundary coverage.
- G3A-U02 context estimation uses Chinese word-problem prompts.
- Stale carry-policy tests now expect `at_least_two_carries`.
- G4A-U01 large-number expression source coverage was restored after CI exposed one remaining regression.

## Non-Scope Moved Forward

```text
NEXT = S43G4F_AnswerKeyAndFillerCellRendererPolish
```

S43G4F remains renderer-only:

1. answer key duplicate display
2. extra filler cells after generated questions

## Distance

```text
GOAL_DISTANCE_BEFORE = D1_G3A_U02_4KP_CLOSED_BUT_PDF_QUALITY_GAPS_FOUND
GOAL_DISTANCE_AFTER  = D1_G3A_U02_CORE_MATH_QUALITY_PATCHED_AND_CI_PASS
DISTANCE_REDUCED     = G3A-U02 core mathematical quality bugs fixed and regression protected
REMAINING_BLOCKERS   = ["answer key duplicate display", "extra filler cells in renderer"]
NEXT_SHORTEST_STEP   = S43G4F_AnswerKeyAndFillerCellRendererPolish
```
