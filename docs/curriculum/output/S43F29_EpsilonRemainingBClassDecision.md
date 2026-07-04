# S43F29 Epsilon Remaining B-class Decision

```text
TASK_STATUS = PASS_DECISION_GATE
```

## Decision

```text
SAFE_REMAINING_RUNTIME_PROJECTION = Epsilon2 only
DEFERRED_REMAINING_B_CLASS = 9
```

## Reason

Current exact-division generation is only guaranteed for two-operand division. Two-step rows involving divide/add/subtract need a dedicated exact-intermediate generator model before runtime projection.

## Epsilon2 Allowed

```text
kp_g4a_u01_large_number_vertical_calculation
kp_g4a_u01_large_number_add_sub
```

## Deferred

```text
kp_g3b_u01_divide_then_add
kp_g3b_u01_add_then_divide
kp_g3b_u01_divide_then_subtract
kp_g3b_u01_subtract_then_divide
kp_g3b_u04_add_then_divide
kp_g3b_u04_subtract_then_divide
kp_g3b_u04_divide_then_add
kp_g3b_u04_divide_then_subtract
kp_g4a_u08_multiply_divide_two_step
```

```text
S43F29_GATE = PASS_DECISION_GATE
NEXT_SHORTEST_STEP = S43F30_EpsilonPatternSpecMaterializationPlan
GOAL_DISTANCE_AFTER = D1_S43F_REMAINING_B_CLASS_SPLIT_SAFE2_DEFER9
```
