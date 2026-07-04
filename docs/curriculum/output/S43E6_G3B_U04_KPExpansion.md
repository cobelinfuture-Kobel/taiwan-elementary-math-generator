# S43E6 — G3B-U04 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E6_G3B_U04_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G3B-U04 two-step calculation KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G3B-U04 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G3B-U04 rows hidden or not_selectable
```

Out of scope:

```text
- Browser selector regeneration
- New generator implementation
- New validator implementation
- Same-unit mixed KP mode
- Cross-unit mixed KP mode
- Other Batch A units
- Production release
```

## 2. Source Evidence

The S43E task sequence requires S43E6 after S43E1 through S43E5.

G3B-U04 visible KnowledgePoints were derived from the manual source summary for `g3b_u04_3b04`:

```text
- 先加再除
- 先減再除
- 先除再加
- 先除再減
- 連續乘法
- 倍數問題
- 線段圖輔助兩步驟應用題
- 平均分後再加減
- 分裝後再加減
- 乘法情境：排數、箱數、盒數、組數
- 倍數關係鏈：A 是 B 的幾倍
- 多層倍數推理
```

Existing runtime source-pattern index before this task:

```text
g3b_u04_3b04 → ps_g3b_u04_consecutive_multiplication
```

The existing runtime PatternSpec is a two-step consecutive multiplication expression.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E6_G3B_U04_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G3B-U04 KnowledgePoint Coverage

S43E6 records 12 G3B-U04 KnowledgePoints:

```text
A-class:
1. kp_g3b_u04_consecutive_multiplication

B-class:
2. kp_g3b_u04_add_then_divide
3. kp_g3b_u04_subtract_then_divide
4. kp_g3b_u04_divide_then_add
5. kp_g3b_u04_divide_then_subtract

C-class:
6. kp_g3b_u04_basic_multiplicative_comparison
7. kp_g3b_u04_multiplicative_relationship_chain

D-class:
8. kp_g3b_u04_line_segment_two_step_word_problem
9. kp_g3b_u04_equal_sharing_then_add_subtract
10. kp_g3b_u04_packaging_then_add_subtract
11. kp_g3b_u04_multiplication_context_rows_boxes_groups
12. kp_g3b_u04_multi_layer_multiplicative_reasoning
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 4
supportClassC = 2
supportClassD = 5
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing expression generator / validator model should be able to support the numeric two-step expression once materialized.

C-class means a relationship or multiplicative-comparison generator / validator model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 7
notSelectableRows = 5
```

No G3B-U04 KnowledgePoint is exposed to HTML selector in S43E6.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E6_GATE = PASS
```

Checks:

```text
PASS — G3B-U04 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g3b_u04_consecutive_multiplication is linked to an A-class KP
PASS — B-class rows have candidate PatternSpec IDs and existing-generator classification
PASS — C-class rows have explicit implementation blockers
PASS — D-class rows have explicit blocked reasons
PASS — new rows are not exposed in browser selector
PASS — visible KP count is unchanged
PASS — no browser selector regeneration was performed
PASS — no runtime code was changed
PASS — no mixed KP mode was enabled
```

## 8. Runtime / Test Status

```text
RUNTIME_CODE_CHANGED = false
BROWSER_PROJECTION_CHANGED = false
NPM_TEST = NOT_RUN_THIS_STEP
REASON = registry overlay and closeout documentation only
```

## 9. Distance Update

```text
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_AND_G3B_U01_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_AND_G3B_U01_U04_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G3B-U04 two-step calculation KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    6 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3B-U04 B-class rows need PatternSpec materialization before exposure",
  "G3B-U04 C-class relationship rows require generator / validator implementation before exposure",
  "G3B-U04 D-class visual, word-problem, unit-context, and multi-layer reasoning rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E6",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E7–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E7_G3B_U08_KPExpansion
```

Rationale:

```text
S43E1 covered G3A-U01.
S43E2 covered G3A-U02.
S43E3 covered G3A-U03.
S43E4 covered G3A-U06.
S43E5 covered G3B-U01.
S43E6 covered G3B-U04.
The roadmap order places G3B-U08 expansion next.
```

## 12. Closeout

```text
TASK = S43E6_G3B_U04_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 6_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E7_G3B_U08_KPExpansion
```
