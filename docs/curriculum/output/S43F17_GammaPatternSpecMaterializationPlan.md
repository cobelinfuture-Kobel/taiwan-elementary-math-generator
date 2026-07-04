# S43F17 — GammaPatternSpecMaterializationPlan

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F17_GammaPatternSpecMaterializationPlan
TASK_STATUS = PASS_PLAN
```

## Scope

```text
IN_SCOPE = plan the next five low-risk B-class PatternSpec contracts after Alpha5 and Beta5
OUT_OF_SCOPE = runtime patch, selector exposure, mixed KP mode, production release
```

## Selection Rule

```text
Prefer single-operation multiplication rows that map directly to existing expressionPattern multiplication support.
Defer two-step divide/add/subtract rows and semantic C/D rows.
```

## Gamma5 PatternSpec Plan

```text
1. kp_g4a_u02_4digit_by_2digit
   patternSpecId = ps_g4a_u02_4digit_by_2digit
   sourceId = g4a_u02_4a02
   kind = expression_multiply
   ranges = [[1000, 9999], [10, 99]]
   answerMax = 989901

2. kp_g4a_u02_2digit_by_3digit
   patternSpecId = ps_g4a_u02_2digit_by_3digit
   sourceId = g4a_u02_4a02
   kind = expression_multiply
   ranges = [[10, 99], [100, 999]]
   answerMax = 98901

3. kp_g4a_u02_multiplier_10_or_100
   patternSpecId = ps_g4a_u02_multiplier_10_or_100
   sourceId = g4a_u02_4a02
   kind = expression_multiply
   ranges = [[10, 999], [10, 100]]
   answerMax = 99900

4. kp_g4b_u01_multiplicand_trailing_zero
   patternSpecId = ps_g4b_u01_multiplicand_trailing_zero
   sourceId = g4b_u01_4b01
   kind = expression_multiply
   ranges = [[10, 990], [2, 9]]
   answerMax = 8910

5. kp_g4b_u01_multi_digit_by_2digit
   patternSpecId = ps_g4b_u01_multi_digit_by_2digit
   sourceId = g4b_u01_4b01
   kind = expression_multiply
   ranges = [[100, 9999], [10, 99]]
   answerMax = 989901
```

## Gate

```text
S43F17_GATE = PASS_PLAN
NEXT_SHORTEST_STEP = S43F18_GammaPatternSpecMaterialization
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_BETA5_RUNTIME_PROJECTED_TEST_PASS
GOAL_DISTANCE_AFTER = D1_S43F_GAMMA5_MATERIALIZATION_PLAN_READY
DISTANCE_REDUCED = selected five low-risk multiplication B-class rows for the next runtime-supported materialization batch
```
