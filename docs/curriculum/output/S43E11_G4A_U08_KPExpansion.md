# S43E11 — G4A-U08 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E11_G4A_U08_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
```

## 1. Scope Lock

In scope:

```text
- Record G4A-U08 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
```

Out of scope:

```text
- Browser selector regeneration
- New generator implementation
- New validator implementation
- Mixed KP mode
- Production release
```

## 2. Source Evidence

Runtime source-pattern index before this task:

```text
g4a_u08_4a08 → ps_g4a_u08_left_to_right_add_sub
```

The existing runtime PatternSpec is an integer add/sub mixed expression.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E11_G4A_U08_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. KnowledgePoint Coverage

```text
knowledgePointCount = 11
supportClassA = 1
supportClassB = 2
supportClassC = 5
supportClassD = 3
selectableNow = 0
hiddenRows = 8
notSelectableRows = 3
```

A-class:

```text
kp_g4a_u08_left_to_right_add_sub
```

B-class:

```text
kp_g4a_u08_add_sub_three_terms
kp_g4a_u08_multiply_divide_two_step
```

C-class:

```text
kp_g4a_u08_order_priority
kp_g4a_u08_parentheses_priority
kp_g4a_u08_mixed_four_ops
kp_g4a_u08_decomposition_strategy
kp_g4a_u08_missing_value
```

D-class:

```text
kp_g4a_u08_two_step_word_problem
kp_g4a_u08_bar_model
kp_g4a_u08_answer_reasonableness
```

## 5. Gate Check

```text
S43E11_GATE = PASS
RUNTIME_CODE_CHANGED = false
BROWSER_PROJECTION_CHANGED = false
NPM_TEST = NOT_RUN_THIS_STEP
```

## 6. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_U02_U04_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_U02_U04_U08_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G4A-U08 integer mixed-operations KnowledgePoint coverage while preserving selector safety
S43E_PROGRESS = 11_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
```

## 7. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G4A-U08 B-class rows need PatternSpec materialization before exposure",
  "G4A-U08 C-class rows require generator / validator implementation before exposure",
  "G4A-U08 D-class rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E11",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E12–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 8. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E12_G4B_U01_KPExpansion
```

## 9. Closeout

```text
TASK = S43E11_G4A_U08_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
NEXT = S43E12_G4B_U01_KPExpansion
```
