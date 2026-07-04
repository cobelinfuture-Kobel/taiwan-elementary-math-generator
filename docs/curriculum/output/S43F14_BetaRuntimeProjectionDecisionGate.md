# S43F14 — BetaRuntimeProjectionDecisionGate

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F14_BetaRuntimeProjectionDecisionGate
TASK_STATUS = PASS_DECISION_GATE
```

## Decision

```text
S43F14_DECISION = ALLOW_RUNTIME_PROJECTION_NEXT_STEP
```

## Reason

```text
Beta5 contracts are materialized.
Beta5 generator support maps to existing expressionPattern shapes.
Beta5 validator support maps to existing numeric integer answer contracts.
No C-class or D-class row is included.
Selector visibility policy does not need to change.
```

## Projection Allowlist

```text
ps_g3a_u03_10_multiple_by_1digit
ps_g3a_u03_3digit_by_1digit
ps_g3a_u03_consecutive_multiplication_two_step
ps_g3a_u06_divisibility_exact_check
ps_g3b_u01_2digit_by_1digit_regroup_tens
```

## Projection Limits

```text
ALLOW = add only Beta5 PatternSpecs to runtime source-pattern-index.js
BLOCK = selector visibility change
BLOCK = mixed KP mode
BLOCK = production release
BLOCK = C-class and D-class rows
```

## Gate

```text
S43F14_GATE = PASS_DECISION_GATE
NEXT_SHORTEST_STEP = S43F15_BetaRuntimeProjectionPatch
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_BETA5_GENERATOR_VALIDATOR_SUPPORT_CONFIRMED
GOAL_DISTANCE_AFTER = D1_S43F_BETA5_RUNTIME_PROJECTION_ALLOWED_NOT_APPLIED
DISTANCE_REDUCED = cleared the runtime projection gate for five Beta PatternSpecs
```
