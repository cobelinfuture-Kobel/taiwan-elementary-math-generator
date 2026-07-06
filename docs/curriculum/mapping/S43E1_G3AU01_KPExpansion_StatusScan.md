# S43E1 G3A-U01 KP Expansion StatusScan

```text
CURRENT_MAJOR_TASK = S43E1_G3A_U01_KPExpansion
CURRENT_SUBTASK = status scan and supported KP promotion for 3A-U01 10000以內的數
TASK_STATUS = IMPLEMENTED_READBACK_PENDING
SOURCE_ID = g3a_u01_3a01
UNIT = 3A-U01 10000以內的數
```

## 1. Source and Project Memory Readback

```text
sourceUnit = g3a_u01_3a01
unitCode = 3A-U01
title = 10000以內的數
domain = number_sense
```

Repository baseline already has `g3a_u01_3a01` in `BATCH_A_SOURCE_UNITS` and an existing PatternSpec:

```text
ps_g3a_u01_4digit_compare = 四位數比大小
kind = comparison
range = 1000..9999
```

Uploaded project memory confirms G3A-U01 is a 10000以內數感 unit and S21C policy keeps this unit inside number-sense boundaries: 1..10000, four-digit validity, Chinese reading/writing, comparison, patterns, money amount, no future-domain leakage.

## 2. Scope Lock

```text
IN_SCOPE = [
  "KnowledgePointNode candidate list for G3A-U01",
  "PatternGroup candidate list",
  "KP to PatternSpec support classification",
  "promotion of existing supported comparison PatternSpec",
  "selector registry and worksheet tests"
]
OUT_OF_SCOPE = [
  "AI bulk item generation",
  "visual block or abacus image generation",
  "Chinese number reading/writing generator",
  "place-value decomposition generator",
  "money literacy item storage",
  "new validator domain beyond existing comparison validator"
]
```

## 3. KnowledgePoint Candidate Matrix

| KnowledgePoint | Candidate ID | Support class | Status | Reason |
|---|---|---:|---|---|
| 四位數比大小 | `kp_g3a_u01_4digit_compare` | A | supported / promoted | Existing comparison PatternSpec and validator support already exist. |
| 四位數讀寫 | `kp_g3a_u01_4digit_read_write` | D | blocked | Requires Chinese numeral read/write generator and validator hook. |
| 位值分解與合成 | `kp_g3a_u01_place_value_decompose_compose` | C | planned | Requires number-sense place-value generator and validator. |
| 數線 / 數到一萬 | `kp_g3a_u01_counting_sequence_within_10000` | C | planned | Requires sequence/step PatternSpec and validator. |
| 數字組合成最大最小數 | `kp_g3a_u01_digit_permutation_max_min` | C | planned | Requires digit-permutation generator and unique-answer validator. |
| 錢幣 / 位值素養題 | `kp_g3a_u01_money_place_value_literacy` | D | blocked | Requires curated LiteracyItem or word-problem template with human-review gate. |

## 4. PatternGroup / PatternSpec Map

```text
SUPPORTED_NOW:
kp_g3a_u01_4digit_compare
  -> pg_g3a_u01_4digit_compare
  -> ps_g3a_u01_4digit_compare
```

```text
PLANNED_ONLY:
kp_g3a_u01_4digit_read_write
kp_g3a_u01_place_value_decompose_compose
kp_g3a_u01_counting_sequence_within_10000
kp_g3a_u01_digit_permutation_max_min
kp_g3a_u01_money_place_value_literacy
```

## 5. Implementation Performed

```text
1. Added G3A-U01 four-digit comparison KnowledgePoint row to selector registry.
2. Added PatternGroup row and KP -> PatternSpec link.
3. Updated Batch A visibleCount from 23 to 24.
4. Added G3A-U01 selector / resolver / worksheet tests.
5. Updated stale selector visible-count tests to 24.
```

## 6. Validation Required

```text
git pull public main
npm test
git status
```

Expected new test file:

```text
tests/curriculum/batch-a/g3a-u01-kp-expansion.test.js
```

## 7. Distance Update

```text
GOAL_DISTANCE_BEFORE = D3_G3A_U01_SOURCE_EXISTS_BUT_KP_REGISTRY_ABSENT
GOAL_DISTANCE_AFTER  = D1_G3A_U01_FIRST_SUPPORTED_KP_PROMOTED_PENDING_READBACK
DISTANCE_REDUCED     = G3A-U01 now has a visible supported KnowledgePoint, PatternGroup, PatternSpec map, resolver coverage, and worksheet smoke test for four-digit comparison
REMAINING_BLOCKERS   = ["npm test readback pending", "remaining G3A-U01 planned KPs not implemented", "browser PDF smoke pending"]
NEXT_SHORTEST_STEP   = run npm test and inspect G3A-U01 comparison worksheet/PDF smoke
```
