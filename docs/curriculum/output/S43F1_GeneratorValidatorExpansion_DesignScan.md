# S43F1 — GeneratorValidatorExpansion DesignScan

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F1_GeneratorValidatorExpansion_DesignScan
TASK_STATUS = PASS_DESIGNSCAN
```

## Scope

```text
IN_SCOPE = inspect S43E overlays and define the first safe generator/validator expansion path
OUT_OF_SCOPE = browser selector regeneration, mixed KP mode, production release
```

## Findings

S43E is complete at registry overlay level.

```text
S43E_STATUS = COMPLETE_13_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
```

The browser bridge already has generic PatternSpec constructors:

```text
comparisonPattern(min,max)
expressionPattern(operators,ranges,answerMax,skill,division,carryPolicy)
```

Existing supported runtime kinds:

```text
comparison
integer addition/subtraction expression
integer multiplication expression
exact integer division expression
left-to-right add/sub mixed expression
```

## S43F First-Batch Rule

Only B-class rows that fit existing generator/validator semantics may enter S43F first batch.

```text
ALLOW = numeric comparison, single-operation multiplication, exact two-operand division, left-to-right add/sub mixed
BLOCK = C-class algorithm-state rows, D-class word/visual/reasonableness rows, mixed KP selector exposure
```

## First Batch Candidate Count

```text
S43F_ALPHA_PATTERN_COUNT = 5
```

Candidates selected for S43F2 plan:

```text
ps_g4a_u01_within_100million_compare_candidate
ps_g4a_u02_3digit_by_2digit_candidate
ps_g4a_u04_3digit_by_2digit_exact_candidate
ps_g4a_u08_add_sub_three_terms_candidate
ps_g5a_u08_left_to_right_add_sub_candidate
```

## Gate

```text
S43F1_GATE = PASS
NEXT_SHORTEST_STEP = S43F2_BClassPatternSpecMaterializationPlan
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_OVERLAY_COMPLETE_BUT_GENERATOR_VALIDATOR_NOT_STARTED
GOAL_DISTANCE_AFTER  = D1_S43F_ALPHA_SCOPE_IDENTIFIED
DISTANCE_REDUCED     = converted S43E blockers into a bounded first generator/validator expansion scope
```
