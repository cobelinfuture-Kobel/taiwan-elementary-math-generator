# S43F10 — RemainingBClassCoverageAudit

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F10_RemainingBClassCoverageAudit
TASK_STATUS = PASS_AUDIT
```

## Scope

```text
IN_SCOPE = audit S43E B-class rows remaining after Alpha5 runtime projection
OUT_OF_SCOPE = runtime patch, selector exposure, mixed KP mode, production release
```

## Audit Summary

```text
S43E_B_CLASS_TOTAL = 31
S43F_ALPHA5_PROJECTED = 5
S43F_REMAINING_B_CLASS = 26
```

## Alpha5 Already Projected

```text
kp_g4a_u01_within_100million_compare
kp_g4a_u02_3digit_by_2digit
kp_g4a_u04_3digit_by_2digit_exact
kp_g4a_u08_add_sub_three_terms
kp_g5a_u08_left_to_right_add_sub
```

## Remaining B-class Rows

```text
G3A-U03:
- kp_g3a_u03_10_multiple_by_1digit
- kp_g3a_u03_3digit_by_1digit
- kp_g3a_u03_consecutive_multiplication_two_step

G3A-U06:
- kp_g3a_u06_divisibility_exact_check

G3B-U01:
- kp_g3b_u01_2digit_by_1digit_regroup_tens
- kp_g3b_u01_divide_then_add
- kp_g3b_u01_add_then_divide
- kp_g3b_u01_divide_then_subtract
- kp_g3b_u01_subtract_then_divide

G3B-U04:
- kp_g3b_u04_add_then_divide
- kp_g3b_u04_subtract_then_divide
- kp_g3b_u04_divide_then_add
- kp_g3b_u04_divide_then_subtract

G3B-U08:
- kp_g3b_u08_division_check_by_multiplication
- kp_g3b_u08_multiplication_check_by_division

G4A-U01:
- kp_g4a_u01_large_number_vertical_calculation
- kp_g4a_u01_large_number_add_sub

G4A-U02:
- kp_g4a_u02_4digit_by_2digit
- kp_g4a_u02_2digit_by_3digit
- kp_g4a_u02_multiplier_10_or_100

G4A-U04:
- kp_g4a_u04_4digit_by_2digit_exact

G4A-U08:
- kp_g4a_u08_multiply_divide_two_step

G4B-U01:
- kp_g4b_u01_multiplicand_trailing_zero
- kp_g4b_u01_multi_digit_by_2digit
- kp_g4b_u01_multi_digit_by_3digit
- kp_g4b_u01_multi_digit_division_exact
```

## Beta Candidate Rule

```text
Prefer rows that use already-supported expression/comparison generator shapes.
Avoid rows that require quotient-place, missing-digit, word problem, visual, or semantic explanation models.
Keep selector visibility unchanged.
```

## Suggested Beta Batch

```text
S43F_BETA5 = [
  "kp_g3a_u03_10_multiple_by_1digit",
  "kp_g3a_u03_3digit_by_1digit",
  "kp_g3a_u03_consecutive_multiplication_two_step",
  "kp_g3a_u06_divisibility_exact_check",
  "kp_g3b_u01_2digit_by_1digit_regroup_tens"
]
```

## Gate

```text
S43F10_GATE = PASS_AUDIT
NEXT_SHORTEST_STEP = S43F11_BetaPatternSpecMaterializationPlan
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_ALPHA_RUNTIME_PROJECTED_SELECTOR_GUARD_PASS
GOAL_DISTANCE_AFTER = D1_S43F_REMAINING_B_CLASS_AUDITED
DISTANCE_REDUCED = converted remaining B-class scope from unknown to 26-row audited backlog with a bounded Beta5 candidate set
```
