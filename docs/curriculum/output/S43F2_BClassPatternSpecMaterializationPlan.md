# S43F2 — BClassPatternSpecMaterializationPlan

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F2_BClassPatternSpecMaterializationPlan
TASK_STATUS = PASS_PLAN
```

## Scope

```text
IN_SCOPE = define S43F Alpha B-class PatternSpec materialization set
OUT_OF_SCOPE = C-class implementation, D-class implementation, browser selector regeneration, mixed KP mode
```

## Alpha Selection Rules

```text
1. Must already be B-class in S43E overlay.
2. Must fit existing comparison or expression semantics.
3. Must not require algorithm-state, place-value-table, strategy-step, visual, word-problem, or reasonableness models.
4. Must remain not browser-projected in S43F2.
```

## S43F Alpha Materialization Set

```text
1. ps_g4a_u01_within_100million_compare
   sourceId = g4a_u01_4a01
   kind = comparison

2. ps_g4a_u02_3digit_by_2digit
   sourceId = g4a_u02_4a02
   kind = expression_multiply

3. ps_g4a_u04_3digit_by_2digit_exact
   sourceId = g4a_u04_4a04
   kind = expression_divide_exact

4. ps_g4a_u08_add_sub_three_terms
   sourceId = g4a_u08_4a08
   kind = expression_add_sub_mixed

5. ps_g5a_u08_left_to_right_add_sub
   sourceId = g5a_u08_5a08
   kind = expression_add_sub_mixed
```

## Blocked Rows

```text
C-class rows remain blocked until dedicated generator/validator model design.
D-class rows remain not_selectable.
```

## Gate

```text
S43F2_GATE = PASS
NEXT_SHORTEST_STEP = S43F3_BClassPatternSpecMaterialization
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_ALPHA_SCOPE_IDENTIFIED
GOAL_DISTANCE_AFTER  = D1_S43F_ALPHA_MATERIALIZATION_PLAN_READY
DISTANCE_REDUCED     = selected a bounded first B-class PatternSpec materialization set
```
