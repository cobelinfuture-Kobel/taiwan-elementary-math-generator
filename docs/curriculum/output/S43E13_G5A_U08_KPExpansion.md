# S43E13 — G5A-U08 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E13_G5A_U08_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
```

## Scope

```text
IN_SCOPE = unit registry expansion overlay
OUT_OF_SCOPE = runtime changes, browser selector regeneration, mixed KP mode, production release
```

## Runtime Evidence

```text
g5a_u08_5a08 → ps_g5a_u08_repeated_subtraction
```

Existing runtime path: repeated-subtraction integer mixed expression.

## Artifact

```text
data/curriculum/registry/unit_expansions/S43E13_G5A_U08_KPExpansion.json
```

## Coverage

```text
knowledgePointCount = 11
supportClassA = 1
supportClassB = 1
supportClassC = 6
supportClassD = 3
selectableNow = 0
hiddenRows = 8
notSelectableRows = 3
runtimeCodeChanged = false
browserProjectionChanged = false
```

A-class:

```text
kp_g5a_u08_repeated_subtraction
```

B-class:

```text
kp_g5a_u08_left_to_right_add_sub
```

C-class:

```text
kp_g5a_u08_multiply_divide_before_add_sub
kp_g5a_u08_parentheses_priority
kp_g5a_u08_nested_parentheses
kp_g5a_u08_mixed_four_ops
kp_g5a_u08_simplification_strategy
kp_g5a_u08_missing_value_equation
```

D-class:

```text
kp_g5a_u08_word_problem_four_ops
kp_g5a_u08_answer_reasonableness
kp_g5a_u08_multi_step_context
```

## Gate

```text
S43E13_GATE = PASS
NPM_TEST = NOT_RUN_THIS_STEP
REASON = registry overlay and closeout documentation only
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_12_OF_13_UNITS_COVERED
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_13_OF_13_UNITS_COVERED
DISTANCE_REDUCED     = completed Batch A unit-level KnowledgePoint expansion overlay coverage
S43E_PROGRESS = 13_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
```

## Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "S43E overlay coverage is complete but not browser-projected",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43F_GeneratorValidatorExpansion_DesignScan
```

## Closeout

```text
TASK = S43E13_G5A_U08_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_STATUS = COMPLETE_13_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43F_GeneratorValidatorExpansion_DesignScan
```
