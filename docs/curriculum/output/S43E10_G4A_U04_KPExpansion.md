# S43E10 — G4A-U04 KnowledgePoint Expansion

```text
CURRENT_MAJOR_TASK = S43_BatchA_KnowledgePointSelectable_HTMLWorksheet
CURRENT_SUBTASK = S43E10_G4A_U04_KPExpansion
TASK_STATUS = PASS_UNIT_EXPANSION_OVERLAY
WRITE_TYPE = unit_registry_expansion_overlay_plus_closeout_documentation
REPOSITORY = cobelinfuture-Kobel/taiwan-elementary-math-generator
BRANCH = main
```

## 1. Scope Lock

This task expands G4A-U04 integer-division KnowledgePoint inventory as a unit-level registry overlay.

In scope:

```text
- Record G4A-U04 KnowledgePoint coverage
- Record PatternGroup / PatternSpec path or explicit D-class no-pattern policy
- Classify supportClass A/B/C/D
- Preserve current browser selector visibility
- Keep all G4A-U04 rows hidden or not_selectable
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

The S43E task sequence requires S43E10 after S43E1 through S43E9.

G4A-U04 source-unit definition:

```text
g4a_u04_4a04 → 4A-U04 → 整數的除法 → integer_expression
```

G4A-U04 visible KnowledgePoints were derived from the manual source summary for `g4a_u04_4a04`:

```text
- 四位數除以一位數整除
- 三位數除以二位數整除
- 四位數除以二位數整除
- 二位數除數的商位判斷
- 試商
- 調商
- 有餘數除法
- 餘數小於除數
- 用乘法加餘數驗算除法
- 末尾有0的除法
- 除法直式缺位
- 除法估算
- 除法應用題
- 包含除與等分除：多位數除法
- 商與餘數合理性檢查
```

Existing runtime source-pattern index before this task:

```text
g4a_u04_4a04 → ps_g4a_u04_4digit_by_1digit_high_place_exact
```

The existing runtime PatternSpec is exact integer division for four-digit dividend divided by one-digit divisor.

## 3. Artifact Created

```text
data/curriculum/registry/unit_expansions/S43E10_G4A_U04_KPExpansion.json
```

This is a unit expansion overlay. It does not change the browser projection and does not expose new HTML-selectable rows.

## 4. G4A-U04 KnowledgePoint Coverage

S43E10 records 15 G4A-U04 KnowledgePoints:

```text
A-class:
1. kp_g4a_u04_4digit_by_1digit_exact

B-class:
2. kp_g4a_u04_3digit_by_2digit_exact
3. kp_g4a_u04_4digit_by_2digit_exact

C-class:
4. kp_g4a_u04_2digit_divisor_quotient_place
5. kp_g4a_u04_trial_quotient
6. kp_g4a_u04_adjust_quotient
7. kp_g4a_u04_remainder_division
8. kp_g4a_u04_remainder_less_than_divisor
9. kp_g4a_u04_division_check_multiply_plus_remainder
10. kp_g4a_u04_trailing_zero_division
11. kp_g4a_u04_missing_digit_division

D-class:
12. kp_g4a_u04_division_estimation
13. kp_g4a_u04_division_word_problem
14. kp_g4a_u04_quotative_partitive_multi_digit
15. kp_g4a_u04_answer_reasonableness_check
```

## 5. Support Classification

```text
supportClassA = 1
supportClassB = 2
supportClassC = 8
supportClassD = 4
```

A-class means an existing runtime PatternSpec is already present.

B-class means a new PatternSpec row is needed, but the existing exact-division generator / validator model should be able to support the numeric pattern once materialized.

C-class means quotient-place, trial-quotient, adjust-quotient, remainder, checking, trailing-zero, or missing-digit generator / validator model is required before exposure.

D-class means out of S43 printable scope and must remain not_selectable.

## 6. Exposure Policy

```text
browserProjectionChanged = false
visibleKnowledgePointChange = none
selectableNow = 0
hiddenRows = 11
notSelectableRows = 4
```

No G4A-U04 KnowledgePoint is exposed to HTML selector in S43E10.

Current global browser-visible path remains unchanged from S43C:

```text
kp_g3a_u02_add_multi_carry
```

## 7. Gate Check

```text
S43E10_GATE = PASS
```

Checks:

```text
PASS — G4A-U04 has unit-level KnowledgePoint coverage
PASS — existing runtime PatternSpec ps_g4a_u04_4digit_by_1digit_high_place_exact is linked to an A-class KP
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
GOAL_DISTANCE_BEFORE = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_U02_REGISTRY_COVERAGE
GOAL_DISTANCE_AFTER  = D1_BATCH_A_KP_EXPANSION_HAS_G3A_G3B_AND_G4A_U01_U02_U04_REGISTRY_COVERAGE
DISTANCE_REDUCED     = added G4A-U04 integer-division KnowledgePoint coverage while preserving selector safety
```

Distance vector:

```text
Source                         100%
KnowledgePoint registry         G3A/G3B + G4A-U01 + G4A-U02 + G4A-U04 coverage recorded
PatternGroup registry           G3A/G3B + G4A-U01 + G4A-U02 + G4A-U04 paths recorded
KP → PatternSpec map            G3A/G3B + G4A-U01 + G4A-U02 + G4A-U04 paths recorded
Generator                       unchanged
Validator                       unchanged
Worksheet                       unchanged
HTML single-KP selector         unchanged; only G3A-U02 add_multi_carry visible
Mixed KP selector               0% / disabled
Batch A 13-unit KP expansion    10 / 13 units covered at registry/overlay level
S43 overall                     in progress
```

## 10. Remaining Blockers

```text
REMAINING_BLOCKERS = [
  "G4A-U04 B-class rows need PatternSpec materialization before exposure",
  "G4A-U04 C-class quotient-place, trial-quotient, adjust-quotient, remainder, checking, trailing-zero, and missing-digit rows require generator / validator implementation before exposure",
  "G4A-U04 D-class estimation, word-problem, semantic, and reasonableness rows remain not_selectable",
  "Browser selector projection was not regenerated for S43E10",
  "Only G3A-U02 add_multi_carry remains visible/selectable in HTML",
  "S43E11–S43E13 remaining unit expansions have not started",
  "S43F generator/validator expansion has not started",
  "S43G mixed KnowledgePoint worksheet QA has not started"
]
```

## 11. Next Shortest Step

```text
NEXT_SHORTEST_STEP = S43E11_G4A_U08_KPExpansion
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
S43E10 covered G4A-U04.
The roadmap order places G4A-U08 expansion next.
```

## 12. Closeout

```text
TASK = S43E10_G4A_U04_KPExpansion
STATUS = PASS_UNIT_EXPANSION_OVERLAY
GOAL_DISTANCE_UPDATED = YES
S43E_PROGRESS = 10_OF_13_UNITS_COVERED_AT_REGISTRY_OVERLAY_LEVEL
NEXT = S43E11_G4A_U08_KPExpansion
```
