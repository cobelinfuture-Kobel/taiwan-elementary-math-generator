# S43E3 — G3A-U03 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E3_G3A_U03_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G3A-U03 multiplication KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G3A-U03 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G3A-U03 rows hidden or not_selectable
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

The S43E task sequence requires S43E3 after S43E1 and S43E2.

G3A-U03 visible KnowledgePoints were derived from the manual source summary for `g3a_u03_3a03`:

```text
- 10 的倍數乘一位數
- 10 進位乘法原理
- 二位數乘一位數直接進位
- 三位數乘一位數
- 三位數乘一位數有缺位
- 兩步驟連續乘法
- 二位數整十估算再乘
- 三位數整百估算再乘
- 乘法直式缺位推理
```

Existing runtime source-pattern index before this task:

```text
g3a_u03_3a03 → ps_g3a_u03_2digit_by_1digit_carry
```

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E3_G3A_U03_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G3A-U03 KnowledgePoint Coverage

S43E3 records 9 G3A-U03 KnowledgePoints:

```text
A-class:
1. kp_g3a_u03_2digit_by_1digit_carry

B-class:
2. kp_g3a_u03_10_multiple_by_1digit
3. kp_g3a_u03_3digit_by_1digit
4. kp_g3a_u03_consecutive_multiplication_two_step

C-class:
5. kp_g3a_u03_base10_multiplication_principle
6. kp_g3a_u03_3digit_by_1digit_missing_digit
7. kp_g3a_u03_vertical_multiplication_missing_digit_reasoning

D-class:
8. kp_g3a_u03_2digit_round_tens_then_multiply
9. kp_g3a_u03_3digit_round_hundreds_then_multiply
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 3
supportClassC = 3
supportClassD = 2
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing expression generator / validator model should be able to support it once materialized.

C-class means a new generator / validator variant or answer model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 7
notSelectableRows = 2
```

No G3A-U03 KnowledgePoint is exposed to HTML selector in S43E3.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E3_GATE = PASS
```

Checks:

```text
PASS — G3A-U03 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g3a_u03_2digit_by_1digit_carry is linked to an A-class KP
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_U01_AND_G3A_U02_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_U01_TO_G3A_U03_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G3A-U03 multiplication KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 + G3A-U03 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 + G3A-U03 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 + G3A-U03 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    3 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G3A-U03 B-class rows need PatternSpec materialization before exposure",
  "G3A-U03 C-class rows require generator / validator implementation before exposure",
  "G3A-U03 D-class estimation rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E3",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E4–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E4_G3A_U06_KPExpansion
```

Rationale:

```text
S43E1 covered G3A-U01.
S43E2 covered G3A-U02.
S43E3 covered G3A-U03.
The roadmap order places G3A-U06 expansion next.
```

## 12. Closeout

```text
TASK = S43E3_G3A_U03_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 3_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E4_G3A_U06_KPExpansion
```
