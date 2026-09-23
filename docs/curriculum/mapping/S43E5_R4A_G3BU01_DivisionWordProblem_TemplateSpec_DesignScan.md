# S43E5 R4A G3B-U01 Division Word Problem TemplateSpec DesignScan

```text
CURRENT_MAJOR_TASK = S43E5_G3B_U01_KPExpansion
CURRENT_SUBTASK = S43E5_R4A_G3BU01_DivisionWordProblem_TemplateSpec_DesignScan
TASK_STATUS = DESIGN_LOCKED_PENDING_OPERATOR_REVIEW
SOURCE_ID = g3b_u01_3b01
UNIT = 3B-U01 除法
```

## 1. Purpose

This task converts the uploaded G3B-U01 application-problem images into a controlled TemplateSpec design.

The design keeps the system from treating every story context as a separate KnowledgePoint.

```text
KnowledgePoint = student-facing division concept
PatternSpec = mathematical / answer-model structure
TemplateSpec = story context, vocabulary, units, and prompt wording
```

## 2. Scope Lock

```text
IN_SCOPE = [
  "G3B-U01 division word-problem semantic models",
  "UI KnowledgePoint candidates for word problems",
  "PatternSpec and answerModel contracts",
  "TemplateSpec context slots",
  "first-pass implementation task order through HTML print/PDF smoke"
]

OUT_OF_SCOPE = [
  "implementing generators in R4A",
  "adding unlimited story contexts",
  "AI-generated bulk item bank",
  "worked-solution step rendering",
  "vertical long-division layout rendering",
  "cross-unit word-problem mixing beyond existing selector support"
]
```

## 3. Source Image Classification

| Source example | Semantic model | Operation model | Answer model | Proposed PatternSpec |
|---|---|---|---|---|
| 把 36 元平均分給 3 個人，每人幾元？ | partitive_division_equal_sharing | total / groupCount | single_integer + unit | ps_g3b_u01_wp_partitive_equal_sharing |
| 買 3 條香腸花 60 元，1 條幾元？ | partitive_division_unit_rate | total / unitCount | single_integer + unit | ps_g3b_u01_wp_partitive_unit_rate |
| 把 36 個蘋果，每 3 個裝 1 盤，可以分裝幾盤？ | quotative_division_packaging_exact | total / groupSize | single_integer + groupUnit | ps_g3b_u01_wp_quotative_packaging_exact |
| 67 隻飛魚乾，每 5 隻裝 1 包，可以裝幾包？還剩幾隻？ | remainder_quotient_and_leftover | total div groupSize, total mod groupSize | quotient_remainder + two units | ps_g3b_u01_wp_remainder_packaging_leftover |
| 365 天是幾週又幾天？ | remainder_calendar_weeks_days | days div 7, days mod 7 | quotient_remainder + week/day units | ps_g3b_u01_wp_remainder_calendar_weeks_days |
| 30 個水蜜桃，每 8 個裝 1 盒，最多可以裝幾盒？ | remainder_interpretation_floor | floor(total / groupSize) | single_integer + containerUnit | ps_g3b_u01_wp_remainder_floor_max_groups |
| 30 個水蜜桃，每 8 個裝 1 盒，最少需要幾盒？ | remainder_interpretation_ceil | ceil(total / groupSize) | single_integer + containerUnit | ps_g3b_u01_wp_remainder_ceil_min_containers |
| 已做 75 個，再用 180 公分緞帶，每 9 公分做 1 個，共幾個？ | two_step_divide_then_add | existingCount + (length / unitLength) | single_integer + itemUnit | ps_g3b_u01_wp_two_step_divide_then_add |
| 103 公分繩子還不夠 21 公分，做正方形邊長幾公分？ | two_step_add_then_divide | (knownLength + missingLength) / 4 | single_integer + lengthUnit | ps_g3b_u01_wp_two_step_add_then_divide |
| 三人合買 870 元，大軍有 600 元，剩多少？ | two_step_divide_then_subtract | initialMoney - (totalCost / peopleCount) | single_integer + moneyUnit | ps_g3b_u01_wp_two_step_divide_then_subtract |
| 530 毫升牛奶，做 3 個布丁後剩 80 毫升，一個用多少？ | two_step_subtract_then_divide | (totalVolume - leftoverVolume) / itemCount | single_integer + volumeUnit | ps_g3b_u01_wp_two_step_subtract_then_divide |
```

## 4. Final UI KnowledgePoint Candidates

R4 first pass should expose five word-problem KnowledgePoints.

```text
1. kp_g3b_u01_wp_partitive_division
   displayName = 等分除：平分與單位量

2. kp_g3b_u01_wp_quotative_division
   displayName = 包含除：分裝與分組

3. kp_g3b_u01_wp_division_with_remainder
   displayName = 有餘數除法應用題

4. kp_g3b_u01_wp_remainder_interpretation
   displayName = 餘數判讀：最多與最少

5. kp_g3b_u01_wp_two_step_division
   displayName = 兩步驟除法應用題
```

These should be added beside the existing calculation KPs, not merged into them.

## 5. PatternSpec Map

### 5.1 等分除：平分與單位量

```text
kp_g3b_u01_wp_partitive_division
  -> pg_g3b_u01_wp_partitive_division
  -> ps_g3b_u01_wp_partitive_equal_sharing
  -> ps_g3b_u01_wp_partitive_unit_rate
