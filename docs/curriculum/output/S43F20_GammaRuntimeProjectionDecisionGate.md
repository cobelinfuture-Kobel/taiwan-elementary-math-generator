# S43F20 — GammaRuntimeProjectionDecisionGate

```text
CURRENT_SUBTASK = S43F20_GammaRuntimeProjectionDecisionGate
TASK_STATUS = PASS_DECISION_GATE
```

```text
S43F20_DECISION = ALLOW_RUNTIME_PROJECTION_NEXT_STEP
ALLOW = Gamma5 only
BLOCK = selector visibility change, mixed KP mode, production release, C-class rows, D-class rows
```

```text
GAMMA5 = [
  "ps_g4a_u02_4digit_by_2digit",
  "ps_g4a_u02_2digit_by_3digit",
  "ps_g4a_u02_multiplier_10_or_100",
  "ps_g4b_u01_multiplicand_trailing_zero",
  "ps_g4b_u01_multi_digit_by_2digit"
]
```

```text
S43F20_GATE = PASS_DECISION_GATE
NEXT_SHORTEST_STEP = S43F21_GammaRuntimeProjectionPatch
GOAL_DISTANCE_AFTER = D1_S43F_GAMMA5_RUNTIME_PROJECTION_ALLOWED_NOT_APPLIED
```
