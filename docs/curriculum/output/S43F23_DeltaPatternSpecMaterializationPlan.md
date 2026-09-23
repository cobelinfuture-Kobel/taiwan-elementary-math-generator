# S43F23 — DeltaPatternSpecMaterializationPlan

```text
CURRENT_SUBTASK = S43F23_DeltaPatternSpecMaterializationPlan
TASK_STATUS = PASS_PLAN
```

## Delta5 Selection

```text
Selection rule = existing multiply or exactDivide runtime shape only.
Deferred = two-step divide/add/subtract, C-class, D-class, mixed selector.
```

```text
DELTA5 = [
  "kp_g4a_u04_4digit_by_2digit_exact",
  "kp_g4b_u01_multi_digit_by_3digit",
  "kp_g4b_u01_multi_digit_division_exact",
  "kp_g3b_u08_division_check_by_multiplication",
  "kp_g3b_u08_multiplication_check_by_division"
]
```

## Planned PatternSpecs

```text
ps_g4a_u04_4digit_by_2digit_exact = exactDivide, ranges [[1000,9999],[10,99]], answerMax 999
ps_g4b_u01_multi_digit_by_3digit = multiply, ranges [[100,9999],[100,999]], answerMax 9989001
ps_g4b_u01_multi_digit_division_exact = exactDivide, ranges [[100,9999],[10,99]], answerMax 999
ps_g3b_u08_division_check_by_multiplication = exactDivide, ranges [[10,99],[2,9]], answerMax 99
ps_g3b_u08_multiplication_check_by_division = multiply, ranges [[10,99],[2,9]], answerMax 891
```

```text
S43F23_GATE = PASS_PLAN
NEXT_SHORTEST_STEP = S43F24_DeltaPatternSpecMaterialization
GOAL_DISTANCE_AFTER = D1_S43F_DELTA5_MATERIALIZATION_PLAN_READY
```
