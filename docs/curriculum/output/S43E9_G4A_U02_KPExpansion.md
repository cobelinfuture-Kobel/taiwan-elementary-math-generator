# S43E9 — G4A-U02 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E9_G4A_U02_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G4A-U02 integer-multiplication KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G4A-U02 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G4A-U02 rows hidden or not_selectable
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

The S43E task sequence requires S43E9 after S43E1 through S43E8.

G4A-U02 visible KnowledgePoints were derived from the manual source summary for `g4a_u02_4a02`:

```text
- 二位數乘以二位數
- 三位數乘以二位數
- 四位數乘以二位數
- 二位數乘以三位數
- 乘以10或100
- 末尾有0的乘法
- 乘法直式部分積
- 拆數乘法與分配律
- 乘法估算
- 乘法直式缺位
- 乘法應用題：排數、箱數、盒數
- 面積陣列模型理解乘法
- 乘積合理性檢查
```

Existing runtime source-pattern index before this task:

```text
g4a_u02_4a02 → ps_g4a_u02_2digit_by_2digit
```

The existing runtime PatternSpec is a two-digit by two-digit multiplication expression.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E9_G4A_U02_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G4A-U02 KnowledgePoint Coverage

S43E9 records 13 G4A-U02 KnowledgePoints:

```text
A-class:
1. kp_g4a_u02_2digit_by_2digit

B-class:
2. kp_g4a_u02_3digit_by_2digit
3. kp_g4a_u02_4digit_by_2digit
4. kp_g4a_u02_2digit_by_3digit
5. kp_g4a_u02_multiplier_10_or_100

C-class:
6. kp_g4a_u02_trailing_zero_multiplication
7. kp_g4a_u02_partial_product_vertical_algorithm
8. kp_g4a_u02_distributive_decomposition
9. kp_g4a_u02_missing_digit_multiplication

D-class:
10. kp_g4a_u02_multiplication_estimation
11. kp_g4a_u02_multiplication_word_problem_rows_boxes
12. kp_g4a_u02_area_array_model
13. kp_g4a_u02_product_reasonableness_check
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 4
supportClassC = 4
supportClassD = 4
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing expression generator / validator model should be able to support the numeric multiplication pattern once materialized.

C-class means a trailing-zero, partial-product, decomposition-strategy, or missing-digit generator / validator model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 9
notSelectableRows = 4
```

No G4A-U02 KnowledgePoint is exposed to HTML selector in S43E9.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E9_GATE = PASS
```

Checks:

```text
PASS — G4A-U02 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g4a_u02_2digit_by_2digit is linked to an A-class KP
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_U02_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G4A-U02 integer-multiplication KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A/G3B + G4A-U01 + G4A-U02 coverage recorded
PatternGroup registry           G3A/G3B + G4A-U01 + G4A-U02 paths recorded
KP → PatternSpec map            G3A/G3B + G4A-U01 + G4A-U02 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    9 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G4A-U02 B-class rows need PatternSpec materialization before exposure",
  "G4A-U02 C-class trailing-zero, partial-product, decomposition-strategy, and missing-digit rows require generator / validator implementation before exposure",
  "G4A-U02 D-class estimation, word-problem, visual-model, and reasonableness rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E9",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E10–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E10_G4A_U04_KPExpansion
```

Rationale:

```text
S43E1 covered G3A-U01.
S43E2 covered G3A-U02.
S43E3 covered G3A-U03.
S43E4 covered G3A-U06.
S43E5 covered G3B-U01.
S43E6 covered G3B-U04.
S43E7 covered G3B-U08.
S43E8 covered G4A-U01.
S43E9 covered G4A-U02.
The roadmap order places G4A-U04 expansion next.
```

## 12. Closeout

```text
TASK = S43E9_G4A_U02_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 9_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E10_G4A_U04_KPExpansion
```
