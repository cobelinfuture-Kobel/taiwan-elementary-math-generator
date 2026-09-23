# S43E8 — G4A-U01 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E8_G4A_U01_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G4A-U01 large-number KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G4A-U01 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G4A-U01 rows hidden or not_selectable
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

The S43E task sequence requires S43E8 after S43E1 through S43E7.

G4A-U01 visible KnowledgePoints were derived from the manual source summary for `g4a_u01_4a01`:

```text
- 10萬以內的10進位表
- 10萬以內數的分解
- 10萬以內數的合成
- 10萬以內數的讀法
- 1億以內10進位表
- 3位分節法
- 4位分節法
- 1億以內數的讀寫
- 1億以內數比大小
- 用指定數字組合五位數
- 未知數位下的最大最小
- 大數直式計算
- 中間有0的讀寫
- 兩數間規律
- 大數加減
- 八位數分解組合
- 八位數比大小
```

Existing runtime source-pattern index before this task:

```text
g4a_u01_4a01 → ps_g4a_u01_compare_8digit
```

The existing runtime PatternSpec is an eight-digit comparison pattern.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E8_G4A_U01_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G4A-U01 KnowledgePoint Coverage

S43E8 records 17 G4A-U01 KnowledgePoints:

```text
A-class:
1. kp_g4a_u01_8digit_compare

B-class:
2. kp_g4a_u01_within_100million_compare
3. kp_g4a_u01_large_number_vertical_calculation
4. kp_g4a_u01_large_number_add_sub

C-class:
5. kp_g4a_u01_100k_place_value_table
6. kp_g4a_u01_100k_decomposition
7. kp_g4a_u01_100k_composition
8. kp_g4a_u01_100k_reading
9. kp_g4a_u01_100million_place_value_table
10. kp_g4a_u01_3digit_grouping_reading
11. kp_g4a_u01_4digit_grouping_reading
12. kp_g4a_u01_100million_reading_writing
13. kp_g4a_u01_digit_card_5digit_composition
14. kp_g4a_u01_unknown_place_max_min
15. kp_g4a_u01_zero_inside_large_number_reading
16. kp_g4a_u01_8digit_decomposition_composition

D-class:
17. kp_g4a_u01_between_large_numbers_pattern
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 3
supportClassC = 12
supportClassD = 1
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing comparison or expression generator / validator model should be able to support the numeric pattern once materialized.

C-class means a place-value, large-number reading/writing, grouping, digit-card, unknown-digit, zero-reading, or decomposition/composition generator / validator model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 16
notSelectableRows = 1
```

No G4A-U01 KnowledgePoint is exposed to HTML selector in S43E8.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E8_GATE = PASS
```

Checks:

```text
PASS — G4A-U01 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g4a_u01_compare_8digit is linked to an A-class KP
PASS — B-class rows have candidate PatternSpec IDs and existing-generator classification
PASS — C-class rows have explicit implementation blockers
PASS — D-class row has explicit blocked reason
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_AND_G3B_U01_U04_U08_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G4A-U01 large-number KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 + G4A-U01 coverage recorded
PatternGroup registry           G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 + G4A-U01 paths recorded
KP → PatternSpec map            G3A-U01 + G3A-U02 + G3A-U03 + G3A-U06 + G3B-U01 + G3B-U04 + G3B-U08 + G4A-U01 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    8 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G4A-U01 B-class rows need PatternSpec materialization before exposure",
  "G4A-U01 C-class place-value, reading/writing, grouping, digit-card, unknown-digit, zero-reading, and decomposition/composition rows require generator / validator implementation before exposure",
  "G4A-U01 D-class pattern-sequence row remains not_selectable",
  "Browser selector projection was not regenerated for S43E8",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E9–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E9_G4A_U02_KPExpansion
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
The roadmap order places G4A-U02 expansion next.
```

## 12. Closeout

```text
TASK = S43E8_G4A_U01_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 8_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E9_G4A_U02_KPExpansion
```
