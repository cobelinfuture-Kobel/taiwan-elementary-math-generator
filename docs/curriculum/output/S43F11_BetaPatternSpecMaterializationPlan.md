# S43F11 — BetaPatternSpecMaterializationPlan

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43F11_BetaPatternSpecMaterializationPlan
TASK_STATUS = PASS_PLAN
```

## Scope

```text
IN_SCOPE = plan the next five B-class PatternSpec contracts
OUT_OF_SCOPE = write runtime source-pattern-index, selector exposure, mixed KP mode, production release
```

## Input

```text
S43F10_GATE = PASS_AUDIT
REMAINING_B_CLASS = 26
BETA_BATCH_SIZE = 5
```

## Beta5 PatternSpec Plan

```text
1. kp_g3a_u03_10_multiple_by_1digit
   patternSpecId = ps_g3a_u03_10_multiple_by_1digit
   sourceId = g3a_u03_3a03
   kind = expression
   operators = [[MULTIPLY]]
   ranges = [[10, 90], [2, 9]]
   answerMax = 810
   validatorContract = numeric_integer_answer

2. kp_g3a_u03_3digit_by_1digit
   patternSpecId = ps_g3a_u03_3digit_by_1digit
   sourceId = g3a_u03_3a03
   kind = expression
   operators = [[MULTIPLY]]
   ranges = [[100, 999], [2, 9]]
   answerMax = 8991
   validatorContract = numeric_integer_answer

3. kp_g3a_u03_consecutive_multiplication_two_step
   patternSpecId = ps_g3a_u03_consecutive_multiplication_two_step
   sourceId = g3a_u03_3a03
   kind = expression
   operators = [[MULTIPLY], [MULTIPLY]]
   ranges = [[2, 9], [2, 9], [2, 9]]
   answerMax = 729
   validatorContract = numeric_integer_answer

4. kp_g3a_u06_divisibility_exact_check
   patternSpecId = ps_g3a_u06_divisibility_exact_check
   sourceId = g3a_u06_3a06
   kind = expression
   operators = [[DIVIDE]]
   ranges = [[10, 99], [2, 9]]
   division.requireExactQuotient = true
   answerMax = 99
   validatorContract = numeric_integer_answer_exact_division

5. kp_g3b_u01_2digit_by_1digit_regroup_tens
   patternSpecId = ps_g3b_u01_2digit_by_1digit_regroup_tens
   sourceId = g3b_u01_3b01
   kind = expression
   operators = [[DIVIDE]]
   ranges = [[10, 99], [2, 9]]
   division.requireExactQuotient = true
   answerMax = 99
   validatorContract = numeric_integer_answer_exact_division
```

## Guardrails

```text
No C-class row is materialized in this plan.
No D-class row is materialized in this plan.
No selector visibility policy is changed.
No runtime projection is changed in this plan.
```

## Gate

```text
S43F11_GATE = PASS_PLAN
NEXT_SHORTEST_STEP = S43F12_BetaPatternSpecMaterialization
```

## Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_S43F_REMAINING_B_CLASS_AUDITED
GOAL_DISTANCE_AFTER = D1_S43F_BETA5_MATERIALIZATION_PLAN_READY
DISTANCE_REDUCED = selected and specified five low-risk B-class PatternSpec contracts for the next materialization batch
```
