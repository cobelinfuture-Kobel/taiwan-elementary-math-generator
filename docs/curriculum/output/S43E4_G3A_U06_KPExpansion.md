# S43E4 — G3A-U06 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E4_G3A_U06_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G3A-U06 division KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G3A-U06 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G3A-U06 rows hidden or not_selectable
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

The S43E task sequence requires S43E4 after S43E1, S43E2, and S43E3.

G3A-U06 visible KnowledgePoints were derived from the manual source summary for `g3a_u06_3a06`:

```text
- 用乘法估商
- 直式除法計算方法
- 哪些數字可以整除
- 有餘數除法
- 除法直式缺位填空
- 0 與 1 的除法
- 奇偶數判斷
- 數線範圍推理偶數
- 除法語言轉換：除 / 平分
- 包含除與等分除
- 除法可以寫成分數
- 答案單位變化：幾盤 / 幾個每盤
- 除法應用題：輪流分卡片、橘子裝盒
- 餘數情境判斷：可能剩下幾個、可能分出幾盒
```

Existing runtime source-pattern index before this task:

```text
g3a_u06_3a06 → ps_g3a_u06_exact_division_check
```

The existing runtime PatternSpec is exact integer division for two-digit dividend divided by one-digit divisor.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E4_G3A_U06_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G3A-U06 KnowledgePoint Coverage

S43E4 records 14 G3A-U06 KnowledgePoints:

```text
A-class:
1. kp_g3a_u06_2digit_by_1digit_exact_vertical

B-class:
2. kp_g3a_u06_divisibility_exact_check

C-class:
3. kp_g3a_u06_remainder_division
4. kp_g3a_u06_division_vertical_missing_digit
5. kp_g3a_u06_zero_one_division
6. kp_g3a_u06_parity_judgment

D-class:
7. kp_g3a_u06_multiplication_estimate_quotient
8. kp_g3a_u06_number_line_even_range_reasoning
9. kp_g3a_u06_division_language_translation
10. kp_g3a_u06_quotative_partitive_division
11. kp_g3a_u06_division_as_fraction
12. kp_g3a_u06_answer_unit_conversion
13. kp_g3a_u06_division_word_problems_distribution
14. kp_g3a_u06_remainder_context_judgment
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 1
supportClassC = 4
supportClassD = 8
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing exact-division generator / validator model should be able to support it once materialized.

C-class means a new generator / validator variant or answer model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 6
notSelectableRows = 8
```

No G3A-U06 KnowledgePoint is exposed to HTML selector in S43E4.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E4_GATE = PASS
```

Checks:

```text
PASS — G3A-U06 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g3a_u06_exact_division_check is linked to an A-class KP
PASS — B-class row has candidate PatternSpec ID and existing-generator classification
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_U01_TO_G3A_U03_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_U01_TO_G3A_U06_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G3A-U06 division KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    4 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3A-U06 B-class row needs PatternSpec materialization before exposure",
  "G3A-U06 C-class rows require generator / validator implementation before exposure",
  "G3A-U06 D-class estimation, visual, semantics, fraction, unit, and word-problem rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E4",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E5–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E5_G3B_U01_KPExpansion
```

Rationale:

```text
S43E1 covered G3A-U01.
S43E2 covered G3A-U02.
S43E3 covered G3A-U03.
S43E4 covered G3A-U06.
The roadmap order places G3B-U01 expansion next.
```

## 12. Closeout

```text
TASK = S43E4_G3A_U06_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 4_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E5_G3B_U01_KPExpansion
```