```

### 5.2 包含除：分裝與分組

```text
kp_g3b_u01_wp_quotative_division
  -> pg_g3b_u01_wp_quotative_division
  -> ps_g3b_u01_wp_quotative_packaging_exact
  -> ps_g3b_u01_wp_quotative_grouping_exact
```

### 5.3 有餘數除法應用題

```text
kp_g3b_u01_wp_division_with_remainder
  -> pg_g3b_u01_wp_division_with_remainder
  -> ps_g3b_u01_wp_remainder_packaging_leftover
  -> ps_g3b_u01_wp_remainder_calendar_weeks_days
```

### 5.4 餘數判讀：最多與最少

```text
kp_g3b_u01_wp_remainder_interpretation
  -> pg_g3b_u01_wp_remainder_interpretation
  -> ps_g3b_u01_wp_remainder_floor_max_groups
  -> ps_g3b_u01_wp_remainder_ceil_min_containers
```

### 5.5 兩步驟除法應用題

```text
kp_g3b_u01_wp_two_step_division
  -> pg_g3b_u01_wp_two_step_division
  -> ps_g3b_u01_wp_two_step_divide_then_add
  -> ps_g3b_u01_wp_two_step_add_then_divide
  -> ps_g3b_u01_wp_two_step_divide_then_subtract
  -> ps_g3b_u01_wp_two_step_subtract_then_divide
```

## 6. TemplateSpec Schema Contract

Each word-problem PatternSpec should use context templates instead of hard-coded prompts.

```json
{
  "templateId": "tpl_g3b_u01_packaging_fruit_box_floor",
  "semanticModel": "remainder_interpretation_floor",
  "operationModel": {
    "kind": "floor_division",
    "expression": "floor(total / groupSize)"
  },
  "answerModel": {
    "shape": "single_integer",
    "unitRole": "containerUnit"
  },
  "unitModel": {
    "totalUnit": "個",
    "groupUnit": "盒",
    "answerUnit": "盒"
  },
  "slotModel": {
    "itemNoun": "水蜜桃",
    "containerNoun": "盒",
    "total": 30,
    "groupSize": 8
  },
  "promptTemplate": "有 {total} 個{itemNoun}，每 {groupSize} 個裝 1 {containerNoun}，最多可以裝幾{containerNoun}？"
}
```

Required fields:

```text
templateId
semanticModel
operationModel
answerModel
unitModel
slotModel
promptTemplate
```

## 7. First-Pass Template Count

R4 first pass should keep the template library small.

```text
partitive_division: 4 templates
quotative_division: 4 templates
division_with_remainder: 4 templates
remainder_interpretation: 4 templates
two_step_division: 4 templates
```

Total first-pass target: 20 TemplateSpecs.

## 8. Answer Model Contracts

```text
single_integer:
  answerText = value + answerUnit
  finalAnswer = value

quotient_remainder:
  answerText = quotient + quotientUnit + "又" + remainder + remainderUnit
  finalAnswer = { quotient, remainder }

floor_interpretation:
  finalAnswer = floor(total / groupSize)
  requires remainder > 0 in first pass

ceil_interpretation:
  finalAnswer = ceil(total / groupSize)
  requires remainder > 0 in first pass

two_step_single_integer:
  finalAnswer = result of operationModel
```

## 9. R4 Task Order

```text
S43E5_R4A_G3BU01_DivisionWordProblem_TemplateSpec_DesignScan
S43E5_R4B_G3BU01_WordProblemSchemaAndRegistryContract
S43E5_R4C_G3BU01_PartitiveDivisionTemplates
S43E5_R4D_G3BU01_QuotativeDivisionTemplates
S43E5_R4E_G3BU01_RemainderWordProblemTemplates
S43E5_R4F_G3BU01_RemainderInterpretationTemplates
S43E5_R4G_G3BU01_TwoStepDivisionTemplates
S43E5_R4H_G3BU01_WordProblemGeneratorValidatorIntegration
S43E5_R4I_G3BU01_WordProblemUISelectorIntegration
S43E5_R4J_G3BU01_WordProblemMixedWorksheetQA
S43E5_R4K_G3BU01_WordProblemBrowserPDFSmoke
S43E5_R4L_G3BU01_WordProblemCloseout
```

## 10. Implementation Stop Gate

R4A is design-only.

```text
STOP_GATE = BEFORE_IMPLEMENTATION
REQUIRED_OPERATOR_ACTION = approve S43E5_R4B to start schema/registry implementation
```

## 11. Distance Update

```text
GOAL_DISTANCE_BEFORE = D2_G3B_U01_WORD_PROBLEM_TEMPLATE_STRATEGY_READY
GOAL_DISTANCE_AFTER  = D2_G3B_U01_WORD_PROBLEM_TEMPLATESPEC_DESIGN_LOCKED
DISTANCE_REDUCED     = converted source image discussion into a formal TemplateSpec and R4 task order
REMAINING_BLOCKERS   = ["operator approval required before R4B implementation", "word-problem schema not implemented", "browser PDF smoke pending"]
NEXT_SHORTEST_STEP   = approve S43E5_R4B_G3BU01_WordProblemSchemaAndRegistryContract
```
