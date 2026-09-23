# S43E7 — G3B-U08 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E7_G3B_U08_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G3B-U08 multiplication-and-division KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G3B-U08 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G3B-U08 rows hidden or not_selectable
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

The S43E task sequence requires S43E7 after S43E1 through S43E6.

G3B-U08 visible KnowledgePoints were derived from the manual source summary for `g3b_u08_3b08`:

```text
- 乘除互逆檢查：整除
- 用乘法檢查除法答案
- 用除法檢查乘法答案
- 乘除算式族
- 由積求未知因數
- 由商求未知被除數或除數
- 乘除等值算式轉換
- 依情境判斷用乘法或除法
- 陣列與等量群組的乘除互逆模型
- 乘除兩步驟應用題
- 檢查答案合理性
```

Existing runtime source-pattern index before this task:

```text
g3b_u08_3b08 → ps_g3b_u08_division_check_exact
```

The existing runtime PatternSpec is exact integer division used as the numeric runtime base for multiplication-division inverse checking.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E7_G3B_U08_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G3B-U08 KnowledgePoint Coverage

S43E7 records 11 G3B-U08 KnowledgePoints:

```text
A-class:
1. kp_g3b_u08_multiply_divide_inverse_check_exact

B-class:
2. kp_g3b_u08_division_check_by_multiplication
3. kp_g3b_u08_multiplication_check_by_division

C-class:
4. kp_g3b_u08_multiplication_division_fact_family
5. kp_g3b_u08_missing_factor_from_product
6. kp_g3b_u08_missing_dividend_or_divisor
7. kp_g3b_u08_inverse_number_sentence_equivalence

D-class:
8. kp_g3b_u08_choose_operation_multiply_or_divide
9. kp_g3b_u08_array_equal_group_inverse_model
10. kp_g3b_u08_multiply_divide_two_step_word_problem
11. kp_g3b_u08_check_answer_reasonableness
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 2
supportClassC = 4
supportClassD = 4
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing exact-division or expression generator / validator model should be able to support the numeric inverse-check pattern once materialized.

C-class means a fact-family, missing-value, or equation-transformation generator / validator model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 7
notSelectableRows = 4
```

No G3B-U08 KnowledgePoint is exposed to HTML selector in S43E7.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E7_GATE = PASS
```

Checks:

```text
PASS — G3B-U08 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g3b_u08_division_check_exact is linked to an A-class KP
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_AND_G3B_U01_U04_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_AND_G3B_U01_U04_U08_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G3B-U08 multiplication-and-division KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    7 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3B-U08 B-class rows need PatternSpec materialization before exposure",
  "G3B-U08 C-class fact-family, missing-value, and equation-transform rows require generator / validator implementation before exposure",
  "G3B-U08 D-class word-problem, visual-model, two-step context, and reasonableness rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E7",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E8–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E8_G4A_U01_KPExpansion
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
The roadmap order places G4A-U01 expansion next.
```

## 12. Closeout

```text
TASK = S43E7_G3B_U08_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 7_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E8_G4A_U01_KPExpansion
```
